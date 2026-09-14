import type { LanguageMetadata, LanguageTranslation } from '../types';

export const gu: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'નવું',
            browse: 'ખોલો',
            tables: 'ટેબલો',
            refs: 'રેફ્સ',
            dependencies: 'નિર્ભરતાઓ',
            custom_types: 'કસ્ટમ ટાઇપ',
            conversations: 'વાતચીત',
            conversations_unread_aria:
                'વાતચીતમાં {{count}} વાંચ્યા વગરના સંદેશા',
            visuals: 'Visuals',
            activities: 'પ્રવૃત્તિ',
            share: 'શેર કરો',
        },
        menu: {
            actions: {
                actions: 'ક્રિયાઓ',
                new: 'નવું...',
                browse: 'બધા ડેટાબેસ...',
                save: 'સાચવો',
                import: 'ડેટાબેસ આયાત કરો',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'SQL નિકાસ કરો',
                export_as: 'રૂપે નિકાસ કરો',
                delete_diagram: 'કાઢી નાખો',
            },
            edit: {
                edit: 'ફેરફાર',
                undo: 'અનડુ',
                redo: 'રીડુ',
                clear: 'સાફ કરો',
            },
            view: {
                view: 'જુઓ',
                show_sidebar: 'સાઇડબાર બતાવો',
                hide_sidebar: 'સાઇડબાર છુપાવો',
                hide_cardinality: 'કાર્ડિનાલિટી છુપાવો',
                show_cardinality: 'કાર્ડિનાલિટી બતાવો',
                hide_field_attributes: 'ફીલ્ડ અટ્રિબ્યુટ્સ છુપાવો',
                show_field_attributes: 'ફીલ્ડ અટ્રિબ્યુટ્સ બતાવો',
                zoom_on_scroll: 'સ્ક્રોલ પર ઝૂમ કરો',
                show_views: 'ડેટાબેઝ વ્યૂઝ',
                theme: 'થિમ',
                show_dependencies: 'નિર્ભરતાઓ બતાવો',
                hide_dependencies: 'નિર્ભરતાઓ છુપાવો',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },

            backup: {
                backup: 'બેકઅપ',
                export_diagram: 'ડાયાગ્રામ નિકાસ કરો',
                restore_diagram: 'ડાયાગ્રામ પુનઃસ્થાપિત કરો',
            },
            help: {
                help: 'મદદ',
                docs_website: 'દસ્તાવેજીકરણ',
                join_discord: 'અમારા Discordમાં જોડાઓ',
            },
        },

        delete_diagram_alert: {
            title: 'તમારી ડેટાબેઝ પસંદ કરો',
            description: 'તમારા નવા ડાયાગ્રામ માટે ડેટાબેઝ સિસ્ટમ પસંદ કરો.',
            cancel: 'રદ કરો',
            delete: 'કાઢી નાખો',
        },

        clear_diagram_alert: {
            title: 'ડાયાગ્રામ સાફ કરો',
            description:
                'આ ક્રિયા પરત નહીં લઇ શકાય. આ ડાયાગ્રામમાં બધા ડેટા કાયમ માટે કાઢી નાખશે.',
            cancel: 'રદ કરો',
            clear: 'સાફ કરો',
        },

        diagram_access: {
            removed: {
                title: 'તમારી ડેટાબેઝ પસંદ કરો',
                description:
                    'તમારા નવા ડાયાગ્રામ માટે ડેટાબેઝ સિસ્ટમ પસંદ કરો.',
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
            title: 'ડાયાગ્રામ ઑટોમેટિક ગોઠવો',
            description:
                'આ ક્રિયા ડાયાગ્રામમાં બધી ટેબલ્સને ફરીથી વ્યવસ્થિત કરશે. શું તમે ચાલુ રાખવા માંગો છો?',
            reorder: 'ઑટોમેટિક ગોઠવો',
            cancel: 'રદ કરો',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'નકલ નિષ્ફળ',
                description: 'ક્લિપબોર્ડ આધારિત નથી',
            },
            failed: {
                title: 'નકલ નિષ્ફળ',
                description: 'કંઈક ખોટું થયું છે. કૃપા કરીને ફરી પ્રયાસ કરો.',
            },
        },

        theme: {
            system: 'સિસ્ટમ',
            light: 'હલકો',
            dark: 'ઘાટો',
        },

        zoom: {
            on: 'ચાલુ',
            off: 'બંધ',
        },

        last_saved: 'છેલ્લે સાચવ્યું',
        saved: 'સાચવ્યું',
        loading_diagram: 'ડાયાગ્રામ લોડ થઈ રહ્યું છે...',
        deselect_all: 'બધાને ડીસેલેક્ટ કરો',
        select_all: 'બધા પસંદ કરો',
        delete: 'કાઢી નાખો',
        clear: 'સાફ કરો',
        show_more: 'વધુ બતાવો',
        show_less: 'ઓછું બતાવો',
        copy_to_clipboard: 'ક્લિપબોર્ડમાં નકલ કરો',
        copied: 'નકલ થયું!',

        side_panel: {
            view_all_options: 'બધા વિકલ્પો જુઓ...',
            tables_section: {
                tables: 'ટેબલ્સ',
                add_table: 'ટેબલ ઉમેરો',
                add_view: 'વ્યૂ ઉમેરો',
                filter: 'ફિલ્ટર',
                collapse: 'બધાને સકુચિત કરો',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'બધી ટેબલ્સ છુપાયેલી છે',
                show_all: 'બધું બતાવો',

                table: {
                    fields: 'ફીલ્ડ્સ',
                    //TODO translate
                    nullable: 'Nullable?',
                    primary_key: 'પ્રાથમિક કી',
                    indexes: 'ઈન્ડેક્સ',
                    check_constraints: 'ચકાસણી નિયંત્રણો',
                    comments: 'ટિપ્પણીઓ',
                    no_comments: 'કોઈ ટિપ્પણીઓ નથી',
                    add_field: 'ફીલ્ડ ઉમેરો',
                    add_index: 'ઈન્ડેક્સ ઉમેરો',
                    add_check: 'ચકાસણી ઉમેરો',
                    index_select_fields: 'ફીલ્ડ્સ પસંદ કરો',
                    no_types_found: 'કોઈ પ્રકાર મળ્યા નથી',
                    field_name: 'નામ',
                    field_type: 'પ્રકાર',
                    field_actions: {
                        title: 'ફીલ્ડ લક્ષણો',
                        open_discussion: 'વાતચીત ખોલો',
                        unique: 'અદ્વિતીય',
                        auto_increment: 'ઑટો ઇન્ક્રિમેન્ટ',
                        comments: 'ટિપ્પણીઓ',
                        no_comments: 'કોઈ ટિપ્પણીઓ નથી',
                        delete_field: 'ફીલ્ડ કાઢી નાખો',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'ચોકસાઈ',
                        scale: 'માપ',
                    },
                    index_actions: {
                        title: 'ઇન્ડેક્સ લક્ષણો',
                        name: 'નામ',
                        unique: 'અદ્વિતીય',
                        index_type: 'ઇન્ડેક્સ પ્રકાર',
                        delete_index: 'ઇન્ડેક્સ કાઢી નાખો',
                    },
                    check_constraint_actions: {
                        title: 'ચકાસણી નિયંત્રણ',
                        expression: 'અભિવ્યક્તિ',
                        delete: 'નિયંત્રણ કાઢી નાખો',
                    },
                    table_actions: {
                        title: 'ટેબલ ક્રિયાઓ',
                        open_discussion: 'વાતચીત ખોલો',
                        change_schema: 'સ્કીમા બદલો',
                        add_field: 'ફીલ્ડ ઉમેરો',
                        add_index: 'ઇન્ડેક્સ ઉમેરો',
                        duplicate_table: 'ટેબલની નકલ કરો',
                        delete_table: 'ટેબલ કાઢી નાખો',
                    },
                },
                empty_state: {
                    title: 'કોઈ ટેબલ્સ નથી',
                    description: 'શરૂ કરવા માટે એક ટેબલ બનાવો',
                },
            },
            refs_section: {
                refs: 'રેફ્સ',
                filter: 'ફિલ્ટર',
                clear: 'ફિલ્ટર સાફ કરો',
                no_results: 'તમારા ફિલ્ટર સાથે મેળ ખાતા કોઈ સંદર્ભ મળ્યા નથી.',
                collapse: 'બધાને સકુચિત કરો',
                add_relationship: 'સંબંધ ઉમેરો',
                relationships: 'સંબંધો',
                dependencies: 'નિર્ભરતાઓ',
                relationship: {
                    relationship: 'સંબંધ',
                    primary: 'પ્રાથમિક ટેબલ',
                    foreign: 'સંબંધિત ટેબલ',
                    cardinality: 'કાર્ડિનાલિટી',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'કાઢી નાખો',
                    switch_tables: 'ટેબલ બદલો',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'ક્રિયાઓ',
                        open_discussion: 'વાતચીત ખોલો',
                        delete_relationship: 'કાઢી નાખો',
                    },
                },
                dependency: {
                    dependency: 'નિર્ભરતા',
                    table: 'ટેબલ',
                    dependent_table: 'નિર્ભરશીલ વ્યૂ',
                    delete_dependency: 'કાઢી નાખો',
                    dependency_actions: {
                        title: 'ક્રિયાઓ',
                        delete_dependency: 'કાઢી નાખો',
                    },
                },
                empty_state: {
                    title: 'કોઈ સંબંધો નથી',
                    description: 'શરૂ કરવા માટે એક સંબંધ બનાવો',
                },
            },

            areas_section: {
                areas: 'વિસ્તારો',
                add_area: 'વિસ્તાર ઉમેરો',
                filter: 'ફિલ્ટર',
                clear: 'ફિલ્ટર સાફ કરો',
                no_results: 'તમારા ફિલ્ટરને અનુરૂપ કોઈ વિસ્તાર મળ્યો નથી.',

                area: {
                    area_actions: {
                        title: 'વિસ્તાર ક્રિયાઓ',
                        edit_name: 'નામ સંપાદિત કરો',
                        delete_area: 'વિસ્તાર કાઢી નાખો',
                    },
                },
                empty_state: {
                    title: 'કોઈ વિસ્તાર નથી',
                    description: 'શરૂ કરવા માટે વિસ્તાર બનાવો',
                },
            },

            visuals_section: {
                visuals: 'Visuals',
                tabs: {
                    areas: 'વિસ્તારો',
                    notes: 'નોંધો',
                },
            },

            notes_section: {
                filter: 'ફિલ્ટર',
                add_note: 'નોંધ ઉમેરો',
                no_results: 'કોઈ નોંધો મળી નથી',
                clear: 'ફિલ્ટર સાફ કરો',
                empty_state: {
                    title: 'કોઈ નોંધો નથી',
                    description:
                        'કેનવાસ પર ટેક્સ્ટ એનોટેશન ઉમેરવા માટે નોંધ બનાવો',
                },
                note: {
                    empty_note: 'ખાલી નોંધ',
                    note_actions: {
                        title: 'નોંધ ક્રિયાઓ',
                        edit_content: 'સામગ્રી સંપાદિત કરો',
                        delete_note: 'નોંધ કાઢી નાખો',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'કસ્ટમ પ્રકાર',
                filter: 'ફિલ્ટર',
                clear: 'ફિલ્ટર સાફ કરો',
                no_results: 'તમારા ફિલ્ટરને અનુરૂપ કોઈ કસ્ટમ પ્રકાર મળ્યો નથી.',
                new_type: 'નવો પ્રકાર',
                empty_state: {
                    title: 'કોઈ કસ્ટમ પ્રકાર નથી',
                    description:
                        'જ્યારે તમારા ડેટાબેસમાં ઉપલબ્ધ હશે ત્યારે કસ્ટમ પ્રકાર અહીં દેખાશે',
                },
                custom_type: {
                    kind: 'પ્રકાર',
                    enum_values: 'Enum મૂલ્યો',
                    composite_fields: 'ફીલ્ડ્સ',
                    no_fields: 'કોઈ ફીલ્ડ વ્યાખ્યાયિત નથી',
                    no_values: 'કોઈ enum મૂલ્યો વ્યાખ્યાયિત નથી',
                    field_name_placeholder: 'ફીલ્ડનું નામ',
                    field_type_placeholder: 'પ્રકાર પસંદ કરો',
                    add_field: 'ફીલ્ડ ઉમેરો',
                    no_fields_tooltip:
                        'આ કસ્ટમ પ્રકાર માટે કોઈ ફીલ્ડ વ્યાખ્યાયિત નથી',
                    custom_type_actions: {
                        title: 'ક્રિયાઓ',
                        highlight_fields: 'ફીલ્ડ્સ હાઇલાઇટ કરો',
                        delete_custom_type: 'કાઢી નાખો',
                        clear_field_highlight: 'હાઇલાઇટ કાઢો',
                    },
                    delete_custom_type: 'પ્રકાર કાઢી નાખો',
                },
            },
            conversations_section: {
                title: 'વાતચીત',
                tabs_label: 'વાતચીત',
                tabs: {
                    active: 'સક્રિય',
                    archives: 'આર્કાઇવ કરેલી',
                },
                loading: 'વાતચીત લોડ થઈ રહી છે…',
                filter: 'ફિલ્ટર',
                clear: 'ફિલ્ટર સાફ કરો',
                no_results_title: 'કોઈ પરિણામ નથી',
                no_results_description:
                    'તમારા ફિલ્ટર સાથે મેળ ખાતી કોઈ વાતચીત મળી નથી.',

                type_filter: {
                    trigger: 'પ્રકાર',
                    label: 'પ્રકાર દ્વારા ફિલ્ટર',
                    trigger_aria: 'વાતચીત પ્રકાર દ્વારા ફિલ્ટર',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'ફરી પ્રયાસ કરો',
                dismiss: 'Dismiss',
                read_only: 'માત્ર વાંચવા યોગ્ય',
                deleted_user: 'કાઢી નાખેલો વપરાશકર્તા',
                unread: {
                    badge_aria: '{{count}} વાંચ્યા વગરના સંદેશા',
                },
                inactive: {
                    title: 'વાતચીત unavailable',
                    description:
                        'વાતચીત are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'કોઈ વાતચીત નથી',
                    active_description: 'શરૂ કરવા માટે વાતચીત બનાવો',
                    archives_title: 'No archived વાતચીત',
                    archives_description:
                        'Archived વાતચીત will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load વાતચીત',
                    load_description:
                        'Something went wrong while loading વાતચીત. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'વાતચીત ખોલો',
                    start: 'વાતચીત શરૂ કરો',
                    pending: 'વાતચીત શરૂ થઈ રહી છે…',
                    diagram_name: 'ડાયાગ્રામ',
                    open_aria: '{{name}} માટે વાતચીત ખોલો',
                    start_aria: '{{name}} માટે વાતચીત શરૂ કરો',
                    open_tooltip: '{{name}} માટે વાતચીત ખોલો',
                    start_tooltip: '{{name}} માટે વાતચીત શરૂ કરો',
                    pending_tooltip: '{{name}} માટે વાતચીત શરૂ થઈ રહી છે…',
                    action_tooltip: 'વાતચીત',
                    unavailable_description:
                        'તમે આ ડાયાગ્રામ પર વાતચીત શરૂ કરી શકતા નથી.',
                    errors: {
                        validation: 'આ લક્ષ્ય વાતચીત માટે માન્ય નથી.',
                        forbidden: 'તમને આ વાતચીત શરૂ કરવાની પરવાનગી નથી.',
                        not_found: 'આ લક્ષ્ય ડાયાગ્રામ પર હવે ઉપલબ્ધ નથી.',
                        conflict:
                            'હમણાં આ વાતચીત શરૂ થઈ શકી નથી. ફરી પ્રયાસ કરો.',
                        generic: 'આ વાતચીત ખોલી શકાઈ નથી. ફરી પ્રયાસ કરો.',
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
                    message_count: '{{count}} સંદેશા',
                    no_messages: 'હજી સંદેશા નથી',
                    last_activity: 'છેલ્લી પ્રવૃત્તિ',
                    open_aria: '{{target}} માટે વાતચીત ખોલો',
                    focus_target_aria: 'આલેખ પર {{target}} બતાવો',
                    author_tooltip: '{{name}} નો છેલ્લો સંદેશ',
                    author_missing_tooltip: 'લેખકની માહિતી નથી',
                    actions: {
                        menu_aria: 'વાતચીત વિકલ્પો',
                        open: 'ખોલો',
                        delete: 'કાઢી નાખો',
                    },
                    delete_dialog: {
                        title: 'વાતચીત કાઢી નાખીએ?',
                        description:
                            'આ વાતચીત અને તેના બધા સંદેશાઓ કાયમી રીતે કાઢી નાખશે.',
                        cancel: 'રદ કરો',
                        confirm: 'કાઢી નાખો',
                        deleting: 'કાઢી નાખી રહ્યાં છીએ…',
                        errors: {
                            delete_failed:
                                'આ વાતચીત કાઢી શકાઈ નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
                            forbidden: 'તમને આ વાતચીત કાઢવાની પરવાનગી નથી.',
                            not_found: 'આ વાતચીત હવે ઉપલબ્ધ નથી.',
                        },
                    },
                },
                detail: {
                    back: 'પાછા',
                    back_aria: 'વાતચીતની સૂચિ પર પાછા જાઓ',
                    loading: 'સંદેશાઓ લોડ થઈ રહ્યા છે…',
                    loading_more: 'જૂના સંદેશાઓ લોડ થઈ રહ્યા છે…',
                    load_older: 'જૂના સંદેશાઓ લોડ કરો',
                    new_messages_badge_one: '1 નવો સંદેશ',
                    new_messages_badge_other: '{{count}} નવા સંદેશાઓ',
                    new_messages_badge_label_one: 'નવો સંદેશ',
                    new_messages_badge_label_other: 'નવા સંદેશાઓ',
                    new_messages_badge_aria_one: 'નવા સંદેશ પર જાઓ',
                    new_messages_badge_aria_other:
                        '{{count}} નવા સંદેશાઓ પર જાઓ',
                    empty: {
                        title: 'કોઈ સંદેશ નથી',
                        description: 'આ વાતચીતમાં કોઈ સંદેશ નથી.',
                    },
                    errors: {
                        load_title: 'સંદેશાઓ લોડ કરી શકાયા નહીં',
                        load_description:
                            'સંદેશાઓ લોડ કરતી વખતે સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.',
                    },
                    archive_banner: {
                        title: 'આર્કાઇવ કરેલી વાતચીત',
                        description:
                            'આ વાતચીત ફક્ત વાંચવા માટે છે. સંદેશાઓ ઉમેરી, સંપાદિત અથવા કાઢી શકાતા નથી.',
                    },
                    metadata: {
                        status_label: 'સ્થિતિ',
                        status_active: 'સક્રિય',
                        status_archived: 'આર્કાઇવ કરેલી',
                        message_count_label: 'સંદેશોની સંખ્યા',
                        message_count: '{{count}} સંદેશાઓ',
                    },
                    message: {
                        edited: '(સંપાદિત)',
                        edited_aria: 'સંદેશ સંપાદિત કરવામાં આવ્યો',
                        day_separator: {
                            today: 'આજે',
                            yesterday: 'ગઈકાલે',
                        },
                        actions: {
                            title: 'સંદેશ ક્રિયાઓ',
                            edit: 'સંપાદિત કરો',
                            delete: 'કાઢી નાખો',
                        },
                        reactions: {
                            add_aria: 'પ્રતિક્રિયા ઉમેરો',
                            add_tooltip: 'પ્રતિક્રિયા ઉમેરો',
                            picker_loading: 'ઇમોજી પિકર લોડ થઈ રહ્યું છે…',
                            picker_aria_label: 'ઇમોજી પિકર',
                            picker_search_placeholder: 'ઇમોજી શોધો…',
                            picker_empty: 'કોઈ ઇમોજી મળ્યું નથી.',
                            chip_aria: '{{emoji}} પ્રતિક્રિયા, {{count}}',
                            preview_and_others_one: 'અને વધુ {{count}}',
                            preview_and_others_other: 'અને વધુ {{count}}',
                            errors: {
                                generic:
                                    'પ્રતિક્રિયા અપડેટ કરી શકાઈ નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
                                forbidden:
                                    'તમને આ સંદેશ પર પ્રતિક્રિયા આપવાની પરવાનગી નથી.',
                                archived:
                                    'આ વાતચીત આર્કાઇવ થયેલી છે અને પ્રતિક્રિયાઓ માત્ર વાંચવા યોગ્ય છે.',
                                not_found: 'આ સંદેશ હવે ઉપલબ્ધ નથી.',
                                invalid_emoji: 'આ ઇમોજી માન્ય નથી.',
                            },
                        },
                    },
                    composer: {
                        label: 'સંદેશ',
                        placeholder: 'સંદેશ લખો…',
                        submit: 'મોકલો',
                        submitting: 'મોકલી રહ્યા છીએ…',
                        form_aria_label: 'નવો વાર્તાલાપ સંદેશ',
                        keyboard_hint:
                            'મોકલવા માટે Enter દબાવો. નવી લાઇન માટે Shift+Enter.',
                        counter_aria_label: '{{count}} / {{max}} અક્ષરો વપરાયા',
                        errors: {
                            empty: 'મોકલવા માટે સંદેશ દાખલ કરો.',
                            too_long: 'સંદેશ 2000 અક્ષરથી વધુ ન હોઈ શકે.',
                            create_failed:
                                'સંદેશ મોકલી શકાયો નહીં. કૃપા કરીને ફરી પ્રયાસ કરો.',
                        },
                    },
                    edit: {
                        label: 'સંદેશ',
                        form_aria_label: 'વાર્તાલાપ સંદેશ સંપાદિત કરો',
                        save: 'સાચવો',
                        saving: 'સાચવી રહ્યા છીએ…',
                        cancel: 'રદ કરો',
                        counter_aria_label: '{{count}} / {{max}} અક્ષરો વપરાયા',
                        errors: {
                            empty: 'સાચવવા માટે સંદેશ દાખલ કરો.',
                            too_long: 'સંદેશ 2000 અક્ષરથી વધુ ન હોઈ શકે.',
                            update_failed:
                                'સંદેશ અપડેટ થઈ શક્યો નહીં. કૃપા કરીને ફરી પ્રયાસ કરો.',
                        },
                    },
                    delete_dialog: {
                        title: 'સંદેશ કાઢી નાખો',
                        description:
                            'શું તમે ખરેખર આ સંદેશ કાઢી નાખવા માંગો છો? આ ક્રિયા પૂર્વવત્ થઈ શકશે નહીં.',
                        cancel: 'રદ કરો',
                        confirm: 'કાઢી નાખો',
                        deleting: 'કાઢી નાખી રહ્યા છીએ…',
                        errors: {
                            delete_failed:
                                'આ સંદેશ કાઢી શકાયો નહીં. કૃપા કરીને ફરી પ્રયાસ કરો.',
                        },
                    },
                    mutation_errors: {
                        forbidden: 'તમને આ સંદેશ બદલવાની પરવાનગી નથી.',
                        archived:
                            'આ વાર્તાલાપ સંગ્રહિત છે અને ફક્ત વાંચવા યોગ્ય છે.',
                        not_found: 'આ વાર્તાલાપ અથવા સંદેશ હવે ઉપલબ્ધ નથી.',
                    },
                },

                targets: {
                    diagram: 'આકૃતિ',
                    table: 'કોષ્ટક',
                    field: 'ફીલ્ડ',
                    relationship: 'સંબંધ',
                    unknown: 'વાતચીત',
                },
                target_labels: {
                    diagram: 'આકૃતિ',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'કાઢી નાખેલું કોષ્ટક',
                    missing_field: 'કાઢી નાખેલું ફીલ્ડ',
                    missing_relationship: 'કાઢી નાખેલો સંબંધ',
                    unknown: 'વાતચીત',
                },
            },
            activities_section: {
                title: 'પ્રવૃત્તિ',
                filter: 'ફિલ્ટર',
                clear: 'ફિલ્ટર સાફ કરો',
                no_results: 'તમારા ફિલ્ટર સાથે મેળ ખાતી કોઈ પ્રવૃત્તિ મળી નથી.',
                loading: 'પ્રવૃત્તિ લોડ થઈ રહી છે…',
                retry: 'ફરી પ્રયાસ કરો',
                type_filter: {
                    trigger: 'પ્રકાર',
                    label: 'પ્રકાર દ્વારા ફિલ્ટર કરો',
                    trigger_aria: 'પ્રવૃત્તિ પ્રકાર દ્વારા ફિલ્ટર કરો',
                },
                types: {
                    diagram: 'આકૃતિ',
                    table: 'કોષ્ટક',
                    field: 'ફીલ્ડ',
                    relationship: 'સંબંધ',
                    note: 'નોંધ',
                    area: 'વિસ્તાર',
                    dependency: 'આધાર',
                },
                you: 'તમે',
                unknown_user: 'કોઈક',
                empty_state: {
                    title: 'હજી સુધી કોઈ પ્રવૃત્તિ નથી',
                    description: 'તાજેતરના ફેરફારો જોવા માટે સંપાદન શરૂ કરો.',
                },
                errors: {
                    load_failed: 'પ્રવૃત્તિ લોડ કરી શકાઈ નથી.',
                },
                actions: {
                    add_tables: '{{user}} એ ટેબલ {{table}} ઉમેર્યું',
                    remove_tables: '{{user}} એ એક ટેબલ દૂર કર્યું',
                    add_field: '{{user}} એ ફીલ્ડ {{field}} ઉમેર્યું',
                    remove_field: '{{user}} એ એક ફીલ્ડ દૂર કર્યું',
                    update_field: '{{user}} એ ફીલ્ડ {{field}} અપડેટ કર્યું',
                    add_relationships: '{{user}} એ સંબંધ ઉમેર્યો',
                    remove_relationships: '{{user}} એ સંબંધ દૂર કર્યો',
                    update_relationship: '{{user}} એ સંબંધ અપડેટ કર્યો',
                    add_notes: '{{user}} એ નોંધ ઉમેરી',
                    remove_notes: '{{user}} એ નોંધ દૂર કરી',
                    add_areas: '{{user}} એ વિસ્તાર ઉમેર્યો',
                    remove_areas: '{{user}} એ વિસ્તાર દૂર કર્યો',
                    add_dependencies: '{{user}} એ આધાર ઉમેર્યો',
                    remove_dependencies: '{{user}} એ આધાર દૂર કર્યો',
                    fallback: '{{user}} એ ડાયાગ્રામ અપડેટ કર્યું',
                },
            },
            share_section: {
                title: 'શેર કરો',
                tabs_label: 'શેર વિકલ્પો',
                tabs: {
                    collaborators: 'સહયોગીઓ',
                    public_link: 'જાહેર લિંક',
                },
                collaborators: {
                    description:
                        'સંપાદક અથવા દર્શક ઍક્સેસ સાથે સહયોગીઓને આમંત્રિત કરો. તેમની પાસે પહેલેથી FoxalDB એકાઉન્ટ હોવું જોઈએ.',
                    filter: 'ફિલ્ટર',
                    clear: 'ફિલ્ટર સાફ કરો',
                    no_results_title: 'કોઈ પરિણામ નથી',
                    no_results_description:
                        'તમારા ફિલ્ટર સાથે મેળ ખાતા કોઈ સહયોગી નથી.',
                    role_filter: {
                        trigger: 'ભૂમિકા',
                        label: 'ભૂમિકા દ્વારા ફિલ્ટર',
                        trigger_aria: 'સહયોગીની ભૂમિકા દ્વારા ફિલ્ટર',
                    },
                },
                public_link: {
                    title: 'જાહેર લિંક',
                    description:
                        'લિંક ધરાવતા કોઈપણ સાથે તમારા ડાયાગ્રામનો ફક્ત-વાંચવા યોગ્ય સ્નેપશોટ શેર કરો.',
                    coming_soon: 'ટૂંક સમયમાં.',
                },
                loading: 'સહયોગીઓ લોડ થઈ રહ્યા છે…',
                retry: 'ફરી પ્રયાસ કરો',
                errors: {
                    load_failed: 'સહયોગીઓ લોડ કરી શકાયા નહીં.',
                },
                member_actions: {
                    title: 'સહયોગી ક્રિયાઓ',
                    trigger_aria: 'સહયોગી ક્રિયાઓ',
                    role: 'ભૂમિકા',
                    remove: 'સહયોગી દૂર કરો',
                },
            },
        },

        toolbar: {
            zoom_in: 'ઝૂમ ઇન',
            zoom_out: 'ઝૂમ આઉટ',
            save: 'સાચવો',
            show_all: 'બધું બતાવો',
            undo: 'અનડુ',
            redo: 'રીડુ',
            reorder_diagram: 'ડાયાગ્રામ ઑટોમેટિક ગોઠવો',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'ઓવરલેપ કરતો ટેબલ હાઇલાઇટ કરો',
            filter: 'ટેબલ ફિલ્ટર કરો',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'તમારી ડેટાબેઝ પસંદ કરો',
                description:
                    'તમારા નવા ડાયાગ્રામ માટે ડેટાબેઝ સિસ્ટમ પસંદ કરો.',
                search_placeholder: 'ડેટાબેઝ મેનેજમેન્ટ સિસ્ટમ શોધો…',
                search_no_results:
                    'તમારી શોધ સાથે કોઈ ડેટાબેઝ મેનેજમેન્ટ સિસ્ટમ મેળ ખાતી નથી.',
                clear_search: 'શોધ સાફ કરો',
                primary_group: 'પ્રાથમિક ડેટાબેઝ',
                other_group: 'અન્ય ડેટાબેઝ',
            },

            choose_intent: {
                title: 'તમે શું કરવા માંગો છો?',
                description: '{{database}} માટે નવું ડાયાગ્રામ બનાવો.',
                create_empty: 'ખાલી ડાયાગ્રામ બનાવો',
                create_empty_description: 'પોતે ટેબલ ઉમેરીને શૂન્યથી શરૂ કરો.',
                import: 'આયાત કરો',
                import_description:
                    'ફાઇલ, પેસ્ટ કરેલ ટેક્સ્ટ અથવા તમારા ડેટાબેઝથી.',
                back: 'પાછા',
            },

            choose_import_method: {
                title: 'તમે કેવી રીતે આયાત કરવા માંગો છો?',
                description:
                    'તમારા {{database}} ડાયાગ્રામ માટે સ્રોત પસંદ કરો.',
                from_file: 'ફાઇલ અથવા પેસ્ટ કરેલ ટેક્સ્ટ',
                from_file_description:
                    'SQL, DBML, JSON, પ્રોજેક્ટ આર્કાઇવ (.zip).',
                from_database: 'હાલની ડેટાબેઝ',
                from_database_description:
                    'તમારી ડેટાબેઝમાં ક્વેરી ચલાવો અને પરિણામ પેસ્ટ કરો.',
                back: 'પાછા',
            },

            import_from_database: {
                title: 'હાલની ડેટાબેઝમાંથી આયાત કરો',
                description:
                    'જ્યારે તમારી પાસે SQL અથવા DBML સ્કીમા ફાઇલ ન હોય ત્યારે આનો ઉપયોગ કરો. તમારી ડેટાબેઝમાં ક્વેરી ચલાવો, પછી નીચે પરિણામ પેસ્ટ કરો.',
                database_edition: 'ડેટાબેઝ આવૃત્તિ',
                edition_regular: 'નિયમિત',
                run_query: 'તમારી ડેટાબેઝમાં આ ક્વેરી ચલાવો',
                client_sql: 'SQL',
                paste_result: 'પરિણામ પેસ્ટ કરો',
                paste_result_placeholder: 'ક્વેરીનું પરિણામ અહીં પેસ્ટ કરો…',
                check_result: 'પરિણામ તપાસો',
                valid_result: 'પરિણામ માન્ય લાગે છે.',
                invalid_result:
                    'પરિણામ માન્ય કરી શકાયું નથી. સામગ્રી તપાસો અને ફરી પ્રયાસ કરો.',
                truncated_result:
                    'પરિણામ કટાયેલું હોઈ શકે છે. SQL ક્લાયંટ સેટિંગ્સ સમાયોજિત કરી ક્વેરી ફરી ચલાવો.',
                waiting_for_result: 'ચાલુ રાખવા ક્વેરીનું પરિણામ પેસ્ટ કરો.',
                unsupported_database:
                    'આ ડેટાબેઝ પ્રકાર માટે સ્કીમા એક્સટ્રેક્શન ઉપલબ્ધ નથી.',
                import_failed:
                    'ડેટાબેઝ સ્કીમા આયાત કરી શકાઈ નથી. પરિણામ તપાસો અને ફરી પ્રયાસ કરો.',
                back: 'પાછા',
                import: 'આયાત કરો',
            },

            import_schema: {
                title: 'તમારું સ્કીમા પેસ્ટ કરો',
                textarea_label: 'સ્કીમા સામગ્રી',
                textarea_placeholder:
                    'અહીં SQL, DBML અથવા JSON મેટાડેટા પેસ્ટ કરો…',
                auto_detect_hint: 'અમે ફોર્મેટ આપમેળે શોધીશું.',
                or_divider: 'અથવા',
                choose_file: 'ફાઇલ પસંદ કરો',
                choose_file_or_project: 'ફાઇલ અથવા પ્રોજેક્ટ પસંદ કરો',
                supported_formats_hint:
                    'સમર્થિત: SQL, DBML, JSON, પ્રોજેક્ટ આર્કાઇવ (.zip)',
                privacy_info: {
                    link_label: 'વધુ માહિતી…',
                    title: 'ગોપનીયતા અને સમર્થિત ફોર્મેટ',
                    intro: 'ફાઇલ પસંદ કરતા પહેલાં, આયાત દરમિયાન FoxalDB તમારા ડેટાને કેવી રીતે હેન્ડલ કરે છે તે જાણો.',
                    highlights: {
                        no_execution:
                            'આયાત માત્ર સ્થિર વિશ્લેષણનો ઉપયોગ કરે છે — તમારો કોડ ક્યારેય ચલાવવામાં આવતો નથી.',
                        no_full_upload:
                            'સંપૂર્ણ પ્રોજેક્ટ આર્કાઇવ ક્યારેય સર્વર પર અપલોડ થતા નથી.',
                        filtered_files:
                            'માત્ર સ્કીમા-સંબંધિત ફાઇલો રાખવામાં આવે છે; .env, vendor/, node_modules/ અને tests/ બાકાત રાખવામાં આવે છે.',
                    },
                    simple_formats_title: 'SQL, DBML અને JSON',
                    simple_formats_description:
                        'સંપૂર્ણપણે તમારા બ્રાઉઝરમાં પ્રોસેસ થાય છે. મહત્તમ ફાઇલ સાઇઝ: {{sizeMb}} MB.',
                    project_archives_title: 'પ્રોજેક્ટ આર્કાઇવ (.zip)',
                    project_archives_description:
                        'આર્કાઇવ સ્થાનિક રીતે ખોલવામાં આવે છે અને માત્ર સ્કીમા-સંબંધિત ફાઇલો કાઢવામાં આવે છે. મહત્તમ આર્કાઇવ સાઇઝ: {{sizeMb}} MB.',
                    excluded_paths:
                        'ક્યારેય સામેલ નથી: .env, vendor/, node_modules/, tests/ અને અન્ય ગેર-સ્કીમા સોર્સ ફાઇલો.',
                    table: {
                        framework: 'ફ્રેમવર્ક',
                        files: 'વિશ્લેષિત ફાઇલો',
                        processing: 'પ્રોસેસિંગ',
                        processing_local: 'માત્ર બ્રાઉઝર',
                        processing_remote: 'સર્વર (સાઇન-ઇન જરૂરી)',
                    },
                    frameworks: {
                        laravel: { files: 'database/migrations/*.php' },
                        prisma: { files: 'prisma/schema.prisma' },
                        rails: { files: 'db/schema.rb' },
                        drizzle: { files: 'drizzle/**/*.sql' },
                        entity_framework_core: { files: '*ModelSnapshot.cs' },
                        django: { files: '*/migrations/*.py' },
                    },
                    back: 'પાછા',
                },
                change_file_aria: 'ફાઇલ બદલો, હાલમાં: {{name}}',
                selected_file: 'પસંદ કરેલી ફાઇલ: {{name}}',
                back: 'પાછા',
                import: 'આયાત કરો',
                mismatch: {
                    title: 'આ સ્કીમા {{detected}} જેવું લાગે છે, પરંતુ તમે {{selected}} પસંદ કર્યું છે.',
                    description:
                        'શોધાયેલ ડેટાબેસ પ્રકાર પર સ્વિચ કરો અથવા બીજું પસંદ કરવા પાછા જાઓ.',
                    switch: '{{database}} પર સ્વિચ કરો',
                    go_back: 'પાછા',
                },
                ambiguous: {
                    title: 'સ્ત્રોત DBMS પસંદ કરો',
                    multiple_dbms_title: 'બહુવિધ DBMS શોધાયા',
                    selection_help_percentages:
                        'ટકાવારી દરેક DBMS માટે SQL બોલી મેળ ઇન્ડેક્સ દર્શાવે છે.',
                    selection_help_recommended:
                        'તારો ભલામણ કરેલ DBMS દર્શાવે છે.',
                    selection_help_aria: 'ટકાવારી અને ભલામણ વિશે મદદ',
                    confidence_explanation:
                        'ટકાવારી દરેક DBMS માટે શોધાયેલ SQL બોલી સાથે સંગતિ સૂચક દર્શાવે છે.',
                    description:
                        'SQL બોલી આપમેળે ઓળખાઈ શકી નહીં. આ સ્કીમા કયા DBMS માંથી આવ્યું છે તે પુષ્ટિ કરો.',
                    choose_source: 'સ્ત્રોત DBMS પસંદ કરો',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% વિશ્વાસ, આપમેળે શોધ)',
                    recommended_tooltip: 'ભલામણ કરેલ DBMS',
                    recommended_aria: '{{database}}, ભલામણ કરેલ DBMS',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Ready to import this diagram.',
                        mismatch_title: 'DBMS અસંગતિ',
                        mismatch_description:
                            'ફાઇલ {{detected}} દર્શાવે છે, પરંતુ તમે {{selected}} પસંદ કર્યું હતું.',
                        unsupported_existing:
                            'Diagram JSON restores a full diagram and cannot be merged into the current one. Export or create a new diagram instead.',
                    },
                    ambiguous: {
                        title: 'Choose the diagram DBMS',
                        description: 'આ આયાત માટે લાગુ કરવાનો વિકલ્પ પસંદ કરો.',
                        selection_help_percentages:
                            'ટકાવારી દરેક DBMS માટે મેળ ઇન્ડેક્સ દર્શાવે છે.',
                        selection_help_recommended:
                            'તારો ફાઇલમાં દર્શાવેલ DBMS દર્શાવે છે.',
                        selection_help_aria: 'ટકાવારી અને ભલામણ વિશે મદદ',
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
                    dialect: '{{database}} શોધાયું',
                    dbml: 'DBML શોધાયું',
                    metadata_json: 'મેટાડેટા JSON શોધાયું',
                    diagram_json: 'ડાયાગ્રામ JSON શોધાયું',
                    sql_ambiguous_title: 'SQL શોધાયું',
                    sql_ambiguous_description: 'ડેટાબેઝ ઓળખી શકાયું નહીં.',
                    clickhouse_unsupported: 'ClickHouse SQL શોધાયું',
                    unsupported: 'અસમર્થિત ફોર્મેટ',
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
                        'પ્રોજેક્ટ આર્કાઇવનું વિશ્લેષણ થઈ રહ્યું છે…',
                    detected: '{{framework}} પ્રોજેક્ટ શોધાયો',
                    migrations_found_one: '{{count}} માઇગ્રેશન મળ્યું',
                    migrations_found_other: '{{count}} માઇગ્રેશન મળ્યા',
                    schema_files_found_one: '{{count}} સ્કીમા ફાઇલ મળી',
                    schema_files_found_other: '{{count}} સ્કીમા ફાઇલો મળી',
                    model_snapshots_found_one:
                        '{{count}} મોડેલ સ્નેપશોટ મળ્યું',
                    model_snapshots_found_other:
                        '{{count}} મોડેલ સ્નેપશોટ મળ્યા',
                    sql_migrations_found_one: '{{count}} SQL માઇગ્રેશન મળ્યું',
                    sql_migrations_found_other: '{{count}} SQL માઇગ્રેશન મળ્યા',
                    migrations_button_one: '{{count}} માઇગ્રેશન',
                    migrations_button_other: '{{count}} માઇગ્રેશન',
                    schema_files_button_one: '{{count}} સ્કીમા ફાઇલ મળી',
                    schema_files_button_other: '{{count}} સ્કીમા ફાઇલો મળી',
                    model_snapshots_button_one: '{{count}} મોડેલ સ્નેપશોટ',
                    model_snapshots_button_other: '{{count}} મોડેલ સ્નેપશોટ',
                    sql_migrations_button_one: '{{count}} માઇગ્રેશન',
                    sql_migrations_button_other: '{{count}} માઇગ્રેશન',
                    multiple_projects_title: 'બહુવિધ ડેટાબેસ સ્કીમા શોધાયા',
                    multiple_projects_description:
                        'આ આર્કાઇવમાં એકથી વધુ સમર્થિત ડેટાબેસ પ્રોજેક્ટ છે. કયું આયાત કરવું તે પસંદ કરો.',
                    multiple_database_groups_title:
                        'બહુવિધ ડેટાબેઝ સ્કીમા મળ્યા',
                    multiple_database_groups_description:
                        'આ પ્રોજેક્ટમાં બહુવિધ ડેટાબેઝ સ્કીમા છે. આયાત કરવા માટે એક પસંદ કરો.',
                    choose_database_group: 'ડેટાબેઝ સ્કીમા પસંદ કરો',
                    group_recommended_aria: '{{label}} ભલામણ કરેલ',
                    group_recommended_tooltip: 'ભલામણ કરેલ સ્કીમા',
                    choose_project: 'પ્રોજેક્ટ પસંદ કરો',
                    unsupported_project: 'અસમર્થિત પ્રોજેક્ટ આર્કાઇવ',
                    unsupported_project_description:
                        'આ આર્કાઇવમાં Laravel, Prisma, Drizzle, Rails, Entity Framework Core અથવા Django ડેટાબેસ પ્રોજેક્ટ મળ્યો નથી.',
                    project_root: 'પ્રોજેક્ટ રૂટ: {{path}}',
                    sign_in_to_import_framework:
                        'આયાત ઉપલબ્ધ થાય ત્યારે {{framework}} પ્રોજેક્ટ આયાત કરવા સાઇન ઇન કરો.',
                    remote_processing_notice:
                        'આયાત ઉપલબ્ધ થાય ત્યારે ફક્ત સ્કીમા-સંબંધિત ફાઇલો પ્રક્રિયા થશે.',
                    remote_processing_scope:
                        'સંપૂર્ણ આર્કાઇવ અથવા અસંબંધિત સોર્સ ફાઇલો ક્યારેય અપલોડ થતી નથી.',
                    remote_processing_security:
                        'વિશ્લેષણ સ્થિર છે અને અપલોડ કરેલો કોડ ચલાવતું નથી.',
                },
                errors: {
                    unreadable_file: 'પસંદ કરેલી ફાઇલ વાંચી શકાઈ નહીં.',
                    malformed_json: 'JSON સામગ્રી પાર્સ કરી શકાઈ નહીં.',
                    unsupported: 'સ્કીમા આયાત માટે આ ફોર્મેટ સમર્થિત નથી.',
                    diagram_json:
                        'ડાયાગ્રામ JSON ને ડાયાગ્રામ ફાઇલ વિકલ્પથી આયાત કરી શકાય છે.',
                    clickhouse_unsupported:
                        'ClickHouse માટે SQL DDL આયાત સમર્થિત નથી. DBML વાપરો અથવા હાલની ડેટાબેસમાંથી આયાત કરો.',
                    file_too_large: 'પસંદ કરેલી ફાઇલ 5 MB કરતાં મોટી છે.',
                    archive_too_large:
                        'પસંદ કરેલ પ્રોજેક્ટ આર્કાઇવ 50 MB કરતાં મોટું છે.',
                    archive_invalid:
                        'પસંદ કરેલી ફાઇલ માન્ય પ્રોજેક્ટ આર્કાઇવ નથી.',
                    unsupported_file_extension:
                        'ફક્ત .sql, .dbml, .json અને .zip પ્રોજેક્ટ આર્કાઇવ સમર્થિત છે.',
                    import_failed:
                        'સ્કીમા આયાત થઈ શક્યું નહીં. સામગ્રી તપાસીને ફરી પ્રયાસ કરો.',
                    invalid_diagram_json:
                        'ડાયાગ્રામ JSON અમાન્ય છે. ફાઇલ તપાસીને ફરી પ્રયાસ કરો.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS સૂચનાઓ',
                    title: 'સૂચનાઓ',
                    step_1: 'ટૂલ્સ > વિકલ્પો > ક્વેરી પરિણામો > SQL સર્વર પર જાઓ.',
                    step_2: 'જો તમે "ગ્રિડમાં પરિણામો" નો ઉપયોગ કરી રહ્યા છો, તો નોન-XML ડેટા માટે મહત્તમ અક્ષરો મેળવવું (9999999 પર સેટ કરો).',
                },
            },

            cancel: 'રદ કરો',
            back: 'પાછા',
            import_from_file: 'ફાઇલમાંથી આયાત કરો',
            empty_diagram: 'ખાલી ડેટાબેસ',
            continue: 'ચાલુ રાખો',
            import: 'આયાત કરો',
        },

        share_diagram_dialog: {
            title: 'ડાયાગ્રામ શેર કરો',
            description:
                'સંપાદક અથવા દર્શક ઍક્સેસ સાથે સહયોગીઓને આમંત્રિત કરો. તેમની પાસે પહેલેથી FoxalDB એકાઉન્ટ હોવું જોઈએ.',
            share_button: 'શેર કરો',
            empty_members: 'હજી સુધી કોઈ સહયોગી નથી.',
            remove: 'દૂર કરો',
            roles: {
                owner: 'માલિક',
                editor: 'સંપાદક',
                viewer: 'દર્શક',
            },
            add_member: {
                title: 'સહયોગી ઉમેરો',
                email_label: 'ઈમેલ',
                email_placeholder: 'ઈમેલ સરનામું',
                add: 'ઉમેરો',
                adding: 'ઉમેરાઈ રહ્યું છે…',
                cancel: 'રદ કરો',
            },
            errors: {
                load_failed: 'સહયોગીઓ લોડ કરી શકાયા નહીં.',
                add_failed: 'સહયોગી ઉમેરી શકાયો નહીં.',
            },
        },

        diagram_role: {
            owner: 'માલિક',
            editor: 'સંપાદક',
            viewer: 'દર્શક',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'ડેટાબેસ ખોલો',
            description: 'તમારા નવા ડાયાગ્રામ માટે ડેટાબેઝ સિસ્ટમ પસંદ કરો.',
            table_columns: {
                name: 'નામ',
                created_at: 'બનાવાની તારીખ',
                last_modified: 'છેલ્લું સુધારેલું',
                tables_count: 'ટેબલ્સ',
            },
            cancel: 'રદ કરો',
            open: 'ખોલો',
            new_database: 'નવું ડેટાબેસ',

            diagram_actions: {
                open: 'ખોલો',
                duplicate: 'ડુપ્લિકેટ',
                delete: 'કાઢી નાખો',
            },
        },

        export_wizard: {
            title: 'નિકાસ',
            description:
                'તમારું ડાયાગ્રામ નિકાસ કરવા માટે એક ફોર્મેટ પસંદ કરો.',
            back: 'પાછા',
            sql: {
                target_step: {
                    title: 'SQL એક્સપોર્ટ',
                    description:
                        'તમારા {{database}} ડાયાગ્રામ માટે ટાર્ગેટ ડેટાબેસ પસંદ કરો.',
                    source_label: 'સોર્સ ડેટાબેસ: {{database}}',
                    same_dialect_description:
                        '{{database}} DDL તરીકે એક્સપોર્ટ',
                    cross_dialect_description:
                        '{{source}} થી {{target}} માં રૂપાંતર',
                },
                unsupported_source: {
                    title: '{{database}} માટે SQL એક્સપોર્ટ ઉપલબ્ધ નથી',
                    description:
                        'FoxalDB માં આ ડેટાબેસ પ્રકાર માટે નિશ્ચિત SQL એક્સપોર્ટ સપોર્ટેડ નથી.',
                },
                preview_step: {
                    title: 'SQL પ્રિવ્યૂ',
                    description: 'જનરેટ થયેલ {{database}} સ્ક્રિપ્ટ તપાસો.',
                    target_label: 'ટાર્ગેટ: {{database}}',
                    generating: '{{database}} SQL જનરેટ થઈ રહ્યું છે...',
                    download: 'SQL ડાઉનલોડ',
                    error: 'SQL જનરેટ કરી શકાયું નહીં. ફરી પ્રયાસ કરો.',
                    empty: 'વર્તમાન ડાયાગ્રામ માટે કોઈ SQL જનરેટ થયું નથી.',
                },
            },
            sections: {
                database: 'ડેટાબેસ',
                framework: 'ફ્રેમવર્ક',
                portable: 'પોર્ટેબલ / સ્કીમા',
                visual: 'વિઝ્યુઅલ',
            },
            targets: {
                sql: {
                    title: 'SQL',
                    description: 'વર્તમાન ડાયાગ્રામ માટે ડેટાબેસ DDL સ્ક્રિપ્ટ',
                    description_generic: 'ડેટાબેસ DDL સ્ક્રિપ્ટ',
                },
                dbml: {
                    title: 'DBML',
                    description: 'પોર્ટેબલ DBML સ્કીમા ફાઇલ',
                    coming_soon:
                        'ફાઇલ નિકાસ ટૂંક સમયમાં. સાઇડ પેનલમાં DBML જુઓ અને કૉપી કરો.',
                },
                framework: {
                    coming_soon: 'ભવિષ્યના નિકાસ માઇલસ્ટોન માટે યોજના બનાવેલી.',
                },
                diagram_json: {
                    title: 'ડાયાગ્રામ JSON',
                    description: 'પોર્ટેબલ FoxalDB ડાયાગ્રામ ફાઇલ',
                },
                laravel: {
                    title: 'Laravel માઇગ્રેશન',
                    description: 'Laravel માઇગ્રેશન ZIP આર્કાઇવ',
                },
                prisma: {
                    title: 'Prisma',
                    description: 'Prisma સ્કીમા નિકાસ',
                },
                ef_core: {
                    title: 'EF Core',
                    description: 'Entity Framework Core નિકાસ',
                },
                rails: {
                    title: 'Rails',
                    description: 'Ruby on Rails સ્કીમા નિકાસ',
                },
                django: {
                    title: 'Django',
                    description: 'Django માઇગ્રેશન નિકાસ',
                },
                drizzle: {
                    title: 'Drizzle',
                    description: 'Drizzle સ્કીમા નિકાસ',
                },
                png: {
                    title: 'PNG',
                    description: 'રાસ્ટર છબી',
                },
                jpg: {
                    title: 'JPG',
                    description: 'રાસ્ટર છબી',
                },
                svg: {
                    title: 'SVG',
                    description: 'ડાયાગ્રામનો SVG સ્નેપશોટ',
                },
            },
            dbml: {
                preview_step: {
                    description: 'જનરેટ થયેલ DBML સ્કીમા તપાસો.',
                    generating: 'DBML જનરેટ થઈ રહ્યું છે...',
                    download: 'DBML ડાઉનલોડ',
                    error: 'DBML જનરેટ કરી શકાયું નહીં. ફરી પ્રયાસ કરો.',
                    empty: 'વર્તમાન ડાયાગ્રામ માટે કોઈ DBML જનરેટ થયું નથી.',
                },
            },
            json: {
                download_step: {
                    description: 'આ ડાયાગ્રામની પોર્ટેબલ નકલ નિકાસ કરો.',
                    explanation:
                        'સંપૂર્ણ ડાયાગ્રામ નિકાસ થાય છે. આ ફાઇલ આયાત કરવાથી નવું ડાયાગ્રામ બને છે; વર્તમાન ડાયાગ્રામ ઓવરરાઇટ થતું નથી.',
                    filename_label: 'ફાઇલનું નામ: {{filename}}',
                    download: 'JSON ડાઉનલોડ',
                },
            },
            visual: {
                options_step: {
                    description:
                        'આ {{format}} છબી કેવી રીતે નિકાસ કરવી તે પસંદ કરો.',
                    explanation:
                        'હાલમાં રેન્ડર થયેલ ડાયાગ્રામની છબી નિકાસ કરો.',
                    filename_label: 'ફાઇલનું નામ: {{filename}}',
                    extent_label: 'નિકાસ વિસ્તાર',
                    extent_diagram: 'સંપૂર્ણ ડાયાગ્રામ',
                    extent_diagram_description:
                        'વર્તમાન વ્યૂની બહારના ટેબલ સહિત હાલમાં રેન્ડર થયેલ આખો ડાયાગ્રામ સમાવો.',
                    extent_viewport: 'વર્તમાન વ્યૂ',
                    extent_viewport_description:
                        'કેનવાસ પર હાલમાં દેખાતું હોય તે જ નિકાસ કરો.',
                    scale_label: 'સ્કેલ',
                    scale_1x: '1x',
                    scale_2x: '2x',
                    scale_4x: '4x',
                    pattern: 'પૃષ્ઠભૂમિ પેટર્ન સમાવો',
                    pattern_description:
                        'પૃષ્ઠભૂમિમાં હળવી ગ્રિડ પેટર્ન ઉમેરો.',
                    transparent: 'પારદર્શક પૃષ્ઠભૂમિ',
                    transparent_description:
                        'ઘન પૃષ્ઠભૂમિ રંગ વગર PNG નિકાસ કરો.',
                    svg_limitation:
                        'આ SVG બ્રાઉઝર માટે ડાયાગ્રામનો સ્નેપશોટ છે, સંપૂર્ણ રીતે સંપાદનયોગ્ય વેક્ટર ફાઇલ નથી.',
                    export: 'નિકાસ',
                    generating: 'છબી બનાવી રહ્યા છીએ...',
                    error: 'છબી નિકાસ થઈ શકી નહીં. કૃપા કરીને ફરી પ્રયાસ કરો.',
                    error_canvas: 'નિકાસ કરવા માટે ડાયાગ્રામ કેનવાસ મળ્યો નથી.',
                    error_too_large:
                        'આ ડાયાગ્રામ {{scale}} પર નિકાસ કરવા માટે ખૂબ મોટો છે. સ્કેલ ઘટાડો અથવા વર્તમાન વ્યૂ નિકાસ કરો.',
                    error_empty: 'કેનવાસ પર નિકાસ કરવા માટે કંઈ નથી.',
                },
            },
            prisma: {
                unsupported_database:
                    'વર્તમાન ડેટાબેઝ પ્રકાર માટે Prisma નિકાસ ઉપલબ્ધ નથી.',
                version_step: {
                    title: 'Prisma સંસ્કરણ',
                    description:
                        'તમારી schema.prisma નિકાસ માટે Prisma મુખ્ય સંસ્કરણ પસંદ કરો.',
                    prisma_7: 'Prisma 7',
                    prisma_7_recommended: 'ભલામણ કરેલ',
                    prisma_6: 'Prisma 6',
                    continue: 'ચાલુ રાખો',
                },
                preview_step: {
                    description: 'બનાવેલ Prisma સ્કીમા સમીક્ષા કરો.',
                    generating: 'Prisma સ્કીમા બનાવી રહ્યા છીએ...',
                    download: 'schema.prisma ડાઉનલોડ કરો',
                    generation_error:
                        'Prisma સ્કીમા બનાવી શકાઈ નહીં. ફરી પ્રયાસ કરો.',
                    empty: 'વર્તમાન ડાયાગ્રામ માટે કોઈ Prisma સ્કીમા બનાવાઈ નહીં.',
                    limitations: 'મર્યાદાઓ',
                    errors: {
                        unsupported_database:
                            'આ ડેટાબેઝ પ્રકાર માટે Prisma નિકાસ સમર્થિત નથી.',
                        empty_diagram:
                            'ડાયાગ્રામમાં નિકાસ કરવા યોગ્ય કોઈ ટેબલ નથી.',
                        invalid_primary_key:
                            'એક ટેબલની પ્રાથમિક કી કોન્ફિગરેશન અમાન્ય છે.',
                        unsupported_structural_field:
                            'પ્રાથમિક અથવા વિદેશી કી unsupported ફીલ્ડ પ્રકાર વાપરે છે.',
                        invalid_enum: 'enum વ્યાખ્યા નિકાસ કરી શકાઈ નહીં.',
                    },
                    notes: {
                        view_skipped:
                            'ડેટાબેઝ વ્યૂ Prisma સ્કીમામાં નિકાસ થતા નથી.',
                        schema_namespace_unsupported:
                            'આ નિકાસમાં ટેબલ સ્કીમા/નેમસ્પેસ મેપ થતા નથી.',
                        unsupported_field_omitted:
                            'કેટલાક unsupported ફીલ્ડ છોડી દેવાયા.',
                        unsupported_default_omitted:
                            'કેટલાક unsupported ડિફોલ્ટ મૂલ્યો છોડી દેવાયા.',
                        unsupported_index_omitted:
                            'કેટલાક ઇન્ડેક્સ છોડી દેવાયા.',
                        relation_skipped: 'એક સંબંધ નિકાસ કરી શકાયો નહીં.',
                        relation_degraded:
                            'એક સંબંધ ઓછી ચોકસાઈ સાથે નિકાસ થયો.',
                        composite_fk_unsupported:
                            'સંયુક્ત વિદેશી કી સમર્થિત નથી.',
                        many_to_many_label_only:
                            'જોડાણ ટેબલ વિનાના અન્ય-થી-અન્ય સંબંધો ફક્ત લેબલ તરીકે નિકાસ થાય છે.',
                        set_null_omitted:
                            'અસમર્થિત સ્થાનોમાં ON DELETE SET NULL છોડી દેવાયું.',
                        enum_skipped: 'enum નિકાસ કરી શકાયો નહીં.',
                        composite_type_skipped:
                            'સંયુક્ત પ્રકાર નિકાસ કરી શકાયો નહીં.',
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
                    'વર્તમાન ડેટાબેઝ પ્રકાર માટે EF Core નિકાસ ઉપલબ્ધ નથી.',
                options_step: {
                    description: 'EF Core મોડલ પ્રોજેક્ટ નિકાસ ગોઠવો.',
                    explanation:
                        'EF Core 10 (.NET 10) મોડલ પ્રોજેક્ટ નિકાસ કરો. ડેટાબેઝ પ્રદાતા વર્તમાન આકૃતિમાંથી નક્કી થાય છે. માઇગ્રેશન બનતાં નથી; નિકાસ કરેલા પ્રોજેક્ટમાંથી તમે તેને સ્થાનિક રીતે બનાવી શકો છો.',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'પ્રદાતા: {{provider}}',
                    migrations_not_generated:
                        'આ નિકાસમાં માઇગ્રેશન શામેલ નથી. EF Core CLI વડે સ્થાનિક રીતે માઇગ્રેશન બનાવવા માટે બનાવેલ પ્રોજેક્ટ વાપરો.',
                    namespace: 'નેમસ્પેસ',
                    namespace_placeholder: 'Acme.Catalog',
                    namespace_help:
                        'બનાવેલ પ્રોજેક્ટનું મૂળ C# નેમસ્પેસ. સર્વર આકૃતિના નામમાંથી પસંદ કરે તે માટે ખાલી રાખો.',
                    db_context: 'DbContext',
                    db_context_placeholder: 'CatalogDbContext',
                    db_context_help:
                        'DbContext વર્ગનું નામ. AppDbContext વાપરવા માટે ખાલી રાખો.',
                    export: 'નિકાસ કરો',
                    generating: 'EF Core પ્રોજેક્ટ બની રહ્યો છે...',
                    error_rate_limited:
                        'ઘણી બધી નિકાસ વિનંતીઓ. કૃપા કરીને થોડી રાહ જોઈને ફરી પ્રયાસ કરો.',
                    error_unexpected:
                        'EF Core પ્રોજેક્ટ નિકાસ થઈ શક્યો નહીં. કૃપા કરીને ફરી પ્રયાસ કરો.',
                    error_semantic: 'EF Core પ્રોજેક્ટ બની શક્યો નહીં.',
                    error_unauthenticated:
                        'EF Core પ્રોજેક્ટ નિકાસ કરવા માટે તમારે સાઇન ઇન હોવું જરૂરી છે.',
                },
                result_step: {
                    description: 'બનાવેલ EF Core પ્રોજેક્ટની સમીક્ષા કરો.',
                    success: 'EF Core પ્રોજેક્ટ બની ગયો.',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'પ્રદાતા: {{provider}}',
                    generated_files: 'બનાવેલી ફાઇલો ({{count}})',
                    notes: 'નોંધો',
                    download_zip: 'ZIP ડાઉનલોડ કરો',
                    error_unsafe_path:
                        'નિકાસમાં અસુરક્ષિત ફાઇલ પાથ છે અને તે ડાઉનલોડ થયો નથી.',
                    error_empty_files: 'નિકાસમાં કોઈ ફાઇલ નહોતી.',
                },
            },
            laravel: {
                options_step: {
                    description:
                        'Laravel માઇગ્રેશન કેવી રીતે નિકાસ કરવી તે પસંદ કરો.',
                    explanation:
                        'વર્તમાન ડાયાગ્રામમાંથી Laravel માઇગ્રેશન ફાઇલોની ZIP બનાવો.',
                    filename_label: 'ફાઇલનું નામ: {{filename}}',
                    laravel_version: 'Laravel સંસ્કરણ',
                    include_indexes: 'ટેબલ ઇન્ડેક્સ શામેલ કરો',
                    include_indexes_description:
                        'સ્પષ્ટ ટેબલ ઇન્ડેક્સ વ્યાખ્યાઓ નિકાસ કરો. ફીલ્ડ-સ્તરની યુનિક અવરોધો હંમેશાં શામેલ રહે છે.',
                    include_foreign_keys: 'વિદેશી કીઓ શામેલ કરો',
                    include_foreign_keys_description:
                        'વિદેશી કીઓ માટે અલગ માઇગ્રેશન ફાઇલો નિકાસ કરો.',
                    export: 'નિકાસ કરો',
                    generating: 'Laravel માઇગ્રેશન બની રહ્યાં છે...',
                    error: 'Laravel માઇગ્રેશન નિકાસ થઈ શક્યાં નહીં. ફરી પ્રયાસ કરો.',
                    error_unauthenticated:
                        'Laravel માઇગ્રેશન નિકાસ કરવા સાઇન ઇન જરૂરી છે.',
                    error_forbidden: 'આ ડાયાગ્રામ નિકાસ કરવાની પરવાનગી નથી.',
                    error_not_found: 'આ ડાયાગ્રામ મળ્યો નથી.',
                    error_empty: 'આ ડાયાગ્રામમાં નિકાસયોગ્ય ટેબલ નથી.',
                    error_invalid:
                        'ડાયાગ્રામ નિકાસ થઈ શક્યો નહીં. સ્કીમા તપાસીને ફરી પ્રયાસ કરો.',
                    error_network:
                        'સર્વર સુધી પહોંચી શકાયું નહીં. કનેક્શન તપાસીને ફરી પ્રયાસ કરો.',
                },
            },
        },

        export_dialog: {
            title: 'નિકાસ',
            description: 'તમારું ડાયાગ્રામ નિકાસ કરવા માટે ફોર્મેટ પસંદ કરો.',
            schema_code_section: 'સ્કીમા / કોડ',
            visual_section: 'વિઝ્યુઅલ',
            sql: {
                title: 'SQL',
                description: 'વર્તમાન ડાયાગ્રામ માટે ડેટાબેસ DDL સ્ક્રિપ્ટ',
                description_generic: 'ડેટાબેસ DDL સ્ક્રિપ્ટ',
            },
            dbml: {
                title: 'DBML',
                coming_soon:
                    'ફાઇલ નિકાસ ટૂંક સમયમાં. સાઇડબારમાં DBML જુઓ અને કોપી કરો.',
            },
            diagram_json: {
                title: 'ડાયાગ્રામ JSON',
                description: 'પોર્ટેબલ FoxalDB ડાયાગ્રામ ફાઇલ',
            },
            laravel_migrations: {
                title: 'Laravel માઇગ્રેશન',
                description: 'Laravel માઇગ્રેશન ZIP આર્કાઇવ',
            },
            png: {
                title: 'PNG',
                description: 'રાસ્ટર છબી',
            },
            jpg: {
                title: 'JPG',
                description: 'રાસ્ટર છબી',
            },
            svg: {
                title: 'SVG',
                description: 'વેક્ટર છબી',
            },
        },

        export_sql_dialog: {
            title: 'SQL નિકાસ કરો',
            description:
                '{{databaseType}} સ્ક્રિપ્ટ માટે તમારું ડાયાગ્રામ સ્કીમા નિકાસ કરો',
            close: 'બંધ કરો',
            loading: {
                text: '{{databaseType}} માટે AI SQL બનાવી રહ્યું છે...',
                description: 'તેને 30 સેકંડ સુધીનો સમય લાગી શકે છે.',
            },
            error: {
                message:
                    'SQL સ્ક્રિપ્ટ જનરેટ કરવા દરમિયાન ભૂલ થઈ. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો અથવા <0>અમારો સંપર્ક કરો</0>.',
                description:
                    'તમારા OPENAI_TOKEN નો ઉપયોગ કરવા માટે મફત અનુભવો, મેન્યુઅલ <0>અહીં જુઓ</0>.',
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
            title: 'સંબંધ બનાવો',
            primary_table: 'પ્રાથમિક ટેબલ',
            primary_field: 'પ્રાથમિક ફીલ્ડ',
            referenced_table: 'સંદર્ભિત ટેબલ',
            referenced_field: 'સંદર્ભિત ફીલ્ડ',
            primary_table_placeholder: 'ટેબલ પસંદ કરો',
            primary_field_placeholder: 'ફીલ્ડ પસંદ કરો',
            referenced_table_placeholder: 'ટેબલ પસંદ કરો',
            referenced_field_placeholder: 'ફીલ્ડ પસંદ કરો',
            no_tables_found: 'કોઈ ટેબલ મળી નથી',
            no_fields_found: 'કોઈ ફીલ્ડ મળી નથી',
            create: 'બનાવો',
            cancel: 'રદ કરો',
        },

        import_database_dialog: {
            title: 'વર્તમાન ડાયાગ્રામમાં આયાત કરો',
            import_schema: {
                title: 'સ્કીમા આયાત કરો',
                import: 'આયાત',
                cancel: 'રદ કરો',
                mismatch: {
                    title: 'આ સ્કીમા {{detected}} જેવી લાગે છે, પરંતુ આ ડાયાગ્રામ {{selected}} છે.',
                    description: 'ક્રોસ-ડેટાબેઝ આયાત હજુ સપોર્ટેડ નથી.',
                    cancel: 'રદ કરો',
                },
                ambiguous: {
                    description:
                        'SQL ડાયલેક્ટ આપમેળે ઓળખી શકાયો નહીં. વર્તમાન {{selected}} ડાયાગ્રામ માટે આ સ્કીમાની અર્થઘટન કેવી રીતે કરવી તેની પુષ્ટિ કરો.',
                },
            },
            override_alert: {
                title: 'ડેટાબેસ આયાત કરો',
                content: {
                    alert: 'આ ડાયાગ્રામ આયાત કરવાથી હાલના ટેબલ્સ અને સંબંધો પર અસર થશે.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> નવા ટેબલ ઉમેરવામાં આવશે.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> નવા સંબંધો બનાવવામાં આવશે.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> ટેબલ ઓવરરાઇટ કરાશે.',
                    proceed: 'શું તમે આગળ વધવા માંગો છો?',
                },
                import: 'આયાત કરો',
                cancel: 'રદ કરો',
            },
        },

        new_table_schema_dialog: {
            title: 'સ્કીમા પસંદ કરો',
            description:
                'વર્તમાનમાં ઘણા સ્કીમા દર્શાવવામાં આવે છે. નવું ટેબલ માટે એક પસંદ કરો.',
            cancel: 'રદ કરો',
            confirm: 'ખાતરી કરો',
        },

        update_table_schema_dialog: {
            title: 'સ્કીમા બદલો',
            description: 'ટેબલ "{{tableName}}" માટે સ્કીમા અપડેટ કરો',
            cancel: 'રદ કરો',
            confirm: 'બદલો',
        },

        create_table_schema_dialog: {
            title: 'નવું સ્કીમા બનાવો',
            description:
                'હજી સુધી કોઈ સ્કીમા અસ્તિત્વમાં નથી. તમારા ટેબલ્સ ને વ્યવસ્થિત કરવા માટે તમારું પહેલું સ્કીમા બનાવો.',
            create: 'બનાવો',
            cancel: 'રદ કરો',
        },
        export_diagram_dialog: {
            title: 'ડાયાગ્રામ નિકાસ કરો',
            description: 'નિકાસ માટે ફોર્મેટ પસંદ કરો:',
            format_json: 'JSON',
            cancel: 'રદ કરો',
            export: 'નિકાસ કરો',
            error: {
                title: 'ડાયાગ્રામ નિકાસમાં ભૂલ',
                description: 'કશુક તો ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.',
            },
        },

        import_diagram_dialog: {
            title: 'ડાયાગ્રામ આયાત કરો',
            description: 'નીચે ડાયાગ્રામ JSON પેસ્ટ કરો:',
            cancel: 'રદ કરો',
            import: 'આયાત કરો',
            error: {
                title: 'ડાયાગ્રામ આયાતમાં ભૂલ',
                description:
                    'ડાયાગ્રામ JSON અમાન્ય છે. કૃપા કરીને JSON તપાસો અને ફરી પ્રયાસ કરો. મદદ જોઈએ? support@chartdb.io પર સંપર્ક કરો.',
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
            one_to_one: 'એકથી એક',
            one_to_many: 'એકથી ઘણા',
            many_to_one: 'ઘણા થી એક',
            many_to_many: 'ઘણાથી ઘણા',
        },

        canvas_context_menu: {
            new_table: 'નવું ટેબલ',
            new_view: 'નવું વ્યૂ',
            new_relationship: 'નવો સંબંધ',
            // TODO: Translate
            new_area: 'નવો વિસ્તાર',
            new_note: 'નવી નોંધ',
        },

        table_node_context_menu: {
            edit_table: 'ટેબલ સંપાદિત કરો',
            duplicate_table: 'ટેબલની નકલ કરો',
            delete_table: 'ટેબલ કાઢી નાખો',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'વિસ્તારમાં ખસેડો',
            no_area: 'કોઈ વિસ્તાર નહીં',
        },

        canvas: {
            all_tables_hidden: 'બધી ટેબલ્સ છુપાયેલી છે',
            show_all_tables: 'બધું બતાવો',
        },

        canvas_filter: {
            title: 'ટેબલ્સ ફિલ્ટર કરો',
            search_placeholder: 'ટેબલ્સ શોધો...',
            group_by_schema: 'સ્કીમા પ્રમાણે ગ્રુપ કરો',
            group_by_area: 'વિસ્તાર પ્રમાણે ગ્રુપ કરો',
            no_tables_found: 'કોઈ ટેબલ મળી નથી',
            empty_diagram_description: 'શરૂ કરવા માટે ટેબલ બનાવો',
            no_tables_description:
                'તમારી શોધ અથવા ફિલ્ટર સમાયોજિત કરવાનો પ્રયાસ કરો',
            clear_filter: 'ફિલ્ટર સાફ કરો',
        },

        snap_to_grid_tooltip: 'ગ્રિડ પર સ્નેપ કરો (જમાવટ {{key}})',

        editing_conflict: {
            one: '{{name}} આ પણ સંપાદિત કરી રહ્યા છે.',
            two: '{{name1}} અને {{name2}} આ પણ સંપાદિત કરી રહ્યા છે.',
            many: '{{name}} અને વધુ {{count}} આ પણ સંપાદિત કરી રહ્યા છે.',
            fallback_name: 'સહયોગી',
            last_writer_wins:
                'ફેરફારો લૉક નથી. છેલ્લું સાચવેલું સંપાદન જીતે છે.',
        },

        tool_tips: {
            double_click_to_edit: 'સંપાદિત કરવા માટે ડબલ-ક્લિક કરો',
        },

        auth: {
            dialog: {
                account_title: 'એકાઉન્ટ',
                login_title: 'FoxalDB માં સાઇન ઇન કરો',
                register_title: 'FoxalDB એકાઉન્ટ બનાવો',
                account_description: 'તમારા વર્તમાન સત્રનું સંચાલન કરો.',
                login_description:
                    'વધુ ડાયાગ્રામ સાચવવા અને સિંક કરવા માટે સાઇન ઇન કરો.',
                register_description:
                    'વધુ ડાયાગ્રામ સાચવવા માટે એકાઉન્ટ બનાવો.',
                checking_session: 'સત્ર તપાસી રહ્યા છીએ...',
                continue_without_account: 'એકાઉન્ટ વગર ચાલુ રાખો',
            },
            login: {
                title: 'લૉગ ઇન',
                email_label: 'ઇમેઇલ',
                password_label: 'પાસવર્ડ',
                submit: 'સાઇન ઇન',
                submitting: 'સાઇન ઇન થઈ રહ્યું છે...',
                switch_to_register: 'નોંધણી',
                no_account: 'એકાઉન્ટ નથી?',
            },
            register: {
                title: 'નોંધણી',
                first_name_label: 'પ્રથમ નામ',
                last_name_label: 'અટક',
                email_label: 'ઇમેઇલ',
                password_label: 'પાસવર્ડ',
                password_confirmation_label: 'પાસવર્ડની પુષ્ટિ કરો',
                submit: 'એકાઉન્ટ બનાવો',
                submitting: 'એકાઉન્ટ બનાવી રહ્યા છીએ...',
                switch_to_login: 'લૉગ ઇન',
                already_have_account: 'પહેલેથી એકાઉન્ટ છે?',
            },
            account: {
                signed_in_as: 'આ રૂપે સાઇન ઇન',
                logout: 'લૉગ આઉટ',
                back_to_editor: 'એડિટર પર પાછા જાઓ',
            },
            settings: {
                title: 'વપરાશકર્તા સેટિંગ્સ',
                description: 'તમારી વ્યક્તિગત માહિતી અને પાસવર્ડ અપડેટ કરો.',
                change_password_heading: 'પાસવર્ડ બદલો',
                current_password_label: 'વર્તમાન પાસવર્ડ',
                new_password_label: 'નવો પાસવર્ડ',
                password_confirmation_label: 'નવા પાસવર્ડની પુષ્ટિ કરો',
                first_name_label: 'પ્રથમ નામ',
                last_name_label: 'અટક',
                email_label: 'ઇમેઇલ સરનામું',
                submit: 'ફેરફારો સાચવો',
                submitting: 'સાચવી રહ્યા છીએ...',
                success_title: 'પ્રોફાઇલ અપડેટ થઈ',
                success_description: 'તમારી પ્રોફાઇલ સાચવવામાં આવી.',
            },
            nav: {
                sign_in: 'સાઇન ઇન',
                logout: 'લૉગ આઉટ',
                loading: '...',
                user_menu: 'એકાઉન્ટ',
                settings: 'સેટિંગ્સ',
                change_language: 'ભાષા',
            },
            pages: {
                login_title: 'FoxalDB — લૉગ ઇન',
                register_title: 'FoxalDB — નોંધણી',
                checking_session: 'સત્ર તપાસી રહ્યા છીએ…',
            },
            errors: {
                first_name_required: 'પ્રથમ નામ જરૂરી છે.',
                last_name_required: 'અટક જરૂરી છે.',
                generic: 'કંઈક ખોટું થયું.',
            },
        },

        guest_migration_dialog: {
            title: 'સ્થાનિક ડાયાગ્રામ આયાત કરવું?',
            description:
                'આ ડિવાઇસ પર ડાયાગ્રામ સાચવેલું છે. ગમે ત્યાંથી ઍક્સેસ કરવા માટે તેને તમારા એકાઉન્ટમાં આયાત કરો.',
            import: 'એકાઉન્ટમાં આયાત કરો',
            continue_without_import: 'આયાત વગર ચાલુ રાખો',
        },

        guest_migration_errors: {
            import_failed:
                'સ્થાનિક ડાયાગ્રામ આયાત કરી શકાયું નહીં. સ્થાનિક કોપી સાચવી રાખવામાં આવી છે.',
            activation_failed:
                'ડાયાગ્રામ બનાવ્યું પણ ખોલી શકાયું નહીં. સ્થાનિક કોપી સાચવી રાખવામાં આવી છે.',
            cleanup_failed:
                'ડાયાગ્રામ આયાત થયું પણ સ્થાનિક કોપી દૂર કરી શકાઈ નહીં. તમે મેન્યુઅલી કાઢી શકો છો.',
            check_failed: 'સ્થાનિક ડાયાગ્રામ વાંચી શકાયું નહીં.',
        },

        language_select: {
            change_language: 'ભાષા બદલો',
        },

        on: 'ચાલુ',
        off: 'બંધ',
    },
};

export const guMetadata: LanguageMetadata = {
    name: 'Gujarati (India)',
    nativeName: 'ગુજરાતી (ભારત)',
    code: 'gu',
    countryCode: 'in',
};
