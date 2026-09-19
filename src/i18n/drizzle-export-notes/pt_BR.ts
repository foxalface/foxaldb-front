import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'View "{{path}}" ignorada.',
    keyless_table_skipped:
        'A tabela "{{path}}" foi ignorada porque não tem colunas representáveis com segurança.',
    keyless_table:
        'A tabela "{{path}}" não tem chave primária e é exportada como tabela nativa do Drizzle, sem inventar um id.',
    schema_ignored_sqlite:
        'SQLite não usa o schema "{{schema}}"; a tabela "{{path}}" é exportada sem qualificador de schema.',
    mysql_catalog_omitted:
        'O catálogo MySQL "{{catalog}}" foi omitido; o Drizzle usa nomes de tabela não qualificados e uma única conexão com o banco.',
    mysql_multiple_catalogs_ignored:
        'A exportação MySQL omite {{count}} catálogos e emite nomes de tabela não qualificados porque os nomes físicos permanecem únicos.',
    mariadb_catalog_omitted:
        'O catálogo MariaDB "{{catalog}}" foi omitido; o Drizzle usa nomes de tabela não qualificados e uma única conexão com o banco.',
    mariadb_multiple_catalogs_ignored:
        'A exportação MariaDB omite {{count}} catálogos e emite nomes de tabela não qualificados porque os nomes físicos permanecem únicos.',
    mariadb_mysql_dialect_adapted:
        'MariaDB é exportado com as APIs MySQL do Drizzle (dialeto "{{dialect}}"). O Drizzle 0.45 não tem um dialeto MariaDB de primeira classe.',
    postgres_schema_qualified:
        'O schema PostgreSQL "{{schema}}" é exportado com pgSchema().',
    uuid_as_text:
        'O campo UUID "{{path}}" é exportado como texto porque este banco não tem um tipo UUID nativo no Drizzle 0.45.',
    increment_omitted:
        'O autoincremento em "{{path}}" foi omitido porque não pode ser representado com segurança.',
    set_null_omitted:
        'ON DELETE SET NULL foi omitido em "{{path}}" porque uma coluna de chave estrangeira é NOT NULL.',
    sqlite_boolean_integer:
        'O campo booleano "{{path}}" é exportado como integer({ mode: "boolean" }) porque o SQLite não tem um tipo booleano nativo.',
    sqlite_json_text:
        'O campo JSON "{{path}}" é exportado como text({ mode: "json" }) porque o SQLite armazena JSON como TEXT.',
    table_name_adjusted: {
        table: 'A tabela "{{path}}" é exportada como constante TypeScript {{tsName}}. O nome físico da tabela é preservado.',
        pgEnum: 'O enum PostgreSQL "{{path}}" é exportado como constante TypeScript {{tsName}}. O nome físico do enum é preservado.',
        pgSchema:
            'O schema PostgreSQL "{{path}}" é exportado como constante TypeScript {{tsName}}.',
    },
    table_name_collision:
        'A constante de tabela "{{tsName}}" para "{{path}}" foi alocada para evitar um identificador TypeScript duplicado.',
    column_name_adjusted:
        'A coluna "{{path}}" é exportada como propriedade TypeScript {{tsName}}. O nome físico da coluna é preservado.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'A chave estrangeira composta "{{path}}" foi ignorada porque as listas de colunas de origem e destino não estavam ambas presentes.',
        composite_fk_arity_mismatch:
            'A chave estrangeira composta "{{path}}" foi ignorada porque as contagens de colunas de origem e destino diferem.',
        label_only:
            'O relacionamento muitos-para-muitos "{{path}}" foi ignorado porque nenhuma tabela de junção física é identificada a partir do rótulo.',
        table_not_exported:
            'O relacionamento "{{path}}" foi ignorado porque uma tabela referenciada não foi exportada.',
        unresolved_member:
            'O relacionamento "{{path}}" foi ignorado porque um campo referenciado não foi exportado.',
    },
    index_omitted: {
        unsupported_method:
            'O índice "{{path}}" foi omitido porque o tipo "{{indexType}}" não é exportado.',
        field_not_exported:
            'O índice "{{path}}" foi omitido porque um campo referenciado não foi exportado.',
    },
    comment_omitted: {
        table: 'O comentário da tabela em "{{path}}" é omitido porque o Drizzle 0.45 não tem uma API de comentários estruturados usada por este exportador.',
        column: 'O comentário da coluna em "{{path}}" é omitido porque o Drizzle 0.45 não tem uma API de comentários estruturados usada por este exportador.',
    },
    check_omitted: {
        table: 'A restrição CHECK em "{{path}}" é omitida porque SQL bruto não é injetado no TypeScript gerado.',
        column: 'O CHECK em "{{path}}" é omitido porque SQL bruto não é injetado no TypeScript gerado.',
    },
    set_degraded: {
        set_as_text:
            'O SET do campo "{{path}}" é exportado como texto; tipos SET nativos não são gerados.',
    },
    enum_degraded: {
        ts_enum_only:
            'O enum do campo "{{path}}" é exportado como text({ enum: [...] }); o SQLite não tem uma restrição de enum física.',
        unsupported_enum:
            'O enum do campo "{{path}}" é exportado como texto porque não pode ser representado como um enum nativo do Drizzle.',
        unknown_values:
            'O enum do campo "{{path}}" é exportado como texto porque os valores do enum estão ausentes.',
    },
    type_omitted: {
        array: 'O campo array em "{{path}}" é omitido da exportação Drizzle.',
        unsupported:
            'O campo em "{{path}}" foi omitido porque o tipo não pode ser representado.',
        unimplemented_database:
            'O mapeamento de tipos não está implementado para o tipo de banco "{{databaseType}}".',
    },
    type_degraded: {
        binary_as_bytea:
            'O tipo binário do campo "{{path}}" é exportado como bytea().',
    },
    default_omitted: {
        unsupported_type:
            'O valor padrão em "{{path}}" foi omitido (tipo de padrão não suportado).',
        current_timestamp_non_datetime:
            'O valor padrão em "{{path}}" foi omitido (CURRENT_TIMESTAMP em campo que não é datetime).',
        sql_expression:
            'O valor padrão em "{{path}}" foi omitido (expressão SQL não suportada: {{expression}}).',
        unclear:
            'O valor padrão em "{{path}}" foi omitido (padrão pouco claro: {{expression}}).',
        boolean_on_non_boolean:
            'O valor padrão em "{{path}}" foi omitido (padrão booleano em campo não booleano).',
        numeric_on_non_numeric:
            'O valor padrão em "{{path}}" foi omitido (padrão numérico em campo não numérico).',
    },
};
