import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: '已跳过视图「{{path}}」。',
    schema_ignored_sqlite:
        'SQLite 不使用 schema「{{schema}}」；表「{{path}}」将不带 schema 限定符导出。',
    mysql_catalog_omitted:
        '已省略 MySQL catalog「{{catalog}}」；Rails 使用连接的数据库及未限定的表名。',
    mysql_multiple_catalogs_ignored:
        'MySQL 导出省略了 {{count}} 个 catalog，并输出未限定的表名，因为物理名称仍然唯一。',
    mariadb_catalog_omitted:
        '已省略 MariaDB catalog「{{catalog}}」；Rails 使用连接的数据库及未限定的表名。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 导出省略了 {{count}} 个 catalog，并输出未限定的表名，因为物理名称仍然唯一。',
    composite_fk_unsupported:
        '复合外键「{{path}}」未导出；Rails V1 仅输出安全的单列外键。',
    keyless_relationship_skipped:
        '关系「{{path}}」已跳过，因为主表无法支持外键语义。',
    many_to_many_skipped:
        '多对多关系「{{path}}」已跳过；无法从标签推断单一外键侧。',
    keyless_model:
        '表「{{path}}」没有主键。模型设置 self.primary_key = nil；Active Record 持久化可能受限。',
    one_to_one_degraded_non_unique_fk:
        '「{{path}}」上的一对一关系因外键不唯一，导出为 has_many。',
    many_to_many_through_skipped:
        '未为连接表「{{path}}」生成 has_many :through，因为关联名称存在歧义。',
    model_name_adjusted: '表「{{path}}」的模型类已分配为 {{className}}。',
    model_name_collision:
        '表「{{path}}」的模型类 {{className}} 已分配，以避免重复常量。',
    on_update_omitted:
        'ON UPDATE「{{action}}」在 Rails 8.1 schema.rb add_foreign_key 中未表示「{{path}}」。',
    set_null_omitted: {
        delete: '「{{path}}」上的 ON DELETE SET NULL 已省略，因为外键列不可为 null。',
        update: '「{{path}}」上的 ON UPDATE SET NULL 已省略，因为外键列不可为 null。',
    },
    association_name_adjusted: {
        belongs_to:
            '「{{path}}」上的 belongs_to 已分配为 {{associationName}}，以避免名称冲突。',
        inverse:
            '「{{path}}」上的反向关联已分配为 {{associationName}}，以避免名称冲突。',
    },
    relationship_skipped: {
        table_not_exported: '关系「{{path}}」已跳过，因为有表未导出。',
        unresolved_field_ids:
            '关系「{{path}}」已跳过，因为无法解析外键字段 ID。',
        referenced_column_not_exported:
            '关系「{{path}}」已跳过，因为有被引用的列未导出。',
    },
    index_omitted: {
        unsupported_type:
            '索引「{{path}}」已省略，因为类型「{{indexType}}」不在 Rails schema.rb 中导出。',
        missing_field: '索引「{{path}}」已省略，因为有被引用的字段缺失。',
        field_not_exported:
            '索引「{{path}}」已省略，因为有被引用的字段未导出。',
    },
    comment_omitted: {
        table: '表「{{path}}」上的注释已省略，因为 SQLite 不持久化注释。',
        column: '列「{{path}}」上的注释已省略，因为 SQLite 不持久化注释。',
    },
    check_omitted: {
        table: '「{{path}}」上的空 CHECK 约束已省略。',
        column: '「{{path}}」上的空 CHECK 已省略。',
    },
    set_degraded: {
        sqlite_as_string: '「{{path}}」上的 SET 字段导出为 SQLite 的 string。',
        mysql_family_as_string:
            '「{{path}}」上的 SET 字段导出为 string；未输出原生 SET DSL。',
    },
    enum_degraded: {
        sqlite_as_string: '「{{path}}」上的 enum 字段导出为 SQLite 的 string。',
        pg_type_values_missing:
            'PostgreSQL enum「{{path}}」未声明，因为缺少规范值。',
        pg_field_values_missing:
            '字段「{{path}}」的 PostgreSQL enum 导出为 string，因为缺少规范 enum 值。',
        pg_field_named_values_missing:
            '字段「{{path}}」的 PostgreSQL enum「{{enumName}}」导出为 string，因为缺少 enum 值。',
        mysql_family_as_string:
            '「{{path}}」上的 enum 字段导出为 string；未输出原生 enum/set DSL。',
    },
    type_omitted: {
        array: '「{{path}}」上的数组字段未在 Rails schema.rb 中表示。',
        spatial: '「{{path}}」上的空间字段未在 Rails schema.rb 中表示。',
        unsupported: '「{{path}}」上的字段已省略，因为其类型无法表示。',
        unimplemented_database:
            '数据库类型「{{databaseType}}」的类型映射尚未实现。',
    },
    type_degraded: {
        serial_no_sequence:
            '「{{path}}」上的非主键 serial 字段导出为无序列的普通 integer。',
        jsonb_as_json: '字段「{{path}}」的 jsonb 导出为 json。',
        uuid_as_string: '字段「{{path}}」的 uuid 导出为 string(36)。',
        null_as_text: '字段「{{path}}」的 null 存储类导出为 text。',
        money_as_decimal: '字段「{{path}}」的 money 导出为 decimal。',
        year_as_integer: '字段「{{path}}」的 year 导出为 integer。',
        bit_as_boolean: '字段「{{path}}」的 bit 导出为 boolean。',
        type_as_string:
            '字段「{{path}}」的类型「{{sourceType}}」导出为 {{mappedHelper}}。',
    },
    default_omitted: {
        lambda_expression:
            '「{{path}}」上的默认值已省略（类 lambda 的 SQL 表达式：{{expression}}）。',
        sql_expression:
            '「{{path}}」上的默认值已省略（不支持的 SQL 表达式：{{expression}}）。',
        unclear:
            '「{{path}}」上的默认值已省略（不明确的默认值：{{expression}}）。',
        current_timestamp_non_datetime:
            '「{{path}}」上的默认值已省略（非 datetime 字段上的 CURRENT_TIMESTAMP）。',
        uuid_function_non_pg:
            '「{{path}}」上的默认值已省略（非 PostgreSQL UUID 字段上的 UUID 函数默认值）。',
        boolean_on_non_boolean:
            '「{{path}}」上的默认值已省略（非 boolean 字段上的 boolean 默认值）。',
        numeric_on_non_numeric:
            '「{{path}}」上的默认值已省略（非数值字段上的数值默认值）。',
        unsupported_type:
            '「{{path}}」上的默认值已省略（不支持的默认值类型）。',
    },
};
