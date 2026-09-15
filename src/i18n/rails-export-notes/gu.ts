import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'View "{{path}}" છોડી દેવામાં આવી.',
    schema_ignored_sqlite:
        'SQLite schema "{{schema}}" ઉપયોગ કરતું નથી; ટેબલ "{{path}}" schema સૂચક વિના નિકાસ કરવામાં આવી.',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" છોડી દેવામાં આવ્યું; Rails કનેક્ટેડ database અને અયોગ્ય ટેબલ નામો ઉપયોગ કરે છે.',
    mysql_multiple_catalogs_ignored:
        'MySQL નિકાસ {{count}} catalogs છોડે છે અને અયોગ્ય ટેબલ નામો ઉત્પન્ન કરે છે કારણ કે ભૌતિક નામો અનન્ય રહે છે.',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" છોડી દેવામાં આવ્યું; Rails કનેક્ટેડ database અને અયોગ્ય ટેબલ નામો ઉપયોગ કરે છે.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB નિકાસ {{count}} catalogs છોડે છે અને અયોગ્ય ટેબલ નામો ઉત્પન્ન કરે છે કારણ કે ભૌતિક નામો અનન્ય રહે છે.',
    composite_fk_unsupported:
        'Composite foreign key "{{path}}" નિકાસ કરવામાં આવી નથી; Rails V1 ફક્ત સુરક્ષિત એક-સ્તંભ foreign keys ઉત્પન્ન કરે છે.',
    keyless_relationship_skipped:
        'સંબંધ "{{path}}" છોડી દેવામાં આવ્યો કારણ કે મુખ્ય ટેબલ foreign-key semantics સમર્થન કરી શકતી નથી.',
    many_to_many_skipped:
        'ઘણા-થી-ઘણા સંબંધ "{{path}}" છોડી દેવામાં આવ્યો; લેબલથી એકલ foreign key બાજુ અનુમાનિત કરી શકાયું નહીં.',
    keyless_model:
        'ટેબલ "{{path}}" માં primary key નથી. Model self.primary_key = nil સેટ કરે છે; Active Record persistence મર્યાદિત હોઈ શકે છે.',
    one_to_one_degraded_non_unique_fk:
        '"{{path}}" પર એક-થી-એક સંબંધ has_many તરીકે નિકાસ કરવામાં આવ્યો કારણ કે foreign key અનન્ય નથી.',
    many_to_many_through_skipped:
        'Join ટેબલ "{{path}}" માટે has_many :through ઉત્પન્ન કરવામાં આવ્યું નથી કારણ કે association નામો અસ્પષ્ટ હતા.',
    model_name_adjusted:
        'ટેબલ "{{path}}" માટે model class {{className}} તરીકે સોંપવામાં આવી.',
    model_name_collision:
        'ટેબલ "{{path}}" માટે model class {{className}} ડુપ્લિકેટ constant ટાળવા માટે સોંપવામાં આવી.',
    on_update_omitted:
        '"{{path}}" માટે Rails 8.1 schema.rb add_foreign_key માં ON UPDATE "{{action}}" પ્રતિનિધિત્વ કરવામાં આવ્યું નથી.',
    set_null_omitted: {
        delete: '"{{path}}" પર ON DELETE SET NULL છોડી દેવામાં આવ્યું કારણ કે foreign key સ્તંભ nullable નથી.',
        update: '"{{path}}" પર ON UPDATE SET NULL છોડી દેવામાં આવ્યું કારણ કે foreign key સ્તંભ nullable નથી.',
    },
    association_name_adjusted: {
        belongs_to:
            '"{{path}}" પર belongs_to {{associationName}} તરીકે સોંપવામાં આવ્યું નામ સંઘર્ષ ટાળવા માટે.',
        inverse:
            '"{{path}}" પર વિપરીત association {{associationName}} તરીકે સોંપવામાં આવ્યું નામ સંઘર્ષ ટાળવા માટે.',
    },
    relationship_skipped: {
        table_not_exported:
            'સંબંધ "{{path}}" છોડી દેવામાં આવ્યો કારણ કે એક ટેબલ નિકાસ કરવામાં આવી નહોતી.',
        unresolved_field_ids:
            'સંબંધ "{{path}}" છોડી દેવામાં આવ્યો કારણ કે foreign-key field IDs ઉકેલી શકાયા નહીં.',
        referenced_column_not_exported:
            'સંબંધ "{{path}}" છોડી દેવામાં આવ્યો કારણ કે સંદર્ભિત સ્તંભ નિકાસ કરવામાં આવ્યો નહોતો.',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" છોડી દેવામાં આવ્યું કારણ કે પ્રકાર "{{indexType}}" Rails schema.rb માં નિકાસ કરવામાં આવતો નથી.',
        missing_field:
            'Index "{{path}}" છોડી દેવામાં આવ્યું કારણ કે સંદર્ભિત field ગુમ થયેલું છે.',
        field_not_exported:
            'Index "{{path}}" છોડી દેવામાં આવ્યું કારણ કે સંદર્ભિત field નિકાસ કરવામાં આવ્યું નહોતું.',
    },
    comment_omitted: {
        table: '"{{path}}" પર ટેબલ ટિપ્પણી છોડી દેવામાં આવી કારણ કે SQLite ટિપ્પણીઓ સંગ્રહિત કરતું નથી.',
        column: '"{{path}}" પર સ્તંભ ટિપ્પણી છોડી દેવામાં આવી કારણ કે SQLite ટિપ્પણીઓ સંગ્રહિત કરતું નથી.',
    },
    check_omitted: {
        table: '"{{path}}" પર ખાલી check constraint છોડી દેવામાં આવ્યું.',
        column: '"{{path}}" પર ખાલી check છોડી દેવામાં આવ્યું.',
    },
    set_degraded: {
        sqlite_as_string:
            '"{{path}}" પર set field SQLite માટે string તરીકે નિકાસ કરવામાં આવ્યું.',
        mysql_family_as_string:
            '"{{path}}" પર set field string તરીકે નિકાસ કરવામાં આવ્યું; native SET DSL ઉત્પન્ન કરવામાં આવ્યું નથી.',
    },
    enum_degraded: {
        sqlite_as_string:
            '"{{path}}" પર enum field SQLite માટે string તરીકે નિકાસ કરવામાં આવ્યું.',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}" જાહેર કરવામાં આવ્યું નથી કારણ કે canonical values ગુમ થયેલા છે.',
        pg_field_values_missing:
            'Field "{{path}}" PostgreSQL enum string તરીકે નિકાસ કરવામાં આવ્યું કારણ કે canonical enum values ગુમ થયેલા છે.',
        pg_field_named_values_missing:
            'Field "{{path}}" PostgreSQL enum "{{enumName}}" string તરીકે નિકાસ કરવામાં આવ્યું કારણ કે enum values ગુમ થયેલા છે.',
        mysql_family_as_string:
            '"{{path}}" પર enum field string તરીકે નિકાસ કરવામાં આવ્યું; native enum/set DSL ઉત્પન્ન કરવામાં આવ્યું નથી.',
    },
    type_omitted: {
        array: '"{{path}}" પર array field Rails schema.rb માં પ્રતિનિધિત્વ કરવામાં આવ્યું નથી.',
        spatial:
            '"{{path}}" પર spatial field Rails schema.rb માં પ્રતિનિધિત્વ કરવામાં આવ્યું નથી.',
        unsupported:
            '"{{path}}" પર field છોડી દેવામાં આવ્યું કારણ કે તેનો પ્રકાર પ્રતિનિધિત્વ કરી શકાતો નથી.',
        unimplemented_database:
            'Database પ્રકાર "{{databaseType}}" માટે type mapping અમલમાં નથી.',
    },
    type_degraded: {
        serial_no_sequence:
            '"{{path}}" પર non-primary-key serial field sequence વિના સામાન્ય integer તરીકે નિકાસ કરવામાં આવ્યું.',
        jsonb_as_json:
            'Field "{{path}}" jsonb json તરીકે નિકાસ કરવામાં આવ્યું.',
        uuid_as_string:
            'Field "{{path}}" uuid string(36) તરીકે નિકાસ કરવામાં આવ્યું.',
        null_as_text:
            'Field "{{path}}" null storage class text તરીકે નિકાસ કરવામાં આવ્યું.',
        money_as_decimal:
            'Field "{{path}}" money decimal તરીકે નિકાસ કરવામાં આવ્યું.',
        year_as_integer:
            'Field "{{path}}" year integer તરીકે નિકાસ કરવામાં આવ્યું.',
        bit_as_boolean:
            'Field "{{path}}" bit boolean તરીકે નિકાસ કરવામાં આવ્યું.',
        type_as_string:
            'Field "{{path}}" પ્રકાર "{{sourceType}}" {{mappedHelper}} તરીકે નિકાસ કરવામાં આવ્યું.',
    },
    default_omitted: {
        lambda_expression:
            '"{{path}}" પર default છોડી દેવામાં આવ્યું (lambda જેવું SQL expression: {{expression}}).',
        sql_expression:
            '"{{path}}" પર default છોડી દેવામાં આવ્યું (અસમર્થિત SQL expression: {{expression}}).',
        unclear:
            '"{{path}}" પર default છોડી દેવામાં આવ્યું (અસ્પષ્ટ default: {{expression}}).',
        current_timestamp_non_datetime:
            '"{{path}}" પર default છોડી દેવામાં આવ્યું (non-datetime field પર CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '"{{path}}" પર default છોડી દેવામાં આવ્યું (non-PostgreSQL UUID field પર UUID function default).',
        boolean_on_non_boolean:
            '"{{path}}" પર default છોડી દેવામાં આવ્યું (non-boolean field પર boolean default).',
        numeric_on_non_numeric:
            '"{{path}}" પર default છોડી દેવામાં આવ્યું (non-numeric field પર numeric default).',
        unsupported_type:
            '"{{path}}" પર default છોડી દેવામાં આવ્યું (અસમર્થિત default પ્રકાર).',
    },
};
