import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '../client';
import type * as UploadCapabilitiesModule from '@/lib/upload-capabilities';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from '@/lib/upload-capabilities/safety-ceiling';

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

vi.mock('@/lib/realtime/client-id', () => ({
    getClientId: () => 'client-1',
}));

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
    applySchemaMerge,
    mapSchemaMergeApplyError,
    SchemaMergeApplyResponseError,
} from '../schema-merge-apply';

const hash = 'a'.repeat(64);
const resultHash = 'b'.repeat(64);

const incoming = {
    id: 'incoming',
    name: 'Incoming',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [],
    relationships: [],
    createdAt: new Date(0),
    updatedAt: new Date(0),
} as Diagram;

const successBody = {
    resultContentHash: resultHash,
    updatedAt: '2026-01-02T00:00:00.000Z',
    content: {
        id: '42',
        name: 'Saved',
        databaseType: DatabaseType.POSTGRESQL,
        tables: [
            {
                id: 'backendtableid00000000001',
                name: 'invoices',
                x: 480,
                y: 80,
            },
        ],
        relationships: [],
    },
    appliedOperationIds: ['second', 'first'],
    summary: {
        selected: 1,
        categories: { table: 1, field: 0, relationship: 0, view: 0 },
        types: { add: 1, modify: 0, rename: 0, delete: 0 },
    },
};

describe('applySchemaMerge', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        capabilitiesState.current = null;
    });

    it('posts the apply contract with the realtime client id and decodes the response', async () => {
        apiRequestMock.mockResolvedValueOnce(successBody);

        const result = await applySchemaMerge(42, {
            baseContentHash: hash,
            incomingDiagram: incoming,
            includeDeletions: false,
            source: { kind: 'sql' },
            selectedOperationIds: ['second', 'first'],
        });

        expect(apiRequestMock).toHaveBeenCalledWith(
            '/diagrams/42/merge/apply',
            {
                method: 'POST',
                data: {
                    baseContentHash: hash,
                    incomingDiagram: incoming,
                    includeDeletions: false,
                    source: { kind: 'sql' },
                    selectedOperationIds: ['second', 'first'],
                    clientId: 'client-1',
                },
            }
        );
        const body = apiRequestMock.mock.calls[0]?.[1].data as Record<
            string,
            unknown
        >;
        expect(Object.keys(body).sort()).toEqual([
            'baseContentHash',
            'clientId',
            'includeDeletions',
            'incomingDiagram',
            'selectedOperationIds',
            'source',
        ]);
        expect(body).not.toHaveProperty('operations');
        expect(body).not.toHaveProperty('dependsOn');
        expect(body).not.toHaveProperty('currentDiagram');
        expect(body).not.toHaveProperty('viewsSupported');
        expect(result.resultContentHash).toBe(resultHash);
        expect(result.appliedOperationIds).toEqual(['second', 'first']);
        expect(result.content.tables?.[0]?.id).toBe(
            'backendtableid00000000001'
        );
        expect(result.content.tables?.[0]).toEqual(
            expect.objectContaining({ x: 480, y: 80 })
        );
        expect(
            CONSERVATIVE_UPLOAD_SAFETY_CEILING.schemaMerge.payloadMaxBytes
        ).toBeGreaterThan(0);
    });

    it('rejects a malformed response', async () => {
        apiRequestMock.mockResolvedValueOnce({
            resultContentHash: 'not-a-hash',
            updatedAt: null,
            content: {},
            appliedOperationIds: [],
            summary: {},
        });

        await expect(
            applySchemaMerge('42', {
                baseContentHash: hash,
                incomingDiagram: incoming,
                includeDeletions: false,
                source: { kind: 'sql' },
                selectedOperationIds: ['first'],
            })
        ).rejects.toBeInstanceOf(SchemaMergeApplyResponseError);
    });

    it('maps stale, incomplete, and rate-limit responses', () => {
        expect(
            mapSchemaMergeApplyError(
                new ApiError('stale', 409, { code: 'stale_comparison' })
            )
        ).toEqual({ type: 'merge_code', code: 'stale_comparison' });
        expect(
            mapSchemaMergeApplyError(
                new ApiError('open', 422, { code: 'incomplete_selection' })
            )
        ).toEqual({ type: 'merge_code', code: 'incomplete_selection' });
        expect(mapSchemaMergeApplyError(new ApiError('slow', 429, {}))).toEqual(
            { type: 'rate_limit' }
        );
        expect(mapSchemaMergeApplyError(new ApiError('no', 401, {}))).toEqual({
            type: 'unauthenticated',
        });
        expect(mapSchemaMergeApplyError(new ApiError('no', 403, {}))).toEqual({
            type: 'forbidden',
        });
    });
});
