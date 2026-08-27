import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import { runWithoutOutboundReplay } from '@/lib/realtime/diagram-sync-state';

export interface MergeImportIntoDiagramParams {
    importedDiagram: Diagram;
    existingTables: DBTable[];
    addTables: (
        tables: DBTable[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    addRelationships: (
        relationships: DBRelationship[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    currentDatabaseType: DatabaseType;
    targetDatabaseType: DatabaseType;
    updateDatabaseType: (databaseType: DatabaseType) => Promise<void>;
    resetRedoStack: () => void;
    resetUndoStack: () => void;
}

export const positionImportedTables = (
    importedTables: DBTable[],
    existingTables: DBTable[]
): DBTable[] => {
    let offsetX = 0;

    if (existingTables.length > 0) {
        const rightmostTable = existingTables.reduce((max, table) => {
            const tableRight = table.x + (table.width ?? 250);
            const maxRight = max.x + (max.width ?? 250);
            return tableRight > maxRight ? table : max;
        });
        offsetX = rightmostTable.x + (rightmostTable.width ?? 250) + 150;
    }

    return importedTables.map((table) => ({
        ...table,
        x: table.x + offsetX,
    }));
};

export const mergeImportIntoDiagram = async ({
    importedDiagram,
    existingTables,
    addTables,
    addRelationships,
    currentDatabaseType,
    targetDatabaseType,
    updateDatabaseType,
    resetRedoStack,
    resetUndoStack,
}: MergeImportIntoDiagramParams): Promise<void> => {
    const positionedTables = positionImportedTables(
        importedDiagram.tables ?? [],
        existingTables
    );

    await runWithoutOutboundReplay(async () => {
        await Promise.all([
            addTables(positionedTables, { updateHistory: false }),
            addRelationships(importedDiagram.relationships ?? [], {
                updateHistory: false,
            }),
        ]);

        if (currentDatabaseType === DatabaseType.GENERIC) {
            await updateDatabaseType(targetDatabaseType);
        }

        resetRedoStack();
        resetUndoStack();
    });
};
