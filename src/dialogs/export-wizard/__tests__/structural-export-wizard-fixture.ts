import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';

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

export const structuralExportFixture = (): Diagram => ({
    id: '42',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        table({
            id: 'users',
            name: 'users',
            schema: 'public',
            fields: [
                field('users-id', 'id', true),
                field('users-email', 'email'),
            ],
        }),
        table({
            id: 'orders',
            name: 'orders',
            fields: [
                field('orders-id', 'id', true),
                field('orders-note', 'note'),
            ],
        }),
    ],
    relationships: [
        {
            id: 'rel-users-orders',
            name: 'users_orders',
            sourceTableId: 'users',
            targetTableId: 'orders',
            sourceFieldId: 'users-id',
            targetFieldId: 'orders-id',
            sourceCardinality: 'one',
            targetCardinality: 'many',
            createdAt: 1,
        },
    ],
    tags: [{ id: 'red', name: 'Red', color: '#ff0000' }],
    tagAssignments: [
        {
            id: 'assign-users',
            tagId: 'red',
            targetType: 'table',
            targetId: 'users',
        },
        {
            id: 'assign-note',
            tagId: 'red',
            targetType: 'field',
            targetId: 'orders-note',
        },
        {
            id: 'assign-rel',
            tagId: 'red',
            targetType: 'relationship',
            targetId: 'rel-users-orders',
        },
    ],
    createdAt,
    updatedAt: createdAt,
});

export const chooseByTags = async (
    tagNames: readonly string[]
): Promise<void> => {
    await userEvent.click(screen.getByTestId('export-structural-scope-tags'));

    for (const tagName of tagNames) {
        await userEvent.click(screen.getByRole('checkbox', { name: tagName }));
    }
};

export const exportedTableNames = (diagram: {
    tables?: ReadonlyArray<{ name: string }>;
}): string[] => (diagram.tables ?? []).map((table) => table.name);
