export const drizzleExportNoteMessages = {
    view_skipped: 'Skipped view "{{path}}".',
    keyless_table_skipped:
        'Skipped table "{{path}}" because it has no safely representable columns.',
    keyless_table:
        'Table "{{path}}" has no primary key and is exported as a native Drizzle table without inventing an id.',
    schema_ignored_sqlite:
        'SQLite does not use schema "{{schema}}"; table "{{path}}" is exported without a schema qualifier.',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" is omitted; Drizzle uses unqualified table names and a single database connection.',
    mysql_multiple_catalogs_ignored:
        'MySQL export omits {{count}} catalogs and emits unqualified table names because physical names remain unique.',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" is omitted; Drizzle uses unqualified table names and a single database connection.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB export omits {{count}} catalogs and emits unqualified table names because physical names remain unique.',
    mariadb_mysql_dialect_adapted:
        'MariaDB is exported using Drizzle MySQL APIs (dialect "{{dialect}}"). Drizzle 0.45 has no first-class MariaDB dialect.',
    postgres_schema_qualified:
        'PostgreSQL schema "{{schema}}" is exported with pgSchema().',
    uuid_as_text:
        'Field "{{path}}" UUID is exported as text because this database has no native UUID type in Drizzle 0.45.',
    increment_omitted:
        'Auto-increment on "{{path}}" was omitted because it cannot be represented safely.',
    set_null_omitted:
        'ON DELETE SET NULL was omitted on "{{path}}" because a foreign-key column is NOT NULL.',
    sqlite_boolean_integer:
        'Field "{{path}}" boolean is exported as integer({ mode: "boolean" }) because SQLite has no native boolean type.',
    sqlite_json_text:
        'Field "{{path}}" JSON is exported as text({ mode: "json" }) because SQLite stores JSON as TEXT.',
    table_name_adjusted: {
        table: 'Table "{{path}}" is exported as TypeScript constant {{tsName}}. The physical table name is preserved.',
        pgEnum: 'PostgreSQL enum "{{path}}" is exported as TypeScript constant {{tsName}}. The physical enum name is preserved.',
        pgSchema:
            'PostgreSQL schema "{{path}}" is exported as TypeScript constant {{tsName}}.',
    },
    table_name_collision:
        'Table constant "{{tsName}}" for "{{path}}" was allocated to avoid a duplicate TypeScript identifier.',
    column_name_adjusted:
        'Column "{{path}}" is exported as TypeScript property {{tsName}}. The physical column name is preserved.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'Composite foreign key "{{path}}" was skipped because source and target column lists were not both present.',
        composite_fk_arity_mismatch:
            'Composite foreign key "{{path}}" was skipped because source and target column counts differ.',
        label_only:
            'Many-to-many relationship "{{path}}" was skipped because no physical join table is identified from the label.',
        table_not_exported:
            'Relationship "{{path}}" was skipped because a referenced table was not exported.',
        unresolved_member:
            'Relationship "{{path}}" was skipped because a referenced field was not exported.',
    },
    index_omitted: {
        unsupported_method:
            'Index "{{path}}" was omitted because type "{{indexType}}" is not exported.',
        field_not_exported:
            'Index "{{path}}" was omitted because a referenced field was not exported.',
    },
    comment_omitted: {
        table: 'Table comment on "{{path}}" is omitted because Drizzle 0.45 has no structured comment API used by this exporter.',
        column: 'Column comment on "{{path}}" is omitted because Drizzle 0.45 has no structured comment API used by this exporter.',
    },
    check_omitted: {
        table: 'CHECK constraint on "{{path}}" is omitted because raw SQL is not injected into generated TypeScript.',
        column: 'CHECK on "{{path}}" is omitted because raw SQL is not injected into generated TypeScript.',
    },
    set_degraded: {
        set_as_text:
            'Field set on "{{path}}" is exported as text; native SET types are not generated.',
    },
    enum_degraded: {
        ts_enum_only:
            'Field "{{path}}" enum is exported as text({ enum: [...] }); SQLite has no physical enum constraint.',
        unsupported_enum:
            'Field "{{path}}" enum is exported as text because it cannot be represented as a native Drizzle enum.',
        unknown_values:
            'Field "{{path}}" enum is exported as text because enum values are missing.',
    },
    type_omitted: {
        array: 'Array field on "{{path}}" is omitted from Drizzle export.',
        unsupported:
            'Field on "{{path}}" was omitted because its type cannot be represented.',
        unimplemented_database:
            'Type mapping is not implemented for database type "{{databaseType}}".',
    },
    type_degraded: {
        binary_as_bytea: 'Field "{{path}}" binary type is exported as bytea().',
    },
    default_omitted: {
        unsupported_type:
            'Default on "{{path}}" was omitted (unsupported default type).',
        current_timestamp_non_datetime:
            'Default on "{{path}}" was omitted (CURRENT_TIMESTAMP on non-datetime field).',
        sql_expression:
            'Default on "{{path}}" was omitted (unsupported SQL expression: {{expression}}).',
        unclear:
            'Default on "{{path}}" was omitted (unclear default: {{expression}}).',
        boolean_on_non_boolean:
            'Default on "{{path}}" was omitted (boolean default on non-boolean field).',
        numeric_on_non_numeric:
            'Default on "{{path}}" was omitted (numeric default on non-numeric field).',
    },
};
