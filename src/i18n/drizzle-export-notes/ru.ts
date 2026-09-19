import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'Представление «{{path}}» пропущено.',
    keyless_table_skipped:
        'Таблица «{{path}}» пропущена, потому что у неё нет безопасно представимых столбцов.',
    keyless_table:
        'Таблица «{{path}}» не имеет первичного ключа и экспортируется как нативная таблица Drizzle без выдуманного id.',
    schema_ignored_sqlite:
        'SQLite не использует схему «{{schema}}»; таблица «{{path}}» экспортируется без квалификатора схемы.',
    mysql_catalog_omitted:
        'Каталог MySQL «{{catalog}}» пропущен; Drizzle использует неквалифицированные имена таблиц и одно подключение к базе.',
    mysql_multiple_catalogs_ignored:
        'Экспорт MySQL пропускает {{count}} каталогов и выводит неквалифицированные имена таблиц, поскольку физические имена остаются уникальными.',
    mariadb_catalog_omitted:
        'Каталог MariaDB «{{catalog}}» пропущен; Drizzle использует неквалифицированные имена таблиц и одно подключение к базе.',
    mariadb_multiple_catalogs_ignored:
        'Экспорт MariaDB пропускает {{count}} каталогов и выводит неквалифицированные имена таблиц, поскольку физические имена остаются уникальными.',
    mariadb_mysql_dialect_adapted:
        'MariaDB экспортируется через MySQL API Drizzle (диалект «{{dialect}}»). В Drizzle 0.45 нет полноценного диалекта MariaDB.',
    postgres_schema_qualified:
        'Схема PostgreSQL «{{schema}}» экспортируется с pgSchema().',
    uuid_as_text:
        'Поле UUID «{{path}}» экспортируется как текст, потому что у этой базы нет нативного типа UUID в Drizzle 0.45.',
    increment_omitted:
        'Автоинкремент на «{{path}}» пропущен, потому что его нельзя безопасно представить.',
    set_null_omitted:
        'ON DELETE SET NULL на «{{path}}» пропущен, потому что столбец внешнего ключа имеет NOT NULL.',
    sqlite_boolean_integer:
        'Логическое поле «{{path}}» экспортируется как integer({ mode: "boolean" }), потому что в SQLite нет нативного логического типа.',
    sqlite_json_text:
        'JSON-поле «{{path}}» экспортируется как text({ mode: "json" }), потому что SQLite хранит JSON как TEXT.',
    table_name_adjusted: {
        table: 'Таблица «{{path}}» экспортируется как константа TypeScript {{tsName}}. Физическое имя таблицы сохраняется.',
        pgEnum: 'Перечисление PostgreSQL «{{path}}» экспортируется как константа TypeScript {{tsName}}. Физическое имя перечисления сохраняется.',
        pgSchema:
            'Схема PostgreSQL «{{path}}» экспортируется как константа TypeScript {{tsName}}.',
    },
    table_name_collision:
        'Константа таблицы «{{tsName}}» для «{{path}}» назначена, чтобы избежать дублирующегося идентификатора TypeScript.',
    column_name_adjusted:
        'Столбец «{{path}}» экспортируется как свойство TypeScript {{tsName}}. Физическое имя столбца сохраняется.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'Составной внешний ключ «{{path}}» пропущен, потому что списки исходных и целевых столбцов присутствовали не оба.',
        composite_fk_arity_mismatch:
            'Составной внешний ключ «{{path}}» пропущен, потому что число исходных и целевых столбцов различается.',
        label_only:
            'Связь многие-ко-многим «{{path}}» пропущена, потому что по метке не определяется физическая таблица соединения.',
        table_not_exported:
            'Связь «{{path}}» пропущена, потому что связанная таблица не была экспортирована.',
        unresolved_member:
            'Связь «{{path}}» пропущена, потому что связанное поле не было экспортировано.',
    },
    index_omitted: {
        unsupported_method:
            'Индекс «{{path}}» пропущен, потому что тип «{{indexType}}» не экспортируется.',
        field_not_exported:
            'Индекс «{{path}}» пропущен, потому что связанное поле не было экспортировано.',
    },
    comment_omitted: {
        table: 'Комментарий таблицы на «{{path}}» опущен, потому что в Drizzle 0.45 нет структурированного API комментариев, которое использует этот экспортёр.',
        column: 'Комментарий столбца на «{{path}}» опущен, потому что в Drizzle 0.45 нет структурированного API комментариев, которое использует этот экспортёр.',
    },
    check_omitted: {
        table: 'Ограничение CHECK на «{{path}}» опущено, потому что сырой SQL не внедряется в сгенерированный TypeScript.',
        column: 'CHECK на «{{path}}» опущен, потому что сырой SQL не внедряется в сгенерированный TypeScript.',
    },
    set_degraded: {
        set_as_text:
            'SET поля «{{path}}» экспортируется как текст; нативные типы SET не создаются.',
    },
    enum_degraded: {
        ts_enum_only:
            'Перечисление поля «{{path}}» экспортируется как text({ enum: [...] }); у SQLite нет физического ограничения enum.',
        unsupported_enum:
            'Перечисление поля «{{path}}» экспортируется как текст, потому что его нельзя представить как нативное перечисление Drizzle.',
        unknown_values:
            'Перечисление поля «{{path}}» экспортируется как текст, потому что значения перечисления отсутствуют.',
    },
    type_omitted: {
        array: 'Массивное поле на «{{path}}» опущено из экспорта Drizzle.',
        unsupported:
            'Поле на «{{path}}» пропущено, потому что его тип нельзя представить.',
        unimplemented_database:
            'Сопоставление типов не реализовано для типа базы «{{databaseType}}».',
    },
    type_degraded: {
        binary_as_bytea:
            'Двоичный тип поля «{{path}}» экспортируется как bytea().',
    },
    default_omitted: {
        unsupported_type:
            'Значение по умолчанию на «{{path}}» пропущено (неподдерживаемый тип значения по умолчанию).',
        current_timestamp_non_datetime:
            'Значение по умолчанию на «{{path}}» пропущено (CURRENT_TIMESTAMP на поле, которое не является datetime).',
        sql_expression:
            'Значение по умолчанию на «{{path}}» пропущено (неподдерживаемое SQL-выражение: {{expression}}).',
        unclear:
            'Значение по умолчанию на «{{path}}» пропущено (неясное значение по умолчанию: {{expression}}).',
        boolean_on_non_boolean:
            'Значение по умолчанию на «{{path}}» пропущено (логическое значение на нелогическом поле).',
        numeric_on_non_numeric:
            'Значение по умолчанию на «{{path}}» пропущено (числовое значение на нечисловом поле).',
    },
};
