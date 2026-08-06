import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ConversationsContext,
    INACTIVE_CONVERSATIONS_CONTEXT,
} from '@/context/conversations-context/conversations-context';
import { useConversationMessages } from '@/hooks/use-conversation-messages';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';

const MARK_READ_DEBOUNCE_MS = 300;

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
    const context = useContext(ConversationsContext);
    const conversations = context ?? INACTIVE_CONVERSATIONS_CONTEXT;

    const conversationId = conversation?.id ?? null;
    const { messages, status, error, loadMessages, loadMoreMessages, hasMore } =
        useConversationMessages(conversationId);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const lazyLoadStartedRef = useRef<number | null>(null);
    const initialMarkCompletedRef = useRef(false);
    const lastMarkedMessageIdRef = useRef<number | null>(null);
    const markReadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const markConversationReadRef = useRef(conversations.markConversationRead);

    markConversationReadRef.current = conversations.markConversationRead;

    useEffect(() => {
        if (conversationId === null) {
            lazyLoadStartedRef.current = null;
            initialMarkCompletedRef.current = false;
            lastMarkedMessageIdRef.current = null;
            if (markReadDebounceRef.current !== null) {
                clearTimeout(markReadDebounceRef.current);
                markReadDebounceRef.current = null;
            }
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

    const newestMessageId = useMemo(() => {
        if (messages.length === 0) {
            return null;
        }

        return messages[0]?.id ?? null;
    }, [messages]);

    const scheduleMarkRead = useCallback(
        (messageId: number | undefined) => {
            if (conversationId === null || status !== 'ready') {
                return;
            }

            if (markReadDebounceRef.current !== null) {
                clearTimeout(markReadDebounceRef.current);
            }

            markReadDebounceRef.current = setTimeout(() => {
                markReadDebounceRef.current = null;

                if (
                    messageId !== undefined &&
                    lastMarkedMessageIdRef.current === messageId
                ) {
                    return;
                }

                void markConversationReadRef
                    .current(conversationId, messageId)
                    .then(() => {
                        lastMarkedMessageIdRef.current =
                            messageId ?? lastMarkedMessageIdRef.current;
                    })
                    .catch(() => {
                        // Mark-read failures do not block detail rendering.
                    });
            }, MARK_READ_DEBOUNCE_MS);
        },
        [conversationId, status]
    );

    useEffect(() => {
        if (conversationId === null || status !== 'ready') {
            return;
        }

        if (!initialMarkCompletedRef.current) {
            initialMarkCompletedRef.current = true;
            scheduleMarkRead(newestMessageId ?? undefined);
            return;
        }

        if (
            newestMessageId !== null &&
            (lastMarkedMessageIdRef.current === null ||
                newestMessageId > lastMarkedMessageIdRef.current)
        ) {
            scheduleMarkRead(newestMessageId);
        }
    }, [conversationId, status, newestMessageId, scheduleMarkRead]);

    useEffect(() => {
        return () => {
            if (markReadDebounceRef.current !== null) {
                clearTimeout(markReadDebounceRef.current);
            }
        };
    }, []);

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
