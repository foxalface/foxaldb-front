import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'వ్యూ «{{path}}» దాటవేయబడింది.',
    keyless_table_skipped:
        'టేబుల్ «{{path}}» దాటవేయబడింది, ఎందుకంటే Django V1 ప్రత్యామ్నాయ ప్రాథమిక కీని సృష్టించదు.',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}»ను ఉపయోగించదు; టేబుల్ «{{path}}» schema qualifier లేకుండా ఎగుమతి చేయబడుతుంది.',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» తొలగించబడింది; Django అనుసంధానించిన డేటాబేస్ మరియు unqualified టేబుల్ పేర్లను ఉపయోగిస్తుంది.',
    mysql_multiple_catalogs_ignored:
        'MySQL ఎగుమతి {{count}} catalogs తొలగిస్తుంది మరియు physical పేర్లు unique గా ఉండటం వల్ల unqualified టేబుల్ పేర్లను విడుదల చేస్తుంది.',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» తొలగించబడింది; Django అనుసంధానించిన డేటాబేస్ మరియు unqualified టేబుల్ పేర్లను ఉపయోగిస్తుంది.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB ఎగుమతి {{count}} catalogs తొలగిస్తుంది మరియు physical పేర్లు unique గా ఉండటం వల్ల unqualified టేబుల్ పేర్లను విడుదల చేస్తుంది.',
    postgres_schema_qualified_db_table:
        'PostgreSQL టేబుల్ «{{path}}» schema «{{schema}}»తో qualified db_tableతో ఎగుమతి చేయబడుతుంది.',
    composite_fk_unsupported:
        'Composite foreign key «{{path}}» ఎగుమతి కాలేదు; member columns scalar గా ఉంటాయి.',
    many_to_many_skipped:
        'Many-to-many సంబంధం «{{path}}» దాటవేయబడింది; label నుండి join table invent చేయబడదు.',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}»పై one-to-one సంబంధం ForeignKeyగా ఎగుమతి చేయబడింది, ఎందుకంటే foreign key unique కాదు.',
    model_name_adjusted:
        'టేబుల్ «{{path}}» model class {{className}}గా allocate చేయబడింది.',
    model_name_collision:
        'టేబుల్ «{{path}}»కు model class «{{className}}» duplicate class name నివారించడానికి allocate చేయబడింది.',
    field_name_adjusted:
        'ఫీల్డ్ «{{path}}» Python attribute {{attributeName}}గా db_column «{{dbColumn}}»తో ఎగుమతి చేయబడుతుంది.',
    related_name_adjusted:
        '«{{path}}»పై related_name reverse accessor collision నివారించడానికి {{relatedName}}గా allocate చేయబడింది.',
    composite_primary_key:
        'టేబుల్ «{{path}}» attributes {{attributes}}తో Django 6.1 CompositePrimaryKeyతో ఎగుమతి చేయబడుతుంది.',
    on_update_omitted:
        '«{{path}}»పై ON UPDATE «{{action}}» తొలగించబడింది; ForeignKeyకు database ON UPDATE equivalent లేదు.',
    on_delete_restrict_degraded:
        '«{{path}}»పై ON DELETE RESTRICT models.DO_NOTHINGగా ఎగుమతి చేయబడింది; Django RESTRICT/PROTECT collector semantics ఉపయోగించబడవు.',
    set_null_omitted: {
        delete: '«{{path}}»పై ON DELETE SET NULL తొలగించబడింది, ఎందుకంటే foreign key nullable కాదు; models.DO_NOTHING ఉపయోగించబడుతుంది.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'join table «{{path}}»కు convenience ManyToManyField generate కాలేదు, ఎందుకంటే extra data columns ఉన్నాయి.',
        ambiguous:
            'join table «{{path}}»కు convenience ManyToManyField generate కాలేదు, ఎందుకంటే endpoint model ambiguous.',
    },
    relationship_skipped: {
        table_not_exported:
            'సంబంధం «{{path}}» దాటవేయబడింది, ఎందుకంటే ఒక టేబుల్ ఎగుమతి కాలేదు.',
        field_not_exported:
            'సంబంధం «{{path}}» దాటవేయబడింది, ఎందుకంటే referenced field ఎగుమతి కాలేదు.',
        already_relational:
            'సంబంధం «{{path}}» దాటవేయబడింది, ఎందుకంటే owning field ఇప్పటికే relationship.',
        primary_key_fk:
            'సంబంధం «{{path}}» దాటవేయబడింది, ఎందుకంటే owning column primary keyలో భాగం.',
        unsupported_target_field:
            'సంబంధం «{{path}}» దాటవేయబడింది, ఎందుకంటే target field unique Django target కాదు.',
    },
    index_omitted: {
        unsupported_type:
            'ఇండెక్స్ «{{path}}» తొలగించబడింది, ఎందుకంటే type «{{indexType}}» models.Indexగా ఎగుమతి కాదు.',
        field_not_exported:
            'ఇండెక్స్ «{{path}}» తొలగించబడింది, ఎందుకంటే referenced field ఎగుమతి కాలేదు.',
        unsafe_name:
            'ఇండెక్స్ «{{path}}» తొలగించబడింది, ఎందుకంటే explicit name Djangoలో safely representable కాదు.',
    },
    index_name_adjusted: {
        unsafe_name:
            'ఇండెక్స్ పేరు «{{originalName}}» Django నామకరణ పరిమితులను తీర్చడానికి «{{allocatedName}}»కి అనుకూలీకరించబడింది.',
        name_collision:
            'డూప్లికేట్ Django ఇండెక్స్ పేరును నివారించడానికి ఇండెక్స్ పేరు «{{originalName}}» «{{allocatedName}}»కి అనుకూలీకరించబడింది.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'యూనిక్ కన్‌స్ట్రెయింట్ పేరు «{{originalName}}» Django నామకరణ పరిమితులను తీర్చడానికి «{{allocatedName}}»కి అనుకూలీకరించబడింది.',
        name_collision:
            'డూప్లికేట్ Django కన్‌స్ట్రెయింట్ పేరును నివారించడానికి యూనిక్ కన్‌స్ట్రెయింట్ పేరు «{{originalName}}» «{{allocatedName}}»కి అనుకూలీకరించబడింది.',
    },
    comment_omitted: {
        table: '«{{path}}»పై table comment తొలగించబడింది, ఎందుకంటే SQLite comments persist చేయదు.',
        column: '«{{path}}»పై column comment తొలగించబడింది, ఎందుకంటే SQLite comments persist చేయదు.',
    },
    check_omitted: {
        table: '«{{path}}»పై CHECK constraint తొలగించబడింది, ఎందుకంటే arbitrary SQL Django 6.1 expressionగా convert కాలేదు.',
        column: '«{{path}}»పై CHECK తొలగించబడింది, ఎందుకంటే arbitrary SQL Django 6.1 expressionగా convert కాలేదు.',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}»పై SET character fieldగా ఎగుమతి చేయబడుతుంది; native SET types generate కావు.',
    },
    enum_degraded: {
        enum_as_text:
            '«{{path}}»పై enum character fieldగా ఎగుమతి చేయబడుతుంది; Django TextChoices generate కావు.',
    },
    type_omitted: {
        array: '«{{path}}»పై array field Django export నుండి తొలగించబడింది.',
        spatial:
            '«{{path}}»పై spatial field Django export నుండి తొలగించబడింది.',
        tsvector:
            '«{{path}}»పై tsvector field Django export నుండి తొలగించబడింది.',
        xml: '«{{path}}»పై XML field Django export నుండి తొలగించబడింది.',
        unsupported:
            '«{{path}}» field తొలగించబడింది, ఎందుకంటే type represent చేయలేము.',
        unimplemented_database:
            'database type «{{databaseType}}»కు type mapping implement కాలేదు.',
        decimal_precision_required:
            '«{{path}}»పై decimal field తొలగించబడింది, ఎందుకంటే MySQL/MariaDB DecimalField max_digits మరియు decimal_places అవసరం.',
    },
    type_degraded: {
        varchar_without_max_length:
            '«{{path}}» field character type max_length లేక {{mappedField}}గా ఎగుమతి చేయబడుతుంది.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}»పై default omitted (unsupported default type).',
        current_timestamp_non_datetime:
            '«{{path}}»పై default omitted (non-datetime fieldపై CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '«{{path}}»పై default omitted (non-PostgreSQL UUID fieldపై UUID function).',
        sql_expression:
            '«{{path}}»పై default omitted (unsupported SQL expression: {{expression}}).',
        unclear:
            '«{{path}}»పై default omitted (unclear default: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}»పై default omitted (non-boolean fieldపై boolean default).',
        numeric_on_non_numeric:
            '«{{path}}»పై default omitted (non-numeric fieldపై numeric default).',
    },
};
