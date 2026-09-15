import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'View "{{path}}" छोडियो।',
    schema_ignored_sqlite:
        'SQLite ले schema "{{schema}}" प्रयोग गर्दैन; तालिका "{{path}}" schema सङ्केतक बिना निर्यात गरिएको छ।',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" हटाइयो; Rails ले जडान गरिएको database र अयोग्य तालिका नामहरू प्रयोग गर्छ।',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यातले {{count}} catalogs हटाउँछ र अयोग्य तालिका नामहरू उत्पन्न गर्छ किनभने भौतिक नामहरू अद्वितीय रहन्छन्।',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" हटाइयो; Rails ले जडान गरिएको database र अयोग्य तालिका नामहरू प्रयोग गर्छ।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यातले {{count}} catalogs हटाउँछ र अयोग्य तालिका नामहरू उत्पन्न गर्छ किनभने भौतिक नामहरू अद्वितीय रहन्छन्।',
    composite_fk_unsupported:
        'Composite foreign key "{{path}}" निर्यात गरिएको छैन; Rails V1 ले केवल सुरक्षित एक-स्तम्भ foreign keys उत्पन्न गर्छ।',
    keyless_relationship_skipped:
        'सम्बन्ध "{{path}}" छोडियो किनभने मुख्य तालिकाले foreign-key semantics समर्थन गर्न सक्दैन।',
    many_to_many_skipped:
        'धेरै-देखि-धेरै सम्बन्ध "{{path}}" छोडियो; लेबलबाट कुनै एकल foreign key पक्ष अनुमान गर्न सकिएन।',
    keyless_model:
        'तालिका "{{path}}" मा primary key छैन। Model ले self.primary_key = nil सेट गर्छ; Active Record persistence सीमित हुन सक्छ।',
    one_to_one_degraded_non_unique_fk:
        '"{{path}}" मा एक-देखि-एक सम्बन्ध has_many को रूपमा निर्यात गरिएको छ किनभने foreign key अद्वितीय छैन।',
    many_to_many_through_skipped:
        'Join तालिका "{{path}}" को लागि has_many :through उत्पन्न गरिएन किनभने association नामहरू अस्पष्ट थिए।',
    model_name_adjusted:
        'तालिका "{{path}}" को model class {{className}} को रूपमा तोकियो।',
    model_name_collision:
        'तालिका "{{path}}" को model class {{className}} दोहोरिएको constant बाट बच्न तोकियो।',
    on_update_omitted:
        '"{{path}}" को लागि Rails 8.1 schema.rb add_foreign_key मा ON UPDATE "{{action}}" प्रतिनिधित्व गरिएको छैन।',
    set_null_omitted: {
        delete: '"{{path}}" मा ON DELETE SET NULL हटाइयो किनभने foreign key स्तम्भ nullable छैन।',
        update: '"{{path}}" मा ON UPDATE SET NULL हटाइयो किनभने foreign key स्तम्भ nullable छैन।',
    },
    association_name_adjusted: {
        belongs_to:
            '"{{path}}" मा belongs_to {{associationName}} को रूपमा तोकियो नाम द्वन्द्व बाट बच्न।',
        inverse:
            '"{{path}}" मा उल्टो association {{associationName}} को रूपमा तोकियो नाम द्वन्द्व बाट बच्न।',
    },
    relationship_skipped: {
        table_not_exported:
            'सम्बन्ध "{{path}}" छोडियो किनभने एक तालिका निर्यात गरिएको थिएन।',
        unresolved_field_ids:
            'सम्बन्ध "{{path}}" छोडियो किनभने foreign-key field IDs समाधान गर्न सकिएन।',
        referenced_column_not_exported:
            'सम्बन्ध "{{path}}" छोडियो किनभने सन्दर्भित स्तम्भ निर्यात गरिएको थिएन।',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" हटाइयो किनभने प्रकार "{{indexType}}" Rails schema.rb मा निर्यात गरिँदैन।',
        missing_field:
            'Index "{{path}}" हटाइयो किनभने सन्दर्भित field हराइरहेको छ।',
        field_not_exported:
            'Index "{{path}}" हटाइयो किनभने सन्दर्भित field निर्यात गरिएको थिएन।',
    },
    comment_omitted: {
        table: '"{{path}}" मा तालिका टिप्पणी हटाइयो किनभने SQLite ले टिप्पणीहरू संरक्षण गर्दैन।',
        column: '"{{path}}" मा स्तम्भ टिप्पणी हटाइयो किनभने SQLite ले टिप्पणीहरू संरक्षण गर्दैन।',
    },
    check_omitted: {
        table: '"{{path}}" मा खाली check constraint हटाइयो।',
        column: '"{{path}}" मा खाली check हटाइयो।',
    },
    set_degraded: {
        sqlite_as_string:
            '"{{path}}" मा set field SQLite को लागि string को रूपमा निर्यात गरिएको छ।',
        mysql_family_as_string:
            '"{{path}}" मा set field string को रूपमा निर्यात गरिएको छ; native SET DSL उत्पन्न गरिएको छैन।',
    },
    enum_degraded: {
        sqlite_as_string:
            '"{{path}}" मा enum field SQLite को लागि string को रूपमा निर्यात गरिएको छ।',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}" घोषणा गरिएन किनभने canonical values हराइरहेका छन्।',
        pg_field_values_missing:
            'Field "{{path}}" PostgreSQL enum string को रूपमा निर्यात गरिएको छ किनभने canonical enum values हराइरहेका छन्।',
        pg_field_named_values_missing:
            'Field "{{path}}" PostgreSQL enum "{{enumName}}" string को रूपमा निर्यात गरिएको छ किनभने enum values हराइरहेका छन्।',
        mysql_family_as_string:
            '"{{path}}" मा enum field string को रूपमा निर्यात गरिएको छ; native enum/set DSL उत्पन्न गरिएको छैन।',
    },
    type_omitted: {
        array: '"{{path}}" मा array field Rails schema.rb मा प्रतिनिधित्व गरिएको छैन।',
        spatial:
            '"{{path}}" मा spatial field Rails schema.rb मा प्रतिनिधित्व गरिएको छैन।',
        unsupported:
            '"{{path}}" मा field हटाइयो किनभने यसको प्रकार प्रतिनिधित्व गर्न सकिँदैन।',
        unimplemented_database:
            'Database प्रकार "{{databaseType}}" को लागि type mapping कार्यान्वयन गरिएको छैन।',
    },
    type_degraded: {
        serial_no_sequence:
            '"{{path}}" मा non-primary-key serial field sequence बिना साधारण integer को रूपमा निर्यात गरिएको छ।',
        jsonb_as_json: 'Field "{{path}}" jsonb json को रूपमा निर्यात गरिएको छ।',
        uuid_as_string:
            'Field "{{path}}" uuid string(36) को रूपमा निर्यात गरिएको छ।',
        null_as_text:
            'Field "{{path}}" null storage class text को रूपमा निर्यात गरिएको छ।',
        money_as_decimal:
            'Field "{{path}}" money decimal को रूपमा निर्यात गरिएको छ।',
        year_as_integer:
            'Field "{{path}}" year integer को रूपमा निर्यात गरिएको छ।',
        bit_as_boolean:
            'Field "{{path}}" bit boolean को रूपमा निर्यात गरिएको छ।',
        type_as_string:
            'Field "{{path}}" प्रकार "{{sourceType}}" {{mappedHelper}} को रूपमा निर्यात गरिएको छ।',
    },
    default_omitted: {
        lambda_expression:
            '"{{path}}" मा default हटाइयो (lambda जस्तो SQL expression: {{expression}})।',
        sql_expression:
            '"{{path}}" मा default हटाइयो (असमर्थित SQL expression: {{expression}})।',
        unclear:
            '"{{path}}" मा default हटाइयो (अस्पष्ट default: {{expression}})।',
        current_timestamp_non_datetime:
            '"{{path}}" मा default हटाइयो (non-datetime field मा CURRENT_TIMESTAMP)।',
        uuid_function_non_pg:
            '"{{path}}" मा default हटाइयो (non-PostgreSQL UUID field मा UUID function default)।',
        boolean_on_non_boolean:
            '"{{path}}" मा default हटाइयो (non-boolean field मा boolean default)।',
        numeric_on_non_numeric:
            '"{{path}}" मा default हटाइयो (non-numeric field मा numeric default)।',
        unsupported_type:
            '"{{path}}" मा default हटाइयो (असमर्थित default प्रकार)।',
    },
};
