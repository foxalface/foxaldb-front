import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'ভিউ «{{path}}» এড়িয়ে যাওয়া হয়েছে।',
    keyless_table_skipped:
        '"{{path}}" টেবিল বাদ দেওয়া হয়েছে কারণ প্রাথমিক কী উদ্ভাবন না করে এটিকে নিরাপদ ডাটাবেস-শুধু SQL হিসেবে উপস্থাপন করা যায় না।',
    keyless_table_sql_created:
        'ভৌত টেবিল "{{path}}" ডাটাবেস-শুধু SQL দিয়ে তৈরি হয় কারণ Django প্রাথমিক কী ছাড়া টেবিলকে স্কিমা না বদলে মডেল করতে পারে না।',
    keyless_model_omitted:
        '"{{path}}"-এর জন্য কোনো Django ORM মডেল তৈরি হয় না কারণ Django-এর প্রাথমিক কী প্রয়োজন।',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}» ব্যবহার করে না; টেবিল «{{path}}» schema qualifier ছাড়াই রপ্তানি করা হয়।',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» বাদ দেওয়া হয়েছে; Django সংযুক্ত ডাটাবেস এবং unqualified টেবিল নাম ব্যবহার করে।',
    mysql_multiple_catalogs_ignored:
        'MySQL রপ্তানি {{count}}টি catalog বাদ দেয় এবং unqualified টেবিল নাম দেয়, কারণ physical নামগুলো unique থাকে।',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» বাদ দেওয়া হয়েছে; Django সংযুক্ত ডাটাবেস এবং unqualified টেবিল নাম ব্যবহার করে।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB রপ্তানি {{count}}টি catalog বাদ দেয় এবং unqualified টেবিল নাম দেয়, কারণ physical নামগুলো unique থাকে।',
    postgres_schema_qualified_db_table:
        'PostgreSQL টেবিল «{{path}}» schema «{{schema}}» দ্বারা qualified db_table সহ রপ্তানি করা হয়।',
    composite_fk_unsupported:
        'Composite foreign key «{{path}}» রপ্তানি করা হয়নি; member columns scalar থাকে।',
    many_to_many_skipped:
        'Many-to-many সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে; label থেকে join table তৈরি করা হয় না।',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}»-এ one-to-one সম্পর্ক ForeignKey হিসেবে রপ্তানি করা হয়েছে, কারণ foreign key unique নয়।',
    model_name_adjusted:
        'টেবিল «{{path}}»-এর model class {{className}} হিসেবে বরাদ্দ করা হয়েছে।',
    model_name_collision:
        'টেবিল «{{path}}»-এর model class «{{className}}» duplicate class name এড়াতে বরাদ্দ করা হয়েছে।',
    field_name_adjusted:
        'ফিল্ড «{{path}}» Python attribute {{attributeName}} হিসেবে db_column «{{dbColumn}}» সহ রপ্তানি করা হয়।',
    related_name_adjusted:
        '«{{path}}»-এ related_name reverse accessor collision এড়াতে {{relatedName}} হিসেবে বরাদ্দ করা হয়েছে।',
    composite_primary_key:
        'টেবিল «{{path}}» attributes {{attributes}} ব্যবহার করে Django 6.1 CompositePrimaryKey সহ রপ্তানি করা হয়।',
    on_update_omitted:
        '«{{path}}»-এ ON UPDATE «{{action}}» বাদ দেওয়া হয়েছে; ForeignKey-এর database ON UPDATE equivalent নেই।',
    on_delete_restrict_degraded:
        '«{{path}}»-এ ON DELETE RESTRICT models.DO_NOTHING হিসেবে রপ্তানি করা হয়; Django RESTRICT/PROTECT collector semantics ব্যবহার করা হয় না।',
    set_null_omitted: {
        delete: '«{{path}}»-এ ON DELETE SET NULL বাদ দেওয়া হয়েছে, কারণ foreign key nullable নয়; models.DO_NOTHING ব্যবহার করা হয়।',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'join table «{{path}}»-এর জন্য convenience ManyToManyField তৈরি করা হয়নি, কারণ extra data columns আছে।',
        ambiguous:
            'join table «{{path}}»-এর জন্য convenience ManyToManyField তৈরি করা হয়নি, কারণ endpoint model ambiguous।',
    },
    relationship_skipped: {
        table_not_exported:
            'সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে, কারণ একটি টেবিল রপ্তানি করা হয়নি।',
        field_not_exported:
            'সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে, কারণ একটি referenced field রপ্তানি করা হয়নি।',
        already_relational:
            'সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে, কারণ owning field ইতিমধ্যে একটি সম্পর্ক।',
        primary_key_fk:
            'সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে, কারণ owning column primary key-এর অংশ।',
        unsupported_target_field:
            'সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে, কারণ target field unique Django target নয়।',
        keyless_target:
            '"{{path}}" সম্পর্ক বাদ দেওয়া হয়েছে কারণ এটি এমন একটি কীহীন টেবিলকে লক্ষ্য করে যার Django মডেল নেই।',
    },
    index_omitted: {
        unsupported_type:
            'ইনডেক্স «{{path}}» বাদ দেওয়া হয়েছে, কারণ type «{{indexType}}» models.Index হিসেবে রপ্তানি হয় না।',
        field_not_exported:
            'ইনডেক্স «{{path}}» বাদ দেওয়া হয়েছে, কারণ একটি referenced field রপ্তানি করা হয়নি।',
        unsafe_name:
            'ইনডেক্স «{{path}}» বাদ দেওয়া হয়েছে, কারণ এর explicit name Django-তে safely representable নয়।',
    },
    index_name_adjusted: {
        unsafe_name:
            'ইনডেক্স নাম «{{originalName}}» Django নামকরণ সীমা মেনে «{{allocatedName}}»-এ মানিয়ে নেওয়া হয়েছে।',
        name_collision:
            'ডুপ্লিকেট Django ইনডেক্স নাম এড়াতে ইনডেক্স নাম «{{originalName}}» «{{allocatedName}}»-এ মানিয়ে নেওয়া হয়েছে।',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'ইউনিক কনস্ট্রেইন্ট নাম «{{originalName}}» Django নামকরণ সীমা মেনে «{{allocatedName}}»-এ মানিয়ে নেওয়া হয়েছে।',
        name_collision:
            'ডুপ্লিকেট Django কনস্ট্রেইন্ট নাম এড়াতে ইউনিক কনস্ট্রেইন্ট নাম «{{originalName}}» «{{allocatedName}}»-এ মানিয়ে নেওয়া হয়েছে।',
    },
    comment_omitted: {
        table: '«{{path}}»-এ table comment বাদ দেওয়া হয়েছে, কারণ SQLite comments persist করে না।',
        column: '«{{path}}»-এ column comment বাদ দেওয়া হয়েছে, কারণ SQLite comments persist করে না।',
    },
    check_omitted: {
        table: '«{{path}}»-এ CHECK constraint বাদ দেওয়া হয়েছে, কারণ arbitrary SQL Django 6.1 expression-এ convert করা যায় না।',
        column: '«{{path}}»-এ CHECK বাদ দেওয়া হয়েছে, কারণ arbitrary SQL Django 6.1 expression-এ convert করা যায় না।',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}»-এ SET character field হিসেবে রপ্তানি করা হয়; native SET types generate হয় না।',
    },
    enum_degraded: {
        enum_as_text:
            '«{{path}}»-এ enum character field হিসেবে রপ্তানি করা হয়; Django TextChoices generate হয় না।',
    },
    type_omitted: {
        array: '«{{path}}»-এ array field Django export থেকে বাদ দেওয়া হয়েছে।',
        spatial:
            '«{{path}}»-এ spatial field Django export থেকে বাদ দেওয়া হয়েছে।',
        tsvector:
            '«{{path}}»-এ tsvector field Django export থেকে বাদ দেওয়া হয়েছে।',
        xml: '«{{path}}»-এ XML field Django export থেকে বাদ দেওয়া হয়েছে।',
        unsupported:
            '«{{path}}» field বাদ দেওয়া হয়েছে, কারণ এর type represent করা যায় না।',
        unimplemented_database:
            'database type «{{databaseType}}»-এর জন্য type mapping implement করা নেই।',
        decimal_precision_required:
            '«{{path}}»-এ decimal field বাদ দেওয়া হয়েছে, কারণ MySQL/MariaDB DecimalField max_digits ও decimal_places চায়।',
    },
    type_degraded: {
        varchar_without_max_length:
            '«{{path}}» field character type {{mappedField}} হিসেবে রপ্তানি করা হয়, কারণ max_length নেই।',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}»-এ default বাদ দেওয়া হয়েছে (unsupported default type)।',
        current_timestamp_non_datetime:
            '«{{path}}»-এ default বাদ দেওয়া হয়েছে (non-datetime field-এ CURRENT_TIMESTAMP)।',
        uuid_function_non_pg:
            '«{{path}}»-এ default বাদ দেওয়া হয়েছে (non-PostgreSQL UUID field-এ UUID function)।',
        sql_expression:
            '«{{path}}»-এ default বাদ দেওয়া হয়েছে (unsupported SQL expression: {{expression}})।',
        unclear:
            '«{{path}}»-এ default বাদ দেওয়া হয়েছে (unclear default: {{expression}})।',
        boolean_on_non_boolean:
            '«{{path}}»-এ default বাদ দেওয়া হয়েছে (non-boolean field-এ boolean default)।',
        numeric_on_non_numeric:
            '«{{path}}»-এ default বাদ দেওয়া হয়েছে (non-numeric field-এ numeric default)।',
    },
};
