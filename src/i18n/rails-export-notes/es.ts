import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'Vista "{{path}}" omitida.',
    schema_ignored_sqlite:
        'SQLite no utiliza el schema "{{schema}}"; la tabla "{{path}}" se exporta sin calificador de schema.',
    mysql_catalog_omitted:
        'El catálogo MySQL "{{catalog}}" se omite; Rails utiliza la base de datos conectada y nombres de tabla sin calificar.',
    mysql_multiple_catalogs_ignored:
        'La exportación MySQL omite {{count}} catálogos y emite nombres de tabla sin calificar porque los nombres físicos siguen siendo únicos.',
    mariadb_catalog_omitted:
        'El catálogo MariaDB "{{catalog}}" se omite; Rails utiliza la base de datos conectada y nombres de tabla sin calificar.',
    mariadb_multiple_catalogs_ignored:
        'La exportación MariaDB omite {{count}} catálogos y emite nombres de tabla sin calificar porque los nombres físicos siguen siendo únicos.',
    composite_fk_unsupported:
        'La clave foránea compuesta "{{path}}" no se exporta; Rails V1 solo emite claves foráneas seguras de una sola columna.',
    keyless_relationship_skipped:
        'La relación "{{path}}" se omitió porque la tabla principal no admite semántica de clave foránea.',
    many_to_many_skipped:
        'La relación muchos a muchos "{{path}}" se omitió; no se pudo inferir un único lado de clave foránea a partir de la etiqueta.',
    keyless_model:
        'La tabla "{{path}}" no tiene clave primaria. El modelo establece self.primary_key = nil; la persistencia de Active Record puede ser limitada.',
    one_to_one_degraded_non_unique_fk:
        'La relación uno a uno en "{{path}}" se exporta como has_many porque la clave foránea no es única.',
    many_to_many_through_skipped:
        'has_many :through no se generó para la tabla de unión "{{path}}" porque los nombres de asociación eran ambiguos.',
    model_name_adjusted:
        'La clase de modelo para la tabla "{{path}}" se asignó como {{className}}.',
    model_name_collision:
        'La clase de modelo "{{className}}" para la tabla "{{path}}" se asignó para evitar una constante duplicada.',
    on_update_omitted:
        'ON UPDATE "{{action}}" no se representa en Rails 8.1 schema.rb add_foreign_key para "{{path}}".',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL se omitió en "{{path}}" porque la columna de clave foránea no admite valores nulos.',
        update: 'ON UPDATE SET NULL se omitió en "{{path}}" porque la columna de clave foránea no admite valores nulos.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to en "{{path}}" se asignó como {{associationName}} para evitar un conflicto de nombres.',
        inverse:
            'La asociación inversa en "{{path}}" se asignó como {{associationName}} para evitar un conflicto de nombres.',
    },
    relationship_skipped: {
        table_not_exported:
            'La relación "{{path}}" se omitió porque una tabla no se exportó.',
        unresolved_field_ids:
            'La relación "{{path}}" se omitió porque no se pudieron resolver los IDs de campo de clave foránea.',
        referenced_column_not_exported:
            'La relación "{{path}}" se omitió porque una columna referenciada no se exportó.',
    },
    index_omitted: {
        unsupported_type:
            'El índice "{{path}}" se omitió porque el tipo "{{indexType}}" no se exporta en Rails schema.rb.',
        missing_field:
            'El índice "{{path}}" se omitió porque falta un campo referenciado.',
        field_not_exported:
            'El índice "{{path}}" se omitió porque un campo referenciado no se exportó.',
    },
    comment_omitted: {
        table: 'El comentario de tabla en "{{path}}" se omite porque SQLite no persiste comentarios.',
        column: 'El comentario de columna en "{{path}}" se omite porque SQLite no persiste comentarios.',
    },
    check_omitted: {
        table: 'La restricción check vacía en "{{path}}" se omitió.',
        column: 'El check vacío en "{{path}}" se omitió.',
    },
    set_degraded: {
        sqlite_as_string:
            'El campo set en "{{path}}" se exporta como string para SQLite.',
        mysql_family_as_string:
            'El campo set en "{{path}}" se exporta como string; no se emite el DSL SET nativo.',
    },
    enum_degraded: {
        sqlite_as_string:
            'El campo enum en "{{path}}" se exporta como string para SQLite.',
        pg_type_values_missing:
            'El enum PostgreSQL "{{path}}" no se declaró porque faltan los valores canónicos.',
        pg_field_values_missing:
            'El enum PostgreSQL del campo "{{path}}" se exportó como string porque faltan los valores canónicos del enum.',
        pg_field_named_values_missing:
            'El enum PostgreSQL "{{enumName}}" del campo "{{path}}" se exportó como string porque faltan los valores del enum.',
        mysql_family_as_string:
            'El campo enum en "{{path}}" se exporta como string; no se emite el DSL enum/set nativo.',
    },
    type_omitted: {
        array: 'El campo array en "{{path}}" no se representa en Rails schema.rb.',
        spatial:
            'El campo spatial en "{{path}}" no se representa en Rails schema.rb.',
        unsupported:
            'El campo en "{{path}}" se omitió porque su tipo no se puede representar.',
        unimplemented_database:
            'El mapeo de tipos no está implementado para el tipo de base de datos "{{databaseType}}".',
    },
    type_degraded: {
        serial_no_sequence:
            'El campo serial que no es clave primaria en "{{path}}" se exporta como integer ordinario sin secuencia.',
        jsonb_as_json: 'El campo "{{path}}" jsonb se exporta como json.',
        uuid_as_string: 'El campo "{{path}}" uuid se exporta como string(36).',
        null_as_text:
            'La clase de almacenamiento null del campo "{{path}}" se exporta como text.',
        money_as_decimal: 'El campo "{{path}}" money se exporta como decimal.',
        year_as_integer: 'El campo "{{path}}" year se exporta como integer.',
        bit_as_boolean: 'El campo "{{path}}" bit se exporta como boolean.',
        type_as_string:
            'El campo "{{path}}" tipo "{{sourceType}}" se exporta como {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'El valor por defecto en "{{path}}" se omitió (expresión SQL con aspecto de lambda: {{expression}}).',
        sql_expression:
            'El valor por defecto en "{{path}}" se omitió (expresión SQL no admitida: {{expression}}).',
        unclear:
            'El valor por defecto en "{{path}}" se omitió (valor por defecto ambiguo: {{expression}}).',
        current_timestamp_non_datetime:
            'El valor por defecto en "{{path}}" se omitió (CURRENT_TIMESTAMP en campo que no es datetime).',
        uuid_function_non_pg:
            'El valor por defecto en "{{path}}" se omitió (valor por defecto con función UUID en campo UUID que no es PostgreSQL).',
        boolean_on_non_boolean:
            'El valor por defecto en "{{path}}" se omitió (valor por defecto boolean en campo que no es boolean).',
        numeric_on_non_numeric:
            'El valor por defecto en "{{path}}" se omitió (valor por defecto numérico en campo no numérico).',
        unsupported_type:
            'El valor por defecto en "{{path}}" se omitió (tipo de valor por defecto no admitido).',
    },
};
