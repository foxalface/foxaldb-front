import { ApiError } from './client';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export const readApiErrorCode = (error: unknown): string | null => {
    if (!(error instanceof ApiError) || !isRecord(error.payload)) {
        return null;
    }

    return typeof error.payload.code === 'string' ? error.payload.code : null;
};

export const readRecoverableUntil = (error: unknown): string | null => {
    if (!(error instanceof ApiError) || !isRecord(error.payload)) {
        return null;
    }

    return typeof error.payload.recoverable_until === 'string'
        ? error.payload.recoverable_until
        : null;
};

export const parseLaravelValidationErrors = (
    error: unknown
): Partial<Record<string, string>> => {
    if (!(error instanceof ApiError)) {
        return {};
    }

    const payload = error.payload;
    if (!isRecord(payload) || !('errors' in payload)) {
        return {};
    }

    const { errors } = payload;
    if (!isRecord(errors)) {
        return {};
    }

    const result: Partial<Record<string, string>> = {};

    for (const [field, value] of Object.entries(errors)) {
        if (Array.isArray(value) && value.length > 0) {
            const first = value[0];
            if (typeof first === 'string') {
                result[field] = first;
            }
        }
    }

    return result;
};
