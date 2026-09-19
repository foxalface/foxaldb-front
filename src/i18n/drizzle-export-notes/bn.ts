import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'ভিউ «{{path}}» এড়িয়ে যাওয়া হয়েছে।',
    keyless_table_skipped:
        'টেবিল «{{path}}» এড়িয়ে যাওয়া হয়েছে কারণ এতে নিরাপদে উপস্থাপনযোগ্য কলাম নেই।',
    keyless_table:
        'টেবিল «{{path}}»-এর প্রাথমিক কী নেই এবং id উদ্ভাবন না করে স্থানীয় Drizzle টেবিল হিসেবে রপ্তানি হয়।',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}» ব্যবহার করে না; টেবিল «{{path}}» schema qualifier ছাড়াই রপ্তানি করা হয়।',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» বাদ দেওয়া হয়েছে; Drizzle unqualified টেবিল নাম এবং একটিমাত্র ডাটাবেস সংযোগ ব্যবহার করে।',
    mysql_multiple_catalogs_ignored:
        'MySQL রপ্তানি {{count}}টি catalog বাদ দেয় এবং unqualified টেবিল নাম দেয়, কারণ physical নামগুলো unique থাকে।',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» বাদ দেওয়া হয়েছে; Drizzle unqualified টেবিল নাম এবং একটিমাত্র ডাটাবেস সংযোগ ব্যবহার করে।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB রপ্তানি {{count}}টি catalog বাদ দেয় এবং unqualified টেবিল নাম দেয়, কারণ physical নামগুলো unique থাকে।',
    mariadb_mysql_dialect_adapted:
        'MariaDB Drizzle-এর MySQL API দিয়ে রপ্তানি হয় (dialect «{{dialect}}»)। Drizzle 0.45-এ প্রথম শ্রেণির MariaDB dialect নেই।',
    postgres_schema_qualified:
        'PostgreSQL schema «{{schema}}» pgSchema() দিয়ে রপ্তানি হয়।',
    uuid_as_text:
        'ফিল্ড «{{path}}»-এর UUID পাঠ্য হিসেবে রপ্তানি হয় কারণ এই ডাটাবেসে Drizzle 0.45-এর স্থানীয় UUID ধরন নেই।',
    increment_omitted:
        '«{{path}}»-এ স্বয়ংক্রিয় বৃদ্ধি বাদ দেওয়া হয়েছে কারণ তা নিরাপদে উপস্থাপন করা যায় না।',
    set_null_omitted:
        '«{{path}}»-এ ON DELETE SET NULL বাদ দেওয়া হয়েছে কারণ একটি বিদেশি-কী কলাম NOT NULL।',
    sqlite_boolean_integer:
        'ফিল্ড «{{path}}»-এর boolean integer({ mode: "boolean" }) হিসেবে রপ্তানি হয় কারণ SQLite-এ স্থানীয় boolean ধরন নেই।',
    sqlite_json_text:
        'ফিল্ড «{{path}}»-এর JSON text({ mode: "json" }) হিসেবে রপ্তানি হয় কারণ SQLite JSON-কে TEXT হিসেবে রাখে।',
    table_name_adjusted: {
        table: 'টেবিল «{{path}}» TypeScript ধ্রুবক {{tsName}} হিসেবে রপ্তানি হয়। ভৌত টেবিল নাম সংরক্ষিত থাকে।',
        pgEnum: 'PostgreSQL enum «{{path}}» TypeScript ধ্রুবক {{tsName}} হিসেবে রপ্তানি হয়। ভৌত enum নাম সংরক্ষিত থাকে।',
        pgSchema:
            'PostgreSQL schema «{{path}}» TypeScript ধ্রুবক {{tsName}} হিসেবে রপ্তানি হয়।',
    },
    table_name_collision:
        'ডুপ্লিকেট TypeScript শনাক্তকারী এড়াতে «{{path}}»-এর জন্য টেবিল ধ্রুবক «{{tsName}}» বরাদ্দ করা হয়েছে।',
    column_name_adjusted:
        'কলাম «{{path}}» TypeScript বৈশিষ্ট্য {{tsName}} হিসেবে রপ্তানি হয়। ভৌত কলাম নাম সংরক্ষিত থাকে।',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'যৌগিক বিদেশি কী «{{path}}» এড়িয়ে যাওয়া হয়েছে কারণ উৎস ও লক্ষ্য কলাম তালিকা দুটোই উপস্থিত ছিল না।',
        composite_fk_arity_mismatch:
            'যৌগিক বিদেশি কী «{{path}}» এড়িয়ে যাওয়া হয়েছে কারণ উৎস ও লক্ষ্য কলামের সংখ্যা ভিন্ন।',
        label_only:
            'বহু-থেকে-বহু সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে কারণ লেবেল থেকে কোনো ভৌত জয়েন টেবিল শনাক্ত হয় না।',
        table_not_exported:
            'সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে কারণ একটি উল্লিখিত টেবিল রপ্তানি হয়নি।',
        unresolved_member:
            'সম্পর্ক «{{path}}» এড়িয়ে যাওয়া হয়েছে কারণ একটি উল্লিখিত ফিল্ড রপ্তানি হয়নি।',
    },
    index_omitted: {
        unsupported_method:
            'সূচক «{{path}}» বাদ দেওয়া হয়েছে কারণ ধরন «{{indexType}}» রপ্তানি হয় না।',
        field_not_exported:
            'সূচক «{{path}}» বাদ দেওয়া হয়েছে কারণ একটি উল্লিখিত ফিল্ড রপ্তানি হয়নি।',
    },
    comment_omitted: {
        table: '«{{path}}»-এর টেবিল মন্তব্য বাদ দেওয়া হয়েছে কারণ Drizzle 0.45-এ এই রপ্তানিকারক ব্যবহৃত কাঠামোবদ্ধ মন্তব্য API নেই।',
        column: '«{{path}}»-এর কলাম মন্তব্য বাদ দেওয়া হয়েছে কারণ Drizzle 0.45-এ এই রপ্তানিকারক ব্যবহৃত কাঠামোবদ্ধ মন্তব্য API নেই।',
    },
    check_omitted: {
        table: '«{{path}}»-এর CHECK সীমাবদ্ধতা বাদ দেওয়া হয়েছে কারণ কাঁচা SQL তৈরি TypeScript-এ ঢোকানো হয় না।',
        column: '«{{path}}»-এর CHECK বাদ দেওয়া হয়েছে কারণ কাঁচা SQL তৈরি TypeScript-এ ঢোকানো হয় না।',
    },
    set_degraded: {
        set_as_text:
            'ফিল্ড «{{path}}»-এর SET পাঠ্য হিসেবে রপ্তানি হয়; স্থানীয় SET ধরন তৈরি হয় না।',
    },
    enum_degraded: {
        ts_enum_only:
            'ফিল্ড «{{path}}»-এর enum text({ enum: [...] }) হিসেবে রপ্তানি হয়; SQLite-এ ভৌত enum সীমাবদ্ধতা নেই।',
        unsupported_enum:
            'ফিল্ড «{{path}}»-এর enum পাঠ্য হিসেবে রপ্তানি হয় কারণ এটি স্থানীয় Drizzle enum হিসেবে উপস্থাপন করা যায় না।',
        unknown_values:
            'ফিল্ড «{{path}}»-এর enum পাঠ্য হিসেবে রপ্তানি হয় কারণ enum মান অনুপস্থিত।',
    },
    type_omitted: {
        array: '«{{path}}»-এর অ্যারে ফিল্ড Drizzle রপ্তানি থেকে বাদ দেওয়া হয়েছে।',
        unsupported:
            '«{{path}}»-এর ফিল্ড বাদ দেওয়া হয়েছে কারণ তার ধরন উপস্থাপন করা যায় না।',
        unimplemented_database:
            'ডাটাবেস ধরন «{{databaseType}}»-এর জন্য ধরন ম্যাপিং বাস্তবায়িত নয়।',
    },
    type_degraded: {
        binary_as_bytea:
            'ফিল্ড «{{path}}»-এর বাইনারি ধরন bytea() হিসেবে রপ্তানি হয়।',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}»-এর ডিফল্ট বাদ দেওয়া হয়েছে (অসমর্থিত ডিফল্ট ধরন)।',
        current_timestamp_non_datetime:
            '«{{path}}»-এর ডিফল্ট বাদ দেওয়া হয়েছে (non-datetime ফিল্ডে CURRENT_TIMESTAMP)।',
        sql_expression:
            '«{{path}}»-এর ডিফল্ট বাদ দেওয়া হয়েছে (অসমর্থিত SQL অভিব্যক্তি: {{expression}})।',
        unclear:
            '«{{path}}»-এর ডিফল্ট বাদ দেওয়া হয়েছে (অস্পষ্ট ডিফল্ট: {{expression}})।',
        boolean_on_non_boolean:
            '«{{path}}»-এর ডিফল্ট বাদ দেওয়া হয়েছে (non-boolean ফিল্ডে boolean ডিফল্ট)।',
        numeric_on_non_numeric:
            '«{{path}}»-এর ডিফল্ট বাদ দেওয়া হয়েছে (অসাংখ্যিক ফিল্ডে সাংখ্যিক ডিফল্ট)।',
    },
};
