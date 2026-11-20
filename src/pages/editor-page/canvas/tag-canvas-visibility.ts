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
    /**
     * null when no tag ids are selected: every field on a visible table is shown.
     * Otherwise only listed field ids are shown on visible tables.
     */
    readonly visibleFieldIds: ReadonlySet<string> | null;
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
 * Empty selected tags keep every eligible table, relationship, and field visible.
 * Field and relationship anchors require at least one assignment to promote
 * endpoints; untagged entities do not promote structurally.
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
    const matches = (entityTagIds: readonly string[]): boolean =>
        matchesTags({
            entityTagIds,
            selectedTagIds,
            mode: matchMode,
        });

    const visibleTableIds = new Set<string>();

    for (const table of tables) {
        if (!eligibleTableIds.has(table.id)) {
            continue;
        }

        if (matches(tags.table.get(table.id) ?? noTags)) {
            visibleTableIds.add(table.id);
        }
    }

    for (const table of tables) {
        if (!eligibleTableIds.has(table.id)) {
            continue;
        }

        for (const field of table.fields) {
            const entityTagIds = tags.field.get(field.id) ?? noTags;

            if (entityTagIds.length > 0 && matches(entityTagIds)) {
                visibleTableIds.add(table.id);
            }
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

    let visibleFieldIds: ReadonlySet<string> | null = null;

    if (selectedTagIds.length > 0) {
        const fieldIds = new Set<string>();

        for (const table of tables) {
            if (!visibleTableIds.has(table.id)) {
                continue;
            }

            for (const field of table.fields) {
                const entityTagIds = tags.field.get(field.id) ?? noTags;

                if (matches(entityTagIds)) {
                    fieldIds.add(field.id);
                }
            }
        }

        visibleFieldIds = fieldIds;
    }

    return { visibleTableIds, visibleRelationshipIds, visibleFieldIds };
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

export const fieldHiddenByTagVisibility = (
    fieldId: string,
    visibility: TagCanvasVisibility | null
): boolean => {
    if (!visibility?.visibleFieldIds) {
        return false;
    }

    return !visibility.visibleFieldIds.has(fieldId);
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
