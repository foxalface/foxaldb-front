import type { Diagram } from '@/lib/domain/diagram';
import type {
    DiffOperation,
    FieldIdentity,
    RelationshipIdentity,
    TableIdentity,
    ViewIdentity,
} from '../diff-types';
import {
    fieldIdentityKey,
    semanticIdentityKey,
    tableIdentityKey,
    viewIdentityKey,
} from './identity-key';
import {
    previewFieldId,
    previewRelationshipId,
    previewTableId,
} from './preview-id';

export interface MergePreviewHighlightTarget {
    readonly tableId?: string;
    readonly fieldId?: string;
    readonly relationshipId?: string;
}

/**
 * Resolves a hover/focus highlight target for an operation against the current
 * projected preview diagram (not the live editor).
 */
export const resolvePreviewHighlightTarget = (
    operation: DiffOperation,
    diagram: Diagram
): MergePreviewHighlightTarget | null => {
    const tables = diagram.tables ?? [];
    const relationships = diagram.relationships ?? [];

    if (operation.category === 'table' || operation.category === 'view') {
        if (
            operation.entityId &&
            tables.some((t) => t.id === operation.entityId)
        ) {
            return { tableId: operation.entityId };
        }

        if (operation.type === 'add') {
            const previewId =
                operation.category === 'view'
                    ? previewTableId(
                          viewIdentityKey(operation.identity as ViewIdentity)
                      )
                    : previewTableId(
                          tableIdentityKey(operation.identity as TableIdentity)
                      );

            if (tables.some((t) => t.id === previewId)) {
                return { tableId: previewId };
            }
        }

        return null;
    }

    if (operation.category === 'field') {
        if (operation.entityId) {
            for (const table of tables) {
                if (
                    table.fields.some(
                        (field) => field.id === operation.entityId
                    )
                ) {
                    return {
                        tableId: table.id,
                        fieldId: operation.entityId,
                    };
                }
            }
        }

        if (operation.type === 'add') {
            const identity = operation.identity as FieldIdentity;
            const fieldId = previewFieldId(fieldIdentityKey(identity));

            for (const table of tables) {
                if (table.fields.some((field) => field.id === fieldId)) {
                    return { tableId: table.id, fieldId };
                }
            }
        }

        return null;
    }

    if (operation.category === 'relationship') {
        if (
            operation.entityId &&
            relationships.some((rel) => rel.id === operation.entityId)
        ) {
            return { relationshipId: operation.entityId };
        }

        if (operation.type === 'add') {
            const relationshipId = previewRelationshipId(
                semanticIdentityKey(operation.identity as RelationshipIdentity)
            );

            if (relationships.some((rel) => rel.id === relationshipId)) {
                return { relationshipId };
            }
        }

        return null;
    }

    return null;
};
