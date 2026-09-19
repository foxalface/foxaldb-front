import type { KnownDrizzleExportNoteCode } from './drizzle-export-note-codes';
import type { DrizzleExportNote } from '@/lib/api/drizzle-export-types';

export const DRIZZLE_EXPORT_WARNING_NOTE_CODES = [
    'view_skipped',
    'type_omitted',
    'type_degraded',
    'enum_degraded',
    'set_degraded',
    'uuid_as_text',
    'default_omitted',
    'increment_omitted',
    'relationship_skipped',
    'index_omitted',
    'check_omitted',
    'comment_omitted',
    'set_null_omitted',
    'keyless_table_skipped',
] as const satisfies readonly KnownDrizzleExportNoteCode[];

export const DRIZZLE_EXPORT_ADAPTATION_NOTE_CODES = [
    'mariadb_mysql_dialect_adapted',
    'mysql_catalog_omitted',
    'mysql_multiple_catalogs_ignored',
    'mariadb_catalog_omitted',
    'mariadb_multiple_catalogs_ignored',
    'schema_ignored_sqlite',
    'postgres_schema_qualified',
    'table_name_adjusted',
    'table_name_collision',
    'column_name_adjusted',
    'keyless_table',
    'sqlite_boolean_integer',
    'sqlite_json_text',
] as const satisfies readonly KnownDrizzleExportNoteCode[];

export type DrizzleExportNoteSeverity = 'warning' | 'adaptation';

const WARNING_CODES = new Set<string>(DRIZZLE_EXPORT_WARNING_NOTE_CODES);
const ADAPTATION_CODES = new Set<string>(DRIZZLE_EXPORT_ADAPTATION_NOTE_CODES);

export const getDrizzleExportNoteSeverity = (
    code: string
): DrizzleExportNoteSeverity => {
    if (ADAPTATION_CODES.has(code)) {
        return 'adaptation';
    }

    return 'warning';
};

export const hasDrizzleExportNoteSeverityPolicy = (
    code: string
): code is KnownDrizzleExportNoteCode =>
    WARNING_CODES.has(code) || ADAPTATION_CODES.has(code);

export const partitionDrizzleExportNotes = (
    notes: DrizzleExportNote[]
): {
    warnings: DrizzleExportNote[];
    adaptations: DrizzleExportNote[];
} => {
    const warnings: DrizzleExportNote[] = [];
    const adaptations: DrizzleExportNote[] = [];

    for (const note of notes) {
        if (getDrizzleExportNoteSeverity(note.code) === 'adaptation') {
            adaptations.push(note);
        } else {
            warnings.push(note);
        }
    }

    return { warnings, adaptations };
};
