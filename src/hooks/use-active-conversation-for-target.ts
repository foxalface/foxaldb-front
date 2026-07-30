import { useContext, useMemo } from 'react';
import {
    ConversationsContext,
    INACTIVE_CONVERSATIONS_CONTEXT,
} from '@/context/conversations-context/conversations-context';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { doesConversationTargetExist } from '@/lib/conversations/conversation-target-existence';
import type {
    DiagramConversation,
    DiagramConversationTarget,
} from '@/lib/conversations/conversation-types';

/**
 * Resolves the active Conversation for a single target, excluding archived threads
 * and stale summaries whose target no longer exists on the diagram.
 */
export const useActiveConversationForTarget = (
    target: DiagramConversationTarget
): DiagramConversation | undefined => {
    const context = useContext(ConversationsContext);
    const value = context ?? INACTIVE_CONVERSATIONS_CONTEXT;
    const { tables, relationships } = useChartDB();
    const isAvailable = useConversationsAvailability();

    return useMemo(() => {
        if (!isAvailable || !value.isActive) {
            return undefined;
        }

        if (!doesConversationTargetExist(target, { tables, relationships })) {
            return undefined;
        }

        return value.activeConversations.find(
            (conversation) =>
                conversation.targetType === target.targetType &&
                conversation.targetId === target.targetId
        );
    }, [
        isAvailable,
        relationships,
        tables,
        target,
        value.activeConversations,
        value.isActive,
    ]);
};
