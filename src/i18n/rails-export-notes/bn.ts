import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'View "{{path}}" বাদ দেওয়া হয়েছে।',
    schema_ignored_sqlite:
        'SQLite schema "{{schema}}" ব্যবহার করে না; টেবিল "{{path}}" schema সূচক ছাড়াই এক্সপোর্ট করা হয়েছে।',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}" বাদ দেওয়া হয়েছে; Rails সংযুক্ত database এবং অযোগ্য টেবিল নাম ব্যবহার করে।',
    mysql_multiple_catalogs_ignored:
        'MySQL এক্সপোর্ট {{count}} catalogs বাদ দেয় এবং অযোগ্য টেবিল নাম উৎপন্ন করে কারণ ভৌত নামগুলো অনন্য থাকে।',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}" বাদ দেওয়া হয়েছে; Rails সংযুক্ত database এবং অযোগ্য টেবিল নাম ব্যবহার করে।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB এক্সপোর্ট {{count}} catalogs বাদ দেয় এবং অযোগ্য টেবিল নাম উৎপন্ন করে কারণ ভৌত নামগুলো অনন্য থাকে।',
    composite_fk_unsupported:
        'Composite foreign key "{{path}}" এক্সপোর্ট করা হয়নি; Rails V1 শুধুমাত্র নিরাপদ এক-কলাম foreign keys উৎপন্ন করে।',
    keyless_relationship_skipped:
        'সম্পর্ক "{{path}}" বাদ দেওয়া হয়েছে কারণ প্রধান টেবিল foreign-key semantics সমর্থন করতে পারে না।',
    many_to_many_skipped:
        'অনেক-থেকে-অনেক সম্পর্ক "{{path}}" বাদ দেওয়া হয়েছে; লেবেল থেকে কোনো একক foreign key পাশ অনুমান করা যায়নি।',
    keyless_model:
        'টেবিল "{{path}}" এ primary key নেই। Model self.primary_key = nil সেট করে; Active Record persistence সীমিত হতে পারে।',
    one_to_one_degraded_non_unique_fk:
        '"{{path}}" এ এক-থেকে-এক সম্পর্ক has_many হিসেবে এক্সপোর্ট করা হয়েছে কারণ foreign key অনন্য নয়।',
    many_to_many_through_skipped:
        'Join টেবিল "{{path}}" এর জন্য has_many :through তৈরি করা হয়নি কারণ association নামগুলো অস্পষ্ট ছিল।',
    model_name_adjusted:
        'টেবিল "{{path}}" এর model class {{className}} হিসেবে বরাদ্দ করা হয়েছে।',
    model_name_collision:
        'টেবিল "{{path}}" এর model class {{className}} ডুপ্লিকেট constant এড়াতে বরাদ্দ করা হয়েছে।',
    on_update_omitted:
        '"{{path}}" এর জন্য Rails 8.1 schema.rb add_foreign_key এ ON UPDATE "{{action}}" প্রতিনিধিত্ব করা হয়নি।',
    set_null_omitted: {
        delete: '"{{path}}" এ ON DELETE SET NULL বাদ দেওয়া হয়েছে কারণ foreign key কলাম nullable নয়।',
        update: '"{{path}}" এ ON UPDATE SET NULL বাদ দেওয়া হয়েছে কারণ foreign key কলাম nullable নয়।',
    },
    association_name_adjusted: {
        belongs_to:
            '"{{path}}" এ belongs_to {{associationName}} হিসেবে বরাদ্দ করা হয়েছে নাম দ্বন্দ্ব এড়াতে।',
        inverse:
            '"{{path}}" এ বিপরীত association {{associationName}} হিসেবে বরাদ্দ করা হয়েছে নাম দ্বন্দ্ব এড়াতে।',
    },
    relationship_skipped: {
        table_not_exported:
            'সম্পর্ক "{{path}}" বাদ দেওয়া হয়েছে কারণ একটি টেবিল এক্সপোর্ট করা হয়নি।',
        unresolved_field_ids:
            'সম্পর্ক "{{path}}" বাদ দেওয়া হয়েছে কারণ foreign-key field IDs সমাধান করা যায়নি।',
        referenced_column_not_exported:
            'সম্পর্ক "{{path}}" বাদ দেওয়া হয়েছে কারণ একটি উল্লিখিত কলাম এক্সপোর্ট করা হয়নি।',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" বাদ দেওয়া হয়েছে কারণ ধরন "{{indexType}}" Rails schema.rb এ এক্সপোর্ট করা হয় না।',
        missing_field:
            'Index "{{path}}" বাদ দেওয়া হয়েছে কারণ উল্লিখিত field অনুপস্থিত।',
        field_not_exported:
            'Index "{{path}}" বাদ দেওয়া হয়েছে কারণ উল্লিখিত field এক্সপোর্ট করা হয়নি।',
    },
    comment_omitted: {
        table: '"{{path}}" এ টেবিল মন্তব্য বাদ দেওয়া হয়েছে কারণ SQLite মন্তব্য সংরক্ষণ করে না।',
        column: '"{{path}}" এ কলাম মন্তব্য বাদ দেওয়া হয়েছে কারণ SQLite মন্তব্য সংরক্ষণ করে না।',
    },
    check_omitted: {
        table: '"{{path}}" এ খালি check constraint বাদ দেওয়া হয়েছে।',
        column: '"{{path}}" এ খালি check বাদ দেওয়া হয়েছে।',
    },
    set_degraded: {
        sqlite_as_string:
            '"{{path}}" এ set field SQLite এর জন্য string হিসেবে এক্সপোর্ট করা হয়েছে।',
        mysql_family_as_string:
            '"{{path}}" এ set field string হিসেবে এক্সপোর্ট করা হয়েছে; native SET DSL উৎপন্ন করা হয়নি।',
    },
    enum_degraded: {
        sqlite_as_string:
            '"{{path}}" এ enum field SQLite এর জন্য string হিসেবে এক্সপোর্ট করা হয়েছে।',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}" ঘোষণা করা হয়নি কারণ canonical values অনুপস্থিত।',
        pg_field_values_missing:
            'Field "{{path}}" PostgreSQL enum string হিসেবে এক্সপোর্ট করা হয়েছে কারণ canonical enum values অনুপস্থিত।',
        pg_field_named_values_missing:
            'Field "{{path}}" PostgreSQL enum "{{enumName}}" string হিসেবে এক্সপোর্ট করা হয়েছে কারণ enum values অনুপস্থিত।',
        mysql_family_as_string:
            '"{{path}}" এ enum field string হিসেবে এক্সপোর্ট করা হয়েছে; native enum/set DSL উৎপন্ন করা হয়নি।',
    },
    type_omitted: {
        array: '"{{path}}" এ array field Rails schema.rb এ প্রতিনিধিত্ব করা হয়নি।',
        spatial:
            '"{{path}}" এ spatial field Rails schema.rb এ প্রতিনিধিত্ব করা হয়নি।',
        unsupported:
            '"{{path}}" এ field বাদ দেওয়া হয়েছে কারণ এর ধরন প্রতিনিধিত্ব করা যায় না।',
        unimplemented_database:
            'Database ধরন "{{databaseType}}" এর জন্য type mapping বাস্তবায়ন করা হয়নি।',
    },
    type_degraded: {
        serial_no_sequence:
            '"{{path}}" এ non-primary-key serial field sequence ছাড়া সাধারণ integer হিসেবে এক্সপোর্ট করা হয়েছে।',
        jsonb_as_json:
            'Field "{{path}}" jsonb json হিসেবে এক্সপোর্ট করা হয়েছে।',
        uuid_as_string:
            'Field "{{path}}" uuid string(36) হিসেবে এক্সপোর্ট করা হয়েছে।',
        null_as_text:
            'Field "{{path}}" null storage class text হিসেবে এক্সপোর্ট করা হয়েছে।',
        money_as_decimal:
            'Field "{{path}}" money decimal হিসেবে এক্সপোর্ট করা হয়েছে।',
        year_as_integer:
            'Field "{{path}}" year integer হিসেবে এক্সপোর্ট করা হয়েছে।',
        bit_as_boolean:
            'Field "{{path}}" bit boolean হিসেবে এক্সপোর্ট করা হয়েছে।',
        type_as_string:
            'Field "{{path}}" ধরন "{{sourceType}}" {{mappedHelper}} হিসেবে এক্সপোর্ট করা হয়েছে।',
    },
    default_omitted: {
        lambda_expression:
            '"{{path}}" এ default বাদ দেওয়া হয়েছে (lambda-সদৃশ SQL expression: {{expression}})।',
        sql_expression:
            '"{{path}}" এ default বাদ দেওয়া হয়েছে (অসমর্থিত SQL expression: {{expression}})।',
        unclear:
            '"{{path}}" এ default বাদ দেওয়া হয়েছে (অস্পষ্ট default: {{expression}})।',
        current_timestamp_non_datetime:
            '"{{path}}" এ default বাদ দেওয়া হয়েছে (non-datetime field এ CURRENT_TIMESTAMP)।',
        uuid_function_non_pg:
            '"{{path}}" এ default বাদ দেওয়া হয়েছে (non-PostgreSQL UUID field এ UUID function default)।',
        boolean_on_non_boolean:
            '"{{path}}" এ default বাদ দেওয়া হয়েছে (non-boolean field এ boolean default)।',
        numeric_on_non_numeric:
            '"{{path}}" এ default বাদ দেওয়া হয়েছে (non-numeric field এ numeric default)।',
        unsupported_type:
            '"{{path}}" এ default বাদ দেওয়া হয়েছে (অসমর্থিত default ধরন)।',
    },
};
