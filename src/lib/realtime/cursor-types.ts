export interface CursorWhisperPayload {
    userId: number;
    x: number;
    y: number;
}

export interface CursorState {
    userId: number;
    x: number;
    y: number;
    receivedAt: number;
    stale: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const parseFiniteNumber = (value: unknown): number | null => {
    const parsed = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(parsed)) {
        return null;
    }

    return parsed;
};

export const parseCursorWhisperPayload = (
    input: unknown
): CursorWhisperPayload | null => {
    if (!isRecord(input)) {
        return null;
    }

    const userId = parseFiniteNumber(input.userId);
    const x = parseFiniteNumber(input.x);
    const y = parseFiniteNumber(input.y);

    if (userId === null || x === null || y === null) {
        return null;
    }

    return { userId, x, y };
};
