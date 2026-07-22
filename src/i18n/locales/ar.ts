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
            comments: 'النقاشات',
            visuals: 'مرئيات',
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
            title: 'حذف المخطط',
            description:
                '.لا يمكن التراجع عن هذا الإجراء. سيتم حذف الرسم البياني بشكل دائم',
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
                title: 'Access removed',
                description: 'You no longer have access to this diagram.',
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
                        open_discussion: 'فتح النقاش',
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
                        open_discussion: 'فتح النقاش',
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
                        open_discussion: 'فتح النقاش',
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
            comments_section: {
                title: 'النقاشات',
                loading: 'جاري تحميل النقاشات…',
                inactive: {
                    title: 'النقاشات غير متاحة',
                    description:
                        'النقاشات متاحة فقط لمخططات السحابة المصادق عليها.',
                },
                empty: {
                    title: 'لا توجد نقاشات بعد',
                    description: 'ستظهر هنا المحادثات حول هذا المخطط.',
                    diagram_title: 'لا توجد رسائل للمخطط بعد',
                    diagram_description:
                        'ستظهر هنا الرسائل المتعلقة بالمخطط ككل.',
                    target_title: 'لا توجد رسائل للاختيار الحالي بعد',
                    target_description:
                        'ستظهر هنا الرسائل المتعلقة بالاختيار الحالي.',
                },
                errors: {
                    load_title: 'تعذر تحميل النقاشات',
                    load_description:
                        'حدث خطأ أثناء تحميل النقاشات. يرجى المحاولة مرة أخرى.',
                },
                retry: 'إعادة المحاولة',
                deleted_user: 'مستخدم محذوف',
                targets: {
                    diagram: 'نقاش حول المخطط',
                    table: 'نقاش حول الجدول',
                    field: 'نقاش حول الحقل',
                    relationship: 'نقاش حول العلاقة',
                    unknown: 'نقاش',
                },
                views: {
                    all: 'الكل',
                    diagram: 'المخطط',
                    current_target: 'الحالي',
                },
                target_header: {
                    diagram: 'نقاش المخطط',
                    table: 'جدول {{name}}',
                    field: '{{table}}.{{field}}',
                    relationship: '{{name}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'جدول محذوف',
                    missing_field: 'حقل محذوف',
                    missing_relationship: 'علاقة محذوفة',
                },
                composer: {
                    label: 'الرسالة',
                    placeholder: 'اكتب رسالة مناقشة…',
                    submit: 'نشر',
                    submitting: 'جارٍ النشر…',
                    cancel: 'إلغاء',
                    form_aria_label: 'رسالة مناقشة جديدة',
                    counter_aria_label:
                        'تم استخدام {{count}} من أصل {{max}} حرفًا',
                    errors: {
                        empty: 'أدخل رسالة لنشرها.',
                        too_long: 'لا يمكن أن تتجاوز الرسائل 2000 حرف.',
                        create_failed:
                            'تعذر نشر الرسالة. يُرجى المحاولة مرة أخرى.',
                    },
                },
                item_actions: {
                    title: 'إجراءات التعليق',
                    edit: 'تعديل',
                },
                edit: {
                    label: 'الرسالة',
                    form_aria_label: 'تعديل رسالة النقاش',
                    save: 'حفظ',
                    saving: 'جارٍ الحفظ…',
                    cancel: 'إلغاء',
                    counter_aria_label:
                        'تم استخدام {{count}} من أصل {{max}} حرفًا',
                    errors: {
                        empty: 'أدخل رسالة للحفظ.',
                        too_long: 'لا يمكن أن تتجاوز الرسائل 2000 حرف.',
                        update_failed:
                            'تعذّر تحديث الرسالة. يُرجى المحاولة مرة أخرى.',
                    },
                    remote_updated_warning:
                        'تم تحديث هذه الرسالة في مكان آخر. سيؤدي الحفظ إلى الكتابة فوق تلك التغييرات.',
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
                title: 'ما هو نوع قاعدة البيانات الخاصة بك؟',
                description:
                    'تتمتع كل قاعدة بيانات بمميزاتها وقدراتها الفريدة.',
                check_examples_long: 'ألقي نظرة على الأمثلة',
                check_examples_short: 'أمثلة',
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
            title: 'Share diagram',
            description:
                'Invite collaborators with editor or viewer access. They must already have a FoxalDB account.',
            share_button: 'Share',
            empty_members: 'No collaborators yet.',
            remove: 'Remove',
            roles: {
                owner: 'Owner',
                editor: 'Editor',
                viewer: 'Viewer',
            },
            add_member: {
                title: 'Add collaborator',
                email_placeholder: 'Email address',
                add: 'Add',
                adding: 'Adding...',
            },
            errors: {
                load_failed: 'Could not load collaborators.',
                add_failed: 'Could not add collaborator.',
            },
        },

        editor_role: {
            view_only: 'View only',
        },

        activity_feed_dialog: {
            title: 'Activity',
            description: 'Recent changes to this diagram.',
            activity_button: 'Activity',
            empty: 'No activity yet.',
            empty_hint: 'Start editing to see recent changes.',
            you: 'You',
            unknown_user: 'Someone',
            errors: {
                load_failed: 'Could not load activity.',
            },
            actions: {
                add_tables: '{{user}} added table {{table}}',
                remove_tables: '{{user}} removed a table',
                add_field: '{{user}} added field {{field}}',
                remove_field: '{{user}} removed a field',
                update_field: '{{user}} updated field {{field}}',
                add_relationships: '{{user}} added a relationship',
                remove_relationships: '{{user}} removed a relationship',
                update_relationship: '{{user}} updated a relationship',
                add_notes: '{{user}} added a note',
                remove_notes: '{{user}} removed a note',
                add_areas: '{{user}} added an area',
                remove_areas: '{{user}} removed an area',
                add_dependencies: '{{user}} added a dependency',
                remove_dependencies: '{{user}} removed a dependency',
                fallback: '{{user}} updated the diagram',
            },
        },

        open_diagram_dialog: {
            title: 'فتح قاعدة بيانات',
            description: 'اختر مخططًا لفتحه من القائمة ادناه',
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

        star_us_dialog: {
            title: '!ساعدنا على التحسن',
            description: '؟! إنها مجرد نقرة واحدةGITHUB هل ترغب في تقييمنا على',
            close: 'ليس الآن',
            confirm: '!بالتأكيد',
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
};
