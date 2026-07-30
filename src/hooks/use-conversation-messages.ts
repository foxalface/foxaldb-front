import { useContext, useMemo } from 'react';
import {
    ConversationsContext,
    INACTIVE_CONVERSATIONS_CONTEXT,
} from '@/context/conversations-context/conversations-context';
import type { ConversationMessagesStatus } from '@/lib/conversations/conversation-reducer';
import type { DiagramConversationMessage } from '@/lib/conversations/conversation-types';
import { EMPTY_CONVERSATION_MESSAGES } from '@/lib/conversations/conversation-selectors';

export interface UseConversationMessagesResult {
    messages: ReadonlyArray<DiagramConversationMessage>;
    status: ConversationMessagesStatus;
    error: unknown;
    loadMessages: () => Promise<void>;
    loadMoreMessages: () => Promise<void>;
}

export const useConversationMessages = (
    conversationId: number | null
): UseConversationMessagesResult => {
    const context = useContext(ConversationsContext);
    const value = context ?? INACTIVE_CONVERSATIONS_CONTEXT;

    const messages = useMemo(() => {
        if (conversationId === null) {
            return EMPTY_CONVERSATION_MESSAGES;
        }

        return value.getMessages(conversationId);
    }, [conversationId, value]);

    const status =
        conversationId === null
            ? 'idle'
            : value.getMessagesStatus(conversationId);

    const error =
        conversationId === null ? null : value.getMessagesError(conversationId);

    const loadMessages = useMemo(() => {
        if (conversationId === null) {
            return async (): Promise<void> => undefined;
        }

        return () => value.loadMessages(conversationId);
    }, [conversationId, value]);

    const loadMoreMessages = useMemo(() => {
        if (conversationId === null) {
            return async (): Promise<void> => undefined;
        }

        return () => value.loadMoreMessages(conversationId);
    }, [conversationId, value]);

    return {
        messages,
        status,
        error,
        loadMessages,
        loadMoreMessages,
    };
};
