import type { LanguageMetadata, LanguageTranslation } from '../types';

export const zh_CN: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: '新建',
            browse: '打开',
            tables: '表',
            refs: '引用',
            dependencies: '依赖关系',
            custom_types: '自定义类型',
            conversations: '对话',
            conversations_unread_aria: '对话中有 {{count}} 条未读消息',
            visuals: '视觉效果',
            activities: '活动',
            share: '分享',
        },
        menu: {
            actions: {
                actions: '操作',
                new: '新建...',
                browse: '所有数据库...',
                save: '保存',
                import: '导入数据库',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: '导出 SQL 语句',
                export_as: '导出为',
                delete_diagram: '删除',
            },
            edit: {
                edit: '编辑',
                undo: '撤销',
                redo: '重做',
                clear: '清空',
            },
            view: {
                view: '视图',
                show_sidebar: '展示侧边栏',
                hide_sidebar: '隐藏侧边栏',
                hide_cardinality: '隐藏基数',
                show_cardinality: '展示基数',
                show_field_attributes: '展示字段属性',
                hide_field_attributes: '隐藏字段属性',
                zoom_on_scroll: '滚动缩放',
                show_views: '数据库视图',
                theme: '主题',
                show_dependencies: '展示依赖',
                hide_dependencies: '隐藏依赖',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: '备份',
                export_diagram: '导出关系图',
                restore_diagram: '还原图表',
            },
            help: {
                help: '帮助',
                docs_website: '文档',
                join_discord: '在 Discord 上加入我们',
            },
        },

        delete_diagram_alert: {
            title: '删除关系图',
            description: '此操作无法撤销。这将永久删除关系图。',
            cancel: '取消',
            delete: '删除',
        },

        clear_diagram_alert: {
            title: '清除关系图',
            description: '此操作无法撤销。这将永久删除关系图中的所有数据。',
            cancel: '取消',
            clear: '清空',
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
            title: '自动排列关系图',
            description: '此操作将重新排列关系图中的所有表。是否要继续？',
            reorder: '自动排列',
            cancel: '取消',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: '复制失败',
                description: '不支持剪贴板',
            },
            failed: {
                title: '复制失败',
                description: '出现问题。请再试一次。',
            },
        },

        theme: {
            system: '系统',
            light: '浅色',
            dark: '深色',
        },

        zoom: {
            on: '启用',
            off: '禁用',
        },

        last_saved: '上次保存时间：',
        saved: '已保存',
        loading_diagram: '加载关系图...',
        deselect_all: '取消全选',
        select_all: '全选',
        clear: '清空',
        show_more: '展开',
        show_less: '收起',
        copy_to_clipboard: '复制到剪切板',
        copied: '复制了！',

        side_panel: {
            view_all_options: '查看所有选项...',
            tables_section: {
                tables: '表',
                add_table: '添加表',
                add_view: '添加视图',
                filter: '筛选',
                collapse: '全部折叠',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: '所有表格已隐藏',
                show_all: '显示全部',

                table: {
                    fields: '字段',
                    nullable: '可为空？',
                    primary_key: '主键',
                    indexes: '索引',
                    check_constraints: '检查约束',
                    comments: '注释',
                    no_comments: '空',
                    add_field: '添加字段',
                    add_index: '添加索引',
                    add_check: '添加检查',
                    index_select_fields: '选择字段',
                    no_types_found: '未找到类型',
                    field_name: '名称',
                    field_type: '类型',
                    field_actions: {
                        title: '字段属性',
                        open_discussion: '打开对话',
                        unique: '唯一',
                        auto_increment: '自动递增',
                        comments: '注释',
                        no_comments: '空',
                        delete_field: '删除字段',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: '精度',
                        scale: '小数位',
                    },
                    index_actions: {
                        title: '索引属性',
                        name: '名称',
                        unique: '唯一',
                        index_type: '索引类型',
                        delete_index: '删除索引',
                    },
                    check_constraint_actions: {
                        title: '检查约束',
                        expression: '表达式',
                        delete: '删除检查约束',
                    },
                    table_actions: {
                        title: '表操作',
                        open_discussion: '打开对话',
                        change_schema: '更改模式',
                        add_field: '添加字段',
                        add_index: '添加索引',
                        duplicate_table: '复制表',
                        delete_table: '删除表',
                    },
                },
                empty_state: {
                    title: '没有表',
                    description: '新建表以开始',
                },
            },
            refs_section: {
                refs: '引用',
                filter: '筛选',
                clear: '清除筛选',
                no_results: '未找到符合筛选条件的引用。',
                collapse: '全部折叠',
                add_relationship: '添加关系',
                relationships: '关系',
                dependencies: '依赖关系',
                relationship: {
                    relationship: '关系',
                    primary: '主表',
                    foreign: '关联表',
                    cardinality: '基数',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: '删除',
                    switch_tables: '切换表',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: '操作',
                        open_discussion: '打开对话',
                        delete_relationship: '删除',
                    },
                },
                dependency: {
                    dependency: '依赖',
                    table: '表',
                    dependent_table: '依赖视图',
                    delete_dependency: '删除',
                    dependency_actions: {
                        title: '操作',
                        delete_dependency: '删除',
                    },
                },
                empty_state: {
                    title: '无关系',
                    description: '创建关系以开始',
                },
            },

            areas_section: {
                areas: '区域',
                add_area: '添加区域',
                filter: '筛选',
                clear: '清除筛选',
                no_results: '未找到符合筛选条件的区域。',

                area: {
                    area_actions: {
                        title: '区域操作',
                        edit_name: '编辑名称',
                        delete_area: '删除区域',
                    },
                },
                empty_state: {
                    title: '没有区域',
                    description: '创建区域以开始',
                },
            },

            visuals_section: {
                visuals: '视觉效果',
                tabs: {
                    areas: '区域',
                    notes: '笔记',
                },
            },

            notes_section: {
                filter: '筛选',
                add_note: '添加笔记',
                no_results: '未找到笔记',
                clear: '清除筛选',
                empty_state: {
                    title: '没有笔记',
                    description: '创建笔记以在画布上添加文本注释',
                },
                note: {
                    empty_note: '空笔记',
                    note_actions: {
                        title: '笔记操作',
                        edit_content: '编辑内容',
                        delete_note: '删除笔记',
                    },
                },
            },

            custom_types_section: {
                custom_types: '自定义类型',
                filter: '筛选',
                clear: '清除筛选',
                no_results: '未找到符合筛选条件的自定义类型。',
                new_type: '新类型',
                empty_state: {
                    title: '没有自定义类型',
                    description:
                        '当数据库中有可用的自定义类型时，它们将显示在这里',
                },
                custom_type: {
                    kind: '类型',
                    enum_values: '枚举值',
                    composite_fields: '字段',
                    no_fields: '未定义字段',
                    no_values: '没有定义枚举值',
                    field_name_placeholder: '字段名称',
                    field_type_placeholder: '选择类型',
                    add_field: '添加字段',
                    no_fields_tooltip: '此自定义类型未定义字段',
                    custom_type_actions: {
                        title: '操作',
                        highlight_fields: '高亮字段',
                        delete_custom_type: '删除',
                        clear_field_highlight: '清除高亮',
                    },
                    delete_custom_type: '删除类型',
                },
            },
            conversations_section: {
                title: '对话',
                tabs_label: '对话',
                tabs: {
                    active: '活跃',
                    archives: '已归档',
                },
                loading: '正在加载对话…',
                filter: '筛选',
                clear: '清除筛选',
                no_results_title: '无结果',
                no_results_description: '未找到符合筛选条件的对话。',

                type_filter: {
                    trigger: '类型',
                    label: '按类型筛选',
                    trigger_aria: '按对话类型筛选',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: '重试',
                dismiss: 'Dismiss',
                read_only: '只读',
                deleted_user: '已删除用户',
                unread: {
                    badge_aria: '{{count}} 条未读消息',
                },
                inactive: {
                    title: '对话 unavailable',
                    description:
                        '对话 are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: '暂无对话',
                    active_description: '创建对话以开始',
                    archives_title: 'No archived 对话',
                    archives_description:
                        'Archived 对话 will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load 对话',
                    load_description:
                        'Something went wrong while loading 对话. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: '打开对话',
                    start: '开始对话',
                    pending: '正在开始对话…',
                    diagram_name: '图表',
                    open_aria: '打开 {{name}} 的对话',
                    start_aria: '为 {{name}} 开始对话',
                    open_tooltip: '打开 {{name}} 的对话',
                    start_tooltip: '为 {{name}} 开始对话',
                    pending_tooltip: '正在为 {{name}} 开始对话…',
                    action_tooltip: '对话',
                    unavailable_description: '您无法在此图表上开始对话。',
                    errors: {
                        validation: '此目标不适用于对话。',
                        forbidden: '您没有权限开始此对话。',
                        not_found: '此目标在图表上已不存在。',
                        conflict: '暂时无法开始此对话。请重试。',
                        generic: '无法打开此对话。请重试。',
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
                    message_count: '{{count}} 条消息',
                    no_messages: '暂无消息',
                    last_activity: '最近活动',
                    open_aria: '打开 {{target}} 的对话',
                    focus_target_aria: '在图表中显示 {{target}}',
                    author_tooltip: '{{name}} 的最新消息',
                    author_missing_tooltip: '无作者信息',
                    actions: {
                        menu_aria: '对话选项',
                        open: '打开',
                        delete: '删除',
                    },
                    delete_dialog: {
                        title: '删除对话？',
                        description: '这将永久删除此对话及其所有消息。',
                        cancel: '取消',
                        confirm: '删除',
                        deleting: '正在删除…',
                        errors: {
                            delete_failed: '无法删除此对话。请重试。',
                            forbidden: '您没有删除此对话的权限。',
                            not_found: '此对话已不可用。',
                        },
                    },
                },
                detail: {
                    back: '返回',
                    back_aria: '返回对话列表',
                    loading: '正在加载消息…',
                    loading_more: '正在加载更早的消息…',
                    load_older: '加载更早的消息',
                    new_messages_badge_one: '1 条新消息',
                    new_messages_badge_other: '{{count}} 条新消息',
                    new_messages_badge_label_one: '新消息',
                    new_messages_badge_label_other: '新消息',
                    new_messages_badge_aria_one: '滚动到新消息',
                    new_messages_badge_aria_other: '滚动到 {{count}} 条新消息',
                    empty: {
                        title: '暂无消息',
                        description: '此对话没有任何消息。',
                    },
                    errors: {
                        load_title: '无法加载消息',
                        load_description: '加载消息时出错，请重试。',
                    },
                    archive_banner: {
                        title: '已归档的对话',
                        description: '此对话为只读。无法添加、编辑或删除消息。',
                    },
                    metadata: {
                        status_label: '状态',
                        status_active: '活跃',
                        status_archived: '已归档',
                        message_count_label: '消息数量',
                        message_count: '{{count}} 条消息',
                    },
                    message: {
                        edited: '（已编辑）',
                        edited_aria: '消息已编辑',
                        day_separator: {
                            today: '今天',
                            yesterday: '昨天',
                        },
                        actions: {
                            title: '消息操作',
                            edit: '编辑',
                            delete: '删除',
                        },
                        reactions: {
                            add_aria: '添加表情回应',
                            add_tooltip: '添加表情回应',
                            picker_loading: '正在加载表情选择器…',
                            picker_aria_label: '表情选择器',
                            picker_search_placeholder: '搜索表情…',
                            picker_empty: '未找到表情。',
                            chip_aria: '{{emoji}} 回应，{{count}}',
                            preview_and_others_one: '以及其他 {{count}} 人',
                            preview_and_others_other: '以及其他 {{count}} 人',
                            errors: {
                                generic: '无法更新回应。请重试。',
                                forbidden: '您无权对此消息作出回应。',
                                archived: '此对话已归档，回应为只读。',
                                not_found: '此消息已不可用。',
                                invalid_emoji: '此表情无效。',
                            },
                        },
                    },
                    composer: {
                        label: '消息',
                        placeholder: '撰写消息…',
                        submit: '发送',
                        submitting: '发送中…',
                        form_aria_label: '新对话消息',
                        keyboard_hint: '按 Enter 发送。Shift+Enter 换行。',
                        counter_aria_label: '已使用 {{count}} / {{max}} 个字符',
                        errors: {
                            empty: '请输入要发送的消息。',
                            too_long: '消息不能超过 2000 个字符。',
                            create_failed: '无法发送消息。请重试。',
                        },
                    },
                    edit: {
                        label: '消息',
                        form_aria_label: '编辑对话消息',
                        save: '保存',
                        saving: '保存中…',
                        cancel: '取消',
                        counter_aria_label: '已使用 {{count}} / {{max}} 个字符',
                        errors: {
                            empty: '请输入要保存的消息。',
                            too_long: '消息不能超过 2000 个字符。',
                            update_failed: '无法更新消息。请重试。',
                        },
                    },
                    delete_dialog: {
                        title: '删除消息',
                        description: '确定要删除此消息吗？此操作无法撤销。',
                        cancel: '取消',
                        confirm: '删除',
                        deleting: '删除中…',
                        errors: {
                            delete_failed: '无法删除此消息。请重试。',
                        },
                    },
                    mutation_errors: {
                        forbidden: '您无权更改此消息。',
                        archived: '此对话已归档，为只读状态。',
                        not_found: '此对话或消息已不可用。',
                    },
                },

                targets: {
                    diagram: '图表',
                    table: '表',
                    field: '字段',
                    relationship: '关系',
                    unknown: '对话',
                },
                target_labels: {
                    diagram: '图表',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: '已删除的表',
                    missing_field: '已删除的字段',
                    missing_relationship: '已删除的关系',
                    unknown: '对话',
                },
            },
            activities_section: {
                title: '活动',
                filter: '筛选',
                clear: '清除筛选',
                no_results: '没有与筛选条件匹配的活动。',
                loading: '正在加载活动…',
                retry: '重试',
                type_filter: {
                    trigger: '类型',
                    label: '按类型筛选',
                    trigger_aria: '按活动类型筛选',
                },
                types: {
                    diagram: '图表',
                    table: '表',
                    field: '字段',
                    relationship: '关系',
                    note: '备注',
                    area: '区域',
                    dependency: '依赖',
                },
                you: '你',
                unknown_user: '某人',
                empty_state: {
                    title: '暂无活动',
                    description: '开始编辑以查看最近的更改。',
                },
                errors: {
                    load_failed: '无法加载活动。',
                },
                actions: {
                    add_tables: '{{user}} 添加了表 {{table}}',
                    remove_tables: '{{user}} 删除了一个表',
                    add_field: '{{user}} 添加了字段 {{field}}',
                    remove_field: '{{user}} 删除了一个字段',
                    update_field: '{{user}} 更新了字段 {{field}}',
                    add_relationships: '{{user}} 添加了关系',
                    remove_relationships: '{{user}} 删除了关系',
                    update_relationship: '{{user}} 更新了关系',
                    add_notes: '{{user}} 添加了备注',
                    remove_notes: '{{user}} 删除了备注',
                    add_areas: '{{user}} 添加了区域',
                    remove_areas: '{{user}} 删除了区域',
                    add_dependencies: '{{user}} 添加了依赖',
                    remove_dependencies: '{{user}} 删除了依赖',
                    fallback: '{{user}} 更新了图表',
                },
            },
            share_section: {
                title: '分享',
                tabs_label: '分享选项',
                tabs: {
                    collaborators: '协作者',
                    public_link: '公开链接',
                },
                collaborators: {
                    description:
                        '邀请具有编辑者或查看者权限的协作者。他们必须已有 FoxalDB 账户。',
                },
                public_link: {
                    title: '公开链接',
                    description: '与拥有链接的任何人分享只读快照。',
                    coming_soon: '即将推出。',
                },
                loading: '正在加载协作者…',
                retry: '重试',
                errors: {
                    load_failed: '无法加载协作者。',
                },
            },
        },

        toolbar: {
            zoom_in: '放大',
            zoom_out: '缩小',
            save: '保存',
            show_all: '展示全部',
            undo: '撤销',
            redo: '重做',
            reorder_diagram: '自动排列关系图',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: '突出显示重叠的表',
            filter: '筛选表',
        },

        new_diagram_dialog: {
            database_selection: {
                title: '您是哪种数据库？',
                description: '每种数据库都有其特性和功能。',
                check_examples_long: '查看样例',
                check_examples_short: '样例',
            },

            import_database: {
                title: '导入您的数据库',
                database_edition: '数据库类型：',
                step_1: '在您的数据库中执行以下脚本：',
                step_2: '将结果粘贴于此 →',
                script_results_placeholder: '结果...',
                ssms_instructions: {
                    button_text: 'SSMS 说明',
                    title: '说明',
                    step_1: '前往 工具 > 选项 > 查询结果 > SQL Server。',
                    // TODO: Add translations
                    step_2: '如果您使用“Result to Grid”功能，请将非 XML 数据的最大提取字符数更改为 9999999。',
                },
                instructions_link: '需要帮助？看看如何操作',
                check_script_result: '检查脚本结果',
            },

            cancel: '取消',
            import_from_file: '从文件导入',
            back: '上一步',
            empty_diagram: '空数据库',
            continue: '下一步',
            import: '导入',
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

        open_diagram_dialog: {
            title: '打开数据库',
            description: '从下面的列表中选择一个图表打开。',
            table_columns: {
                name: '名称',
                created_at: '创建于',
                last_modified: '最后修改于',
                tables_count: '表数量',
            },
            cancel: '取消',
            open: '打开',
            new_database: '新建数据库',

            diagram_actions: {
                open: '打开',
                duplicate: '复制',
                delete: '删除',
            },
        },

        export_sql_dialog: {
            title: '导出 SQL 语句',
            description: '将您的图表模式导出为 {{databaseType}} 脚本。',
            close: '关闭',
            loading: {
                text: 'AI 正在为 {{databaseType}} 生成 SQL 语句...',
                description: '此操作最多需要 30 秒。',
            },
            error: {
                message:
                    '生成 SQL 脚本时出错。请稍后再试，或者 <0>联系我们</0>。',
                description:
                    '随时使用您的 OPENAI_TOKEN，在<0>这里</0>查看手册。',
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
            title: '创建关系',
            primary_table: '主表',
            primary_field: '主键字段',
            referenced_table: '被引用表',
            referenced_field: '被引用字段',
            primary_table_placeholder: '选择表',
            primary_field_placeholder: '选择字段',
            referenced_table_placeholder: '选择表',
            referenced_field_placeholder: '选择字段',
            no_tables_found: '未找到表',
            no_fields_found: '未找到字段',
            create: '创建',
            cancel: '取消',
        },

        import_database_dialog: {
            title: '导入到当前关系图',
            override_alert: {
                title: '导入数据库',
                content: {
                    alert: '导入此关系图将影响现有的表和关系。',
                    new_tables:
                        '将添加 <bold>{{newTablesNumber}}</bold> 个新表。',
                    new_relationships:
                        '将创建 <bold>{{newRelationshipsNumber}}</bold> 个新关系。',
                    tables_override:
                        '将覆盖 <bold>{{tablesOverrideNumber}}</bold> 个表。',
                    proceed: '您是否要继续操作？',
                },
                import: '导入',
                cancel: '取消',
            },
        },

        export_image_dialog: {
            title: '导出图片',
            description: '选择导出的缩放比例：',
            scale_1x: '1x (低质量)',
            scale_2x: '2x (普通质量)',
            scale_4x: '4x (最佳质量)',
            cancel: '取消',
            export: '导出',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: '选择模式',
            description: '当前显示多个模式。请选择一个用于新表。',
            cancel: '取消',
            confirm: '确认',
        },

        update_table_schema_dialog: {
            title: '更改模式',
            description: '更新表 "{{tableName}}" 的模式。',
            cancel: '取消',
            confirm: '更改',
        },

        create_table_schema_dialog: {
            title: '创建新模式',
            description: '尚未存在任何模式。创建您的第一个模式来组织您的表。',
            create: '创建',
            cancel: '取消',
        },
        star_us_dialog: {
            title: '帮助我们改进！',
            description: '您想在 GitHub 上为我们加注星标吗？只需点击一下即可！',
            close: '以后再说',
            confirm: '当然！',
        },
        export_diagram_dialog: {
            title: '导出关系图',
            description: '选择导出格式：',
            format_json: 'JSON',
            cancel: '取消',
            export: '导出',
            // TODO: translate
            error: {
                title: 'Error exporting diagram',
                description:
                    'Something went wrong. Need help? support@chartdb.io',
            },
        },

        import_diagram_dialog: {
            title: '导入关系图',
            description: '在下方粘贴关系图的 JSON：',
            cancel: '取消',
            import: '导入',
            error: {
                title: '导入关系图时出错',
                description:
                    '关系图 JSON 无效，请检查 JSON 后重试。需要帮助？ 联系 support@chartdb.io',
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
            one_to_one: '一对一',
            one_to_many: '一对多',
            many_to_one: '多对一',
            many_to_many: '多对多',
        },

        canvas_context_menu: {
            new_table: '新建表',
            new_view: '新建视图',
            new_relationship: '新建关系',
            new_area: '新建区域',
            new_note: '新笔记',
        },

        table_node_context_menu: {
            edit_table: '编辑表',
            duplicate_table: '复制表',
            delete_table: '删除表',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: '移动到区域',
            no_area: '无区域',
        },

        canvas: {
            all_tables_hidden: '所有表格已隐藏',
            show_all_tables: '显示全部',
        },

        canvas_filter: {
            title: '筛选表格',
            search_placeholder: '搜索表格...',
            group_by_schema: '按模式分组',
            group_by_area: '按区域分组',
            no_tables_found: '未找到表格',
            empty_diagram_description: '创建表格以开始',
            no_tables_description: '尝试调整您的搜索或筛选',
            clear_filter: '清除筛选',
        },

        snap_to_grid_tooltip: '对齐到网格（按住 {{key}}）',

        editing_conflict: {
            one: '{{name}} 也在编辑此项。',
            two: '{{name1}} 和 {{name2}} 也在编辑此项。',
            many: '{{name}} 和另外 {{count}} 人也在编辑此项。',
            fallback_name: '协作者',
            last_writer_wins: '更改未被锁定。最后保存的编辑生效。',
        },

        tool_tips: {
            double_click_to_edit: '双击编辑',
        },

        auth: {
            dialog: {
                account_title: '账户',
                login_title: '登录 FoxalDB',
                register_title: '创建 FoxalDB 账户',
                account_description: '管理当前会话。',
                login_description: '登录以保存更多图表并保持同步。',
                register_description: '创建账户以保存更多图表。',
                checking_session: '正在检查会话...',
                continue_without_account: '免账号继续',
            },
            login: {
                title: '登录',
                email_label: '电子邮件',
                password_label: '密码',
                submit: '登录',
                submitting: '正在登录...',
                switch_to_register: '注册',
                no_account: '没有账户？',
            },
            register: {
                title: '注册',
                first_name_label: '名',
                last_name_label: '姓',
                email_label: '电子邮件',
                password_label: '密码',
                password_confirmation_label: '确认密码',
                submit: '创建账户',
                submitting: '正在创建账户...',
                switch_to_login: '登录',
                already_have_account: '已有账户？',
            },
            account: {
                signed_in_as: '已登录为',
                logout: '退出登录',
                back_to_editor: '返回编辑器',
            },
            nav: {
                sign_in: '登录',
                logout: '退出登录',
                loading: '...',
            },
            pages: {
                login_title: 'FoxalDB — 登录',
                register_title: 'FoxalDB — 注册',
                checking_session: '正在检查会话…',
            },
            errors: {
                first_name_required: '名为必填项。',
                last_name_required: '姓为必填项。',
                generic: '出了点问题。',
            },
        },

        guest_migration_dialog: {
            title: '导入本地图表？',
            description:
                '此设备上保存了一个图表。将其导入您的账户以便随时访问。',
            import: '导入到账户',
            continue_without_import: '不导入并继续',
        },

        guest_migration_errors: {
            import_failed: '无法导入本地图表。本地副本已保留。',
            activation_failed: '图表已创建但无法打开。本地副本已保留。',
            cleanup_failed: '图表已导入但无法删除本地副本。您可以手动删除。',
            check_failed: '无法读取本地图表。',
        },

        language_select: {
            change_language: '语言',
        },

        on: '开启',
        off: '关闭',
    },
};

export const zh_CNMetadata: LanguageMetadata = {
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    code: 'zh_CN',
};
