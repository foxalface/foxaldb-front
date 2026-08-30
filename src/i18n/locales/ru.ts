import type { LanguageMetadata, LanguageTranslation } from '../types';

export const ru: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Новая',
            browse: 'Открыть',
            tables: 'Таблицы',
            refs: 'Ссылки',
            dependencies: 'Зависимости',
            custom_types: 'Пользовательские типы',
            conversations: 'Беседы',
            conversations_unread_aria:
                '{{count}} непрочитанных сообщений в обсуждениях',
            visuals: 'Визуальные элементы',
            activities: 'Активность',
            share: 'Поделиться',
        },
        menu: {
            actions: {
                actions: 'Действия',
                new: 'Новая...',
                browse: 'Все базы данных...',
                save: 'Сохранить',
                import: 'Импортировать базу данных',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Экспорт SQL',
                export_as: 'Экспортировать как',
                delete_diagram: 'Удалить',
            },
            edit: {
                edit: 'Изменение',
                undo: 'Отменить',
                redo: 'Вернуть',
                clear: 'Очистить',
            },
            view: {
                view: 'Вид',
                show_sidebar: 'Показать боковую панель',
                hide_sidebar: 'Скрыть боковую панель',
                hide_cardinality: 'Скрыть виды связи',
                show_cardinality: 'Показать виды связи',
                show_field_attributes: 'Показать атрибуты поля',
                hide_field_attributes: 'Скрыть атрибуты поля',
                zoom_on_scroll: 'Увеличение при прокрутке',
                show_views: 'Представления базы данных',
                theme: 'Тема',
                show_dependencies: 'Показать зависимости',
                hide_dependencies: 'Скрыть зависимости',
                show_minimap: 'Показать мини-карту',
                hide_minimap: 'Скрыть мини-карту',
            },
            backup: {
                backup: 'Бэкап',
                export_diagram: 'Экспорт диаграммы',
                restore_diagram: 'Восстановить диаграмму',
            },
            help: {
                help: 'Помощь',
                docs_website: 'Документация',
                join_discord: 'Присоединиться к сообществу в Discord',
            },
        },

        delete_diagram_alert: {
            title: 'Выберите базу данных',
            description: 'Выберите систему баз данных для новой диаграммы.',
            cancel: 'Отменить',
            delete: 'Удалить',
        },

        clear_diagram_alert: {
            title: 'Очистить диаграмму',
            description:
                'Это действие нельзя отменить. Это навсегда удалит все данные в диаграмме.',
            cancel: 'Отменить',
            clear: 'Очистить',
        },

        diagram_access: {
            removed: {
                title: 'Выберите базу данных',
                description: 'Выберите систему баз данных для новой диаграммы.',
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
            title: 'Автоматическая расстановка диаграммы',
            description:
                'Это действие переставит все таблицы на диаграмме. Хотите продолжить?',
            reorder: 'Автоматическая расстановка',
            cancel: 'Отменить',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Ошибка копирования',
                description: 'Буфер обмена не поддерживается',
            },
            failed: {
                title: 'Ошибка копирования',
                description:
                    'Что-то пошло не так. Пожалуйста, попробуйте еще раз.',
            },
        },

        theme: {
            system: 'Системная',
            light: 'Светлая',
            dark: 'Темная',
        },

        zoom: {
            on: 'Включено',
            off: 'Выключено',
        },

        last_saved: 'Последнее сохранение',
        saved: 'Сохранено',
        loading_diagram: 'Загрузка диаграммы...',
        deselect_all: 'Отменить выбор всех',
        select_all: 'Выбрать все',
        delete: 'Удалить',
        clear: 'Очистить',
        show_more: 'Показать больше',
        show_less: 'Показать меньше',

        side_panel: {
            view_all_options: 'Просмотреть все варианты...',
            tables_section: {
                tables: 'Таблицы',
                add_table: 'Добавить таблицу',
                add_view: 'Добавить представление',
                filter: 'Фильтр',
                collapse: 'Свернуть все',
                clear: 'Очистить фильтр',

                no_results:
                    'Таблицы не найдены, соответствующие вашему фильтру.',
                show_list: 'Переключиться на список таблиц',
                show_dbml: 'Переключиться на редактор DBML',
                all_hidden: 'Все таблицы скрыты',
                show_all: 'Показать все',

                table: {
                    fields: 'Поля',
                    nullable: 'Может быть NULL?',
                    primary_key: 'Первичный ключ',
                    indexes: 'Индексы',
                    check_constraints: 'Проверочные ограничения',
                    comments: 'Комментарии',
                    no_comments: 'Нет комментария',
                    add_field: 'Добавить поле',
                    add_index: 'Добавить индекс',
                    add_check: 'Добавить проверку',
                    index_select_fields: 'Выберите поля',
                    no_types_found: 'Типы не найдены',
                    field_name: 'Имя',
                    field_type: 'Тип',
                    field_actions: {
                        title: 'Атрибуты поля',
                        open_discussion: 'Открыть беседу',
                        unique: 'Уникальный',
                        auto_increment: 'Автоинкремент',
                        comments: 'Комментарии',
                        no_comments: 'Нет комментария',
                        delete_field: 'Удалить поле',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        character_length: 'Макс. длина',
                        precision: 'Точность',
                        scale: 'Масштаб',
                    },
                    index_actions: {
                        title: 'Атрибуты индекса',
                        name: 'Имя',
                        unique: 'Уникальный',
                        index_type: 'Тип индекса',
                        delete_index: 'Удалить индекс',
                    },
                    check_constraint_actions: {
                        title: 'Проверочное ограничение',
                        expression: 'Выражение',
                        delete: 'Удалить ограничение',
                    },
                    table_actions: {
                        title: 'Действия',
                        open_discussion: 'Открыть беседу',
                        change_schema: 'Изменить схему',
                        add_field: 'Добавить поле',
                        add_index: 'Добавить индекс',
                        duplicate_table: 'Дублировать таблицу',
                        delete_table: 'Удалить таблицу',
                    },
                },
                empty_state: {
                    title: 'Нет таблиц',
                    description: 'Создайте таблицу, чтобы начать',
                },
            },
            refs_section: {
                refs: 'Ссылки',
                filter: 'Фильтр',
                clear: 'Сбросить фильтр',
                no_results:
                    'Не найдено ссылок, соответствующих вашему фильтру.',
                collapse: 'Свернуть все',
                add_relationship: 'Добавить отношение',
                relationships: 'Отношения',
                dependencies: 'Зависимости',
                relationship: {
                    relationship: 'Отношение',
                    primary: 'Основная таблица',
                    foreign: 'Связанная таблица',
                    cardinality: 'Тип множественной связи',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Удалить',
                    switch_tables: 'Поменять таблицы',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Действия',
                        open_discussion: 'Открыть беседу',
                        delete_relationship: 'Удалить',
                    },
                },
                dependency: {
                    dependency: 'Зависимость',
                    table: 'Таблица',
                    dependent_table: 'Зависимое представление',
                    delete_dependency: 'Удалить',
                    dependency_actions: {
                        title: 'Действия',
                        delete_dependency: 'Удалить',
                    },
                },
                empty_state: {
                    title: 'Нет отношений',
                    description: 'Создайте отношение, чтобы начать',
                },
            },

            areas_section: {
                areas: 'Области',
                add_area: 'Добавить область',
                filter: 'Фильтр',
                clear: 'Очистить фильтр',

                no_results:
                    'Области не найдены, соответствующие вашему фильтру.',

                area: {
                    area_actions: {
                        title: 'Действия',
                        edit_name: 'Изменить название',
                        delete_area: 'Удалить область',
                    },
                },
                empty_state: {
                    title: 'Нет областей',
                    description: 'Создайте область, чтобы начать',
                },
            },

            visuals_section: {
                visuals: 'Визуальные элементы',
                tabs: {
                    areas: 'Области',
                    notes: 'Заметки',
                },
            },

            notes_section: {
                filter: 'Фильтр',
                add_note: 'Добавить Заметку',
                no_results: 'Заметки не найдены',
                clear: 'Очистить Фильтр',
                empty_state: {
                    title: 'Нет Заметок',
                    description:
                        'Создайте заметку, чтобы добавить текстовые аннотации на холсте',
                },
                note: {
                    empty_note: 'Пустая заметка',
                    note_actions: {
                        title: 'Действия с Заметкой',
                        edit_content: 'Редактировать Содержимое',
                        delete_note: 'Удалить Заметку',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Пользовательские типы',
                filter: 'Фильтр',
                clear: 'Очистить фильтр',
                no_results:
                    'Не найдено пользовательских типов, соответствующих фильтру.',
                new_type: 'Новый тип',
                empty_state: {
                    title: 'Нет пользовательских типов',
                    description:
                        'Пользовательские типы появятся здесь, когда будут доступны в вашей базе данных',
                },
                custom_type: {
                    kind: 'Вид',
                    enum_values: 'Значения перечисления',
                    composite_fields: 'Поля',
                    no_fields: 'Поля не определены',
                    no_values: 'Значения перечисления не определены',
                    field_name_placeholder: 'Имя поля',
                    field_type_placeholder: 'Выберите тип',
                    add_field: 'Добавить поле',
                    no_fields_tooltip:
                        'Для этого пользовательского типа поля не определены',
                    custom_type_actions: {
                        title: 'Действия',
                        highlight_fields: 'Выделить поля',
                        delete_custom_type: 'Удалить',
                        clear_field_highlight: 'Снять выделение',
                    },
                    delete_custom_type: 'Удалить тип',
                },
            },
            conversations_section: {
                title: 'Беседы',
                tabs_label: 'Беседы',
                tabs: {
                    active: 'Активные',
                    archives: 'Архивные',
                },
                loading: 'Загрузка бесед…',
                filter: 'Фильтр',
                clear: 'Очистить фильтр',
                no_results_title: 'Нет результатов',
                no_results_description:
                    'Не найдено бесед, соответствующих вашему фильтру.',

                type_filter: {
                    trigger: 'Тип',
                    label: 'Фильтр по типу',
                    trigger_aria: 'Фильтровать по типу беседы',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'Повторить',
                dismiss: 'Dismiss',
                read_only: 'Только чтение',
                deleted_user: 'Удалённый пользователь',
                unread: {
                    badge_aria: '{{count}} непрочитанных сообщений',
                },
                inactive: {
                    title: 'Беседы unavailable',
                    description:
                        'Беседы are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'Нет беседы',
                    active_description: 'Создайте беседу, чтобы начать',
                    archives_title: 'No archived беседы',
                    archives_description:
                        'Archived беседы will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load беседы',
                    load_description:
                        'Something went wrong while loading беседы. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'Открыть беседу',
                    start: 'Начать беседу',
                    pending: 'Запуск беседы…',
                    diagram_name: 'Диаграмма',
                    open_aria: 'Открыть беседу для {{name}}',
                    start_aria: 'Начать беседу для {{name}}',
                    open_tooltip: 'Открыть беседу для {{name}}',
                    start_tooltip: 'Начать беседу для {{name}}',
                    pending_tooltip: 'Запуск беседы для {{name}}…',
                    action_tooltip: 'Беседа',
                    unavailable_description:
                        'Вы не можете начинать беседы на этой диаграмме.',
                    errors: {
                        validation: 'Эта цель недопустима для беседы.',
                        forbidden: 'У вас нет разрешения начать эту беседу.',
                        not_found: 'Эта цель больше недоступна на диаграмме.',
                        conflict:
                            'Не удалось начать беседу. Попробуйте ещё раз.',
                        generic:
                            'Не удалось открыть беседу. Попробуйте ещё раз.',
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
                    message_count: '{{count}} сообщений',
                    no_messages: 'Сообщений пока нет',
                    last_activity: 'Последняя активность',
                    open_aria: 'Открыть беседу для {{target}}',
                    focus_target_aria: 'Показать {{target}} на диаграмме',
                    author_tooltip: 'Последнее сообщение от {{name}}',
                    author_missing_tooltip: 'Нет информации об авторе',
                    actions: {
                        menu_aria: 'Параметры беседы',
                        open: 'Открыть',
                        delete: 'Удалить',
                    },
                    delete_dialog: {
                        title: 'Удалить беседу?',
                        description:
                            'Это навсегда удалит эту беседу и все её сообщения.',
                        cancel: 'Отмена',
                        confirm: 'Удалить',
                        deleting: 'Удаление…',
                        errors: {
                            delete_failed:
                                'Не удалось удалить эту беседу. Повторите попытку.',
                            forbidden:
                                'У вас нет прав на удаление этой беседы.',
                            not_found: 'Эта беседа больше недоступна.',
                        },
                    },
                },
                detail: {
                    back: 'Назад',
                    back_aria: 'Вернуться к списку бесед',
                    loading: 'Загрузка сообщений…',
                    loading_more: 'Загрузка более старых сообщений…',
                    load_older: 'Загрузить более старые сообщения',
                    new_messages_badge_one: '1 новое сообщение',
                    new_messages_badge_other: '{{count}} новых сообщений',
                    new_messages_badge_label_one: 'новое сообщение',
                    new_messages_badge_label_other: 'новых сообщений',
                    new_messages_badge_aria_one: 'Перейти к новому сообщению',
                    new_messages_badge_aria_other:
                        'Перейти к {{count}} новым сообщениям',
                    empty: {
                        title: 'Нет сообщений',
                        description: 'В этой беседе нет сообщений.',
                    },
                    errors: {
                        load_title: 'Не удалось загрузить сообщения',
                        load_description:
                            'При загрузке сообщений произошла ошибка. Попробуйте снова.',
                    },
                    archive_banner: {
                        title: 'Архивная беседа',
                        description:
                            'Эта беседа доступна только для чтения. Сообщения нельзя добавлять, редактировать или удалять.',
                    },
                    metadata: {
                        status_label: 'Статус',
                        status_active: 'Активная',
                        status_archived: 'Архивная',
                        message_count_label: 'Количество сообщений',
                        message_count: '{{count}} сообщений',
                    },
                    message: {
                        edited: '(изменено)',
                        edited_aria: 'Сообщение было изменено',
                        day_separator: {
                            today: 'Сегодня',
                            yesterday: 'Вчера',
                        },
                        actions: {
                            title: 'Действия с сообщением',
                            edit: 'Редактировать',
                            delete: 'Удалить',
                        },
                        reactions: {
                            add_aria: 'Добавить реакцию',
                            add_tooltip: 'Добавить реакцию',
                            picker_loading: 'Загрузка выбора эмодзи…',
                            picker_aria_label: 'Выбор эмодзи',
                            picker_search_placeholder: 'Поиск эмодзи…',
                            picker_empty: 'Эмодзи не найдены.',
                            chip_aria: 'Реакция {{emoji}}, {{count}}',
                            preview_and_others_one: 'и ещё {{count}}',
                            preview_and_others_other: 'и ещё {{count}}',
                            errors: {
                                generic:
                                    'Не удалось обновить реакцию. Попробуйте снова.',
                                forbidden:
                                    'Вам не разрешено реагировать на это сообщение.',
                                archived:
                                    'Эта беседа архивирована, реакции доступны только для просмотра.',
                                not_found: 'Это сообщение больше недоступно.',
                                invalid_emoji: 'Это эмодзи недействительно.',
                            },
                        },
                    },
                    composer: {
                        label: 'Сообщение',
                        placeholder: 'Напишите сообщение…',
                        submit: 'Отправить',
                        submitting: 'Отправка…',
                        form_aria_label: 'Новое сообщение в беседе',
                        keyboard_hint:
                            'Enter — отправить. Shift+Enter — новая строка.',
                        counter_aria_label:
                            'Использовано {{count}} из {{max}} символов',
                        errors: {
                            empty: 'Введите сообщение для отправки.',
                            too_long:
                                'Сообщения не могут превышать 2000 символов.',
                            create_failed:
                                'Не удалось отправить сообщение. Попробуйте снова.',
                        },
                    },
                    edit: {
                        label: 'Сообщение',
                        form_aria_label: 'Редактировать сообщение беседы',
                        save: 'Сохранить',
                        saving: 'Сохранение…',
                        cancel: 'Отмена',
                        counter_aria_label:
                            'Использовано {{count}} из {{max}} символов',
                        errors: {
                            empty: 'Введите сообщение для сохранения.',
                            too_long:
                                'Сообщения не могут превышать 2000 символов.',
                            update_failed:
                                'Не удалось обновить сообщение. Попробуйте снова.',
                        },
                    },
                    delete_dialog: {
                        title: 'Удалить сообщение',
                        description:
                            'Вы уверены, что хотите удалить это сообщение? Это действие нельзя отменить.',
                        cancel: 'Отмена',
                        confirm: 'Удалить',
                        deleting: 'Удаление…',
                        errors: {
                            delete_failed:
                                'Не удалось удалить это сообщение. Попробуйте снова.',
                        },
                    },
                    mutation_errors: {
                        forbidden:
                            'У вас нет прав на изменение этого сообщения.',
                        archived:
                            'Эта беседа архивирована и доступна только для чтения.',
                        not_found:
                            'Эта беседа или сообщение больше недоступны.',
                    },
                },

                targets: {
                    diagram: 'Диаграмма',
                    table: 'Таблица',
                    field: 'Поле',
                    relationship: 'Связь',
                    unknown: 'Беседа',
                },
                target_labels: {
                    diagram: 'Диаграмма',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Удалённая таблица',
                    missing_field: 'Удалённое поле',
                    missing_relationship: 'Удалённая связь',
                    unknown: 'Беседа',
                },
            },
            activities_section: {
                title: 'Активность',
                filter: 'Фильтр',
                clear: 'Очистить фильтр',
                no_results: 'Активность, соответствующая фильтру, не найдена.',
                loading: 'Загрузка активности…',
                retry: 'Повторить',
                type_filter: {
                    trigger: 'Тип',
                    label: 'Фильтр по типу',
                    trigger_aria: 'Фильтр по типу активности',
                },
                types: {
                    diagram: 'Диаграмма',
                    table: 'Таблица',
                    field: 'Поле',
                    relationship: 'Связь',
                    note: 'Заметка',
                    area: 'Область',
                    dependency: 'Зависимость',
                },
                you: 'Вы',
                unknown_user: 'Кто-то',
                empty_state: {
                    title: 'Пока нет активности',
                    description:
                        'Начните редактирование, чтобы увидеть последние изменения.',
                },
                errors: {
                    load_failed: 'Не удалось загрузить активность.',
                },
                actions: {
                    add_tables: '{{user}} добавил(а) таблицу {{table}}',
                    remove_tables: '{{user}} удалил(а) таблицу',
                    add_field: '{{user}} добавил(а) поле {{field}}',
                    remove_field: '{{user}} удалил(а) поле',
                    update_field: '{{user}} обновил(а) поле {{field}}',
                    add_relationships: '{{user}} добавил(а) связь',
                    remove_relationships: '{{user}} удалил(а) связь',
                    update_relationship: '{{user}} обновил(а) связь',
                    add_notes: '{{user}} добавил(а) заметку',
                    remove_notes: '{{user}} удалил(а) заметку',
                    add_areas: '{{user}} добавил(а) область',
                    remove_areas: '{{user}} удалил(а) область',
                    add_dependencies: '{{user}} добавил(а) зависимость',
                    remove_dependencies: '{{user}} удалил(а) зависимость',
                    fallback: '{{user}} обновил(а) диаграмму',
                },
            },
            share_section: {
                title: 'Поделиться',
                tabs_label: 'Параметры доступа',
                tabs: {
                    collaborators: 'Участники',
                    public_link: 'Публичная ссылка',
                },
                collaborators: {
                    description:
                        'Пригласите участников с правами редактора или зрителя. У них уже должен быть аккаунт FoxalDB.',
                    filter: 'Фильтр',
                    clear: 'Сбросить фильтр',
                    no_results_title: 'Нет результатов',
                    no_results_description:
                        'Нет участников, соответствующих фильтру.',
                    role_filter: {
                        trigger: 'Роль',
                        label: 'Фильтр по роли',
                        trigger_aria: 'Фильтр по роли участника',
                    },
                },
                public_link: {
                    title: 'Публичная ссылка',
                    description:
                        'Поделитесь снимком диаграммы только для чтения с любым, у кого есть ссылка.',
                    coming_soon: 'Скоро.',
                },
                loading: 'Загрузка участников…',
                retry: 'Повторить',
                errors: {
                    load_failed: 'Не удалось загрузить участников.',
                },
                member_actions: {
                    title: 'Действия с участником',
                    trigger_aria: 'Действия с участником',
                    role: 'Роль',
                    remove: 'Удалить участника',
                },
            },
        },

        toolbar: {
            zoom_in: 'Увеличить масштаб',
            zoom_out: 'Уменьшить масштаб',
            save: 'Сохранить',
            show_all: 'Показать все',
            undo: 'Отменить',
            redo: 'Вернуть',
            reorder_diagram: 'Автоматическая расстановка диаграммы',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Выделение перекрывающихся таблиц',
            filter: 'Фильтровать таблицы',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Выберите базу данных',
                description: 'Выберите систему баз данных для новой диаграммы.',
                search_placeholder: 'Поиск систем управления базами данных…',
                search_no_results:
                    'Ни одна система управления базами данных не соответствует вашему запросу.',
                clear_search: 'Очистить поиск',
                primary_group: 'Основные базы данных',
                other_group: 'Другие базы данных',
                check_examples_long: 'Открыть примеры',
                check_examples_short: 'Примеры',
            },

            choose_intent: {
                title: 'Что вы хотите сделать?',
                description: 'Создайте новую диаграмму для {{database}}.',
                create_empty: 'Создать пустую диаграмму',
                create_empty_description:
                    'Начните с нуля, добавляя таблицы самостоятельно.',
                import: 'Импорт',
                import_description:
                    'Из файла, вставленного текста или вашей базы данных.',
                back: 'Назад',
            },

            choose_import_method: {
                title: 'Как вы хотите импортировать?',
                description: 'Выберите источник для диаграммы {{database}}.',
                from_file: 'Файл или вставленный текст',
                from_file_description: 'SQL, DBML или JSON диаграммы.',
                from_database: 'Существующая база данных',
                from_database_description:
                    'Выполните запрос в базе и вставьте результат.',
                back: 'Назад',
            },

            import_from_database: {
                title: 'Импорт из существующей базы',
                description:
                    'Используйте, если у вас нет файла схемы SQL или DBML. Выполните запрос в базе и вставьте результат ниже.',
                database_edition: 'Редакция СУБД',
                edition_regular: 'Обычная',
                run_query: 'Выполните этот запрос в базе',
                client_sql: 'SQL',
                paste_result: 'Вставьте результат',
                paste_result_placeholder: 'Вставьте результат запроса сюда…',
                check_result: 'Проверить результат',
                valid_result: 'Результат выглядит корректным.',
                invalid_result:
                    'Не удалось проверить результат. Проверьте содержимое и повторите попытку.',
                truncated_result:
                    'Результат может быть обрезан. Настройте клиент SQL и выполните запрос снова.',
                waiting_for_result:
                    'Вставьте результат запроса, чтобы продолжить.',
                unsupported_database:
                    'Извлечение схемы недоступно для этого типа базы.',
                import_failed:
                    'Не удалось импортировать схему базы. Проверьте результат и повторите попытку.',
                back: 'Назад',
                import: 'Импорт',
            },

            import_schema: {
                title: 'Вставьте схему',
                textarea_label: 'Содержимое схемы',
                textarea_placeholder:
                    'Вставьте SQL, DBML или JSON-метаданные сюда…',
                auto_detect_hint: 'Мы автоматически определим формат.',
                or_divider: 'ИЛИ',
                choose_file: 'Выбрать файл',
                choose_file_or_project: 'Выберите файл или проект',
                supported_formats_hint:
                    'Поддерживается: SQL, DBML, JSON, архив проекта (.zip)',
                change_file_aria: 'Изменить файл, сейчас: {{name}}',
                selected_file: 'Выбранный файл: {{name}}',
                back: 'Назад',
                import: 'Импорт',
                mismatch: {
                    title: 'Эта схема похожа на {{detected}}, но вы выбрали {{selected}}.',
                    description:
                        'Переключитесь на обнаруженный тип базы данных или вернитесь, чтобы выбрать другой.',
                    switch: 'Переключиться на {{database}}',
                    go_back: 'Назад',
                },
                ambiguous: {
                    title: 'Выберите исходную СУБД',
                    confidence_explanation:
                        'Проценты показывают индекс соответствия обнаруженному диалекту SQL для каждой СУБД.',
                    description:
                        'Не удалось автоматически определить диалект SQL. Подтвердите, из какой СУБД пришла эта схема.',
                    choose_source: 'Выбрать исходную СУБД',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% уверенности, автоматическое определение)',
                    recommended_tooltip: 'Автоматически определённая СУБД',
                    recommended_aria:
                        '{{database}}, автоматически определённая СУБД',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Ready to import this diagram.',
                        mismatch_title: 'Несоответствие СУБД',
                        mismatch_description:
                            'Файл указывает на {{detected}}, но вы выбрали {{selected}}.',
                        unsupported_existing:
                            'Diagram JSON restores a full diagram and cannot be merged into the current one. Export or create a new diagram instead.',
                    },
                    ambiguous: {
                        title: 'Choose the diagram DBMS',
                        description:
                            'Выберите вариант, который будет применён для этого импорта.',
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
                    dialect: 'Обнаружен {{database}}',
                    dbml: 'Обнаружен DBML',
                    metadata_json: 'Обнаружены метаданные JSON',
                    diagram_json: 'Обнаружен JSON диаграммы',
                    sql_ambiguous_title: 'Обнаружен SQL',
                    sql_ambiguous_description:
                        'СУБД не удалось определить автоматически.',
                    clickhouse_unsupported: 'Обнаружен SQL ClickHouse',
                    unsupported: 'Неподдерживаемый формат',
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
                    analyzing_project: 'Анализ архива проекта…',
                    detected: 'Обнаружен проект {{framework}}',
                    migrations_found_one: 'Найдена {{count}} миграция',
                    migrations_found_other: 'Найдено {{count}} миграций',
                    schema_files_found_one: 'Найден {{count}} файл схемы',
                    schema_files_found_other: 'Найдено {{count}} файлов схемы',
                    multiple_projects_title:
                        'Обнаружено несколько схем баз данных',
                    multiple_projects_description:
                        'Этот архив содержит более одного поддерживаемого проекта базы данных. Выберите, какой импортировать.',
                    choose_project: 'Выберите проект',
                    unsupported_project: 'Неподдерживаемый архив проекта',
                    unsupported_project_description:
                        'В этом архиве не найден поддерживаемый проект Laravel, Prisma, Drizzle, Rails, Entity Framework Core или Django.',
                    project_root: 'Корень проекта: {{path}}',
                    sign_in_to_import_framework:
                        'Войдите, чтобы импортировать проекты {{framework}}, когда импорт станет доступен.',
                    remote_processing_notice:
                        'Когда импорт станет доступен, будут обрабатываться только файлы, относящиеся к схеме.',
                    remote_processing_scope:
                        'Полный архив и несвязанный исходный код никогда не загружаются.',
                    remote_processing_security:
                        'Анализ статический и не выполняет загруженный код.',
                },
                errors: {
                    unreadable_file: 'Не удалось прочитать выбранный файл.',
                    malformed_json: 'Не удалось разобрать содержимое JSON.',
                    unsupported:
                        'Этот формат не поддерживается для импорта схемы.',
                    diagram_json:
                        'JSON диаграммы можно импортировать через опцию файла диаграммы.',
                    clickhouse_unsupported:
                        'Импорт SQL DDL не поддерживается для ClickHouse. Используйте DBML или импортируйте из существующей базы данных.',
                    file_too_large: 'Выбранный файл больше 5 МБ.',
                    archive_too_large: 'Выбранный архив проекта больше 50 МБ.',
                    archive_invalid:
                        'Выбранный файл не является допустимым архивом проекта.',
                    unsupported_file_extension:
                        'Поддерживаются только файлы .sql, .dbml, .json и архивы проектов .zip.',
                    import_failed:
                        'Не удалось импортировать схему. Проверьте содержимое и попробуйте снова.',
                    invalid_diagram_json:
                        'JSON диаграммы недействителен. Проверьте файл и повторите попытку.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS Инструкции',
                    title: 'Инструкции',
                    step_1: 'Откройте в меню пункты Инструменты > Параметры > Результаты запроса > SQL Сервер.',
                    step_2: 'Если вы используете "Результат в сетке," измените Максимальное количество извлекаемых символов для данных, отличных от XML (установите на 9999999).',
                },
            },

            cancel: 'Отменить',
            back: 'Назад',
            import_from_file: 'Импортировать из файла',
            empty_diagram: 'Пустая база данных',
            continue: 'Продолжить',
            import: 'Импорт',
        },

        share_diagram_dialog: {
            title: 'Поделиться диаграммой',
            description:
                'Пригласите участников с правами редактора или читателя. У них уже должна быть учётная запись FoxalDB.',
            share_button: 'Поделиться',
            empty_members: 'Пока нет участников.',
            remove: 'Удалить',
            roles: {
                owner: 'Владелец',
                editor: 'Редактор',
                viewer: 'Наблюдатель',
            },
            add_member: {
                title: 'Добавить участника',
                email_label: 'Эл. почта',
                email_placeholder: 'Адрес эл. почты',
                add: 'Добавить',
                adding: 'Добавление…',
                cancel: 'Отмена',
            },
            errors: {
                load_failed: 'Не удалось загрузить участников.',
                add_failed: 'Не удалось добавить участника.',
            },
        },

        diagram_role: {
            owner: 'Владелец',
            editor: 'Редактор',
            viewer: 'Наблюдатель',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Открыть базу данных',
            description:
                'Выберите диаграмму, которую нужно открыть, из списка ниже.',
            table_columns: {
                name: 'Имя',
                created_at: 'Создано в',
                last_modified: 'Последнее изменение',
                tables_count: 'Таблицы',
            },
            cancel: 'Отмена',
            open: 'Открыть',
            new_database: 'Новая база данных',

            diagram_actions: {
                open: 'Открыть',
                duplicate: 'Дублировать',
                delete: 'Удалить',
            },
        },

        export_sql_dialog: {
            title: 'Экспорт SQL',
            description:
                'Экспортируйте схему диаграммы в {{databaseType}} скрипт',
            close: 'Закрыть',
            loading: {
                text: 'ИИ генерирует SQL для {{databaseType}}...',
                description: 'Выберите систему баз данных для новой диаграммы.',
            },
            error: {
                message:
                    'Ошибка создания скрипта SQL. Попробуйте еще раз позже или <0>свяжитесь с нами</0>.',
                description:
                    'Не стесняйтесь использовать ваш OPENAI_TOKEN, см. руководство <0>здесь</0>.',
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
            title: 'Создать отношениe',
            primary_table: 'Основная таблица',
            primary_field: 'Основное поле',
            referenced_table: 'Ссылается на таблицу',
            referenced_field: 'Ссылается на поле',
            primary_table_placeholder: 'Выберите таблицу',
            primary_field_placeholder: 'Выберите поле',
            referenced_table_placeholder: 'Выберите таблицу',
            referenced_field_placeholder: 'Выберите поле',
            no_tables_found: 'Таблицы не найдены',
            no_fields_found: 'Поля не найдены',
            create: 'Создать',
            cancel: 'Отменить',
        },

        import_database_dialog: {
            title: 'Импорт в текущую диаграмму',
            import_schema: {
                title: 'Импорт схемы',
                import: 'Импорт',
                cancel: 'Отмена',
                mismatch: {
                    title: 'Эта схема похожа на {{detected}}, но эта диаграмма — {{selected}}.',
                    description:
                        'Импорт между разными СУБД пока не поддерживается.',
                    cancel: 'Отмена',
                },
                ambiguous: {
                    description:
                        'Не удалось автоматически определить диалект SQL. Подтвердите, как интерпретировать эту схему для текущей диаграммы {{selected}}.',
                },
            },
            override_alert: {
                title: 'Импортировать базу данных',
                content: {
                    alert: 'Импорт этой диаграммы повлияет на существующие таблицы и связи.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> будут добавлены новые таблицы.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> будут созданы новые отношения.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> таблицы будут перезаписаны.',
                    proceed: 'Хотите продолжить?',
                },
                import: 'Импорт',
                cancel: 'Отмена',
            },
        },

        export_image_dialog: {
            title: 'Экспортировать изображение',
            description: 'Выберите детализацию изображения при экспорте:',
            scale_1x: '1x (Низкое качество)',
            scale_2x: '2x (Обычное качество)',
            scale_4x: '4x (Лучшее качество)',
            cancel: 'Отменить',
            export: 'Экспортировать',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'Выбрать схему',
            description:
                'В настоящее время отображается несколько схем. Выберите одну для новой таблицы.',
            cancel: 'Отменить',
            confirm: 'Подтвердить',
        },

        update_table_schema_dialog: {
            title: 'Изменить схему',
            description: 'Обновить таблицу "{{tableName}}" схема',
            cancel: 'Отменить',
            confirm: 'Изменить',
        },

        create_table_schema_dialog: {
            title: 'Создать новую схему',
            description:
                'Схемы еще не существуют. Создайте вашу первую схему, чтобы организовать таблицы.',
            create: 'Создать',
            cancel: 'Отменить',
        },
        export_diagram_dialog: {
            title: 'Экспорт кода диаграммы',
            description: 'Выберите формат экспорта:',
            format_json: 'JSON',
            cancel: 'Отменить',
            export: 'Экспортировать',
            error: {
                title: 'Ошибка экспортирования диаграммы',
                description:
                    'Что-то пошло не так. Если вам нужна помощь, напишите нам: support@chartdb.io',
            },
        },
        import_diagram_dialog: {
            title: 'Импорт кода диаграммы',
            description: 'Вставьте JSON код диаграммы ниже:',
            cancel: 'Отменить',
            import: 'Импортировать',
            error: {
                title: 'Ошибка при импорте диаграммы',
                description:
                    'Код JSON диаграммы некорректен. Проверьте, пожалуйста, код и попробуйте снова. Проблема не решается? Напишите нам: support@chartdb.io',
            },
        },
        import_dbml_dialog: {
            example_title: 'Импорт DBML',
            title: 'Импортировать DBML',
            description: 'Импортировать схему базы данных из DBML формата.',
            import: 'Импортировать',
            cancel: 'Отмена',
            skip_and_empty: 'Продолжить с пустой диаграммой',
            show_example: 'Использовать эту схему',

            error: {
                title: 'Ошибка',
                description:
                    'Ошибка парсинга DBML. Пожалуйста проверьте синтаксис.',
            },
        },
        relationship_type: {
            one_to_one: 'Один к одному',
            one_to_many: 'Один ко многим',
            many_to_one: 'Многие к одному',
            many_to_many: 'Многие ко многим',
        },

        canvas_context_menu: {
            new_table: 'Создать таблицу',
            new_view: 'Новое представление',
            new_relationship: 'Создать отношение',
            new_area: 'Новая область',
            new_note: 'Новая Заметка',
        },

        table_node_context_menu: {
            edit_table: 'Изменить таблицу',
            duplicate_table: 'Дублировать таблицу',
            delete_table: 'Удалить таблицу',
            add_relationship: 'Добавить связь',
            move_to_area: 'Переместить в область',
            no_area: 'Без области',
        },

        canvas: {
            all_tables_hidden: 'Все таблицы скрыты',
            show_all_tables: 'Показать все',
        },

        canvas_filter: {
            title: 'Фильтр таблиц',
            search_placeholder: 'Поиск таблиц...',
            group_by_schema: 'Группировать по схеме',
            group_by_area: 'Группировать по области',
            no_tables_found: 'Таблицы не найдены',
            empty_diagram_description: 'Создайте таблицу, чтобы начать',
            no_tables_description: 'Попробуйте изменить поиск или фильтр',
            clear_filter: 'Очистить фильтр',
        },

        copy_to_clipboard: 'Скопировать в буфер обмена',
        copied: 'Скопировано!',
        snap_to_grid_tooltip: 'Выравнивание по сетке (Удерживайте {{key}})',
        editing_conflict: {
            one: '{{name}} тоже редактирует это.',
            two: '{{name1}} и {{name2}} тоже редактируют это.',
            many: '{{name}} и ещё {{count}} тоже редактируют это.',
            fallback_name: 'Участник',
            last_writer_wins:
                'Изменения не заблокированы. Побеждает последнее сохранённое изменение.',
        },

        tool_tips: {
            double_click_to_edit: 'Кликните дважды, чтобы изменить',
        },

        auth: {
            dialog: {
                account_title: 'Аккаунт',
                login_title: 'Войти в FoxalDB',
                register_title: 'Создать аккаунт FoxalDB',
                account_description: 'Управляйте текущей сессией.',
                login_description:
                    'Войдите, чтобы сохранять больше диаграмм и синхронизировать их.',
                register_description:
                    'Создайте аккаунт, чтобы сохранять больше диаграмм.',
                checking_session: 'Проверка сессии...',
                continue_without_account: 'Продолжить без аккаунта',
            },
            login: {
                title: 'Вход',
                email_label: 'Электронная почта',
                password_label: 'Пароль',
                submit: 'Войти',
                submitting: 'Вход...',
                switch_to_register: 'Регистрация',
                no_account: 'Нет аккаунта?',
            },
            register: {
                title: 'Регистрация',
                first_name_label: 'Имя',
                last_name_label: 'Фамилия',
                email_label: 'Электронная почта',
                password_label: 'Пароль',
                password_confirmation_label: 'Подтвердите пароль',
                submit: 'Создать аккаунт',
                submitting: 'Создание аккаунта...',
                switch_to_login: 'Войти',
                already_have_account: 'Уже есть аккаунт?',
            },
            account: {
                signed_in_as: 'Вы вошли как',
                logout: 'Выйти',
                back_to_editor: 'Назад к редактору',
            },
            settings: {
                title: 'Настройки пользователя',
                description: 'Обновите личную информацию и пароль.',
                change_password_heading: 'Изменить пароль',
                current_password_label: 'Текущий пароль',
                new_password_label: 'Новый пароль',
                password_confirmation_label: 'Подтвердите новый пароль',
                first_name_label: 'Имя',
                last_name_label: 'Фамилия',
                email_label: 'Электронная почта',
                submit: 'Сохранить',
                submitting: 'Сохранение...',
                success_title: 'Профиль обновлён',
                success_description: 'Ваш профиль сохранён.',
            },
            nav: {
                sign_in: 'Войти',
                logout: 'Выйти',
                loading: '...',
                user_menu: 'Аккаунт',
                settings: 'Настройки',
                change_language: 'Язык',
            },
            pages: {
                login_title: 'FoxalDB — Вход',
                register_title: 'FoxalDB — Регистрация',
                checking_session: 'Проверка сессии…',
            },
            errors: {
                first_name_required: 'Имя обязательно.',
                last_name_required: 'Фамилия обязательна.',
                generic: 'Что-то пошло не так.',
            },
        },

        guest_migration_dialog: {
            title: 'Импортировать локальную диаграмму?',
            description:
                'На этом устройстве сохранена диаграмма. Импортируйте её в аккаунт для доступа откуда угодно.',
            import: 'Импортировать в аккаунт',
            continue_without_import: 'Продолжить без импорта',
        },

        guest_migration_errors: {
            import_failed:
                'Не удалось импортировать локальную диаграмму. Локальная копия сохранена.',
            activation_failed:
                'Диаграмма создана, но не открылась. Локальная копия сохранена.',
            cleanup_failed:
                'Диаграмма импортирована, но локальная копия не удалена. Удалите её вручную.',
            check_failed: 'Не удалось прочитать локальную диаграмму.',
        },

        language_select: {
            change_language: 'Сменить язык',
        },

        on: 'Вкл',
        off: 'Выкл',
    },
};

export const ruMetadata: LanguageMetadata = {
    name: 'Russian',
    nativeName: 'Русский',
    code: 'ru',
    countryCode: 'ru',
};
