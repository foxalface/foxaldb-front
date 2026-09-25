import type { LanguageMetadata, LanguageTranslation } from '../types';
import { railsExportNoteMessages } from '../rails-export-notes/de';
import { djangoExportNoteMessages } from '../django-export-notes/de';
import { drizzleExportNoteMessages } from '../drizzle-export-notes/de';

export const de: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Neu',
            browse: 'Öffnen',
            tables: 'Tabellen',
            refs: 'Refs',
            dependencies: 'Abhängigkeiten',
            custom_types: 'Benutzerdefinierte Typen',
            conversations: 'Unterhaltungen',
            conversations_unread_aria:
                '{{count}} ungelesene Nachrichten in Konversationen',
            visuals: 'Darstellungen',
            activities: 'Aktivität',
            share: 'Teilen',
        },
        menu: {
            actions: {
                actions: 'Aktionen',
                new: 'Neu...',
                browse: 'Alle Datenbanken...',
                save: 'Speichern',
                import: 'Datenbank importieren',
                export: 'Exportieren...',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'SQL exportieren',
                export_as: 'Exportieren als',
                delete_diagram: 'Löschen',
            },
            edit: {
                edit: 'Bearbeiten',
                undo: 'Rückgängig',
                redo: 'Wiederholen',
                clear: 'Leeren',
            },
            view: {
                view: 'Ansicht',
                show_sidebar: 'Seitenleiste anzeigen',
                hide_sidebar: 'Seitenleiste ausblenden',
                hide_cardinality: 'Kardinalität ausblenden',
                show_cardinality: 'Kardinalität anzeigen',
                hide_field_attributes: 'Feldattribute ausblenden',
                show_field_attributes: 'Feldattribute anzeigen',
                zoom_on_scroll: 'Zoom beim Scrollen',
                show_views: 'Datenbankansichten',
                theme: 'Stil',
                show_dependencies: 'Abhängigkeiten anzeigen',
                hide_dependencies: 'Abhängigkeiten ausblenden',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: 'Sicherung',
                export_diagram: 'Diagramm exportieren',
                restore_diagram: 'Diagramm wiederherstellen',
            },
            help: {
                help: 'Hilfe',
                docs_website: 'Dokumentation',
                join_discord: 'Auf Discord beitreten',
            },
        },

        delete_diagram_alert: {
            title: 'Diagramm löschen',
            description:
                'Diese Aktion kann nicht rückgängig gemacht werden. Das Diagramm wird dauerhaft gelöscht.',
            cancel: 'Abbrechen',
            delete: 'Löschen',
        },

        clear_diagram_alert: {
            title: 'Diagramm leeren',
            description:
                'Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten im Diagramm werden dauerhaft gelöscht.',
            cancel: 'Abbrechen',
            clear: 'Leeren',
        },

        diagram_access: {
            removed: {
                title: 'Zugriff entfernt',
                description:
                    'Sie haben keinen Zugriff mehr auf dieses Diagramm.',
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
            title: 'Diagramm automatisch anordnen',
            description:
                'Diese Aktion wird alle Tabellen im Diagramm neu anordnen. Möchten Sie fortfahren?',
            reorder: 'Automatisch anordnen',
            cancel: 'Abbrechen',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Kopieren fehlgeschlagen',
                description: 'Zwischenablage nicht unterstützt',
            },
            failed: {
                title: 'Kopieren fehlgeschlagen',
                description:
                    'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
            },
        },

        theme: {
            system: 'System',
            light: 'Hell',
            dark: 'Dunkel',
        },

        zoom: {
            on: 'Ein',
            off: 'Aus',
        },

        last_saved: 'Zuletzt gespeichert',
        saved: 'Gespeichert',
        loading_diagram: 'Diagramm wird geladen...',
        deselect_all: 'Alles abwählen',
        select_all: 'Alles auswählen',
        delete: 'Löschen',
        clear: 'Leeren',
        show_more: 'Mehr anzeigen',
        show_less: 'Weniger anzeigen',
        copy_to_clipboard: 'In die Zwischenablage kopieren',
        copied: 'Kopiert!',

        side_panel: {
            view_all_options: 'Alle Optionen anzeigen...',
            tables_section: {
                tables: 'Tabellen',
                add_table: 'Tabelle hinzufügen',
                add_view: 'Ansicht hinzufügen',
                filter: 'Filter',
                collapse: 'Alle einklappen',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'Alle Tabellen sind ausgeblendet',
                show_all: 'Alle anzeigen',

                table: {
                    fields: 'Felder',
                    nullable: 'Nullable?',
                    primary_key: 'Primärschlüssel',
                    indexes: 'Indizes',
                    check_constraints: 'Prüfbedingungen',
                    comments: 'Kommentare',
                    no_comments: 'Keine Kommentare',
                    add_field: 'Feld hinzufügen',
                    add_index: 'Index hinzufügen',
                    add_check: 'Prüfung hinzufügen',
                    index_select_fields: 'Felder auswählen',
                    no_types_found: 'Keine Datentypen gefunden',
                    field_name: 'Name',
                    field_type: 'Datentyp',
                    field_actions: {
                        title: 'Feldattribute',
                        open_discussion: 'Unterhaltung öffnen',
                        unique: 'Eindeutig',
                        auto_increment: 'Automatisch hochzählen',
                        comments: 'Kommentare',
                        no_comments: 'Keine Kommentare',
                        delete_field: 'Feld löschen',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Präzision',
                        scale: 'Skalierung',
                    },
                    index_actions: {
                        title: 'Indexattribute',
                        name: 'Name',
                        unique: 'Eindeutig',
                        index_type: 'Indextyp',
                        delete_index: 'Index löschen',
                    },
                    check_constraint_actions: {
                        title: 'Prüfbedingung',
                        expression: 'Ausdruck',
                        delete: 'Prüfbedingung löschen',
                    },
                    table_actions: {
                        title: 'Tabellenaktionen',
                        open_discussion: 'Unterhaltung öffnen',
                        change_schema: 'Schema ändern',
                        add_field: 'Feld hinzufügen',
                        add_index: 'Index hinzufügen',
                        duplicate_table: 'Tabelle duplizieren',
                        delete_table: 'Tabelle löschen',
                    },
                },
                empty_state: {
                    title: 'Keine Tabellen',
                    description: 'Erstellen Sie eine Tabelle, um zu beginnen',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Filter',
                clear: 'Filter löschen',
                no_results:
                    'Keine Referenzen gefunden, die Ihrem Filter entsprechen.',
                collapse: 'Alle einklappen',
                add_relationship: 'Beziehung hinzufügen',
                relationships: 'Beziehungen',
                dependencies: 'Abhängigkeiten',
                relationship: {
                    relationship: 'Beziehung',
                    primary: 'Primäre Tabelle',
                    foreign: 'Verknüpfte Tabelle',
                    cardinality: 'Kardinalität',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Löschen',
                    switch_tables: 'Tabellen tauschen',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Aktionen',
                        open_discussion: 'Unterhaltung öffnen',
                        delete_relationship: 'Löschen',
                    },
                },
                dependency: {
                    dependency: 'Abhängigkeit',
                    table: 'Tabelle',
                    dependent_table: 'Abhängige Ansicht',
                    delete_dependency: 'Löschen',
                    dependency_actions: {
                        title: 'Aktionen',
                        delete_dependency: 'Löschen',
                    },
                },
                empty_state: {
                    title: 'Keine Beziehungen',
                    description: 'Erstellen Sie eine Beziehung, um zu beginnen',
                },
            },

            areas_section: {
                areas: 'Bereiche',
                add_area: 'Bereich hinzufügen',
                filter: 'Filter',
                clear: 'Filter löschen',
                no_results:
                    'Keine Bereiche gefunden, die Ihrem Filter entsprechen.',

                area: {
                    area_actions: {
                        title: 'Bereich-Aktionen',
                        edit_name: 'Name bearbeiten',
                        delete_area: 'Bereich löschen',
                    },
                },
                empty_state: {
                    title: 'Keine Bereiche',
                    description: 'Erstellen Sie einen Bereich, um zu beginnen',
                },
            },

            visuals_section: {
                visuals: 'Darstellungen',
                tabs: {
                    areas: 'Bereiche',
                    notes: 'Notizen',
                },
            },

            notes_section: {
                filter: 'Filter',
                add_note: 'Notiz hinzufügen',
                no_results: 'Keine Notizen gefunden',
                clear: 'Filter löschen',
                empty_state: {
                    title: 'Keine Notizen',
                    description:
                        'Erstellen Sie eine Notiz, um Textanmerkungen auf der Leinwand hinzuzufügen',
                },
                note: {
                    empty_note: 'Leere Notiz',
                    note_actions: {
                        title: 'Notiz-Aktionen',
                        edit_content: 'Inhalt bearbeiten',
                        delete_note: 'Notiz löschen',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Benutzerdefinierte Typen',
                filter: 'Filter',
                clear: 'Filter löschen',
                no_results:
                    'Keine benutzerdefinierten Typen gefunden, die Ihrem Filter entsprechen.',
                new_type: 'Neuer Typ',
                empty_state: {
                    title: 'Keine benutzerdefinierten Typen',
                    description:
                        'Benutzerdefinierte Typen werden hier angezeigt, wenn sie in Ihrer Datenbank verfügbar sind',
                },
                custom_type: {
                    kind: 'Art',
                    enum_values: 'Enum-Werte',
                    composite_fields: 'Felder',
                    no_fields: 'Keine Felder definiert',
                    no_values: 'Keine Enum-Werte definiert',
                    field_name_placeholder: 'Feldname',
                    field_type_placeholder: 'Typ auswählen',
                    add_field: 'Feld hinzufügen',
                    no_fields_tooltip:
                        'Keine Felder für diesen benutzerdefinierten Typ definiert',
                    custom_type_actions: {
                        title: 'Aktionen',
                        highlight_fields: 'Felder hervorheben',
                        delete_custom_type: 'Löschen',
                        clear_field_highlight: 'Hervorhebung entfernen',
                    },
                    delete_custom_type: 'Typ löschen',
                },
            },
            conversations_section: {
                title: 'Unterhaltungen',
                tabs_label: 'Unterhaltungslisten',
                tabs: {
                    active: 'Aktiv',
                    archives: 'Archivierte',
                },
                loading: 'Unterhaltungen werden geladen…',
                filter: 'Filtern',
                clear: 'Filter löschen',
                no_results_title: 'Keine Ergebnisse',
                no_results_description:
                    'Keine Unterhaltungen entsprechen Ihrem Filter.',

                type_filter: {
                    trigger: 'Typ',
                    label: 'Nach Typ filtern',
                    trigger_aria: 'Nach Unterhaltungstyp filtern',
                },
                loading_more: 'Weitere werden geladen…',
                load_more: 'Mehr laden',
                retry: 'Erneut versuchen',
                dismiss: 'Schließen',
                read_only: 'Nur Lesen',
                deleted_user: 'Gelöschter Benutzer',
                unread: {
                    badge_aria: '{{count}} ungelesene Nachrichten',
                },
                inactive: {
                    title: 'Unterhaltungen nicht verfügbar',
                    description:
                        'Unterhaltungen sind nur bei authentifizierten Cloud-Diagrammen verfügbar.',
                },
                empty: {
                    active_title: 'Keine Unterhaltung',
                    active_description:
                        'Erstellen Sie eine Unterhaltung, um zu beginnen',
                    archives_title: 'Keine archivierten Unterhaltungen',
                    archives_description:
                        'Archivierte Unterhaltungen erscheinen hier, wenn Sie einen Thread schließen.',
                },
                errors: {
                    load_title: 'Unterhaltungen konnten nicht geladen werden',
                    load_description:
                        'Beim Laden der Unterhaltungen ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
                },
                mutation_errors: {
                    generic:
                        'Die Unterhaltung konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
                },
                target_entry: {
                    open: 'Unterhaltung öffnen',
                    start: 'Unterhaltung starten',
                    pending: 'Unterhaltung wird gestartet…',
                    diagram_name: 'Diagramm',
                    open_aria: 'Unterhaltung für {{name}} öffnen',
                    start_aria: 'Unterhaltung für {{name}} starten',
                    open_tooltip: 'Unterhaltung für {{name}} öffnen',
                    start_tooltip: 'Unterhaltung für {{name}} starten',
                    pending_tooltip:
                        'Unterhaltung für {{name}} wird gestartet…',
                    action_tooltip: 'Konversation',
                    unavailable_description:
                        'Sie können auf diesem Diagramm keine Unterhaltungen starten.',
                    errors: {
                        validation:
                            'Dieses Ziel ist für eine Unterhaltung nicht gültig.',
                        forbidden:
                            'Sie haben keine Berechtigung, diese Unterhaltung zu starten.',
                        not_found:
                            'Dieses Ziel ist im Diagramm nicht mehr verfügbar.',
                        conflict:
                            'Diese Unterhaltung konnte gerade nicht gestartet werden. Bitte versuchen Sie es erneut.',
                        generic:
                            'Diese Unterhaltung konnte nicht geöffnet werden. Bitte versuchen Sie es erneut.',
                    },
                },
                actions: {
                    archive: 'Archivieren',
                    archiving: 'Archivierung…',
                    reopen: 'Wiedereröffnen',
                    reopening: 'Wird wiedereröffnet…',
                    archive_aria: 'Unterhaltung für {{target}} archivieren',
                    reopen_aria: 'Unterhaltung für {{target}} wiedereröffnen',
                },
                summary: {
                    message_count: '{{count}} Nachrichten',
                    no_messages: 'Noch keine Nachrichten',
                    last_activity: 'Letzte Aktivität',
                    open_aria: 'Unterhaltung für {{target}} öffnen',
                    focus_target_aria: '{{target}} im Diagramm anzeigen',
                    author_tooltip: 'Letzte Nachricht von {{name}}',
                    author_missing_tooltip: 'Keine Autoreninformationen',
                    actions: {
                        menu_aria: 'Unterhaltungsoptionen',
                        open: 'Öffnen',
                        delete: 'Löschen',
                    },
                    delete_dialog: {
                        title: 'Unterhaltung löschen?',
                        description:
                            'Dadurch werden diese Unterhaltung und alle ihre Nachrichten dauerhaft gelöscht.',
                        cancel: 'Abbrechen',
                        confirm: 'Löschen',
                        deleting: 'Wird gelöscht…',
                        errors: {
                            delete_failed:
                                'Diese Unterhaltung konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.',
                            forbidden:
                                'Sie haben keine Berechtigung, diese Unterhaltung zu löschen.',
                            not_found:
                                'Diese Unterhaltung ist nicht mehr verfügbar.',
                        },
                    },
                },
                detail: {
                    back: 'Zurück',
                    back_aria: 'Zurück zur Unterhaltungsliste',
                    loading: 'Nachrichten werden geladen…',
                    loading_more: 'Ältere Nachrichten werden geladen…',
                    load_older: 'Ältere Nachrichten laden',
                    new_messages_badge_one: '1 neue Nachricht',
                    new_messages_badge_other: '{{count}} neue Nachrichten',
                    new_messages_badge_label_one: 'neue Nachricht',
                    new_messages_badge_label_other: 'neue Nachrichten',
                    new_messages_badge_aria_one: 'Zur neuen Nachricht springen',
                    new_messages_badge_aria_other:
                        'Zu {{count}} neuen Nachrichten springen',
                    empty: {
                        title: 'Keine Nachrichten',
                        description:
                            'Diese Unterhaltung enthält keine Nachrichten.',
                    },
                    errors: {
                        load_title: 'Nachrichten konnten nicht geladen werden',
                        load_description:
                            'Beim Laden der Nachrichten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
                    },
                    archive_banner: {
                        title: 'Archivierte Unterhaltung',
                        description:
                            'Diese Unterhaltung ist schreibgeschützt. Nachrichten können nicht hinzugefügt, bearbeitet oder gelöscht werden.',
                    },
                    metadata: {
                        status_label: 'Status',
                        status_active: 'Aktiv',
                        status_archived: 'Archiviert',
                        message_count_label: 'Anzahl der Nachrichten',
                        message_count: '{{count}} Nachrichten',
                    },
                    message: {
                        edited: '(bearbeitet)',
                        edited_aria: 'Nachricht wurde bearbeitet',
                        day_separator: {
                            today: 'Heute',
                            yesterday: 'Gestern',
                        },
                        actions: {
                            title: 'Nachrichtenaktionen',
                            edit: 'Bearbeiten',
                            delete: 'Löschen',
                        },
                        reactions: {
                            add_aria: 'Reaktion hinzufügen',
                            add_tooltip: 'Reaktion hinzufügen',
                            picker_loading: 'Emoji-Auswahl wird geladen…',
                            picker_aria_label: 'Emoji-Auswahl',
                            picker_search_placeholder: 'Emoji suchen…',
                            picker_empty: 'Kein Emoji gefunden.',
                            chip_aria: 'Reaktion {{emoji}}, {{count}}',
                            preview_and_others_one: 'und {{count}} weiterer',
                            preview_and_others_other: 'und {{count}} weitere',
                            errors: {
                                generic:
                                    'Die Reaktion konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
                                forbidden:
                                    'Sie dürfen auf diese Nachricht nicht reagieren.',
                                archived:
                                    'Diese Unterhaltung ist archiviert und Reaktionen sind schreibgeschützt.',
                                not_found:
                                    'Diese Nachricht ist nicht mehr verfügbar.',
                                invalid_emoji: 'Dieses Emoji ist ungültig.',
                            },
                        },
                    },
                    composer: {
                        label: 'Nachricht',
                        placeholder: 'Nachricht schreiben…',
                        submit: 'Senden',
                        submitting: 'Wird gesendet…',
                        form_aria_label: 'Neue Konversationsnachricht',
                        keyboard_hint:
                            'Eingabetaste zum Senden. Umschalt+Eingabe für eine neue Zeile.',
                        counter_aria_label:
                            '{{count}} von {{max}} Zeichen verwendet',
                        errors: {
                            empty: 'Geben Sie eine Nachricht zum Senden ein.',
                            too_long:
                                'Nachrichten dürfen höchstens 2000 Zeichen haben.',
                            create_failed:
                                'Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.',
                        },
                    },
                    edit: {
                        label: 'Nachricht',
                        form_aria_label: 'Konversationsnachricht bearbeiten',
                        save: 'Speichern',
                        saving: 'Wird gespeichert…',
                        cancel: 'Abbrechen',
                        counter_aria_label:
                            '{{count}} von {{max}} Zeichen verwendet',
                        errors: {
                            empty: 'Geben Sie eine Nachricht zum Speichern ein.',
                            too_long:
                                'Nachrichten dürfen höchstens 2000 Zeichen haben.',
                            update_failed:
                                'Nachricht konnte nicht aktualisiert werden. Bitte erneut versuchen.',
                        },
                    },
                    delete_dialog: {
                        title: 'Nachricht löschen',
                        description:
                            'Möchten Sie diese Nachricht wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
                        cancel: 'Abbrechen',
                        confirm: 'Löschen',
                        deleting: 'Wird gelöscht…',
                        errors: {
                            delete_failed:
                                'Diese Nachricht konnte nicht gelöscht werden. Bitte erneut versuchen.',
                        },
                    },
                    mutation_errors: {
                        forbidden:
                            'Sie haben keine Berechtigung, diese Nachricht zu ändern.',
                        archived:
                            'Diese Konversation ist archiviert und schreibgeschützt.',
                        not_found:
                            'Diese Konversation oder Nachricht ist nicht mehr verfügbar.',
                    },
                },

                targets: {
                    diagram: 'Diagramm',
                    table: 'Tabelle',
                    field: 'Feld',
                    relationship: 'Beziehung',
                    unknown: 'Unterhaltung',
                },
                target_labels: {
                    diagram: 'Diagramm',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Gelöschte Tabelle',
                    missing_field: 'Gelöschtes Feld',
                    missing_relationship: 'Gelöschte Beziehung',
                    unknown: 'Unterhaltung',
                },
            },
            activities_section: {
                title: 'Aktivität',
                filter: 'Filtern',
                clear: 'Filter löschen',
                no_results: 'Keine Aktivität entspricht Ihrem Filter.',
                loading: 'Aktivität wird geladen…',
                retry: 'Erneut versuchen',
                type_filter: {
                    trigger: 'Typ',
                    label: 'Nach Typ filtern',
                    trigger_aria: 'Nach Aktivitätstyp filtern',
                },
                types: {
                    diagram: 'Diagramm',
                    table: 'Tabelle',
                    field: 'Feld',
                    relationship: 'Beziehung',
                    note: 'Notiz',
                    area: 'Bereich',
                    dependency: 'Abhängigkeit',
                },
                you: 'Sie',
                unknown_user: 'Jemand',
                empty_state: {
                    title: 'Noch keine Aktivität',
                    description:
                        'Beginnen Sie mit der Bearbeitung, um aktuelle Änderungen zu sehen.',
                },
                errors: {
                    load_failed: 'Aktivität konnte nicht geladen werden.',
                },
                actions: {
                    add_tables:
                        '{{user}} hat die Tabelle {{table}} hinzugefügt',
                    remove_tables: '{{user}} hat eine Tabelle entfernt',
                    add_field: '{{user}} hat das Feld {{field}} hinzugefügt',
                    remove_field: '{{user}} hat ein Feld entfernt',
                    update_field:
                        '{{user}} hat das Feld {{field}} aktualisiert',
                    add_relationships:
                        '{{user}} hat eine Beziehung hinzugefügt',
                    remove_relationships:
                        '{{user}} hat eine Beziehung entfernt',
                    update_relationship:
                        '{{user}} hat eine Beziehung aktualisiert',
                    add_notes: '{{user}} hat eine Notiz hinzugefügt',
                    remove_notes: '{{user}} hat eine Notiz entfernt',
                    add_areas: '{{user}} hat einen Bereich hinzugefügt',
                    remove_areas: '{{user}} hat einen Bereich entfernt',
                    add_dependencies:
                        '{{user}} hat eine Abhängigkeit hinzugefügt',
                    remove_dependencies:
                        '{{user}} hat eine Abhängigkeit entfernt',
                    fallback: '{{user}} hat das Diagramm aktualisiert',
                },
            },
            share_section: {
                title: 'Teilen',
                tabs_label: 'Freigabeoptionen',
                tabs: {
                    collaborators: 'Mitarbeitende',
                    public_link: 'Öffentlicher Link',
                },
                collaborators: {
                    description:
                        'Laden Sie Mitarbeitende mit Bearbeiter- oder Leserzugriff ein. Sie benötigen bereits ein FoxalDB-Konto.',
                    filter: 'Filtern',
                    clear: 'Filter löschen',
                    no_results_title: 'Keine Ergebnisse',
                    no_results_description:
                        'Keine Mitarbeitenden entsprechen Ihrem Filter.',
                    role_filter: {
                        trigger: 'Rolle',
                        label: 'Nach Rolle filtern',
                        trigger_aria: 'Nach Mitarbeitendenrolle filtern',
                    },
                },
                public_link: {
                    title: 'Öffentlicher Link',
                    description:
                        'Teilen Sie eine schreibgeschützte Momentaufnahme Ihres Diagramms mit allen, die den Link haben.',
                    coming_soon: 'Demnächst verfügbar.',
                },
                loading: 'Mitarbeitende werden geladen…',
                retry: 'Erneut versuchen',
                errors: {
                    load_failed: 'Mitarbeitende konnten nicht geladen werden.',
                },
                member_actions: {
                    title: 'Aktionen für Mitarbeitende',
                    trigger_aria: 'Aktionen für Mitarbeitende',
                    role: 'Rolle',
                    remove: 'Mitarbeitende entfernen',
                },
            },
        },

        toolbar: {
            zoom_in: 'Vergrößern',
            zoom_out: 'Verkleinern',
            save: 'Speichern',
            show_all: 'Alle anzeigen',
            undo: 'Rückgängig',
            redo: 'Wiederholen',
            reorder_diagram: 'Diagramm automatisch anordnen',

            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Überlappende Tabellen hervorheben',
            filter: 'Tabellen filtern',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Wählen Sie Ihr DBMS',
                description:
                    'Wählen Sie das Datenbanksystem für Ihr neues Diagramm.',
                search_placeholder: 'Datenbankmanagementsystem suchen…',
                search_no_results:
                    'Kein Datenbankmanagementsystem entspricht Ihrer Suche.',
                clear_search: 'Suche löschen',
                primary_group: 'Primäre Datenbanken',
                other_group: 'Weitere Datenbanken',
            },

            choose_intent: {
                title: 'Was möchten Sie tun?',
                description:
                    'Erstellen Sie ein neues Diagramm für {{database}}.',
                create_empty: 'Leeres Diagramm erstellen',
                create_empty_description:
                    'Beginnen Sie von Grund auf mit selbst hinzugefügten Tabellen.',
                import: 'Importieren',
                import_description:
                    'Aus einer Datei, eingefügtem Text oder Ihrer Datenbank.',
                back: 'Zurück',
            },

            choose_import_method: {
                title: 'Wie möchten Sie importieren?',
                description:
                    'Wählen Sie eine Quelle für Ihr {{database}}-Diagramm.',
                from_file: 'Datei oder eingefügter Text',
                from_file_description:
                    'SQL, DBML, JSON oder Projektarchiv (.zip).',
                from_database: 'Bestehende Datenbank',
                from_database_description:
                    'Führen Sie eine Abfrage in Ihrer Datenbank aus und fügen Sie das Ergebnis ein.',
                back: 'Zurück',
            },

            import_from_database: {
                title: 'Aus vorhandener Datenbank importieren',
                description:
                    'Verwenden Sie dies, wenn Sie keine SQL- oder DBML-Schemadatei haben. Führen Sie die Abfrage in Ihrer Datenbank aus und fügen Sie das Ergebnis unten ein.',
                database_edition: 'Datenbankedition',
                edition_regular: 'Standard',
                run_query: 'Führen Sie diese Abfrage in Ihrer Datenbank aus',
                client_sql: 'SQL',
                paste_result: 'Ergebnis einfügen',
                paste_result_placeholder: 'Abfrageergebnis hier einfügen…',
                check_result: 'Ergebnis prüfen',
                valid_result: 'Das Ergebnis sieht gültig aus.',
                invalid_result:
                    'Das Ergebnis konnte nicht validiert werden. Prüfen Sie den Inhalt und versuchen Sie es erneut.',
                truncated_result:
                    'Das Ergebnis scheint abgeschnitten zu sein. Passen Sie die SQL-Client-Einstellungen an und führen Sie die Abfrage erneut aus.',
                waiting_for_result:
                    'Fügen Sie das Abfrageergebnis ein, um fortzufahren.',
                unsupported_database:
                    'Schemaextraktion ist für diesen Datenbanktyp nicht verfügbar.',
                import_failed:
                    'Das Datenbankschema konnte nicht importiert werden. Prüfen Sie das Ergebnis und versuchen Sie es erneut.',
                back: 'Zurück',
                import: 'Importieren',
            },

            import_schema: {
                title: 'Schema einfügen',
                textarea_label: 'Schemainhalt',
                textarea_placeholder:
                    'SQL, DBML oder JSON-Metadaten hier einfügen…',
                auto_detect_hint: 'Wir erkennen das Format automatisch.',
                or_divider: 'ODER',
                choose_file: 'Datei auswählen',
                choose_file_or_project: 'Datei oder Projekt auswählen',
                supported_formats_hint:
                    'Unterstützt: SQL, DBML, JSON, Projektarchiv (.zip)',
                privacy_info: {
                    link_label: 'Weitere Informationen…',
                    title: 'Datenschutz und unterstützte Formate',
                    intro: 'Bevor Sie eine Datei auswählen, erfahren Sie hier, wie FoxalDB Ihre Daten beim Import behandelt.',
                    highlights: {
                        no_execution:
                            'Importe nutzen nur statische Analyse — Ihr Code wird nie ausgeführt.',
                        no_full_upload:
                            'Vollständige Projektarchive werden nie auf den Server hochgeladen.',
                        filtered_files:
                            'Es werden nur schema-relevante Dateien behalten; .env, vendor/, node_modules/ und tests/ sind ausgeschlossen.',
                    },
                    simple_formats_title: 'SQL, DBML und JSON',
                    simple_formats_description:
                        'Vollständig in Ihrem Browser verarbeitet. Maximale Dateigröße: {{sizeMb}} MB.',
                    project_archives_title: 'Projektarchive (.zip)',
                    project_archives_description:
                        'Das Archiv wird lokal geöffnet und nur schema-relevante Dateien werden extrahiert. Maximale Archivgröße: {{sizeMb}} MB.',
                    excluded_paths:
                        'Nie enthalten: .env, vendor/, node_modules/, tests/ und andere nicht schema-relevante Quelldateien.',
                    table: {
                        framework: 'Framework',
                        files: 'Analysierte Dateien',
                        processing: 'Verarbeitung',
                        processing_local: 'Nur im Browser',
                        processing_remote: 'Server (Anmeldung erforderlich)',
                    },
                    frameworks: {
                        laravel: { files: 'database/migrations/*.php' },
                        prisma: { files: 'prisma/schema.prisma' },
                        rails: { files: 'db/schema.rb' },
                        drizzle: { files: 'drizzle/**/*.sql' },
                        entity_framework_core: { files: '*ModelSnapshot.cs' },
                        django: { files: '*/migrations/*.py' },
                    },
                    back: 'Zurück',
                },
                change_file_aria: 'Datei ändern, aktuell {{name}}',
                selected_file: 'Ausgewählte Datei: {{name}}',
                back: 'Zurück',
                import: 'Importieren',
                mismatch: {
                    title: 'Dieses Schema sieht wie {{detected}} aus, aber Sie haben {{selected}} gewählt.',
                    description:
                        'Wechseln Sie zum erkannten Datenbanktyp oder gehen Sie zurück, um einen anderen zu wählen.',
                    switch: 'Zu {{database}} wechseln',
                    go_back: 'Zurück',
                },
                ambiguous: {
                    title: 'Quell-DBMS wählen',
                    multiple_dbms_title: 'Mehrere DBMS erkannt',
                    selection_help_percentages:
                        'Die Prozentsätze geben den Übereinstimmungsindex des SQL-Dialekts für jedes DBMS an.',
                    selection_help_recommended:
                        'Der Stern markiert das empfohlene DBMS.',
                    selection_help_aria:
                        'Hilfe zu Prozentsätzen und Empfehlung',
                    confidence_explanation:
                        'Die Prozentsätze geben den Übereinstimmungsindex mit dem erkannten SQL-Dialekt für jedes DBMS an.',
                    description:
                        'Der SQL-Dialekt konnte nicht automatisch erkannt werden. Bestätigen Sie, von welchem DBMS dieses Schema stammt.',
                    choose_source: 'Quell-DBMS wählen',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% Vertrauen, automatisch erkannt)',
                    recommended_tooltip: 'Empfohlenes DBMS',
                    recommended_aria: '{{database}}, empfohlenes DBMS',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Bereit, dieses Diagramm zu importieren.',
                        mismatch_title: 'DBMS-Konflikt',
                        mismatch_description:
                            'Die Datei zeigt {{detected}}, aber Sie haben {{selected}} gewählt.',
                        unsupported_existing:
                            'Diagramm-JSON stellt ein vollständiges Diagramm wieder her und kann nicht in das aktuelle Diagramm zusammengeführt werden.',
                    },
                    ambiguous: {
                        title: 'DBMS des Diagramms wählen',
                        description:
                            'Wählen Sie die Option, die für diesen Import angewendet werden soll.',
                        selection_help_percentages:
                            'Die Prozentsätze geben den Übereinstimmungsindex für jedes DBMS an.',
                        selection_help_recommended:
                            'Der Stern markiert das im Diagramm angegebene DBMS.',
                        selection_help_aria:
                            'Hilfe zu Prozentsätzen und Empfehlung',
                        choose_source: 'Diagramm-DBMS wählen',
                        candidate: '{{database}}',
                        candidate_with_confidence:
                            '{{database}} ({{percent}}%)',
                        candidate_recommended:
                            '{{database}} (aus Datei, empfohlen)',
                        confidence_badge: '{{percent}}%',
                        recommended_tooltip: 'DBMS aus der Diagrammdatei',
                        recommended_aria:
                            '{{database}}, DBMS aus der Diagrammdatei',
                    },
                },
                detection: {
                    dialect: '{{database}} erkannt',
                    dbml: 'DBML erkannt',
                    metadata_json: 'Metadaten-JSON erkannt',
                    diagram_json: 'Diagramm-JSON erkannt',
                    sql_ambiguous_title: 'SQL erkannt',
                    sql_ambiguous_description:
                        'Das DBMS konnte nicht automatisch erkannt werden.',
                    clickhouse_unsupported: 'ClickHouse-SQL erkannt',
                    unsupported: 'Nicht unterstütztes Format',
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
                    analyzing_project: 'Projektarchiv wird analysiert…',
                    detected: '{{framework}}-Projekt erkannt',
                    migrations_found_one: '{{count}} Migration gefunden',
                    migrations_found_other: '{{count}} Migrationen gefunden',
                    schema_files_found_one: '{{count}} Schemadatei gefunden',
                    schema_files_found_other:
                        '{{count}} Schemadateien gefunden',
                    model_snapshots_found_one:
                        '{{count}} Modell-Snapshot gefunden',
                    model_snapshots_found_other:
                        '{{count}} Modell-Snapshots gefunden',
                    sql_migrations_found_one:
                        '{{count}} SQL-Migration gefunden',
                    sql_migrations_found_other:
                        '{{count}} SQL-Migrationen gefunden',
                    migrations_button_one: '{{count}} Migration',
                    migrations_button_other: '{{count}} Migrationen',
                    schema_files_button_one: '{{count}} Schemadatei',
                    schema_files_button_other: '{{count}} Schemadateien',
                    model_snapshots_button_one: '{{count}} Modell-Snapshot',
                    model_snapshots_button_other: '{{count}} Modell-Snapshots',
                    sql_migrations_button_one: '{{count}} Migration',
                    sql_migrations_button_other: '{{count}} Migrationen',
                    multiple_projects_title:
                        'Mehrere Datenbankschemata erkannt',
                    multiple_projects_description:
                        'Dieses Archiv enthält mehr als ein unterstütztes Datenbankprojekt. Wählen Sie aus, welches importiert werden soll.',
                    multiple_database_groups_title:
                        'Mehrere Datenbankschemata erkannt',
                    multiple_database_groups_description:
                        'Dieses Projekt enthält mehrere Datenbankschemata. Wählen Sie aus, welches importiert werden soll.',
                    choose_database_group: 'Datenbankschema auswählen',
                    group_recommended_aria: '{{label}} empfohlen',
                    group_recommended_tooltip: 'Empfohlenes Schema',
                    choose_project: 'Projekt auswählen',
                    unsupported_project: 'Nicht unterstütztes Projektarchiv',
                    unsupported_project_description:
                        'In diesem Archiv wurde kein unterstütztes Laravel-, Prisma-, Drizzle-, Rails-, Entity Framework Core- oder Django-Datenbankprojekt gefunden.',
                    project_root: 'Projektstamm: {{path}}',
                    sign_in_to_import_framework:
                        'Melden Sie sich an, um {{framework}}-Projekte zu importieren, sobald der Import verfügbar ist.',
                    remote_processing_notice:
                        'Sobald der Import verfügbar ist, werden nur schemarelevante Dateien verarbeitet.',
                    remote_processing_scope:
                        'Das vollständige Archiv und nicht relevante Quelldateien werden nie hochgeladen.',
                    remote_processing_security:
                        'Die Analyse ist statisch und führt hochgeladenen Code nicht aus.',
                },
                errors: {
                    unreadable_file:
                        'Die ausgewählte Datei konnte nicht gelesen werden.',
                    malformed_json:
                        'Der JSON-Inhalt konnte nicht analysiert werden.',
                    unsupported:
                        'Dieses Format wird für den Schemaimport nicht unterstützt.',
                    diagram_json:
                        'Diagramm-JSON kann über die Diagrammdatei-Option importiert werden.',
                    clickhouse_unsupported:
                        'SQL-DDL-Import wird für ClickHouse nicht unterstützt. Verwenden Sie DBML oder importieren Sie aus einer bestehenden Datenbank.',
                    file_too_large:
                        'Die ausgewählte Datei ist größer als 5 MB.',
                    archive_too_large:
                        'Das ausgewählte Projektarchiv ist größer als 50 MB.',
                    archive_invalid:
                        'Die ausgewählte Datei ist kein gültiges Projektarchiv.',
                    unsupported_file_extension:
                        'Nur .sql-, .dbml-, .json- und .zip-Projektarchive werden unterstützt.',
                    import_failed:
                        'Das Schema konnte nicht importiert werden. Prüfen Sie den Inhalt und versuchen Sie es erneut.',
                    invalid_diagram_json:
                        'Das Diagramm-JSON ist ungültig. Prüfen Sie die Datei und versuchen Sie es erneut.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS Anweisungen',
                    title: 'Anweisungen',
                    step_1: 'Gehen Sie zu Tools > Optionen > Abfrageergebnisse > SQL Server.',
                    step_2: 'Wenn Sie "Ergebnisse in Raster" verwenden, ändern Sie die maximale Zeichenanzahl für Nicht-XML-Daten (auf 9999999 setzen).',
                },
            },

            cancel: 'Abbrechen',
            back: 'Zurück',
            // TODO: Translate
            import_from_file: 'Import from File',
            empty_diagram: 'Leere Datenbank',
            continue: 'Weiter',
            import: 'Importieren',
        },

        share_diagram_dialog: {
            title: 'Diagramm teilen',
            description:
                'Laden Sie Mitarbeitende mit Bearbeiter- oder Leserzugriff ein. Sie benötigen bereits ein FoxalDB-Konto.',
            share_button: 'Teilen',
            empty_members: 'Noch keine Mitarbeitenden.',
            remove: 'Entfernen',
            roles: {
                owner: 'Eigentümer',
                editor: 'Bearbeiter',
                viewer: 'Leser',
            },
            add_member: {
                title: 'Mitarbeitenden hinzufügen',
                email_label: 'E-Mail',
                email_placeholder: 'E-Mail-Adresse',
                add: 'Hinzufügen',
                adding: 'Wird hinzugefügt…',
                cancel: 'Abbrechen',
            },
            errors: {
                load_failed: 'Mitarbeitende konnten nicht geladen werden.',
                add_failed: 'Mitarbeitende konnte nicht hinzugefügt werden.',
            },
        },

        diagram_role: {
            owner: 'Inhaber',
            editor: 'Bearbeiter',
            viewer: 'Betrachter',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Datenbank öffnen',
            description:
                'Wählen Sie das Datenbanksystem für Ihr neues Diagramm.',
            table_columns: {
                name: 'Name',
                created_at: 'Erstellt am',
                last_modified: 'Zuletzt geändert',
                tables_count: 'Tabellen',
            },
            cancel: 'Abbrechen',
            open: 'Öffnen',
            new_database: 'Neue Datenbank',

            diagram_actions: {
                open: 'Öffnen',
                duplicate: 'Duplizieren',
                delete: 'Löschen',
            },
        },

        export_wizard: {
            title: 'Exportieren',
            description:
                'Wählen Sie ein Format zum Exportieren Ihres Diagramms.',
            back: 'Zurück',
            export: 'Exportieren',
            sql: {
                target_step: {
                    title: 'SQL exportieren',
                    description:
                        'Wählen Sie eine Zieldatenbank für Ihr {{database}}-Diagramm.',
                    source_label: 'Quelldatenbank: {{database}}',
                    same_dialect_description:
                        'Als {{database}}-DDL exportieren',
                    cross_dialect_description:
                        'Von {{source}} nach {{target}} konvertieren',
                },
                unsupported_source: {
                    title: 'SQL-Export ist für {{database}} nicht verfügbar',
                    description:
                        'Deterministischer SQL-Export wird für diesen Datenbanktyp in FoxalDB nicht unterstützt.',
                },
                preview_step: {
                    title: 'SQL-Vorschau',
                    description:
                        'Überprüfen Sie das generierte {{database}}-Skript.',
                    target_label: 'Ziel: {{database}}',
                    generating: '{{database}}-SQL wird generiert...',
                    download: 'SQL herunterladen',
                    error: 'SQL konnte nicht generiert werden. Bitte versuchen Sie es erneut.',
                    empty: 'Für das aktuelle Diagramm wurde kein SQL generiert.',
                },
            },
            sections: {
                database: 'Datenbank',
                framework: 'Framework',
                portable: 'Schema',
                visual: 'Visuell',
            },
            targets: {
                unsupported_framework:
                    'Export {{framework}} nicht kompatibel mit der Datenbank des Diagramms',
                sql: {
                    title: 'SQL',
                    description:
                        'DDL-Skript der Datenbank für das aktuelle Diagramm',
                    description_generic: 'Datenbank-DDL-Skript',
                },
                dbml: {
                    title: 'DBML',
                    description: 'Portable DBML-Schemadatei',
                    coming_soon:
                        'Dateiexport demnächst verfügbar. DBML in der Seitenleiste anzeigen und kopieren.',
                },
                framework: {
                    coming_soon:
                        'Für einen zukünftigen Export-Meilenstein geplant.',
                },
                diagram_json: {
                    title: 'JSON',
                    description: 'Portable FoxalDB-Diagrammdatei',
                },
                laravel: {
                    title: 'Laravel',
                    description: 'ZIP-Archiv mit Laravel-Migrationen',
                },
                prisma: {
                    title: 'Prisma',
                    description: 'Prisma-Schema-Export',
                },
                ef_core: {
                    title: 'EF Core',
                    description: 'Entity Framework Core-Export',
                },
                rails: {
                    title: 'Rails',
                    description: 'Ruby-on-Rails-Schema-Export',
                },
                django: {
                    title: 'Django',
                    description: 'Django-6.1-App-Export zum direkten Einbinden',
                },
                drizzle: {
                    title: 'Drizzle',
                    description: 'Drizzle-0.45-Schema-Paketexport',
                },
                png: {
                    title: 'PNG',
                    description: 'Rasterbild',
                },
                jpg: {
                    title: 'JPG',
                    description: 'Rasterbild',
                },
                svg: {
                    title: 'SVG',
                    description: 'SVG-Momentaufnahme des Diagramms',
                },
            },
            dbml: {
                preview_step: {
                    description: 'Überprüfen Sie das generierte DBML-Schema.',
                    generating: 'DBML wird generiert...',
                    download: 'DBML herunterladen',
                    error: 'DBML konnte nicht generiert werden. Bitte versuchen Sie es erneut.',
                    empty: 'Für das aktuelle Diagramm wurde kein DBML generiert.',
                },
            },
            json: {
                download_step: {
                    description:
                        'Exportieren Sie eine portable Kopie dieses Diagramms.',
                    explanation:
                        'Das vollständige Diagramm wird exportiert. Das Importieren dieser Datei erstellt ein neues Diagramm; das aktuelle Diagramm wird nicht überschrieben.',
                    filename_label: 'Dateiname: {{filename}}',
                    download: 'JSON herunterladen',
                    loading: 'JSON-Vorschau wird geladen...',
                },
            },
            visual: {
                options_step: {
                    description:
                        'Wählen Sie, wie dieses {{format}}-Bild exportiert werden soll.',
                    explanation:
                        'Exportieren Sie ein Bild des aktuell dargestellten Diagramms.',
                    filename_label: 'Dateiname: {{filename}}',
                    extent_label: 'Exportbereich',
                    extent_diagram: 'Vollständiges Diagramm',
                    extent_diagram_description:
                        'Das gesamte aktuell dargestellte Diagramm einschließen, auch Tabellen außerhalb der aktuellen Ansicht.',
                    extent_viewport: 'Aktuelle Ansicht',
                    extent_viewport_description:
                        'Nur das exportieren, was derzeit auf der Zeichenfläche sichtbar ist.',
                    scale_label: 'Skalierung',
                    scale_description:
                        'Multipliziert die Exportauflösung.\n2x verdoppelt Breite und Höhe in Pixeln.',
                    scale_1x: '1x',
                    scale_2x: '2x',
                    scale_4x: '4x',
                    pattern: 'Hintergrundmuster einschließen',
                    pattern_description:
                        'Ein dezentes Gittermuster zum Hintergrund hinzufügen.',
                    transparent: 'Transparenter Hintergrund',
                    transparent_description:
                        'PNG ohne einfarbigen Hintergrund exportieren.',
                    svg_limitation:
                        'Dieses SVG ist eine Browser-Momentaufnahme des Diagramms,\nkeine vollständig bearbeitbare Vektordatei.',
                    svg_limitation_aria: 'Hinweise zu SVG-Exportbeschränkungen',
                    export: 'Exportieren',
                    generating: 'Bild wird erzeugt...',
                    error: 'Das Bild konnte nicht exportiert werden. Bitte erneut versuchen.',
                    error_canvas:
                        'Die Diagramm-Zeichenfläche zum Exportieren wurde nicht gefunden.',
                    error_too_large:
                        'Dieses Diagramm ist zu groß für den Export mit {{scale}}. Verringern Sie die Skalierung oder exportieren Sie die aktuelle Ansicht.',
                    error_empty:
                        'Auf der Zeichenfläche gibt es nichts zu exportieren.',
                },
            },
            prisma: {
                unsupported_database:
                    'Prisma-Export ist für den aktuellen Datenbanktyp nicht verfügbar.',
                version_step: {
                    title: 'Prisma-Version',
                    description:
                        'Wählen Sie die Prisma-Hauptversion für Ihren schema.prisma-Export.',
                    prisma_7: 'Prisma 7',
                    prisma_7_recommended: 'Empfohlen',
                    prisma_6: 'Prisma 6',
                    continue: 'Weiter',
                },
                preview_step: {
                    description: 'Überprüfen Sie das generierte Prisma-Schema.',
                    generating: 'Prisma-Schema wird generiert...',
                    download: 'schema.prisma herunterladen',
                    generation_error:
                        'Prisma-Schema konnte nicht generiert werden. Bitte erneut versuchen.',
                    empty: 'Für das aktuelle Diagramm wurde kein Prisma-Schema generiert.',
                    limitations: 'Einschränkungen',
                    errors: {
                        unsupported_database:
                            'Prisma-Export wird für diesen Datenbanktyp nicht unterstützt.',
                        empty_diagram:
                            'Das Diagramm enthält keine exportierbaren Tabellen.',
                        invalid_primary_key:
                            'Eine Tabelle hat eine ungültige Primärschlüsselkonfiguration.',
                        unsupported_structural_field:
                            'Ein Primär- oder Fremdschlüssel verwendet einen nicht unterstützten Feldtyp.',
                        invalid_enum:
                            'Eine Enum-Definition konnte nicht exportiert werden.',
                    },
                    notes: {
                        view_skipped:
                            'Datenbankansichten werden nicht in Prisma-Schemas exportiert.',
                        schema_namespace_unsupported:
                            'Tabellenschemata/Namespaces werden in diesem Export nicht abgebildet.',
                        unsupported_field_omitted:
                            'Einige nicht unterstützte Felder wurden ausgelassen.',
                        unsupported_default_omitted:
                            'Einige nicht unterstützte Standardwerte wurden ausgelassen.',
                        unsupported_index_omitted:
                            'Einige Indizes wurden ausgelassen.',
                        relation_skipped:
                            'Eine Beziehung konnte nicht exportiert werden.',
                        relation_degraded:
                            'Eine Beziehung wurde mit reduzierter Genauigkeit exportiert.',
                        composite_fk_unsupported:
                            'Zusammengesetzte Fremdschlüssel werden nicht unterstützt.',
                        many_to_many_label_only:
                            'N:M-Beziehungen ohne Verknüpfungstabelle werden nur als Beschriftung exportiert.',
                        set_null_omitted:
                            'ON DELETE SET NULL wurde ausgelassen, wo nicht unterstützt.',
                        enum_skipped:
                            'Ein Enum konnte nicht exportiert werden.',
                        composite_type_skipped:
                            'Ein zusammengesetzter Typ konnte nicht exportiert werden.',
                    },
                    notes_grouped: {
                        schema_namespace_unsupported:
                            'Tabellenschemata/Namespaces werden in diesem Export nicht abgebildet. ({{count}} Tabellen)',
                        relation_skipped:
                            'Einige Beziehungen konnten nicht exportiert werden. ({{count}})',
                        relation_degraded:
                            'Einige Beziehungen wurden mit reduzierter Genauigkeit exportiert. ({{count}})',
                        composite_fk_unsupported:
                            'Zusammengesetzte Fremdschlüssel werden nicht unterstützt. ({{count}})',
                        many_to_many_label_only:
                            'Many-to-Many-Beziehungen ohne Verknüpfungstabelle werden nur als Beschriftung exportiert. ({{count}})',
                        set_null_omitted:
                            'ON DELETE SET NULL wurde dort weggelassen, wo es nicht unterstützt wird. ({{count}})',
                        view_skipped:
                            'Datenbankansichten werden nicht in Prisma-Schemata exportiert. ({{count}})',
                        unsupported_field_omitted:
                            'Einige nicht unterstützte Felder wurden weggelassen. ({{count}})',
                        unsupported_default_omitted:
                            'Einige nicht unterstützte Standardwerte wurden weggelassen. ({{count}})',
                        unsupported_index_omitted:
                            'Einige Indizes wurden weggelassen. ({{count}})',
                        enum_skipped:
                            'Einige Enumerationen konnten nicht exportiert werden. ({{count}})',
                        composite_type_skipped:
                            'Einige zusammengesetzte Typen konnten nicht exportiert werden. ({{count}})',
                        with_count: '{{message}} ({{count}})',
                    },
                },
            },
            ef_core: {
                unsupported_database:
                    'Der EF-Core-Export ist für den aktuellen Datenbanktyp nicht verfügbar.',
                options_step: {
                    description: '{{provider}} · EF Core 10 (.NET 10)',
                    export_info_aria: 'Über diesen EF-Core-Export',
                    export_info:
                        'Dieser Export erzeugt ein EF-Core-10-Modellprojekt (.NET 10).\nMigrationen sind nicht enthalten.\nErstellen Sie sie lokal mit der EF-Core-CLI aus dem exportierten Projekt.',
                    explanation:
                        'Exportieren Sie ein EF-Core-10-Modellprojekt (.NET 10). Der Datenbankanbieter wird aus dem aktuellen Diagramm abgeleitet. Es werden keine Migrationen erzeugt; Sie können sie lokal aus dem exportierten Projekt erstellen.',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'Anbieter: {{provider}}',
                    migrations_not_generated:
                        'Dieser Export enthält keine Migrationen. Verwenden Sie das erzeugte Projekt, um Migrationen lokal mit der EF-Core-CLI zu erstellen.',
                    namespace: 'Namespace',
                    namespace_placeholder: 'Acme.Catalog',
                    namespace_help:
                        'Wurzel-C#-Namespace für das erzeugte Projekt.\nLeer lassen, damit der Server einen Namen aus dem Diagrammnamen wählt.',
                    namespace_help_aria: 'Hilfe zum Namespace',
                    db_context: 'DbContext',
                    db_context_placeholder: 'CatalogDbContext',
                    db_context_help:
                        'Name der DbContext-Klasse.\nLeer lassen, um AppDbContext zu verwenden.',
                    db_context_help_aria: 'Hilfe zum DbContext',
                    export: 'Exportieren',
                    generating: 'EF-Core-Projekt wird erzeugt…',
                    error_rate_limited:
                        'Zu viele Exportanfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
                    error_unexpected:
                        'Das EF-Core-Projekt konnte nicht exportiert werden. Bitte versuchen Sie es erneut.',
                    error_semantic:
                        'Das EF-Core-Projekt konnte nicht erzeugt werden.',
                    error_unauthenticated:
                        'Sie müssen angemeldet sein, um EF-Core-Projekte zu exportieren.',
                },
                result_step: {
                    description:
                        'Überprüfen Sie das generierte EF Core-Projekt.',
                    success: 'EF-Core-Projekt erzeugt.',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'Anbieter: {{provider}}',
                    generated_files: 'Erzeugte Dateien ({{count}})',
                    notes: 'Hinweise',
                    download_zip: 'ZIP herunterladen',
                    error_unsafe_path:
                        'Der Export enthält einen unsicheren Dateipfad und wurde nicht heruntergeladen.',
                    error_empty_files: 'Der Export enthielt keine Dateien.',
                },
            },
            rails: {
                unsupported_database:
                    'Der Rails-Export ist für den aktuellen Datenbanktyp nicht verfügbar.',
                result_step: {
                    description: '{{provider}} · Rails 8.1',
                    export_info_aria: 'Über diesen Rails-Export',
                    export_info:
                        'Dieser Export ist eine aktuelle Schema-Basis für Rails 8.1, keine rekonstruierte Migrationshistorie. Wenden Sie ihn gemäß der erzeugten README auf eine neue oder vorhandene Rails-App an.',
                    explanation:
                        'Dieser Export ist eine aktuelle Schema-Basis für Rails 8.1, keine rekonstruierte Migrationshistorie. Wenden Sie ihn gemäß der erzeugten README auf eine neue oder vorhandene Rails-App an.',
                    rails_8_1: 'Rails 8.1',
                    provider_label: 'Anbieter: {{provider}}',
                    generating: 'Rails-Paket wird erzeugt…',
                    success: 'Rails-8.1-Paket erzeugt.',
                    generated_files: 'Erzeugte Dateien ({{count}})',
                    notes_heading: 'Hinweise',
                    notes: railsExportNoteMessages,
                    download_zip: 'ZIP herunterladen',
                    retry: 'Erneut versuchen',
                    error_semantic:
                        'Das Rails-Paket konnte nicht erzeugt werden.',
                    error_unauthenticated:
                        'Sie müssen angemeldet sein, um Rails-Pakete zu exportieren.',
                    error_invalid_request:
                        'Das Diagramm konnte nicht exportiert werden. Es ist möglicherweise ungültig oder zu groß.',
                    error_rate_limited:
                        'Zu viele Exportanfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
                    error_unexpected:
                        'Das Rails-Paket konnte nicht exportiert werden. Bitte versuchen Sie es erneut.',
                    error_unsafe_path:
                        'Der Export enthält einen unsicheren Dateipfad und wurde nicht heruntergeladen.',
                    error_empty_files: 'Der Export enthielt keine Dateien.',
                    error_invalid_package:
                        'Das erzeugte Paket ist ungültig und wurde nicht heruntergeladen.',
                },
            },
            django: {
                unsupported_database:
                    'Der Django-Export unterstützt derzeit PostgreSQL, MySQL, MariaDB und SQLite.',
                result_step: {
                    description: '{{provider}} · Django {{version}}',
                    export_info_aria: 'Über diesen Django-Export',
                    export_info:
                        'Dieser Export ist eine Django-App zum direkten Einbinden (`foxaldb_models`). 0001_initial.py ist eine Ausgangsmigration des aktuellen Schemas, keine rekonstruierte Django-Migrationshistorie. Eine Laufzeitvalidierung gegen Django 6.1 wurde nicht durchgeführt.',
                    explanation:
                        'Dieser Export ist eine Django-App zum direkten Einbinden (`foxaldb_models`). 0001_initial.py ist eine Ausgangsmigration des aktuellen Schemas, keine rekonstruierte Django-Migrationshistorie. Eine Laufzeitvalidierung gegen Django 6.1 wurde nicht durchgeführt.',
                    django_version: 'Django {{version}}',
                    provider_label: 'Anbieter: {{provider}}',
                    package_type:
                        'Paket: Django-App zum direkten Einbinden (`foxaldb_models`)',
                    generating: 'Django-Paket wird erzeugt…',
                    success: 'Django-6.1-Paket erzeugt.',
                    generated_files: 'Erzeugte Dateien ({{count}})',
                    notes_heading: 'Hinweise',
                    warnings_heading: 'Warnungen ({{count}})',
                    adaptations_heading_one: 'Technische Anpassung',
                    adaptations_heading_other:
                        'Technische Anpassungen ({{count}})',
                    path_label: 'Pfad: {{path}}',
                    notes: djangoExportNoteMessages,
                    download_zip: 'ZIP herunterladen',
                    retry: 'Erneut versuchen',
                    error_semantic:
                        'Das Django-Paket konnte nicht erzeugt werden.',
                    error_unauthenticated:
                        'Sie müssen angemeldet sein, um Django-Pakete zu exportieren.',
                    error_invalid_request:
                        'Das Diagramm konnte nicht exportiert werden. Es ist möglicherweise ungültig oder zu groß.',
                    error_rate_limited:
                        'Zu viele Exportanfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
                    error_unexpected:
                        'Der Django-Export ist auf dem Server fehlgeschlagen. Bitte versuchen Sie es erneut.',
                    error_network:
                        'Der Server ist nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
                    error_unsafe_path:
                        'Der Export enthält einen unsicheren Dateipfad und wurde nicht heruntergeladen.',
                    error_empty_files: 'Der Export enthielt keine Dateien.',
                    error_invalid_package:
                        'Das erzeugte Paket ist ungültig und wurde nicht heruntergeladen.',
                    errors: {
                        unsupported_database:
                            'Der Django-Export ist für diesen Datenbanktyp nicht verfügbar.',
                        empty_diagram:
                            'Das Diagramm hat keine exportierbaren Tabellen.',
                        unsupported_structural_field:
                            'Ein Primärschlüsselfeld auf „{{path}}“ kann in Django nicht dargestellt werden.',
                        mysql_catalog_collision:
                            'MySQL-Kataloge kollidieren nach Entfernen des Katalogs für „{{path}}“.',
                        mariadb_catalog_collision:
                            'MariaDB-Kataloge kollidieren nach Entfernen des Katalogs für „{{path}}“.',
                    },
                },
            },
            drizzle: {
                unsupported_database:
                    'Der Drizzle-Export unterstützt derzeit PostgreSQL, MySQL, MariaDB und SQLite.',
                result_step: {
                    description:
                        '{{provider}} · drizzle-orm {{orm}} / drizzle-kit {{kit}}',
                    export_info_aria: 'Über diesen Drizzle-Export',
                    export_info:
                        'Dieser Export ist ein Drizzle-Schema-Paket. schema.ts ist die Quelle der Wahrheit. drizzle.config.ts ist ohne Zugangsdaten (nur Dialekt, Schema-Pfad und Ausgabeverzeichnis). Die SQL-Migrationshistorie wird nicht rekonstruiert. Eine Laufzeitprüfung mit drizzle-kit wurde nicht durchgeführt.',
                    explanation:
                        'Dieser Export ist ein Drizzle-Schema-Paket. schema.ts ist die Quelle der Wahrheit. drizzle.config.ts ist ohne Zugangsdaten (nur Dialekt, Schema-Pfad und Ausgabeverzeichnis). Die SQL-Migrationshistorie wird nicht rekonstruiert. Eine Laufzeitprüfung mit drizzle-kit wurde nicht durchgeführt.',
                    drizzle_version:
                        'drizzle-orm {{orm}} / drizzle-kit {{kit}}',
                    provider_label: 'Anbieter: {{provider}}',
                    package_type:
                        'Paket: Drizzle-Schema (schema.ts + drizzle.config.ts)',
                    generating: 'Drizzle-Paket wird erzeugt…',
                    success: 'Drizzle-Paket erzeugt.',
                    generated_files: 'Erzeugte Dateien ({{count}})',
                    notes_heading: 'Hinweise',
                    warnings_heading: 'Warnungen ({{count}})',
                    adaptations_heading_one: 'Technische Anpassung',
                    adaptations_heading_other:
                        'Technische Anpassungen ({{count}})',
                    path_label: 'Pfad: {{path}}',
                    unknown_note:
                        'Ein zusätzlicher Exporthinweis wurde zurückgegeben und konnte nicht lokalisiert werden.',
                    notes: drizzleExportNoteMessages,
                    download_zip: 'ZIP herunterladen',
                    retry: 'Erneut versuchen',
                    error_semantic:
                        'Das Drizzle-Paket konnte nicht erzeugt werden.',
                    error_unauthenticated:
                        'Sie müssen angemeldet sein, um Drizzle-Pakete zu exportieren.',
                    error_invalid_request:
                        'Das Diagramm konnte nicht exportiert werden. Es ist möglicherweise ungültig oder zu groß.',
                    error_rate_limited:
                        'Zu viele Exportanfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
                    error_unexpected:
                        'Der Drizzle-Export ist auf dem Server fehlgeschlagen. Bitte versuchen Sie es erneut.',
                    error_network:
                        'Der Server ist nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
                    error_unsafe_path:
                        'Der Export enthält einen unsicheren Dateipfad und wurde nicht heruntergeladen.',
                    error_empty_files: 'Der Export enthielt keine Dateien.',
                    error_invalid_package:
                        'Das erzeugte Paket ist ungültig und wurde nicht heruntergeladen.',
                    errors: {
                        unsupported_database:
                            'Der Drizzle-Export ist für diesen Datenbanktyp nicht verfügbar.',
                        empty_diagram:
                            'Das Diagramm hat keine exportierbaren Tabellen.',
                        unsupported_structural_field:
                            'Ein Primärschlüssel- oder Strukturfeld auf „{{path}}“ kann in Drizzle nicht dargestellt werden.',
                        mysql_catalog_collision:
                            'Mehrere MySQL-Kataloge enthalten dieselbe physische Tabelle „{{path}}“ und können nicht sicher zu einem Drizzle-MySQL-Schema zusammengeführt werden.',
                        mariadb_catalog_collision:
                            'Mehrere MariaDB-Kataloge enthalten dieselbe physische Tabelle „{{path}}“ und können nicht sicher zu einem Drizzle-MariaDB-Schema zusammengeführt werden.',
                    },
                },
            },
            laravel: {
                options_step: {
                    description:
                        'Wählen Sie, wie Laravel-Migrationen exportiert werden sollen.',
                    explanation:
                        'Erzeugen Sie ein ZIP mit Laravel-Migrationsdateien aus dem aktuellen Diagramm.',
                    filename_label: 'Dateiname: {{filename}}',
                    laravel_version: 'Laravel-Version',
                    include_indexes: 'Tabellenindizes einschließen',
                    include_indexes_description:
                        'Explizite Tabellenindex-Definitionen exportieren.\nEindeutige Einschränkungen auf Feldebene werden immer einbezogen.',
                    include_foreign_keys: 'Fremdschlüssel einschließen',
                    include_foreign_keys_description:
                        'Separate Migrationsdateien für Fremdschlüssel exportieren.',
                    export: 'Exportieren',
                    generating: 'Laravel-Migrationen werden erzeugt...',
                    error: 'Laravel-Migrationen konnten nicht exportiert werden. Bitte erneut versuchen.',
                    error_unauthenticated:
                        'Sie müssen angemeldet sein, um Laravel-Migrationen zu exportieren.',
                    error_forbidden:
                        'Sie haben keine Berechtigung, dieses Diagramm zu exportieren.',
                    error_not_found: 'Dieses Diagramm wurde nicht gefunden.',
                    error_empty:
                        'Dieses Diagramm hat keine exportierbaren Tabellen.',
                    error_invalid:
                        'Das Diagramm konnte nicht exportiert werden. Prüfen Sie das Schema und versuchen Sie es erneut.',
                    error_network:
                        'Der Server war nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
                },
            },
        },

        export_dialog: {
            title: 'Exportieren',
            description:
                'Wählen Sie ein Format zum Exportieren Ihres Diagramms.',
            schema_code_section: 'Schema / Code',
            visual_section: 'Visuell',
            sql: {
                title: 'SQL',
                description:
                    'DDL-Skript der Datenbank für das aktuelle Diagramm',
                description_generic: 'Datenbank-DDL-Skript',
            },
            dbml: {
                title: 'DBML',
                coming_soon:
                    'Dateiexport folgt bald. DBML in der Seitenleiste anzeigen und kopieren.',
            },
            diagram_json: {
                title: 'Diagramm-JSON',
                description: 'Portable FoxalDB-Diagrammdatei',
            },
            laravel_migrations: {
                title: 'Laravel-Migrationen',
                description: 'ZIP-Archiv mit Laravel-Migrationen',
            },
            png: {
                title: 'PNG',
                description: 'Rasterbild',
            },
            jpg: {
                title: 'JPG',
                description: 'Rasterbild',
            },
            svg: {
                title: 'SVG',
                description: 'Vektorbild',
            },
        },

        export_sql_dialog: {
            title: 'SQL exportieren',
            description:
                'Exportieren Sie das Schema Ihres Diagramms in ein {{databaseType}} Skript',
            close: 'Schließen',
            loading: {
                text: 'Die KI generiert SQL für {{databaseType}}...',
                description: 'Dies sollte bis zu 30 Sekunden dauern.',
            },
            error: {
                message:
                    'Fehler beim Generieren des SQL-Skripts. Bitte versuchen Sie es später erneut oder <0>kontaktieren Sie uns</0>.',
                description:
                    'Verwenden Sie Ihren OPENAI_TOKEN, siehe Anleitung <0>hier</0>.',
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
            title: 'Beziehung erstellen',
            primary_table: 'Primäre Tabelle',
            primary_field: 'Primäres Feld',
            referenced_table: 'Referenzierte Tabelle',
            referenced_field: 'Referenziertes Feld',
            primary_table_placeholder: 'Tabelle auswählen',
            primary_field_placeholder: 'Feld auswählen',
            referenced_table_placeholder: 'Tabelle auswählen',
            referenced_field_placeholder: 'Feld auswählen',
            no_tables_found: 'Keine Tabellen gefunden',
            no_fields_found: 'Keine Felder gefunden',
            create: 'Erstellen',
            cancel: 'Abbrechen',
        },

        import_database_dialog: {
            title: 'In aktuelles Diagramm importieren',
            import_schema: {
                title: 'Schema importieren',
                import: 'Importieren',
                cancel: 'Abbrechen',
                mismatch: {
                    title: 'Dieses Schema sieht wie {{detected}} aus, aber dieses Diagramm ist {{selected}}.',
                    description:
                        'Import über verschiedene Datenbanken wird noch nicht unterstützt.',
                    cancel: 'Abbrechen',
                },
                ambiguous: {
                    description:
                        'Der SQL-Dialekt konnte nicht automatisch erkannt werden. Bestätigen Sie, wie dieses Schema für das aktuelle {{selected}}-Diagramm interpretiert werden soll.',
                },
            },
            override_alert: {
                title: 'Datenbank importieren',
                content: {
                    alert: 'Das Importieren dieses Diagramms wird vorhandene Tabellen und Beziehungen beeinflussen.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> neue Tabellen werden hinzugefügt.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> neue Beziehungen werden erstellt.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> Tabellen werden überschrieben.',
                    proceed: 'Möchten Sie fortfahren?',
                },
                import: 'Importieren',
                cancel: 'Abbrechen',
            },
        },

        new_table_schema_dialog: {
            title: 'Schema auswählen',
            description:
                'Mehrere Schemas sind derzeit angezeigt. Wählen Sie eines für die neue Tabelle aus.',
            cancel: 'Abbrechen',
            confirm: 'Bestätigen',
        },

        update_table_schema_dialog: {
            title: 'Schema ändern',
            description: 'Schema der Tabelle "{{tableName}}" ändern',
            cancel: 'Abbrechen',
            confirm: 'Ändern',
        },
        create_table_schema_dialog: {
            title: 'Neues Schema erstellen',
            description:
                'Es existieren noch keine Schemas. Erstellen Sie Ihr erstes Schema, um Ihre Tabellen zu organisieren.',
            create: 'Erstellen',
            cancel: 'Abbrechen',
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
                    'Beim Export ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
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
            one_to_one: 'Ein zu Eins (1:1)',
            one_to_many: 'Ein zu Viele (1:n)',
            many_to_one: 'Viele zu Eins (n:1)',
            many_to_many: 'Viele zu Viele (n:m)',
        },

        canvas_context_menu: {
            new_table: 'Neue Tabelle',
            new_view: 'Neue Ansicht',
            new_relationship: 'Neue Beziehung',
            new_area: 'Neuer Bereich',
            new_note: 'Neue Notiz',
        },

        table_node_context_menu: {
            edit_table: 'Tabelle bearbeiten',
            duplicate_table: 'Tabelle duplizieren',
            delete_table: 'Tabelle löschen',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'In Bereich verschieben',
            no_area: 'Kein Bereich',
        },

        canvas: {
            all_tables_hidden: 'Alle Tabellen sind ausgeblendet',
            show_all_tables: 'Alle anzeigen',
        },

        canvas_filter: {
            title: 'Tabellen filtern',
            search_placeholder: 'Tabellen suchen...',
            group_by_schema: 'Nach Schema gruppieren',
            group_by_area: 'Nach Bereich gruppieren',
            no_tables_found: 'Keine Tabellen gefunden',
            empty_diagram_description:
                'Erstellen Sie eine Tabelle, um zu beginnen',
            no_tables_description:
                'Versuchen Sie, Ihre Suche oder Filter anzupassen',
            clear_filter: 'Filter löschen',
        },

        // TODO: Add translations
        snap_to_grid_tooltip: 'Snap to Grid (Hold {{key}})',

        editing_conflict: {
            one: '{{name}} bearbeitet dies ebenfalls.',
            two: '{{name1}} und {{name2}} bearbeiten dies ebenfalls.',
            many: '{{name}} und {{count}} weitere bearbeiten dies ebenfalls.',
            fallback_name: 'Kollaborator',
            last_writer_wins:
                'Änderungen sind nicht gesperrt. Die zuletzt gespeicherte Bearbeitung gewinnt.',
        },

        tool_tips: {
            double_click_to_edit: 'Doppelklicken zum Bearbeiten',
        },

        auth: {
            dialog: {
                account_title: 'Konto',
                login_title: 'Bei FoxalDB anmelden',
                register_title: 'FoxalDB-Konto erstellen',
                account_description: 'Verwalten Sie Ihre aktuelle Sitzung.',
                login_description:
                    'Melden Sie sich an, um mehr Diagramme zu speichern und zu synchronisieren.',
                register_description:
                    'Erstellen Sie ein Konto, um mehr Diagramme zu speichern.',
                checking_session: 'Sitzung wird geprüft...',
                continue_without_account: 'Ohne Konto fortfahren',
            },
            login: {
                title: 'Anmelden',
                email_label: 'E-Mail',
                password_label: 'Passwort',
                submit: 'Anmelden',
                submitting: 'Anmeldung...',
                switch_to_register: 'Registrieren',
                no_account: 'Noch kein Konto?',
            },
            register: {
                title: 'Registrieren',
                first_name_label: 'Vorname',
                last_name_label: 'Nachname',
                email_label: 'E-Mail',
                password_label: 'Passwort',
                password_confirmation_label: 'Passwort bestätigen',
                submit: 'Konto erstellen',
                submitting: 'Konto wird erstellt...',
                switch_to_login: 'Anmelden',
                already_have_account: 'Sie haben bereits ein Konto?',
            },
            account: {
                signed_in_as: 'Angemeldet als',
                logout: 'Abmelden',
                back_to_editor: 'Zurück zum Editor',
            },
            settings: {
                title: 'Benutzereinstellungen',
                description:
                    'Aktualisieren Sie Ihre persönlichen Daten und Ihr Passwort.',
                change_password_heading: 'Passwort ändern',
                current_password_label: 'Aktuelles Passwort',
                new_password_label: 'Neues Passwort',
                password_confirmation_label: 'Neues Passwort bestätigen',
                first_name_label: 'Vorname',
                last_name_label: 'Nachname',
                email_label: 'E-Mail-Adresse',
                submit: 'Speichern',
                submitting: 'Speichern...',
                success_title: 'Profil aktualisiert',
                success_description: 'Ihr Profil wurde gespeichert.',
            },
            nav: {
                sign_in: 'Anmelden',
                logout: 'Abmelden',
                loading: '...',
                user_menu: 'Konto',
                settings: 'Einstellungen',
                change_language: 'Sprache',
            },
            pages: {
                login_title: 'FoxalDB — Anmelden',
                register_title: 'FoxalDB — Registrieren',
                checking_session: 'Sitzung wird geprüft…',
            },
            errors: {
                first_name_required: 'Der Vorname ist erforderlich.',
                last_name_required: 'Der Nachname ist erforderlich.',
                generic: 'Etwas ist schiefgelaufen.',
            },
        },

        guest_migration_dialog: {
            title: 'Lokales Diagramm importieren?',
            description:
                'Sie haben ein Diagramm auf diesem Gerät gespeichert. Importieren Sie es in Ihr Konto, um von jedem Ort darauf zuzugreifen.',
            import: 'In Konto importieren',
            continue_without_import: 'Ohne Import fortfahren',
        },

        guest_migration_errors: {
            import_failed:
                'Das lokale Diagramm konnte nicht importiert werden. Ihre lokale Kopie wurde beibehalten.',
            activation_failed:
                'Das Diagramm wurde erstellt, konnte aber nicht geöffnet werden. Ihre lokale Kopie wurde beibehalten.',
            cleanup_failed:
                'Ihr Diagramm wurde importiert, aber die lokale Kopie konnte nicht entfernt werden. Sie können sie manuell löschen.',
            check_failed: 'Das lokale Diagramm konnte nicht gelesen werden.',
        },

        dbml: {
            ref_format: {
                label: 'Referenzstil',
                inline: 'Inline-Refs',
                standard: 'Standard-Refs',
                show_inline: 'Inline-Refs anzeigen',
                show_standard: 'Standard-Refs anzeigen',
                hint: 'Wählen Sie, wie Beziehungen im exportierten DBML geschrieben werden.',
            },
        },

        language_select: {
            change_language: 'Sprache',
        },

        on: 'Ein',
        off: 'Aus',
    },
};

export const deMetadata: LanguageMetadata = {
    name: 'German (Germany)',
    nativeName: 'Deutsch (Deutschland)',
    code: 'de',
    countryCode: 'de',
};
