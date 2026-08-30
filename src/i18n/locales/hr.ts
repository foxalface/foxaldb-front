import type { LanguageMetadata, LanguageTranslation } from '../types';

export const hr: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Novi',
            browse: 'Otvori',
            tables: 'Tablice',
            refs: 'Refs',
            dependencies: 'Ovisnosti',
            custom_types: 'Prilagođeni Tipovi',
            conversations: 'Razgovori',
            conversations_unread_aria:
                '{{count}} nepročitanih poruka u razgovorima',
            visuals: 'Vizuali',
            activities: 'Aktivnost',
            share: 'Dijeli',
        },
        menu: {
            actions: {
                actions: 'Akcije',
                new: 'Novi...',
                browse: 'Sve baze podataka...',
                save: 'Spremi',
                import: 'Uvezi',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Izvezi SQL',
                export_as: 'Izvezi kao',
                delete_diagram: 'Izbriši',
            },
            edit: {
                edit: 'Uredi',
                undo: 'Poništi',
                redo: 'Ponovi',
                clear: 'Očisti',
            },
            view: {
                view: 'Prikaz',
                show_sidebar: 'Prikaži bočnu traku',
                hide_sidebar: 'Sakrij bočnu traku',
                hide_cardinality: 'Sakrij kardinalnost',
                show_cardinality: 'Prikaži kardinalnost',
                hide_field_attributes: 'Sakrij atribute polja',
                show_field_attributes: 'Prikaži atribute polja',
                zoom_on_scroll: 'Zumiranje pri skrolanju',
                show_views: 'Pogledi Baze Podataka',
                theme: 'Tema',
                show_dependencies: 'Prikaži ovisnosti',
                hide_dependencies: 'Sakrij ovisnosti',
                show_minimap: 'Prikaži mini kartu',
                hide_minimap: 'Sakrij mini kartu',
            },
            backup: {
                backup: 'Sigurnosna kopija',
                export_diagram: 'Izvezi dijagram',
                restore_diagram: 'Vrati dijagram',
            },
            help: {
                help: 'Pomoć',
                docs_website: 'Dokumentacija',
                join_discord: 'Pridružite nam se na Discordu',
            },
        },

        delete_diagram_alert: {
            title: 'Odaberite bazu podataka',
            description: 'Odaberite sustav baze podataka za novi dijagram.',
            cancel: 'Odustani',
            delete: 'Izbriši',
        },

        clear_diagram_alert: {
            title: 'Očisti dijagram',
            description:
                'Ova radnja se ne može poništiti. Ovo će trajno izbrisati sve podatke u dijagramu.',
            cancel: 'Odustani',
            clear: 'Očisti',
        },

        diagram_access: {
            removed: {
                title: 'Odaberite bazu podataka',
                description: 'Odaberite sustav baze podataka za novi dijagram.',
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
            title: 'Automatski preuredi dijagram',
            description:
                'Ova radnja će preurediti sve tablice u dijagramu. Želite li nastaviti?',
            reorder: 'Automatski preuredi',
            cancel: 'Odustani',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Kopiranje neuspješno',
                description: 'Međuspremnik nije podržan.',
            },
            failed: {
                title: 'Kopiranje neuspješno',
                description: 'Nešto je pošlo po zlu. Molimo pokušajte ponovno.',
            },
        },

        theme: {
            system: 'Sustav',
            light: 'Svijetla',
            dark: 'Tamna',
        },

        zoom: {
            on: 'Uključeno',
            off: 'Isključeno',
        },

        last_saved: 'Zadnje spremljeno',
        saved: 'Spremljeno',
        loading_diagram: 'Učitavanje dijagrama...',
        deselect_all: 'Odznači sve',
        select_all: 'Označi sve',
        delete: 'Izbriši',
        clear: 'Očisti',
        show_more: 'Prikaži više',
        show_less: 'Prikaži manje',
        copy_to_clipboard: 'Kopiraj u međuspremnik',
        copied: 'Kopirano!',

        side_panel: {
            view_all_options: 'Prikaži sve opcije...',
            tables_section: {
                tables: 'Tablice',
                add_table: 'Dodaj tablicu',
                add_view: 'Dodaj Pogled',
                filter: 'Filtriraj',
                collapse: 'Sažmi sve',
                clear: 'Očisti filter',
                no_results:
                    'Nema pronađenih tablica koje odgovaraju vašem filteru.',
                show_list: 'Prikaži popis tablica',
                show_dbml: 'Prikaži DBML uređivač',
                all_hidden: 'Sve tablice su skrivene',
                show_all: 'Prikaži sve',

                table: {
                    fields: 'Polja',
                    nullable: 'Može biti null?',
                    primary_key: 'Primarni ključ',
                    indexes: 'Indeksi',
                    check_constraints: 'Provjerna ograničenja',
                    comments: 'Komentari',
                    no_comments: 'Nema komentara',
                    add_field: 'Dodaj polje',
                    add_index: 'Dodaj indeks',
                    add_check: 'Dodaj provjeru',
                    index_select_fields: 'Odaberi polja',
                    no_types_found: 'Nema pronađenih tipova',
                    field_name: 'Naziv',
                    field_type: 'Tip',
                    field_actions: {
                        title: 'Atributi polja',
                        open_discussion: 'Otvori razgovor',
                        unique: 'Jedinstven',
                        auto_increment: 'Automatsko povećavanje',
                        character_length: 'Maksimalna dužina',
                        precision: 'Preciznost',
                        scale: 'Skala',
                        comments: 'Komentari',
                        no_comments: 'Nema komentara',
                        default_value: 'Zadana vrijednost',
                        no_default: 'Nema zadane vrijednosti',
                        delete_field: 'Izbriši polje',
                    },
                    index_actions: {
                        title: 'Atributi indeksa',
                        name: 'Naziv',
                        unique: 'Jedinstven',
                        index_type: 'Vrsta indeksa',
                        delete_index: 'Izbriši indeks',
                    },
                    check_constraint_actions: {
                        title: 'Provjerno ograničenje',
                        expression: 'Izraz',
                        delete: 'Obriši ograničenje',
                    },
                    table_actions: {
                        title: 'Radnje nad tablicom',
                        open_discussion: 'Otvori razgovor',
                        change_schema: 'Promijeni shemu',
                        add_field: 'Dodaj polje',
                        add_index: 'Dodaj indeks',
                        duplicate_table: 'Dupliciraj tablicu',
                        delete_table: 'Izbriši tablicu',
                    },
                },
                empty_state: {
                    title: 'Nema tablica',
                    description: 'Stvorite tablicu za početak',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Filtriraj',
                clear: 'Očisti filtar',
                no_results:
                    'Nije pronađena nijedna referenca koja odgovara vašem filtru.',
                collapse: 'Sažmi sve',
                add_relationship: 'Dodaj vezu',
                relationships: 'Veze',
                dependencies: 'Ovisnosti',
                relationship: {
                    relationship: 'Veza',
                    primary: 'Primarna tablica',
                    foreign: 'Povezana tablica',
                    cardinality: 'Kardinalnost',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Izbriši',
                    switch_tables: 'Zamijeni tablice',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Radnje',
                        open_discussion: 'Otvori razgovor',
                        delete_relationship: 'Izbriši',
                    },
                },
                dependency: {
                    dependency: 'Ovisnost',
                    table: 'Tablica',
                    dependent_table: 'Ovisni pogled',
                    delete_dependency: 'Izbriši',
                    dependency_actions: {
                        title: 'Radnje',
                        delete_dependency: 'Izbriši',
                    },
                },
                empty_state: {
                    title: 'Nema veze',
                    description: 'Stvorite vezu za početak',
                },
            },

            areas_section: {
                areas: 'Područja',
                add_area: 'Dodaj područje',
                filter: 'Filtriraj',
                clear: 'Očisti filter',
                no_results:
                    'Nema pronađenih područja koja odgovaraju vašem filteru.',

                area: {
                    area_actions: {
                        title: 'Radnje nad područjem',
                        edit_name: 'Uredi naziv',
                        delete_area: 'Izbriši područje',
                    },
                },
                empty_state: {
                    title: 'Nema područja',
                    description: 'Stvorite područje za početak',
                },
            },

            visuals_section: {
                visuals: 'Vizuali',
                tabs: {
                    areas: 'Područja',
                    notes: 'Bilješke',
                },
            },

            notes_section: {
                filter: 'Filtriraj',
                add_note: 'Dodaj Bilješku',
                no_results: 'Nije pronađena nijedna bilješka',
                clear: 'Očisti Filter',
                empty_state: {
                    title: 'Nema Bilješki',
                    description:
                        'Kreirajte bilješku za dodavanje tekstualnih napomena na platnu',
                },
                note: {
                    empty_note: 'Prazna bilješka',
                    note_actions: {
                        title: 'Akcije Bilješke',
                        edit_content: 'Uredi Sadržaj',
                        delete_note: 'Obriši Bilješku',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Prilagođeni tipovi',
                filter: 'Filtriraj',
                clear: 'Očisti filter',
                no_results:
                    'Nema pronađenih prilagođenih tipova koji odgovaraju vašem filteru.',
                new_type: 'Novi tip',
                empty_state: {
                    title: 'Nema prilagođenih tipova',
                    description:
                        'Prilagođeni tipovi će se pojaviti ovdje kada budu dostupni u vašoj bazi podataka',
                },
                custom_type: {
                    kind: 'Vrsta',
                    enum_values: 'Enum vrijednosti',
                    composite_fields: 'Polja',
                    no_fields: 'Nema definiranih polja',
                    no_values: 'Nema definiranih enum vrijednosti',
                    field_name_placeholder: 'Naziv polja',
                    field_type_placeholder: 'Odaberi tip',
                    add_field: 'Dodaj polje',
                    no_fields_tooltip:
                        'Nema definiranih polja za ovaj prilagođeni tip',
                    custom_type_actions: {
                        title: 'Radnje',
                        highlight_fields: 'Istakni polja',
                        clear_field_highlight: 'Ukloni isticanje',
                        delete_custom_type: 'Izbriši',
                    },
                    delete_custom_type: 'Izbriši tip',
                },
            },
            conversations_section: {
                title: 'Razgovori',
                tabs_label: 'Razgovori',
                tabs: {
                    active: 'Aktivni',
                    archives: 'Arhivirane',
                },
                loading: 'Učitavanje razgovora…',
                filter: 'Filtriraj',
                clear: 'Očisti filtar',
                no_results_title: 'Nema rezultata',
                no_results_description:
                    'Nema razgovora koji odgovaraju vašem filtru.',

                type_filter: {
                    trigger: 'Vrsta',
                    label: 'Filtriraj po vrsti',
                    trigger_aria: 'Filtriraj po vrsti razgovora',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'Pokušaj ponovno',
                dismiss: 'Dismiss',
                read_only: 'Samo za čitanje',
                deleted_user: 'Izbrisani korisnik',
                unread: {
                    badge_aria: '{{count}} nepročitanih poruka',
                },
                inactive: {
                    title: 'Razgovori unavailable',
                    description:
                        'Razgovori are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'Nema razgovora',
                    active_description: 'Stvorite razgovor za početak',
                    archives_title: 'No archived razgovori',
                    archives_description:
                        'Archived razgovori will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load razgovori',
                    load_description:
                        'Something went wrong while loading razgovori. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'Otvori razgovor',
                    start: 'Započni razgovor',
                    pending: 'Pokretanje razgovora…',
                    diagram_name: 'Dijagram',
                    open_aria: 'Otvori razgovor za {{name}}',
                    start_aria: 'Započni razgovor za {{name}}',
                    open_tooltip: 'Otvori razgovor za {{name}}',
                    start_tooltip: 'Započni razgovor za {{name}}',
                    pending_tooltip: 'Pokretanje razgovora za {{name}}…',
                    action_tooltip: 'Razgovor',
                    unavailable_description:
                        'Ne možete započeti razgovore na ovom dijagramu.',
                    errors: {
                        validation: 'Ovaj cilj nije valjan za razgovor.',
                        forbidden:
                            'Nemate dopuštenje za pokretanje ovog razgovora.',
                        not_found: 'Ovaj cilj više nije dostupan na dijagramu.',
                        conflict:
                            'Razgovor se trenutno nije mogao pokrenuti. Pokušajte ponovno.',
                        generic:
                            'Nije moguće otvoriti ovaj razgovor. Pokušajte ponovno.',
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
                    message_count: '{{count}} poruka',
                    no_messages: 'Još nema poruka',
                    last_activity: 'Zadnja aktivnost',
                    open_aria: 'Otvori razgovor za {{target}}',
                    focus_target_aria: 'Prikaži {{target}} na dijagramu',
                    author_tooltip: 'Zadnja poruka od {{name}}',
                    author_missing_tooltip: 'Nema informacija o autoru',
                    actions: {
                        menu_aria: 'Opcije razgovora',
                        open: 'Otvori',
                        delete: 'Izbriši',
                    },
                    delete_dialog: {
                        title: 'Izbrisati razgovor?',
                        description:
                            'Ovo će trajno izbrisati ovaj razgovor i sve njegove poruke.',
                        cancel: 'Odustani',
                        confirm: 'Izbriši',
                        deleting: 'Brisanje…',
                        errors: {
                            delete_failed:
                                'Nije moguće izbrisati ovaj razgovor. Pokušajte ponovno.',
                            forbidden:
                                'Nemate dopuštenje za brisanje ovog razgovora.',
                            not_found: 'Ovaj razgovor više nije dostupan.',
                        },
                    },
                },
                detail: {
                    back: 'Natrag',
                    back_aria: 'Natrag na popis razgovora',
                    loading: 'Učitavanje poruka…',
                    loading_more: 'Učitavanje starijih poruka…',
                    load_older: 'Učitaj starije poruke',
                    new_messages_badge_one: '1 nova poruka',
                    new_messages_badge_other: '{{count}} nove poruke',
                    new_messages_badge_label_one: 'nova poruka',
                    new_messages_badge_label_other: 'nove poruke',
                    new_messages_badge_aria_one: 'Idi na novu poruku',
                    new_messages_badge_aria_other:
                        'Idi na {{count}} nove poruke',
                    empty: {
                        title: 'Nema poruka',
                        description: 'Ovaj razgovor nema poruka.',
                    },
                    errors: {
                        load_title: 'Nije moguće učitati poruke',
                        load_description:
                            'Došlo je do pogreške pri učitavanju poruka. Pokušajte ponovno.',
                    },
                    archive_banner: {
                        title: 'Arhivirani razgovor',
                        description:
                            'Ovaj razgovor je samo za čitanje. Poruke se ne mogu dodavati, uređivati ni brisati.',
                    },
                    metadata: {
                        status_label: 'Status',
                        status_active: 'Aktivan',
                        status_archived: 'Arhiviran',
                        message_count_label: 'Broj poruka',
                        message_count: '{{count}} poruka',
                    },
                    message: {
                        edited: '(uređeno)',
                        edited_aria: 'Poruka je uređena',
                        day_separator: {
                            today: 'Danas',
                            yesterday: 'Jučer',
                        },
                        actions: {
                            title: 'Radnje poruke',
                            edit: 'Uredi',
                            delete: 'Izbriši',
                        },
                        reactions: {
                            add_aria: 'Dodaj reakciju',
                            add_tooltip: 'Dodaj reakciju',
                            picker_loading: 'Učitavanje birača emojija…',
                            picker_aria_label: 'Birač emojija',
                            picker_search_placeholder: 'Pretraži emoji…',
                            picker_empty: 'Nije pronađen nijedan emoji.',
                            chip_aria: 'Reakcija {{emoji}}, {{count}}',
                            preview_and_others_one: 'i još {{count}}',
                            preview_and_others_other: 'i još {{count}}',
                            errors: {
                                generic:
                                    'Reakciju nije moguće ažurirati. Pokušajte ponovno.',
                                forbidden:
                                    'Nemate dopuštenje reagirati na ovu poruku.',
                                archived:
                                    'Ovaj razgovor je arhiviran i reakcije su samo za čitanje.',
                                not_found: 'Ova poruka više nije dostupna.',
                                invalid_emoji: 'Ovaj emoji nije valjan.',
                            },
                        },
                    },
                    composer: {
                        label: 'Poruka',
                        placeholder: 'Napišite poruku…',
                        submit: 'Pošalji',
                        submitting: 'Slanje…',
                        form_aria_label: 'Nova poruka razgovora',
                        keyboard_hint:
                            'Pritisnite Enter za slanje. Shift+Enter za novi red.',
                        counter_aria_label:
                            '{{count}} od {{max}} znakova iskorišteno',
                        errors: {
                            empty: 'Unesite poruku za slanje.',
                            too_long: 'Poruke ne smiju premašiti 2000 znakova.',
                            create_failed:
                                'Poruka nije poslana. Pokušajte ponovno.',
                        },
                    },
                    edit: {
                        label: 'Poruka',
                        form_aria_label: 'Uredi poruku razgovora',
                        save: 'Spremi',
                        saving: 'Spremanje…',
                        cancel: 'Odustani',
                        counter_aria_label:
                            '{{count}} od {{max}} znakova iskorišteno',
                        errors: {
                            empty: 'Unesite poruku za spremanje.',
                            too_long: 'Poruke ne smiju premašiti 2000 znakova.',
                            update_failed:
                                'Poruka nije ažurirana. Pokušajte ponovno.',
                        },
                    },
                    delete_dialog: {
                        title: 'Izbriši poruku',
                        description:
                            'Jeste li sigurni da želite izbrisati ovu poruku? Ova radnja se ne može poništiti.',
                        cancel: 'Odustani',
                        confirm: 'Izbriši',
                        deleting: 'Brisanje…',
                        errors: {
                            delete_failed:
                                'Ova poruka nije izbrisana. Pokušajte ponovno.',
                        },
                    },
                    mutation_errors: {
                        forbidden: 'Nemate dopuštenje za promjenu ove poruke.',
                        archived:
                            'Ovaj razgovor je arhiviran i samo za čitanje.',
                        not_found:
                            'Ovaj razgovor ili poruka više nije dostupna.',
                    },
                },

                targets: {
                    diagram: 'Dijagram',
                    table: 'Tablica',
                    field: 'Polje',
                    relationship: 'Veza',
                    unknown: 'Razgovor',
                },
                target_labels: {
                    diagram: 'Dijagram',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Izbrisana tablica',
                    missing_field: 'Izbrisano polje',
                    missing_relationship: 'Izbrisana veza',
                    unknown: 'Razgovor',
                },
            },
            activities_section: {
                title: 'Aktivnost',
                filter: 'Filtriraj',
                clear: 'Očisti filtar',
                no_results:
                    'Nije pronađena aktivnost koja odgovara vašem filtru.',
                loading: 'Učitavanje aktivnosti…',
                retry: 'Pokušaj ponovno',
                type_filter: {
                    trigger: 'Vrsta',
                    label: 'Filtriraj po vrsti',
                    trigger_aria: 'Filtriraj po vrsti aktivnosti',
                },
                types: {
                    diagram: 'Dijagram',
                    table: 'Tablica',
                    field: 'Polje',
                    relationship: 'Veza',
                    note: 'Bilješka',
                    area: 'Područje',
                    dependency: 'Ovisnost',
                },
                you: 'Vi',
                unknown_user: 'Netko',
                empty_state: {
                    title: 'Još nema aktivnosti',
                    description:
                        'Započnite uređivanje da biste vidjeli nedavne promjene.',
                },
                errors: {
                    load_failed: 'Nije moguće učitati aktivnost.',
                },
                actions: {
                    add_tables: '{{user}} je dodao tablicu {{table}}',
                    remove_tables: '{{user}} je uklonio tablicu',
                    add_field: '{{user}} je dodao polje {{field}}',
                    remove_field: '{{user}} je uklonio polje',
                    update_field: '{{user}} je ažurirao polje {{field}}',
                    add_relationships: '{{user}} je dodao odnos',
                    remove_relationships: '{{user}} je uklonio odnos',
                    update_relationship: '{{user}} je ažurirao odnos',
                    add_notes: '{{user}} je dodao bilješku',
                    remove_notes: '{{user}} je uklonio bilješku',
                    add_areas: '{{user}} je dodao područje',
                    remove_areas: '{{user}} je uklonio područje',
                    add_dependencies: '{{user}} je dodao ovisnost',
                    remove_dependencies: '{{user}} je uklonio ovisnost',
                    fallback: '{{user}} je ažurirao dijagram',
                },
            },
            share_section: {
                title: 'Dijeli',
                tabs_label: 'Opcije dijeljenja',
                tabs: {
                    collaborators: 'Suradnici',
                    public_link: 'Javna poveznica',
                },
                collaborators: {
                    description:
                        'Pozovite suradnike s pristupom uređivača ili gledatelja. Već moraju imati FoxalDB račun.',
                    filter: 'Filtriraj',
                    clear: 'Očisti filtar',
                    no_results_title: 'Nema rezultata',
                    no_results_description:
                        'Nema suradnika koji odgovaraju vašem filtru.',
                    role_filter: {
                        trigger: 'Uloga',
                        label: 'Filtriraj po ulozi',
                        trigger_aria: 'Filtriraj po ulozi suradnika',
                    },
                },
                public_link: {
                    title: 'Javna poveznica',
                    description:
                        'Podijelite snimku dijagrama samo za čitanje s bilo kim tko ima poveznicu.',
                    coming_soon: 'Uskoro.',
                },
                loading: 'Učitavanje suradnika…',
                retry: 'Pokušaj ponovno',
                errors: {
                    load_failed: 'Suradnici se nisu mogli učitati.',
                },
                member_actions: {
                    title: 'Radnje suradnika',
                    trigger_aria: 'Radnje suradnika',
                    role: 'Uloga',
                    remove: 'Ukloni suradnika',
                },
            },
        },

        toolbar: {
            zoom_in: 'Uvećaj',
            zoom_out: 'Smanji',
            save: 'Spremi',
            show_all: 'Prikaži sve',
            undo: 'Poništi',
            redo: 'Ponovi',
            reorder_diagram: 'Automatski preuredi dijagram',
            highlight_overlapping_tables: 'Istakni preklapajuće tablice',
            clear_custom_type_highlight: 'Ukloni isticanje za "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Isticanje "{{typeName}}" - Kliknite za uklanjanje',
            filter: 'Filtriraj tablice',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Odaberite bazu podataka',
                description: 'Odaberite sustav baze podataka za novi dijagram.',
                search_placeholder:
                    'Pretraži sustave za upravljanje baze podataka…',
                search_no_results:
                    'Nijedan sustav za upravljanje baze podataka odgovara vašoj pretrazi.',
                clear_search: 'Očisti pretragu',
                primary_group: 'Primarne baze podataka',
                other_group: 'Ostale baze podataka',
                check_examples_long: 'Pogledaj primjere',
                check_examples_short: 'Primjeri',
            },

            choose_intent: {
                title: 'Što želite učiniti?',
                description: 'Stvorite novi dijagram za {{database}}.',
                create_empty: 'Stvori prazan dijagram',
                create_empty_description:
                    'Krenite od nule dodavanjem vlastitih tablica.',
                import: 'Uvezi',
                import_description:
                    'Iz datoteke, zalijepljenog teksta ili vaše baze.',
                back: 'Natrag',
            },

            choose_import_method: {
                title: 'Kako želite uvesti?',
                description: 'Odaberite izvor za svoj {{database}} dijagram.',
                from_file: 'Datoteka ili zalijepljeni tekst',
                from_file_description: 'SQL, DBML ili JSON dijagrama.',
                from_database: 'Postojeća baza podataka',
                from_database_description:
                    'Pokrenite upit u bazi i zalijepite rezultat.',
                back: 'Natrag',
            },

            import_from_database: {
                title: 'Uvezi iz postojeće baze',
                description:
                    'Koristite ovo kada nemate SQL ili DBML datoteku sheme. Pokrenite upit u bazi, zatim zalijepite rezultat ispod.',
                database_edition: 'Izdanje baze',
                edition_regular: 'Standardno',
                run_query: 'Pokrenite ovaj upit u bazi',
                client_sql: 'SQL',
                paste_result: 'Zalijepite rezultat',
                paste_result_placeholder: 'Zalijepite rezultat upita ovdje…',
                check_result: 'Provjeri rezultat',
                valid_result: 'Rezultat izgleda valjano.',
                invalid_result:
                    'Rezultat nije mogao biti potvrđen. Provjerite sadržaj i pokušajte ponovno.',
                truncated_result:
                    'Rezultat je možda skraćen. Prilagodite postavke SQL klijenta i ponovno pokrenite upit.',
                waiting_for_result: 'Zalijepite rezultat upita za nastavak.',
                unsupported_database:
                    'Ekstrakcija sheme nije dostupna za ovu vrstu baze.',
                import_failed:
                    'Shema baze nije mogla biti uvezena. Provjerite rezultat i pokušajte ponovno.',
                back: 'Natrag',
                import: 'Uvezi',
            },

            import_schema: {
                title: 'Zalijepite svoju shemu',
                textarea_label: 'Sadržaj sheme',
                textarea_placeholder:
                    'Ovdje zalijepite SQL, DBML ili JSON metapodatke…',
                auto_detect_hint: 'Format ćemo automatski prepoznati.',
                or_divider: 'ILI',
                choose_file: 'Odaberi datoteku',
                change_file_aria: 'Promijeni datoteku, trenutno: {{name}}',
                selected_file: 'Odabrana datoteka: {{name}}',
                back: 'Natrag',
                import: 'Uvezi',
                mismatch: {
                    title: 'Ova shema izgleda kao {{detected}}, ali ste odabrali {{selected}}.',
                    description:
                        'Prebacite se na otkriveni tip baze ili se vratite da odaberete drugi.',
                    switch: 'Prebaci na {{database}}',
                    go_back: 'Natrag',
                },
                ambiguous: {
                    title: 'Odaberite izvorni DBMS',
                    confidence_explanation:
                        'Postoci označavaju indeks podudarnosti SQL dijalekta za svaki DBMS.',
                    description:
                        'SQL dijalekt nije mogao biti automatski prepoznat. Potvrdite iz kojeg DBMS-a dolazi ova shema.',
                    choose_source: 'Odaberi izvorni DBMS',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% pouzdanosti, automatsko otkrivanje)',
                    recommended_tooltip: 'Automatski otkriveni DBMS',
                    recommended_aria: '{{database}}, automatski otkriveni DBMS',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Ready to import this diagram.',
                        mismatch_title: 'Nepodudarnost DBMS-a',
                        mismatch_description:
                            'Datoteka pokazuje {{detected}}, ali ste odabrali {{selected}}.',
                        unsupported_existing:
                            'Diagram JSON restores a full diagram and cannot be merged into the current one. Export or create a new diagram instead.',
                    },
                    ambiguous: {
                        title: 'Choose the diagram DBMS',
                        description:
                            'Odaberite opciju koja će se primijeniti za ovaj uvoz.',
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
                    dialect: '{{database}} prepoznat',
                    dbml: 'DBML prepoznat',
                    metadata_json: 'JSON metapodataka prepoznat',
                    diagram_json: 'JSON dijagrama prepoznat',
                    sql_ambiguous_title: 'SQL prepoznat',
                    sql_ambiguous_description:
                        'DBMS nije mogao biti automatski prepoznat.',
                    clickhouse_unsupported: 'Prepoznat je ClickHouse SQL',
                    unsupported: 'Nepodržani format',
                },
                errors: {
                    unreadable_file:
                        'Odabrana datoteka nije mogla biti pročitana.',
                    malformed_json: 'JSON sadržaj nije mogao biti parsiran.',
                    unsupported: 'Ovaj format nije podržan za uvoz sheme.',
                    diagram_json:
                        'JSON dijagrama može se uvesti putem opcije datoteke dijagrama.',
                    clickhouse_unsupported:
                        'SQL DDL uvoz nije podržan za ClickHouse. Koristite DBML ili uvezite iz postojeće baze.',
                    file_too_large: 'Odabrana datoteka je veća od 5 MB.',
                    unsupported_file_extension:
                        'Podržane su samo .sql, .dbml i .json datoteke.',
                    import_failed:
                        'Shemu nije bilo moguće uvesti. Provjerite sadržaj i pokušajte ponovno.',
                    invalid_diagram_json:
                        'JSON dijagrama nije valjan. Provjerite datoteku i pokušajte ponovno.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS upute',
                    title: 'Upute',
                    step_1: 'Idite na Tools > Options > Query Results > SQL Server.',
                    step_2: 'Ako koristite "Results to Grid," promijenite Maximum Characters Retrieved za Non-XML podatke (postavite na 9999999).',
                },
            },

            cancel: 'Odustani',
            import_from_file: 'Uvezi iz datoteke',
            back: 'Natrag',
            empty_diagram: 'Prazna baza podataka',
            continue: 'Nastavi',
            import: 'Uvezi',
        },

        share_diagram_dialog: {
            title: 'Podijeli dijagram',
            description:
                'Pozovite suradnike s pristupom uređivača ili gledatelja. Već moraju imati FoxalDB račun.',
            share_button: 'Podijeli',
            empty_members: 'Još nema suradnika.',
            remove: 'Ukloni',
            roles: {
                owner: 'Vlasnik',
                editor: 'Uređivač',
                viewer: 'Gledatelj',
            },
            add_member: {
                title: 'Dodaj suradnika',
                email_label: 'E-pošta',
                email_placeholder: 'Adresa e-pošte',
                add: 'Dodaj',
                adding: 'Dodavanje…',
                cancel: 'Odustani',
            },
            errors: {
                load_failed: 'Suradnici se nisu mogli učitati.',
                add_failed: 'Suradnik nije mogao biti dodan.',
            },
        },

        diagram_role: {
            owner: 'Vlasnik',
            editor: 'Uređivač',
            viewer: 'Gledatelj',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Otvori bazu podataka',
            description: 'Odaberite sustav baze podataka za novi dijagram.',
            table_columns: {
                name: 'Naziv',
                created_at: 'Stvoreno',
                last_modified: 'Zadnje izmijenjeno',
                tables_count: 'Tablice',
            },
            cancel: 'Odustani',
            open: 'Otvori',
            new_database: 'Nova baza podataka',

            diagram_actions: {
                open: 'Otvori',
                duplicate: 'Dupliciraj',
                delete: 'Obriši',
            },
        },

        export_sql_dialog: {
            title: 'Izvezi SQL',
            description:
                'Izvezite shemu vašeg dijagrama u {{databaseType}} skriptu',
            close: 'Zatvori',
            loading: {
                text: 'AI generira SQL za {{databaseType}}...',
                description: 'Ovo bi trebalo potrajati do 30 sekundi.',
            },
            error: {
                message:
                    'Greška pri generiranju SQL skripte. Molimo pokušajte ponovno kasnije ili <0>kontaktirajte nas</0>.',
                description:
                    'Slobodno koristite svoj OPENAI_TOKEN, pogledajte priručnik <0>ovdje</0>.',
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
            title: 'Kreiraj vezu',
            primary_table: 'Primarna tablica',
            primary_field: 'Primarno polje',
            referenced_table: 'Referentna tablica',
            referenced_field: 'Referentno polje',
            primary_table_placeholder: 'Odaberi tablicu',
            primary_field_placeholder: 'Odaberi polje',
            referenced_table_placeholder: 'Odaberi tablicu',
            referenced_field_placeholder: 'Odaberi polje',
            no_tables_found: 'Nema pronađenih tablica',
            no_fields_found: 'Nema pronađenih polja',
            create: 'Kreiraj',
            cancel: 'Odustani',
        },

        import_database_dialog: {
            title: 'Uvezi u trenutni dijagram',
            import_schema: {
                title: 'Uvezi shemu',
                import: 'Uvezi',
                cancel: 'Odustani',
                mismatch: {
                    title: 'Ova shema izgleda kao {{detected}}, ali ovaj dijagram je {{selected}}.',
                    description:
                        'Uvoz između različitih baza podataka još nije podržan.',
                    cancel: 'Odustani',
                },
                ambiguous: {
                    description:
                        'SQL dijalekt nije mogao biti automatski prepoznat. Potvrdite kako interpretirati ovu shemu za trenutni {{selected}} dijagram.',
                },
            },
            override_alert: {
                title: 'Uvezi bazu podataka',
                content: {
                    alert: 'Uvoz ovog dijagrama će utjecati na postojeće tablice i veze.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> novih tablica će biti dodano.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> novih veza će biti stvoreno.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> tablica će biti prepisano.',
                    proceed: 'Želite li nastaviti?',
                },
                import: 'Uvezi',
                cancel: 'Odustani',
            },
        },

        export_image_dialog: {
            title: 'Izvezi sliku',
            description: 'Odaberite faktor veličine za izvoz:',
            scale_1x: '1x (Niska kvaliteta)',
            scale_2x: '2x (Normalna kvaliteta)',
            scale_4x: '4x (Najbolja kvaliteta)',
            cancel: 'Odustani',
            export: 'Izvezi',
            advanced_options: 'Napredne opcije',
            pattern: 'Uključi pozadinski uzorak',
            pattern_description: 'Dodaj suptilni mrežni uzorak u pozadinu.',
            transparent: 'Prozirna pozadina',
            transparent_description: 'Ukloni boju pozadine iz slike.',
        },

        new_table_schema_dialog: {
            title: 'Odaberi shemu',
            description:
                'Trenutno je prikazano više shema. Odaberite jednu za novu tablicu.',
            cancel: 'Odustani',
            confirm: 'Potvrdi',
        },

        update_table_schema_dialog: {
            title: 'Promijeni shemu',
            description: 'Ažuriraj shemu tablice "{{tableName}}"',
            cancel: 'Odustani',
            confirm: 'Promijeni',
        },

        create_table_schema_dialog: {
            title: 'Stvori novu shemu',
            description:
                'Još ne postoje sheme. Stvorite svoju prvu shemu za organiziranje tablica.',
            create: 'Stvori',
            cancel: 'Odustani',
        },
        export_diagram_dialog: {
            title: 'Izvezi dijagram',
            description: 'Odaberite format za izvoz:',
            format_json: 'JSON',
            cancel: 'Odustani',
            export: 'Izvezi',
            error: {
                title: 'Greška pri izvozu dijagrama',
                description:
                    'Nešto je pošlo po zlu. Trebate pomoć? support@chartdb.io',
            },
        },

        import_diagram_dialog: {
            title: 'Uvezi dijagram',
            description: 'Uvezite dijagram iz JSON datoteke.',
            cancel: 'Odustani',
            import: 'Uvezi',
            error: {
                title: 'Greška pri uvozu dijagrama',
                description:
                    'JSON dijagrama je nevažeći. Molimo provjerite JSON i pokušajte ponovno. Trebate pomoć? support@chartdb.io',
            },
        },

        import_dbml_dialog: {
            example_title: 'Uvezi primjer DBML-a',
            title: 'Uvezi DBML',
            description: 'Uvezite shemu baze podataka iz DBML formata.',
            import: 'Uvezi',
            cancel: 'Odustani',
            skip_and_empty: 'Preskoči i isprazni',
            show_example: 'Prikaži primjer',
            error: {
                title: 'Greška pri uvozu DBML-a',
                description:
                    'Neuspješno parsiranje DBML-a. Molimo provjerite sintaksu.',
            },
        },
        relationship_type: {
            one_to_one: 'Jedan na jedan',
            one_to_many: 'Jedan na više',
            many_to_one: 'Više na jedan',
            many_to_many: 'Više na više',
        },

        canvas_context_menu: {
            new_table: 'Nova tablica',
            new_view: 'Novi Pogled',
            new_relationship: 'Nova veza',
            new_area: 'Novo područje',
            new_note: 'Nova Bilješka',
        },

        table_node_context_menu: {
            edit_table: 'Uredi tablicu',
            duplicate_table: 'Dupliciraj tablicu',
            delete_table: 'Izbriši tablicu',
            add_relationship: 'Dodaj vezu',
            move_to_area: 'Premjesti u područje',
            no_area: 'Bez područja',
        },

        canvas: {
            all_tables_hidden: 'Sve tablice su skrivene',
            show_all_tables: 'Prikaži sve',
        },

        canvas_filter: {
            title: 'Filtriraj tablice',
            search_placeholder: 'Pretraži tablice...',
            group_by_schema: 'Grupiraj po shemi',
            group_by_area: 'Grupiraj po području',
            no_tables_found: 'Nisu pronađene tablice',
            empty_diagram_description: 'Kreirajte tablicu za početak',
            no_tables_description: 'Pokušajte prilagoditi pretragu ili filter',
            clear_filter: 'Očisti filter',
        },

        snap_to_grid_tooltip: 'Priljepljivanje na mrežu (Drži {{key}})',

        editing_conflict: {
            one: '{{name}} također uređuje ovo.',
            two: '{{name1}} i {{name2}} također uređuju ovo.',
            many: '{{name}} i još {{count}} također uređuju ovo.',
            fallback_name: 'Suradnik',
            last_writer_wins:
                'Promjene nisu zaključane. Pobjeđuje posljednja spremljena izmjena.',
        },

        tool_tips: {
            double_click_to_edit: 'Dvostruki klik za uređivanje',
        },

        auth: {
            dialog: {
                account_title: 'Račun',
                login_title: 'Prijava u FoxalDB',
                register_title: 'Stvorite FoxalDB račun',
                account_description: 'Upravljajte trenutnom sesijom.',
                login_description:
                    'Prijavite se kako biste spremili više dijagrama i sinkronizirali ih.',
                register_description:
                    'Stvorite račun kako biste spremili više dijagrama.',
                checking_session: 'Provjera sesije...',
                continue_without_account: 'Nastavi bez računa',
            },
            login: {
                title: 'Prijava',
                email_label: 'E-pošta',
                password_label: 'Lozinka',
                submit: 'Prijavi se',
                submitting: 'Prijava...',
                switch_to_register: 'Registracija',
                no_account: 'Nemate račun?',
            },
            register: {
                title: 'Registracija',
                first_name_label: 'Ime',
                last_name_label: 'Prezime',
                email_label: 'E-pošta',
                password_label: 'Lozinka',
                password_confirmation_label: 'Potvrdite lozinku',
                submit: 'Stvori račun',
                submitting: 'Stvaranje računa...',
                switch_to_login: 'Prijava',
                already_have_account: 'Već imate račun?',
            },
            account: {
                signed_in_as: 'Prijavljeni kao',
                logout: 'Odjava',
                back_to_editor: 'Natrag u uređivač',
            },
            settings: {
                title: 'Korisničke postavke',
                description: 'Ažurirajte svoje osobne podatke i lozinku.',
                change_password_heading: 'Promijeni lozinku',
                current_password_label: 'Trenutna lozinka',
                new_password_label: 'Nova lozinka',
                password_confirmation_label: 'Potvrdite novu lozinku',
                first_name_label: 'Ime',
                last_name_label: 'Prezime',
                email_label: 'E-mail adresa',
                submit: 'Spremi',
                submitting: 'Spremanje...',
                success_title: 'Profil ažuriran',
                success_description: 'Vaš profil je spremljen.',
            },
            nav: {
                sign_in: 'Prijava',
                logout: 'Odjava',
                loading: '...',
                user_menu: 'Račun',
                settings: 'Postavke',
                change_language: 'Jezik',
            },
            pages: {
                login_title: 'FoxalDB — Prijava',
                register_title: 'FoxalDB — Registracija',
                checking_session: 'Provjera sesije…',
            },
            errors: {
                first_name_required: 'Ime je obavezno.',
                last_name_required: 'Prezime je obavezno.',
                generic: 'Nešto je pošlo po zlu.',
            },
        },

        guest_migration_dialog: {
            title: 'Uvesti lokalni dijagram?',
            description:
                'Na ovom uređaju je spremljen dijagram. Uvezite ga u račun za pristup s bilo kojeg mjesta.',
            import: 'Uvezi u račun',
            continue_without_import: 'Nastavi bez uvoza',
        },

        guest_migration_errors: {
            import_failed:
                'Lokalni dijagram nije mogao biti uvezen. Lokalna kopija je sačuvana.',
            activation_failed:
                'Dijagram je stvoren ali se nije mogao otvoriti. Lokalna kopija je sačuvana.',
            cleanup_failed:
                'Dijagram je uvezen ali lokalna kopija nije uklonjena. Možete je ručno izbrisati.',
            check_failed: 'Lokalni dijagram nije mogao biti pročitan.',
        },

        language_select: {
            change_language: 'Jezik',
        },

        on: 'Uključeno',
        off: 'Isključeno',
    },
};

export const hrMetadata: LanguageMetadata = {
    name: 'Croatian',
    nativeName: 'Hrvatski',
    code: 'hr',
    countryCode: 'hr',
};
