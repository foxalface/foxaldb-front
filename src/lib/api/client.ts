const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export const BACKEND_URL: string =
    import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions extends Omit<RequestInit, 'method' | 'body'> {
    method?: HttpMethod;
    data?: unknown;
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

const getXsrfToken = (): string | undefined => {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
};

const buildHeaders = (
    hasBody: boolean,
    caller?: HeadersInit
): Record<string, string> => {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (hasBody) {
        headers['Content-Type'] = 'application/json';
    }

    const xsrfToken = getXsrfToken();
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    if (caller) {
        const entries =
            caller instanceof Headers
                ? Array.from(caller.entries())
                : Array.isArray(caller)
                  ? caller
                  : Object.entries(caller);

        for (const [key, value] of entries) {
            headers[key] = value;
        }
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
    const { method = 'GET', data, headers, ...restOptions } = options;
    const body = data === undefined ? undefined : JSON.stringify(data);
    const response = await fetch(toApiPath(path), {
        ...restOptions,
        method,
        headers: buildHeaders(body !== undefined, headers),
        credentials: 'include',
        body,
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
