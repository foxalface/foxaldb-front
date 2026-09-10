import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';
import {
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

    return {
        id: 'diagram-original',
        name: 'My Diagram',
        databaseType: DatabaseType.POSTGRESQL,
        tables: [usersTable, postsTable],
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
        dependencies: [],
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
        customTypes: [],
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
    it('emits pretty-printed Diagram-shaped JSON with schemaVersion 1', () => {
        const json = diagramToJSONOutput(createSampleDiagram());
        const parsed = JSON.parse(json) as Record<string, unknown>;

        expect(json).toContain('\n');
        expect(parsed.diagram).toBeUndefined();
        expect(parsed.id).toBeDefined();
        expect(parsed.name).toBe('My Diagram');
        expect(parsed.databaseType).toBe(DatabaseType.POSTGRESQL);
        expect(parsed.schemaVersion).toBe(DIAGRAM_JSON_SCHEMA_VERSION);
        expect(parsed.schemaVersion).toBe(1);
        expect(Array.isArray(parsed.tables)).toBe(true);
        expect(Array.isArray(parsed.relationships)).toBe(true);
        expect((parsed.tables as unknown[]).length).toBe(2);
        expect((parsed.relationships as unknown[]).length).toBe(1);
        expect((parsed.areas as unknown[]).length).toBe(1);
        expect((parsed.notes as unknown[]).length).toBe(1);
    });

    it('keeps current running-id remumbering and coherent relationship references', () => {
        const parsed = JSON.parse(
            diagramToJSONOutput(createSampleDiagram())
        ) as {
            id: string;
            tables: Array<{
                id: string;
                name: string;
                fields: Array<{ id: string; name: string }>;
            }>;
            relationships: Array<{
                id: string;
                sourceTableId: string;
                targetTableId: string;
                sourceFieldId: string;
                targetFieldId: string;
            }>;
        };

        expect(parsed.id).toBe('0');

        const users = parsed.tables.find((table) => table.name === 'users');
        const posts = parsed.tables.find((table) => table.name === 'posts');
        expect(users?.id).toBe('1');
        expect(posts?.id).toBe('5');

        const usersId = users?.fields.find((field) => field.name === 'id');
        const postsUserId = posts?.fields.find(
            (field) => field.name === 'user_id'
        );
        const relationship = parsed.relationships[0];

        expect(relationship.sourceTableId).toBe(posts?.id);
        expect(relationship.targetTableId).toBe(users?.id);
        expect(relationship.sourceFieldId).toBe(postsUserId?.id);
        expect(relationship.targetFieldId).toBe(usersId?.id);
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

        diagramToJSONOutput(diagram);

        expect(diagram.id).toBe(originalId);
        expect(diagram.tables?.[0]?.id).toBe(originalTableId);
        expect(diagram.tables?.[0]?.parentAreaId).toBe(originalParentAreaId);
        expect(diagram.tables?.[0]?.indexes[0]?.name).toBe(originalPkName);
    });

    it('characterizes deferred JSON-B clone behavior for parentAreaId and PK index names', () => {
        const parsed = JSON.parse(
            diagramToJSONOutput(createSampleDiagram())
        ) as {
            tables: Array<{
                name: string;
                parentAreaId?: string | null;
                indexes: Array<{ name: string; isPrimaryKey?: boolean }>;
            }>;
            areas: Array<{ id: string; name: string }>;
        };

        const users = parsed.tables.find((table) => table.name === 'users');
        const mainArea = parsed.areas.find((area) => area.name === 'Main');

        expect(mainArea?.id).not.toBe('area-main');
        expect(users?.parentAreaId).toBe('area-main');
        expect(users?.parentAreaId).not.toBe(mainArea?.id);
        expect(users?.indexes[0]?.name).toBe('');
    });
});
