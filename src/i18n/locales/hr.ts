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
            comments: 'Rasprave',
            visuals: 'Vizuali',
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
            title: 'Izbriši dijagram',
            description:
                'Ova radnja se ne može poništiti. Ovo će trajno izbrisati dijagram.',
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
                        open_discussion: 'Otvori raspravu',
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
                        open_discussion: 'Otvori raspravu',
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
                        open_discussion: 'Otvori raspravu',
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
            comments_section: {
                title: 'Rasprave',
                loading: 'Učitavanje rasprava…',
                inactive: {
                    title: 'Rasprave nisu dostupne',
                    description:
                        'Rasprave su dostupne samo na autentificiranim cloud dijagramima.',
                },
                empty: {
                    title: 'Još nema rasprava',
                    description:
                        'Razgovori o ovom dijagramu pojavit će se ovdje.',
                    diagram_title: 'Još nema poruka o dijagramu',
                    diagram_description:
                        'Poruke o dijagramu u cjelini pojavit će se ovdje.',
                    target_title: 'Još nema poruka za trenutni odabir',
                    target_description:
                        'Poruke o trenutnom odabiru pojavit će se ovdje.',
                },
                errors: {
                    load_title: 'Nije moguće učitati rasprave',
                    load_description:
                        'Došlo je do greške pri učitavanju rasprava. Pokušajte ponovno.',
                },
                retry: 'Pokušaj ponovno',
                deleted_user: 'Izbrisani korisnik',
                targets: {
                    diagram: 'Rasprava o dijagramu',
                    table: 'Rasprava o tablici',
                    field: 'Rasprava o polju',
                    relationship: 'Rasprava o vezi',
                    unknown: 'Rasprava',
                },
                views: {
                    all: 'Sve',
                    diagram: 'Dijagram',
                    current_target: 'Trenutno',
                },
                target_header: {
                    diagram: 'Rasprava o dijagramu',
                    table: 'Tablica {{name}}',
                    field: '{{table}}.{{field}}',
                    relationship: '{{name}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Izbrisana tablica',
                    missing_field: 'Izbrisano polje',
                    missing_relationship: 'Izbrisana veza',
                },
                composer: {
                    label: 'Poruka',
                    placeholder: 'Napišite poruku rasprave…',
                    submit: 'Objavi',
                    submitting: 'Objavljivanje…',
                    cancel: 'Odustani',
                    form_aria_label: 'Nova poruka rasprave',
                    counter_aria_label:
                        'Iskorišteno {{count}} od {{max}} znakova',
                    errors: {
                        empty: 'Unesite poruku za objavu.',
                        too_long: 'Poruke ne smiju prelaziti 2000 znakova.',
                        create_failed:
                            'Poruku nije bilo moguće objaviti. Pokušajte ponovno.',
                    },
                },
                item_actions: {
                    title: 'Radnje komentara',
                    edit: 'Uredi',
                    delete: 'Izbriši',
                },
                edit: {
                    label: 'Poruka',
                    form_aria_label: 'Uredi poruku rasprave',
                    save: 'Spremi',
                    saving: 'Spremanje…',
                    cancel: 'Odustani',
                    counter_aria_label:
                        'Iskorišteno {{count}} od {{max}} znakova',
                    errors: {
                        empty: 'Unesite poruku za spremanje.',
                        too_long: 'Poruke ne smiju premašiti 2000 znakova.',
                        update_failed:
                            'Poruku nije moguće ažurirati. Pokušajte ponovno.',
                    },
                    remote_updated_warning:
                        'Ova je poruka ažurirana drugdje. Spremanje će prebrisati te promjene.',
                },
                delete_dialog: {
                    title: 'Izbriši poruku',
                    description:
                        'Jeste li sigurni da želite izbrisati ovu poruku? Ova se radnja ne može poništiti.',
                    cancel: 'Odustani',
                    confirm: 'Izbriši',
                    deleting: 'Brisanje…',
                    errors: {
                        delete_failed:
                            'Nije moguće izbrisati ovu poruku. Pokušajte ponovno.',
                    },
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
                title: 'Koja je vaša baza podataka?',
                description:
                    'Svaka baza podataka ima svoje jedinstvene značajke i mogućnosti.',
                check_examples_long: 'Pogledaj primjere',
                check_examples_short: 'Primjeri',
            },

            import_database: {
                title: 'Uvezite svoju bazu podataka',
                database_edition: 'Verzija baze podataka:',
                step_1: 'Pokrenite ovu skriptu u svojoj bazi podataka:',
                step_2: 'Zalijepite rezultat skripte u ovaj dio →',
                script_results_placeholder: 'Rezultati skripte ovdje...',
                ssms_instructions: {
                    button_text: 'SSMS upute',
                    title: 'Upute',
                    step_1: 'Idite na Tools > Options > Query Results > SQL Server.',
                    step_2: 'Ako koristite "Results to Grid," promijenite Maximum Characters Retrieved za Non-XML podatke (postavite na 9999999).',
                },
                instructions_link: 'Trebate pomoć? Pogledajte kako',
                check_script_result: 'Provjeri rezultat skripte',
            },

            cancel: 'Odustani',
            import_from_file: 'Uvezi iz datoteke',
            back: 'Natrag',
            empty_diagram: 'Prazna baza podataka',
            continue: 'Nastavi',
            import: 'Uvezi',
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
            title: 'Otvori bazu podataka',
            description: 'Odaberite dijagram za otvaranje iz popisa ispod.',
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

        star_us_dialog: {
            title: 'Pomozite nam da se poboljšamo!',
            description:
                'Želite li nam dati zvjezdicu na GitHubu? Samo je jedan klik!',
            close: 'Ne sada',
            confirm: 'Naravno!',
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
};
