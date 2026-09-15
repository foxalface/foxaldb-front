import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'Представление «{{path}}» пропущено.',
    schema_ignored_sqlite:
        'SQLite не использует схему «{{schema}}»; таблица «{{path}}» экспортируется без квалификатора схемы.',
    mysql_catalog_omitted:
        'Каталог MySQL «{{catalog}}» пропущен; Rails использует подключённую базу данных и неквалифицированные имена таблиц.',
    mysql_multiple_catalogs_ignored:
        'Экспорт MySQL пропускает {{count}} каталогов и выводит неквалифицированные имена таблиц, поскольку физические имена остаются уникальными.',
    mariadb_catalog_omitted:
        'Каталог MariaDB «{{catalog}}» пропущен; Rails использует подключённую базу данных и неквалифицированные имена таблиц.',
    mariadb_multiple_catalogs_ignored:
        'Экспорт MariaDB пропускает {{count}} каталогов и выводит неквалифицированные имена таблиц, поскольку физические имена остаются уникальными.',
    composite_fk_unsupported:
        'Составной внешний ключ «{{path}}» не экспортирован; Rails V1 выводит только безопасные одноколоночные внешние ключи.',
    keyless_relationship_skipped:
        'Связь «{{path}}» пропущена, поскольку главная таблица не поддерживает семантику внешнего ключа.',
    many_to_many_skipped:
        'Связь «многие ко многим» «{{path}}» пропущена; из метки невозможно вывести единственную сторону внешнего ключа.',
    keyless_model:
        'Таблица «{{path}}» не имеет первичного ключа. В модели задано self.primary_key = nil; возможности Active Record для сохранения могут быть ограничены.',
    one_to_one_degraded_non_unique_fk:
        'Связь «один к одному» для «{{path}}» экспортирована как has_many, поскольку внешний ключ не является уникальным.',
    many_to_many_through_skipped:
        'Ассоциация has_many :through не была сгенерирована для таблицы соединения «{{path}}», поскольку имена ассоциаций были неоднозначны.',
    model_name_adjusted:
        'Класс модели для таблицы «{{path}}» был назначен как {{className}}.',
    model_name_collision:
        'Класс модели {{className}} для таблицы «{{path}}» был назначен, чтобы избежать дублирования константы.',
    on_update_omitted:
        'ON UPDATE «{{action}}» не представлен в schema.rb add_foreign_key Rails 8.1 для «{{path}}».',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL пропущен для «{{path}}», поскольку столбец внешнего ключа не допускает NULL.',
        update: 'ON UPDATE SET NULL пропущен для «{{path}}», поскольку столбец внешнего ключа не допускает NULL.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to для «{{path}}» был назначен как {{associationName}}, чтобы избежать конфликта имён.',
        inverse:
            'Обратная ассоциация для «{{path}}» была назначена как {{associationName}}, чтобы избежать конфликта имён.',
    },
    relationship_skipped: {
        table_not_exported:
            'Связь «{{path}}» пропущена, поскольку таблица не была экспортирована.',
        unresolved_field_ids:
            'Связь «{{path}}» пропущена, поскольку идентификаторы полей внешнего ключа не удалось разрешить.',
        referenced_column_not_exported:
            'Связь «{{path}}» пропущена, поскольку ссылаемый столбец не был экспортирован.',
    },
    index_omitted: {
        unsupported_type:
            'Индекс «{{path}}» пропущен, поскольку тип «{{indexType}}» не экспортируется в schema.rb Rails.',
        missing_field:
            'Индекс «{{path}}» пропущен, поскольку ссылаемое поле отсутствует.',
        field_not_exported:
            'Индекс «{{path}}» пропущен, поскольку ссылаемое поле не было экспортировано.',
    },
    comment_omitted: {
        table: 'Комментарий к таблице «{{path}}» пропущен, поскольку SQLite не сохраняет комментарии.',
        column: 'Комментарий к столбцу «{{path}}» пропущен, поскольку SQLite не сохраняет комментарии.',
    },
    check_omitted: {
        table: 'Пустое ограничение CHECK для «{{path}}» было пропущено.',
        column: 'Пустая проверка CHECK для «{{path}}» была пропущена.',
    },
    set_degraded: {
        sqlite_as_string:
            'Поле SET для «{{path}}» экспортируется как string для SQLite.',
        mysql_family_as_string:
            'Поле SET для «{{path}}» экспортируется как string; нативный DSL SET не выводится.',
    },
    enum_degraded: {
        sqlite_as_string:
            'Поле enum для «{{path}}» экспортируется как string для SQLite.',
        pg_type_values_missing:
            'PostgreSQL enum «{{path}}» не был объявлен, поскольку канонические значения отсутствуют.',
        pg_field_values_missing:
            'Поле «{{path}}» PostgreSQL enum экспортировано как string, поскольку канонические значения enum отсутствуют.',
        pg_field_named_values_missing:
            'Поле «{{path}}» PostgreSQL enum «{{enumName}}» экспортировано как string, поскольку значения enum отсутствуют.',
        mysql_family_as_string:
            'Поле enum для «{{path}}» экспортируется как string; нативный DSL enum/set не выводится.',
    },
    type_omitted: {
        array: 'Массивное поле для «{{path}}» не представлено в schema.rb Rails.',
        spatial:
            'Пространственное поле для «{{path}}» не представлено в schema.rb Rails.',
        unsupported:
            'Поле для «{{path}}» пропущено, поскольку его тип невозможно представить.',
        unimplemented_database:
            'Сопоставление типов не реализовано для типа базы данных «{{databaseType}}».',
    },
    type_degraded: {
        serial_no_sequence:
            'Поле serial, не являющееся первичным ключом, для «{{path}}» экспортируется как обычный integer без последовательности.',
        jsonb_as_json: 'Поле «{{path}}» jsonb экспортируется как json.',
        uuid_as_string: 'Поле «{{path}}» uuid экспортируется как string(36).',
        null_as_text:
            'Поле «{{path}}» с классом хранения null экспортируется как text.',
        money_as_decimal: 'Поле «{{path}}» money экспортируется как decimal.',
        year_as_integer: 'Поле «{{path}}» year экспортируется как integer.',
        bit_as_boolean: 'Поле «{{path}}» bit экспортируется как boolean.',
        type_as_string:
            'Поле «{{path}}» типа «{{sourceType}}» экспортируется как {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'Значение по умолчанию для «{{path}}» пропущено (SQL-выражение, похожее на lambda: {{expression}}).',
        sql_expression:
            'Значение по умолчанию для «{{path}}» пропущено (неподдерживаемое SQL-выражение: {{expression}}).',
        unclear:
            'Значение по умолчанию для «{{path}}» пропущено (неясное значение по умолчанию: {{expression}}).',
        current_timestamp_non_datetime:
            'Значение по умолчанию для «{{path}}» пропущено (CURRENT_TIMESTAMP для поля, не являющегося datetime).',
        uuid_function_non_pg:
            'Значение по умолчанию для «{{path}}» пропущено (функция UUID по умолчанию для поля UUID, не являющегося PostgreSQL).',
        boolean_on_non_boolean:
            'Значение по умолчанию для «{{path}}» пропущено (логическое значение по умолчанию для поля, не являющегося boolean).',
        numeric_on_non_numeric:
            'Значение по умолчанию для «{{path}}» пропущено (числовое значение по умолчанию для поля, не являющегося числовым).',
        unsupported_type:
            'Значение по умолчанию для «{{path}}» пропущено (неподдерживаемый тип значения по умолчанию).',
    },
};
