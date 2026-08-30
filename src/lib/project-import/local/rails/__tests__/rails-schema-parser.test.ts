import { describe, expect, it } from 'vitest';
import { parseRailsSchema } from '../rails-schema-parser';
import {
    COMPOSITE_INDEX_SCHEMA,
    CUSTOM_PRIMARY_KEY_SCHEMA,
    IMPLICIT_ID_SCHEMA,
    MALFORMED_SCHEMA,
    MULTILINE_SCHEMA,
    NO_IMPLICIT_ID_SCHEMA,
    REFERENCES_SCHEMA,
    SCALAR_TYPES_SCHEMA,
    UNKNOWN_HELPER_SCHEMA,
    USERS_POSTS_SCHEMA,
} from './fixtures/rails-schemas';

describe('parseRailsSchema', () => {
    it('parses users/posts schema with foreign key metadata', () => {
        const document = parseRailsSchema(USERS_POSTS_SCHEMA);

        expect(document.version).toBe('2025_01_01_000000');
        expect(document.tables).toHaveLength(2);
        expect(document.foreignKeys).toHaveLength(1);
        expect(document.foreignKeys[0]).toMatchObject({
            fromTable: 'posts',
            toTable: 'users',
            column: 'user_id',
            onDelete: 'cascade',
        });
    });

    it('parses implicit id tables', () => {
        const document = parseRailsSchema(IMPLICIT_ID_SCHEMA);
        const widgets = document.tables[0];

        expect(widgets.name).toBe('widgets');
        expect(widgets.options.id).toBeUndefined();
        expect(widgets.columns).toHaveLength(1);
    });

    it('parses id:false tables', () => {
        const document = parseRailsSchema(NO_IMPLICIT_ID_SCHEMA);
        expect(document.tables[0].options.id).toBe(false);
    });

    it('parses custom primary key option', () => {
        const document = parseRailsSchema(CUSTOM_PRIMARY_KEY_SCHEMA);
        expect(document.tables[0].options.primaryKey).toBe('legacy_id');
    });

    it('parses scalar column helpers and options', () => {
        const document = parseRailsSchema(SCALAR_TYPES_SCHEMA);
        const columns = document.tables[0].columns;

        expect(columns.map((column) => column.type)).toEqual([
            'string',
            'text',
            'integer',
            'bigint',
            'float',
            'decimal',
            'boolean',
            'date',
            'datetime',
            'binary',
            'json',
            'jsonb',
            'uuid',
        ]);
        expect(columns[0].options.limit).toBe(12);
        expect(columns[5].options.precision).toBe(12);
        expect(columns[5].options.scale).toBe(4);
        expect(columns[5].options.default).toBe('0.0');
    });

    it('parses composite inline indexes', () => {
        const document = parseRailsSchema(COMPOSITE_INDEX_SCHEMA);
        expect(document.tables[0].inlineIndexes[0]).toMatchObject({
            columns: ['tenant_id', 'user_id'],
            unique: true,
            name: 'index_memberships_on_tenant_id_and_user_id',
        });
    });

    it('parses multiline column declarations', () => {
        const document = parseRailsSchema(MULTILINE_SCHEMA);
        expect(document.tables[0].columns[0]).toMatchObject({
            name: 'title',
            options: {
                null: false,
                comment: 'contains do/end in comment # end',
            },
        });
    });

    it('parses references helper as bigint foreign key column', () => {
        const document = parseRailsSchema(REFERENCES_SCHEMA);
        const comments = document.tables.find(
            (table) => table.name === 'comments'
        );

        expect(comments?.columns[0]).toMatchObject({
            name: 'post_id',
            type: 'bigint',
        });
    });

    it('throws on malformed schema blocks', () => {
        expect(() => parseRailsSchema(MALFORMED_SCHEMA)).toThrow();
    });

    it('ignores unknown helpers without failing the table', () => {
        const document = parseRailsSchema(UNKNOWN_HELPER_SCHEMA);
        expect(document.tables[0].columns).toHaveLength(1);
        expect(document.tables[0].columns[0].name).toBe('name');
    });
});
