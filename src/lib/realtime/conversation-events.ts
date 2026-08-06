import {
    CONVERSATION_STATUSES,
    CONVERSATION_TARGET_TYPES,
    type ConversationStatus,
    type ConversationTargetType,
    type DiagramConversation,
    type DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { parseUserIdentityFromWebSocket } from '@/lib/user';

export const DIAGRAM_CONVERSATION_CREATED_EVENT = '.DiagramConversationCreated';

export const DIAGRAM_CONVERSATION_ARCHIVED_EVENT =
    '.DiagramConversationArchived';

export const DIAGRAM_CONVERSATION_REOPENED_EVENT =
    '.DiagramConversationReopened';

export const DIAGRAM_CONVERSATION_DELETED_EVENT = '.DiagramConversationDeleted';

export const DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT =
    '.DiagramConversationMessageCreated';

export const DIAGRAM_CONVERSATION_MESSAGE_UPDATED_EVENT =
    '.DiagramConversationMessageUpdated';

export const DIAGRAM_CONVERSATION_MESSAGE_DELETED_EVENT =
    '.DiagramConversationMessageDeleted';

export interface DiagramConversationMutationPayload {
    conversation: DiagramConversation;
    userId: number;
}

export type DiagramConversationCreatedPayload =
    DiagramConversationMutationPayload;

export type DiagramConversationArchivedPayload =
    DiagramConversationMutationPayload;

export type DiagramConversationReopenedPayload =
    DiagramConversationMutationPayload;

export interface DiagramConversationDeletedPayload {
    conversationId: number;
    diagramId: number;
    userId: number;
}

export interface DiagramConversationMessageMutationPayload {
    message: DiagramConversationMessage;
    conversation: DiagramConversation;
    userId: number;
}

export type DiagramConversationMessageCreatedPayload =
    DiagramConversationMessageMutationPayload;

export type DiagramConversationMessageUpdatedPayload =
    DiagramConversationMessageMutationPayload;

export interface DiagramConversationMessageDeletedPayload {
    messageId: number;
    conversationId: number;
    conversation: DiagramConversation;
    userId: number;
}

const CONVERSATION_TARGET_TYPE_SET: ReadonlySet<string> = new Set(
    CONVERSATION_TARGET_TYPES
);

const CONVERSATION_STATUS_SET: ReadonlySet<string> = new Set(
    CONVERSATION_STATUSES
);

const isRecord = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
};

const isFiniteInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const isNullableString = (value: unknown): value is string | null =>
    value === null || typeof value === 'string';

const isConversationTargetType = (
    value: unknown
): value is ConversationTargetType =>
    typeof value === 'string' && CONVERSATION_TARGET_TYPE_SET.has(value);

const isConversationStatus = (value: unknown): value is ConversationStatus =>
    typeof value === 'string' && CONVERSATION_STATUS_SET.has(value);

const parseConversationAuthor = (
    value: unknown
): DiagramConversation['lastMessageAuthor'] | undefined => {
    if (value === null) {
        return null;
    }

    const identity = parseUserIdentityFromWebSocket(value);

    return identity === null ? undefined : identity;
};

const isTargetConsistent = (
    targetType: ConversationTargetType,
    targetId: unknown
): targetId is string | null => {
    if (targetType === 'diagram') {
        return targetId === null;
    }

    return typeof targetId === 'string' && targetId.length > 0;
};

const parseDiagramConversation = (
    value: unknown
): DiagramConversation | null => {
    if (!isRecord(value)) {
        return null;
    }

    const {
        id,
        diagramId,
        targetType,
        targetId,
        status,
        archivedAt,
        messageCount,
        lastMessageAt,
        lastMessageBody,
        lastMessageAuthor,
        createdAt,
        updatedAt,
    } = value;

    if (!isFiniteInteger(id) || !isFiniteInteger(diagramId)) {
        return null;
    }

    if (!isConversationTargetType(targetType)) {
        return null;
    }

    if (!isTargetConsistent(targetType, targetId)) {
        return null;
    }

    if (!isConversationStatus(status)) {
        return null;
    }

    if (!isNullableString(archivedAt)) {
        return null;
    }

    if (!isFiniteInteger(messageCount)) {
        return null;
    }

    if (!isNullableString(lastMessageAt)) {
        return null;
    }

    if (!isNullableString(lastMessageBody)) {
        return null;
    }

    const parsedLastMessageAuthor = parseConversationAuthor(lastMessageAuthor);

    if (parsedLastMessageAuthor === undefined) {
        return null;
    }

    if (!isNonEmptyString(createdAt) || !isNonEmptyString(updatedAt)) {
        return null;
    }

    return {
        id,
        diagramId,
        targetType,
        targetId,
        status,
        archivedAt,
        messageCount,
        lastMessageAt,
        lastMessageBody,
        lastMessageAuthor: parsedLastMessageAuthor,
        createdAt,
        updatedAt,
    };
};

const parseDiagramConversationMessage = (
    value: unknown
): DiagramConversationMessage | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { id, conversationId, body, user, createdAt, updatedAt } = value;

    if (!isFiniteInteger(id) || !isFiniteInteger(conversationId)) {
        return null;
    }

    if (typeof body !== 'string') {
        return null;
    }

    const parsedUser = parseConversationAuthor(user);

    if (parsedUser === undefined) {
        return null;
    }

    if (!isNonEmptyString(createdAt) || !isNonEmptyString(updatedAt)) {
        return null;
    }

    return {
        id,
        conversationId,
        body,
        user: parsedUser,
        createdAt,
        updatedAt,
    };
};

const parseDiagramConversationMutationPayload = (
    value: unknown
): DiagramConversationMutationPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { conversation, userId } = value;

    if (!isFiniteInteger(userId)) {
        return null;
    }

    const parsedConversation = parseDiagramConversation(conversation);

    if (parsedConversation === null) {
        return null;
    }

    return {
        conversation: parsedConversation,
        userId,
    };
};

export const parseDiagramConversationCreatedPayload = (
    value: unknown
): DiagramConversationCreatedPayload | null =>
    parseDiagramConversationMutationPayload(value);

export const parseDiagramConversationArchivedPayload = (
    value: unknown
): DiagramConversationArchivedPayload | null =>
    parseDiagramConversationMutationPayload(value);

export const parseDiagramConversationReopenedPayload = (
    value: unknown
): DiagramConversationReopenedPayload | null =>
    parseDiagramConversationMutationPayload(value);

export const parseDiagramConversationDeletedPayload = (
    value: unknown
): DiagramConversationDeletedPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { conversationId, diagramId, userId } = value;

    if (
        !isFiniteInteger(conversationId) ||
        !isFiniteInteger(diagramId) ||
        !isFiniteInteger(userId)
    ) {
        return null;
    }

    return {
        conversationId,
        diagramId,
        userId,
    };
};

const parseDiagramConversationMessageMutationPayload = (
    value: unknown
): DiagramConversationMessageMutationPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { message, conversation, userId } = value;

    if (!isFiniteInteger(userId)) {
        return null;
    }

    const parsedMessage = parseDiagramConversationMessage(message);
    const parsedConversation = parseDiagramConversation(conversation);

    if (parsedMessage === null || parsedConversation === null) {
        return null;
    }

    if (parsedMessage.conversationId !== parsedConversation.id) {
        return null;
    }

    return {
        message: parsedMessage,
        conversation: parsedConversation,
        userId,
    };
};

export const parseDiagramConversationMessageCreatedPayload = (
    value: unknown
): DiagramConversationMessageCreatedPayload | null =>
    parseDiagramConversationMessageMutationPayload(value);

export const parseDiagramConversationMessageUpdatedPayload = (
    value: unknown
): DiagramConversationMessageUpdatedPayload | null =>
    parseDiagramConversationMessageMutationPayload(value);

export const parseDiagramConversationMessageDeletedPayload = (
    value: unknown
): DiagramConversationMessageDeletedPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { messageId, conversationId, conversation, userId } = value;

    if (
        !isFiniteInteger(messageId) ||
        !isFiniteInteger(conversationId) ||
        !isFiniteInteger(userId)
    ) {
        return null;
    }

    const parsedConversation = parseDiagramConversation(conversation);

    if (
        parsedConversation === null ||
        parsedConversation.id !== conversationId
    ) {
        return null;
    }

    return {
        messageId,
        conversationId,
        conversation: parsedConversation,
        userId,
    };
};
