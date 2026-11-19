import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import { projectDiagramForStructuralExport } from '@/lib/domain/structural-export-scope';
import { generateDBMLFromDiagram } from '../dbml-export';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const field = (
    id: string,
    name: string,
    primaryKey = false
): DBTable['fields'][number] => ({
    id,
    name,
    type: { id: 'bigint', name: 'bigint' },
    primaryKey,
    unique: primaryKey,
    nullable: !primaryKey,
    createdAt: 1,
});

const table = (overrides: Partial<DBTable>): DBTable => ({
    id: overrides.id ?? 'table',
    name: overrides.name ?? 'table',
    x: 0,
    y: 0,
    fields: [],
    indexes: [],
    color: '#8eb7ff',
    isView: false,
    createdAt: 1,
    ...overrides,
});

const users = table({
    id: 'users',
    name: 'users',
    fields: [field('users-id', 'id', true), field('users-email', 'email')],
});
const orders = table({
    id: 'orders',
    name: 'orders',
    fields: [
        field('orders-id', 'id', true),
        field('orders-user', 'user_id'),
        field('orders-note', 'note'),
    ],
});
const invoices = table({
    id: 'invoices',
    name: 'invoices',
    fields: [field('invoices-id', 'id', true)],
});

const usersOrders: DBRelationship = {
    id: 'rel-users-orders',
    name: 'users_orders',
    sourceTableId: 'users',
    targetTableId: 'orders',
    sourceFieldId: 'users-id',
    targetFieldId: 'orders-user',
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 1,
};
const usersInvoices: DBRelationship = {
    id: 'rel-users-invoices',
    name: 'users_invoices',
    sourceTableId: 'users',
    targetTableId: 'invoices',
    sourceFieldId: 'users-id',
    targetFieldId: 'invoices-id',
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 1,
};

const diagram: Diagram = {
    id: 'diagram-1',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [users, orders, invoices],
    relationships: [usersOrders, usersInvoices],
    tags: [
        { id: 'red', name: 'Red', color: '#ff0000' },
        { id: 'blue', name: 'Blue', color: '#0000ff' },
    ],
    tagAssignments: [
        {
            id: 'a-users-red',
            tagId: 'red',
            targetType: 'table',
            targetId: 'users',
        },
        {
            id: 'a-users-blue',
            tagId: 'blue',
            targetType: 'table',
            targetId: 'users',
        },
        {
            id: 'a-invoices-red',
            tagId: 'red',
            targetType: 'table',
            targetId: 'invoices',
        },
        {
            id: 'a-orders-note',
            tagId: 'red',
            targetType: 'field',
            targetId: 'orders-note',
        },
        {
            id: 'a-rel',
            tagId: 'red',
            targetType: 'relationship',
            targetId: 'rel-users-orders',
        },
    ],
    createdAt,
    updatedAt: createdAt,
};

const dbmlFor = async (
    scope: Parameters<typeof projectDiagramForStructuralExport>[1]
): Promise<string> => {
    const result = await generateDBMLFromDiagram(
        projectDiagramForStructuralExport(diagram, scope)
    );

    expect(result.error).toBeUndefined();

    return result.standardDbml;
};

describe('DBML export consumes the structural projection', () => {
    it('keeps the full DBML for the full scope and an empty tag selection', async () => {
        const full = await generateDBMLFromDiagram(diagram);
        const emptySelection = await dbmlFor({
            kind: 'tags',
            selectedTagIds: [],
            matchMode: 'none',
        });

        expect(emptySelection).toBe(full.standardDbml);
        expect(emptySelection).toContain('users');
        expect(emptySelection).toContain('orders');
        expect(emptySelection).toContain('invoices');
    });

    it('exports ANY, ALL, and NONE with the same table and relationship rules as SQL', async () => {
        const anyRed = await dbmlFor({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'any',
        });
        const allTags = await dbmlFor({
            kind: 'tags',
            selectedTagIds: ['red', 'blue'],
            matchMode: 'all',
        });
        const noneRed = await dbmlFor({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'none',
        });

        expect(anyRed).toContain('Table "users"');
        expect(anyRed).toContain('email');
        expect(anyRed).toContain('Table "invoices"');
        expect(anyRed).not.toContain('"orders"');
        expect(anyRed).toContain('Ref');
        expect(allTags).toContain('Table "users"');
        expect(allTags).not.toContain('"invoices"');
        expect(allTags).not.toContain('"orders"');
        expect(allTags).not.toContain('Ref');
        expect(noneRed).toContain('Table "orders"');
        expect(noneRed).toContain('note');
        expect(noneRed).not.toContain('Table "users"');
        expect(noneRed).not.toContain('"invoices"');
    });
});
