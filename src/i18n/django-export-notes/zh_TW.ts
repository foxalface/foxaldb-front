import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: '已略過檢視「{{path}}」。',
    keyless_table_skipped:
        '已略過資料表「{{path}}」，因為 Django V1 不會產生替代主鍵。',
    schema_ignored_sqlite:
        'SQLite 不使用 schema「{{schema}}」；資料表「{{path}}」將以無 schema 限定詞的方式匯出。',
    mysql_catalog_omitted:
        '已省略 MySQL catalog「{{catalog}}」；Django 使用連線的資料庫及未限定的資料表名稱。',
    mysql_multiple_catalogs_ignored:
        'MySQL 匯出省略 {{count}} 個 catalog 並輸出未限定的資料表名稱，因為實體名稱仍然唯一。',
    mariadb_catalog_omitted:
        '已省略 MariaDB catalog「{{catalog}}」；Django 使用連線的資料庫及未限定的資料表名稱。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB 匯出省略 {{count}} 個 catalog 並輸出未限定的資料表名稱，因為實體名稱仍然唯一。',
    postgres_schema_qualified_db_table:
        'PostgreSQL 資料表「{{path}}」以 schema「{{schema}}」限定的 db_table 匯出。',
    composite_fk_unsupported: '複合外鍵「{{path}}」未匯出；成員欄位仍為純量。',
    many_to_many_skipped:
        '已略過多對多關係「{{path}}」；不會僅憑標籤產生聯結表。',
    one_to_one_degraded_non_unique_fk:
        '「{{path}}」上的一對一關係因外鍵不唯一而匯出為 ForeignKey。',
    model_name_adjusted: '資料表「{{path}}」的模型類別已分配為 {{className}}。',
    model_name_collision:
        '資料表「{{path}}」的模型類別 {{className}} 已分配以避免重複的類別名稱。',
    field_name_adjusted:
        '欄位「{{path}}」匯出為 Python 屬性 {{attributeName}}，db_column 為「{{dbColumn}}」。',
    related_name_adjusted:
        '「{{path}}」上的 related_name 已分配為 {{relatedName}} 以避免反向存取器衝突。',
    composite_primary_key:
        '資料表「{{path}}」使用屬性 {{attributes}} 以 Django 6.1 CompositePrimaryKey 匯出。',
    on_update_omitted:
        '「{{path}}」上的 ON UPDATE「{{action}}」已省略；ForeignKey 沒有資料庫 ON UPDATE 對等項。',
    on_delete_restrict_degraded:
        '「{{path}}」上的 ON DELETE RESTRICT 匯出為 models.DO_NOTHING；不使用 Django RESTRICT/PROTECT 收集器語意。',
    set_null_omitted: {
        delete: '「{{path}}」上的 ON DELETE SET NULL 已省略，因為外鍵不可為空；使用 models.DO_NOTHING。',
    },
    many_to_many_through_skipped: {
        extra_columns:
            '聯結表「{{path}}」存在額外資料欄，未產生便捷的 ManyToManyField。',
        ambiguous:
            '聯結表「{{path}}」的端點模型不明確，未產生便捷的 ManyToManyField。',
    },
    relationship_skipped: {
        table_not_exported: '已略過關係「{{path}}」，因為某個資料表未匯出。',
        field_not_exported: '已略過關係「{{path}}」，因為某個參考欄位未匯出。',
        already_relational: '已略過關係「{{path}}」，因為所屬欄位已是關係。',
        primary_key_fk: '已略過關係「{{path}}」，因為所屬欄位是主鍵的一部分。',
        unsupported_target_field:
            '已略過關係「{{path}}」，因為目標欄位不是唯一的 Django 目標。',
    },
    index_omitted: {
        unsupported_type:
            '索引「{{path}}」已省略，因為類型「{{indexType}}」不會作為 models.Index 匯出。',
        field_not_exported: '索引「{{path}}」已省略，因為某個參考欄位未匯出。',
        unsafe_name:
            '索引「{{path}}」已省略，因為其明確名稱無法在 Django 中安全表示。',
    },
    index_name_adjusted: {
        unsafe_name:
            '索引名稱「{{originalName}}」已調整為「{{allocatedName}}」，以符合 Django 命名限制。',
        name_collision:
            '索引名稱「{{originalName}}」已調整為「{{allocatedName}}」，以避免重複的 Django 索引名稱。',
    },
    constraint_name_adjusted: {
        unsafe_name:
            '唯一約束名稱「{{originalName}}」已調整為「{{allocatedName}}」，以符合 Django 命名限制。',
        name_collision:
            '唯一約束名稱「{{originalName}}」已調整為「{{allocatedName}}」，以避免重複的 Django 約束名稱。',
    },
    comment_omitted: {
        table: '資料表「{{path}}」上的資料表註解已省略，因為 SQLite 不持久化註解。',
        column: '欄位「{{path}}」上的欄位註解已省略，因為 SQLite 不持久化註解。',
    },
    check_omitted: {
        table: '「{{path}}」上的 CHECK 約束已省略，因為任意 SQL 無法轉換為 Django 6.1 運算式。',
        column: '「{{path}}」上的 CHECK 已省略，因為任意 SQL 無法轉換為 Django 6.1 運算式。',
    },
    set_degraded: {
        set_as_text:
            '欄位「{{path}}」上的 SET 匯出為字元欄位；不會產生原生 SET 類型。',
    },
    enum_degraded: {
        enum_as_text:
            '欄位「{{path}}」上的 enum 匯出為字元欄位；不會產生 Django TextChoices。',
    },
    type_omitted: {
        array: '欄位「{{path}}」上的陣列欄位已從 Django 匯出中省略。',
        spatial: '欄位「{{path}}」上的空間欄位已從 Django 匯出中省略。',
        tsvector: '欄位「{{path}}」上的 tsvector 欄位已從 Django 匯出中省略。',
        xml: '欄位「{{path}}」上的 XML 欄位已從 Django 匯出中省略。',
        unsupported: '欄位「{{path}}」已省略，因為其類型無法表示。',
        unimplemented_database:
            '資料庫類型「{{databaseType}}」的類型對應尚未實作。',
        decimal_precision_required:
            '欄位「{{path}}」上的 decimal 欄位已省略，因為 MySQL/MariaDB DecimalField 需要 max_digits 和 decimal_places。',
    },
    type_degraded: {
        varchar_without_max_length:
            '欄位「{{path}}」的字元類型因缺少 max_length 而匯出為 {{mappedField}}。',
    },
    default_omitted: {
        unsupported_type:
            '「{{path}}」上的預設值已省略（不支援的預設值類型）。',
        current_timestamp_non_datetime:
            '「{{path}}」上的預設值已省略（非 datetime 欄位上的 CURRENT_TIMESTAMP）。',
        uuid_function_non_pg:
            '「{{path}}」上的預設值已省略（非 PostgreSQL UUID 欄位上的 UUID 函式）。',
        sql_expression:
            '「{{path}}」上的預設值已省略（不支援的 SQL 運算式：{{expression}}）。',
        unclear:
            '「{{path}}」上的預設值已省略（不明確的預設值：{{expression}}）。',
        boolean_on_non_boolean:
            '「{{path}}」上的預設值已省略（非布林欄位上的布林預設值）。',
        numeric_on_non_numeric:
            '「{{path}}」上的預設值已省略（非數值欄位上的數值預設值）。',
    },
};
