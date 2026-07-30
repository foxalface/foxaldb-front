import { useCallback, useState } from 'react';

export interface UseConversationPanelNavigationResult {
    selectedConversationId: number | null;
    selectConversation: (conversationId: number) => void;
    clearSelectedConversation: () => void;
}

export const useConversationPanelNavigation =
    (): UseConversationPanelNavigationResult => {
        const [selectedConversationId, setSelectedConversationId] = useState<
            number | null
        >(null);

        const selectConversation = useCallback((conversationId: number) => {
            setSelectedConversationId(conversationId);
        }, []);

        const clearSelectedConversation = useCallback(() => {
            setSelectedConversationId(null);
        }, []);

        return {
            selectedConversationId,
            selectConversation,
            clearSelectedConversation,
        };
    };
