import type { LaravelVersion } from '@/lib/api/diagram-laravel-export';
import type { LaravelMigrationSchemaDiff } from '@/types/laravel-migration';
import { ApiError } from './client';

const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

interface LaravelMigrationDiffResponse {
    diff: LaravelMigrationSchemaDiff;
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

const parseDiffResponse = async (
    response: Response
): Promise<LaravelMigrationSchemaDiff> => {
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

    const data = payload as LaravelMigrationDiffResponse;

    return data.diff;
};

export const compareLaravelMigrationArchives = async (
    beforeFile: File,
    afterFile: File
): Promise<LaravelMigrationSchemaDiff> => {
    const formData = new FormData();
    formData.append('before_archive', beforeFile);
    formData.append('after_archive', afterFile);

    const response = await fetch(`${API_BASE_URL}/laravel-migrations/diff`, {
        method: 'POST',
        headers: buildHeaders(),
        credentials: 'include',
        body: formData,
    });

    return parseDiffResponse(response);
};

export const compareDiagramToLaravelMigrationArchive = async (
    diagramId: string | number,
    payload: {
        archive: File;
        content: unknown;
        laravelVersion: LaravelVersion;
        includeIndexes?: boolean;
        includeForeignKeys?: boolean;
    }
): Promise<LaravelMigrationSchemaDiff> => {
    const formData = new FormData();
    formData.append('archive', payload.archive);
    formData.append('content', JSON.stringify(payload.content));
    formData.append('laravelVersion', payload.laravelVersion);

    if (payload.includeIndexes !== undefined) {
        formData.append('includeIndexes', payload.includeIndexes ? '1' : '0');
    }

    if (payload.includeForeignKeys !== undefined) {
        formData.append(
            'includeForeignKeys',
            payload.includeForeignKeys ? '1' : '0'
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/diagrams/${diagramId}/laravel-migrations/diff`,
        {
            method: 'POST',
            headers: buildHeaders(),
            credentials: 'include',
            body: formData,
        }
    );

    return parseDiffResponse(response);
};
