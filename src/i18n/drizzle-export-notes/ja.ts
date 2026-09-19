import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'ビュー「{{path}}」をスキップしました。',
    keyless_table_skipped:
        '安全に表現できる列がないため、テーブル「{{path}}」をスキップしました。',
    keyless_table:
        'テーブル「{{path}}」には主キーがなく、id を捏造せずにネイティブな Drizzle テーブルとしてエクスポートされます。',
    schema_ignored_sqlite:
        'SQLite は schema「{{schema}}」を使用しません。テーブル「{{path}}」は schema 修飾子なしでエクスポートされます。',
    mysql_catalog_omitted:
        'MySQL catalog「{{catalog}}」は省略されます。Drizzle は修飾なしのテーブル名と単一のデータベース接続を使用します。',
    mysql_multiple_catalogs_ignored:
        'MySQL エクスポートでは {{count}} 件の catalog を省略し、物理名が一意のため修飾なしのテーブル名を出力します。',
    mariadb_catalog_omitted:
        'MariaDB catalog「{{catalog}}」は省略されます。Drizzle は修飾なしのテーブル名と単一のデータベース接続を使用します。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB エクスポートでは {{count}} 件の catalog を省略し、物理名が一意のため修飾なしのテーブル名を出力します。',
    mariadb_mysql_dialect_adapted:
        'MariaDB は Drizzle の MySQL API でエクスポートされます（dialect「{{dialect}}」）。Drizzle 0.45 には第一級の MariaDB dialect がありません。',
    postgres_schema_qualified:
        'PostgreSQL schema「{{schema}}」は pgSchema() でエクスポートされます。',
    uuid_as_text:
        'フィールド「{{path}}」の UUID は、このデータベースに Drizzle 0.45 のネイティブ UUID 型がないため text としてエクスポートされます。',
    increment_omitted:
        '「{{path}}」のオートインクリメントは、安全に表現できないため省略されました。',
    set_null_omitted:
        '外部キー列が NOT NULL のため、「{{path}}」で ON DELETE SET NULL を省略しました。',
    sqlite_boolean_integer:
        'フィールド「{{path}}」の boolean は、SQLite にネイティブ boolean 型がないため integer({ mode: "boolean" }) としてエクスポートされます。',
    sqlite_json_text:
        'フィールド「{{path}}」の JSON は、SQLite が JSON を TEXT として保存するため text({ mode: "json" }) としてエクスポートされます。',
    table_name_adjusted: {
        table: 'テーブル「{{path}}」は TypeScript 定数 {{tsName}} としてエクスポートされます。物理テーブル名は保持されます。',
        pgEnum: 'PostgreSQL enum「{{path}}」は TypeScript 定数 {{tsName}} としてエクスポートされます。物理 enum 名は保持されます。',
        pgSchema:
            'PostgreSQL schema「{{path}}」は TypeScript 定数 {{tsName}} としてエクスポートされます。',
    },
    table_name_collision:
        '「{{path}}」のテーブル定数「{{tsName}}」は、重複する TypeScript 識別子を避けるために割り当てられました。',
    column_name_adjusted:
        'カラム「{{path}}」は TypeScript プロパティ {{tsName}} としてエクスポートされます。物理カラム名は保持されます。',
    relationship_skipped: {
        composite_fk_unresolved_members:
            '複合外部キー「{{path}}」は、ソースとターゲットの列リストが両方そろっていなかったためスキップされました。',
        composite_fk_arity_mismatch:
            '複合外部キー「{{path}}」は、ソースとターゲットの列数が異なるためスキップされました。',
        label_only:
            '多対多リレーションシップ「{{path}}」は、ラベルから物理的な結合テーブルを特定できないためスキップされました。',
        table_not_exported:
            'リレーションシップ「{{path}}」は、参照テーブルがエクスポートされなかったためスキップされました。',
        unresolved_member:
            'リレーションシップ「{{path}}」は、参照フィールドがエクスポートされなかったためスキップされました。',
    },
    index_omitted: {
        unsupported_method:
            'インデックス「{{path}}」は、タイプ「{{indexType}}」がエクスポートされないため省略されました。',
        field_not_exported:
            'インデックス「{{path}}」は、参照フィールドがエクスポートされなかったため省略されました。',
    },
    comment_omitted: {
        table: 'テーブル「{{path}}」のコメントは、Drizzle 0.45 にこのエクスポーターが使う構造化コメント API がないため省略されます。',
        column: 'カラム「{{path}}」のコメントは、Drizzle 0.45 にこのエクスポーターが使う構造化コメント API がないため省略されます。',
    },
    check_omitted: {
        table: '「{{path}}」の CHECK 制約は、生の SQL を生成 TypeScript に注入しないため省略されます。',
        column: '「{{path}}」の CHECK は、生の SQL を生成 TypeScript に注入しないため省略されます。',
    },
    set_degraded: {
        set_as_text:
            '「{{path}}」の SET フィールドは text としてエクスポートされます。ネイティブ SET 型は生成されません。',
    },
    enum_degraded: {
        ts_enum_only:
            'フィールド「{{path}}」の enum は text({ enum: [...] }) としてエクスポートされます。SQLite には物理的な enum 制約がありません。',
        unsupported_enum:
            'フィールド「{{path}}」の enum は、ネイティブな Drizzle enum として表現できないため text としてエクスポートされます。',
        unknown_values:
            'フィールド「{{path}}」の enum は、enum 値が欠けているため text としてエクスポートされます。',
    },
    type_omitted: {
        array: '「{{path}}」の配列フィールドは Drizzle エクスポートから省略されます。',
        unsupported:
            '「{{path}}」のフィールドは、タイプを表現できないため省略されました。',
        unimplemented_database:
            'データベースタイプ「{{databaseType}}」の型マッピングは実装されていません。',
    },
    type_degraded: {
        binary_as_bytea:
            'フィールド「{{path}}」のバイナリ型は bytea() としてエクスポートされます。',
    },
    default_omitted: {
        unsupported_type:
            '「{{path}}」のデフォルト値は省略されました（サポートされていないデフォルト型）。',
        current_timestamp_non_datetime:
            '「{{path}}」のデフォルト値は省略されました（非 datetime フィールドへの CURRENT_TIMESTAMP）。',
        sql_expression:
            '「{{path}}」のデフォルト値は省略されました（サポートされていない SQL 式: {{expression}}）。',
        unclear:
            '「{{path}}」のデフォルト値は省略されました（不明確なデフォルト: {{expression}}）。',
        boolean_on_non_boolean:
            '「{{path}}」のデフォルト値は省略されました（非 boolean フィールドへの boolean デフォルト）。',
        numeric_on_non_numeric:
            '「{{path}}」のデフォルト値は省略されました（非数値フィールドへの数値デフォルト）。',
    },
};
