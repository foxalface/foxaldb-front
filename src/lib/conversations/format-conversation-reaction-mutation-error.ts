import { ApiError } from '@/lib/api/client';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';

export type ConversationReactionMutationErrorKey =
    | 'invalid_emoji'
    | 'forbidden'
    | 'archived'
    | 'not_found'
    | 'generic';

export interface ConversationReactionMutationError {
    key: ConversationReactionMutationErrorKey;
    fieldError?: string;
}

export const resolveConversationReactionMutationError = (
    error: unknown
): ConversationReactionMutationError => {
    if (!(error instanceof ApiError)) {
        return { key: 'generic' };
    }

    if (error.status === 422) {
        const validationErrors = parseLaravelValidationErrors(error);
        const emojiError = validationErrors.emoji;
        return {
            key: 'invalid_emoji',
            fieldError:
                typeof emojiError === 'string' && emojiError.length > 0
                    ? emojiError
                    : undefined,
        };
    }

    if (error.status === 403) {
        return { key: 'forbidden' };
    }

    if (error.status === 409) {
        return { key: 'archived' };
    }

    if (error.status === 404) {
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
