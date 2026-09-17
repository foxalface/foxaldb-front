import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: '已跳过视图「{{path}}」。',
    keyless_table_skipped:
        '已跳过表“{{path}}”，因为在不编造主键的情况下无法将其安全地表示为仅数据库 SQL。',
    keyless_table_sql_created:
        '物理表“{{path}}”通过仅数据库 SQL 创建，因为 Django 无法在不改变架构的情况下为无主键的表建模。',
    keyless_model_omitted:
        '未为“{{path}}”生成 Django ORM 模型，因为 Django 需要主键。',
    schema_ignored_sqlite:
        'SQLite 不使用 schema「{{schema}}」；表「{{path}}」将以无 schema 限定符的方式导出。',
    mysql_catalog_omitted:
        '已省略 MySQL catalog「{{catalog}}」；Django 使用连接的数据库及未限定的表名。',
    mysql_multiple_catalogs_ignored:
        'MySQL 导出省略 {{count}} 个 catalog 并输出未限定的表名，因为物理名称仍然唯一。',
    mariadb_catalog_omitted:
        '已省略 MariaDB catalog「{{catalog}}」；Django 使用连接的数据库及未限定的表名。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 导出省略 {{count}} 个 catalog 并输出未限定的表名，因为物理名称仍然唯一。',
    postgres_schema_qualified_db_table:
        'PostgreSQL 表「{{path}}」以 schema「{{schema}}」限定的 db_table 导出。',
    composite_fk_unsupported: '复合外键「{{path}}」未导出；成员列仍为标量。',
    many_to_many_skipped:
        '已跳过多对多关系「{{path}}」；不会仅凭标签生成连接表。',
    one_to_one_degraded_non_unique_fk:
        '「{{path}}」上的一对一关系以外键不唯一而导出为 ForeignKey。',
    model_name_adjusted: '表「{{path}}」的模型类已分配为 {{className}}。',
    model_name_collision:
        '表「{{path}}」的模型类 {{className}} 已分配以避免重复的类名。',
    field_name_adjusted:
        '字段「{{path}}」导出为 Python 属性 {{attributeName}}，db_column 为「{{dbColumn}}」。',
    related_name_adjusted:
        '「{{path}}」上的 related_name 已分配为 {{relatedName}} 以避免反向访问器冲突。',
    composite_primary_key:
        '表「{{path}}」使用属性 {{attributes}} 以 Django 6.1 CompositePrimaryKey 导出。',
    on_update_omitted:
        '「{{path}}」上的 ON UPDATE「{{action}}」已省略；ForeignKey 没有数据库 ON UPDATE 等价项。',
    on_delete_restrict_degraded:
        '「{{path}}」上的 ON DELETE RESTRICT 导出为 models.DO_NOTHING；不使用 Django RESTRICT/PROTECT 收集器语义。',
    set_null_omitted: {
        delete: '「{{path}}」上的 ON DELETE SET NULL 已省略，因为外键不可为空；使用 models.DO_NOTHING。',
    },
    many_to_many_through_skipped: {
        extra_columns:
            '连接表「{{path}}」存在额外数据列，未生成便捷的 ManyToManyField。',
        ambiguous:
            '连接表「{{path}}」的端点模型不明确，未生成便捷的 ManyToManyField。',
    },
    relationship_skipped: {
        table_not_exported: '已跳过关系「{{path}}」，因为某个表未导出。',
        field_not_exported: '已跳过关系「{{path}}」，因为某个引用字段未导出。',
        already_relational: '已跳过关系「{{path}}」，因为所属字段已是关系。',
        primary_key_fk: '已跳过关系「{{path}}」，因为所属列是主键的一部分。',
        unsupported_target_field:
            '已跳过关系「{{path}}」，因为目标字段不是唯一的 Django 目标。',
        keyless_target:
            '已跳过关系“{{path}}”，因为它指向没有 Django 模型的无键表。',
    },
    index_omitted: {
        unsupported_type:
            '索引「{{path}}」已省略，因为类型「{{indexType}}」不会作为 models.Index 导出。',
        field_not_exported: '索引「{{path}}」已省略，因为某个引用字段未导出。',
        unsafe_name:
            '索引「{{path}}」已省略，因为其显式名称无法在 Django 中安全表示。',
    },
    index_name_adjusted: {
        unsafe_name:
            '索引名「{{originalName}}」已调整为「{{allocatedName}}」，以满足 Django 命名约束。',
        name_collision:
            '索引名「{{originalName}}」已调整为「{{allocatedName}}」，以避免重复的 Django 索引名。',
    },
    constraint_name_adjusted: {
        unsafe_name:
            '唯一约束名「{{originalName}}」已调整为「{{allocatedName}}」，以满足 Django 命名约束。',
        name_collision:
            '唯一约束名「{{originalName}}」已调整为「{{allocatedName}}」，以避免重复的 Django 约束名。',
    },
    comment_omitted: {
        table: '表「{{path}}」上的表注释已省略，因为 SQLite 不持久化注释。',
        column: '列「{{path}}」上的列注释已省略，因为 SQLite 不持久化注释。',
    },
    check_omitted: {
        table: '「{{path}}」上的 CHECK 约束已省略，因为任意 SQL 无法转换为 Django 6.1 表达式。',
        column: '「{{path}}」上的 CHECK 已省略，因为任意 SQL 无法转换为 Django 6.1 表达式。',
    },
    set_degraded: {
        set_as_text:
            '字段「{{path}}」上的 SET 导出为字符字段；不会生成原生 SET 类型。',
    },
    enum_degraded: {
        enum_as_text:
            '字段「{{path}}」上的 enum 导出为字符字段；不会生成 Django TextChoices。',
    },
    type_omitted: {
        array: '字段「{{path}}」上的数组字段已从 Django 导出中省略。',
        spatial: '字段「{{path}}」上的空间字段已从 Django 导出中省略。',
        tsvector: '字段「{{path}}」上的 tsvector 字段已从 Django 导出中省略。',
        xml: '字段「{{path}}」上的 XML 字段已从 Django 导出中省略。',
        unsupported: '字段「{{path}}」已省略，因为其类型无法表示。',
        unimplemented_database:
            '数据库类型「{{databaseType}}」的类型映射尚未实现。',
        decimal_precision_required:
            '字段「{{path}}」上的 decimal 字段已省略，因为 MySQL/MariaDB DecimalField 需要 max_digits 和 decimal_places。',
    },
    type_degraded: {
        varchar_without_max_length:
            '字段「{{path}}」的字符类型因缺少 max_length 而导出为 {{mappedField}}。',
    },
    default_omitted: {
        unsupported_type:
            '「{{path}}」上的默认值已省略（不支持的默认值类型）。',
        current_timestamp_non_datetime:
            '「{{path}}」上的默认值已省略（非 datetime 字段上的 CURRENT_TIMESTAMP）。',
        uuid_function_non_pg:
            '「{{path}}」上的默认值已省略（非 PostgreSQL UUID 字段上的 UUID 函数）。',
        sql_expression:
            '「{{path}}」上的默认值已省略（不支持的 SQL 表达式：{{expression}}）。',
        unclear:
            '「{{path}}」上的默认值已省略（不明确的默认值：{{expression}}）。',
        boolean_on_non_boolean:
            '「{{path}}」上的默认值已省略（非布尔字段上的布尔默认值）。',
        numeric_on_non_numeric:
            '「{{path}}」上的默认值已省略（非数值字段上的数值默认值）。',
    },
};
