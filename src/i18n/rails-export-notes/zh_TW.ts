import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: '已略過檢視「{{path}}」。',
    schema_ignored_sqlite:
        'SQLite 不使用 schema「{{schema}}」；資料表「{{path}}」將不帶 schema 限定詞匯出。',
    mysql_catalog_omitted:
        '已省略 MySQL catalog「{{catalog}}」；Rails 使用連線的資料庫及未限定的資料表名稱。',
    mysql_multiple_catalogs_ignored:
        'MySQL 匯出省略了 {{count}} 個 catalog，並輸出未限定的資料表名稱，因為實體名稱仍然唯一。',
    mariadb_catalog_omitted:
        '已省略 MariaDB catalog「{{catalog}}」；Rails 使用連線的資料庫及未限定的資料表名稱。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 匯出省略了 {{count}} 個 catalog，並輸出未限定的資料表名稱，因為實體名稱仍然唯一。',
    composite_fk_unsupported:
        '複合外鍵「{{path}}」未匯出；Rails V1 僅輸出安全的單欄外鍵。',
    keyless_relationship_skipped:
        '關聯「{{path}}」已略過，因為主資料表無法支援外鍵語意。',
    many_to_many_skipped:
        '多對多關聯「{{path}}」已略過；無法從標籤推斷單一外鍵側。',
    keyless_model:
        '資料表「{{path}}」沒有主鍵。模型設定 self.primary_key = nil；Active Record 持久化可能受限。',
    one_to_one_degraded_non_unique_fk:
        '「{{path}}」上的一對一關聯因外鍵不唯一，匯出為 has_many。',
    many_to_many_through_skipped:
        '未為聯結資料表「{{path}}」產生 has_many :through，因為關聯名稱存在歧義。',
    model_name_adjusted: '資料表「{{path}}」的模型類別已分配為 {{className}}。',
    model_name_collision:
        '資料表「{{path}}」的模型類別 {{className}} 已分配，以避免重複常數。',
    on_update_omitted:
        'ON UPDATE「{{action}}」在 Rails 8.1 schema.rb add_foreign_key 中未表示「{{path}}」。',
    set_null_omitted: {
        delete: '「{{path}}」上的 ON DELETE SET NULL 已省略，因為外鍵欄位不可為 null。',
        update: '「{{path}}」上的 ON UPDATE SET NULL 已省略，因為外鍵欄位不可為 null。',
    },
    association_name_adjusted: {
        belongs_to:
            '「{{path}}」上的 belongs_to 已分配為 {{associationName}}，以避免名稱衝突。',
        inverse:
            '「{{path}}」上的反向關聯已分配為 {{associationName}}，以避免名稱衝突。',
    },
    relationship_skipped: {
        table_not_exported: '關聯「{{path}}」已略過，因為有資料表未匯出。',
        unresolved_field_ids:
            '關聯「{{path}}」已略過，因為無法解析外鍵欄位 ID。',
        referenced_column_not_exported:
            '關聯「{{path}}」已略過，因為有被參考的欄位未匯出。',
    },
    index_omitted: {
        unsupported_type:
            '索引「{{path}}」已省略，因為類型「{{indexType}}」不在 Rails schema.rb 中匯出。',
        missing_field: '索引「{{path}}」已省略，因為有被參考的欄位缺失。',
        field_not_exported:
            '索引「{{path}}」已省略，因為有被參考的欄位未匯出。',
    },
    comment_omitted: {
        table: '資料表「{{path}}」上的註解已省略，因為 SQLite 不持久化註解。',
        column: '欄位「{{path}}」上的註解已省略，因為 SQLite 不持久化註解。',
    },
    check_omitted: {
        table: '「{{path}}」上的空 CHECK 約束已省略。',
        column: '「{{path}}」上的空 CHECK 已省略。',
    },
    set_degraded: {
        sqlite_as_string: '「{{path}}」上的 SET 欄位匯出為 SQLite 的 string。',
        mysql_family_as_string:
            '「{{path}}」上的 SET 欄位匯出為 string；未輸出原生 SET DSL。',
    },
    enum_degraded: {
        sqlite_as_string: '「{{path}}」上的 enum 欄位匯出為 SQLite 的 string。',
        pg_type_values_missing:
            'PostgreSQL enum「{{path}}」未宣告，因為缺少規範值。',
        pg_field_values_missing:
            '欄位「{{path}}」的 PostgreSQL enum 匯出為 string，因為缺少規範 enum 值。',
        pg_field_named_values_missing:
            '欄位「{{path}}」的 PostgreSQL enum「{{enumName}}」匯出為 string，因為缺少 enum 值。',
        mysql_family_as_string:
            '「{{path}}」上的 enum 欄位匯出為 string；未輸出原生 enum/set DSL。',
    },
    type_omitted: {
        array: '「{{path}}」上的陣列欄位未在 Rails schema.rb 中表示。',
        spatial: '「{{path}}」上的空間欄位未在 Rails schema.rb 中表示。',
        unsupported: '「{{path}}」上的欄位已省略，因為其類型無法表示。',
        unimplemented_database:
            '資料庫類型「{{databaseType}}」的類型對應尚未實作。',
    },
    type_degraded: {
        serial_no_sequence:
            '「{{path}}」上的非主鍵 serial 欄位匯出為無序列的普通 integer。',
        jsonb_as_json: '欄位「{{path}}」的 jsonb 匯出為 json。',
        uuid_as_string: '欄位「{{path}}」的 uuid 匯出為 string(36)。',
        null_as_text: '欄位「{{path}}」的 null 儲存類別匯出為 text。',
        money_as_decimal: '欄位「{{path}}」的 money 匯出為 decimal。',
        year_as_integer: '欄位「{{path}}」的 year 匯出為 integer。',
        bit_as_boolean: '欄位「{{path}}」的 bit 匯出為 boolean。',
        type_as_string:
            '欄位「{{path}}」的類型「{{sourceType}}」匯出為 {{mappedHelper}}。',
    },
    default_omitted: {
        lambda_expression:
            '「{{path}}」上的預設值已省略（類 lambda 的 SQL 運算式：{{expression}}）。',
        sql_expression:
            '「{{path}}」上的預設值已省略（不支援的 SQL 運算式：{{expression}}）。',
        unclear:
            '「{{path}}」上的預設值已省略（不明確的預設值：{{expression}}）。',
        current_timestamp_non_datetime:
            '「{{path}}」上的預設值已省略（非 datetime 欄位上的 CURRENT_TIMESTAMP）。',
        uuid_function_non_pg:
            '「{{path}}」上的預設值已省略（非 PostgreSQL UUID 欄位上的 UUID 函式預設值）。',
        boolean_on_non_boolean:
            '「{{path}}」上的預設值已省略（非 boolean 欄位上的 boolean 預設值）。',
        numeric_on_non_numeric:
            '「{{path}}」上的預設值已省略（非數值欄位上的數值預設值）。',
        unsupported_type:
            '「{{path}}」上的預設值已省略（不支援的預設值類型）。',
    },
};
