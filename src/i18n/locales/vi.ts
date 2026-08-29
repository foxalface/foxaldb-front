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
            conversations: 'Cuộc trò chuyện',
            conversations_unread_aria:
                '{{count}} tin nhắn chưa đọc trong hội thoại',
            visuals: 'Hình ảnh',
            activities: 'Hoạt động',
            share: 'Chia sẻ',
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
            title: 'Chọn cơ sở dữ liệu của bạn',
            description:
                'Chọn hệ quản trị cơ sở dữ liệu cho sơ đồ mới của bạn.',
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
                title: 'Chọn cơ sở dữ liệu của bạn',
                description:
                    'Chọn hệ quản trị cơ sở dữ liệu cho sơ đồ mới của bạn.',
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
        delete: 'Xóa',
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
                        open_discussion: 'Mở cuộc trò chuyện',
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
                        open_discussion: 'Mở cuộc trò chuyện',
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
                clear: 'Xóa bộ lọc',
                no_results: 'Không tìm thấy tham chiếu nào phù hợp với bộ lọc.',
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
                        open_discussion: 'Mở cuộc trò chuyện',
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
            conversations_section: {
                title: 'Cuộc trò chuyện',
                tabs_label: 'Cuộc trò chuyện',
                tabs: {
                    active: 'Đang hoạt động',
                    archives: 'Đã lưu trữ',
                },
                loading: 'Đang tải cuộc trò chuyện…',
                filter: 'Lọc',
                clear: 'Xóa bộ lọc',
                no_results_title: 'Không có kết quả',
                no_results_description:
                    'Không tìm thấy cuộc trò chuyện phù hợp với bộ lọc.',

                type_filter: {
                    trigger: 'Loại',
                    label: 'Lọc theo loại',
                    trigger_aria: 'Lọc theo loại cuộc trò chuyện',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'Thử lại',
                dismiss: 'Dismiss',
                read_only: 'Chỉ đọc',
                deleted_user: 'Người dùng đã xóa',
                unread: {
                    badge_aria: '{{count}} tin nhắn chưa đọc',
                },
                inactive: {
                    title: 'Cuộc trò chuyện unavailable',
                    description:
                        'Cuộc trò chuyện are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'Không có cuộc trò chuyện',
                    active_description: 'Tạo một cuộc trò chuyện để bắt đầu',
                    archives_title: 'No archived cuộc trò chuyện',
                    archives_description:
                        'Archived cuộc trò chuyện will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load cuộc trò chuyện',
                    load_description:
                        'Something went wrong while loading cuộc trò chuyện. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'Mở cuộc trò chuyện',
                    start: 'Bắt đầu cuộc trò chuyện',
                    pending: 'Đang bắt đầu cuộc trò chuyện…',
                    diagram_name: 'Sơ đồ',
                    open_aria: 'Mở cuộc trò chuyện cho {{name}}',
                    start_aria: 'Bắt đầu cuộc trò chuyện cho {{name}}',
                    open_tooltip: 'Mở cuộc trò chuyện cho {{name}}',
                    start_tooltip: 'Bắt đầu cuộc trò chuyện cho {{name}}',
                    pending_tooltip:
                        'Đang bắt đầu cuộc trò chuyện cho {{name}}…',
                    action_tooltip: 'Trò chuyện',
                    unavailable_description:
                        'Bạn không thể bắt đầu cuộc trò chuyện trên sơ đồ này.',
                    errors: {
                        validation:
                            'Mục tiêu này không hợp lệ cho cuộc trò chuyện.',
                        forbidden:
                            'Bạn không có quyền bắt đầu cuộc trò chuyện này.',
                        not_found: 'Mục tiêu này không còn trên sơ đồ.',
                        conflict:
                            'Không thể bắt đầu cuộc trò chuyện lúc này. Vui lòng thử lại.',
                        generic:
                            'Không thể mở cuộc trò chuyện này. Vui lòng thử lại.',
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
                    message_count: '{{count}} tin nhắn',
                    no_messages: 'Chưa có tin nhắn',
                    last_activity: 'Hoạt động gần nhất',
                    open_aria: 'Mở cuộc trò chuyện cho {{target}}',
                    focus_target_aria: 'Hiển thị {{target}} trên sơ đồ',
                    author_tooltip: 'Tin nhắn cuối của {{name}}',
                    author_missing_tooltip: 'Không có thông tin tác giả',
                    actions: {
                        menu_aria: 'Tùy chọn cuộc trò chuyện',
                        open: 'Mở',
                        delete: 'Xóa',
                    },
                    delete_dialog: {
                        title: 'Xóa cuộc trò chuyện?',
                        description:
                            'Thao tác này sẽ xóa vĩnh viễn cuộc trò chuyện và tất cả tin nhắn của nó.',
                        cancel: 'Hủy',
                        confirm: 'Xóa',
                        deleting: 'Đang xóa…',
                        errors: {
                            delete_failed:
                                'Không thể xóa cuộc trò chuyện này. Vui lòng thử lại.',
                            forbidden:
                                'Bạn không có quyền xóa cuộc trò chuyện này.',
                            not_found:
                                'Cuộc trò chuyện này không còn khả dụng.',
                        },
                    },
                },
                detail: {
                    back: 'Quay lại',
                    back_aria: 'Quay lại danh sách cuộc trò chuyện',
                    loading: 'Đang tải tin nhắn…',
                    loading_more: 'Đang tải tin nhắn cũ hơn…',
                    load_older: 'Tải tin nhắn cũ hơn',
                    new_messages_badge_one: '1 tin nhắn mới',
                    new_messages_badge_other: '{{count}} tin nhắn mới',
                    new_messages_badge_label_one: 'tin nhắn mới',
                    new_messages_badge_label_other: 'tin nhắn mới',
                    new_messages_badge_aria_one: 'Cuộn đến tin nhắn mới',
                    new_messages_badge_aria_other:
                        'Cuộn đến {{count}} tin nhắn mới',
                    empty: {
                        title: 'Không có tin nhắn',
                        description:
                            'Cuộc trò chuyện này chưa có tin nhắn nào.',
                    },
                    errors: {
                        load_title: 'Không thể tải tin nhắn',
                        load_description:
                            'Đã xảy ra lỗi khi tải tin nhắn. Vui lòng thử lại.',
                    },
                    archive_banner: {
                        title: 'Cuộc trò chuyện đã lưu trữ',
                        description:
                            'Cuộc trò chuyện này chỉ đọc. Không thể thêm, chỉnh sửa hoặc xóa tin nhắn.',
                    },
                    metadata: {
                        status_label: 'Trạng thái',
                        status_active: 'Đang hoạt động',
                        status_archived: 'Đã lưu trữ',
                        message_count_label: 'Số lượng tin nhắn',
                        message_count: '{{count}} tin nhắn',
                    },
                    message: {
                        edited: '(đã chỉnh sửa)',
                        edited_aria: 'Tin nhắn đã được chỉnh sửa',
                        day_separator: {
                            today: 'Hôm nay',
                            yesterday: 'Hôm qua',
                        },
                        actions: {
                            title: 'Thao tác tin nhắn',
                            edit: 'Chỉnh sửa',
                            delete: 'Xóa',
                        },
                        reactions: {
                            add_aria: 'Thêm phản ứng',
                            add_tooltip: 'Thêm phản ứng',
                            picker_loading: 'Đang tải bộ chọn emoji…',
                            picker_aria_label: 'Bộ chọn emoji',
                            picker_search_placeholder: 'Tìm emoji…',
                            picker_empty: 'Không tìm thấy emoji.',
                            chip_aria: 'Phản ứng {{emoji}}, {{count}}',
                            preview_and_others_one: 'và {{count}} người khác',
                            preview_and_others_other: 'và {{count}} người khác',
                            errors: {
                                generic:
                                    'Không thể cập nhật phản ứng. Vui lòng thử lại.',
                                forbidden:
                                    'Bạn không được phép phản ứng với tin nhắn này.',
                                archived:
                                    'Cuộc trò chuyện này đã được lưu trữ và phản ứng chỉ đọc.',
                                not_found: 'Tin nhắn này không còn khả dụng.',
                                invalid_emoji: 'Emoji này không hợp lệ.',
                            },
                        },
                    },
                    composer: {
                        label: 'Tin nhắn',
                        placeholder: 'Viết tin nhắn…',
                        submit: 'Gửi',
                        submitting: 'Đang gửi…',
                        form_aria_label: 'Tin nhắn hội thoại mới',
                        keyboard_hint:
                            'Nhấn Enter để gửi. Shift+Enter để xuống dòng.',
                        counter_aria_label: 'Đã dùng {{count}} / {{max}} ký tự',
                        errors: {
                            empty: 'Nhập tin nhắn để gửi.',
                            too_long:
                                'Tin nhắn không được vượt quá 2000 ký tự.',
                            create_failed:
                                'Không thể gửi tin nhắn. Vui lòng thử lại.',
                        },
                    },
                    edit: {
                        label: 'Tin nhắn',
                        form_aria_label: 'Chỉnh sửa tin nhắn hội thoại',
                        save: 'Lưu',
                        saving: 'Đang lưu…',
                        cancel: 'Hủy',
                        counter_aria_label: 'Đã dùng {{count}} / {{max}} ký tự',
                        errors: {
                            empty: 'Nhập tin nhắn để lưu.',
                            too_long:
                                'Tin nhắn không được vượt quá 2000 ký tự.',
                            update_failed:
                                'Không thể cập nhật tin nhắn. Vui lòng thử lại.',
                        },
                    },
                    delete_dialog: {
                        title: 'Xóa tin nhắn',
                        description:
                            'Bạn có chắc muốn xóa tin nhắn này? Hành động này không thể hoàn tác.',
                        cancel: 'Hủy',
                        confirm: 'Xóa',
                        deleting: 'Đang xóa…',
                        errors: {
                            delete_failed:
                                'Không thể xóa tin nhắn này. Vui lòng thử lại.',
                        },
                    },
                    mutation_errors: {
                        forbidden: 'Bạn không có quyền thay đổi tin nhắn này.',
                        archived: 'Hội thoại này đã được lưu trữ và chỉ đọc.',
                        not_found:
                            'Hội thoại hoặc tin nhắn này không còn khả dụng.',
                    },
                },

                targets: {
                    diagram: 'Sơ đồ',
                    table: 'Bảng',
                    field: 'Trường',
                    relationship: 'Quan hệ',
                    unknown: 'Cuộc trò chuyện',
                },
                target_labels: {
                    diagram: 'Sơ đồ',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Bảng đã xóa',
                    missing_field: 'Trường đã xóa',
                    missing_relationship: 'Quan hệ đã xóa',
                    unknown: 'Cuộc trò chuyện',
                },
            },
            activities_section: {
                title: 'Hoạt động',
                filter: 'Lọc',
                clear: 'Xóa bộ lọc',
                no_results:
                    'Không tìm thấy hoạt động nào khớp với bộ lọc của bạn.',
                loading: 'Đang tải hoạt động…',
                retry: 'Thử lại',
                type_filter: {
                    trigger: 'Loại',
                    label: 'Lọc theo loại',
                    trigger_aria: 'Lọc theo loại hoạt động',
                },
                types: {
                    diagram: 'Sơ đồ',
                    table: 'Bảng',
                    field: 'Trường',
                    relationship: 'Quan hệ',
                    note: 'Ghi chú',
                    area: 'Vùng',
                    dependency: 'Phụ thuộc',
                },
                you: 'Bạn',
                unknown_user: 'Ai đó',
                empty_state: {
                    title: 'Chưa có hoạt động',
                    description:
                        'Bắt đầu chỉnh sửa để xem các thay đổi gần đây.',
                },
                errors: {
                    load_failed: 'Không thể tải hoạt động.',
                },
                actions: {
                    add_tables: '{{user}} đã thêm bảng {{table}}',
                    remove_tables: '{{user}} đã xóa một bảng',
                    add_field: '{{user}} đã thêm trường {{field}}',
                    remove_field: '{{user}} đã xóa một trường',
                    update_field: '{{user}} đã cập nhật trường {{field}}',
                    add_relationships: '{{user}} đã thêm quan hệ',
                    remove_relationships: '{{user}} đã xóa quan hệ',
                    update_relationship: '{{user}} đã cập nhật quan hệ',
                    add_notes: '{{user}} đã thêm ghi chú',
                    remove_notes: '{{user}} đã xóa ghi chú',
                    add_areas: '{{user}} đã thêm vùng',
                    remove_areas: '{{user}} đã xóa vùng',
                    add_dependencies: '{{user}} đã thêm phụ thuộc',
                    remove_dependencies: '{{user}} đã xóa phụ thuộc',
                    fallback: '{{user}} đã cập nhật sơ đồ',
                },
            },
            share_section: {
                title: 'Chia sẻ',
                tabs_label: 'Tùy chọn chia sẻ',
                tabs: {
                    collaborators: 'Cộng tác viên',
                    public_link: 'Liên kết công khai',
                },
                collaborators: {
                    description:
                        'Mời cộng tác viên với quyền chỉnh sửa hoặc xem. Họ phải đã có tài khoản FoxalDB.',
                    filter: 'Lọc',
                    clear: 'Xóa bộ lọc',
                    no_results_title: 'Không có kết quả',
                    no_results_description:
                        'Không có cộng tác viên nào khớp với bộ lọc của bạn.',
                    role_filter: {
                        trigger: 'Vai trò',
                        label: 'Lọc theo vai trò',
                        trigger_aria: 'Lọc theo vai trò cộng tác viên',
                    },
                },
                public_link: {
                    title: 'Liên kết công khai',
                    description:
                        'Chia sẻ ảnh chụp chỉ đọc của sơ đồ với bất kỳ ai có liên kết.',
                    coming_soon: 'Sắp ra mắt.',
                },
                loading: 'Đang tải cộng tác viên…',
                retry: 'Thử lại',
                errors: {
                    load_failed: 'Không thể tải cộng tác viên.',
                },
                member_actions: {
                    title: 'Thao tác cộng tác viên',
                    trigger_aria: 'Thao tác cộng tác viên',
                    role: 'Vai trò',
                    remove: 'Xóa cộng tác viên',
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
                title: 'Chọn cơ sở dữ liệu của bạn',
                description:
                    'Chọn hệ quản trị cơ sở dữ liệu cho sơ đồ mới của bạn.',
                search_placeholder: 'Tìm hệ quản trị cơ sở dữ liệu…',
                search_no_results:
                    'Không có hệ quản trị cơ sở dữ liệu nào khớp với tìm kiếm của bạn.',
                clear_search: 'Xóa tìm kiếm',
                primary_group: 'Cơ sở dữ liệu chính',
                other_group: 'Cơ sở dữ liệu khác',
                check_examples_long: 'Xem ví dụ',
                check_examples_short: 'Ví dụ',
            },

            choose_intent: {
                title: 'Bạn muốn làm gì?',
                description: 'Tạo sơ đồ mới cho {{database}}.',
                create_empty: 'Tạo sơ đồ trống',
                create_empty_description:
                    'Bắt đầu từ đầu bằng cách tự thêm bảng.',
                import: 'Nhập',
                import_description:
                    'Từ tệp, văn bản dán hoặc cơ sở dữ liệu của bạn.',
                back: 'Quay lại',
            },

            choose_import_method: {
                title: 'Bạn muốn nhập như thế nào?',
                description: 'Chọn nguồn cho sơ đồ {{database}} của bạn.',
                from_file: 'Tệp hoặc văn bản dán',
                from_file_description: 'SQL, DBML hoặc JSON sơ đồ.',
                from_database: 'Cơ sở dữ liệu hiện có',
                from_database_description:
                    'Chạy truy vấn trong cơ sở dữ liệu và dán kết quả.',
                back: 'Quay lại',
            },

            import_from_database: {
                title: 'Nhập từ cơ sở dữ liệu hiện có',
                description:
                    'Dùng khi bạn không có tệp lược đồ SQL hoặc DBML. Chạy truy vấn trong cơ sở dữ liệu, rồi dán kết quả bên dưới.',
                database_edition: 'Phiên bản cơ sở dữ liệu',
                edition_regular: 'Thường',
                run_query: 'Chạy truy vấn này trong cơ sở dữ liệu',
                client_sql: 'SQL',
                paste_result: 'Dán kết quả',
                paste_result_placeholder: 'Dán kết quả truy vấn tại đây…',
                check_result: 'Kiểm tra kết quả',
                valid_result: 'Kết quả có vẻ hợp lệ.',
                invalid_result:
                    'Không thể xác thực kết quả. Kiểm tra nội dung và thử lại.',
                truncated_result:
                    'Kết quả có thể bị cắt ngắn. Điều chỉnh cài đặt SQL client và chạy lại truy vấn.',
                waiting_for_result: 'Dán kết quả truy vấn để tiếp tục.',
                unsupported_database:
                    'Không hỗ trợ trích xuất lược đồ cho loại cơ sở dữ liệu này.',
                import_failed:
                    'Không thể nhập lược đồ cơ sở dữ liệu. Kiểm tra kết quả và thử lại.',
                back: 'Quay lại',
                import: 'Nhập',
            },

            import_schema: {
                title: 'Dán lược đồ của bạn',
                textarea_label: 'Nội dung lược đồ',
                textarea_placeholder:
                    'Dán SQL, DBML hoặc siêu dữ liệu JSON vào đây…',
                auto_detect_hint: 'Chúng tôi sẽ tự động phát hiện định dạng.',
                or_divider: 'HOẶC',
                choose_file: 'Chọn tệp',
                change_file_aria: 'Đổi tệp, hiện tại: {{name}}',
                selected_file: 'Tệp đã chọn: {{name}}',
                back: 'Quay lại',
                import: 'Nhập',
                mismatch: {
                    title: 'Lược đồ này trông giống {{detected}}, nhưng bạn đã chọn {{selected}}.',
                    description:
                        'Chuyển sang loại cơ sở dữ liệu được phát hiện hoặc quay lại để chọn loại khác.',
                    switch: 'Chuyển sang {{database}}',
                    go_back: 'Quay lại',
                },
                ambiguous: {
                    title: 'Chọn DBMS nguồn',
                    confidence_explanation:
                        'Phần trăm cho biết chỉ số khớp với phương ngữ SQL được phát hiện cho từng DBMS.',
                    description:
                        'Không thể tự động xác định phương ngữ SQL. Xác nhận lược đồ này đến từ DBMS nào.',
                    choose_source: 'Chọn DBMS nguồn',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% tin cậy, tự động phát hiện)',
                    recommended_tooltip: 'DBMS được phát hiện tự động',
                    recommended_aria:
                        '{{database}}, DBMS được phát hiện tự động',
                },
                detection: {
                    dialect: 'Đã phát hiện {{database}}',
                    dbml: 'Đã phát hiện DBML',
                    metadata_json: 'Đã phát hiện siêu dữ liệu JSON',
                    diagram_json: 'Đã phát hiện JSON sơ đồ',
                    sql_ambiguous_title: 'Đã phát hiện SQL',
                    sql_ambiguous_description:
                        'Không thể tự động xác định DBMS.',
                    clickhouse_unsupported: 'Đã phát hiện SQL ClickHouse',
                    unsupported: 'Định dạng không được hỗ trợ',
                },
                errors: {
                    unreadable_file: 'Không thể đọc tệp đã chọn.',
                    malformed_json: 'Không thể phân tích nội dung JSON.',
                    unsupported:
                        'Định dạng này không được hỗ trợ để nhập lược đồ.',
                    diagram_json:
                        'JSON sơ đồ có thể được nhập từ tùy chọn tệp sơ đồ.',
                    clickhouse_unsupported:
                        'Nhập DDL SQL không được hỗ trợ cho ClickHouse. Hãy dùng DBML hoặc nhập từ cơ sở dữ liệu hiện có.',
                    file_too_large: 'Tệp đã chọn lớn hơn 5 MB.',
                    import_failed:
                        'Không thể nhập lược đồ. Kiểm tra nội dung và thử lại.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'Hướng dẫn SSMS',
                    title: 'Hướng dẫn',
                    step_1: 'Đi đến Tools > Options > Query Results > SQL Server.',
                    step_2: 'Nếu bạn đang sử dụng "Results to Grid," thay đổi Maximum Characters Retrieved cho Non-XML (đặt thành 9999999).',
                },
            },

            cancel: 'Hủy',
            import_from_file: 'Nhập từ tệp',
            back: 'Trở lại',
            empty_diagram: 'Cơ sở dữ liệu trống',
            continue: 'Tiếp tục',
            import: 'Nhập',
        },

        share_diagram_dialog: {
            title: 'Chia sẻ sơ đồ',
            description:
                'Mời cộng tác viên với quyền biên tập hoặc xem. Họ phải đã có tài khoản FoxalDB.',
            share_button: 'Chia sẻ',
            empty_members: 'Chưa có cộng tác viên.',
            remove: 'Xóa',
            roles: {
                owner: 'Chủ sở hữu',
                editor: 'Biên tập viên',
                viewer: 'Người xem',
            },
            add_member: {
                title: 'Thêm cộng tác viên',
                email_label: 'Email',
                email_placeholder: 'Địa chỉ email',
                add: 'Thêm',
                adding: 'Đang thêm…',
                cancel: 'Hủy',
            },
            errors: {
                load_failed: 'Không thể tải cộng tác viên.',
                add_failed: 'Không thể thêm cộng tác viên.',
            },
        },

        diagram_role: {
            owner: 'Chủ sở hữu',
            editor: 'Biên tập viên',
            viewer: 'Người xem',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Mở cơ sở dữ liệu',
            description:
                'Chọn hệ quản trị cơ sở dữ liệu cho sơ đồ mới của bạn.',
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
            import_schema: {
                title: 'Nhập lược đồ',
                import: 'Nhập',
                cancel: 'Hủy',
                mismatch: {
                    title: 'Lược đồ này trông giống {{detected}}, nhưng sơ đồ này là {{selected}}.',
                    description:
                        'Nhập giữa các cơ sở dữ liệu khác nhau chưa được hỗ trợ.',
                    cancel: 'Hủy',
                },
                ambiguous: {
                    description:
                        'Không thể tự động xác định phương ngữ SQL. Xác nhận cách diễn giải lược đồ này cho sơ đồ {{selected}} hiện tại.',
                },
            },
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

        auth: {
            dialog: {
                account_title: 'Tài khoản',
                login_title: 'Đăng nhập vào FoxalDB',
                register_title: 'Tạo tài khoản FoxalDB',
                account_description: 'Quản lý phiên hiện tại của bạn.',
                login_description:
                    'Đăng nhập để lưu thêm sơ đồ và đồng bộ chúng.',
                register_description: 'Tạo tài khoản để lưu thêm sơ đồ.',
                checking_session: 'Đang kiểm tra phiên...',
                continue_without_account: 'Tiếp tục không cần tài khoản',
            },
            login: {
                title: 'Đăng nhập',
                email_label: 'Email',
                password_label: 'Mật khẩu',
                submit: 'Đăng nhập',
                submitting: 'Đang đăng nhập...',
                switch_to_register: 'Đăng ký',
                no_account: 'Chưa có tài khoản?',
            },
            register: {
                title: 'Đăng ký',
                first_name_label: 'Tên',
                last_name_label: 'Họ',
                email_label: 'Email',
                password_label: 'Mật khẩu',
                password_confirmation_label: 'Xác nhận mật khẩu',
                submit: 'Tạo tài khoản',
                submitting: 'Đang tạo tài khoản...',
                switch_to_login: 'Đăng nhập',
                already_have_account: 'Đã có tài khoản?',
            },
            account: {
                signed_in_as: 'Đã đăng nhập với tư cách',
                logout: 'Đăng xuất',
                back_to_editor: 'Quay lại trình chỉnh sửa',
            },
            settings: {
                title: 'Cài đặt người dùng',
                description: 'Cập nhật thông tin cá nhân và mật khẩu của bạn.',
                change_password_heading: 'Đổi mật khẩu',
                current_password_label: 'Mật khẩu hiện tại',
                new_password_label: 'Mật khẩu mới',
                password_confirmation_label: 'Xác nhận mật khẩu mới',
                first_name_label: 'Tên',
                last_name_label: 'Họ',
                email_label: 'Địa chỉ email',
                submit: 'Lưu thay đổi',
                submitting: 'Đang lưu...',
                success_title: 'Đã cập nhật hồ sơ',
                success_description: 'Hồ sơ của bạn đã được lưu.',
            },
            nav: {
                sign_in: 'Đăng nhập',
                logout: 'Đăng xuất',
                loading: '...',
                user_menu: 'Tài khoản',
                settings: 'Cài đặt',
                change_language: 'Ngôn ngữ',
            },
            pages: {
                login_title: 'FoxalDB — Đăng nhập',
                register_title: 'FoxalDB — Đăng ký',
                checking_session: 'Đang kiểm tra phiên…',
            },
            errors: {
                first_name_required: 'Tên là bắt buộc.',
                last_name_required: 'Họ là bắt buộc.',
                generic: 'Đã xảy ra lỗi.',
            },
        },

        guest_migration_dialog: {
            title: 'Nhập sơ đồ cục bộ?',
            description:
                'Bạn có một sơ đồ được lưu trên thiết bị này. Hãy nhập vào tài khoản để truy cập từ mọi nơi.',
            import: 'Nhập vào tài khoản',
            continue_without_import: 'Tiếp tục không nhập',
        },

        guest_migration_errors: {
            import_failed:
                'Không thể nhập sơ đồ cục bộ. Bản sao cục bộ đã được giữ lại.',
            activation_failed:
                'Sơ đồ đã được tạo nhưng không mở được. Bản sao cục bộ đã được giữ lại.',
            cleanup_failed:
                'Sơ đồ đã được nhập nhưng không thể xóa bản sao cục bộ. Bạn có thể xóa thủ công.',
            check_failed: 'Không thể đọc sơ đồ cục bộ.',
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
    countryCode: 'vn',
};
