import type { LanguageMetadata, LanguageTranslation } from '../types';

export const bn: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'নতুন',
            browse: 'খুলুন',
            tables: 'টেবিল',
            refs: 'রেফস',
            dependencies: 'নির্ভরতা',
            custom_types: 'কাস্টম টাইপ',
            conversations: 'কথোপকথন',
            conversations_unread_aria: 'কথোপকথনে {{count}} অপঠিত বার্তা',
            visuals: 'ভিজ্যুয়াল',
            activities: 'কার্যকলাপ',
            share: 'শেয়ার',
        },
        menu: {
            actions: {
                actions: 'কার্য',
                new: 'নতুন...',
                browse: 'সমস্ত ডেটাবেস...',
                save: 'সংরক্ষণ করুন',
                import: 'ডাটাবেস আমদানি করুন',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'SQL রপ্তানি করুন',
                export_as: 'রূপে রপ্তানি করুন',
                delete_diagram: 'মুছুন',
            },
            edit: {
                edit: 'সম্পাদনা',
                undo: 'পূর্বাবস্থায় ফিরুন',
                redo: 'পুনরায় করুন',
                clear: 'পরিষ্কার করুন',
            },
            view: {
                view: 'দেখুন',
                show_sidebar: 'সাইডবার দেখান',
                hide_sidebar: 'সাইডবার লুকান',
                hide_cardinality: 'কার্ডিনালিটি লুকান',
                show_cardinality: 'কার্ডিনালিটি দেখান',
                hide_field_attributes: 'ফিল্ড অ্যাট্রিবিউট লুকান',
                show_field_attributes: 'ফিল্ড অ্যাট্রিবিউট দেখান',
                zoom_on_scroll: 'স্ক্রলে জুম করুন',
                show_views: 'ডাটাবেস ভিউ',
                theme: 'থিম',
                show_dependencies: 'নির্ভরতাগুলি দেখান',
                hide_dependencies: 'নির্ভরতাগুলি লুকান',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },

            backup: {
                backup: 'ব্যাকআপ',
                export_diagram: 'ডায়াগ্রাম রপ্তানি করুন',
                restore_diagram: 'ডায়াগ্রাম পুনরুদ্ধার করুন',
            },
            help: {
                help: 'সাহায্য',
                docs_website: 'ডকুমেন্টেশন',
                join_discord: 'আমাদের Discord-এ যোগ দিন',
            },
        },

        delete_diagram_alert: {
            title: 'আপনার ডাটাবেস বেছে নিন',
            description:
                'আপনার নতুন ডায়াগ্রামের জন্য ডাটাবেস সিস্টেম নির্বাচন করুন।',
            cancel: 'বাতিল করুন',
            delete: 'মুছুন',
        },

        clear_diagram_alert: {
            title: 'ডায়াগ্রাম পরিষ্কার করুন',
            description:
                'এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না। এই ডায়াগ্রামের সমস্ত তথ্য স্থায়ীভাবে মুছে যাবে।',
            cancel: 'বাতিল করুন',
            clear: 'পরিষ্কার করুন',
        },

        diagram_access: {
            removed: {
                title: 'আপনার ডাটাবেস বেছে নিন',
                description:
                    'আপনার নতুন ডায়াগ্রামের জন্য ডাটাবেস সিস্টেম নির্বাচন করুন।',
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
            title: 'স্বয়ংক্রিয় ডায়াগ্রাম সাজান',
            description:
                'এই কাজটি ডায়াগ্রামের সমস্ত টেবিল পুনর্বিন্যাস করবে। আপনি কি চালিয়ে যেতে চান?',
            reorder: 'স্বয়ংক্রিয় সাজান',
            cancel: 'বাতিল করুন',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'কপি ব্যর্থ হয়েছে',
                description: 'ক্লিপবোর্ড সমর্থিত নয়',
            },
            failed: {
                title: 'কপি ব্যর্থ হয়েছে',
                description: 'কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
            },
        },

        theme: {
            system: 'সিস্টেম',
            light: 'হালকা',
            dark: 'অন্ধকার',
        },

        zoom: {
            on: 'চালু',
            off: 'বন্ধ',
        },

        last_saved: 'সর্বশেষ সংরক্ষণ',
        saved: 'সংরক্ষিত',
        loading_diagram: 'ডায়াগ্রাম লোড হচ্ছে...',
        deselect_all: 'সব নির্বাচন সরান',
        select_all: 'সব নির্বাচন করুন',
        delete: 'মুছুন',
        clear: 'পরিষ্কার করুন',
        show_more: 'আরও দেখুন',
        show_less: 'কম দেখুন',
        copy_to_clipboard: 'ক্লিপবোর্ডে অনুলিপি করুন',
        copied: 'অনুলিপি সম্পন্ন!',

        side_panel: {
            view_all_options: 'সমস্ত বিকল্প দেখুন...',
            tables_section: {
                tables: 'টেবিল',
                add_table: 'টেবিল যোগ করুন',
                add_view: 'ভিউ যোগ করুন',
                filter: 'ফিল্টার',
                collapse: 'সব ভাঁজ করুন',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'সব টেবিল লুকানো আছে',
                show_all: 'সব দেখান',

                table: {
                    fields: 'ফিল্ড',
                    nullable: 'নালযোগ্য?',
                    primary_key: 'প্রাথমিক কী',
                    indexes: 'ইনডেক্স',
                    check_constraints: 'চেক সীমাবদ্ধতা',
                    comments: 'মন্তব্য',
                    no_comments: 'কোনো মন্তব্য নেই',
                    add_field: 'ফিল্ড যোগ করুন',
                    add_index: 'ইনডেক্স যোগ করুন',
                    add_check: 'চেক যোগ করুন',
                    index_select_fields: 'ফিল্ড নির্বাচন করুন',
                    no_types_found: 'কোনো ধরন পাওয়া যায়নি',
                    field_name: 'নাম',
                    field_type: 'ধরন',
                    field_actions: {
                        title: 'ফিল্ড কর্ম',
                        open_discussion: 'কথোপকথন খুলুন',
                        unique: 'অদ্বিতীয়',
                        auto_increment: 'স্বয়ংক্রিয় বৃদ্ধি',
                        comments: 'মন্তব্য',
                        no_comments: 'কোনো মন্তব্য নেই',
                        delete_field: 'ফিল্ড মুছুন',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'নির্ভুলতা',
                        scale: 'স্কেল',
                    },
                    index_actions: {
                        title: 'ইনডেক্স কর্ম',
                        name: 'নাম',
                        unique: 'অদ্বিতীয়',
                        index_type: 'ইনডেক্স ধরন',
                        delete_index: 'ইনডেক্স মুছুন',
                    },
                    check_constraint_actions: {
                        title: 'চেক সীমাবদ্ধতা',
                        expression: 'এক্সপ্রেশন',
                        delete: 'সীমাবদ্ধতা মুছুন',
                    },
                    table_actions: {
                        title: 'টেবিল কর্ম',
                        open_discussion: 'কথোপকথন খুলুন',
                        change_schema: 'স্কিমা পরিবর্তন করুন',
                        add_field: 'ফিল্ড যোগ করুন',
                        add_index: 'ইনডেক্স যোগ করুন',
                        duplicate_table: 'টেবিল নকল করুন',
                        delete_table: 'টেবিল মুছুন',
                    },
                },
                empty_state: {
                    title: 'কোনো টেবিল নেই',
                    description: 'শুরু করতে একটি টেবিল তৈরি করুন',
                },
            },
            refs_section: {
                refs: 'রেফস',
                filter: 'ফিল্টার',
                clear: 'ফিল্টার মুছুন',
                no_results:
                    'আপনার ফিল্টারের সাথে মিলে এমন কোনো রেফারেন্স পাওয়া যায়নি।',
                collapse: 'সব ভাঁজ করুন',
                add_relationship: 'সম্পর্ক যোগ করুন',
                relationships: 'সম্পর্ক',
                dependencies: 'নির্ভরতাগুলি',
                relationship: {
                    relationship: 'সম্পর্ক',
                    primary: 'প্রাথমিক টেবিল',
                    foreign: 'সম্পর্কিত টেবিল',
                    cardinality: 'কার্ডিনালিটি',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'মুছুন',
                    switch_tables: 'টেবিল বদল করুন',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'কর্ম',
                        open_discussion: 'কথোপকথন খুলুন',
                        delete_relationship: 'মুছুন',
                    },
                },
                dependency: {
                    dependency: 'নির্ভরতা',
                    table: 'টেবিল',
                    dependent_table: 'নির্ভরশীল ভিউ',
                    delete_dependency: 'মুছুন',
                    dependency_actions: {
                        title: 'কর্ম',
                        delete_dependency: 'মুছুন',
                    },
                },
                empty_state: {
                    title: 'কোনো সম্পর্ক নেই',
                    description: 'শুরু করতে একটি সম্পর্ক তৈরি করুন',
                },
            },

            areas_section: {
                areas: 'এলাকা',
                add_area: 'এলাকা যোগ করুন',
                filter: 'ফিল্টার',
                clear: 'ফিল্টার সাফ করুন',
                no_results:
                    'আপনার ফিল্টারের সাথে মেলে এমন কোনো এলাকা পাওয়া যায়নি।',

                area: {
                    area_actions: {
                        title: 'এলাকা ক্রিয়া',
                        edit_name: 'নাম সম্পাদনা করুন',
                        delete_area: 'এলাকা মুছুন',
                    },
                },
                empty_state: {
                    title: 'কোনো এলাকা নেই',
                    description: 'শুরু করতে একটি এলাকা তৈরি করুন',
                },
            },

            visuals_section: {
                visuals: 'ভিজ্যুয়াল',
                tabs: {
                    areas: 'এলাকা',
                    notes: 'নোট',
                },
            },

            notes_section: {
                filter: 'ফিল্টার',
                add_note: 'নোট যোগ করুন',
                no_results: 'কোনো নোট পাওয়া যায়নি',
                clear: 'ফিল্টার সাফ করুন',
                empty_state: {
                    title: 'কোনো নোট নেই',
                    description:
                        'ক্যানভাসে টেক্সট টীকা যোগ করতে একটি নোট তৈরি করুন',
                },
                note: {
                    empty_note: 'খালি নোট',
                    note_actions: {
                        title: 'নোট ক্রিয়া',
                        edit_content: 'বিষয়বস্তু সম্পাদনা',
                        delete_note: 'নোট মুছুন',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'কাস্টম টাইপ',
                filter: 'ফিল্টার',
                clear: 'ফিল্টার সাফ করুন',
                no_results:
                    'আপনার ফিল্টারের সাথে মেলে এমন কোনো কাস্টম টাইপ পাওয়া যায়নি।',
                new_type: 'নতুন টাইপ',
                empty_state: {
                    title: 'কোনো কাস্টম টাইপ নেই',
                    description:
                        'আপনার ডাটাবেসে উপলব্ধ হলে কাস্টম টাইপ এখানে দেখা যাবে',
                },
                custom_type: {
                    kind: 'ধরন',
                    enum_values: 'Enum মান',
                    composite_fields: 'ফিল্ড',
                    no_fields: 'কোনো ফিল্ড সংজ্ঞায়িত নেই',
                    no_values: 'কোন enum মান সংজ্ঞায়িত নেই',
                    field_name_placeholder: 'ফিল্ডের নাম',
                    field_type_placeholder: 'টাইপ নির্বাচন করুন',
                    add_field: 'ফিল্ড যোগ করুন',
                    no_fields_tooltip:
                        'এই কাস্টম টাইপের জন্য কোনো ফিল্ড সংজ্ঞায়িত নেই',
                    custom_type_actions: {
                        title: 'ক্রিয়া',
                        highlight_fields: 'ফিল্ড হাইলাইট করুন',
                        delete_custom_type: 'মুছুন',
                        clear_field_highlight: 'হাইলাইট সরান',
                    },
                    delete_custom_type: 'টাইপ মুছুন',
                },
            },
            conversations_section: {
                title: 'কথোপকথন',
                tabs_label: 'কথোপকথন',
                tabs: {
                    active: 'সক্রিয়',
                    archives: 'আর্কাইভ করা',
                },
                loading: 'কথোপকথন লোড হচ্ছে…',
                filter: 'ফিল্টার',
                clear: 'ফিল্টার সাফ করুন',
                no_results_title: 'কোনো ফলাফল নেই',
                no_results_description:
                    'আপনার ফিল্টারের সাথে মিলে যাওয়া কোনো কথোপকথন পাওয়া যায়নি।',

                type_filter: {
                    trigger: 'প্রকার',
                    label: 'প্রকার অনুযায়ী ফিল্টার',
                    trigger_aria: 'কথোপকথনের প্রকার অনুযায়ী ফিল্টার',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'আবার চেষ্টা করুন',
                dismiss: 'Dismiss',
                read_only: 'শুধু পঠনযোগ্য',
                deleted_user: 'মুছে ফেলা ব্যবহারকারী',
                unread: {
                    badge_aria: '{{count}} অপঠিত বার্তা',
                },
                inactive: {
                    title: 'কথোপকথন unavailable',
                    description:
                        'কথোপকথন are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'কোনো কথোপকথন নেই',
                    active_description: 'শুরু করতে একটি কথোপকথন তৈরি করুন',
                    archives_title: 'No archived কথোপকথন',
                    archives_description:
                        'Archived কথোপকথন will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load কথোপকথন',
                    load_description:
                        'Something went wrong while loading কথোপকথন. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'কথোপকথন খুলুন',
                    start: 'কথোপকথন শুরু করুন',
                    pending: 'কথোপকথন শুরু হচ্ছে…',
                    diagram_name: 'ডায়াগ্রাম',
                    open_aria: '{{name}}-এর জন্য কথোপকথন খুলুন',
                    start_aria: '{{name}}-এর জন্য কথোপকথন শুরু করুন',
                    open_tooltip: '{{name}}-এর জন্য কথোপকথন খুলুন',
                    start_tooltip: '{{name}}-এর জন্য কথোপকথন শুরু করুন',
                    pending_tooltip: '{{name}}-এর জন্য কথোপকথন শুরু হচ্ছে…',
                    action_tooltip: 'কথোপকথন',
                    unavailable_description:
                        'আপনি এই ডায়াগ্রামে কথোপকথন শুরু করতে পারবেন না।',
                    errors: {
                        validation: 'এই লক্ষ্যটি কথোপকথনের জন্য বৈধ নয়।',
                        forbidden: 'এই কথোপকথন শুরু করার অনুমতি আপনার নেই।',
                        not_found: 'এই লক্ষ্যটি ডায়াগ্রামে আর উপলব্ধ নেই।',
                        conflict:
                            'এই মুহূর্তে কথোপকথন শুরু করা যায়নি। আবার চেষ্টা করুন।',
                        generic: 'এই কথোপকথন খোলা যায়নি। আবার চেষ্টা করুন।',
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
                    message_count: '{{count}}টি বার্তা',
                    no_messages: 'এখনও কোনো বার্তা নেই',
                    last_activity: 'সর্বশেষ কার্যকলাপ',
                    open_aria: '{{target}}-এর জন্য কথোপকথন খুলুন',
                    focus_target_aria: 'ডায়াগ্রামে {{target}} দেখান',
                    author_tooltip: '{{name}}-এর শেষ বার্তা',
                    author_missing_tooltip: 'লেখকের তথ্য নেই',
                    actions: {
                        menu_aria: 'কথোপকথনের বিকল্প',
                        open: 'খুলুন',
                        delete: 'মুছুন',
                    },
                    delete_dialog: {
                        title: 'কথোপকথন মুছবেন?',
                        description:
                            'এটি এই কথোপকথন এবং এর সমস্ত বার্তা স্থায়ীভাবে মুছে ফেলবে।',
                        cancel: 'বাতিল',
                        confirm: 'মুছুন',
                        deleting: 'মুছে ফেলা হচ্ছে…',
                        errors: {
                            delete_failed:
                                'এই কথোপকথন মুছতে পারা যায়নি। আবার চেষ্টা করুন।',
                            forbidden: 'এই কথোপকথন মুছতে আপনার অনুমতি নেই।',
                            not_found: 'এই কথোপকথন আর উপলব্ধ নেই।',
                        },
                    },
                },
                detail: {
                    back: 'পিছনে',
                    back_aria: 'কথোপকথনের তালিকায় ফিরে যান',
                    loading: 'বার্তা লোড হচ্ছে…',
                    loading_more: 'পুরনো বার্তা লোড হচ্ছে…',
                    load_older: 'পুরনো বার্তা লোড করুন',
                    new_messages_badge_one: '১টি নতুন বার্তা',
                    new_messages_badge_other: '{{count}}টি নতুন বার্তা',
                    new_messages_badge_label_one: 'নতুন বার্তা',
                    new_messages_badge_label_other: 'নতুন বার্তা',
                    new_messages_badge_aria_one: 'নতুন বার্তায় যান',
                    new_messages_badge_aria_other:
                        '{{count}}টি নতুন বার্তায় যান',
                    empty: {
                        title: 'কোনো বার্তা নেই',
                        description: 'এই কথোপকথনে কোনো বার্তা নেই।',
                    },
                    errors: {
                        load_title: 'বার্তা লোড করা যায়নি',
                        load_description:
                            'বার্তা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                    },
                    archive_banner: {
                        title: 'আর্কাইভ করা কথোপকথন',
                        description:
                            'এই কথোপকথন শুধুমাত্র পঠনযোগ্য। বার্তা যোগ, সম্পাদনা বা মুছে ফেলা যাবে না।',
                    },
                    metadata: {
                        status_label: 'অবস্থা',
                        status_active: 'সক্রিয়',
                        status_archived: 'আর্কাইভ করা',
                        message_count_label: 'বার্তার সংখ্যা',
                        message_count: '{{count}}টি বার্তা',
                    },
                    message: {
                        edited: '(সম্পাদিত)',
                        edited_aria: 'বার্তা সম্পাদিত হয়েছে',
                        day_separator: {
                            today: 'আজ',
                            yesterday: 'গতকাল',
                        },
                        actions: {
                            title: 'বার্তার ক্রিয়া',
                            edit: 'সম্পাদনা',
                            delete: 'মুছুন',
                        },
                        reactions: {
                            add_aria: 'প্রতিক্রিয়া যোগ করুন',
                            add_tooltip: 'প্রতিক্রিয়া যোগ করুন',
                            picker_loading: 'ইমোজি পিকার লোড হচ্ছে…',
                            picker_aria_label: 'ইমোজি পিকার',
                            picker_search_placeholder: 'ইমোজি খুঁজুন…',
                            picker_empty: 'কোনো ইমোজি পাওয়া যায়নি।',
                            chip_aria: '{{emoji}} প্রতিক্রিয়া, {{count}}',
                            preview_and_others_one: 'এবং আরও {{count}}',
                            preview_and_others_other: 'এবং আরও {{count}}',
                            errors: {
                                generic:
                                    'প্রতিক্রিয়া আপডেট করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
                                forbidden:
                                    'আপনার এই বার্তায় প্রতিক্রিয়া জানানোর অনুমতি নেই।',
                                archived:
                                    'এই কথোপকথন আর্কাইভ করা হয়েছে এবং প্রতিক্রিয়াগুলো শুধু পঠনযোগ্য।',
                                not_found: 'এই বার্তা আর উপলব্ধ নেই।',
                                invalid_emoji: 'এই ইমোজি বৈধ নয়।',
                            },
                        },
                    },
                    composer: {
                        label: 'বার্তা',
                        placeholder: 'একটি বার্তা লিখুন…',
                        submit: 'পাঠান',
                        submitting: 'পাঠানো হচ্ছে…',
                        form_aria_label: 'নতুন কথোপকথন বার্তা',
                        keyboard_hint:
                            'পাঠাতে Enter চাপুন। নতুন লাইনের জন্য Shift+Enter।',
                        counter_aria_label: '{{count}} / {{max}} অক্ষর ব্যবহৃত',
                        errors: {
                            empty: 'পাঠানোর জন্য একটি বার্তা লিখুন।',
                            too_long: 'বার্তা ২০০০ অক্ষরের বেশি হতে পারবে না।',
                            create_failed:
                                'বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।',
                        },
                    },
                    edit: {
                        label: 'বার্তা',
                        form_aria_label: 'কথোপকথন বার্তা সম্পাদনা',
                        save: 'সংরক্ষণ',
                        saving: 'সংরক্ষণ করা হচ্ছে…',
                        cancel: 'বাতিল',
                        counter_aria_label: '{{count}} / {{max}} অক্ষর ব্যবহৃত',
                        errors: {
                            empty: 'সংরক্ষণের জন্য একটি বার্তা লিখুন।',
                            too_long: 'বার্তা ২০০০ অক্ষরের বেশি হতে পারবে না।',
                            update_failed:
                                'বার্তা আপডেট করা যায়নি। আবার চেষ্টা করুন।',
                        },
                    },
                    delete_dialog: {
                        title: 'বার্তা মুছুন',
                        description:
                            'আপনি কি নিশ্চিত যে এই বার্তাটি মুছতে চান? এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।',
                        cancel: 'বাতিল',
                        confirm: 'মুছুন',
                        deleting: 'মুছে ফেলা হচ্ছে…',
                        errors: {
                            delete_failed:
                                'এই বার্তা মুছে ফেলা যায়নি। আবার চেষ্টা করুন।',
                        },
                    },
                    mutation_errors: {
                        forbidden: 'এই বার্তা পরিবর্তনের অনুমতি আপনার নেই।',
                        archived: 'এই কথোপকথন সংরক্ষিত এবং শুধুমাত্র পঠনযোগ্য।',
                        not_found: 'এই কথোপকথন বা বার্তা আর উপলব্ধ নেই।',
                    },
                },

                targets: {
                    diagram: 'ডায়াগ্রাম',
                    table: 'টেবিল',
                    field: 'ফিল্ড',
                    relationship: 'সম্পর্ক',
                    unknown: 'কথোপকথন',
                },
                target_labels: {
                    diagram: 'ডায়াগ্রাম',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'মুছে ফেলা টেবিল',
                    missing_field: 'মুছে ফেলা ফিল্ড',
                    missing_relationship: 'মুছে ফেলা সম্পর্ক',
                    unknown: 'কথোপকথন',
                },
            },
            activities_section: {
                title: 'কার্যকলাপ',
                filter: 'ফিল্টার',
                clear: 'ফিল্টার মুছুন',
                no_results:
                    'আপনার ফিল্টারের সাথে মিলে এমন কোনো কার্যকলাপ পাওয়া যায়নি।',
                loading: 'কার্যকলাপ লোড হচ্ছে…',
                retry: 'পুনরায় চেষ্টা করুন',
                type_filter: {
                    trigger: 'ধরন',
                    label: 'ধরন অনুযায়ী ফিল্টার',
                    trigger_aria: 'কার্যকলাপের ধরন অনুযায়ী ফিল্টার',
                },
                types: {
                    diagram: 'ডায়াগ্রাম',
                    table: 'টেবিল',
                    field: 'ফিল্ড',
                    relationship: 'সম্পর্ক',
                    note: 'নোট',
                    area: 'এলাকা',
                    dependency: 'নির্ভরতা',
                },
                you: 'আপনি',
                unknown_user: 'কেউ একজন',
                empty_state: {
                    title: 'এখনও কোনো কার্যকলাপ নেই',
                    description:
                        'সাম্প্রতিক পরিবর্তন দেখতে সম্পাদনা শুরু করুন।',
                },
                errors: {
                    load_failed: 'কার্যকলাপ লোড করা যায়নি।',
                },
                actions: {
                    add_tables: '{{user}} টেবিল {{table}} যোগ করেছেন',
                    remove_tables: '{{user}} একটি টেবিল সরিয়েছেন',
                    add_field: '{{user}} ফিল্ড {{field}} যোগ করেছেন',
                    remove_field: '{{user}} একটি ফিল্ড সরিয়েছেন',
                    update_field: '{{user}} ফিল্ড {{field}} আপডেট করেছেন',
                    add_relationships: '{{user}} একটি সম্পর্ক যোগ করেছেন',
                    remove_relationships: '{{user}} একটি সম্পর্ক সরিয়েছেন',
                    update_relationship: '{{user}} একটি সম্পর্ক আপডেট করেছেন',
                    add_notes: '{{user}} একটি নোট যোগ করেছেন',
                    remove_notes: '{{user}} একটি নোট সরিয়েছেন',
                    add_areas: '{{user}} একটি এলাকা যোগ করেছেন',
                    remove_areas: '{{user}} একটি এলাকা সরিয়েছেন',
                    add_dependencies: '{{user}} একটি নির্ভরতা যোগ করেছেন',
                    remove_dependencies: '{{user}} একটি নির্ভরতা সরিয়েছেন',
                    fallback: '{{user}} ডায়াগ্রাম আপডেট করেছেন',
                },
            },
            share_section: {
                title: 'শেয়ার',
                tabs_label: 'শেয়ার বিকল্প',
                tabs: {
                    collaborators: 'সহযোগী',
                    public_link: 'পাবলিক লিংক',
                },
                collaborators: {
                    description:
                        'সম্পাদক বা দর্শক অ্যাক্সেস সহ সহযোগীদের আমন্ত্রণ জানান। তাদের ইতিমধ্যে FoxalDB অ্যাকাউন্ট থাকতে হবে।',
                    filter: 'ফিল্টার',
                    clear: 'ফিল্টার মুছুন',
                    no_results_title: 'কোনো ফলাফল নেই',
                    no_results_description:
                        'আপনার ফিল্টারের সাথে মিলে এমন কোনো সহযোগী নেই।',
                    role_filter: {
                        trigger: 'ভূমিকা',
                        label: 'ভূমিকা অনুযায়ী ফিল্টার',
                        trigger_aria: 'সহযোগীর ভূমিকা অনুযায়ী ফিল্টার',
                    },
                },
                public_link: {
                    title: 'পাবলিক লিংক',
                    description:
                        'লিংক থাকা যে কারো সাথে আপনার ডায়াগ্রামের শুধুমাত্র-পঠনযোগ্য স্ন্যাপশট শেয়ার করুন।',
                    coming_soon: 'শীঘ্রই আসছে।',
                },
                loading: 'সহযোগী লোড হচ্ছে…',
                retry: 'আবার চেষ্টা করুন',
                errors: {
                    load_failed: 'সহযোগী লোড করা যায়নি।',
                },
                member_actions: {
                    title: 'সহযোগীর ক্রিয়াকলাপ',
                    trigger_aria: 'সহযোগীর ক্রিয়াকলাপ',
                    role: 'ভূমিকা',
                    remove: 'সহযোগী সরান',
                },
            },
        },

        toolbar: {
            zoom_in: 'জুম ইন',
            zoom_out: 'জুম আউট',
            save: 'সংরক্ষণ করুন',
            show_all: 'সব দেখান',
            undo: 'পূর্বাবস্থায় ফিরুন',
            redo: 'পুনরায় করুন',
            reorder_diagram: 'স্বয়ংক্রিয় ডায়াগ্রাম সাজান',
            highlight_overlapping_tables: 'ওভারল্যাপিং টেবিল হাইলাইট করুন',

            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            filter: 'টেবিল ফিল্টার করুন',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'আপনার ডাটাবেস বেছে নিন',
                description:
                    'আপনার নতুন ডায়াগ্রামের জন্য ডাটাবেস সিস্টেম নির্বাচন করুন।',
                search_placeholder: 'ডাটাবেস ম্যানেজমেন্ট সিস্টেম খুঁজুন…',
                search_no_results:
                    'আপনার অনুসন্ধানের সাথে কোনো ডাটাবেস ম্যানেজমেন্ট সিস্টেম মেলেনি।',
                clear_search: 'অনুসন্ধান মুছুন',
                primary_group: 'প্রাথমিক ডাটাবেস',
                other_group: 'অন্যান্য ডাটাবেস',
                check_examples_long: 'উদাহরণ দেখুন',
                check_examples_short: 'উদাহরণ',
            },

            choose_intent: {
                title: 'আপনি কী করতে চান?',
                description:
                    '{{database}}-এর জন্য একটি নতুন ডায়াগ্রাম তৈরি করুন।',
                create_empty: 'খালি ডায়াগ্রাম তৈরি করুন',
                create_empty_description:
                    'নিজে টেবিল যোগ করে শূন্য থেকে শুরু করুন।',
                import: 'আমদানি',
                import_description:
                    'ফাইল, পেস্ট করা টেক্সট বা আপনার ডাটাবেস থেকে।',
                back: 'পিছনে',
            },

            choose_import_method: {
                title: 'আপনি কীভাবে আমদানি করতে চান?',
                description:
                    'আপনার {{database}} ডায়াগ্রামের জন্য উৎস বেছে নিন।',
                from_file: 'ফাইল বা পেস্ট করা টেক্সট',
                from_file_description: 'SQL, DBML বা ডায়াগ্রাম JSON।',
                from_database: 'বিদ্যমান ডাটাবেস',
                from_database_description:
                    'আপনার ডাটাবেসে কোয়েরি চালান এবং ফলাফল পেস্ট করুন।',
                back: 'পিছনে',
            },

            import_from_database: {
                title: 'বিদ্যমান ডাটাবেস থেকে আমদানি করুন',
                description:
                    'যখন আপনার কাছে SQL বা DBML স্কিমা ফাইল নেই তখন এটি ব্যবহার করুন। আপনার ডাটাবেসে কোয়েরি চালান, তারপর নিচে ফলাফল পেস্ট করুন।',
                database_edition: 'ডাটাবেস সংস্করণ',
                edition_regular: 'নিয়মিত',
                run_query: 'আপনার ডাটাবেসে এই কোয়েরি চালান',
                client_sql: 'SQL',
                paste_result: 'ফলাফল পেস্ট করুন',
                paste_result_placeholder: 'কোয়েরির ফলাফল এখানে পেস্ট করুন…',
                check_result: 'ফলাফল পরীক্ষা করুন',
                valid_result: 'ফলাফল বৈধ বলে মনে হচ্ছে।',
                invalid_result:
                    'ফলাফল যাচাই করা যায়নি। বিষয়বস্তু পরীক্ষা করে আবার চেষ্টা করুন।',
                truncated_result:
                    'ফলাফলটি কাটা হতে পারে। SQL ক্লায়েন্ট সেটিংস সামঞ্জস্য করে কোয়েরি আবার চালান।',
                waiting_for_result: 'চালিয়ে যেতে কোয়েরির ফলাফল পেস্ট করুন।',
                unsupported_database:
                    'এই ডাটাবেস ধরনের জন্য স্কিমা এক্সট্রাকশন উপলব্ধ নয়।',
                import_failed:
                    'ডাটাবেস স্কিমা আমদানি করা যায়নি। ফলাফল পরীক্ষা করে আবার চেষ্টা করুন।',
                invalid_diagram_json:
                    'The diagram JSON is invalid. Check the file and try again.',
                back: 'পিছনে',
                import: 'আমদানি করুন',
            },

            import_schema: {
                title: 'আপনার স্কিমা পেস্ট করুন',
                textarea_label: 'স্কিমার বিষয়বস্তু',
                textarea_placeholder:
                    'এখানে SQL, DBML বা JSON মেটাডেটা পেস্ট করুন…',
                auto_detect_hint: 'আমরা স্বয়ংক্রিয়ভাবে ফরম্যাট শনাক্ত করব।',
                or_divider: 'অথবা',
                choose_file: 'একটি ফাইল বেছে নিন',
                change_file_aria: 'ফাইল পরিবর্তন করুন, বর্তমান: {{name}}',
                selected_file: 'নির্বাচিত ফাইল: {{name}}',
                back: 'পিছনে',
                import: 'আমদানি করুন',
                mismatch: {
                    title: 'এই স্কিমা {{detected}}-এর মতো দেখাচ্ছে, কিন্তু আপনি {{selected}} নির্বাচন করেছেন।',
                    description:
                        'শনাক্ত করা ডাটাবেসে পরিবর্তন করুন অথবা অন্য একটি বেছে নিতে ফিরে যান।',
                    switch: '{{database}}-এ পরিবর্তন করুন',
                    go_back: 'পিছনে',
                },
                ambiguous: {
                    title: 'উৎস DBMS নির্বাচন করুন',
                    confidence_explanation:
                        'শতাংশ প্রতিটি DBMS-এর জন্য সনাক্ত SQL উপভাষার সাথে মিলের সূচক নির্দেশ করে।',
                    description:
                        'SQL উপভাষা স্বয়ংক্রিয়ভাবে শনাক্ত করা যায়নি। নিশ্চিত করুন এই স্কিমা কোন DBMS থেকে এসেছে।',
                    choose_source: 'উৎস DBMS নির্বাচন করুন',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% আস্থা, স্বয়ংক্রিয় সনাক্তকরণ)',
                    recommended_tooltip: 'স্বয়ংক্রিয়ভাবে শনাক্ত করা DBMS',
                    recommended_aria:
                        '{{database}}, স্বয়ংক্রিয়ভাবে শনাক্ত করা DBMS',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Ready to import this diagram.',
                        mismatch_title: 'DBMS অমিল',
                        mismatch_description:
                            'ফাইলটি {{detected}} নির্দেশ করে, কিন্তু আপনি {{selected}} নির্বাচন করেছিলেন।',
                        unsupported_existing:
                            'Diagram JSON restores a full diagram and cannot be merged into the current one. Export or create a new diagram instead.',
                    },
                    ambiguous: {
                        title: 'Choose the diagram DBMS',
                        description:
                            'এই আমদানির জন্য প্রয়োগ করতে বিকল্পটি নির্বাচন করুন।',
                        choose_source: 'Choose diagram DBMS',
                        candidate: '{{database}}',
                        candidate_with_confidence:
                            '{{database}} ({{percent}}%)',
                        candidate_recommended:
                            '{{database}} (from file, recommended)',
                        confidence_badge: '{{percent}}%',
                        recommended_tooltip: 'DBMS from the diagram file',
                        recommended_aria:
                            '{{database}}, DBMS from the diagram file',
                    },
                },
                detection: {
                    dialect: '{{database}} শনাক্ত হয়েছে',
                    dbml: 'DBML শনাক্ত হয়েছে',
                    metadata_json: 'মেটাডেটা JSON শনাক্ত হয়েছে',
                    diagram_json: 'ডায়াগ্রাম JSON শনাক্ত হয়েছে',
                    sql_ambiguous_title: 'SQL শনাক্ত হয়েছে',
                    sql_ambiguous_description: 'ডাটাবেস শনাক্ত করা যায়নি।',
                    clickhouse_unsupported: 'ClickHouse SQL শনাক্ত হয়েছে',
                    unsupported: 'অসমর্থিত ফরম্যাট',
                },
                errors: {
                    unreadable_file: 'নির্বাচিত ফাইল পড়া যায়নি।',
                    malformed_json: 'JSON বিষয়বস্তু পার্স করা যায়নি।',
                    unsupported: 'স্কিমা আমদানির জন্য এই ফরম্যাট সমর্থিত নয়।',
                    diagram_json:
                        'ডায়াগ্রাম JSON পরিবর্তে ডায়াগ্রাম ফাইল বিকল্প থেকে আমদানি করা যায়।',
                    clickhouse_unsupported:
                        'ClickHouse-এর জন্য SQL DDL আমদানি সমর্থিত নয়। DBML ব্যবহার করুন বা বিদ্যমান ডাটাবেস থেকে আমদানি করুন।',
                    file_too_large: 'নির্বাচিত ফাইল ৫ MB-এর বেশি।',
                    import_failed:
                        'স্কিমা আমদানি করা যায়নি। বিষয়বস্তু পরীক্ষা করে আবার চেষ্টা করুন।',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS নির্দেশনা',
                    title: 'নির্দেশনা',
                    step_1: 'টুলস > অপশন > কোয়েরি ফলাফল > SQL সার্ভারে যান।',
                    step_2: 'যদি আপনি "গ্রিডে ফলাফল" ব্যবহার করেন, তাহলে নন-XML ডেটার জন্য সর্বাধিক চরিত্রগুলি 9999999-এ সেট করুন।',
                },
            },

            cancel: 'বাতিল করুন',
            back: 'ফিরে যান',
            import_from_file: 'ফাইল থেকে আমদানি করুন',
            empty_diagram: 'খালি ডাটাবেস',
            continue: 'চালিয়ে যান',
            import: 'আমদানি করুন',
        },

        share_diagram_dialog: {
            title: 'ডায়াগ্রাম শেয়ার করুন',
            description:
                'সম্পাদক বা দর্শক অ্যাক্সেস সহ সহযোগীদের আমন্ত্রণ জানান। তাদের ইতিমধ্যে একটি FoxalDB অ্যাকাউন্ট থাকতে হবে।',
            share_button: 'শেয়ার করুন',
            empty_members: 'এখনও কোনো সহযোগী নেই।',
            remove: 'সরান',
            roles: {
                owner: 'মালিক',
                editor: 'সম্পাদক',
                viewer: 'দর্শক',
            },
            add_member: {
                title: 'সহযোগী যোগ করুন',
                email_label: 'ইমেল',
                email_placeholder: 'ইমেল ঠিকানা',
                add: 'যোগ করুন',
                adding: 'যোগ করা হচ্ছে…',
                cancel: 'বাতিল',
            },
            errors: {
                load_failed: 'সহযোগীদের লোড করা যায়নি।',
                add_failed: 'সহযোগী যোগ করা যায়নি।',
            },
        },

        diagram_role: {
            owner: 'মালিক',
            editor: 'সম্পাদক',
            viewer: 'দর্শক',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'ডেটাবেস খুলুন',
            description:
                'আপনার নতুন ডায়াগ্রামের জন্য ডাটাবেস সিস্টেম নির্বাচন করুন।',
            table_columns: {
                name: 'নাম',
                created_at: 'তৈরির তারিখ',
                last_modified: 'সর্বশেষ পরিবর্তিত',
                tables_count: 'টেবিল',
            },
            cancel: 'বাতিল করুন',
            open: 'খুলুন',
            new_database: 'নতুন ডেটাবেস',

            diagram_actions: {
                open: 'খুলুন',
                duplicate: 'ডুপ্লিকেট',
                delete: 'মুছুন',
            },
        },

        export_sql_dialog: {
            title: 'SQL রপ্তানি করুন',
            description:
                '{{databaseType}} স্ক্রিপ্টের জন্য আপনার ডায়াগ্রাম স্কিমা রপ্তানি করুন',
            close: 'বন্ধ করুন',
            loading: {
                text: '{{databaseType}} এর জন্য AI SQL তৈরি হচ্ছে...',
                description: 'এতে ৩০ সেকেন্ড পর্যন্ত সময় লাগতে পারে।',
            },
            error: {
                message:
                    'SQL স্ক্রিপ্ট তৈরি করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন বা <0>আমাদের সাথে যোগাযোগ করুন</0>।',
                description:
                    'আপনার OPENAI_TOKEN ব্যবহার করার জন্য বিনামূল্যে অভিজ্ঞতা নিন, ম্যানুয়াল <0>এখানে দেখুন</0>।',
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
            title: 'সম্পর্ক তৈরি করুন',
            primary_table: 'প্রাথমিক টেবিল',
            primary_field: 'প্রাথমিক ক্ষেত্র',
            referenced_table: 'রেফারেন্স করা টেবিল',
            referenced_field: 'রেফারেন্স করা ক্ষেত্র',
            primary_table_placeholder: 'টেবিল নির্বাচন করুন',
            primary_field_placeholder: 'ক্ষেত্র নির্বাচন করুন',
            referenced_table_placeholder: 'টেবিল নির্বাচন করুন',
            referenced_field_placeholder: 'ক্ষেত্র নির্বাচন করুন',
            no_tables_found: 'কোন টেবিল পাওয়া যায়নি',
            no_fields_found: 'কোন ক্ষেত্র পাওয়া যায়নি',
            create: 'তৈরি করুন',
            cancel: 'বাতিল করুন',
        },

        import_database_dialog: {
            title: 'বর্তমান চিত্রে আমদানি করুন',
            import_schema: {
                title: 'স্কিমা আমদানি করুন',
                import: 'আমদানি',
                cancel: 'বাতিল',
                mismatch: {
                    title: 'এই স্কিমাটি {{detected}}-এর মতো দেখাচ্ছে, কিন্তু এই ডায়াগ্রামটি {{selected}}।',
                    description: 'ক্রস-ডাটাবেস আমদানি এখনও সমর্থিত নয়।',
                    cancel: 'বাতিল',
                },
                ambiguous: {
                    description:
                        'SQL ডায়ালেক্ট স্বয়ংক্রিয়ভাবে চিহ্নিত করা যায়নি। বর্তমান {{selected}} ডায়াগ্রামের জন্য এই স্কিমা কীভাবে ব্যাখ্যা করবেন তা নিশ্চিত করুন।',
                },
            },
            override_alert: {
                title: 'ডাটাবেস আমদানি করুন',
                content: {
                    alert: 'এই চিত্র আমদানির ফলে বিদ্যমান টেবিল ও সম্পর্ক প্রভাবিত হবে।',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> নতুন টেবিল যোগ করা হবে।',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> নতুন সম্পর্ক তৈরি করা হবে।',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> টেবিল ওভাররাইট করা হবে।',
                    proceed: 'আপনি কি এগিয়ে যেতে চান?',
                },
                import: 'আমদানি করুন',
                cancel: 'বাতিল করুন',
            },
        },

        export_image_dialog: {
            title: 'চিত্র রপ্তানি করুন',
            description: 'রপ্তানির জন্য স্কেল ফ্যাক্টর নির্বাচন করুন:',
            scale_1x: '1x (নিম্ন মান)',
            scale_2x: '2x (সাধারণ মান)',
            scale_4x: '4x (সেরা মান)',
            cancel: 'বাতিল করুন',
            export: 'রপ্তানি করুন',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'স্কিমা নির্বাচন করুন',
            description:
                'বর্তমানে অনেক স্কিমা প্রদর্শিত হচ্ছে। নতুন টেবিলের জন্য একটি নির্বাচন করুন।',
            cancel: 'বাতিল করুন',
            confirm: 'নিশ্চিত করুন',
        },

        update_table_schema_dialog: {
            title: 'স্কিমা পরিবর্তন করুন',
            description: 'টেবিল "{{tableName}}" এর জন্য স্কিমা আপডেট করুন',
            cancel: 'বাতিল করুন',
            confirm: 'পরিবর্তন করুন',
        },
        create_table_schema_dialog: {
            title: 'নতুন স্কিমা তৈরি করুন',
            description:
                'এখনও কোনো স্কিমা নেই। আপনার টেবিলগুলি সংগঠিত করতে আপনার প্রথম স্কিমা তৈরি করুন।',
            create: 'তৈরি করুন',
            cancel: 'বাতিল করুন',
        },
        export_diagram_dialog: {
            title: 'চিত্র রপ্তানি করুন',
            description: 'রপ্তানির জন্য ফরম্যাট নির্বাচন করুন:',
            format_json: 'JSON',
            cancel: 'বাতিল করুন',
            export: 'রপ্তানি করুন',
            error: {
                title: 'চিত্র রপ্তানিতে ত্রুটি',
                description:
                    'কিছু ভুল হয়েছে। সাহায্যের প্রয়োজন? support@chartdb.io-এ যোগাযোগ করুন।',
            },
        },

        import_diagram_dialog: {
            title: 'চিত্র আমদানি করুন',
            description: 'নীচে ডায়াগ্রাম JSON পেস্ট করুন:',
            cancel: 'বাতিল করুন',
            import: 'আমদানি করুন',
            error: {
                title: 'চিত্র আমদানিতে ত্রুটি',
                description:
                    'ডায়াগ্রাম JSON অবৈধ। অনুগ্রহ করে JSON পরীক্ষা করুন এবং আবার চেষ্টা করুন। সাহায্যের প্রয়োজন? support@chartdb.io-এ যোগাযোগ করুন।',
            },
        },
        // TODO: Translate
        import_dbml_dialog: {
            example_title: 'Import Example DBML',
            title: 'Import DBML',
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
            one_to_one: 'এক থেকে এক',
            one_to_many: 'এক থেকে অনেক',
            many_to_one: 'অনেক থেকে এক',
            many_to_many: 'অনেক থেকে অনেক',
        },

        canvas_context_menu: {
            new_table: 'নতুন টেবিল',
            new_view: 'নতুন ভিউ',
            new_relationship: 'নতুন সম্পর্ক',
            // TODO: Translate
            new_area: 'নতুন এলাকা',
            new_note: 'নতুন নোট',
        },

        table_node_context_menu: {
            edit_table: 'টেবিল সম্পাদনা করুন',
            duplicate_table: 'টেবিল নকল করুন',
            delete_table: 'টেবিল মুছে ফেলুন',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'এলাকায় সরান',
            no_area: 'কোনো এলাকা নেই',
        },

        canvas: {
            all_tables_hidden: 'সব টেবিল লুকানো আছে',
            show_all_tables: 'সব দেখান',
        },

        canvas_filter: {
            title: 'টেবিল ফিল্টার করুন',
            search_placeholder: 'টেবিল খুঁজুন...',
            group_by_schema: 'স্কিমা অনুযায়ী গ্রুপ করুন',
            group_by_area: 'এলাকা অনুযায়ী গ্রুপ করুন',
            no_tables_found: 'কোনো টেবিল পাওয়া যায়নি',
            empty_diagram_description: 'শুরু করতে একটি টেবিল তৈরি করুন',
            no_tables_description: 'আপনার অনুসন্ধান বা ফিল্টার সামঞ্জস্য করুন',
            clear_filter: 'ফিল্টার মুছুন',
        },

        snap_to_grid_tooltip: 'গ্রিডে স্ন্যাপ করুন (অবস্থান {{key}})',

        editing_conflict: {
            one: '{{name}} এটাও সম্পাদনা করছেন।',
            two: '{{name1}} এবং {{name2}} এটাও সম্পাদনা করছেন।',
            many: '{{name}} এবং আরও {{count}} জন এটাও সম্পাদনা করছেন।',
            fallback_name: 'সহযোগী',
            last_writer_wins:
                'পরিবর্তনগুলি লক করা নেই। শেষ সংরক্ষিত সম্পাদনাই প্রাধান্য পাবে।',
        },

        tool_tips: {
            double_click_to_edit: 'সম্পাদনা করতে ডাবল-ক্লিক করুন',
        },

        auth: {
            dialog: {
                account_title: 'অ্যাকাউন্ট',
                login_title: 'FoxalDB-তে সাইন ইন করুন',
                register_title: 'FoxalDB অ্যাকাউন্ট তৈরি করুন',
                account_description: 'আপনার বর্তমান সেশন পরিচালনা করুন।',
                login_description:
                    'আরও ডায়াগ্রাম সংরক্ষণ ও সিঙ্ক করতে সাইন ইন করুন।',
                register_description:
                    'আরও ডায়াগ্রাম সংরক্ষণ করতে একটি অ্যাকাউন্ট তৈরি করুন।',
                checking_session: 'সেশন পরীক্ষা করা হচ্ছে...',
                continue_without_account: 'অ্যাকাউন্ট ছাড়াই চালিয়ে যান',
            },
            login: {
                title: 'লগ ইন',
                email_label: 'ইমেইল',
                password_label: 'পাসওয়ার্ড',
                submit: 'সাইন ইন',
                submitting: 'সাইন ইন হচ্ছে...',
                switch_to_register: 'নিবন্ধন',
                no_account: 'অ্যাকাউন্ট নেই?',
            },
            register: {
                title: 'নিবন্ধন',
                first_name_label: 'নামের প্রথম অংশ',
                last_name_label: 'নামের শেষ অংশ',
                email_label: 'ইমেইল',
                password_label: 'পাসওয়ার্ড',
                password_confirmation_label: 'পাসওয়ার্ড নিশ্চিত করুন',
                submit: 'অ্যাকাউন্ট তৈরি করুন',
                submitting: 'অ্যাকাউন্ট তৈরি হচ্ছে...',
                switch_to_login: 'লগ ইন',
                already_have_account: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
            },
            account: {
                signed_in_as: 'সাইন ইন করা হয়েছে',
                logout: 'লগ আউট',
                back_to_editor: 'এডিটরে ফিরে যান',
            },
            settings: {
                title: 'ব্যবহারকারী সেটিংস',
                description: 'আপনার ব্যক্তিগত তথ্য এবং পাসওয়ার্ড আপডেট করুন।',
                change_password_heading: 'পাসওয়ার্ড পরিবর্তন করুন',
                current_password_label: 'বর্তমান পাসওয়ার্ড',
                new_password_label: 'নতুন পাসওয়ার্ড',
                password_confirmation_label: 'নতুন পাসওয়ার্ড নিশ্চিত করুন',
                first_name_label: 'নামের প্রথম অংশ',
                last_name_label: 'পদবি',
                email_label: 'ইমেল ঠিকানা',
                submit: 'পরিবর্তন সংরক্ষণ করুন',
                submitting: 'সংরক্ষণ করা হচ্ছে...',
                success_title: 'প্রোফাইল আপডেট হয়েছে',
                success_description: 'আপনার প্রোফাইল সংরক্ষিত হয়েছে।',
            },
            nav: {
                sign_in: 'সাইন ইন',
                logout: 'লগ আউট',
                loading: '...',
                user_menu: 'অ্যাকাউন্ট',
                settings: 'সেটিংস',
                change_language: 'ভাষা',
            },
            pages: {
                login_title: 'FoxalDB — লগ ইন',
                register_title: 'FoxalDB — নিবন্ধন',
                checking_session: 'সেশন পরীক্ষা করা হচ্ছে…',
            },
            errors: {
                first_name_required: 'নামের প্রথম অংশ প্রয়োজন।',
                last_name_required: 'নামের শেষ অংশ প্রয়োজন।',
                generic: 'কিছু ভুল হয়েছে।',
            },
        },

        guest_migration_dialog: {
            title: 'স্থানীয় ডায়াগ্রাম ইমপোর্ট করবেন?',
            description:
                'এই ডিভাইসে একটি ডায়াগ্রাম সংরক্ষিত আছে। যেকোনো জায়গা থেকে অ্যাক্সেস করতে আপনার অ্যাকাউন্টে ইমপোর্ট করুন।',
            import: 'অ্যাকাউন্টে ইমপোর্ট করুন',
            continue_without_import: 'ইমপোর্ট না করে চালিয়ে যান',
        },

        guest_migration_errors: {
            import_failed:
                'স্থানীয় ডায়াগ্রাম ইমপোর্ট করা যায়নি। স্থানীয় কপি সংরক্ষিত রয়েছে।',
            activation_failed:
                'ডায়াগ্রাম তৈরি হয়েছে কিন্তু খোলা যায়নি। স্থানীয় কপি সংরক্ষিত রয়েছে।',
            cleanup_failed:
                'ডায়াগ্রাম ইমপোর্ট হয়েছে কিন্তু স্থানীয় কপি মুছে ফেলা যায়নি। আপনি ম্যানুয়ালি মুছতে পারেন।',
            check_failed: 'স্থানীয় ডায়াগ্রাম পড়া যায়নি।',
        },

        language_select: {
            change_language: 'ভাষা পরিবর্তন করুন',
        },

        on: 'চালু',
        off: 'বন্ধ',
    },
};

export const bnMetadata: LanguageMetadata = {
    name: 'Bengali (Bangladesh)',
    nativeName: 'বাংলা (বাংলাদেশ)',
    code: 'bn',
    countryCode: 'bd',
};
