import { matchesTags } from '@/lib/domain/diagram-tag';
import type {
    DiagramTagAssignment,
    TagMatchMode,
} from '@/lib/domain/diagram-tag';

const noTags: readonly string[] = [];

export interface TagCanvasVisibilityTable {
    id: string;
    fields: readonly { id: string }[];
}

export interface TagCanvasVisibilityRelationship {
    id: string;
    sourceTableId: string;
    targetTableId: string;
}

export interface TagCanvasVisibility {
    readonly visibleTableIds: ReadonlySet<string>;
    readonly visibleRelationshipIds: ReadonlySet<string>;
}

const tagsByTarget = (
    tagAssignments: readonly DiagramTagAssignment[]
): {
    table: Map<string, string[]>;
    field: Map<string, string[]>;
    relationship: Map<string, string[]>;
} => {
    const table = new Map<string, string[]>();
    const field = new Map<string, string[]>();
    const relationship = new Map<string, string[]>();

    for (const assignment of tagAssignments) {
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

/**
 * Derives canvas visibility inside an already-eligible table universe.
 * Empty selected tags keep every eligible table and every relationship
 * whose endpoints are both eligible. Field and relationship anchors require
 * at least one assignment, so NONE does not promote untagged entities.
 */
export const deriveTagCanvasVisibility = ({
    tables,
    relationships,
    tagAssignments,
    selectedTagIds,
    matchMode,
    eligibleTableIds,
}: {
    tables: readonly TagCanvasVisibilityTable[];
    relationships: readonly TagCanvasVisibilityRelationship[];
    tagAssignments: readonly DiagramTagAssignment[];
    selectedTagIds: readonly string[];
    matchMode: TagMatchMode;
    eligibleTableIds: ReadonlySet<string>;
}): TagCanvasVisibility => {
    const tags = tagsByTarget(tagAssignments);
    const fieldParentTableId = new Map<string, string>();

    for (const table of tables) {
        for (const field of table.fields) {
            fieldParentTableId.set(field.id, table.id);
        }
    }

    const visibleTableIds = new Set<string>();
    const matches = (entityTagIds: readonly string[]): boolean =>
        matchesTags({
            entityTagIds,
            selectedTagIds,
            mode: matchMode,
        });

    for (const tableId of eligibleTableIds) {
        if (matches(tags.table.get(tableId) ?? noTags)) {
            visibleTableIds.add(tableId);
        }
    }

    for (const [fieldId, entityTagIds] of tags.field) {
        if (entityTagIds.length === 0) {
            continue;
        }

        const parentTableId = fieldParentTableId.get(fieldId);

        if (!parentTableId || !eligibleTableIds.has(parentTableId)) {
            continue;
        }

        if (matches(entityTagIds)) {
            visibleTableIds.add(parentTableId);
        }
    }

    for (const relationship of relationships) {
        const entityTagIds = tags.relationship.get(relationship.id) ?? noTags;

        if (entityTagIds.length === 0 || !matches(entityTagIds)) {
            continue;
        }

        if (eligibleTableIds.has(relationship.sourceTableId)) {
            visibleTableIds.add(relationship.sourceTableId);
        }

        if (eligibleTableIds.has(relationship.targetTableId)) {
            visibleTableIds.add(relationship.targetTableId);
        }
    }

    const visibleRelationshipIds = new Set<string>();

    for (const relationship of relationships) {
        if (
            !visibleTableIds.has(relationship.sourceTableId) ||
            !visibleTableIds.has(relationship.targetTableId)
        ) {
            continue;
        }

        const entityTagIds = tags.relationship.get(relationship.id) ?? noTags;

        if (entityTagIds.length === 0 || matches(entityTagIds)) {
            visibleRelationshipIds.add(relationship.id);
        }
    }

    return { visibleTableIds, visibleRelationshipIds };
};

export const tableHiddenByTagVisibility = (
    preTagHidden: boolean,
    tableId: string,
    visibility: TagCanvasVisibility | null
): boolean => {
    if (preTagHidden || !visibility) {
        return preTagHidden;
    }

    return !visibility.visibleTableIds.has(tableId);
};

export const relationshipHiddenByTagVisibility = (
    relationshipId: string,
    visibility: TagCanvasVisibility | null
): boolean => {
    if (!visibility) {
        return false;
    }

    return !visibility.visibleRelationshipIds.has(relationshipId);
};

export const areaHiddenByTagVisibility = ({
    areaAlreadyHidden,
    tableIdsInArea,
    visibility,
}: {
    areaAlreadyHidden: boolean;
    tableIdsInArea: readonly string[];
    visibility: TagCanvasVisibility | null;
}): boolean => {
    if (areaAlreadyHidden || !visibility || tableIdsInArea.length === 0) {
        return areaAlreadyHidden;
    }

    return tableIdsInArea.every(
        (tableId) => !visibility.visibleTableIds.has(tableId)
    );
};
