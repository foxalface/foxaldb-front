import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { buildMergePreviewFlowDecorationMaps } from '../merge-preview-decoration-maps';

const diagram: Diagram = {
    id: 'd1',
    name: 'd',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 't1',
            name: 'users',
            schema: 'public',
            x: 0,
            y: 0,
            fields: [
                {
                    id: 'f1',
                    name: 'email',
                    type: { id: 'varchar', name: 'varchar' },
                    primaryKey: false,
                    unique: false,
                    nullable: true,
                    createdAt: 0,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 0,
        },
    ],
    relationships: [
        {
            id: 'r1',
            name: 'r',
            sourceTableId: 't1',
            targetTableId: 't1',
            sourceFieldId: 'f1',
            targetFieldId: 'f1',
            sourceCardinality: 'one',
            targetCardinality: 'many',
            createdAt: 0,
        },
    ],
    createdAt: new Date(0),
    updatedAt: new Date(0),
};

describe('buildMergePreviewFlowDecorationMaps', () => {
    it('maps table, field, and relationship decorations without mutating diagram', () => {
        const before = structuredClone(diagram);
        const maps = buildMergePreviewFlowDecorationMaps(diagram, {
            tables: { t1: 'add' },
            fields: { f1: 'modify' },
            relationships: { r1: 'delete' },
        });

        expect(diagram).toEqual(before);
        expect(maps.mergePreviewByTableId.get('t1')).toEqual([
            { entityKind: 'table', entityId: 't1', change: 'add' },
            { entityKind: 'field', entityId: 'f1', change: 'modify' },
        ]);
        expect(maps.mergePreviewByRelationshipId.get('r1')).toEqual({
            change: 'delete',
        });
    });
});
