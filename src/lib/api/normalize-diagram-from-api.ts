import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';

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

    return {
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
        createdAt: parseDate(content.createdAt ?? raw.createdAt),
        updatedAt: parseDate(content.updatedAt ?? raw.updatedAt),
    };
};
