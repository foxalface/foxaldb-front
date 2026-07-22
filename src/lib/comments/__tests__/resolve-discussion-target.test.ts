import { describe, expect, it } from 'vitest';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import {
    DIAGRAM_DISCUSSION_TARGET,
    resolveDiscussionTarget,
} from '../resolve-discussion-target';

const createField = (
    overrides: Partial<DBField> & Pick<DBField, 'id' | 'name'>
): DBField => ({
    type: { id: 'text', name: 'text' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
    ...overrides,
});

const createTable = (
    overrides: Partial<DBTable> & Pick<DBTable, 'id' | 'name'>
): DBTable => ({
    x: 0,
    y: 0,
    fields: [],
    indexes: [],
    color: '#ffffff',
    isView: false,
    createdAt: 0,
    ...overrides,
});

const createRelationship = (
    overrides: Partial<DBRelationship> & Pick<DBRelationship, 'id'>
): DBRelationship => ({
    name: '',
    sourceTableId: 'table-source',
    targetTableId: 'table-target',
    sourceFieldId: 'field-source',
    targetFieldId: 'field-target',
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 0,
    ...overrides,
});

describe('resolveDiscussionTarget', () => {
    it('resolves the diagram target', () => {
        expect(
            resolveDiscussionTarget(DIAGRAM_DISCUSSION_TARGET, {
                tables: [],
                relationships: [],
            })
        ).toEqual({ kind: 'diagram' });
    });

    it('resolves a table by id', () => {
        const tables = [createTable({ id: 'table-1', name: 'Clients' })];

        expect(
            resolveDiscussionTarget(
                { targetType: 'table', targetId: 'table-1' },
                { tables, relationships: [] }
            )
        ).toEqual({ kind: 'table', name: 'Clients' });
    });

    it('reflects renamed tables from current diagram data', () => {
        const tables = [createTable({ id: 'table-1', name: 'Customers' })];

        expect(
            resolveDiscussionTarget(
                { targetType: 'table', targetId: 'table-1' },
                { tables, relationships: [] }
            )
        ).toEqual({ kind: 'table', name: 'Customers' });
    });

    it('resolves a field with its parent table', () => {
        const tables = [
            createTable({
                id: 'table-1',
                name: 'Clients',
                fields: [createField({ id: 'field-1', name: 'email' })],
            }),
        ];

        expect(
            resolveDiscussionTarget(
                { targetType: 'field', targetId: 'field-1' },
                { tables, relationships: [] }
            )
        ).toEqual({
            kind: 'field',
            tableName: 'Clients',
            fieldName: 'email',
        });
    });

    it('reflects renamed fields from current diagram data', () => {
        const tables = [
            createTable({
                id: 'table-1',
                name: 'Clients',
                fields: [createField({ id: 'field-1', name: 'email_address' })],
            }),
        ];

        expect(
            resolveDiscussionTarget(
                { targetType: 'field', targetId: 'field-1' },
                { tables, relationships: [] }
            )
        ).toEqual({
            kind: 'field',
            tableName: 'Clients',
            fieldName: 'email_address',
        });
    });

    it('prefers a non-empty relationship name', () => {
        const tables = [
            createTable({ id: 'table-source', name: 'Orders' }),
            createTable({ id: 'table-target', name: 'Clients' }),
        ];
        const relationships = [
            createRelationship({
                id: 'rel-1',
                name: 'orders_clients_fk',
            }),
        ];

        expect(
            resolveDiscussionTarget(
                { targetType: 'relationship', targetId: 'rel-1' },
                { tables, relationships }
            )
        ).toEqual({
            kind: 'relationship',
            name: 'orders_clients_fk',
            sourceTableName: 'Orders',
            targetTableName: 'Clients',
        });
    });

    it('resolves unnamed relationships via endpoint table names', () => {
        const tables = [
            createTable({ id: 'table-source', name: 'Orders' }),
            createTable({ id: 'table-target', name: 'Clients' }),
        ];
        const relationships = [
            createRelationship({
                id: 'rel-1',
                name: '   ',
            }),
        ];

        expect(
            resolveDiscussionTarget(
                { targetType: 'relationship', targetId: 'rel-1' },
                { tables, relationships }
            )
        ).toEqual({
            kind: 'relationship',
            name: null,
            sourceTableName: 'Orders',
            targetTableName: 'Clients',
        });
    });

    it('keeps null endpoint names when source or target tables are missing', () => {
        const relationships = [
            createRelationship({
                id: 'rel-1',
                name: '',
                sourceTableId: 'missing-source',
                targetTableId: 'table-target',
            }),
        ];
        const tables = [createTable({ id: 'table-target', name: 'Clients' })];

        expect(
            resolveDiscussionTarget(
                { targetType: 'relationship', targetId: 'rel-1' },
                { tables, relationships }
            )
        ).toEqual({
            kind: 'relationship',
            name: null,
            sourceTableName: null,
            targetTableName: 'Clients',
        });
    });

    it('returns missing for an unknown table', () => {
        expect(
            resolveDiscussionTarget(
                { targetType: 'table', targetId: 'gone-table' },
                { tables: [], relationships: [] }
            )
        ).toEqual({ kind: 'missing', targetType: 'table' });
    });

    it('returns missing for an unknown field', () => {
        expect(
            resolveDiscussionTarget(
                { targetType: 'field', targetId: 'gone-field' },
                {
                    tables: [createTable({ id: 'table-1', name: 'Clients' })],
                    relationships: [],
                }
            )
        ).toEqual({ kind: 'missing', targetType: 'field' });
    });

    it('returns missing for an unknown relationship', () => {
        expect(
            resolveDiscussionTarget(
                { targetType: 'relationship', targetId: 'gone-rel' },
                { tables: [], relationships: [] }
            )
        ).toEqual({ kind: 'missing', targetType: 'relationship' });
    });

    it('does not include raw target ids in resolved display data', () => {
        const resolved = resolveDiscussionTarget(
            { targetType: 'table', targetId: 'raw-table-id-xyz' },
            {
                tables: [
                    createTable({ id: 'raw-table-id-xyz', name: 'Clients' }),
                ],
                relationships: [],
            }
        );

        expect(JSON.stringify(resolved)).not.toContain('raw-table-id-xyz');
    });

    it('treats whitespace-only relationship names as unnamed', () => {
        const tables = [
            createTable({ id: 'table-source', name: 'Orders' }),
            createTable({ id: 'table-target', name: 'Clients' }),
        ];
        const relationships = [
            createRelationship({
                id: 'rel-1',
                name: '\t  \n',
            }),
        ];

        expect(
            resolveDiscussionTarget(
                { targetType: 'relationship', targetId: 'rel-1' },
                { tables, relationships }
            )
        ).toEqual({
            kind: 'relationship',
            name: null,
            sourceTableName: 'Orders',
            targetTableName: 'Clients',
        });
    });

    it('returns null endpoint names when both relationship tables are missing', () => {
        const relationships = [
            createRelationship({
                id: 'rel-missing-ends',
                name: '',
                sourceTableId: 'gone-source',
                targetTableId: 'gone-target',
            }),
        ];

        const resolved = resolveDiscussionTarget(
            { targetType: 'relationship', targetId: 'rel-missing-ends' },
            { tables: [], relationships }
        );

        expect(resolved).toEqual({
            kind: 'relationship',
            name: null,
            sourceTableName: null,
            targetTableName: null,
        });
        expect(JSON.stringify(resolved)).not.toContain('gone-source');
        expect(JSON.stringify(resolved)).not.toContain('gone-target');
        expect(JSON.stringify(resolved)).not.toContain('rel-missing-ends');
    });

    it('keeps empty table and field names without falling back to raw ids', () => {
        const tables = [
            createTable({
                id: 'table-empty',
                name: '',
                fields: [createField({ id: 'field-empty', name: '   ' })],
            }),
        ];

        expect(
            resolveDiscussionTarget(
                { targetType: 'table', targetId: 'table-empty' },
                { tables, relationships: [] }
            )
        ).toEqual({ kind: 'table', name: '' });

        const fieldResolved = resolveDiscussionTarget(
            { targetType: 'field', targetId: 'field-empty' },
            { tables, relationships: [] }
        );
        expect(fieldResolved).toEqual({
            kind: 'field',
            tableName: '',
            fieldName: '   ',
        });
        expect(JSON.stringify(fieldResolved)).not.toContain('table-empty');
        expect(JSON.stringify(fieldResolved)).not.toContain('field-empty');
    });
});
