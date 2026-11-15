import { normalizeApiError } from '@/lib/api/normalize-api-error';

export type ConversationMessageMutationErrorKey =
    | 'validation'
    | 'forbidden'
    | 'archived'
    | 'not_found'
    | 'generic';

export interface ConversationMessageMutationError {
    key: ConversationMessageMutationErrorKey;
}

export const resolveConversationMessageMutationError = (
    error: unknown
): ConversationMessageMutationError => {
    const apiError = normalizeApiError(error);

    if (apiError.code === 'validation_failed') {
        return { key: 'validation' };
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
