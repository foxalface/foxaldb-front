import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'تم تخطي العرض «{{path}}».',
    keyless_table_skipped:
        'تم تخطي الجدول "{{path}}" لأنه لا يمكن تمثيله كـ SQL خاص بقاعدة البيانات فقط دون اختراع مفتاح أساسي.',
    keyless_table_sql_created:
        'يُنشأ الجدول الفعلي "{{path}}" عبر SQL خاص بقاعدة البيانات فقط لأن Django لا يستطيع نمذجة جدول بلا مفتاح أساسي دون تغيير مخططه.',
    keyless_model_omitted:
        'لا يُنشأ نموذج Django ORM للجدول "{{path}}" لأن Django يتطلب مفتاحًا أساسيًا.',
    schema_ignored_sqlite:
        'SQLite لا يستخدم المخطط «{{schema}}»؛ يُصدَّر الجدول «{{path}}» بدون مُحدِّد مخطط.',
    mysql_catalog_omitted:
        'تم حذف كتالوج MySQL «{{catalog}}»؛ Django يستخدم قاعدة البيانات المتصلة وأسماء جداول غير مُحدَّدة.',
    mysql_multiple_catalogs_ignored:
        'تصدير MySQL يحذف {{count}} كتالوج ويُصدِر أسماء جداول غير مُحدَّدة لأن الأسماء الفعلية تبقى فريدة.',
    mariadb_catalog_omitted:
        'تم حذف كتالوج MariaDB «{{catalog}}»؛ Django يستخدم قاعدة البيانات المتصلة وأسماء جداول غير مُحدَّدة.',
    mariadb_multiple_catalogs_ignored:
        'تصدير MariaDB يحذف {{count}} كتالوج ويُصدِر أسماء جداول غير مُحدَّدة لأن الأسماء الفعلية تبقى فريدة.',
    postgres_schema_qualified_db_table:
        'يُصدَّر جدول PostgreSQL «{{path}}» مع db_table مُحدَّد بالمخطط «{{schema}}».',
    composite_fk_unsupported:
        'لم يُصدَّر المفتاح الأجنبي المركّب «{{path}}»؛ تبقى الأعمدة الأعضاء قيمًا عددية.',
    many_to_many_skipped:
        'تم تخطي علاقة many-to-many «{{path}}»؛ لا يُنشأ جدول ربط من تسمية فقط.',
    one_to_one_degraded_non_unique_fk:
        'تُصدَّر علاقة one-to-one على «{{path}}» كـ ForeignKey لأن المفتاح الأجنبي غير فريد.',
    model_name_adjusted:
        'تم تخصيص فئة النموذج للجدول «{{path}}» كـ {{className}}.',
    model_name_collision:
        'تم تخصيص فئة النموذج «{{className}}» للجدول «{{path}}» لتجنب تكرار اسم الفئة.',
    field_name_adjusted:
        'يُصدَّر الحقل «{{path}}» كسمة Python {{attributeName}} مع db_column «{{dbColumn}}».',
    related_name_adjusted:
        'تم تخصيص related_name على «{{path}}» كـ {{relatedName}} لتجنب تعارض المُوصِّل العكسي.',
    composite_primary_key:
        'يُصدَّر الجدول «{{path}}» مع CompositePrimaryKey في Django 6.1 باستخدام السمات {{attributes}}.',
    on_update_omitted:
        'تم حذف ON UPDATE «{{action}}» على «{{path}}»؛ ليس لـ ForeignKey مكافئ ON UPDATE في قاعدة البيانات.',
    on_delete_restrict_degraded:
        'يُصدَّر ON DELETE RESTRICT على «{{path}}» كـ models.DO_NOTHING؛ لا تُستخدم دلالات جامع RESTRICT/PROTECT في Django.',
    set_null_omitted: {
        delete: 'تم حذف ON DELETE SET NULL على «{{path}}» لأن المفتاح الأجنبي غير nullable؛ يُستخدم models.DO_NOTHING.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'لم يُنشأ ManyToManyField الملائم لجدول الربط «{{path}}» لوجود أعمدة بيانات إضافية.',
        ambiguous:
            'لم يُنشأ ManyToManyField الملائم لجدول الربط «{{path}}» لأن نموذج الطرف غامض.',
    },
    relationship_skipped: {
        table_not_exported: 'تم تخطي العلاقة «{{path}}» لأن جدولًا لم يُصدَّر.',
        field_not_exported:
            'تم تخطي العلاقة «{{path}}» لأن حقلًا مُشارًا إليه لم يُصدَّر.',
        already_relational:
            'تم تخطي العلاقة «{{path}}» لأن الحقل المالك علاقة بالفعل.',
        primary_key_fk:
            'تم تخطي العلاقة «{{path}}» لأن العمود المالك جزء من المفتاح الأساسي.',
        unsupported_target_field:
            'تم تخطي العلاقة «{{path}}» لأن الحقل المستهدف ليس هدف Django فريدًا.',
        keyless_target:
            'تم تخطي العلاقة "{{path}}" لأنها تستهدف جدولًا بلا مفتاح وليس له نموذج Django.',
    },
    index_omitted: {
        unsupported_type:
            'تم حذف الفهرس «{{path}}» لأن النوع «{{indexType}}» لا يُصدَّر كـ models.Index.',
        field_not_exported:
            'تم حذف الفهرس «{{path}}» لأن حقلًا مُشارًا إليه لم يُصدَّر.',
        unsafe_name:
            'تم حذف الفهرس «{{path}}» لأن اسمه الصريح لا يمكن تمثيله بأمان في Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'تم تكييف اسم الفهرس «{{originalName}}» إلى «{{allocatedName}}» لاستيفاء قيود تسمية Django.',
        name_collision:
            'تم تكييف اسم الفهرس «{{originalName}}» إلى «{{allocatedName}}» لتجنب اسم فهرس Django مكرر.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'تم تكييف اسم قيد التفرّد «{{originalName}}» إلى «{{allocatedName}}» لاستيفاء قيود تسمية Django.',
        name_collision:
            'تم تكييف اسم قيد التفرّد «{{originalName}}» إلى «{{allocatedName}}» لتجنب اسم قيد Django مكرر.',
    },
    comment_omitted: {
        table: 'تم حذف تعليق الجدول على «{{path}}» لأن SQLite لا يحفظ التعليقات.',
        column: 'تم حذف تعليق العمود على «{{path}}» لأن SQLite لا يحفظ التعليقات.',
    },
    check_omitted: {
        table: 'تم حذف قيد CHECK على «{{path}}» لأن SQL تعسفيًا لا يمكن تحويله إلى تعبير Django 6.1.',
        column: 'تم حذف CHECK على «{{path}}» لأن SQL تعسفيًا لا يمكن تحويله إلى تعبير Django 6.1.',
    },
    set_degraded: {
        set_as_text:
            'يُصدَّر SET للحقل «{{path}}» كحقل أحرف؛ لا تُنشأ أنواع SET الأصلية.',
    },
    enum_degraded: {
        enum_as_text:
            'يُصدَّر enum للحقل «{{path}}» كحقل أحرف؛ لا تُنشأ Django TextChoices.',
    },
    type_omitted: {
        array: 'حقل المصفوفة على «{{path}}» محذوف من تصدير Django.',
        spatial: 'الحقل المكاني على «{{path}}» محذوف من تصدير Django.',
        tsvector: 'حقل tsvector على «{{path}}» محذوف من تصدير Django.',
        xml: 'حقل XML على «{{path}}» محذوف من تصدير Django.',
        unsupported: 'تم حذف الحقل «{{path}}» لأن نوعه لا يمكن تمثيله.',
        unimplemented_database:
            'تعيين الأنواع غير مُنفَّذ لنوع قاعدة البيانات «{{databaseType}}».',
        decimal_precision_required:
            'تم حذف حقل decimal على «{{path}}» لأن DecimalField في MySQL/MariaDB يتطلب max_digits و decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'يُصدَّر نوع الأحرف للحقل «{{path}}» كـ {{mappedField}} لأن max_length مفقود.',
    },
    default_omitted: {
        unsupported_type:
            'تم حذف القيمة الافتراضية على «{{path}}» (نوع افتراضي غير مدعوم).',
        current_timestamp_non_datetime:
            'تم حذف القيمة الافتراضية على «{{path}}» (CURRENT_TIMESTAMP على حقل ليس datetime).',
        uuid_function_non_pg:
            'تم حذف القيمة الافتراضية على «{{path}}» (دالة UUID على حقل UUID ليس PostgreSQL).',
        sql_expression:
            'تم حذف القيمة الافتراضية على «{{path}}» (تعبير SQL غير مدعوم: {{expression}}).',
        unclear:
            'تم حذف القيمة الافتراضية على «{{path}}» (افتراضي غير واضح: {{expression}}).',
        boolean_on_non_boolean:
            'تم حذف القيمة الافتراضية على «{{path}}» (افتراضي boolean على حقل ليس boolean).',
        numeric_on_non_numeric:
            'تم حذف القيمة الافتراضية على «{{path}}» (افتراضي رقمي على حقل ليس رقميًا).',
    },
};
