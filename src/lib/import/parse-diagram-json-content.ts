import { diagramSchema, type Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import { cloneDiagram } from '@/lib/clone';
import { generateDiagramId } from '@/lib/utils';
import { z } from 'zod';

export interface DiagramJsonParseFailure {
    code: 'invalid_diagram_json';
    path: string | null;
    issueCode: string;
}

export type ParseDiagramJsonContentResult =
    | { ok: true; diagram: Diagram }
    | { ok: false; failure: DiagramJsonParseFailure };

const cloneDiagramWithIds = (diagram: Diagram): Diagram => ({
    ...cloneDiagram(diagram).diagram,
    id: generateDiagramId(),
});

export const formatDiagramJsonZodPath = (path: (string | number)[]): string => {
    if (path.length === 0) {
        return '';
    }

    return path.reduce<string>((acc, segment) => {
        if (typeof segment === 'number') {
            return `${acc}[${segment}]`;
        }

        return acc.length === 0 ? segment : `${acc}.${segment}`;
    }, '');
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Coerce known export quirks before Zod validation (e.g. PK index name null → "").
 */
export const normalizeDiagramJsonPayload = (value: unknown): unknown => {
    if (!isRecord(value)) {
        return value;
    }

    const tables = value.tables;

    if (!Array.isArray(tables)) {
        return value;
    }

    const normalizedTables = tables.map((table) => {
        if (!isRecord(table)) {
            return table;
        }

        const indexes = table.indexes;

        if (!Array.isArray(indexes)) {
            return table;
        }

        const normalizedIndexes = indexes.map((index) => {
            if (!isRecord(index)) {
                return index;
            }

            if (index.name === null) {
                return { ...index, name: '' };
            }

            return index;
        });

        return { ...table, indexes: normalizedIndexes };
    });

    return { ...value, tables: normalizedTables };
};

const failureFromZodError = (error: z.ZodError): DiagramJsonParseFailure => {
    const first = error.issues[0];

    return {
        code: 'invalid_diagram_json',
        path: first ? formatDiagramJsonZodPath(first.path) : null,
        issueCode: first?.code ?? 'custom',
    };
};

const failureFromSyntaxError = (): DiagramJsonParseFailure => ({
    code: 'invalid_diagram_json',
    path: null,
    issueCode: 'invalid_json',
});

const readDatabaseTypeFromPayload = (value: unknown): DatabaseType | null => {
    if (!isRecord(value)) {
        return null;
    }

    const candidate = value.databaseType;

    if (typeof candidate !== 'string') {
        return null;
    }

    return Object.values(DatabaseType).includes(candidate as DatabaseType)
        ? (candidate as DatabaseType)
        : null;
};

export const parseDiagramJsonContent = (
    json: string,
    databaseTypeOverride?: DatabaseType
): ParseDiagramJsonContentResult => {
    let loaded: unknown;

    try {
        loaded = JSON.parse(json);
    } catch {
        return { ok: false, failure: failureFromSyntaxError() };
    }

    const normalized = normalizeDiagramJsonPayload(loaded);
    const databaseType =
        databaseTypeOverride ?? readDatabaseTypeFromPayload(normalized);

    if (!databaseType) {
        return {
            ok: false,
            failure: {
                code: 'invalid_diagram_json',
                path: 'databaseType',
                issueCode: 'invalid_enum',
            },
        };
    }

    try {
        const diagram = diagramSchema.parse({
            ...(normalized as object),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const withIds = cloneDiagramWithIds(diagram);

        return {
            ok: true,
            diagram: {
                ...withIds,
                databaseType,
            },
        };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return { ok: false, failure: failureFromZodError(error) };
        }

        return {
            ok: false,
            failure: {
                code: 'invalid_diagram_json',
                path: null,
                issueCode: 'unknown',
            },
        };
    }
};
