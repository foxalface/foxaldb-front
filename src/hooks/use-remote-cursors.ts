import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import {
    cursorReducer,
    initialRemoteCursorsState,
    type RemoteCursorsState as RemoteCursorsMap,
} from '@/lib/realtime/cursor-reducer';
import { isTouchPrimaryDevice } from '@/lib/realtime/cursor-send-utils';
import type { CursorState } from '@/lib/realtime/cursor-types';
import {
    getRenderableRemoteCursors,
    shouldMarkCursorStale,
} from '@/lib/realtime/cursor-utils';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    getPresenceColorClass,
    getPresenceTextColorClass,
} from '@/lib/realtime/presence-utils';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

const STALE_CHECK_INTERVAL_MS = 250;

export interface RemoteCursorViewModel {
    userId: number;
    x: number;
    y: number;
    name: string;
    colorClass: string;
    textColorClass: string;
}

export interface UseRemoteCursorsResult {
    isOverlayActive: boolean;
    remoteCursors: RemoteCursorViewModel[];
}

const toViewModels = (
    cursors: CursorState[],
    presenceMembers: ReadonlyMap<number, { name: string }>
): RemoteCursorViewModel[] =>
    cursors.map((cursor) => {
        const member = presenceMembers.get(cursor.userId);
        const name = member?.name ?? 'Collaborator';

        return {
            userId: cursor.userId,
            x: cursor.x,
            y: cursor.y,
            name,
            colorClass: getPresenceColorClass(cursor.userId),
            textColorClass: getPresenceTextColorClass(cursor.userId),
        };
    });

export const useRemoteCursors = (): UseRemoteCursorsResult => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { presence, subscribeToCursorActions } = useRealtime();
    const [cursors, dispatch] = useReducer(
        cursorReducer,
        undefined,
        initialRemoteCursorsState
    );
    const [now, setNow] = useState(() => Date.now());

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isOverlayActive =
        !isLoading &&
        isAuthenticated &&
        diagramId !== null &&
        user !== null &&
        presence.status === 'active' &&
        !isTouchPrimaryDevice();

    const cursorsRef = useRef<RemoteCursorsMap>(cursors);
    cursorsRef.current = cursors;

    useEffect(() => {
        if (!isOverlayActive) {
            dispatch({ type: 'CLEAR' });
            return;
        }

        return subscribeToCursorActions(dispatch);
    }, [isOverlayActive, subscribeToCursorActions]);

    useEffect(() => {
        if (!isOverlayActive) {
            return;
        }

        const intervalId = window.setInterval(() => {
            const currentNow = Date.now();
            setNow(currentNow);

            for (const [userId, cursor] of cursorsRef.current) {
                if (shouldMarkCursorStale(cursor, currentNow)) {
                    dispatch({ type: 'MARK_STALE', userId });
                }
            }
        }, STALE_CHECK_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isOverlayActive]);

    useEffect(() => {
        if (!isOverlayActive) {
            return;
        }

        const presenceIds = new Set(presence.members.keys());

        for (const userId of cursorsRef.current.keys()) {
            if (!presenceIds.has(userId)) {
                dispatch({ type: 'REMOVE', userId });
            }
        }
    }, [isOverlayActive, presence.members]);

    const remoteCursors = useMemo(() => {
        if (!isOverlayActive || user === null) {
            return [];
        }

        const knownPresenceUserIds = new Set(presence.members.keys());
        const renderable = getRenderableRemoteCursors(cursors, {
            selfUserId: user.id,
            knownPresenceUserIds,
            now,
        });

        return toViewModels(renderable, presence.members);
    }, [cursors, isOverlayActive, now, presence.members, user]);

    return {
        isOverlayActive,
        remoteCursors,
    };
};
