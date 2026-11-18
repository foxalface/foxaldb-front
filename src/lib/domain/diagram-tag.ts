import type { Diagram } from './diagram';
import { generateId as defaultGenerateId } from '../utils';
import type { DBTable } from './db-table';
import { z } from 'zod';

export const tagTargetTypes = ['table', 'field', 'relationship'] as const;

export type TagTargetType = (typeof tagTargetTypes)[number];

export type TagMatchMode = 'any' | 'all' | 'none';

export interface DiagramTag {
    id: string;
    name: string;
    color: string;
}

export interface DiagramTagAssignment {
    id: string;
    tagId: string;
    targetType: TagTargetType;
    targetId: string;
}

const nonEmptyString = z.string().min(1);

export const diagramTagSchema: z.ZodType<DiagramTag> = z.object({
    id: nonEmptyString,
    name: nonEmptyString,
    color: nonEmptyString,
});

export const diagramTagAssignmentSchema: z.ZodType<DiagramTagAssignment> =
    z.object({
        id: nonEmptyString,
        tagId: nonEmptyString,
        targetType: z.enum(tagTargetTypes),
        targetId: nonEmptyString,
    });

/**
 * Direct tag-set match. Empty selected tags impose no constraint.
 * This function does not look at tables, fields, relationships, or visibility.
 */
export const matchesTags = ({
    entityTagIds,
    selectedTagIds,
    mode,
}: {
    entityTagIds: readonly string[];
    selectedTagIds: readonly string[];
    mode: TagMatchMode;
}): boolean => {
    if (selectedTagIds.length === 0) {
        return true;
    }

    const entityTags = new Set(entityTagIds);
    const selectedTags = new Set(selectedTagIds);

    if (mode === 'any') {
        for (const tagId of selectedTags) {
            if (entityTags.has(tagId)) {
                return true;
            }
        }

        return false;
    }

    if (mode === 'all') {
        for (const tagId of selectedTags) {
            if (!entityTags.has(tagId)) {
                return false;
            }
        }

        return true;
    }

    for (const tagId of selectedTags) {
        if (entityTags.has(tagId)) {
            return false;
        }
    }

    return true;
};

const isTagTargetType = (value: string): value is TagTargetType =>
    tagTargetTypes.some((targetType) => targetType === value);

/**
 * Drops assignments whose tag or target is no longer on the diagram.
 * Returns a new diagram object and does not mutate the input.
 */
export const canonicalizeTagAssignments = (
    diagram: Diagram,
    options: {
        checkTables?: boolean;
        checkFields?: boolean;
        checkRelationships?: boolean;
    } = {}
): Diagram => {
    const checkTables = options.checkTables ?? true;
    const checkFields = options.checkFields ?? true;
    const checkRelationships = options.checkRelationships ?? true;
    const tags = diagram.tags ?? [];
    const tagIds = new Set(tags.map((tag) => tag.id));
    const tableIds = new Set((diagram.tables ?? []).map((table) => table.id));
    const fieldIds = new Set<string>();

    for (const table of diagram.tables ?? []) {
        for (const field of table.fields ?? []) {
            fieldIds.add(field.id);
        }
    }

    const relationshipIds = new Set(
        (diagram.relationships ?? []).map((relationship) => relationship.id)
    );

    const tagAssignments = (diagram.tagAssignments ?? []).filter(
        (assignment) => {
            if (!tagIds.has(assignment.tagId)) {
                return false;
            }

            if (!isTagTargetType(assignment.targetType)) {
                return false;
            }

            if (assignment.targetType === 'table') {
                return checkTables ? tableIds.has(assignment.targetId) : true;
            }

            if (assignment.targetType === 'field') {
                return checkFields ? fieldIds.has(assignment.targetId) : true;
            }

            return checkRelationships
                ? relationshipIds.has(assignment.targetId)
                : true;
        }
    );

    return {
        ...diagram,
        tags: [...tags],
        tagAssignments,
    };
};

/**
 * Copies table and field assignments onto a table duplicated inside the same diagram.
 * Tag definitions stay shared. Relationship assignments are not copied.
 */
export const cloneTableTagAssignments = ({
    sourceTable,
    clonedTable,
    tagAssignments,
    generateId = defaultGenerateId,
}: {
    sourceTable: DBTable;
    clonedTable: DBTable;
    tagAssignments: readonly DiagramTagAssignment[];
    generateId?: () => string;
}): DiagramTagAssignment[] => {
    const fieldIdBySourceId = new Map<string, string>();

    sourceTable.fields.forEach((field, index) => {
        const clonedField = clonedTable.fields[index];

        if (clonedField) {
            fieldIdBySourceId.set(field.id, clonedField.id);
        }
    });

    const inherited: DiagramTagAssignment[] = [];

    for (const assignment of tagAssignments) {
        if (
            assignment.targetType === 'table' &&
            assignment.targetId === sourceTable.id
        ) {
            inherited.push({
                id: generateId(),
                tagId: assignment.tagId,
                targetType: 'table',
                targetId: clonedTable.id,
            });
            continue;
        }

        if (assignment.targetType !== 'field') {
            continue;
        }

        const targetId = fieldIdBySourceId.get(assignment.targetId);

        if (!targetId) {
            continue;
        }

        inherited.push({
            id: generateId(),
            tagId: assignment.tagId,
            targetType: 'field',
            targetId,
        });
    }

    return inherited;
};
