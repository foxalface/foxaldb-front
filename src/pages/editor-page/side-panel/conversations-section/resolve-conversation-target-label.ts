import type { TFunction } from 'i18next';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';

export interface ConversationTargetLabelContext {
    diagramName: string | null;
    tables: ReadonlyArray<DBTable>;
    relationships: ReadonlyArray<DBRelationship>;
    t: TFunction;
}

export interface ResolvedConversationTargetLabel {
    typeLabel: string;
    title: string;
    isMissing: boolean;
}

const TARGET_LABELS_KEY = 'side_panel.conversations_section.target_labels';
const TARGETS_KEY = 'side_panel.conversations_section.targets';

const findTableById = (
    tables: ReadonlyArray<DBTable>,
    tableId: string
): DBTable | undefined => tables.find((table) => table.id === tableId);

const findFieldInTables = (
    tables: ReadonlyArray<DBTable>,
    fieldId: string
): { table: DBTable; fieldName: string } | undefined => {
    for (const table of tables) {
        const field = table.fields.find((entry) => entry.id === fieldId);
        if (field) {
            return { table, fieldName: field.name };
        }
    }

    return undefined;
};

const resolveRelationshipDisplayName = (name: string): string | null => {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : null;
};

export const resolveConversationTargetLabel = (
    conversation: DiagramConversation,
    context: ConversationTargetLabelContext
): ResolvedConversationTargetLabel => {
    const { t, tables, relationships, diagramName } = context;

    if (conversation.targetType === 'diagram') {
        const trimmedDiagramName = diagramName?.trim() ?? '';
        return {
            typeLabel: t(`${TARGETS_KEY}.diagram`),
            title:
                trimmedDiagramName.length > 0
                    ? trimmedDiagramName
                    : t(`${TARGET_LABELS_KEY}.diagram`),
            isMissing: false,
        };
    }

    if (conversation.targetId === null) {
        return {
            typeLabel: t(`${TARGETS_KEY}.unknown`),
            title: t(`${TARGET_LABELS_KEY}.unknown`),
            isMissing: true,
        };
    }

    if (conversation.targetType === 'table') {
        const table = findTableById(tables, conversation.targetId);
        if (!table) {
            return {
                typeLabel: t(`${TARGETS_KEY}.table`),
                title: t(`${TARGET_LABELS_KEY}.missing_table`),
                isMissing: true,
            };
        }

        return {
            typeLabel: t(`${TARGETS_KEY}.table`),
            title: table.name,
            isMissing: false,
        };
    }

    if (conversation.targetType === 'field') {
        const match = findFieldInTables(tables, conversation.targetId);
        if (!match) {
            return {
                typeLabel: t(`${TARGETS_KEY}.field`),
                title: t(`${TARGET_LABELS_KEY}.missing_field`),
                isMissing: true,
            };
        }

        return {
            typeLabel: t(`${TARGETS_KEY}.field`),
            title: t(`${TARGET_LABELS_KEY}.field`, {
                table: match.table.name,
                field: match.fieldName,
            }),
            isMissing: false,
        };
    }

    const relationship = relationships.find(
        (entry) => entry.id === conversation.targetId
    );
    if (!relationship) {
        return {
            typeLabel: t(`${TARGETS_KEY}.relationship`),
            title: t(`${TARGET_LABELS_KEY}.missing_relationship`),
            isMissing: true,
        };
    }

    const sourceTable = findTableById(tables, relationship.sourceTableId);
    const targetTable = findTableById(tables, relationship.targetTableId);
    const relationshipName = resolveRelationshipDisplayName(relationship.name);

    if (relationshipName) {
        return {
            typeLabel: t(`${TARGETS_KEY}.relationship`),
            title: relationshipName,
            isMissing: false,
        };
    }

    if (sourceTable && targetTable) {
        return {
            typeLabel: t(`${TARGETS_KEY}.relationship`),
            title: t(`${TARGET_LABELS_KEY}.relationship_endpoints`, {
                source: sourceTable.name,
                target: targetTable.name,
            }),
            isMissing: false,
        };
    }

    return {
        typeLabel: t(`${TARGETS_KEY}.relationship`),
        title: t(`${TARGET_LABELS_KEY}.missing_relationship`),
        isMissing: true,
    };
};
