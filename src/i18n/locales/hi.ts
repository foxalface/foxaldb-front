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
            visuals: 'Visuals',
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
            title: 'आरेख हटाएँ',
            description:
                'यह क्रिया पूर्ववत नहीं की जा सकती। यह आरेख स्थायी रूप से हटा दिया जाएगा।',
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
                        duplicate_table: 'Duplicate Table', // TODO: Translate
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
                    archives: 'संग्रह',
                },
                loading: 'वार्तालाप लोड हो रहे हैं…',
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'पुनः प्रयास करें',
                dismiss: 'Dismiss',
                read_only: 'केवल पढ़ने योग्य',
                deleted_user: 'हटाया गया उपयोगकर्ता',
                inactive: {
                    title: 'वार्तालाप unavailable',
                    description:
                        'वार्तालाप are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'No active वार्तालाप',
                    active_description:
                        'Active वार्तालाप for this diagram will appear here.',
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
                },
                detail: {
                    back: 'वापस',
                    back_aria: 'बातचीत सूची पर वापस जाएँ',
                    loading: 'संदेश लोड हो रहे हैं…',
                    loading_more: 'पुराने संदेश लोड हो रहे हैं…',
                    load_older: 'पुराने संदेश लोड करें',
                    empty: {
                        title: 'अभी कोई संदेश नहीं',
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
                        actions: {
                            title: 'संदेश क्रियाएँ',
                            edit: 'संपादित करें',
                            delete: 'हटाएँ',
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
                title: 'आपका डेटाबेस क्या है?',
                description:
                    'प्रत्येक डेटाबेस की अपनी अनूठी विशेषताएँ और क्षमताएँ होती हैं।',
                check_examples_long: 'उदाहरण देखें',
                check_examples_short: 'उदाहरण',
            },

            import_database: {
                title: 'अपना डेटाबेस आयात करें',
                database_edition: 'डेटाबेस संस्करण:',
                step_1: 'अपने डेटाबेस में यह स्क्रिप्ट चलाएँ:',
                step_2: 'यहाँ स्क्रिप्ट का परिणाम पेस्ट करें →',
                script_results_placeholder: 'स्क्रिप्ट के परिणाम यहाँ...',
                ssms_instructions: {
                    button_text: 'SSMS निर्देश',
                    title: 'निर्देश',
                    step_1: 'टूल्स > ऑप्शंस > क्वेरी परिणाम > SQL सर्वर पर जाएँ।',
                    step_2: 'यदि आप "ग्रिड में परिणाम" का उपयोग कर रहे हैं, तो Non-XML डेटा के लिए अधिकतम वर्ण प्राप्ति (9999999 पर सेट करें)।',
                },
                instructions_link: 'मदद चाहिए? देखें कैसे',
                // TODO: Translate
                check_script_result: 'Check Script Result',
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
            title: 'डेटाबेस खोलें',
            description: 'नीचे दी गई सूची से एक आरेख चुनें।',
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

        star_us_dialog: {
            title: 'हमें सुधारने में मदद करें!',
            description:
                'क्या आप हमें GitHub पर स्टार देना चाहेंगे? यह बस एक क्लिक की दूरी पर है!',
            close: 'अभी नहीं',
            confirm: 'बिलकुल!',
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
            duplicate_table: 'Duplicate Table', // TODO: Translate
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
            nav: {
                sign_in: 'साइन इन',
                logout: 'लॉग आउट',
                loading: '...',
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
    name: 'Hindi',
    nativeName: 'हिन्दी',
    code: 'hi',
};
