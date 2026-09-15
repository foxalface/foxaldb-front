import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'View "{{path}}" वगळले.',
    schema_ignored_sqlite:
        'SQLite schema "{{schema}}" वापरत नाही; टेबल "{{path}}" schema सुसूचकाशिवाय निर्यात केले.',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" वगळले; Rails जोडलेला database आणि अयोग्य टेबल नावे वापरते.',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यात {{count}} catalogs वगळते आणि अयोग्य टेबल नावे उत्पन्न करते कारण भौतिक नावे अद्वितीय राहतात.',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" वगळले; Rails जोडलेला database आणि अयोग्य टेबल नावे वापरते.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यात {{count}} catalogs वगळते आणि अयोग्य टेबल नावे उत्पन्न करते कारण भौतिक नावे अद्वितीय राहतात.',
    composite_fk_unsupported:
        'Composite foreign key "{{path}}" निर्यात केले नाही; Rails V1 केवळ सुरक्षित एक-स्तंभ foreign keys उत्पन्न करते.',
    keyless_relationship_skipped:
        'संबंध "{{path}}" वगळला कारण मुख्य टेबल foreign-key semantics समर्थन करू शकत नाही.',
    many_to_many_skipped:
        'अनेक-ते-अनेक संबंध "{{path}}" वगळला; लेबलवरून एकल foreign key बाजू अनुमानित करता आला नाही.',
    keyless_model:
        'टेबल "{{path}}" मध्ये primary key नाही. Model self.primary_key = nil सेट करते; Active Record persistence मर्यादित असू शकते.',
    one_to_one_degraded_non_unique_fk:
        '"{{path}}" वर एक-ते-एक संबंध has_many म्हणून निर्यात केला कारण foreign key अद्वितीय नाही.',
    many_to_many_through_skipped:
        'Join टेबल "{{path}}" साठी has_many :through उत्पन्न केले नाही कारण association नावे अस्पष्ट होती.',
    model_name_adjusted:
        'टेबल "{{path}}" साठी model class {{className}} म्हणून नियुक्त केले.',
    model_name_collision:
        'टेबल "{{path}}" साठी model class {{className}} डुप्लिकेट constant टाळण्यासाठी नियुक्त केले.',
    on_update_omitted:
        '"{{path}}" साठी Rails 8.1 schema.rb add_foreign_key मध्ये ON UPDATE "{{action}}" प्रतिनिधित्व केले नाही.',
    set_null_omitted: {
        delete: '"{{path}}" वर ON DELETE SET NULL वगळले कारण foreign key स्तंभ nullable नाही.',
        update: '"{{path}}" वर ON UPDATE SET NULL वगळले कारण foreign key स्तंभ nullable नाही.',
    },
    association_name_adjusted: {
        belongs_to:
            '"{{path}}" वर belongs_to {{associationName}} म्हणून नियुक्त केले नाव संघर्ष टाळण्यासाठी.',
        inverse:
            '"{{path}}" वर उलट association {{associationName}} म्हणून नियुक्त केले नाव संघर्ष टाळण्यासाठी.',
    },
    relationship_skipped: {
        table_not_exported:
            'संबंध "{{path}}" वगळला कारण एक टेबल निर्यात केले नव्हते.',
        unresolved_field_ids:
            'संबंध "{{path}}" वगळला कारण foreign-key field IDs सोडवता आले नाहीत.',
        referenced_column_not_exported:
            'संबंध "{{path}}" वगळला कारण संदर्भित स्तंभ निर्यात केला नव्हता.',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" वगळले कारण प्रकार "{{indexType}}" Rails schema.rb मध्ये निर्यात केला जात नाही.',
        missing_field: 'Index "{{path}}" वगळले कारण संदर्भित field गहाळ आहे.',
        field_not_exported:
            'Index "{{path}}" वगळले कारण संदर्भित field निर्यात केला नव्हता.',
    },
    comment_omitted: {
        table: '"{{path}}" वर टेबल टिप्पणी वगळली कारण SQLite टिप्पण्या जतन करत नाही.',
        column: '"{{path}}" वर स्तंभ टिप्पणी वगळली कारण SQLite टिप्पण्या जतन करत नाही.',
    },
    check_omitted: {
        table: '"{{path}}" वर रिकामे check constraint वगळले.',
        column: '"{{path}}" वर रिकामे check वगळले.',
    },
    set_degraded: {
        sqlite_as_string:
            '"{{path}}" वर set field SQLite साठी string म्हणून निर्यात केले.',
        mysql_family_as_string:
            '"{{path}}" वर set field string म्हणून निर्यात केले; native SET DSL उत्पन्न केले नाही.',
    },
    enum_degraded: {
        sqlite_as_string:
            '"{{path}}" वर enum field SQLite साठी string म्हणून निर्यात केले.',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}" घोषित केले नाही कारण canonical values गहाळ आहेत.',
        pg_field_values_missing:
            'Field "{{path}}" PostgreSQL enum string म्हणून निर्यात केले कारण canonical enum values गहाळ आहेत.',
        pg_field_named_values_missing:
            'Field "{{path}}" PostgreSQL enum "{{enumName}}" string म्हणून निर्यात केले कारण enum values गहाळ आहेत.',
        mysql_family_as_string:
            '"{{path}}" वर enum field string म्हणून निर्यात केले; native enum/set DSL उत्पन्न केले नाही.',
    },
    type_omitted: {
        array: '"{{path}}" वर array field Rails schema.rb मध्ये प्रतिनिधित्व केले नाही.',
        spatial:
            '"{{path}}" वर spatial field Rails schema.rb मध्ये प्रतिनिधित्व केले नाही.',
        unsupported:
            '"{{path}}" वर field वगळले कारण त्याचा प्रकार प्रतिनिधित्व करता येत नाही.',
        unimplemented_database:
            'Database प्रकार "{{databaseType}}" साठी type mapping अंमलात नाही.',
    },
    type_degraded: {
        serial_no_sequence:
            '"{{path}}" वर non-primary-key serial field sequence शिवाय साधारण integer म्हणून निर्यात केले.',
        jsonb_as_json: 'Field "{{path}}" jsonb json म्हणून निर्यात केले.',
        uuid_as_string: 'Field "{{path}}" uuid string(36) म्हणून निर्यात केले.',
        null_as_text:
            'Field "{{path}}" null storage class text म्हणून निर्यात केले.',
        money_as_decimal: 'Field "{{path}}" money decimal म्हणून निर्यात केले.',
        year_as_integer: 'Field "{{path}}" year integer म्हणून निर्यात केले.',
        bit_as_boolean: 'Field "{{path}}" bit boolean म्हणून निर्यात केले.',
        type_as_string:
            'Field "{{path}}" प्रकार "{{sourceType}}" {{mappedHelper}} म्हणून निर्यात केले.',
    },
    default_omitted: {
        lambda_expression:
            '"{{path}}" वर default वगळले (lambda सारखे SQL expression: {{expression}}).',
        sql_expression:
            '"{{path}}" वर default वगळले (असमर्थित SQL expression: {{expression}}).',
        unclear:
            '"{{path}}" वर default वगळले (अस्पष्ट default: {{expression}}).',
        current_timestamp_non_datetime:
            '"{{path}}" वर default वगळले (non-datetime field वर CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '"{{path}}" वर default वगळले (non-PostgreSQL UUID field वर UUID function default).',
        boolean_on_non_boolean:
            '"{{path}}" वर default वगळले (non-boolean field वर boolean default).',
        numeric_on_non_numeric:
            '"{{path}}" वर default वगळले (non-numeric field वर numeric default).',
        unsupported_type:
            '"{{path}}" वर default वगळले (असमर्थित default प्रकार).',
    },
};
