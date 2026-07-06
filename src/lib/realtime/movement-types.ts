export type MovementPhase = 'move' | 'end';

export interface MovementTablePosition {
    id: string;
    x: number;
    y: number;
}

export interface MovementWhisperPayload {
    userId: number;
    phase: MovementPhase;
    tables: MovementTablePosition[];
}

export interface UserMovementState {
    phase: MovementPhase;
    tables: MovementTablePosition[];
    receivedAt: number;
}

const MOVEMENT_PHASES: ReadonlySet<string> = new Set(['move', 'end']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const parseFiniteNumber = (value: unknown): number | null => {
    const parsed = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(parsed)) {
        return null;
    }

    return parsed;
};

const parseMovementTable = (value: unknown): MovementTablePosition | null => {
    if (!isRecord(value)) {
        return null;
    }

    const id = value.id;
    const x = parseFiniteNumber(value.x);
    const y = parseFiniteNumber(value.y);

    if (typeof id !== 'string' || id.length === 0 || x === null || y === null) {
        return null;
    }

    return { id, x, y };
};

export const parseMovementWhisperPayload = (
    input: unknown
): MovementWhisperPayload | null => {
    if (!isRecord(input)) {
        return null;
    }

    const userId = parseFiniteNumber(input.userId);
    const phase = input.phase;

    if (
        userId === null ||
        typeof phase !== 'string' ||
        !MOVEMENT_PHASES.has(phase)
    ) {
        return null;
    }

    if (!Array.isArray(input.tables)) {
        return null;
    }

    const tables: MovementTablePosition[] = [];
    const seenTableIds = new Set<string>();

    for (const item of input.tables) {
        const parsedTable = parseMovementTable(item);

        if (parsedTable === null) {
            return null;
        }

        if (seenTableIds.has(parsedTable.id)) {
            return null;
        }

        seenTableIds.add(parsedTable.id);
        tables.push(parsedTable);
    }

    return {
        userId,
        phase: phase as MovementPhase,
        tables,
    };
};
