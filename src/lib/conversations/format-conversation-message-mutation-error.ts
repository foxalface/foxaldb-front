import { ApiError } from '@/lib/api/client';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';

export type ConversationMessageMutationErrorKey =
    | 'validation'
    | 'forbidden'
    | 'archived'
    | 'not_found'
    | 'generic';

export interface ConversationMessageMutationError {
    key: ConversationMessageMutationErrorKey;
    fieldError?: string;
}

export const resolveConversationMessageMutationError = (
    error: unknown
): ConversationMessageMutationError => {
    if (!(error instanceof ApiError)) {
        return { key: 'generic' };
    }

    if (error.status === 422) {
        const validationErrors = parseLaravelValidationErrors(error);
        const bodyError = validationErrors.body;
        return {
            key: 'validation',
            fieldError:
                typeof bodyError === 'string' && bodyError.length > 0
                    ? bodyError
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
