import type { LanguageMetadata, LanguageTranslation } from '../types';

export const uk: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Нова',
            browse: 'Відкрити',
            tables: 'Таблиці',
            refs: 'Зв’язки',
            dependencies: 'Залежності',
            custom_types: 'Користувацькі типи',
            conversations: 'Розмови',
            conversations_unread_aria:
                '{{count}} непрочитаних повідомлень у розмовах',
            visuals: 'Візуальні елементи',
            activities: 'Активність',
            share: 'Поділитися',
        },
        menu: {
            actions: {
                actions: 'Дії',
                new: 'Нова...',
                browse: 'Усі бази даних...',
                save: 'Зберегти',
                import: 'Імпорт бази даних',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Експорт SQL',
                export_as: 'Експортувати як',
                delete_diagram: 'Видалити',
            },
            edit: {
                edit: 'Редагувати',
                undo: 'Скасувати',
                redo: 'Повторити',
                clear: 'Очистити',
            },
            view: {
                view: 'Перегляд',
                show_sidebar: 'Показати бічну панель',
                hide_sidebar: 'Приховати бічну панель',
                hide_cardinality: 'Приховати потужність',
                show_cardinality: 'Показати кардинальність',
                show_field_attributes: 'Показати атрибути полів',
                hide_field_attributes: 'Приховати атрибути полів',
                zoom_on_scroll: 'Масштабувати прокручуванням',
                show_views: 'Представлення бази даних',
                theme: 'Тема',
                show_dependencies: 'Показати залежності',
                hide_dependencies: 'Приховати залежності',
                show_minimap: 'Показати мінімапу',
                hide_minimap: 'Приховати мінімапу',
            },
            backup: {
                backup: 'Резервне копіювання',
                export_diagram: 'Експорт діаграми',
                restore_diagram: 'Відновити діаграму',
            },
            help: {
                help: 'Довідка',
                docs_website: 'Документація',
                join_discord: 'Приєднуйтесь до нас в Діскорд',
            },
        },

        delete_diagram_alert: {
            title: 'Виберіть базу даних',
            description: 'Виберіть систему баз даних для нової діаграми.',
            cancel: 'Скасувати',
            delete: 'Видалити',
        },

        clear_diagram_alert: {
            title: 'Очистити діаграму',
            description:
                'Цю дію не можна скасувати. Це назавжди видалить усі дані на діаграмі.',
            cancel: 'Скасувати',
            clear: 'Очистити',
        },

        diagram_access: {
            removed: {
                title: 'Виберіть базу даних',
                description: 'Виберіть систему баз даних для нової діаграми.',
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
            title: 'Автоматичне розміщення діаграми',
            description:
                'Ця дія перевпорядкує всі таблиці на діаграмі. Хочете продовжити?',
            reorder: 'Автоматичне розміщення',
            cancel: 'Скасувати',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Помилка копіювання',
                description: 'Буфер обміну не підтримується',
            },
            failed: {
                title: 'Помилка копіювання',
                description: 'Щось пішло не так. Будь ласка, спробуйте ще раз.',
            },
        },

        theme: {
            system: 'Системна',
            light: 'Світла',
            dark: 'Темна',
        },

        zoom: {
            on: 'Увімкнути',
            off: 'Вимкнути',
        },

        last_saved: 'Востаннє збережено',
        saved: 'Збережено',
        loading_diagram: 'Завантаження діаграми…',
        deselect_all: 'Зняти виділення з усіх',
        select_all: 'Вибрати усі',
        delete: 'Видалити',
        clear: 'Очистити',
        show_more: 'Показати більше',
        show_less: 'Показати менше',
        copy_to_clipboard: 'Копіювати в буфер обміну',
        copied: 'Скопійовано!',

        side_panel: {
            view_all_options: 'Переглянути всі параметри…',
            tables_section: {
                tables: 'Таблиці',
                add_table: 'Додати таблицю',
                add_view: 'Додати представлення',
                filter: 'Фільтр',
                collapse: 'Згорнути все',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'Всі таблиці приховані',
                show_all: 'Показати все',

                table: {
                    fields: 'Поля',
                    nullable: 'Може бути Null?',
                    primary_key: 'Первинний ключ',
                    indexes: 'Індекси',
                    check_constraints: 'Перевірочні обмеження',
                    comments: 'Коментарі',
                    no_comments: 'Немає коментарів',
                    add_field: 'Додати поле',
                    add_index: 'Додати індекс',
                    add_check: 'Додати перевірку',
                    index_select_fields: 'Виберіть поля',
                    no_types_found: 'Типи не знайдено',
                    field_name: 'Назва поля',
                    field_type: 'Тип',
                    field_actions: {
                        title: 'Атрибути полів',
                        open_discussion: 'Відкрити розмову',
                        unique: 'Унікальне',
                        auto_increment: 'Автоінкремент',
                        comments: 'Коментарі',
                        no_comments: 'Немає коментарів',
                        delete_field: 'Видалити поле',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Точність',
                        scale: 'Масштаб',
                    },
                    index_actions: {
                        title: 'Атрибути індексу',
                        name: 'Назва індекса',
                        unique: 'Унікальний',
                        index_type: 'Тип індексу',
                        delete_index: 'Видалити індекс',
                    },
                    check_constraint_actions: {
                        title: 'Перевірочне обмеження',
                        expression: 'Вираз',
                        delete: 'Видалити обмеження',
                    },
                    table_actions: {
                        title: 'Дії з таблицею',
                        open_discussion: 'Відкрити розмову',
                        change_schema: 'Змінити схему',
                        add_field: 'Додати поле',
                        add_index: 'Додати індекс',
                        duplicate_table: 'Дублювати таблицю',
                        delete_table: 'Видалити таблицю',
                    },
                },
                empty_state: {
                    title: 'Без таблиць',
                    description: 'Щоб почати, створіть таблицю',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Фільтр',
                clear: 'Очистити фільтр',
                no_results:
                    'Не знайдено посилань, що відповідають вашому фільтру.',
                collapse: 'Згорнути все',
                add_relationship: 'Додати звʼязок',
                relationships: 'Звʼязки',
                dependencies: 'Залежності',
                relationship: {
                    relationship: 'Звʼязок',
                    primary: 'Первинна таблиця',
                    foreign: 'Повʼязана таблиця',
                    cardinality: 'Звʼязок',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Видалити',
                    switch_tables: 'Поміняти таблиці',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Дії',
                        open_discussion: 'Відкрити розмову',
                        delete_relationship: 'Видалити',
                    },
                },
                dependency: {
                    dependency: 'Залежність',
                    table: 'Таблиця',
                    dependent_table: 'Залежне подання',
                    delete_dependency: 'Видалити',
                    dependency_actions: {
                        title: 'Дії',
                        delete_dependency: 'Видалити',
                    },
                },
                empty_state: {
                    title: 'Жодних зв’язків',
                    description: 'Створіть зв’язок, щоб почати',
                },
            },

            areas_section: {
                areas: 'Області',
                add_area: 'Додати область',
                filter: 'Фільтр',
                clear: 'Очистити фільтр',
                no_results:
                    'Області не знайдені, які відповідають вашому фільтру.',

                area: {
                    area_actions: {
                        title: 'Дії з областю',
                        edit_name: 'Редагувати назву',
                        delete_area: 'Видалити область',
                    },
                },
                empty_state: {
                    title: 'Немає областей',
                    description: 'Створіть область, щоб почати',
                },
            },

            visuals_section: {
                visuals: 'Візуальні елементи',
                tabs: {
                    areas: 'Області',
                    notes: 'Нотатки',
                },
            },

            notes_section: {
                filter: 'Фільтр',
                add_note: 'Додати Нотатку',
                no_results: 'Нотатки не знайдено',
                clear: 'Очистити Фільтр',
                empty_state: {
                    title: 'Немає Нотаток',
                    description:
                        'Створіть нотатку, щоб додати текстові анотації на полотні',
                },
                note: {
                    empty_note: 'Порожня нотатка',
                    note_actions: {
                        title: 'Дії з Нотаткою',
                        edit_content: 'Редагувати Вміст',
                        delete_note: 'Видалити Нотатку',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Користувацькі типи',
                filter: 'Фільтр',
                clear: 'Очистити фільтр',
                no_results:
                    'Не знайдено користувацьких типів, що відповідають фільтру.',
                new_type: 'Новий тип',
                empty_state: {
                    title: 'Немає користувацьких типів',
                    description:
                        "Користувацькі типи з'являться тут, коли вони будуть доступні у вашій базі даних",
                },
                custom_type: {
                    kind: 'Вид',
                    enum_values: 'Значення переліку',
                    composite_fields: 'Поля',
                    no_fields: 'Поля не визначені',
                    no_values: 'Значення переліку не визначені',
                    field_name_placeholder: 'Назва поля',
                    field_type_placeholder: 'Виберіть тип',
                    add_field: 'Додати поле',
                    no_fields_tooltip:
                        'Для цього користувацького типу поля не визначені',
                    custom_type_actions: {
                        title: 'Дії',
                        highlight_fields: 'Виділити поля',
                        delete_custom_type: 'Видалити',
                        clear_field_highlight: 'Зняти виділення',
                    },
                    delete_custom_type: 'Видалити тип',
                },
            },
            conversations_section: {
                title: 'Розмови',
                tabs_label: 'Розмови',
                tabs: {
                    active: 'Активні',
                    archives: 'Архівовані',
                },
                loading: 'Завантаження розмов…',
                filter: 'Фільтр',
                clear: 'Очистити фільтр',
                no_results_title: 'Немає результатів',
                no_results_description:
                    'Не знайдено розмов, що відповідають вашому фільтру.',

                type_filter: {
                    trigger: 'Тип',
                    label: 'Фільтр за типом',
                    trigger_aria: 'Фільтрувати за типом розмови',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'Повторити',
                dismiss: 'Dismiss',
                read_only: 'Лише читання',
                deleted_user: 'Видалений користувач',
                unread: {
                    badge_aria: '{{count}} непрочитаних повідомлень',
                },
                inactive: {
                    title: 'Розмови unavailable',
                    description:
                        'Розмови are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'Немає розмови',
                    active_description: 'Створіть розмову, щоб почати',
                    archives_title: 'No archived розмови',
                    archives_description:
                        'Archived розмови will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load розмови',
                    load_description:
                        'Something went wrong while loading розмови. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'Відкрити розмову',
                    start: 'Почати розмову',
                    pending: 'Запуск розмови…',
                    diagram_name: 'Діаграма',
                    open_aria: 'Відкрити розмову для {{name}}',
                    start_aria: 'Почати розмову для {{name}}',
                    open_tooltip: 'Відкрити розмову для {{name}}',
                    start_tooltip: 'Почати розмову для {{name}}',
                    pending_tooltip: 'Запуск розмови для {{name}}…',
                    action_tooltip: 'Розмова',
                    unavailable_description:
                        'Ви не можете починати розмови на цій діаграмі.',
                    errors: {
                        validation: 'Ця ціль непридатна для розмови.',
                        forbidden: 'У вас немає дозволу почати цю розмову.',
                        not_found: 'Ця ціль більше недоступна на діаграмі.',
                        conflict:
                            'Не вдалося почати розмову. Спробуйте ще раз.',
                        generic:
                            'Не вдалося відкрити розмову. Спробуйте ще раз.',
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
                    message_count: '{{count}} повідомлень',
                    no_messages: 'Ще немає повідомлень',
                    last_activity: 'Остання активність',
                    open_aria: 'Відкрити бесіду для {{target}}',
                    focus_target_aria: 'Показати {{target}} на діаграмі',
                    author_tooltip: 'Останнє повідомлення від {{name}}',
                    author_missing_tooltip: 'Немає інформації про автора',
                    actions: {
                        menu_aria: 'Параметри розмови',
                        open: 'Відкрити',
                        delete: 'Видалити',
                    },
                    delete_dialog: {
                        title: 'Видалити розмову?',
                        description:
                            'Це назавжди видалить цю розмову та всі її повідомлення.',
                        cancel: 'Скасувати',
                        confirm: 'Видалити',
                        deleting: 'Видалення…',
                        errors: {
                            delete_failed:
                                'Не вдалося видалити цю розмову. Спробуйте ще раз.',
                            forbidden:
                                'У вас немає дозволу на видалення цієї розмови.',
                            not_found: 'Ця розмова більше недоступна.',
                        },
                    },
                },
                detail: {
                    back: 'Назад',
                    back_aria: 'Повернутися до списку бесід',
                    loading: 'Завантаження повідомлень…',
                    loading_more: 'Завантаження старіших повідомлень…',
                    load_older: 'Завантажити старіші повідомлення',
                    new_messages_badge_one: '1 нове повідомлення',
                    new_messages_badge_other: '{{count}} нових повідомлень',
                    new_messages_badge_label_one: 'нове повідомлення',
                    new_messages_badge_label_other: 'нових повідомлень',
                    new_messages_badge_aria_one:
                        'Перейти до нового повідомлення',
                    new_messages_badge_aria_other:
                        'Перейти до {{count}} нових повідомлень',
                    empty: {
                        title: 'Немає повідомлень',
                        description: 'У цій бесіді немає повідомлень.',
                    },
                    errors: {
                        load_title: 'Не вдалося завантажити повідомлення',
                        load_description:
                            'Під час завантаження повідомлень сталася помилка. Спробуйте ще раз.',
                    },
                    archive_banner: {
                        title: 'Архівна бесіда',
                        description:
                            'Ця бесіда доступна лише для читання. Повідомлення не можна додавати, редагувати або видаляти.',
                    },
                    metadata: {
                        status_label: 'Статус',
                        status_active: 'Активна',
                        status_archived: 'Архівна',
                        message_count_label: 'Кількість повідомлень',
                        message_count: '{{count}} повідомлень',
                    },
                    message: {
                        edited: '(змінено)',
                        edited_aria: 'Повідомлення було змінено',
                        day_separator: {
                            today: 'Сьогодні',
                            yesterday: 'Вчора',
                        },
                        actions: {
                            title: 'Дії з повідомленням',
                            edit: 'Редагувати',
                            delete: 'Видалити',
                        },
                        reactions: {
                            add_aria: 'Додати реакцію',
                            add_tooltip: 'Додати реакцію',
                            picker_loading: 'Завантаження вибору емодзі…',
                            picker_aria_label: 'Вибір емодзі',
                            picker_search_placeholder: 'Пошук емодзі…',
                            picker_empty: 'Емодзі не знайдено.',
                            chip_aria: 'Реакція {{emoji}}, {{count}}',
                            preview_and_others_one: 'та ще {{count}}',
                            preview_and_others_other: 'та ще {{count}}',
                            errors: {
                                generic:
                                    'Не вдалося оновити реакцію. Спробуйте ще раз.',
                                forbidden:
                                    'Вам не дозволено реагувати на це повідомлення.',
                                archived:
                                    'Ця розмова архівована, реакції доступні лише для перегляду.',
                                not_found: 'Це повідомлення більше недоступне.',
                                invalid_emoji: 'Це емодзі недійсне.',
                            },
                        },
                    },
                    composer: {
                        label: 'Повідомлення',
                        placeholder: 'Напишіть повідомлення…',
                        submit: 'Надіслати',
                        submitting: 'Надсилання…',
                        form_aria_label: 'Нове повідомлення в розмові',
                        keyboard_hint:
                            'Enter — надіслати. Shift+Enter — новий рядок.',
                        counter_aria_label:
                            'Використано {{count}} з {{max}} символів',
                        errors: {
                            empty: 'Введіть повідомлення для надсилання.',
                            too_long:
                                'Повідомлення не можуть перевищувати 2000 символів.',
                            create_failed:
                                'Не вдалося надіслати повідомлення. Спробуйте ще раз.',
                        },
                    },
                    edit: {
                        label: 'Повідомлення',
                        form_aria_label: 'Редагувати повідомлення розмови',
                        save: 'Зберегти',
                        saving: 'Збереження…',
                        cancel: 'Скасувати',
                        counter_aria_label:
                            'Використано {{count}} з {{max}} символів',
                        errors: {
                            empty: 'Введіть повідомлення для збереження.',
                            too_long:
                                'Повідомлення не можуть перевищувати 2000 символів.',
                            update_failed:
                                'Не вдалося оновити повідомлення. Спробуйте ще раз.',
                        },
                    },
                    delete_dialog: {
                        title: 'Видалити повідомлення',
                        description:
                            'Ви впевнені, що хочете видалити це повідомлення? Цю дію не можна скасувати.',
                        cancel: 'Скасувати',
                        confirm: 'Видалити',
                        deleting: 'Видалення…',
                        errors: {
                            delete_failed:
                                'Не вдалося видалити це повідомлення. Спробуйте ще раз.',
                        },
                    },
                    mutation_errors: {
                        forbidden:
                            'У вас немає дозволу змінювати це повідомлення.',
                        archived:
                            'Ця розмова архівована та доступна лише для читання.',
                        not_found:
                            'Ця розмова або повідомлення більше недоступні.',
                    },
                },

                targets: {
                    diagram: 'Діаграма',
                    table: 'Таблиця',
                    field: 'Поле',
                    relationship: 'Зв’язок',
                    unknown: 'Розмова',
                },
                target_labels: {
                    diagram: 'Діаграма',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Видалена таблиця',
                    missing_field: 'Видалене поле',
                    missing_relationship: 'Видалений зв’язок',
                    unknown: 'Розмова',
                },
            },
            activities_section: {
                title: 'Активність',
                filter: 'Фільтр',
                clear: 'Очистити фільтр',
                no_results: 'Активність, що відповідає фільтру, не знайдена.',
                loading: 'Завантаження активності…',
                retry: 'Повторити',
                type_filter: {
                    trigger: 'Тип',
                    label: 'Фільтр за типом',
                    trigger_aria: 'Фільтр за типом активності',
                },
                types: {
                    diagram: 'Діаграма',
                    table: 'Таблиця',
                    field: 'Поле',
                    relationship: 'Зв’язок',
                    note: 'Нотатка',
                    area: 'Область',
                    dependency: 'Залежність',
                },
                you: 'Ви',
                unknown_user: 'Хтось',
                empty_state: {
                    title: 'Поки що немає активності',
                    description:
                        'Почніть редагування, щоб побачити останні зміни.',
                },
                errors: {
                    load_failed: 'Не вдалося завантажити активність.',
                },
                actions: {
                    add_tables: '{{user}} додав(ла) таблицю {{table}}',
                    remove_tables: '{{user}} видалив(ла) таблицю',
                    add_field: '{{user}} додав(ла) поле {{field}}',
                    remove_field: '{{user}} видалив(ла) поле',
                    update_field: '{{user}} оновив(ла) поле {{field}}',
                    add_relationships: '{{user}} додав(ла) зв’язок',
                    remove_relationships: '{{user}} видалив(ла) зв’язок',
                    update_relationship: '{{user}} оновив(ла) зв’язок',
                    add_notes: '{{user}} додав(ла) нотатку',
                    remove_notes: '{{user}} видалив(ла) нотатку',
                    add_areas: '{{user}} додав(ла) область',
                    remove_areas: '{{user}} видалив(ла) область',
                    add_dependencies: '{{user}} додав(ла) залежність',
                    remove_dependencies: '{{user}} видалив(ла) залежність',
                    fallback: '{{user}} оновив(ла) діаграму',
                },
            },
            share_section: {
                title: 'Поділитися',
                tabs_label: 'Параметри доступу',
                tabs: {
                    collaborators: 'Учасники',
                    public_link: 'Публічне посилання',
                },
                collaborators: {
                    description:
                        'Запросіть учасників із правами редактора або глядача. Вони вже повинні мати обліковий запис FoxalDB.',
                    filter: 'Фільтр',
                    clear: 'Скинути фільтр',
                    no_results_title: 'Немає результатів',
                    no_results_description:
                        'Немає учасників, що відповідають фільтру.',
                    role_filter: {
                        trigger: 'Роль',
                        label: 'Фільтр за роллю',
                        trigger_aria: 'Фільтр за роллю учасника',
                    },
                },
                public_link: {
                    title: 'Публічне посилання',
                    description:
                        'Поділіться знімком діаграми лише для читання з усіма, хто має посилання.',
                    coming_soon: 'Незабаром.',
                },
                loading: 'Завантаження учасників…',
                retry: 'Повторити',
                errors: {
                    load_failed: 'Не вдалося завантажити учасників.',
                },
                member_actions: {
                    title: 'Дії з учасником',
                    trigger_aria: 'Дії з учасником',
                    role: 'Роль',
                    remove: 'Видалити учасника',
                },
            },
        },

        toolbar: {
            zoom_in: 'Збільшити',
            zoom_out: 'Зменшити',
            save: 'Зберегти',
            show_all: 'Показати все',
            undo: 'Скасувати',
            redo: 'Повторити',
            reorder_diagram: 'Автоматичне розміщення діаграми',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Показати таблиці, що перекриваються',
            filter: 'Фільтрувати таблиці',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Виберіть базу даних',
                description: 'Виберіть систему баз даних для нової діаграми.',
                search_placeholder: 'Пошук систем управління базами даних…',
                search_no_results:
                    'Ні одна система управління базами даних не відповідає вашому запиту.',
                clear_search: 'Очистити пошук',
                primary_group: 'Основні бази даних',
                other_group: 'Інші бази даних',
                check_examples_long: 'Подивіться приклади',
                check_examples_short: 'Приклади',
            },

            choose_intent: {
                title: 'Що ви хочете зробити?',
                description: 'Створіть нову діаграму для {{database}}.',
                create_empty: 'Створити порожню діаграму',
                create_empty_description:
                    'Почніть з нуля, додаючи власні таблиці.',
                import_schema: 'Імпортувати наявну схему',
                import_schema_description:
                    'Імпортуйте таблиці та зв’язки з SQL, DBML або метаданих.',
                back: 'Назад',
            },

            import_schema: {
                title: 'Вставте схему',
                textarea_label: 'Вміст схеми',
                textarea_placeholder:
                    'Вставте SQL, DBML або JSON-метадані тут…',
                auto_detect_hint: 'Ми автоматично визначимо формат.',
                or_divider: 'АБО',
                choose_file: 'Вибрати файл',
                selected_file: 'Вибраний файл: {{name}}',
                back: 'Назад',
                continue: 'Продолжити',
                mismatch: {
                    title: 'Ця схема схожа на {{detected}}, але ви вибрали {{selected}}.',
                    description:
                        'Перемкніться на виявлений тип бази даних або поверніться, щоб вибрати інший.',
                    switch: 'Перемкнутися на {{database}}',
                    go_back: 'Назад',
                },
                ambiguous: {
                    title: 'Виберіть вихідну базу даних',
                    description:
                        'Не вдалося автоматично визначити діалект SQL. Підтвердьте, з якої бази даних походить ця схема.',
                    choose_source: 'Вибрати вихідну базу даних',
                },
                detection: {
                    dialect: 'Виявлено {{database}}',
                    dbml: 'Виявлено DBML',
                    metadata_json: 'Виявлено метадані JSON',
                    diagram_json: 'Виявлено JSON діаграми',
                    sql_ambiguous_title: 'Виявлено SQL',
                    sql_ambiguous_description:
                        'Не вдалося визначити базу даних.',
                    clickhouse_unsupported: 'Виявлено SQL ClickHouse',
                    unsupported: 'Непідтримуваний формат',
                },
                errors: {
                    unreadable_file: 'Не вдалося прочитати вибраний файл.',
                    malformed_json: 'Не вдалося розібрати вміст JSON.',
                    unsupported:
                        'Цей формат не підтримується для імпорту схеми.',
                    diagram_json:
                        'JSON діаграми можна імпортувати через опцію файлу діаграми.',
                    clickhouse_unsupported:
                        'Імпорт SQL DDL не підтримується для ClickHouse. Використайте DBML або імпортуйте з наявної бази даних.',
                    file_too_large: 'Вибраний файл більший за 5 МБ.',
                    import_failed:
                        'Не вдалося імпортувати схему. Перевірте вміст і спробуйте знову.',
                },
            },

            import_database: {
                title: 'Імпортуйте вашу базу даних',
                database_edition: 'Варіант бази даних:',
                step_1: 'Запустіть цей сценарій у своїй базі даних:',
                step_2: 'Вставте сюди результат сценарію →',
                script_results_placeholder: 'Результати сценарію має бути тут…',
                ssms_instructions: {
                    button_text: 'SSMS Інструкції',
                    title: 'Інструкції',
                    step_1: 'Перейдіть до Інструменти > Опції > Результати запиту > SQL Сервер.',
                    step_2: 'Якщо ви використовуєте «Results to Grid», змініть максимальну кількість символів, отриманих для даних, що не є XML (встановіть на 9999999).',
                },
                instructions_link: 'Потрібна допомога? Подивіться як',
                check_script_result: 'Перевірте результат сценарію',
            },

            cancel: 'Скасувати',
            back: 'Назад',
            import_from_file: 'Імпортувати з файлу',
            empty_diagram: 'Порожня база даних',
            continue: 'Продовжити',
            import: 'Імпорт',
        },

        share_diagram_dialog: {
            title: 'Поділитися діаграмою',
            description:
                'Запросіть учасників із правами редактора або переглядача. У них уже має бути обліковий запис FoxalDB.',
            share_button: 'Поділитися',
            empty_members: 'Поки що немає учасників.',
            remove: 'Видалити',
            roles: {
                owner: 'Власник',
                editor: 'Редактор',
                viewer: 'Глядач',
            },
            add_member: {
                title: 'Додати учасника',
                email_label: 'Ел. пошта',
                email_placeholder: 'Адреса ел. пошти',
                add: 'Додати',
                adding: 'Додавання…',
                cancel: 'Скасувати',
            },
            errors: {
                load_failed: 'Не вдалося завантажити учасників.',
                add_failed: 'Не вдалося додати учасника.',
            },
        },

        diagram_role: {
            owner: 'Власник',
            editor: 'Редактор',
            viewer: 'Глядач',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Відкрити базу даних',
            description:
                'Виберіть діаграму, яку потрібно відкрити, зі списку нижче.',
            table_columns: {
                name: 'Назва',
                created_at: 'Створено0',
                last_modified: 'Востаннє змінено',
                tables_count: 'Таблиці',
            },
            cancel: 'Скасувати',
            open: 'Відкрити',
            new_database: 'Нова база даних',

            diagram_actions: {
                open: 'Відкрити',
                duplicate: 'Дублювати',
                delete: 'Видалити',
            },
        },

        export_sql_dialog: {
            title: 'Експорт SQL',
            description:
                'Експортуйте свою схему діаграми в {{databaseType}} сценарій',
            close: 'Закрити',
            loading: {
                text: 'ШІ створює SQL для {{databaseType}}…',
                description: 'Виберіть систему баз даних для нової діаграми.',
            },
            error: {
                message:
                    'Помилка створення сценарію SQL. Спробуйте пізніше або <0>звʼяжіться з нами</0>.',
                description:
                    'Не соромтеся використовувати свій OPENAI_TOKEN, дивіться посібник <0>тут</0>.',
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
            title: 'Створити звʼязок',
            primary_table: 'Первинна таблиця',
            primary_field: 'Первинне поле',
            referenced_table: 'Звʼязана таблиця',
            referenced_field: 'Повʼязане поле',
            primary_table_placeholder: 'Виберіть таблицю',
            primary_field_placeholder: 'Виберіть поле',
            referenced_table_placeholder: 'Виберіть таблицю',
            referenced_field_placeholder: 'Виберіть поле',
            no_tables_found: 'Таблиці не знайдено',
            no_fields_found: 'Поля не знайдено',
            create: 'Створити',
            cancel: 'Скасувати',
        },

        import_database_dialog: {
            title: 'Імпорт до поточної діаграми',
            import_schema: {
                title: 'Імпортувати схему',
                import: 'Імпорт',
                cancel: 'Скасувати',
                mismatch: {
                    title: 'Ця схема схожа на {{detected}}, але ця діаграма — {{selected}}.',
                    description: 'Імпорт між різними СУБД ще не підтримується.',
                    cancel: 'Скасувати',
                },
                ambiguous: {
                    description:
                        'Не вдалося автоматично визначити діалект SQL. Підтвердьте, як інтерпретувати цю схему для поточної діаграми {{selected}}.',
                },
            },
            override_alert: {
                title: 'Імпорт бази даних',
                content: {
                    alert: 'Імпортування цієї діаграми вплине на наявні таблиці та зв’язки.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> будуть додані нові таблиці.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> будуть створені нові звʼязки.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> таблиці будуть перезаписані.',
                    proceed: 'Ви хочете продовжити?',
                },
                import: 'Імпортувати',
                cancel: 'Скасувати',
            },
        },

        export_image_dialog: {
            title: 'Експорт зображення',
            description: 'Виберіть коефіцієнт масштабування для експорту:',
            scale_1x: '1x (Низька якість)',
            scale_2x: '2x (Звичайна якість)',
            scale_4x: '4x (Найкраща якість)',
            cancel: 'Скасувати',
            export: 'Експортувати',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'Виберіть Схему',
            description:
                'Наразі показується кілька схем. Виберіть одну для нової таблиці.',
            cancel: 'Скасувати',
            confirm: 'Підтвердити',
        },

        update_table_schema_dialog: {
            title: 'Змінити схему',
            description: 'Оновити схему таблиці "{{tableName}}"',
            cancel: 'Скасувати',
            confirm: 'Змінити',
        },

        create_table_schema_dialog: {
            title: 'Створити нову схему',
            description:
                'Поки що не існує жодної схеми. Створіть свою першу схему, щоб організувати ваші таблиці.',
            create: 'Створити',
            cancel: 'Скасувати',
        },
        export_diagram_dialog: {
            title: 'Експорт Діаграми',
            description: 'Оберіть формат експорту:',
            format_json: 'JSON',
            cancel: 'Скасувати',
            export: 'Експортувати',
            error: {
                title: 'Помилка експорут діаграми',
                description:
                    'Щось пішло не так. Потрібна допомога? support@chartdb.io',
            },
        },
        import_diagram_dialog: {
            title: 'Імпорт Діаграми',
            description: 'Вставте JSON діаграми нижче:',
            cancel: 'Скасувати',
            import: 'Імпортувати',
            error: {
                title: 'Помилка імпорту діаграми',
                description:
                    'JSON діаграми є неправильним. Будь ласка, перевірте JSON і спробуйте ще раз. Потрібна допомога? support@chartdb.io',
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
            one_to_one: 'Один до Одного',
            one_to_many: 'Один до Багатьох',
            many_to_one: 'Багато до Одного',
            many_to_many: 'Багато до Багатьох',
        },

        canvas_context_menu: {
            new_table: 'Нова таблиця',
            new_view: 'Нове представлення',
            new_relationship: 'Новий звʼязок',
            // TODO: Translate
            new_area: 'Нова область',
            new_note: 'Нова Нотатка',
        },

        table_node_context_menu: {
            edit_table: 'Редагувати таблицю',
            duplicate_table: 'Дублювати таблицю',
            delete_table: 'Видалити таблицю',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'Перемістити в область',
            no_area: 'Без області',
        },

        canvas: {
            all_tables_hidden: 'Всі таблиці приховані',
            show_all_tables: 'Показати все',
        },

        canvas_filter: {
            title: 'Фільтрувати таблиці',
            search_placeholder: 'Пошук таблиць...',
            group_by_schema: 'Групувати за схемою',
            group_by_area: 'Групувати за областю',
            no_tables_found: 'Таблиці не знайдено',
            empty_diagram_description: 'Створіть таблицю, щоб почати',
            no_tables_description: 'Спробуйте налаштувати пошук або фільтр',
            clear_filter: 'Очистити фільтр',
        },

        snap_to_grid_tooltip: 'Вирівнювати за сіткою (Отримуйте {{key}})',

        editing_conflict: {
            one: '{{name}} також редагує це.',
            two: '{{name1}} і {{name2}} також редагують це.',
            many: '{{name}} і ще {{count}} також редагують це.',
            fallback_name: 'Співавтор',
            last_writer_wins:
                'Зміни не заблоковано. Перемагає останнє збережене редагування.',
        },

        tool_tips: {
            double_click_to_edit: 'Подвійне клацання для редагування',
        },

        auth: {
            dialog: {
                account_title: 'Обліковий запис',
                login_title: 'Увійти до FoxalDB',
                register_title: 'Створити обліковий запис FoxalDB',
                account_description: 'Керуйте поточною сесією.',
                login_description:
                    'Увійдіть, щоб зберігати більше діаграм і синхронізувати їх.',
                register_description:
                    'Створіть обліковий запис, щоб зберігати більше діаграм.',
                checking_session: 'Перевірка сесії...',
                continue_without_account: 'Продовжити без облікового запису',
            },
            login: {
                title: 'Вхід',
                email_label: 'Електронна пошта',
                password_label: 'Пароль',
                submit: 'Увійти',
                submitting: 'Вхід...',
                switch_to_register: 'Реєстрація',
                no_account: 'Немає облікового запису?',
            },
            register: {
                title: 'Реєстрація',
                first_name_label: "Ім'я",
                last_name_label: 'Прізвище',
                email_label: 'Електронна пошта',
                password_label: 'Пароль',
                password_confirmation_label: 'Підтвердіть пароль',
                submit: 'Створити обліковий запис',
                submitting: 'Створення облікового запису...',
                switch_to_login: 'Увійти',
                already_have_account: 'Вже є обліковий запис?',
            },
            account: {
                signed_in_as: 'Ви увійшли як',
                logout: 'Вийти',
                back_to_editor: 'Назад до редактора',
            },
            settings: {
                title: 'Налаштування користувача',
                description: 'Оновіть свою особисту інформацію та пароль.',
                change_password_heading: 'Змінити пароль',
                current_password_label: 'Поточний пароль',
                new_password_label: 'Новий пароль',
                password_confirmation_label: 'Підтвердіть новий пароль',
                first_name_label: "Ім'я",
                last_name_label: 'Прізвище',
                email_label: 'Електронна пошта',
                submit: 'Зберегти',
                submitting: 'Збереження...',
                success_title: 'Профіль оновлено',
                success_description: 'Ваш профіль збережено.',
            },
            nav: {
                sign_in: 'Увійти',
                logout: 'Вийти',
                loading: '...',
                user_menu: 'Обліковий запис',
                settings: 'Налаштування',
                change_language: 'Мова',
            },
            pages: {
                login_title: 'FoxalDB — Вхід',
                register_title: 'FoxalDB — Реєстрація',
                checking_session: 'Перевірка сесії…',
            },
            errors: {
                first_name_required: "Ім'я є обов'язковим.",
                last_name_required: "Прізвище є обов'язковим.",
                generic: 'Щось пішло не так.',
            },
        },

        guest_migration_dialog: {
            title: 'Імпортувати локальну діаграму?',
            description:
                'На цьому пристрої збережено діаграму. Імпортуйте її в акаунт для доступу з будь-якого місця.',
            import: 'Імпортувати в акаунт',
            continue_without_import: 'Продовжити без імпорту',
        },

        guest_migration_errors: {
            import_failed:
                'Не вдалося імпортувати локальну діаграму. Локальна копія збережена.',
            activation_failed:
                'Діаграму створено, але не відкрито. Локальна копія збережена.',
            cleanup_failed:
                'Діаграму імпортовано, але локальну копію не видалено. Видаліть її вручну.',
            check_failed: 'Не вдалося прочитати локальну діаграму.',
        },

        language_select: {
            change_language: 'Мова',
        },

        on: 'Увімк',
        off: 'Вимк',
    },
};

export const ukMetadata: LanguageMetadata = {
    name: 'Ukrainian',
    nativeName: 'Українська',
    code: 'uk',
    countryCode: 'ua',
};
