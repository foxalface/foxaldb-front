import type { Diagram } from '@/lib/domain/diagram';
import { evaluateFilterExpression } from '@/lib/domain/filter-evaluation';
import type { FilterGroup } from '@/lib/domain/filter-expression';

export interface CanvasFilterVisibility {
    readonly visibleTableIds: ReadonlySet<string>;
    readonly visibleRelationshipIds: ReadonlySet<string>;
    readonly visibleDependencyIds: ReadonlySet<string>;
    /**
     * null when the expression does not constrain fields:
     * every field on a visible table is shown.
     */
    readonly visibleFieldIds: ReadonlySet<string> | null;
}

export const tableHiddenByFilterVisibility = (
    preFilterHidden: boolean,
    tableId: string,
    visibility: CanvasFilterVisibility | null
): boolean => {
    if (preFilterHidden || !visibility) {
        return preFilterHidden;
    }

    return !visibility.visibleTableIds.has(tableId);
};

export const fieldHiddenByFilterVisibility = (
    fieldId: string,
    visibility: CanvasFilterVisibility | null
): boolean => {
    if (!visibility?.visibleFieldIds) {
        return false;
    }

    return !visibility.visibleFieldIds.has(fieldId);
};

export const relationshipHiddenByFilterVisibility = (
    relationshipId: string,
    visibility: CanvasFilterVisibility | null
): boolean => {
    if (!visibility) {
        return false;
    }

    return !visibility.visibleRelationshipIds.has(relationshipId);
};

export const dependencyHiddenByFilterVisibility = (
    dependencyId: string,
    visibility: CanvasFilterVisibility | null
): boolean => {
    if (!visibility) {
        return false;
    }

    return !visibility.visibleDependencyIds.has(dependencyId);
};

export const areaHiddenByFilterVisibility = ({
    areaAlreadyHidden,
    tableIdsInArea,
    visibility,
}: {
    areaAlreadyHidden: boolean;
    tableIdsInArea: readonly string[];
    visibility: CanvasFilterVisibility | null;
}): boolean => {
    if (areaAlreadyHidden || !visibility || tableIdsInArea.length === 0) {
        return areaAlreadyHidden;
    }

    return tableIdsInArea.every(
        (tableId) => !visibility.visibleTableIds.has(tableId)
    );
};

const eligibleTableIds = ({
    diagram,
    showViews,
    forceShownTableIds,
}: {
    diagram: Diagram;
    showViews: boolean;
    forceShownTableIds: ReadonlySet<string>;
}): Set<string> => {
    const eligible = new Set<string>();

    for (const table of diagram.tables ?? []) {
        if (forceShownTableIds.has(table.id) || showViews || !table.isView) {
            eligible.add(table.id);
        }
    }

    return eligible;
};

/**
 * Canvas projection for a filter expression.
 * Show views and diff force-show stay outside the expression.
 * Null means every table is eligible and the expression is inactive.
 */
export const projectCanvasVisibility = ({
    diagram,
    expression,
    showViews,
    forceShownTableIds,
}: {
    diagram: Diagram;
    expression: FilterGroup;
    showViews: boolean;
    forceShownTableIds: ReadonlySet<string>;
}): CanvasFilterVisibility | null => {
    const tables = diagram.tables ?? [];
    const eligible = eligibleTableIds({
        diagram,
        showViews,
        forceShownTableIds,
    });
    const result = evaluateFilterExpression(diagram, expression);

    if (result.status === 'too_complex') {
        return {
            visibleTableIds: new Set<string>(),
            visibleRelationshipIds: new Set<string>(),
            visibleDependencyIds: new Set<string>(),
            visibleFieldIds: new Set<string>(),
        };
    }

    const evaluation = result.evaluation;
    const everyTableEligible = tables.every((table) => eligible.has(table.id));

    if (!evaluation.constrained && everyTableEligible) {
        return null;
    }

    const visibleTableIds = new Set<string>();
    const completeTableIds = new Set<string>();
    const requiredFieldIds = new Set<string>();
    const fieldOwner = new Map<string, string>();

    for (const table of tables) {
        for (const field of table.fields) {
            fieldOwner.set(field.id, table.id);
        }
    }

    if (!evaluation.constrained) {
        for (const table of tables) {
            if (eligible.has(table.id)) {
                visibleTableIds.add(table.id);
            }
        }
    } else {
        for (const tableId of evaluation.direct.tables) {
            if (!eligible.has(tableId)) {
                continue;
            }

            visibleTableIds.add(tableId);
            completeTableIds.add(tableId);
        }

        for (const fieldId of evaluation.direct.fields) {
            const tableId = fieldOwner.get(fieldId);

            if (!tableId || !eligible.has(tableId)) {
                continue;
            }

            visibleTableIds.add(tableId);
            requiredFieldIds.add(fieldId);
        }

        for (const relationship of diagram.relationships ?? []) {
            if (!evaluation.direct.relationships.has(relationship.id)) {
                continue;
            }

            if (
                !eligible.has(relationship.sourceTableId) ||
                !eligible.has(relationship.targetTableId)
            ) {
                continue;
            }

            visibleTableIds.add(relationship.sourceTableId);
            visibleTableIds.add(relationship.targetTableId);
            requiredFieldIds.add(relationship.sourceFieldId);
            requiredFieldIds.add(relationship.targetFieldId);
        }
    }

    const visibleRelationshipIds = new Set<string>();

    for (const relationship of diagram.relationships ?? []) {
        if (
            !visibleTableIds.has(relationship.sourceTableId) ||
            !visibleTableIds.has(relationship.targetTableId)
        ) {
            continue;
        }

        const sourceVisible =
            !evaluation.constrained ||
            completeTableIds.has(relationship.sourceTableId) ||
            requiredFieldIds.has(relationship.sourceFieldId);
        const targetVisible =
            !evaluation.constrained ||
            completeTableIds.has(relationship.targetTableId) ||
            requiredFieldIds.has(relationship.targetFieldId);
        const direct =
            evaluation.constrained &&
            evaluation.direct.relationships.has(relationship.id);

        if (!direct && (!sourceVisible || !targetVisible)) {
            continue;
        }

        visibleRelationshipIds.add(relationship.id);

        if (
            evaluation.constrained &&
            !completeTableIds.has(relationship.sourceTableId)
        ) {
            requiredFieldIds.add(relationship.sourceFieldId);
        }

        if (
            evaluation.constrained &&
            !completeTableIds.has(relationship.targetTableId)
        ) {
            requiredFieldIds.add(relationship.targetFieldId);
        }
    }

    const visibleDependencyIds = new Set<string>();

    for (const dependency of diagram.dependencies ?? []) {
        if (
            visibleTableIds.has(dependency.tableId) &&
            visibleTableIds.has(dependency.dependentTableId)
        ) {
            visibleDependencyIds.add(dependency.id);
        }
    }

    if (!evaluation.constrained) {
        return {
            visibleTableIds,
            visibleRelationshipIds,
            visibleDependencyIds,
            visibleFieldIds: null,
        };
    }

    const visibleFieldIds = new Set<string>();

    for (const table of tables) {
        if (!visibleTableIds.has(table.id)) {
            continue;
        }

        for (const field of table.fields) {
            if (
                completeTableIds.has(table.id) ||
                requiredFieldIds.has(field.id)
            ) {
                visibleFieldIds.add(field.id);
            }
        }
    }

    return {
        visibleTableIds,
        visibleRelationshipIds,
        visibleDependencyIds,
        visibleFieldIds,
    };
};
