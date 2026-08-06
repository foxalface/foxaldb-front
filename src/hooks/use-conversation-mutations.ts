import { useContext } from 'react';
import {
    ConversationsContext,
    INACTIVE_CONVERSATIONS_CONTEXT,
} from '@/context/conversations-context/conversations-context';
import type {
    CreateConversationMessageInput,
    DiagramConversation,
    DiagramConversationMessage,
    FindOrCreateDiagramConversationInput,
    UpdateConversationMessageInput,
} from '@/lib/conversations/conversation-types';

export interface UseConversationMutationsResult {
    findOrCreateConversation: (
        input: FindOrCreateDiagramConversationInput
    ) => Promise<DiagramConversation>;
    archiveConversation: (
        conversationId: number
    ) => Promise<DiagramConversation>;
    reopenConversation: (
        conversationId: number
    ) => Promise<DiagramConversation>;
    deleteConversation: (conversationId: number) => Promise<void>;
    createMessage: (
        conversationId: number,
        input: CreateConversationMessageInput
    ) => Promise<DiagramConversationMessage>;
    updateMessage: (
        conversationId: number,
        messageId: number,
        input: UpdateConversationMessageInput
    ) => Promise<DiagramConversationMessage>;
    deleteMessage: (conversationId: number, messageId: number) => Promise<void>;
    addReaction: (
        conversationId: number,
        messageId: number,
        emoji: string
    ) => Promise<void>;
    removeReaction: (
        conversationId: number,
        messageId: number,
        emoji: string
    ) => Promise<void>;
}

export const useConversationMutations = (): UseConversationMutationsResult => {
    const context = useContext(ConversationsContext);
    const value = context ?? INACTIVE_CONVERSATIONS_CONTEXT;

    return {
        findOrCreateConversation: value.findOrCreateConversation,
        archiveConversation: value.archiveConversation,
        reopenConversation: value.reopenConversation,
        deleteConversation: value.deleteConversation,
        createMessage: value.createMessage,
        updateMessage: value.updateMessage,
        deleteMessage: value.deleteMessage,
        addReaction: value.addReaction,
        removeReaction: value.removeReaction,
    };
};
