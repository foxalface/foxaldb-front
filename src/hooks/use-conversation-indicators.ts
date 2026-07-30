import { useContext, useMemo } from 'react';
import { ConversationIndicatorsContext } from '@/context/conversations-context/conversation-indicators-context';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { doesConversationTargetExist } from '@/lib/conversations/conversation-target-existence';
import { getActiveConversationIdForTarget } from '@/lib/conversations/conversation-indicators';
import type { DiagramConversationTarget } from '@/lib/conversations/conversation-types';

export interface ConversationIndicatorState {
    readonly hasActiveConversation: boolean;
    readonly conversationId: number | null;
}

const EMPTY_INDICATOR: ConversationIndicatorState = Object.freeze({
    hasActiveConversation: false,
    conversationId: null,
});

const useConversationIndicatorLookup = (
    targetType: 'table' | 'field' | 'relationship',
    targetId: string
): ConversationIndicatorState => {
    const index = useContext(ConversationIndicatorsContext);
    const { tables, relationships } = useChartDB();
    const isAvailable = useConversationsAvailability();

    return useMemo(() => {
        if (!isAvailable) {
            return EMPTY_INDICATOR;
        }

        const target: DiagramConversationTarget = {
            targetType,
            targetId,
        };

        if (!doesConversationTargetExist(target, { tables, relationships })) {
            return EMPTY_INDICATOR;
        }

        const conversationId = getActiveConversationIdForTarget(
            index,
            targetType,
            targetId
        );

        if (conversationId === null) {
            return EMPTY_INDICATOR;
        }

        return Object.freeze({
            hasActiveConversation: true,
            conversationId,
        });
    }, [index, isAvailable, relationships, tables, targetId, targetType]);
};

export const useTableConversationIndicator = (
    tableId: string
): ConversationIndicatorState =>
    useConversationIndicatorLookup('table', tableId);

export const useFieldConversationIndicator = (
    fieldId: string
): ConversationIndicatorState =>
    useConversationIndicatorLookup('field', fieldId);

export const useRelationshipConversationIndicator = (
    relationshipId: string
): ConversationIndicatorState =>
    useConversationIndicatorLookup('relationship', relationshipId);

export const useDiagramConversationIndicator =
    (): ConversationIndicatorState => {
        const index = useContext(ConversationIndicatorsContext);
        const isAvailable = useConversationsAvailability();

        return useMemo(() => {
            if (!isAvailable) {
                return EMPTY_INDICATOR;
            }

            const conversationId = index.diagramConversationId;

            if (conversationId === null) {
                return EMPTY_INDICATOR;
            }

            return Object.freeze({
                hasActiveConversation: true,
                conversationId,
            });
        }, [index, isAvailable]);
    };
