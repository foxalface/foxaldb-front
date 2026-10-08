import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '../client';
import type * as UploadCapabilitiesModule from '@/lib/upload-capabilities';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from '@/lib/upload-capabilities/safety-ceiling';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';

const { apiRequestMock, capabilitiesState } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
    capabilitiesState: {
        current: null as UploadCapabilities | null,
    },
}));

vi.mock('../client', async () => {
    const actual = (await vi.importActual('../client')) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

vi.mock('@/lib/upload-capabilities', async () => {
    const actual = (await vi.importActual(
        '@/lib/upload-capabilities'
    )) as typeof UploadCapabilitiesModule;

    return {
        ...actual,
        resolveUploadCapabilities: () =>
            Promise.resolve(
                capabilitiesState.current ??
                    actual.CONSERVATIVE_UPLOAD_SAFETY_CEILING
            ),
    };
});

import { ApiError } from '../client';
import {
    compareSchemaMerge,
    mapSchemaMergeCompareError,
    SchemaMergePayloadTooLargeError,
} from '../schema-merge-compare';

const hash = 'b'.repeat(64);

const diagram = {
    id: 'incoming',
    name: 'Incoming',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [],
    relationships: [],
    createdAt: new Date(0),
    updatedAt: new Date(0),
} as Diagram;

const successBody = {
    baseContentHash: hash,
    baseUpdatedAt: null,
    viewsCompared: false,
    operations: [],
};

describe('compareSchemaMerge', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        capabilitiesState.current = null;
    });

    it('posts only the compare contract to the diagram endpoint', async () => {
        apiRequestMock.mockResolvedValueOnce(successBody);

        const result = await compareSchemaMerge(42, {
            incomingDiagram: diagram,
            includeDeletions: true,
            source: { kind: 'dbml' },
        });

        expect(apiRequestMock).toHaveBeenCalledWith(
            '/diagrams/42/merge/compare',
            {
                method: 'POST',
                data: {
                    incomingDiagram: diagram,
                    includeDeletions: true,
                    source: { kind: 'dbml' },
                },
            }
        );
        const body = apiRequestMock.mock.calls[0]?.[1].data as Record<
            string,
            unknown
        >;
        expect(Object.keys(body).sort()).toEqual([
            'includeDeletions',
            'incomingDiagram',
            'source',
        ]);
        expect(Object.keys(body.source as object)).toEqual(['kind']);
        expect(body).not.toHaveProperty('currentDiagram');
        expect(body).not.toHaveProperty('viewsSupported');
        expect(body).not.toHaveProperty('capabilities');
        expect(body).not.toHaveProperty('baseContentHash');
        expect(result).toEqual(successBody);
        expect(
            CONSERVATIVE_UPLOAD_SAFETY_CEILING.schemaMerge.payloadMaxBytes
        ).toBeGreaterThan(0);
    });

    it('rejects a body above the upload capability without calling the API', async () => {
        capabilitiesState.current = {
            ...CONSERVATIVE_UPLOAD_SAFETY_CEILING,
            schemaMerge: { payloadMaxBytes: 1 },
        };

        await expect(
            compareSchemaMerge('42', {
                incomingDiagram: diagram,
                includeDeletions: false,
                source: { kind: 'sql' },
            })
        ).rejects.toBeInstanceOf(SchemaMergePayloadTooLargeError);
        expect(apiRequestMock).not.toHaveBeenCalled();
    });

    it('maps backend codes and auth failures without using the message', () => {
        expect(
            mapSchemaMergeCompareError(
                new ApiError('English backend message', 422, {
                    code: 'malformed_diagram',
                    message: 'English backend message',
                })
            )
        ).toEqual({ type: 'merge_code', code: 'malformed_diagram' });
        expect(
            mapSchemaMergeCompareError(
                new ApiError('database_type_mismatch', 422, {
                    code: 'database_type_mismatch',
                    message: 'database_type_mismatch',
                })
            ).type
        ).toBe('merge_code');
        expect(
            mapSchemaMergeCompareError(
                new ApiError('no', 401, { message: 'Unauthenticated.' })
            )
        ).toEqual({ type: 'unauthenticated' });
        expect(
            mapSchemaMergeCompareError(
                new ApiError('no', 403, { message: 'Forbidden.' })
            )
        ).toEqual({ type: 'forbidden' });
        expect(
            mapSchemaMergeCompareError(
                new ApiError('no', 429, { message: 'Too Many Attempts.' })
            )
        ).toEqual({ type: 'rate_limit' });
        expect(
            mapSchemaMergeCompareError(
                new ApiError('no', 422, {
                    code: 'analysis_failed',
                    message: 'analysis exploded',
                })
            )
        ).toEqual({ type: 'merge_code', code: 'analysis_failed' });
        expect(
            mapSchemaMergeCompareError(
                new ApiError('no', 422, {
                    code: 'payload_too_large',
                    message: 'too big',
                })
            )
        ).toEqual({ type: 'merge_code', code: 'payload_too_large' });
        expect(
            mapSchemaMergeCompareError(
                new ApiError('no', 422, {
                    code: 'unsupported_source',
                    message: 'nope',
                })
            )
        ).toEqual({ type: 'merge_code', code: 'unsupported_source' });
        expect(
            mapSchemaMergeCompareError(new SchemaMergePayloadTooLargeError())
        ).toEqual({ type: 'merge_code', code: 'payload_too_large' });
    });
});
