import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import {
    createFilterGroup,
    emptyFilterGroup,
    type FilterCondition,
    type FilterGroup,
    type TagFilterOperator,
} from '@/lib/domain/filter-expression';
import { projectStructuralExport as projectStructuralExportResult } from '@/lib/domain/structural-export-projection';
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
        { id: 'red', name: 'Red' },
        { id: 'blue', name: 'Blue' },
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

const projectStructuralExport = (
    diagram: Diagram,
    expression: FilterGroup
): Diagram => {
    const result = projectStructuralExportResult(diagram, expression);

    if (result.status !== 'ready') {
        throw new Error(result.status);
    }

    return result.diagram;
};

const tableTag = (
    tagIds: readonly string[],
    operator: TagFilterOperator
): FilterCondition => ({
    kind: 'condition',
    id: `table-${operator}`,
    target: 'table',
    property: 'tag',
    operator,
    value: tagIds,
});

const dbmlFor = async (expression: FilterCondition): Promise<string> => {
    const result = await generateDBMLFromDiagram(
        projectStructuralExport(
            diagram,
            createFilterGroup('and', [expression], 'root')
        )
    );

    expect(result.error).toBeUndefined();

    return result.standardDbml;
};

describe('DBML export consumes the structural projection', () => {
    it('keeps the full DBML for an unconstrained expression', async () => {
        const full = await generateDBMLFromDiagram(diagram);
        const emptySelection = await generateDBMLFromDiagram(
            projectStructuralExport(diagram, emptyFilterGroup())
        );

        expect(emptySelection.standardDbml).toBe(full.standardDbml);
        expect(emptySelection.standardDbml).toContain('users');
        expect(emptySelection.standardDbml).toContain('orders');
        expect(emptySelection.standardDbml).toContain('invoices');
    });

    it('exports table tag any, all, and none with table-level structural rules', async () => {
        const anyRed = await dbmlFor(tableTag(['red'], 'is_any_of'));
        const allTags = await dbmlFor(tableTag(['red', 'blue'], 'is_all_of'));
        const noneRed = await dbmlFor(tableTag(['red'], 'is_none_of'));

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
