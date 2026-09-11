import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';
import { cloneDiagram, cloneTable } from '../clone';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const createTable = (overrides: Partial<DBTable> = {}): DBTable => ({
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
    ],
    indexes: [],
    color: '#ffe374',
    isView: false,
    createdAt: 2,
    ...overrides,
});

const createDiagram = (tables: DBTable[]): Diagram => ({
    id: 'diagram-original',
    name: 'My Diagram',
    databaseType: DatabaseType.POSTGRESQL,
    tables,
    relationships: [],
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
    notes: [],
    createdAt,
    updatedAt: createdAt,
});

describe('cloneDiagram parentAreaId', () => {
    it('remaps table parentAreaId to the cloned area id', () => {
        const source = createDiagram([
            createTable({ parentAreaId: 'area-main' }),
        ]);

        const { diagram } = cloneDiagram(source);
        const clonedTable = diagram.tables?.[0];
        const clonedArea = diagram.areas?.[0];

        expect(clonedArea?.id).toBeDefined();
        expect(clonedArea?.id).not.toBe('area-main');
        expect(clonedTable?.id).not.toBe('table-users');
        expect(clonedTable?.parentAreaId).toBe(clonedArea?.id);
        expect(clonedTable?.parentAreaId).not.toBe('area-main');
    });

    it('preserves missing parent area membership', () => {
        const source = createDiagram([createTable()]);

        const { diagram } = cloneDiagram(source);

        expect(diagram.tables?.[0]?.parentAreaId).toBeUndefined();
    });

    it('clears parentAreaId when the referenced area is not in the cloned Diagram', () => {
        const source = createDiagram([
            createTable({ parentAreaId: 'area-missing' }),
        ]);

        const { diagram } = cloneDiagram(source);

        expect(diagram.tables?.[0]?.parentAreaId).toBeNull();
    });
});

describe('cloneTable parentAreaId', () => {
    it('keeps the source parentAreaId for in-diagram table duplication', () => {
        const table = createTable({ parentAreaId: 'area-main' });
        const clonedTable = cloneTable(table);

        expect(clonedTable.id).not.toBe(table.id);
        expect(clonedTable.parentAreaId).toBe('area-main');
    });
});
