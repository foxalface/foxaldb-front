import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: '뷰 «{{path}}»를 건너뛰었습니다.',
    keyless_table_skipped:
        '테이블 «{{path}}»를 건너뛰었습니다. Django V1은 대체 기본 키를 만들지 않습니다.',
    schema_ignored_sqlite:
        'SQLite는 schema «{{schema}}»를 사용하지 않습니다. 테이블 «{{path}}»는 schema 한정자 없이 내보냅니다.',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}»가 생략되었습니다. Django는 연결된 데이터베이스와 한정되지 않은 테이블 이름을 사용합니다.',
    mysql_multiple_catalogs_ignored:
        'MySQL 내보내기는 {{count}}개의 catalog를 생략하고 물리적 이름이 고유하므로 한정되지 않은 테이블 이름을 출력합니다.',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}»가 생략되었습니다. Django는 연결된 데이터베이스와 한정되지 않은 테이블 이름을 사용합니다.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 내보내기는 {{count}}개의 catalog를 생략하고 물리적 이름이 고유하므로 한정되지 않은 테이블 이름을 출력합니다.',
    postgres_schema_qualified_db_table:
        'PostgreSQL 테이블 «{{path}}»는 schema «{{schema}}»로 한정된 db_table로 내보냅니다.',
    composite_fk_unsupported:
        '복합 외래 키 «{{path}}»는 내보내지 않습니다. 멤버 열은 스칼라로 유지됩니다.',
    many_to_many_skipped:
        '다대다 관계 «{{path}}»를 건너뛰었습니다. 레이블만으로 조인 테이블을 만들지 않습니다.',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}»의 일대일 관계는 외래 키가 고유하지 않아 ForeignKey로 내보냅니다.',
    model_name_adjusted:
        '테이블 «{{path}}»의 모델 클래스가 {{className}}(으)로 할당되었습니다.',
    model_name_collision:
        '테이블 «{{path}}»의 모델 클래스 {{className}}은(는) 중복 클래스 이름을 피하기 위해 할당되었습니다.',
    field_name_adjusted:
        '필드 «{{path}}»는 db_column «{{dbColumn}}»과(와) 함께 Python 속성 {{attributeName}}(으)로 내보냅니다.',
    related_name_adjusted:
        '«{{path}}»의 related_name은 역접근자 충돌을 피하기 위해 {{relatedName}}(으)로 할당되었습니다.',
    composite_primary_key:
        '테이블 «{{path}}»는 속성 {{attributes}}를 사용하는 Django 6.1 CompositePrimaryKey로 내보냅니다.',
    on_update_omitted:
        '«{{path}}»의 ON UPDATE «{{action}}»가 생략되었습니다. ForeignKey에는 데이터베이스 ON UPDATE에 해당하는 항목이 없습니다.',
    on_delete_restrict_degraded:
        '«{{path}}»의 ON DELETE RESTRICT는 models.DO_NOTHING으로 내보냅니다. Django RESTRICT/PROTECT 수집기 의미는 사용되지 않습니다.',
    set_null_omitted: {
        delete: '«{{path}}»에서 ON DELETE SET NULL이 생략되었습니다. 외래 키가 nullable이 아니므로 models.DO_NOTHING을 사용합니다.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            '조인 테이블 «{{path}}»에 추가 데이터 열이 있어 편의 ManyToManyField가 생성되지 않았습니다.',
        ambiguous:
            '조인 테이블 «{{path}}»의 엔드포인트 모델이 모호하여 편의 ManyToManyField가 생성되지 않았습니다.',
    },
    relationship_skipped: {
        table_not_exported:
            '관계 «{{path}}»를 건너뛰었습니다. 테이블이 내보내지지 않았습니다.',
        field_not_exported:
            '관계 «{{path}}»를 건너뛰었습니다. 참조 필드가 내보내지지 않았습니다.',
        already_relational:
            '관계 «{{path}}»를 건너뛰었습니다. 소유 필드가 이미 관계입니다.',
        primary_key_fk:
            '관계 «{{path}}»를 건너뛰었습니다. 소유 열이 기본 키의 일부입니다.',
        unsupported_target_field:
            '관계 «{{path}}»를 건너뛰었습니다. 대상 필드가 고유한 Django 대상이 아닙니다.',
    },
    index_omitted: {
        unsupported_type:
            '인덱스 «{{path}}»가 생략되었습니다. 유형 «{{indexType}}»는 models.Index로 내보내지지 않습니다.',
        field_not_exported:
            '인덱스 «{{path}}»가 생략되었습니다. 참조 필드가 내보내지지 않았습니다.',
        unsafe_name:
            '인덱스 «{{path}}»가 생략되었습니다. 명시적 이름을 Django에서 안전하게 표현할 수 없습니다.',
    },
    index_name_adjusted: {
        unsafe_name:
            '인덱스 이름 «{{originalName}}»이 Django 명명 제약을 충족하도록 «{{allocatedName}}»(으)로 조정되었습니다.',
        name_collision:
            '중복된 Django 인덱스 이름을 피하기 위해 인덱스 이름 «{{originalName}}»이 «{{allocatedName}}»(으)로 조정되었습니다.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            '고유 제약 이름 «{{originalName}}»이 Django 명명 제약을 충족하도록 «{{allocatedName}}»(으)로 조정되었습니다.',
        name_collision:
            '중복된 Django 제약 이름을 피하기 위해 고유 제약 이름 «{{originalName}}»이 «{{allocatedName}}»(으)로 조정되었습니다.',
    },
    comment_omitted: {
        table: '«{{path}}»의 테이블 주석이 생략되었습니다. SQLite는 주석을 유지하지 않습니다.',
        column: '«{{path}}»의 열 주석이 생략되었습니다. SQLite는 주석을 유지하지 않습니다.',
    },
    check_omitted: {
        table: '«{{path}}»의 CHECK 제약이 생략되었습니다. 임의 SQL을 Django 6.1 표현식으로 변환할 수 없습니다.',
        column: '«{{path}}»의 CHECK가 생략되었습니다. 임의 SQL을 Django 6.1 표현식으로 변환할 수 없습니다.',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}» 필드의 SET는 문자 필드로 내보냅니다. 네이티브 SET 유형은 생성되지 않습니다.',
    },
    enum_degraded: {
        enum_as_text:
            '«{{path}}» 필드의 enum은 문자 필드로 내보냅니다. Django TextChoices는 생성되지 않습니다.',
    },
    type_omitted: {
        array: '«{{path}}»의 배열 필드는 Django 내보내기에서 생략되었습니다.',
        spatial: '«{{path}}»의 공간 필드는 Django 내보내기에서 생략되었습니다.',
        tsvector:
            '«{{path}}»의 tsvector 필드는 Django 내보내기에서 생략되었습니다.',
        xml: '«{{path}}»의 XML 필드는 Django 내보내기에서 생략되었습니다.',
        unsupported:
            '«{{path}}» 필드가 생략되었습니다. 유형을 표현할 수 없습니다.',
        unimplemented_database:
            '데이터베이스 유형 «{{databaseType}}»에 대한 유형 매핑이 구현되지 않았습니다.',
        decimal_precision_required:
            '«{{path}}»의 decimal 필드가 생략되었습니다. MySQL/MariaDB DecimalField에는 max_digits와 decimal_places가 필요합니다.',
    },
    type_degraded: {
        varchar_without_max_length:
            '«{{path}}» 필드의 문자 유형은 max_length가 없어 {{mappedField}}(으)로 내보냅니다.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}»의 기본값이 생략되었습니다(지원되지 않는 기본값 유형).',
        current_timestamp_non_datetime:
            '«{{path}}»의 기본값이 생략되었습니다(datetime이 아닌 필드의 CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '«{{path}}»의 기본값이 생략되었습니다(PostgreSQL이 아닌 UUID 필드의 UUID 함수).',
        sql_expression:
            '«{{path}}»의 기본값이 생략되었습니다(지원되지 않는 SQL 표현식: {{expression}}).',
        unclear:
            '«{{path}}»의 기본값이 생략되었습니다(불명확한 기본값: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}»의 기본값이 생략되었습니다(boolean이 아닌 필드의 boolean 기본값).',
        numeric_on_non_numeric:
            '«{{path}}»의 기본값이 생략되었습니다(숫자가 아닌 필드의 숫자 기본값).',
    },
};
