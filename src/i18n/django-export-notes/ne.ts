import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'भ्यू «{{path}}» छोडियो।',
    keyless_table_skipped:
        'तालिका «{{path}}» छोडियो, किनभane Django V1 विकल्प प्राथमिक कुञ्जी सिर्जना गर्दैन।',
    schema_ignored_sqlite:
        'SQLite ले schema «{{schema}}» प्रयोग गर्दैन; तालिका «{{path}}» schema qualifier बिना निर्यात गरिन्छ।',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» हटाइयो; Django ले जडान गरिएको डाटाबेस र unqualified तालिका नामहरू प्रयोग गर्छ।',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यातले {{count}} catalogs हटाउँछ र physical नामहरू unique रहँदा unqualified तालिका नामहरू उत्पादन गर्छ।',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» हटाइयो; Django ले जडान गरिएको डाटाबेस र unqualified तालिका नामहरू प्रयोग गर्छ।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यातले {{count}} catalogs हटाउँछ र physical नामहरू unique रहँदा unqualified तालिका नामहरू उत्पादन गर्छ।',
    postgres_schema_qualified_db_table:
        'PostgreSQL तालिका «{{path}}» schema «{{schema}}» द्वारा qualified db_table सहित निर्यात गरिन्छ।',
    composite_fk_unsupported:
        'Composite foreign key «{{path}}» निर्यात गरिएन; member columns scalar रहन्छन्।',
    many_to_many_skipped:
        'Many-to-many सम्बन्ध «{{path}}» छोडियो; label मात्रबाट join table invent गरिँदैन।',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}» मा one-to-one सम्बन्ध ForeignKey को रूपमा निर्यात गरियो, किनभane foreign key unique छैन।',
    model_name_adjusted:
        'तालिका «{{path}}» को model class {{className}} को रूपमा allocate गरियो।',
    model_name_collision:
        'तालिका «{{path}}» का लागि model class «{{className}}» duplicate class name बाट बच्न allocate गरियो।',
    field_name_adjusted:
        'फिल्ड «{{path}}» Python attribute {{attributeName}} को रूपमा db_column «{{dbColumn}}» सहित निर्यात गरिन्छ।',
    related_name_adjusted:
        '«{{path}}» मा related_name reverse accessor collision बाट बच्न {{relatedName}} को रूपमा allocate गरियो।',
    composite_primary_key:
        'तालिका «{{path}}» attributes {{attributes}} प्रयोग गरेर Django 6.1 CompositePrimaryKey सहित निर्यात गरिन्छ।',
    on_update_omitted:
        '«{{path}}» मा ON UPDATE «{{action}}» हटाइयो; ForeignKey मा database ON UPDATE equivalent छैन।',
    on_delete_restrict_degraded:
        '«{{path}}» मा ON DELETE RESTRICT models.DO_NOTHING को रूपमा निर्यात गरियो; Django RESTRICT/PROTECT collector semantics प्रयोग गरिँदैन।',
    set_null_omitted: {
        delete: '«{{path}}» मा ON DELETE SET NULL हटाइयो, किनभane foreign key nullable छैन; models.DO_NOTHING प्रयोग गरिन्छ।',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'join table «{{path}}» का लागि convenience ManyToManyField generate गरिएन, किनभane extra data columns छन्।',
        ambiguous:
            'join table «{{path}}» का लागि convenience ManyToManyField generate गरिएन, किनभane endpoint model ambiguous छ।',
    },
    relationship_skipped: {
        table_not_exported:
            'सम्बन्ध «{{path}}» छोडियो, किनभane एउटा तालिका निर्यात गरिएन।',
        field_not_exported:
            'सम्बन्ध «{{path}}» छोडियो, किनभane referenced field निर्यात गरिएन।',
        already_relational:
            'सम्बन्ध «{{path}}» छोडियो, किनभane owning field पहिले नै relationship हो।',
        primary_key_fk:
            'सम्बन्ध «{{path}}» छोडियो, किनभane owning column primary key को भाग हो।',
        unsupported_target_field:
            'सम्बन्ध «{{path}}» छोडियो, किनभane target field unique Django target होइन।',
    },
    index_omitted: {
        unsupported_type:
            'इन्डेक्स «{{path}}» हटाइयो, किनभane type «{{indexType}}» models.Index को रूपमा निर्यात हुँदैन।',
        field_not_exported:
            'इन्डेक्स «{{path}}» हटाइयो, किनभane referenced field निर्यात गरिएन।',
        unsafe_name:
            'इन्डेक्स «{{path}}» हटाइयो, किनभane explicit name Django मा safely representable छैन।',
    },
    index_name_adjusted: {
        unsafe_name:
            'इन्डेक्स नाम «{{originalName}}» Django नामकरण सीमा पूरा गर्न «{{allocatedName}}» मा अनुकूलित गरियो।',
        name_collision:
            'डुप्लिकेट Django इन्डेक्स नामबाट बच्न इन्डेक्स नाम «{{originalName}}» «{{allocatedName}}» मा अनुकूलित गरियो।',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'युनिक कन्स्ट्रेन्ट नाम «{{originalName}}» Django नामकरण सीमा पूरा गर्न «{{allocatedName}}» मा अनुकूलित गरियो।',
        name_collision:
            'डुप्लिकेट Django कन्स्ट्रेन्ट नामबाट बच्न युनिक कन्स्ट्रेन्ट नाम «{{originalName}}» «{{allocatedName}}» मा अनुकूलित गरियो।',
    },
    comment_omitted: {
        table: '«{{path}}» मा table comment हटाइयो, किनभane SQLite ले comments persist गर्दैन।',
        column: '«{{path}}» मा column comment हटाइयो, किनभane SQLite ले comments persist गर्दैन।',
    },
    check_omitted: {
        table: '«{{path}}» मा CHECK constraint हटाइयो, किनभane arbitrary SQL Django 6.1 expression मा convert गर्न सकिँदैन।',
        column: '«{{path}}» मा CHECK हटाइयो, किनभane arbitrary SQL Django 6.1 expression मा convert गर्न सकिँदैन।',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}» मा SET character field को रूपमा निर्यात गरिन्छ; native SET types generate हुँदैनन्।',
    },
    enum_degraded: {
        enum_as_text:
            '«{{path}}» मा enum character field को रूपमा निर्यात गरिन्छ; Django TextChoices generate हुँदैनन्।',
    },
    type_omitted: {
        array: '«{{path}}» मा array field Django export बाट हटाइयो।',
        spatial: '«{{path}}» मा spatial field Django export बाट हटाइयो।',
        tsvector: '«{{path}}» मा tsvector field Django export बाट हटाइयो।',
        xml: '«{{path}}» मा XML field Django export बाट हटाइयो।',
        unsupported:
            '«{{path}}» field हटाइयो, किनभane type represent गर्न सकिँदैन।',
        unimplemented_database:
            'database type «{{databaseType}}» का लागि type mapping implement गरिएको छैन।',
        decimal_precision_required:
            '«{{path}}» मा decimal field हटाइयो, किनभane MySQL/MariaDB DecimalField लाई max_digits र decimal_places चाहिन्छ।',
    },
    type_degraded: {
        varchar_without_max_length:
            '«{{path}}» field character type max_length नभएकोले {{mappedField}} को रूपमा निर्यात गरिन्छ।',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» मा default omitted (unsupported default type)।',
        current_timestamp_non_datetime:
            '«{{path}}» मा default omitted (non-datetime field मा CURRENT_TIMESTAMP)।',
        uuid_function_non_pg:
            '«{{path}}» मा default omitted (non-PostgreSQL UUID field मा UUID function)।',
        sql_expression:
            '«{{path}}» मा default omitted (unsupported SQL expression: {{expression}})।',
        unclear:
            '«{{path}}» मा default omitted (unclear default: {{expression}})।',
        boolean_on_non_boolean:
            '«{{path}}» मा default omitted (non-boolean field मा boolean default)।',
        numeric_on_non_numeric:
            '«{{path}}» मा default omitted (non-numeric field मा numeric default)।',
    },
};
