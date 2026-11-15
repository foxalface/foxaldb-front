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
