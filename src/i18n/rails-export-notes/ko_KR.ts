import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: '뷰 "{{path}}"을(를) 건너뛰었습니다.',
    schema_ignored_sqlite:
        'SQLite는 schema "{{schema}}"을(를) 사용하지 않습니다. 테이블 "{{path}}"은(는) schema 한정자 없이 내보내집니다.',
    mysql_catalog_omitted:
        'MySQL catalog "{{catalog}}"이(가) 생략됩니다. Rails는 연결된 데이터베이스와 한정되지 않은 테이블 이름을 사용합니다.',
    mysql_multiple_catalogs_ignored:
        'MySQL 내보내기에서 {{count}}개의 catalog를 생략하고, 물리적 이름이 고유하므로 한정되지 않은 테이블 이름을 출력합니다.',
    mariadb_catalog_omitted:
        'MariaDB catalog "{{catalog}}"이(가) 생략됩니다. Rails는 연결된 데이터베이스와 한정되지 않은 테이블 이름을 사용합니다.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 내보내기에서 {{count}}개의 catalog를 생략하고, 물리적 이름이 고유하므로 한정되지 않은 테이블 이름을 출력합니다.',
    composite_fk_unsupported:
        '복합 외래 키 "{{path}}"은(는) 내보내지지 않습니다. Rails V1은 안전한 단일 컬럼 외래 키만 출력합니다.',
    keyless_relationship_skipped:
        '관계 "{{path}}"은(는) 주 테이블이 외래 키 의미론을 지원할 수 없어 건너뛰었습니다.',
    many_to_many_skipped:
        '다대다 관계 "{{path}}"을(를) 건너뛰었습니다. 레이블에서 단일 외래 키 측을 추론할 수 없습니다.',
    keyless_model:
        '테이블 "{{path}}"에 기본 키가 없습니다. 모델은 self.primary_key = nil을 설정합니다. Active Record 영속성이 제한될 수 있습니다.',
    one_to_one_degraded_non_unique_fk:
        '"{{path}}"의 일대일 관계는 외래 키가 고유하지 않아 has_many로 내보내집니다.',
    many_to_many_through_skipped:
        '조인 테이블 "{{path}}"에 대해 has_many :through가 생성되지 않았습니다. 연관 이름이 모호했습니다.',
    model_name_adjusted:
        '테이블 "{{path}}"의 모델 클래스가 {{className}}(으)로 할당되었습니다.',
    model_name_collision:
        '테이블 "{{path}}"의 모델 클래스 {{className}}은(는) 중복 상수를 피하기 위해 할당되었습니다.',
    on_update_omitted:
        'ON UPDATE "{{action}}"은(는) Rails 8.1 schema.rb add_foreign_key에서 "{{path}}"에 대해 표현되지 않습니다.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL이 "{{path}}"에서 생략되었습니다. 외래 키 컬럼이 nullable하지 않습니다.',
        update: 'ON UPDATE SET NULL이 "{{path}}"에서 생략되었습니다. 외래 키 컬럼이 nullable하지 않습니다.',
    },
    association_name_adjusted: {
        belongs_to:
            '"{{path}}"의 belongs_to가 이름 충돌을 피하기 위해 {{associationName}}(으)로 할당되었습니다.',
        inverse:
            '"{{path}}"의 역방향 연관이 이름 충돌을 피하기 위해 {{associationName}}(으)로 할당되었습니다.',
    },
    relationship_skipped: {
        table_not_exported:
            '관계 "{{path}}"은(는) 테이블이 내보내지지 않아 건너뛰었습니다.',
        unresolved_field_ids:
            '관계 "{{path}}"은(는) 외래 키 필드 ID를 확인할 수 없어 건너뛰었습니다.',
        referenced_column_not_exported:
            '관계 "{{path}}"은(는) 참조된 컬럼이 내보내지지 않아 건너뛰었습니다.',
    },
    index_omitted: {
        unsupported_type:
            '인덱스 "{{path}}"은(는) 유형 "{{indexType}}"이 Rails schema.rb에서 내보내지지 않아 생략되었습니다.',
        missing_field:
            '인덱스 "{{path}}"은(는) 참조된 필드가 누락되어 생략되었습니다.',
        field_not_exported:
            '인덱스 "{{path}}"은(는) 참조된 필드가 내보내지지 않아 생략되었습니다.',
    },
    comment_omitted: {
        table: '테이블 "{{path}}"의 주석은 SQLite가 주석을 영속화하지 않아 생략됩니다.',
        column: '컬럼 "{{path}}"의 주석은 SQLite가 주석을 영속화하지 않아 생략됩니다.',
    },
    check_omitted: {
        table: '"{{path}}"의 빈 CHECK 제약 조건이 생략되었습니다.',
        column: '"{{path}}"의 빈 CHECK가 생략되었습니다.',
    },
    set_degraded: {
        sqlite_as_string:
            '"{{path}}"의 SET 필드는 SQLite용 string으로 내보내집니다.',
        mysql_family_as_string:
            '"{{path}}"의 SET 필드는 string으로 내보내집니다. 네이티브 SET DSL은 출력되지 않습니다.',
    },
    enum_degraded: {
        sqlite_as_string:
            '"{{path}}"의 enum 필드는 SQLite용 string으로 내보내집니다.',
        pg_type_values_missing:
            'PostgreSQL enum "{{path}}"은(는) 표준 값이 누락되어 선언되지 않았습니다.',
        pg_field_values_missing:
            '필드 "{{path}}"의 PostgreSQL enum은 표준 enum 값이 누락되어 string으로 내보내졌습니다.',
        pg_field_named_values_missing:
            '필드 "{{path}}"의 PostgreSQL enum "{{enumName}}"은(는) enum 값이 누락되어 string으로 내보내졌습니다.',
        mysql_family_as_string:
            '"{{path}}"의 enum 필드는 string으로 내보내집니다. 네이티브 enum/set DSL은 출력되지 않습니다.',
    },
    type_omitted: {
        array: '"{{path}}"의 배열 필드는 Rails schema.rb에서 표현되지 않습니다.',
        spatial:
            '"{{path}}"의 공간 필드는 Rails schema.rb에서 표현되지 않습니다.',
        unsupported:
            '"{{path}}"의 필드는 유형을 표현할 수 없어 생략되었습니다.',
        unimplemented_database:
            '데이터베이스 유형 "{{databaseType}}"에 대한 유형 매핑이 구현되지 않았습니다.',
    },
    type_degraded: {
        serial_no_sequence:
            '"{{path}}"의 비기본 키 serial 필드는 시퀀스 없이 일반 integer로 내보내집니다.',
        jsonb_as_json: '필드 "{{path}}"의 jsonb는 json으로 내보내집니다.',
        uuid_as_string: '필드 "{{path}}"의 uuid는 string(36)으로 내보내집니다.',
        null_as_text:
            '필드 "{{path}}"의 null 저장 클래스는 text로 내보내집니다.',
        money_as_decimal: '필드 "{{path}}"의 money는 decimal로 내보내집니다.',
        year_as_integer: '필드 "{{path}}"의 year는 integer로 내보내집니다.',
        bit_as_boolean: '필드 "{{path}}"의 bit는 boolean으로 내보내집니다.',
        type_as_string:
            '필드 "{{path}}"의 유형 "{{sourceType}}"은(는) {{mappedHelper}}(으)로 내보내집니다.',
    },
    default_omitted: {
        lambda_expression:
            '"{{path}}"의 기본값이 생략되었습니다(lambda 형태의 SQL 식: {{expression}}).',
        sql_expression:
            '"{{path}}"의 기본값이 생략되었습니다(지원되지 않는 SQL 식: {{expression}}).',
        unclear:
            '"{{path}}"의 기본값이 생략되었습니다(불명확한 기본값: {{expression}}).',
        current_timestamp_non_datetime:
            '"{{path}}"의 기본값이 생략되었습니다(비 datetime 필드의 CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '"{{path}}"의 기본값이 생략되었습니다(비 PostgreSQL UUID 필드의 UUID 함수 기본값).',
        boolean_on_non_boolean:
            '"{{path}}"의 기본값이 생략되었습니다(비 boolean 필드의 boolean 기본값).',
        numeric_on_non_numeric:
            '"{{path}}"의 기본값이 생략되었습니다(비숫자 필드의 숫자 기본값).',
        unsupported_type:
            '"{{path}}"의 기본값이 생략되었습니다(지원되지 않는 기본값 유형).',
    },
};
