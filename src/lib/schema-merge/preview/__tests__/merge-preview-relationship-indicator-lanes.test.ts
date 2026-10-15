import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { assignRelationshipIndicatorLanes } from '../merge-preview-relationship-indicator-lanes';

const diagram: Diagram = {
    id: 'd1',
    name: 'd',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 't1',
            name: 'a',
            schema: 'public',
            x: 0,
            y: 0,
            fields: [],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 0,
        },
        {
            id: 't2',
            name: 'b',
            schema: 'public',
            x: 0,
            y: 0,
            fields: [],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 0,
        },
    ],
    relationships: [
        {
            id: 'r1',
            name: 'r1',
            sourceTableId: 't1',
            targetTableId: 't2',
            sourceFieldId: 'f1',
            targetFieldId: 'f2',
            sourceCardinality: 'one',
            targetCardinality: 'many',
            createdAt: 0,
        },
        {
            id: 'r2',
            name: 'r2',
            sourceTableId: 't1',
            targetTableId: 't2',
            sourceFieldId: 'f1',
            targetFieldId: 'f2',
            sourceCardinality: 'one',
            targetCardinality: 'many',
            createdAt: 0,
        },
        {
            id: 'r3',
            name: 'r3',
            sourceTableId: 't1',
            targetTableId: 't2',
            sourceFieldId: 'f1',
            targetFieldId: 'f2',
            sourceCardinality: 'one',
            targetCardinality: 'many',
            createdAt: 0,
        },
    ],
    createdAt: new Date(0),
    updatedAt: new Date(0),
};

describe('assignRelationshipIndicatorLanes', () => {
    it('assigns distinct deterministic lanes for collocated relationships', () => {
        const lanes = assignRelationshipIndicatorLanes(diagram, [
            'r1',
            'r2',
            'r3',
        ]);

        expect(lanes.get('r1')).toBe(-1);
        expect(lanes.get('r2')).toBe(0);
        expect(lanes.get('r3')).toBe(1);

        const again = assignRelationshipIndicatorLanes(diagram, [
            'r1',
            'r2',
            'r3',
        ]);
        expect(again).toEqual(lanes);
    });
});
