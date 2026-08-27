import { describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    dbmlSample,
    metadataJsonSample,
    mysqlDistinctiveSql,
    postgresDistinctiveSql,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { ImportSchemaResolutionError, importSchema } from '../import-schema';

vi.mock('@/lib/data/sql-import', () => ({
    sqlImportToDiagram: vi.fn(
        async ({
            sourceDatabaseType,
            targetDatabaseType,
        }: {
            sourceDatabaseType: DatabaseType;
            targetDatabaseType: DatabaseType;
        }) => ({
            id: 'diagram-1',
            name: 'Imported',
            databaseType: targetDatabaseType,
            tables: [],
            relationships: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            __sourceDatabaseType: sourceDatabaseType,
        })
    ),
}));

vi.mock('@/lib/dbml/dbml-import/dbml-import', () => ({
    defaultDBMLDiagramName: 'Untitled Diagram',
    importDBMLToDiagram: vi.fn(
        async (_content: string, options: { databaseType: DatabaseType }) => ({
            id: 'diagram-dbml',
            name: 'Untitled Diagram',
            databaseType: options.databaseType,
            tables: [],
            relationships: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    ),
}));

describe('importSchema', () => {
    it('requires an explicit SQL source dialect', async () => {
        await expect(
            importSchema({
                content: postgresDistinctiveSql,
                selectedDatabaseType: DatabaseType.POSTGRESQL,
            })
        ).rejects.toBeInstanceOf(ImportSchemaResolutionError);
    });

    it('imports PostgreSQL SQL with an explicit source dialect', async () => {
        const { sqlImportToDiagram } = await import('@/lib/data/sql-import');

        const result = await importSchema({
            content: postgresDistinctiveSql,
            selectedDatabaseType: DatabaseType.POSTGRESQL,
            resolvedSourceDialect: DatabaseType.POSTGRESQL,
        });

        expect(result.format).toBe('sql');
        expect(result.sourceDialect).toBe(DatabaseType.POSTGRESQL);
        expect(sqlImportToDiagram).toHaveBeenCalledWith(
            expect.objectContaining({
                sourceDatabaseType: DatabaseType.POSTGRESQL,
                targetDatabaseType: DatabaseType.POSTGRESQL,
            })
        );
    });

    it('imports MySQL SQL with the resolved MySQL source dialect', async () => {
        const { sqlImportToDiagram } = await import('@/lib/data/sql-import');

        const result = await importSchema({
            content: mysqlDistinctiveSql,
            selectedDatabaseType: DatabaseType.MYSQL,
            resolvedSourceDialect: DatabaseType.MYSQL,
        });

        expect(result.sourceDialect).toBe(DatabaseType.MYSQL);
        expect(sqlImportToDiagram).toHaveBeenCalledWith(
            expect.objectContaining({
                sourceDatabaseType: DatabaseType.MYSQL,
                targetDatabaseType: DatabaseType.MYSQL,
            })
        );
    });

    it('uses the selected database type for DBML imports', async () => {
        const { importDBMLToDiagram } =
            await import('@/lib/dbml/dbml-import/dbml-import');

        const result = await importSchema({
            content: dbmlSample,
            selectedDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(result.format).toBe('dbml');
        expect(result.sourceDialect).toBeNull();
        expect(importDBMLToDiagram).toHaveBeenCalledWith(dbmlSample, {
            databaseType: DatabaseType.POSTGRESQL,
        });
    });

    it('uses the selected database type for metadata JSON imports', async () => {
        const result = await importSchema({
            content: metadataJsonSample,
            selectedDatabaseType: DatabaseType.MYSQL,
            diagramNumber: 3,
        });

        expect(result.format).toBe('metadata_json');
        expect(result.diagram.databaseType).toBe(DatabaseType.MYSQL);
    });
});

describe('importSchema dispatch regression', () => {
    it('never passes GENERIC as source dialect to sqlImportToDiagram', async () => {
        const { sqlImportToDiagram } = await import('@/lib/data/sql-import');
        vi.mocked(sqlImportToDiagram).mockClear();

        await importSchema({
            content: postgresDistinctiveSql,
            selectedDatabaseType: DatabaseType.POSTGRESQL,
            resolvedSourceDialect: DatabaseType.POSTGRESQL,
        });

        const call = vi.mocked(sqlImportToDiagram).mock.calls[0]?.[0];
        expect(call?.sourceDatabaseType).not.toBe(DatabaseType.GENERIC);
    });
});
