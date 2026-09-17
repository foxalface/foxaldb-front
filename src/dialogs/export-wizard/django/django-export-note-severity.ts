import type { KnownDjangoExportNoteCode } from './django-export-note-codes';
import type { DjangoExportNote } from '@/lib/api/django-export-types';

export const DJANGO_EXPORT_WARNING_NOTE_CODES = [
    'view_skipped',
    'keyless_table_skipped',
    'type_omitted',
    'type_degraded',
    'enum_degraded',
    'set_degraded',
    'default_omitted',
    'relationship_skipped',
    'composite_fk_unsupported',
    'set_null_omitted',
    'on_delete_restrict_degraded',
    'on_update_omitted',
    'one_to_one_degraded_non_unique_fk',
    'many_to_many_skipped',
    'index_omitted',
    'check_omitted',
] as const satisfies readonly KnownDjangoExportNoteCode[];

export const DJANGO_EXPORT_ADAPTATION_NOTE_CODES = [
    'mysql_catalog_omitted',
    'mysql_multiple_catalogs_ignored',
    'mariadb_catalog_omitted',
    'mariadb_multiple_catalogs_ignored',
    'schema_ignored_sqlite',
    'postgres_schema_qualified_db_table',
    'model_name_adjusted',
    'model_name_collision',
    'field_name_adjusted',
    'related_name_adjusted',
    'composite_primary_key',
    'many_to_many_through_skipped',
    'comment_omitted',
    'index_name_adjusted',
    'constraint_name_adjusted',
] as const satisfies readonly KnownDjangoExportNoteCode[];

export type DjangoExportNoteSeverity = 'warning' | 'adaptation';

const WARNING_CODES = new Set<string>(DJANGO_EXPORT_WARNING_NOTE_CODES);
const ADAPTATION_CODES = new Set<string>(DJANGO_EXPORT_ADAPTATION_NOTE_CODES);

export const getDjangoExportNoteSeverity = (
    code: string
): DjangoExportNoteSeverity => {
    if (ADAPTATION_CODES.has(code)) {
        return 'adaptation';
    }

    return 'warning';
};

export const hasDjangoExportNoteSeverityPolicy = (
    code: string
): code is KnownDjangoExportNoteCode =>
    WARNING_CODES.has(code) || ADAPTATION_CODES.has(code);

export const partitionDjangoExportNotes = (
    notes: DjangoExportNote[]
): {
    warnings: DjangoExportNote[];
    adaptations: DjangoExportNote[];
} => {
    const warnings: DjangoExportNote[] = [];
    const adaptations: DjangoExportNote[] = [];

    for (const note of notes) {
        if (getDjangoExportNoteSeverity(note.code) === 'adaptation') {
            adaptations.push(note);
        } else {
            warnings.push(note);
        }
    }

    return { warnings, adaptations };
};
