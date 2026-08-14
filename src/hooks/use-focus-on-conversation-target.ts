import { useCallback, useMemo } from 'react';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { doesConversationTargetExist } from '@/lib/conversations/conversation-target-existence';
import { useCanvas } from '@/hooks/use-canvas';
import { useChartDB } from '@/hooks/use-chartdb';
import { useFocusOn } from '@/hooks/use-focus-on';
import { useLayout } from '@/hooks/use-layout';

const findTableIdForField = (
    tables: ReadonlyArray<{
        id: string;
        fields: ReadonlyArray<{ id: string }>;
    }>,
    fieldId: string
): string | undefined => {
    for (const table of tables) {
        if (table.fields.some((field) => field.id === fieldId)) {
            return table.id;
        }
    }

    return undefined;
};

export const useFocusOnConversationTarget = (
    conversation: DiagramConversation
) => {
    const { tables, relationships } = useChartDB();
    const { focusOnTable, focusOnRelationship } = useFocusOn();
    const { setEditTableModeTable } = useCanvas();
    const { closeAllTablesInSidebar } = useLayout();

    const canFocusOnTarget = useMemo(() => {
        if (conversation.targetType === 'diagram') {
            return false;
        }

        if (conversation.targetId === null) {
            return false;
        }

        return doesConversationTargetExist(
            {
                targetType: conversation.targetType,
                targetId: conversation.targetId,
            },
            { tables, relationships }
        );
    }, [conversation.targetId, conversation.targetType, relationships, tables]);

    const focusOnTarget = useCallback(
        (event?: React.SyntheticEvent) => {
            event?.stopPropagation();

            if (!canFocusOnTarget || conversation.targetId === null) {
                return;
            }

            switch (conversation.targetType) {
                case 'table':
                    focusOnTable(conversation.targetId);
                    return;
                case 'field': {
                    const tableId = findTableIdForField(
                        tables,
                        conversation.targetId
                    );
                    if (!tableId) {
                        return;
                    }

                    focusOnTable(tableId);
                    closeAllTablesInSidebar();
                    setEditTableModeTable({
                        tableId,
                        fieldId: conversation.targetId,
                    });
                    return;
                }
                case 'relationship': {
                    const relationship = relationships.find(
                        (entry) => entry.id === conversation.targetId
                    );
                    if (!relationship) {
                        return;
                    }

                    focusOnRelationship(
                        relationship.id,
                        relationship.sourceTableId,
                        relationship.targetTableId
                    );
                    return;
                }
                default:
                    return;
            }
        },
        [
            canFocusOnTarget,
            closeAllTablesInSidebar,
            conversation.targetId,
            conversation.targetType,
            focusOnRelationship,
            focusOnTable,
            relationships,
            setEditTableModeTable,
            tables,
        ]
    );

    return {
        canFocusOnTarget,
        focusOnTarget,
    };
};
