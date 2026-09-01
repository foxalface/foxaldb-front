import type { LanguageMetadata, LanguageTranslation } from '../types';

export const hi: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'नया',
            browse: 'खोलें',
            tables: 'टेबल',
            refs: 'रेफ्स',
            dependencies: 'निर्भरताएं',
            custom_types: 'कस्टम टाइप',
            conversations: 'वार्तालाप',
            conversations_unread_aria: 'वार्तालापों में {{count}} अपठित संदेश',
            visuals: 'Visuals',
            activities: 'गतिविधि',
            share: 'साझा करें',
        },
        menu: {
            actions: {
                actions: 'कार्य',
                new: 'नया...',
                browse: 'सभी डेटाबेस...',
                save: 'सहेजें',
                import: 'डेटाबेस आयात करें',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'SQL निर्यात करें',
                export_as: 'के रूप में निर्यात करें',
                delete_diagram: 'हटाएँ',
            },
            edit: {
                edit: 'संपादित करें',
                undo: 'पूर्ववत करें',
                redo: 'पुनः करें',
                clear: 'साफ़ करें',
            },
            view: {
                view: 'देखें',
                show_sidebar: 'साइडबार दिखाएँ',
                hide_sidebar: 'साइडबार छिपाएँ',
                hide_cardinality: 'कार्डिनैलिटी छिपाएँ',
                show_cardinality: 'कार्डिनैलिटी दिखाएँ',
                hide_field_attributes: 'फ़ील्ड विशेषताएँ छिपाएँ',
                show_field_attributes: 'फ़ील्ड विशेषताएँ दिखाएँ',
                zoom_on_scroll: 'स्क्रॉल पर ज़ूम',
                show_views: 'डेटाबेस व्यू',
                theme: 'थीम',
                show_dependencies: 'निर्भरता दिखाएँ',
                hide_dependencies: 'निर्भरता छिपाएँ',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: 'बैकअप',
                export_diagram: 'आरेख निर्यात करें',
                restore_diagram: 'आरेख पुनर्स्थापित करें',
            },
            help: {
                help: 'मदद',
                docs_website: 'દસ્તાવેજીકરણ',
                join_discord: 'हमसे Discord पर जुड़ें',
            },
        },

        delete_diagram_alert: {
            title: 'अपना डेटाबेस चुनें',
            description: 'अपने नए डायग्राम के लिए डेटाबेस सिस्टम चुनें।',
            cancel: 'रद्द करें',
            delete: 'हटाएँ',
        },

        clear_diagram_alert: {
            title: 'आरेख साफ़ करें',
            description:
                'यह क्रिया पूर्ववत नहीं की जा सकती। यह आरेख में सभी डेटा को स्थायी रूप से हटा देगी।',
            cancel: 'रद्द करें',
            clear: 'साफ़ करें',
        },

        diagram_access: {
            removed: {
                title: 'अपना डेटाबेस चुनें',
                description: 'अपने नए डायग्राम के लिए डेटाबेस सिस्टम चुनें।',
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
            title: 'आरेख स्वचालित व्यवस्थित करें',
            description:
                'यह क्रिया आरेख में सभी तालिकाओं को पुनः व्यवस्थित कर देगी। क्या आप जारी रखना चाहते हैं?',
            reorder: 'स्वचालित व्यवस्थित करें',
            cancel: 'रद्द करें',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'कॉपी असफल',
                description: 'क्लिपबोर्ड समर्थित नहीं है',
            },
            failed: {
                title: 'कॉपी असफल',
                description: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
            },
        },

        theme: {
            system: 'सिस्टम',
            light: 'हल्का',
            dark: 'गहरा',
        },

        zoom: {
            on: 'चालू',
            off: 'बंद',
        },

        last_saved: 'अंतिम सहेजा गया',
        saved: 'सहेजा गया',
        loading_diagram: 'आरेख लोड हो रहा है...',
        deselect_all: 'सभी को अचयनित करें',
        select_all: 'सभी को चुनें',
        delete: 'हटाएँ',
        clear: 'साफ़ करें',
        show_more: 'अधिक दिखाएँ',
        show_less: 'कम दिखाएँ',
        // TODO: Translate
        copy_to_clipboard: 'Copy to Clipboard',
        copied: 'Copied!',

        side_panel: {
            view_all_options: 'सभी विकल्प देखें...',
            tables_section: {
                tables: 'तालिकाएँ',
                add_table: 'तालिका जोड़ें',
                add_view: 'व्यू जोड़ें',
                filter: 'फ़िल्टर',
                collapse: 'सभी को संक्षिप्त करें',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'सभी तालिकाएँ छिपी हुई हैं',
                show_all: 'सभी दिखाएं',

                table: {
                    fields: 'फ़ील्ड्स',
                    nullable: 'Nullable?',
                    primary_key: 'प्राथमिक कुंजी',
                    indexes: 'सूचकांक',
                    check_constraints: 'जाँच प्रतिबंध',
                    comments: 'टिप्पणियाँ',
                    no_comments: 'कोई टिप्पणी नहीं',
                    add_field: 'फ़ील्ड जोड़ें',
                    add_index: 'सूचकांक जोड़ें',
                    add_check: 'जाँच जोड़ें',
                    index_select_fields: 'फ़ील्ड्स चुनें',
                    no_types_found: 'कोई प्रकार नहीं मिला',
                    field_name: 'नाम',
                    field_type: 'प्रकार',
                    field_actions: {
                        title: 'फ़ील्ड विशेषताएँ',
                        open_discussion: 'वार्तालाप खोलें',
                        unique: 'अद्वितीय',
                        auto_increment: 'ऑटो इंक्रीमेंट',
                        comments: 'टिप्पणियाँ',
                        no_comments: 'कोई टिप्पणी नहीं',
                        delete_field: 'फ़ील्ड हटाएँ',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Precision',
                        scale: 'Scale',
                    },
                    index_actions: {
                        title: 'सूचकांक विशेषताएँ',
                        name: 'नाम',
                        unique: 'अद्वितीय',
                        index_type: 'इंडेक्स प्रकार',
                        delete_index: 'सूचकांक हटाएँ',
                    },
                    check_constraint_actions: {
                        title: 'जाँच प्रतिबंध',
                        expression: 'अभिव्यक्ति',
                        delete: 'प्रतिबंध हटाएं',
                    },
                    table_actions: {
                        title: 'तालिका क्रियाएँ',
                        open_discussion: 'वार्तालाप खोलें',
                        change_schema: 'स्कीमा बदलें',
                        add_field: 'फ़ील्ड जोड़ें',
                        add_index: 'सूचकांक जोड़ें',
                        duplicate_table: 'तालिका की प्रतिलिपि बनाएँ',
                        delete_table: 'तालिका हटाएँ',
                    },
                },
                empty_state: {
                    title: 'कोई तालिकाएँ नहीं',
                    description: 'शुरू करने के लिए एक तालिका बनाएँ',
                },
            },
            refs_section: {
                refs: 'रेफ्स',
                filter: 'फ़िल्टर',
                clear: 'फ़िल्टर साफ़ करें',
                no_results:
                    'आपके फ़िल्टर से मेल खाने वाले कोई संदर्भ नहीं मिले।',
                collapse: 'सभी को संक्षिप्त करें',
                add_relationship: 'संबंध जोड़ें',
                relationships: 'संबंध',
                dependencies: 'निर्भरताएँ',
                relationship: {
                    relationship: 'संबंध',
                    primary: 'प्राथमिक तालिका',
                    foreign: 'संबंधित तालिका',
                    cardinality: 'कार्डिनैलिटी',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'हटाएँ',
                    switch_tables: 'टेबल बदलें',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'क्रियाएँ',
                        open_discussion: 'वार्तालाप खोलें',
                        delete_relationship: 'हटाएँ',
                    },
                },
                dependency: {
                    dependency: 'निर्भरता',
                    table: 'तालिका',
                    dependent_table: 'आश्रित दृश्य',
                    delete_dependency: 'हटाएँ',
                    dependency_actions: {
                        title: 'क्रियाएँ',
                        delete_dependency: 'हटाएँ',
                    },
                },
                empty_state: {
                    title: 'कोई संबंध नहीं',
                    description: 'शुरू करने के लिए एक संबंध बनाएँ',
                },
            },

            areas_section: {
                areas: 'क्षेत्र',
                add_area: 'क्षेत्र जोड़ें',
                filter: 'फ़िल्टर',
                clear: 'फ़िल्टर साफ़ करें',
                no_results:
                    'आपके फ़िल्टर से मेल खाने वाला कोई क्षेत्र नहीं मिला।',

                area: {
                    area_actions: {
                        title: 'क्षेत्र क्रियाएं',
                        edit_name: 'नाम संपादित करें',
                        delete_area: 'क्षेत्र हटाएं',
                    },
                },
                empty_state: {
                    title: 'कोई क्षेत्र नहीं',
                    description: 'शुरू करने के लिए एक क्षेत्र बनाएं',
                },
            },

            visuals_section: {
                visuals: 'Visuals',
                tabs: {
                    areas: 'क्षेत्र',
                    notes: 'नोट्स',
                },
            },

            notes_section: {
                filter: 'फ़िल्टर',
                add_note: 'नोट जोड़ें',
                no_results: 'कोई नोट नहीं मिला',
                clear: 'फ़िल्टर साफ़ करें',
                empty_state: {
                    title: 'कोई नोट नहीं',
                    description:
                        'कैनवास पर टेक्स्ट एनोटेशन जोड़ने के लिए एक नोट बनाएं',
                },
                note: {
                    empty_note: 'खाली नोट',
                    note_actions: {
                        title: 'नोट क्रियाएं',
                        edit_content: 'सामग्री संपादित करें',
                        delete_note: 'नोट हटाएं',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'कस्टम प्रकार',
                filter: 'फ़िल्टर',
                clear: 'फ़िल्टर साफ़ करें',
                no_results:
                    'आपके फ़िल्टर से मेल खाने वाला कोई कस्टम प्रकार नहीं मिला।',
                new_type: 'नया प्रकार',
                empty_state: {
                    title: 'कोई कस्टम प्रकार नहीं',
                    description:
                        'जब आपके डेटाबेस में उपलब्ध होंगे तो कस्टम प्रकार यहाँ दिखाई देंगे',
                },
                custom_type: {
                    kind: 'प्रकार',
                    enum_values: 'Enum मान',
                    composite_fields: 'फ़ील्ड',
                    no_fields: 'कोई फ़ील्ड परिभाषित नहीं',
                    no_values: 'कोई enum मान परिभाषित नहीं',
                    field_name_placeholder: 'फ़ील्ड का नाम',
                    field_type_placeholder: 'प्रकार चुनें',
                    add_field: 'फ़ील्ड जोड़ें',
                    no_fields_tooltip:
                        'इस कस्टम प्रकार के लिए कोई फ़ील्ड परिभाषित नहीं',
                    custom_type_actions: {
                        title: 'क्रियाएं',
                        highlight_fields: 'फ़ील्ड हाइलाइट करें',
                        delete_custom_type: 'हटाएं',
                        clear_field_highlight: 'हाइलाइट हटाएं',
                    },
                    delete_custom_type: 'प्रकार हटाएं',
                },
            },
            conversations_section: {
                title: 'वार्तालाप',
                tabs_label: 'वार्तालाप',
                tabs: {
                    active: 'सक्रिय',
                    archives: 'संगृहीत',
                },
                loading: 'वार्तालाप लोड हो रहे हैं…',
                filter: 'फ़िल्टर',
                clear: 'फ़िल्टर साफ़ करें',
                no_results_title: 'कोई परिणाम नहीं',
                no_results_description:
                    'आपके फ़िल्टर से मेल खाती कोई बातचीत नहीं मिली।',

                type_filter: {
                    trigger: 'प्रकार',
                    label: 'प्रकार से फ़िल्टर करें',
                    trigger_aria: 'बातचीत प्रकार से फ़िल्टर करें',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'पुनः प्रयास करें',
                dismiss: 'Dismiss',
                read_only: 'केवल पढ़ने योग्य',
                deleted_user: 'हटाया गया उपयोगकर्ता',
                unread: {
                    badge_aria: '{{count}} अपठित संदेश',
                },
                inactive: {
                    title: 'वार्तालाप unavailable',
                    description:
                        'वार्तालाप are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'कोई वार्तालाप नहीं',
                    active_description: 'शुरू करने के लिए एक वार्तालाप बनाएँ',
                    archives_title: 'No archived वार्तालाप',
                    archives_description:
                        'Archived वार्तालाप will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load वार्तालाप',
                    load_description:
                        'Something went wrong while loading वार्तालाप. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'वार्तालाप खोलें',
                    start: 'वार्तालाप शुरू करें',
                    pending: 'वार्तालाप शुरू हो रहा है…',
                    diagram_name: 'आरेख',
                    open_aria: '{{name}} के लिए वार्तालाप खोलें',
                    start_aria: '{{name}} के लिए वार्तालाप शुरू करें',
                    open_tooltip: '{{name}} के लिए वार्तालाप खोलें',
                    start_tooltip: '{{name}} के लिए वार्तालाप शुरू करें',
                    pending_tooltip:
                        '{{name}} के लिए वार्तालाप शुरू हो रहा है…',
                    action_tooltip: 'वार्तालाप',
                    unavailable_description:
                        'आप इस आरेख पर वार्तालाप शुरू नहीं कर सकते।',
                    errors: {
                        validation: 'यह लक्ष्य वार्तालाप के लिए मान्य नहीं है।',
                        forbidden:
                            'आपके पास यह वार्तालाप शुरू करने की अनुमति नहीं है।',
                        not_found: 'यह लक्ष्य आरेख पर अब उपलब्ध नहीं है।',
                        conflict:
                            'अभी यह वार्तालाप शुरू नहीं हो सका। कृपया पुनः प्रयास करें।',
                        generic:
                            'यह वार्तालाप खोला नहीं जा सका। कृपया पुनः प्रयास करें।',
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
                    message_count: '{{count}} संदेश',
                    no_messages: 'अभी कोई संदेश नहीं',
                    last_activity: 'अंतिम गतिविधि',
                    open_aria: '{{target}} के लिए बातचीत खोलें',
                    focus_target_aria: 'आरेख पर {{target}} दिखाएँ',
                    author_tooltip: '{{name}} का अंतिम संदेश',
                    author_missing_tooltip: 'लेखक की जानकारी नहीं',
                    actions: {
                        menu_aria: 'वार्तालाप विकल्प',
                        open: 'खोलें',
                        delete: 'हटाएँ',
                    },
                    delete_dialog: {
                        title: 'वार्तालाप हटाएँ?',
                        description:
                            'यह इस वार्तालाप और उसके सभी संदेशों को स्थायी रूप से हटा देगा।',
                        cancel: 'रद्द करें',
                        confirm: 'हटाएँ',
                        deleting: 'हटाया जा रहा है…',
                        errors: {
                            delete_failed:
                                'यह वार्तालाप हटाया नहीं जा सका। कृपया पुनः प्रयास करें।',
                            forbidden:
                                'आपके पास इस वार्तालाप को हटाने की अनुमति नहीं है।',
                            not_found: 'यह वार्तालाप अब उपलब्ध नहीं है।',
                        },
                    },
                },
                detail: {
                    back: 'वापस',
                    back_aria: 'बातचीत सूची पर वापस जाएँ',
                    loading: 'संदेश लोड हो रहे हैं…',
                    loading_more: 'पुराने संदेश लोड हो रहे हैं…',
                    load_older: 'पुराने संदेश लोड करें',
                    new_messages_badge_one: '1 नया संदेश',
                    new_messages_badge_other: '{{count}} नए संदेश',
                    new_messages_badge_label_one: 'नया संदेश',
                    new_messages_badge_label_other: 'नए संदेश',
                    new_messages_badge_aria_one: 'नए संदेश पर जाएँ',
                    new_messages_badge_aria_other:
                        '{{count}} नए संदेशों पर जाएँ',
                    empty: {
                        title: 'कोई संदेश नहीं',
                        description: 'इस बातचीत में कोई संदेश नहीं है।',
                    },
                    errors: {
                        load_title: 'संदेश लोड नहीं हो सके',
                        load_description:
                            'संदेश लोड करते समय समस्या हुई। कृपया पुनः प्रयास करें।',
                    },
                    archive_banner: {
                        title: 'संग्रहीत बातचीत',
                        description:
                            'यह बातचीत केवल पढ़ने योग्य है। संदेश जोड़े, संपादित या हटाए नहीं जा सकते।',
                    },
                    metadata: {
                        status_label: 'स्थिति',
                        status_active: 'सक्रिय',
                        status_archived: 'संग्रहीत',
                        message_count_label: 'संदेशों की संख्या',
                        message_count: '{{count}} संदेश',
                    },
                    message: {
                        edited: '(संपादित)',
                        edited_aria: 'संदेश संपादित किया गया',
                        day_separator: {
                            today: 'आज',
                            yesterday: 'कल',
                        },
                        actions: {
                            title: 'संदेश क्रियाएँ',
                            edit: 'संपादित करें',
                            delete: 'हटाएँ',
                        },
                        reactions: {
                            add_aria: 'प्रतिक्रिया जोड़ें',
                            add_tooltip: 'प्रतिक्रिया जोड़ें',
                            picker_loading: 'इमोजी पिकर लोड हो रहा है…',
                            picker_aria_label: 'इमोजी पिकर',
                            picker_search_placeholder: 'इमोजी खोजें…',
                            picker_empty: 'कोई इमोजी नहीं मिला।',
                            chip_aria: '{{emoji}} प्रतिक्रिया, {{count}}',
                            preview_and_others_one: 'और {{count}} अन्य',
                            preview_and_others_other: 'और {{count}} अन्य',
                            errors: {
                                generic:
                                    'प्रतिक्रिया अपडेट नहीं हो सकी। कृपया पुनः प्रयास करें।',
                                forbidden:
                                    'आपको इस संदेश पर प्रतिक्रिया देने की अनुमति नहीं है।',
                                archived:
                                    'यह वार्तालाप संग्रहीत है और प्रतिक्रियाएँ केवल पढ़ने योग्य हैं।',
                                not_found: 'यह संदेश अब उपलब्ध नहीं है।',
                                invalid_emoji: 'यह इमोजी मान्य नहीं है।',
                            },
                        },
                    },
                    composer: {
                        label: 'संदेश',
                        placeholder: 'संदेश लिखें…',
                        submit: 'भेजें',
                        submitting: 'भेजा जा रहा है…',
                        form_aria_label: 'नया वार्तालाप संदेश',
                        keyboard_hint:
                            'भेजने के लिए Enter दबाएँ। नई पंक्ति के लिए Shift+Enter।',
                        counter_aria_label:
                            '{{count}} / {{max}} वर्ण उपयोग किए गए',
                        errors: {
                            empty: 'भेजने के लिए संदेश दर्ज करें।',
                            too_long: 'संदेश 2000 वर्णों से अधिक नहीं हो सकते।',
                            create_failed:
                                'संदेश नहीं भेजा जा सका। कृपया पुनः प्रयास करें।',
                        },
                    },
                    edit: {
                        label: 'संदेश',
                        form_aria_label: 'वार्तालाप संदेश संपादित करें',
                        save: 'सहेजें',
                        saving: 'सहेजा जा रहा है…',
                        cancel: 'रद्द करें',
                        counter_aria_label:
                            '{{count}} / {{max}} वर्ण उपयोग किए गए',
                        errors: {
                            empty: 'सहेजने के लिए संदेश दर्ज करें।',
                            too_long: 'संदेश 2000 वर्णों से अधिक नहीं हो सकते।',
                            update_failed:
                                'संदेश अपडेट नहीं हो सका। कृपया पुनः प्रयास करें।',
                        },
                    },
                    delete_dialog: {
                        title: 'संदेश हटाएँ',
                        description:
                            'क्या आप वाकई इस संदेश को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                        cancel: 'रद्द करें',
                        confirm: 'हटाएँ',
                        deleting: 'हटाया जा रहा है…',
                        errors: {
                            delete_failed:
                                'यह संदेश हटाया नहीं जा सका। कृपया पुनः प्रयास करें।',
                        },
                    },
                    mutation_errors: {
                        forbidden:
                            'आपके पास इस संदेश को बदलने की अनुमति नहीं है।',
                        archived:
                            'यह वार्तालाप संग्रहीत है और केवल-पढ़ने योग्य है।',
                        not_found: 'यह वार्तालाप या संदेश अब उपलब्ध नहीं है।',
                    },
                },

                targets: {
                    diagram: 'आरेख',
                    table: 'तालिका',
                    field: 'फ़ील्ड',
                    relationship: 'संबंध',
                    unknown: 'वार्तालाप',
                },
                target_labels: {
                    diagram: 'आरेख',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'हटाई गई तालिका',
                    missing_field: 'हटाया गया फ़ील्ड',
                    missing_relationship: 'हटाया गया संबंध',
                    unknown: 'वार्तालाप',
                },
            },
            activities_section: {
                title: 'गतिविधि',
                filter: 'फ़िल्टर',
                clear: 'फ़िल्टर साफ़ करें',
                no_results: 'आपके फ़िल्टर से मेल खाती कोई गतिविधि नहीं मिली।',
                loading: 'गतिविधि लोड हो रही है…',
                retry: 'पुनः प्रयास करें',
                type_filter: {
                    trigger: 'प्रकार',
                    label: 'प्रकार से फ़िल्टर करें',
                    trigger_aria: 'गतिविधि प्रकार से फ़िल्टर करें',
                },
                types: {
                    diagram: 'आरेख',
                    table: 'तालिका',
                    field: 'फ़ील्ड',
                    relationship: 'संबंध',
                    note: 'नोट',
                    area: 'क्षेत्र',
                    dependency: 'निर्भरता',
                },
                you: 'आप',
                unknown_user: 'कोई व्यक्ति',
                empty_state: {
                    title: 'अभी तक कोई गतिविधि नहीं',
                    description: 'हाल के बदलाव देखने के लिए संपादन शुरू करें।',
                },
                errors: {
                    load_failed: 'गतिविधि लोड नहीं हो सकी।',
                },
                actions: {
                    add_tables: '{{user}} ने तालिका {{table}} जोड़ी',
                    remove_tables: '{{user}} ने एक तालिका हटाई',
                    add_field: '{{user}} ने फ़ील्ड {{field}} जोड़ा',
                    remove_field: '{{user}} ने एक फ़ील्ड हटाया',
                    update_field: '{{user}} ने फ़ील्ड {{field}} अपडेट किया',
                    add_relationships: '{{user}} ने एक संबंध जोड़ा',
                    remove_relationships: '{{user}} ने एक संबंध हटाया',
                    update_relationship: '{{user}} ने एक संबंध अपडेट किया',
                    add_notes: '{{user}} ने एक नोट जोड़ा',
                    remove_notes: '{{user}} ने एक नोट हटाया',
                    add_areas: '{{user}} ने एक क्षेत्र जोड़ा',
                    remove_areas: '{{user}} ने एक क्षेत्र हटाया',
                    add_dependencies: '{{user}} ने एक निर्भरता जोड़ी',
                    remove_dependencies: '{{user}} ने एक निर्भरता हटाई',
                    fallback: '{{user}} ने आरेख अपडेट किया',
                },
            },
            share_section: {
                title: 'साझा करें',
                tabs_label: 'साझा करने के विकल्प',
                tabs: {
                    collaborators: 'सहयोगी',
                    public_link: 'सार्वजनिक लिंक',
                },
                collaborators: {
                    description:
                        'संपादक या दर्शक पहुंच के साथ सहयोगियों को आमंत्रित करें। उनके पास पहले से FoxalDB खाता होना चाहिए।',
                    filter: 'फ़िल्टर',
                    clear: 'फ़िल्टर साफ़ करें',
                    no_results_title: 'कोई परिणाम नहीं',
                    no_results_description:
                        'आपके फ़िल्टर से मेल खाने वाला कोई सहयोगी नहीं मिला।',
                    role_filter: {
                        trigger: 'भूमिका',
                        label: 'भूमिका के अनुसार फ़िल्टर',
                        trigger_aria: 'सहयोगी भूमिका के अनुसार फ़िल्टर',
                    },
                },
                public_link: {
                    title: 'सार्वजनिक लिंक',
                    description:
                        'अपने आरेख का केवल-पढ़ने योग्य स्नैपशॉट लिंक वाले किसी के साथ साझा करें।',
                    coming_soon: 'जल्द आ रहा है।',
                },
                loading: 'सहयोगी लोड हो रहे हैं…',
                retry: 'पुनः प्रयास करें',
                errors: {
                    load_failed: 'सहयोगी लोड नहीं हो सके।',
                },
                member_actions: {
                    title: 'सहयोगी क्रियाएँ',
                    trigger_aria: 'सहयोगी क्रियाएँ',
                    role: 'भूमिका',
                    remove: 'सहयोगी हटाएँ',
                },
            },
        },

        toolbar: {
            zoom_in: 'ज़ूम इन',
            zoom_out: 'ज़ूम आउट',
            save: 'सहेजें',
            show_all: 'सभी दिखाएँ',
            undo: 'पूर्ववत करें',
            redo: 'पुनः करें',
            reorder_diagram: 'आरेख स्वचालित व्यवस्थित करें',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'ओवरलैपिंग तालिकाओं को हाइलाइट करें',
            filter: 'टेबल फ़िल्टर करें',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'अपना डेटाबेस चुनें',
                description: 'अपने नए डायग्राम के लिए डेटाबेस सिस्टम चुनें।',
                search_placeholder: 'डेटाबेस प्रबंधन प्रणाली खोजें…',
                search_no_results:
                    'आपकी खोज से कोई डेटाबेस प्रबंधन प्रणाली मेल नहीं खाती।',
                clear_search: 'खोज साफ़ करें',
                primary_group: 'प्राथमिक डेटाबेस',
                other_group: 'अन्य डेटाबेस',
                check_examples_long: 'उदाहरण देखें',
                check_examples_short: 'उदाहरण',
            },

            choose_intent: {
                title: 'आप क्या करना चाहते हैं?',
                description: '{{database}} के लिए एक नया डायग्राम बनाएं।',
                create_empty: 'खाली डायग्राम बनाएं',
                create_empty_description:
                    'खुद टेबल जोड़कर शुरुआत से शुरू करें।',
                import: 'आयात करें',
                import_description:
                    'फ़ाइल, चिपकाए गए टेक्स्ट या अपने डेटाबेस से।',
                back: 'वापस',
            },

            choose_import_method: {
                title: 'आप कैसे आयात करना चाहते हैं?',
                description: 'अपने {{database}} आरेख के लिए स्रोत चुनें।',
                from_file: 'फ़ाइल या चिपकाया टेक्स्ट',
                from_file_description:
                    'SQL, DBML, JSON, प्रोजेक्ट आर्काइव (.zip).',
                from_database: 'मौजूदा डेटाबेस',
                from_database_description:
                    'अपने डेटाबेस में क्वेरी चलाएँ और परिणाम चिपकाएँ।',
                back: 'वापस',
            },

            import_from_database: {
                title: 'मौजूदा डेटाबेस से आयात करें',
                description:
                    'जब आपके पास SQL या DBML स्कीमा फ़ाइल न हो तो इसका उपयोग करें। अपने डेटाबेस में क्वेरी चलाएँ, फिर नीचे परिणाम पेस्ट करें।',
                database_edition: 'डेटाबेस संस्करण',
                edition_regular: 'सामान्य',
                run_query: 'अपने डेटाबेस में यह क्वेरी चलाएँ',
                client_sql: 'SQL',
                paste_result: 'परिणाम पेस्ट करें',
                paste_result_placeholder: 'क्वेरी का परिणाम यहाँ पेस्ट करें…',
                check_result: 'परिणाम जाँचें',
                valid_result: 'परिणाम मान्य लगता है।',
                invalid_result:
                    'परिणाम सत्यापित नहीं हो सका। सामग्री जाँचें और पुनः प्रयास करें।',
                truncated_result:
                    'परिणाम कटा हुआ हो सकता है। SQL क्लाइंट सेटिंग समायोजित करें और क्वेरी फिर चलाएँ।',
                waiting_for_result:
                    'जारी रखने के लिए क्वेरी का परिणाम पेस्ट करें।',
                unsupported_database:
                    'इस डेटाबेस प्रकार के लिए स्कीमा निष्कर्षण उपलब्ध नहीं है।',
                import_failed:
                    'डेटाबेस स्कीमा आयात नहीं हो सका। परिणाम जाँचें और पुनः प्रयास करें।',
                back: 'वापस',
                import: 'आयात करें',
            },

            import_schema: {
                title: 'अपना स्कीमा पेस्ट करें',
                textarea_label: 'स्कीमा सामग्री',
                textarea_placeholder:
                    'यहाँ SQL, DBML या JSON मेटाडेटा पेस्ट करें…',
                auto_detect_hint: 'हम प्रारूप को स्वचालित रूप से पहचानेंगे।',
                or_divider: 'या',
                choose_file: 'फ़ाइल चुनें',
                choose_file_or_project: 'फ़ाइल या प्रोजेक्ट चुनें',
                supported_formats_hint:
                    'समर्थित: SQL, DBML, JSON, प्रोजेक्ट आर्काइव (.zip)',
                privacy_info: {
                    link_label: 'अधिक जानकारी…',
                    title: 'गोपनीयता और समर्थित प्रारूप',
                    intro: 'फ़ाइल चुनने से पहले, जानें कि आयात के दौरान FoxalDB आपके डेटा को कैसे संभालता है।',
                    highlights: {
                        no_execution:
                            'आयात केवल स्थैतिक विश्लेषण का उपयोग करता है — आपका कोड कभी निष्पादित नहीं होता।',
                        no_full_upload:
                            'पूरे प्रोजेक्ट आर्काइव कभी सर्वर पर अपलोड नहीं होते।',
                        filtered_files:
                            'केवल स्कीमा-संबंधित फ़ाइलें रखी जाती हैं; .env, vendor/, node_modules/ और tests/ बाहर रखे जाते हैं।',
                    },
                    simple_formats_title: 'SQL, DBML और JSON',
                    simple_formats_description:
                        'पूरी तरह आपके ब्राउज़र में संसाधित। अधिकतम फ़ाइल आकार: {{sizeMb}} MB।',
                    project_archives_title: 'प्रोजेक्ट आर्काइव (.zip)',
                    project_archives_description:
                        'आर्काइव स्थानीय रूप से खोला जाता है और केवल स्कीमा-संबंधित फ़ाइलें निकाली जाती हैं। अधिकतम आर्काइव आकार: {{sizeMb}} MB।',
                    excluded_paths:
                        'कभी शामिल नहीं: .env, vendor/, node_modules/, tests/ और अन्य गैर-स्कीमा स्रोत फ़ाइलें।',
                    table: {
                        framework: 'फ्रेमवर्क',
                        files: 'विश्लेषित फ़ाइलें',
                        processing: 'प्रसंस्करण',
                        processing_local: 'केवल ब्राउज़र',
                        processing_remote: 'सर्वर (साइन-इन आवश्यक)',
                    },
                    frameworks: {
                        laravel: { files: 'database/migrations/*.php' },
                        prisma: { files: 'prisma/schema.prisma' },
                        rails: { files: 'db/schema.rb' },
                        drizzle: { files: 'drizzle/**/*.sql' },
                        entity_framework_core: { files: '*ModelSnapshot.cs' },
                        django: { files: '*/migrations/*.py' },
                    },
                    back: 'वापस',
                },
                change_file_aria: 'फ़ाइल बदलें, वर्तमान: {{name}}',
                selected_file: 'चयनित फ़ाइल: {{name}}',
                back: 'वापस',
                import: 'आयात करें',
                mismatch: {
                    title: 'यह स्कीमा {{detected}} जैसा लगता है, लेकिन आपने {{selected}} चुना है।',
                    description:
                        'पहचाने गए डेटाबेस प्रकार पर स्विच करें या दूसरा चुनने के लिए वापस जाएं।',
                    switch: '{{database}} पर स्विच करें',
                    go_back: 'वापस',
                },
                ambiguous: {
                    title: 'स्रोत DBMS चुनें',
                    confidence_explanation:
                        'प्रतिशत प्रत्येक DBMS के लिए पाए गए SQL बोली के मिलान सूचकांक को दर्शाते हैं।',
                    description:
                        'SQL बोली स्वचालित रूप से पहचानी नहीं जा सकी। पुष्टि करें कि यह स्कीमा किस DBMS से आया है।',
                    choose_source: 'स्रोत DBMS चुनें',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% विश्वास, स्वचालित पहचान)',
                    recommended_tooltip: 'स्वचालित रूप से पहचाना गया DBMS',
                    recommended_aria:
                        '{{database}}, स्वचालित रूप से पहचाना गया DBMS',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Ready to import this diagram.',
                        mismatch_title: 'DBMS असंगति',
                        mismatch_description:
                            'फ़ाइल {{detected}} दर्शाती है, लेकिन आपने {{selected}} चुना था।',
                        unsupported_existing:
                            'Diagram JSON restores a full diagram and cannot be merged into the current one. Export or create a new diagram instead.',
                    },
                    ambiguous: {
                        title: 'Choose the diagram DBMS',
                        description:
                            'इस आयात के लिए लागू करने के लिए विकल्प चुनें।',
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
                    dialect: '{{database}} का पता चला',
                    dbml: 'DBML का पता चला',
                    metadata_json: 'मेटाडेटा JSON का पता चला',
                    diagram_json: 'डायग्राम JSON का पता चला',
                    sql_ambiguous_title: 'SQL का पता चला',
                    sql_ambiguous_description: 'डेटाबेस की पहचान नहीं हो सकी।',
                    clickhouse_unsupported: 'ClickHouse SQL का पता चला',
                    unsupported: 'असमर्थित प्रारूप',
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
                    analyzing_project:
                        'प्रोजेक्ट आर्काइव का विश्लेषण हो रहा है…',
                    detected: '{{framework}} प्रोजेक्ट पहचाना गया',
                    migrations_found_one: '{{count}} माइग्रेशन मिला',
                    migrations_found_other: '{{count}} माइग्रेशन मिले',
                    schema_files_found_one: '{{count}} स्कीमा फ़ाइल मिली',
                    schema_files_found_other: '{{count}} स्कीमा फ़ाइलें मिलीं',
                    multiple_projects_title: 'कई डेटाबेस स्कीमा पहचाने गए',
                    multiple_projects_description:
                        'इस आर्काइव में एक से अधिक समर्थित डेटाबेस प्रोजेक्ट हैं। कौन सा आयात करना है चुनें।',
                    choose_project: 'प्रोजेक्ट चुनें',
                    unsupported_project: 'असमर्थित प्रोजेक्ट आर्काइव',
                    unsupported_project_description:
                        'इस आर्काइव में Laravel, Prisma, Drizzle, Rails, Entity Framework Core या Django डेटाबेस प्रोजेक्ट नहीं मिला।',
                    project_root: 'प्रोजेक्ट रूट: {{path}}',
                    sign_in_to_import_framework:
                        'आयात उपलब्ध होने पर {{framework}} प्रोजेक्ट आयात करने के लिए साइन इन करें।',
                    remote_processing_notice:
                        'आयात उपलब्ध होने पर केवल स्कीमा-संबंधित फ़ाइलें संसाधित होंगी।',
                    remote_processing_scope:
                        'पूरा आर्काइव या असंबंधित सोर्स फ़ाइलें कभी अपलोड नहीं होतीं।',
                    remote_processing_security:
                        'विश्लेषण स्थिर है और अपलोड किया गया कोड नहीं चलाता।',
                },
                errors: {
                    unreadable_file: 'चयनित फ़ाइल पढ़ी नहीं जा सकी।',
                    malformed_json: 'JSON सामग्री पार्स नहीं की जा सकी।',
                    unsupported:
                        'स्कीमा आयात के लिए यह प्रारूप समर्थित नहीं है।',
                    diagram_json:
                        'डायग्राम JSON को डायग्राम फ़ाइल विकल्प से आयात किया जा सकता है।',
                    clickhouse_unsupported:
                        'ClickHouse के लिए SQL DDL आयात समर्थित नहीं है। DBML का उपयोग करें या मौजूदा डेटाबेस से आयात करें।',
                    file_too_large: 'चयनित फ़ाइल 5 MB से बड़ी है।',
                    archive_too_large:
                        'चयनित प्रोजेक्ट आर्काइव 50 MB से बड़ा है।',
                    archive_invalid:
                        'चयनित फ़ाइल मान्य प्रोजेक्ट आर्काइव नहीं है।',
                    unsupported_file_extension:
                        'केवल .sql, .dbml, .json और .zip प्रोजेक्ट आर्काइव समर्थित हैं।',
                    import_failed:
                        'स्कीमा आयात नहीं हो सका। सामग्री जांचें और पुनः प्रयास करें।',
                    invalid_diagram_json:
                        'डायाग्राम JSON अमान्य है। फ़ाइल जाँचें और पुनः प्रयास करें।',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS निर्देश',
                    title: 'निर्देश',
                    step_1: 'टूल्स > ऑप्शंस > क्वेरी परिणाम > SQL सर्वर पर जाएँ।',
                    step_2: 'यदि आप "ग्रिड में परिणाम" का उपयोग कर रहे हैं, तो Non-XML डेटा के लिए अधिकतम वर्ण प्राप्ति (9999999 पर सेट करें)।',
                },
            },

            cancel: 'रद्द करें',
            back: 'वापस',
            // TODO: Translate
            import_from_file: 'Import from File',
            empty_diagram: 'खाली डेटाबेस',
            continue: 'जारी रखें',
            import: 'आयात करें',
        },

        share_diagram_dialog: {
            title: 'आरेख साझा करें',
            description:
                'संपादक या दर्शक पहुँच के साथ सहयोगियों को आमंत्रित करें। उनके पास पहले से FoxalDB खाता होना चाहिए।',
            share_button: 'साझा करें',
            empty_members: 'अभी तक कोई सहयोगी नहीं है।',
            remove: 'हटाएँ',
            roles: {
                owner: 'स्वामी',
                editor: 'संपादक',
                viewer: 'दर्शक',
            },
            add_member: {
                title: 'सहयोगी जोड़ें',
                email_label: 'ईमेल',
                email_placeholder: 'ईमेल पता',
                add: 'जोड़ें',
                adding: 'जोड़ा जा रहा है…',
                cancel: 'रद्द करें',
            },
            errors: {
                load_failed: 'सहयोगियों को लोड नहीं किया जा सका।',
                add_failed: 'सहयोगी जोड़ा नहीं जा सका।',
            },
        },

        diagram_role: {
            owner: 'स्वामी',
            editor: 'संपादक',
            viewer: 'दर्शक',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'डेटाबेस खोलें',
            description: 'अपने नए डायग्राम के लिए डेटाबेस सिस्टम चुनें।',
            table_columns: {
                name: 'नाम',
                created_at: 'निर्माण तिथि',
                last_modified: 'अंतिम संशोधन',
                tables_count: 'तालिकाएँ',
            },
            cancel: 'रद्द करें',
            open: 'खोलें',
            new_database: 'नया डेटाबेस',

            diagram_actions: {
                open: 'खोलें',
                duplicate: 'डुप्लिकेट',
                delete: 'हटाएं',
            },
        },

        export_sql_dialog: {
            title: 'SQL निर्यात करें',
            description:
                '{{databaseType}} स्क्रिप्ट के लिए आपका आरेख स्कीमा निर्यात करें',
            close: 'बंद करें',
            loading: {
                text: '{{databaseType}} के लिए AI SQL बना रहा है...',
                description: 'इसमें 30 सेकंड तक का समय लग सकता है।',
            },
            error: {
                message:
                    'SQL स्क्रिप्ट उत्पन्न करने में त्रुटि। कृपया बाद में पुनः प्रयास करें या <0>हमसे संपर्क करें</0>।',
                description:
                    'अपने OPENAI_TOKEN का उपयोग करने के लिए स्वतंत्र महसूस करें, मैनुअल <0>यहाँ देखें</0>।',
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
            title: 'संबंध बनाएँ',
            primary_table: 'प्राथमिक तालिका',
            primary_field: 'प्राथमिक फ़ील्ड',
            referenced_table: 'संदर्भित तालिका',
            referenced_field: 'संदर्भित फ़ील्ड',
            primary_table_placeholder: 'तालिका चुनें',
            primary_field_placeholder: 'फ़ील्ड चुनें',
            referenced_table_placeholder: 'तालिका चुनें',
            referenced_field_placeholder: 'फ़ील्ड चुनें',
            no_tables_found: 'कोई तालिकाएँ नहीं मिलीं',
            no_fields_found: 'कोई फ़ील्ड्स नहीं मिलीं',
            create: 'बनाएँ',
            cancel: 'रद्द करें',
        },

        import_database_dialog: {
            title: 'वर्तमान आरेख में आयात करें',
            import_schema: {
                title: 'स्कीमा आयात करें',
                import: 'आयात',
                cancel: 'रद्द करें',
                mismatch: {
                    title: 'यह स्कीमा {{detected}} जैसी लगती है, लेकिन यह आरेख {{selected}} है।',
                    description: 'क्रॉस-डेटाबेस आयात अभी समर्थित नहीं है।',
                    cancel: 'रद्द करें',
                },
                ambiguous: {
                    description:
                        'SQL बोली स्वचालित रूप से पहचानी नहीं जा सकी। वर्तमान {{selected}} आरेख के लिए इस स्कीमा की व्याख्या कैसे करनी है, पुष्टि करें।',
                },
            },
            override_alert: {
                title: 'डेटाबेस आयात करें',
                content: {
                    alert: 'इस आरेख को आयात करने से मौजूदा तालिकाओं और संबंधों पर प्रभाव पड़ेगा।',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> नई तालिकाएँ जोड़ी जाएँगी।',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> नए संबंध बनाए जाएँगे।',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> तालिकाएँ अधिलेखित की जाएँगी।',
                    proceed: 'क्या आप जारी रखना चाहते हैं?',
                },
                import: 'आयात करें',
                cancel: 'रद्द करें',
            },
        },

        export_image_dialog: {
            title: 'छवि निर्यात करें',
            description: 'निर्यात के लिए स्केल फ़ैक्टर चुनें:',
            scale_1x: '1x (निम्न गुणवत्ता)',
            scale_2x: '2x (सामान्य गुणवत्ता)',
            scale_4x: '4x (सर्वोत्तम गुणवत्ता)',
            cancel: 'रद्द करें',
            export: 'निर्यात करें',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'स्कीमा चुनें',
            description:
                'वर्तमान में कई स्कीमा प्रदर्शित हैं। नई तालिका के लिए एक चुनें।',
            cancel: 'रद्द करें',
            confirm: 'पुष्टि करें',
        },

        update_table_schema_dialog: {
            title: 'स्कीमा बदलें',
            description: 'तालिका "{{tableName}}" का स्कीमा अपडेट करें',
            cancel: 'रद्द करें',
            confirm: 'बदलें',
        },

        create_table_schema_dialog: {
            title: 'नया स्कीमा बनाएं',
            description:
                'अभी तक कोई स्कीमा मौजूद नहीं है। अपनी तालिकाओं को व्यवस्थित करने के लिए अपना पहला स्कीमा बनाएं।',
            create: 'बनाएं',
            cancel: 'रद्द करें',
        },
        // TODO: Translate
        export_diagram_dialog: {
            title: 'Export Diagram',
            description: 'Choose the format for export:',
            format_json: 'JSON',
            cancel: 'Cancel',
            export: 'Export',
            error: {
                title: 'Error exporting diagram',
                description:
                    'Something went wrong. Need help? support@chartdb.io',
            },
        },
        // TODO: Translate
        import_diagram_dialog: {
            title: 'Import Diagram',
            description: 'Paste the diagram JSON below:',
            cancel: 'Cancel',
            import: 'Import',
            error: {
                title: 'Error importing diagram',
                description:
                    'The diagram JSON is invalid. Please check the JSON and try again. Need help? support@chartdb.io',
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
            one_to_one: 'एक से एक',
            one_to_many: 'एक से कई',
            many_to_one: 'कई से एक',
            many_to_many: 'कई से कई',
        },

        canvas_context_menu: {
            new_table: 'नई तालिका',
            new_view: 'नया व्यू',
            new_relationship: 'नया संबंध',
            // TODO: Translate
            new_area: 'नया क्षेत्र',
            new_note: 'नया नोट',
        },

        table_node_context_menu: {
            edit_table: 'तालिका संपादित करें',
            duplicate_table: 'तालिका की प्रतिलिपि बनाएँ',
            delete_table: 'तालिका हटाएँ',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'क्षेत्र में ले जाएं',
            no_area: 'कोई क्षेत्र नहीं',
        },

        canvas: {
            all_tables_hidden: 'सभी तालिकाएँ छिपी हुई हैं',
            show_all_tables: 'सभी दिखाएं',
        },

        canvas_filter: {
            title: 'तालिकाएँ फ़िल्टर करें',
            search_placeholder: 'तालिकाएँ खोजें...',
            group_by_schema: 'स्कीमा के अनुसार समूहित करें',
            group_by_area: 'क्षेत्र के अनुसार समूहित करें',
            no_tables_found: 'कोई तालिका नहीं मिली',
            empty_diagram_description: 'शुरू करने के लिए एक तालिका बनाएं',
            no_tables_description:
                'अपनी खोज या फ़िल्टर समायोजित करने का प्रयास करें',
            clear_filter: 'फ़िल्टर साफ़ करें',
        },

        // TODO: Add translations
        snap_to_grid_tooltip: 'Snap to Grid (Hold {{key}})',

        editing_conflict: {
            one: '{{name}} भी इसे संपादित कर रहे हैं।',
            two: '{{name1}} और {{name2}} भी इसे संपादित कर रहे हैं।',
            many: '{{name}} और {{count}} अन्य भी इसे संपादित कर रहे हैं।',
            fallback_name: 'सहयोगी',
            last_writer_wins:
                'परिवर्तन लॉक नहीं हैं। अंतिम सहेजा गया संपादन ही मान्य होगा।',
        },

        tool_tips: {
            double_click_to_edit: 'संपादित करने के लिए डबल-क्लिक करें',
        },

        auth: {
            dialog: {
                account_title: 'खाता',
                login_title: 'FoxalDB में साइन इन करें',
                register_title: 'FoxalDB खाता बनाएं',
                account_description: 'अपने वर्तमान सत्र का प्रबंधन करें।',
                login_description:
                    'अधिक डायग्राम सहेजने और उन्हें सिंक करने के लिए साइन इन करें।',
                register_description:
                    'अधिक डायग्राम सहेजने के लिए एक खाता बनाएं।',
                checking_session: 'सत्र की जाँच हो रही है...',
                continue_without_account: 'खाते के बिना जारी रखें',
            },
            login: {
                title: 'लॉग इन',
                email_label: 'ईमेल',
                password_label: 'पासवर्ड',
                submit: 'साइन इन करें',
                submitting: 'साइन इन हो रहा है...',
                switch_to_register: 'पंजीकरण',
                no_account: 'खाता नहीं है?',
            },
            register: {
                title: 'पंजीकरण',
                first_name_label: 'पहला नाम',
                last_name_label: 'अंतिम नाम',
                email_label: 'ईमेल',
                password_label: 'पासवर्ड',
                password_confirmation_label: 'पासवर्ड की पुष्टि करें',
                submit: 'खाता बनाएं',
                submitting: 'खाता बनाया जा रहा है...',
                switch_to_login: 'लॉग इन',
                already_have_account: 'पहले से खाता है?',
            },
            account: {
                signed_in_as: 'इस रूप में साइन इन',
                logout: 'लॉग आउट',
                back_to_editor: 'संपादक पर वापस जाएं',
            },
            settings: {
                title: 'उपयोगकर्ता सेटिंग्स',
                description: 'अपनी व्यक्तिगत जानकारी और पासवर्ड अपडेट करें।',
                change_password_heading: 'पासवर्ड बदलें',
                current_password_label: 'वर्तमान पासवर्ड',
                new_password_label: 'नया पासवर्ड',
                password_confirmation_label: 'नए पासवर्ड की पुष्टि करें',
                first_name_label: 'पहला नाम',
                last_name_label: 'उपनाम',
                email_label: 'ईमेल पता',
                submit: 'परिवर्तन सहेजें',
                submitting: 'सहेजा जा रहा है...',
                success_title: 'प्रोफ़ाइल अपडेट की गई',
                success_description: 'आपकी प्रोफ़ाइल सहेज ली गई है।',
            },
            nav: {
                sign_in: 'साइन इन',
                logout: 'लॉग आउट',
                loading: '...',
                user_menu: 'खाता',
                settings: 'सेटिंग्स',
                change_language: 'भाषा',
            },
            pages: {
                login_title: 'FoxalDB — लॉग इन',
                register_title: 'FoxalDB — पंजीकरण',
                checking_session: 'सत्र की जाँच हो रही है…',
            },
            errors: {
                first_name_required: 'पहला नाम आवश्यक है।',
                last_name_required: 'अंतिम नाम आवश्यक है।',
                generic: 'कुछ गलत हो गया।',
            },
        },

        guest_migration_dialog: {
            title: 'स्थानीय डायग्राम आयात करें?',
            description:
                'इस डिवाइस पर एक डायग्राम सहेजा है। कहीं से भी एक्सेस करने के लिए इसे अपने खाते में आयात करें।',
            import: 'खाते में आयात करें',
            continue_without_import: 'आयात न करके जारी रखें',
        },

        guest_migration_errors: {
            import_failed:
                'स्थानीय डायग्राम आयात नहीं हो सका। स्थानीय कॉपी सुरक्षित रखी गई।',
            activation_failed:
                'डायग्राम बनाया गया लेकिन खोला नहीं जा सका। स्थानीय कॉपी सुरक्षित रखी गई।',
            cleanup_failed:
                'डायग्राम आयात हो गया लेकिन स्थानीय कॉपी हटाई नहीं जा सकी। आप इसे मैन्युअली हटा सकते हैं।',
            check_failed: 'स्थानीय डायग्राम पढ़ा नहीं जा सका।',
        },

        language_select: {
            change_language: 'भाषा बदलें',
        },

        on: 'चालू',
        off: 'बंद',
    },
};

export const hiMetadata: LanguageMetadata = {
    name: 'Hindi (India)',
    nativeName: 'हिन्दी (भारत)',
    code: 'hi',
    countryCode: 'in',
};
