import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'View "{{path}}" ignorada.',
    schema_ignored_sqlite:
        'SQLite não usa o schema "{{schema}}"; a tabela "{{path}}" é exportada sem qualificador de schema.',
    mysql_catalog_omitted:
        'O catálogo MySQL "{{catalog}}" foi omitido; Rails usa o banco de dados conectado e nomes de tabela não qualificados.',
    mysql_multiple_catalogs_ignored:
        'A exportação MySQL omite {{count}} catálogos e emite nomes de tabela não qualificados porque os nomes físicos permanecem únicos.',
    mariadb_catalog_omitted:
        'O catálogo MariaDB "{{catalog}}" foi omitido; Rails usa o banco de dados conectado e nomes de tabela não qualificados.',
    mariadb_multiple_catalogs_ignored:
        'A exportação MariaDB omite {{count}} catálogos e emite nomes de tabela não qualificados porque os nomes físicos permanecem únicos.',
    composite_fk_unsupported:
        'A chave estrangeira composta "{{path}}" não foi exportada; Rails V1 emite apenas chaves estrangeiras seguras de coluna única.',
    keyless_relationship_skipped:
        'O relacionamento "{{path}}" foi ignorado porque a tabela principal não pode suportar a semântica de chave estrangeira.',
    many_to_many_skipped:
        'O relacionamento muitos-para-muitos "{{path}}" foi ignorado; nenhum lado de chave estrangeira única pôde ser inferido do rótulo.',
    keyless_model:
        'A tabela "{{path}}" não possui chave primária. O model define self.primary_key = nil; a persistência do Active Record pode ser limitada.',
    one_to_one_degraded_non_unique_fk:
        'O relacionamento um-para-um em "{{path}}" é exportado como has_many porque a chave estrangeira não é única.',
    many_to_many_through_skipped:
        'has_many :through não foi gerado para a tabela de junção "{{path}}" porque os nomes das associações eram ambíguos.',
    model_name_adjusted:
        'A classe de model da tabela "{{path}}" foi alocada como {{className}}.',
    model_name_collision:
        'A classe de model {{className}} da tabela "{{path}}" foi alocada para evitar uma constante duplicada.',
    on_update_omitted:
        'ON UPDATE "{{action}}" não é representado em schema.rb add_foreign_key do Rails 8.1 para "{{path}}".',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL foi omitido em "{{path}}" porque a coluna de chave estrangeira não é nullable.',
        update: 'ON UPDATE SET NULL foi omitido em "{{path}}" porque a coluna de chave estrangeira não é nullable.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to em "{{path}}" foi alocado como {{associationName}} para evitar conflito de nome.',
        inverse:
            'A associação inversa em "{{path}}" foi alocada como {{associationName}} para evitar conflito de nome.',
    },
    relationship_skipped: {
        table_not_exported:
            'O relacionamento "{{path}}" foi ignorado porque uma tabela não foi exportada.',
        unresolved_field_ids:
            'O relacionamento "{{path}}" foi ignorado porque os IDs dos campos de chave estrangeira não puderam ser resolvidos.',
        referenced_column_not_exported:
            'O relacionamento "{{path}}" foi ignorado porque uma coluna referenciada não foi exportada.',
    },
    index_omitted: {
        unsupported_type:
            'O índice "{{path}}" foi omitido porque o tipo "{{indexType}}" não é exportado em schema.rb do Rails.',
        missing_field:
            'O índice "{{path}}" foi omitido porque um campo referenciado está ausente.',
        field_not_exported:
            'O índice "{{path}}" foi omitido porque um campo referenciado não foi exportado.',
    },
    comment_omitted: {
        table: 'O comentário da tabela em "{{path}}" foi omitido porque SQLite não persiste comentários.',
        column: 'O comentário da coluna em "{{path}}" foi omitido porque SQLite não persiste comentários.',
    },
    check_omitted: {
        table: 'A restrição check vazia em "{{path}}" foi omitida.',
        column: 'A restrição check vazia em "{{path}}" foi omitida.',
    },
    set_degraded: {
        sqlite_as_string:
            'O campo set em "{{path}}" é exportado como string para SQLite.',
        mysql_family_as_string:
            'O campo set em "{{path}}" é exportado como string; o DSL SET nativo não é emitido.',
    },
    enum_degraded: {
        sqlite_as_string:
            'O campo enum em "{{path}}" é exportado como string para SQLite.',
        pg_type_values_missing:
            'O enum PostgreSQL "{{path}}" não foi declarado porque os valores canônicos estão ausentes.',
        pg_field_values_missing:
            'O campo "{{path}}" enum PostgreSQL foi exportado como string porque os valores canônicos do enum estão ausentes.',
        pg_field_named_values_missing:
            'O campo "{{path}}" enum PostgreSQL "{{enumName}}" foi exportado como string porque os valores do enum estão ausentes.',
        mysql_family_as_string:
            'O campo enum em "{{path}}" é exportado como string; o DSL enum/set nativo não é emitido.',
    },
    type_omitted: {
        array: 'O campo array em "{{path}}" não é representado em schema.rb do Rails.',
        spatial:
            'O campo spatial em "{{path}}" não é representado em schema.rb do Rails.',
        unsupported:
            'O campo em "{{path}}" foi omitido porque seu tipo não pode ser representado.',
        unimplemented_database:
            'O mapeamento de tipo não está implementado para o tipo de banco de dados "{{databaseType}}".',
    },
    type_degraded: {
        serial_no_sequence:
            'O campo serial sem chave primária em "{{path}}" é exportado como integer comum sem sequência.',
        jsonb_as_json: 'O campo "{{path}}" jsonb é exportado como json.',
        uuid_as_string: 'O campo "{{path}}" uuid é exportado como string(36).',
        null_as_text:
            'O campo "{{path}}" com classe de armazenamento null é exportado como text.',
        money_as_decimal: 'O campo "{{path}}" money é exportado como decimal.',
        year_as_integer: 'O campo "{{path}}" year é exportado como integer.',
        bit_as_boolean: 'O campo "{{path}}" bit é exportado como boolean.',
        type_as_string:
            'O campo "{{path}}" do tipo "{{sourceType}}" é exportado como {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'O default em "{{path}}" foi omitido (expressão SQL com aparência de lambda: {{expression}}).',
        sql_expression:
            'O default em "{{path}}" foi omitido (expressão SQL não suportada: {{expression}}).',
        unclear:
            'O default em "{{path}}" foi omitido (default ambíguo: {{expression}}).',
        current_timestamp_non_datetime:
            'O default em "{{path}}" foi omitido (CURRENT_TIMESTAMP em campo não datetime).',
        uuid_function_non_pg:
            'O default em "{{path}}" foi omitido (default com função UUID em campo UUID não PostgreSQL).',
        boolean_on_non_boolean:
            'O default em "{{path}}" foi omitido (default boolean em campo não boolean).',
        numeric_on_non_numeric:
            'O default em "{{path}}" foi omitido (default numérico em campo não numérico).',
        unsupported_type:
            'O default em "{{path}}" foi omitido (tipo de default não suportado).',
    },
};
