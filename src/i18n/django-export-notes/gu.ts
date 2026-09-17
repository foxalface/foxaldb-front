import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'વ્યૂ «{{path}}» છોડી દેવામાં આવ્યું.',
    keyless_table_skipped:
        'ટેબલ "{{path}}" છોડવામાં આવી કારણ કે પ્રાથમિક કી શોધ્યા વિના તેને સુરક્ષિત ડેટાબેઝ-માત્ર SQL તરીકે રજૂ કરી શકાતી નથી.',
    keyless_table_sql_created:
        'ભૌતિક ટેબલ "{{path}}" ડેટાબેઝ-માત્ર SQL દ્વારા બને છે કારણ કે Django પ્રાથમિક કી વગરની ટેબલને સ્કીમા બદલ્યા વિના મોડલ કરી શકતું નથી.',
    keyless_model_omitted:
        '"{{path}}" માટે Django ORM મોડલ બનતું નથી કારણ કે Django ને પ્રાથમિક કી જોઈએ છે.',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}» વાપરતું નથી; ટેબલ «{{path}}» schema qualifier વગર નિકાસ કરવામાં આવે છે.',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» છોડી દેવામાં આવ્યું; Django કનેક્ટેડ ડેટાબેઝ અને unqualified ટેબલ નામો વાપરે છે.',
    mysql_multiple_catalogs_ignored:
        'MySQL નિકાસ {{count}} catalogs છોડે છે અને physical નામો unique રહેવાથી unqualified ટેબલ નામો ઉત્પન્ન કરે છે.',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» છોડી દેવામાં આવ્યું; Django કનેક્ટેડ ડેટાબેઝ અને unqualified ટેબલ નામો વાપરે છે.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB નિકાસ {{count}} catalogs છોડે છે અને physical નામો unique રહેવાથી unqualified ટેબલ નામો ઉત્પન્ન કરે છે.',
    postgres_schema_qualified_db_table:
        'PostgreSQL ટેબલ «{{path}}» schema «{{schema}}» દ્વારા qualified db_table સાથે નિકાસ કરવામાં આવે છે.',
    composite_fk_unsupported:
        'Composite foreign key «{{path}}» નિકાસ થયું નહીં; member columns scalar રહે છે.',
    many_to_many_skipped:
        'Many-to-many સંબંધ «{{path}}» છોડી દેવામાં આવ્યો; label માત્રથી join table invent થતી નથી.',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}» પર one-to-one સંબંધ ForeignKey તરીકે નિકાસ થાય છે, કારણ કે foreign key unique નથી.',
    model_name_adjusted:
        'ટેબલ «{{path}}»ની model class {{className}} તરીકે allocate કરવામાં આવી.',
    model_name_collision:
        'ટેબલ «{{path}}» માટે model class «{{className}}» duplicate class name ટાળવા allocate કરવામાં આવી.',
    field_name_adjusted:
        'ફીલ્ડ «{{path}}» Python attribute {{attributeName}} તરીકે db_column «{{dbColumn}}» સાથે નિકાસ થાય છે.',
    related_name_adjusted:
        '«{{path}}» પર related_name reverse accessor collision ટાળવા {{relatedName}} તરીકે allocate કરવામાં આવ્યું.',
    composite_primary_key:
        'ટેબલ «{{path}}» attributes {{attributes}} વાપરીને Django 6.1 CompositePrimaryKey સાથે નિકાસ થાય છે.',
    on_update_omitted:
        '«{{path}}» પર ON UPDATE «{{action}}» છોડી દેવામાં આવ્યું; ForeignKey પાસે database ON UPDATE equivalent નથી.',
    on_delete_restrict_degraded:
        '«{{path}}» પર ON DELETE RESTRICT models.DO_NOTHING તરીકે નિકાસ થાય છે; Django RESTRICT/PROTECT collector semantics વપરાતી નથી.',
    set_null_omitted: {
        delete: '«{{path}}» પર ON DELETE SET NULL છોડી દેવામાં આવ્યું, કારણ કે foreign key nullable નથી; models.DO_NOTHING વપરાય છે.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'join table «{{path}}» માટે convenience ManyToManyField generate થયું નહીં, કારણ કે extra data columns છે.',
        ambiguous:
            'join table «{{path}}» માટે convenience ManyToManyField generate થયું નહીં, કારણ કે endpoint model ambiguous છે.',
    },
    relationship_skipped: {
        table_not_exported:
            'સંબંધ «{{path}}» છોડી દેવામાં આવ્યો, કારણ કે એક ટેબલ નિકાસ થઈ નહીં.',
        field_not_exported:
            'સંબંધ «{{path}}» છોડી દેવામાં આવ્યો, કારણ કે referenced field નિકાસ થઈ નહીં.',
        already_relational:
            'સંબંધ «{{path}}» છોડી દેવામાં આવ્યો, કારણ કે owning field પહેલેથી relationship છે.',
        primary_key_fk:
            'સંબંધ «{{path}}» છોડી દેવામાં આવ્યો, કારણ કે owning column primary keyનો ભાગ છે.',
        unsupported_target_field:
            'સંબંધ «{{path}}» છોડી દેવામાં આવ્યો, કારણ કે target field unique Django target નથી.',
        keyless_target:
            'સંબંધ "{{path}}" છોડવામાં આવ્યો કારણ કે તે કી વગરની ટેબલ તરફ નિર્દેશ કરે છે જેનું Django મોડલ નથી.',
    },
    index_omitted: {
        unsupported_type:
            'ઇન્ડેક્સ «{{path}}» છોડી દેવામાં આવ્યો, કારણ કે type «{{indexType}}» models.Index તરીકે નિકાસ થતો નથી.',
        field_not_exported:
            'ઇન્ડેક્સ «{{path}}» છોડી દેવામાં આવ્યો, કારણ કે referenced field નિકાસ થઈ નહીં.',
        unsafe_name:
            'ઇન્ડેક્સ «{{path}}» છોડી દેવામાં આવ્યો, કારણ કે explicit name Djangoમાં safely representable નથી.',
    },
    index_name_adjusted: {
        unsafe_name:
            'ઇન્ડેક્સ નામ «{{originalName}}» Django નામકરણ મર્યાદાઓ પૂરી કરવા «{{allocatedName}}» પર અનુકૂલિત કરવામાં આવ્યું.',
        name_collision:
            'ડુપ્લિકેટ Django ઇન્ડેક્સ નામ ટાળવા ઇન્ડેક્સ નામ «{{originalName}}» «{{allocatedName}}» પર અનુકૂલિત કરવામાં આવ્યું.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'યુનિક કન્સ્ટ્રેઇન્ટ નામ «{{originalName}}» Django નામકરણ મર્યાદાઓ પૂરી કરવા «{{allocatedName}}» પર અનુકૂલિત કરવામાં આવ્યું.',
        name_collision:
            'ડુપ્લિકેટ Django કન્સ્ટ્રેઇન્ટ નામ ટાળવા યુનિક કન્સ્ટ્રેઇન્ટ નામ «{{originalName}}» «{{allocatedName}}» પર અનુકૂલિત કરવામાં આવ્યું.',
    },
    comment_omitted: {
        table: '«{{path}}» પર table comment છોડી દેવામાં આવ્યો, કારણ કે SQLite comments persist કરતું નથી.',
        column: '«{{path}}» પર column comment છોડી દેવામાં આવ્યો, કારણ કે SQLite comments persist કરતું નથી.',
    },
    check_omitted: {
        table: '«{{path}}» પર CHECK constraint છોડી દેવામાં આવ્યું, કારણ કે arbitrary SQL Django 6.1 expressionમાં convert થઈ શકતું નથી.',
        column: '«{{path}}» પર CHECK છોડી દેવામાં આવ્યું, કારણ કે arbitrary SQL Django 6.1 expressionમાં convert થઈ શકતું નથી.',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}» પર SET character field તરીકે નિકાસ થાય છે; native SET types generate થતા નથી.',
    },
    enum_degraded: {
        enum_as_text:
            '«{{path}}» પર enum character field તરીકે નિકાસ થાય છે; Django TextChoices generate થતા નથી.',
    },
    type_omitted: {
        array: '«{{path}}» પર array field Django exportમાંથી છોડી દેવામાં આવ્યું.',
        spatial:
            '«{{path}}» પર spatial field Django exportમાંથી છોડી દેવામાં આવ્યું.',
        tsvector:
            '«{{path}}» પર tsvector field Django exportમાંથી છોડી દેવામાં આવ્યું.',
        xml: '«{{path}}» પર XML field Django exportમાંથી છોડી દેવામાં આવ્યું.',
        unsupported:
            '«{{path}}» field છોડી દેવામાં આવી, કારણ કે type represent કરી શકાતો નથી.',
        unimplemented_database:
            'database type «{{databaseType}}» માટે type mapping implement થયું નથી.',
        decimal_precision_required:
            '«{{path}}» પર decimal field છોડી દેવામાં આવી, કારણ કે MySQL/MariaDB DecimalField max_digits અને decimal_places જોઈએ છે.',
    },
    type_degraded: {
        varchar_without_max_length:
            '«{{path}}» field character type max_length વગર {{mappedField}} તરીકે નિકાસ થાય છે.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» પર default omitted (unsupported default type).',
        current_timestamp_non_datetime:
            '«{{path}}» પર default omitted (non-datetime field પર CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '«{{path}}» પર default omitted (non-PostgreSQL UUID field પર UUID function).',
        sql_expression:
            '«{{path}}» પર default omitted (unsupported SQL expression: {{expression}}).',
        unclear:
            '«{{path}}» પર default omitted (unclear default: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}» પર default omitted (non-boolean field પર boolean default).',
        numeric_on_non_numeric:
            '«{{path}}» પર default omitted (non-numeric field પર numeric default).',
    },
};
