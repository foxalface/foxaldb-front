import type { Diagram } from '@/lib/domain/diagram';
import type { MergePreviewDecorations } from '@/lib/schema-merge/preview/preview-types';
import type {
    MergePreviewEdgeDecoration,
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

    for (const [tableId, change] of Object.entries(decorations.tables)) {
        mergePreviewByTableId.set(tableId, [
            { entityKind: 'table', entityId: tableId, change },
        ]);
    }

    for (const [fieldId, change] of Object.entries(decorations.fields)) {
        const parentTable = (diagram.tables ?? []).find((table) =>
            table.fields.some((field) => field.id === fieldId)
        );

        if (!parentTable) {
            continue;
        }

        const existing = mergePreviewByTableId.get(parentTable.id) ?? [];
        mergePreviewByTableId.set(parentTable.id, [
            ...existing,
            { entityKind: 'field', entityId: fieldId, change },
        ]);
    }

    for (const [relationshipId, change] of Object.entries(
        decorations.relationships
    )) {
        mergePreviewByRelationshipId.set(relationshipId, { change });
    }

    return { mergePreviewByTableId, mergePreviewByRelationshipId };
};
