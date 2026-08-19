import type { LanguageMetadata, LanguageTranslation } from '../types';

export const ne: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'नयाँ',
            browse: 'खोल्नुहोस्',
            tables: 'टेबलहरू',
            refs: 'Refs',
            dependencies: 'निर्भरताहरू',
            custom_types: 'कस्टम प्रकारहरू',
            conversations: 'कुराकानी',
            conversations_unread_aria: 'कुराकानीमा {{count}} नपढिएका सन्देशहरू',
            visuals: 'Visuals',
            activities: 'गतिविधि',
            share: 'साझा गर्नुहोस्',
        },
        menu: {
            actions: {
                actions: 'कार्यहरू',
                new: 'नयाँ...',
                browse: 'सबै डाटाबेसहरू...',
                save: 'सुरक्षित गर्नुहोस्',
                import: 'डाटाबेस आयात गर्नुहोस्',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'SQL निर्यात गर्नुहोस्',
                export_as: 'निर्यात गर्नुहोस्',
                delete_diagram: 'हटाउनुहोस्',
            },
            edit: {
                edit: 'सम्पादन',
                undo: 'पूर्ववत',
                redo: 'पुनः गर्नुहोस्',
                clear: 'स्पष्ट',
            },
            view: {
                view: 'हेर्नुहोस्',
                show_sidebar: 'साइडबार देखाउनुहोस्',
                hide_sidebar: 'साइडबार लुकाउनुहोस्',
                hide_cardinality: 'कार्डिन्यालिटी लुकाउनुहोस्',
                show_cardinality: 'कार्डिन्यालिटी देखाउनुहोस्',
                hide_field_attributes: 'फिल्ड विशेषताहरू लुकाउनुहोस्',
                show_field_attributes: 'फिल्ड विशेषताहरू देखाउनुहोस्',
                zoom_on_scroll: 'स्क्रोलमा जुम गर्नुहोस्',
                show_views: 'डाटाबेस भ्यूहरू',
                theme: 'थिम',
                show_dependencies: 'डिपेन्डेन्सीहरू देखाउनुहोस्',
                hide_dependencies: 'डिपेन्डेन्सीहरू लुकाउनुहोस्',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            // TODO: Translate
            backup: {
                backup: 'Backup',
                export_diagram: 'Export Diagram',
                restore_diagram: 'Restore Diagram',
            },
            help: {
                help: 'मद्दत',
                docs_website: 'कागजात',
                join_discord: 'डिस्कोर्डमा सामिल हुनुहोस्',
            },
        },

        delete_diagram_alert: {
            title: 'डायाग्राम हटाउनुहोस्',
            description:
                'यो कार्य पूर्ववत गर्न सकिँदैन। यो डायाग्राम स्थायी रूपमा हटाउनेछ।',
            cancel: 'रद्द गर्नुहोस्',
            delete: 'हटाउनुहोस्',
        },

        clear_diagram_alert: {
            title: 'डायाग्राम स्पष्ट गर्नुहोस्',
            description:
                'यो कार्य पूर्ववत गर्न सकिँदैन। यो डायाग्राम स्थायी रूपमा हटाउनेछ।',
            cancel: 'रद्द गर्नुहोस्',
            clear: 'स्पष्ट गर्नुहोस्',
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
            title: 'डायाग्राम स्वचालित मिलाउनुहोस्',
            description:
                'यो कार्य पूर्ववत गर्न सकिँदैन। यो डायाग्राम स्थायी रूपमा हटाउनेछ।',
            reorder: 'स्वचालित मिलाउनुहोस्',
            cancel: 'रद्द गर्नुहोस्',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'प्रतिलिपि असफल',
                description: 'क्लिपबोर्ड समर्थित छैन',
            },
            failed: {
                title: 'प्रतिलिपि असफल',
                description: 'केही गडबड भयो। कृपया फेरि प्रयास गर्नुहोस्।',
            },
        },

        theme: {
            system: 'सिस्टम',
            light: 'लाइट',
            dark: 'डार्क',
        },

        zoom: {
            on: 'चालू',
            off: 'बन्द',
        },

        last_saved: 'अन्तिम सुरक्षित',
        saved: 'सुरक्षित',
        loading_diagram: 'डायाग्राम लोड हुँदैछ...',
        deselect_all: 'सबै चयन हटाउनुहोस्',
        select_all: 'सबै चयन गर्नुहोस्',
        clear: 'स्पष्ट',
        show_more: 'थप देखाउनुहोस्',
        show_less: 'कम देखाउनुहोस्',
        copy_to_clipboard: 'क्लिपबोर्डमा प्रतिलिपि गर्नुहोस्',
        copied: 'प्रतिलिपि गरियो!',

        side_panel: {
            view_all_options: 'सबै विकल्पहरू हेर्नुहोस्',
            tables_section: {
                tables: 'तालिकाहरू',
                add_table: 'तालिका थप्नुहोस्',
                add_view: 'भ्यू थप्नुहोस्',
                filter: 'फिल्टर',
                collapse: 'सबै लुकाउनुहोस्',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'सबै तालिकाहरू लुकेका छन्',
                show_all: 'सबै देखाउनुहोस्',

                table: {
                    fields: 'क्षेत्रहरू',
                    nullable: 'नलेबल?',
                    primary_key: 'प्राथमिक कुंजी',
                    indexes: 'सूचकहरू',
                    check_constraints: 'जाँच प्रतिबन्धहरू',
                    comments: 'टिप्पणीहरू',
                    no_comments: 'कुनै टिप्पणीहरू छैनन्',
                    add_field: 'क्षेत्र थप्नुहोस्',
                    add_index: 'सूचक थप्नुहोस्',
                    add_check: 'जाँच थप्नुहोस्',
                    index_select_fields: 'क्षेत्रहरू चयन गर्नुहोस्',
                    no_types_found: 'कुनै प्रकारहरू फेला परेनन्',
                    field_name: 'नाम',
                    field_type: 'प्रकार',
                    field_actions: {
                        title: 'क्षेत्र विशेषताहरू',
                        open_discussion: 'कुराकानी खोल्नुहोस्',
                        unique: 'अनन्य',
                        auto_increment: 'स्वचालित वृद्धि',
                        comments: 'टिप्पणीहरू',
                        no_comments: 'कुनै टिप्पणीहरू छैनन्',
                        delete_field: 'क्षेत्र हटाउनुहोस्',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'परिशुद्धता',
                        scale: 'स्केल',
                    },
                    index_actions: {
                        title: 'सूचक विशेषताहरू',
                        name: 'नाम',
                        unique: 'अनन्य',
                        index_type: 'इन्डेक्स प्रकार',
                        delete_index: 'सूचक हटाउनुहोस्',
                    },
                    check_constraint_actions: {
                        title: 'जाँच प्रतिबन्ध',
                        expression: 'अभिव्यक्ति',
                        delete: 'प्रतिबन्ध हटाउनुहोस्',
                    },
                    table_actions: {
                        title: 'तालिका विशेषताहरू',
                        open_discussion: 'कुराकानी खोल्नुहोस्',
                        change_schema: 'स्कीम परिवर्तन गर्नुहोस्',
                        add_field: 'क्षेत्र थप्नुहोस्',
                        add_index: 'सूचक थप्नुहोस्',
                        duplicate_table: 'तालिका प्रतिलिपि गर्नुहोस्',
                        delete_table: 'तालिका हटाउनुहोस्',
                    },
                },
                empty_state: {
                    title: 'कुनै तालिकाहरू छैनन्',
                    description: 'सुरु गर्नका लागि एक तालिका बनाउनुहोस्',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'फिल्टर',
                clear: 'फिल्टर हटाउनुहोस्',
                no_results: 'तपाईंको फिल्टरसँग मिल्ने कुनै सन्दर्भ फेला परेन।',
                collapse: 'सबै लुकाउनुहोस्',
                add_relationship: 'सम्बन्ध थप्नुहोस्',
                relationships: 'सम्बन्धहरू',
                dependencies: 'डिपेन्डेन्सीहरू',
                relationship: {
                    relationship: 'सम्बन्ध',
                    primary: 'मुख्य तालिका',
                    foreign: 'सम्बन्धित तालिका',
                    cardinality: 'कार्डिन्यालिटी',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'हटाउनुहोस्',
                    switch_tables: 'तालिकाहरू साट्नुहोस्',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'कार्यहरू',
                        open_discussion: 'कुराकानी खोल्नुहोस्',
                        delete_relationship: 'हटाउनुहोस्',
                    },
                },
                dependency: {
                    dependency: 'डिपेन्डेन्सी',
                    table: 'तालिका',
                    dependent_table: 'विचलित तालिका',
                    delete_dependency: 'हटाउनुहोस्',
                    dependency_actions: {
                        title: 'कार्यहरू',
                        delete_dependency: 'हटाउनुहोस्',
                    },
                },
                empty_state: {
                    title: 'कुनै सम्बन्धहरू छैनन्',
                    description: 'सुरु गर्नका लागि एक सम्बन्ध बनाउनुहोस्',
                },
            },

            areas_section: {
                areas: 'क्षेत्रहरू',
                add_area: 'क्षेत्र थप्नुहोस्',
                filter: 'फिल्टर',
                clear: 'फिल्टर खाली गर्नुहोस्',
                no_results: 'तपाईंको फिल्टरसँग मिल्ने कुनै क्षेत्र फेला परेन।',

                area: {
                    area_actions: {
                        title: 'क्षेत्र कार्यहरू',
                        edit_name: 'नाम सम्पादन गर्नुहोस्',
                        delete_area: 'क्षेत्र मेट्नुहोस्',
                    },
                },
                empty_state: {
                    title: 'कुनै क्षेत्र छैन',
                    description: 'सुरु गर्न क्षेत्र बनाउनुहोस्',
                },
            },

            visuals_section: {
                visuals: 'Visuals',
                tabs: {
                    areas: 'क्षेत्रहरू',
                    notes: 'टिप्पणीहरू',
                },
            },

            notes_section: {
                filter: 'फिल्टर',
                add_note: 'टिप्पणी थप्नुहोस्',
                no_results: 'कुनै टिप्पणी फेला परेन',
                clear: 'फिल्टर खाली गर्नुहोस्',
                empty_state: {
                    title: 'कुनै टिप्पणी छैन',
                    description:
                        'क्यानभासमा पाठ टिप्पणी थप्न टिप्पणी सिर्जना गर्नुहोस्',
                },
                note: {
                    empty_note: 'खाली टिप्पणी',
                    note_actions: {
                        title: 'टिप्पणी कार्यहरू',
                        edit_content: 'सामग्री सम्पादन गर्नुहोस्',
                        delete_note: 'टिप्पणी मेटाउनुहोस्',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'कस्टम प्रकारहरू',
                filter: 'फिल्टर',
                clear: 'फिल्टर खाली गर्नुहोस्',
                no_results:
                    'तपाईंको फिल्टरसँग मिल्ने कुनै कस्टम प्रकार फेला परेन।',
                new_type: 'नयाँ प्रकार',
                empty_state: {
                    title: 'कुनै कस्टम प्रकार छैन',
                    description:
                        'तपाईंको डाटाबेसमा उपलब्ध हुँदा कस्टम प्रकारहरू यहाँ देखिनेछन्',
                },
                custom_type: {
                    kind: 'प्रकार',
                    enum_values: 'Enum मानहरू',
                    composite_fields: 'फिल्डहरू',
                    no_fields: 'कुनै फिल्ड परिभाषित छैन',
                    no_values: 'कुनै enum मानहरू परिभाषित छैनन्',
                    field_name_placeholder: 'फिल्डको नाम',
                    field_type_placeholder: 'प्रकार छान्नुहोस्',
                    add_field: 'फिल्ड थप्नुहोस्',
                    no_fields_tooltip:
                        'यस कस्टम प्रकारका लागि कुनै फिल्ड परिभाषित छैन',
                    custom_type_actions: {
                        title: 'कार्यहरू',
                        highlight_fields: 'फिल्डहरू हाइलाइट गर्नुहोस्',
                        delete_custom_type: 'मेट्नुहोस्',
                        clear_field_highlight: 'हाइलाइट हटाउनुहोस्',
                    },
                    delete_custom_type: 'प्रकार मेट्नुहोस्',
                },
            },
            conversations_section: {
                title: 'कुराकानी',
                tabs_label: 'कुराकानी',
                tabs: {
                    active: 'सक्रिय',
                    archives: 'अभिलेख गरिएको',
                },
                loading: 'कुराकानी लोड हुँदैछ…',
                filter: 'फिल्टर',
                clear: 'फिल्टर खाली गर्नुहोस्',
                no_results_title: 'कुनै परिणाम छैन',
                no_results_description:
                    'तपाईंको फिल्टरसँग मेल खाने कुनै कुराकानी फेला परेन।',

                type_filter: {
                    trigger: 'प्रकार',
                    label: 'प्रकार अनुसार फिल्टर',
                    trigger_aria: 'कुराकानी प्रकार अनुसार फिल्टर',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'पुन: प्रयास गर्नुहोस्',
                dismiss: 'Dismiss',
                read_only: 'पढ्न मात्र',
                deleted_user: 'मेटाइएको प्रयोगकर्ता',
                unread: {
                    badge_aria: '{{count}} नपढिएका सन्देशहरू',
                },
                inactive: {
                    title: 'कुराकानी unavailable',
                    description:
                        'कुराकानी are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'कुनै कुराकानी छैन',
                    active_description: 'सुरु गर्न कुराकानी सिर्जना गर्नुहोस्',
                    archives_title: 'No archived कुराकानी',
                    archives_description:
                        'Archived कुराकानी will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load कुराकानी',
                    load_description:
                        'Something went wrong while loading कुराकानी. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'कुराकानी खोल्नुहोस्',
                    start: 'कुराकानी सुरु गर्नुहोस्',
                    pending: 'कुराकानी सुरु हुँदैछ…',
                    diagram_name: 'डायाग्राम',
                    open_aria: '{{name}} को लागि कुराकानी खोल्नुहोस्',
                    start_aria: '{{name}} को लागि कुराकानी सुरु गर्नुहोस्',
                    open_tooltip: '{{name}} को लागि कुराकानी खोल्नुहोस्',
                    start_tooltip: '{{name}} को लागि कुराकानी सुरु गर्नुहोस्',
                    pending_tooltip: '{{name}} को लागि कुराकानी सुरु हुँदैछ…',
                    action_tooltip: 'कुराकानी',
                    unavailable_description:
                        'तपाईं यस डायाग्राममा कुराकानी सुरु गर्न सक्नुहुन्न।',
                    errors: {
                        validation: 'यो लक्ष्य कुराकानीका लागि मान्य छैन।',
                        forbidden:
                            'यो कुराकानी सुरु गर्ने अनुमति तपाईंसँग छैन।',
                        not_found: 'यो लक्ष्य डायाग्राममा अब उपलब्ध छैन।',
                        conflict:
                            'अहिले यो कुराकानी सुरु गर्न सकिएन। फेरि प्रयास गर्नुहोस्।',
                        generic:
                            'यो कुराकानी खोल्न सकिएन। फेरि प्रयास गर्नुहोस्।',
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
                    message_count: '{{count}} सन्देश',
                    no_messages: 'अहिलेसम्म कुनै सन्देश छैन',
                    last_activity: 'अन्तिम गतिविधि',
                    open_aria: '{{target}} को लागि कुराकानी खोल्नुहोस्',
                    focus_target_aria: 'आरेखमा {{target}} देखाउनुहोस्',
                    author_tooltip: '{{name}} को अन्तिम सन्देश',
                    author_missing_tooltip: 'लेखकको जानकारी छैन',
                    actions: {
                        menu_aria: 'कुराकानी विकल्पहरू',
                        open: 'खोल्नुहोस्',
                        delete: 'मेटाउनुहोस्',
                    },
                    delete_dialog: {
                        title: 'कुराकानी मेटाउने?',
                        description:
                            'यसले यो कुराकानी र यसका सबै सन्देशहरू स्थायी रूपमा मेटाउनेछ।',
                        cancel: 'रद्द गर्नुहोस्',
                        confirm: 'मेटाउनुहोस्',
                        deleting: 'मेटाउँदै…',
                        errors: {
                            delete_failed:
                                'यो कुराकानी मेटाउन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
                            forbidden:
                                'तपाईंसँग यो कुराकानी मेटाउने अनुमति छैन।',
                            not_found: 'यो कुराकानी अब उपलब्ध छैन।',
                        },
                    },
                },
                detail: {
                    back: 'पछाडि',
                    back_aria: 'कुराकानी सूचीमा फर्कनुहोस्',
                    loading: 'सन्देशहरू लोड हुँदैछ…',
                    loading_more: 'पुराना सन्देशहरू लोड हुँदैछ…',
                    load_older: 'पुराना सन्देशहरू लोड गर्नुहोस्',
                    new_messages_badge_one: '१ नयाँ सन्देश',
                    new_messages_badge_other: '{{count}} नयाँ सन्देशहरू',
                    new_messages_badge_label_one: 'नयाँ सन्देश',
                    new_messages_badge_label_other: 'नयाँ सन्देशहरू',
                    new_messages_badge_aria_one: 'नयाँ सन्देशमा जानुहोस्',
                    new_messages_badge_aria_other:
                        '{{count}} नयाँ सन्देशहरूमा जानुहोस्',
                    empty: {
                        title: 'कुनै सन्देश छैन',
                        description: 'यो कुराकानीमा कुनै सन्देश छैन।',
                    },
                    errors: {
                        load_title: 'सन्देशहरू लोड गर्न सकिएन',
                        load_description:
                            'सन्देशहरू लोड गर्दा समस्या भयो। कृपया फेरि प्रयास गर्नुहोस्।',
                    },
                    archive_banner: {
                        title: 'अभिलेखित कुराकानी',
                        description:
                            'यो कुराकानी केवल पढ्न मिल्ने हो। सन्देशहरू थप्न, सम्पादन गर्न वा मेटाउन सकिँदैन।',
                    },
                    metadata: {
                        status_label: 'स्थिति',
                        status_active: 'सक्रिय',
                        status_archived: 'अभिलेखित',
                        message_count_label: 'सन्देश संख्या',
                        message_count: '{{count}} सन्देशहरू',
                    },
                    message: {
                        edited: '(सम्पादित)',
                        edited_aria: 'सन्देश सम्पादन गरिएको छ',
                        day_separator: {
                            today: 'आज',
                            yesterday: 'हिजो',
                        },
                        actions: {
                            title: 'सन्देश कार्यहरू',
                            edit: 'सम्पादन गर्नुहोस्',
                            delete: 'मेटाउनुहोस्',
                        },
                        reactions: {
                            add_aria: 'प्रतिक्रिया थप्नुहोस्',
                            add_tooltip: 'प्रतिक्रिया थप्नुहोस्',
                            picker_loading: 'इमोजी पिकर लोड हुँदैछ…',
                            picker_aria_label: 'इमोजी पिकर',
                            picker_search_placeholder: 'इमोजी खोज्नुहोस्…',
                            picker_empty: 'कुनै इमोजी फेला परेन।',
                            chip_aria: '{{emoji}} प्रतिक्रिया, {{count}}',
                            preview_and_others_one: 'र अन्य {{count}}',
                            preview_and_others_other: 'र अन्य {{count}}',
                            errors: {
                                generic:
                                    'प्रतिक्रिया अपडेट गर्न सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
                                forbidden:
                                    'तपाईंलाई यो सन्देशमा प्रतिक्रिया दिन अनुमति छैन।',
                                archived:
                                    'यो कुराकानी अभिलेखित छ र प्रतिक्रियाहरू केवल पढ्न मिल्छ।',
                                not_found: 'यो सन्देश अब उपलब्ध छैन।',
                                invalid_emoji: 'यो इमोजी मान्य छैन।',
                            },
                        },
                    },
                    composer: {
                        label: 'सन्देश',
                        placeholder: 'सन्देश लेख्नुहोस्…',
                        submit: 'पठाउनुहोस्',
                        submitting: 'पठाउँदै…',
                        form_aria_label: 'नयाँ कुराकानी सन्देश',
                        keyboard_hint:
                            'पठाउन Enter थिच्नुहोस्। नयाँ पङ्क्तिका लागि Shift+Enter।',
                        counter_aria_label:
                            '{{count}} / {{max}} वर्ण प्रयोग भयो',
                        errors: {
                            empty: 'पठाउन सन्देश प्रविष्ट गर्नुहोस्।',
                            too_long: 'सन्देश 2000 वर्णभन्दा बढी हुन सक्दैन।',
                            create_failed:
                                'सन्देश पठाउन सकिएन। कृपया पुनः प्रयास गर्नुहोस्।',
                        },
                    },
                    edit: {
                        label: 'सन्देश',
                        form_aria_label: 'कुराकानी सन्देश सम्पादन गर्नुहोस्',
                        save: 'सुरक्षित गर्नुहोस्',
                        saving: 'सुरक्षित गर्दै…',
                        cancel: 'रद्द गर्नुहोस्',
                        counter_aria_label:
                            '{{count}} / {{max}} वर्ण प्रयोग भयो',
                        errors: {
                            empty: 'सुरक्षित गर्न सन्देश प्रविष्ट गर्नुहोस्।',
                            too_long: 'सन्देश 2000 वर्णभन्दा बढी हुन सक्दैन।',
                            update_failed:
                                'सन्देश अद्यावधिक गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।',
                        },
                    },
                    delete_dialog: {
                        title: 'सन्देश मेटाउनुहोस्',
                        description:
                            'के तपाईं यो सन्देश मेटाउन निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।',
                        cancel: 'रद्द गर्नुहोस्',
                        confirm: 'मेटाउनुहोस्',
                        deleting: 'मेटाउँदै…',
                        errors: {
                            delete_failed:
                                'यो सन्देश मेटाउन सकिएन। कृपया पुनः प्रयास गर्नुहोस्।',
                        },
                    },
                    mutation_errors: {
                        forbidden:
                            'तपाईंसँग यो सन्देश परिवर्तन गर्ने अनुमति छैन।',
                        archived: 'यो कुराकानी अभिलेखित छ र केवल पढ्न मिल्छ।',
                        not_found: 'यो कुराकानी वा सन्देश अब उपलब्ध छैन।',
                    },
                },

                targets: {
                    diagram: 'रेखाचित्र',
                    table: 'तालिका',
                    field: 'फिल्ड',
                    relationship: 'सम्बन्ध',
                    unknown: 'कुराकानी',
                },
                target_labels: {
                    diagram: 'रेखाचित्र',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'मेटाइएको तालिका',
                    missing_field: 'मेटाइएको फिल्ड',
                    missing_relationship: 'मेटाइएको सम्बन्ध',
                    unknown: 'कुराकानी',
                },
            },
            activities_section: {
                title: 'गतिविधि',
                filter: 'फिल्टर',
                clear: 'फिल्टर मेटाउनुहोस्',
                no_results:
                    'तपाईंको फिल्टरसँग मेल खाने कुनै गतिविधि फेला परेन।',
                loading: 'गतिविधि लोड हुँदैछ…',
                retry: 'पुन: प्रयास गर्नुहोस्',
                type_filter: {
                    trigger: 'प्रकार',
                    label: 'प्रकार अनुसार फिल्टर गर्नुहोस्',
                    trigger_aria: 'गतिविधि प्रकार अनुसार फिल्टर गर्नुहोस्',
                },
                types: {
                    diagram: 'रेखाचित्र',
                    table: 'तालिका',
                    field: 'फिल्ड',
                    relationship: 'सम्बन्ध',
                    note: 'नोट',
                    area: 'क्षेत्र',
                    dependency: 'निर्भरता',
                },
                you: 'तपाईं',
                unknown_user: 'कसैले',
                empty_state: {
                    title: 'अहिलेसम्म कुनै गतिविधि छैन',
                    description:
                        'हालका परिवर्तनहरू हेर्न सम्पादन सुरु गर्नुहोस्।',
                },
                errors: {
                    load_failed: 'गतिविधि लोड गर्न सकिएन।',
                },
                actions: {
                    add_tables: '{{user}} ले तालिका {{table}} थप्नुभयो',
                    remove_tables: '{{user}} ले एउटा तालिका हटाउनुभयो',
                    add_field: '{{user}} ले फिल्ड {{field}} थप्नुभयो',
                    remove_field: '{{user}} ले एउटा फिल्ड हटाउनुभयो',
                    update_field:
                        '{{user}} ले फिल्ड {{field}} अद्यावधिक गर्नुभयो',
                    add_relationships: '{{user}} ले सम्बन्ध थप्नुभयो',
                    remove_relationships: '{{user}} ले सम्बन्ध हटाउनुभयो',
                    update_relationship:
                        '{{user}} ले सम्बन्ध अद्यावधिक गर्नुभयो',
                    add_notes: '{{user}} ले नोट थप्नुभयो',
                    remove_notes: '{{user}} ले नोट हटाउनुभयो',
                    add_areas: '{{user}} ले क्षेत्र थप्नुभयो',
                    remove_areas: '{{user}} ले क्षेत्र हटाउनुभयो',
                    add_dependencies: '{{user}} ले निर्भरता थप्नुभयो',
                    remove_dependencies: '{{user}} ले निर्भरता हटाउनुभयो',
                    fallback: '{{user}} ले डायाग्राम अद्यावधिक गर्नुभयो',
                },
            },
            share_section: {
                title: 'साझा गर्नुहोस्',
                tabs_label: 'साझा विकल्पहरू',
                tabs: {
                    collaborators: 'सहयोगीहरू',
                    public_link: 'सार्वजनिक लिङ्क',
                },
                collaborators: {
                    description:
                        'सम्पादक वा दर्शक पहुँचसह सहयोगीहरूलाई निमन्त्रणा गर्नुहोस्। उनीहरूसँग पहिले नै FoxalDB खाता हुनुपर्छ।',
                },
                public_link: {
                    title: 'सार्वजनिक लिङ्क',
                    description:
                        'लिङ्क भएका जो कोसँग पनि तपाईंको डायाग्रामको पढ्न-मात्र स्न्यापसट साझा गर्नुहोस्।',
                    coming_soon: 'चाँडै आउँदैछ।',
                },
                loading: 'सहयोगीहरू लोड हुँदैछ…',
                retry: 'पुनः प्रयास गर्नुहोस्',
                errors: {
                    load_failed: 'सहयोगीहरू लोड गर्न सकिएन।',
                },
            },
        },

        toolbar: {
            zoom_in: 'जुम इन',
            zoom_out: 'जुम आउट',
            save: 'सुरक्षित गर्नुहोस्',
            show_all: 'सबै देखाउनुहोस्',
            undo: 'पूर्ववत',
            redo: 'पुनः गर्नुहोस्',
            reorder_diagram: 'डायाग्राम स्वचालित मिलाउनुहोस्',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables:
                'अतिरिक्त तालिकाहरू हाइलाइट गर्नुहोस्',
            filter: 'तालिकाहरू फिल्टर गर्नुहोस्',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'तपाईंको डाटाबेस के हो?',
                description:
                    'प्रत्येक डाटाबेसलाई आफ्नो विशेषता र क्षमताहरू छन्।',
                check_examples_long: 'उदाहरणहरू हेर्नुहोस्',
                check_examples_short: 'उदाहरणहरू',
            },

            import_database: {
                title: 'तपाईंको डाटाबेस आयात गर्नुहोस्',
                database_edition: 'डाटाबेस संस्करण:',
                step_1: 'तपाईंको डाटाबेसमा यो स्क्रिप्ट चलाउनुहोस्:',
                step_2: 'यो स्क्रिप्ट परिणाम यहाँ पेस्ट गर्नुहोस् →',
                script_results_placeholder: 'स्क्रिप्ट परिणाम यहाँ...',
                ssms_instructions: {
                    button_text: 'SSMS निर्देशन',
                    title: 'निर्देशन',
                    step_1: 'टुल्स > विकल्प > क्वेरी परिणाम > SQL सर्भरमा जानुहोस्।',
                    step_2: 'तपाईं "नतिजा ग्रिड" प्रयोग गरिरहेको छ भने, गैर-XML डाटाका लागि अधिकतम वर्णहरू प्राप्त गर्नका लागि परिणामहरू परिवर्तन गर्नुहोस् (९९९९९९९ मा सेट गर्नुहोस्)।',
                },
                instructions_link: 'मद्दत चाहिन्छ? हेर्नुहोस् कसरी',
                check_script_result: 'स्क्रिप्ट परिणाम जाँच गर्नुहोस्',
            },

            cancel: 'रद्द गर्नुहोस्',
            import_from_file: 'फाइलबाट आयात गर्नुहोस्',
            back: 'फर्क',
            empty_diagram: 'खाली डाटाबेस',
            continue: 'जारी राख्नुहोस्',
            import: 'आयात गर्नुहोस्',
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

        open_diagram_dialog: {
            title: 'डाटाबेस खोल्नुहोस्',
            description:
                'तलको सूचीबाट खोल्नका लागि एक डायाग्राम चयन गर्नुहोस्।',
            table_columns: {
                name: 'नाम',
                created_at: 'मा सिर्जना',
                last_modified: 'अन्तिम परिवर्तन',
                tables_count: 'तालिकाहरू',
            },
            cancel: 'रद्द गर्नुहोस्',
            open: 'खोल्नुहोस्',
            new_database: 'नयाँ डाटाबेस',

            diagram_actions: {
                open: 'खोल्नुहोस्',
                duplicate: 'डुप्लिकेट',
                delete: 'मेटाउनुहोस्',
            },
        },

        export_sql_dialog: {
            title: 'SQL निर्यात गर्नुहोस्',
            description:
                'तलको विकल्पहरूबाट तपाईंको डायाग्राम स्कीम निर्यात गर्नुहोस्।',
            close: 'बन्द गर्नुहोस्',
            loading: {
                text: 'AI ले {{databaseType}} को लागि SQL उत्पन्न गर्दैछ...',
                description: 'यो ३० सेकेण्डसम्म समय लिन्छ।',
            },
            error: {
                message:
                    'SQL स्क्रिप्ट उत्पन्न गर्नमा त्रुटि। कृपया पछि प्रयास गर्नुहोस् वा <0>हामीलाई सम्पर्क गर्नुहोस्</0>।',
                description:
                    'तपाईंले OPENAI_TOKEN प्रयोग गर्न सक्नुहुन्छ, यहाँ <0>यहाँ</0> म्यानुअल हेर्नुहोस्।',
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
            title: 'सम्बन्ध बनाउनुहोस्',
            primary_table: 'मुख्य तालिका',
            primary_field: 'मुख्य क्षेत्र',
            referenced_table: 'संदर्भित तालिका',
            referenced_field: 'संदर्भित क्षेत्र',
            primary_table_placeholder: 'तालिका चयन गर्नुहोस्',
            primary_field_placeholder: 'क्षेत्र चयन गर्नुहोस्',
            referenced_table_placeholder: 'तालिका चयन गर्नुहोस्',
            referenced_field_placeholder: 'क्षेत्र चयन गर्नुहोस्',
            no_tables_found: 'कुनै तालिकाहरू फेला परेनन्',
            no_fields_found: 'कुनै क्षेत्रहरू फेला परेनन्',
            create: 'बनाउनुहोस्',
            cancel: 'रद्द गर्नुहोस्',
        },

        import_database_dialog: {
            title: 'डाटाबेस आयात गर्नुहोस्',
            override_alert: {
                title: 'डाटाबेस आयात गर्नुहोस्',
                content: {
                    alert: 'यो डायाग्राममा आयात गर्ने असर गर्नेछ।',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> नयाँ तालिकाहरू थपिनेछन्।',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> नयाँ सम्बन्धहरू बनाइनेछन्।',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> तालिकाहरू ओभरराइड गरिनेछन्।',
                    proceed: 'के तपाईं जारी गर्न चाहनुहुन्छ?',
                },
                import: 'आयात गर्नुहोस्',
                cancel: 'रद्द गर्नुहोस्',
            },
        },

        export_image_dialog: {
            title: 'इमेज निर्यात गर्नुहोस्',
            description: 'निर्यात गर्नका लागि गणना कारक छान्नुहोस्:',
            scale_1x: '१x (कम गुणस्तर)',
            scale_2x: '२x (सामान्य गुणस्तर)',
            scale_4x: '४x (उत्तम गुणस्तर)',
            cancel: 'रद्द गर्नुहोस्',
            export: 'निर्यात गर्नुहोस्',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'स्कीम चयन गर्नुहोस्',
            description:
                'विभिन्न स्कीमहरू वर्तमानमा देखाइएको छन्। नयाँ तालिकाका लागि एक चयन गर्नुहोस्।',
            cancel: 'रद्द गर्नुहोस्',
            confirm: 'पुष्टि गर्नुहोस्',
        },

        update_table_schema_dialog: {
            title: 'स्कीम परिवर्तन गर्नुहोस्',
            description: 'तालिका "{{tableName}}" स्कीम अपडेट गर्नुहोस्',
            cancel: 'रद्द गर्नुहोस्',
            confirm: 'परिवर्तन गर्नुहोस्',
        },

        create_table_schema_dialog: {
            title: 'नयाँ स्कीम सिर्जना गर्नुहोस्',
            description:
                'अहिलेसम्म कुनै स्कीम अस्तित्वमा छैन। आफ्ना तालिकाहरू व्यवस्थित गर्न आफ्नो पहिलो स्कीम सिर्जना गर्नुहोस्।',
            create: 'सिर्जना गर्नुहोस्',
            cancel: 'रद्द गर्नुहोस्',
        },
        export_diagram_dialog: {
            title: 'डायाग्राम निर्यात गर्नुहोस्',
            description: 'निर्यात गर्नका लागि निर्यात फरम्याट छान्नुहोस:',
            format_json: 'JSON',
            cancel: 'रद्द गर्नुहोस्',
            export: 'निर्यात गर्नुहोस्',
            error: {
                title: 'Error exporting diagram',
                description:
                    'Something went wrong. Need help? support@chartdb.io',
            },
        },

        import_diagram_dialog: {
            title: 'डायाग्राम आयात गर्नुहोस्',
            description: 'डायाग्राम JSON डेटा पेस्ट गर्नुहोस:',
            cancel: 'रद्द गर्नुहोस्',
            import: 'आयात गर्नुहोस्',
            error: {
                title: 'डायाग्राम आयात गर्दा समस्या आयो',
                description:
                    'डायाग्राम JSON अमान्य छ। कृपया JSON जाँच गर्नुहोस् र पुन: प्रयास गर्नुहोस्। मद्दत चाहिन्छ? support@chartdb.io मा सम्पर्क गर्नुहोस्',
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
            one_to_one: 'एक देखि एक',
            one_to_many: 'एक देखि धेरै',
            many_to_one: 'धेरै देखि एक',
            many_to_many: 'धेरै देखि धेरै',
        },

        canvas_context_menu: {
            new_table: 'नयाँ तालिका',
            new_view: 'नयाँ भ्यू',
            new_relationship: 'नयाँ सम्बन्ध',
            // TODO: Translate
            new_area: 'नयाँ क्षेत्र',
            new_note: 'नयाँ नोट',
        },

        table_node_context_menu: {
            edit_table: 'तालिका सम्पादन गर्नुहोस्',
            duplicate_table: 'तालिका प्रतिलिपि गर्नुहोस्',
            delete_table: 'तालिका हटाउनुहोस्',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'क्षेत्रमा सार्नुहोस्',
            no_area: 'कुनै क्षेत्र छैन',
        },

        canvas: {
            all_tables_hidden: 'सबै तालिकाहरू लुकेका छन्',
            show_all_tables: 'सबै देखाउनुहोस्',
        },

        canvas_filter: {
            title: 'तालिकाहरू फिल्टर गर्नुहोस्',
            search_placeholder: 'तालिकाहरू खोज्नुहोस्...',
            group_by_schema: 'स्कीमा अनुसार समूह गर्नुहोस्',
            group_by_area: 'क्षेत्र अनुसार समूह गर्नुहोस्',
            no_tables_found: 'कुनै तालिका भेटिएन',
            empty_diagram_description: 'सुरु गर्न तालिका बनाउनुहोस्',
            no_tables_description:
                'तपाईंको खोज वा फिल्टर समायोजन गर्ने प्रयास गर्नुहोस्',
            clear_filter: 'फिल्टर हटाउनुहोस्',
        },

        snap_to_grid_tooltip: 'ग्रिडमा स्न्याप गर्नुहोस् ({{key}} थिच्नुहोस)',

        editing_conflict: {
            one: '{{name}} ले यो पनि सम्पादन गर्दै हुनुहुन्छ।',
            two: '{{name1}} र {{name2}} ले यो पनि सम्पादन गर्दै हुनुहुन्छ।',
            many: '{{name}} र थप {{count}} जनाले यो पनि सम्पादन गर्दै हुनुहुन्छ।',
            fallback_name: 'सहकर्मी',
            last_writer_wins:
                'परिवर्तनहरू लक छैनन्। अन्तिम सुरक्षित सम्पादनले जित्छ।',
        },

        tool_tips: {
            double_click_to_edit: 'सम्पादन गर्नका लागि डबल क्लिक गर्नुहोस्',
        },

        auth: {
            dialog: {
                account_title: 'खाता',
                login_title: 'FoxalDB मा साइन इन गर्नुहोस्',
                register_title: 'FoxalDB खाता सिर्जना गर्नुहोस्',
                account_description: 'आफ्नो हालको सत्र व्यवस्थापन गर्नुहोस्।',
                login_description:
                    'थप डायाग्रामहरू बचत गर्न र सिङ्क गर्न साइन इन गर्नुहोस्।',
                register_description:
                    'थप डायाग्रामहरू बचत गर्न खाता सिर्जना गर्नुहोस्।',
                checking_session: 'सत्र जाँच गर्दै...',
                continue_without_account: 'खाता बिना जारी राख्नुहोस्',
            },
            login: {
                title: 'लग इन',
                email_label: 'इमेल',
                password_label: 'पासवर्ड',
                submit: 'साइन इन गर्नुहोस्',
                submitting: 'साइन इन गर्दै...',
                switch_to_register: 'दर्ता',
                no_account: 'खाता छैन?',
            },
            register: {
                title: 'दर्ता',
                first_name_label: 'पहिलो नाम',
                last_name_label: 'थर',
                email_label: 'इमेल',
                password_label: 'पासवर्ड',
                password_confirmation_label: 'पासवर्ड पुष्टि गर्नुहोस्',
                submit: 'खाता सिर्जना गर्नुहोस्',
                submitting: 'खाता सिर्जना गर्दै...',
                switch_to_login: 'लग इन',
                already_have_account: 'पहिले नै खाता छ?',
            },
            account: {
                signed_in_as: 'यस रूपमा साइन इन',
                logout: 'लग आउट',
                back_to_editor: 'सम्पादकमा फर्कनुहोस्',
            },
            nav: {
                sign_in: 'साइन इन',
                logout: 'लग आउट',
                loading: '...',
            },
            pages: {
                login_title: 'FoxalDB — लग इन',
                register_title: 'FoxalDB — दर्ता',
                checking_session: 'सत्र जाँच गर्दै…',
            },
            errors: {
                first_name_required: 'पहिलो नाम आवश्यक छ।',
                last_name_required: 'थर आवश्यक छ।',
                generic: 'केही गलत भयो।',
            },
        },

        guest_migration_dialog: {
            title: 'स्थानीय डायग्राम आयात गर्ने?',
            description:
                'यो यन्त्रमा डायग्राम सुरक्षित छ। जहाँबाट पनि पहुँच गर्न खातामा आयात गर्नुहोस्।',
            import: 'खातामा आयात गर्नुहोस्',
            continue_without_import: 'आयात नगरी जारी राख्नुहोस्',
        },

        guest_migration_errors: {
            import_failed:
                'स्थानीय डायग्राम आयात गर्न सकिएन। स्थानीय प्रतिलिपि सुरक्षित राखियो।',
            activation_failed:
                'डायग्राम सिर्जना भयो तर खोल्न सकिएन। स्थानीय प्रतिलिपि सुरक्षित राखियो।',
            cleanup_failed:
                'डायग्राम आयात भयो तर स्थानीय प्रतिलिपि हटाउन सकिएन। तपाईं म्यानुअल मेट्न सक्नुहुन्छ।',
            check_failed: 'स्थानीय डायग्राम पढ्न सकिएन।',
        },

        language_select: {
            change_language: 'भाषा परिवर्तन गर्नुहोस्',
        },

        on: 'सक्रिय',
        off: 'निष्क्रिय',
    },
};

export const neMetadata: LanguageMetadata = {
    name: 'Nepali',
    nativeName: 'नेपाली',
    code: 'ne',
};
