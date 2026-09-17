import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'Подання «{{path}}» пропущено.',
    keyless_table_skipped:
        'Таблицю «{{path}}» пропущено, бо її не можна безпечно подати як SQL лише для бази без вигаданого первинного ключа.',
    keyless_table_sql_created:
        'Фізичну таблицю «{{path}}» створює SQL лише для бази, бо Django не може змоделювати таблицю без первинного ключа, не змінюючи схему.',
    keyless_model_omitted:
        'Модель Django ORM для «{{path}}» не генерується, бо Django вимагає первинний ключ.',
    schema_ignored_sqlite:
        'SQLite не використовує схему «{{schema}}»; таблицю «{{path}}» експортовано без кваліфікатора схеми.',
    mysql_catalog_omitted:
        'Каталог MySQL «{{catalog}}» пропущено; Django використовує підключену базу даних і некваліфіковані імена таблиць.',
    mysql_multiple_catalogs_ignored:
        'Експорт MySQL пропускає {{count}} каталогів і виводить некваліфіковані імена таблиць, оскільки фізичні імена залишаються унікальними.',
    mariadb_catalog_omitted:
        'Каталог MariaDB «{{catalog}}» пропущено; Django використовує підключену базу даних і некваліфіковані імена таблиць.',
    mariadb_multiple_catalogs_ignored:
        'Експорт MariaDB пропускає {{count}} каталогів і виводить некваліфіковані імена таблиць, оскільки фізичні імена залишаються унікальними.',
    postgres_schema_qualified_db_table:
        'Таблицю PostgreSQL «{{path}}» експортовано з db_table, кваліфікованим схемою «{{schema}}».',
    composite_fk_unsupported:
        'Складений зовнішній ключ «{{path}}» не експортовано; стовпці-члени залишаються скалярними.',
    many_to_many_skipped:
        'Звʼязок «багато до багатьох» «{{path}}» пропущено; з однієї мітки не створюється таблиця зʼєднання.',
    one_to_one_degraded_non_unique_fk:
        'Звʼязок «один до одного» для «{{path}}» експортовано як ForeignKey, оскільки зовнішній ключ не унікальний.',
    model_name_adjusted:
        'Клас моделі для таблиці «{{path}}» було призначено як {{className}}.',
    model_name_collision:
        'Клас моделі «{{className}}» для таблиці «{{path}}» було призначено, щоб уникнути дублювання імені класу.',
    field_name_adjusted:
        'Поле «{{path}}» експортовано як атрибут Python {{attributeName}} з db_column «{{dbColumn}}».',
    related_name_adjusted:
        'related_name для «{{path}}» було призначено як {{relatedName}}, щоб уникнути конфлікту зворотного доступу.',
    composite_primary_key:
        'Таблицю «{{path}}» експортовано з CompositePrimaryKey Django 6.1 з атрибутами {{attributes}}.',
    on_update_omitted:
        'ON UPDATE «{{action}}» для «{{path}}» пропущено; у ForeignKey немає еквівалента ON UPDATE у базі даних.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT для «{{path}}» експортовано як models.DO_NOTHING; семантика колектора RESTRICT/PROTECT Django не використовується.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL пропущено для «{{path}}», оскільки зовнішній ключ не допускає NULL; використовується models.DO_NOTHING.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'Зручне ManyToManyField не було згенеровано для таблиці зʼєднання «{{path}}», оскільки є додаткові стовпці даних.',
        ambiguous:
            'Зручне ManyToManyField не було згенеровано для таблиці зʼєднання «{{path}}», оскільки модель кінцевої точки неоднозначна.',
    },
    relationship_skipped: {
        table_not_exported:
            'Звʼязок «{{path}}» пропущено, оскільки таблицю не було експортовано.',
        field_not_exported:
            'Звʼязок «{{path}}» пропущено, оскільки посиланняне поле не було експортовано.',
        already_relational:
            'Звʼязок «{{path}}» пропущено, оскільки поле-власник уже є звʼязком.',
        primary_key_fk:
            'Звʼязок «{{path}}» пропущено, оскільки стовпець-власник є частиною первинного ключа.',
        unsupported_target_field:
            'Звʼязок «{{path}}» пропущено, оскільки цільове поле не є унікальною ціллю Django.',
        keyless_target:
            'Зв’язок «{{path}}» пропущено, бо він вказує на таблицю без ключа, яка не має моделі Django.',
    },
    index_omitted: {
        unsupported_type:
            'Індекс «{{path}}» пропущено, оскільки тип «{{indexType}}» не експортується як models.Index.',
        field_not_exported:
            'Індекс «{{path}}» пропущено, оскільки посиланняне поле не було експортовано.',
        unsafe_name:
            'Індекс «{{path}}» пропущено, оскільки його явне імʼя не можна безпечно представити в Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'Назву індексу «{{originalName}}» адаптовано на «{{allocatedName}}», щоб відповідати обмеженням іменування Django.',
        name_collision:
            'Назву індексу «{{originalName}}» адаптовано на «{{allocatedName}}», щоб уникнути повторюваної назви індексу Django.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'Назву унікального обмеження «{{originalName}}» адаптовано на «{{allocatedName}}», щоб відповідати обмеженням іменування Django.',
        name_collision:
            'Назву унікального обмеження «{{originalName}}» адаптовано на «{{allocatedName}}», щоб уникнути повторюваної назви обмеження Django.',
    },
    comment_omitted: {
        table: 'Коментар до таблиці «{{path}}» пропущено, оскільки SQLite не зберігає коментарі.',
        column: 'Коментар до стовпця «{{path}}» пропущено, оскільки SQLite не зберігає коментарі.',
    },
    check_omitted: {
        table: 'Обмеження CHECK для «{{path}}» пропущено, оскільки довільний SQL не можна перетворити на вираз Django 6.1.',
        column: 'CHECK для «{{path}}» пропущено, оскільки довільний SQL не можна перетворити на вираз Django 6.1.',
    },
    set_degraded: {
        set_as_text:
            'SET поля «{{path}}» експортовано як символьне поле; нативні типи SET не генеруються.',
    },
    enum_degraded: {
        enum_as_text:
            'enum поля «{{path}}» експортовано як символьне поле; Django TextChoices не генеруються.',
    },
    type_omitted: {
        array: 'Масивне поле «{{path}}» пропущено під час експорту Django.',
        spatial:
            'Просторове поле «{{path}}» пропущено під час експорту Django.',
        tsvector: 'Поле tsvector «{{path}}» пропущено під час експорту Django.',
        xml: 'Поле XML «{{path}}» пропущено під час експорту Django.',
        unsupported:
            'Поле «{{path}}» пропущено, оскільки його тип неможливо представити.',
        unimplemented_database:
            'Зіставлення типів не реалізовано для типу бази даних «{{databaseType}}».',
        decimal_precision_required:
            'Поле decimal «{{path}}» пропущено, оскільки DecimalField MySQL/MariaDB вимагає max_digits і decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'Символьний тип поля «{{path}}» експортовано як {{mappedField}}, оскільки відсутній max_length.',
    },
    default_omitted: {
        unsupported_type:
            'Значення за замовчуванням для «{{path}}» пропущено (непідтримуваний тип значення за замовчуванням).',
        current_timestamp_non_datetime:
            'Значення за замовчуванням для «{{path}}» пропущено (CURRENT_TIMESTAMP для поля, що не є datetime).',
        uuid_function_non_pg:
            'Значення за замовчуванням для «{{path}}» пропущено (функція UUID для поля UUID, що не є PostgreSQL).',
        sql_expression:
            'Значення за замовчуванням для «{{path}}» пропущено (непідтримуваний SQL-вираз: {{expression}}).',
        unclear:
            'Значення за замовчуванням для «{{path}}» пропущено (неясне значення за замовчуванням: {{expression}}).',
        boolean_on_non_boolean:
            'Значення за замовчуванням для «{{path}}» пропущено (логічне значення за замовчуванням для поля, що не є boolean).',
        numeric_on_non_numeric:
            'Значення за замовчуванням для «{{path}}» пропущено (числове значення за замовчуванням для поля, що не є числовим).',
    },
};
