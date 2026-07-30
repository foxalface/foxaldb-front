import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramConversationTarget } from './conversation-types';

export interface ConversationTargetExistenceContext {
    readonly tables: ReadonlyArray<DBTable>;
    readonly relationships: ReadonlyArray<DBRelationship>;
}

/**
 * Returns whether the target still exists on the current diagram.
 * Stale conversation summaries for deleted targets must not surface indicators.
 */
export const doesConversationTargetExist = (
    target: DiagramConversationTarget,
    context: ConversationTargetExistenceContext
): boolean => {
    switch (target.targetType) {
        case 'diagram':
            return true;
        case 'table':
            return context.tables.some((table) => table.id === target.targetId);
        case 'field':
            return context.tables.some((table) =>
                table.fields.some((field) => field.id === target.targetId)
            );
        case 'relationship':
            return context.relationships.some(
                (relationship) => relationship.id === target.targetId
            );
        default: {
            const _exhaustive: never = target;
            return _exhaustive;
        }
    }
};
