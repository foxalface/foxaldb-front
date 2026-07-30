import type { ConversationsState } from './conversation-reducer';
import type { DiagramConversation } from './conversation-types';

/**
 * O(1) lookup index mapping diagram targets to active conversation IDs.
 * Only active conversations are indexed; archived threads are excluded.
 */
export interface ConversationIndicatorIndex {
    readonly diagramConversationId: number | null;
    readonly tables: ReadonlyMap<string, number>;
    readonly fields: ReadonlyMap<string, number>;
    readonly relationships: ReadonlyMap<string, number>;
}

export type ConversationIndicatorEntityType =
    | 'table'
    | 'field'
    | 'relationship';

const EMPTY_TABLES: ReadonlyMap<string, number> = new Map();
const EMPTY_FIELDS: ReadonlyMap<string, number> = new Map();
const EMPTY_RELATIONSHIPS: ReadonlyMap<string, number> = new Map();

export const EMPTY_CONVERSATION_INDICATOR_INDEX: ConversationIndicatorIndex =
    Object.freeze({
        diagramConversationId: null,
        tables: EMPTY_TABLES,
        fields: EMPTY_FIELDS,
        relationships: EMPTY_RELATIONSHIPS,
    });

const toIdMap = (entries: Map<string, number>): ReadonlyMap<string, number> => {
    if (entries.size === 0) {
        return EMPTY_TABLES;
    }

    return entries;
};

/**
 * Builds a partitioned indicator index in a single O(N) pass over summaries.
 * Only active conversations are included.
 */
export const selectConversationIndicatorIndex = (
    state: Pick<ConversationsState, 'summariesById'>
): ConversationIndicatorIndex => {
    if (state.summariesById.size === 0) {
        return EMPTY_CONVERSATION_INDICATOR_INDEX;
    }

    let diagramConversationId: number | null = null;
    const tableIds = new Map<string, number>();
    const fieldIds = new Map<string, number>();
    const relationshipIds = new Map<string, number>();

    for (const conversation of state.summariesById.values()) {
        if (conversation.status !== 'active') {
            continue;
        }

        switch (conversation.targetType) {
            case 'diagram':
                diagramConversationId = conversation.id;
                break;
            case 'table':
                if (conversation.targetId !== null) {
                    tableIds.set(conversation.targetId, conversation.id);
                }
                break;
            case 'field':
                if (conversation.targetId !== null) {
                    fieldIds.set(conversation.targetId, conversation.id);
                }
                break;
            case 'relationship':
                if (conversation.targetId !== null) {
                    relationshipIds.set(conversation.targetId, conversation.id);
                }
                break;
            default: {
                const _exhaustive: never = conversation.targetType;
                void _exhaustive;
                break;
            }
        }
    }

    if (
        diagramConversationId === null &&
        tableIds.size === 0 &&
        fieldIds.size === 0 &&
        relationshipIds.size === 0
    ) {
        return EMPTY_CONVERSATION_INDICATOR_INDEX;
    }

    return Object.freeze({
        diagramConversationId,
        tables: tableIds.size === 0 ? EMPTY_TABLES : toIdMap(tableIds),
        fields: fieldIds.size === 0 ? EMPTY_FIELDS : toIdMap(fieldIds),
        relationships:
            relationshipIds.size === 0
                ? EMPTY_RELATIONSHIPS
                : toIdMap(relationshipIds),
    });
};

export const getActiveConversationIdForTarget = (
    index: ConversationIndicatorIndex,
    targetType: ConversationIndicatorEntityType | 'diagram',
    targetId: string | null
): number | null => {
    switch (targetType) {
        case 'diagram':
            return index.diagramConversationId;
        case 'table':
            return targetId === null
                ? null
                : (index.tables.get(targetId) ?? null);
        case 'field':
            return targetId === null
                ? null
                : (index.fields.get(targetId) ?? null);
        case 'relationship':
            return targetId === null
                ? null
                : (index.relationships.get(targetId) ?? null);
        default: {
            const _exhaustive: never = targetType;
            return _exhaustive;
        }
    }
};

export const findActiveConversationForTarget = (
    summariesById: Map<number, DiagramConversation>,
    targetType: DiagramConversation['targetType'],
    targetId: string | null
): DiagramConversation | undefined => {
    for (const conversation of summariesById.values()) {
        if (
            conversation.status === 'active' &&
            conversation.targetType === targetType &&
            conversation.targetId === targetId
        ) {
            return conversation;
        }
    }

    return undefined;
};
