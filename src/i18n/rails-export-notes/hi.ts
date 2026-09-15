import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'व्यू "{{path}}" को छोड़ दिया गया।',
    schema_ignored_sqlite:
        'SQLite schema "{{schema}}" का उपयोग नहीं करता; टेबल "{{path}}" बिना schema qualifier के निर्यात की जाती है।',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" छोड़ दिया गया; Rails कनेक्टेड डेटाबेस और unqualified टेबल नामों का उपयोग करता है।',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यात {{count}} catalogs छोड़ता है और unqualified टेबल नाम आउटपुट करता है क्योंकि भौतिक नाम अद्वितीय रहते हैं।',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" छोड़ दिया गया; Rails कनेक्टेड डेटाबेस और unqualified टेबल नामों का उपयोग करता है।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यात {{count}} catalogs छोड़ता है और unqualified टेबल नाम आउटपुट करता है क्योंकि भौतिक नाम अद्वितीय रहते हैं।',
    composite_fk_unsupported:
        'समग्र foreign key "{{path}}" निर्यात नहीं की गई; Rails V1 केवल सुरक्षित single-column foreign keys आउटपुट करता है।',
    keyless_relationship_skipped:
        'संबंध "{{path}}" छोड़ दिया गया क्योंकि मुख्य टेबल foreign-key semantics का समर्थन नहीं कर सकती।',
    many_to_many_skipped:
        'अनेक-से-अनेक संबंध "{{path}}" छोड़ दिया गया; लेबल से कोई single foreign key side infer नहीं हो सकी।',
    keyless_model:
        'टेबल "{{path}}" में primary key नहीं है। मॉडल self.primary_key = nil सेट करता है; Active Record persistence सीमित हो सकती है।',
    one_to_one_degraded_non_unique_fk:
        '"{{path}}" पर one-to-one संबंध has_many के रूप में निर्यात होता है क्योंकि foreign key unique नहीं है।',
    many_to_many_through_skipped:
        'join table "{{path}}" के लिए has_many :through generate नहीं हुआ क्योंकि association names अस्पष्ट थे।',
    model_name_adjusted:
        'टेबल "{{path}}" के लिए model class {{className}} के रूप में आवंटित की गई।',
    model_name_collision:
        'टेबल "{{path}}" के लिए model class {{className}} duplicate constant से बचने के लिए आवंटित की गई।',
    on_update_omitted:
        'ON UPDATE "{{action}}" Rails 8.1 schema.rb add_foreign_key में "{{path}}" के लिए प्रतिनिधित नहीं है।',
    set_null_omitted: {
        delete: '"{{path}}" पर ON DELETE SET NULL छोड़ दिया गया क्योंकि foreign key column nullable नहीं है।',
        update: '"{{path}}" पर ON UPDATE SET NULL छोड़ दिया गया क्योंकि foreign key column nullable नहीं है।',
    },
    association_name_adjusted: {
        belongs_to:
            '"{{path}}" पर belongs_to नाम collision से बचने के लिए {{associationName}} के रूप में आवंटित किया गया।',
        inverse:
            '"{{path}}" पर inverse association नाम collision से बचने के लिए {{associationName}} के रूप में आवंटित की गई।',
    },
    relationship_skipped: {
        table_not_exported:
            'संबंध "{{path}}" छोड़ दिया गया क्योंकि एक टेबल निर्यात नहीं हुई।',
        unresolved_field_ids:
            'संबंध "{{path}}" छोड़ दिया गया क्योंकि foreign-key field IDs resolve नहीं हो सके।',
        referenced_column_not_exported:
            'संबंध "{{path}}" छोड़ दिया गया क्योंकि एक referenced column निर्यात नहीं हुई।',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" छोड़ दिया गया क्योंकि type "{{indexType}}" Rails schema.rb में निर्यात नहीं होता।',
        missing_field:
            'Index "{{path}}" छोड़ दिया गया क्योंकि एक referenced field missing है।',
        field_not_exported:
            'Index "{{path}}" छोड़ दिया गया क्योंकि एक referenced field निर्यात नहीं हुई।',
    },
    comment_omitted: {
        table: 'टेबल "{{path}}" पर comment छोड़ दिया गया क्योंकि SQLite comments persist नहीं करता।',
        column: 'Column "{{path}}" पर comment छोड़ दिया गया क्योंकि SQLite comments persist नहीं करता।',
    },
    check_omitted: {
        table: '"{{path}}" पर empty CHECK constraint छोड़ दिया गया।',
        column: '"{{path}}" पर empty CHECK छोड़ दिया गया।',
    },
    set_degraded: {
        sqlite_as_string:
            '"{{path}}" पर SET field SQLite के लिए string के रूप में निर्यात होती है।',
        mysql_family_as_string:
            '"{{path}}" पर SET field string के रूप में निर्यात होती है; native SET DSL emit नहीं होता।',
    },
    enum_degraded: {
        sqlite_as_string:
            '"{{path}}" पर enum field SQLite के लिए string के रूप में निर्यात होती है।',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}" declare नहीं हुआ क्योंकि canonical values missing हैं।',
        pg_field_values_missing:
            'Field "{{path}}" PostgreSQL enum string के रूप में निर्यात हुआ क्योंकि canonical enum values missing हैं।',
        pg_field_named_values_missing:
            'Field "{{path}}" PostgreSQL enum "{{enumName}}" string के रूप में निर्यात हुआ क्योंकि enum values missing हैं।',
        mysql_family_as_string:
            '"{{path}}" पर enum field string के रूप में निर्यात होती है; native enum/set DSL emit नहीं होता।',
    },
    type_omitted: {
        array: '"{{path}}" पर array field Rails schema.rb में प्रतिनिधित नहीं है।',
        spatial:
            '"{{path}}" पर spatial field Rails schema.rb में प्रतिनिधित नहीं है।',
        unsupported:
            '"{{path}}" पर field छोड़ दी गई क्योंकि उसका type represent नहीं हो सकता।',
        unimplemented_database:
            'Database type "{{databaseType}}" के लिए type mapping implement नहीं है।',
    },
    type_degraded: {
        serial_no_sequence:
            '"{{path}}" पर non-primary-key serial field sequence के बिना ordinary integer के रूप में निर्यात होती है।',
        jsonb_as_json:
            'Field "{{path}}" jsonb json के रूप में निर्यात होता है।',
        uuid_as_string:
            'Field "{{path}}" uuid string(36) के रूप में निर्यात होता है।',
        null_as_text:
            'Field "{{path}}" null storage class text के रूप में निर्यात होता है।',
        money_as_decimal:
            'Field "{{path}}" money decimal के रूप में निर्यात होता है।',
        year_as_integer:
            'Field "{{path}}" year integer के रूप में निर्यात होता है।',
        bit_as_boolean:
            'Field "{{path}}" bit boolean के रूप में निर्यात होता है।',
        type_as_string:
            'Field "{{path}}" type "{{sourceType}}" {{mappedHelper}} के रूप में निर्यात होता है।',
    },
    default_omitted: {
        lambda_expression:
            '"{{path}}" पर default छोड़ दिया गया (lambda-looking SQL expression: {{expression}})।',
        sql_expression:
            '"{{path}}" पर default छोड़ दिया गया (unsupported SQL expression: {{expression}})।',
        unclear:
            '"{{path}}" पर default छोड़ दिया गया (unclear default: {{expression}})।',
        current_timestamp_non_datetime:
            '"{{path}}" पर default छोड़ दिया गया (non-datetime field पर CURRENT_TIMESTAMP)।',
        uuid_function_non_pg:
            '"{{path}}" पर default छोड़ दिया गया (non-PostgreSQL UUID field पर UUID function default)।',
        boolean_on_non_boolean:
            '"{{path}}" पर default छोड़ दिया गया (non-boolean field पर boolean default)।',
        numeric_on_non_numeric:
            '"{{path}}" पर default छोड़ दिया गया (non-numeric field पर numeric default)।',
        unsupported_type:
            '"{{path}}" पर default छोड़ दिया गया (unsupported default type)।',
    },
};
