import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import type { DiagramTagAssignment } from '@/lib/domain/diagram-tag';
import {
    createFilterGroup,
    emptyFilterGroup,
    type FilterCondition,
    type FilterGroup,
} from '@/lib/domain/filter-expression';
import { projectStructuralExport as projectStructuralExportResult } from '@/lib/domain/structural-export-projection';
import { exportBaseSQL } from '../export-sql-script';

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
    schema: 'public',
    x: 0,
    y: 0,
    fields: [],
    indexes: [],
    color: '#8eb7ff',
    isView: false,
    createdAt: 1,
    ...overrides,
});

const assignment = (
    tagId: string,
    targetType: DiagramTagAssignment['targetType'],
    targetId: string
): DiagramTagAssignment => ({
    id: `${targetType}-${targetId}-${tagId}`,
    tagId,
    targetType,
    targetId,
});

const buildDiagram = (databaseType: DatabaseType): Diagram => {
    const users = table({
        id: 'users',
        name: 'users',
        fields: [field('users-id', 'id', true), field('users-email', 'email')],
        indexes: [
            {
                id: 'users-pk',
                name: '',
                fieldIds: ['users-id'],
                unique: true,
                isPrimaryKey: true,
                createdAt: 1,
            },
        ],
    });
    const orders = table({
        id: 'orders',
        name: 'orders',
        fields: [
            field('orders-id', 'id', true),
            field('orders-user', 'user_id'),
            field('orders-note', 'note'),
        ],
        indexes: [
            {
                id: 'orders-pk',
                name: '',
                fieldIds: ['orders-id'],
                unique: true,
                isPrimaryKey: true,
                createdAt: 1,
            },
        ],
    });
    const relationship: DBRelationship = {
        id: 'rel-users-orders',
        name: 'users_orders_fk',
        sourceSchema: 'public',
        sourceTableId: 'users',
        targetSchema: 'public',
        targetTableId: 'orders',
        sourceFieldId: 'users-id',
        targetFieldId: 'orders-user',
        sourceCardinality: 'one',
        targetCardinality: 'many',
        createdAt: 1,
    };

    return {
        id: 'diagram-1',
        name: 'Catalog',
        databaseType,
        tables: [users, orders],
        relationships: [relationship],
        tags: [
            { id: 'red', name: 'Red' },
            { id: 'blue', name: 'Blue' },
        ],
        tagAssignments: [
            assignment('red', 'table', 'users'),
            assignment('red', 'field', 'orders-note'),
            assignment('red', 'relationship', 'rel-users-orders'),
        ],
        createdAt,
        updatedAt: createdAt,
    };
};

const projectStructuralExport = (
    diagram: Diagram,
    expression: FilterGroup | null
): Diagram => {
    const result = projectStructuralExportResult(diagram, expression);

    if (result.status !== 'ready') {
        throw new Error(result.status);
    }

    return result.diagram;
};

const tableTag = (tagIds: readonly string[]): FilterCondition => ({
    kind: 'condition',
    id: 'table-tag',
    target: 'table',
    property: 'tag',
    operator: 'is_any_of',
    value: tagIds,
});

const sameDialectTargets = [
    DatabaseType.POSTGRESQL,
    DatabaseType.MYSQL,
    DatabaseType.MARIADB,
    DatabaseType.SQLITE,
    DatabaseType.SQL_SERVER,
] as const;

describe('SQL export consumes the structural projection', () => {
    it.each(sameDialectTargets)(
        'exports the projected tables for %s',
        async (databaseType) => {
            const diagram = buildDiagram(databaseType);
            const projected = projectStructuralExport(
                diagram,
                createFilterGroup('and', [tableTag(['red'])], 'root')
            );
            const sql = await exportBaseSQL({
                diagram: projected,
                targetDatabaseType: databaseType,
            });

            expect(projected.tables?.map((item) => item.name)).toEqual([
                'users',
            ]);
            expect(sql).toContain('users');
            expect(sql).toContain('email');
            expect(sql).not.toContain('orders');
            expect(sql).not.toContain('user_id');
            expect(sql.toLowerCase()).not.toContain('foreign key');
        }
    );

    it('feeds the same projected diagram to a PostgreSQL to MySQL cross-dialect export', async () => {
        const diagram = buildDiagram(DatabaseType.POSTGRESQL);
        const projected = projectStructuralExport(
            diagram,
            createFilterGroup('and', [tableTag(['red'])], 'root')
        );
        const sql = await exportBaseSQL({
            diagram: projected,
            targetDatabaseType: DatabaseType.MYSQL,
        });

        expect(sql).toContain('users');
        expect(sql).toContain('email');
        expect(sql).not.toContain('orders');
        expect(sql.toLowerCase()).not.toContain('foreign key');
    });

    it('keeps the full script when the filter is unconstrained', async () => {
        const diagram = buildDiagram(DatabaseType.POSTGRESQL);
        const projected = projectStructuralExport(diagram, emptyFilterGroup());
        const fullSql = await exportBaseSQL({
            diagram,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });
        const projectedSql = await exportBaseSQL({
            diagram: projected,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(projected).toBe(diagram);
        expect(projectedSql).toBe(fullSql);
        expect(projectedSql).toContain('orders');
        expect(projectedSql.toLowerCase()).toContain('foreign key');
    });
});
