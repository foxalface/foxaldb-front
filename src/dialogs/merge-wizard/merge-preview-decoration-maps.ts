import type { Diagram } from '@/lib/domain/diagram';
import { assignRelationshipIndicatorLanes } from '@/lib/schema-merge/preview/merge-preview-relationship-indicator-lanes';
import type { MergePreviewDecorations } from '@/lib/schema-merge/preview/preview-types';
import type { MergePreviewHighlightTarget } from '@/lib/schema-merge/preview/resolve-preview-highlight-target';
import type {
    MergePreviewEdgeDecoration,
    MergePreviewEdgeHoverFlags,
    MergePreviewHoverFlags,
    MergePreviewNodeDecoration,
} from '@/pages/editor-page/canvas/diagram-flow-elements';

export interface MergePreviewFlowDecorationMaps {
    mergePreviewByTableId: Map<string, MergePreviewNodeDecoration[]>;
    mergePreviewByRelationshipId: Map<string, MergePreviewEdgeDecoration>;
}

/**
 * Maps M10.1 decorations onto React Flow node/edge data for M10.3 styling.
 * Does not mutate the Diagram.
 */
export const buildMergePreviewFlowDecorationMaps = (
    diagram: Diagram,
    decorations: MergePreviewDecorations
): MergePreviewFlowDecorationMaps => {
    const mergePreviewByTableId = new Map<
        string,
        MergePreviewNodeDecoration[]
    >();
    const mergePreviewByRelationshipId = new Map<
        string,
        MergePreviewEdgeDecoration
    >();

    for (const [tableId, entry] of Object.entries(decorations.tables)) {
        mergePreviewByTableId.set(tableId, [
            {
                entityKind: 'table',
                entityId: tableId,
                change: entry.change,
                operationId: entry.operationId,
            },
        ]);
    }

    for (const [fieldId, entry] of Object.entries(decorations.fields)) {
        const parentTable = (diagram.tables ?? []).find((table) =>
            table.fields.some((field) => field.id === fieldId)
        );

        if (!parentTable) {
            continue;
        }

        const existing = mergePreviewByTableId.get(parentTable.id) ?? [];
        mergePreviewByTableId.set(parentTable.id, [
            ...existing,
            {
                entityKind: 'field',
                entityId: fieldId,
                change: entry.change,
                operationId: entry.operationId,
            },
        ]);
    }

    for (const [relationshipId, entry] of Object.entries(
        decorations.relationships
    )) {
        mergePreviewByRelationshipId.set(relationshipId, {
            change: entry.change,
            operationId: entry.operationId,
        });
    }

    const indicatorLanes = assignRelationshipIndicatorLanes(
        diagram,
        Object.keys(decorations.relationships)
    );

    for (const [relationshipId, lane] of indicatorLanes) {
        const existing = mergePreviewByRelationshipId.get(relationshipId);

        if (!existing) {
            continue;
        }

        mergePreviewByRelationshipId.set(relationshipId, {
            ...existing,
            indicatorLane: lane,
        });
    }

    return { mergePreviewByTableId, mergePreviewByRelationshipId };
};

export const buildMergePreviewHoverMaps = (
    diagram: Diagram,
    highlight: MergePreviewHighlightTarget | null | undefined
): {
    mergePreviewHoverByTableId: Map<string, MergePreviewHoverFlags>;
    mergePreviewHoverByRelationshipId: Map<string, MergePreviewEdgeHoverFlags>;
} => {
    const mergePreviewHoverByTableId = new Map<
        string,
        MergePreviewHoverFlags
    >();
    const mergePreviewHoverByRelationshipId = new Map<
        string,
        MergePreviewEdgeHoverFlags
    >();

    if (!highlight) {
        return {
            mergePreviewHoverByTableId,
            mergePreviewHoverByRelationshipId,
        };
    }

    const tables = diagram.tables ?? [];
    const relationships = diagram.relationships ?? [];
    const involvedTableIds = new Set<string>();

    if (highlight.tableId) {
        involvedTableIds.add(highlight.tableId);
    }

    if (highlight.relationshipId) {
        const relationship = relationships.find(
            (item) => item.id === highlight.relationshipId
        );

        if (relationship) {
            involvedTableIds.add(relationship.sourceTableId);
            involvedTableIds.add(relationship.targetTableId);
            mergePreviewHoverByRelationshipId.set(highlight.relationshipId, {
                focused: true,
                foreground: true,
            });
        }
    }

    for (const relationship of relationships) {
        if (relationship.id === highlight.relationshipId) {
            continue;
        }

        if (highlight.relationshipId) {
            mergePreviewHoverByRelationshipId.set(relationship.id, {
                dimmed: true,
            });
        }
    }

    for (const table of tables) {
        if (highlight.tableId === table.id) {
            mergePreviewHoverByTableId.set(table.id, {
                tableFocused: true,
                fieldFocusedId: highlight.fieldId ?? null,
            });
            continue;
        }

        if (
            highlight.relationshipId ||
            highlight.tableId ||
            highlight.fieldId
        ) {
            mergePreviewHoverByTableId.set(table.id, {
                dimmed: !involvedTableIds.has(table.id),
            });
        }
    }

    return {
        mergePreviewHoverByTableId,
        mergePreviewHoverByRelationshipId,
    };
};
