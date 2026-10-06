import type { ImportFormat } from '@/lib/import/types';
import type { ProjectFramework } from '@/lib/project-import/project-types';

/**
 * Outbound Schema Merge source kinds.
 *
 * Values match `SchemaMergeSourceKind` on the backend. `ef_core` is not a
 * source. This is the only place those strings are declared for the client.
 */
export const SCHEMA_MERGE_SOURCE_KINDS = [
    'sql',
    'postgres_dump',
    'dbml',
    'diagram_json',
    'metadata_json',
    'laravel',
    'prisma',
    'entity_framework_core',
    'rails',
    'django',
    'drizzle',
] as const;

export type SchemaMergeSourceKind = (typeof SCHEMA_MERGE_SOURCE_KINDS)[number];

export interface SchemaMergeCompareSource {
    kind: SchemaMergeSourceKind;
}

type NormalizableImportFormat = Exclude<ImportFormat, 'unsupported'>;

export const SCHEMA_MERGE_SOURCE_KIND_BY_IMPORT_FORMAT = {
    sql: 'sql',
    postgres_dump: 'postgres_dump',
    dbml: 'dbml',
    diagram_json: 'diagram_json',
    metadata_json: 'metadata_json',
} as const satisfies Record<NormalizableImportFormat, SchemaMergeSourceKind>;

export const SCHEMA_MERGE_SOURCE_KIND_BY_PROJECT_FRAMEWORK = {
    laravel: 'laravel',
    prisma: 'prisma',
    entity_framework_core: 'entity_framework_core',
    rails: 'rails',
    django: 'django',
    drizzle: 'drizzle',
} as const satisfies Record<ProjectFramework, SchemaMergeSourceKind>;

export const schemaMergeSourceKindForImportFormat = (
    format: NormalizableImportFormat
): SchemaMergeSourceKind => SCHEMA_MERGE_SOURCE_KIND_BY_IMPORT_FORMAT[format];

export const schemaMergeSourceKindForProjectFramework = (
    framework: ProjectFramework
): SchemaMergeSourceKind =>
    SCHEMA_MERGE_SOURCE_KIND_BY_PROJECT_FRAMEWORK[framework];

export const isSchemaMergeSourceKind = (
    value: string
): value is SchemaMergeSourceKind =>
    (SCHEMA_MERGE_SOURCE_KINDS as readonly string[]).includes(value);
