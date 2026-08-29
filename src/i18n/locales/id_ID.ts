import type { LanguageMetadata, LanguageTranslation } from '../types';

export const id_ID: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Baru',
            browse: 'Buka',
            tables: 'Tabel',
            refs: 'Refs',
            dependencies: 'Ketergantungan',
            custom_types: 'Tipe Kustom',
            conversations: 'Percakapan',
            conversations_unread_aria:
                '{{count}} pesan belum dibaca dalam percakapan',
            visuals: 'Visual',
            activities: 'Aktivitas',
            share: 'Bagikan',
        },
        menu: {
            actions: {
                actions: 'Aksi',
                new: 'Baru...',
                browse: 'Semua database...',
                save: 'Simpan',
                import: 'Impor Database',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Ekspor SQL',
                export_as: 'Ekspor Sebagai',
                delete_diagram: 'Hapus',
            },
            edit: {
                edit: 'Ubah',
                undo: 'Undo',
                redo: 'Redo',
                clear: 'Bersihkan',
            },
            view: {
                view: 'Tampilan',
                show_sidebar: 'Tampilkan Sidebar',
                hide_sidebar: 'Sembunyikan Sidebar',
                hide_cardinality: 'Sembunyikan Kardinalitas',
                show_cardinality: 'Tampilkan Kardinalitas',
                hide_field_attributes: 'Sembunyikan Atribut Kolom',
                show_field_attributes: 'Tampilkan Atribut Kolom',
                zoom_on_scroll: 'Perbesar saat Scroll',
                show_views: 'Tampilan Database',
                theme: 'Tema',
                show_dependencies: 'Tampilkan Dependensi',
                hide_dependencies: 'Sembunyikan Dependensi',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: 'Cadangan',
                export_diagram: 'Ekspor Diagram',
                restore_diagram: 'Pulihkan Diagram',
            },
            help: {
                help: 'Bantuan',
                docs_website: 'Dokumentasi',
                join_discord: 'Bergabunglah di Discord kami',
            },
        },

        delete_diagram_alert: {
            title: 'Pilih basis data Anda',
            description: 'Pilih sistem basis data untuk diagram baru Anda.',
            cancel: 'Batal',
            delete: 'Hapus',
        },

        clear_diagram_alert: {
            title: 'Bersihkan Diagram',
            description:
                'Tindakan ini tidak dapat dibatalkan. Semua data di diagram akan dihapus secara permanen.',
            cancel: 'Batal',
            clear: 'Bersihkan',
        },

        diagram_access: {
            removed: {
                title: 'Pilih basis data Anda',
                description: 'Pilih sistem basis data untuk diagram baru Anda.',
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
            title: 'Atur Otomatis Diagram',
            description:
                'Tindakan ini akan mengatur ulang semua tabel di diagram. Apakah Anda ingin melanjutkan?',
            reorder: 'Atur Otomatis',
            cancel: 'Batal',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Gagal menyalin',
                description: 'Clipboard tidak didukung',
            },
            failed: {
                title: 'Gagal menyalin',
                description: 'Ada yang salah. Silakan coba lagi.',
            },
        },

        theme: {
            system: 'Sistem',
            light: 'Terang',
            dark: 'Gelap',
        },

        zoom: {
            on: 'Aktif',
            off: 'Nonaktif',
        },

        last_saved: 'Terakhir disimpan',
        saved: 'Tersimpan',
        loading_diagram: 'Memuat diagram...',
        deselect_all: 'Batalkan Semua',
        select_all: 'Pilih Semua',
        delete: 'Hapus',
        clear: 'Bersihkan',
        show_more: 'Tampilkan Lebih Banyak',
        show_less: 'Tampilkan Lebih Sedikit',
        copy_to_clipboard: 'Salin ke Clipboard',
        copied: 'Tersalin!',

        side_panel: {
            view_all_options: 'Tampilkan Semua Pilihan...',
            tables_section: {
                tables: 'Tabel',
                add_table: 'Tambah Tabel',
                add_view: 'Tambah Tampilan',
                filter: 'Saring',
                collapse: 'Lipat Semua',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'Semua tabel tersembunyi',
                show_all: 'Tampilkan semua',

                table: {
                    fields: 'Kolom',
                    nullable: 'Bisa Kosong?',
                    primary_key: 'Kunci Utama',
                    indexes: 'Indeks',
                    check_constraints: 'Batasan Pemeriksaan',
                    comments: 'Komentar',
                    no_comments: 'Tidak ada komentar',
                    add_field: 'Tambah Kolom',
                    add_index: 'Tambah Indeks',
                    add_check: 'Tambah Pemeriksaan',
                    index_select_fields: 'Pilih kolom',
                    no_types_found: 'Tidak ada tipe yang ditemukan',
                    field_name: 'Nama',
                    field_type: 'Tipe',
                    field_actions: {
                        title: 'Atribut Kolom',
                        open_discussion: 'Buka percakapan',
                        unique: 'Unik',
                        auto_increment: 'Kenaikan Otomatis',
                        comments: 'Komentar',
                        no_comments: 'Tidak ada komentar',
                        delete_field: 'Hapus Kolom',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Presisi',
                        scale: 'Skala',
                    },
                    index_actions: {
                        title: 'Atribut Indeks',
                        name: 'Nama',
                        unique: 'Unik',
                        index_type: 'Tipe Indeks',
                        delete_index: 'Hapus Indeks',
                    },
                    check_constraint_actions: {
                        title: 'Batasan Pemeriksaan',
                        expression: 'Ekspresi',
                        delete: 'Hapus Batasan',
                    },
                    table_actions: {
                        title: 'Aksi Tabel',
                        open_discussion: 'Buka percakapan',
                        change_schema: 'Ubah Skema',
                        add_field: 'Tambah Kolom',
                        add_index: 'Tambah Indeks',
                        duplicate_table: 'Duplikasi tabel',
                        delete_table: 'Hapus Tabel',
                    },
                },
                empty_state: {
                    title: 'Tidak ada tabel',
                    description: 'Buat tabel untuk memulai',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Saring',
                clear: 'Hapus filter',
                no_results:
                    'Tidak ada referensi yang cocok dengan filter Anda.',
                collapse: 'Lipat Semua',
                add_relationship: 'Tambah Hubungan',
                relationships: 'Hubungan',
                dependencies: 'Dependensi',
                relationship: {
                    relationship: 'Hubungan',
                    primary: 'Tabel Primer',
                    foreign: 'Tabel Terkait',
                    cardinality: 'Kardinalitas',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Hapus',
                    switch_tables: 'Tukar Tabel',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Aksi',
                        open_discussion: 'Buka percakapan',
                        delete_relationship: 'Hapus',
                    },
                },
                dependency: {
                    dependency: 'Dependensi',
                    table: 'Tabel',
                    dependent_table: 'Tampilan Dependen',
                    delete_dependency: 'Hapus',
                    dependency_actions: {
                        title: 'Aksi',
                        delete_dependency: 'Hapus',
                    },
                },
                empty_state: {
                    title: 'Tidak ada hubungan',
                    description: 'Buat hubungan untuk memulai',
                },
            },

            areas_section: {
                areas: 'Area',
                add_area: 'Tambah Area',
                filter: 'Filter',
                clear: 'Hapus Filter',
                no_results: 'Tidak ada area yang cocok dengan filter Anda.',

                area: {
                    area_actions: {
                        title: 'Aksi Area',
                        edit_name: 'Edit Nama',
                        delete_area: 'Hapus Area',
                    },
                },
                empty_state: {
                    title: 'Tidak ada area',
                    description: 'Buat area untuk memulai',
                },
            },

            visuals_section: {
                visuals: 'Visual',
                tabs: {
                    areas: 'Area',
                    notes: 'Catatan',
                },
            },

            notes_section: {
                filter: 'Filter',
                add_note: 'Tambah Catatan',
                no_results: 'Tidak ada catatan ditemukan',
                clear: 'Hapus Filter',
                empty_state: {
                    title: 'Tidak Ada Catatan',
                    description:
                        'Buat catatan untuk menambahkan anotasi teks di kanvas',
                },
                note: {
                    empty_note: 'Catatan kosong',
                    note_actions: {
                        title: 'Aksi Catatan',
                        edit_content: 'Edit Konten',
                        delete_note: 'Hapus Catatan',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Tipe Kustom',
                filter: 'Filter',
                clear: 'Hapus Filter',
                no_results:
                    'Tidak ada tipe kustom yang cocok dengan filter Anda.',
                new_type: 'Tipe Baru',
                empty_state: {
                    title: 'Tidak ada tipe kustom',
                    description:
                        'Tipe kustom akan muncul di sini ketika tersedia di database Anda',
                },
                custom_type: {
                    kind: 'Jenis',
                    enum_values: 'Nilai Enum',
                    composite_fields: 'Field',
                    no_fields: 'Tidak ada field yang ditentukan',
                    no_values: 'Tidak ada nilai enum yang ditentukan',
                    field_name_placeholder: 'Nama field',
                    field_type_placeholder: 'Pilih tipe',
                    add_field: 'Tambah Field',
                    no_fields_tooltip:
                        'Tidak ada field yang ditentukan untuk tipe kustom ini',
                    custom_type_actions: {
                        title: 'Aksi',
                        highlight_fields: 'Sorot Field',
                        delete_custom_type: 'Hapus',
                        clear_field_highlight: 'Hapus Sorotan',
                    },
                    delete_custom_type: 'Hapus Tipe',
                },
            },
            conversations_section: {
                title: 'Percakapan',
                tabs_label: 'Percakapan',
                tabs: {
                    active: 'Aktif',
                    archives: 'Diarsipkan',
                },
                loading: 'Memuat percakapan…',
                filter: 'Filter',
                clear: 'Hapus filter',
                no_results_title: 'Tidak ada hasil',
                no_results_description:
                    'Tidak ada percakapan yang cocok dengan filter Anda.',

                type_filter: {
                    trigger: 'Tipe',
                    label: 'Filter menurut tipe',
                    trigger_aria: 'Filter menurut tipe percakapan',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'Coba lagi',
                dismiss: 'Dismiss',
                read_only: 'Hanya baca',
                deleted_user: 'Pengguna dihapus',
                unread: {
                    badge_aria: '{{count}} pesan belum dibaca',
                },
                inactive: {
                    title: 'Percakapan unavailable',
                    description:
                        'Percakapan are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'Tidak ada percakapan',
                    active_description: 'Buat percakapan untuk memulai',
                    archives_title: 'No archived percakapan',
                    archives_description:
                        'Archived percakapan will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load percakapan',
                    load_description:
                        'Something went wrong while loading percakapan. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'Buka percakapan',
                    start: 'Mulai percakapan',
                    pending: 'Memulai percakapan…',
                    diagram_name: 'Diagram',
                    open_aria: 'Buka percakapan untuk {{name}}',
                    start_aria: 'Mulai percakapan untuk {{name}}',
                    open_tooltip: 'Buka percakapan untuk {{name}}',
                    start_tooltip: 'Mulai percakapan untuk {{name}}',
                    pending_tooltip: 'Memulai percakapan untuk {{name}}…',
                    action_tooltip: 'Percakapan',
                    unavailable_description:
                        'Anda tidak dapat memulai percakapan pada diagram ini.',
                    errors: {
                        validation: 'Target ini tidak valid untuk percakapan.',
                        forbidden:
                            'Anda tidak memiliki izin untuk memulai percakapan ini.',
                        not_found:
                            'Target ini tidak lagi tersedia pada diagram.',
                        conflict:
                            'Percakapan tidak dapat dimulai sekarang. Silakan coba lagi.',
                        generic:
                            'Tidak dapat membuka percakapan ini. Silakan coba lagi.',
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
                    message_count: '{{count}} pesan',
                    no_messages: 'Belum ada pesan',
                    last_activity: 'Aktivitas terakhir',
                    open_aria: 'Buka percakapan untuk {{target}}',
                    focus_target_aria: 'Tampilkan {{target}} di diagram',
                    author_tooltip: 'Pesan terakhir dari {{name}}',
                    author_missing_tooltip: 'Tidak ada informasi penulis',
                    actions: {
                        menu_aria: 'Opsi percakapan',
                        open: 'Buka',
                        delete: 'Hapus',
                    },
                    delete_dialog: {
                        title: 'Hapus percakapan?',
                        description:
                            'Ini akan menghapus percakapan ini dan semua pesannya secara permanen.',
                        cancel: 'Batal',
                        confirm: 'Hapus',
                        deleting: 'Menghapus…',
                        errors: {
                            delete_failed:
                                'Tidak dapat menghapus percakapan ini. Silakan coba lagi.',
                            forbidden:
                                'Anda tidak memiliki izin untuk menghapus percakapan ini.',
                            not_found: 'Percakapan ini tidak lagi tersedia.',
                        },
                    },
                },
                detail: {
                    back: 'Kembali',
                    back_aria: 'Kembali ke daftar percakapan',
                    loading: 'Memuat pesan…',
                    loading_more: 'Memuat pesan yang lebih lama…',
                    load_older: 'Muat pesan yang lebih lama',
                    new_messages_badge_one: '1 pesan baru',
                    new_messages_badge_other: '{{count}} pesan baru',
                    new_messages_badge_label_one: 'pesan baru',
                    new_messages_badge_label_other: 'pesan baru',
                    new_messages_badge_aria_one: 'Gulir ke pesan baru',
                    new_messages_badge_aria_other:
                        'Gulir ke {{count}} pesan baru',
                    empty: {
                        title: 'Tidak ada pesan',
                        description: 'Percakapan ini tidak memiliki pesan.',
                    },
                    errors: {
                        load_title: 'Tidak dapat memuat pesan',
                        load_description:
                            'Terjadi kesalahan saat memuat pesan. Silakan coba lagi.',
                    },
                    archive_banner: {
                        title: 'Percakapan diarsipkan',
                        description:
                            'Percakapan ini hanya baca. Pesan tidak dapat ditambahkan, diedit, atau dihapus.',
                    },
                    metadata: {
                        status_label: 'Status',
                        status_active: 'Aktif',
                        status_archived: 'Diarsipkan',
                        message_count_label: 'Jumlah pesan',
                        message_count: '{{count}} pesan',
                    },
                    message: {
                        edited: '(diedit)',
                        edited_aria: 'Pesan telah diedit',
                        day_separator: {
                            today: 'Hari ini',
                            yesterday: 'Kemarin',
                        },
                        actions: {
                            title: 'Tindakan pesan',
                            edit: 'Edit',
                            delete: 'Hapus',
                        },
                        reactions: {
                            add_aria: 'Tambah reaksi',
                            add_tooltip: 'Tambah reaksi',
                            picker_loading: 'Memuat pemilih emoji…',
                            picker_aria_label: 'Pemilih emoji',
                            picker_search_placeholder: 'Cari emoji…',
                            picker_empty: 'Tidak ada emoji ditemukan.',
                            chip_aria: 'Reaksi {{emoji}}, {{count}}',
                            preview_and_others_one: 'dan {{count}} lainnya',
                            preview_and_others_other: 'dan {{count}} lainnya',
                            errors: {
                                generic:
                                    'Tidak dapat memperbarui reaksi. Silakan coba lagi.',
                                forbidden:
                                    'Anda tidak diizinkan memberi reaksi pada pesan ini.',
                                archived:
                                    'Percakapan ini diarsipkan dan reaksi hanya-baca.',
                                not_found: 'Pesan ini tidak lagi tersedia.',
                                invalid_emoji: 'Emoji ini tidak valid.',
                            },
                        },
                    },
                    composer: {
                        label: 'Pesan',
                        placeholder: 'Tulis pesan…',
                        submit: 'Kirim',
                        submitting: 'Mengirim…',
                        form_aria_label: 'Pesan percakapan baru',
                        keyboard_hint:
                            'Tekan Enter untuk mengirim. Shift+Enter untuk baris baru.',
                        counter_aria_label:
                            '{{count}} dari {{max}} karakter digunakan',
                        errors: {
                            empty: 'Masukkan pesan untuk dikirim.',
                            too_long:
                                'Pesan tidak boleh melebihi 2000 karakter.',
                            create_failed:
                                'Tidak dapat mengirim pesan. Silakan coba lagi.',
                        },
                    },
                    edit: {
                        label: 'Pesan',
                        form_aria_label: 'Edit pesan percakapan',
                        save: 'Simpan',
                        saving: 'Menyimpan…',
                        cancel: 'Batal',
                        counter_aria_label:
                            '{{count}} dari {{max}} karakter digunakan',
                        errors: {
                            empty: 'Masukkan pesan untuk disimpan.',
                            too_long:
                                'Pesan tidak boleh melebihi 2000 karakter.',
                            update_failed:
                                'Tidak dapat memperbarui pesan. Silakan coba lagi.',
                        },
                    },
                    delete_dialog: {
                        title: 'Hapus pesan',
                        description:
                            'Yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.',
                        cancel: 'Batal',
                        confirm: 'Hapus',
                        deleting: 'Menghapus…',
                        errors: {
                            delete_failed:
                                'Tidak dapat menghapus pesan ini. Silakan coba lagi.',
                        },
                    },
                    mutation_errors: {
                        forbidden:
                            'Anda tidak memiliki izin untuk mengubah pesan ini.',
                        archived: 'Percakapan ini diarsipkan dan hanya-baca.',
                        not_found:
                            'Percakapan atau pesan ini tidak lagi tersedia.',
                    },
                },

                targets: {
                    diagram: 'Diagram',
                    table: 'Tabel',
                    field: 'Kolom',
                    relationship: 'Relasi',
                    unknown: 'Percakapan',
                },
                target_labels: {
                    diagram: 'Diagram',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Tabel dihapus',
                    missing_field: 'Kolom dihapus',
                    missing_relationship: 'Relasi dihapus',
                    unknown: 'Percakapan',
                },
            },
            activities_section: {
                title: 'Aktivitas',
                filter: 'Filter',
                clear: 'Hapus Filter',
                no_results:
                    'Tidak ada aktivitas yang cocok dengan filter Anda.',
                loading: 'Memuat aktivitas…',
                retry: 'Coba lagi',
                type_filter: {
                    trigger: 'Jenis',
                    label: 'Filter menurut jenis',
                    trigger_aria: 'Filter menurut jenis aktivitas',
                },
                types: {
                    diagram: 'Diagram',
                    table: 'Tabel',
                    field: 'Kolom',
                    relationship: 'Relasi',
                    note: 'Catatan',
                    area: 'Area',
                    dependency: 'Dependensi',
                },
                you: 'Anda',
                unknown_user: 'Seseorang',
                empty_state: {
                    title: 'Belum ada aktivitas',
                    description:
                        'Mulai mengedit untuk melihat perubahan terbaru.',
                },
                errors: {
                    load_failed: 'Tidak dapat memuat aktivitas.',
                },
                actions: {
                    add_tables: '{{user}} menambahkan tabel {{table}}',
                    remove_tables: '{{user}} menghapus tabel',
                    add_field: '{{user}} menambahkan kolom {{field}}',
                    remove_field: '{{user}} menghapus kolom',
                    update_field: '{{user}} memperbarui kolom {{field}}',
                    add_relationships: '{{user}} menambahkan relasi',
                    remove_relationships: '{{user}} menghapus relasi',
                    update_relationship: '{{user}} memperbarui relasi',
                    add_notes: '{{user}} menambahkan catatan',
                    remove_notes: '{{user}} menghapus catatan',
                    add_areas: '{{user}} menambahkan area',
                    remove_areas: '{{user}} menghapus area',
                    add_dependencies: '{{user}} menambahkan dependensi',
                    remove_dependencies: '{{user}} menghapus dependensi',
                    fallback: '{{user}} memperbarui diagram',
                },
            },
            share_section: {
                title: 'Bagikan',
                tabs_label: 'Opsi berbagi',
                tabs: {
                    collaborators: 'Kolaborator',
                    public_link: 'Tautan publik',
                },
                collaborators: {
                    description:
                        'Undang kolaborator dengan akses editor atau penampil. Mereka harus sudah memiliki akun FoxalDB.',
                    filter: 'Filter',
                    clear: 'Hapus filter',
                    no_results_title: 'Tidak ada hasil',
                    no_results_description:
                        'Tidak ada kolaborator yang cocok dengan filter Anda.',
                    role_filter: {
                        trigger: 'Peran',
                        label: 'Filter menurut peran',
                        trigger_aria: 'Filter menurut peran kolaborator',
                    },
                },
                public_link: {
                    title: 'Tautan publik',
                    description:
                        'Bagikan snapshot hanya-baca diagram Anda dengan siapa pun yang memiliki tautan.',
                    coming_soon: 'Segera hadir.',
                },
                loading: 'Memuat kolaborator…',
                retry: 'Coba lagi',
                errors: {
                    load_failed: 'Tidak dapat memuat kolaborator.',
                },
                member_actions: {
                    title: 'Tindakan kolaborator',
                    trigger_aria: 'Tindakan kolaborator',
                    role: 'Peran',
                    remove: 'Hapus kolaborator',
                },
            },
        },

        toolbar: {
            zoom_in: 'Perbesar',
            zoom_out: 'Perkecil',
            save: 'Simpan',
            show_all: 'Tampilkan Semua',
            undo: 'Undo',
            redo: 'Redo',
            reorder_diagram: 'Atur Otomatis Diagram',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Sorot Tabel yang Tumpang Tindih',
            filter: 'Filter Tabel',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Pilih basis data Anda',
                description: 'Pilih sistem basis data untuk diagram baru Anda.',
                search_placeholder: 'Cari sistem manajemen basis data…',
                search_no_results:
                    'Tidak ada sistem manajemen basis data yang cocok dengan pencarian Anda.',
                clear_search: 'Hapus pencarian',
                primary_group: 'Basis data utama',
                other_group: 'Basis data lainnya',
                check_examples_long: 'Lihat Contoh',
                check_examples_short: 'Contoh',
            },

            choose_intent: {
                title: 'Apa yang ingin Anda lakukan?',
                description: 'Buat diagram baru untuk {{database}}.',
                create_empty: 'Buat diagram kosong',
                create_empty_description:
                    'Mulai dari awal dengan menambahkan tabel sendiri.',
                import: 'Impor',
                import_description:
                    'Dari file, teks yang ditempel, atau database Anda.',
                back: 'Kembali',
            },

            choose_import_method: {
                title: 'Bagaimana Anda ingin mengimpor?',
                description: 'Pilih sumber untuk diagram {{database}} Anda.',
                from_file: 'File atau teks yang ditempel',
                from_file_description: 'SQL, DBML, atau JSON diagram.',
                from_database: 'Database yang ada',
                from_database_description:
                    'Jalankan kueri di database Anda dan tempel hasilnya.',
                back: 'Kembali',
            },

            import_from_database: {
                title: 'Impor dari database yang ada',
                description:
                    'Gunakan ini jika Anda tidak memiliki file skema SQL atau DBML. Jalankan kueri di database Anda, lalu tempel hasilnya di bawah.',
                database_edition: 'Edisi database',
                edition_regular: 'Reguler',
                run_query: 'Jalankan kueri ini di database Anda',
                client_sql: 'SQL',
                paste_result: 'Tempel hasil',
                paste_result_placeholder: 'Tempel hasil kueri di sini…',
                check_result: 'Periksa hasil',
                valid_result: 'Hasil terlihat valid.',
                invalid_result:
                    'Hasil tidak dapat divalidasi. Periksa konten dan coba lagi.',
                truncated_result:
                    'Hasil mungkin terpotong. Sesuaikan pengaturan klien SQL dan jalankan kueri lagi.',
                waiting_for_result: 'Tempel hasil kueri untuk melanjutkan.',
                unsupported_database:
                    'Ekstraksi skema tidak tersedia untuk jenis database ini.',
                import_failed:
                    'Skema database tidak dapat diimpor. Periksa hasil dan coba lagi.',
                back: 'Kembali',
                import: 'Impor',
            },

            import_schema: {
                title: 'Tempel skema Anda',
                textarea_label: 'Konten skema',
                textarea_placeholder:
                    'Tempel SQL, DBML, atau metadata JSON di sini…',
                auto_detect_hint:
                    'Kami akan mendeteksi format secara otomatis.',
                or_divider: 'ATAU',
                choose_file: 'Pilih file',
                change_file_aria: 'Ubah file, saat ini: {{name}}',
                selected_file: 'File dipilih: {{name}}',
                back: 'Kembali',
                import: 'Impor',
                mismatch: {
                    title: 'Skema ini terlihat seperti {{detected}}, tetapi Anda memilih {{selected}}.',
                    description:
                        'Beralih ke jenis basis data yang terdeteksi atau kembali untuk memilih yang lain.',
                    switch: 'Beralih ke {{database}}',
                    go_back: 'Kembali',
                },
                ambiguous: {
                    title: 'Pilih DBMS sumber',
                    description:
                        'Dialek SQL tidak dapat diidentifikasi secara otomatis. Konfirmasikan DBMS asal skema ini.',
                    choose_source: 'Pilih DBMS sumber',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% keyakinan, deteksi otomatis)',
                    recommended_tooltip: 'DBMS terdeteksi otomatis',
                    recommended_aria: '{{database}}, DBMS terdeteksi otomatis',
                },
                detection: {
                    dialect: '{{database}} terdeteksi',
                    dbml: 'DBML terdeteksi',
                    metadata_json: 'Metadata JSON terdeteksi',
                    diagram_json: 'JSON diagram terdeteksi',
                    sql_ambiguous_title: 'SQL terdeteksi',
                    sql_ambiguous_description:
                        'DBMS tidak dapat diidentifikasi secara otomatis.',
                    clickhouse_unsupported: 'SQL ClickHouse terdeteksi',
                    unsupported: 'Format tidak didukung',
                },
                errors: {
                    unreadable_file: 'File yang dipilih tidak dapat dibaca.',
                    malformed_json: 'Konten JSON tidak dapat diurai.',
                    unsupported: 'Format ini tidak didukung untuk impor skema.',
                    diagram_json:
                        'JSON diagram dapat diimpor dari opsi file diagram.',
                    clickhouse_unsupported:
                        'Impor DDL SQL tidak didukung untuk ClickHouse. Gunakan DBML atau impor dari basis data yang ada.',
                    file_too_large: 'File yang dipilih lebih besar dari 5 MB.',
                    import_failed:
                        'Skema tidak dapat diimpor. Periksa konten dan coba lagi.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'Instruksi SSMS',
                    title: 'Instruksi',
                    step_1: 'Pergi ke Alat > Opsi > Hasil Kueri > SQL Server.',
                    step_2: 'Jika Anda menggunakan "Hasil ke Grid," ubah Jumlah Karakter yang Diterima untuk Data Non-XML (disetel ke 9999999).',
                },
            },

            cancel: 'Batal',
            import_from_file: 'Impor dari file',
            back: 'Kembali',
            empty_diagram: 'Database Kosong',
            continue: 'Lanjutkan',
            import: 'Impor',
        },

        share_diagram_dialog: {
            title: 'Bagikan diagram',
            description:
                'Undang kolaborator dengan akses editor atau penampil. Mereka harus sudah memiliki akun FoxalDB.',
            share_button: 'Bagikan',
            empty_members: 'Belum ada kolaborator.',
            remove: 'Hapus',
            roles: {
                owner: 'Pemilik',
                editor: 'Editor',
                viewer: 'Penampil',
            },
            add_member: {
                title: 'Tambah kolaborator',
                email_label: 'Email',
                email_placeholder: 'Alamat email',
                add: 'Tambah',
                adding: 'Menambahkan…',
                cancel: 'Batal',
            },
            errors: {
                load_failed: 'Tidak dapat memuat kolaborator.',
                add_failed: 'Tidak dapat menambahkan kolaborator.',
            },
        },

        diagram_role: {
            owner: 'Pemilik',
            editor: 'Editor',
            viewer: 'Penampil',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Buka Database',
            description: 'Pilih sistem basis data untuk diagram baru Anda.',
            table_columns: {
                name: 'Name',
                created_at: 'Dibuat pada',
                last_modified: 'Terakhir diubah',
                tables_count: 'Tabel',
            },
            cancel: 'Batal',
            open: 'Buka',
            new_database: 'Database Baru',

            diagram_actions: {
                open: 'Buka',
                duplicate: 'Duplikat',
                delete: 'Hapus',
            },
        },

        export_sql_dialog: {
            title: 'Ekspor SQL',
            description: 'Ekspor skema diagram Anda ke skrip {{databaseType}}',
            close: 'Tutup',
            loading: {
                text: 'AI sedang membuat SQL untuk {{databaseType}}...',
                description: 'Ini akan memakan waktu hingga 30 detik.',
            },
            error: {
                message:
                    'Kesalahan saat menghasilkan skrip SQL. Silakan coba lagi nanti atau <0>hubungi kami</0>.',
                description:
                    'Silakan gunakan OPENAI_TOKEN Anda, lihat petunjuk <0>di sini</0>.',
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
            title: 'Buat Hubungan',
            primary_table: 'Tabel Primer',
            primary_field: 'Kolom Primer',
            referenced_table: 'Tabel Referensi',
            referenced_field: 'Kolom Referensi',
            primary_table_placeholder: 'Pilih tabel',
            primary_field_placeholder: 'Pilih kolom',
            referenced_table_placeholder: 'Pilih tabel',
            referenced_field_placeholder: 'Pilih kolom',
            no_tables_found: 'Tidak ada tabel yang ditemukan',
            no_fields_found: 'Tidak ada kolom yang ditemukan',
            create: 'Buat',
            cancel: 'Batal',
        },

        import_database_dialog: {
            title: 'Impor ke Diagram Saat Ini',
            import_schema: {
                title: 'Impor skema',
                import: 'Impor',
                cancel: 'Batal',
                mismatch: {
                    title: 'Skema ini terlihat seperti {{detected}}, tetapi diagram ini adalah {{selected}}.',
                    description: 'Impor lintas database belum didukung.',
                    cancel: 'Batal',
                },
                ambiguous: {
                    description:
                        'Dialek SQL tidak dapat diidentifikasi secara otomatis. Konfirmasikan cara menafsirkan skema ini untuk diagram {{selected}} saat ini.',
                },
            },
            override_alert: {
                title: 'Impor Database',
                content: {
                    alert: 'Mengimpor diagram ini akan memengaruhi tabel dan hubungan yang ada.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> tabel baru akan ditambahkan.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> hubungan baru akan dibuat.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> tabel akan ditimpa.',
                    proceed: 'Apakah Anda ingin melanjutkan?',
                },
                import: 'Impor',
                cancel: 'Batal',
            },
        },

        export_image_dialog: {
            title: 'Ekspor Gambar',
            description: 'Pilih faktor skala untuk ekspor:',
            scale_1x: '1x (Kualitas Rendah)',
            scale_2x: '2x (Kualitas Normal)',
            scale_4x: '4x (Kualitas Terbaik)',
            cancel: 'Batal',
            export: 'Ekspor',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'Pilih Skema',
            description:
                'Skema yang sedang ditampilkan. Pilih salah satu untuk tabel baru.',
            cancel: 'Batal',
            confirm: 'Konfirmasi',
        },

        update_table_schema_dialog: {
            title: 'Ubah Skema',
            description: 'Perbarui skema tabel "{{tableName}}"',
            cancel: 'Batal',
            confirm: 'Ubah',
        },

        create_table_schema_dialog: {
            title: 'Buat Skema Baru',
            description:
                'Belum ada skema yang tersedia. Buat skema pertama Anda untuk mengatur tabel-tabel Anda.',
            create: 'Buat',
            cancel: 'Batal',
        },
        export_diagram_dialog: {
            title: 'Ekspor Diagram',
            description: 'Pilih format untuk ekspor:',
            format_json: 'JSON',
            cancel: 'Batal',
            export: 'Ekspor',
            error: {
                title: 'Error ekspor diagram',
                description:
                    'Sesuatu yang salah. Butuh bantuan? support@chartdb.io',
            },
        },

        import_diagram_dialog: {
            title: 'Impor Diagram',
            description: 'Tempel diagram JSON di bawah:',
            cancel: 'Batal',
            import: 'Impor',
            error: {
                title: 'Error impor diagram',
                description:
                    'Diagram JSON tidak valid. Silakan cek JSON dan coba lagi. Butuh bantuan? support@chartdb.io',
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
            one_to_one: 'Satu ke Satu',
            one_to_many: 'Satu ke Banyak',
            many_to_one: 'Banyak ke Satu',
            many_to_many: 'Banyak ke Banyak',
        },

        canvas_context_menu: {
            new_table: 'Tabel Baru',
            new_view: 'Tampilan Baru',
            new_relationship: 'Hubungan Baru',
            // TODO: Translate
            new_area: 'Area Baru',
            new_note: 'Catatan Baru',
        },

        table_node_context_menu: {
            edit_table: 'Ubah Tabel',
            delete_table: 'Hapus Tabel',
            duplicate_table: 'Duplikasi tabel',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'Pindahkan ke Area',
            no_area: 'Tanpa Area',
        },

        canvas: {
            all_tables_hidden: 'Semua tabel tersembunyi',
            show_all_tables: 'Tampilkan semua',
        },

        canvas_filter: {
            title: 'Filter Tabel',
            search_placeholder: 'Cari tabel...',
            group_by_schema: 'Kelompokkan berdasarkan Skema',
            group_by_area: 'Kelompokkan berdasarkan Area',
            no_tables_found: 'Tidak ada tabel ditemukan',
            empty_diagram_description: 'Buat tabel untuk memulai',
            no_tables_description: 'Coba sesuaikan pencarian atau filter Anda',
            clear_filter: 'Hapus filter',
        },

        snap_to_grid_tooltip: 'Snap ke Kisi (Tahan {{key}})',

        editing_conflict: {
            one: '{{name}} juga sedang mengedit ini.',
            two: '{{name1}} dan {{name2}} juga sedang mengedit ini.',
            many: '{{name}} dan {{count}} lainnya juga sedang mengedit ini.',
            fallback_name: 'Kolaborator',
            last_writer_wins:
                'Perubahan tidak dikunci. Suntingan tersimpan terakhir yang menang.',
        },

        tool_tips: {
            double_click_to_edit: 'Klik ganda untuk mengedit',
        },

        auth: {
            dialog: {
                account_title: 'Akun',
                login_title: 'Masuk ke FoxalDB',
                register_title: 'Buat akun FoxalDB',
                account_description: 'Kelola sesi Anda saat ini.',
                login_description:
                    'Masuk untuk menyimpan lebih banyak diagram dan menyinkronkannya.',
                register_description:
                    'Buat akun untuk menyimpan lebih banyak diagram.',
                checking_session: 'Memeriksa sesi...',
                continue_without_account: 'Lanjutkan tanpa akun',
            },
            login: {
                title: 'Masuk',
                email_label: 'Email',
                password_label: 'Kata sandi',
                submit: 'Masuk',
                submitting: 'Sedang masuk...',
                switch_to_register: 'Daftar',
                no_account: 'Belum punya akun?',
            },
            register: {
                title: 'Daftar',
                first_name_label: 'Nama depan',
                last_name_label: 'Nama belakang',
                email_label: 'Email',
                password_label: 'Kata sandi',
                password_confirmation_label: 'Konfirmasi kata sandi',
                submit: 'Buat akun',
                submitting: 'Membuat akun...',
                switch_to_login: 'Masuk',
                already_have_account: 'Sudah punya akun?',
            },
            account: {
                signed_in_as: 'Masuk sebagai',
                logout: 'Keluar',
                back_to_editor: 'Kembali ke editor',
            },
            settings: {
                title: 'Pengaturan pengguna',
                description: 'Perbarui informasi pribadi dan kata sandi Anda.',
                change_password_heading: 'Ubah kata sandi',
                current_password_label: 'Kata sandi saat ini',
                new_password_label: 'Kata sandi baru',
                password_confirmation_label: 'Konfirmasi kata sandi baru',
                first_name_label: 'Nama depan',
                last_name_label: 'Nama belakang',
                email_label: 'Alamat email',
                submit: 'Simpan perubahan',
                submitting: 'Menyimpan...',
                success_title: 'Profil diperbarui',
                success_description: 'Profil Anda telah disimpan.',
            },
            nav: {
                sign_in: 'Masuk',
                logout: 'Keluar',
                loading: '...',
                user_menu: 'Akun',
                settings: 'Pengaturan',
                change_language: 'Bahasa',
            },
            pages: {
                login_title: 'FoxalDB — Masuk',
                register_title: 'FoxalDB — Daftar',
                checking_session: 'Memeriksa sesi…',
            },
            errors: {
                first_name_required: 'Nama depan wajib diisi.',
                last_name_required: 'Nama belakang wajib diisi.',
                generic: 'Terjadi kesalahan.',
            },
        },

        guest_migration_dialog: {
            title: 'Impor diagram lokal?',
            description:
                'Anda memiliki diagram yang disimpan di perangkat ini. Impor ke akun untuk mengakses dari mana saja.',
            import: 'Impor ke akun',
            continue_without_import: 'Lanjut tanpa mengimpor',
        },

        guest_migration_errors: {
            import_failed:
                'Tidak dapat mengimpor diagram lokal. Salinan lokal tetap disimpan.',
            activation_failed:
                'Diagram dibuat tetapi tidak dapat dibuka. Salinan lokal tetap disimpan.',
            cleanup_failed:
                'Diagram diimpor tetapi salinan lokal tidak dapat dihapus. Anda dapat menghapusnya secara manual.',
            check_failed: 'Tidak dapat membaca diagram lokal.',
        },

        language_select: {
            change_language: 'Bahasa',
        },

        on: 'Aktif',
        off: 'Nonaktif',
    },
};

export const id_IDMetadata: LanguageMetadata = {
    name: 'Indonesian (Indonesia)',
    nativeName: 'Bahasa Indonesia',
    code: 'id_ID',
    countryCode: 'id',
};
