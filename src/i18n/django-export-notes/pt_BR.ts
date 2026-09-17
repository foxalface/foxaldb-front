import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'View "{{path}}" ignorada.',
    keyless_table_skipped:
        'A tabela "{{path}}" foi ignorada porque não pode ser representada como SQL apenas de banco sem inventar uma chave primária.',
    keyless_table_sql_created:
        'A tabela física "{{path}}" é criada por SQL apenas de banco porque o Django não consegue modelar uma tabela sem chave primária sem alterar o esquema.',
    keyless_model_omitted:
        'Nenhum modelo ORM Django é gerado para "{{path}}" porque o Django exige uma chave primária.',
    schema_ignored_sqlite:
        'SQLite não usa o schema "{{schema}}"; a tabela "{{path}}" é exportada sem qualificador de schema.',
    mysql_catalog_omitted:
        'O catálogo MySQL "{{catalog}}" foi omitido; Django usa o banco conectado e nomes de tabela não qualificados.',
    mysql_multiple_catalogs_ignored:
        'A exportação MySQL omite {{count}} catálogos e emite nomes de tabela não qualificados porque os nomes físicos permanecem únicos.',
    mariadb_catalog_omitted:
        'O catálogo MariaDB "{{catalog}}" foi omitido; Django usa o banco conectado e nomes de tabela não qualificados.',
    mariadb_multiple_catalogs_ignored:
        'A exportação MariaDB omite {{count}} catálogos e emite nomes de tabela não qualificados porque os nomes físicos permanecem únicos.',
    postgres_schema_qualified_db_table:
        'A tabela PostgreSQL "{{path}}" é exportada com db_table qualificado pelo schema "{{schema}}".',
    composite_fk_unsupported:
        'A chave estrangeira composta "{{path}}" não é exportada; as colunas membros permanecem escalares.',
    many_to_many_skipped:
        'O relacionamento muitos-para-muitos "{{path}}" foi ignorado; nenhuma tabela de junção é inventada a partir de um rótulo.',
    one_to_one_degraded_non_unique_fk:
        'O relacionamento um-para-um em "{{path}}" é exportado como ForeignKey porque a chave estrangeira não é única.',
    model_name_adjusted:
        'A classe de model da tabela "{{path}}" foi alocada como {{className}}.',
    model_name_collision:
        'A classe de model {{className}} da tabela "{{path}}" foi alocada para evitar um nome de classe duplicado.',
    field_name_adjusted:
        'O campo "{{path}}" é exportado como atributo Python {{attributeName}} com db_column "{{dbColumn}}".',
    related_name_adjusted:
        'related_name em "{{path}}" foi alocado como {{relatedName}} para evitar conflito de acessor reverso.',
    composite_primary_key:
        'A tabela "{{path}}" é exportada com CompositePrimaryKey do Django 6.1 usando os atributos {{attributes}}.',
    on_update_omitted:
        'ON UPDATE "{{action}}" em "{{path}}" é omitido; ForeignKey não tem equivalente ON UPDATE no banco de dados.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT em "{{path}}" é exportado como models.DO_NOTHING; as semânticas de coletor RESTRICT/PROTECT do Django não são usadas.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL foi omitido em "{{path}}" porque a chave estrangeira não é nullable; models.DO_NOTHING é usado.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'ManyToManyField de conveniência não foi gerado para a tabela de junção "{{path}}" porque há colunas de dados extras.',
        ambiguous:
            'ManyToManyField de conveniência não foi gerado para a tabela de junção "{{path}}" porque um model de extremidade é ambíguo.',
    },
    relationship_skipped: {
        table_not_exported:
            'O relacionamento "{{path}}" foi ignorado porque uma tabela não foi exportada.',
        field_not_exported:
            'O relacionamento "{{path}}" foi ignorado porque um campo referenciado não foi exportado.',
        already_relational:
            'O relacionamento "{{path}}" foi ignorado porque o campo proprietário já é um relacionamento.',
        primary_key_fk:
            'O relacionamento "{{path}}" foi ignorado porque a coluna proprietária faz parte da chave primária.',
        unsupported_target_field:
            'O relacionamento "{{path}}" foi ignorado porque o campo alvo não é um alvo Django único.',
        keyless_target:
            'O relacionamento "{{path}}" foi ignorado porque aponta para uma tabela sem chave que não tem modelo Django.',
    },
    index_omitted: {
        unsupported_type:
            'O índice "{{path}}" foi omitido porque o tipo "{{indexType}}" não é exportado como models.Index.',
        field_not_exported:
            'O índice "{{path}}" foi omitido porque um campo referenciado não foi exportado.',
        unsafe_name:
            'O índice "{{path}}" foi omitido porque seu nome explícito não é representável com segurança no Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'O nome do índice "{{originalName}}" foi adaptado para "{{allocatedName}}" para atender às restrições de nomenclatura do Django.',
        name_collision:
            'O nome do índice "{{originalName}}" foi adaptado para "{{allocatedName}}" para evitar um nome de índice Django duplicado.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'O nome da restrição exclusiva "{{originalName}}" foi adaptado para "{{allocatedName}}" para atender às restrições de nomenclatura do Django.',
        name_collision:
            'O nome da restrição exclusiva "{{originalName}}" foi adaptado para "{{allocatedName}}" para evitar um nome de restrição Django duplicado.',
    },
    comment_omitted: {
        table: 'O comentário de tabela em "{{path}}" é omitido porque SQLite não persiste comentários.',
        column: 'O comentário de coluna em "{{path}}" é omitido porque SQLite não persiste comentários.',
    },
    check_omitted: {
        table: 'A restrição CHECK em "{{path}}" foi omitida porque SQL arbitrário não pode ser convertido em uma expressão Django 6.1.',
        column: 'O CHECK em "{{path}}" foi omitido porque SQL arbitrário não pode ser convertido em uma expressão Django 6.1.',
    },
    set_degraded: {
        set_as_text:
            'O SET do campo "{{path}}" é exportado como campo de caracteres; tipos SET nativos não são gerados.',
    },
    enum_degraded: {
        enum_as_text:
            'O enum do campo "{{path}}" é exportado como campo de caracteres; TextChoices do Django não são gerados.',
    },
    type_omitted: {
        array: 'O campo array em "{{path}}" é omitido da exportação Django.',
        spatial:
            'O campo espacial em "{{path}}" é omitido da exportação Django.',
        tsvector:
            'O campo tsvector em "{{path}}" é omitido da exportação Django.',
        xml: 'O campo XML em "{{path}}" é omitido da exportação Django.',
        unsupported:
            'O campo "{{path}}" foi omitido porque seu tipo não pode ser representado.',
        unimplemented_database:
            'O mapeamento de tipos não está implementado para o tipo de banco "{{databaseType}}".',
        decimal_precision_required:
            'O campo decimal em "{{path}}" foi omitido porque DecimalField MySQL/MariaDB exige max_digits e decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'O tipo caractere do campo "{{path}}" é exportado como {{mappedField}} porque max_length está ausente.',
    },
    default_omitted: {
        unsupported_type:
            'O valor padrão em "{{path}}" foi omitido (tipo de padrão não suportado).',
        current_timestamp_non_datetime:
            'O valor padrão em "{{path}}" foi omitido (CURRENT_TIMESTAMP em campo não datetime).',
        uuid_function_non_pg:
            'O valor padrão em "{{path}}" foi omitido (função UUID em campo UUID que não é PostgreSQL).',
        sql_expression:
            'O valor padrão em "{{path}}" foi omitido (expressão SQL não suportada: {{expression}}).',
        unclear:
            'O valor padrão em "{{path}}" foi omitido (padrão ambíguo: {{expression}}).',
        boolean_on_non_boolean:
            'O valor padrão em "{{path}}" foi omitido (padrão booleano em campo não booleano).',
        numeric_on_non_numeric:
            'O valor padrão em "{{path}}" foi omitido (padrão numérico em campo não numérico).',
    },
};
