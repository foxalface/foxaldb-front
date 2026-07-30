import { useTranslation } from 'react-i18next';
import { useCommentsAvailability } from '@/hooks/use-comments-availability';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { useLayout } from '@/hooks/use-layout';
import { useOpenTargetConversation } from '@/hooks/use-open-target-conversation';
import type { DiagramCommentTarget } from '@/lib/comments/comment-types';
import type { DiagramConversationTarget } from '@/lib/conversations/conversation-types';

export interface UseTargetConversationMenuActionResult {
    showConversationAction: boolean;
    showCommentsAction: boolean;
    conversationLabel: string;
    isConversationPending: boolean;
    openConversationAction: () => void;
    openCommentsAction: () => void;
}

export const useTargetConversationMenuAction = (
    conversationTarget: DiagramConversationTarget,
    commentsTarget: DiagramCommentTarget
): UseTargetConversationMenuActionResult => {
    const { t } = useTranslation();
    const conversationsAvailable = useConversationsAvailability();
    const commentsActive = useCommentsAvailability();
    const { openTargetDiscussion } = useLayout();
    const { hasActiveConversation, canCreate, isPending, openConversation } =
        useOpenTargetConversation(conversationTarget);

    const showConversationAction =
        conversationsAvailable && (hasActiveConversation || canCreate);
    const showCommentsAction = commentsActive && !conversationsAvailable;

    const conversationLabel = hasActiveConversation
        ? t('side_panel.conversations_section.target_entry.open')
        : isPending
          ? t('side_panel.conversations_section.target_entry.pending')
          : t('side_panel.conversations_section.target_entry.start');

    return {
        showConversationAction,
        showCommentsAction,
        conversationLabel,
        isConversationPending: isPending,
        openConversationAction: () => {
            void openConversation();
        },
        openCommentsAction: () => {
            openTargetDiscussion(commentsTarget);
        },
    };
};
