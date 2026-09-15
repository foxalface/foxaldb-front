import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'View "{{path}}" దాటవేయబడింది.',
    schema_ignored_sqlite:
        'SQLite schema "{{schema}}" ను ఉపయోగించదు; పట్టిక "{{path}}" schema సూచిక లేకుండా ఎగుమతి చేయబడింది.',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" వదిలివేయబడింది; Rails కనెక్ట్ చేసిన database మరియు అనర్హ పట్టిక పేర్లను ఉపయోగిస్తుంది.',
    mysql_multiple_catalogs_ignored:
        'MySQL ఎగుమతి {{count}} catalogs వదిలివేసి అనర్హ పట్టిక పేర్లను ఉత్పత్తి చేస్తుంది, ఎందుకంటే భౌతిక పేర్లు ప్రత్యేకంగా ఉంటాయి.',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" వదిలివేయబడింది; Rails కనెక్ట్ చేసిన database మరియు అనర్హ పట్టిక పేర్లను ఉపయోగిస్తుంది.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB ఎగుమతి {{count}} catalogs వదిలివేసి అనర్హ పట్టిక పేర్లను ఉత్పత్తి చేస్తుంది, ఎందుకంటే భౌతిక పేర్లు ప్రత్యేకంగా ఉంటాయి.',
    composite_fk_unsupported:
        'Composite foreign key "{{path}}" ఎగుమతి చేయబడలేదు; Rails V1 సురక్షిత ఒక-కాలమ్ foreign keys మాత్రమే ఉత్పత్తి చేస్తుంది.',
    keyless_relationship_skipped:
        'సంబంధం "{{path}}" దాటవేయబడింది, ఎందుకంటే ప్రధాన పట్టిక foreign-key semantics ను మద్దతు ఇవ్వలేదు.',
    many_to_many_skipped:
        'అనేకం-నుండి-అనేకం సంబంధం "{{path}}" దాటవేయబడింది; లేబల్ నుండి ఒకే foreign key వైపు అనుమానించలేకపోయాం.',
    keyless_model:
        'పట్టిక "{{path}}" కు primary key లేదు. Model self.primary_key = nil సెట్ చేస్తుంది; Active Record persistence పరిమితం కావచ్చు.',
    one_to_one_degraded_non_unique_fk:
        '"{{path}}" పై ఒకటి-నుండి-ఒకటి సంబంధం has_many గా ఎగుమతి చేయబడింది, ఎందుకంటే foreign key ప్రత్యేకం కాదు.',
    many_to_many_through_skipped:
        'Join పట్టిక "{{path}}" కోసం has_many :through ఉత్పత్తి చేయలేదు, ఎందుకంటే association పేర్లు అస్పష్టంగా ఉన్నాయి.',
    model_name_adjusted:
        'పట్టిక "{{path}}" కోసం model class {{className}} గా కేటాయించబడింది.',
    model_name_collision:
        'పట్టిక "{{path}}" కోసం model class {{className}} నకలు constant ను నివారించడానికి కేటాయించబడింది.',
    on_update_omitted:
        '"{{path}}" కోసం Rails 8.1 schema.rb add_foreign_key లో ON UPDATE "{{action}}" ప్రాతినిధ్యం చేయబడలేదు.',
    set_null_omitted: {
        delete: '"{{path}}" పై ON DELETE SET NULL వదిలివేయబడింది, ఎందుకంటే foreign key కాలమ్ nullable కాదు.',
        update: '"{{path}}" పై ON UPDATE SET NULL వదిలివేయబడింది, ఎందుకంటే foreign key కాలమ్ nullable కాదు.',
    },
    association_name_adjusted: {
        belongs_to:
            '"{{path}}" పై belongs_to {{associationName}} గా కేటాయించబడింది పేరు ఘర్షణను నివారించడానికి.',
        inverse:
            '"{{path}}" పై విలోమ association {{associationName}} గా కేటాయించబడింది పేరు ఘర్షణను నివారించడానికి.',
    },
    relationship_skipped: {
        table_not_exported:
            'సంబంధం "{{path}}" దాటవేయబడింది, ఎందుకంటే ఒక పట్టిక ఎగుమతి చేయబడలేదు.',
        unresolved_field_ids:
            'సంబంధం "{{path}}" దాటవేయబడింది, ఎందుకంటే foreign-key field IDs పరిష్కరించలేకపోయాం.',
        referenced_column_not_exported:
            'సంబంధం "{{path}}" దాటవేయబడింది, ఎందుకంటే సూచించిన కాలమ్ ఎగుమతి చేయబడలేదు.',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" వదిలివేయబడింది, ఎందుకంటే రకం "{{indexType}}" Rails schema.rb లో ఎగుమతి చేయబడదు.',
        missing_field:
            'Index "{{path}}" వదిలివేయబడింది, ఎందుకంటే సూచించిన field లేదు.',
        field_not_exported:
            'Index "{{path}}" వదిలివేయబడింది, ఎందుకంటే సూచించిన field ఎగుమతి చేయబడలేదు.',
    },
    comment_omitted: {
        table: '"{{path}}" పై పట్టిక వ్యాఖ్య వదిలివేయబడింది, ఎందుకంటే SQLite వ్యాఖ్యలను నిల్వ చేయదు.',
        column: '"{{path}}" పై కాలమ్ వ్యాఖ్య వదిలివేయబడింది, ఎందుకంటే SQLite వ్యాఖ్యలను నిల్వ చేయదు.',
    },
    check_omitted: {
        table: '"{{path}}" పై ఖాళీ check constraint వదిలివేయబడింది.',
        column: '"{{path}}" పై ఖాళీ check వదిలివేయబడింది.',
    },
    set_degraded: {
        sqlite_as_string:
            '"{{path}}" పై set field SQLite కోసం string గా ఎగుమతి చేయబడింది.',
        mysql_family_as_string:
            '"{{path}}" పై set field string గా ఎగుమతి చేయబడింది; native SET DSL ఉత్పత్తి చేయబడలేదు.',
    },
    enum_degraded: {
        sqlite_as_string:
            '"{{path}}" పై enum field SQLite కోసం string గా ఎగుమతి చేయబడింది.',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}" ప్రకటించబడలేదు, ఎందుకంటే canonical values లేవు.',
        pg_field_values_missing:
            'Field "{{path}}" PostgreSQL enum string గా ఎగుమతి చేయబడింది, ఎందుకంటే canonical enum values లేవు.',
        pg_field_named_values_missing:
            'Field "{{path}}" PostgreSQL enum "{{enumName}}" string గా ఎగుమతి చేయబడింది, ఎందుకంటే enum values లేవు.',
        mysql_family_as_string:
            '"{{path}}" పై enum field string గా ఎగుమతి చేయబడింది; native enum/set DSL ఉత్పత్తి చేయబడలేదు.',
    },
    type_omitted: {
        array: '"{{path}}" పై array field Rails schema.rb లో ప్రాతినిధ్యం చేయబడలేదు.',
        spatial:
            '"{{path}}" పై spatial field Rails schema.rb లో ప్రాతినిధ్యం చేయబడలేదు.',
        unsupported:
            '"{{path}}" పై field వదిలివేయబడింది, ఎందుకంటే దాని రకం ప్రాతినిధ్యం చేయలేము.',
        unimplemented_database:
            'Database రకం "{{databaseType}}" కోసం type mapping అమలు చేయబడలేదు.',
    },
    type_degraded: {
        serial_no_sequence:
            '"{{path}}" పై non-primary-key serial field sequence లేకుండా సాధారణ integer గా ఎగుమతి చేయబడింది.',
        jsonb_as_json: 'Field "{{path}}" jsonb json గా ఎగుమతి చేయబడింది.',
        uuid_as_string: 'Field "{{path}}" uuid string(36) గా ఎగుమతి చేయబడింది.',
        null_as_text:
            'Field "{{path}}" null storage class text గా ఎగుమతి చేయబడింది.',
        money_as_decimal: 'Field "{{path}}" money decimal గా ఎగుమతి చేయబడింది.',
        year_as_integer: 'Field "{{path}}" year integer గా ఎగుమతి చేయబడింది.',
        bit_as_boolean: 'Field "{{path}}" bit boolean గా ఎగుమతి చేయబడింది.',
        type_as_string:
            'Field "{{path}}" రకం "{{sourceType}}" {{mappedHelper}} గా ఎగుమతి చేయబడింది.',
    },
    default_omitted: {
        lambda_expression:
            '"{{path}}" పై default వదిలివేయబడింది (lambda లాంటి SQL expression: {{expression}}).',
        sql_expression:
            '"{{path}}" పై default వదిలివేయబడింది (మద్దతు లేని SQL expression: {{expression}}).',
        unclear:
            '"{{path}}" పై default వదిలివేయబడింది (అస్పష్ట default: {{expression}}).',
        current_timestamp_non_datetime:
            '"{{path}}" పై default వదిలివేయబడింది (non-datetime field పై CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '"{{path}}" పై default వదిలివేయబడింది (non-PostgreSQL UUID field పై UUID function default).',
        boolean_on_non_boolean:
            '"{{path}}" పై default వదిలివేయబడింది (non-boolean field పై boolean default).',
        numeric_on_non_numeric:
            '"{{path}}" పై default వదిలివేయబడింది (non-numeric field పై numeric default).',
        unsupported_type:
            '"{{path}}" పై default వదిలివేయబడింది (మద్దతు లేని default రకం).',
    },
};
