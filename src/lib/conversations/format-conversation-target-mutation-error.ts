import { ApiError } from '@/lib/api/client';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';

export type ConversationTargetMutationErrorKey =
    | 'validation'
    | 'forbidden'
    | 'not_found'
    | 'conflict'
    | 'generic';

export interface ConversationTargetMutationError {
    key: ConversationTargetMutationErrorKey;
    fieldError?: string;
}

export const resolveConversationTargetMutationError = (
    error: unknown
): ConversationTargetMutationError => {
    if (!(error instanceof ApiError)) {
        return { key: 'generic' };
    }

    if (error.status === 422) {
        const validationErrors = parseLaravelValidationErrors(error);
        const targetTypeError = validationErrors.target_type;
        const targetIdError = validationErrors.target_id;
        const fieldError =
            (typeof targetTypeError === 'string' && targetTypeError.length > 0
                ? targetTypeError
                : undefined) ??
            (typeof targetIdError === 'string' && targetIdError.length > 0
                ? targetIdError
                : undefined);

        return {
            key: 'validation',
            fieldError,
        };
    }

    if (error.status === 403) {
        return { key: 'forbidden' };
    }

    if (error.status === 404) {
        return { key: 'not_found' };
    }

    if (error.status === 409) {
        return { key: 'conflict' };
    }

    return { key: 'generic' };
};
