import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'Представление «{{path}}» пропущено.',
    keyless_table_skipped:
        'Таблица «{{path}}» пропущена, поскольку Django V1 не создаёт суррогатный первичный ключ.',
    schema_ignored_sqlite:
        'SQLite не использует схему «{{schema}}»; таблица «{{path}}» экспортируется без квалификатора схемы.',
    mysql_catalog_omitted:
        'Каталог MySQL «{{catalog}}» пропущен; Django использует подключённую базу данных и неквалифицированные имена таблиц.',
    mysql_multiple_catalogs_ignored:
        'Экспорт MySQL пропускает {{count}} каталогов и выводит неквалифицированные имена таблиц, поскольку физические имена остаются уникальными.',
    mariadb_catalog_omitted:
        'Каталог MariaDB «{{catalog}}» пропущен; Django использует подключённую базу данных и неквалифицированные имена таблиц.',
    mariadb_multiple_catalogs_ignored:
        'Экспорт MariaDB пропускает {{count}} каталогов и выводит неквалифицированные имена таблиц, поскольку физические имена остаются уникальными.',
    postgres_schema_qualified_db_table:
        'Таблица PostgreSQL «{{path}}» экспортируется с db_table, квалифицированным схемой «{{schema}}».',
    composite_fk_unsupported:
        'Составной внешний ключ «{{path}}» не экспортирован; столбцы-члены остаются скалярными.',
    many_to_many_skipped:
        'Связь «многие ко многим» «{{path}}» пропущена; из одной метки не создаётся таблица соединения.',
    one_to_one_degraded_non_unique_fk:
        'Связь «один к одному» для «{{path}}» экспортирована как ForeignKey, поскольку внешний ключ не уникален.',
    model_name_adjusted:
        'Класс модели для таблицы «{{path}}» был назначен как {{className}}.',
    model_name_collision:
        'Класс модели «{{className}}» для таблицы «{{path}}» был назначен, чтобы избежать дублирования имени класса.',
    field_name_adjusted:
        'Поле «{{path}}» экспортируется как атрибут Python {{attributeName}} с db_column «{{dbColumn}}».',
    related_name_adjusted:
        'related_name для «{{path}}» был назначен как {{relatedName}}, чтобы избежать конфликта обратного доступа.',
    composite_primary_key:
        'Таблица «{{path}}» экспортируется с CompositePrimaryKey Django 6.1 с атрибутами {{attributes}}.',
    on_update_omitted:
        'ON UPDATE «{{action}}» для «{{path}}» пропущен; у ForeignKey нет эквивалента ON UPDATE в базе данных.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT для «{{path}}» экспортируется как models.DO_NOTHING; семантика коллектора RESTRICT/PROTECT Django не используется.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL пропущен для «{{path}}», поскольку внешний ключ не допускает NULL; используется models.DO_NOTHING.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'Удобное ManyToManyField не было сгенерировано для таблицы соединения «{{path}}», поскольку присутствуют дополнительные столбцы данных.',
        ambiguous:
            'Удобное ManyToManyField не было сгенерировано для таблицы соединения «{{path}}», поскольку модель конечной точки неоднозначна.',
    },
    relationship_skipped: {
        table_not_exported:
            'Связь «{{path}}» пропущена, поскольку таблица не была экспортирована.',
        field_not_exported:
            'Связь «{{path}}» пропущена, поскольку ссылочное поле не было экспортировано.',
        already_relational:
            'Связь «{{path}}» пропущена, поскольку владеющее поле уже является связью.',
        primary_key_fk:
            'Связь «{{path}}» пропущена, поскольку владеющий столбец является частью первичного ключа.',
        unsupported_target_field:
            'Связь «{{path}}» пропущена, поскольку целевое поле не является уникальной целью Django.',
    },
    index_omitted: {
        unsupported_type:
            'Индекс «{{path}}» пропущен, поскольку тип «{{indexType}}» не экспортируется как models.Index.',
        field_not_exported:
            'Индекс «{{path}}» пропущен, поскольку ссылочное поле не было экспортировано.',
        unsafe_name:
            'Индекс «{{path}}» пропущен, поскольку его явное имя нельзя безопасно представить в Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'Имя индекса «{{originalName}}» адаптировано в «{{allocatedName}}», чтобы соответствовать ограничениям именования Django.',
        name_collision:
            'Имя индекса «{{originalName}}» адаптировано в «{{allocatedName}}», чтобы избежать дублирующегося имени индекса Django.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'Имя ограничения уникальности «{{originalName}}» адаптировано в «{{allocatedName}}», чтобы соответствовать ограничениям именования Django.',
        name_collision:
            'Имя ограничения уникальности «{{originalName}}» адаптировано в «{{allocatedName}}», чтобы избежать дублирующегося имени ограничения Django.',
    },
    comment_omitted: {
        table: 'Комментарий к таблице «{{path}}» пропущен, поскольку SQLite не сохраняет комментарии.',
        column: 'Комментарий к столбцу «{{path}}» пропущен, поскольку SQLite не сохраняет комментарии.',
    },
    check_omitted: {
        table: 'Ограничение CHECK для «{{path}}» пропущено, поскольку произвольный SQL нельзя преобразовать в выражение Django 6.1.',
        column: 'CHECK для «{{path}}» пропущен, поскольку произвольный SQL нельзя преобразовать в выражение Django 6.1.',
    },
    set_degraded: {
        set_as_text:
            'SET поля «{{path}}» экспортируется как символьное поле; нативные типы SET не генерируются.',
    },
    enum_degraded: {
        enum_as_text:
            'enum поля «{{path}}» экспортируется как символьное поле; Django TextChoices не генерируются.',
    },
    type_omitted: {
        array: 'Массивное поле «{{path}}» пропущено при экспорте Django.',
        spatial:
            'Пространственное поле «{{path}}» пропущено при экспорте Django.',
        tsvector: 'Поле tsvector «{{path}}» пропущено при экспорте Django.',
        xml: 'Поле XML «{{path}}» пропущено при экспорте Django.',
        unsupported:
            'Поле «{{path}}» пропущено, поскольку его тип невозможно представить.',
        unimplemented_database:
            'Сопоставление типов не реализовано для типа базы данных «{{databaseType}}».',
        decimal_precision_required:
            'Поле decimal «{{path}}» пропущено, поскольку DecimalField MySQL/MariaDB требует max_digits и decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'Символьный тип поля «{{path}}» экспортируется как {{mappedField}}, поскольку отсутствует max_length.',
    },
    default_omitted: {
        unsupported_type:
            'Значение по умолчанию для «{{path}}» пропущено (неподдерживаемый тип значения по умолчанию).',
        current_timestamp_non_datetime:
            'Значение по умолчанию для «{{path}}» пропущено (CURRENT_TIMESTAMP для поля, не являющегося datetime).',
        uuid_function_non_pg:
            'Значение по умолчанию для «{{path}}» пропущено (функция UUID для поля UUID, не являющегося PostgreSQL).',
        sql_expression:
            'Значение по умолчанию для «{{path}}» пропущено (неподдерживаемое SQL-выражение: {{expression}}).',
        unclear:
            'Значение по умолчанию для «{{path}}» пропущено (неясное значение по умолчанию: {{expression}}).',
        boolean_on_non_boolean:
            'Значение по умолчанию для «{{path}}» пропущено (логическое значение по умолчанию для поля, не являющегося boolean).',
        numeric_on_non_numeric:
            'Значение по умолчанию для «{{path}}» пропущено (числовое значение по умолчанию для поля, не являющегося числовым).',
    },
};
