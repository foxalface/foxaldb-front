import { ApiError } from './client';

const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export type LaravelVersion = '10' | '11' | '12' | '13';

export const LARAVEL_VERSIONS: LaravelVersion[] = ['10', '11', '12', '13'];

export const DEFAULT_LARAVEL_VERSION: LaravelVersion = '13';

export interface LaravelMigrationExportRequest {
    laravelVersion: LaravelVersion;
    includeIndexes?: boolean;
    includeForeignKeys?: boolean;
}

const getXsrfToken = (): string | undefined => {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
};

const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        Accept: 'application/zip',
        'Content-Type': 'application/json',
    };

    const xsrfToken = getXsrfToken();
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    return headers;
};

export const exportLaravelMigrations = async (
    diagramId: string | number,
    payload: LaravelMigrationExportRequest
): Promise<Blob> => {
    const response = await fetch(
        `${API_BASE_URL}/diagrams/${diagramId}/export/laravel-migrations`,
        {
            method: 'POST',
            headers: buildHeaders(),
            credentials: 'include',
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const responseText = await response.text();
        let errorPayload: unknown = responseText;

        try {
            errorPayload = JSON.parse(responseText) as unknown;
        } catch {
            // Keep raw response text for non-JSON error payloads.
        }

        const message =
            typeof errorPayload === 'object' &&
            errorPayload !== null &&
            'message' in errorPayload &&
            typeof errorPayload.message === 'string'
                ? errorPayload.message
                : `API request failed with status ${response.status}`;

        throw new ApiError(message, response.status, errorPayload);
    }

    return response.blob();
};
