import { useMemo } from 'react';
import { useCommentsAvailability } from '@/hooks/use-comments-availability';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';

export interface EditorDiscussionAvailability {
    conversationsAvailable: boolean;
    commentsActive: boolean;
    showLegacyCommentsEntry: boolean;
    showStandardCommentsEntry: boolean;
}

/**
 * Shared availability contract for Conversations/Comments coexistence in editor navigation.
 */
export const useEditorDiscussionAvailability =
    (): EditorDiscussionAvailability => {
        const conversationsAvailable = useConversationsAvailability();
        const commentsActive = useCommentsAvailability();

        return useMemo(
            () => ({
                conversationsAvailable,
                commentsActive,
                showLegacyCommentsEntry:
                    conversationsAvailable && commentsActive,
                showStandardCommentsEntry:
                    commentsActive && !conversationsAvailable,
            }),
            [commentsActive, conversationsAvailable]
        );
    };
