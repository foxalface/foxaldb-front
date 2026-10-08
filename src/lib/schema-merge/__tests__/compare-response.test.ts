import { describe, expect, it } from 'vitest';
import { decodeSchemaMergeCompareResponse } from '../compare-response';

const hash = 'a'.repeat(64);

const response = (
    operations: unknown[],
    extras: Record<string, unknown> = {}
) => ({
    baseContentHash: hash,
    baseUpdatedAt: '2026-01-01T00:00:00.000000Z',
    viewsCompared: true,
    operations,
    ...extras,
});

const tableAdd = {
    id: 'table_add_1',
    category: 'table',
    type: 'add',
    entityId: null,
    identity: { kind: 'table', schema: 'public', name: 'users' },
    renameTo: null,
    before: null,
    after: { kind: 'table', schema: 'public', name: 'users' },
    changes: [],
    dependsOn: [],
};

describe('decodeSchemaMergeCompareResponse', () => {
    it('accepts an empty successful comparison', () => {
        expect(decodeSchemaMergeCompareResponse(response([]))).toEqual({
            baseContentHash: hash,
            baseUpdatedAt: '2026-01-01T00:00:00.000000Z',
            viewsCompared: true,
            operations: [],
        });
    });

    it('accepts a null base timestamp and a table add', () => {
        const decoded = decodeSchemaMergeCompareResponse({
            ...response([tableAdd]),
            baseUpdatedAt: null,
            viewsCompared: false,
        });

        expect(decoded?.baseUpdatedAt).toBeNull();
        expect(decoded?.viewsCompared).toBe(false);
        expect(decoded?.operations).toHaveLength(1);
        expect(decoded?.operations[0]).toMatchObject({
            category: 'table',
            type: 'add',
            entityId: null,
        });
    });

    it('rejects a non-hex hash, a missing flag, and a malformed operation', () => {
        expect(
            decodeSchemaMergeCompareResponse({
                ...response([]),
                baseContentHash: 'ABC',
            })
        ).toBeNull();
        expect(
            decodeSchemaMergeCompareResponse({
                baseContentHash: hash,
                baseUpdatedAt: null,
                operations: [],
            })
        ).toBeNull();
        expect(
            decodeSchemaMergeCompareResponse(
                response([{ ...tableAdd, type: 'rename', renameTo: null }])
            )
        ).toBeNull();
    });
});
