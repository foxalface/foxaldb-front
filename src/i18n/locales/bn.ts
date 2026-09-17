import type { LanguageMetadata, LanguageTranslation } from '../types';
import { railsExportNoteMessages } from '../rails-export-notes/bn';
import { djangoExportNoteMessages } from '../django-export-notes/bn';

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
                from_file_description:
                    'SQL, DBML, JSON, প্রকল্প আর্কাইভ (.zip).',
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
                choose_file_or_project: 'একটি ফাইল বা প্রকল্প বেছে নিন',
                supported_formats_hint:
                    'সমর্থিত: SQL, DBML, JSON, প্রকল্প আর্কাইভ (.zip)',
                privacy_info: {
                    link_label: 'আরও তথ্য…',
                    title: 'গোপনীয়তা এবং সমর্থিত ফরম্যাট',
                    intro: 'ফাইল বেছে নেওয়ার আগে, আমদানির সময় FoxalDB কীভাবে আপনার ডেটা পরিচালনা করে তা জানুন।',
                    highlights: {
                        no_execution:
                            'আমদানি শুধুমাত্র স্ট্যাটিক বিশ্লেষণ ব্যবহার করে — আপনার কোড কখনো চালানো হয় না।',
                        no_full_upload:
                            'সম্পূর্ণ প্রকল্প আর্কাইভ কখনো সার্ভারে আপলোড হয় না।',
                        filtered_files:
                            'শুধুমাত্র স্কিমা-সংশ্লিষ্ট ফাইল রাখা হয়; .env, vendor/, node_modules/ এবং tests/ বাদ দেওয়া হয়।',
                    },
                    simple_formats_title: 'SQL, DBML এবং JSON',
                    simple_formats_description:
                        'সম্পূর্ণ আপনার ব্রাউজারে প্রক্রিয়া করা হয়। সর্বোচ্চ ফাইলের আকার: {{sizeMb}} MB।',
                    project_archives_title: 'প্রকল্প আর্কাইভ (.zip)',
                    project_archives_description:
                        'আর্কাইভ স্থানীয়ভাবে খোলা হয় এবং শুধুমাত্র স্কিমা-সংশ্লিষ্ট ফাইল বের করা হয়। সর্বোচ্চ আর্কাইভের আকার: {{sizeMb}} MB।',
                    excluded_paths:
                        'কখনো অন্তর্ভুক্ত হয় না: .env, vendor/, node_modules/, tests/ এবং অন্যান্য অ-স্কিমা সোর্স ফাইল।',
                    table: {
                        framework: 'ফ্রেমওয়ার্ক',
                        files: 'বিশ্লেষিত ফাইল',
                        processing: 'প্রক্রিয়াকরণ',
                        processing_local: 'শুধু ব্রাউজার',
                        processing_remote: 'সার্ভার (সাইন-ইন প্রয়োজন)',
                    },
                    frameworks: {
                        laravel: { files: 'database/migrations/*.php' },
                        prisma: { files: 'prisma/schema.prisma' },
                        rails: { files: 'db/schema.rb' },
                        drizzle: { files: 'drizzle/**/*.sql' },
                        entity_framework_core: { files: '*ModelSnapshot.cs' },
                        django: { files: '*/migrations/*.py' },
                    },
                    back: 'ফিরে যান',
                },
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
                    multiple_dbms_title: 'একাধিক DBMS শনাক্ত হয়েছে',
                    selection_help_percentages:
                        'শতাংশ প্রতিটি DBMS-এর জন্য SQL উপভাষার মিল সূচক নির্দেশ করে।',
                    selection_help_recommended:
                        'তারকা প্রস্তাবিত DBMS চিহ্নিত করে।',
                    selection_help_aria: 'শতাংশ এবং সুপারিশ সম্পর্কে সহায়তা',
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
                    recommended_tooltip: 'প্রস্তাবিত DBMS',
                    recommended_aria: '{{database}}, প্রস্তাবিত DBMS',
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
                        selection_help_percentages:
                            'শতাংশ প্রতিটি DBMS-এর জন্য মিল সূচক নির্দেশ করে।',
                        selection_help_recommended:
                            'তারকা ফাইলে উল্লিখিত DBMS চিহ্নিত করে।',
                        selection_help_aria:
                            'শতাংশ এবং সুপারিশ সম্পর্কে সহায়তা',
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
                project: {
                    frameworks: {
                        laravel: 'Laravel',
                        prisma: 'Prisma',
                        drizzle: 'Drizzle',
                        rails: 'Rails',
                        entity_framework_core: 'Entity Framework Core',
                        django: 'Django',
                    },
                    analyzing_project: 'প্রকল্প আর্কাইভ বিশ্লেষণ করা হচ্ছে…',
                    detected: '{{framework}} প্রকল্প শনাক্ত হয়েছে',
                    migrations_found_one: '{{count}}টি মাইগ্রেশন পাওয়া গেছে',
                    migrations_found_other: '{{count}}টি মাইগ্রেশন পাওয়া গেছে',
                    schema_files_found_one:
                        '{{count}}টি স্কিমা ফাইল পাওয়া গেছে',
                    schema_files_found_other:
                        '{{count}}টি স্কিমা ফাইল পাওয়া গেছে',
                    model_snapshots_found_one:
                        '{{count}}টি মডেল স্ন্যাপশট পাওয়া গেছে',
                    model_snapshots_found_other:
                        '{{count}}টি মডেল স্ন্যাপশট পাওয়া গেছে',
                    sql_migrations_found_one:
                        '{{count}}টি SQL মাইগ্রেশন পাওয়া গেছে',
                    sql_migrations_found_other:
                        '{{count}}টি SQL মাইগ্রেশন পাওয়া গেছে',
                    migrations_button_one: '{{count}}টি মাইগ্রেশন',
                    migrations_button_other: '{{count}}টি মাইগ্রেশন',
                    schema_files_button_one: '{{count}}টি স্কিমা ফাইল',
                    schema_files_button_other: '{{count}}টি স্কিমা ফাইল',
                    model_snapshots_button_one: '{{count}}টি মডেল স্ন্যাপশট',
                    model_snapshots_button_other: '{{count}}টি মডেল স্ন্যাপশট',
                    sql_migrations_button_one: '{{count}}টি SQL মাইগ্রেশন',
                    sql_migrations_button_other: '{{count}}টি SQL মাইগ্রেশন',
                    multiple_projects_title:
                        'একাধিক ডাটাবেস স্কিমা শনাক্ত হয়েছে',
                    multiple_projects_description:
                        'এই আর্কাইভে একাধিক সমর্থিত ডাটাবেস প্রকল্প রয়েছে। কোনটি আমদানি করবেন তা বেছে নিন।',
                    multiple_database_groups_title:
                        'একাধিক ডাটাবেস স্কিমা শনাক্ত হয়েছে',
                    multiple_database_groups_description:
                        'এই প্রকল্পে একাধিক ডাটাবেস স্কিমা রয়েছে। কোনটি আমদানি করবেন তা বেছে নিন।',
                    choose_database_group: 'ডাটাবেস স্কিমা বেছে নিন',
                    group_recommended_aria: '{{label}} সুপারিশকৃত',
                    group_recommended_tooltip: 'সুপারিশকৃত স্কিমা',
                    choose_project: 'প্রকল্প বেছে নিন',
                    unsupported_project: 'অসমর্থিত প্রকল্প আর্কাইভ',
                    unsupported_project_description:
                        'এই আর্কাইভে Laravel, Prisma, Drizzle, Rails, Entity Framework Core বা Django ডাটাবেস প্রকল্প পাওয়া যায়নি।',
                    project_root: 'প্রকল্প রুট: {{path}}',
                    sign_in_to_import_framework:
                        'আমদানি উপলব্ধ হলে {{framework}} প্রকল্প আমদানি করতে সাইন ইন করুন।',
                    remote_processing_notice:
                        'আমদানি উপলব্ধ হলে, শুধুমাত্র স্কিমা-সম্পর্কিত ফাইল প্রক্রিয়া করা হবে।',
                    remote_processing_scope:
                        'সম্পূর্ণ আর্কাইভ বা অসম্পর্কিত সোর্স ফাইল কখনো আপলোড করা হয় না।',
                    remote_processing_security:
                        'বিশ্লেষণ স্ট্যাটিক এবং আপলোড করা কোড চালায় না।',
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
                    archive_too_large:
                        'নির্বাচিত প্রকল্প আর্কাইভ ৫০ MB-এর বেশি।',
                    archive_invalid:
                        'নির্বাচিত ফাইলটি বৈধ প্রকল্প আর্কাইভ নয়।',
                    unsupported_file_extension:
                        'শুধুমাত্র .sql, .dbml, .json এবং .zip প্রকল্প আর্কাইভ সমর্থিত।',
                    import_failed:
                        'স্কিমা আমদানি করা যায়নি। বিষয়বস্তু পরীক্ষা করে আবার চেষ্টা করুন।',
                    invalid_diagram_json:
                        'ডায়াগ্রাম JSON অবৈধ। ফাইলটি পরীক্ষা করে আবার চেষ্টা করুন।',
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

        export_wizard: {
            title: 'রপ্তানি',
            description: 'আপনার ডায়াগ্রাম রপ্তানি করতে একটি ফরম্যাট বেছে নিন।',
            back: 'পিছনে',
            sql: {
                target_step: {
                    title: 'SQL এক্সপোর্ট',
                    description:
                        'আপনার {{database}} ডায়াগ্রামের জন্য একটি টার্গেট ডাটাবেস বেছে নিন।',
                    source_label: 'সোর্স ডাটাবেস: {{database}}',
                    same_dialect_description:
                        '{{database}} DDL হিসেবে এক্সপোর্ট',
                    cross_dialect_description:
                        '{{source}} থেকে {{target}}-এ রূপান্তর',
                },
                unsupported_source: {
                    title: '{{database}}-এর জন্য SQL এক্সপোর্ট উপলব্ধ নয়',
                    description:
                        'FoxalDB-তে এই ডাটাবেস টাইপের জন্য নির্ধারক SQL এক্সপোর্ট সমর্থিত নয়।',
                },
                preview_step: {
                    title: 'SQL প্রিভিউ',
                    description:
                        'তৈরি করা {{database}} স্ক্রিপ্ট পর্যালোচনা করুন।',
                    target_label: 'টার্গেট: {{database}}',
                    generating: '{{database}} SQL তৈরি হচ্ছে...',
                    download: 'SQL ডাউনলোড',
                    error: 'SQL তৈরি করা যায়নি। আবার চেষ্টা করুন।',
                    empty: 'বর্তমান ডায়াগ্রামের জন্য কোনো SQL তৈরি হয়নি।',
                },
            },
            sections: {
                database: 'ডেটাবেস',
                framework: 'ফ্রেমওয়ার্ক',
                portable: 'পোর্টেবল / স্কিমা',
                visual: 'ভিজ্যুয়াল',
            },
            targets: {
                sql: {
                    title: 'SQL',
                    description:
                        'বর্তমান ডায়াগ্রামের জন্য ডেটাবেস DDL স্ক্রিপ্ট',
                    description_generic: 'ডেটাবেস DDL স্ক্রিপ্ট',
                },
                dbml: {
                    title: 'DBML',
                    description: 'পোর্টেবল DBML স্কিমা ফাইল',
                    coming_soon:
                        'ফাইল রপ্তানি শীঘ্রই আসছে। সাইড প্যানেলে DBML দেখুন এবং কপি করুন।',
                },
                framework: {
                    coming_soon:
                        'ভবিষ্যতের রপ্তানি মাইলস্টোনের জন্য পরিকল্পিত।',
                },
                diagram_json: {
                    title: 'ডায়াগ্রাম JSON',
                    description: 'পোর্টেবল FoxalDB ডায়াগ্রাম ফাইল',
                },
                laravel: {
                    title: 'Laravel মাইগ্রেশন',
                    description: 'Laravel মাইগ্রেশন ZIP আর্কাইভ',
                },
                prisma: {
                    title: 'Prisma',
                    description: 'Prisma স্কিমা রপ্তানি',
                },
                ef_core: {
                    title: 'EF Core',
                    description: 'Entity Framework Core রপ্তানি',
                },
                rails: {
                    title: 'Rails',
                    description: 'Ruby on Rails স্কিমা রপ্তানি',
                },
                django: {
                    title: 'Django',
                    description: 'Django 6.1 সরাসরি একীকরণযোগ্য অ্যাপ রপ্তানি',
                },
                drizzle: {
                    title: 'Drizzle',
                    description: 'Drizzle স্কিমা রপ্তানি',
                },
                png: {
                    title: 'PNG',
                    description: 'রাস্টার ছবি',
                },
                jpg: {
                    title: 'JPG',
                    description: 'রাস্টার ছবি',
                },
                svg: {
                    title: 'SVG',
                    description: 'ডায়াগ্রামের SVG স্ন্যাপশট',
                },
            },
            dbml: {
                preview_step: {
                    description: 'তৈরি করা DBML স্কিমা পর্যালোচনা করুন।',
                    generating: 'DBML তৈরি হচ্ছে...',
                    download: 'DBML ডাউনলোড',
                    error: 'DBML তৈরি করা যায়নি। আবার চেষ্টা করুন।',
                    empty: 'বর্তমান ডায়াগ্রামের জন্য কোনো DBML তৈরি হয়নি।',
                },
            },
            json: {
                download_step: {
                    description:
                        'এই ডায়াগ্রামের একটি পোর্টেবল অনুলিপি রপ্তানি করুন।',
                    explanation:
                        'সম্পূর্ণ ডায়াগ্রাম রপ্তানি হয়। এই ফাইল আমদানি করলে একটি নতুন ডায়াগ্রাম তৈরি হয়; বর্তমান ডায়াগ্রাম ওভাররাইট হয় না।',
                    filename_label: 'ফাইলের নাম: {{filename}}',
                    download: 'JSON ডাউনলোড',
                },
            },
            visual: {
                options_step: {
                    description:
                        'এই {{format}} ছবি কীভাবে রপ্তানি করবেন তা বেছে নিন।',
                    explanation:
                        'বর্তমানে রেন্ডার করা ডায়াগ্রামের একটি ছবি রপ্তানি করুন।',
                    filename_label: 'ফাইলের নাম: {{filename}}',
                    extent_label: 'রপ্তানির এলাকা',
                    extent_diagram: 'সম্পূর্ণ ডায়াগ্রাম',
                    extent_diagram_description:
                        'বর্তমান ভিউয়ের বাইরের টেবিলসহ বর্তমানে রেন্ডার করা পুরো ডায়াগ্রাম অন্তর্ভুক্ত করুন।',
                    extent_viewport: 'বর্তমান ভিউ',
                    extent_viewport_description:
                        'কেবল ক্যানভাসে এখন যা দেখা যাচ্ছে তা রপ্তানি করুন।',
                    scale_label: 'স্কেল',
                    scale_1x: '1x',
                    scale_2x: '2x',
                    scale_4x: '4x',
                    pattern: 'পটভূমির প্যাটার্ন অন্তর্ভুক্ত করুন',
                    pattern_description:
                        'পটভূমিতে হালকা গ্রিড প্যাটার্ন যোগ করুন।',
                    transparent: 'স্বচ্ছ পটভূমি',
                    transparent_description:
                        'কঠিন পটভূমির রং ছাড়া PNG রপ্তানি করুন।',
                    svg_limitation:
                        'এই SVG ব্রাউজারের জন্য ডায়াগ্রামের একটি স্ন্যাপশট, সম্পূর্ণ সম্পাদনাযোগ্য ভেক্টর ফাইল নয়।',
                    export: 'রপ্তানি',
                    generating: 'ছবি তৈরি করা হচ্ছে...',
                    error: 'ছবি রপ্তানি করা যায়নি। আবার চেষ্টা করুন।',
                    error_canvas:
                        'রপ্তানি করার জন্য ডায়াগ্রাম ক্যানভাস পাওয়া যায়নি।',
                    error_too_large:
                        'এই ডায়াগ্রাম {{scale}} এ রপ্তানি করার জন্য খুব বড়। স্কেল কমান বা বর্তমান ভিউ রপ্তানি করুন।',
                    error_empty: 'ক্যানভাসে রপ্তানি করার মতো কিছু নেই।',
                },
            },
            prisma: {
                unsupported_database:
                    'বর্তমান ডাটাবেস ধরনের জন্য Prisma এক্সপোর্ট উপলব্ধ নয়।',
                version_step: {
                    title: 'Prisma সংস্করণ',
                    description:
                        'আপনার schema.prisma এক্সপোর্টের জন্য Prisma মেজর সংস্করণ বেছে নিন।',
                    prisma_7: 'Prisma 7',
                    prisma_7_recommended: 'সুপারিশকৃত',
                    prisma_6: 'Prisma 6',
                    continue: 'চালিয়ে যান',
                },
                preview_step: {
                    description: 'তৈরি করা Prisma স্কিমা পর্যালোচনা করুন।',
                    generating: 'Prisma স্কিমা তৈরি হচ্ছে...',
                    download: 'schema.prisma ডাউনলোড করুন',
                    generation_error:
                        'Prisma স্কিমা তৈরি করা যায়নি। আবার চেষ্টা করুন।',
                    empty: 'বর্তমান ডায়াগ্রামের জন্য কোনো Prisma স্কিমা তৈরি হয়নি।',
                    limitations: 'সীমাবদ্ধতা',
                    errors: {
                        unsupported_database:
                            'এই ডাটাবেস ধরনের জন্য Prisma এক্সপোর্ট সমর্থিত নয়।',
                        empty_diagram:
                            'ডায়াগ্রামে এক্সপোর্টযোগ্য কোনো টেবিল নেই।',
                        invalid_primary_key:
                            'একটি টেবিলের প্রাথমিক কী কনফিগারেশন অবৈধ।',
                        unsupported_structural_field:
                            'প্রাথমিক বা বিদেশী কী unsupported ফিল্ড ধরন ব্যবহার করছে।',
                        invalid_enum: 'enum সংজ্ঞা এক্সপোর্ট করা যায়নি।',
                    },
                    notes: {
                        view_skipped:
                            'ডাটাবেস ভিউ Prisma স্কিমায় এক্সপোর্ট হয় না।',
                        schema_namespace_unsupported:
                            'এই এক্সপোর্টে টেবিল স্কিমা/নেমস্পেস ম্যাপ করা হয় না।',
                        unsupported_field_omitted:
                            'কিছু unsupported ফিল্ড বাদ দেওয়া হয়েছে।',
                        unsupported_default_omitted:
                            'কিছু unsupported ডিফল্ট মান বাদ দেওয়া হয়েছে।',
                        unsupported_index_omitted:
                            'কিছু ইনডেক্স বাদ দেওয়া হয়েছে।',
                        relation_skipped: 'একটি সম্পর্ক এক্সপোর্ট করা যায়নি।',
                        relation_degraded:
                            'একটি সম্পর্ক কম নির্ভুলতায় এক্সপোর্ট হয়েছে।',
                        composite_fk_unsupported:
                            'কম্পোজিট বিদেশী কী সমর্থিত নয়।',
                        many_to_many_label_only:
                            'জয়েন টেবিল ছাড়া অনেক-থেকে-অনেক সম্পর্ক শুধু লেবেল হিসেবে এক্সপোর্ট হয়।',
                        set_null_omitted:
                            'অসমর্থিত স্থানে ON DELETE SET NULL বাদ দেওয়া হয়েছে।',
                        enum_skipped: 'enum এক্সপোর্ট করা যায়নি।',
                        composite_type_skipped:
                            'কম্পোজিট ধরন এক্সপোর্ট করা যায়নি।',
                    },
                    notes_grouped: {
                        schema_namespace_unsupported:
                            'Table schemas/namespaces are not mapped in this export. ({{count}} tables)',
                        relation_skipped:
                            'Some relationships could not be exported. ({{count}})',
                        relation_degraded:
                            'Some relationships were exported with reduced fidelity. ({{count}})',
                        composite_fk_unsupported:
                            'Composite foreign keys are not supported. ({{count}})',
                        many_to_many_label_only:
                            'Many-to-many relationships without a join table are exported as label-only. ({{count}})',
                        set_null_omitted:
                            'ON DELETE SET NULL was omitted where unsupported. ({{count}})',
                        view_skipped:
                            'Database views are not exported to Prisma schemas. ({{count}})',
                        unsupported_field_omitted:
                            'Some unsupported fields were omitted. ({{count}})',
                        unsupported_default_omitted:
                            'Some unsupported default values were omitted. ({{count}})',
                        unsupported_index_omitted:
                            'Some indexes were omitted. ({{count}})',
                        enum_skipped:
                            'Some enums could not be exported. ({{count}})',
                        composite_type_skipped:
                            'Some composite types could not be exported. ({{count}})',
                        with_count: '{{message}} ({{count}})',
                    },
                },
            },
            ef_core: {
                unsupported_database:
                    'বর্তমান ডেটাবেস ধরনের জন্য EF Core রপ্তানি উপলব্ধ নয়।',
                options_step: {
                    description: 'EF Core মডেল প্রকল্প রপ্তানি কনফিগার করুন।',
                    explanation:
                        'একটি EF Core 10 (.NET 10) মডেল প্রকল্প রপ্তানি করুন। ডেটাবেস প্রদানকারী বর্তমান ডায়াগ্রাম থেকে নির্ধারিত হয়। মাইগ্রেশন তৈরি হয় না; রপ্তানি করা প্রকল্প থেকে আপনি সেগুলো স্থানীয়ভাবে তৈরি করতে পারেন।',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'প্রদানকারী: {{provider}}',
                    migrations_not_generated:
                        'এই রপ্তানিতে মাইগ্রেশন নেই। EF Core CLI দিয়ে স্থানীয়ভাবে মাইগ্রেশন তৈরি করতে তৈরি প্রকল্প ব্যবহার করুন।',
                    namespace: 'নেমস্পেস',
                    namespace_placeholder: 'Acme.Catalog',
                    namespace_help:
                        'তৈরি প্রকল্পের মূল C# নেমস্পেস। সার্ভারকে ডায়াগ্রামের নাম থেকে বেছে নিতে খালি রাখুন।',
                    db_context: 'DbContext',
                    db_context_placeholder: 'CatalogDbContext',
                    db_context_help:
                        'DbContext ক্লাসের নাম। AppDbContext ব্যবহার করতে খালি রাখুন।',
                    export: 'রপ্তানি করুন',
                    generating: 'EF Core প্রকল্প তৈরি হচ্ছে...',
                    error_rate_limited:
                        'অতিরিক্ত রপ্তানি অনুরোধ। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।',
                    error_unexpected:
                        'EF Core প্রকল্প রপ্তানি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
                    error_semantic: 'EF Core প্রকল্প তৈরি করা যায়নি।',
                    error_unauthenticated:
                        'EF Core প্রকল্প রপ্তানি করতে আপনাকে সাইন ইন থাকতে হবে।',
                },
                result_step: {
                    description: 'তৈরি EF Core প্রকল্প পর্যালোচনা করুন।',
                    success: 'EF Core প্রকল্প তৈরি হয়েছে।',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'প্রদানকারী: {{provider}}',
                    generated_files: 'তৈরি ফাইল ({{count}})',
                    notes: 'নোট',
                    download_zip: 'ZIP ডাউনলোড করুন',
                    error_unsafe_path:
                        'রপ্তানিতে একটি অনিরাপদ ফাইল পথ আছে এবং তা ডাউনলোড হয়নি।',
                    error_empty_files: 'রপ্তানিতে কোনো ফাইল ছিল না।',
                },
            },
            rails: {
                unsupported_database:
                    'বর্তমান ডাটাবেস ধরনের জন্য Rails রপ্তানি উপলব্ধ নয়।',
                result_step: {
                    description:
                        'জেনারেট করা Rails 8.1 প্যাকেজ পর্যালোচনা করুন।',
                    explanation:
                        'এই রপ্তানি Rails 8.1-এর জন্য বর্তমান স্কিমার বেসলাইন, পুনর্গঠিত মাইগ্রেশন ইতিহাস নয়। জেনারেট করা README অনুসারে এটি নতুন বা বিদ্যমান Rails অ্যাপে প্রয়োগ করুন।',
                    rails_8_1: 'Rails 8.1',
                    provider_label: 'প্রদানকারী: {{provider}}',
                    generating: 'Rails প্যাকেজ জেনারেট করা হচ্ছে...',
                    success: 'Rails 8.1 প্যাকেজ জেনারেট হয়েছে।',
                    generated_files: 'জেনারেট করা ফাইল ({{count}})',
                    notes_heading: 'নোট',
                    notes: railsExportNoteMessages,
                    download_zip: 'ZIP ডাউনলোড করুন',
                    retry: 'আবার চেষ্টা করুন',
                    error_semantic: 'Rails প্যাকেজ জেনারেট করা যায়নি।',
                    error_unauthenticated:
                        'Rails প্যাকেজ রপ্তানি করতে সাইন ইন করতে হবে।',
                    error_invalid_request:
                        'ডায়াগ্রাম রপ্তানি করা যায়নি। এটি অবৈধ বা খুব বড় হতে পারে।',
                    error_rate_limited:
                        'রপ্তানির অনুরোধ খুব বেশি। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।',
                    error_unexpected:
                        'Rails প্যাকেজ রপ্তানি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
                    error_unsafe_path:
                        'রপ্তানিতে একটি অনিরাপদ ফাইল পথ আছে বলে ডাউনলোড করা হয়নি।',
                    error_empty_files: 'রপ্তানিতে কোনো ফাইল ছিল না।',
                    error_invalid_package:
                        'জেনারেট করা প্যাকেজ অবৈধ বলে ডাউনলোড করা হয়নি।',
                },
            },
            django: {
                unsupported_database:
                    'Django রপ্তানি বর্তমানে PostgreSQL, MySQL, MariaDB এবং SQLite সমর্থন করে।',
                result_step: {
                    description:
                        'জেনারেট করা Django 6.1 প্যাকেজ পর্যালোচনা করুন।',
                    explanation:
                        'এই রপ্তানি সরাসরি একীকরণযোগ্য Django অ্যাপ (`foxaldb_models`)। 0001_initial.py বর্তমান schema-এর প্রাথমিক migration, পুনর্গঠিত Django migration history নয়। Django 6.1-এর বিপক্ষে runtime validation করা হয়নি।',
                    django_version: 'Django {{version}}',
                    provider_label: 'প্রদানকারী: {{provider}}',
                    package_type:
                        'প্যাকেজ: সরাসরি একীকরণযোগ্য Django অ্যাপ (`foxaldb_models`)',
                    generating: 'Django প্যাকেজ জেনারেট হচ্ছে…',
                    success: 'Django 6.1 প্যাকেজ জেনারেট হয়েছে।',
                    generated_files: 'জেনারেট করা ফাইল ({{count}})',
                    notes_heading: 'নোট',
                    warnings_heading: 'সতর্কতা ({{count}})',
                    adaptations_heading: 'কারিগরি অভিযোজন ({{count}})',
                    path_label: 'পথ: {{path}}',
                    notes: djangoExportNoteMessages,
                    download_zip: 'ZIP ডাউনলোড করুন',
                    retry: 'আবার চেষ্টা করুন',
                    error_semantic: 'Django প্যাকেজ জেনারেট করা যায়নি।',
                    error_unauthenticated:
                        'Django প্যাকেজ রপ্তানি করতে সাইন ইন করতে হবে।',
                    error_invalid_request:
                        'ডায়াগ্রাম রপ্তানি করা যায়নি। এটি অবৈধ বা খুব বড় হতে পারে।',
                    error_rate_limited:
                        'অনেক বেশি রপ্তানি অনুরোধ। একটু অপেক্ষা করে আবার চেষ্টা করুন।',
                    error_unexpected:
                        'সার্ভারে Django রপ্তানি ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                    error_network:
                        'সার্ভারে পৌঁছানো যায়নি। আপনার সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
                    error_unsafe_path:
                        'রপ্তানিতে অনিরাপদ ফাইল পথ আছে এবং ডাউনলোড করা হয়নি।',
                    error_empty_files: 'রপ্তানিতে কোনো ফাইল ছিল না।',
                    error_invalid_package:
                        'জেনারেট করা প্যাকেজ অবৈধ বলে ডাউনলোড করা হয়নি।',
                    errors: {
                        unsupported_database:
                            'এই ডেটাবেস ধরনের জন্য Django রপ্তানি উপলব্ধ নয়।',
                        empty_diagram: 'ডায়াগ্রামে রপ্তানিযোগ্য টেবিল নেই।',
                        unsupported_structural_field:
                            '«{{path}}»-এ primary-key field Django-তে represent করা যায় না।',
                        mysql_catalog_collision:
                            '«{{path}}»-এর জন্য catalog সরানোর পর MySQL catalogs collide করে।',
                        mariadb_catalog_collision:
                            '«{{path}}»-এর জন্য catalog সরানোর পর MariaDB catalogs collide করে।',
                    },
                },
            },
            laravel: {
                options_step: {
                    description:
                        'Laravel মাইগ্রেশন কীভাবে রপ্তানি করবেন তা বেছে নিন।',
                    explanation:
                        'বর্তমান ডায়াগ্রাম থেকে Laravel মাইগ্রেশন ফাইলের একটি ZIP তৈরি করুন।',
                    filename_label: 'ফাইলের নাম: {{filename}}',
                    laravel_version: 'Laravel সংস্করণ',
                    include_indexes: 'টেবিল ইনডেক্স অন্তর্ভুক্ত করুন',
                    include_indexes_description:
                        'স্পষ্ট টেবিল ইনডেক্স সংজ্ঞা রপ্তানি করুন। ফিল্ড-স্তরের ইউনিক সীমাবদ্ধতা সবসময় অন্তর্ভুক্ত থাকে।',
                    include_foreign_keys: 'ফরেন কী অন্তর্ভুক্ত করুন',
                    include_foreign_keys_description:
                        'ফরেন কির জন্য আলাদা মাইগ্রেশন ফাইল রপ্তানি করুন।',
                    export: 'রপ্তানি',
                    generating: 'Laravel মাইগ্রেশন তৈরি হচ্ছে...',
                    error: 'Laravel মাইগ্রেশন রপ্তানি করা যায়নি। আবার চেষ্টা করুন।',
                    error_unauthenticated:
                        'Laravel মাইগ্রেশন রপ্তানি করতে সাইন ইন করতে হবে।',
                    error_forbidden: 'এই ডায়াগ্রাম রপ্তানি করার অনুমতি নেই।',
                    error_not_found: 'এই ডায়াগ্রাম খুঁজে পাওয়া যায়নি।',
                    error_empty: 'এই ডায়াগ্রামে রপ্তানিযোগ্য টেবিল নেই।',
                    error_invalid:
                        'ডায়াগ্রাম রপ্তানি করা যায়নি। স্কিমা পরীক্ষা করে আবার চেষ্টা করুন।',
                    error_network:
                        'সার্ভারে পৌঁছানো যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
                },
            },
        },

        export_dialog: {
            title: 'রপ্তানি',
            description: 'আপনার ডায়াগ্রাম রপ্তানি করতে একটি ফরম্যাট বেছে নিন।',
            schema_code_section: 'স্কিমা / কোড',
            visual_section: 'ভিজ্যুয়াল',
            sql: {
                title: 'SQL',
                description: 'বর্তমান ডায়াগ্রামের জন্য ডাটাবেস DDL স্ক্রিপ্ট',
                description_generic: 'ডাটাবেস DDL স্ক্রিপ্ট',
            },
            dbml: {
                title: 'DBML',
                coming_soon:
                    'ফাইল রপ্তানি শীঘ্রই আসছে। সাইডবারে DBML দেখুন এবং কপি করুন।',
            },
            diagram_json: {
                title: 'ডায়াগ্রাম JSON',
                description: 'পোর্টেবল FoxalDB ডায়াগ্রাম ফাইল',
            },
            laravel_migrations: {
                title: 'Laravel মাইগ্রেশন',
                description: 'Laravel মাইগ্রেশন ZIP আর্কাইভ',
            },
            png: {
                title: 'PNG',
                description: 'রাস্টার ছবি',
            },
            jpg: {
                title: 'JPG',
                description: 'রাস্টার ছবি',
            },
            svg: {
                title: 'SVG',
                description: 'ভেক্টর ছবি',
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
                description: 'কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
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
