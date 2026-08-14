import type {
    ConversationMessagesStatus,
    ConversationsState,
} from './conversation-reducer';
import { conversationHasMessages } from './conversation-has-messages';
import type {
    ConversationStatus,
    DiagramConversation,
    DiagramConversationMessage,
    DiagramConversationTarget,
} from './conversation-types';

export const EMPTY_CONVERSATIONS: ReadonlyArray<DiagramConversation> =
    Object.freeze([]);

export const EMPTY_CONVERSATION_MESSAGES = Object.freeze([]);

const compareConversationsByUpdatedAtThenId = (
    a: DiagramConversation,
    b: DiagramConversation
): number => {
    const aTime = Date.parse(a.updatedAt);
    const bTime = Date.parse(b.updatedAt);
    const aValid = Number.isFinite(aTime);
    const bValid = Number.isFinite(bTime);

    if (aValid && bValid) {
        if (aTime !== bTime) {
            return bTime - aTime;
        }

        return b.id - a.id;
    }

    if (aValid !== bValid) {
        return aValid ? -1 : 1;
    }

    if (a.updatedAt !== b.updatedAt) {
        return a.updatedAt < b.updatedAt ? 1 : -1;
    }

    return b.id - a.id;
};

const sortConversations = (
    conversations: DiagramConversation[]
): ReadonlyArray<DiagramConversation> =>
    [...conversations].sort(compareConversationsByUpdatedAtThenId);

export const selectConversationsByStatus = (
    summariesById: Map<number, DiagramConversation>,
    status: ConversationStatus
): ReadonlyArray<DiagramConversation> => {
    if (summariesById.size === 0) {
        return EMPTY_CONVERSATIONS;
    }

    const matched: DiagramConversation[] = [];

    for (const conversation of summariesById.values()) {
        if (conversation.status === status) {
            matched.push(conversation);
        }
    }

    if (matched.length === 0) {
        return EMPTY_CONVERSATIONS;
    }

    return sortConversations(matched);
};

export const selectListedConversationsByStatus = (
    summariesById: Map<number, DiagramConversation>,
    status: ConversationStatus
): ReadonlyArray<DiagramConversation> => {
    if (summariesById.size === 0) {
        return EMPTY_CONVERSATIONS;
    }

    const matched: DiagramConversation[] = [];

    for (const conversation of summariesById.values()) {
        if (
            conversation.status === status &&
            conversationHasMessages(conversation)
        ) {
            matched.push(conversation);
        }
    }

    if (matched.length === 0) {
        return EMPTY_CONVERSATIONS;
    }

    return sortConversations(matched);
};

export const selectActiveConversations = (
    summariesById: Map<number, DiagramConversation>
): ReadonlyArray<DiagramConversation> =>
    selectListedConversationsByStatus(summariesById, 'active');

export const selectArchivedConversations = (
    summariesById: Map<number, DiagramConversation>
): ReadonlyArray<DiagramConversation> =>
    selectListedConversationsByStatus(summariesById, 'archived');

export const selectConversationById = (
    state: ConversationsState,
    conversationId: number
): DiagramConversation | undefined => state.summariesById.get(conversationId);

export const selectConversationForTarget = (
    state: ConversationsState,
    target: DiagramConversationTarget
): DiagramConversation | undefined => {
    if (state.summariesById.size === 0) {
        return undefined;
    }

    for (const conversation of state.summariesById.values()) {
        if (
            conversation.targetType === target.targetType &&
            conversation.targetId === target.targetId
        ) {
            return conversation;
        }
    }

    return undefined;
};

export const selectActiveConversationForTarget = (
    state: ConversationsState,
    target: DiagramConversationTarget
): DiagramConversation | undefined => {
    const conversation = selectConversationForTarget(state, target);

    if (
        conversation === undefined ||
        conversation.status !== 'active' ||
        !conversationHasMessages(conversation)
    ) {
        return undefined;
    }

    return conversation;
};

const compareMessagesByCreatedAtThenId = (
    a: { createdAt: string; id: number },
    b: { createdAt: string; id: number }
): number => {
    const aTime = Date.parse(a.createdAt);
    const bTime = Date.parse(b.createdAt);
    const aValid = Number.isFinite(aTime);
    const bValid = Number.isFinite(bTime);

    if (aValid && bValid) {
        if (aTime !== bTime) {
            return bTime - aTime;
        }

        return b.id - a.id;
    }

    if (aValid !== bValid) {
        return aValid ? -1 : 1;
    }

    if (a.createdAt !== b.createdAt) {
        return a.createdAt < b.createdAt ? 1 : -1;
    }

    return b.id - a.id;
};

export const selectMessagesForConversation = (
    state: ConversationsState,
    conversationId: number
): ReadonlyArray<DiagramConversationMessage> => {
    const slice = state.messagesByConversationId.get(conversationId);

    if (slice === undefined || slice.byId.size === 0) {
        return EMPTY_CONVERSATION_MESSAGES;
    }

    return [...slice.byId.values()].sort(compareMessagesByCreatedAtThenId);
};

export const selectMessagesStatusForConversation = (
    state: ConversationsState,
    conversationId: number
): ConversationMessagesStatus => {
    const slice = state.messagesByConversationId.get(conversationId);

    return slice?.status ?? 'idle';
};

export const selectMessagesErrorForConversation = (
    state: ConversationsState,
    conversationId: number
): unknown => {
    const slice = state.messagesByConversationId.get(conversationId);

    return slice?.error ?? null;
};

export const selectMessagesNextCursorForConversation = (
    state: ConversationsState,
    conversationId: number
): string | null => {
    const slice = state.messagesByConversationId.get(conversationId);

    return slice?.nextCursor ?? null;
};
