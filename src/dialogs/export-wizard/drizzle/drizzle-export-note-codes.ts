export const KNOWN_DRIZZLE_EXPORT_NOTE_CODES = [
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
] as const;

export type KnownDrizzleExportNoteCode =
    (typeof KNOWN_DRIZZLE_EXPORT_NOTE_CODES)[number];

export const KNOWN_DRIZZLE_EXPORT_ERROR_CODES = [
    'unsupported_database',
    'empty_diagram',
    'unsupported_structural_field',
    'mysql_catalog_collision',
    'mariadb_catalog_collision',
] as const;

export type KnownDrizzleExportErrorCode =
    (typeof KNOWN_DRIZZLE_EXPORT_ERROR_CODES)[number];
