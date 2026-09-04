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
            conversations: 'Konuşmalar',
            conversations_unread_aria: 'Görüşmelerde {{count}} okunmamış mesaj',
            visuals: 'Görseller',
            activities: 'Etkinlik',
            share: 'Paylaş',
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
            title: 'Veritabanınızı seçin',
            description: 'Yeni diyagramınız için veritabanı sistemini seçin.',
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
                title: 'Veritabanınızı seçin',
                description:
                    'Yeni diyagramınız için veritabanı sistemini seçin.',
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
        delete: 'Sil',
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
                        open_discussion: 'Konuşmayı aç',
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
                        open_discussion: 'Konuşmayı aç',
                        change_schema: 'Şemayı Değiştir',
                        add_field: 'Alan Ekle',
                        add_index: 'İndeks Ekle',
                        // TODO: Translate
                        duplicate_table: 'Tabloyu çoğalt',
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
                clear: 'Filtreyi temizle',
                no_results: 'Filtrenizle eşleşen referans bulunamadı.',
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
                        open_discussion: 'Konuşmayı aç',
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
            conversations_section: {
                title: 'Konuşmalar',
                tabs_label: 'Konuşmalar',
                tabs: {
                    active: 'Aktif',
                    archives: 'Arşivlenmiş',
                },
                loading: 'Konuşmalar yükleniyor…',
                filter: 'Filtrele',
                clear: 'Filtreyi temizle',
                no_results_title: 'Sonuç yok',
                no_results_description:
                    'Filtrenizle eşleşen konuşma bulunamadı.',

                type_filter: {
                    trigger: 'Tür',
                    label: 'Türe göre filtrele',
                    trigger_aria: 'Konuşma türüne göre filtrele',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'Yeniden dene',
                dismiss: 'Dismiss',
                read_only: 'Salt okunur',
                deleted_user: 'Silinmiş kullanıcı',
                unread: {
                    badge_aria: '{{count}} okunmamış mesaj',
                },
                inactive: {
                    title: 'Konuşmalar unavailable',
                    description:
                        'Konuşmalar are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'Konuşma yok',
                    active_description: 'Başlamak için bir konuşma oluşturun',
                    archives_title: 'No archived konuşmalar',
                    archives_description:
                        'Archived konuşmalar will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load konuşmalar',
                    load_description:
                        'Something went wrong while loading konuşmalar. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'Konuşmayı aç',
                    start: 'Konuşma başlat',
                    pending: 'Konuşma başlatılıyor…',
                    diagram_name: 'Diyagram',
                    open_aria: '{{name}} için konuşmayı aç',
                    start_aria: '{{name}} için konuşma başlat',
                    open_tooltip: '{{name}} için konuşmayı aç',
                    start_tooltip: '{{name}} için konuşma başlat',
                    pending_tooltip: '{{name}} için konuşma başlatılıyor…',
                    action_tooltip: 'Konuşma',
                    unavailable_description:
                        'Bu diyagramda konuşma başlatamazsınız.',
                    errors: {
                        validation: 'Bu hedef bir konuşma için geçerli değil.',
                        forbidden: 'Bu konuşmayı başlatma izniniz yok.',
                        not_found: 'Bu hedef artık diyagramda mevcut değil.',
                        conflict:
                            'Bu konuşma şu anda başlatılamadı. Lütfen tekrar deneyin.',
                        generic: 'Bu konuşma açılamadı. Lütfen tekrar deneyin.',
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
                    message_count: '{{count}} mesaj',
                    no_messages: 'Henüz mesaj yok',
                    last_activity: 'Son etkinlik',
                    open_aria: '{{target}} için sohbeti aç',
                    focus_target_aria: '{{target}} öğesini diyagramda göster',
                    author_tooltip: '{{name}} adlı kullanıcının son mesajı',
                    author_missing_tooltip: 'Yazar bilgisi yok',
                    actions: {
                        menu_aria: 'Konuşma seçenekleri',
                        open: 'Aç',
                        delete: 'Sil',
                    },
                    delete_dialog: {
                        title: 'Konuşma silinsin mi?',
                        description:
                            'Bu, konuşmayı ve tüm mesajlarını kalıcı olarak silecektir.',
                        cancel: 'İptal',
                        confirm: 'Sil',
                        deleting: 'Siliniyor…',
                        errors: {
                            delete_failed:
                                'Bu konuşma silinemedi. Lütfen tekrar deneyin.',
                            forbidden: 'Bu konuşmayı silme izniniz yok.',
                            not_found: 'Bu konuşma artık kullanılamıyor.',
                        },
                    },
                },
                detail: {
                    back: 'Geri',
                    back_aria: 'Sohbet listesine dön',
                    loading: 'Mesajlar yükleniyor…',
                    loading_more: 'Daha eski mesajlar yükleniyor…',
                    load_older: 'Daha eski mesajları yükle',
                    new_messages_badge_one: '1 yeni mesaj',
                    new_messages_badge_other: '{{count}} yeni mesaj',
                    new_messages_badge_label_one: 'yeni mesaj',
                    new_messages_badge_label_other: 'yeni mesaj',
                    new_messages_badge_aria_one: 'Yeni mesaja git',
                    new_messages_badge_aria_other: '{{count}} yeni mesaja git',
                    empty: {
                        title: 'Mesaj yok',
                        description: 'Bu sohbette mesaj bulunmuyor.',
                    },
                    errors: {
                        load_title: 'Mesajlar yüklenemedi',
                        load_description:
                            'Mesajlar yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
                    },
                    archive_banner: {
                        title: 'Arşivlenmiş sohbet',
                        description:
                            'Bu sohbet salt okunurdur. Mesaj eklenemez, düzenlenemez veya silinemez.',
                    },
                    metadata: {
                        status_label: 'Durum',
                        status_active: 'Aktif',
                        status_archived: 'Arşivlendi',
                        message_count_label: 'Mesaj sayısı',
                        message_count: '{{count}} mesaj',
                    },
                    message: {
                        edited: '(düzenlendi)',
                        edited_aria: 'Mesaj düzenlendi',
                        day_separator: {
                            today: 'Bugün',
                            yesterday: 'Dün',
                        },
                        actions: {
                            title: 'Mesaj işlemleri',
                            edit: 'Düzenle',
                            delete: 'Sil',
                        },
                        reactions: {
                            add_aria: 'Tepki ekle',
                            add_tooltip: 'Tepki ekle',
                            picker_loading: 'Emoji seçici yükleniyor…',
                            picker_aria_label: 'Emoji seçici',
                            picker_search_placeholder: 'Emoji ara…',
                            picker_empty: 'Emoji bulunamadı.',
                            chip_aria: '{{emoji}} tepkisi, {{count}}',
                            preview_and_others_one: 've {{count}} kişi daha',
                            preview_and_others_other: 've {{count}} kişi daha',
                            errors: {
                                generic:
                                    'Tepki güncellenemedi. Lütfen tekrar deneyin.',
                                forbidden: 'Bu mesaja tepki verme izniniz yok.',
                                archived:
                                    'Bu konuşma arşivlendi ve tepkiler salt okunurdur.',
                                not_found: 'Bu mesaj artık mevcut değil.',
                                invalid_emoji: 'Bu emoji geçerli değil.',
                            },
                        },
                    },
                    composer: {
                        label: 'Mesaj',
                        placeholder: 'Bir mesaj yazın…',
                        submit: 'Gönder',
                        submitting: 'Gönderiliyor…',
                        form_aria_label: 'Yeni konuşma mesajı',
                        keyboard_hint:
                            'Göndermek için Enter. Yeni satır için Shift+Enter.',
                        counter_aria_label:
                            '{{count}} / {{max}} karakter kullanıldı',
                        errors: {
                            empty: 'Göndermek için bir mesaj girin.',
                            too_long: 'Mesajlar 2000 karakteri aşamaz.',
                            create_failed:
                                'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
                        },
                    },
                    edit: {
                        label: 'Mesaj',
                        form_aria_label: 'Konuşma mesajını düzenle',
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
                    mutation_errors: {
                        forbidden: 'Bu mesajı değiştirme izniniz yok.',
                        archived: 'Bu konuşma arşivlendi ve salt okunur.',
                        not_found:
                            'Bu konuşma veya mesaj artık kullanılamıyor.',
                    },
                },

                targets: {
                    diagram: 'Diyagram',
                    table: 'Tablo',
                    field: 'Alan',
                    relationship: 'İlişki',
                    unknown: 'Konuşma',
                },
                target_labels: {
                    diagram: 'Diyagram',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Silinmiş tablo',
                    missing_field: 'Silinmiş alan',
                    missing_relationship: 'Silinmiş ilişki',
                    unknown: 'Konuşma',
                },
            },
            activities_section: {
                title: 'Etkinlik',
                filter: 'Filtrele',
                clear: 'Filtreyi temizle',
                no_results: 'Filtrenizle eşleşen etkinlik bulunamadı.',
                loading: 'Etkinlik yükleniyor…',
                retry: 'Yeniden dene',
                type_filter: {
                    trigger: 'Tür',
                    label: 'Türe göre filtrele',
                    trigger_aria: 'Etkinlik türüne göre filtrele',
                },
                types: {
                    diagram: 'Diyagram',
                    table: 'Tablo',
                    field: 'Alan',
                    relationship: 'İlişki',
                    note: 'Not',
                    area: 'Bölge',
                    dependency: 'Bağımlılık',
                },
                you: 'Siz',
                unknown_user: 'Birisi',
                empty_state: {
                    title: 'Henüz etkinlik yok',
                    description:
                        'Son değişiklikleri görmek için düzenlemeye başlayın.',
                },
                errors: {
                    load_failed: 'Etkinlik yüklenemedi.',
                },
                actions: {
                    add_tables: '{{user}} {{table}} tablosunu ekledi',
                    remove_tables: '{{user}} bir tabloyu kaldırdı',
                    add_field: '{{user}} {{field}} alanını ekledi',
                    remove_field: '{{user}} bir alanı kaldırdı',
                    update_field: '{{user}} {{field}} alanını güncelledi',
                    add_relationships: '{{user}} bir ilişki ekledi',
                    remove_relationships: '{{user}} bir ilişkiyi kaldırdı',
                    update_relationship: '{{user}} bir ilişkiyi güncelledi',
                    add_notes: '{{user}} bir not ekledi',
                    remove_notes: '{{user}} bir notu kaldırdı',
                    add_areas: '{{user}} bir bölge ekledi',
                    remove_areas: '{{user}} bir bölgeyi kaldırdı',
                    add_dependencies: '{{user}} bir bağımlılık ekledi',
                    remove_dependencies: '{{user}} bir bağımlılığı kaldırdı',
                    fallback: '{{user}} diyagramı güncelledi',
                },
            },
            share_section: {
                title: 'Paylaş',
                tabs_label: 'Paylaşım seçenekleri',
                tabs: {
                    collaborators: 'İşbirlikçiler',
                    public_link: 'Herkese açık bağlantı',
                },
                collaborators: {
                    description:
                        'Düzenleyici veya görüntüleyici erişimiyle işbirlikçileri davet edin. Zaten bir FoxalDB hesabına sahip olmalıdırlar.',
                    filter: 'Filtrele',
                    clear: 'Filtreyi temizle',
                    no_results_title: 'Sonuç yok',
                    no_results_description:
                        'Filtrenizle eşleşen işbirlikçi bulunamadı.',
                    role_filter: {
                        trigger: 'Rol',
                        label: 'Role göre filtrele',
                        trigger_aria: 'İşbirlikçi rolüne göre filtrele',
                    },
                },
                public_link: {
                    title: 'Herkese açık bağlantı',
                    description:
                        'Diyagramınızın salt okunur anlık görüntüsünü bağlantıya sahip herkesle paylaşın.',
                    coming_soon: 'Yakında.',
                },
                loading: 'İşbirlikçiler yükleniyor…',
                retry: 'Yeniden dene',
                errors: {
                    load_failed: 'İşbirlikçiler yüklenemedi.',
                },
                member_actions: {
                    title: 'İşbirlikçi işlemleri',
                    trigger_aria: 'İşbirlikçi işlemleri',
                    role: 'Rol',
                    remove: 'İşbirlikçiyi kaldır',
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
                title: 'Veritabanınızı seçin',
                description:
                    'Yeni diyagramınız için veritabanı sistemini seçin.',
                search_placeholder: 'Veritabanı yönetim sistemlerinde ara…',
                search_no_results:
                    'Aramanızla eşleşen veritabanı yönetim sistemi bulunamadı.',
                clear_search: 'Aramayı temizle',
                primary_group: 'Birincil veritabanları',
                other_group: 'Diğer veritabanları',
            },

            choose_intent: {
                title: 'Ne yapmak istersiniz?',
                description: '{{database}} için yeni bir diyagram oluşturun.',
                create_empty: 'Boş diyagram oluştur',
                create_empty_description:
                    'Kendi tablolarınızı ekleyerek sıfırdan başlayın.',
                import: 'İçe aktar',
                import_description:
                    'Dosyadan, yapıştırılan metinden veya veritabanınızdan.',
                back: 'Geri',
            },

            choose_import_method: {
                title: 'Nasıl içe aktarmak istersiniz?',
                description: '{{database}} diyagramınız için bir kaynak seçin.',
                from_file: 'Dosya veya yapıştırılan metin',
                from_file_description: 'SQL, DBML, JSON, proje arşivi (.zip).',
                from_database: 'Mevcut veritabanı',
                from_database_description:
                    'Veritabanınızda bir sorgu çalıştırın ve sonucu yapıştırın.',
                back: 'Geri',
            },

            import_from_database: {
                title: 'Mevcut veritabanından içe aktar',
                description:
                    'SQL veya DBML şema dosyanız yoksa bunu kullanın. Veritabanınızda sorguyu çalıştırın, ardından sonucu aşağıya yapıştırın.',
                database_edition: 'Veritabanı sürümü',
                edition_regular: 'Standart',
                run_query: 'Bu sorguyu veritabanınızda çalıştırın',
                client_sql: 'SQL',
                paste_result: 'Sonucu yapıştırın',
                paste_result_placeholder: 'Sorgu sonucunu buraya yapıştırın…',
                check_result: 'Sonucu kontrol et',
                valid_result: 'Sonuç geçerli görünüyor.',
                invalid_result:
                    'Sonuç doğrulanamadı. İçeriği kontrol edip tekrar deneyin.',
                truncated_result:
                    'Sonuç kesilmiş olabilir. SQL istemci ayarlarını düzenleyip sorguyu yeniden çalıştırın.',
                waiting_for_result:
                    'Devam etmek için sorgu sonucunu yapıştırın.',
                unsupported_database:
                    'Bu veritabanı türü için şema çıkarma kullanılamıyor.',
                import_failed:
                    'Veritabanı şeması içe aktarılamadı. Sonucu kontrol edip tekrar deneyin.',
                back: 'Geri',
                import: 'İçe aktar',
            },

            import_schema: {
                title: 'Şemanızı yapıştırın',
                textarea_label: 'Şema içeriği',
                textarea_placeholder:
                    'SQL, DBML veya JSON meta verilerini buraya yapıştırın…',
                auto_detect_hint: 'Formatı otomatik olarak algılayacağız.',
                or_divider: 'VEYA',
                choose_file: 'Dosya seç',
                choose_file_or_project: 'Dosya veya proje seçin',
                supported_formats_hint:
                    'Desteklenen: SQL, DBML, JSON, proje arşivi (.zip)',
                privacy_info: {
                    link_label: 'Daha fazla bilgi…',
                    title: 'Gizlilik ve desteklenen formatlar',
                    intro: 'Bir dosya seçmeden önce FoxalDB’nin içe aktarma sırasında verilerinizi nasıl işlediğini öğrenin.',
                    highlights: {
                        no_execution:
                            'İçe aktarmalar yalnızca statik analiz kullanır — kodunuz asla çalıştırılmaz.',
                        no_full_upload:
                            'Tam proje arşivleri asla sunucuya yüklenmez.',
                        filtered_files:
                            'Yalnızca şemayla ilgili dosyalar tutulur; .env, vendor/, node_modules/ ve tests/ hariç tutulur.',
                    },
                    simple_formats_title: 'SQL, DBML ve JSON',
                    simple_formats_description:
                        'Tamamen tarayıcınızda işlenir. Maksimum dosya boyutu: {{sizeMb}} MB.',
                    project_archives_title: 'Proje arşivleri (.zip)',
                    project_archives_description:
                        'Arşiv yerel olarak açılır ve yalnızca şemayla ilgili dosyalar çıkarılır. Maksimum arşiv boyutu: {{sizeMb}} MB.',
                    excluded_paths:
                        'Asla dahil edilmez: .env, vendor/, node_modules/, tests/ ve şemayla ilgisi olmayan diğer kaynak dosyaları.',
                    table: {
                        framework: 'Framework',
                        files: 'Analiz edilen dosyalar',
                        processing: 'İşleme',
                        processing_local: 'Yalnızca tarayıcı',
                        processing_remote: 'Sunucu (oturum açma gerekli)',
                    },
                    frameworks: {
                        laravel: { files: 'database/migrations/*.php' },
                        prisma: { files: 'prisma/schema.prisma' },
                        rails: { files: 'db/schema.rb' },
                        drizzle: { files: 'drizzle/**/*.sql' },
                        entity_framework_core: { files: '*ModelSnapshot.cs' },
                        django: { files: '*/migrations/*.py' },
                    },
                    back: 'Geri',
                },
                change_file_aria: 'Dosyayı değiştir, şu an: {{name}}',
                selected_file: 'Seçilen dosya: {{name}}',
                back: 'Geri',
                import: 'İçe aktar',
                mismatch: {
                    title: 'Bu şema {{detected}} gibi görünüyor, ancak {{selected}} seçtiniz.',
                    description:
                        'Algılanan veritabanı türüne geçin veya başka bir tür seçmek için geri dönün.',
                    switch: '{{database}} veritabanına geç',
                    go_back: 'Geri',
                },
                ambiguous: {
                    title: 'Kaynak DBMS seçin',
                    multiple_dbms_title: 'Birden fazla DBMS algılandı',
                    selection_help_percentages:
                        'Yüzdeler, her DBMS için SQL lehçesi eşleşme indeksini gösterir.',
                    selection_help_recommended:
                        "Yıldız, otomatik olarak algılanan DBMS'yi işaretler.",
                    selection_help_aria: 'Yüzdeler ve öneri hakkında yardım',
                    confidence_explanation:
                        'Yüzdeler, her DBMS için algılanan SQL lehçesiyle eşleşme endeksini gösterir.',
                    description:
                        "SQL lehçesi otomatik olarak tanımlanamadı. Bu şemanın hangi DBMS'den geldiğini onaylayın.",
                    choose_source: 'Kaynak DBMS seç',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} (%{{percent}} güven, otomatik algılama)',
                    recommended_tooltip: 'Önerilen DBMS',
                    recommended_aria: '{{database}}, önerilen DBMS',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Ready to import this diagram.',
                        mismatch_title: 'DBMS uyumsuzluğu',
                        mismatch_description:
                            'Dosya {{detected}} gösteriyor, ancak {{selected}} seçmiştiniz.',
                        unsupported_existing:
                            'Diagram JSON restores a full diagram and cannot be merged into the current one. Export or create a new diagram instead.',
                    },
                    ambiguous: {
                        title: 'Choose the diagram DBMS',
                        description:
                            'Bu içe aktarma için uygulanacak seçeneği belirleyin.',
                        selection_help_percentages:
                            'Yüzdeler, her DBMS için eşleşme indeksini gösterir.',
                        selection_help_recommended:
                            "Yıldız, dosyada belirtilen DBMS'yi işaretler.",
                        selection_help_aria:
                            'Yüzdeler ve öneri hakkında yardım',
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
                    dialect: '{{database}} algılandı',
                    dbml: 'DBML algılandı',
                    metadata_json: 'Meta veri JSON algılandı',
                    diagram_json: 'Diyagram JSON algılandı',
                    sql_ambiguous_title: 'SQL algılandı',
                    sql_ambiguous_description: 'Veritabanı tanımlanamadı.',
                    clickhouse_unsupported: 'ClickHouse SQL algılandı',
                    unsupported: 'Desteklenmeyen format',
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
                    analyzing_project: 'Proje arşivi analiz ediliyor…',
                    detected: '{{framework}} projesi algılandı',
                    migrations_found_one: '{{count}} göç bulundu',
                    migrations_found_other: '{{count}} göç bulundu',
                    schema_files_found_one: '{{count}} şema dosyası bulundu',
                    schema_files_found_other: '{{count}} şema dosyası bulundu',
                    model_snapshots_found_one:
                        '{{count}} model anlık görüntüsü bulundu',
                    model_snapshots_found_other:
                        '{{count}} model anlık görüntüsü bulundu',
                    sql_migrations_found_one: '{{count}} SQL göçü bulundu',
                    sql_migrations_found_other: '{{count}} SQL göçü bulundu',
                    migrations_button_one: '{{count}} göç',
                    migrations_button_other: '{{count}} göç',
                    schema_files_button_one: '{{count}} şema dosyası',
                    schema_files_button_other: '{{count}} şema dosyası',
                    model_snapshots_button_one:
                        '{{count}} model anlık görüntüsü',
                    model_snapshots_button_other:
                        '{{count}} model anlık görüntüsü',
                    sql_migrations_button_one: '{{count}} SQL göçü',
                    sql_migrations_button_other: '{{count}} SQL göçü',
                    multiple_projects_title:
                        'Birden fazla veritabanı şeması algılandı',
                    multiple_projects_description:
                        'Bu arşivde birden fazla desteklenen veritabanı projesi var. Hangisini içe aktaracağınızı seçin.',
                    multiple_database_groups_title:
                        'Birden fazla veritabanı şeması algılandı',
                    multiple_database_groups_description:
                        'Bu proje birden fazla veritabanı şeması içeriyor. Hangisini içe aktaracağınızı seçin.',
                    choose_database_group: 'Veritabanı şeması seçin',
                    group_recommended_aria: '{{label}} önerilir',
                    group_recommended_tooltip: 'Önerilen şema',
                    choose_project: 'Proje seçin',
                    unsupported_project: 'Desteklenmeyen proje arşivi',
                    unsupported_project_description:
                        'Bu arşivde desteklenen bir Laravel, Prisma, Drizzle, Rails, Entity Framework Core veya Django veritabanı projesi bulunamadı.',
                    project_root: 'Proje kökü: {{path}}',
                    sign_in_to_import_framework:
                        'İçe aktarma kullanılabilir olduğunda {{framework}} projelerini içe aktarmak için oturum açın.',
                    remote_processing_notice:
                        'İçe aktarma kullanılabilir olduğunda yalnızca şemayla ilgili dosyalar işlenecek.',
                    remote_processing_scope:
                        'Tam arşiv ve ilgisiz kaynak dosyaları asla yüklenmez.',
                    remote_processing_security:
                        'Analiz statiktir ve yüklenen kodu çalıştırmaz.',
                },
                errors: {
                    unreadable_file: 'Seçilen dosya okunamadı.',
                    malformed_json: 'JSON içeriği ayrıştırılamadı.',
                    unsupported:
                        'Bu format şema içe aktarma için desteklenmiyor.',
                    diagram_json:
                        'Diyagram JSON, diyagram dosyası seçeneğinden içe aktarılabilir.',
                    clickhouse_unsupported:
                        'ClickHouse için SQL DDL içe aktarma desteklenmiyor. DBML kullanın veya mevcut bir veritabanından içe aktarın.',
                    file_too_large: "Seçilen dosya 5 MB'tan büyük.",
                    archive_too_large: 'Seçilen proje arşivi 50 MB’dan büyük.',
                    archive_invalid:
                        'Seçilen dosya geçerli bir proje arşivi değil.',
                    unsupported_file_extension:
                        'Yalnızca .sql, .dbml, .json ve .zip proje arşivleri desteklenir.',
                    import_failed:
                        'Şema içe aktarılamadı. İçeriği kontrol edip tekrar deneyin.',
                    invalid_diagram_json:
                        'Diyagram JSON geçersiz. Dosyayı kontrol edip tekrar deneyin.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS Talimatları',
                    title: 'Talimatlar',
                    step_1: "Araçlar > Seçenekler > Sorgu Sonuçları > SQL Server'a gidin.",
                    step_2: 'Eğer "Sonuçlar Izgaraya" kullanıyorsanız, Maksimum Karakterlerin Alınması için XML olmayan veriler (9999999 olarak ayarlanmış) değiştirin.',
                },
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
            title: 'Diyagramı paylaş',
            description:
                'Düzenleyici veya görüntüleyici erişimiyle işbirlikçileri davet edin. Zaten bir FoxalDB hesabına sahip olmalıdırlar.',
            share_button: 'Paylaş',
            empty_members: 'Henüz işbirlikçi yok.',
            remove: 'Kaldır',
            roles: {
                owner: 'Sahip',
                editor: 'Düzenleyici',
                viewer: 'Görüntüleyici',
            },
            add_member: {
                title: 'İşbirlikçi ekle',
                email_label: 'E-posta',
                email_placeholder: 'E-posta adresi',
                add: 'Ekle',
                adding: 'Ekleniyor…',
                cancel: 'İptal',
            },
            errors: {
                load_failed: 'İşbirlikçiler yüklenemedi.',
                add_failed: 'İşbirlikçi eklenemedi.',
            },
        },

        diagram_role: {
            owner: 'Sahip',
            editor: 'Düzenleyici',
            viewer: 'Görüntüleyici',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Veritabanı Aç',
            description: 'Yeni diyagramınız için veritabanı sistemini seçin.',
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
            import_schema: {
                title: 'Şema içe aktar',
                import: 'İçe aktar',
                cancel: 'İptal',
                mismatch: {
                    title: 'Bu şema {{detected}} gibi görünüyor, ancak bu diyagram {{selected}}.',
                    description:
                        'Farklı veritabanları arası içe aktarma henüz desteklenmiyor.',
                    cancel: 'İptal',
                },
                ambiguous: {
                    description:
                        'SQL lehçesi otomatik olarak tanımlanamadı. Mevcut {{selected}} diyagramı için bu şemanın nasıl yorumlanacağını onaylayın.',
                },
            },
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
            duplicate_table: 'Tabloyu çoğalt',
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

        auth: {
            dialog: {
                account_title: 'Hesap',
                login_title: "FoxalDB'ye giriş yap",
                register_title: 'FoxalDB hesabı oluştur',
                account_description: 'Mevcut oturumunuzu yönetin.',
                login_description:
                    'Daha fazla diyagram kaydetmek ve senkronize etmek için giriş yapın.',
                register_description:
                    'Daha fazla diyagram kaydetmek için bir hesap oluşturun.',
                checking_session: 'Oturum kontrol ediliyor...',
                continue_without_account: 'Hesap olmadan devam et',
            },
            login: {
                title: 'Giriş yap',
                email_label: 'E-posta',
                password_label: 'Şifre',
                submit: 'Giriş yap',
                submitting: 'Giriş yapılıyor...',
                switch_to_register: 'Kayıt ol',
                no_account: 'Hesabınız yok mu?',
            },
            register: {
                title: 'Kayıt ol',
                first_name_label: 'Ad',
                last_name_label: 'Soyad',
                email_label: 'E-posta',
                password_label: 'Şifre',
                password_confirmation_label: 'Şifreyi onayla',
                submit: 'Hesap oluştur',
                submitting: 'Hesap oluşturuluyor...',
                switch_to_login: 'Giriş yap',
                already_have_account: 'Zaten hesabınız var mı?',
            },
            account: {
                signed_in_as: 'Giriş yapıldı:',
                logout: 'Çıkış yap',
                back_to_editor: 'Düzenleyiciye dön',
            },
            settings: {
                title: 'Kullanıcı ayarları',
                description: 'Kişisel bilgilerinizi ve şifrenizi güncelleyin.',
                change_password_heading: 'Şifreyi değiştir',
                current_password_label: 'Mevcut şifre',
                new_password_label: 'Yeni şifre',
                password_confirmation_label: 'Yeni şifreyi onayla',
                first_name_label: 'Ad',
                last_name_label: 'Soyad',
                email_label: 'E-posta adresi',
                submit: 'Kaydet',
                submitting: 'Kaydediliyor...',
                success_title: 'Profil güncellendi',
                success_description: 'Profiliniz kaydedildi.',
            },
            nav: {
                sign_in: 'Giriş yap',
                logout: 'Çıkış yap',
                loading: '...',
                user_menu: 'Hesap',
                settings: 'Ayarlar',
                change_language: 'Dil',
            },
            pages: {
                login_title: 'FoxalDB — Giriş yap',
                register_title: 'FoxalDB — Kayıt ol',
                checking_session: 'Oturum kontrol ediliyor…',
            },
            errors: {
                first_name_required: 'Ad gereklidir.',
                last_name_required: 'Soyad gereklidir.',
                generic: 'Bir şeyler ters gitti.',
            },
        },

        guest_migration_dialog: {
            title: 'Yerel diyagramı içe aktar?',
            description:
                'Bu cihazda kayıtlı bir diyagram var. Her yerden erişmek için hesabınıza aktarın.',
            import: 'Hesaba aktar',
            continue_without_import: 'Aktarmadan devam et',
        },

        guest_migration_errors: {
            import_failed:
                'Yerel diyagram içe aktarılamadı. Yerel kopya korundu.',
            activation_failed:
                'Diyagram oluşturuldu ancak açılamadı. Yerel kopya korundu.',
            cleanup_failed:
                'Diyagram aktarıldı ancak yerel kopya kaldırılamadı. Manuel olarak silebilirsiniz.',
            check_failed: 'Yerel diyagram okunamadı.',
        },

        language_select: {
            change_language: 'Dil',
        },

        on: 'Açık',
        off: 'Kapalı',
    },
};

export const trMetadata: LanguageMetadata = {
    name: 'Turkish',
    nativeName: 'Türkçe',
    code: 'tr',
    countryCode: 'tr',
};
