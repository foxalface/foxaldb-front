import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'Пропущено представлення "{{path}}".',
    schema_ignored_sqlite:
        'SQLite не використовує schema "{{schema}}"; таблиця "{{path}}" експортується без кваліфікатора schema.',
    mysql_catalog_omitted:
        'Каталог MySQL "{{catalog}}" пропущено; Rails використовує підключену базу даних і некваліфіковані імена таблиць.',
    mysql_multiple_catalogs_ignored:
        'Експорт MySQL пропускає {{count}} каталогів і виводить некваліфіковані імена таблиць, оскільки фізичні імена залишаються унікальними.',
    mariadb_catalog_omitted:
        'Каталог MariaDB "{{catalog}}" пропущено; Rails використовує підключену базу даних і некваліфіковані імена таблиць.',
    mariadb_multiple_catalogs_ignored:
        'Експорт MariaDB пропускає {{count}} каталогів і виводить некваліфіковані імена таблиць, оскільки фізичні імена залишаються унікальними.',
    composite_fk_unsupported:
        'Складений зовнішній ключ "{{path}}" не експортується; Rails V1 виводить лише безпечні одностовпцеві зовнішні ключі.',
    keyless_relationship_skipped:
        'Зв\'язок "{{path}}" пропущено, оскільки головна таблиця не підтримує семантику зовнішнього ключа.',
    many_to_many_skipped:
        'Зв\'язок «багато до багатьох» "{{path}}" пропущено; з мітки не вдалося визначити єдину сторону зовнішнього ключа.',
    keyless_model:
        'Таблиця "{{path}}" не має первинного ключа. Модель встановлює self.primary_key = nil; збереження через Active Record може бути обмеженим.',
    one_to_one_degraded_non_unique_fk:
        'Зв\'язок «один до одного» на "{{path}}" експортується як has_many, оскільки зовнішній ключ не є унікальним.',
    many_to_many_through_skipped:
        'has_many :through не згенеровано для з\'єднувальної таблиці "{{path}}", оскільки імена асоціацій були неоднозначними.',
    model_name_adjusted:
        'Клас моделі для таблиці "{{path}}" призначено як {{className}}.',
    model_name_collision:
        'Клас моделі "{{className}}" для таблиці "{{path}}" призначено, щоб уникнути дублювання константи.',
    on_update_omitted:
        'ON UPDATE "{{action}}" не відображається в Rails 8.1 schema.rb add_foreign_key для "{{path}}".',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL пропущено для "{{path}}", оскільки стовпець зовнішнього ключа не допускає NULL.',
        update: 'ON UPDATE SET NULL пропущено для "{{path}}", оскільки стовпець зовнішнього ключа не допускає NULL.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to на "{{path}}" призначено як {{associationName}}, щоб уникнути конфлікту імен.',
        inverse:
            'Зворотну асоціацію на "{{path}}" призначено як {{associationName}}, щоб уникнути конфлікту імен.',
    },
    relationship_skipped: {
        table_not_exported:
            'Зв\'язок "{{path}}" пропущено, оскільки таблицю не експортовано.',
        unresolved_field_ids:
            'Зв\'язок "{{path}}" пропущено, оскільки не вдалося визначити ID полів зовнішнього ключа.',
        referenced_column_not_exported:
            'Зв\'язок "{{path}}" пропущено, оскільки посиланий стовпець не експортовано.',
    },
    index_omitted: {
        unsupported_type:
            'Індекс "{{path}}" пропущено, оскільки тип "{{indexType}}" не експортується в Rails schema.rb.',
        missing_field:
            'Індекс "{{path}}" пропущено, оскільки відсутнє посилане поле.',
        field_not_exported:
            'Індекс "{{path}}" пропущено, оскільки посилане поле не експортовано.',
    },
    comment_omitted: {
        table: 'Коментар до таблиці "{{path}}" пропущено, оскільки SQLite не зберігає коментарі.',
        column: 'Коментар до стовпця "{{path}}" пропущено, оскільки SQLite не зберігає коментарі.',
    },
    check_omitted: {
        table: 'Порожнє обмеження check на "{{path}}" пропущено.',
        column: 'Порожній check на "{{path}}" пропущено.',
    },
    set_degraded: {
        sqlite_as_string:
            'Поле set на "{{path}}" експортується як string для SQLite.',
        mysql_family_as_string:
            'Поле set на "{{path}}" експортується як string; нативний SET DSL не виводиться.',
    },
    enum_degraded: {
        sqlite_as_string:
            'Поле enum на "{{path}}" експортується як string для SQLite.',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}" не оголошено, оскільки відсутні канонічні значення.',
        pg_field_values_missing:
            'Поле "{{path}}" PostgreSQL enum експортовано як string, оскільки відсутні канонічні значення enum.',
        pg_field_named_values_missing:
            'Поле "{{path}}" PostgreSQL enum "{{enumName}}" експортовано як string, оскільки відсутні значення enum.',
        mysql_family_as_string:
            'Поле enum на "{{path}}" експортується як string; нативний enum/set DSL не виводиться.',
    },
    type_omitted: {
        array: 'Поле array на "{{path}}" не відображається в Rails schema.rb.',
        spatial:
            'Поле spatial на "{{path}}" не відображається в Rails schema.rb.',
        unsupported:
            'Поле на "{{path}}" пропущено, оскільки його тип не можна відобразити.',
        unimplemented_database:
            'Відображення типів не реалізовано для типу бази даних "{{databaseType}}".',
    },
    type_degraded: {
        serial_no_sequence:
            'Поле serial, що не є первинним ключем, на "{{path}}" експортується як звичайний integer без послідовності.',
        jsonb_as_json: 'Поле "{{path}}" jsonb експортується як json.',
        uuid_as_string: 'Поле "{{path}}" uuid експортується як string(36).',
        null_as_text:
            'Клас зберігання null для поля "{{path}}" експортується як text.',
        money_as_decimal: 'Поле "{{path}}" money експортується як decimal.',
        year_as_integer: 'Поле "{{path}}" year експортується як integer.',
        bit_as_boolean: 'Поле "{{path}}" bit експортується як boolean.',
        type_as_string:
            'Поле "{{path}}" тип "{{sourceType}}" експортується як {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'Значення за замовчуванням на "{{path}}" пропущено (SQL-вираз, схожий на lambda: {{expression}}).',
        sql_expression:
            'Значення за замовчуванням на "{{path}}" пропущено (непідтримуваний SQL-вираз: {{expression}}).',
        unclear:
            'Значення за замовчуванням на "{{path}}" пропущено (неоднозначне значення за замовчуванням: {{expression}}).',
        current_timestamp_non_datetime:
            'Значення за замовчуванням на "{{path}}" пропущено (CURRENT_TIMESTAMP на полі, що не є datetime).',
        uuid_function_non_pg:
            'Значення за замовчуванням на "{{path}}" пропущено (значення за замовчуванням з UUID-функцією на UUID-полі, що не є PostgreSQL).',
        boolean_on_non_boolean:
            'Значення за замовчуванням на "{{path}}" пропущено (boolean за замовчуванням на полі, що не є boolean).',
        numeric_on_non_numeric:
            'Значення за замовчуванням на "{{path}}" пропущено (числове значення за замовчуванням на нечисловому полі).',
        unsupported_type:
            'Значення за замовчуванням на "{{path}}" пропущено (непідтримуваний тип значення за замовчуванням).',
    },
};
