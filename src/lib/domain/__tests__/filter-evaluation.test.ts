import { describe, expect, it } from 'vitest';
import { DatabaseType } from '../database-type';
import type { DBField } from '../db-field';
import type { DBRelationship } from '../db-relationship';
import type { DBTable } from '../db-table';
import type { Diagram } from '../diagram';
import type { DiagramTagAssignment } from '../diagram-tag';
import {
    FILTER_MAX_CLAUSES,
    assessFilterExpressionComplexity,
    evaluateFilterExpression as evaluateFilterExpressionResult,
} from '../filter-evaluation';
import {
    FILTER_MAX_GROUP_DEPTH,
    createFilterGroup,
    type FilterCondition,
    type FilterGroup,
    type FilterTarget,
} from '../filter-expression';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const field = (id: string, name: string, primaryKey = false): DBField => ({
    id,
    name,
    type: { id: 'text', name: 'text' },
    primaryKey,
    unique: primaryKey,
    nullable: !primaryKey,
    createdAt: 1,
});

const table = (
    overrides: Partial<DBTable> & Pick<DBTable, 'id' | 'name'>
): DBTable => ({
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
    overrides: Partial<DBRelationship> & Pick<DBRelationship, 'id'>
): DBRelationship => ({
    name: overrides.id,
    sourceTableId: 'users',
    targetTableId: 'orders',
    sourceFieldId: 'users-id',
    targetFieldId: 'orders-user',
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 1,
    ...overrides,
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
    id: string,
    target: FilterTarget,
    operator: FilterCondition['operator'] = 'is_any_of',
    value: readonly string[] = [id]
): FilterCondition => {
    if (
        operator !== 'is_any_of' &&
        operator !== 'is_all_of' &&
        operator !== 'is_none_of'
    ) {
        throw new Error('tag operator required');
    }

    return {
        kind: 'condition',
        id: `${target}-${id}-${operator}`,
        target,
        property: 'tag',
        operator,
        value,
    };
};

const area = (target: 'table' | 'view', areaId: string): FilterCondition => ({
    kind: 'condition',
    id: `${target}-area-${areaId}`,
    target,
    property: 'area',
    operator: 'is_any_of',
    value: [areaId],
});

const name = (
    target: FilterTarget,
    value: string,
    operator: 'contains' | 'is' = 'contains'
): FilterCondition => ({
    kind: 'condition',
    id: `${target}-name-${value}`,
    target,
    property: 'name',
    operator,
    value,
});

const group = (
    operator: 'and' | 'or',
    children: FilterGroup['children'],
    id: string = operator
): FilterGroup => createFilterGroup(operator, children, id);

const ids = (values: ReadonlySet<string>): string[] => [...values].sort();

const evaluateFilterExpression = (
    diagram: Diagram,
    expression: FilterGroup
) => {
    const result = evaluateFilterExpressionResult(diagram, expression);

    if (result.status !== 'ok') {
        throw new Error(result.status);
    }

    return result.evaluation;
};

const nameIs = (value: string): FilterCondition => ({
    kind: 'condition',
    id: `name-${value}`,
    target: 'table',
    property: 'name',
    operator: 'is',
    value,
});

const binaryOr = (index: number): FilterGroup =>
    group(
        'or',
        [nameIs(`left-${index}`), nameIs(`right-${index}`)],
        `or-${index}`
    );

const catalog = (): Diagram => ({
    id: 'diagram-1',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        table({
            id: 'users',
            name: 'users',
            schema: 'public',
            parentAreaId: 'area-backend',
            fields: [
                field('users-id', 'id', true),
                field('users-email', 'email'),
            ],
        }),
        table({
            id: 'orders',
            name: 'orders',
            schema: 'billing',
            parentAreaId: 'area-shop',
            fields: [
                field('orders-id', 'id', true),
                field('orders-user', 'user_id'),
                field('orders-total', 'total'),
            ],
        }),
        table({
            id: 'active_users',
            name: 'active_users',
            schema: 'public',
            isView: true,
            parentAreaId: 'area-backend',
            fields: [field('view-id', 'id', true)],
        }),
    ],
    relationships: [
        relationship({
            id: 'rel-orders',
            sourceTableId: 'orders',
            targetTableId: 'users',
            sourceFieldId: 'orders-user',
            targetFieldId: 'users-id',
        }),
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
    tags: [
        { id: 'backend', name: 'Backend', color: '#f00' },
        { id: 'pii', name: 'PII', color: '#0f0' },
        { id: 'critical', name: 'Critical', color: '#00f' },
    ],
    tagAssignments: [
        assign('backend', 'table', 'users'),
        assign('pii', 'field', 'users-email'),
        assign('critical', 'relationship', 'rel-orders'),
        assign('backend', 'table', 'active_users'),
    ],
    createdAt,
    updatedAt: createdAt,
});

describe('filter evaluation', () => {
    it('joins mixed targets with AND and unions them with OR', () => {
        const diagram = catalog();
        const joined = evaluateFilterExpression(
            diagram,
            group('and', [tag('backend', 'table'), tag('pii', 'field')])
        );
        const union = evaluateFilterExpression(
            diagram,
            group('or', [tag('backend', 'table'), tag('pii', 'field')])
        );

        expect(joined.constrained).toBe(true);
        expect(ids(joined.direct.tables)).toEqual([]);
        expect(ids(joined.direct.fields)).toEqual(['users-email']);
        expect(ids(joined.direct.relationships)).toEqual([]);

        expect(ids(union.direct.tables)).toEqual(['users']);
        expect(ids(union.direct.fields)).toEqual(['users-email']);
    });

    it('does not inherit tags and keeps a relationship when one endpoint matches', () => {
        const diagram = catalog();
        const inherited = evaluateFilterExpression(
            diagram,
            group('and', [
                tag('backend', 'table'),
                tag('pii', 'field', 'is_any_of', ['backend']),
            ])
        );
        const critical = evaluateFilterExpression(
            diagram,
            group('and', [
                tag('critical', 'relationship'),
                area('table', 'area-backend'),
            ])
        );
        const either = evaluateFilterExpression(
            diagram,
            group('or', [
                area('table', 'area-backend'),
                tag('critical', 'relationship'),
            ])
        );

        expect(ids(inherited.direct.fields)).toEqual([]);
        expect(ids(critical.direct.tables)).toEqual([]);
        expect(ids(critical.direct.relationships)).toEqual(['rel-orders']);
        expect(ids(either.direct.tables)).toEqual(['users']);
        expect(ids(either.direct.relationships)).toEqual(['rel-orders']);
    });

    it('treats nested groups as distributed AND/OR clauses', () => {
        const diagram = catalog();
        const expression = group('and', [
            area('table', 'area-backend'),
            group(
                'or',
                [tag('pii', 'field'), tag('critical', 'relationship')],
                'inner'
            ),
        ]);
        const result = evaluateFilterExpression(diagram, expression);

        expect(ids(result.direct.tables)).toEqual([]);
        expect(ids(result.direct.fields)).toEqual(['users-email']);
        expect(ids(result.direct.relationships)).toEqual(['rel-orders']);
    });

    it('matches table and view targets separately and compares names without case', () => {
        const diagram = catalog();
        const tablesOnly = evaluateFilterExpression(
            diagram,
            group('and', [tag('backend', 'table')])
        );
        const viewsOnly = evaluateFilterExpression(
            diagram,
            group('and', [tag('backend', 'view')])
        );
        const named = evaluateFilterExpression(
            diagram,
            group('and', [name('table', 'USER')])
        );

        expect(ids(tablesOnly.direct.tables)).toEqual(['users']);
        expect(ids(viewsOnly.direct.tables)).toEqual(['active_users']);
        expect(ids(named.direct.tables)).toEqual(['users']);
    });

    it('ignores groups deeper than the supported depth and does not mutate the expression', () => {
        const diagram = catalog();
        let nested: FilterGroup = createFilterGroup(
            'and',
            [name('field', 'email', 'is')],
            'too-deep'
        );

        for (let level = 0; level < FILTER_MAX_GROUP_DEPTH + 1; level += 1) {
            nested = createFilterGroup('and', [nested], `wrap-${level}`);
        }

        const expression = group(
            'and',
            [name('table', 'users', 'is'), nested],
            'root'
        );
        const before = structuredClone(expression);
        const result = evaluateFilterExpression(diagram, expression);

        expect(expression).toEqual(before);
        expect(ids(result.direct.tables)).toEqual(['users']);
        expect(ids(result.direct.fields)).toEqual([]);
    });

    it('evaluates every clause at and below the supported limit', () => {
        const diagram = catalog();
        const below = group(
            'or',
            [
                nameIs('users'),
                ...Array.from({ length: FILTER_MAX_CLAUSES - 2 }, (_, index) =>
                    nameIs(`missing-${index}`)
                ),
            ],
            'below'
        );
        const exact = group(
            'or',
            [
                ...Array.from({ length: FILTER_MAX_CLAUSES - 1 }, (_, index) =>
                    nameIs(`missing-${index}`)
                ),
                nameIs('users'),
            ],
            'exact'
        );

        expect(assessFilterExpressionComplexity(below)).toEqual({
            status: 'supported',
            clauseCount: FILTER_MAX_CLAUSES - 1,
        });
        expect(assessFilterExpressionComplexity(exact)).toEqual({
            status: 'supported',
            clauseCount: FILTER_MAX_CLAUSES,
        });
        expect(
            ids(evaluateFilterExpression(diagram, below).direct.tables)
        ).toEqual(['users']);
        expect(
            ids(evaluateFilterExpression(diagram, exact).direct.tables)
        ).toEqual(['users']);
    });

    it('rejects one clause past the limit without a partial match', () => {
        const diagram = catalog();
        const expression = group(
            'or',
            [
                ...Array.from({ length: FILTER_MAX_CLAUSES }, (_, index) =>
                    nameIs(`missing-${index}`)
                ),
                nameIs('users'),
            ],
            'over'
        );
        const before = structuredClone(expression);
        const result = evaluateFilterExpressionResult(diagram, expression);

        expect(assessFilterExpressionComplexity(expression)).toEqual({
            status: 'too_complex',
        });
        expect(result).toEqual({ status: 'too_complex' });
        expect(result).not.toHaveProperty('evaluation');
        expect(expression).toEqual(before);
    });

    it('detects an oversized AND of ORs without building the clause product', () => {
        const expression = group(
            'and',
            Array.from({ length: 30 }, (_, index) => binaryOr(index)),
            'wide'
        );
        const before = structuredClone(expression);
        const started = performance.now();
        const complexity = assessFilterExpressionComplexity(expression);
        const result = evaluateFilterExpressionResult(catalog(), expression);

        expect(performance.now() - started).toBeLessThan(50);
        expect(complexity).toEqual({ status: 'too_complex' });
        expect(result).toEqual({ status: 'too_complex' });
        expect(expression).toEqual(before);
    });
});
