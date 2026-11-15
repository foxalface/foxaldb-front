import { ApiError } from './client';

export interface AppApiFieldIssue {
    code: string | null;
    message: string;
}

export interface AppApiError {
    status: number;
    code: string;
    message: string;
    fields: Record<string, AppApiFieldIssue[]>;
    retryable: boolean;
}

const STATUS_CODES: Record<number, string> = {
    401: 'unauthenticated',
    403: 'forbidden',
    404: 'not_found',
    409: 'conflict',
    419: 'session_expired',
    422: 'validation_failed',
    429: 'too_many_requests',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const statusCode = (status: number): string => {
    if (status >= 500) {
        return 'server';
    }

    return STATUS_CODES[status] ?? 'generic';
};

const isRetryable = (status: number, code: string): boolean =>
    code === 'network' || status === 429 || status >= 500;

const readMessage = (payload: Record<string, unknown> | null): string => {
    if (payload !== null && typeof payload.message === 'string') {
        return payload.message;
    }

    return '';
};

const readMachineFields = (
    payload: Record<string, unknown>
): Record<string, AppApiFieldIssue[]> => {
    const rawFields = payload.fields;
    if (!isRecord(rawFields)) {
        return {};
    }

    const fields: Record<string, AppApiFieldIssue[]> = {};

    for (const [name, value] of Object.entries(rawFields)) {
        if (!Array.isArray(value)) {
            continue;
        }

        const issues: AppApiFieldIssue[] = [];
        for (const entry of value) {
            if (!isRecord(entry) || typeof entry.message !== 'string') {
                continue;
            }

            issues.push({
                code: typeof entry.code === 'string' ? entry.code : null,
                message: entry.message,
            });
        }

        if (issues.length > 0) {
            fields[name] = issues;
        }
    }

    return fields;
};

const readLegacyFields = (
    payload: Record<string, unknown>,
    fields: Record<string, AppApiFieldIssue[]>
): Record<string, AppApiFieldIssue[]> => {
    const rawErrors = payload.errors;
    if (!isRecord(rawErrors)) {
        return fields;
    }

    const next = { ...fields };

    for (const [name, value] of Object.entries(rawErrors)) {
        if (next[name] !== undefined || !Array.isArray(value)) {
            continue;
        }

        const issues: AppApiFieldIssue[] = [];
        for (const entry of value) {
            if (typeof entry === 'string') {
                issues.push({ code: null, message: entry });
            }
        }

        if (issues.length > 0) {
            next[name] = issues;
        }
    }

    return next;
};

const fromApiError = (error: ApiError): AppApiError => {
    const payload = isRecord(error.payload) ? error.payload : null;
    const fields =
        payload === null
            ? {}
            : readLegacyFields(payload, readMachineFields(payload));
    const code =
        payload !== null &&
        typeof payload.code === 'string' &&
        payload.code !== ''
            ? payload.code
            : statusCode(error.status);

    return {
        status: error.status,
        code,
        message: readMessage(payload),
        fields,
        retryable: isRetryable(error.status, code),
    };
};

const networkError = (message: string): AppApiError => ({
    status: 0,
    code: 'network',
    message,
    fields: {},
    retryable: true,
});

const genericError = (message: string): AppApiError => ({
    status: 0,
    code: 'generic',
    message,
    fields: {},
    retryable: false,
});

export const normalizeApiError = (error: unknown): AppApiError => {
    if (error instanceof ApiError) {
        return fromApiError(error);
    }

    if (error instanceof TypeError) {
        return networkError(error.message);
    }

    if (error instanceof Error) {
        return genericError(error.message);
    }

    return genericError('');
};
