import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '../client';
import type { Diagram } from '@/lib/domain/diagram';
import type {
    DjangoExportFailure,
    DjangoExportSuccess,
} from '../django-export-types';

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('../client', async () => {
    const actual = (await vi.importActual('../client')) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

import { ApiError } from '../client';
import { exportDjangoProject } from '../django-export';

const sampleDiagram = {
    id: 'diagram-1',
    name: 'Sample',
    databaseType: 'postgresql',
    tables: [],
    relationships: [],
    customTypes: [],
} as unknown as Diagram;

const success: DjangoExportSuccess = {
    success: true,
    filename: 'sample-django.zip',
    files: [{ path: 'README.md', content: '# Sample' }],
    notes: [
        {
            code: 'schema_ignored_sqlite',
            message: 'SQLite ignored schema',
            path: 'users',
            metadata: { schema: 'ignored' },
        },
    ],
};

describe('django export API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        apiRequestMock.mockResolvedValue(success);
    });

    it('posts the canonical diagram to the Django export endpoint', async () => {
        const result = await exportDjangoProject({
            diagram: sampleDiagram,
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/exports/django', {
            method: 'POST',
            data: {
                diagram: sampleDiagram,
            },
        });
        expect(result).toEqual(success);
    });

    it('sends only the live diagram in the request body', async () => {
        await exportDjangoProject({ diagram: sampleDiagram });

        const data = apiRequestMock.mock.calls[0]?.[1]?.data as Record<
            string,
            unknown
        >;

        expect(Object.keys(data)).toEqual(['diagram']);
        expect(data.diagram).toBe(sampleDiagram);
    });

    it('does not send version, diagramId, provider, or options fields', async () => {
        await exportDjangoProject({ diagram: sampleDiagram });

        const data = apiRequestMock.mock.calls[0]?.[1]?.data as Record<
            string,
            unknown
        >;

        expect(data).not.toHaveProperty('version');
        expect(data).not.toHaveProperty('djangoVersion');
        expect(data).not.toHaveProperty('pythonVersion');
        expect(data).not.toHaveProperty('diagramId');
        expect(data).not.toHaveProperty('provider');
        expect(data).not.toHaveProperty('options');
        expect(data).not.toHaveProperty('zip');
        expect(data).not.toHaveProperty('persist');
        expect(data).not.toHaveProperty('connectionString');
        expect(data).not.toHaveProperty('credentials');
    });

    it('returns a typed success response including structured notes', async () => {
        const result = await exportDjangoProject({ diagram: sampleDiagram });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.filename).toBe('sample-django.zip');
            expect(result.files).toEqual(success.files);
            expect(result.notes).toEqual(success.notes);
            expect(result.notes[0]?.metadata).toEqual({ schema: 'ignored' });
        }
    });

    it('returns semantic HTTP 200 failures without treating them as transport errors', async () => {
        const failure: DjangoExportFailure = {
            success: false,
            error: {
                code: 'unsupported_database',
                message: 'Unsupported database',
                path: 'diagram.databaseType',
            },
        };
        apiRequestMock.mockResolvedValueOnce(failure);

        await expect(
            exportDjangoProject({ diagram: sampleDiagram })
        ).resolves.toEqual(failure);
        expect(apiRequestMock).toHaveBeenCalledTimes(1);
    });

    it('propagates HTTP 401 through standard ApiError behavior', async () => {
        const apiError = new ApiError('Unauthenticated', 401, {
            message: 'Unauthenticated',
        });
        apiRequestMock.mockRejectedValueOnce(apiError);

        await expect(
            exportDjangoProject({ diagram: sampleDiagram })
        ).rejects.toBe(apiError);
    });

    it('propagates HTTP 422 through standard ApiError behavior', async () => {
        const apiError = new ApiError('The diagram field is required.', 422, {
            message: 'The diagram field is required.',
        });
        apiRequestMock.mockRejectedValueOnce(apiError);

        await expect(
            exportDjangoProject({ diagram: sampleDiagram })
        ).rejects.toBe(apiError);
    });

    it('propagates HTTP 429 through standard ApiError behavior', async () => {
        const apiError = new ApiError('Too Many Requests', 429, {
            message: 'Too Many Requests',
        });
        apiRequestMock.mockRejectedValueOnce(apiError);

        await expect(
            exportDjangoProject({ diagram: sampleDiagram })
        ).rejects.toBe(apiError);
    });

    it('propagates HTTP 500 and network failures through standard ApiError/Error behavior', async () => {
        const serverError = new ApiError('Server Error', 500, {
            message: 'Server Error',
        });
        apiRequestMock.mockRejectedValueOnce(serverError);

        await expect(
            exportDjangoProject({ diagram: sampleDiagram })
        ).rejects.toBe(serverError);

        const networkError = new TypeError('Failed to fetch');
        apiRequestMock.mockRejectedValueOnce(networkError);

        await expect(
            exportDjangoProject({ diagram: sampleDiagram })
        ).rejects.toBe(networkError);
    });

    it('delegates credentials and CSRF handling to apiRequest', async () => {
        await exportDjangoProject({ diagram: sampleDiagram });

        expect(apiRequestMock).toHaveBeenCalledTimes(1);
        expect(apiRequestMock.mock.calls[0]?.[1]).toEqual({
            method: 'POST',
            data: { diagram: sampleDiagram },
        });
    });
});
