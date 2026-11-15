import { normalizeApiError } from '@/lib/api/normalize-api-error';

export type ConversationTargetMutationErrorKey =
    | 'validation'
    | 'forbidden'
    | 'not_found'
    | 'conflict'
    | 'generic';

export interface ConversationTargetMutationError {
    key: ConversationTargetMutationErrorKey;
}

export const resolveConversationTargetMutationError = (
    error: unknown
): ConversationTargetMutationError => {
    const apiError = normalizeApiError(error);

    if (apiError.code === 'validation_failed') {
        return { key: 'validation' };
    }

    if (apiError.code === 'forbidden') {
        return { key: 'forbidden' };
    }

    if (apiError.code === 'not_found') {
        return { key: 'not_found' };
    }

    if (apiError.code === 'conflict') {
        return { key: 'conflict' };
    }

    return { key: 'generic' };
};
