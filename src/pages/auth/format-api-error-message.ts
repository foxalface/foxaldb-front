import { ApiError } from '@/lib/api/client';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const getFirstLaravelValidationMessage = (payload: unknown): string | null => {
    if (!isRecord(payload) || !('errors' in payload)) {
        return null;
    }
    const { errors } = payload;
    if (!isRecord(errors)) {
        return null;
    }
    for (const value of Object.values(errors)) {
        if (Array.isArray(value) && value.length > 0) {
            const first = value[0];
            if (typeof first === 'string') {
                return first;
            }
        }
    }
    return null;
};

export const formatApiErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        const fromValidation = getFirstLaravelValidationMessage(error.payload);
        if (fromValidation !== null) {
            return fromValidation;
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Something went wrong';
};
