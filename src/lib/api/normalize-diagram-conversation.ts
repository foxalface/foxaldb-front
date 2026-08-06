import {
    CONVERSATION_STATUSES,
    CONVERSATION_TARGET_TYPES,
    type ConversationStatus,
    type ConversationTargetType,
    type DiagramConversation,
} from '@/lib/conversations/conversation-types';
import { parseUserIdentityFromHttp } from '@/lib/user';
import type { DiagramConversationDto } from './diagram-conversations';

const CONVERSATION_TARGET_TYPE_SET: ReadonlySet<string> = new Set(
    CONVERSATION_TARGET_TYPES
);

const CONVERSATION_STATUS_SET: ReadonlySet<string> = new Set(
    CONVERSATION_STATUSES
);

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

const isTargetConsistent = (
    targetType: ConversationTargetType,
    targetId: unknown
): targetId is string | null => {
    if (targetType === 'diagram') {
        return targetId === null;
    }

    return typeof targetId === 'string' && targetId.length > 0;
};

const invalidPayload = (detail: string): Error =>
    new Error(`Invalid diagram conversation payload: ${detail}`);

/**
 * Converts a backend HTTP snake_case conversation DTO to the camelCase domain model.
 * Throws when the payload is structurally invalid at the API boundary.
 */
export const normalizeDiagramConversationFromApi = (
    conversation: DiagramConversationDto
): DiagramConversation => {
    if (!isFiniteInteger(conversation.id)) {
        throw invalidPayload('id must be a finite integer');
    }

    if (!isFiniteInteger(conversation.diagram_id)) {
        throw invalidPayload('diagram_id must be a finite integer');
    }

    if (!isConversationTargetType(conversation.target_type)) {
        throw invalidPayload('target_type is invalid');
    }

    if (!isTargetConsistent(conversation.target_type, conversation.target_id)) {
        throw invalidPayload('target_id is inconsistent with target_type');
    }

    if (!isConversationStatus(conversation.status)) {
        throw invalidPayload('status is invalid');
    }

    if (!isNullableString(conversation.archived_at)) {
        throw invalidPayload('archived_at must be a string or null');
    }

    if (!isFiniteInteger(conversation.message_count)) {
        throw invalidPayload('message_count must be a finite integer');
    }

    if (!isNullableString(conversation.last_message_at)) {
        throw invalidPayload('last_message_at must be a string or null');
    }

    if (!isNullableString(conversation.last_message_body)) {
        throw invalidPayload('last_message_body must be a string or null');
    }

    let lastMessageAuthor: DiagramConversation['lastMessageAuthor'] = null;

    if (conversation.last_message_author !== null) {
        const parsedAuthor = parseUserIdentityFromHttp(
            conversation.last_message_author
        );

        if (parsedAuthor === null) {
            throw invalidPayload('last_message_author is malformed');
        }

        lastMessageAuthor = parsedAuthor;
    }

    if (!isNonEmptyString(conversation.created_at)) {
        throw invalidPayload('created_at must be a non-empty string');
    }

    if (!isNonEmptyString(conversation.updated_at)) {
        throw invalidPayload('updated_at must be a non-empty string');
    }

    return {
        id: conversation.id,
        diagramId: conversation.diagram_id,
        targetType: conversation.target_type,
        targetId: conversation.target_id,
        status: conversation.status,
        archivedAt: conversation.archived_at,
        messageCount: conversation.message_count,
        lastMessageAt: conversation.last_message_at,
        lastMessageBody: conversation.last_message_body,
        lastMessageAuthor,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
    };
};
