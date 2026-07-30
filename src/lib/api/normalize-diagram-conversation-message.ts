import type { DiagramConversationMessage } from '@/lib/conversations/conversation-types';
import { parseUserIdentityFromHttp } from '@/lib/user';
import type { DiagramConversationMessageDto } from './diagram-conversations';

const isFiniteInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const invalidPayload = (detail: string): Error =>
    new Error(`Invalid diagram conversation message payload: ${detail}`);

/**
 * Converts a backend HTTP snake_case message DTO to the camelCase domain model.
 * Throws when the payload is structurally invalid at the API boundary.
 */
export const normalizeDiagramConversationMessageFromApi = (
    message: DiagramConversationMessageDto
): DiagramConversationMessage => {
    if (!isFiniteInteger(message.id)) {
        throw invalidPayload('id must be a finite integer');
    }

    if (!isFiniteInteger(message.conversation_id)) {
        throw invalidPayload('conversation_id must be a finite integer');
    }

    if (typeof message.body !== 'string') {
        throw invalidPayload('body must be a string');
    }

    let user: DiagramConversationMessage['user'] = null;

    if (message.user !== null) {
        const parsedUser = parseUserIdentityFromHttp(message.user);

        if (parsedUser === null) {
            throw invalidPayload('user is malformed');
        }

        user = parsedUser;
    }

    if (!isNonEmptyString(message.created_at)) {
        throw invalidPayload('created_at must be a non-empty string');
    }

    if (!isNonEmptyString(message.updated_at)) {
        throw invalidPayload('updated_at must be a non-empty string');
    }

    return {
        id: message.id,
        conversationId: message.conversation_id,
        body: message.body,
        user,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
    };
};
