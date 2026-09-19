import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: '已略過檢視「{{path}}」。',
    keyless_table_skipped:
        '已略過資料表「{{path}}」，因為它沒有可安全表示的欄位。',
    keyless_table:
        '資料表「{{path}}」沒有主鍵，會以原生 Drizzle 資料表匯出，而不會虛構 id。',
    schema_ignored_sqlite:
        'SQLite 不使用 schema「{{schema}}」；資料表「{{path}}」將以無 schema 限定詞的方式匯出。',
    mysql_catalog_omitted:
        '已省略 MySQL catalog「{{catalog}}」；Drizzle 使用未限定的資料表名稱與單一資料庫連線。',
    mysql_multiple_catalogs_ignored:
        'MySQL 匯出省略 {{count}} 個 catalog 並輸出未限定的資料表名稱，因為實體名稱仍然唯一。',
    mariadb_catalog_omitted:
        '已省略 MariaDB catalog「{{catalog}}」；Drizzle 使用未限定的資料表名稱與單一資料庫連線。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 匯出省略 {{count}} 個 catalog 並輸出未限定的資料表名稱，因為實體名稱仍然唯一。',
    mariadb_mysql_dialect_adapted:
        'MariaDB 使用 Drizzle 的 MySQL API 匯出（dialect「{{dialect}}」）。Drizzle 0.45 沒有一等的 MariaDB dialect。',
    postgres_schema_qualified:
        'PostgreSQL schema「{{schema}}」使用 pgSchema() 匯出。',
    uuid_as_text:
        '欄位「{{path}}」的 UUID 匯出為 text，因為此資料庫在 Drizzle 0.45 中沒有原生 UUID 類型。',
    increment_omitted: '「{{path}}」上的自動遞增已省略，因為無法安全表示。',
    set_null_omitted:
        '因外鍵欄位為 NOT NULL，已在「{{path}}」上省略 ON DELETE SET NULL。',
    sqlite_boolean_integer:
        '欄位「{{path}}」的 boolean 匯出為 integer({ mode: "boolean" })，因為 SQLite 沒有原生 boolean 類型。',
    sqlite_json_text:
        '欄位「{{path}}」的 JSON 匯出為 text({ mode: "json" })，因為 SQLite 將 JSON 儲存為 TEXT。',
    table_name_adjusted: {
        table: '資料表「{{path}}」匯出為 TypeScript 常數 {{tsName}}。實體資料表名稱予以保留。',
        pgEnum: 'PostgreSQL enum「{{path}}」匯出為 TypeScript 常數 {{tsName}}。實體 enum 名稱予以保留。',
        pgSchema:
            'PostgreSQL schema「{{path}}」匯出為 TypeScript 常數 {{tsName}}。',
    },
    table_name_collision:
        '為避免重複的 TypeScript 識別碼，已為「{{path}}」分配資料表常數「{{tsName}}」。',
    column_name_adjusted:
        '欄位「{{path}}」匯出為 TypeScript 屬性 {{tsName}}。實體欄位名稱予以保留。',
    relationship_skipped: {
        composite_fk_unresolved_members:
            '已略過複合外鍵「{{path}}」，因為來源與目標欄位清單並未同時存在。',
        composite_fk_arity_mismatch:
            '已略過複合外鍵「{{path}}」，因為來源與目標欄位數量不一致。',
        label_only:
            '已略過多對多關係「{{path}}」，因為無法從標籤識別實體聯結表。',
        table_not_exported:
            '已略過關係「{{path}}」，因為被參照的資料表未被匯出。',
        unresolved_member: '已略過關係「{{path}}」，因為被參照的欄位未被匯出。',
    },
    index_omitted: {
        unsupported_method:
            '已省略索引「{{path}}」，因為類型「{{indexType}}」不會被匯出。',
        field_not_exported:
            '已省略索引「{{path}}」，因為被參照的欄位未被匯出。',
    },
    comment_omitted: {
        table: '資料表「{{path}}」的註解已省略，因為 Drizzle 0.45 沒有此匯出器使用的結構化註解 API。',
        column: '欄位「{{path}}」的註解已省略，因為 Drizzle 0.45 沒有此匯出器使用的結構化註解 API。',
    },
    check_omitted: {
        table: '「{{path}}」上的 CHECK 約束已省略，因為不會將原始 SQL 注入產生的 TypeScript。',
        column: '「{{path}}」上的 CHECK 已省略，因為不會將原始 SQL 注入產生的 TypeScript。',
    },
    set_degraded: {
        set_as_text:
            '欄位「{{path}}」的 SET 匯出為 text；不會產生原生 SET 類型。',
    },
    enum_degraded: {
        ts_enum_only:
            '欄位「{{path}}」的 enum 匯出為 text({ enum: [...] })；SQLite 沒有實體 enum 約束。',
        unsupported_enum:
            '欄位「{{path}}」的 enum 匯出為 text，因為無法表示為原生 Drizzle enum。',
        unknown_values:
            '欄位「{{path}}」的 enum 匯出為 text，因為缺少 enum 值。',
    },
    type_omitted: {
        array: '「{{path}}」上的陣列欄位已從 Drizzle 匯出中省略。',
        unsupported: '「{{path}}」上的欄位已省略，因為其類型無法表示。',
        unimplemented_database:
            '尚未實作資料庫類型「{{databaseType}}」的類型對應。',
    },
    type_degraded: {
        binary_as_bytea: '欄位「{{path}}」的二進位類型匯出為 bytea()。',
    },
    default_omitted: {
        unsupported_type:
            '「{{path}}」上的預設值已省略（不支援的預設值類型）。',
        current_timestamp_non_datetime:
            '「{{path}}」上的預設值已省略（非 datetime 欄位上的 CURRENT_TIMESTAMP）。',
        sql_expression:
            '「{{path}}」上的預設值已省略（不支援的 SQL 運算式：{{expression}}）。',
        unclear:
            '「{{path}}」上的預設值已省略（不明確的預設值：{{expression}}）。',
        boolean_on_non_boolean:
            '「{{path}}」上的預設值已省略（非 boolean 欄位上的 boolean 預設值）。',
        numeric_on_non_numeric:
            '「{{path}}」上的預設值已省略（非數值欄位上的數值預設值）。',
    },
};
