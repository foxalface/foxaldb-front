import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'व्ह्यू «{{path}}» वगळले.',
    keyless_table_skipped:
        'टेबल «{{path}}» वगळले, कारण Django V1 पर्यायी प्राथमिक की तयार करत नाही.',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}» वापरत नाही; टेबल «{{path}}» schema qualifier शिवाय निर्यात केले जाते.',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» वगळले; Django कनेक्टेड डेटाबेस आणि unqualified टेबल नावे वापरते.',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यात {{count}} catalogs वगळते आणि physical नावे unique असल्यामुळे unqualified टेबल नावे देते.',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» वगळले; Django कनेक्टेड डेटाबेस आणि unqualified टेबल नावे वापरते.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यात {{count}} catalogs वगळते आणि physical नावे unique असल्यामुळे unqualified टेबल नावे देते.',
    postgres_schema_qualified_db_table:
        'PostgreSQL टेबल «{{path}}» schema «{{schema}}» ने qualified db_table सह निर्यात केले जाते.',
    composite_fk_unsupported:
        'Composite foreign key «{{path}}» निर्यात केले नाही; member columns scalar राहतात.',
    many_to_many_skipped:
        'Many-to-many संबंध «{{path}}» वगळला; label वरून join table तयार केली जात नाही.',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}» वरील one-to-one संबंध ForeignKey म्हणून निर्यात केला, कारण foreign key unique नाही.',
    model_name_adjusted:
        'टेबल «{{path}}»ची model class {{className}} म्हणून allocate केली.',
    model_name_collision:
        'टेबल «{{path}}»साठी model class «{{className}}» duplicate class name टाळण्यासाठी allocate केली.',
    field_name_adjusted:
        'फील्ड «{{path}}» Python attribute {{attributeName}} म्हणून db_column «{{dbColumn}}» सह निर्यात केले जाते.',
    related_name_adjusted:
        '«{{path}}» वरील related_name reverse accessor collision टाळण्यासाठी {{relatedName}} म्हणून allocate केले.',
    composite_primary_key:
        'टेबल «{{path}}» attributes {{attributes}} वापरून Django 6.1 CompositePrimaryKey सह निर्यात केले जाते.',
    on_update_omitted:
        '«{{path}}» वरील ON UPDATE «{{action}}» वगळले; ForeignKey ला database ON UPDATE equivalent नाही.',
    on_delete_restrict_degraded:
        '«{{path}}» वरील ON DELETE RESTRICT models.DO_NOTHING म्हणून निर्यात केले; Django RESTRICT/PROTECT collector semantics वापरले जात नाहीत.',
    set_null_omitted: {
        delete: '«{{path}}» वरील ON DELETE SET NULL वगळले, कारण foreign key nullable नाही; models.DO_NOTHING वापरले जाते.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'join table «{{path}}»साठी convenience ManyToManyField generate केले नाही, कारण extra data columns आहेत.',
        ambiguous:
            'join table «{{path}}»साठी convenience ManyToManyField generate केले नाही, कारण endpoint model ambiguous आहे.',
    },
    relationship_skipped: {
        table_not_exported:
            'संबंध «{{path}}» वगळला, कारण एक टेबल निर्यात केले नाही.',
        field_not_exported:
            'संबंध «{{path}}» वगळला, कारण referenced field निर्यात केले नाही.',
        already_relational:
            'संबंध «{{path}}» वगळला, कारण owning field आधीच relationship आहे.',
        primary_key_fk:
            'संबंध «{{path}}» वगळला, कारण owning column primary keyचा भाग आहे.',
        unsupported_target_field:
            'संबंध «{{path}}» वगळला, कारण target field unique Django target नाही.',
    },
    index_omitted: {
        unsupported_type:
            'इंडेक्स «{{path}}» वगळला, कारण type «{{indexType}}» models.Index म्हणून निर्यात होत नाही.',
        field_not_exported:
            'इंडेक्स «{{path}}» वगळला, कारण referenced field निर्यात केले नाही.',
        unsafe_name:
            'इंडेक्स «{{path}}» वगळला, कारण explicit name Django मध्ये safely representable नाही.',
    },
    index_name_adjusted: {
        unsafe_name:
            'इंडेक्स नाव «{{originalName}}» Django नामकरण मर्यादा पूर्ण करण्यासाठी «{{allocatedName}}» वर अनुकूलित केले.',
        name_collision:
            'डुप्लिकेट Django इंडेक्स नाव टाळण्यासाठी इंडेक्स नाव «{{originalName}}» «{{allocatedName}}» वर अनुकूलित केले.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'युनिक कंस्ट्रेंट नाव «{{originalName}}» Django नामकरण मर्यादा पूर्ण करण्यासाठी «{{allocatedName}}» वर अनुकूलित केले.',
        name_collision:
            'डुप्लिकेट Django कंस्ट्रेंट नाव टाळण्यासाठी युनिक कंस्ट्रेंट नाव «{{originalName}}» «{{allocatedName}}» वर अनुकूलित केले.',
    },
    comment_omitted: {
        table: '«{{path}}» वरील table comment वगळला, कारण SQLite comments persist करत नाही.',
        column: '«{{path}}» वरील column comment वगळला, कारण SQLite comments persist करत नाही.',
    },
    check_omitted: {
        table: '«{{path}}» वरील CHECK constraint वगळले, कारण arbitrary SQL Django 6.1 expression मध्ये convert होऊ शकत नाही.',
        column: '«{{path}}» वरील CHECK वगळले, कारण arbitrary SQL Django 6.1 expression मध्ये convert होऊ शकत नाही.',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}» वरील SET character field म्हणून निर्यात केले जाते; native SET types generate होत नाहीत.',
    },
    enum_degraded: {
        enum_as_text:
            '«{{path}}» वरील enum character field म्हणून निर्यात केले जाते; Django TextChoices generate होत नाहीत.',
    },
    type_omitted: {
        array: '«{{path}}» वरील array field Django export मधून वगळले.',
        spatial: '«{{path}}» वरील spatial field Django export मधून वगळले.',
        tsvector: '«{{path}}» वरील tsvector field Django export मधून वगळले.',
        xml: '«{{path}}» वरील XML field Django export मधून वगळले.',
        unsupported:
            '«{{path}}» field वगळले, कारण type represent करता येत नाही.',
        unimplemented_database:
            'database type «{{databaseType}}» साठी type mapping implement केले नाही.',
        decimal_precision_required:
            '«{{path}}» वरील decimal field वगळले, कारण MySQL/MariaDB DecimalField ला max_digits आणि decimal_places लागतात.',
    },
    type_degraded: {
        varchar_without_max_length:
            '«{{path}}» field character type max_length नसल्यामुळे {{mappedField}} म्हणून निर्यात केले जाते.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» वरील default omitted (unsupported default type).',
        current_timestamp_non_datetime:
            '«{{path}}» वरील default omitted (non-datetime field वर CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '«{{path}}» वरील default omitted (non-PostgreSQL UUID field वर UUID function).',
        sql_expression:
            '«{{path}}» वरील default omitted (unsupported SQL expression: {{expression}}).',
        unclear:
            '«{{path}}» वरील default omitted (unclear default: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}» वरील default omitted (non-boolean field वर boolean default).',
        numeric_on_non_numeric:
            '«{{path}}» वरील default omitted (non-numeric field वर numeric default).',
    },
};
