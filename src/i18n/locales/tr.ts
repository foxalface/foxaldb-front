import type { LanguageMetadata, LanguageTranslation } from '../types';

export const tr: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Yeni',
            browse: 'Aç',
            tables: 'Tablolar',
            refs: 'Refs',
            dependencies: 'Bağımlılıklar',
            custom_types: 'Özel Tipler',
            comments: 'Tartışmalar',
            visuals: 'Görseller',
        },
        menu: {
            actions: {
                actions: 'Eylemler',
                new: 'Yeni...',
                browse: 'Tüm veritabanları...',
                save: 'Kaydet',
                import: 'Veritabanı İçe Aktar',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'SQL Olarak Dışa Aktar',
                export_as: 'Olarak Dışa Aktar',
                delete_diagram: 'Sil',
            },
            edit: {
                edit: 'Düzenle',
                undo: 'Geri Al',
                redo: 'Yinele',
                clear: 'Temizle',
            },
            view: {
                view: 'Görünüm',
                show_sidebar: 'Kenar Çubuğunu Göster',
                hide_sidebar: 'Kenar Çubuğunu Gizle',
                hide_cardinality: 'Kardinaliteyi Gizle',
                show_cardinality: 'Kardinaliteyi Göster',
                show_field_attributes: 'Alan Özelliklerini Göster',
                hide_field_attributes: 'Alan Özelliklerini Gizle',
                zoom_on_scroll: 'Kaydırarak Yakınlaştır',
                show_views: 'Veritabanı Görünümleri',
                theme: 'Tema',
                show_dependencies: 'Bağımlılıkları Göster',
                hide_dependencies: 'Bağımlılıkları Gizle',
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
                help: 'Yardım',
                docs_website: 'Belgeleme',
                join_discord: "Discord'a Katıl",
            },
        },

        delete_diagram_alert: {
            title: 'Diyagramı Sil',
            description:
                'Bu işlem geri alınamaz. Diyagram kalıcı olarak silinecektir.',
            cancel: 'İptal',
            delete: 'Sil',
        },

        clear_diagram_alert: {
            title: 'Diyagramı Temizle',
            description:
                'Bu işlem geri alınamaz. Diyagramdaki tüm veriler kalıcı olarak silinecektir.',
            cancel: 'İptal',
            clear: 'Temizle',
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
            title: 'Diyagramı Otomatik Düzenle',
            description:
                'Bu işlem tüm tabloları yeniden düzenleyecektir. Devam etmek istiyor musunuz?',
            reorder: 'Otomatik Düzenle',
            cancel: 'İptal',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Kopyalama başarısız',
                description: 'Panoya desteklenmiyor',
            },
            failed: {
                title: 'Kopyalama başarısız',
                description: 'Bir şeyler ters gitti. Lütfen tekrar deneyin.',
            },
        },

        theme: {
            system: 'Sistem',
            light: 'Açık',
            dark: 'Koyu',
        },

        zoom: {
            on: 'Açık',
            off: 'Kapalı',
        },

        last_saved: 'Son kaydedilen',
        saved: 'Kaydedildi',
        loading_diagram: 'Diyagram yükleniyor...',
        deselect_all: 'Hepsini Seçme',
        select_all: 'Hepsini Seç',
        clear: 'Temizle',
        show_more: 'Daha Fazla Göster',
        show_less: 'Daha Az Göster',
        copy_to_clipboard: 'Panoya Kopyala',
        copied: 'Kopyalandı!',
        side_panel: {
            view_all_options: 'Tüm Seçenekleri Gör...',
            tables_section: {
                tables: 'Tablolar',
                add_table: 'Tablo Ekle',
                add_view: 'Görünüm Ekle',
                filter: 'Filtrele',
                collapse: 'Hepsini Daralt',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'Tüm tablolar gizli',
                show_all: 'Tümünü göster',

                table: {
                    fields: 'Alanlar',
                    nullable: 'Boş Bırakılabilir?',
                    primary_key: 'Birincil Anahtar',
                    indexes: 'İndeksler',
                    check_constraints: 'Kontrol Kısıtlamaları',
                    comments: 'Yorumlar',
                    no_comments: 'Yorum yok',
                    add_field: 'Alan Ekle',
                    add_index: 'İndeks Ekle',
                    add_check: 'Kontrol Ekle',
                    index_select_fields: 'Alanları Seç',
                    no_types_found: 'Tür bulunamadı',
                    field_name: 'Ad',
                    field_type: 'Tür',
                    field_actions: {
                        title: 'Alan Özellikleri',
                        open_discussion: 'Tartışmayı aç',
                        unique: 'Tekil',
                        auto_increment: 'Otomatik Artış',
                        comments: 'Yorumlar',
                        no_comments: 'Yorum yok',
                        delete_field: 'Alanı Sil',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Hassasiyet',
                        scale: 'Ölçek',
                    },
                    index_actions: {
                        title: 'İndeks Özellikleri',
                        name: 'Ad',
                        unique: 'Tekil',
                        index_type: 'İndeks Türü',
                        delete_index: 'İndeksi Sil',
                    },
                    check_constraint_actions: {
                        title: 'Kontrol Kısıtlaması',
                        expression: 'İfade',
                        delete: 'Kısıtlamayı Sil',
                    },
                    table_actions: {
                        title: 'Tablo İşlemleri',
                        open_discussion: 'Tartışmayı aç',
                        change_schema: 'Şemayı Değiştir',
                        add_field: 'Alan Ekle',
                        add_index: 'İndeks Ekle',
                        // TODO: Translate
                        duplicate_table: 'Duplicate Table',
                        delete_table: 'Tabloyu Sil',
                    },
                },
                empty_state: {
                    title: 'Tablo yok',
                    description: 'Başlamak için bir tablo oluşturun',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Filtrele',
                collapse: 'Hepsini Daralt',
                add_relationship: 'İlişki Ekle',
                relationships: 'İlişkiler',
                dependencies: 'Bağımlılıklar',
                relationship: {
                    relationship: 'İlişki',
                    primary: 'Birincil Tablo',
                    foreign: 'İlişkili Tablo',
                    cardinality: 'Kardinalite',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Sil',
                    switch_tables: 'Tabloları Değiştir',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'İşlemler',
                        open_discussion: 'Tartışmayı aç',
                        delete_relationship: 'Sil',
                    },
                },
                dependency: {
                    dependency: 'Bağımlılık',
                    table: 'Tablo',
                    dependent_table: 'Bağımlı Görünüm',
                    delete_dependency: 'Sil',
                    dependency_actions: {
                        title: 'İşlemler',
                        delete_dependency: 'Sil',
                    },
                },
                empty_state: {
                    title: 'İlişki yok',
                    description: 'Başlamak için bir ilişki oluşturun',
                },
            },

            areas_section: {
                areas: 'Alanlar',
                add_area: 'Alan Ekle',
                filter: 'Filtrele',
                clear: 'Filtreyi Temizle',
                no_results: 'Filtrenizle eşleşen alan bulunamadı.',

                area: {
                    area_actions: {
                        title: 'Alan İşlemleri',
                        edit_name: 'Adı Düzenle',
                        delete_area: 'Alanı Sil',
                    },
                },
                empty_state: {
                    title: 'Alan yok',
                    description: 'Başlamak için bir alan oluşturun',
                },
            },

            visuals_section: {
                visuals: 'Görseller',
                tabs: {
                    areas: 'Alanlar',
                    notes: 'Notlar',
                },
            },

            notes_section: {
                filter: 'Filtrele',
                add_note: 'Not Ekle',
                no_results: 'Not bulunamadı',
                clear: 'Filtreyi Temizle',
                empty_state: {
                    title: 'Not Yok',
                    description:
                        'Tuval üzerinde metin açıklamaları eklemek için bir not oluşturun',
                },
                note: {
                    empty_note: 'Boş not',
                    note_actions: {
                        title: 'Not İşlemleri',
                        edit_content: 'İçeriği Düzenle',
                        delete_note: 'Notu Sil',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Özel Tipler',
                filter: 'Filtrele',
                clear: 'Filtreyi Temizle',
                no_results: 'Filtrenizle eşleşen özel tip bulunamadı.',
                new_type: 'Yeni Tip',
                empty_state: {
                    title: 'Özel tip yok',
                    description:
                        'Veritabanınızda mevcut olduğunda özel tipler burada görünecektir',
                },
                custom_type: {
                    kind: 'Tür',
                    enum_values: 'Enum Değerleri',
                    composite_fields: 'Alanlar',
                    no_fields: 'Alan tanımlanmamış',
                    no_values: 'Tanımlanmış enum değeri yok',
                    field_name_placeholder: 'Alan adı',
                    field_type_placeholder: 'Tip seçin',
                    add_field: 'Alan Ekle',
                    no_fields_tooltip: 'Bu özel tip için alan tanımlanmamış',
                    custom_type_actions: {
                        title: 'İşlemler',
                        highlight_fields: 'Alanları Vurgula',
                        delete_custom_type: 'Sil',
                        clear_field_highlight: 'Vurguyu Kaldır',
                    },
                    delete_custom_type: 'Tipi Sil',
                },
            },
            comments_section: {
                title: 'Tartışmalar',
                loading: 'Tartışmalar yükleniyor…',
                inactive: {
                    title: 'Tartışmalar kullanılamıyor',
                    description:
                        'Tartışmalar yalnızca kimliği doğrulanmış bulut diyagramlarında kullanılabilir.',
                },
                empty: {
                    title: 'Henüz tartışma yok',
                    description:
                        'Bu diyagram hakkındaki konuşmalar burada görünecek.',
                    diagram_title: 'Henüz diyagram mesajı yok',
                    diagram_description:
                        'Diyagramın geneline dair mesajlar burada görünür.',
                    target_title: 'Geçerli seçim için henüz mesaj yok',
                    target_description:
                        'Geçerli seçime dair mesajlar burada görünür.',
                },
                errors: {
                    load_title: 'Tartışmalar yüklenemedi',
                    load_description:
                        'Tartışmalar yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
                },
                retry: 'Yeniden dene',
                deleted_user: 'Silinmiş kullanıcı',
                targets: {
                    diagram: 'Diyagram tartışması',
                    table: 'Tablo tartışması',
                    field: 'Alan tartışması',
                    relationship: 'İlişki tartışması',
                    unknown: 'Tartışma',
                },
                views: {
                    all: 'Tümü',
                    diagram: 'Diyagram',
                    current_target: 'Geçerli',
                },
                target_header: {
                    diagram: 'Diyagram tartışması',
                    table: 'Tablo {{name}}',
                    field: '{{table}}.{{field}}',
                    relationship: '{{name}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Silinmiş tablo',
                    missing_field: 'Silinmiş alan',
                    missing_relationship: 'Silinmiş ilişki',
                },
                composer: {
                    label: 'Mesaj',
                    placeholder: 'Bir tartışma mesajı yazın…',
                    submit: 'Gönder',
                    submitting: 'Gönderiliyor…',
                    cancel: 'İptal',
                    form_aria_label: 'Yeni tartışma mesajı',
                    counter_aria_label:
                        '{{max}} karakterden {{count}} kullanıldı',
                    errors: {
                        empty: 'Göndermek için bir mesaj girin.',
                        too_long: 'Mesajlar 2000 karakteri aşamaz.',
                        create_failed:
                            'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
                    },
                },
                item_actions: {
                    title: 'Yorum eylemleri',
                    edit: 'Düzenle',
                    delete: 'Sil',
                },
                edit: {
                    label: 'Mesaj',
                    form_aria_label: 'Tartışma mesajını düzenle',
                    save: 'Kaydet',
                    saving: 'Kaydediliyor…',
                    cancel: 'İptal',
                    counter_aria_label:
                        '{{count}} / {{max}} karakter kullanıldı',
                    errors: {
                        empty: 'Kaydetmek için bir mesaj girin.',
                        too_long: 'Mesajlar 2000 karakteri aşamaz.',
                        update_failed:
                            'Mesaj güncellenemedi. Lütfen tekrar deneyin.',
                    },
                    remote_updated_warning:
                        'Bu mesaj başka bir yerde güncellendi. Kaydetmek bu değişikliklerin üzerine yazacaktır.',
                },
                delete_dialog: {
                    title: 'Mesajı sil',
                    description:
                        'Bu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
                    cancel: 'İptal',
                    confirm: 'Sil',
                    deleting: 'Siliniyor…',
                    errors: {
                        delete_failed:
                            'Bu mesaj silinemedi. Lütfen tekrar deneyin.',
                    },
                },
            },
        },
        toolbar: {
            zoom_in: 'Yakınlaştır',
            zoom_out: 'Uzaklaştır',
            save: 'Kaydet',
            show_all: 'Hepsini Gör',
            undo: 'Geri Al',
            redo: 'Yinele',
            reorder_diagram: 'Diyagramı Otomatik Düzenle',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Çakışan Tabloları Vurgula',
            filter: 'Tabloları Filtrele',
        },
        new_diagram_dialog: {
            database_selection: {
                title: 'Veritabanınız nedir?',
                description:
                    'Her veritabanının kendine özgü özellikleri ve yetenekleri vardır.',
                check_examples_long: 'Örnekleri Kontrol Et',
                check_examples_short: 'Örnekler',
            },
            import_database: {
                title: 'Veritabanını İçe Aktar',
                database_edition: 'Veritabanı Sürümü:',
                step_1: 'Bu komut dosyasını veritabanınızda çalıştırın:',
                step_2: 'Komut dosyası sonucunu buraya yapıştırın →',
                script_results_placeholder: 'Komut dosyası sonuçları burada...',
                ssms_instructions: {
                    button_text: 'SSMS Talimatları',
                    title: 'Talimatlar',
                    step_1: "Araçlar > Seçenekler > Sorgu Sonuçları > SQL Server'a gidin.",
                    step_2: 'Eğer "Sonuçlar Izgaraya" kullanıyorsanız, Maksimum Karakterlerin Alınması için XML olmayan veriler (9999999 olarak ayarlanmış) değiştirin.',
                },
                instructions_link:
                    'Yardıma mı ihtiyacınız var? İzlemek için tıklayın',
                check_script_result: 'Komut Dosyası Sonucunu Kontrol Et',
            },
            // TODO: Translate
            import_from_file: 'Import from File',
            cancel: 'İptal',
            back: 'Geri',
            empty_diagram: 'Boş veritabanı',
            continue: 'Devam',
            import: 'İçe Aktar',
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
            title: 'Veritabanı Aç',
            description: 'Aşağıdaki listeden açmak için bir diyagram seçin.',
            table_columns: {
                name: 'Ad',
                created_at: 'Oluşturulma Tarihi',
                last_modified: 'Son Değiştirme',
                tables_count: 'Tablolar',
            },
            cancel: 'İptal',
            open: 'Aç',
            new_database: 'Yeni Veritabanı',

            diagram_actions: {
                open: 'Aç',
                duplicate: 'Kopyala',
                delete: 'Sil',
            },
        },

        export_sql_dialog: {
            title: 'SQL Olarak Dışa Aktar',
            description:
                'Diyagram şemanızı {{databaseType}} betiğine dışa aktarın',
            close: 'Kapat',
            loading: {
                text: 'AI, SQL oluşturuyor {{databaseType}}...',
                description: 'Bu işlem en fazla 30 saniye sürecektir.',
            },
            error: {
                message:
                    'SQL betiği oluşturulurken hata oluştu. Lütfen daha sonra tekrar deneyin veya <0>bize ulaşın</0>.',
                description:
                    "OPENAI_TOKEN'ınızı kullanabilirsiniz, kılavuzu <0>buradan</0> görebilirsiniz.",
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
            title: 'İlişki Oluştur',
            primary_table: 'Birincil Tablo',
            primary_field: 'Birincil Alan',
            referenced_table: 'Referans Tablo',
            referenced_field: 'Referans Alan',
            primary_table_placeholder: 'Tablo seç',
            primary_field_placeholder: 'Alan seç',
            referenced_table_placeholder: 'Tablo seç',
            referenced_field_placeholder: 'Alan seç',
            no_tables_found: 'Tablo bulunamadı',
            no_fields_found: 'Alan bulunamadı',
            create: 'Oluştur',
            cancel: 'İptal',
        },
        import_database_dialog: {
            title: 'Mevcut Diyagrama İçe Aktar',
            override_alert: {
                title: 'Veritabanını İçe Aktar',
                content: {
                    alert: 'Bu diyagramı içe aktarmak mevcut tabloları ve ilişkileri etkileyecektir.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> yeni tablo eklenecek.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> yeni ilişki oluşturulacak.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> tablo üzerine yazılacak.',
                    proceed: 'Devam etmek istiyor musunuz?',
                },
                import: 'İçe Aktar',
                cancel: 'İptal',
            },
        },
        export_image_dialog: {
            title: 'Resmi Dışa Aktar',
            description: 'Dışa aktarım için ölçek faktörünü seçin:',
            scale_1x: '1x (Düşük Kalite)',
            scale_2x: '2x (Normal Kalite)',
            scale_4x: '4x (En İyi Kalite)',
            cancel: 'İptal',
            export: 'Dışa Aktar',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },
        new_table_schema_dialog: {
            title: 'Şema Seç',
            description:
                'Şu anda birden fazla şema görüntülenmektedir. Yeni tablo için birini seçin.',
            cancel: 'İptal',
            confirm: 'Onayla',
        },
        update_table_schema_dialog: {
            title: 'Şemayı Değiştir',
            description: 'Tablo "{{tableName}}" şemasını güncelle',
            cancel: 'İptal',
            confirm: 'Değiştir',
        },

        create_table_schema_dialog: {
            title: 'Yeni Şema Oluştur',
            description:
                'Henüz hiç şema mevcut değil. Tablolarınızı düzenlemek için ilk şemanızı oluşturun.',
            create: 'Oluştur',
            cancel: 'İptal',
        },
        star_us_dialog: {
            title: 'Bize yardım et!',
            description:
                "Bizi GitHub'da yıldızlamak ister misiniz? Sadece bir tık uzakta!",
            close: 'Şimdi Değil',
            confirm: 'Tabii ki!',
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
            one_to_one: 'Bir Bir',
            one_to_many: 'Bir Çok',
            many_to_one: 'Çok Bir',
            many_to_many: 'Çok Çok',
        },
        canvas_context_menu: {
            new_table: 'Yeni Tablo',
            new_view: 'Yeni Görünüm',
            new_relationship: 'Yeni İlişki',
            // TODO: Translate
            new_area: 'Yeni Alan',
            new_note: 'Yeni Not',
        },
        table_node_context_menu: {
            edit_table: 'Tabloyu Düzenle',
            delete_table: 'Tabloyu Sil',
            duplicate_table: 'Duplicate Table', // TODO: Translate
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'Alana Taşı',
            no_area: 'Alan Yok',
        },

        canvas: {
            all_tables_hidden: 'Tüm tablolar gizli',
            show_all_tables: 'Tümünü göster',
        },

        canvas_filter: {
            title: 'Tabloları Filtrele',
            search_placeholder: 'Tablo ara...',
            group_by_schema: 'Şemaya Göre Grupla',
            group_by_area: 'Alana Göre Grupla',
            no_tables_found: 'Tablo bulunamadı',
            empty_diagram_description: 'Başlamak için bir tablo oluşturun',
            no_tables_description:
                'Aramanızı veya filtrenizi ayarlamayı deneyin',
            clear_filter: 'Filtreyi temizle',
        },

        // TODO: Translate
        snap_to_grid_tooltip: 'Snap to Grid (Hold {{key}})',

        // TODO: Translate
        editing_conflict: {
            one: '{{name}} de bunu düzenliyor.',
            two: '{{name1}} ve {{name2}} de bunu düzenliyor.',
            many: '{{name}} ve diğer {{count}} kişi de bunu düzenliyor.',
            fallback_name: 'İşbirlikçi',
            last_writer_wins:
                'Değişiklikler kilitli değil. Son kaydedilen düzenleme geçerli olur.',
        },

        tool_tips: {
            double_click_to_edit: 'Double-click to edit',
        },

        language_select: {
            change_language: 'Dil',
        },

        on: 'Açık',
        off: 'Kapalı',
    },
};

export const trMetadata: LanguageMetadata = {
    nativeName: 'Türkçe',
    name: 'Turkish',
    code: 'tr',
};
