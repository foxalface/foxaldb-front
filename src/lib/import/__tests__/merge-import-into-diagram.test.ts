import { describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import {
    mergeImportIntoDiagram,
    positionImportedTables,
} from '../merge-import-into-diagram';

const createTable = (id: string, x: number, width = 250): DBTable =>
    ({
        id,
        name: `table_${id}`,
        schema: null,
        x,
        y: 0,
        width,
        fields: [],
        indexes: [],
        color: '#fff',
        isView: false,
        createdAt: Date.now(),
    }) as DBTable;

describe('positionImportedTables', () => {
    it('offsets imported tables to the right of existing tables', () => {
        const existing = [createTable('existing', 100, 250)];
        const imported = [createTable('new', 0)];

        const positioned = positionImportedTables(imported, existing);

        expect(positioned[0]?.x).toBe(500);
    });

    it('keeps original positions when the diagram is empty', () => {
        const imported = [createTable('new', 42)];

        const positioned = positionImportedTables(imported, []);

        expect(positioned[0]?.x).toBe(42);
    });
});

describe('mergeImportIntoDiagram', () => {
    it('adds positioned tables and relationships without changing diagram type', async () => {
        const addTables = vi.fn().mockResolvedValue(undefined);
        const addRelationships = vi.fn().mockResolvedValue(undefined);
        const updateDatabaseType = vi.fn().mockResolvedValue(undefined);
        const resetRedoStack = vi.fn();
        const resetUndoStack = vi.fn();

        const importedDiagram: Diagram = {
            id: 'imported',
            name: 'Imported',
            databaseType: DatabaseType.MYSQL,
            tables: [createTable('imported', 0)],
            relationships: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await mergeImportIntoDiagram({
            importedDiagram,
            existingTables: [createTable('existing', 100)],
            addTables,
            addRelationships,
            currentDatabaseType: DatabaseType.POSTGRESQL,
            targetDatabaseType: DatabaseType.POSTGRESQL,
            updateDatabaseType,
            resetRedoStack,
            resetUndoStack,
        });

        expect(addTables).toHaveBeenCalledWith(
            [expect.objectContaining({ id: 'imported', x: 500 })],
            { updateHistory: false }
        );
        expect(addRelationships).toHaveBeenCalledWith([], {
            updateHistory: false,
        });
        expect(updateDatabaseType).not.toHaveBeenCalled();
        expect(resetRedoStack).toHaveBeenCalled();
        expect(resetUndoStack).toHaveBeenCalled();
    });

    it('updates database type only when the current diagram is generic', async () => {
        const updateDatabaseType = vi.fn().mockResolvedValue(undefined);

        await mergeImportIntoDiagram({
            importedDiagram: {
                id: 'imported',
                name: 'Imported',
                databaseType: DatabaseType.POSTGRESQL,
                tables: [],
                relationships: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            existingTables: [],
            addTables: vi.fn().mockResolvedValue(undefined),
            addRelationships: vi.fn().mockResolvedValue(undefined),
            currentDatabaseType: DatabaseType.GENERIC,
            targetDatabaseType: DatabaseType.POSTGRESQL,
            updateDatabaseType,
            resetRedoStack: vi.fn(),
            resetUndoStack: vi.fn(),
        });

        expect(updateDatabaseType).toHaveBeenCalledWith(
            DatabaseType.POSTGRESQL
        );
    });
});
