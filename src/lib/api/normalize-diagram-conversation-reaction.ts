import type {
    ConversationAuthor,
    ConversationReactionAggregate,
} from '@/lib/conversations/conversation-types';
import {
    parseUserIdentityFromHttp,
    parseUserIdentityFromWebSocket,
} from '@/lib/user';
import type { UserIdentityHttpDto } from '@/lib/user';

export interface ConversationReactionAggregateHttpDto {
    emoji: string;
    count: number;
    reacted_by_me: boolean;
    preview_users: Array<UserIdentityHttpDto | null>;
    preview_truncated: boolean;
}

export interface ConversationReactionAggregateWebSocketDto {
    emoji: string;
    count: number;
    previewUsers: Array<{
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
    } | null>;
    previewTruncated: boolean;
}

const isFiniteInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const invalidPayload = (detail: string): Error =>
    new Error(`Invalid diagram conversation reaction payload: ${detail}`);

const parsePreviewUsersFromHttp = (
    value: unknown
): Array<ConversationAuthor | null> | null => {
    if (!Array.isArray(value)) {
        return null;
    }

    const previewUsers: Array<ConversationAuthor | null> = [];

    for (const entry of value) {
        if (entry === null) {
            previewUsers.push(null);
            continue;
        }

        const parsed = parseUserIdentityFromHttp(entry);

        if (parsed === null) {
            return null;
        }

        previewUsers.push(parsed);
    }

    return previewUsers;
};

const parsePreviewUsersFromWebSocket = (
    value: unknown
): Array<ConversationAuthor | null> | null => {
    if (!Array.isArray(value)) {
        return null;
    }

    const previewUsers: Array<ConversationAuthor | null> = [];

    for (const entry of value) {
        if (entry === null) {
            previewUsers.push(null);
            continue;
        }

        const parsed = parseUserIdentityFromWebSocket(entry);

        if (parsed === null) {
            return null;
        }

        previewUsers.push(parsed);
    }

    return previewUsers;
};

export const normalizeConversationReactionAggregateFromHttp = (
    aggregate: ConversationReactionAggregateHttpDto
): ConversationReactionAggregate => {
    if (!isNonEmptyString(aggregate.emoji)) {
        throw invalidPayload('emoji must be a non-empty string');
    }

    if (!isFiniteInteger(aggregate.count) || aggregate.count < 0) {
        throw invalidPayload('count must be a non-negative integer');
    }

    if (typeof aggregate.reacted_by_me !== 'boolean') {
        throw invalidPayload('reacted_by_me must be a boolean');
    }

    const previewUsers = parsePreviewUsersFromHttp(aggregate.preview_users);

    if (previewUsers === null) {
        throw invalidPayload('preview_users is malformed');
    }

    if (typeof aggregate.preview_truncated !== 'boolean') {
        throw invalidPayload('preview_truncated must be a boolean');
    }

    return {
        emoji: aggregate.emoji,
        count: aggregate.count,
        reactedByMe: aggregate.reacted_by_me,
        previewUsers,
        previewTruncated: aggregate.preview_truncated,
    };
};

export const normalizeConversationReactionAggregatesFromHttp = (
    reactions: unknown
): ConversationReactionAggregate[] => {
    if (!Array.isArray(reactions)) {
        throw invalidPayload('reactions must be an array');
    }

    return reactions.map((reaction) =>
        normalizeConversationReactionAggregateFromHttp(
            reaction as ConversationReactionAggregateHttpDto
        )
    );
};

export const normalizeConversationReactionAggregateFromWebSocket = (
    aggregate: ConversationReactionAggregateWebSocketDto
): Omit<ConversationReactionAggregate, 'reactedByMe'> => {
    if (!isNonEmptyString(aggregate.emoji)) {
        throw invalidPayload('emoji must be a non-empty string');
    }

    if (!isFiniteInteger(aggregate.count) || aggregate.count < 0) {
        throw invalidPayload('count must be a non-negative integer');
    }

    const previewUsers = parsePreviewUsersFromWebSocket(aggregate.previewUsers);

    if (previewUsers === null) {
        throw invalidPayload('previewUsers is malformed');
    }

    if (typeof aggregate.previewTruncated !== 'boolean') {
        throw invalidPayload('previewTruncated must be a boolean');
    }

    return {
        emoji: aggregate.emoji,
        count: aggregate.count,
        previewUsers,
        previewTruncated: aggregate.previewTruncated,
    };
};

export const normalizeConversationReactionAggregatesFromWebSocket = (
    reactions: unknown
): Array<Omit<ConversationReactionAggregate, 'reactedByMe'>> => {
    if (!Array.isArray(reactions)) {
        throw invalidPayload('reactions must be an array');
    }

    return reactions.map((reaction) =>
        normalizeConversationReactionAggregateFromWebSocket(
            reaction as ConversationReactionAggregateWebSocketDto
        )
    );
};
