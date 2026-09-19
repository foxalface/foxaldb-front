import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'Vista « {{path}} » omitida.',
    keyless_table_skipped:
        'Se omitió la tabla « {{path}} » porque no tiene columnas representables de forma segura.',
    keyless_table:
        'La tabla « {{path}} » no tiene clave primaria y se exporta como tabla nativa de Drizzle sin inventar un id.',
    schema_ignored_sqlite:
        'SQLite no usa el esquema « {{schema}} »; la tabla « {{path}} » se exporta sin calificador de esquema.',
    mysql_catalog_omitted:
        'El catálogo MySQL « {{catalog}} » se omite; Drizzle usa nombres de tabla sin calificar y una sola conexión a la base de datos.',
    mysql_multiple_catalogs_ignored:
        'La exportación MySQL omite {{count}} catálogos y emite nombres de tabla sin calificar porque los nombres físicos siguen siendo únicos.',
    mariadb_catalog_omitted:
        'El catálogo MariaDB « {{catalog}} » se omite; Drizzle usa nombres de tabla sin calificar y una sola conexión a la base de datos.',
    mariadb_multiple_catalogs_ignored:
        'La exportación MariaDB omite {{count}} catálogos y emite nombres de tabla sin calificar porque los nombres físicos siguen siendo únicos.',
    mariadb_mysql_dialect_adapted:
        'MariaDB se exporta con las API MySQL de Drizzle (dialecto « {{dialect}} »). Drizzle 0.45 no tiene un dialecto MariaDB de primera clase.',
    postgres_schema_qualified:
        'El esquema PostgreSQL « {{schema}} » se exporta con pgSchema().',
    uuid_as_text:
        'El campo UUID « {{path}} » se exporta como texto porque esta base no tiene un tipo UUID nativo en Drizzle 0.45.',
    increment_omitted:
        'El autoincremento en « {{path}} » se omitió porque no puede representarse de forma segura.',
    set_null_omitted:
        'ON DELETE SET NULL se omitió en « {{path}} » porque una columna de clave foránea es NOT NULL.',
    sqlite_boolean_integer:
        'El campo booleano « {{path}} » se exporta como integer({ mode: "boolean" }) porque SQLite no tiene un tipo booleano nativo.',
    sqlite_json_text:
        'El campo JSON « {{path}} » se exporta como text({ mode: "json" }) porque SQLite almacena JSON como TEXT.',
    table_name_adjusted: {
        table: 'La tabla « {{path}} » se exporta como constante TypeScript {{tsName}}. Se conserva el nombre físico de la tabla.',
        pgEnum: 'El enum PostgreSQL « {{path}} » se exporta como constante TypeScript {{tsName}}. Se conserva el nombre físico del enum.',
        pgSchema:
            'El esquema PostgreSQL « {{path}} » se exporta como constante TypeScript {{tsName}}.',
    },
    table_name_collision:
        'La constante de tabla « {{tsName}} » para « {{path}} » se asignó para evitar un identificador TypeScript duplicado.',
    column_name_adjusted:
        'La columna « {{path}} » se exporta como propiedad TypeScript {{tsName}}. Se conserva el nombre físico de la columna.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'La clave foránea compuesta « {{path}} » se omitió porque las listas de columnas de origen y destino no estaban ambas presentes.',
        composite_fk_arity_mismatch:
            'La clave foránea compuesta « {{path}} » se omitió porque el número de columnas de origen y destino difiere.',
        label_only:
            'La relación de muchos a muchos « {{path}} » se omitió porque no se identifica una tabla de unión física a partir de la etiqueta.',
        table_not_exported:
            'La relación « {{path}} » se omitió porque una tabla referenciada no se exportó.',
        unresolved_member:
            'La relación « {{path}} » se omitió porque un campo referenciado no se exportó.',
    },
    index_omitted: {
        unsupported_method:
            'El índice « {{path}} » se omitió porque el tipo « {{indexType}} » no se exporta.',
        field_not_exported:
            'El índice « {{path}} » se omitió porque un campo referenciado no se exportó.',
    },
    comment_omitted: {
        table: 'El comentario de tabla en « {{path}} » se omite porque Drizzle 0.45 no tiene una API de comentarios estructurados usada por este exportador.',
        column: 'El comentario de columna en « {{path}} » se omite porque Drizzle 0.45 no tiene una API de comentarios estructurados usada por este exportador.',
    },
    check_omitted: {
        table: 'La restricción CHECK en « {{path}} » se omite porque no se inyecta SQL sin procesar en el TypeScript generado.',
        column: 'El CHECK en « {{path}} » se omite porque no se inyecta SQL sin procesar en el TypeScript generado.',
    },
    set_degraded: {
        set_as_text:
            'El SET del campo « {{path}} » se exporta como texto; no se generan tipos SET nativos.',
    },
    enum_degraded: {
        ts_enum_only:
            'El enum del campo « {{path}} » se exporta como text({ enum: [...] }); SQLite no tiene una restricción de enum física.',
        unsupported_enum:
            'El enum del campo « {{path}} » se exporta como texto porque no puede representarse como enum nativo de Drizzle.',
        unknown_values:
            'El enum del campo « {{path}} » se exporta como texto porque faltan los valores del enum.',
    },
    type_omitted: {
        array: 'El campo matriz en « {{path}} » se omite de la exportación Drizzle.',
        unsupported:
            'El campo en « {{path}} » se omitió porque su tipo no puede representarse.',
        unimplemented_database:
            'El mapeo de tipos no está implementado para el tipo de base « {{databaseType}} ».',
    },
    type_degraded: {
        binary_as_bytea:
            'El tipo binario del campo « {{path}} » se exporta como bytea().',
    },
    default_omitted: {
        unsupported_type:
            'El valor predeterminado en « {{path}} » se omitió (tipo de valor predeterminado no admitido).',
        current_timestamp_non_datetime:
            'El valor predeterminado en « {{path}} » se omitió (CURRENT_TIMESTAMP en un campo que no es datetime).',
        sql_expression:
            'El valor predeterminado en « {{path}} » se omitió (expresión SQL no admitida: {{expression}}).',
        unclear:
            'El valor predeterminado en « {{path}} » se omitió (valor predeterminado poco claro: {{expression}}).',
        boolean_on_non_boolean:
            'El valor predeterminado en « {{path}} » se omitió (valor booleano en un campo no booleano).',
        numeric_on_non_numeric:
            'El valor predeterminado en « {{path}} » se omitió (valor numérico en un campo no numérico).',
    },
};
