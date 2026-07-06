import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import type { FlowPoint } from '@/lib/realtime/cursor-utils';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { MovementAction } from '@/lib/realtime/movement-reducer';
import {
    initialRemoteMovementsState,
    type RemoteMovementsState,
} from '@/lib/realtime/movement-reducer';
import {
    advanceInterpolatedPositions,
    applyMovementAction,
    buildDisplayPositions,
    buildRemoteMovementTargets,
    freezeMovementEndPositions,
    REMOTE_MOVEMENT_PENDING_SYNC_STALE_MS,
    REMOTE_MOVEMENT_STALE_MS,
    removePendingSyncForUser,
    removePendingSyncTableIds,
    removeStalePendingSyncOverrides,
    shouldRemoveStaleMovement,
    type PendingSyncOverride,
    type RemoteTablePosition,
} from '@/lib/realtime/movement-utils';
import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';

const STALE_CHECK_INTERVAL_MS = 250;

export interface UseRemoteTableMovementResult {
    isMovementActive: boolean;
    remoteTablePositions: Map<string, RemoteTablePosition>;
    pendingSyncPositions: Map<string, PendingSyncOverride>;
    movingTableIds: Set<string>;
    clearPendingSyncForTables: (tableIds: readonly string[]) => void;
}

const movementStateReducer = (
    state: RemoteMovementsState,
    action: MovementAction
): RemoteMovementsState => applyMovementAction(state, action);

export const useRemoteTableMovement = (): UseRemoteTableMovementResult => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { presence, subscribeToMovementActions } = useRealtime();
    const [movements, dispatch] = useReducer(
        movementStateReducer,
        undefined,
        initialRemoteMovementsState
    );
    const [pendingSync, setPendingSync] = useState(
        () => new Map<string, PendingSyncOverride>()
    );
    const [renderTick, setRenderTick] = useState(0);
    const [now, setNow] = useState(() => Date.now());

    const displayPositionsRef = useRef(new Map<string, FlowPoint>());
    const movementsRef = useRef(movements);
    movementsRef.current = movements;
    const pendingSyncRef = useRef(pendingSync);
    pendingSyncRef.current = pendingSync;

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isMovementActive =
        !isLoading &&
        isAuthenticated &&
        diagramId !== null &&
        user !== null &&
        presence.status === 'active';

    const clearPendingSyncForTables = useCallback(
        (tableIds: readonly string[]) => {
            if (tableIds.length === 0) {
                return;
            }

            setPendingSync((current) =>
                removePendingSyncTableIds(current, tableIds)
            );
        },
        []
    );

    const handleMovementAction = useCallback((action: MovementAction) => {
        if (action.type === 'UPDATE' && action.phase === 'end') {
            setPendingSync((current) =>
                freezeMovementEndPositions(current, {
                    userId: action.userId,
                    tables: action.tables,
                    frozenAt: action.receivedAt,
                })
            );
            dispatch({ type: 'REMOVE', userId: action.userId });
            return;
        }

        dispatch(action);
    }, []);

    useEffect(() => {
        if (!isMovementActive) {
            dispatch({ type: 'CLEAR' });
            setPendingSync(new Map());
            displayPositionsRef.current.clear();
            return;
        }

        return subscribeToMovementActions(handleMovementAction);
    }, [handleMovementAction, isMovementActive, subscribeToMovementActions]);

    useEffect(() => {
        if (!isMovementActive) {
            return;
        }

        const intervalId = window.setInterval(() => {
            const currentNow = Date.now();
            setNow(currentNow);

            for (const [userId, movement] of movementsRef.current) {
                if (
                    shouldRemoveStaleMovement(
                        movement.receivedAt,
                        currentNow,
                        REMOTE_MOVEMENT_STALE_MS
                    )
                ) {
                    dispatch({ type: 'REMOVE', userId });
                }
            }

            setPendingSync((current) =>
                removeStalePendingSyncOverrides(
                    current,
                    currentNow,
                    REMOTE_MOVEMENT_PENDING_SYNC_STALE_MS
                )
            );
        }, STALE_CHECK_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isMovementActive]);

    useEffect(() => {
        if (!isMovementActive) {
            return;
        }

        const presenceIds = new Set(presence.members.keys());

        for (const userId of movementsRef.current.keys()) {
            if (!presenceIds.has(userId)) {
                dispatch({ type: 'REMOVE', userId });
            }
        }

        setPendingSync((current) => {
            let next = current;
            const usersToRemove = new Set<number>();

            for (const frozen of current.values()) {
                if (!presenceIds.has(frozen.userId)) {
                    usersToRemove.add(frozen.userId);
                }
            }

            for (const userId of usersToRemove) {
                next = removePendingSyncForUser(next, userId);
            }

            return next;
        });
    }, [isMovementActive, presence.members]);

    const targets = useMemo(() => {
        if (!isMovementActive || user === null) {
            return new Map<string, RemoteTablePosition>();
        }

        return buildRemoteMovementTargets(movements, {
            selfUserId: user.id,
            knownPresenceUserIds: new Set(presence.members.keys()),
            now,
        });
    }, [isMovementActive, movements, now, presence.members, user]);

    const targetsRef = useRef(targets);
    targetsRef.current = targets;

    useEffect(() => {
        for (const [tableId, target] of targets) {
            if (!displayPositionsRef.current.has(tableId)) {
                displayPositionsRef.current.set(tableId, {
                    x: target.x,
                    y: target.y,
                });
            }
        }
    }, [targets]);

    useEffect(() => {
        if (!isMovementActive || targets.size === 0) {
            return;
        }

        let animationFrameId: number;
        let isRunning = true;

        const tick = (): void => {
            if (!isRunning) {
                return;
            }

            const interpolationTargets = new Map<string, FlowPoint>();

            for (const [tableId, target] of targetsRef.current) {
                interpolationTargets.set(tableId, {
                    x: target.x,
                    y: target.y,
                });
            }

            const changed = advanceInterpolatedPositions(
                displayPositionsRef.current,
                interpolationTargets
            );

            if (changed) {
                setRenderTick((value) => value + 1);
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        return () => {
            isRunning = false;
            cancelAnimationFrame(animationFrameId);
        };
    }, [isMovementActive, targets.size]);

    const remoteTablePositions = useMemo(() => {
        void renderTick;

        return buildDisplayPositions(displayPositionsRef.current, targets);
    }, [renderTick, targets]);

    const movingTableIds = useMemo(() => new Set(targets.keys()), [targets]);

    return {
        isMovementActive,
        remoteTablePositions,
        pendingSyncPositions: pendingSync,
        movingTableIds,
        clearPendingSyncForTables,
    };
};
