import type { LanguageMetadata, LanguageTranslation } from '../types';

export const zh_TW: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: '新建',
            browse: '開啟',
            tables: '表格',
            refs: 'Refs',
            dependencies: '相依性',
            custom_types: '自定義類型',
            conversations: '對話',
            conversations_unread_aria: '對話中有 {{count}} 則未讀訊息',
            visuals: '視覺效果',
            activities: '活動',
            share: '分享',
        },
        menu: {
            actions: {
                actions: '操作',
                new: '新增...',
                browse: '所有資料庫...',
                save: '儲存',
                import: '匯入資料庫',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: '匯出 SQL',
                export_as: '匯出為特定格式',
                delete_diagram: '刪除',
            },
            edit: {
                edit: '編輯',
                undo: '復原',
                redo: '重做',
                clear: '清除',
            },
            view: {
                view: '檢視',
                show_sidebar: '顯示側邊欄',
                hide_sidebar: '隱藏側邊欄',
                hide_cardinality: '隱藏基數',
                show_cardinality: '顯示基數',
                hide_field_attributes: '隱藏欄位屬性',
                show_field_attributes: '顯示欄位屬性',
                zoom_on_scroll: '滾動縮放',
                show_views: '資料庫檢視',
                theme: '主題',
                show_dependencies: '顯示相依性',
                hide_dependencies: '隱藏相依性',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: '備份',
                export_diagram: '匯出圖表',
                restore_diagram: '恢復圖表',
            },
            help: {
                help: '幫助',
                docs_website: '文件',
                join_discord: '加入 Discord',
            },
        },

        delete_diagram_alert: {
            title: '選擇您的資料庫',
            description: '為您的新圖表選擇資料庫系統。',
            cancel: '取消',
            delete: '刪除',
        },

        clear_diagram_alert: {
            title: '清除圖表',
            description: '此操作無法復原，圖表中的所有資料將被永久刪除。',
            cancel: '取消',
            clear: '清除',
        },

        diagram_access: {
            removed: {
                title: 'Access removed',
                description: 'You no longer have access to this diagram.',
            },
            role_changed_viewer: {
                title: '選擇您的資料庫',
                description: '為您的新圖表選擇資料庫系統。',
            },
            role_changed_editor: {
                title: 'Edit access granted',
                description:
                    'Your role on this diagram was changed to editor. You can edit again.',
            },
        },

        reorder_diagram_alert: {
            title: '自動排列圖表',
            description: '此操作將重新排列圖表中的所有表格。是否繼續？',
            reorder: '自動排列',
            cancel: '取消',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: '複製失敗',
                description: '不支援剪貼簿',
            },
            failed: {
                title: '複製失敗',
                description: '出現問題。請再試一次。',
            },
        },

        theme: {
            system: '系統',
            light: '淺色',
            dark: '深色',
        },

        zoom: {
            on: '開啟',
            off: '關閉',
        },

        last_saved: '上次儲存於',
        saved: '已儲存',
        loading_diagram: '正在載入圖表...',
        deselect_all: '取消所有選取',
        select_all: '全選',
        delete: '刪除',
        clear: '清除',
        show_more: '顯示更多',
        show_less: '顯示較少',
        copy_to_clipboard: '複製到剪貼簿',
        copied: '已複製！',

        side_panel: {
            view_all_options: '顯示所有選項...',
            tables_section: {
                tables: '表格',
                add_table: '新增表格',
                add_view: '新增檢視',
                filter: '篩選',
                collapse: '全部摺疊',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: '所有表格已隱藏',
                show_all: '顯示全部',

                table: {
                    fields: '欄位',
                    nullable: '可為 NULL?',
                    primary_key: '主鍵',
                    indexes: '索引',
                    check_constraints: '檢查約束',
                    comments: '註解',
                    no_comments: '無註解',
                    add_field: '新增欄位',
                    add_index: '新增索引',
                    add_check: '新增檢查',
                    index_select_fields: '選擇欄位',
                    no_types_found: '未找到類型',
                    field_name: '名稱',
                    field_type: '類型',
                    field_actions: {
                        title: '欄位屬性',
                        open_discussion: '開啟對話',
                        unique: '唯一',
                        auto_increment: '自動遞增',
                        comments: '註解',
                        no_comments: '無註解',
                        delete_field: '刪除欄位',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: '精度',
                        scale: '小數位',
                    },
                    index_actions: {
                        title: '索引屬性',
                        name: '名稱',
                        unique: '唯一',
                        index_type: '索引類型',
                        delete_index: '刪除索引',
                    },
                    check_constraint_actions: {
                        title: '檢查約束',
                        expression: '運算式',
                        delete: '刪除檢查約束',
                    },
                    table_actions: {
                        title: '表格操作',
                        open_discussion: '開啟對話',
                        change_schema: '變更 Schema',
                        add_field: '新增欄位',
                        add_index: '新增索引',
                        duplicate_table: '複製表格',
                        delete_table: '刪除表格',
                    },
                },
                empty_state: {
                    title: '尚無表格',
                    description: '請新增表格以開始',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: '篩選',
                clear: '清除篩選',
                no_results: '未找到符合篩選條件的引用。',
                collapse: '全部摺疊',
                add_relationship: '新增關聯',
                relationships: '關聯',
                dependencies: '相依性',
                relationship: {
                    relationship: '關聯',
                    primary: '主表格',
                    foreign: '關聯表格',
                    cardinality: '基數',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: '刪除',
                    switch_tables: '切換表格',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: '操作',
                        open_discussion: '開啟對話',
                        delete_relationship: '刪除',
                    },
                },
                dependency: {
                    dependency: '相依性',
                    table: '表格',
                    dependent_table: '相依檢視',
                    delete_dependency: '刪除',
                    dependency_actions: {
                        title: '操作',
                        delete_dependency: '刪除',
                    },
                },
                empty_state: {
                    title: '尚無關聯',
                    description: '請建立關聯以開始',
                },
            },

            areas_section: {
                areas: '區域',
                add_area: '新增區域',
                filter: '篩選',
                clear: '清除篩選',
                no_results: '未找到符合篩選條件的區域。',

                area: {
                    area_actions: {
                        title: '區域操作',
                        edit_name: '編輯名稱',
                        delete_area: '刪除區域',
                    },
                },
                empty_state: {
                    title: '沒有區域',
                    description: '建立區域以開始',
                },
            },

            visuals_section: {
                visuals: '視覺效果',
                tabs: {
                    areas: '區域',
                    notes: '筆記',
                },
            },

            notes_section: {
                filter: '篩選',
                add_note: '新增筆記',
                no_results: '未找到筆記',
                clear: '清除篩選',
                empty_state: {
                    title: '沒有筆記',
                    description: '建立筆記以在畫布上新增文字註解',
                },
                note: {
                    empty_note: '空白筆記',
                    note_actions: {
                        title: '筆記操作',
                        edit_content: '編輯內容',
                        delete_note: '刪除筆記',
                    },
                },
            },

            custom_types_section: {
                custom_types: '自訂類型',
                filter: '篩選',
                clear: '清除篩選',
                no_results: '未找到符合篩選條件的自訂類型。',
                new_type: '新類型',
                empty_state: {
                    title: '沒有自訂類型',
                    description:
                        '當資料庫中有可用的自訂類型時，它們將顯示在這裡',
                },
                custom_type: {
                    kind: '類型',
                    enum_values: '列舉值',
                    composite_fields: '欄位',
                    no_fields: '未定義欄位',
                    no_values: '沒有定義列舉值',
                    field_name_placeholder: '欄位名稱',
                    field_type_placeholder: '選擇類型',
                    add_field: '新增欄位',
                    no_fields_tooltip: '此自訂類型未定義欄位',
                    custom_type_actions: {
                        title: '操作',
                        highlight_fields: '突出顯示欄位',
                        delete_custom_type: '刪除',
                        clear_field_highlight: '清除突出顯示',
                    },
                    delete_custom_type: '刪除類型',
                },
            },
            conversations_section: {
                title: '對話',
                tabs_label: '對話',
                tabs: {
                    active: '使用中',
                    archives: '已封存',
                },
                loading: '正在載入對話…',
                filter: '篩選',
                clear: '清除篩選',
                no_results_title: '沒有結果',
                no_results_description: '找不到符合篩選條件的對話。',

                type_filter: {
                    trigger: '類型',
                    label: '依類型篩選',
                    trigger_aria: '依對話類型篩選',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: '重試',
                dismiss: 'Dismiss',
                read_only: '唯讀',
                deleted_user: '已刪除的使用者',
                unread: {
                    badge_aria: '{{count}} 則未讀訊息',
                },
                inactive: {
                    title: '對話 unavailable',
                    description:
                        '對話 are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: '尚無對話',
                    active_description: '建立對話以開始',
                    archives_title: 'No archived 對話',
                    archives_description:
                        'Archived 對話 will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load 對話',
                    load_description:
                        'Something went wrong while loading 對話. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: '開啟對話',
                    start: '開始對話',
                    pending: '正在開始對話…',
                    diagram_name: '圖表',
                    open_aria: '開啟 {{name}} 的對話',
                    start_aria: '為 {{name}} 開始對話',
                    open_tooltip: '開啟 {{name}} 的對話',
                    start_tooltip: '為 {{name}} 開始對話',
                    pending_tooltip: '正在為 {{name}} 開始對話…',
                    action_tooltip: '對話',
                    unavailable_description: '您無法在此圖表上開始對話。',
                    errors: {
                        validation: '此目標不適用於對話。',
                        forbidden: '您沒有權限開始此對話。',
                        not_found: '此目標在圖表上已不存在。',
                        conflict: '暫時無法開始此對話。請再試一次。',
                        generic: '無法開啟此對話。請再試一次。',
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
                    message_count: '{{count}} 則訊息',
                    no_messages: '尚無訊息',
                    last_activity: '最近活動',
                    open_aria: '開啟 {{target}} 的對話',
                    focus_target_aria: '在圖表中顯示 {{target}}',
                    author_tooltip: '{{name}} 的最新訊息',
                    author_missing_tooltip: '無作者資訊',
                    actions: {
                        menu_aria: '對話選項',
                        open: '開啟',
                        delete: '刪除',
                    },
                    delete_dialog: {
                        title: '刪除對話？',
                        description: '這將永久刪除此對話及其所有訊息。',
                        cancel: '取消',
                        confirm: '刪除',
                        deleting: '正在刪除…',
                        errors: {
                            delete_failed: '無法刪除此對話。請再試一次。',
                            forbidden: '您沒有刪除此對話的權限。',
                            not_found: '此對話已無法使用。',
                        },
                    },
                },
                detail: {
                    back: '返回',
                    back_aria: '返回對話列表',
                    loading: '正在載入訊息…',
                    loading_more: '正在載入較早的訊息…',
                    load_older: '載入較早的訊息',
                    new_messages_badge_one: '1 則新訊息',
                    new_messages_badge_other: '{{count}} 則新訊息',
                    new_messages_badge_label_one: '新訊息',
                    new_messages_badge_label_other: '新訊息',
                    new_messages_badge_aria_one: '捲動至新訊息',
                    new_messages_badge_aria_other: '捲動至 {{count}} 則新訊息',
                    empty: {
                        title: '尚無訊息',
                        description: '此對話沒有任何訊息。',
                    },
                    errors: {
                        load_title: '無法載入訊息',
                        load_description: '載入訊息時發生錯誤，請再試一次。',
                    },
                    archive_banner: {
                        title: '已封存的對話',
                        description: '此對話為唯讀。無法新增、編輯或刪除訊息。',
                    },
                    metadata: {
                        status_label: '狀態',
                        status_active: '使用中',
                        status_archived: '已封存',
                        message_count_label: '訊息數量',
                        message_count: '{{count}} 則訊息',
                    },
                    message: {
                        edited: '（已編輯）',
                        edited_aria: '訊息已編輯',
                        day_separator: {
                            today: '今天',
                            yesterday: '昨天',
                        },
                        actions: {
                            title: '訊息操作',
                            edit: '編輯',
                            delete: '刪除',
                        },
                        reactions: {
                            add_aria: '新增表情回應',
                            add_tooltip: '新增表情回應',
                            picker_loading: '正在載入表情選擇器…',
                            picker_aria_label: '表情選擇器',
                            picker_search_placeholder: '搜尋表情…',
                            picker_empty: '找不到表情。',
                            chip_aria: '{{emoji}} 回應，{{count}}',
                            preview_and_others_one: '以及其他 {{count}} 人',
                            preview_and_others_other: '以及其他 {{count}} 人',
                            errors: {
                                generic: '無法更新回應。請再試一次。',
                                forbidden: '您沒有權限回應此訊息。',
                                archived: '此對話已封存，回應為唯讀。',
                                not_found: '此訊息已無法使用。',
                                invalid_emoji: '此表情無效。',
                            },
                        },
                    },
                    composer: {
                        label: '訊息',
                        placeholder: '撰寫訊息…',
                        submit: '傳送',
                        submitting: '傳送中…',
                        form_aria_label: '新對話訊息',
                        keyboard_hint: '按 Enter 傳送。Shift+Enter 換行。',
                        counter_aria_label: '已使用 {{count}} / {{max}} 個字元',
                        errors: {
                            empty: '請輸入要傳送的訊息。',
                            too_long: '訊息不能超過 2000 個字元。',
                            create_failed: '無法傳送訊息。請再試一次。',
                        },
                    },
                    edit: {
                        label: '訊息',
                        form_aria_label: '編輯對話訊息',
                        save: '儲存',
                        saving: '儲存中…',
                        cancel: '取消',
                        counter_aria_label: '已使用 {{count}} / {{max}} 個字元',
                        errors: {
                            empty: '請輸入要儲存的訊息。',
                            too_long: '訊息不能超過 2000 個字元。',
                            update_failed: '無法更新訊息。請再試一次。',
                        },
                    },
                    delete_dialog: {
                        title: '刪除訊息',
                        description: '確定要刪除此訊息嗎？此動作無法復原。',
                        cancel: '取消',
                        confirm: '刪除',
                        deleting: '刪除中…',
                        errors: {
                            delete_failed: '無法刪除此訊息。請再試一次。',
                        },
                    },
                    mutation_errors: {
                        forbidden: '您沒有權限變更此訊息。',
                        archived: '此對話已封存，為唯讀狀態。',
                        not_found: '此對話或訊息已不可用。',
                    },
                },

                targets: {
                    diagram: '圖表',
                    table: '資料表',
                    field: '欄位',
                    relationship: '關聯',
                    unknown: '對話',
                },
                target_labels: {
                    diagram: '圖表',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: '已刪除的資料表',
                    missing_field: '已刪除的欄位',
                    missing_relationship: '已刪除的關聯',
                    unknown: '對話',
                },
            },
            activities_section: {
                title: '活動',
                filter: '篩選',
                clear: '清除篩選',
                no_results: '沒有符合篩選條件的活動。',
                loading: '正在載入活動…',
                retry: '重試',
                type_filter: {
                    trigger: '類型',
                    label: '依類型篩選',
                    trigger_aria: '依活動類型篩選',
                },
                types: {
                    diagram: '圖表',
                    table: '資料表',
                    field: '欄位',
                    relationship: '關聯',
                    note: '備註',
                    area: '區域',
                    dependency: '相依性',
                },
                you: '你',
                unknown_user: '某人',
                empty_state: {
                    title: '尚無活動',
                    description: '開始編輯以查看最近的變更。',
                },
                errors: {
                    load_failed: '無法載入活動。',
                },
                actions: {
                    add_tables: '{{user}} 新增了資料表 {{table}}',
                    remove_tables: '{{user}} 刪除了資料表',
                    add_field: '{{user}} 新增了欄位 {{field}}',
                    remove_field: '{{user}} 刪除了欄位',
                    update_field: '{{user}} 更新了欄位 {{field}}',
                    add_relationships: '{{user}} 新增了關聯',
                    remove_relationships: '{{user}} 刪除了關聯',
                    update_relationship: '{{user}} 更新了關聯',
                    add_notes: '{{user}} 新增了備註',
                    remove_notes: '{{user}} 刪除了備註',
                    add_areas: '{{user}} 新增了區域',
                    remove_areas: '{{user}} 刪除了區域',
                    add_dependencies: '{{user}} 新增了相依性',
                    remove_dependencies: '{{user}} 刪除了相依性',
                    fallback: '{{user}} 更新了圖表',
                },
            },
            share_section: {
                title: '分享',
                tabs_label: '分享選項',
                tabs: {
                    collaborators: '協作者',
                    public_link: '公開連結',
                },
                collaborators: {
                    description:
                        '邀請具有編輯者或檢視者權限的協作者。他們必須已有 FoxalDB 帳戶。',
                    filter: '篩選',
                    clear: '清除篩選',
                    no_results_title: '無結果',
                    no_results_description: '沒有符合篩選條件的協作者。',
                    role_filter: {
                        trigger: '角色',
                        label: '依角色篩選',
                        trigger_aria: '依協作者角色篩選',
                    },
                },
                public_link: {
                    title: '公開連結',
                    description: '與擁有連結的任何人分享唯讀快照。',
                    coming_soon: '即將推出。',
                },
                loading: '正在載入協作者…',
                retry: '重試',
                errors: {
                    load_failed: '無法載入協作者。',
                },
                member_actions: {
                    title: '協作者操作',
                    trigger_aria: '協作者操作',
                    role: '角色',
                    remove: '移除協作者',
                },
            },
        },

        toolbar: {
            zoom_in: '放大',
            zoom_out: '縮小',
            save: '儲存',
            show_all: '顯示全部',
            undo: '復原',
            redo: '重做',
            reorder_diagram: '自動排列圖表',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: '突出顯示重疊表格',
            filter: '篩選表格',
        },

        new_diagram_dialog: {
            database_selection: {
                title: '選擇您的資料庫',
                description: '為您的新圖表選擇資料庫系統。',
                search_placeholder: '搜尋資料庫管理系統…',
                search_no_results: '沒有符合搜尋條件的資料庫管理系統。',
                clear_search: '清除搜尋',
                primary_group: '主要資料庫',
                other_group: '其他資料庫',
                check_examples_long: '查看範例',
                check_examples_short: '範例',
            },

            choose_intent: {
                title: '您想做什麼？',
                description: '為 {{database}} 建立新圖表。',
                create_empty: '建立空白圖表',
                create_empty_description: '從零開始，自行新增資料表。',
                import_schema: '匯入現有結構描述',
                import_schema_description:
                    '從 SQL、DBML 或中繼資料匯入資料表與關聯。',
                back: '返回',
            },

            import_schema: {
                title: '貼上您的結構描述',
                textarea_label: '結構描述內容',
                textarea_placeholder: '在此貼上 SQL、DBML 或 JSON 中繼資料…',
                auto_detect_hint: '我們會自動偵測格式。',
                or_divider: '或',
                choose_file: '選擇檔案',
                selected_file: '已選檔案：{{name}}',
                back: '返回',
                continue: '繼續',
                mismatch: {
                    title: '此結構描述看起來像 {{detected}}，但您選擇了 {{selected}}。',
                    description: '切換到偵測到的資料庫類型，或返回重新選擇。',
                    switch: '切換到 {{database}}',
                    go_back: '返回',
                },
                ambiguous: {
                    title: '選擇來源資料庫',
                    description:
                        '無法自動識別 SQL 方言。請確認此結構描述來自哪個資料庫。',
                    choose_source: '選擇來源資料庫',
                },
                detection: {
                    dialect: '已偵測到 {{database}}',
                    dbml: '已偵測到 DBML',
                    metadata_json: '已偵測到中繼資料 JSON',
                    diagram_json: '已偵測到圖表 JSON',
                    sql_ambiguous_title: '已偵測到 SQL',
                    sql_ambiguous_description: '無法識別資料庫。',
                    clickhouse_unsupported: '已偵測到 ClickHouse SQL',
                    unsupported: '不支援的格式',
                },
                errors: {
                    unreadable_file: '無法讀取所選檔案。',
                    malformed_json: '無法解析 JSON 內容。',
                    unsupported: '此格式不支援結構描述匯入。',
                    diagram_json: '圖表 JSON 可透過圖表檔案選項匯入。',
                    clickhouse_unsupported:
                        'ClickHouse 不支援 SQL DDL 匯入。請使用 DBML 或從現有資料庫匯入。',
                    file_too_large: '所選檔案大於 5 MB。',
                    import_failed: '無法匯入結構描述。請檢查內容後再試一次。',
                },
            },

            import_database: {
                title: '匯入資料庫',
                database_edition: '資料庫版本:',
                step_1: '請在資料庫中執行以下腳本:',
                step_2: '將腳本結果貼到此處 →',
                script_results_placeholder: '在此處貼上腳本結果...',
                ssms_instructions: {
                    button_text: 'SSMS 操作步驟',
                    title: '操作步驟',
                    step_1: '導航至 工具 > 選項 > 查詢結果 > SQL Server。',
                    step_2: '若使用「結果至網格」，請更改非 XML 資料的最大取得字元數（設定為 9999999）。',
                },
                instructions_link: '需要幫助？觀看教學影片',
                check_script_result: '檢查腳本結果',
            },

            cancel: '取消',
            import_from_file: '從檔案匯入',
            back: '返回',
            empty_diagram: '空資料庫',
            continue: '繼續',
            import: '匯入',
        },

        share_diagram_dialog: {
            title: '分享圖表',
            description: '為您的新圖表選擇資料庫系統。',
            share_button: '分享',
            empty_members: '尚無協作者。',
            remove: '移除',
            roles: {
                owner: '擁有者',
                editor: '編輯者',
                viewer: '檢視者',
            },
            add_member: {
                title: '新增協作者',
                email_label: '電子郵件',
                email_placeholder: '電子郵件地址',
                add: '新增',
                adding: '新增中…',
                cancel: '取消',
            },
            errors: {
                load_failed: '無法載入協作者。',
                add_failed: '無法新增協作者。',
            },
        },

        diagram_role: {
            owner: '擁有者',
            editor: '編輯者',
            viewer: '檢視者',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: '開啟資料庫',
            description: '請從以下列表中選擇一個圖表。',
            table_columns: {
                name: '名稱',
                created_at: '創建時間',
                last_modified: '最後修改時間',
                tables_count: '表格數',
            },
            cancel: '取消',
            open: '開啟',
            new_database: '新建資料庫',

            diagram_actions: {
                open: '開啟',
                duplicate: '複製',
                delete: '刪除',
            },
        },

        export_sql_dialog: {
            title: '匯出 SQL',
            description: '將圖表 Schema 匯出為 {{databaseType}} 格式的腳本',
            close: '關閉',
            loading: {
                text: 'AI 正在生成 {{databaseType}} 的 SQL...',
                description: '最多需要 30 秒。',
            },
            error: {
                message:
                    '生成 SQL 腳本時發生錯誤。稍後再試，或<0>聯繫我們</0>。',
                description:
                    '可以自由使用 OPENAI_TOKEN，詳細說明可參考<0>此處</0>。',
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
            title: '新增關聯',
            primary_table: '主表格',
            primary_field: '主欄位',
            referenced_table: '參照表格',
            referenced_field: '參照欄位',
            primary_table_placeholder: '選擇表格',
            primary_field_placeholder: '選擇欄位',
            referenced_table_placeholder: '選擇表格',
            referenced_field_placeholder: '選擇欄位',
            no_tables_found: '未找到表格',
            no_fields_found: '未找到欄位',
            create: '建立',
            cancel: '取消',
        },

        import_database_dialog: {
            title: '匯入至當前圖表',
            import_schema: {
                title: '匯入結構描述',
                import: '匯入',
                cancel: '取消',
                mismatch: {
                    title: '此結構描述看起來像 {{detected}}，但此圖表是 {{selected}}。',
                    description: '尚不支援跨資料庫匯入。',
                    cancel: '取消',
                },
                ambiguous: {
                    description:
                        '無法自動識別 SQL 方言。請確認如何為目前的 {{selected}} 圖表解讀此結構描述。',
                },
            },
            override_alert: {
                title: '匯入資料庫',
                content: {
                    alert: '匯入此圖表將影響現有表格和關聯。',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> 個新表格將被新增。',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> 個新關聯將被建立。',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> 個表格將被覆蓋。',
                    proceed: '是否繼續？',
                },
                import: '匯入',
                cancel: '取消',
            },
        },

        export_image_dialog: {
            title: '匯出圖片',
            description: '請選擇匯出的倍率:',
            scale_1x: '1x (低品質)',
            scale_2x: '2x (普通品質)',
            scale_4x: '4x (最佳品質)',
            cancel: '取消',
            export: '匯出',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: '選擇 Schema',
            description: '目前顯示多個 Schema，請為新表格選擇一個。',
            cancel: '取消',
            confirm: '確認',
        },

        update_table_schema_dialog: {
            title: '變更 Schema',
            description: '更新表格「{{tableName}}」的 Schema',
            cancel: '取消',
            confirm: '變更',
        },

        create_table_schema_dialog: {
            title: '建立新 Schema',
            description:
                '尚未存在任何 Schema。建立您的第一個 Schema 來組織您的表格。',
            create: '建立',
            cancel: '取消',
        },
        export_diagram_dialog: {
            title: '匯出圖表',
            description: '選擇匯出格式：',
            format_json: 'JSON',
            cancel: '取消',
            export: '匯出',
            // TODO: Translate
            error: {
                title: 'Error exporting diagram',
                description:
                    'Something went wrong. Need help? support@chartdb.io',
            },
        },

        import_diagram_dialog: {
            title: '匯入圖表',
            description: '請在下方貼上圖表的 JSON：',
            cancel: '取消',
            import: '匯入',
            error: {
                title: '匯入圖表時發生錯誤',
                description:
                    '圖表的 JSON 無效。請檢查 JSON 並再試一次。如需幫助，請聯繫 support@chartdb.io',
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
            one_to_one: '一對一',
            one_to_many: '一對多',
            many_to_one: '多對一',
            many_to_many: '多對多',
        },

        canvas_context_menu: {
            new_table: '新建表格',
            new_view: '新檢視',
            new_relationship: '新建關聯',
            new_area: '新區域',
            new_note: '新筆記',
        },

        table_node_context_menu: {
            edit_table: '編輯表格',
            duplicate_table: '複製表格',
            delete_table: '刪除表格',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: '移動到區域',
            no_area: '無區域',
        },

        canvas: {
            all_tables_hidden: '所有表格已隱藏',
            show_all_tables: '顯示全部',
        },

        canvas_filter: {
            title: '篩選表格',
            search_placeholder: '搜尋表格...',
            group_by_schema: '依架構分組',
            group_by_area: '依區域分組',
            no_tables_found: '找不到表格',
            empty_diagram_description: '建立表格以開始',
            no_tables_description: '嘗試調整您的搜尋或篩選',
            clear_filter: '清除篩選',
        },

        snap_to_grid_tooltip: '對齊網格（按住 {{key}}）',

        editing_conflict: {
            one: '{{name}} 也在編輯此項目。',
            two: '{{name1}} 和 {{name2}} 也在編輯此項目。',
            many: '{{name}} 和另外 {{count}} 人也在編輯此項目。',
            fallback_name: '協作者',
            last_writer_wins: '變更未被鎖定。最後儲存的編輯生效。',
        },

        tool_tips: {
            double_click_to_edit: '雙擊以編輯',
        },

        auth: {
            dialog: {
                account_title: '帳戶',
                login_title: '登入 FoxalDB',
                register_title: '建立 FoxalDB 帳戶',
                account_description: '管理目前的工作階段。',
                login_description: '登入以儲存更多圖表並保持同步。',
                register_description: '建立帳戶以儲存更多圖表。',
                checking_session: '正在檢查工作階段...',
                continue_without_account: '免帳號繼續',
            },
            login: {
                title: '登入',
                email_label: '電子郵件',
                password_label: '密碼',
                submit: '登入',
                submitting: '正在登入...',
                switch_to_register: '註冊',
                no_account: '沒有帳戶？',
            },
            register: {
                title: '註冊',
                first_name_label: '名字',
                last_name_label: '姓氏',
                email_label: '電子郵件',
                password_label: '密碼',
                password_confirmation_label: '確認密碼',
                submit: '建立帳戶',
                submitting: '正在建立帳戶...',
                switch_to_login: '登入',
                already_have_account: '已有帳戶？',
            },
            account: {
                signed_in_as: '已登入為',
                logout: '登出',
                back_to_editor: '返回編輯器',
            },
            settings: {
                title: '使用者設定',
                description: '更新您的個人資訊與密碼。',
                change_password_heading: '變更密碼',
                current_password_label: '目前密碼',
                new_password_label: '新密碼',
                password_confirmation_label: '確認新密碼',
                first_name_label: '名字',
                last_name_label: '姓氏',
                email_label: '電子郵件地址',
                submit: '儲存變更',
                submitting: '儲存中...',
                success_title: '個人資料已更新',
                success_description: '您的個人資料已儲存。',
            },
            nav: {
                sign_in: '登入',
                logout: '登出',
                loading: '...',
                user_menu: '帳戶',
                settings: '設定',
                change_language: '語言',
            },
            pages: {
                login_title: 'FoxalDB — 登入',
                register_title: 'FoxalDB — 註冊',
                checking_session: '正在檢查工作階段…',
            },
            errors: {
                first_name_required: '名字為必填項。',
                last_name_required: '姓氏為必填項。',
                generic: '發生錯誤。',
            },
        },

        guest_migration_dialog: {
            title: '匯入本機圖表？',
            description:
                '此裝置上保存了一個圖表。將其匯入您的帳戶以便隨時存取。',
            import: '匯入到帳戶',
            continue_without_import: '不匯入並繼續',
        },

        guest_migration_errors: {
            import_failed: '無法匯入本機圖表。本機副本已保留。',
            activation_failed: '圖表已建立但無法開啟。本機副本已保留。',
            cleanup_failed: '圖表已匯入但無法刪除本機副本。您可以手動刪除。',
            check_failed: '無法讀取本機圖表。',
        },

        language_select: {
            change_language: '變更語言',
        },

        on: '開啟',
        off: '關閉',
    },
};

export const zh_TWMetadata: LanguageMetadata = {
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    code: 'zh_TW',
    countryCode: 'tw',
};
