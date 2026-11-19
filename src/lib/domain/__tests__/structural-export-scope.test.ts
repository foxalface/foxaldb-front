import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    DBCustomTypeKind,
    type DBCustomType,
} from '@/lib/domain/db-custom-type';
import type { DBDependency } from '@/lib/domain/db-dependency';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import type { Area } from '@/lib/domain/area';
import type {
    DiagramTag,
    DiagramTagAssignment,
} from '@/lib/domain/diagram-tag';
import {
    fullStructuralExportScope,
    projectDiagramForStructuralExport,
    type StructuralExportScope,
} from '@/lib/domain/structural-export-scope';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const field = (id: string, name: string): DBTable['fields'][number] => ({
    id,
    name,
    type: { id: 'varchar', name: 'varchar' },
    primaryKey: name === 'id',
    unique: name === 'id',
    nullable: false,
    createdAt: 1,
});

const table = (overrides: Partial<DBTable>): DBTable => ({
    id: 'table',
    name: 'table',
    x: 0,
    y: 0,
    fields: [field(`${overrides.id ?? 'table'}-id`, 'id')],
    indexes: [],
    color: '#8eb7ff',
    isView: false,
    createdAt: 1,
    ...overrides,
});

const relationship = (overrides: Partial<DBRelationship>): DBRelationship => ({
    id: 'rel',
    name: 'rel',
    sourceTableId: 'users',
    targetTableId: 'orders',
    sourceFieldId: 'users-id',
    targetFieldId: 'orders-user',
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 1,
    ...overrides,
});

const tag = (id: string, name: string): DiagramTag => ({
    id,
    name,
    color: '#8eb7ff',
});

const assignment = (
    id: string,
    tagId: string,
    targetType: DiagramTagAssignment['targetType'],
    targetId: string
): DiagramTagAssignment => ({
    id,
    tagId,
    targetType,
    targetId,
});

const users = table({
    id: 'users',
    name: 'users',
    schema: 'public',
    fields: [field('users-id', 'id'), field('users-email', 'email')],
    comments: 'users comment',
});
const orders = table({
    id: 'orders',
    name: 'orders',
    fields: [field('orders-id', 'id'), field('orders-user', 'user_id')],
});
const invoices = table({
    id: 'invoices',
    name: 'invoices',
    fields: [field('invoices-id', 'id'), field('invoices-total', 'total')],
});
const activeUsers = table({
    id: 'active_users',
    name: 'active_users',
    isView: true,
    fields: [field('active-users-id', 'id')],
});

const customType: DBCustomType = {
    id: 'status',
    name: 'status',
    kind: DBCustomTypeKind.enum,
    values: ['open', 'closed'],
};

const area: Area = {
    id: 'area-a',
    name: 'Billing',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    color: '#ffffff',
};

const usersOrders = relationship({
    id: 'rel-users-orders',
    name: 'users_orders',
    sourceTableId: 'users',
    targetTableId: 'orders',
});
const usersInvoices = relationship({
    id: 'rel-users-invoices',
    name: 'users_invoices',
    sourceTableId: 'users',
    targetTableId: 'invoices',
    sourceFieldId: 'users-id',
    targetFieldId: 'invoices-id',
});
const ordersInvoices = relationship({
    id: 'rel-orders-invoices',
    name: 'orders_invoices',
    sourceTableId: 'orders',
    targetTableId: 'invoices',
    sourceFieldId: 'orders-id',
    targetFieldId: 'invoices-id',
});
const usersView = relationship({
    id: 'rel-users-view',
    name: 'users_active_users',
    sourceTableId: 'users',
    targetTableId: 'active_users',
    sourceFieldId: 'users-id',
    targetFieldId: 'active-users-id',
});

const dependency: DBDependency = {
    id: 'dep-users-invoices',
    tableId: 'users',
    dependentTableId: 'invoices',
    createdAt: 1,
};
const droppedDependency: DBDependency = {
    id: 'dep-orders-invoices',
    tableId: 'orders',
    dependentTableId: 'invoices',
    createdAt: 1,
};

const diagram: Diagram = {
    id: 'diagram-1',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [users, orders, invoices, activeUsers],
    relationships: [usersOrders, usersInvoices, ordersInvoices, usersView],
    dependencies: [dependency, droppedDependency],
    areas: [area],
    customTypes: [customType],
    tags: [tag('red', 'Red'), tag('blue', 'Blue'), tag('green', 'Green')],
    tagAssignments: [
        assignment('a-users-red', 'red', 'table', 'users'),
        assignment('a-users-blue', 'blue', 'table', 'users'),
        assignment('a-invoices-red', 'red', 'table', 'invoices'),
        assignment('a-view-red', 'red', 'table', 'active_users'),
        assignment('a-orders-email', 'red', 'field', 'orders-user'),
        assignment('a-rel-red', 'red', 'relationship', 'rel-users-orders'),
        assignment(
            'a-rel-green',
            'green',
            'relationship',
            'rel-users-invoices'
        ),
    ],
    createdAt,
    updatedAt: createdAt,
};

const names = (projected: Diagram): string[] =>
    (projected.tables ?? []).map((item) => item.name);

const project = (scope: StructuralExportScope): Diagram =>
    projectDiagramForStructuralExport(diagram, scope);

describe('projectDiagramForStructuralExport', () => {
    it('returns the same diagram for the full scope', () => {
        const projected = project(fullStructuralExportScope);

        expect(projected).toBe(diagram);
    });

    it('returns the whole diagram when By tags has an empty selection', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: [],
            matchMode: 'any',
        });

        expect(projected).toBe(diagram);
        expect(projected.tables).toHaveLength(4);
    });

    it('includes tables that match ANY selected tag and excludes the rest', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'any',
        });

        expect(names(projected)).toEqual(['users', 'invoices', 'active_users']);
        expect(names(projected)).not.toContain('orders');
    });

    it('includes a table under ALL only when it has every selected tag', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red', 'blue'],
            matchMode: 'all',
        });

        expect(names(projected)).toEqual(['users']);
    });

    it('uses matchesTags NONE semantics for tables', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'none',
        });

        expect(names(projected)).toEqual(['orders']);
    });

    it('does not let a matching field tag include its parent table', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'any',
        });
        const projectedOrders = projected.tables?.find(
            (item) => item.id === 'orders'
        );

        expect(projectedOrders).toBeUndefined();
    });

    it('keeps every field of an included table', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['blue'],
            matchMode: 'any',
        });
        const projectedUsers = projected.tables?.find(
            (item) => item.id === 'users'
        );

        expect(projectedUsers).toBe(users);
        expect(projectedUsers?.fields.map((item) => item.name)).toEqual([
            'id',
            'email',
        ]);
        expect(projectedUsers?.comments).toBe('users comment');
    });

    it('does not let a relationship tag promote its endpoint tables', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['green'],
            matchMode: 'any',
        });

        expect(projected.tables).toEqual([]);
        expect(projected.relationships).toEqual([]);
    });

    it('keeps a relationship with a non-matching tag when both endpoints are included', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'any',
        });

        expect(projected.relationships).toContain(usersInvoices);
    });

    it('drops a relationship with a matching tag when an endpoint table is excluded', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'any',
        });

        expect(projected.relationships).not.toContain(usersOrders);
        expect(
            projected.relationships?.some(
                (item) =>
                    item.sourceTableId === 'orders' ||
                    item.targetTableId === 'orders'
            )
        ).toBe(false);
    });

    it('keeps an untagged relationship when both endpoints are included', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'any',
        });

        expect(projected.relationships).toContain(usersView);

        const missingEndpoint = project({
            kind: 'tags',
            selectedTagIds: ['blue'],
            matchMode: 'any',
        });

        expect(missingEndpoint.relationships).not.toContain(usersView);
    });

    it('selects a view through its table assignment and does not invent a view target', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'any',
        });
        const view = projected.tables?.find(
            (item) => item.id === 'active_users'
        );

        expect(view?.isView).toBe(true);
        expect(
            diagram.tagAssignments?.some(
                (item) =>
                    item.targetId === 'active_users' &&
                    item.targetType !== 'table'
            )
        ).toBe(false);
    });

    it('does not mutate the source diagram and keeps global structural metadata', () => {
        const snapshot = JSON.stringify(diagram);
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['blue'],
            matchMode: 'any',
        });

        expect(JSON.stringify(diagram)).toBe(snapshot);
        expect(diagram.tables).toHaveLength(4);
        expect(projected).not.toBe(diagram);
        expect(projected.databaseType).toBe(DatabaseType.POSTGRESQL);
        expect(projected.customTypes).toBe(diagram.customTypes);
        expect(projected.areas).toBe(diagram.areas);
        expect(projected.tags).toBe(diagram.tags);
        expect(projected.tagAssignments).toBe(diagram.tagAssignments);
        expect(projected.dependencies).toEqual([]);
        expect(projected.tables?.[0]?.schema).toBe('public');
    });

    it('keeps a dependency only when both endpoint tables are included', () => {
        const projected = project({
            kind: 'tags',
            selectedTagIds: ['red'],
            matchMode: 'any',
        });

        expect(projected.dependencies).toEqual([dependency]);
        expect(projected.dependencies).not.toContain(droppedDependency);
    });
});
