import type { DBTable } from '@/lib/domain/db-table';
import { getTableDimensions } from '@/lib/domain/db-table';

/** Horizontal gap between existing diagram bounds and the first preview column. */
export const PREVIEW_PLACEMENT_COLUMN_GAP = 80;

/** Vertical gap between stacked preview tables/views in the same column. */
export const PREVIEW_PLACEMENT_VERTICAL_GAP = 32;

/** Minimum column height target when the base diagram is empty. */
const EMPTY_BASE_COLUMN_HEIGHT_TARGET = 800;

/** Minimum column height target when existing tables define a shorter span. */
const MIN_COLUMN_HEIGHT_TARGET = 400;

export interface PlacementRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const placementRectFromTable = (table: DBTable): PlacementRect => {
    const { width, height } = getTableDimensions(table);

    return {
        x: table.x,
        y: table.y,
        width,
        height,
    };
};

/**
 * Axis-aligned overlap test with optional gap (treats gap as extra margin on each rect).
 */
export const rectanglesOverlap = (
    a: PlacementRect,
    b: PlacementRect,
    gap = 0
): boolean =>
    !(
        a.x + a.width + gap <= b.x ||
        b.x + b.width + gap <= a.x ||
        a.y + a.height + gap <= b.y ||
        b.y + b.height + gap <= a.y
    );

/**
 * Deterministic collision-free placement for newly added preview tables/views.
 * Existing tables are obstacles only; their x/y never change.
 */
export class PreviewTablePlacement {
    private readonly occupied: PlacementRect[];

    private columnX: number;

    private columnY: number;

    private columnMaxWidth: number;

    private readonly anchorY: number;

    private readonly columnHeightLimit: number;

    constructor(existingTables: readonly DBTable[]) {
        this.occupied = existingTables.map(placementRectFromTable);

        let right = 0;
        let minY = Number.POSITIVE_INFINITY;
        let maxBottom = Number.NEGATIVE_INFINITY;
        let hasTable = false;

        for (const rect of this.occupied) {
            hasTable = true;
            right = Math.max(right, rect.x + rect.width);
            minY = Math.min(minY, rect.y);
            maxBottom = Math.max(maxBottom, rect.y + rect.height);
        }

        if (!hasTable) {
            this.columnX = 0;
            this.anchorY = 0;
            this.columnY = 0;
            this.columnHeightLimit = EMPTY_BASE_COLUMN_HEIGHT_TARGET;
        } else {
            this.columnX = right + PREVIEW_PLACEMENT_COLUMN_GAP;
            this.anchorY = minY;
            this.columnY = minY;
            this.columnHeightLimit = Math.max(
                maxBottom - minY,
                MIN_COLUMN_HEIGHT_TARGET
            );
        }

        this.columnMaxWidth = 0;
    }

    placeNext(tableForSizing: DBTable): { x: number; y: number } {
        const { width, height } = getTableDimensions(tableForSizing);

        if (
            this.columnY > this.anchorY &&
            this.columnY + height > this.anchorY + this.columnHeightLimit
        ) {
            this.columnX += this.columnMaxWidth + PREVIEW_PLACEMENT_COLUMN_GAP;
            this.columnY = this.anchorY;
            this.columnMaxWidth = 0;
        }

        const position = { x: this.columnX, y: this.columnY };
        const rect: PlacementRect = {
            x: position.x,
            y: position.y,
            width,
            height,
        };

        this.occupied.push(rect);
        this.columnY += height + PREVIEW_PLACEMENT_VERTICAL_GAP;
        this.columnMaxWidth = Math.max(this.columnMaxWidth, width);

        return position;
    }

    getOccupiedRects(): readonly PlacementRect[] {
        return this.occupied;
    }
}

/** @deprecated Use PreviewTablePlacement; kept for tests referencing width default. */
export const defaultPreviewTableWidth = (): number => 280;
