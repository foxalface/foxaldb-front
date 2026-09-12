import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '../client';
import type { Diagram } from '@/lib/domain/diagram';
import type {
    PrismaExportFailure,
    PrismaExportSuccess,
} from '../prisma-export-types';

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
import { exportPrismaSchema } from '../prisma-export';

const sampleDiagram = {
    id: 'diagram-1',
    name: 'Sample',
    databaseType: 'postgresql',
} as Diagram;

describe('prisma export API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
    });

    it('posts version and diagram to the Prisma export endpoint', async () => {
        const success: PrismaExportSuccess = {
            success: true,
            schema: 'model users { id Int @id }',
            notes: [],
        };
        apiRequestMock.mockResolvedValueOnce(success);

        const result = await exportPrismaSchema({
            version: '7',
            diagram: sampleDiagram,
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/exports/prisma', {
            method: 'POST',
            data: {
                version: '7',
                diagram: sampleDiagram,
            },
        });
        expect(result).toEqual(success);
    });

    it('parses semantic generation failures from HTTP 200 responses', async () => {
        const failure: PrismaExportFailure = {
            success: false,
            error: {
                code: 'unsupported_structural_field',
                message: 'Unsupported field type',
                path: 'shapes.geom',
            },
        };
        apiRequestMock.mockResolvedValueOnce(failure);

        await expect(
            exportPrismaSchema({
                version: '6',
                diagram: sampleDiagram,
            })
        ).resolves.toEqual(failure);
    });

    it('propagates HTTP failures from apiRequest', async () => {
        const apiError = new ApiError('Too Many Requests', 429, {
            message: 'Too Many Requests',
        });
        apiRequestMock.mockRejectedValueOnce(apiError);

        await expect(
            exportPrismaSchema({
                version: '7',
                diagram: sampleDiagram,
            })
        ).rejects.toBe(apiError);
    });
});
