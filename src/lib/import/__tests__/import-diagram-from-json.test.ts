import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { diagramJsonSample } from '@/lib/import/__tests__/fixtures/import-samples';
import {
    ImportDiagramJsonError,
    importDiagramFromJson,
} from '../import-diagram-from-json';
import {
    diagramFromJSONInput,
    diagramToJSONOutput,
} from '@/lib/export-import-utils';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const jsonARunningIdFile = JSON.stringify(
    {
        id: '0',
        name: 'Users Schema',
        databaseType: 'postgresql',
        tables: [
            {
                id: '1',
                name: 'users',
                x: 10,
                y: 20,
                fields: [
                    {
                        id: '2',
                        name: 'id',
                        type: { id: 'bigint', name: 'bigint' },
                        primaryKey: true,
                        unique: true,
                        nullable: false,
                        createdAt: 1,
                    },
                ],
                indexes: [],
                color: '#ffe374',
                isView: false,
                createdAt: 2,
            },
        ],
        relationships: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaVersion: 1,
    },
    null,
    2
);

const createJsonBSource = (): Diagram => {
    const usersTable: DBTable = {
        id: 'table-users',
        name: 'users',
        x: 10,
        y: 20,
        fields: [
            {
                id: 'field-users-id',
                name: 'id',
                type: { id: 'bigint', name: 'bigint' },
                primaryKey: true,
                unique: true,
                nullable: false,
                createdAt: 1,
            },
            {
                id: 'field-users-email',
                name: 'email',
                type: { id: 'varchar', name: 'varchar' },
                primaryKey: false,
                unique: true,
                nullable: false,
                createdAt: 2,
            },
        ],
        indexes: [
            {
                id: 'index-users-pk',
                name: 'users_pkey',
                unique: true,
                fieldIds: ['field-users-id'],
                createdAt: 3,
                isPrimaryKey: true,
            },
        ],
        color: '#ffe374',
        isView: false,
        createdAt: 4,
        parentAreaId: 'area-main',
    };

    const postsTable: DBTable = {
        id: 'table-posts',
        name: 'posts',
        x: 400,
        y: 20,
        fields: [
            {
                id: 'field-posts-id',
                name: 'id',
                type: { id: 'bigint', name: 'bigint' },
                primaryKey: true,
                unique: true,
                nullable: false,
                createdAt: 5,
            },
            {
                id: 'field-posts-user-id',
                name: 'user_id',
                type: { id: 'bigint', name: 'bigint' },
                primaryKey: false,
                unique: false,
                nullable: false,
                createdAt: 6,
            },
        ],
        indexes: [],
        color: '#8aafff',
        isView: false,
        createdAt: 7,
    };

    const postStatsTable: DBTable = {
        id: 'table-post-stats',
        name: 'post_stats',
        x: 700,
        y: 20,
        fields: [
            {
                id: 'field-post-stats-post-id',
                name: 'post_id',
                type: { id: 'bigint', name: 'bigint' },
                primaryKey: true,
                unique: true,
                nullable: false,
                createdAt: 8,
            },
        ],
        indexes: [],
        color: '#9bef8a',
        isView: true,
        createdAt: 9,
    };

    return {
        id: 'source-diagram',
        name: 'Users Schema',
        databaseType: DatabaseType.POSTGRESQL,
        tables: [usersTable, postsTable, postStatsTable],
        relationships: [
            {
                id: 'rel-posts-users',
                name: 'posts_user_id_fk',
                sourceTableId: 'table-posts',
                targetTableId: 'table-users',
                sourceFieldId: 'field-posts-user-id',
                targetFieldId: 'field-users-id',
                sourceCardinality: 'many',
                targetCardinality: 'one',
                createdAt: 10,
            },
        ],
        dependencies: [
            {
                id: 'dep-post-stats-posts',
                tableId: 'table-posts',
                dependentTableId: 'table-post-stats',
                createdAt: 11,
            },
        ],
        areas: [
            {
                id: 'area-main',
                name: 'Main',
                x: 0,
                y: 0,
                width: 800,
                height: 600,
                color: '#aabbcc',
            },
        ],
        createdAt,
        updatedAt: createdAt,
    };
};

describe('importDiagramFromJson', () => {
    it('imports a diagram and applies the chosen database type', () => {
        const diagram = importDiagramFromJson(
            diagramJsonSample,
            DatabaseType.MYSQL
        );

        expect(diagram.databaseType).toBe(DatabaseType.MYSQL);
        expect(diagram.name).toBe('Imported Diagram');
        expect(diagram.tables).toEqual([]);
    });

    it('imports legacy unversioned Diagram JSON into a new root identity', () => {
        const diagram = importDiagramFromJson(
            diagramJsonSample,
            DatabaseType.POSTGRESQL
        );

        expect(JSON.parse(diagramJsonSample).schemaVersion).toBeUndefined();
        expect(diagram.name).toBe('Imported Diagram');
        expect(diagram.id).not.toBe('diagram-1');
    });

    it('imports JSON-A schemaVersion 1 running-ID JSON into a new root identity', () => {
        const parsedExport = JSON.parse(jsonARunningIdFile) as {
            schemaVersion: number;
            id: string;
            tables: Array<{ id: string }>;
        };

        expect(parsedExport.schemaVersion).toBe(1);
        expect(parsedExport.id).toBe('0');
        expect(parsedExport.tables[0]?.id).toBe('1');

        const imported = diagramFromJSONInput(jsonARunningIdFile);

        expect(imported.name).toBe('Users Schema');
        expect(imported.id).not.toBe(parsedExport.id);
        expect(imported.tables?.[0]?.name).toBe('users');
        expect(imported.tables?.[0]?.id).not.toBe(parsedExport.tables[0]?.id);
    });

    it('imports JSON-B stable-ID JSON, remaps identities, and keeps references coherent', () => {
        const source = createJsonBSource();
        const exported = diagramToJSONOutput(source);
        const parsedExport = JSON.parse(exported) as {
            schemaVersion: number;
            id: string;
            tables: Array<{
                id: string;
                name: string;
                parentAreaId?: string | null;
                fields: Array<{ id: string; name: string }>;
                indexes: Array<{
                    id: string;
                    name: string;
                    fieldIds: string[];
                    isPrimaryKey?: boolean;
                }>;
            }>;
            relationships: Array<{
                id: string;
                sourceTableId: string;
                targetTableId: string;
                sourceFieldId: string;
                targetFieldId: string;
            }>;
            dependencies: Array<{
                id: string;
                tableId: string;
                dependentTableId: string;
            }>;
            areas: Array<{ id: string; name: string }>;
        };

        expect(parsedExport.schemaVersion).toBe(1);
        expect(parsedExport.id).toBe('diagram');
        expect(parsedExport.tables[0]?.id).toBe('table-users');

        const imported = diagramFromJSONInput(exported);
        const importedUsers = imported.tables?.find(
            (table) => table.name === 'users'
        );
        const importedPosts = imported.tables?.find(
            (table) => table.name === 'posts'
        );
        const importedPostStats = imported.tables?.find(
            (table) => table.name === 'post_stats'
        );
        const importedArea = imported.areas?.find(
            (area) => area.name === 'Main'
        );
        const importedUsersId = importedUsers?.fields.find(
            (field) => field.name === 'id'
        );
        const importedPostsUserId = importedPosts?.fields.find(
            (field) => field.name === 'user_id'
        );
        const importedRelationship = imported.relationships?.[0];
        const importedDependency = imported.dependencies?.[0];
        const importedPk = importedUsers?.indexes.find(
            (index) => index.isPrimaryKey
        );

        expect(imported.name).toBe('Users Schema');
        expect(imported.id).not.toBe(parsedExport.id);
        expect(imported.id).not.toBe(source.id);
        expect(importedUsers?.id).not.toBe('table-users');
        expect(importedPosts?.id).not.toBe('table-posts');
        expect(importedArea?.id).not.toBe('area-main');
        expect(importedUsers?.parentAreaId).toBe(importedArea?.id);
        expect(importedUsers?.parentAreaId).not.toBe('area-main');
        expect(importedPk?.name).toBe('');

        expect(importedRelationship?.id).not.toBe('rel-posts-users');
        expect(importedRelationship?.sourceTableId).toBe(importedPosts?.id);
        expect(importedRelationship?.targetTableId).toBe(importedUsers?.id);
        expect(importedRelationship?.sourceFieldId).toBe(
            importedPostsUserId?.id
        );
        expect(importedRelationship?.targetFieldId).toBe(importedUsersId?.id);
        expect(importedUsers?.indexes[0]?.fieldIds).toEqual([
            importedUsersId?.id,
        ]);

        expect(importedDependency?.id).not.toBe('dep-post-stats-posts');
        expect(importedDependency?.tableId).toBe(importedPosts?.id);
        expect(importedDependency?.dependentTableId).toBe(
            importedPostStats?.id
        );
    });

    it('throws when the JSON is invalid', () => {
        expect(() =>
            importDiagramFromJson('{ invalid', DatabaseType.POSTGRESQL)
        ).toThrow(ImportDiagramJsonError);
    });
});
