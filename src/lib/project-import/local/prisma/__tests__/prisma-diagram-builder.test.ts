import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { buildDiagramFromPrismaSchema } from '../prisma-diagram-builder';
import { parsePrismaSchemaDocument } from '../prisma-schema-parser';
import {
    compositePkSchema,
    compositeRelationSchema,
    datasourceMismatchSchema,
    enumSchema,
    implicitRelationSchema,
    mappedNamesSchema,
    nativeTypesSchema,
    usersPostsSchema,
} from './fixtures/prisma-schemas';

const databaseTypes = [
    DatabaseType.MYSQL,
    DatabaseType.POSTGRESQL,
    DatabaseType.SQLITE,
    DatabaseType.SQL_SERVER,
    DatabaseType.MARIADB,
    DatabaseType.ORACLE,
] as const;

describe('buildDiagramFromPrismaSchema', () => {
    it('maps users/posts to tables, scalar FK, and relationship', () => {
        const document = parsePrismaSchemaDocument(usersPostsSchema);
        const { diagram } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.POSTGRESQL,
            'apps/api'
        );

        expect(diagram.name).toBe('api Import');
        expect(diagram.tables?.map((table) => table.name).sort()).toEqual([
            'Post',
            'User',
        ]);

        const postTable = diagram.tables?.find(
            (table) => table.name === 'Post'
        );
        expect(
            postTable?.fields.some((field) => field.name === 'authorId')
        ).toBe(true);
        expect(postTable?.fields.some((field) => field.name === 'author')).toBe(
            false
        );
        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0].onDelete).toBe('cascade');
    });

    it('uses physical names from @map and @@map', () => {
        const document = parsePrismaSchemaDocument(mappedNamesSchema);
        const { diagram } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.MYSQL,
            ''
        );

        expect(diagram.tables?.[0].name).toBe('users');
        expect(diagram.tables?.[0].fields[0].name).toBe('email_address');
    });

    it('preserves enum values in customTypes', () => {
        const document = parsePrismaSchemaDocument(enumSchema);
        const { diagram } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.POSTGRESQL,
            ''
        );

        expect(diagram.customTypes?.[0]).toMatchObject({
            name: 'Role',
            values: ['USER', 'admin'],
        });
        expect(diagram.tables?.[0].fields[1].type.id).toBe('Role');
    });

    it('creates composite primary key indexes', () => {
        const document = parsePrismaSchemaDocument(compositePkSchema);
        const { diagram } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.POSTGRESQL,
            ''
        );

        const pkIndex = diagram.tables?.[0].indexes.find(
            (index) => index.isPrimaryKey
        );
        expect(pkIndex?.fieldIds).toHaveLength(2);
    });

    it('creates one relationship per composite FK field pair', () => {
        const document = parsePrismaSchemaDocument(compositeRelationSchema);
        const { diagram } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.POSTGRESQL,
            ''
        );

        expect(diagram.relationships).toHaveLength(2);
    });

    it('emits datasource mismatch diagnostics without overriding databaseType', () => {
        const document = parsePrismaSchemaDocument(datasourceMismatchSchema);
        const { diagram, diagnostics } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.MYSQL,
            ''
        );

        expect(diagram.databaseType).toBe(DatabaseType.MYSQL);
        expect(
            diagnostics.some(
                (entry) => entry.code === 'prisma_datasource_mismatch'
            )
        ).toBe(true);
    });

    it('emits implicit relation diagnostics', () => {
        const document = parsePrismaSchemaDocument(implicitRelationSchema);
        const { diagnostics } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.POSTGRESQL,
            ''
        );

        expect(
            diagnostics.some(
                (entry) => entry.code === 'prisma_implicit_relation_ignored'
            )
        ).toBe(true);
    });

    it.each(databaseTypes)(
        'maps native bytes/json types for %s without changing target database',
        (databaseType) => {
            const document = parsePrismaSchemaDocument(nativeTypesSchema);
            const { diagram } = buildDiagramFromPrismaSchema(
                document,
                databaseType,
                ''
            );

            expect(diagram.databaseType).toBe(databaseType);

            const blobField = diagram.tables?.[0].fields.find(
                (field) => field.name === 'blob'
            );
            const dataField = diagram.tables?.[0].fields.find(
                (field) => field.name === 'data'
            );

            expect(blobField?.type.id).toBeTruthy();
            expect(dataField?.type.id).toBeTruthy();
        }
    );
});
