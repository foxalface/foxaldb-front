import type { DBTable } from '@/lib/domain/db-table';
import { MIN_TABLE_SIZE } from '@/lib/domain/db-table';

/** Mirrors backend SchemaMergeApplier placement constants (approximate parity). */
const TABLE_WIDTH = 280;
const COLUMN_GAP = 80;
const ROW_GAP = 160;

export interface PreviewPlacementState {
    nextX: number | null;
    nextY: number;
}

export const createPreviewPlacementState = (
    tables: readonly DBTable[]
): PreviewPlacementState => {
    let right = 0;
    let hasTable = false;

    for (const table of tables) {
        hasTable = true;
        const width = table.width ?? MIN_TABLE_SIZE;
        right = Math.max(right, table.x + width);
    }

    return {
        nextX: hasTable ? right + COLUMN_GAP : 0,
        nextY: 0,
    };
};

export const nextPreviewTablePosition = (
    state: PreviewPlacementState
): { position: { x: number; y: number }; state: PreviewPlacementState } => {
    const nextX = state.nextX ?? 0;
    const position = { x: nextX, y: state.nextY };

    return {
        position,
        state: {
            nextX,
            nextY: state.nextY + ROW_GAP,
        },
    };
};

export const defaultPreviewTableWidth = (): number => TABLE_WIDTH;
