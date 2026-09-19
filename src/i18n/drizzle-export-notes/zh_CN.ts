import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: '已跳过视图「{{path}}」。',
    keyless_table_skipped: '已跳过表「{{path}}」，因为它没有可安全表示的列。',
    keyless_table:
        '表「{{path}}」没有主键，将作为原生 Drizzle 表导出，而不会虚构 id。',
    schema_ignored_sqlite:
        'SQLite 不使用 schema「{{schema}}」；表「{{path}}」将以无 schema 限定符的方式导出。',
    mysql_catalog_omitted:
        '已省略 MySQL catalog「{{catalog}}」；Drizzle 使用未限定的表名和单一数据库连接。',
    mysql_multiple_catalogs_ignored:
        'MySQL 导出省略 {{count}} 个 catalog 并输出未限定的表名，因为物理名称仍然唯一。',
    mariadb_catalog_omitted:
        '已省略 MariaDB catalog「{{catalog}}」；Drizzle 使用未限定的表名和单一数据库连接。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 导出省略 {{count}} 个 catalog 并输出未限定的表名，因为物理名称仍然唯一。',
    mariadb_mysql_dialect_adapted:
        'MariaDB 使用 Drizzle 的 MySQL API 导出（dialect「{{dialect}}」）。Drizzle 0.45 没有一等的 MariaDB dialect。',
    postgres_schema_qualified:
        'PostgreSQL schema「{{schema}}」使用 pgSchema() 导出。',
    uuid_as_text:
        '字段「{{path}}」的 UUID 导出为 text，因为此数据库在 Drizzle 0.45 中没有原生 UUID 类型。',
    increment_omitted: '「{{path}}」上的自增已省略，因为它无法被安全表示。',
    set_null_omitted:
        '因外键列为 NOT NULL，已在「{{path}}」上省略 ON DELETE SET NULL。',
    sqlite_boolean_integer:
        '字段「{{path}}」的 boolean 导出为 integer({ mode: "boolean" })，因为 SQLite 没有原生 boolean 类型。',
    sqlite_json_text:
        '字段「{{path}}」的 JSON 导出为 text({ mode: "json" })，因为 SQLite 将 JSON 存储为 TEXT。',
    table_name_adjusted: {
        table: '表「{{path}}」导出为 TypeScript 常量 {{tsName}}。物理表名予以保留。',
        pgEnum: 'PostgreSQL enum「{{path}}」导出为 TypeScript 常量 {{tsName}}。物理 enum 名予以保留。',
        pgSchema:
            'PostgreSQL schema「{{path}}」导出为 TypeScript 常量 {{tsName}}。',
    },
    table_name_collision:
        '为避免重复的 TypeScript 标识符，已为「{{path}}」分配表常量「{{tsName}}」。',
    column_name_adjusted:
        '列「{{path}}」导出为 TypeScript 属性 {{tsName}}。物理列名予以保留。',
    relationship_skipped: {
        composite_fk_unresolved_members:
            '已跳过复合外键「{{path}}」，因为源列与目标列列表并未同时存在。',
        composite_fk_arity_mismatch:
            '已跳过复合外键「{{path}}」，因为源列与目标列数量不一致。',
        label_only:
            '已跳过多对多关系「{{path}}」，因为无法从标签识别物理连接表。',
        table_not_exported: '已跳过关系「{{path}}」，因为被引用的表未被导出。',
        unresolved_member: '已跳过关系「{{path}}」，因为被引用的字段未被导出。',
    },
    index_omitted: {
        unsupported_method:
            '已省略索引「{{path}}」，因为类型「{{indexType}}」不会被导出。',
        field_not_exported:
            '已省略索引「{{path}}」，因为被引用的字段未被导出。',
    },
    comment_omitted: {
        table: '表「{{path}}」的注释已省略，因为 Drizzle 0.45 没有此导出器使用的结构化注释 API。',
        column: '列「{{path}}」的注释已省略，因为 Drizzle 0.45 没有此导出器使用的结构化注释 API。',
    },
    check_omitted: {
        table: '「{{path}}」上的 CHECK 约束已省略，因为不会将原始 SQL 注入生成的 TypeScript。',
        column: '「{{path}}」上的 CHECK 已省略，因为不会将原始 SQL 注入生成的 TypeScript。',
    },
    set_degraded: {
        set_as_text:
            '字段「{{path}}」的 SET 导出为 text；不会生成原生 SET 类型。',
    },
    enum_degraded: {
        ts_enum_only:
            '字段「{{path}}」的 enum 导出为 text({ enum: [...] })；SQLite 没有物理 enum 约束。',
        unsupported_enum:
            '字段「{{path}}」的 enum 导出为 text，因为它无法表示为原生 Drizzle enum。',
        unknown_values:
            '字段「{{path}}」的 enum 导出为 text，因为缺少 enum 值。',
    },
    type_omitted: {
        array: '「{{path}}」上的数组字段已从 Drizzle 导出中省略。',
        unsupported: '「{{path}}」上的字段已省略，因为其类型无法表示。',
        unimplemented_database:
            '尚未实现数据库类型「{{databaseType}}」的类型映射。',
    },
    type_degraded: {
        binary_as_bytea: '字段「{{path}}」的二进制类型导出为 bytea()。',
    },
    default_omitted: {
        unsupported_type:
            '「{{path}}」上的默认值已省略（不支持的默认值类型）。',
        current_timestamp_non_datetime:
            '「{{path}}」上的默认值已省略（非 datetime 字段上的 CURRENT_TIMESTAMP）。',
        sql_expression:
            '「{{path}}」上的默认值已省略（不支持的 SQL 表达式：{{expression}}）。',
        unclear:
            '「{{path}}」上的默认值已省略（不明确的默认值：{{expression}}）。',
        boolean_on_non_boolean:
            '「{{path}}」上的默认值已省略（非 boolean 字段上的 boolean 默认值）。',
        numeric_on_non_numeric:
            '「{{path}}」上的默认值已省略（非数值字段上的数值默认值）。',
    },
};
