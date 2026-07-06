import {
    CURSOR_SEND_MIN_INTERVAL_MS,
    CURSOR_SEND_MIN_MOVEMENT_PX,
    hasMinimumCursorMovement,
} from './cursor-send-utils';
import type { MovementTablePosition } from './movement-types';

export const areMovementSnapshotsEqual = (
    left: MovementTablePosition[],
    right: MovementTablePosition[]
): boolean => {
    if (left.length !== right.length) {
        return false;
    }

    for (let index = 0; index < left.length; index += 1) {
        const leftTable = left[index];
        const rightTable = right[index];

        if (
            leftTable.id !== rightTable.id ||
            leftTable.x !== rightTable.x ||
            leftTable.y !== rightTable.y
        ) {
            return false;
        }
    }

    return true;
};

export const hasMinimumMovementSnapshot = (
    from: MovementTablePosition[] | null,
    to: MovementTablePosition[],
    minMovementPx: number = CURSOR_SEND_MIN_MOVEMENT_PX
): boolean => {
    if (to.length === 0) {
        return false;
    }

    if (from === null || from.length === 0) {
        return true;
    }

    const previousById = new Map(from.map((table) => [table.id, table]));

    for (const table of to) {
        const previous = previousById.get(table.id);

        if (previous === undefined) {
            return true;
        }

        if (hasMinimumCursorMovement(previous, table, minMovementPx)) {
            return true;
        }
    }

    return false;
};

export const shouldSendMovementUpdate = (
    lastSent: MovementTablePosition[] | null,
    next: MovementTablePosition[],
    lastSentAt: number,
    now: number,
    options?: {
        minMovementPx?: number;
        minIntervalMs?: number;
    }
): boolean => {
    if (next.length === 0) {
        return false;
    }

    if (lastSent !== null && areMovementSnapshotsEqual(lastSent, next)) {
        return false;
    }

    const minMovementPx = options?.minMovementPx ?? CURSOR_SEND_MIN_MOVEMENT_PX;
    const minIntervalMs = options?.minIntervalMs ?? CURSOR_SEND_MIN_INTERVAL_MS;

    if (!hasMinimumMovementSnapshot(lastSent, next, minMovementPx)) {
        return false;
    }

    if (lastSent !== null && now - lastSentAt < minIntervalMs) {
        return false;
    }

    return true;
};
