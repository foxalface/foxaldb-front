import type { LanguageMetadata, LanguageTranslation } from '../types';

export const ar: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'جديد',
            browse: 'فتح',
            tables: 'الجداول',
            refs: 'المراجع',
            dependencies: 'التبعيات',
            custom_types: 'الأنواع المخصصة',
            conversations: 'المحادثات',
            conversations_unread_aria:
                '{{count}} رسائل غير مقروءة في المحادثات',
            visuals: 'مرئيات',
            activities: 'النشاط',
            share: 'مشاركة',
        },
        menu: {
            actions: {
                actions: 'الإجراءات',
                new: 'جديد...',
                browse: 'جميع قواعد البيانات...',
                save: 'حفظ',
                import: 'استيراد قاعدة بيانات',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'SQL تصدير',
                export_as: 'تصدير كـ',
                delete_diagram: 'حذف',
            },
            edit: {
                edit: 'تحرير',
                undo: 'تراجع',
                redo: 'إعادة',
                clear: 'مسح',
            },
            view: {
                view: 'عرض',
                show_sidebar: 'إظهار الشريط الجانبي',
                hide_sidebar: 'إخفاء الشريط الجانبي',
                hide_cardinality: 'إخفاء الكاردينالية',
                show_cardinality: 'إظهار الكاردينالية',
                hide_field_attributes: 'إخفاء خصائص الحقل',
                show_field_attributes: 'إظهار خصائص الحقل',
                zoom_on_scroll: 'تكبير/تصغير عند التمرير',
                show_views: 'عروض قاعدة البيانات',
                theme: 'المظهر',
                show_dependencies: 'إظهار الاعتمادات',
                hide_dependencies: 'إخفاء الاعتمادات',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: 'النسخ الاحتياطي',
                export_diagram: 'تصدير المخطط',
                restore_diagram: 'استعادة المخطط',
            },
            help: {
                help: 'مساعدة',
                docs_website: 'الوثائق',
                join_discord: 'انضم إلينا على Discord',
            },
        },

        delete_diagram_alert: {
            title: 'اختر قاعدة البيانات',
            description: 'حدد نظام قاعدة البيانات للمخطط الجديد.',
            cancel: 'إلغاء',
            delete: 'حذف',
        },

        clear_diagram_alert: {
            title: 'مسح الرسم البياني',
            description:
                '.لا يمكن التراجع عن هذا الاجراء. سيتم حذف جميع البيانات في الرسم البياني بشكل دائم',
            cancel: 'إلغاء',
            clear: 'مسح',
        },

        diagram_access: {
            removed: {
                title: 'اختر قاعدة البيانات',
                description: 'حدد نظام قاعدة البيانات للمخطط الجديد.',
            },
            role_changed_viewer: {
                title: 'View-only access',
                description:
                    'Your role on this diagram was changed to viewer. Editing is now disabled.',
            },
            role_changed_editor: {
                title: 'Edit access granted',
                description:
                    'Your role on this diagram was changed to editor. You can edit again.',
            },
        },

        reorder_diagram_alert: {
            title: 'ترتيب تلقائي للرسم البياني',
            description:
                'هذا الإجراء سيقوم بإعادة ترتيب الجداول في المخطط بشكل تلقائي. هل تريد المتابعة؟',
            reorder: 'ترتيب تلقائي',
            cancel: 'إلغاء',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'فشل النسخ',
                description: '.الحافظة غير مدعومة',
            },
            failed: {
                title: 'فشل النسخ',
                description: 'حدث خطأ أثناء النسخ. حاول مجدداً',
            },
        },

        theme: {
            system: 'النظام',
            light: 'فاتح',
            dark: 'داكن',
        },

        zoom: {
            on: 'تشغيل',
            off: 'إيقاف',
        },

        last_saved: 'آخر حفظ',
        saved: 'تم الحفظ',
        loading_diagram: '...جارِ تحميل الرسم البياني',
        deselect_all: 'إلغاء تحديد الكل',
        select_all: 'تحديد الكل',
        delete: 'حذف',
        clear: 'مسح',
        show_more: 'عرض المزيد',
        show_less: 'عرض أقل',
        copy_to_clipboard: 'نسخ إلى الحافظة',
        copied: '!تم النسخ',

        side_panel: {
            view_all_options: '...عرض جميع الخيارات',
            tables_section: {
                tables: 'الجداول',
                add_table: 'إضافة جدول',
                add_view: 'إضافة عرض',
                filter: 'تصفية',
                collapse: 'طي الكل',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'جميع الجداول مخفية',
                show_all: 'عرض الكل',

                table: {
                    fields: 'الحقول',
                    nullable: 'يمكن ان يكون فارغاً؟',
                    primary_key: 'المفتاح الأساسي',
                    indexes: 'الفهارس',
                    check_constraints: 'قيود التحقق',
                    comments: 'تعليقات',
                    no_comments: 'لا توجد تعليقات',
                    add_field: 'إضافة حقل',
                    add_index: 'إضافة فهرس',
                    add_check: 'إضافة تحقق',
                    index_select_fields: 'حدد الحقول',
                    no_types_found: 'لا يوجد أنواع',
                    field_name: 'الإسم',
                    field_type: 'النوع',
                    field_actions: {
                        title: 'خصائص الحقل',
                        open_discussion: 'فتح المحادثة',
                        unique: 'فريد',
                        auto_increment: 'زيادة تلقائية',
                        comments: 'تعليقات',
                        no_comments: 'لا يوجد تعليقات',
                        delete_field: 'حذف الحقل',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'الدقة',
                        scale: 'النطاق',
                        default_value: 'Default Value',
                        no_default: 'No default',
                    },
                    index_actions: {
                        title: 'خصائص الفهرس',
                        name: 'الإسم',
                        unique: 'فريد',
                        index_type: 'نوع الفهرس',
                        delete_index: 'حذف الفهرس',
                    },
                    check_constraint_actions: {
                        title: 'قيد التحقق',
                        expression: 'التعبير',
                        delete: 'حذف قيد التحقق',
                    },
                    table_actions: {
                        title: 'إجراءات الجدول',
                        open_discussion: 'فتح المحادثة',
                        change_schema: 'تغيير المخطط',
                        add_field: 'إضافة حقل',
                        add_index: 'إضافة فهرس',
                        duplicate_table: 'نسخ الجدول',
                        delete_table: 'حذف الجدول',
                    },
                },
                empty_state: {
                    title: 'لا توجد جداول',
                    description: 'أنشئ جدولاً للبدء',
                },
            },
            refs_section: {
                refs: 'المراجع',
                filter: 'تصفية',
                clear: 'مسح التصفية',
                no_results: 'لم يتم العثور على مراجع مطابقة للتصفية.',
                collapse: 'طي الكل',
                add_relationship: 'إضافة علاقة',
                relationships: 'العلاقات',
                dependencies: 'الاعتمادات',
                relationship: {
                    relationship: 'العلاقة',
                    primary: 'الجدول الأساسي',
                    foreign: 'الجدول المرتبط',
                    cardinality: 'الكاردينالية',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'حذف',
                    switch_tables: 'تبديل الجداول',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'إجراءات',
                        open_discussion: 'فتح المحادثة',
                        delete_relationship: 'حذف',
                    },
                },
                dependency: {
                    dependency: 'الاعتماد',
                    table: 'الجدول',
                    dependent_table: 'عرض الاعتمادات',
                    delete_dependency: 'حذف',
                    dependency_actions: {
                        title: 'إجراءات',
                        delete_dependency: 'حذف',
                    },
                },
                empty_state: {
                    title: 'لا توجد علاقات',
                    description: 'إنشاء علاقة للبدء',
                },
            },

            areas_section: {
                areas: 'المناطق',
                add_area: 'إضافة منطقة',
                filter: 'تصفية',
                clear: 'مسح التصفية',
                no_results: 'لم يتم العثور على مناطق مطابقة للتصفية.',

                area: {
                    area_actions: {
                        title: 'إجراءات المنطقة',
                        edit_name: 'تحرير الاسم',
                        delete_area: 'حذف المنطقة',
                    },
                },
                empty_state: {
                    title: 'لا توجد مناطق',
                    description: 'أنشئ منطقة للبدء',
                },
            },

            visuals_section: {
                visuals: 'مرئيات',
                tabs: {
                    areas: 'المناطق',
                    notes: 'ملاحظات',
                },
            },

            notes_section: {
                filter: 'تصفية',
                add_note: 'إضافة ملاحظة',
                no_results: 'لم يتم العثور على ملاحظات',
                clear: 'مسح التصفية',
                empty_state: {
                    title: 'لا توجد ملاحظات',
                    description: 'أنشئ ملاحظة لإضافة تعليقات نصية على اللوحة',
                },
                note: {
                    empty_note: 'ملاحظة فارغة',
                    note_actions: {
                        title: 'إجراءات الملاحظة',
                        edit_content: 'تحرير المحتوى',
                        delete_note: 'حذف الملاحظة',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'الأنواع المخصصة',
                filter: 'تصفية',
                clear: 'مسح التصفية',
                no_results: 'لم يتم العثور على أنواع مخصصة مطابقة للتصفية.',
                new_type: 'نوع جديد',
                empty_state: {
                    title: 'لا توجد أنواع مخصصة',
                    description:
                        'ستظهر الأنواع المخصصة هنا عندما تكون متاحة في قاعدة البيانات الخاصة بك',
                },
                custom_type: {
                    kind: 'النوع',
                    enum_values: 'قيم التعداد',
                    composite_fields: 'الحقول',
                    no_fields: 'لم يتم تحديد حقول',
                    no_values: 'لم يتم تحديد قيم التعداد',
                    field_name_placeholder: 'اسم الحقل',
                    field_type_placeholder: 'اختر النوع',
                    add_field: 'إضافة حقل',
                    no_fields_tooltip: 'لم يتم تحديد حقول لهذا النوع المخصص',
                    custom_type_actions: {
                        title: 'إجراءات',
                        highlight_fields: 'تمييز الحقول',
                        delete_custom_type: 'حذف',
                        clear_field_highlight: 'إزالة التمييز',
                    },
                    delete_custom_type: 'حذف النوع',
                },
            },
            conversations_section: {
                title: 'المحادثات',
                tabs_label: 'المحادثات',
                tabs: {
                    active: 'نشطة',
                    archives: 'مؤرشفة',
                },
                loading: 'جارٍ تحميل المحادثات…',
                filter: 'تصفية',
                clear: 'مسح التصفية',
                no_results_title: 'لا توجد نتائج',
                no_results_description:
                    'لم يتم العثور على محادثات تطابق التصفية.',

                type_filter: {
                    trigger: 'النوع',
                    label: 'تصفية حسب النوع',
                    trigger_aria: 'تصفية حسب نوع المحادثة',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'إعادة المحاولة',
                dismiss: 'Dismiss',
                read_only: 'للقراءة فقط',
                deleted_user: 'مستخدم محذوف',
                unread: {
                    badge_aria: '{{count}} رسائل غير مقروءة',
                },
                inactive: {
                    title: 'المحادثات unavailable',
                    description:
                        'المحادثات are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'لا توجد محادثة',
                    active_description: 'أنشئ محادثة للبدء',
                    archives_title: 'No archived المحادثات',
                    archives_description:
                        'Archived المحادثات will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load المحادثات',
                    load_description:
                        'Something went wrong while loading المحادثات. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'فتح المحادثة',
                    start: 'بدء محادثة',
                    pending: 'جارٍ بدء المحادثة…',
                    diagram_name: 'المخطط',
                    open_aria: 'فتح المحادثة لـ {{name}}',
                    start_aria: 'بدء محادثة لـ {{name}}',
                    open_tooltip: 'فتح المحادثة لـ {{name}}',
                    start_tooltip: 'بدء محادثة لـ {{name}}',
                    pending_tooltip: 'جارٍ بدء المحادثة لـ {{name}}…',
                    action_tooltip: 'محادثة',
                    unavailable_description:
                        'لا يمكنك بدء محادثات على هذا المخطط.',
                    errors: {
                        validation: 'هذا الهدف غير صالح لمحادثة.',
                        forbidden: 'ليس لديك إذن لبدء هذه المحادثة.',
                        not_found: 'هذا الهدف لم يعد متاحًا على المخطط.',
                        conflict:
                            'تعذر بدء هذه المحادثة الآن. يرجى المحاولة مرة أخرى.',
                        generic:
                            'تعذر فتح هذه المحادثة. يرجى المحاولة مرة أخرى.',
                    },
                },
                actions: {
                    archive: 'Archive',
                    archiving: 'Archiving…',
                    reopen: 'Reopen',
                    reopening: 'Reopening…',
                    archive_aria: 'Archive conversation for {{target}}',
                    reopen_aria: 'Reopen conversation for {{target}}',
                },
                summary: {
                    message_count: '{{count}} رسائل',
                    no_messages: 'لا توجد رسائل بعد',
                    last_activity: 'آخر نشاط',
                    open_aria: 'فتح المحادثة لـ {{target}}',
                    focus_target_aria: 'عرض {{target}} على المخطط',
                    author_tooltip: 'آخر رسالة من {{name}}',
                    author_missing_tooltip: 'لا توجد معلومات عن المؤلف',
                    actions: {
                        menu_aria: 'خيارات المحادثة',
                        open: 'فتح',
                        delete: 'حذف',
                    },
                    delete_dialog: {
                        title: 'حذف المحادثة؟',
                        description:
                            'سيؤدي هذا إلى حذف هذه المحادثة وجميع رسائلها نهائيًا.',
                        cancel: 'إلغاء',
                        confirm: 'حذف',
                        deleting: 'جارٍ الحذف…',
                        errors: {
                            delete_failed:
                                'تعذر حذف هذه المحادثة. يرجى المحاولة مرة أخرى.',
                            forbidden: 'ليس لديك إذن لحذف هذه المحادثة.',
                            not_found: 'لم تعد هذه المحادثة متاحة.',
                        },
                    },
                },
                detail: {
                    back: 'رجوع',
                    back_aria: 'العودة إلى قائمة المحادثات',
                    loading: 'جارٍ تحميل الرسائل…',
                    loading_more: 'جارٍ تحميل الرسائل الأقدم…',
                    load_older: 'تحميل الرسائل الأقدم',
                    new_messages_badge_one: 'رسالة جديدة واحدة',
                    new_messages_badge_other: '{{count}} رسائل جديدة',
                    new_messages_badge_label_one: 'رسالة جديدة',
                    new_messages_badge_label_other: 'رسائل جديدة',
                    new_messages_badge_aria_one: 'الانتقال إلى الرسالة الجديدة',
                    new_messages_badge_aria_other:
                        'الانتقال إلى {{count}} رسائل جديدة',
                    empty: {
                        title: 'لا توجد رسائل',
                        description: 'لا تحتوي هذه المحادثة على أي رسائل.',
                    },
                    errors: {
                        load_title: 'تعذر تحميل الرسائل',
                        load_description:
                            'حدث خطأ أثناء تحميل الرسائل. يرجى المحاولة مرة أخرى.',
                    },
                    archive_banner: {
                        title: 'محادثة مؤرشفة',
                        description:
                            'هذه المحادثة للقراءة فقط. لا يمكن إضافة الرسائل أو تعديلها أو حذفها.',
                    },
                    metadata: {
                        status_label: 'الحالة',
                        status_active: 'نشطة',
                        status_archived: 'مؤرشفة',
                        message_count_label: 'عدد الرسائل',
                        message_count: '{{count}} رسائل',
                    },
                    message: {
                        edited: '(معدّل)',
                        edited_aria: 'تم تعديل الرسالة',
                        day_separator: {
                            today: 'اليوم',
                            yesterday: 'أمس',
                        },
                        actions: {
                            title: 'إجراءات الرسالة',
                            edit: 'تعديل',
                            delete: 'حذف',
                        },
                        reactions: {
                            add_aria: 'إضافة تفاعل',
                            add_tooltip: 'إضافة تفاعل',
                            picker_loading:
                                'جارٍ تحميل منتقي الرموز التعبيرية…',
                            picker_aria_label: 'منتقي الرموز التعبيرية',
                            picker_search_placeholder: 'ابحث عن رمز تعبيري…',
                            picker_empty: 'لم يتم العثور على رموز تعبيرية.',
                            chip_aria: 'تفاعل {{emoji}}، {{count}}',
                            preview_and_others_one: 'و{{count}} آخر',
                            preview_and_others_other: 'و{{count}} آخرين',
                            errors: {
                                generic:
                                    'تعذر تحديث التفاعل. يرجى المحاولة مرة أخرى.',
                                forbidden:
                                    'غير مسموح لك بالتفاعل مع هذه الرسالة.',
                                archived:
                                    'هذه المحادثة مؤرشفة والتفاعلات للقراءة فقط.',
                                not_found: 'هذه الرسالة لم تعد متاحة.',
                                invalid_emoji: 'هذا الرمز التعبيري غير صالح.',
                            },
                        },
                    },
                    composer: {
                        label: 'رسالة',
                        placeholder: 'اكتب رسالة…',
                        submit: 'إرسال',
                        submitting: 'جارٍ الإرسال…',
                        form_aria_label: 'رسالة محادثة جديدة',
                        keyboard_hint:
                            'اضغط Enter للإرسال. Shift+Enter لإضافة سطر جديد.',
                        counter_aria_label:
                            '{{count}} من {{max}} حرفًا مستخدمًا',
                        errors: {
                            empty: 'أدخل رسالة للإرسال.',
                            too_long: 'لا يمكن أن تتجاوز الرسائل 2000 حرفًا.',
                            create_failed:
                                'تعذر إرسال الرسالة. يرجى المحاولة مرة أخرى.',
                        },
                    },
                    edit: {
                        label: 'رسالة',
                        form_aria_label: 'تعديل رسالة المحادثة',
                        save: 'حفظ',
                        saving: 'جارٍ الحفظ…',
                        cancel: 'إلغاء',
                        counter_aria_label:
                            '{{count}} من {{max}} حرفًا مستخدمًا',
                        errors: {
                            empty: 'أدخل رسالة للحفظ.',
                            too_long: 'لا يمكن أن تتجاوز الرسائل 2000 حرفًا.',
                            update_failed:
                                'تعذر تحديث الرسالة. يرجى المحاولة مرة أخرى.',
                        },
                    },
                    delete_dialog: {
                        title: 'حذف الرسالة',
                        description:
                            'هل أنت متأكد أنك تريد حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.',
                        cancel: 'إلغاء',
                        confirm: 'حذف',
                        deleting: 'جارٍ الحذف…',
                        errors: {
                            delete_failed:
                                'تعذر حذف هذه الرسالة. يرجى المحاولة مرة أخرى.',
                        },
                    },
                    mutation_errors: {
                        forbidden: 'ليس لديك إذن لتغيير هذه الرسالة.',
                        archived: 'هذه المحادثة مؤرشفة وللقراءة فقط.',
                        not_found: 'هذه المحادثة أو الرسالة لم تعد متاحة.',
                    },
                },

                targets: {
                    diagram: 'المخطط',
                    table: 'جدول',
                    field: 'حقل',
                    relationship: 'علاقة',
                    unknown: 'محادثة',
                },
                target_labels: {
                    diagram: 'المخطط',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'جدول محذوف',
                    missing_field: 'حقل محذوف',
                    missing_relationship: 'علاقة محذوفة',
                    unknown: 'محادثة',
                },
            },
            activities_section: {
                title: 'النشاط',
                filter: 'تصفية',
                clear: 'مسح الفلتر',
                no_results: 'لم يتم العثور على نشاط يطابق الفلتر.',
                loading: 'جارٍ تحميل النشاط…',
                retry: 'إعادة المحاولة',
                type_filter: {
                    trigger: 'النوع',
                    label: 'تصفية حسب النوع',
                    trigger_aria: 'تصفية حسب نوع النشاط',
                },
                types: {
                    diagram: 'المخطط',
                    table: 'جدول',
                    field: 'حقل',
                    relationship: 'علاقة',
                    note: 'ملاحظة',
                    area: 'منطقة',
                    dependency: 'تبعية',
                },
                you: 'أنت',
                unknown_user: 'شخص ما',
                empty_state: {
                    title: 'لا يوجد نشاط بعد',
                    description: 'ابدأ التحرير لرؤية التغييرات الأخيرة.',
                },
                errors: {
                    load_failed: 'تعذر تحميل النشاط.',
                },
                actions: {
                    add_tables: 'أضاف {{user}} الجدول {{table}}',
                    remove_tables: 'أزال {{user}} جدولاً',
                    add_field: 'أضاف {{user}} الحقل {{field}}',
                    remove_field: 'أزال {{user}} حقلاً',
                    update_field: 'حدّث {{user}} الحقل {{field}}',
                    add_relationships: 'أضاف {{user}} علاقة',
                    remove_relationships: 'أزال {{user}} علاقة',
                    update_relationship: 'حدّث {{user}} علاقة',
                    add_notes: 'أضاف {{user}} ملاحظة',
                    remove_notes: 'أزال {{user}} ملاحظة',
                    add_areas: 'أضاف {{user}} منطقة',
                    remove_areas: 'أزال {{user}} منطقة',
                    add_dependencies: 'أضاف {{user}} تبعية',
                    remove_dependencies: 'أزال {{user}} تبعية',
                    fallback: 'حدّث {{user}} المخطط',
                },
            },
            share_section: {
                title: 'مشاركة',
                tabs_label: 'خيارات المشاركة',
                tabs: {
                    collaborators: 'المتعاونون',
                    public_link: 'رابط عام',
                },
                collaborators: {
                    description:
                        'ادعُ متعاونين بصلاحية محرر أو قارئ. يجب أن يكون لديهم حساب FoxalDB بالفعل.',
                    filter: 'تصفية',
                    clear: 'مسح التصفية',
                    no_results_title: 'لا توجد نتائج',
                    no_results_description: 'لا يوجد متعاونون يطابقون التصفية.',
                    role_filter: {
                        trigger: 'الدور',
                        label: 'تصفية حسب الدور',
                        trigger_aria: 'تصفية حسب دور المتعاون',
                    },
                },
                public_link: {
                    title: 'رابط عام',
                    description:
                        'شارك لقطة للقراءة فقط من مخططك مع أي شخص لديه الرابط.',
                    coming_soon: 'قريبًا.',
                },
                loading: 'جارٍ تحميل المتعاونين…',
                retry: 'إعادة المحاولة',
                errors: {
                    load_failed: 'تعذر تحميل المتعاونين.',
                },
                member_actions: {
                    title: 'إجراءات المتعاون',
                    trigger_aria: 'إجراءات المتعاون',
                    role: 'الدور',
                    remove: 'إزالة المتعاون',
                },
            },
        },

        toolbar: {
            zoom_in: 'تكبير',
            zoom_out: 'تصغير',
            save: 'حفظ',
            show_all: 'عرض الكل',
            undo: 'تراجع',
            redo: 'إعادة',
            reorder_diagram: 'ترتيب تلقائي للرسم البياني',
            highlight_overlapping_tables: 'تمييز الجداول المتداخلة',
            filter: 'تصفية الجداول',
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'اختر قاعدة البيانات',
                description: 'حدد نظام قاعدة البيانات للمخطط الجديد.',
                search_placeholder: 'البحث عن أنظمة إدارة قواعد البيانات…',
                search_no_results:
                    'لا يوجد نظام إدارة قواعد بيانات يطابق بحثك.',
                clear_search: 'مسح البحث',
                primary_group: 'قواعد البيانات الرئيسية',
                other_group: 'قواعد بيانات أخرى',
                check_examples_long: 'ألقي نظرة على الأمثلة',
                check_examples_short: 'أمثلة',
            },

            choose_intent: {
                title: 'ماذا تريد أن تفعل؟',
                description: 'أنشئ مخططًا جديدًا لـ {{database}}.',
                create_empty: 'إنشاء مخطط فارغ',
                create_empty_description: 'ابدأ من الصفر بإضافة الجداول بنفسك.',
                import_schema: 'استيراد مخطط موجود',
                import_schema_description:
                    'استورد الجداول والعلاقات من SQL أو DBML أو البيانات الوصفية.',
                back: 'رجوع',
            },

            import_schema: {
                title: 'الصق المخطط الخاص بك',
                textarea_label: 'محتوى المخطط',
                textarea_placeholder:
                    'الصق SQL أو DBML أو بيانات JSON الوصفية هنا…',
                auto_detect_hint: 'سنكتشف التنسيق تلقائيًا.',
                or_divider: 'أو',
                choose_file: 'اختر ملفًا',
                selected_file: 'الملف المحدد: {{name}}',
                back: 'رجوع',
                continue: 'متابعة',
                mismatch: {
                    title: 'يبدو أن هذا المخطط من نوع {{detected}}، لكنك اخترت {{selected}}.',
                    description:
                        'انتقل إلى نوع قاعدة البيانات المكتشف أو ارجع لاختيار نوع آخر.',
                    switch: 'التبديل إلى {{database}}',
                    go_back: 'رجوع',
                },
                ambiguous: {
                    title: 'اختر قاعدة البيانات المصدر',
                    description:
                        'تعذر تحديد لهجة SQL تلقائيًا. أكد قاعدة البيانات التي جاء منها هذا المخطط.',
                    choose_source: 'اختر قاعدة البيانات المصدر',
                },
                detection: {
                    dialect: 'تم اكتشاف {{database}}',
                    dbml: 'تم اكتشاف DBML',
                    metadata_json: 'تم اكتشاف بيانات JSON الوصفية',
                    diagram_json: 'تم اكتشاف JSON للمخطط',
                    sql_ambiguous_title: 'تم اكتشاف SQL',
                    sql_ambiguous_description: 'تعذر تحديد قاعدة البيانات.',
                    clickhouse_unsupported: 'تم اكتشاف SQL لـ ClickHouse',
                    unsupported: 'تنسيق غير مدعوم',
                },
                errors: {
                    unreadable_file: 'تعذر قراءة الملف المحدد.',
                    malformed_json: 'تعذر تحليل محتوى JSON.',
                    unsupported: 'هذا التنسيق غير مدعوم لاستيراد المخطط.',
                    diagram_json:
                        'يمكن استيراد JSON للمخطط من خيار ملف المخطط بدلاً من ذلك.',
                    clickhouse_unsupported:
                        'استيراد DDL SQL غير مدعوم لـ ClickHouse. استخدم DBML أو استورد من قاعدة بيانات موجودة.',
                    file_too_large: 'الملف المحدد أكبر من 5 ميغابايت.',
                    import_failed:
                        'تعذر استيراد المخطط. تحقق من المحتوى وحاول مرة أخرى.',
                },
            },

            import_database: {
                title: 'إسترد قاعدة بياناتك',
                database_edition: ':إصدار قاعدة البيانات',
                step_1: ':قم بتشغيل هذا البرنامج النصي في قاعدة بياناتك',
                step_2: ':إلصق نتيجة البرنامج النصي هنا →',
                script_results_placeholder: '...نتيجة البرنامج النصي هنا',
                ssms_instructions: {
                    button_text: 'SSMS تعليمات',
                    title: 'تعليمات',
                    step_1: 'SQL SERVER < انتقل إلى الأدوات > الخيارات > نتائح الاستعلام',
                    step_2: '(اضبطها على 9999999) XML اذا كنت تستخدم "نتائج إلى الشبكة"، قم بتغيير الحد الاقصى للاحرف المستردة للبيانات غير',
                },
                instructions_link: 'تحتاج مساعدة؟ شاهد الفيديو',
                check_script_result: 'تحقق من نتيجة البرنامج النصي',
            },

            cancel: 'إلغاء',
            import_from_file: 'استيراد من ملف',
            back: 'رجوع',
            empty_diagram: 'قاعدة بيانات فارغة',
            continue: 'متابعة',
            import: 'استيراد',
        },

        share_diagram_dialog: {
            title: 'مشاركة المخطط',
            description:
                'ادعُ المتعاونين بصلاحية محرر أو قارئ. يجب أن يكون لديهم حساب FoxalDB بالفعل.',
            share_button: 'مشاركة',
            empty_members: 'لا يوجد متعاونون بعد.',
            remove: 'إزالة',
            roles: {
                owner: 'المالك',
                editor: 'محرر',
                viewer: 'قارئ',
            },
            add_member: {
                title: 'إضافة متعاون',
                email_label: 'البريد الإلكتروني',
                email_placeholder: 'عنوان البريد الإلكتروني',
                add: 'إضافة',
                adding: 'جارٍ الإضافة…',
                cancel: 'إلغاء',
            },
            errors: {
                load_failed: 'تعذر تحميل المتعاونين.',
                add_failed: 'تعذر إضافة المتعاون.',
            },
        },

        diagram_role: {
            owner: 'المالك',
            editor: 'المحرر',
            viewer: 'المشاهد',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'فتح قاعدة بيانات',
            description: 'حدد نظام قاعدة البيانات للمخطط الجديد.',
            table_columns: {
                name: 'الإسم',
                created_at: 'تاريخ الإنشاء',
                last_modified: 'آخر تعديل',
                tables_count: 'الجداول',
            },
            cancel: 'إلغاء',
            open: 'فتح',
            new_database: 'قاعدة بيانات جديدة',

            diagram_actions: {
                open: 'فتح',
                duplicate: 'تكرار',
                delete: 'حذف',
            },
        },

        export_sql_dialog: {
            title: 'SQL تصدير',
            description:
                '{{databaseType}} صدّر مخطط الرسم البياني إلى برنامج نصي لـ',
            close: 'إغلاق',
            loading: {
                text: '...{{databaseType}} ل SQL يقوم الذكاء الاصطناعي بإنشاء',
                description: 'هذا قد يستغرق 30 ثانية',
            },
            error: {
                message:
                    'النصي. يرجى المحاولة مرة اخرى لاحقاً او <0>اتصل بنا</0> SQL خطأ في إنشاء برنامج',
                description:
                    ' الخاصة بك. راجع الدليل <0>هنا</0> OPENAI_TOKEN لا تتردد في استخدام',
            },
        },

        export_laravel_migrations_dialog: {
            title: 'Export Laravel migrations',
            laravel_version: 'Laravel version',
            include_table_indexes: 'Include table indexes',
            include_table_indexes_description:
                'Export explicit table index definitions. Field-level unique constraints are always included.',
            include_foreign_keys: 'Include foreign keys',
            include_foreign_keys_description:
                'Export separate foreign key migration files.',
            export: 'Export',
            exporting: 'Exporting...',
            cancel: 'Cancel',
            errors: {
                export_failed: 'Could not export Laravel migrations.',
            },
        },

        import_laravel_migrations_dialog: {
            title: 'Import Laravel migrations',
            description:
                'Upload a ZIP archive of Laravel migration files to preview the parsed schema snapshot.',
            upload: 'Upload',
            uploading: 'Uploading...',
            close: 'Close',
            upload_another: 'Upload another',
            no_file_selected: 'No file selected.',
            errors: {
                upload_failed: 'Could not import Laravel migrations.',
                file_required: 'Please select a ZIP file to upload.',
                file_too_large: 'File must be 5 MB or smaller.',
            },
            summary: {
                tables: 'Tables',
                columns: 'Columns',
                indexes: 'Indexes',
                foreign_keys: 'Foreign keys',
                warnings: 'Warnings',
            },
            tables: {
                title: 'Tables',
                columns_count: '{{count}} columns',
                indexes_count: '{{count}} indexes',
            },
            foreign_keys: {
                title: 'Foreign keys',
            },
            warnings: {
                title: 'Warnings',
                none: 'No warnings.',
            },
            source_files: {
                title: 'Source files',
            },
        },

        compare_laravel_migrations_dialog: {
            title: 'Sync from Laravel migrations',
            description:
                'Compare the open diagram with a Laravel migration archive.',
            archive_label: 'Laravel migrations archive',
            compare: 'Compare',
            comparing: 'Comparing...',
            close: 'Close',
            compare_another: 'Compare another',
            no_archive_selected: 'No archive selected.',
            include_table_indexes: 'Include table indexes',
            include_table_indexes_description:
                'Include explicit table index definitions. Field-level unique constraints are always included.',
            include_foreign_keys: 'Include foreign keys',
            include_foreign_keys_description:
                'Include separate foreign key migration definitions.',
            errors: {
                compare_failed: 'Could not compare Laravel migrations.',
                archive_required:
                    'Please select a Laravel migrations archive ZIP file.',
                file_too_large: 'File must be 5 MB or smaller.',
            },
            summary: {
                added_tables: 'Added tables',
                removed_tables: 'Removed tables',
                changed_tables: 'Changed tables',
                added_foreign_keys: 'Added foreign keys',
                removed_foreign_keys: 'Removed foreign keys',
                changed_foreign_keys: 'Changed foreign keys',
                warnings: 'Warnings',
            },
            sections: {
                added_tables: 'Added tables',
                removed_tables: 'Removed tables',
                changed_tables: 'Changed tables',
                added_foreign_keys: 'Added foreign keys',
                removed_foreign_keys: 'Removed foreign keys',
                changed_foreign_keys: 'Changed foreign keys',
                warnings: 'Warnings',
            },
            tables: {
                columns_count: '{{count}} columns',
                indexes_count: '{{count}} indexes',
            },
            changed_tables: {
                added_columns: 'Added columns',
                removed_columns: 'Removed columns',
                changed_columns: 'Changed columns',
                added_indexes: 'Added indexes',
                removed_indexes: 'Removed indexes',
                changed_indexes: 'Changed indexes',
            },
            changed_foreign_keys: {
                before: 'Before',
            },
            attribute_change: {
                arrow: '→',
            },
            warnings: {
                none: 'No warnings.',
            },
            apply: {
                apply: 'Apply changes',
                applying: 'Applying...',
                apply_success: 'Changes applied successfully.',
                apply_failed: 'Could not apply migration changes.',
                apply_blocked: 'Fix validation issues before applying changes.',
                ready_to_apply: 'Ready to apply',
                validation_issues: 'Validation issues',
                added_tables: 'Added tables',
                removed_tables: 'Removed tables',
                changed_tables: 'Changed tables',
            },
        },
        create_relationship_dialog: {
            title: 'إنشاء علاقة',
            primary_table: 'الجدول الأساسي',
            primary_field: 'الحقل الأساسي',
            referenced_table: 'الجدول المرتبط',
            referenced_field: 'الحقل المرتبط',
            primary_table_placeholder: 'حدد الجدول',
            primary_field_placeholder: 'حدد الحقل',
            referenced_table_placeholder: 'حدد الجدول',
            referenced_field_placeholder: 'حدد الحقل',
            no_tables_found: 'لم يتم العثور على جداول',
            no_fields_found: 'لم يتم العثور على حقول',
            create: 'إنشاء',
            cancel: 'إلغاء',
        },

        import_database_dialog: {
            title: 'استيراد إلى المخطط الحالي',
            import_schema: {
                title: 'استيراد المخطط',
                import: 'استيراد',
                cancel: 'إلغاء',
                mismatch: {
                    title: 'يبدو أن هذا المخطط من نوع {{detected}}، لكن هذا المخطط الحالي من نوع {{selected}}.',
                    description:
                        'استيراد عبر قواعد بيانات مختلفة غير مدعوم بعد.',
                    cancel: 'إلغاء',
                },
                ambiguous: {
                    description:
                        'تعذر تحديد لغة SQL تلقائياً. أكد كيفية تفسير هذا المخطط لمخطط {{selected}} الحالي.',
                },
            },
            override_alert: {
                title: 'استيراد قاعدة بيانات',
                content: {
                    alert: 'سيؤدي استيراد هذا المخطط إلى التأثير على الجداول والعلاقات الحالية.',
                    new_tables:
                        'جداول جديدة <bold>{{newTablesNumber}}</bold> سيتم إضافة',
                    new_relationships:
                        'علاقات جديدة <bold>{{newRelationshipsNumber}}</bold> سيتم إنشاء',
                    tables_override:
                        'جداول <bold>{{tablesOverrideNumber}}</bold> سيتم تعديل',
                    proceed: 'هل تريد المتابعة؟',
                },
                import: 'استيراد',
                cancel: 'إلغاء',
            },
        },

        export_image_dialog: {
            title: 'تصدير الصورة',
            description: ':اختر عامل المقياس للتصدير',
            scale_1x: '1x (جودة منخفضة)',
            scale_2x: '2x (جودة عادية)',
            scale_4x: '4x (أفضل جودة)',
            cancel: 'إلغاء',
            export: 'تصدير',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'اختر مخططاً',
            description:
                '.يتم حالياً عرض مخططات متعددة. اختر واحداً للجدول الجديد',
            cancel: 'إلغاء',
            confirm: 'تأكيد',
        },

        update_table_schema_dialog: {
            title: 'تغيير المخطط',
            description: '"{{tableName}}" تحديث مخطط الجدول',
            cancel: 'إلغاء',
            confirm: 'تغيير',
        },
        create_table_schema_dialog: {
            title: 'إنشاء مخطط جديد',
            description:
                'لا توجد مخططات حتى الآن. قم بإنشاء أول مخطط لتنظيم جداولك.',
            create: 'إنشاء',
            cancel: 'إلغاء',
        },
        export_diagram_dialog: {
            title: 'تصدير المخطط',
            description: ':اختر التنسيق للتصدير',
            format_json: 'JSON',
            cancel: 'إلغاء',
            export: 'تصدير',
            error: {
                title: 'حدث خطأ أثناء التصدير',
                description:
                    'support@chartdb.io حدث خطأ ما. هل تحتاج إلى مساعدة؟',
            },
        },
        import_diagram_dialog: {
            title: 'استيراد الرسم البياني',
            description: ':للرسم البياني ادناه JSON قم بلصق',
            cancel: 'إلغاء',
            import: 'استيراد',
            error: {
                title: 'حدث خطأ أثناء الاستيراد',
                description:
                    'support@chartdb.io و المحاولة مرة اخرى. هل تحتاج إلى المساعدة؟ JSON غير صالح. يرجى التحقق من JSON الرسم البياني',
            },
        },
        import_dbml_dialog: {
            // TODO: Translate
            title: 'Import DBML',
            example_title: 'Import Example DBML',
            description: 'Import a database schema from DBML format.',
            import: 'Import',
            cancel: 'Cancel',
            skip_and_empty: 'Skip & Empty',
            show_example: 'Show Example',
            error: {
                title: 'Error',
                description: 'Failed to parse DBML. Please check the syntax.',
            },
        },
        relationship_type: {
            one_to_one: 'واحد إلى واحد',
            one_to_many: 'واحد إلى متعدد',
            many_to_one: 'متعدد إلى واحد',
            many_to_many: 'متعدد إلى متعدد',
        },

        canvas_context_menu: {
            new_table: 'جدول جديد',
            new_view: 'عرض جديد',
            new_relationship: 'علاقة جديدة',
            // TODO: Translate
            new_area: 'منطقة جديدة',
            new_note: 'ملاحظة جديدة',
        },

        table_node_context_menu: {
            edit_table: 'تعديل الجدول',
            duplicate_table: 'نسخ الجدول',
            delete_table: 'حذف الجدول',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'نقل إلى منطقة',
            no_area: 'بدون منطقة',
        },

        canvas: {
            all_tables_hidden: 'جميع الجداول مخفية',
            show_all_tables: 'عرض الكل',
        },

        canvas_filter: {
            title: 'تصفية الجداول',
            search_placeholder: 'البحث في الجداول...',
            group_by_schema: 'تجميع حسب المخطط',
            group_by_area: 'تجميع حسب المنطقة',
            no_tables_found: 'لم يتم العثور على جداول',
            empty_diagram_description: 'أنشئ جدولاً للبدء',
            no_tables_description: 'جرب تعديل البحث أو التصفية',
            clear_filter: 'مسح التصفية',
        },

        snap_to_grid_tooltip: '({{key}} مغنظة الشبكة (اضغط مع الاستمرار على',

        editing_conflict: {
            one: '{{name}} يعدّل هذا أيضاً.',
            two: '{{name1}} و{{name2}} يعدّلان هذا أيضاً.',
            many: '{{name}} و{{count}} آخرون يعدّلون هذا أيضاً.',
            fallback_name: 'متعاون',
            last_writer_wins:
                'التغييرات غير مقفلة. التعديل المحفوظ الأخير هو الذي يسود.',
        },

        tool_tips: {
            double_click_to_edit: 'انقر مرتين للتعديل',
        },

        auth: {
            dialog: {
                account_title: 'الحساب',
                login_title: 'تسجيل الدخول إلى FoxalDB',
                register_title: 'إنشاء حساب FoxalDB',
                account_description: 'إدارة جلستك الحالية.',
                login_description:
                    'سجّل الدخول لحفظ المزيد من المخططات ومزامنتها.',
                register_description: 'أنشئ حسابًا لحفظ المزيد من المخططات.',
                checking_session: 'جارٍ التحقق من الجلسة...',
                continue_without_account: 'المتابعة بدون حساب',
            },
            login: {
                title: 'تسجيل الدخول',
                email_label: 'البريد الإلكتروني',
                password_label: 'كلمة المرور',
                submit: 'تسجيل الدخول',
                submitting: 'جارٍ تسجيل الدخول...',
                switch_to_register: 'إنشاء حساب',
                no_account: 'ليس لديك حساب؟',
            },
            register: {
                title: 'إنشاء حساب',
                first_name_label: 'الاسم الأول',
                last_name_label: 'اسم العائلة',
                email_label: 'البريد الإلكتروني',
                password_label: 'كلمة المرور',
                password_confirmation_label: 'تأكيد كلمة المرور',
                submit: 'إنشاء حساب',
                submitting: 'جارٍ إنشاء الحساب...',
                switch_to_login: 'تسجيل الدخول',
                already_have_account: 'لديك حساب بالفعل؟',
            },
            account: {
                signed_in_as: 'مسجّل الدخول باسم',
                logout: 'تسجيل الخروج',
                back_to_editor: 'العودة إلى المحرر',
            },
            settings: {
                title: 'إعدادات المستخدم',
                description: 'حدّث معلوماتك الشخصية وكلمة المرور.',
                change_password_heading: 'تغيير كلمة المرور',
                current_password_label: 'كلمة المرور الحالية',
                new_password_label: 'كلمة المرور الجديدة',
                password_confirmation_label: 'تأكيد كلمة المرور الجديدة',
                first_name_label: 'الاسم الأول',
                last_name_label: 'اسم العائلة',
                email_label: 'عنوان البريد الإلكتروني',
                submit: 'حفظ التغييرات',
                submitting: 'جارٍ الحفظ...',
                success_title: 'تم تحديث الملف الشخصي',
                success_description: 'تم حفظ ملفك الشخصي.',
            },
            nav: {
                sign_in: 'تسجيل الدخول',
                logout: 'تسجيل الخروج',
                loading: '...',
                user_menu: 'الحساب',
                settings: 'الإعدادات',
                change_language: 'اللغة',
            },
            pages: {
                login_title: 'FoxalDB — تسجيل الدخول',
                register_title: 'FoxalDB — إنشاء حساب',
                checking_session: 'جارٍ التحقق من الجلسة…',
            },
            errors: {
                first_name_required: 'الاسم الأول مطلوب.',
                last_name_required: 'اسم العائلة مطلوب.',
                generic: 'حدث خطأ ما.',
            },
        },

        guest_migration_dialog: {
            title: 'استيراد المخطط المحلي؟',
            description:
                'لديك مخطط محفوظ على هذا الجهاز. استورده إلى حسابك للوصول إليه من أي مكان.',
            import: 'استيراد إلى الحساب',
            continue_without_import: 'المتابعة دون استيراد',
        },

        guest_migration_errors: {
            import_failed:
                'تعذر استيراد المخطط المحلي. تم الاحتفاظ بالنسخة المحلية.',
            activation_failed:
                'تم إنشاء المخطط ولكن تعذر فتحه. تم الاحتفاظ بالنسخة المحلية.',
            cleanup_failed:
                'تم استيراد المخطط ولكن تعذر إزالة النسخة المحلية. يمكنك حذفها يدويًا.',
            check_failed: 'تعذر قراءة المخطط المحلي.',
        },

        language_select: {
            change_language: 'اللغة',
        },
        on: 'تشغيل',
        off: 'إيقاف',
    },
};

export const arMetadata: LanguageMetadata = {
    name: 'Arabic',
    nativeName: 'العربية',
    code: 'ar',
    countryCode: 'sa',
};
