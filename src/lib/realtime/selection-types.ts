export type SelectionEntityType = 'table' | 'relationship';

export interface SelectionItem {
    entityType: SelectionEntityType;
    entityId: string;
}

export interface SelectionWhisperPayload {
    userId: number;
    selections: SelectionItem[];
}

export interface UserSelectionState {
    selections: SelectionItem[];
    receivedAt: number;
}

const SELECTION_ENTITY_TYPES: ReadonlySet<string> = new Set([
    'table',
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

const parseSelectionItem = (value: unknown): SelectionItem | null => {
    if (!isRecord(value)) {
        return null;
    }

    const entityType = value.entityType;
    const entityId = value.entityId;

    if (
        typeof entityType !== 'string' ||
        !SELECTION_ENTITY_TYPES.has(entityType) ||
        typeof entityId !== 'string' ||
        entityId.length === 0
    ) {
        return null;
    }

    return {
        entityType: entityType as SelectionEntityType,
        entityId,
    };
};

export const parseSelectionWhisperPayload = (
    input: unknown
): SelectionWhisperPayload | null => {
    if (!isRecord(input)) {
        return null;
    }

    const userId = parseFiniteNumber(input.userId);

    if (userId === null) {
        return null;
    }

    if (!Array.isArray(input.selections)) {
        return null;
    }

    const selections: SelectionItem[] = [];

    for (const item of input.selections) {
        const parsedItem = parseSelectionItem(item);

        if (parsedItem === null) {
            return null;
        }

        selections.push(parsedItem);
    }

    return { userId, selections };
};
