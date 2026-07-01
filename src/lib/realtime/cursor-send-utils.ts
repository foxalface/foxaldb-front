export const CURSOR_SEND_MAX_HZ = 20;
export const CURSOR_SEND_MIN_INTERVAL_MS = 1000 / CURSOR_SEND_MAX_HZ;
export const CURSOR_SEND_MIN_MOVEMENT_PX = 2;

export interface FlowPosition {
    x: number;
    y: number;
}

export const hasMinimumCursorMovement = (
    from: FlowPosition | null,
    to: FlowPosition,
    minMovementPx: number = CURSOR_SEND_MIN_MOVEMENT_PX
): boolean => {
    if (from === null) {
        return true;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const minMovementSq = minMovementPx * minMovementPx;

    return dx * dx + dy * dy >= minMovementSq;
};

export const shouldSendCursorUpdate = (
    lastSent: FlowPosition | null,
    next: FlowPosition,
    lastSentAt: number,
    now: number,
    options?: {
        minMovementPx?: number;
        minIntervalMs?: number;
    }
): boolean => {
    const minMovementPx = options?.minMovementPx ?? CURSOR_SEND_MIN_MOVEMENT_PX;
    const minIntervalMs = options?.minIntervalMs ?? CURSOR_SEND_MIN_INTERVAL_MS;

    if (!hasMinimumCursorMovement(lastSent, next, minMovementPx)) {
        return false;
    }

    if (lastSent !== null && now - lastSentAt < minIntervalMs) {
        return false;
    }

    if (lastSent !== null && lastSent.x === next.x && lastSent.y === next.y) {
        return false;
    }

    return true;
};

export const isTouchPrimaryDevice = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
};
