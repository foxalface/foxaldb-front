import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import {
    canonicalizeTagAssignments,
    tagTargetTypes,
    type DiagramTag,
    type DiagramTagAssignment,
    type TagTargetType,
} from '@/lib/domain/diagram-tag';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const nonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const readTags = (value: unknown): DiagramTag[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((item) => {
        if (!isRecord(item)) {
            return [];
        }

        const keys = Object.keys(item);

        if (
            !nonEmptyString(item.id) ||
            !nonEmptyString(item.name) ||
            keys.some((key) => key !== 'id' && key !== 'name')
        ) {
            return [];
        }

        return [
            {
                id: item.id,
                name: item.name,
            },
        ];
    });
};

const isTagTargetType = (value: unknown): value is TagTargetType =>
    typeof value === 'string' &&
    tagTargetTypes.some((targetType) => targetType === value);

const readTagAssignments = (value: unknown): DiagramTagAssignment[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((item) => {
        if (!isRecord(item)) {
            return [];
        }

        if (
            !nonEmptyString(item.id) ||
            !nonEmptyString(item.tagId) ||
            !isTagTargetType(item.targetType) ||
            !nonEmptyString(item.targetId)
        ) {
            return [];
        }

        return [
            {
                id: item.id,
                tagId: item.tagId,
                targetType: item.targetType,
                targetId: item.targetId,
            },
        ];
    });
};

export const normalizeDiagramFromApi = (
    rawDiagram: unknown,
    diagramIdFromRoute?: string
): Diagram => {
    const raw = (rawDiagram ?? {}) as Record<string, unknown>;
    const content = (raw.content ?? {}) as Record<string, unknown>;
    const now = new Date();
    const parseDate = (value: unknown) =>
        value instanceof Date
            ? value
            : typeof value === 'string' || typeof value === 'number'
              ? new Date(value)
              : now;

    const diagram: Diagram = {
        id:
            (content.id as string | undefined) ??
            (raw.id as string | undefined) ??
            diagramIdFromRoute ??
            '',
        name:
            (content.name as string | undefined) ??
            (raw.name as string | undefined) ??
            'Untitled Diagram',
        databaseType:
            (content.databaseType as Diagram['databaseType'] | undefined) ??
            DatabaseType.GENERIC,
        databaseEdition: content.databaseEdition as
            | Diagram['databaseEdition']
            | undefined,
        tables: Array.isArray(content.tables) ? content.tables : [],
        relationships: Array.isArray(content.relationships)
            ? content.relationships
            : [],
        dependencies: Array.isArray(content.dependencies)
            ? content.dependencies
            : [],
        areas: Array.isArray(content.areas) ? content.areas : [],
        customTypes: Array.isArray(content.customTypes)
            ? content.customTypes
            : [],
        notes: Array.isArray(content.notes) ? content.notes : [],
        tags: readTags(content.tags),
        tagAssignments: readTagAssignments(content.tagAssignments),
        createdAt: parseDate(content.createdAt ?? raw.createdAt),
        updatedAt: parseDate(content.updatedAt ?? raw.updatedAt),
    };

    return canonicalizeTagAssignments(diagram);
};
