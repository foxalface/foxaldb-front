import type { Diagram } from '@/lib/domain/diagram';
import {
    canonicalizeTagAssignments,
    type DiagramTag,
    type DiagramTagAssignment,
} from '@/lib/domain/diagram-tag';

export type StoredDiagramTag = DiagramTag & { diagramId: string };
export type StoredDiagramTagAssignment = DiagramTagAssignment & {
    diagramId: string;
};

export const toStoredTag = (
    diagramId: string,
    tag: DiagramTag
): StoredDiagramTag => ({
    id: tag.id,
    name: tag.name,
    diagramId,
});

export const toStoredTagAssignment = (
    diagramId: string,
    assignment: DiagramTagAssignment
): StoredDiagramTagAssignment => ({
    ...assignment,
    diagramId,
});

export const tagFromRow = (row: StoredDiagramTag): DiagramTag => ({
    id: row.id,
    name: row.name,
});

export const tagAssignmentFromRow = (
    row: StoredDiagramTagAssignment
): DiagramTagAssignment => ({
    id: row.id,
    tagId: row.tagId,
    targetType: row.targetType,
    targetId: row.targetId,
});

export const attachStoredTags = (
    diagram: Diagram,
    tags: readonly DiagramTag[],
    tagAssignments: readonly DiagramTagAssignment[],
    options: {
        includeTables?: boolean;
        includeRelationships?: boolean;
    }
): Pick<Diagram, 'tags' | 'tagAssignments'> => {
    const canonical = canonicalizeTagAssignments(
        {
            ...diagram,
            tags: [...tags],
            tagAssignments: [...tagAssignments],
        },
        {
            checkTables: options.includeTables === true,
            checkFields: options.includeTables === true,
            checkRelationships: options.includeRelationships === true,
        }
    );

    return {
        tags: canonical.tags ?? [],
        tagAssignments: canonical.tagAssignments ?? [],
    };
};
