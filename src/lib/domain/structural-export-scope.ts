import type { Diagram } from './diagram';
import { matchesTags, type TagMatchMode } from './diagram-tag';

/**
 * Structural export scope owned by the export wizard.
 * It is not diagram metadata and it is not the editor canvas filter.
 */
export type StructuralExportScope =
    | { readonly kind: 'all' }
    | {
          readonly kind: 'tags';
          readonly selectedTagIds: readonly string[];
          readonly matchMode: TagMatchMode;
      };

export const fullStructuralExportScope: StructuralExportScope = {
    kind: 'all',
};

const tableTagIdsByTableId = (
    diagram: Diagram
): Map<string, readonly string[]> => {
    const tagsByTableId = new Map<string, string[]>();

    for (const assignment of diagram.tagAssignments ?? []) {
        if (assignment.targetType !== 'table') {
            continue;
        }

        const assigned = tagsByTableId.get(assignment.targetId);

        if (assigned) {
            assigned.push(assignment.tagId);
            continue;
        }

        tagsByTableId.set(assignment.targetId, [assignment.tagId]);
    }

    return tagsByTableId;
};

/**
 * Projects a diagram for structural exporters.
 * `all`, and By tags with an empty selection, return the same diagram.
 * By tags otherwise keeps complete tables whose table assignments match,
 * and relationships/dependencies whose endpoints are both kept.
 * Field and relationship tags do not select tables. The input is not mutated.
 */
export const projectDiagramForStructuralExport = (
    diagram: Diagram,
    scope: StructuralExportScope
): Diagram => {
    if (scope.kind === 'all' || scope.selectedTagIds.length === 0) {
        return diagram;
    }

    const tagsByTableId = tableTagIdsByTableId(diagram);
    const tables = diagram.tables?.filter((table) =>
        matchesTags({
            entityTagIds: tagsByTableId.get(table.id) ?? [],
            selectedTagIds: scope.selectedTagIds,
            mode: scope.matchMode,
        })
    );
    const includedTableIds = new Set((tables ?? []).map((table) => table.id));

    return {
        ...diagram,
        tables,
        relationships: diagram.relationships?.filter(
            (relationship) =>
                includedTableIds.has(relationship.sourceTableId) &&
                includedTableIds.has(relationship.targetTableId)
        ),
        dependencies: diagram.dependencies?.filter(
            (dependency) =>
                includedTableIds.has(dependency.tableId) &&
                includedTableIds.has(dependency.dependentTableId)
        ),
    };
};
