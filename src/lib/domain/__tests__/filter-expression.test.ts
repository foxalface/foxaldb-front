import { describe, expect, it } from 'vitest';
import { DatabaseType } from '../database-type';
import type { Diagram } from '../diagram';
import {
    FILTER_MAX_GROUP_DEPTH,
    addGroupToGroup,
    clearFilterGroupChildren,
    groupHasIncompleteDescendantConditions,
    createFilterCondition,
    createFilterGroup,
    emptyFilterGroup,
    isFilterConditionComplete,
    filterNormalizationScopeFromDiagram,
    hasActiveFilter,
    normalizeFilterExpression,
    withConditionOperator,
    withConditionProperty,
    withConditionTarget,
    withConditionValue,
    type FilterCondition,
    type FilterGroup,
} from '../filter-expression';

const scopeFor = (
    diagram: Pick<Diagram, 'tags' | 'areas' | 'tables' | 'databaseType'>
) => filterNormalizationScopeFromDiagram(diagram);

const diagram = (): Diagram => ({
    id: 'diagram-1',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 'users',
            name: 'users',
            schema: 'public',
            x: 0,
            y: 0,
            fields: [],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 1,
            parentAreaId: 'area-backend',
        },
    ],
    areas: [
        {
            id: 'area-backend',
            name: 'Backend',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            color: '#fff',
        },
    ],
    tags: [{ id: 'tag-backend', name: 'Backend' }],
    createdAt: new Date(0),
    updatedAt: new Date(0),
});

const condition = (): FilterCondition =>
    createFilterCondition('table', 'tag', 'condition-1');

const tagValue = (
    source: FilterCondition,
    value: readonly string[]
): FilterCondition =>
    source.property === 'tag' ? { ...source, value: [...value] } : source;

describe('filter expression', () => {
    it('treats an empty group and a blank condition as inactive', () => {
        expect(hasActiveFilter(emptyFilterGroup())).toBe(false);

        const named = createFilterCondition('field', 'name', 'name-1');
        const root = createFilterGroup('and', [named], 'root');

        expect(hasActiveFilter(root)).toBe(false);
        expect(
            hasActiveFilter(createFilterGroup('and', [condition()], 'root'))
        ).toBe(false);
    });

    it('resets an illegal property when the target changes and keeps a legal tag value', () => {
        const area = withConditionProperty(condition(), 'area');
        const withArea = {
            ...area,
            value: ['area-backend'],
        } as FilterCondition;
        const asField = withConditionTarget(withArea, 'field');

        expect(asField.target).toBe('field');
        expect(asField.property).toBe('tag');
        expect(asField.property === 'tag' ? asField.value : []).toEqual([]);

        const tagged = {
            ...condition(),
            value: ['tag-backend'],
        } as FilterCondition;
        const asView = withConditionTarget(tagged, 'view');

        expect(asView.target).toBe('view');
        expect(asView.property).toBe('tag');
        expect(asView.property === 'tag' ? asView.value : []).toEqual([
            'tag-backend',
        ]);
    });

    it('keeps the value when the operator stays in the same property', () => {
        const tagged = {
            ...condition(),
            value: ['tag-backend'],
        } as FilterCondition;
        const next = withConditionOperator(tagged, 'is_all_of');

        expect(next.property === 'tag' ? next.operator : '').toBe('is_all_of');
        expect(next.property === 'tag' ? next.value : []).toEqual([
            'tag-backend',
        ]);
        expect(withConditionOperator(next, 'not-an-operator')).toBe(next);
    });

    it('drops stale ids and groups deeper than the supported depth without mutating the input', () => {
        const source = diagram();
        let nested: FilterGroup = createFilterGroup(
            'and',
            [
                tagValue(createFilterCondition('field', 'tag', 'deep-field'), [
                    'tag-backend',
                    'missing-tag',
                ]),
            ],
            'depth-4'
        );

        for (let depth = FILTER_MAX_GROUP_DEPTH; depth >= 1; depth -= 1) {
            nested = createFilterGroup('or', [nested], `depth-${depth}`);
        }

        const root = createFilterGroup(
            'and',
            [tagValue(condition(), ['tag-backend', 'gone']), nested],
            'root'
        );
        const before = structuredClone(root);
        const normalized = normalizeFilterExpression(root, scopeFor(source));

        expect(root).toEqual(before);
        expect(normalized.children).toHaveLength(2);
        const kept = normalized.children[0];
        expect(kept?.kind).toBe('condition');
        expect(
            kept?.kind === 'condition' && kept.property === 'tag'
                ? kept.value
                : []
        ).toEqual(['tag-backend']);

        const depth1 = normalized.children[1];
        expect(depth1?.kind).toBe('group');
        let cursor = depth1?.kind === 'group' ? depth1 : undefined;
        let levels = 0;

        while (cursor && cursor.children[0]?.kind === 'group') {
            levels += 1;
            cursor = cursor.children[0];
        }

        expect(levels).toBe(FILTER_MAX_GROUP_DEPTH - 1);
        expect(cursor?.children.every((child) => child.kind !== 'group')).toBe(
            true
        );
        expect(JSON.stringify(normalized).includes('deep-field')).toBe(false);
    });

    it('marks incomplete tag conditions without values', () => {
        const condition = createFilterCondition('table', 'tag');
        expect(isFilterConditionComplete(condition)).toBe(false);
        expect(
            isFilterConditionComplete(withConditionValue(condition, ['tag-a']))
        ).toBe(true);
    });

    it('detects incomplete descendant conditions in a group', () => {
        const complete = withConditionValue(
            createFilterCondition('table', 'tag', 'c1'),
            ['tag-a']
        );
        const incomplete = createFilterCondition('table', 'tag', 'c2');
        const nested = createFilterGroup(
            'and',
            [
                withConditionValue(
                    createFilterCondition('field', 'name', 'c3'),
                    'users'
                ),
            ],
            'nested'
        );
        const onlyComplete = createFilterGroup('and', [complete, nested]);
        const withIncomplete = createFilterGroup('and', [
            complete,
            incomplete,
            nested,
        ]);

        expect(groupHasIncompleteDescendantConditions(onlyComplete)).toBe(
            false
        );
        expect(groupHasIncompleteDescendantConditions(withIncomplete)).toBe(
            true
        );
    });

    it('creates a nested group with one initial condition', () => {
        const root = emptyFilterGroup();
        const next = addGroupToGroup(root, root.id);
        const created = next.children[0];
        expect(created?.kind).toBe('group');
        if (created?.kind === 'group') {
            expect(created.children).toHaveLength(1);
            expect(created.children[0]?.kind).toBe('condition');
        }
    });

    it('clears group children while preserving the group shell', () => {
        const root = emptyFilterGroup();
        const withChild = {
            ...root,
            children: [createFilterCondition('table', 'tag', 'condition-1')],
        };
        const cleared = clearFilterGroupChildren(withChild, root.id);
        expect(cleared.children).toEqual([]);
        expect(cleared.id).toBe(root.id);
        expect(cleared.operator).toBe('and');
    });

    it('refuses to add a group past the domain depth cap', () => {
        let root = createFilterGroup('and', [], 'root');
        let parentId = root.id;

        for (let level = 0; level < FILTER_MAX_GROUP_DEPTH; level += 1) {
            root = addGroupToGroup(root, parentId);
            const parent = findGroup(root, parentId);
            const created = parent?.children.find(
                (child) => child.kind === 'group'
            );
            expect(created?.kind).toBe('group');
            parentId = created?.kind === 'group' ? created.id : parentId;
        }

        const capped = addGroupToGroup(root, parentId);
        expect(capped).toBe(root);
    });
});

const findGroup = (group: FilterGroup, id: string): FilterGroup | undefined => {
    if (group.id === id) {
        return group;
    }

    for (const child of group.children) {
        if (child.kind !== 'group') {
            continue;
        }

        const found = findGroup(child, id);

        if (found) {
            return found;
        }
    }

    return undefined;
};
