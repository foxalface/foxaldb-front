import { DatabaseMetadataSchema } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { DatabaseType } from '@/lib/domain/database-type';
import type {
    DetectionConfidence,
    FormatDetectionResult,
    ImportFormat,
} from './types';
import { hasGenericDdlKeywords } from './sql-evidence';

const DBML_PATTERNS = [
    /^Table\s+\w+\s*{/m,
    /^Ref:\s*\w+/m,
    /^Enum\s+\w+\s*{/m,
    /^TableGroup\s+/m,
    /^Note\s+\w+\s*{/m,
    /\[pk\]/,
    /\[ref:\s*[<>-]/,
] as const;

const PG_DUMP_MARKERS = [
    'SET statement_timeout',
    'SET lock_timeout',
    'SET client_encoding',
    'SET standard_conforming_strings',
    'SELECT pg_catalog.set_config',
    'ALTER TABLE ONLY',
    'COMMENT ON EXTENSION',
] as const;

const isWhitespaceOnly = (content: string): boolean =>
    content.trim().length === 0;

const hasDbmlPatterns = (content: string): boolean =>
    DBML_PATTERNS.some((pattern) => pattern.test(content));

const isPostgresDumpFormat = (content: string): boolean => {
    for (const marker of PG_DUMP_MARKERS) {
        if (content.includes(marker)) {
            return true;
        }
    }

    if (
        (content.includes('COPY') && content.includes('FROM stdin')) ||
        /--\s+Name:.*Type:/i.test(content)
    ) {
        return true;
    }

    return false;
};

const tryParseJsonObject = (content: string): unknown | null => {
    const trimmed = content.trim();
    if (
        !(trimmed.startsWith('{') && trimmed.endsWith('}')) &&
        !(trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
        return null;
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        return null;
    }
};

const isMetadataJsonStructure = (value: unknown): boolean => {
    return DatabaseMetadataSchema.safeParse(value).success;
};

const isDiagramJsonStructure = (value: unknown): boolean => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const record = value as Record<string, unknown>;

    if (
        typeof record.id !== 'string' ||
        typeof record.name !== 'string' ||
        typeof record.databaseType !== 'string'
    ) {
        return false;
    }

    if (
        !Object.values(DatabaseType).includes(
            record.databaseType as DatabaseType
        )
    ) {
        return false;
    }

    if (
        'fk_info' in record ||
        'columns' in record ||
        'pk_info' in record ||
        'indexes' in record
    ) {
        return false;
    }

    if ('tables' in record && !Array.isArray(record.tables)) {
        return false;
    }

    return true;
};

const resolveJsonFormat = (
    parsed: unknown
): { format: ImportFormat; confidence: DetectionConfidence } | null => {
    if (isMetadataJsonStructure(parsed)) {
        return { format: 'metadata_json', confidence: 'high' };
    }

    if (isDiagramJsonStructure(parsed)) {
        return { format: 'diagram_json', confidence: 'high' };
    }

    return null;
};

/**
 * Pure, synchronous import format detector.
 * Answers only: "What kind of input does this appear to be?"
 */
export const detectImportFormat = (content: string): FormatDetectionResult => {
    if (isWhitespaceOnly(content)) {
        return { format: 'unsupported', confidence: 'unsupported' };
    }

    if (hasDbmlPatterns(content)) {
        return { format: 'dbml', confidence: 'high' };
    }

    const parsedJson = tryParseJsonObject(content);
    if (parsedJson !== null) {
        const jsonFormat = resolveJsonFormat(parsedJson);
        if (jsonFormat) {
            return jsonFormat;
        }

        return { format: 'unsupported', confidence: 'unsupported' };
    }

    if (isPostgresDumpFormat(content)) {
        return { format: 'postgres_dump', confidence: 'high' };
    }

    if (hasGenericDdlKeywords(content)) {
        return { format: 'sql', confidence: 'high' };
    }

    return { format: 'unsupported', confidence: 'unsupported' };
};

/**
 * Returns the database type embedded in a diagram JSON export, if valid.
 */
export const getDiagramJsonDatabaseType = (
    content: string
): DatabaseType | null => {
    const parsedJson = tryParseJsonObject(content);
    if (parsedJson === null || !isDiagramJsonStructure(parsedJson)) {
        return null;
    }

    return (parsedJson as { databaseType: DatabaseType }).databaseType;
};
