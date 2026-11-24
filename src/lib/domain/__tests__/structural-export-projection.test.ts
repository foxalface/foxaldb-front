import { describe, expect, it } from 'vitest';
import { DatabaseType } from '../database-type';
import { DBCustomTypeKind, type DBCustomType } from '../db-custom-type';
import type { DBField } from '../db-field';
import type { DBRelationship } from '../db-relationship';
import type { DBTable } from '../db-table';
import type { Diagram } from '../diagram';
import type { DiagramTagAssignment } from '../diagram-tag';
import {
    createFilterGroup,
    type FilterCondition,
    type FilterGroup,
} from '../filter-expression';
import { FILTER_MAX_CLAUSES } from '../filter-evaluation';
import { projectStructuralExport as projectStructuralExportResult } from '../structural-export-projection';

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

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const field = (
    id: string,
    name: string,
    primaryKey = false,
    typeName = 'text'
): DBField => ({
    id,
    name,
    type: { id: typeName, name: typeName },
    primaryKey,
    unique: primaryKey,
    nullable: !primaryKey,
    createdAt: 1,
});

const table = (
    overrides: Partial<DBTable> & Pick<DBTable, 'id' | 'name'>
): DBTable => ({
    schema: 'public',
    x: 0,
    y: 0,
    fields: [],
    indexes: [],
    color: '#fff',
    isView: false,
    createdAt: 1,
    ...overrides,
});

const relationship = (
    id: string,
    sourceTableId: string,
    sourceFieldId: string,
    targetTableId: string,
    targetFieldId: string
): DBRelationship => ({
    id,
    name: id,
    sourceTableId,
    targetTableId,
    sourceFieldId,
    targetFieldId,
    sourceCardinality: 'many',
    targetCardinality: 'one',
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

const area = (areaId: string): FilterCondition => ({
    kind: 'condition',
    id: `area-${areaId}`,
    target: 'table',
    property: 'area',
    operator: 'is_any_of',
    value: [areaId],
});

const group = (
    operator: 'and' | 'or',
    children: FilterGroup['children']
): FilterGroup => createFilterGroup(operator, children, operator);

const names = (diagram: Diagram, tableId: string): string[] =>
    diagram.tables
        ?.find((item) => item.id === tableId)
        ?.fields.map((item) => item.name) ?? [];

const statusType: DBCustomType = {
    id: 'type-status',
    name: 'status',
    kind: DBCustomTypeKind.enum,
    values: ['open', 'closed'],
};
const colorType: DBCustomType = {
    id: 'type-color',
    name: 'color',
    kind: DBCustomTypeKind.enum,
    values: ['red'],
};
const countryType: DBCustomType = {
    id: 'type-country',
    name: 'country_code',
    kind: DBCustomTypeKind.enum,
    values: ['US'],
};
const addressType: DBCustomType = {
    id: 'type-address',
    name: 'address',
    kind: DBCustomTypeKind.composite,
    fields: [{ field: 'country', type: 'country_code' }],
};
const billingStatus: DBCustomType = {
    id: 'type-billing-status',
    schema: 'billing',
    name: 'status',
    kind: DBCustomTypeKind.enum,
    values: ['due'],
};

const buildDiagram = (): Diagram => ({
    id: 'diagram-1',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        table({
            id: 'users',
            name: 'users',
            parentAreaId: 'area-backend',
            fields: [
                field('users-id', 'id', true),
                field('users-email', 'email'),
                field('users-status', 'status', false, 'status'),
                field('users-address', 'address', false, 'address'),
            ],
            indexes: [
                {
                    id: 'users-pk',
                    name: 'users_pkey',
                    unique: true,
                    isPrimaryKey: true,
                    fieldIds: ['users-id'],
                    createdAt: 1,
                },
                {
                    id: 'users-email-idx',
                    name: 'users_email_idx',
                    unique: false,
                    fieldIds: ['users-email'],
                    createdAt: 1,
                },
            ],
            checkConstraints: [
                { id: 'users-check', expression: "email <> ''", createdAt: 1 },
            ],
        }),
        table({
            id: 'orders',
            name: 'orders',
            parentAreaId: 'area-shop',
            fields: [
                field('orders-id', 'id', true),
                field('orders-user', 'user_id'),
                field('orders-total', 'total'),
            ],
            indexes: [
                {
                    id: 'orders-pk',
                    name: 'orders_pkey',
                    unique: true,
                    isPrimaryKey: true,
                    fieldIds: ['orders-id'],
                    createdAt: 1,
                },
            ],
            checkConstraints: [
                { id: 'orders-check', expression: 'total > 0', createdAt: 1 },
            ],
        }),
    ],
    relationships: [
        relationship(
            'rel-orders',
            'orders',
            'orders-user',
            'users',
            'users-id'
        ),
    ],
    dependencies: [
        {
            id: 'dep-orders',
            tableId: 'users',
            dependentTableId: 'orders',
            createdAt: 1,
        },
    ],
    areas: [
        {
            id: 'area-backend',
            name: 'Backend',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            color: '#fff',
        },
        {
            id: 'area-shop',
            name: 'Shop',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            color: '#fff',
        },
    ],
    notes: [
        {
            id: 'note-1',
            content: 'keep',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            color: '#fff',
        },
    ],
    customTypes: [
        statusType,
        colorType,
        countryType,
        addressType,
        billingStatus,
    ],
    tags: [
        { id: 'backend', name: 'Backend' },
        { id: 'pii', name: 'PII' },
        { id: 'critical', name: 'Critical' },
    ],
    tagAssignments: [
        assign('backend', 'table', 'users'),
        assign('pii', 'field', 'users-email'),
        assign('pii', 'field', 'orders-user'),
        assign('critical', 'relationship', 'rel-orders'),
    ],
    createdAt,
    updatedAt: createdAt,
});

describe('structural export projection', () => {
    it('returns the same diagram when the expression does not constrain it', () => {
        const diagram = buildDiagram();

        expect(projectStructuralExport(diagram, null)).toBe(diagram);
        expect(projectStructuralExport(diagram, group('and', []))).toBe(
            diagram
        );
    });

    it('exports a direct table completely and a direct field with minimal context', () => {
        const diagram = buildDiagram();
        const complete = projectStructuralExport(
            diagram,
            group('and', [tag('table', 'backend')])
        );
        const minimal = projectStructuralExport(
            diagram,
            group('and', [tag('field', 'pii')])
        );
        const sourceUsers = diagram.tables?.[0];
        const before = structuredClone(diagram);

        expect(names(complete, 'users')).toEqual([
            'id',
            'email',
            'status',
            'address',
        ]);
        expect(
            complete.tables?.find((item) => item.id === 'users')
                ?.checkConstraints
        ).toEqual(diagram.tables?.[0]?.checkConstraints);
        expect(complete.relationships?.map((item) => item.id)).toEqual([]);
        expect(names(minimal, 'users').sort()).toEqual(['email', 'id']);
        expect(names(minimal, 'orders').sort()).toEqual(['id', 'user_id']);
        expect(minimal.relationships?.map((item) => item.id)).toEqual([
            'rel-orders',
        ]);
        expect(
            minimal.tables
                ?.find((item) => item.id === 'users')
                ?.indexes.map((item) => item.id)
        ).toEqual(['users-pk', 'users-email-idx']);
        expect(
            minimal.tables?.find((item) => item.id === 'orders')
                ?.checkConstraints
        ).toBeUndefined();
        expect(
            minimal.tables?.some((item) =>
                names(minimal, item.id).includes('total')
            )
        ).toBe(false);
        expect(diagram).toEqual(before);
        expect(diagram.tables?.[0]).toBe(sourceUsers);
        expect(diagram.tables?.[0]?.fields.map((item) => item.name)).toEqual([
            'id',
            'email',
            'status',
            'address',
        ]);
    });

    it('keeps a direct relationship minimal and lets OR promote a direct table', () => {
        const diagram = buildDiagram();
        const relationshipOnly = projectStructuralExport(
            diagram,
            group('and', [tag('relationship', 'critical')])
        );
        const union = projectStructuralExport(
            diagram,
            group('or', [area('area-backend'), tag('relationship', 'critical')])
        );
        const qualified = projectStructuralExport(
            diagram,
            group('and', [
                area('area-backend'),
                tag('relationship', 'critical'),
            ])
        );

        expect(names(relationshipOnly, 'users')).toEqual(['id']);
        expect(names(relationshipOnly, 'orders').sort()).toEqual([
            'id',
            'user_id',
        ]);
        expect(names(union, 'users')).toEqual([
            'id',
            'email',
            'status',
            'address',
        ]);
        expect(names(union, 'orders').sort()).toEqual(['id', 'user_id']);
        expect(names(qualified, 'users')).toEqual(['id']);
        expect(names(qualified, 'orders').sort()).toEqual(['id', 'user_id']);
    });

    it('closes required custom types and drops unrelated serialized types', () => {
        const diagram = buildDiagram();
        const projected = projectStructuralExport(
            diagram,
            group('and', [tag('table', 'backend')])
        );

        expect(projected.customTypes?.map((item) => item.id).sort()).toEqual([
            'type-address',
            'type-country',
            'type-status',
        ]);
        expect(projected.notes).toBe(diagram.notes);
        expect(projected.areas).toBe(diagram.areas);
        expect(
            projected.tagAssignments?.some(
                (assignment) => assignment.targetId === 'orders-total'
            )
        ).toBe(false);
        expect(
            projected.tagAssignments?.some(
                (assignment) => assignment.targetId === 'users'
            )
        ).toBe(true);
    });

    it('keeps only the custom types referenced by a minimal field projection', () => {
        const diagram = buildDiagram();
        const projected = projectStructuralExport(
            diagram,
            group('and', [tag('field', 'pii')])
        );

        expect(projected.customTypes).toEqual([]);
        expect(projected.dependencies).toEqual(diagram.dependencies);
    });

    it('does not fall back to the source diagram when the filter is too complex', () => {
        const diagram = buildDiagram();
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
        const result = projectStructuralExportResult(diagram, expression);

        expect(result).toEqual({ status: 'too_complex' });
        expect(result).not.toHaveProperty('diagram');
        expect(diagram.tables?.map((table) => table.name)).toEqual([
            'users',
            'orders',
        ]);
    });
});
