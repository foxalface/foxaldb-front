import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { snapshotMergeBaseDiagram } from '../snapshot-merge-base-diagram';

const sample = (): Diagram => ({
    id: '42',
    name: 'Base',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 't1',
            name: 'users',
            schema: 'public',
            x: 10,
            y: 20,
            fields: [],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 0,
        },
    ],
    relationships: [],
    createdAt: new Date(0),
    updatedAt: new Date(0),
});

describe('snapshotMergeBaseDiagram', () => {
    it('deep-clones without sharing table references', () => {
        const source = sample();
        const snapshot = snapshotMergeBaseDiagram(source);

        source.tables![0].name = 'mutated';
        source.tables![0].x = 999;

        expect(snapshot.tables?.[0]?.name).toBe('users');
        expect(snapshot.tables?.[0]?.x).toBe(10);
    });
});
