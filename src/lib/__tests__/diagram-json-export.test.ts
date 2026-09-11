import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { DBCustomTypeKind } from '@/lib/domain/db-custom-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';
import {
    DIAGRAM_JSON_ROOT_ID,
    DIAGRAM_JSON_SCHEMA_VERSION,
    diagramToJSONOutput,
} from '../export-import-utils';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const createSampleDiagram = (): Diagram => {
    const usersTable: DBTable = {
        id: 'table-users',
        name: 'users',
        x: 100,
        y: 200,
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
        checkConstraints: [
            {
                id: 'check-users-email',
                expression: "email <> ''",
                createdAt: 9,
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
        y: 200,
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
        y: 200,
        fields: [
            {
                id: 'field-post-stats-post-id',
                name: 'post_id',
                type: { id: 'bigint', name: 'bigint' },
                primaryKey: true,
                unique: true,
                nullable: false,
                createdAt: 10,
            },
        ],
        indexes: [],
        color: '#9bef8a',
        isView: true,
        createdAt: 11,
    };

    return {
        id: 'diagram-original',
        name: 'My Diagram',
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
                createdAt: 8,
            },
        ],
        dependencies: [
            {
                id: 'dep-post-stats-posts',
                tableId: 'table-posts',
                dependentTableId: 'table-post-stats',
                createdAt: 12,
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
        customTypes: [
            {
                id: 'type-user-status',
                name: 'user_status',
                kind: DBCustomTypeKind.enum,
                values: ['active', 'disabled'],
            },
        ],
        notes: [
            {
                id: 'note-1',
                content: 'Hello',
                x: 10,
                y: 10,
                width: 100,
                height: 50,
                color: '#ffffff',
            },
        ],
        createdAt,
        updatedAt: createdAt,
    };
};

describe('diagramToJSONOutput', () => {
    it('emits pretty-printed Diagram-shaped JSON with schemaVersion 1 and placeholder root id', () => {
        const json = diagramToJSONOutput(createSampleDiagram());
        const parsed = JSON.parse(json) as Record<string, unknown>;

        expect(json).toContain('\n');
        expect(parsed.diagram).toBeUndefined();
        expect(parsed.id).toBe(DIAGRAM_JSON_ROOT_ID);
        expect(parsed.id).toBe('diagram');
        expect(parsed.name).toBe('My Diagram');
        expect(parsed.databaseType).toBe(DatabaseType.POSTGRESQL);
        expect(parsed.schemaVersion).toBe(DIAGRAM_JSON_SCHEMA_VERSION);
        expect(parsed.schemaVersion).toBe(1);
        expect(Array.isArray(parsed.tables)).toBe(true);
        expect(Array.isArray(parsed.relationships)).toBe(true);
        expect((parsed.tables as unknown[]).length).toBe(3);
        expect((parsed.relationships as unknown[]).length).toBe(1);
        expect((parsed.areas as unknown[]).length).toBe(1);
        expect((parsed.notes as unknown[]).length).toBe(1);
        expect((parsed.customTypes as unknown[]).length).toBe(1);
        expect((parsed.dependencies as unknown[]).length).toBe(1);
        expect(parsed.createdAt).toBe('2024-01-01T00:00:00.000Z');
        expect(parsed.updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('preserves source internal IDs and nested references in the file', () => {
        const source = createSampleDiagram();
        const parsed = JSON.parse(diagramToJSONOutput(source)) as {
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
                checkConstraints?: Array<{
                    id: string;
                    expression: string;
                    createdAt: number;
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
            notes: Array<{ id: string }>;
            customTypes: Array<{ id: string }>;
        };

        expect(parsed.id).toBe('diagram');
        expect(parsed.id).not.toBe(source.id);

        const users = parsed.tables.find((table) => table.name === 'users');
        const posts = parsed.tables.find((table) => table.name === 'posts');
        const postStats = parsed.tables.find(
            (table) => table.name === 'post_stats'
        );
        const mainArea = parsed.areas.find((area) => area.name === 'Main');

        expect(users?.id).toBe('table-users');
        expect(posts?.id).toBe('table-posts');
        expect(postStats?.id).toBe('table-post-stats');
        expect(users?.fields[0]?.id).toBe('field-users-id');
        expect(users?.fields[1]?.id).toBe('field-users-email');
        expect(posts?.fields[0]?.id).toBe('field-posts-id');
        expect(posts?.fields[1]?.id).toBe('field-posts-user-id');
        expect(users?.indexes[0]?.id).toBe('index-users-pk');
        expect(users?.indexes[0]?.fieldIds).toEqual(['field-users-id']);
        expect(users?.indexes[0]?.name).toBe('users_pkey');
        expect(users?.checkConstraints?.[0]).toEqual({
            id: 'check-users-email',
            expression: "email <> ''",
            createdAt: 9,
        });

        expect(mainArea?.id).toBe('area-main');
        expect(users?.parentAreaId).toBe('area-main');
        expect(users?.parentAreaId).toBe(mainArea?.id);
        expect(parsed.notes[0]?.id).toBe('note-1');
        expect(parsed.customTypes[0]?.id).toBe('type-user-status');

        const relationship = parsed.relationships[0];
        expect(relationship.id).toBe('rel-posts-users');
        expect(relationship.sourceTableId).toBe('table-posts');
        expect(relationship.targetTableId).toBe('table-users');
        expect(relationship.sourceFieldId).toBe('field-posts-user-id');
        expect(relationship.targetFieldId).toBe('field-users-id');

        expect(parsed.dependencies[0]).toEqual({
            id: 'dep-post-stats-posts',
            tableId: 'table-posts',
            dependentTableId: 'table-post-stats',
            createdAt: 12,
        });
    });

    it('is deterministic for the same Diagram input', () => {
        const diagram = createSampleDiagram();

        expect(diagramToJSONOutput(diagram)).toBe(diagramToJSONOutput(diagram));
    });

    it('does not mutate the source Diagram', () => {
        const diagram = createSampleDiagram();
        const originalId = diagram.id;
        const originalTableId = diagram.tables?.[0]?.id;
        const originalParentAreaId = diagram.tables?.[0]?.parentAreaId;
        const originalPkName = diagram.tables?.[0]?.indexes[0]?.name;
        const originalCheckId = diagram.tables?.[0]?.checkConstraints?.[0]?.id;

        diagramToJSONOutput(diagram);

        expect(diagram.id).toBe(originalId);
        expect(diagram.tables?.[0]?.id).toBe(originalTableId);
        expect(diagram.tables?.[0]?.parentAreaId).toBe(originalParentAreaId);
        expect(diagram.tables?.[0]?.indexes[0]?.name).toBe(originalPkName);
        expect(diagram.tables?.[0]?.checkConstraints?.[0]?.id).toBe(
            originalCheckId
        );
    });
});
