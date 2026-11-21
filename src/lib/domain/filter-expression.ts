import { listDiagramSchemaOptions } from './editor-filter-eligibility';
import type { Diagram } from './diagram';
import { generateId } from '../utils';

/** Group levels allowed below the root. The root itself is level 0. */
export const FILTER_MAX_GROUP_DEPTH = 3;

export const filterTargets = [
    'table',
    'field',
    'relationship',
    'view',
] as const;
export type FilterTarget = (typeof filterTargets)[number];

export const filterGroupOperators = ['and', 'or'] as const;
export type FilterGroupOperator = (typeof filterGroupOperators)[number];

export const tagFilterOperators = [
    'is_any_of',
    'is_all_of',
    'is_none_of',
] as const;
export type TagFilterOperator = (typeof tagFilterOperators)[number];

export const membershipFilterOperators = ['is_any_of', 'is_none_of'] as const;
export type MembershipFilterOperator =
    (typeof membershipFilterOperators)[number];

export const nameFilterOperators = [
    'contains',
    'does_not_contain',
    'starts_with',
    'ends_with',
    'is',
    'is_not',
] as const;
export type NameFilterOperator = (typeof nameFilterOperators)[number];

export const filterProperties = ['tag', 'area', 'schema', 'name'] as const;
export type FilterProperty = (typeof filterProperties)[number];

export type StructuralFilterTarget = 'table' | 'view';

interface FilterConditionBase {
    readonly kind: 'condition';
    readonly id: string;
}

export interface TagFilterCondition extends FilterConditionBase {
    readonly property: 'tag';
    readonly target: FilterTarget;
    readonly operator: TagFilterOperator;
    readonly value: readonly string[];
}

export interface AreaFilterCondition extends FilterConditionBase {
    readonly property: 'area';
    readonly target: StructuralFilterTarget;
    readonly operator: MembershipFilterOperator;
    readonly value: readonly string[];
}

export interface SchemaFilterCondition extends FilterConditionBase {
    readonly property: 'schema';
    readonly target: StructuralFilterTarget;
    readonly operator: MembershipFilterOperator;
    readonly value: readonly string[];
}

export interface NameFilterCondition extends FilterConditionBase {
    readonly property: 'name';
    readonly target: FilterTarget;
    readonly operator: NameFilterOperator;
    readonly value: string;
}

export type FilterCondition =
    | TagFilterCondition
    | AreaFilterCondition
    | SchemaFilterCondition
    | NameFilterCondition;

export interface FilterGroup {
    readonly kind: 'group';
    readonly id: string;
    readonly operator: FilterGroupOperator;
    readonly children: readonly FilterExpression[];
}

export type FilterExpression = FilterGroup | FilterCondition;

export interface FilterNormalizationScope {
    readonly tagIds: ReadonlySet<string>;
    readonly areaIds: ReadonlySet<string>;
    readonly schemaIds: ReadonlySet<string>;
}

const isFilterTarget = (value: string): value is FilterTarget =>
    filterTargets.some((target) => target === value);

const isTagOperator = (value: string): value is TagFilterOperator =>
    tagFilterOperators.some((operator) => operator === value);

const isMembershipOperator = (
    value: string
): value is MembershipFilterOperator =>
    membershipFilterOperators.some((operator) => operator === value);

const isNameOperator = (value: string): value is NameFilterOperator =>
    nameFilterOperators.some((operator) => operator === value);

export const propertiesForTarget = (
    target: FilterTarget
): readonly FilterProperty[] =>
    target === 'field' || target === 'relationship'
        ? ['tag', 'name']
        : ['tag', 'area', 'schema', 'name'];

export const operatorsForProperty = (
    property: FilterProperty
): readonly string[] => {
    switch (property) {
        case 'tag':
            return tagFilterOperators;
        case 'area':
        case 'schema':
            return membershipFilterOperators;
        case 'name':
            return nameFilterOperators;
        default: {
            const exhaustive: never = property;
            return exhaustive;
        }
    }
};

export const createFilterGroup = (
    operator: FilterGroupOperator = 'and',
    children: readonly FilterExpression[] = [],
    id: string = generateId()
): FilterGroup => ({
    kind: 'group',
    id,
    operator,
    children,
});

export const emptyFilterGroup = (): FilterGroup => createFilterGroup('and');

const structuralTarget = (target: FilterTarget): StructuralFilterTarget =>
    target === 'view' ? 'view' : 'table';

export const createFilterCondition = (
    target: FilterTarget,
    property: FilterProperty = propertiesForTarget(target)[0],
    id: string = generateId()
): FilterCondition => {
    const legalProperty = propertiesForTarget(target).includes(property)
        ? property
        : propertiesForTarget(target)[0];

    switch (legalProperty) {
        case 'tag':
            return {
                kind: 'condition',
                id,
                target,
                property: 'tag',
                operator: 'is_any_of',
                value: [],
            };
        case 'area':
            return {
                kind: 'condition',
                id,
                target: structuralTarget(target),
                property: 'area',
                operator: 'is_any_of',
                value: [],
            };
        case 'schema':
            return {
                kind: 'condition',
                id,
                target: structuralTarget(target),
                property: 'schema',
                operator: 'is_any_of',
                value: [],
            };
        case 'name':
            return {
                kind: 'condition',
                id,
                target,
                property: 'name',
                operator: 'contains',
                value: '',
            };
        default: {
            const exhaustive: never = legalProperty;
            return exhaustive;
        }
    }
};

export const isConditionComplete = (condition: FilterCondition): boolean => {
    switch (condition.property) {
        case 'tag':
        case 'area':
        case 'schema':
            return condition.value.length > 0;
        case 'name':
            return condition.value.trim().length > 0;
        default: {
            const exhaustive: never = condition;
            return exhaustive;
        }
    }
};

export const hasActiveFilter = (expression: FilterExpression): boolean => {
    if (expression.kind === 'condition') {
        return isConditionComplete(expression);
    }

    return expression.children.some((child) => hasActiveFilter(child));
};

export const expressionHasViewCondition = (
    expression: FilterExpression
): boolean => {
    if (expression.kind === 'condition') {
        return expression.target === 'view' && isConditionComplete(expression);
    }

    return expression.children.some((child) =>
        expressionHasViewCondition(child)
    );
};

export const filterGroupDepth = (
    group: FilterGroup,
    groupId: string,
    depth = 0
): number | null => {
    if (group.id === groupId) {
        return depth;
    }

    for (const child of group.children) {
        if (child.kind !== 'group') {
            continue;
        }

        const found = filterGroupDepth(child, groupId, depth + 1);

        if (found !== null) {
            return found;
        }
    }

    return null;
};

export const canAddFilterGroup = (
    expression: FilterGroup,
    groupId: string
): boolean => {
    const depth = filterGroupDepth(expression, groupId);

    return depth !== null && depth < FILTER_MAX_GROUP_DEPTH;
};

const mapGroup = (
    group: FilterGroup,
    groupId: string,
    update: (group: FilterGroup) => FilterGroup
): FilterGroup => {
    if (group.id === groupId) {
        return update(group);
    }

    let changed = false;
    const children = group.children.map((child) => {
        if (child.kind !== 'group') {
            return child;
        }

        const next = mapGroup(child, groupId, update);

        if (next !== child) {
            changed = true;
        }

        return next;
    });

    return changed ? { ...group, children } : group;
};

export const addConditionToGroup = (
    root: FilterGroup,
    groupId: string
): FilterGroup =>
    mapGroup(root, groupId, (group) => ({
        ...group,
        children: [...group.children, createFilterCondition('table')],
    }));

export const addGroupToGroup = (
    root: FilterGroup,
    groupId: string
): FilterGroup => {
    if (!canAddFilterGroup(root, groupId)) {
        return root;
    }

    return mapGroup(root, groupId, (group) => ({
        ...group,
        children: [...group.children, createFilterGroup()],
    }));
};

export const setGroupOperator = (
    root: FilterGroup,
    groupId: string,
    operator: FilterGroupOperator
): FilterGroup =>
    mapGroup(root, groupId, (group) =>
        group.operator === operator ? group : { ...group, operator }
    );

export const removeFilterNode = (
    root: FilterGroup,
    nodeId: string
): FilterGroup => {
    if (root.id === nodeId) {
        return root;
    }

    const removeFrom = (group: FilterGroup): FilterGroup => {
        let changed = false;
        const children: FilterExpression[] = [];

        for (const child of group.children) {
            if (child.id === nodeId) {
                changed = true;
                continue;
            }

            if (child.kind === 'group') {
                const next = removeFrom(child);

                if (next !== child) {
                    changed = true;
                }

                children.push(next);
                continue;
            }

            children.push(child);
        }

        return changed ? { ...group, children } : group;
    };

    return removeFrom(root);
};

export const replaceFilterCondition = (
    root: FilterGroup,
    conditionId: string,
    nextCondition: FilterCondition
): FilterGroup => {
    const walk = (group: FilterGroup): FilterGroup => {
        let changed = false;
        const children = group.children.map((child) => {
            if (child.kind === 'condition' && child.id === conditionId) {
                changed = true;
                return nextCondition;
            }

            if (child.kind === 'group') {
                const next = walk(child);

                if (next !== child) {
                    changed = true;
                }

                return next;
            }

            return child;
        });

        return changed ? { ...group, children } : group;
    };

    return walk(root);
};

export const withConditionTarget = (
    condition: FilterCondition,
    target: FilterTarget
): FilterCondition => {
    if (condition.target === target) {
        return condition;
    }

    const legal = propertiesForTarget(target);

    if (!legal.includes(condition.property)) {
        return createFilterCondition(target, legal[0], condition.id);
    }

    if (condition.property === 'area' || condition.property === 'schema') {
        return {
            ...condition,
            target: structuralTarget(target),
        };
    }

    return {
        ...condition,
        target,
    };
};

export const withConditionProperty = (
    condition: FilterCondition,
    property: FilterProperty
): FilterCondition => {
    if (condition.property === property) {
        return condition;
    }

    if (!propertiesForTarget(condition.target).includes(property)) {
        return condition;
    }

    return createFilterCondition(condition.target, property, condition.id);
};

export const withConditionOperator = (
    condition: FilterCondition,
    operator: string
): FilterCondition => {
    switch (condition.property) {
        case 'tag':
            if (!isTagOperator(operator) || condition.operator === operator) {
                return condition;
            }

            return { ...condition, operator };
        case 'area':
        case 'schema':
            if (
                !isMembershipOperator(operator) ||
                condition.operator === operator
            ) {
                return condition;
            }

            return { ...condition, operator };
        case 'name':
            if (!isNameOperator(operator) || condition.operator === operator) {
                return condition;
            }

            return { ...condition, operator };
        default: {
            const exhaustive: never = condition;
            return exhaustive;
        }
    }
};

export const withConditionValue = (
    condition: FilterCondition,
    value: readonly string[] | string
): FilterCondition => {
    switch (condition.property) {
        case 'tag':
        case 'area':
        case 'schema':
            return Array.isArray(value) ? { ...condition, value } : condition;
        case 'name':
            return typeof value === 'string'
                ? { ...condition, value }
                : condition;
        default: {
            const exhaustive: never = condition;
            return exhaustive;
        }
    }
};

const pruneIds = (
    value: readonly string[],
    liveIds: ReadonlySet<string>
): readonly string[] => value.filter((id) => liveIds.has(id));

const sameIds = (left: readonly string[], right: readonly string[]): boolean =>
    left.length === right.length &&
    left.every((id, index) => id === right[index]);

const normalizeCondition = (
    condition: FilterCondition,
    scope: FilterNormalizationScope
): FilterCondition => {
    if (!isFilterTarget(condition.target)) {
        return createFilterCondition('table', 'tag', condition.id);
    }

    const legal = propertiesForTarget(condition.target);

    if (!legal.includes(condition.property)) {
        return createFilterCondition(condition.target, legal[0], condition.id);
    }

    switch (condition.property) {
        case 'tag': {
            const operator = isTagOperator(condition.operator)
                ? condition.operator
                : 'is_any_of';
            const value = pruneIds(condition.value, scope.tagIds);

            if (
                operator === condition.operator &&
                sameIds(value, condition.value)
            ) {
                return condition;
            }

            return { ...condition, operator, value };
        }
        case 'area': {
            const operator = isMembershipOperator(condition.operator)
                ? condition.operator
                : 'is_any_of';
            const value = pruneIds(condition.value, scope.areaIds);
            const target = structuralTarget(condition.target);

            if (
                operator === condition.operator &&
                target === condition.target &&
                sameIds(value, condition.value)
            ) {
                return condition;
            }

            return { ...condition, target, operator, value };
        }
        case 'schema': {
            const operator = isMembershipOperator(condition.operator)
                ? condition.operator
                : 'is_any_of';
            const value = pruneIds(condition.value, scope.schemaIds);
            const target = structuralTarget(condition.target);

            if (
                operator === condition.operator &&
                target === condition.target &&
                sameIds(value, condition.value)
            ) {
                return condition;
            }

            return { ...condition, target, operator, value };
        }
        case 'name': {
            const operator = isNameOperator(condition.operator)
                ? condition.operator
                : 'contains';

            if (operator === condition.operator) {
                return condition;
            }

            return { ...condition, operator };
        }
        default: {
            const exhaustive: never = condition;
            return exhaustive;
        }
    }
};

const normalizeGroup = (
    group: FilterGroup,
    depth: number,
    scope: FilterNormalizationScope
): FilterGroup => {
    const operator: FilterGroupOperator =
        group.operator === 'or' ? 'or' : 'and';
    let changed = operator !== group.operator;
    const children: FilterExpression[] = [];

    for (const child of group.children) {
        if (child.kind === 'group') {
            if (depth >= FILTER_MAX_GROUP_DEPTH) {
                changed = true;
                continue;
            }

            const next = normalizeGroup(child, depth + 1, scope);

            if (next !== child) {
                changed = true;
            }

            children.push(next);
            continue;
        }

        const next = normalizeCondition(child, scope);

        if (next !== child) {
            changed = true;
        }

        children.push(next);
    }

    if (!changed) {
        return group;
    }

    return { ...group, operator, children };
};

export const normalizeFilterExpression = (
    expression: FilterGroup,
    scope: FilterNormalizationScope
): FilterGroup => normalizeGroup(expression, 0, scope);

export const filterNormalizationScopeFromDiagram = (
    diagram: Pick<Diagram, 'tags' | 'areas' | 'tables' | 'databaseType'>
): FilterNormalizationScope => ({
    tagIds: new Set((diagram.tags ?? []).map((tag) => tag.id)),
    areaIds: new Set((diagram.areas ?? []).map((area) => area.id)),
    schemaIds: new Set(
        listDiagramSchemaOptions(diagram.tables, diagram.databaseType).map(
            (schema) => schema.id
        )
    ),
});

export const cloneFilterExpression = <T extends FilterExpression>(
    expression: T
): T => structuredClone(expression);
