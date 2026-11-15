import { normalizeApiError } from '@/lib/api/normalize-api-error';

export type ConversationReactionMutationErrorKey =
    | 'invalid_emoji'
    | 'forbidden'
    | 'archived'
    | 'not_found'
    | 'generic';

export interface ConversationReactionMutationError {
    key: ConversationReactionMutationErrorKey;
}

export const resolveConversationReactionMutationError = (
    error: unknown
): ConversationReactionMutationError => {
    const apiError = normalizeApiError(error);

    if (apiError.code === 'validation_failed') {
        return { key: 'invalid_emoji' };
    }

    if (apiError.code === 'forbidden') {
        return { key: 'forbidden' };
    }

    if (apiError.code === 'conflict') {
        return { key: 'archived' };
    }

    if (apiError.code === 'not_found') {
        return { key: 'not_found' };
    }

    return { key: 'generic' };
};

export const resolveConversationReactionMutationErrorKey = (
    key: ConversationReactionMutationErrorKey
): string => {
    switch (key) {
        case 'invalid_emoji':
            return 'side_panel.conversations_section.detail.message.reactions.errors.invalid_emoji';
        case 'forbidden':
            return 'side_panel.conversations_section.detail.message.reactions.errors.forbidden';
        case 'archived':
            return 'side_panel.conversations_section.detail.message.reactions.errors.archived';
        case 'not_found':
            return 'side_panel.conversations_section.detail.message.reactions.errors.not_found';
        default:
            return 'side_panel.conversations_section.detail.message.reactions.errors.generic';
    }
};
