import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: '뷰 «{{path}}»를 건너뛰었습니다.',
    keyless_table_skipped:
        '안전하게 표현할 수 있는 열이 없어 테이블 «{{path}}»을(를) 건너뛰었습니다.',
    keyless_table:
        '테이블 «{{path}}»에는 기본 키가 없으며 id를 만들지 않고 네이티브 Drizzle 테이블로 내보냅니다.',
    schema_ignored_sqlite:
        'SQLite는 schema «{{schema}}»를 사용하지 않습니다. 테이블 «{{path}}»는 schema 한정자 없이 내보냅니다.',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}»가 생략되었습니다. Drizzle은 한정되지 않은 테이블 이름과 단일 데이터베이스 연결을 사용합니다.',
    mysql_multiple_catalogs_ignored:
        'MySQL 내보내기는 {{count}}개의 catalog를 생략하고 물리적 이름이 고유하므로 한정되지 않은 테이블 이름을 출력합니다.',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}»가 생략되었습니다. Drizzle은 한정되지 않은 테이블 이름과 단일 데이터베이스 연결을 사용합니다.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 내보내기는 {{count}}개의 catalog를 생략하고 물리적 이름이 고유하므로 한정되지 않은 테이블 이름을 출력합니다.',
    mariadb_mysql_dialect_adapted:
        'MariaDB는 Drizzle MySQL API로 내보냅니다(dialect «{{dialect}}»). Drizzle 0.45에는 일급 MariaDB dialect가 없습니다.',
    postgres_schema_qualified:
        'PostgreSQL schema «{{schema}}»는 pgSchema()로 내보냅니다.',
    uuid_as_text:
        '필드 «{{path}}»의 UUID는 이 데이터베이스에 Drizzle 0.45 네이티브 UUID 유형이 없어 text로 내보냅니다.',
    increment_omitted:
        '«{{path}}»의 자동 증가는 안전하게 표현할 수 없어 생략되었습니다.',
    set_null_omitted:
        '외래 키 열이 NOT NULL이므로 «{{path}}»에서 ON DELETE SET NULL을 생략했습니다.',
    sqlite_boolean_integer:
        '필드 «{{path}}»의 boolean은 SQLite에 네이티브 boolean 유형이 없어 integer({ mode: "boolean" })로 내보냅니다.',
    sqlite_json_text:
        '필드 «{{path}}»의 JSON은 SQLite가 JSON을 TEXT로 저장하므로 text({ mode: "json" })로 내보냅니다.',
    table_name_adjusted: {
        table: '테이블 «{{path}}»는 TypeScript 상수 {{tsName}}(으)로 내보냅니다. 물리 테이블 이름은 유지됩니다.',
        pgEnum: 'PostgreSQL enum «{{path}}»는 TypeScript 상수 {{tsName}}(으)로 내보냅니다. 물리 enum 이름은 유지됩니다.',
        pgSchema:
            'PostgreSQL schema «{{path}}»는 TypeScript 상수 {{tsName}}(으)로 내보냅니다.',
    },
    table_name_collision:
        '«{{path}}»의 테이블 상수 «{{tsName}}»는 중복 TypeScript 식별자를 피하기 위해 할당되었습니다.',
    column_name_adjusted:
        '열 «{{path}}»는 TypeScript 속성 {{tsName}}(으)로 내보냅니다. 물리 열 이름은 유지됩니다.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            '복합 외래 키 «{{path}}»는 원본과 대상 열 목록이 둘 다 있지 않아 건너뛰었습니다.',
        composite_fk_arity_mismatch:
            '복합 외래 키 «{{path}}»는 원본과 대상 열 개수가 달라 건너뛰었습니다.',
        label_only:
            '다대다 관계 «{{path}}»는 레이블에서 물리 조인 테이블을 식별할 수 없어 건너뛰었습니다.',
        table_not_exported:
            '관계 «{{path}}»는 참조된 테이블이 내보내지지 않아 건너뛰었습니다.',
        unresolved_member:
            '관계 «{{path}}»는 참조된 필드가 내보내지지 않아 건너뛰었습니다.',
    },
    index_omitted: {
        unsupported_method:
            '인덱스 «{{path}}»는 유형 «{{indexType}}»이(가) 내보내지지 않아 생략되었습니다.',
        field_not_exported:
            '인덱스 «{{path}}»는 참조된 필드가 내보내지지 않아 생략되었습니다.',
    },
    comment_omitted: {
        table: '«{{path}}»의 테이블 주석은 Drizzle 0.45에 이 내보내기가 사용하는 구조화된 주석 API가 없어 생략됩니다.',
        column: '«{{path}}»의 열 주석은 Drizzle 0.45에 이 내보내기가 사용하는 구조화된 주석 API가 없어 생략됩니다.',
    },
    check_omitted: {
        table: '«{{path}}»의 CHECK 제약 조건은 생성된 TypeScript에 원시 SQL을 삽입하지 않으므로 생략됩니다.',
        column: '«{{path}}»의 CHECK는 생성된 TypeScript에 원시 SQL을 삽입하지 않으므로 생략됩니다.',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}»의 SET 필드는 text로 내보냅니다. 네이티브 SET 유형은 생성되지 않습니다.',
    },
    enum_degraded: {
        ts_enum_only:
            '필드 «{{path}}»의 enum은 text({ enum: [...] })로 내보냅니다. SQLite에는 물리적 enum 제약이 없습니다.',
        unsupported_enum:
            '필드 «{{path}}»의 enum은 네이티브 Drizzle enum으로 표현할 수 없어 text로 내보냅니다.',
        unknown_values:
            '필드 «{{path}}»의 enum은 enum 값이 없어 text로 내보냅니다.',
    },
    type_omitted: {
        array: '«{{path}}»의 배열 필드는 Drizzle 내보내기에서 생략됩니다.',
        unsupported:
            '«{{path}}»의 필드는 유형을 표현할 수 없어 생략되었습니다.',
        unimplemented_database:
            '데이터베이스 유형 «{{databaseType}}»에 대한 유형 매핑이 구현되지 않았습니다.',
    },
    type_degraded: {
        binary_as_bytea:
            '필드 «{{path}}»의 바이너리 유형은 bytea()로 내보냅니다.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}»의 기본값은 생략되었습니다(지원되지 않는 기본값 유형).',
        current_timestamp_non_datetime:
            '«{{path}}»의 기본값은 생략되었습니다(datetime이 아닌 필드의 CURRENT_TIMESTAMP).',
        sql_expression:
            '«{{path}}»의 기본값은 생략되었습니다(지원되지 않는 SQL 식: {{expression}}).',
        unclear:
            '«{{path}}»의 기본값은 생략되었습니다(불분명한 기본값: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}»의 기본값은 생략되었습니다(boolean이 아닌 필드의 boolean 기본값).',
        numeric_on_non_numeric:
            '«{{path}}»의 기본값은 생략되었습니다(숫자가 아닌 필드의 숫자 기본값).',
    },
};
