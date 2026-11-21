import type { DBField } from './db-field';
import type { DBRelationship } from './db-relationship';
import type { DBTable } from './db-table';
import type { Diagram } from './diagram';
import type { DiagramTagAssignment, TagMatchMode } from './diagram-tag';
import { matchesTags } from './diagram-tag';
import { defaultSchemas } from '../data/default-schemas';
import { schemaNameToSchemaId } from './db-schema';
import type {
    AreaFilterCondition,
    FilterCondition,
    FilterExpression,
    FilterGroup,
    NameFilterCondition,
    SchemaFilterCondition,
    TagFilterCondition,
    TagFilterOperator,
} from './filter-expression';
import {
    FILTER_MAX_GROUP_DEPTH,
    hasActiveFilter,
    isConditionComplete,
} from './filter-expression';

export interface DirectMatch {
    readonly tables: ReadonlySet<string>;
    readonly fields: ReadonlySet<string>;
    readonly relationships: ReadonlySet<string>;
}

export interface FilterEvaluation {
    readonly constrained: boolean;
    readonly direct: DirectMatch;
}

export type FilterEvaluationResult =
    | { readonly status: 'ok'; readonly evaluation: FilterEvaluation }
    | { readonly status: 'too_complex' };

/**
 * Maximum DNF clause count that can be evaluated completely.
 * A larger expansion is rejected as a whole. It is never truncated.
 */
export const FILTER_MAX_CLAUSES = 256;

export type FilterExpressionComplexity =
    | { readonly status: 'supported'; readonly clauseCount: number }
    | { readonly status: 'too_complex' };

const emptyDirectMatch = (): DirectMatch => ({
    tables: new Set<string>(),
    fields: new Set<string>(),
    relationships: new Set<string>(),
});

interface FieldRef {
    readonly field: DBField;
    readonly table: DBTable;
}

interface FilterCatalog {
    readonly tables: readonly DBTable[];
    readonly tableById: ReadonlyMap<string, DBTable>;
    readonly fields: readonly FieldRef[];
    readonly relationships: readonly DBRelationship[];
    readonly tags: {
        readonly table: ReadonlyMap<string, readonly string[]>;
        readonly field: ReadonlyMap<string, readonly string[]>;
        readonly relationship: ReadonlyMap<string, readonly string[]>;
    };
    readonly defaultSchema: string | undefined;
}

type Clause = readonly FilterCondition[];

type Compiled =
    | { readonly kind: 'unconstrained' }
    | { readonly kind: 'clauses'; readonly clauses: readonly Clause[] };

type ClauseCount =
    | { readonly status: 'unconstrained' }
    | { readonly status: 'count'; readonly count: number }
    | { readonly status: 'too_complex' };

const tagMode = (operator: TagFilterOperator): TagMatchMode => {
    switch (operator) {
        case 'is_any_of':
            return 'any';
        case 'is_all_of':
            return 'all';
        case 'is_none_of':
            return 'none';
        default: {
            const exhaustive: never = operator;
            return exhaustive;
        }
    }
};

const tagsByTarget = (
    assignments: readonly DiagramTagAssignment[]
): FilterCatalog['tags'] => {
    const table = new Map<string, string[]>();
    const field = new Map<string, string[]>();
    const relationship = new Map<string, string[]>();

    for (const assignment of assignments) {
        const bucket =
            assignment.targetType === 'table'
                ? table
                : assignment.targetType === 'field'
                  ? field
                  : relationship;
        const current = bucket.get(assignment.targetId);

        if (current) {
            current.push(assignment.tagId);
        } else {
            bucket.set(assignment.targetId, [assignment.tagId]);
        }
    }

    return { table, field, relationship };
};

const buildCatalog = (diagram: Diagram): FilterCatalog => {
    const tables = diagram.tables ?? [];
    const tableById = new Map(tables.map((table) => [table.id, table]));
    const fields: FieldRef[] = [];

    for (const table of tables) {
        for (const field of table.fields) {
            fields.push({ field, table });
        }
    }

    return {
        tables,
        tableById,
        fields,
        relationships: diagram.relationships ?? [],
        tags: tagsByTarget(diagram.tagAssignments ?? []),
        defaultSchema: defaultSchemas[diagram.databaseType],
    };
};

const resolvedSchemaId = (
    table: DBTable,
    defaultSchema: string | undefined
): string | undefined => {
    const name = table.schema ?? defaultSchema;

    if (!name) {
        return undefined;
    }

    return schemaNameToSchemaId(name);
};

const nameMatches = (
    entityName: string,
    condition: NameFilterCondition
): boolean => {
    const left = entityName.toLowerCase();
    const right = condition.value.trim().toLowerCase();

    switch (condition.operator) {
        case 'contains':
            return left.includes(right);
        case 'does_not_contain':
            return !left.includes(right);
        case 'starts_with':
            return left.startsWith(right);
        case 'ends_with':
            return left.endsWith(right);
        case 'is':
            return left === right;
        case 'is_not':
            return left !== right;
        default: {
            const exhaustive: never = condition.operator;
            return exhaustive;
        }
    }
};

const membershipMatches = (
    candidateId: string | undefined,
    operator: 'is_any_of' | 'is_none_of',
    selectedIds: readonly string[]
): boolean => {
    const selected = !!candidateId && selectedIds.includes(candidateId);

    return operator === 'is_any_of' ? selected : !selected;
};

const tableMatchesCondition = (
    table: DBTable,
    condition: FilterCondition,
    catalog: FilterCatalog
): boolean => {
    if (condition.target === 'view' ? !table.isView : table.isView) {
        return false;
    }

    switch (condition.property) {
        case 'tag':
            return matchesTags({
                entityTagIds: catalog.tags.table.get(table.id) ?? [],
                selectedTagIds: condition.value,
                mode: tagMode(condition.operator),
            });
        case 'area':
            return membershipMatches(
                table.parentAreaId ?? undefined,
                condition.operator,
                condition.value
            );
        case 'schema':
            return membershipMatches(
                resolvedSchemaId(table, catalog.defaultSchema),
                condition.operator,
                condition.value
            );
        case 'name':
            return nameMatches(table.name, condition);
        default: {
            const exhaustive: never = condition;
            return exhaustive;
        }
    }
};

const fieldMatchesCondition = (
    field: DBField,
    condition: FilterCondition,
    catalog: FilterCatalog
): boolean => {
    if (condition.target !== 'field') {
        return false;
    }

    switch (condition.property) {
        case 'tag':
            return matchesTags({
                entityTagIds: catalog.tags.field.get(field.id) ?? [],
                selectedTagIds: condition.value,
                mode: tagMode(condition.operator),
            });
        case 'name':
            return nameMatches(field.name, condition);
        default: {
            const exhaustive: never = condition;
            return exhaustive;
        }
    }
};

const relationshipMatchesCondition = (
    relationship: DBRelationship,
    condition: FilterCondition,
    catalog: FilterCatalog
): boolean => {
    if (condition.target !== 'relationship') {
        return false;
    }

    switch (condition.property) {
        case 'tag':
            return matchesTags({
                entityTagIds:
                    catalog.tags.relationship.get(relationship.id) ?? [],
                selectedTagIds: condition.value,
                mode: tagMode(condition.operator),
            });
        case 'name':
            return nameMatches(relationship.name, condition);
        default: {
            const exhaustive: never = condition;
            return exhaustive;
        }
    }
};

const isTableCondition = (
    condition: FilterCondition
): condition is
    | TagFilterCondition
    | AreaFilterCondition
    | SchemaFilterCondition
    | NameFilterCondition =>
    condition.target === 'table' || condition.target === 'view';

const childDepth = (expression: FilterExpression, depth: number): number =>
    expression.kind === 'group' ? depth + 1 : depth;

/**
 * Counts the clauses a complete expansion would produce.
 * The walk returns as soon as the product or sum exceeds the limit,
 * so the oversized clause list is never allocated.
 */
const countClauses = (
    expression: FilterExpression,
    depth: number
): ClauseCount => {
    if (expression.kind === 'condition') {
        return isConditionComplete(expression)
            ? { status: 'count', count: 1 }
            : { status: 'unconstrained' };
    }

    if (depth > FILTER_MAX_GROUP_DEPTH) {
        return { status: 'unconstrained' };
    }

    const counts: number[] = [];

    for (const child of expression.children) {
        const counted = countClauses(child, childDepth(child, depth));

        if (counted.status === 'too_complex') {
            return counted;
        }

        if (counted.status === 'count') {
            counts.push(counted.count);
        }
    }

    if (counts.length === 0) {
        return { status: 'unconstrained' };
    }

    if (expression.operator === 'or') {
        let sum = 0;

        for (const count of counts) {
            sum += count;

            if (sum > FILTER_MAX_CLAUSES) {
                return { status: 'too_complex' };
            }
        }

        return { status: 'count', count: sum };
    }

    let product = 1;

    for (const count of counts) {
        if (
            count > FILTER_MAX_CLAUSES ||
            product > FILTER_MAX_CLAUSES / count
        ) {
            return { status: 'too_complex' };
        }

        product *= count;
    }

    return { status: 'count', count: product };
};

export const assessFilterExpressionComplexity = (
    expression: FilterGroup
): FilterExpressionComplexity => {
    const counted = countClauses(expression, 0);

    if (counted.status === 'too_complex') {
        return { status: 'too_complex' };
    }

    return {
        status: 'supported',
        clauseCount: counted.status === 'count' ? counted.count : 0,
    };
};

export const isFilterExpressionSupported = (expression: FilterGroup): boolean =>
    assessFilterExpressionComplexity(expression).status === 'supported';

const compileExpression = (
    expression: FilterExpression,
    depth: number
): Compiled => {
    if (expression.kind === 'condition') {
        if (!isConditionComplete(expression)) {
            return { kind: 'unconstrained' };
        }

        return { kind: 'clauses', clauses: [[expression]] };
    }

    if (depth > FILTER_MAX_GROUP_DEPTH) {
        return { kind: 'unconstrained' };
    }

    const meaningful: Extract<Compiled, { kind: 'clauses' }>[] = [];

    for (const child of expression.children) {
        const compiled = compileExpression(
            child,
            child.kind === 'group' ? depth + 1 : depth
        );

        if (compiled.kind === 'clauses') {
            meaningful.push(compiled);
        }
    }

    if (meaningful.length === 0) {
        return { kind: 'unconstrained' };
    }

    if (expression.operator === 'or') {
        return {
            kind: 'clauses',
            clauses: meaningful.flatMap((child) => child.clauses),
        };
    }

    let product: Clause[] = [[]];

    for (const child of meaningful) {
        const next: Clause[] = [];

        for (const existing of product) {
            for (const clause of child.clauses) {
                next.push([...existing, ...clause]);
            }
        }

        product = next;
    }

    return { kind: 'clauses', clauses: product };
};

const evaluateClause = (
    clause: Clause,
    catalog: FilterCatalog
): DirectMatch => {
    const tableConditions = clause.filter(isTableCondition);
    const fieldConditions = clause.filter(
        (condition) => condition.target === 'field'
    );
    const relationshipConditions = clause.filter(
        (condition) => condition.target === 'relationship'
    );
    const tables = new Set<string>();
    const fields = new Set<string>();
    const relationships = new Set<string>();
    const tablePasses = (table: DBTable): boolean =>
        tableConditions.every((condition) =>
            tableMatchesCondition(table, condition, catalog)
        );

    if (fieldConditions.length === 0 && relationshipConditions.length === 0) {
        for (const table of catalog.tables) {
            if (tablePasses(table)) {
                tables.add(table.id);
            }
        }

        return { tables, fields, relationships };
    }

    if (fieldConditions.length > 0) {
        for (const { field, table } of catalog.fields) {
            if (!tablePasses(table)) {
                continue;
            }

            if (
                fieldConditions.every((condition) =>
                    fieldMatchesCondition(field, condition, catalog)
                )
            ) {
                fields.add(field.id);
            }
        }
    }

    if (relationshipConditions.length > 0) {
        for (const relationship of catalog.relationships) {
            if (
                !relationshipConditions.every((condition) =>
                    relationshipMatchesCondition(
                        relationship,
                        condition,
                        catalog
                    )
                )
            ) {
                continue;
            }

            const source = catalog.tableById.get(relationship.sourceTableId);
            const target = catalog.tableById.get(relationship.targetTableId);
            const endpointMatches =
                (!!source && tablePasses(source)) ||
                (!!target && tablePasses(target));

            if (endpointMatches) {
                relationships.add(relationship.id);
            }
        }
    }

    if (fieldConditions.length > 0 && relationshipConditions.length > 0) {
        const fieldOwnerById = new Map(
            catalog.fields.map((entry) => [entry.field.id, entry.table.id])
        );
        const relationshipById = new Map(
            catalog.relationships.map((relationship) => [
                relationship.id,
                relationship,
            ])
        );
        let changed = true;

        while (changed) {
            changed = false;
            const endpointTableIds = new Set<string>();

            for (const relationshipId of relationships) {
                const relationship = relationshipById.get(relationshipId);

                if (!relationship) {
                    continue;
                }

                endpointTableIds.add(relationship.sourceTableId);
                endpointTableIds.add(relationship.targetTableId);
            }

            for (const fieldId of [...fields]) {
                const ownerId = fieldOwnerById.get(fieldId);

                if (!ownerId || !endpointTableIds.has(ownerId)) {
                    fields.delete(fieldId);
                    changed = true;
                }
            }

            const fieldTableIds = new Set<string>();

            for (const fieldId of fields) {
                const ownerId = fieldOwnerById.get(fieldId);

                if (ownerId) {
                    fieldTableIds.add(ownerId);
                }
            }

            for (const relationshipId of [...relationships]) {
                const relationship = relationshipById.get(relationshipId);

                if (
                    !relationship ||
                    (!fieldTableIds.has(relationship.sourceTableId) &&
                        !fieldTableIds.has(relationship.targetTableId))
                ) {
                    relationships.delete(relationshipId);
                    changed = true;
                }
            }
        }
    }

    return { tables, fields, relationships };
};

const unionMatches = (matches: readonly DirectMatch[]): DirectMatch => {
    const tables = new Set<string>();
    const fields = new Set<string>();
    const relationships = new Set<string>();

    for (const match of matches) {
        for (const id of match.tables) {
            tables.add(id);
        }

        for (const id of match.fields) {
            fields.add(id);
        }

        for (const id of match.relationships) {
            relationships.add(id);
        }
    }

    return { tables, fields, relationships };
};

const ok = (evaluation: FilterEvaluation): FilterEvaluationResult => ({
    status: 'ok',
    evaluation,
});

/**
 * Evaluates a filter expression to direct matches.
 * Structural context is not included. The expression is not mutated.
 * Groups deeper than FILTER_MAX_GROUP_DEPTH are ignored.
 * An expansion past FILTER_MAX_CLAUSES returns too_complex and is not evaluated.
 */
export const evaluateFilterExpression = (
    diagram: Diagram,
    expression: FilterGroup
): FilterEvaluationResult => {
    if (!hasActiveFilter(expression)) {
        return ok({ constrained: false, direct: emptyDirectMatch() });
    }

    if (!isFilterExpressionSupported(expression)) {
        return { status: 'too_complex' };
    }

    const compiled = compileExpression(expression, 0);

    if (compiled.kind === 'unconstrained' || compiled.clauses.length === 0) {
        return ok({ constrained: false, direct: emptyDirectMatch() });
    }

    const catalog = buildCatalog(diagram);

    return ok({
        constrained: true,
        direct: unionMatches(
            compiled.clauses
                .filter((clause) => clause.length > 0)
                .map((clause) => evaluateClause(clause, catalog))
        ),
    });
};
