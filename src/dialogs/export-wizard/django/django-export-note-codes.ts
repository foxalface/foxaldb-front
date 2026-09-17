export const KNOWN_DJANGO_EXPORT_NOTE_CODES = [
    'view_skipped',
    'keyless_table_skipped',
    'schema_ignored_sqlite',
    'mysql_catalog_omitted',
    'mysql_multiple_catalogs_ignored',
    'mariadb_catalog_omitted',
    'mariadb_multiple_catalogs_ignored',
    'postgres_schema_qualified_db_table',
    'default_omitted',
    'type_degraded',
    'type_omitted',
    'enum_degraded',
    'set_degraded',
    'comment_omitted',
    'model_name_adjusted',
    'model_name_collision',
    'field_name_adjusted',
    'composite_primary_key',
    'relationship_skipped',
    'composite_fk_unsupported',
    'set_null_omitted',
    'on_delete_restrict_degraded',
    'on_update_omitted',
    'one_to_one_degraded_non_unique_fk',
    'related_name_adjusted',
    'many_to_many_skipped',
    'many_to_many_through_skipped',
    'index_omitted',
    'index_name_adjusted',
    'constraint_name_adjusted',
    'check_omitted',
] as const;

export type KnownDjangoExportNoteCode =
    (typeof KNOWN_DJANGO_EXPORT_NOTE_CODES)[number];

export const KNOWN_DJANGO_EXPORT_ERROR_CODES = [
    'unsupported_database',
    'empty_diagram',
    'unsupported_structural_field',
    'mysql_catalog_collision',
    'mariadb_catalog_collision',
] as const;

export type KnownDjangoExportErrorCode =
    (typeof KNOWN_DJANGO_EXPORT_ERROR_CODES)[number];
