import type { LanguageMetadata, LanguageTranslation } from '../types';

export const ko_KR: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: '새로 만들기',
            browse: '열기',
            tables: '테이블',
            refs: 'Refs',
            dependencies: '종속성',
            custom_types: '사용자 지정 타입',
            conversations: '대화',
            conversations_unread_aria: '대화의 읽지 않은 메시지 {{count}}개',
            visuals: '시각화',
            activities: '활동',
            share: '공유',
        },
        menu: {
            actions: {
                actions: '작업',
                new: '새로 만들기...',
                browse: '모든 데이터베이스...',
                save: '저장',
                import: '데이터베이스 가져오기',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'SQL로 저장',
                export_as: '다른 형식으로 저장',
                delete_diagram: '삭제',
            },
            edit: {
                edit: '편집',
                undo: '실행 취소',
                redo: '다시 실행',
                clear: '모두 지우기',
            },
            view: {
                view: '보기',
                show_sidebar: '사이드바 보이기',
                hide_sidebar: '사이드바 숨기기',
                hide_cardinality: '카디널리티 숨기기',
                show_cardinality: '카디널리티 보이기',
                hide_field_attributes: '필드 속성 숨기기',
                show_field_attributes: '필드 속성 보이기',
                zoom_on_scroll: '스크롤 시 확대',
                show_views: '데이터베이스 뷰',
                theme: '테마',
                show_dependencies: '종속성 보이기',
                hide_dependencies: '종속성 숨기기',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: '백업',
                export_diagram: '다이어그램 내보내기',
                restore_diagram: '다이어그램 복구',
            },
            help: {
                help: '도움말',
                docs_website: '선적 서류 비치',
                join_discord: 'Discord 가입',
            },
        },

        delete_diagram_alert: {
            title: '데이터베이스를 선택하세요',
            description:
                '새 다이어그램에 사용할 데이터베이스 시스템을 선택하세요.',
            cancel: '취소',
            delete: '삭제',
        },

        clear_diagram_alert: {
            title: '다이어그램 지우기',
            description:
                '이 작업은 되돌릴 수 없으며 다이어그램의 모든 데이터가 지워집니다.',
            cancel: '취소',
            clear: '지우기',
        },

        diagram_access: {
            removed: {
                title: '데이터베이스를 선택하세요',
                description:
                    '새 다이어그램에 사용할 데이터베이스 시스템을 선택하세요.',
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
            title: '다이어그램 자동 정렬',
            description:
                '이 작업은 모든 다이어그램이 재정렬됩니다. 계속하시겠습니까?',
            reorder: '자동 정렬',
            cancel: '취소',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: '복사 실패',
                description: '클립보드가 지원되지 않습니다"',
            },
            failed: {
                title: '복사 실패',
                description: '문제가 발생했습니다. 다시 시도해주세요.',
            },
        },

        theme: {
            system: '시스템 설정에 따름',
            light: '밝게',
            dark: '어둡게',
        },

        zoom: {
            on: '활성화',
            off: '비활성화',
        },

        last_saved: '최근 저장일시: ',
        saved: '저장됨',
        loading_diagram: '다이어그램 로딩중...',
        deselect_all: '모두 선택 해제',
        select_all: '모두 선택',
        delete: '삭제',
        clear: '지우기',
        show_more: '더 보기',
        show_less: '간략히',
        copy_to_clipboard: '클립보드에 복사',
        copied: '복사됨!',

        side_panel: {
            view_all_options: '전체 옵션 보기...',
            tables_section: {
                tables: '테이블',
                add_table: '테이블 추가',
                add_view: '뷰 추가',
                filter: '필터',
                collapse: '모두 접기',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: '모든 테이블이 숨겨져 있습니다',
                show_all: '모두 표시',

                table: {
                    fields: '필드',
                    nullable: 'null 여부',
                    primary_key: '기본키',
                    indexes: '인덱스',
                    check_constraints: '체크 제약조건',
                    comments: '주석',
                    no_comments: '주석 없음',
                    add_field: '필드 추가',
                    add_index: '인덱스 추가',
                    add_check: '체크 추가',
                    index_select_fields: '필드 선택',
                    no_types_found: '타입을 찾을 수 없습니다.',
                    field_name: '이름',
                    field_type: '타입',
                    field_actions: {
                        title: '필드 속성',
                        open_discussion: '대화 열기',
                        unique: '유니크 여부',
                        auto_increment: '자동 증가',
                        comments: '주석',
                        no_comments: '주석 없음',
                        delete_field: '필드 삭제',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: '정밀도',
                        scale: '소수점 자릿수',
                    },
                    index_actions: {
                        title: '인덱스 속성',
                        name: '인덱스 명',
                        unique: '유니크 여부',
                        index_type: '인덱스 타입',
                        delete_index: '인덱스 삭제',
                    },
                    check_constraint_actions: {
                        title: '체크 제약조건',
                        expression: '표현식',
                        delete: '체크 제약조건 삭제',
                    },
                    table_actions: {
                        title: '테이블 작업',
                        open_discussion: '대화 열기',
                        change_schema: '스키마 변경',
                        add_field: '필드 추가',
                        add_index: '인덱스 추가',
                        duplicate_table: '테이블 복제',
                        delete_table: '테이블 삭제',
                    },
                },
                empty_state: {
                    title: '테이블 없음',
                    description: '테이블을 만들어 시작하세요.',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: '필터',
                clear: '필터 지우기',
                no_results: '필터와 일치하는 참조를 찾을 수 없습니다.',
                collapse: '모두 접기',
                add_relationship: '연관 관계 추가',
                relationships: '연관 관계',
                dependencies: '종속성',
                relationship: {
                    relationship: '연관 관계',
                    primary: '주 테이블',
                    foreign: '관련 테이블',
                    cardinality: '카디널리티',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: '제거',
                    switch_tables: '테이블 전환',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: '연관 관계 작업',
                        open_discussion: '대화 열기',
                        delete_relationship: '연관 관계 삭제',
                    },
                },
                dependency: {
                    dependency: '종속성',
                    table: '테이블',
                    dependent_table: '뷰 테이블',
                    delete_dependency: '삭제',
                    dependency_actions: {
                        title: '종속성 작업',
                        delete_dependency: '뷰 테이블 삭제',
                    },
                },
                empty_state: {
                    title: '연관 관계 없음',
                    description: '연관 관계를 만들어 시작하세요.',
                },
            },

            areas_section: {
                areas: '영역',
                add_area: '영역 추가',
                filter: '필터',
                clear: '필터 지우기',
                no_results: '필터와 일치하는 영역을 찾을 수 없습니다.',

                area: {
                    area_actions: {
                        title: '영역 작업',
                        edit_name: '이름 편집',
                        delete_area: '영역 삭제',
                    },
                },
                empty_state: {
                    title: '영역 없음',
                    description: '영역을 만들어 시작하세요',
                },
            },

            visuals_section: {
                visuals: '시각화',
                tabs: {
                    areas: '영역',
                    notes: '메모',
                },
            },

            notes_section: {
                filter: '필터',
                add_note: '메모 추가',
                no_results: '메모를 찾을 수 없습니다',
                clear: '필터 지우기',
                empty_state: {
                    title: '메모 없음',
                    description:
                        '캔버스에 텍스트 주석을 추가하려면 메모를 만드세요',
                },
                note: {
                    empty_note: '빈 메모',
                    note_actions: {
                        title: '메모 작업',
                        edit_content: '내용 편집',
                        delete_note: '메모 삭제',
                    },
                },
            },

            custom_types_section: {
                custom_types: '사용자 정의 타입',
                filter: '필터',
                clear: '필터 지우기',
                no_results:
                    '필터와 일치하는 사용자 정의 타입을 찾을 수 없습니다.',
                new_type: '새 타입',
                empty_state: {
                    title: '사용자 정의 타입 없음',
                    description:
                        '데이터베이스에서 사용 가능한 사용자 정의 타입이 여기에 표시됩니다',
                },
                custom_type: {
                    kind: '종류',
                    enum_values: '열거형 값',
                    composite_fields: '필드',
                    no_fields: '정의된 필드 없음',
                    no_values: '정의된 열거형 값이 없습니다',
                    field_name_placeholder: '필드 이름',
                    field_type_placeholder: '타입 선택',
                    add_field: '필드 추가',
                    no_fields_tooltip:
                        '이 사용자 정의 타입에 정의된 필드가 없습니다',
                    custom_type_actions: {
                        title: '작업',
                        highlight_fields: '필드 강조 표시',
                        delete_custom_type: '삭제',
                        clear_field_highlight: '강조 표시 지우기',
                    },
                    delete_custom_type: '타입 삭제',
                },
            },
            conversations_section: {
                title: '대화',
                tabs_label: '대화',
                tabs: {
                    active: '활성',
                    archives: '보관됨',
                },
                loading: '대화 불러오는 중…',
                filter: '필터',
                clear: '필터 지우기',
                no_results_title: '결과 없음',
                no_results_description:
                    '필터와 일치하는 대화를 찾을 수 없습니다.',

                type_filter: {
                    trigger: '유형',
                    label: '유형별 필터',
                    trigger_aria: '대화 유형으로 필터',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: '다시 시도',
                dismiss: 'Dismiss',
                read_only: '읽기 전용',
                deleted_user: '삭제된 사용자',
                unread: {
                    badge_aria: '읽지 않은 메시지 {{count}}개',
                },
                inactive: {
                    title: '대화 unavailable',
                    description:
                        '대화 are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: '대화 없음',
                    active_description: '대화를 만들어 시작하세요',
                    archives_title: 'No archived 대화',
                    archives_description:
                        'Archived 대화 will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load 대화',
                    load_description:
                        'Something went wrong while loading 대화. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: '대화 열기',
                    start: '대화 시작',
                    pending: '대화를 시작하는 중…',
                    diagram_name: '다이어그램',
                    open_aria: '{{name}} 대화 열기',
                    start_aria: '{{name}} 대화 시작',
                    open_tooltip: '{{name}} 대화 열기',
                    start_tooltip: '{{name}} 대화 시작',
                    pending_tooltip: '{{name}} 대화를 시작하는 중…',
                    action_tooltip: '대화',
                    unavailable_description:
                        '이 다이어그램에서는 대화를 시작할 수 없습니다.',
                    errors: {
                        validation: '이 대상은 대화에 사용할 수 없습니다.',
                        forbidden: '이 대화를 시작할 권한이 없습니다.',
                        not_found:
                            '이 대상은 다이어그램에서 더 이상 사용할 수 없습니다.',
                        conflict:
                            '지금은 대화를 시작할 수 없습니다. 다시 시도하세요.',
                        generic: '대화를 열 수 없습니다. 다시 시도하세요.',
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
                    message_count: '메시지 {{count}}개',
                    no_messages: '아직 메시지가 없습니다',
                    last_activity: '마지막 활동',
                    open_aria: '{{target}} 대화 열기',
                    focus_target_aria: '다이어그램에서 {{target}} 표시',
                    author_tooltip: '{{name}}의 최근 메시지',
                    author_missing_tooltip: '작성자 정보 없음',
                    actions: {
                        menu_aria: '대화 옵션',
                        open: '열기',
                        delete: '삭제',
                    },
                    delete_dialog: {
                        title: '대화를 삭제하시겠습니까?',
                        description:
                            '이 대화와 모든 메시지가 영구적으로 삭제됩니다.',
                        cancel: '취소',
                        confirm: '삭제',
                        deleting: '삭제 중…',
                        errors: {
                            delete_failed:
                                '이 대화를 삭제할 수 없습니다. 다시 시도해 주세요.',
                            forbidden: '이 대화를 삭제할 권한이 없습니다.',
                            not_found: '이 대화를 더 이상 사용할 수 없습니다.',
                        },
                    },
                },
                detail: {
                    back: '뒤로',
                    back_aria: '대화 목록으로 돌아가기',
                    loading: '메시지 불러오는 중…',
                    loading_more: '이전 메시지 불러오는 중…',
                    load_older: '이전 메시지 불러오기',
                    new_messages_badge_one: '새 메시지 1개',
                    new_messages_badge_other: '새 메시지 {{count}}개',
                    new_messages_badge_label_one: '새 메시지',
                    new_messages_badge_label_other: '새 메시지',
                    new_messages_badge_aria_one: '새 메시지로 이동',
                    new_messages_badge_aria_other:
                        '새 메시지 {{count}}개로 이동',
                    empty: {
                        title: '메시지 없음',
                        description: '이 대화에는 메시지가 없습니다.',
                    },
                    errors: {
                        load_title: '메시지를 불러올 수 없습니다',
                        load_description:
                            '메시지를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.',
                    },
                    archive_banner: {
                        title: '보관된 대화',
                        description:
                            '이 대화는 읽기 전용입니다. 메시지를 추가, 수정 또는 삭제할 수 없습니다.',
                    },
                    metadata: {
                        status_label: '상태',
                        status_active: '활성',
                        status_archived: '보관됨',
                        message_count_label: '메시지 수',
                        message_count: '메시지 {{count}}개',
                    },
                    message: {
                        edited: '(수정됨)',
                        edited_aria: '메시지가 수정되었습니다',
                        day_separator: {
                            today: '오늘',
                            yesterday: '어제',
                        },
                        actions: {
                            title: '메시지 작업',
                            edit: '편집',
                            delete: '삭제',
                        },
                        reactions: {
                            add_aria: '반응 추가',
                            add_tooltip: '반응 추가',
                            picker_loading: '이모지 선택기를 불러오는 중…',
                            picker_aria_label: '이모지 선택기',
                            picker_search_placeholder: '이모지 검색…',
                            picker_empty: '이모지를 찾을 수 없습니다.',
                            chip_aria: '{{emoji}} 반응, {{count}}',
                            preview_and_others_one: '외 {{count}}명',
                            preview_and_others_other: '외 {{count}}명',
                            errors: {
                                generic:
                                    '반응을 업데이트할 수 없습니다. 다시 시도해 주세요.',
                                forbidden:
                                    '이 메시지에 반응할 권한이 없습니다.',
                                archived:
                                    '이 대화는 보관되어 반응은 읽기 전용입니다.',
                                not_found:
                                    '이 메시지를 더 이상 사용할 수 없습니다.',
                                invalid_emoji: '유효하지 않은 이모지입니다.',
                            },
                        },
                    },
                    composer: {
                        label: '메시지',
                        placeholder: '메시지를 입력하세요…',
                        submit: '보내기',
                        submitting: '보내는 중…',
                        form_aria_label: '새 대화 메시지',
                        keyboard_hint:
                            'Enter로 보냅니다. Shift+Enter로 줄바꿈합니다.',
                        counter_aria_label: '{{count}} / {{max}}자 사용됨',
                        errors: {
                            empty: '보낼 메시지를 입력하세요.',
                            too_long: '메시지는 2000자를 초과할 수 없습니다.',
                            create_failed:
                                '메시지를 보낼 수 없습니다. 다시 시도하세요.',
                        },
                    },
                    edit: {
                        label: '메시지',
                        form_aria_label: '대화 메시지 편집',
                        save: '저장',
                        saving: '저장 중…',
                        cancel: '취소',
                        counter_aria_label: '{{count}} / {{max}}자 사용됨',
                        errors: {
                            empty: '저장할 메시지를 입력하세요.',
                            too_long: '메시지는 2000자를 초과할 수 없습니다.',
                            update_failed:
                                '메시지를 업데이트할 수 없습니다. 다시 시도하세요.',
                        },
                    },
                    delete_dialog: {
                        title: '메시지 삭제',
                        description:
                            '이 메시지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                        cancel: '취소',
                        confirm: '삭제',
                        deleting: '삭제 중…',
                        errors: {
                            delete_failed:
                                '이 메시지를 삭제할 수 없습니다. 다시 시도하세요.',
                        },
                    },
                    mutation_errors: {
                        forbidden: '이 메시지를 변경할 권한이 없습니다.',
                        archived: '이 대화는 보관되어 읽기 전용입니다.',
                        not_found:
                            '이 대화 또는 메시지를 더 이상 사용할 수 없습니다.',
                    },
                },

                targets: {
                    diagram: '다이어그램',
                    table: '테이블',
                    field: '필드',
                    relationship: '관계',
                    unknown: '대화',
                },
                target_labels: {
                    diagram: '다이어그램',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: '삭제된 테이블',
                    missing_field: '삭제된 필드',
                    missing_relationship: '삭제된 관계',
                    unknown: '대화',
                },
            },
            activities_section: {
                title: '활동',
                filter: '필터',
                clear: '필터 지우기',
                no_results: '필터와 일치하는 활동이 없습니다.',
                loading: '활동을 불러오는 중…',
                retry: '다시 시도',
                type_filter: {
                    trigger: '유형',
                    label: '유형별 필터',
                    trigger_aria: '활동 유형별로 필터',
                },
                types: {
                    diagram: '다이어그램',
                    table: '테이블',
                    field: '필드',
                    relationship: '관계',
                    note: '메모',
                    area: '영역',
                    dependency: '종속성',
                },
                you: '나',
                unknown_user: '누군가',
                empty_state: {
                    title: '아직 활동이 없습니다',
                    description: '편집을 시작하면 최근 변경 사항이 표시됩니다.',
                },
                errors: {
                    load_failed: '활동을 불러올 수 없습니다.',
                },
                actions: {
                    add_tables:
                        '{{user}}님이 테이블 {{table}}을(를) 추가했습니다',
                    remove_tables: '{{user}}님이 테이블을 삭제했습니다',
                    add_field: '{{user}}님이 필드 {{field}}을(를) 추가했습니다',
                    remove_field: '{{user}}님이 필드를 삭제했습니다',
                    update_field:
                        '{{user}}님이 필드 {{field}}을(를) 업데이트했습니다',
                    add_relationships: '{{user}}님이 관계를 추가했습니다',
                    remove_relationships: '{{user}}님이 관계를 삭제했습니다',
                    update_relationship: '{{user}}님이 관계를 업데이트했습니다',
                    add_notes: '{{user}}님이 메모를 추가했습니다',
                    remove_notes: '{{user}}님이 메모를 삭제했습니다',
                    add_areas: '{{user}}님이 영역을 추가했습니다',
                    remove_areas: '{{user}}님이 영역을 삭제했습니다',
                    add_dependencies: '{{user}}님이 종속성을 추가했습니다',
                    remove_dependencies: '{{user}}님이 종속성을 삭제했습니다',
                    fallback: '{{user}}님이 다이어그램을 업데이트했습니다',
                },
            },
            share_section: {
                title: '공유',
                tabs_label: '공유 옵션',
                tabs: {
                    collaborators: '협업자',
                    public_link: '공개 링크',
                },
                collaborators: {
                    description:
                        '편집자 또는 뷰어 권한으로 협업자를 초대합니다. FoxalDB 계정이 있어야 합니다.',
                    filter: '필터',
                    clear: '필터 지우기',
                    no_results_title: '결과 없음',
                    no_results_description:
                        '필터와 일치하는 협업자가 없습니다.',
                    role_filter: {
                        trigger: '역할',
                        label: '역할별 필터',
                        trigger_aria: '협업자 역할별 필터',
                    },
                },
                public_link: {
                    title: '공개 링크',
                    description:
                        '링크가 있는 누구나 읽기 전용 스냅샷을 공유할 수 있습니다.',
                    coming_soon: '곧 제공됩니다.',
                },
                loading: '협업자 불러오는 중…',
                retry: '다시 시도',
                errors: {
                    load_failed: '협업자를 불러올 수 없습니다.',
                },
                member_actions: {
                    title: '협업자 작업',
                    trigger_aria: '협업자 작업',
                    role: '역할',
                    remove: '협업자 제거',
                },
            },
        },

        toolbar: {
            zoom_in: '확대',
            zoom_out: '축소',
            save: '저장',
            show_all: '전체 저장',
            undo: '실행 취소',
            redo: '다시 실행',
            reorder_diagram: '다이어그램 자동 정렬',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: '겹치는 테이블 강조 표시',
            filter: '테이블 필터',
        },

        new_diagram_dialog: {
            database_selection: {
                title: '데이터베이스를 선택하세요',
                description:
                    '새 다이어그램에 사용할 데이터베이스 시스템을 선택하세요.',
                search_placeholder: '데이터베이스 관리 시스템 검색…',
                search_no_results:
                    '검색과 일치하는 데이터베이스 관리 시스템이 없습니다.',
                clear_search: '검색 지우기',
                primary_group: '주요 데이터베이스',
                other_group: '기타 데이터베이스',
                check_examples_long: '예제 확인',
                check_examples_short: '예제들',
            },

            choose_intent: {
                title: '무엇을 하시겠습니까?',
                description: '{{database}}용 새 다이어그램을 만듭니다.',
                create_empty: '빈 다이어그램 만들기',
                create_empty_description:
                    '직접 테이블을 추가하며 처음부터 시작합니다.',
                import: '가져오기',
                import_description:
                    '파일, 붙여넣은 텍스트 또는 데이터베이스에서.',
                back: '뒤로',
            },

            choose_import_method: {
                title: '어떻게 가져오시겠습니까?',
                description: '{{database}} 다이어그램의 소스를 선택하세요.',
                from_file: '파일 또는 붙여넣은 텍스트',
                from_file_description:
                    'SQL, DBML, JSON, 프로젝트 아카이브(.zip).',
                from_database: '기존 데이터베이스',
                from_database_description:
                    '데이터베이스에서 쿼리를 실행하고 결과를 붙여넣으세요.',
                back: '뒤로',
            },

            import_from_database: {
                title: '기존 데이터베이스에서 가져오기',
                description:
                    'SQL 또는 DBML 스키마 파일이 없을 때 사용하세요. 데이터베이스에서 쿼리를 실행한 뒤 아래에 결과를 붙여넣으세요.',
                database_edition: '데이터베이스 에디션',
                edition_regular: '일반',
                run_query: '데이터베이스에서 이 쿼리 실행',
                client_sql: 'SQL',
                paste_result: '결과 붙여넣기',
                paste_result_placeholder: '쿼리 결과를 여기에 붙여넣으세요…',
                check_result: '결과 확인',
                valid_result: '결과가 유효해 보입니다.',
                invalid_result:
                    '결과를 검증할 수 없습니다. 내용을 확인하고 다시 시도하세요.',
                truncated_result:
                    '결과가 잘렸을 수 있습니다. SQL 클라이언트 설정을 조정하고 쿼리를 다시 실행하세요.',
                waiting_for_result: '계속하려면 쿼리 결과를 붙여넣으세요.',
                unsupported_database:
                    '이 데이터베이스 유형에서는 스키마 추출을 사용할 수 없습니다.',
                import_failed:
                    '데이터베이스 스키마를 가져올 수 없습니다. 결과를 확인하고 다시 시도하세요.',
                back: '뒤로',
                import: '가져오기',
            },

            import_schema: {
                title: '스키마 붙여넣기',
                textarea_label: '스키마 내용',
                textarea_placeholder:
                    '여기에 SQL, DBML 또는 JSON 메타데이터를 붙여넣으세요…',
                auto_detect_hint: '형식을 자동으로 감지합니다.',
                or_divider: '또는',
                choose_file: '파일 선택',
                choose_file_or_project: '파일 또는 프로젝트 선택',
                supported_formats_hint:
                    '지원: SQL, DBML, JSON, 프로젝트 아카이브(.zip)',
                privacy_info: {
                    link_label: '자세히 보기…',
                    title: '개인정보 보호 및 지원 형식',
                    intro: '파일을 선택하기 전에 가져오기 중 FoxalDB가 데이터를 처리하는 방식을 확인하세요.',
                    highlights: {
                        no_execution:
                            '가져오기는 정적 분석만 사용합니다 — 코드는 절대 실행되지 않습니다.',
                        no_full_upload:
                            '전체 프로젝트 아카이브는 서버에 업로드되지 않습니다.',
                        filtered_files:
                            '스키마 관련 파일만 유지됩니다. .env, vendor/, node_modules/, tests/는 제외됩니다.',
                    },
                    simple_formats_title: 'SQL, DBML, JSON',
                    simple_formats_description:
                        '브라우저에서 완전히 처리됩니다. 최대 파일 크기: {{sizeMb}}MB.',
                    project_archives_title: '프로젝트 아카이브(.zip)',
                    project_archives_description:
                        '아카이브는 로컬에서 열리며 스키마 관련 파일만 추출됩니다. 최대 아카이브 크기: {{sizeMb}}MB.',
                    excluded_paths:
                        '포함되지 않음: .env, vendor/, node_modules/, tests/ 및 스키마와 관련 없는 기타 소스 파일.',
                    table: {
                        framework: '프레임워크',
                        files: '분석 파일',
                        processing: '처리',
                        processing_local: '브라우저만',
                        processing_remote: '서버(로그인 필요)',
                    },
                    frameworks: {
                        laravel: { files: 'database/migrations/*.php' },
                        prisma: { files: 'prisma/schema.prisma' },
                        rails: { files: 'db/schema.rb' },
                        drizzle: { files: 'drizzle/**/*.sql' },
                        entity_framework_core: { files: '*ModelSnapshot.cs' },
                        django: { files: '*/migrations/*.py' },
                    },
                    back: '뒤로',
                },
                change_file_aria: '파일 변경, 현재: {{name}}',
                selected_file: '선택한 파일: {{name}}',
                back: '뒤로',
                import: '가져오기',
                mismatch: {
                    title: '이 스키마는 {{detected}}처럼 보이지만 {{selected}}를 선택했습니다.',
                    description:
                        '감지된 데이터베이스 유형으로 전환하거나 돌아가 다른 유형을 선택하세요.',
                    switch: '{{database}}(으)로 전환',
                    go_back: '뒤로',
                },
                ambiguous: {
                    title: '소스 DBMS 선택',
                    confidence_explanation:
                        '백분율은 각 DBMS에 대한 SQL 방언 일치 지수를 나타냅니다.',
                    description:
                        'SQL 방언을 자동으로 식별할 수 없습니다. 이 스키마가 어떤 DBMS에서 왔는지 확인하세요.',
                    choose_source: '소스 DBMS 선택',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} (신뢰도 {{percent}}%, 자동 감지)',
                    recommended_tooltip: '자동 감지된 DBMS',
                    recommended_aria: '{{database}}, 자동 감지된 DBMS',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Ready to import this diagram.',
                        mismatch_title: 'DBMS 불일치',
                        mismatch_description:
                            '파일은 {{detected}}를 나타내지만 {{selected}}를 선택했습니다.',
                        unsupported_existing:
                            'Diagram JSON restores a full diagram and cannot be merged into the current one. Export or create a new diagram instead.',
                    },
                    ambiguous: {
                        title: 'Choose the diagram DBMS',
                        description: '이 가져오기에 적용할 옵션을 선택하세요.',
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
                    dialect: '{{database}} 감지됨',
                    dbml: 'DBML 감지됨',
                    metadata_json: '메타데이터 JSON 감지됨',
                    diagram_json: '다이어그램 JSON 감지됨',
                    sql_ambiguous_title: 'SQL 감지됨',
                    sql_ambiguous_description:
                        'DBMS를 자동으로 식별할 수 없습니다.',
                    clickhouse_unsupported: 'ClickHouse SQL 감지됨',
                    unsupported: '지원되지 않는 형식',
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
                    analyzing_project: '프로젝트 아카이브를 분석하는 중…',
                    detected: '{{framework}} 프로젝트가 감지되었습니다',
                    migrations_found_one:
                        '마이그레이션 {{count}}개를 찾았습니다',
                    migrations_found_other:
                        '마이그레이션 {{count}}개를 찾았습니다',
                    schema_files_found_one:
                        '스키마 파일 {{count}}개를 찾았습니다',
                    schema_files_found_other:
                        '스키마 파일 {{count}}개를 찾았습니다',
                    multiple_projects_title:
                        '여러 데이터베이스 스키마가 감지되었습니다',
                    multiple_projects_description:
                        '이 아카이브에는 지원되는 데이터베이스 프로젝트가 여러 개 있습니다. 가져올 항목을 선택하세요.',
                    choose_project: '프로젝트 선택',
                    unsupported_project: '지원되지 않는 프로젝트 아카이브',
                    unsupported_project_description:
                        '이 아카이브에서 Laravel, Prisma, Drizzle, Rails, Entity Framework Core 또는 Django 데이터베이스 프로젝트를 찾을 수 없습니다.',
                    project_root: '프로젝트 루트: {{path}}',
                    sign_in_to_import_framework:
                        '가져오기가 가능해지면 {{framework}} 프로젝트를 가져오려면 로그인하세요.',
                    remote_processing_notice:
                        '가져오기가 가능해지면 스키마 관련 파일만 처리됩니다.',
                    remote_processing_scope:
                        '전체 아카이브나 관련 없는 소스 파일은 업로드되지 않습니다.',
                    remote_processing_security:
                        '분석은 정적이며 업로드된 코드를 실행하지 않습니다.',
                },
                errors: {
                    unreadable_file: '선택한 파일을 읽을 수 없습니다.',
                    malformed_json: 'JSON 내용을 구문 분석할 수 없습니다.',
                    unsupported:
                        '이 형식은 스키마 가져오기를 지원하지 않습니다.',
                    diagram_json:
                        '다이어그램 JSON은 다이어그램 파일 옵션에서 가져올 수 있습니다.',
                    clickhouse_unsupported:
                        'ClickHouse에서는 SQL DDL 가져오기가 지원되지 않습니다. DBML을 사용하거나 기존 데이터베이스에서 가져오세요.',
                    file_too_large: '선택한 파일이 5MB를 초과합니다.',
                    archive_too_large:
                        '선택한 프로젝트 아카이브가 50MB를 초과합니다.',
                    archive_invalid:
                        '선택한 파일은 유효한 프로젝트 아카이브가 아닙니다.',
                    unsupported_file_extension:
                        '.sql, .dbml, .json 및 .zip 프로젝트 아카이브만 지원됩니다.',
                    import_failed:
                        '스키마를 가져올 수 없습니다. 내용을 확인하고 다시 시도하세요.',
                    invalid_diagram_json:
                        '다이어그램 JSON이 유효하지 않습니다. 파일을 확인한 후 다시 시도하세요.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS을 사용하시는 경우',
                    title: '지침',
                    step_1: '도구 > 옵션 > 쿼리 응답 > SQL Server',
                    step_2: '"결과를 그리드로 표시"를 사용하는 경우 비 XML 데이터에 대해 검색되는 최대 문자 수를 변경합니다. (9999999로 설정)',
                },
            },

            cancel: '취소',
            back: '뒤로가기',
            import_from_file: '파일에서 가져오기',
            empty_diagram: '빈 데이터베이스',
            continue: '계속',
            import: '가져오기',
        },

        share_diagram_dialog: {
            title: '다이어그램 공유',
            description:
                '편집자 또는 뷰어 권한으로 협업자를 초대하세요. FoxalDB 계정이 있어야 합니다.',
            share_button: '공유',
            empty_members: '아직 협업자가 없습니다.',
            remove: '제거',
            roles: {
                owner: '소유자',
                editor: '편집자',
                viewer: '뷰어',
            },
            add_member: {
                title: '협업자 추가',
                email_label: '이메일',
                email_placeholder: '이메일 주소',
                add: '추가',
                adding: '추가 중…',
                cancel: '취소',
            },
            errors: {
                load_failed: '협업자를 불러올 수 없습니다.',
                add_failed: '협업자를 추가할 수 없습니다.',
            },
        },

        diagram_role: {
            owner: '소유자',
            editor: '편집자',
            viewer: '뷰어',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: '데이터베이스 열기',
            description:
                '새 다이어그램에 사용할 데이터베이스 시스템을 선택하세요.',
            table_columns: {
                name: '이름',
                created_at: '생성일시',
                last_modified: '최근 수정일시',
                tables_count: '테이블 갯수',
            },
            cancel: '취소',
            open: '열기',
            new_database: '새 데이터베이스',

            diagram_actions: {
                open: '열기',
                duplicate: '복제',
                delete: '삭제',
            },
        },

        export_sql_dialog: {
            title: 'SQL로 내보내기',
            description: '다이어그램 스키마를 {{databaseType}} SQL로 내보내기',
            close: '닫기',
            loading: {
                text: '{{databaseType}} SQL을 AI가 생성하고 있습니다...',
                description: '30초 정도 걸릴 수 있습니다.',
            },
            error: {
                message:
                    'SQL 생성에 실패하였습니다. 잠시후 다시 시도해주세요 계속해서 증상이 발생하는 경우 <0>우리에게 연락해주세요</0>.',
                description:
                    '당신의 OPENAI_TOKEN가 있는 경우, <0>여기에서</0> 메뉴얼을 참고하여 사용하실 수 있습니다.',
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
            title: '연관 관계 생성',
            primary_table: '주 테이블',
            primary_field: '주 필드',
            referenced_table: '참조 테이블',
            referenced_field: '참조 필드',
            primary_table_placeholder: '테이블 선택',
            primary_field_placeholder: '필드 선택',
            referenced_table_placeholder: '테이블 선택',
            referenced_field_placeholder: '필드 선택',
            no_tables_found: '테이블을 찾을 수 없습니다',
            no_fields_found: '필드를 찾을 수 없습니다',
            create: '생성',
            cancel: '취소',
        },

        import_database_dialog: {
            title: '현재 다이어그램 가져오기',
            import_schema: {
                title: '스키마 가져오기',
                import: '가져오기',
                cancel: '취소',
                mismatch: {
                    title: '이 스키마는 {{detected}}처럼 보이지만, 이 다이어그램은 {{selected}}입니다.',
                    description:
                        '서로 다른 데이터베이스 간 가져오기는 아직 지원되지 않습니다.',
                    cancel: '취소',
                },
                ambiguous: {
                    description:
                        'SQL 방언을 자동으로 식별할 수 없습니다. 현재 {{selected}} 다이어그램에 이 스키마를 어떻게 해석할지 확인하세요.',
                },
            },
            override_alert: {
                title: '데이터베이스 가져오기',
                content: {
                    alert: '이 다이어그램을 가져오면 기존 테이블 및 연관 관계에 영향을 미칩니다.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold>개의 신규 테이블 생성됨',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold>개의 신규 연관 관계 생성됨',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold>개의 테이블이 덮어씌워짐',
                    proceed: '정말로 가져오시겠습니까?',
                },
                import: '가져오기',
                cancel: '취소',
            },
        },

        export_image_dialog: {
            title: '이미지로 내보내기',
            description: '내보낼 배율을 선택해주세요:',
            scale_1x: '1x (저화질)',
            scale_2x: '2x (일반 화질)',
            scale_4x: '4x (최고 화질)',
            cancel: '취소',
            export: '내보내기',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: '스키마 선택',
            description:
                '현재 여러 스키마가 표시됩니다. 새 테이블을 위해 하나를 선택합니다.',
            cancel: '취소',
            confirm: 'Confirm',
        },

        update_table_schema_dialog: {
            title: '스키마 변경',
            description: '"{{tableName}}" 테이블 스키마를 수정합니다',
            cancel: '취소',
            confirm: '변경',
        },

        create_table_schema_dialog: {
            title: '새 스키마 생성',
            description:
                '아직 스키마가 없습니다. 테이블을 정리하기 위해 첫 번째 스키마를 생성하세요.',
            create: '생성',
            cancel: '취소',
        },
        export_diagram_dialog: {
            title: '다이어그램 내보내기',
            description: '내보낼 형식을 선택해주세요:',
            format_json: 'JSON',
            cancel: '취소',
            export: '내보내기',
            error: {
                title: '다이어그램 내보내기 오류',
                description:
                    '무언가 문제가 발생하였습니다. 도움이 필요하신 경우 support@chartdb.io으로 연락해주세요.',
            },
        },
        import_diagram_dialog: {
            title: '다이어그램 가져오기',
            description: '아래에 다이어그램 JSON을 첨부해주세요:',
            cancel: '취소',
            import: '가져오기',
            error: {
                title: '다이어그램 가져오기 오류',
                description:
                    '다이어그램 JSON이 유효하지 않습니다. JSON이 올바른 형식인지 확인해주세요. 도움이 필요하신 경우 support@chartdb.io으로 연락해주세요.',
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
            one_to_one: '일대일 (1:1)',
            one_to_many: '일대다 (1:N)',
            many_to_one: '다대일 (N:1)',
            many_to_many: '다대다 (N:N)',
        },

        canvas_context_menu: {
            new_table: '새 테이블',
            new_view: '새 뷰',
            new_relationship: '새 연관관계',
            new_area: '새 영역',
            new_note: '새 메모',
        },

        table_node_context_menu: {
            edit_table: '테이블 수정',
            duplicate_table: '테이블 복제',
            delete_table: '테이블 삭제',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: '영역으로 이동',
            no_area: '영역 없음',
        },

        canvas: {
            all_tables_hidden: '모든 테이블이 숨겨져 있습니다',
            show_all_tables: '모두 표시',
        },

        canvas_filter: {
            title: '테이블 필터',
            search_placeholder: '테이블 검색...',
            group_by_schema: '스키마별 그룹화',
            group_by_area: '영역별 그룹화',
            no_tables_found: '테이블을 찾을 수 없습니다',
            empty_diagram_description: '시작하려면 테이블을 만드세요',
            no_tables_description: '검색 또는 필터를 조정해 보세요',
            clear_filter: '필터 지우기',
        },

        snap_to_grid_tooltip: '그리드에 맞추기 ({{key}}를 누른채 유지)',

        editing_conflict: {
            one: '{{name}}도 이것을 편집하고 있습니다.',
            two: '{{name1}} 및 {{name2}}도 이것을 편집하고 있습니다.',
            many: '{{name}} 외 {{count}}명도 이것을 편집하고 있습니다.',
            fallback_name: '공동 작업자',
            last_writer_wins:
                '변경 사항은 잠기지 않습니다. 마지막으로 저장된 편집이 적용됩니다.',
        },

        tool_tips: {
            double_click_to_edit: '더블클릭하여 편집',
        },

        auth: {
            dialog: {
                account_title: '계정',
                login_title: 'FoxalDB에 로그인',
                register_title: 'FoxalDB 계정 만들기',
                account_description: '현재 세션을 관리합니다.',
                login_description:
                    '로그인하여 더 많은 다이어그램을 저장하고 동기화하세요.',
                register_description:
                    '계정을 만들어 더 많은 다이어그램을 저장하세요.',
                checking_session: '세션 확인 중...',
                continue_without_account: '계정 없이 계속',
            },
            login: {
                title: '로그인',
                email_label: '이메일',
                password_label: '비밀번호',
                submit: '로그인',
                submitting: '로그인 중...',
                switch_to_register: '회원가입',
                no_account: '계정이 없으신가요?',
            },
            register: {
                title: '회원가입',
                first_name_label: '이름',
                last_name_label: '성',
                email_label: '이메일',
                password_label: '비밀번호',
                password_confirmation_label: '비밀번호 확인',
                submit: '계정 만들기',
                submitting: '계정 생성 중...',
                switch_to_login: '로그인',
                already_have_account: '이미 계정이 있으신가요?',
            },
            account: {
                signed_in_as: '로그인됨',
                logout: '로그아웃',
                back_to_editor: '편집기로 돌아가기',
            },
            settings: {
                title: '사용자 설정',
                description: '개인 정보와 비밀번호를 업데이트하세요.',
                change_password_heading: '비밀번호 변경',
                current_password_label: '현재 비밀번호',
                new_password_label: '새 비밀번호',
                password_confirmation_label: '새 비밀번호 확인',
                first_name_label: '이름',
                last_name_label: '성',
                email_label: '이메일 주소',
                submit: '변경 사항 저장',
                submitting: '저장 중...',
                success_title: '프로필이 업데이트되었습니다',
                success_description: '프로필이 저장되었습니다.',
            },
            nav: {
                sign_in: '로그인',
                logout: '로그아웃',
                loading: '...',
                user_menu: '계정',
                settings: '설정',
                change_language: '언어',
            },
            pages: {
                login_title: 'FoxalDB — 로그인',
                register_title: 'FoxalDB — 회원가입',
                checking_session: '세션 확인 중…',
            },
            errors: {
                first_name_required: '이름은 필수입니다.',
                last_name_required: '성은 필수입니다.',
                generic: '문제가 발생했습니다.',
            },
        },

        guest_migration_dialog: {
            title: '로컬 다이어그램을 가져오시겠습니까?',
            description:
                '이 기기에 저장된 다이어그램이 있습니다. 계정으로 가져와 어디서나 접근하세요.',
            import: '계정으로 가져오기',
            continue_without_import: '가져오지 않고 계속',
        },

        guest_migration_errors: {
            import_failed:
                '로컬 다이어그램을 가져올 수 없습니다. 로컬 사본이 보존되었습니다.',
            activation_failed:
                '다이어그램이 생성되었지만 열 수 없습니다. 로컬 사본이 보존되었습니다.',
            cleanup_failed:
                '다이어그램은 가져왔지만 로컬 사본을 제거할 수 없습니다. 수동으로 삭제할 수 있습니다.',
            check_failed: '로컬 다이어그램을 읽을 수 없습니다.',
        },

        language_select: {
            change_language: '언어',
        },

        on: '켜기',
        off: '끄기',
    },
};

export const ko_KRMetadata: LanguageMetadata = {
    name: 'Korean (South Korea)',
    nativeName: '한국어 (대한민국)',
    code: 'ko_KR',
    countryCode: 'kr',
};
