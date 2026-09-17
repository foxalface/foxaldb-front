export const djangoExportNoteMessages = {
    view_skipped: 'Skipped view "{{path}}".',
    keyless_table_skipped:
        'Skipped table "{{path}}" because it cannot be represented as safe database-only SQL without inventing a primary key.',
    keyless_table_sql_created:
        'Physical table "{{path}}" is created through database-only SQL because Django cannot model a table with no primary key without changing its schema.',
    keyless_model_omitted:
        'No Django ORM model is generated for "{{path}}" because Django requires a primary key.',
    schema_ignored_sqlite:
        'SQLite does not use schema "{{schema}}"; table "{{path}}" is exported without a schema qualifier.',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" is omitted; Django uses the connected database and unqualified table names.',
    mysql_multiple_catalogs_ignored:
        'MySQL export omits {{count}} catalogs and emits unqualified table names because physical names remain unique.',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" is omitted; Django uses the connected database and unqualified table names.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB export omits {{count}} catalogs and emits unqualified table names because physical names remain unique.',
    postgres_schema_qualified_db_table:
        'PostgreSQL table "{{path}}" is exported with schema-qualified db_table for schema "{{schema}}".',
    composite_fk_unsupported:
        'Composite foreign key "{{path}}" is not exported; member columns remain scalar.',
    many_to_many_skipped:
        'Many-to-many relationship "{{path}}" was skipped; no join table is invented from a label-only relationship.',
    one_to_one_degraded_non_unique_fk:
        'One-to-one relationship on "{{path}}" is exported as ForeignKey because the foreign key is not unique.',
    model_name_adjusted:
        'Model class for table "{{path}}" was allocated as {{className}}.',
    model_name_collision:
        'Model class "{{className}}" for table "{{path}}" was allocated to avoid a duplicate class name.',
    field_name_adjusted:
        'Field "{{path}}" is exported as Python attribute {{attributeName}} with db_column "{{dbColumn}}".',
    related_name_adjusted:
        'related_name on "{{path}}" was allocated as {{relatedName}} to avoid a reverse-accessor collision.',
    composite_primary_key:
        'Table "{{path}}" is exported with Django 6.1 CompositePrimaryKey using attributes {{attributes}}.',
    on_update_omitted:
        'ON UPDATE "{{action}}" on "{{path}}" is omitted; Django ForeignKey has no database ON UPDATE equivalent.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT on "{{path}}" is exported as models.DO_NOTHING; Django RESTRICT/PROTECT collector semantics are not used.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL was omitted on "{{path}}" because the foreign key is not nullable; models.DO_NOTHING is used.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'Convenience ManyToManyField was not generated for join table "{{path}}" because extra data columns are present.',
        ambiguous:
            'Convenience ManyToManyField was not generated for join table "{{path}}" because an endpoint model is ambiguous.',
    },
    relationship_skipped: {
        table_not_exported:
            'Relationship "{{path}}" was skipped because a table was not exported.',
        field_not_exported:
            'Relationship "{{path}}" was skipped because a referenced field was not exported.',
        already_relational:
            'Relationship "{{path}}" was skipped because the owning field is already a relationship.',
        primary_key_fk:
            'Relationship "{{path}}" was skipped because the owning column is part of the primary key.',
        unsupported_target_field:
            'Relationship "{{path}}" was skipped because the target field is not a unique Django target.',
        keyless_target:
            'Relationship "{{path}}" was skipped because it targets a keyless table that has no Django model.',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" was omitted because type "{{indexType}}" is not exported as models.Index.',
        field_not_exported:
            'Index "{{path}}" was omitted because a referenced field was not exported.',
        unsafe_name:
            'Index "{{path}}" was omitted because its explicit name is not safely representable in Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'The index name "{{originalName}}" was adapted to "{{allocatedName}}" to satisfy Django naming constraints.',
        name_collision:
            'The index name "{{originalName}}" was adapted to "{{allocatedName}}" to avoid a duplicate Django index name.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'The unique constraint name "{{originalName}}" was adapted to "{{allocatedName}}" to satisfy Django naming constraints.',
        name_collision:
            'The unique constraint name "{{originalName}}" was adapted to "{{allocatedName}}" to avoid a duplicate Django constraint name.',
    },
    comment_omitted: {
        table: 'Table comment on "{{path}}" is omitted because SQLite does not persist comments.',
        column: 'Column comment on "{{path}}" is omitted because SQLite does not persist comments.',
    },
    check_omitted: {
        table: 'CHECK constraint on "{{path}}" was omitted because arbitrary SQL cannot be converted to a Django 6.1 expression.',
        column: 'CHECK on "{{path}}" was omitted because arbitrary SQL cannot be converted to a Django 6.1 expression.',
    },
    set_degraded: {
        set_as_text:
            'Field set on "{{path}}" is exported as a character field; native SET types are not generated.',
    },
    enum_degraded: {
        enum_as_text:
            'Field enum on "{{path}}" is exported as a character field; Django TextChoices are not generated.',
    },
    type_omitted: {
        array: 'Array field on "{{path}}" is omitted from Django export.',
        spatial: 'Spatial field on "{{path}}" is omitted from Django export.',
        tsvector: 'tsvector field on "{{path}}" is omitted from Django export.',
        xml: 'XML field on "{{path}}" is omitted from Django export.',
        unsupported:
            'Field on "{{path}}" was omitted because its type cannot be represented.',
        unimplemented_database:
            'Type mapping is not implemented for database type "{{databaseType}}".',
        decimal_precision_required:
            'Decimal field on "{{path}}" was omitted because MySQL/MariaDB DecimalField requires max_digits and decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'Field "{{path}}" character type is exported as {{mappedField}} because max_length is missing.',
    },
    default_omitted: {
        unsupported_type:
            'Default on "{{path}}" was omitted (unsupported default type).',
        current_timestamp_non_datetime:
            'Default on "{{path}}" was omitted (CURRENT_TIMESTAMP on non-datetime field).',
        uuid_function_non_pg:
            'Default on "{{path}}" was omitted (UUID function default on non-PostgreSQL UUID field).',
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
