import type { DBTable } from '@/lib/domain/db-table';

const DEFAULT_TABLE_WIDTH = 250;
const DEFAULT_TABLE_HEIGHT = 300;
const HORIZONTAL_GAP = 150;
const VERTICAL_GAP = 50;
const DEFAULT_START_X = 100;
const DEFAULT_START_Y = 100;

export const computeNewTablePosition = ({
    existingTables,
    addedTableIndex,
}: {
    existingTables: DBTable[];
    addedTableIndex: number;
}): { x: number; y: number } => {
    if (existingTables.length === 0) {
        return {
            x: DEFAULT_START_X,
            y:
                DEFAULT_START_Y +
                addedTableIndex * (DEFAULT_TABLE_HEIGHT + VERTICAL_GAP),
        };
    }

    const rightmostTable = existingTables.reduce((max, table) => {
        const tableRight = table.x + (table.width ?? DEFAULT_TABLE_WIDTH);
        const maxRight = max.x + (max.width ?? DEFAULT_TABLE_WIDTH);

        return tableRight > maxRight ? table : max;
    });

    const offsetX =
        rightmostTable.x +
        (rightmostTable.width ?? DEFAULT_TABLE_WIDTH) +
        HORIZONTAL_GAP;
    const baseY = existingTables.reduce(
        (minimum, table) => Math.min(minimum, table.y),
        existingTables[0].y
    );

    return {
        x: offsetX,
        y: baseY + addedTableIndex * (DEFAULT_TABLE_HEIGHT + VERTICAL_GAP),
    };
};
