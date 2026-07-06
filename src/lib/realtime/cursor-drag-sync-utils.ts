import type { FlowPosition } from './cursor-send-utils';
import type { MovementTablePosition } from './movement-types';

export interface DragCursorAnchor {
    offsetX: number;
    offsetY: number;
}

export const computeDraggingTablesCentroid = (
    tables: readonly MovementTablePosition[]
): FlowPosition | null => {
    if (tables.length === 0) {
        return null;
    }

    let sumX = 0;
    let sumY = 0;

    for (const table of tables) {
        sumX += table.x;
        sumY += table.y;
    }

    return {
        x: sumX / tables.length,
        y: sumY / tables.length,
    };
};

export const createDragCursorAnchor = (
    tables: readonly MovementTablePosition[],
    pointer: FlowPosition | null
): DragCursorAnchor | null => {
    const centroid = computeDraggingTablesCentroid(tables);

    if (centroid === null) {
        return null;
    }

    const reference = pointer ?? centroid;

    return {
        offsetX: reference.x - centroid.x,
        offsetY: reference.y - centroid.y,
    };
};

export const computeDragSyncedCursorPosition = (
    tables: readonly MovementTablePosition[],
    anchor: DragCursorAnchor
): FlowPosition | null => {
    const centroid = computeDraggingTablesCentroid(tables);

    if (centroid === null) {
        return null;
    }

    return {
        x: centroid.x + anchor.offsetX,
        y: centroid.y + anchor.offsetY,
    };
};
