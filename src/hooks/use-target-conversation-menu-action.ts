import { useTranslation } from 'react-i18next';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { useOpenTargetConversation } from '@/hooks/use-open-target-conversation';
import type { DiagramConversationTarget } from '@/lib/conversations/conversation-types';

export interface UseTargetConversationMenuActionResult {
    showConversationAction: boolean;
    conversationLabel: string;
    isConversationPending: boolean;
    openConversationAction: () => void;
}

export const useTargetConversationMenuAction = (
    conversationTarget: DiagramConversationTarget
): UseTargetConversationMenuActionResult => {
    const { t } = useTranslation();
    const conversationsAvailable = useConversationsAvailability();
    const { hasActiveConversation, isPending, openConversation } =
        useOpenTargetConversation(conversationTarget);

    const showConversationAction =
        conversationsAvailable && hasActiveConversation;

    const conversationLabel = isPending
        ? t('side_panel.conversations_section.target_entry.pending')
        : t('side_panel.conversations_section.target_entry.open');

    return {
        showConversationAction,
        conversationLabel,
        isConversationPending: isPending,
        openConversationAction: () => {
            void openConversation();
        },
    };
};
