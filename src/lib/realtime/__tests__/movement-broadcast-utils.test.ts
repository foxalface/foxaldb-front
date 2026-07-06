import { describe, expect, it } from 'vitest';
import {
    buildDraggingTableSnapshot,
    buildTablePositionsForIds,
} from '../movement-broadcast-utils';

describe('buildDraggingTableSnapshot', () => {
    it('includes only table nodes that are actively dragging', () => {
        const snapshot = buildDraggingTableSnapshot([
            {
                id: 'table-a',
                type: 'table',
                dragging: true,
                position: { x: 10, y: 20 },
            },
            {
                id: 'note-a',
                type: 'note',
                dragging: true,
                position: { x: 30, y: 40 },
            },
            {
                id: 'table-b',
                type: 'table',
                dragging: false,
                position: { x: 50, y: 60 },
            },
            {
                id: 'area-a',
                type: 'area',
                dragging: true,
                position: { x: 70, y: 80 },
            },
        ]);

        expect(snapshot).toEqual([{ id: 'table-a', x: 10, y: 20 }]);
    });
});

describe('buildTablePositionsForIds', () => {
    it('returns flow positions for the requested table ids', () => {
        const positions = buildTablePositionsForIds(
            [
                {
                    id: 'table-a',
                    type: 'table',
                    position: { x: 1, y: 2 },
                },
                {
                    id: 'table-b',
                    type: 'table',
                    position: { x: 3, y: 4 },
                },
            ],
            new Set(['table-b'])
        );

        expect(positions).toEqual([{ id: 'table-b', x: 3, y: 4 }]);
    });
});
