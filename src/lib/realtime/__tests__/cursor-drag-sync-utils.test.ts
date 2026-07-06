import { describe, expect, it } from 'vitest';
import {
    computeDragSyncedCursorPosition,
    computeDraggingTablesCentroid,
    createDragCursorAnchor,
} from '../cursor-drag-sync-utils';

describe('cursor-drag-sync-utils', () => {
    describe('computeDraggingTablesCentroid', () => {
        it('returns the average position for multiple dragged tables', () => {
            expect(
                computeDraggingTablesCentroid([
                    { id: 'a', x: 0, y: 0 },
                    { id: 'b', x: 20, y: 40 },
                ])
            ).toEqual({ x: 10, y: 20 });
        });
    });

    describe('createDragCursorAnchor', () => {
        it('preserves the pointer offset from the drag centroid', () => {
            expect(
                createDragCursorAnchor([{ id: 'table-1', x: 100, y: 200 }], {
                    x: 130,
                    y: 240,
                })
            ).toEqual({
                offsetX: 30,
                offsetY: 40,
            });
        });
    });

    describe('computeDragSyncedCursorPosition', () => {
        it('moves the cursor with the dragged tables', () => {
            const anchor = createDragCursorAnchor(
                [{ id: 'table-1', x: 100, y: 200 }],
                { x: 130, y: 240 }
            );

            expect(anchor).not.toBeNull();

            expect(
                computeDragSyncedCursorPosition(
                    [{ id: 'table-1', x: 160, y: 260 }],
                    anchor!
                )
            ).toEqual({ x: 190, y: 300 });
        });
    });
});
