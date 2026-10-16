import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import {
    assignRelationshipIndicatorLanes,
    computeMergePreviewIndicatorPosition,
    MERGE_PREVIEW_CARDINALITY_CLEARANCE,
} from '../merge-preview-relationship-indicator-lanes';

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

describe('computeMergePreviewIndicatorPosition', () => {
    it('pushes the indicator along the normal when too close to cardinality anchors', () => {
        const baseline = computeMergePreviewIndicatorPosition({
            edgeMidpoint: { x: 150, y: 100 },
            sourceAnchor: { x: 100, y: 100 },
            targetAnchor: { x: 200, y: 100 },
            sourceX: 100,
            sourceY: 100,
            targetX: 200,
            targetY: 100,
            indicatorLane: 0,
            minCardinalityClearance: MERGE_PREVIEW_CARDINALITY_CLEARANCE,
        });

        const centerBaseline = {
            x: baseline.x + 10,
            y: baseline.y + 10,
        };
        const distSourceBaseline = Math.hypot(
            centerBaseline.x - 100,
            centerBaseline.y - 100
        );
        expect(distSourceBaseline).toBeGreaterThanOrEqual(
            MERGE_PREVIEW_CARDINALITY_CLEARANCE
        );

        const again = computeMergePreviewIndicatorPosition({
            edgeMidpoint: { x: 150, y: 100 },
            sourceAnchor: { x: 100, y: 100 },
            targetAnchor: { x: 200, y: 100 },
            sourceX: 100,
            sourceY: 100,
            targetX: 200,
            targetY: 100,
            indicatorLane: 0,
            minCardinalityClearance: MERGE_PREVIEW_CARDINALITY_CLEARANCE,
        });
        expect(again).toEqual(baseline);
    });

    it('keeps lane offset when clearance is already satisfied', () => {
        const position = computeMergePreviewIndicatorPosition({
            edgeMidpoint: { x: 200, y: 200 },
            sourceAnchor: { x: 0, y: 0 },
            targetAnchor: { x: 400, y: 400 },
            sourceX: 0,
            sourceY: 0,
            targetX: 400,
            targetY: 400,
            indicatorLane: 2,
        });

        const withoutLane = computeMergePreviewIndicatorPosition({
            edgeMidpoint: { x: 200, y: 200 },
            sourceAnchor: { x: 0, y: 0 },
            targetAnchor: { x: 400, y: 400 },
            sourceX: 0,
            sourceY: 0,
            targetX: 400,
            targetY: 400,
            indicatorLane: 0,
        });

        expect(position.x).not.toBe(withoutLane.x);
        expect(position.y).not.toBe(withoutLane.y);
    });
});
