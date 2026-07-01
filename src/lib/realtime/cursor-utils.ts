import { REMOTE_CURSOR_STALE_MS } from './cursor-reducer';
import type { CursorState } from './cursor-types';

export interface FlowPoint {
    x: number;
    y: number;
}

export const CURSOR_INTERPOLATION_FACTOR = 0.25;

export const shouldMarkCursorStale = (
    cursor: CursorState,
    now: number,
    staleMs: number = REMOTE_CURSOR_STALE_MS
): boolean => {
    if (cursor.stale) {
        return false;
    }

    return now - cursor.receivedAt >= staleMs;
};

export const isRemoteCursorRenderable = (
    cursor: CursorState,
    options: {
        selfUserId: number;
        knownPresenceUserIds: ReadonlySet<number>;
        now: number;
        staleMs?: number;
    }
): boolean => {
    const { selfUserId, knownPresenceUserIds, now } = options;
    const staleMs = options.staleMs ?? REMOTE_CURSOR_STALE_MS;

    if (cursor.userId === selfUserId) {
        return false;
    }

    if (!knownPresenceUserIds.has(cursor.userId)) {
        return false;
    }

    if (cursor.stale) {
        return false;
    }

    return now - cursor.receivedAt < staleMs;
};

export const getRenderableRemoteCursors = (
    cursors: ReadonlyMap<number, CursorState>,
    options: {
        selfUserId: number;
        knownPresenceUserIds: ReadonlySet<number>;
        now: number;
        staleMs?: number;
    }
): CursorState[] => {
    const renderable: CursorState[] = [];

    for (const cursor of cursors.values()) {
        if (isRemoteCursorRenderable(cursor, options)) {
            renderable.push(cursor);
        }
    }

    return renderable;
};

export const interpolatePosition = (
    current: FlowPoint,
    target: FlowPoint,
    factor: number = CURSOR_INTERPOLATION_FACTOR
): FlowPoint => ({
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
});

export const hasReachedTarget = (
    current: FlowPoint,
    target: FlowPoint,
    threshold: number = 0.5
): boolean => {
    const dx = target.x - current.x;
    const dy = target.y - current.y;

    return dx * dx + dy * dy <= threshold * threshold;
};
