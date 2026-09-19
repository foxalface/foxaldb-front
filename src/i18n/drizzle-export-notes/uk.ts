import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'Подання «{{path}}» пропущено.',
    keyless_table_skipped:
        'Таблицю «{{path}}» пропущено, бо вона не має безпечно зображуваних стовпців.',
    keyless_table:
        'Таблиця «{{path}}» не має первинного ключа і експортується як нативна таблиця Drizzle без вигаданого id.',
    schema_ignored_sqlite:
        'SQLite не використовує схему «{{schema}}»; таблиця «{{path}}» експортується без кваліфікатора схеми.',
    mysql_catalog_omitted:
        'Каталог MySQL «{{catalog}}» пропущено; Drizzle використовує некваліфіковані імена таблиць і одне підключення до бази.',
    mysql_multiple_catalogs_ignored:
        'Експорт MySQL пропускає {{count}} каталогів і виводить некваліфіковані імена таблиць, бо фізичні імена лишаються унікальними.',
    mariadb_catalog_omitted:
        'Каталог MariaDB «{{catalog}}» пропущено; Drizzle використовує некваліфіковані імена таблиць і одне підключення до бази.',
    mariadb_multiple_catalogs_ignored:
        'Експорт MariaDB пропускає {{count}} каталогів і виводить некваліфіковані імена таблиць, бо фізичні імена лишаються унікальними.',
    mariadb_mysql_dialect_adapted:
        'MariaDB експортується через MySQL API Drizzle (діалект «{{dialect}}»). У Drizzle 0.45 немає повноцінного діалекту MariaDB.',
    postgres_schema_qualified:
        'Схему PostgreSQL «{{schema}}» експортовано з pgSchema().',
    uuid_as_text:
        'Поле UUID «{{path}}» експортується як текст, бо ця база не має нативного типу UUID у Drizzle 0.45.',
    increment_omitted:
        'Автоінкремент на «{{path}}» пропущено, бо його не можна безпечно зобразити.',
    set_null_omitted:
        'ON DELETE SET NULL на «{{path}}» пропущено, бо стовпець зовнішнього ключа має NOT NULL.',
    sqlite_boolean_integer:
        'Логічне поле «{{path}}» експортується як integer({ mode: "boolean" }), бо SQLite не має нативного логічного типу.',
    sqlite_json_text:
        'JSON-поле «{{path}}» експортується як text({ mode: "json" }), бо SQLite зберігає JSON як TEXT.',
    table_name_adjusted: {
        table: 'Таблицю «{{path}}» експортовано як константу TypeScript {{tsName}}. Фізичне ім’я таблиці збережено.',
        pgEnum: 'Перелік PostgreSQL «{{path}}» експортовано як константу TypeScript {{tsName}}. Фізичне ім’я переліку збережено.',
        pgSchema:
            'Схему PostgreSQL «{{path}}» експортовано як константу TypeScript {{tsName}}.',
    },
    table_name_collision:
        'Константу таблиці «{{tsName}}» для «{{path}}» призначено, щоб уникнути дубльованого ідентифікатора TypeScript.',
    column_name_adjusted:
        'Стовпець «{{path}}» експортується як властивість TypeScript {{tsName}}. Фізичне ім’я стовпця збережено.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'Складений зовнішній ключ «{{path}}» пропущено, бо списки початкових і цільових стовпців були присутні не обидва.',
        composite_fk_arity_mismatch:
            'Складений зовнішній ключ «{{path}}» пропущено, бо кількість початкових і цільових стовпців відрізняється.',
        label_only:
            'Зв’язок багато-до-багатьох «{{path}}» пропущено, бо з мітки не визначається фізична таблиця з’єднання.',
        table_not_exported:
            'Зв’язок «{{path}}» пропущено, бо пов’язану таблицю не експортовано.',
        unresolved_member:
            'Зв’язок «{{path}}» пропущено, бо пов’язане поле не експортовано.',
    },
    index_omitted: {
        unsupported_method:
            'Індекс «{{path}}» пропущено, бо тип «{{indexType}}» не експортується.',
        field_not_exported:
            'Індекс «{{path}}» пропущено, бо пов’язане поле не експортовано.',
    },
    comment_omitted: {
        table: 'Коментар таблиці на «{{path}}» пропущено, бо в Drizzle 0.45 немає структурованого API коментарів, яке використовує цей експортер.',
        column: 'Коментар стовпця на «{{path}}» пропущено, бо в Drizzle 0.45 немає структурованого API коментарів, яке використовує цей експортер.',
    },
    check_omitted: {
        table: 'Обмеження CHECK на «{{path}}» пропущено, бо необроблений SQL не вставляється в згенерований TypeScript.',
        column: 'CHECK на «{{path}}» пропущено, бо необроблений SQL не вставляється в згенерований TypeScript.',
    },
    set_degraded: {
        set_as_text:
            'SET поля «{{path}}» експортується як текст; нативні типи SET не створюються.',
    },
    enum_degraded: {
        ts_enum_only:
            'Перелік поля «{{path}}» експортується як text({ enum: [...] }); SQLite не має фізичного обмеження enum.',
        unsupported_enum:
            'Перелік поля «{{path}}» експортується як текст, бо його не можна зобразити як нативний перелік Drizzle.',
        unknown_values:
            'Перелік поля «{{path}}» експортується як текст, бо значення переліку відсутні.',
    },
    type_omitted: {
        array: 'Масивне поле на «{{path}}» пропущено з експорту Drizzle.',
        unsupported:
            'Поле на «{{path}}» пропущено, бо його тип не можна зобразити.',
        unimplemented_database:
            'Відображення типів не реалізовано для типу бази «{{databaseType}}».',
    },
    type_degraded: {
        binary_as_bytea:
            'Двійковий тип поля «{{path}}» експортується як bytea().',
    },
    default_omitted: {
        unsupported_type:
            'Значення за замовчуванням на «{{path}}» пропущено (непідтримуваний тип значення за замовчуванням).',
        current_timestamp_non_datetime:
            'Значення за замовчуванням на «{{path}}» пропущено (CURRENT_TIMESTAMP на полі, яке не є datetime).',
        sql_expression:
            'Значення за замовчуванням на «{{path}}» пропущено (непідтримуваний SQL-вираз: {{expression}}).',
        unclear:
            'Значення за замовчуванням на «{{path}}» пропущено (неясне значення за замовчуванням: {{expression}}).',
        boolean_on_non_boolean:
            'Значення за замовчуванням на «{{path}}» пропущено (логічне значення на нелогічному полі).',
        numeric_on_non_numeric:
            'Значення за замовчуванням на «{{path}}» пропущено (числове значення на нечисловому полі).',
    },
};
