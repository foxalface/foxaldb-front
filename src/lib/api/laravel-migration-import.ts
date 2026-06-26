import { ApiError } from './client';
import type { LaravelMigrationSchemaSnapshot } from '@/types/laravel-migration';

const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export const LARAVEL_MIGRATION_ARCHIVE_MAX_BYTES = 5 * 1024 * 1024;

interface LaravelMigrationImportResponse {
    snapshot: LaravelMigrationSchemaSnapshot;
}

const getXsrfToken = (): string | undefined => {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
};

const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const xsrfToken = getXsrfToken();
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    return headers;
};

export const uploadLaravelMigrationArchive = async (
    file: File
): Promise<LaravelMigrationSchemaSnapshot> => {
    const formData = new FormData();
    formData.append('archive', file);

    const response = await fetch(`${API_BASE_URL}/laravel-migrations/import`, {
        method: 'POST',
        headers: buildHeaders(),
        credentials: 'include',
        body: formData,
    });

    const responseText = await response.text();
    let payload: unknown = null;

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

    const data = payload as LaravelMigrationImportResponse;

    return data.snapshot;
};
