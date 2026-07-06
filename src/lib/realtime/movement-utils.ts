import {
    hasReachedTarget,
    interpolatePosition,
    type FlowPoint,
} from './cursor-utils';
import type { RemoteMovementsState } from './movement-reducer';
import type { MovementAction } from './movement-reducer';
import { movementReducer } from './movement-reducer';
import type { MovementTablePosition } from './movement-types';

export const REMOTE_MOVEMENT_STALE_MS = 2000;
export const REMOTE_MOVEMENT_PENDING_SYNC_STALE_MS = 5000;
export const POSITION_SYNC_EPSILON = 0.5;

export interface RemoteTablePosition {
    x: number;
    y: number;
    userId: number;
}

interface RemoteTableTarget extends RemoteTablePosition {
    receivedAt: number;
}

export interface PendingSyncOverride {
    x: number;
    y: number;
    userId: number;
    frozenAt: number;
}

export const shouldRemoveStaleMovement = (
    receivedAt: number,
    now: number,
    staleMs: number = REMOTE_MOVEMENT_STALE_MS
): boolean => now - receivedAt >= staleMs;

export const applyMovementAction = (
    state: RemoteMovementsState,
    action: MovementAction
): RemoteMovementsState => movementReducer(state, action);

export const positionsMatchWithinEpsilon = (
    left: FlowPoint,
    right: FlowPoint,
    epsilon: number = POSITION_SYNC_EPSILON
): boolean => {
    const dx = left.x - right.x;
    const dy = left.y - right.y;

    return dx * dx + dy * dy <= epsilon * epsilon;
};

export const freezeMovementEndPositions = (
    pending: Map<string, PendingSyncOverride>,
    options: {
        userId: number;
        tables: MovementTablePosition[];
        frozenAt: number;
    }
): Map<string, PendingSyncOverride> => {
    const next = new Map(pending);

    for (const table of options.tables) {
        next.set(table.id, {
            x: table.x,
            y: table.y,
            userId: options.userId,
            frozenAt: options.frozenAt,
        });
    }

    return next;
};

export const findSyncedPendingTableIds = (
    nodes: readonly MergeableFlowNode[],
    pending: ReadonlyMap<string, PendingSyncOverride>,
    epsilon: number = POSITION_SYNC_EPSILON
): string[] => {
    if (pending.size === 0) {
        return [];
    }

    const syncedTableIds: string[] = [];

    for (const node of nodes) {
        if (node.type !== 'table') {
            continue;
        }

        const frozen = pending.get(node.id);

        if (frozen === undefined) {
            continue;
        }

        if (
            positionsMatchWithinEpsilon(
                node.position,
                {
                    x: frozen.x,
                    y: frozen.y,
                },
                epsilon
            )
        ) {
            syncedTableIds.push(node.id);
        }
    }

    return syncedTableIds;
};

export const removePendingSyncTableIds = (
    pending: Map<string, PendingSyncOverride>,
    tableIds: readonly string[]
): Map<string, PendingSyncOverride> => {
    if (tableIds.length === 0) {
        return pending;
    }

    const next = new Map(pending);

    for (const tableId of tableIds) {
        next.delete(tableId);
    }

    return next;
};

export const removePendingSyncForUser = (
    pending: Map<string, PendingSyncOverride>,
    userId: number
): Map<string, PendingSyncOverride> => {
    let changed = false;
    const next = new Map<string, PendingSyncOverride>();

    for (const [tableId, frozen] of pending) {
        if (frozen.userId === userId) {
            changed = true;
            continue;
        }

        next.set(tableId, frozen);
    }

    return changed ? next : pending;
};

export const removeStalePendingSyncOverrides = (
    pending: Map<string, PendingSyncOverride>,
    now: number,
    staleMs: number = REMOTE_MOVEMENT_PENDING_SYNC_STALE_MS
): Map<string, PendingSyncOverride> => {
    let changed = false;
    const next = new Map<string, PendingSyncOverride>();

    for (const [tableId, frozen] of pending) {
        if (now - frozen.frozenAt >= staleMs) {
            changed = true;
            continue;
        }

        next.set(tableId, frozen);
    }

    return changed ? next : pending;
};

export const buildRenderOverridePositions = (
    activePositions: ReadonlyMap<string, RemoteTablePosition>,
    pendingSync: ReadonlyMap<string, PendingSyncOverride>
): Map<string, RemoteTablePosition> => {
    const overrides = new Map<string, RemoteTablePosition>();

    for (const [tableId, position] of activePositions) {
        overrides.set(tableId, position);
    }

    for (const [tableId, frozen] of pendingSync) {
        if (overrides.has(tableId)) {
            continue;
        }

        overrides.set(tableId, {
            x: frozen.x,
            y: frozen.y,
            userId: frozen.userId,
        });
    }

    return overrides;
};

export const buildRemoteMovementTargets = (
    movements: RemoteMovementsState,
    options: {
        selfUserId: number;
        knownPresenceUserIds: ReadonlySet<number>;
        now: number;
        staleMs?: number;
    }
): Map<string, RemoteTablePosition> => {
    const staleMs = options.staleMs ?? REMOTE_MOVEMENT_STALE_MS;
    const latestByTable = new Map<string, RemoteTableTarget>();

    for (const [userId, movement] of movements) {
        if (userId === options.selfUserId) {
            continue;
        }

        if (!options.knownPresenceUserIds.has(userId)) {
            continue;
        }

        if (
            shouldRemoveStaleMovement(movement.receivedAt, options.now, staleMs)
        ) {
            continue;
        }

        for (const table of movement.tables) {
            const existing = latestByTable.get(table.id);

            if (
                existing === undefined ||
                movement.receivedAt >= existing.receivedAt
            ) {
                latestByTable.set(table.id, {
                    x: table.x,
                    y: table.y,
                    userId,
                    receivedAt: movement.receivedAt,
                });
            }
        }
    }

    const targets = new Map<string, RemoteTablePosition>();

    for (const [tableId, target] of latestByTable) {
        targets.set(tableId, {
            x: target.x,
            y: target.y,
            userId: target.userId,
        });
    }

    return targets;
};

export const advanceInterpolatedPositions = (
    display: Map<string, FlowPoint>,
    targets: ReadonlyMap<string, FlowPoint>
): boolean => {
    let changed = false;

    for (const [tableId, target] of targets) {
        const current = display.get(tableId) ?? target;

        if (hasReachedTarget(current, target)) {
            if (current.x !== target.x || current.y !== target.y) {
                display.set(tableId, { x: target.x, y: target.y });
                changed = true;
            }

            continue;
        }

        display.set(tableId, interpolatePosition(current, target));
        changed = true;
    }

    for (const tableId of display.keys()) {
        if (!targets.has(tableId)) {
            display.delete(tableId);
            changed = true;
        }
    }

    return changed;
};

export const buildDisplayPositions = (
    display: ReadonlyMap<string, FlowPoint>,
    targets: ReadonlyMap<string, RemoteTablePosition>
): Map<string, RemoteTablePosition> => {
    const positions = new Map<string, RemoteTablePosition>();

    for (const [tableId, target] of targets) {
        const current = display.get(tableId) ?? { x: target.x, y: target.y };

        positions.set(tableId, {
            x: current.x,
            y: current.y,
            userId: target.userId,
        });
    }

    return positions;
};

export interface MergeableFlowNode {
    id: string;
    type?: string;
    position: {
        x: number;
        y: number;
    };
}

export const mergeRemoteTablePositionsIntoNodes = <T extends MergeableFlowNode>(
    nodes: readonly T[],
    remoteTablePositions: ReadonlyMap<string, FlowPoint>,
    localDraggingTableIds: ReadonlySet<string>
): T[] => {
    if (remoteTablePositions.size === 0) {
        return nodes as T[];
    }

    let changed = false;

    const merged = nodes.map((node) => {
        if (node.type !== 'table') {
            return node;
        }

        if (localDraggingTableIds.has(node.id)) {
            return node;
        }

        const remotePosition = remoteTablePositions.get(node.id);

        if (remotePosition === undefined) {
            return node;
        }

        if (
            node.position.x === remotePosition.x &&
            node.position.y === remotePosition.y
        ) {
            return node;
        }

        changed = true;

        return {
            ...node,
            position: {
                x: remotePosition.x,
                y: remotePosition.y,
            },
        };
    });

    return changed ? merged : (nodes as T[]);
};
