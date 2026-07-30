import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConversationMessages } from '@/hooks/use-conversation-messages';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';

export interface UseConversationDetailResult {
    messages: ReturnType<typeof useConversationMessages>['messages'];
    status: ReturnType<typeof useConversationMessages>['status'];
    error: ReturnType<typeof useConversationMessages>['error'];
    hasMore: boolean;
    isInitialLoading: boolean;
    isLoadingMore: boolean;
    isRetrying: boolean;
    handleLoadOlder: () => Promise<void>;
    handleRetry: () => Promise<void>;
}

export const useConversationDetail = (
    conversation: DiagramConversation | null
): UseConversationDetailResult => {
    const conversationId = conversation?.id ?? null;
    const { messages, status, error, loadMessages, loadMoreMessages, hasMore } =
        useConversationMessages(conversationId);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const lazyLoadStartedRef = useRef<number | null>(null);

    useEffect(() => {
        if (conversationId === null) {
            lazyLoadStartedRef.current = null;
            return;
        }

        if (status !== 'idle') {
            return;
        }

        if (lazyLoadStartedRef.current === conversationId) {
            return;
        }

        lazyLoadStartedRef.current = conversationId;
        void loadMessages().catch(() => {
            // Provider stores authoritative error state.
        });
    }, [conversationId, status, loadMessages]);

    const chronologicalMessages = useMemo(
        () => [...messages].reverse(),
        [messages]
    );

    const isInitialLoading =
        conversationId !== null &&
        status === 'loading' &&
        chronologicalMessages.length === 0;

    const handleLoadOlder = useCallback(async (): Promise<void> => {
        if (isLoadingMore || !hasMore || conversationId === null) {
            return;
        }

        setIsLoadingMore(true);
        try {
            await loadMoreMessages();
        } finally {
            setIsLoadingMore(false);
        }
    }, [conversationId, hasMore, isLoadingMore, loadMoreMessages]);

    const handleRetry = useCallback(async (): Promise<void> => {
        if (conversationId === null || isRetrying) {
            return;
        }

        setIsRetrying(true);
        try {
            await loadMessages();
        } catch {
            // Provider stores authoritative error state.
        } finally {
            setIsRetrying(false);
        }
    }, [conversationId, isRetrying, loadMessages]);

    return {
        messages: chronologicalMessages,
        status,
        error,
        hasMore,
        isInitialLoading,
        isLoadingMore,
        isRetrying,
        handleLoadOlder,
        handleRetry,
    };
};
