import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'Vista « {{path}} » omitida.',
    keyless_table_skipped:
        'Tabla « {{path}} » omitida porque Django V1 no inventa una clave primaria sustituta.',
    schema_ignored_sqlite:
        'SQLite no usa el esquema « {{schema}} »; la tabla « {{path}} » se exporta sin calificador de esquema.',
    mysql_catalog_omitted:
        'El catálogo MySQL « {{catalog}} » se omite; Django usa la base conectada y nombres de tabla sin calificar.',
    mysql_multiple_catalogs_ignored:
        'La exportación MySQL omite {{count}} catálogos y emite nombres de tabla sin calificar porque los nombres físicos siguen siendo únicos.',
    mariadb_catalog_omitted:
        'El catálogo MariaDB « {{catalog}} » se omite; Django usa la base conectada y nombres de tabla sin calificar.',
    mariadb_multiple_catalogs_ignored:
        'La exportación MariaDB omite {{count}} catálogos y emite nombres de tabla sin calificar porque los nombres físicos siguen siendo únicos.',
    postgres_schema_qualified_db_table:
        'La tabla PostgreSQL « {{path}} » se exporta con db_table calificado por el esquema « {{schema}} ».',
    composite_fk_unsupported:
        'La clave foránea compuesta « {{path}} » no se exporta; las columnas miembro siguen siendo escalares.',
    many_to_many_skipped:
        'La relación muchos a muchos « {{path}} » se omitió; no se inventa una tabla de unión a partir de una etiqueta.',
    one_to_one_degraded_non_unique_fk:
        'La relación uno a uno en « {{path}} » se exporta como ForeignKey porque la clave foránea no es única.',
    model_name_adjusted:
        'La clase de modelo de la tabla « {{path}} » se asignó como {{className}}.',
    model_name_collision:
        'La clase de modelo « {{className}} » de la tabla « {{path}} » se asignó para evitar un nombre de clase duplicado.',
    field_name_adjusted:
        'El campo « {{path}} » se exporta como atributo Python {{attributeName}} con db_column « {{dbColumn}} ».',
    related_name_adjusted:
        'related_name en « {{path}} » se asignó como {{relatedName}} para evitar un conflicto de accesor inverso.',
    composite_primary_key:
        'La tabla « {{path}} » se exporta con CompositePrimaryKey de Django 6.1 usando los atributos {{attributes}}.',
    on_update_omitted:
        'ON UPDATE « {{action}} » en « {{path}} » se omite; ForeignKey no tiene equivalente ON UPDATE en la base de datos.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT en « {{path}} » se exporta como models.DO_NOTHING; no se usan las semánticas de recolector RESTRICT/PROTECT de Django.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL se omitió en « {{path}} » porque la clave foránea no es nullable; se usa models.DO_NOTHING.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'No se generó el ManyToManyField de conveniencia para la tabla de unión « {{path}} » porque hay columnas de datos extra.',
        ambiguous:
            'No se generó el ManyToManyField de conveniencia para la tabla de unión « {{path}} » porque un modelo extremo es ambiguo.',
    },
    relationship_skipped: {
        table_not_exported:
            'La relación « {{path}} » se omitió porque una tabla no se exportó.',
        field_not_exported:
            'La relación « {{path}} » se omitió porque un campo referenciado no se exportó.',
        already_relational:
            'La relación « {{path}} » se omitió porque el campo propietario ya es una relación.',
        primary_key_fk:
            'La relación « {{path}} » se omitió porque la columna propietaria forma parte de la clave primaria.',
        unsupported_target_field:
            'La relación « {{path}} » se omitió porque el campo destino no es un destino Django único.',
    },
    index_omitted: {
        unsupported_type:
            'El índice « {{path}} » se omitió porque el tipo « {{indexType}} » no se exporta como models.Index.',
        field_not_exported:
            'El índice « {{path}} » se omitió porque un campo referenciado no se exportó.',
        unsafe_name:
            'El índice « {{path}} » se omitió porque su nombre explícito no es representable de forma segura en Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'El nombre de índice « {{originalName}} » se adaptó a « {{allocatedName}} » para cumplir las restricciones de nombres de Django.',
        name_collision:
            'El nombre de índice « {{originalName}} » se adaptó a « {{allocatedName}} » para evitar un nombre de índice Django duplicado.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'El nombre de restricción única « {{originalName}} » se adaptó a « {{allocatedName}} » para cumplir las restricciones de nombres de Django.',
        name_collision:
            'El nombre de restricción única « {{originalName}} » se adaptó a « {{allocatedName}} » para evitar un nombre de restricción Django duplicado.',
    },
    comment_omitted: {
        table: 'El comentario de tabla en « {{path}} » se omite porque SQLite no conserva comentarios.',
        column: 'El comentario de columna en « {{path}} » se omite porque SQLite no conserva comentarios.',
    },
    check_omitted: {
        table: 'La restricción CHECK en « {{path}} » se omitió porque el SQL arbitrario no puede convertirse en una expresión Django 6.1.',
        column: 'El CHECK en « {{path}} » se omitió porque el SQL arbitrario no puede convertirse en una expresión Django 6.1.',
    },
    set_degraded: {
        set_as_text:
            'El SET del campo « {{path}} » se exporta como campo de caracteres; no se generan tipos SET nativos.',
    },
    enum_degraded: {
        enum_as_text:
            'El enum del campo « {{path}} » se exporta como campo de caracteres; no se generan TextChoices de Django.',
    },
    type_omitted: {
        array: 'El campo matriz en « {{path}} » se omite de la exportación Django.',
        spatial:
            'El campo espacial en « {{path}} » se omite de la exportación Django.',
        tsvector:
            'El campo tsvector en « {{path}} » se omite de la exportación Django.',
        xml: 'El campo XML en « {{path}} » se omite de la exportación Django.',
        unsupported:
            'El campo « {{path}} » se omitió porque su tipo no puede representarse.',
        unimplemented_database:
            'El mapeo de tipos no está implementado para el tipo de base « {{databaseType}} ».',
        decimal_precision_required:
            'El campo decimal en « {{path}} » se omitió porque DecimalField de MySQL/MariaDB exige max_digits y decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'El tipo de carácter del campo « {{path}} » se exporta como {{mappedField}} porque falta max_length.',
    },
    default_omitted: {
        unsupported_type:
            'El valor predeterminado en « {{path}} » se omitió (tipo de valor predeterminado no admitido).',
        current_timestamp_non_datetime:
            'El valor predeterminado en « {{path}} » se omitió (CURRENT_TIMESTAMP en un campo que no es datetime).',
        uuid_function_non_pg:
            'El valor predeterminado en « {{path}} » se omitió (función UUID fuera de un campo UUID de PostgreSQL).',
        sql_expression:
            'El valor predeterminado en « {{path}} » se omitió (expresión SQL no admitida: {{expression}}).',
        unclear:
            'El valor predeterminado en « {{path}} » se omitió (valor predeterminado ambiguo: {{expression}}).',
        boolean_on_non_boolean:
            'El valor predeterminado en « {{path}} » se omitió (valor booleano en un campo no booleano).',
        numeric_on_non_numeric:
            'El valor predeterminado en « {{path}} » se omitió (valor numérico en un campo no numérico).',
    },
};
