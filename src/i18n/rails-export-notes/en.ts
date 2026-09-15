export const railsExportNoteMessages = {
    view_skipped: 'Skipped view "{{path}}".',
    schema_ignored_sqlite:
        'SQLite does not use schema "{{schema}}"; table "{{path}}" is exported without a schema qualifier.',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" is omitted; Rails uses the connected database and unqualified table names.',
    mysql_multiple_catalogs_ignored:
        'MySQL export omits {{count}} catalogs and emits unqualified table names because physical names remain unique.',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" is omitted; Rails uses the connected database and unqualified table names.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB export omits {{count}} catalogs and emits unqualified table names because physical names remain unique.',
    composite_fk_unsupported:
        'Composite foreign key "{{path}}" is not exported; Rails V1 emits only safe single-column foreign keys.',
    keyless_relationship_skipped:
        'Relationship "{{path}}" was skipped because the principal table cannot support foreign-key semantics.',
    many_to_many_skipped:
        'Many-to-many relationship "{{path}}" was skipped; no single foreign key side can be inferred from the label.',
    keyless_model:
        'Table "{{path}}" has no primary key. The model sets self.primary_key = nil; Active Record persistence may be limited.',
    one_to_one_degraded_non_unique_fk:
        'One-to-one relationship on "{{path}}" is exported as has_many because the foreign key is not unique.',
    many_to_many_through_skipped:
        'has_many :through was not generated for join table "{{path}}" because association names were ambiguous.',
    model_name_adjusted:
        'Model class for table "{{path}}" was allocated as {{className}}.',
    model_name_collision:
        'Model class "{{className}}" for table "{{path}}" was allocated to avoid a duplicate constant.',
    on_update_omitted:
        'ON UPDATE "{{action}}" is not represented in Rails 8.1 schema.rb add_foreign_key for "{{path}}".',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL was omitted on "{{path}}" because the foreign key column is not nullable.',
        update: 'ON UPDATE SET NULL was omitted on "{{path}}" because the foreign key column is not nullable.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to on "{{path}}" was allocated as {{associationName}} to avoid a name collision.',
        inverse:
            'Inverse association on "{{path}}" was allocated as {{associationName}} to avoid a name collision.',
    },
    relationship_skipped: {
        table_not_exported:
            'Relationship "{{path}}" was skipped because a table was not exported.',
        unresolved_field_ids:
            'Relationship "{{path}}" was skipped because foreign-key field IDs could not be resolved.',
        referenced_column_not_exported:
            'Relationship "{{path}}" was skipped because a referenced column was not exported.',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" was omitted because type "{{indexType}}" is not exported in Rails schema.rb.',
        missing_field:
            'Index "{{path}}" was omitted because a referenced field is missing.',
        field_not_exported:
            'Index "{{path}}" was omitted because a referenced field was not exported.',
    },
    comment_omitted: {
        table: 'Table comment on "{{path}}" is omitted because SQLite does not persist comments.',
        column: 'Column comment on "{{path}}" is omitted because SQLite does not persist comments.',
    },
    check_omitted: {
        table: 'Empty check constraint on "{{path}}" was omitted.',
        column: 'Empty check on "{{path}}" was omitted.',
    },
    set_degraded: {
        sqlite_as_string:
            'Field set on "{{path}}" is exported as string for SQLite.',
        mysql_family_as_string:
            'Field set on "{{path}}" is exported as string; native SET DSL is not emitted.',
    },
    enum_degraded: {
        sqlite_as_string:
            'Field enum on "{{path}}" is exported as string for SQLite.',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}" was not declared because canonical values are missing.',
        pg_field_values_missing:
            'Field "{{path}}" PostgreSQL enum was exported as string because canonical enum values are missing.',
        pg_field_named_values_missing:
            'Field "{{path}}" PostgreSQL enum "{{enumName}}" was exported as string because enum values are missing.',
        mysql_family_as_string:
            'Field enum on "{{path}}" is exported as string; native enum/set DSL is not emitted.',
    },
    type_omitted: {
        array: 'Array field on "{{path}}" is not represented in Rails schema.rb.',
        spatial:
            'Spatial field on "{{path}}" is not represented in Rails schema.rb.',
        unsupported:
            'Field on "{{path}}" was omitted because its type cannot be represented.',
        unimplemented_database:
            'Type mapping is not implemented for database type "{{databaseType}}".',
    },
    type_degraded: {
        serial_no_sequence:
            'Non-primary-key serial field on "{{path}}" is exported as an ordinary integer without a sequence.',
        jsonb_as_json: 'Field "{{path}}" jsonb is exported as json.',
        uuid_as_string: 'Field "{{path}}" uuid is exported as string(36).',
        null_as_text:
            'Field "{{path}}" null storage class is exported as text.',
        money_as_decimal: 'Field "{{path}}" money is exported as decimal.',
        year_as_integer: 'Field "{{path}}" year is exported as integer.',
        bit_as_boolean: 'Field "{{path}}" bit is exported as boolean.',
        type_as_string:
            'Field "{{path}}" type "{{sourceType}}" is exported as {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'Default on "{{path}}" was omitted (lambda-looking SQL expression: {{expression}}).',
        sql_expression:
            'Default on "{{path}}" was omitted (unsupported SQL expression: {{expression}}).',
        unclear:
            'Default on "{{path}}" was omitted (unclear default: {{expression}}).',
        current_timestamp_non_datetime:
            'Default on "{{path}}" was omitted (CURRENT_TIMESTAMP on non-datetime field).',
        uuid_function_non_pg:
            'Default on "{{path}}" was omitted (UUID function default on non-PostgreSQL UUID field).',
        boolean_on_non_boolean:
            'Default on "{{path}}" was omitted (boolean default on non-boolean field).',
        numeric_on_non_numeric:
            'Default on "{{path}}" was omitted (numeric default on non-numeric field).',
        unsupported_type:
            'Default on "{{path}}" was omitted (unsupported default type).',
    },
};
