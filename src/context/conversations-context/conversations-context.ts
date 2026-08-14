import { createContext } from 'react';
import type {
    ConversationsStatus,
    ConversationMessagesStatus,
} from '@/lib/conversations/conversation-reducer';
import type {
    CreateConversationMessageInput,
    DiagramConversation,
    DiagramConversationMessage,
    FindOrCreateDiagramConversationInput,
    UpdateConversationMessageInput,
} from '@/lib/conversations/conversation-types';
import {
    EMPTY_CONVERSATION_MESSAGES,
    EMPTY_CONVERSATIONS,
} from '@/lib/conversations/conversation-selectors';

export interface ConversationsContextValue {
    activeConversations: ReadonlyArray<DiagramConversation>;
    archivedConversations: ReadonlyArray<DiagramConversation>;
    status: ConversationsStatus;
    error: unknown;
    isActive: boolean;
    diagramId: string | null;
    activeSummariesNextCursor: string | null;
    archivedSummariesNextCursor: string | null;
    totalUnreadCount: number;
    reload: () => Promise<void>;
    loadArchivedSummaries: (options?: { append?: boolean }) => Promise<void>;
    loadMoreActiveSummaries: () => Promise<void>;
    loadMoreArchivedSummaries: () => Promise<void>;
    loadMessages: (conversationId: number) => Promise<void>;
    loadMoreMessages: (conversationId: number) => Promise<void>;
    getMessages: (
        conversationId: number
    ) => ReadonlyArray<DiagramConversationMessage>;
    getMessagesStatus: (conversationId: number) => ConversationMessagesStatus;
    getMessagesError: (conversationId: number) => unknown;
    getMessagesNextCursor: (conversationId: number) => string | null;
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
    markConversationRead: (
        conversationId: number,
        lastReadMessageId?: number
    ) => Promise<void>;
    getConversationById: (
        conversationId: number
    ) => DiagramConversation | undefined;
}

/** Internal developer error — not user-facing copy. Fresh instance per call. */
export const createConversationsInactiveError = (): Error =>
    new Error('Diagram conversations are not active');

const inactiveReload = (): Promise<void> => Promise.resolve();

const inactiveLoadArchivedSummaries = (): Promise<void> => Promise.resolve();

const inactiveLoadMore = (): Promise<void> => Promise.resolve();

const inactiveLoadMessages = (): Promise<void> => Promise.resolve();

const inactiveFindOrCreate: ConversationsContextValue['findOrCreateConversation'] =
    () => Promise.reject(createConversationsInactiveError());

const inactiveArchive: ConversationsContextValue['archiveConversation'] = () =>
    Promise.reject(createConversationsInactiveError());

const inactiveReopen: ConversationsContextValue['reopenConversation'] = () =>
    Promise.reject(createConversationsInactiveError());

const inactiveDeleteConversation: ConversationsContextValue['deleteConversation'] =
    () => Promise.reject(createConversationsInactiveError());

const inactiveCreateMessage: ConversationsContextValue['createMessage'] = () =>
    Promise.reject(createConversationsInactiveError());

const inactiveUpdateMessage: ConversationsContextValue['updateMessage'] = () =>
    Promise.reject(createConversationsInactiveError());

const inactiveDeleteMessage: ConversationsContextValue['deleteMessage'] = () =>
    Promise.reject(createConversationsInactiveError());

const inactiveAddReaction: ConversationsContextValue['addReaction'] = () =>
    Promise.reject(createConversationsInactiveError());

const inactiveRemoveReaction: ConversationsContextValue['removeReaction'] =
    () => Promise.reject(createConversationsInactiveError());

const inactiveMarkConversationRead: ConversationsContextValue['markConversationRead'] =
    () => Promise.reject(createConversationsInactiveError());

const inactiveGetConversationById: ConversationsContextValue['getConversationById'] =
    () => undefined;

export const INACTIVE_CONVERSATIONS_CONTEXT: ConversationsContextValue = {
    activeConversations: EMPTY_CONVERSATIONS,
    archivedConversations: EMPTY_CONVERSATIONS,
    status: 'idle',
    error: null,
    isActive: false,
    diagramId: null,
    activeSummariesNextCursor: null,
    archivedSummariesNextCursor: null,
    totalUnreadCount: 0,
    reload: inactiveReload,
    loadArchivedSummaries: inactiveLoadArchivedSummaries,
    loadMoreActiveSummaries: inactiveLoadMore,
    loadMoreArchivedSummaries: inactiveLoadMore,
    loadMessages: inactiveLoadMessages,
    loadMoreMessages: inactiveLoadMessages,
    getMessages: () => EMPTY_CONVERSATION_MESSAGES,
    getMessagesStatus: () => 'idle',
    getMessagesError: () => null,
    getMessagesNextCursor: () => null,
    findOrCreateConversation: inactiveFindOrCreate,
    archiveConversation: inactiveArchive,
    reopenConversation: inactiveReopen,
    deleteConversation: inactiveDeleteConversation,
    createMessage: inactiveCreateMessage,
    updateMessage: inactiveUpdateMessage,
    deleteMessage: inactiveDeleteMessage,
    addReaction: inactiveAddReaction,
    removeReaction: inactiveRemoveReaction,
    markConversationRead: inactiveMarkConversationRead,
    getConversationById: inactiveGetConversationById,
};

export const ConversationsContext =
    createContext<ConversationsContextValue | null>(null);

/**
 * Narrow boolean boundary for consumers that only need conversations availability.
 * Stays referentially stable while `isActive` is unchanged.
 */
export const ConversationsAvailabilityContext = createContext(false);
