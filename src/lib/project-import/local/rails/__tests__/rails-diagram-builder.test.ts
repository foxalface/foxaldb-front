import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { buildDiagramFromRailsSchema } from '../rails-diagram-builder';
import { parseRailsSchema } from '../rails-schema-parser';
import {
    COMPOSITE_INDEX_SCHEMA,
    IMPLICIT_ID_SCHEMA,
    NO_IMPLICIT_ID_SCHEMA,
    USERS_POSTS_SCHEMA,
} from './fixtures/rails-schemas';

describe('buildDiagramFromRailsSchema', () => {
    it('creates users/posts tables with FK relationship', () => {
        const document = parseRailsSchema(USERS_POSTS_SCHEMA);
        const { diagram } = buildDiagramFromRailsSchema(
            document,
            DatabaseType.POSTGRESQL,
            'rails-app'
        );
        const tables = diagram.tables ?? [];

        const users = tables.find((table) => table.name === 'users');
        const posts = tables.find((table) => table.name === 'posts');

        expect(users).toBeDefined();
        expect(posts).toBeDefined();
        expect(users?.fields.some((field) => field.name === 'id')).toBe(true);
        expect(posts?.fields.some((field) => field.name === 'user_id')).toBe(
            true
        );
        expect(diagram.relationships ?? []).toHaveLength(1);
        expect((diagram.relationships ?? [])[0].onDelete).toBe('cascade');
        expect(diagram.name).toBe('rails-app Import');
    });

    it('adds implicit bigint id primary key', () => {
        const document = parseRailsSchema(IMPLICIT_ID_SCHEMA);
        const { diagram } = buildDiagramFromRailsSchema(
            document,
            DatabaseType.POSTGRESQL,
            ''
        );

        const idField = (diagram.tables ?? [])[0].fields.find(
            (field) => field.name === 'id'
        );

        expect(idField?.primaryKey).toBe(true);
        expect(idField?.increment).toBe(true);
    });

    it('does not add implicit id when id:false', () => {
        const document = parseRailsSchema(NO_IMPLICIT_ID_SCHEMA);
        const { diagram } = buildDiagramFromRailsSchema(
            document,
            DatabaseType.POSTGRESQL,
            ''
        );

        const table = (diagram.tables ?? [])[0];
        expect(table.fields.some((field) => field.name === 'id')).toBe(false);
        expect(table.fields[0].primaryKey).toBe(true);
    });

    it('deduplicates inline and top-level indexes', () => {
        const document = parseRailsSchema(USERS_POSTS_SCHEMA);
        document.indexes.push({
            tableName: 'posts',
            columns: ['user_id'],
            unique: false,
            name: 'index_posts_on_user_id',
        });

        const { diagram } = buildDiagramFromRailsSchema(
            document,
            DatabaseType.POSTGRESQL,
            ''
        );

        const posts = (diagram.tables ?? []).find(
            (table) => table.name === 'posts'
        );
        const nonPkIndexes = posts?.indexes.filter(
            (index) => !index.isPrimaryKey
        );

        expect(nonPkIndexes).toHaveLength(1);
    });

    it('builds composite indexes with field IDs', () => {
        const document = parseRailsSchema(COMPOSITE_INDEX_SCHEMA);
        const { diagram } = buildDiagramFromRailsSchema(
            document,
            DatabaseType.POSTGRESQL,
            ''
        );

        const index = (diagram.tables ?? [])[0].indexes.find(
            (entry) => entry.fieldIds.length === 2
        );
        expect(index?.fieldIds).toHaveLength(2);
    });
});
