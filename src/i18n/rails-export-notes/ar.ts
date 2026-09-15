import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'تم تخطي العرض "{{path}}".',
    schema_ignored_sqlite:
        'لا يستخدم SQLite المخطط "{{schema}}"; تم تصدير الجدول "{{path}}" بدون مؤهل مخطط.',
    mysql_catalog_omitted:
        'تم حذف كتالوج MySQL "{{catalog}}"; يستخدم Rails قاعدة البيانات المتصلة وأسماء جداول غير مؤهلة.',
    mysql_multiple_catalogs_ignored:
        'يحذف تصدير MySQL {{count}} كتالوجات ويُصدِر أسماء جداول غير مؤهلة لأن الأسماء الفعلية تبقى فريدة.',
    mariadb_catalog_omitted:
        'تم حذف كتالوج MariaDB "{{catalog}}"; يستخدم Rails قاعدة البيانات المتصلة وأسماء جداول غير مؤهلة.',
    mariadb_multiple_catalogs_ignored:
        'يحذف تصدير MariaDB {{count}} كتالوجات ويُصدِر أسماء جداول غير مؤهلة لأن الأسماء الفعلية تبقى فريدة.',
    composite_fk_unsupported:
        'لم يتم تصدير المفتاح الخارجي المركب "{{path}}"; يُصدِر Rails V1 فقط مفاتيح خارجية آمنة لعمود واحد.',
    keyless_relationship_skipped:
        'تم تخطي العلاقة "{{path}}" لأن الجدول الرئيسي لا يمكنه دعم دلالات المفتاح الخارجي.',
    many_to_many_skipped:
        'تم تخطي علاقة many-to-many "{{path}}"; لم يمكن استنتاج جانب مفتاح خارجي واحد من التسمية.',
    keyless_model:
        'الجدول "{{path}}" لا يحتوي على primary key. يضبط النموذج self.primary_key = nil; قد تكون استمرارية Active Record محدودة.',
    one_to_one_degraded_non_unique_fk:
        'تم تصدير علاقة one-to-one على "{{path}}" كـ has_many لأن المفتاح الخارجي غير فريد.',
    many_to_many_through_skipped:
        'لم يتم إنشاء has_many :through لجدول الربط "{{path}}" لأن أسماء association كانت غامضة.',
    model_name_adjusted:
        'تم تخصيص فئة النموذج للجدول "{{path}}" كـ {{className}}.',
    model_name_collision:
        'تم تخصيص فئة النموذج {{className}} للجدول "{{path}}" لتجنب ثابت مكرر.',
    on_update_omitted:
        'لا يُمثَّل ON UPDATE "{{action}}" في schema.rb add_foreign_key لـ Rails 8.1 لـ "{{path}}".',
    set_null_omitted: {
        delete: 'تم حذف ON DELETE SET NULL على "{{path}}" لأن عمود المفتاح الخارجي غير nullable.',
        update: 'تم حذف ON UPDATE SET NULL على "{{path}}" لأن عمود المفتاح الخارجي غير nullable.',
    },
    association_name_adjusted: {
        belongs_to:
            'تم تخصيص belongs_to على "{{path}}" كـ {{associationName}} لتجنب تعارض الأسماء.',
        inverse:
            'تم تخصيص association العكسي على "{{path}}" كـ {{associationName}} لتجنب تعارض الأسماء.',
    },
    relationship_skipped: {
        table_not_exported: 'تم تخطي العلاقة "{{path}}" لأن جدولاً لم يُصدَّر.',
        unresolved_field_ids:
            'تم تخطي العلاقة "{{path}}" لأن معرفات حقول المفتاح الخارجي لم يمكن حلها.',
        referenced_column_not_exported:
            'تم تخطي العلاقة "{{path}}" لأن عموداً مُشاراً إليه لم يُصدَّر.',
    },
    index_omitted: {
        unsupported_type:
            'تم حذف الفهرس "{{path}}" لأن النوع "{{indexType}}" لا يُصدَّر في schema.rb لـ Rails.',
        missing_field: 'تم حذف الفهرس "{{path}}" لأن حقلاً مُشاراً إليه مفقود.',
        field_not_exported:
            'تم حذف الفهرس "{{path}}" لأن حقلاً مُشاراً إليه لم يُصدَّر.',
    },
    comment_omitted: {
        table: 'تم حذف تعليق الجدول على "{{path}}" لأن SQLite لا يحفظ التعليقات.',
        column: 'تم حذف تعليق العمود على "{{path}}" لأن SQLite لا يحفظ التعليقات.',
    },
    check_omitted: {
        table: 'تم حذف قيد check الفارغ على "{{path}}".',
        column: 'تم حذف check الفارغ على "{{path}}".',
    },
    set_degraded: {
        sqlite_as_string:
            'تم تصدير حقل set على "{{path}}" كـ string لـ SQLite.',
        mysql_family_as_string:
            'تم تصدير حقل set على "{{path}}" كـ string; لم يُصدَر DSL SET الأصلي.',
    },
    enum_degraded: {
        sqlite_as_string:
            'تم تصدير حقل enum على "{{path}}" كـ string لـ SQLite.',
        pg_type_values_missing:
            'لم يُصرَّح بـ enum PostgreSQL "{{path}}" لأن القيم المعيارية مفقودة.',
        pg_field_values_missing:
            'تم تصدير حقل "{{path}}" enum PostgreSQL كـ string لأن قيم enum المعيارية مفقودة.',
        pg_field_named_values_missing:
            'تم تصدير حقل "{{path}}" enum PostgreSQL "{{enumName}}" كـ string لأن قيم enum مفقودة.',
        mysql_family_as_string:
            'تم تصدير حقل enum على "{{path}}" كـ string; لم يُصدَر DSL enum/set الأصلي.',
    },
    type_omitted: {
        array: 'حقل array على "{{path}}" غير مُمثَّل في schema.rb لـ Rails.',
        spatial:
            'حقل spatial على "{{path}}" غير مُمثَّل في schema.rb لـ Rails.',
        unsupported: 'تم حذف الحقل على "{{path}}" لأن نوعه لا يمكن تمثيله.',
        unimplemented_database:
            'تعيين النوع غير مُنفَّذ لنوع قاعدة البيانات "{{databaseType}}".',
    },
    type_degraded: {
        serial_no_sequence:
            'تم تصدير حقل serial غير primary key على "{{path}}" كـ integer عادي بدون sequence.',
        jsonb_as_json: 'تم تصدير حقل "{{path}}" jsonb كـ json.',
        uuid_as_string: 'تم تصدير حقل "{{path}}" uuid كـ string(36).',
        null_as_text: 'تم تصدير حقل "{{path}}" بفئة تخزين null كـ text.',
        money_as_decimal: 'تم تصدير حقل "{{path}}" money كـ decimal.',
        year_as_integer: 'تم تصدير حقل "{{path}}" year كـ integer.',
        bit_as_boolean: 'تم تصدير حقل "{{path}}" bit كـ boolean.',
        type_as_string:
            'تم تصدير حقل "{{path}}" من النوع "{{sourceType}}" كـ {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'تم حذف القيمة الافتراضية على "{{path}}" (تعبير SQL يشبه lambda: {{expression}}).',
        sql_expression:
            'تم حذف القيمة الافتراضية على "{{path}}" (تعبير SQL غير مدعوم: {{expression}}).',
        unclear:
            'تم حذف القيمة الافتراضية على "{{path}}" (قيمة افتراضية غير واضحة: {{expression}}).',
        current_timestamp_non_datetime:
            'تم حذف القيمة الافتراضية على "{{path}}" (CURRENT_TIMESTAMP على حقل غير datetime).',
        uuid_function_non_pg:
            'تم حذف القيمة الافتراضية على "{{path}}" (قيمة افتراضية بدالة UUID على حقل UUID غير PostgreSQL).',
        boolean_on_non_boolean:
            'تم حذف القيمة الافتراضية على "{{path}}" (قيمة افتراضية boolean على حقل غير boolean).',
        numeric_on_non_numeric:
            'تم حذف القيمة الافتراضية على "{{path}}" (قيمة افتراضية رقمية على حقل غير رقمي).',
        unsupported_type:
            'تم حذف القيمة الافتراضية على "{{path}}" (نوع قيمة افتراضية غير مدعوم).',
    },
};
