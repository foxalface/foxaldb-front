import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'تم تخطي العرض «{{path}}».',
    keyless_table_skipped:
        'تم تخطي الجدول «{{path}}» لأنه لا يحتوي على أعمدة يمكن تمثيلها بأمان.',
    keyless_table:
        'الجدول «{{path}}» بلا مفتاح أساسي ويُصدَّر كجدول Drizzle أصلي دون اختراع معرّف.',
    schema_ignored_sqlite:
        'SQLite لا يستخدم المخطط «{{schema}}»؛ يُصدَّر الجدول «{{path}}» دون مُؤهِّل مخطط.',
    mysql_catalog_omitted:
        'يُحذف كتالوج MySQL «{{catalog}}»؛ يستخدم Drizzle أسماء جداول غير مؤهَّلة واتصالاً واحدًا بقاعدة البيانات.',
    mysql_multiple_catalogs_ignored:
        'يحذف تصدير MySQL {{count}} من الكتالوجات ويُصدر أسماء جداول غير مؤهَّلة لأن الأسماء الفعلية تبقى فريدة.',
    mariadb_catalog_omitted:
        'يُحذف كتالوج MariaDB «{{catalog}}»؛ يستخدم Drizzle أسماء جداول غير مؤهَّلة واتصالاً واحدًا بقاعدة البيانات.',
    mariadb_multiple_catalogs_ignored:
        'يحذف تصدير MariaDB {{count}} من الكتالوجات ويُصدر أسماء جداول غير مؤهَّلة لأن الأسماء الفعلية تبقى فريدة.',
    mariadb_mysql_dialect_adapted:
        'يُصدَّر MariaDB باستخدام واجهات MySQL في Drizzle (اللهجة «{{dialect}}»). لا يملك Drizzle 0.45 لهجة MariaDB من الدرجة الأولى.',
    postgres_schema_qualified:
        'يُصدَّر مخطط PostgreSQL «{{schema}}» باستخدام pgSchema().',
    uuid_as_text:
        'يُصدَّر حقل UUID «{{path}}» كنص لأن قاعدة البيانات هذه لا تملك نوع UUID أصليًا في Drizzle 0.45.',
    increment_omitted:
        'تم حذف الزيادة التلقائية على «{{path}}» لأنها لا يمكن تمثيلها بأمان.',
    set_null_omitted:
        'تم حذف ON DELETE SET NULL على «{{path}}» لأن عمود مفتاح خارجي هو NOT NULL.',
    sqlite_boolean_integer:
        'يُصدَّر الحقل المنطقي «{{path}}» كـ integer({ mode: "boolean" }) لأن SQLite لا يملك نوعًا منطقيًا أصليًا.',
    sqlite_json_text:
        'يُصدَّر حقل JSON «{{path}}» كـ text({ mode: "json" }) لأن SQLite يخزّن JSON كنص TEXT.',
    table_name_adjusted: {
        table: 'يُصدَّر الجدول «{{path}}» كثابت TypeScript {{tsName}}. يُحافظ على اسم الجدول الفعلي.',
        pgEnum: 'يُصدَّر تعداد PostgreSQL «{{path}}» كثابت TypeScript {{tsName}}. يُحافظ على اسم التعداد الفعلي.',
        pgSchema:
            'يُصدَّر مخطط PostgreSQL «{{path}}» كثابت TypeScript {{tsName}}.',
    },
    table_name_collision:
        'خُصِّص ثابت الجدول «{{tsName}}» لـ «{{path}}» لتجنب معرّف TypeScript مكرر.',
    column_name_adjusted:
        'يُصدَّر العمود «{{path}}» كخاصية TypeScript {{tsName}}. يُحافظ على اسم العمود الفعلي.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'تم تخطي المفتاح الخارجي المركّب «{{path}}» لأن قائمتي أعمدة المصدر والهدف لم تكونا موجودتين معًا.',
        composite_fk_arity_mismatch:
            'تم تخطي المفتاح الخارجي المركّب «{{path}}» لأن عدد أعمدة المصدر والهدف مختلف.',
        label_only:
            'تم تخطي العلاقة متعدد-إلى-متعدد «{{path}}» لأنه لا يمكن تحديد جدول ربط فعلي من التسمية.',
        table_not_exported:
            'تم تخطي العلاقة «{{path}}» لأن جدولًا مُشارًا إليه لم يُصدَّر.',
        unresolved_member:
            'تم تخطي العلاقة «{{path}}» لأن حقلًا مُشارًا إليه لم يُصدَّر.',
    },
    index_omitted: {
        unsupported_method:
            'تم حذف الفهرس «{{path}}» لأن النوع «{{indexType}}» لا يُصدَّر.',
        field_not_exported:
            'تم حذف الفهرس «{{path}}» لأن حقلًا مُشارًا إليه لم يُصدَّر.',
    },
    comment_omitted: {
        table: 'يُحذف تعليق الجدول على «{{path}}» لأن Drizzle 0.45 لا يملك واجهة تعليقات منظَّمة يستخدمها هذا المُصدِّر.',
        column: 'يُحذف تعليق العمود على «{{path}}» لأن Drizzle 0.45 لا يملك واجهة تعليقات منظَّمة يستخدمها هذا المُصدِّر.',
    },
    check_omitted: {
        table: 'يُحذف قيد CHECK على «{{path}}» لأن SQL الخام لا يُحقَن في TypeScript المُنشأ.',
        column: 'يُحذف CHECK على «{{path}}» لأن SQL الخام لا يُحقَن في TypeScript المُنشأ.',
    },
    set_degraded: {
        set_as_text:
            'يُصدَّر SET للحقل «{{path}}» كنص؛ لا تُنشأ أنواع SET أصلية.',
    },
    enum_degraded: {
        ts_enum_only:
            'يُصدَّر تعداد الحقل «{{path}}» كـ text({ enum: [...] })؛ لا يملك SQLite قيد تعداد فعلي.',
        unsupported_enum:
            'يُصدَّر تعداد الحقل «{{path}}» كنص لأنه لا يمكن تمثيله كتعداد Drizzle أصلي.',
        unknown_values:
            'يُصدَّر تعداد الحقل «{{path}}» كنص لأن قيم التعداد مفقودة.',
    },
    type_omitted: {
        array: 'يُحذف حقل المصفوفة على «{{path}}» من تصدير Drizzle.',
        unsupported: 'تم حذف الحقل على «{{path}}» لأن نوعه لا يمكن تمثيله.',
        unimplemented_database:
            'تعيين الأنواع غير مُنفَّذ لنوع قاعدة البيانات «{{databaseType}}».',
    },
    type_degraded: {
        binary_as_bytea: 'يُصدَّر النوع الثنائي للحقل «{{path}}» كـ bytea().',
    },
    default_omitted: {
        unsupported_type:
            'تم حذف القيمة الافتراضية على «{{path}}» (نوع افتراضي غير مدعوم).',
        current_timestamp_non_datetime:
            'تم حذف القيمة الافتراضية على «{{path}}» (CURRENT_TIMESTAMP على حقل غير datetime).',
        sql_expression:
            'تم حذف القيمة الافتراضية على «{{path}}» (تعبير SQL غير مدعوم: {{expression}}).',
        unclear:
            'تم حذف القيمة الافتراضية على «{{path}}» (قيمة افتراضية غير واضحة: {{expression}}).',
        boolean_on_non_boolean:
            'تم حذف القيمة الافتراضية على «{{path}}» (قيمة منطقية على حقل غير منطقي).',
        numeric_on_non_numeric:
            'تم حذف القيمة الافتراضية على «{{path}}» (قيمة رقمية على حقل غير رقمي).',
    },
};
