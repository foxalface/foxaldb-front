import type { LanguageMetadata, LanguageTranslation } from '../types';

export const vi: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Mới',
            browse: 'Mở',
            tables: 'Bảng',
            refs: 'Refs',
            dependencies: 'Phụ thuộc',
            custom_types: 'Kiểu tùy chỉnh',
            comments: 'Thảo luận',
            visuals: 'Hình ảnh',
        },
        menu: {
            actions: {
                actions: 'Hành động',
                new: 'Mới...',
                browse: 'Tất cả cơ sở dữ liệu...',
                save: 'Lưu',
                import: 'Nhập cơ sở dữ liệu',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Xuất SQL',
                export_as: 'Xuất thành',
                delete_diagram: 'Xóa',
            },
            edit: {
                edit: 'Sửa',
                undo: 'Hoàn tác',
                redo: 'Làm lại',
                clear: 'Xóa',
            },
            view: {
                view: 'Xem',
                show_sidebar: 'Hiển thị thanh bên',
                hide_sidebar: 'Ẩn thanh bên',
                hide_cardinality: 'Ẩn số lượng',
                show_cardinality: 'Hiển thị số lượng',
                show_field_attributes: 'Hiển thị thuộc tính trường',
                hide_field_attributes: 'Ẩn thuộc tính trường',
                zoom_on_scroll: 'Thu phóng khi cuộn',
                show_views: 'Chế độ xem Cơ sở dữ liệu',
                theme: 'Chủ đề',
                show_dependencies: 'Hiển thị các phụ thuộc',
                hide_dependencies: 'Ẩn các phụ thuộc',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: 'Hỗ trợ',
                export_diagram: 'Xuất sơ đồ',
                restore_diagram: 'Khôi phục sơ đồ',
            },
            help: {
                help: 'Trợ giúp',
                docs_website: 'Tài liệu',
                join_discord: 'Tham gia Discord',
            },
        },

        delete_diagram_alert: {
            title: 'Xóa sơ đồ',
            description:
                'Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn sơ đồ.',
            cancel: 'Hủy',
            delete: 'Xóa',
        },

        clear_diagram_alert: {
            title: 'Xóa dữ liệu trong sơ đồ',
            description:
                'Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn mọi dữ liệu trong sơ đồ.',
            cancel: 'Hủy',
            clear: 'Xóa',
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
            title: 'Tự động sắp xếp sơ đồ',
            description:
                'Hành động này sẽ sắp xếp lại tất cả các bảng trong sơ đồ. Bạn có muốn tiếp tục không?',
            reorder: 'Tự động sắp xếp',
            cancel: 'Hủy',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Sao chép thất bại',
                description: 'Không hỗ trợ bảng tạm',
            },
            failed: {
                title: 'Sao chép thất bại',
                description: 'Đã xảy ra lỗi. Vui lòng thử lại.',
            },
        },

        theme: {
            system: 'Hệ thống',
            light: 'Sáng',
            dark: 'Tối',
        },

        zoom: {
            on: 'Bật',
            off: 'Tất',
        },

        last_saved: 'Đã lưu lần cuối',
        saved: 'Đã lưu',
        loading_diagram: 'Đang tải sơ đồ...',
        deselect_all: 'Bỏ chọn tất cả',
        select_all: 'Chọn tất cả',
        clear: 'Xóa',
        show_more: 'Hiển thị thêm',
        show_less: 'Hiển thị ít hơn',
        copy_to_clipboard: 'Sao chép vào bảng tạm',
        copied: 'Đã sao chép!',

        side_panel: {
            view_all_options: 'Xem tất cả tùy chọn...',
            tables_section: {
                tables: 'Bảng',
                add_table: 'Thêm bảng',
                add_view: 'Thêm Chế độ xem',
                filter: 'Lọc',
                collapse: 'Thu gọn tất cả',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'Tất cả bảng đã bị ẩn',
                show_all: 'Hiển thị tất cả',

                table: {
                    fields: 'Trường',
                    nullable: 'Có thể NULL?',
                    primary_key: 'Khóa chính',
                    indexes: 'Chỉ mục',
                    check_constraints: 'Ràng buộc kiểm tra',
                    comments: 'Bình luận',
                    no_comments: 'Không có bình luận',
                    add_field: 'Thêm trường',
                    add_index: 'Thêm chỉ mục',
                    add_check: 'Thêm kiểm tra',
                    index_select_fields: 'Chọn trường',
                    no_types_found: 'Không tìm thấy',
                    field_name: 'Tên trường',
                    field_type: 'Loại trường',
                    field_actions: {
                        title: 'Thuộc tính trường',
                        open_discussion: 'Mở thảo luận',
                        unique: 'Giá trị duy nhất',
                        auto_increment: 'Tự động tăng',
                        comments: 'Bình luận',
                        no_comments: 'Không có bình luận',
                        delete_field: 'Xóa trường',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Độ chính xác',
                        scale: 'Tỷ lệ',
                    },
                    index_actions: {
                        title: 'Thuộc tính chỉ mục',
                        name: 'Tên',
                        unique: 'Giá trị duy nhất',
                        index_type: 'Loại chỉ mục',
                        delete_index: 'Xóa chỉ mục',
                    },
                    check_constraint_actions: {
                        title: 'Ràng buộc kiểm tra',
                        expression: 'Biểu thức',
                        delete: 'Xóa ràng buộc',
                    },
                    table_actions: {
                        title: 'Hành động',
                        open_discussion: 'Mở thảo luận',
                        change_schema: 'Thay đổi lược đồ',
                        add_field: 'Thêm trường',
                        add_index: 'Thêm chỉ mục',
                        duplicate_table: 'Nhân đôi bảng',
                        delete_table: 'Xóa bảng',
                    },
                },
                empty_state: {
                    title: 'Không có bảng',
                    description: 'Tạo một bảng để bắt đầu',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Lọc',
                collapse: 'Thu gọn tất cả',
                add_relationship: 'Thêm quan hệ',
                relationships: 'Quan hệ',
                dependencies: 'Phụ thuộc',
                relationship: {
                    relationship: 'Quan hệ',
                    primary: 'Bảng chính',
                    foreign: 'Bảng liên quan',
                    cardinality: 'Quan hệ',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Xóa',
                    switch_tables: 'Đổi Bảng',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Hành động',
                        open_discussion: 'Mở thảo luận',
                        delete_relationship: 'Xóa',
                    },
                },
                dependency: {
                    dependency: 'Phụ thuộc',
                    table: 'Bảng',
                    dependent_table: 'Bảng xem phụ thuộc',
                    delete_dependency: 'Xóa',
                    dependency_actions: {
                        title: 'Hành động',
                        delete_dependency: 'Xóa',
                    },
                },
                empty_state: {
                    title: 'Không có quan hệ',
                    description: 'Tạo một quan hệ để bắt đầu',
                },
            },

            areas_section: {
                areas: 'Khu vực',
                add_area: 'Thêm Khu vực',
                filter: 'Lọc',
                clear: 'Xóa Bộ Lọc',
                no_results: 'Không tìm thấy khu vực nào phù hợp với bộ lọc.',

                area: {
                    area_actions: {
                        title: 'Hành động Khu vực',
                        edit_name: 'Sửa Tên',
                        delete_area: 'Xóa Khu vực',
                    },
                },
                empty_state: {
                    title: 'Không có khu vực',
                    description: 'Tạo khu vực để bắt đầu',
                },
            },

            visuals_section: {
                visuals: 'Hình ảnh',
                tabs: {
                    areas: 'Khu vực',
                    notes: 'Ghi chú',
                },
            },

            notes_section: {
                filter: 'Lọc',
                add_note: 'Thêm Ghi Chú',
                no_results: 'Không tìm thấy ghi chú',
                clear: 'Xóa Bộ Lọc',
                empty_state: {
                    title: 'Không Có Ghi Chú',
                    description:
                        'Tạo ghi chú để thêm chú thích văn bản trên canvas',
                },
                note: {
                    empty_note: 'Ghi chú trống',
                    note_actions: {
                        title: 'Hành Động Ghi Chú',
                        edit_content: 'Chỉnh Sửa Nội Dung',
                        delete_note: 'Xóa Ghi Chú',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Loại Tùy Chỉnh',
                filter: 'Lọc',
                clear: 'Xóa Bộ Lọc',
                no_results:
                    'Không tìm thấy loại tùy chỉnh nào phù hợp với bộ lọc.',
                new_type: 'Loại Mới',
                empty_state: {
                    title: 'Không có loại tùy chỉnh',
                    description:
                        'Các loại tùy chỉnh sẽ xuất hiện ở đây khi có sẵn trong cơ sở dữ liệu của bạn',
                },
                custom_type: {
                    kind: 'Loại',
                    enum_values: 'Giá Trị Enum',
                    composite_fields: 'Trường',
                    no_fields: 'Chưa định nghĩa trường',
                    no_values: 'Không có giá trị enum được định nghĩa',
                    field_name_placeholder: 'Tên trường',
                    field_type_placeholder: 'Chọn loại',
                    add_field: 'Thêm Trường',
                    no_fields_tooltip:
                        'Chưa định nghĩa trường cho loại tùy chỉnh này',
                    custom_type_actions: {
                        title: 'Hành động',
                        highlight_fields: 'Làm Nổi Bật Trường',
                        delete_custom_type: 'Xóa',
                        clear_field_highlight: 'Xóa Làm Nổi Bật',
                    },
                    delete_custom_type: 'Xóa Loại',
                },
            },
            comments_section: {
                title: 'Thảo luận',
                loading: 'Đang tải thảo luận…',
                inactive: {
                    title: 'Thảo luận không khả dụng',
                    description:
                        'Thảo luận chỉ khả dụng trên các sơ đồ đám mây đã xác thực.',
                },
                empty: {
                    title: 'Chưa có thảo luận nào',
                    description:
                        'Các cuộc trò chuyện về sơ đồ này sẽ xuất hiện tại đây.',
                    diagram_title: 'Chưa có tin nhắn sơ đồ',
                    diagram_description:
                        'Các tin nhắn về toàn bộ sơ đồ sẽ xuất hiện tại đây.',
                    target_title: 'Chưa có tin nhắn cho lựa chọn hiện tại',
                    target_description:
                        'Các tin nhắn về lựa chọn hiện tại sẽ xuất hiện tại đây.',
                },
                errors: {
                    load_title: 'Không thể tải thảo luận',
                    load_description:
                        'Đã xảy ra lỗi khi tải thảo luận. Vui lòng thử lại.',
                },
                retry: 'Thử lại',
                deleted_user: 'Người dùng đã xóa',
                targets: {
                    diagram: 'Thảo luận sơ đồ',
                    table: 'Thảo luận bảng',
                    field: 'Thảo luận trường',
                    relationship: 'Thảo luận quan hệ',
                    unknown: 'Thảo luận',
                },
                views: {
                    all: 'Tất cả',
                    diagram: 'Sơ đồ',
                    current_target: 'Hiện tại',
                },
                target_header: {
                    diagram: 'Thảo luận sơ đồ',
                    table: 'Bảng {{name}}',
                    field: '{{table}}.{{field}}',
                    relationship: '{{name}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Bảng đã xóa',
                    missing_field: 'Trường đã xóa',
                    missing_relationship: 'Quan hệ đã xóa',
                },
                composer: {
                    label: 'Tin nhắn',
                    placeholder: 'Viết tin nhắn thảo luận…',
                    submit: 'Đăng',
                    submitting: 'Đang đăng…',
                    cancel: 'Hủy',
                    form_aria_label: 'Tin nhắn thảo luận mới',
                    counter_aria_label: 'Đã dùng {{count}} / {{max}} ký tự',
                    errors: {
                        empty: 'Nhập tin nhắn để đăng.',
                        too_long: 'Tin nhắn không được vượt quá 2000 ký tự.',
                        create_failed:
                            'Không thể đăng tin nhắn. Vui lòng thử lại.',
                    },
                },
            },
        },

        toolbar: {
            zoom_in: 'Phóng to',
            zoom_out: 'Thu nhỏ',
            save: 'Lưu',
            show_all: 'Hiển thị tất cả',
            undo: 'Hoàn tác',
            redo: 'Làm lại',
            reorder_diagram: 'Tự động sắp xếp sơ đồ',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Làm nổi bật các bảng chồng chéo',
            filter: 'Lọc Bảng',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Cơ sở dữ liệu của bạn là gì?',
                description:
                    'Mỗi cơ sở dữ liệu có những tính năng và khả năng riêng biệt.',
                check_examples_long: 'Xem ví dụ',
                check_examples_short: 'Ví dụ',
            },

            import_database: {
                title: 'Nhập cơ sở dữ liệu của bạn',
                database_edition: 'Loại:',
                step_1: 'Chạy lệnh này trong cơ sở dữ liệu của bạn:',
                step_2: 'Dán kết quả vào đây →',
                script_results_placeholder: 'Kết quả...',
                ssms_instructions: {
                    button_text: 'Hướng dẫn SSMS',
                    title: 'Hướng dẫn',
                    step_1: 'Đi đến Tools > Options > Query Results > SQL Server.',
                    step_2: 'Nếu bạn đang sử dụng "Results to Grid," thay đổi Maximum Characters Retrieved cho Non-XML (đặt thành 9999999).',
                },
                instructions_link: 'Cần trợ giúp? Xem ngay',
                check_script_result: 'Xem kết quả',
            },

            cancel: 'Hủy',
            import_from_file: 'Nhập từ tệp',
            back: 'Trở lại',
            empty_diagram: 'Cơ sở dữ liệu trống',
            continue: 'Tiếp tục',
            import: 'Nhập',
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
            title: 'Mở cơ sở dữ liệu',
            description: 'Chọn sơ đồ để mở từ danh sách bên dưới.',
            table_columns: {
                name: 'Tên',
                created_at: 'Tạo vào lúc',
                last_modified: 'Lần cuối chỉnh sửa',
                tables_count: 'Số bảng',
            },
            cancel: 'Hủy',
            open: 'Mở',
            new_database: 'Cơ sở dữ liệu mới',

            diagram_actions: {
                open: 'Mở',
                duplicate: 'Nhân bản',
                delete: 'Xóa',
            },
        },

        export_sql_dialog: {
            title: 'Xuất SQL',
            description: 'Xuất sơ đồ của bạn sang {{databaseType}}',
            close: 'Đóng',
            loading: {
                text: 'AI đang tạo SQL cho {{databaseType}}...',
                description: 'Việc này có thể mất khoảng 30 giây.',
            },
            error: {
                message:
                    'Lỗi khi tạo SQL. Vui lòng thử lại sau hoặc <0>liên hệ với chúng tôi</0>.',
                description:
                    'Bạn có thể sử dụng OPENAI_TOKEN, xem hướng dẫn <0>tại đây</0>.',
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
            title: 'Tạo quan hệ',
            primary_table: 'Bảng chính',
            primary_field: 'Khóa chính',
            referenced_table: 'Bảng tham chiếu',
            referenced_field: 'Khóa tham chiếu',
            primary_table_placeholder: 'Chọn bảng',
            primary_field_placeholder: 'Chọn trường',
            referenced_table_placeholder: 'Chọn bảng',
            referenced_field_placeholder: 'Chọn trường',
            no_tables_found: 'Không tìm thấy bảng',
            no_fields_found: 'Không tìm thấy trường',
            create: 'Tạo',
            cancel: 'Hủy',
        },

        import_database_dialog: {
            title: 'Nhập vào sơ đồ hiện tại',
            override_alert: {
                title: 'Nhập cơ sở dữ liệu',
                content: {
                    alert: 'Việc nhập sơ đồ này sẽ ảnh hưởng đến các bảng và mối quan hệ hiện có.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> bảng mới sẽ được thêm vào.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> quan hệ mới sẽ được tạo.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> bảng sẽ bị ghi đè.',
                    proceed: 'Bạn có muốn tiếp tục không?',
                },
                import: 'Nhập',
                cancel: 'Hủy',
            },
        },

        export_image_dialog: {
            title: 'Xuất ảnh',
            description: 'Chọn tỉ lệ để xuất:',
            scale_1x: '1x (Chất lượng thấp)',
            scale_2x: '2x (Chất lượng bình thường)',
            scale_4x: '4x (Chất lượng tốt nhất)',
            cancel: 'Hủy',
            export: 'Xuất',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'Chọn lược đồ',
            description:
                'Nhiều lược đồ hiện đang được hiển thị. Chọn một lược đồ cho bảng mới.',
            cancel: 'Hủy',
            confirm: 'Xác nhận',
        },

        update_table_schema_dialog: {
            title: 'Thay đổi lược đồ',
            description: 'Cập nhật lược đồ bảng "{{tableName}}"',
            cancel: 'Hủy',
            confirm: 'Xác nhận',
        },

        create_table_schema_dialog: {
            title: 'Tạo lược đồ mới',
            description:
                'Chưa có lược đồ nào. Tạo lược đồ đầu tiên của bạn để tổ chức các bảng.',
            create: 'Tạo',
            cancel: 'Hủy',
        },

        star_us_dialog: {
            title: 'Hãy giúp chúng tôi cải thiện!',
            description:
                'Bạn có muốn ủng hộ chúng tôi bằng cách gắn sao trên GitHub không? Chỉ cần một cú nhấp chuột là được!',
            close: 'Chưa phải bây giờ',
            confirm: 'Dĩ nhiên rồi!',
        },
        export_diagram_dialog: {
            title: 'Xuất sơ đồ',
            description: 'Chọn định dạng để xuất:',
            format_json: 'JSON',
            cancel: 'Hủy',
            export: 'Xuất',
            error: {
                title: 'Lỗi khi xuất sơ đồ',
                description:
                    'Có gì đó không ổn. Cần trợ giúp? support@chartdb.io',
            },
        },

        import_diagram_dialog: {
            title: 'Nhập sơ đồ',
            description: 'Dán sơ đồ ở dạng JSON bên dưới:',
            cancel: 'Hủy',
            import: 'Nhập',
            error: {
                title: 'Lỗi khi nhập sơ đồ',
                description:
                    'Sơ đồ ở dạng JSON không hợp lệ. Vui lòng kiểm tra JSON và thử lại. Bạn cần trợ giúp? support@chartdb.io',
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
            one_to_one: 'Quan hệ một-một',
            one_to_many: 'Quan hệ một-nhiều',
            many_to_one: 'Quan hệ nhiều-một',
            many_to_many: 'Quan hệ nhiều-nhiều',
        },

        canvas_context_menu: {
            new_table: 'Tạo bảng mới',
            new_view: 'Chế độ xem Mới',
            new_relationship: 'Tạo quan hệ mới',
            // TODO: Translate
            new_area: 'Khu vực mới',
            new_note: 'Ghi Chú Mới',
        },

        table_node_context_menu: {
            edit_table: 'Sửa bảng',
            duplicate_table: 'Nhân đôi bảng',
            delete_table: 'Xóa bảng',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'Di chuyển đến Khu vực',
            no_area: 'Không có Khu vực',
        },

        canvas: {
            all_tables_hidden: 'Tất cả bảng đã bị ẩn',
            show_all_tables: 'Hiển thị tất cả',
        },

        canvas_filter: {
            title: 'Lọc bảng',
            search_placeholder: 'Tìm kiếm bảng...',
            group_by_schema: 'Nhóm theo Schema',
            group_by_area: 'Nhóm theo Khu vực',
            no_tables_found: 'Không tìm thấy bảng',
            empty_diagram_description: 'Tạo bảng để bắt đầu',
            no_tables_description:
                'Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn',
            clear_filter: 'Xóa bộ lọc',
        },

        snap_to_grid_tooltip: 'Căn lưới (Giữ phím {{key}})',

        editing_conflict: {
            one: '{{name}} cũng đang chỉnh sửa mục này.',
            two: '{{name1}} và {{name2}} cũng đang chỉnh sửa mục này.',
            many: '{{name}} và {{count}} người khác cũng đang chỉnh sửa mục này.',
            fallback_name: 'Cộng tác viên',
            last_writer_wins:
                'Thay đổi không bị khóa. Bản chỉnh sửa được lưu sau cùng sẽ thắng.',
        },

        tool_tips: {
            double_click_to_edit: 'Nhấp đúp để chỉnh sửa',
        },

        language_select: {
            change_language: 'Ngôn ngữ',
        },

        on: 'Bật',
        off: 'Tắt',
    },
};

export const viMetadata: LanguageMetadata = {
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    code: 'vi',
};
