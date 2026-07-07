export type EditingEntityType = 'table' | 'field' | 'relationship';

export interface EditingItem {
    entityType: EditingEntityType;
    entityId: string;
}

export interface EditingWhisperPayload {
    userId: number;
    edits: EditingItem[];
}

export interface UserEditingState {
    edits: EditingItem[];
    receivedAt: number;
}

const EDITING_ENTITY_TYPES: ReadonlySet<string> = new Set([
    'table',
    'field',
    'relationship',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const parseFiniteNumber = (value: unknown): number | null => {
    const parsed = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(parsed)) {
        return null;
    }

    return parsed;
};

const parseEditingItem = (value: unknown): EditingItem | null => {
    if (!isRecord(value)) {
        return null;
    }

    const entityType = value.entityType;
    const entityId = value.entityId;

    if (
        typeof entityType !== 'string' ||
        !EDITING_ENTITY_TYPES.has(entityType) ||
        typeof entityId !== 'string' ||
        entityId.length === 0
    ) {
        return null;
    }

    return {
        entityType: entityType as EditingEntityType,
        entityId,
    };
};

export const parseEditingWhisperPayload = (
    input: unknown
): EditingWhisperPayload | null => {
    if (!isRecord(input)) {
        return null;
    }

    const userId = parseFiniteNumber(input.userId);

    if (userId === null) {
        return null;
    }

    if (!Array.isArray(input.edits)) {
        return null;
    }

    const edits: EditingItem[] = [];

    for (const item of input.edits) {
        const parsedItem = parseEditingItem(item);

        if (parsedItem === null) {
            return null;
        }

        edits.push(parsedItem);
    }

    return { userId, edits };
};
