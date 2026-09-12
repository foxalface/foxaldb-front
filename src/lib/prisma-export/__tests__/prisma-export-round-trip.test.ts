import { describe, expect, it } from 'vitest';
import { buildDiagramFromPrismaSchema } from '@/lib/project-import/local/prisma/prisma-diagram-builder';
import { parsePrismaSchemaDocument } from '@/lib/project-import/local/prisma/prisma-schema-parser';
import { QA_PRISMA_SCHEMA } from '@/lib/project-import/local/prisma/__tests__/fixtures/m10-realistic-fixtures';
import {
    compositePkSchema,
    enumSchema,
    usersPostsSchema,
} from '@/lib/project-import/local/prisma/__tests__/fixtures/prisma-schemas';
import { generatePrismaSchemaFromDiagram } from '../generate-prisma-schema-from-diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import { PRISMA_V7_SCHEMA } from './fixtures/prisma-v7-schema';

const importSchema = (source: string, databaseType: DatabaseType) => {
    const document = parsePrismaSchemaDocument(source);
    const { diagram } = buildDiagramFromPrismaSchema(
        document,
        databaseType,
        'app'
    );

    return diagram;
};

const exportAndReimport = (
    diagram: ReturnType<typeof importSchema>,
    version: '6' | '7'
) => {
    const exported = generatePrismaSchemaFromDiagram({ diagram, version });
    expect(exported.success).toBe(true);
    if (!exported.success) {
        throw new Error(exported.error.message);
    }

    const reimported = importSchema(exported.schema, diagram.databaseType);

    return { exported, reimported };
};

const tableNames = (diagram: ReturnType<typeof importSchema>): string[] =>
    (diagram.tables ?? []).map((table) => table.name).sort();

const fieldNames = (
    diagram: ReturnType<typeof importSchema>,
    tableName: string
): string[] => {
    const table = diagram.tables?.find((entry) => entry.name === tableName);

    return (table?.fields ?? []).map((field) => field.name).sort();
};

describe('Prisma export round-trip', () => {
    it('import v6 -> export v6 -> import preserves core semantics', () => {
        const original = importSchema(QA_PRISMA_SCHEMA, DatabaseType.MYSQL);
        const { reimported } = exportAndReimport(original, '6');

        expect(tableNames(reimported)).toEqual(['posts', 'users']);
        expect(fieldNames(reimported, 'users')).toEqual(['email', 'id']);
        expect(fieldNames(reimported, 'posts')).toEqual([
            'id',
            'title',
            'user_id',
        ]);
        expect(reimported.relationships?.length).toBe(1);
        expect(reimported.relationships?.[0]?.onDelete).toBe('cascade');
    });

    it('import v6 -> export v7 -> import preserves core semantics', () => {
        const original = importSchema(
            usersPostsSchema,
            DatabaseType.POSTGRESQL
        );
        const { reimported } = exportAndReimport(original, '7');

        expect(tableNames(reimported)).toEqual(['Post', 'User']);
        expect(reimported.relationships?.length).toBe(1);
    });

    it('import v7 fixture -> export v6 -> import preserves core semantics', () => {
        const original = importSchema(
            PRISMA_V7_SCHEMA,
            DatabaseType.POSTGRESQL
        );
        const { reimported } = exportAndReimport(original, '6');

        expect(tableNames(reimported)).toEqual(['Post', 'User']);
        expect(reimported.relationships?.length).toBe(1);
    });

    it('import v7 fixture -> export v7 -> import preserves core semantics', () => {
        const original = importSchema(
            PRISMA_V7_SCHEMA,
            DatabaseType.POSTGRESQL
        );
        const { reimported } = exportAndReimport(original, '7');

        expect(tableNames(reimported)).toEqual(['Post', 'User']);
        expect(reimported.relationships?.length).toBe(1);
    });

    it('preserves enums and composite PK through export', () => {
        const enumDiagram = importSchema(enumSchema, DatabaseType.POSTGRESQL);
        const enumExported = generatePrismaSchemaFromDiagram({
            diagram: enumDiagram,
            version: '7',
        });

        expect(enumExported.success).toBe(true);
        if (!enumExported.success) return;

        const enumReimported = importSchema(
            enumExported.schema,
            DatabaseType.POSTGRESQL
        );
        expect(enumReimported.customTypes?.[0]?.values).toEqual([
            'USER',
            'admin',
        ]);

        const pkDiagram = importSchema(
            compositePkSchema,
            DatabaseType.POSTGRESQL
        );
        const pkExported = generatePrismaSchemaFromDiagram({
            diagram: pkDiagram,
            version: '6',
        });

        expect(pkExported.success).toBe(true);
        if (!pkExported.success) return;

        const pkReimported = importSchema(
            pkExported.schema,
            DatabaseType.POSTGRESQL
        );
        const membership = pkReimported.tables?.[0];
        const pkFields =
            membership?.fields.filter((field) => field.primaryKey) ?? [];

        expect(pkFields).toHaveLength(2);
    });
});

describe('Prisma export production isolation', () => {
    it('generator module does not import project-import production code', async () => {
        const module = await import('../generate-prisma-schema-from-diagram');

        expect(module.generatePrismaSchemaFromDiagram).toBeTypeOf('function');
        expect(Object.keys(module)).not.toContain('parsePrismaSchemaDocument');
        expect(Object.keys(module)).not.toContain(
            'buildDiagramFromPrismaSchema'
        );
    });
});
