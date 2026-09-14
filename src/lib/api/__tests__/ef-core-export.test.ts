import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '../client';
import type { Diagram } from '@/lib/domain/diagram';
import type {
    EfCoreExportFailureResponse,
    EfCoreExportSuccessResponse,
} from '../ef-core-export-types';

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
import { exportEfCoreProject } from '../ef-core-export';

const sampleDiagram = {
    id: 'diagram-1',
    name: 'Sample',
    databaseType: 'postgresql',
} as Diagram;

const success: EfCoreExportSuccessResponse = {
    success: true,
    filename: 'sample-ef-core.zip',
    files: [{ path: 'README.md', content: '# Sample' }],
    notes: [],
};

describe('ef core export API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        apiRequestMock.mockResolvedValue(success);
    });

    it('posts the canonical diagram to the EF Core export endpoint', async () => {
        const result = await exportEfCoreProject({
            diagram: sampleDiagram,
            namespace: 'Acme.Catalog',
            dbContextName: 'CatalogDbContext',
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/exports/ef-core', {
            method: 'POST',
            data: {
                diagram: sampleDiagram,
                namespace: 'Acme.Catalog',
                dbContextName: 'CatalogDbContext',
            },
        });
        expect(result).toEqual(success);
    });

    it('omits namespace when empty or whitespace', async () => {
        await exportEfCoreProject({
            diagram: sampleDiagram,
            namespace: '   ',
            dbContextName: 'CatalogDbContext',
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/exports/ef-core', {
            method: 'POST',
            data: {
                diagram: sampleDiagram,
                dbContextName: 'CatalogDbContext',
            },
        });
    });

    it('omits DbContext when empty or whitespace', async () => {
        await exportEfCoreProject({
            diagram: sampleDiagram,
            namespace: 'Acme.Catalog',
            dbContextName: '',
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/exports/ef-core', {
            method: 'POST',
            data: {
                diagram: sampleDiagram,
                namespace: 'Acme.Catalog',
            },
        });
    });

    it('omits both optional identifiers when they are blank', async () => {
        await exportEfCoreProject({
            diagram: sampleDiagram,
            namespace: '',
            dbContextName: '  ',
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/exports/ef-core', {
            method: 'POST',
            data: {
                diagram: sampleDiagram,
            },
        });
    });

    it('does not send version, provider, or connectionString fields', async () => {
        await exportEfCoreProject({
            diagram: sampleDiagram,
            namespace: 'Acme.Catalog',
            dbContextName: 'CatalogDbContext',
        });

        const data = apiRequestMock.mock.calls[0]?.[1]?.data as Record<
            string,
            unknown
        >;

        expect(data).not.toHaveProperty('version');
        expect(data).not.toHaveProperty('provider');
        expect(data).not.toHaveProperty('connectionString');
        expect(data).not.toHaveProperty('diagramId');
        expect(data).not.toHaveProperty('artifact');
    });

    it('returns semantic HTTP 200 failures without treating them as transport errors', async () => {
        const failure: EfCoreExportFailureResponse = {
            success: false,
            error: {
                code: 'unsupported_database',
                message: 'Unsupported database',
                path: 'diagram.databaseType',
            },
        };
        apiRequestMock.mockResolvedValueOnce(failure);

        await expect(
            exportEfCoreProject({ diagram: sampleDiagram })
        ).resolves.toEqual(failure);
        expect(apiRequestMock).toHaveBeenCalledTimes(1);
    });

    it('propagates HTTP 429 through standard ApiError behavior', async () => {
        const apiError = new ApiError('Too Many Requests', 429, {
            message: 'Too Many Requests',
        });
        apiRequestMock.mockRejectedValueOnce(apiError);

        await expect(
            exportEfCoreProject({ diagram: sampleDiagram })
        ).rejects.toBe(apiError);
    });

    it('delegates credentials and CSRF handling to apiRequest', async () => {
        await exportEfCoreProject({ diagram: sampleDiagram });

        expect(apiRequestMock).toHaveBeenCalledTimes(1);
        expect(apiRequestMock.mock.calls[0]?.[1]).toEqual({
            method: 'POST',
            data: { diagram: sampleDiagram },
        });
    });
});
