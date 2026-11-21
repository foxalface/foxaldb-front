import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import type { DiagramTagAssignment } from '@/lib/domain/diagram-tag';
import { FILTER_MAX_CLAUSES } from '@/lib/domain/filter-evaluation';
import {
    createFilterGroup,
    type FilterCondition,
    type FilterGroup,
} from '@/lib/domain/filter-expression';
import {
    projectCanvasVisibility,
    tableHiddenByFilterVisibility,
} from '../canvas-filter-visibility';

const createdAt = new Date(0);

const field = (id: string, name: string, primaryKey = false): DBField => ({
    id,
    name,
    type: { id: 'text', name: 'text' },
    primaryKey,
    unique: primaryKey,
    nullable: !primaryKey,
    createdAt: 1,
});

const dbTable = (
    id: string,
    options: {
        isView?: boolean;
        fields?: DBField[];
        parentAreaId?: string | null;
    } = {}
): DBTable => ({
    id,
    name: id,
    schema: 'public',
    parentAreaId: options.parentAreaId,
    x: 0,
    y: 0,
    fields: options.fields ?? [
        field(`${id}-id`, 'id', true),
        field(`${id}-name`, 'name'),
    ],
    indexes: [],
    color: '#fff',
    isView: options.isView ?? false,
    createdAt: 1,
});

const relationship = (
    id: string,
    sourceTableId: string,
    targetTableId: string
): DBRelationship => ({
    id,
    name: id,
    sourceTableId,
    targetTableId,
    sourceFieldId: `${sourceTableId}-id`,
    targetFieldId: `${targetTableId}-id`,
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 1,
});

const assign = (
    tagId: string,
    targetType: DiagramTagAssignment['targetType'],
    targetId: string
): DiagramTagAssignment => ({
    id: `${targetType}-${targetId}-${tagId}`,
    tagId,
    targetType,
    targetId,
});

const tag = (
    target: FilterCondition['target'],
    tagId: string
): FilterCondition => ({
    kind: 'condition',
    id: `${target}-${tagId}`,
    target,
    property: 'tag',
    operator: 'is_any_of',
    value: [tagId],
});

const group = (
    operator: 'and' | 'or',
    children: FilterGroup['children']
): FilterGroup => createFilterGroup(operator, children, operator);

const diagramFor = (
    tables: DBTable[],
    relationships: DBRelationship[] = [],
    tagAssignments: DiagramTagAssignment[] = []
): Diagram => ({
    id: 'diagram-1',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables,
    relationships,
    dependencies: [
        {
            id: 'dep-1',
            tableId: tables[0]?.id ?? 'missing',
            dependentTableId: tables[1]?.id ?? 'missing',
            createdAt: 1,
        },
    ],
    tagAssignments,
    createdAt,
    updatedAt: createdAt,
});

const project = (
    diagram: Diagram,
    expression: FilterGroup,
    showViews = true,
    forceShownTableIds: ReadonlySet<string> = new Set()
) =>
    projectCanvasVisibility({
        diagram,
        expression,
        showViews,
        forceShownTableIds,
    });

describe('projectCanvasVisibility', () => {
    it('returns null when nothing is constrained and every table is eligible', () => {
        const diagram = diagramFor([dbTable('users'), dbTable('orders')]);

        expect(project(diagram, group('and', []), true)).toBeNull();
        expect(tableHiddenByFilterVisibility(false, 'users', null)).toBe(false);
    });

    it('shows every field of a direct table and only the direct field otherwise', () => {
        const users = dbTable('users');
        const orders = dbTable('orders', {
            fields: [
                field('orders-id', 'id', true),
                field('orders-email', 'email'),
                field('orders-total', 'total'),
            ],
        });
        const diagram = diagramFor(
            [users, orders],
            [],
            [
                assign('backend', 'table', 'users'),
                assign('pii', 'field', 'orders-email'),
            ]
        );
        const tableMatch = project(
            diagram,
            group('and', [tag('table', 'backend')])
        );
        const fieldMatch = project(
            diagram,
            group('and', [tag('field', 'pii')])
        );

        expect([...(tableMatch?.visibleTableIds ?? [])]).toEqual(['users']);
        expect([...(tableMatch?.visibleFieldIds ?? [])].sort()).toEqual([
            'users-id',
            'users-name',
        ]);
        expect([...(fieldMatch?.visibleTableIds ?? [])]).toEqual(['orders']);
        expect([...(fieldMatch?.visibleFieldIds ?? [])]).toEqual([
            'orders-email',
        ]);
    });

    it('shows relationship endpoints and hides a dependency whose table is hidden', () => {
        const users = dbTable('users');
        const orders = dbTable('orders');
        const diagram = diagramFor(
            [users, orders],
            [relationship('rel-orders', 'users', 'orders')],
            [assign('critical', 'relationship', 'rel-orders')]
        );
        const visibility = project(
            diagram,
            group('and', [tag('relationship', 'critical')])
        );

        expect([...(visibility?.visibleTableIds ?? [])].sort()).toEqual([
            'orders',
            'users',
        ]);
        expect([...(visibility?.visibleRelationshipIds ?? [])]).toEqual([
            'rel-orders',
        ]);
        expect([...(visibility?.visibleFieldIds ?? [])].sort()).toEqual([
            'orders-id',
            'users-id',
        ]);
        expect(visibility?.visibleDependencyIds.has('dep-1')).toBe(true);

        const oneTable = project(
            diagramFor([users], [], [assign('backend', 'table', 'users')]),
            group('and', [tag('table', 'backend')])
        );
        expect(oneTable?.visibleDependencyIds.has('dep-1')).toBe(false);
    });

    it('keeps a hidden view hidden and does not let force-show skip the expression', () => {
        const users = dbTable('users');
        const view = dbTable('active_users', { isView: true });
        const diagram = diagramFor(
            [users, view],
            [],
            [
                assign('backend', 'table', 'users'),
                assign('backend', 'table', 'active_users'),
            ]
        );
        const hiddenViews = project(
            diagram,
            group('and', [tag('table', 'backend')]),
            false
        );
        const forced = project(
            diagram,
            group('and', [tag('view', 'backend')]),
            false,
            new Set(['active_users'])
        );

        expect(hiddenViews?.visibleTableIds.has('users')).toBe(true);
        expect(hiddenViews?.visibleTableIds.has('active_users')).toBe(false);
        expect(forced?.visibleTableIds.has('active_users')).toBe(true);
        expect(forced?.visibleTableIds.has('users')).toBe(false);
    });

    it('applies a nested expression on the canvas', () => {
        const users = dbTable('users', { parentAreaId: 'area-backend' });
        const orders = dbTable('orders');
        const diagram = diagramFor(
            [users, orders],
            [relationship('rel-orders', 'users', 'orders')],
            [
                assign('pii', 'field', 'users-name'),
                assign('critical', 'relationship', 'rel-orders'),
            ]
        );
        const visibility = project(
            diagram,
            group('or', [tag('field', 'pii'), tag('relationship', 'critical')])
        );

        expect(visibility?.visibleTableIds.has('users')).toBe(true);
        expect(visibility?.visibleTableIds.has('orders')).toBe(true);
        expect(visibility?.visibleFieldIds?.has('users-name')).toBe(true);
        expect(visibility?.visibleFieldIds?.has('users-id')).toBe(true);
        expect(visibility?.visibleFieldIds?.has('orders-id')).toBe(true);
        expect(visibility?.visibleRelationshipIds.has('rel-orders')).toBe(true);
    });

    it('hides every table when the expression is too complex', () => {
        const diagram = diagramFor([dbTable('users'), dbTable('orders')]);
        const expression = createFilterGroup(
            'or',
            [
                ...Array.from({ length: FILTER_MAX_CLAUSES }, (_, index) => ({
                    kind: 'condition' as const,
                    id: `missing-${index}`,
                    target: 'table' as const,
                    property: 'name' as const,
                    operator: 'is' as const,
                    value: `missing-${index}`,
                })),
                {
                    kind: 'condition' as const,
                    id: 'users-name',
                    target: 'table' as const,
                    property: 'name' as const,
                    operator: 'is' as const,
                    value: 'users',
                },
            ],
            'over'
        );
        const visibility = projectCanvasVisibility({
            diagram,
            expression,
            showViews: true,
            forceShownTableIds: new Set(),
        });

        expect(visibility).not.toBeNull();
        expect(visibility?.visibleTableIds.size).toBe(0);
        expect(visibility?.visibleFieldIds?.size).toBe(0);
        expect(visibility?.visibleRelationshipIds.size).toBe(0);
    });
});
