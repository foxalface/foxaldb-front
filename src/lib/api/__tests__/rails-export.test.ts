import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '../client';
import type { Diagram } from '@/lib/domain/diagram';
import type {
    RailsExportFailure,
    RailsExportSuccess,
} from '../rails-export-types';

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
import { exportRailsProject } from '../rails-export';

const sampleDiagram = {
    id: 'diagram-1',
    name: 'Sample',
    databaseType: 'postgresql',
    tables: [],
    relationships: [],
    customTypes: [],
} as unknown as Diagram;

const success: RailsExportSuccess = {
    success: true,
    filename: 'sample-rails.zip',
    files: [{ path: 'README.md', content: '# Sample' }],
    notes: [],
};

describe('rails export API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        apiRequestMock.mockResolvedValue(success);
    });

    it('posts the canonical diagram to the Rails export endpoint', async () => {
        const result = await exportRailsProject({
            diagram: sampleDiagram,
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/exports/rails', {
            method: 'POST',
            data: {
                diagram: sampleDiagram,
            },
        });
        expect(result).toEqual(success);
    });

    it('sends only the live diagram in the request body', async () => {
        await exportRailsProject({ diagram: sampleDiagram });

        const data = apiRequestMock.mock.calls[0]?.[1]?.data as Record<
            string,
            unknown
        >;

        expect(Object.keys(data)).toEqual(['diagram']);
        expect(data.diagram).toBe(sampleDiagram);
    });

    it('does not send version, diagramId, namespace, or options fields', async () => {
        await exportRailsProject({ diagram: sampleDiagram });

        const data = apiRequestMock.mock.calls[0]?.[1]?.data as Record<
            string,
            unknown
        >;

        expect(data).not.toHaveProperty('version');
        expect(data).not.toHaveProperty('diagramId');
        expect(data).not.toHaveProperty('namespace');
        expect(data).not.toHaveProperty('applicationName');
        expect(data).not.toHaveProperty('dbContextName');
        expect(data).not.toHaveProperty('connectionString');
        expect(data).not.toHaveProperty('credentials');
        expect(data).not.toHaveProperty('options');
        expect(data).not.toHaveProperty('provider');
    });

    it('returns a typed success response', async () => {
        const result = await exportRailsProject({ diagram: sampleDiagram });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.filename).toBe('sample-rails.zip');
            expect(result.files).toEqual(success.files);
            expect(result.notes).toEqual([]);
        }
    });

    it('returns semantic HTTP 200 failures without treating them as transport errors', async () => {
        const failure: RailsExportFailure = {
            success: false,
            error: {
                code: 'unsupported_database',
                message: 'Unsupported database',
                path: 'diagram.databaseType',
            },
        };
        apiRequestMock.mockResolvedValueOnce(failure);

        await expect(
            exportRailsProject({ diagram: sampleDiagram })
        ).resolves.toEqual(failure);
        expect(apiRequestMock).toHaveBeenCalledTimes(1);
    });

    it('propagates HTTP 401 through standard ApiError behavior', async () => {
        const apiError = new ApiError('Unauthenticated', 401, {
            message: 'Unauthenticated',
        });
        apiRequestMock.mockRejectedValueOnce(apiError);

        await expect(
            exportRailsProject({ diagram: sampleDiagram })
        ).rejects.toBe(apiError);
    });

    it('propagates HTTP 422 through standard ApiError behavior', async () => {
        const apiError = new ApiError('The diagram field is required.', 422, {
            message: 'The diagram field is required.',
        });
        apiRequestMock.mockRejectedValueOnce(apiError);

        await expect(
            exportRailsProject({ diagram: sampleDiagram })
        ).rejects.toBe(apiError);
    });

    it('propagates HTTP 429 through standard ApiError behavior', async () => {
        const apiError = new ApiError('Too Many Requests', 429, {
            message: 'Too Many Requests',
        });
        apiRequestMock.mockRejectedValueOnce(apiError);

        await expect(
            exportRailsProject({ diagram: sampleDiagram })
        ).rejects.toBe(apiError);
    });

    it('propagates HTTP 500 and network failures through standard ApiError/Error behavior', async () => {
        const serverError = new ApiError('Server Error', 500, {
            message: 'Server Error',
        });
        apiRequestMock.mockRejectedValueOnce(serverError);

        await expect(
            exportRailsProject({ diagram: sampleDiagram })
        ).rejects.toBe(serverError);

        const networkError = new TypeError('Failed to fetch');
        apiRequestMock.mockRejectedValueOnce(networkError);

        await expect(
            exportRailsProject({ diagram: sampleDiagram })
        ).rejects.toBe(networkError);
    });

    it('delegates credentials and CSRF handling to apiRequest', async () => {
        await exportRailsProject({ diagram: sampleDiagram });

        expect(apiRequestMock).toHaveBeenCalledTimes(1);
        expect(apiRequestMock.mock.calls[0]?.[1]).toEqual({
            method: 'POST',
            data: { diagram: sampleDiagram },
        });
    });
});
