import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    ImportSchemaResolutionError,
    importSchema,
} from '@/lib/import/import-schema';
import {
    ImportDiagramJsonError,
    importDiagramFromJson,
} from '@/lib/import/import-diagram-from-json';
import {
    semanticFromImportSchema,
    semanticFromSql,
} from './semantic-golden-helpers';

describe('M11.2 import edge cases', () => {
    it('rejects empty SQL through importSchema', async () => {
        await expect(
            importSchema({
                content: '   ',
                selectedDatabaseType: DatabaseType.POSTGRESQL,
                resolvedSourceDialect: DatabaseType.POSTGRESQL,
            })
        ).rejects.toBeInstanceOf(ImportSchemaResolutionError);
    });

    it('rejects comment-only SQL through importSchema', async () => {
        await expect(
            importSchema({
                content: '-- only a comment\n',
                selectedDatabaseType: DatabaseType.POSTGRESQL,
                resolvedSourceDialect: DatabaseType.POSTGRESQL,
            })
        ).rejects.toBeInstanceOf(ImportSchemaResolutionError);
    });

    it('rejects empty DBML through importSchema', async () => {
        await expect(
            importSchema({
                content: '\n\n',
                selectedDatabaseType: DatabaseType.POSTGRESQL,
            })
        ).rejects.toBeInstanceOf(ImportSchemaResolutionError);
    });

    it('documents that some malformed SQL DDL is still parsed (P3 limitation)', async () => {
        const result = await importSchema({
            content: 'CREATE TABLE broken_table ( id INT, ;',
            selectedDatabaseType: DatabaseType.POSTGRESQL,
            resolvedSourceDialect: DatabaseType.POSTGRESQL,
        });

        expect(result.format).toBe('sql');
        expect((result.diagram?.tables ?? []).length).toBeGreaterThan(0);
    });

    it('rejects invalid metadata JSON', async () => {
        await expect(
            importSchema({
                content: '{not-json',
                selectedDatabaseType: DatabaseType.POSTGRESQL,
            })
        ).rejects.toThrow();
    });

    it('rejects invalid diagram JSON', () => {
        expect(() =>
            importDiagramFromJson('{bad', DatabaseType.POSTGRESQL)
        ).toThrow(ImportDiagramJsonError);
    });

    it('allows metadata with zero tables when structure is valid', async () => {
        const semantic = await semanticFromImportSchema(
            JSON.stringify({
                database_name: 'empty',
                version: '1',
                tables: [],
                columns: [],
                pk_info: [],
                indexes: [],
                fk_info: [],
                views: [],
            }),
            DatabaseType.POSTGRESQL
        );

        expect(semantic.tables).toHaveLength(0);
    });

    it('imports sqlite quoted identifiers', async () => {
        const semantic = await semanticFromSql(
            `CREATE TABLE "User Accounts" ("user id" INTEGER PRIMARY KEY);`,
            DatabaseType.SQLITE
        );

        const table = semantic.tables.find(
            (candidate) => candidate.name === 'User Accounts'
        );
        expect(table).toBeDefined();
        expect(table?.fields.some((field) => field.name === 'user id')).toBe(
            true
        );
    });
});
