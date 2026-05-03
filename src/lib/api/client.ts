const API_BASE_URL = 'http://localhost:8000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions extends Omit<
    RequestInit,
    'method' | 'body' | 'headers'
> {
    method?: HttpMethod;
    data?: unknown;
    token?: string;
}

export class ApiError extends Error {
    readonly status: number;
    readonly payload: unknown;

    constructor(message: string, status: number, payload: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

const buildHeaders = (token?: string): HeadersInit => {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

const toApiPath = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const apiRequest = async <TResponse>(
    path: string,
    options: ApiRequestOptions = {}
): Promise<TResponse> => {
    const { method = 'GET', data, token, ...restOptions } = options;
    const response = await fetch(toApiPath(path), {
        ...restOptions,
        method,
        headers: buildHeaders(token),
        body: data === undefined ? undefined : JSON.stringify(data),
    });

    let payload: unknown = null;
    const responseText = await response.text();
    if (responseText) {
        try {
            payload = JSON.parse(responseText) as unknown;
        } catch {
            if (!response.ok) {
                throw new ApiError(
                    `API request failed with status ${response.status}`,
                    response.status,
                    responseText
                );
            }
        }
    }

    if (!response.ok) {
        const message =
            typeof payload === 'object' &&
            payload !== null &&
            'message' in payload &&
            typeof payload.message === 'string'
                ? payload.message
                : `API request failed with status ${response.status}`;

        throw new ApiError(message, response.status, payload);
    }

    return payload as TResponse;
};
