import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'ビュー「{{path}}」をスキップしました。',
    schema_ignored_sqlite:
        'SQLite では schema「{{schema}}」は使用されません。テーブル「{{path}}」は schema 修飾子なしでエクスポートされます。',
    mysql_catalog_omitted:
        'MySQL catalog「{{catalog}}」は省略されます。Rails は接続先データベースと修飾なしのテーブル名を使用します。',
    mysql_multiple_catalogs_ignored:
        'MySQL エクスポートでは {{count}} 件の catalog を省略し、物理名が一意のため修飾なしのテーブル名を出力します。',
    mariadb_catalog_omitted:
        'MariaDB catalog「{{catalog}}」は省略されます。Rails は接続先データベースと修飾なしのテーブル名を使用します。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB エクスポートでは {{count}} 件の catalog を省略し、物理名が一意のため修飾なしのテーブル名を出力します。',
    composite_fk_unsupported:
        '複合外部キー「{{path}}」はエクスポートされません。Rails V1 は安全な単一カラム外部キーのみを出力します。',
    keyless_relationship_skipped:
        'リレーションシップ「{{path}}」は、主テーブルが外部キーの意味論をサポートできないためスキップされました。',
    many_to_many_skipped:
        '多対多リレーションシップ「{{path}}」はスキップされました。ラベルから単一の外部キー側を推論できません。',
    keyless_model:
        'テーブル「{{path}}」に主キーがありません。モデルは self.primary_key = nil を設定します。Active Record の永続化は制限される場合があります。',
    one_to_one_degraded_non_unique_fk:
        '「{{path}}」の 1 対 1 リレーションシップは、外部キーが一意でないため has_many としてエクスポートされます。',
    many_to_many_through_skipped:
        '結合テーブル「{{path}}」に対して has_many :through は生成されませんでした。アソシエーション名が曖昧でした。',
    model_name_adjusted:
        'テーブル「{{path}}」のモデルクラスは {{className}} として割り当てられました。',
    model_name_collision:
        'テーブル「{{path}}」のモデルクラス {{className}} は、定数の重複を避けるために割り当てられました。',
    on_update_omitted:
        'ON UPDATE「{{action}}」は、Rails 8.1 の schema.rb add_foreign_key では「{{path}}」に対して表現されません。',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL は「{{path}}」で省略されました。外部キーカラムが nullable ではありません。',
        update: 'ON UPDATE SET NULL は「{{path}}」で省略されました。外部キーカラムが nullable ではありません。',
    },
    association_name_adjusted: {
        belongs_to:
            '「{{path}}」の belongs_to は、名前の衝突を避けるため {{associationName}} として割り当てられました。',
        inverse:
            '「{{path}}」の逆アソシエーションは、名前の衝突を避けるため {{associationName}} として割り当てられました。',
    },
    relationship_skipped: {
        table_not_exported:
            'リレーションシップ「{{path}}」は、テーブルがエクスポートされなかったためスキップされました。',
        unresolved_field_ids:
            'リレーションシップ「{{path}}」は、外部キーフィールド ID を解決できなかったためスキップされました。',
        referenced_column_not_exported:
            'リレーションシップ「{{path}}」は、参照先カラムがエクスポートされなかったためスキップされました。',
    },
    index_omitted: {
        unsupported_type:
            'インデックス「{{path}}」は、タイプ「{{indexType}}」が Rails schema.rb でエクスポートされないため省略されました。',
        missing_field:
            'インデックス「{{path}}」は、参照フィールドが欠落しているため省略されました。',
        field_not_exported:
            'インデックス「{{path}}」は、参照フィールドがエクスポートされなかったため省略されました。',
    },
    comment_omitted: {
        table: 'テーブル「{{path}}」のコメントは、SQLite がコメントを永続化しないため省略されます。',
        column: 'カラム「{{path}}」のコメントは、SQLite がコメントを永続化しないため省略されます。',
    },
    check_omitted: {
        table: '「{{path}}」の空の CHECK 制約は省略されました。',
        column: '「{{path}}」の空の CHECK は省略されました。',
    },
    set_degraded: {
        sqlite_as_string:
            '「{{path}}」の SET フィールドは SQLite 向けに string としてエクスポートされます。',
        mysql_family_as_string:
            '「{{path}}」の SET フィールドは string としてエクスポートされます。ネイティブ SET DSL は出力されません。',
    },
    enum_degraded: {
        sqlite_as_string:
            '「{{path}}」の enum フィールドは SQLite 向けに string としてエクスポートされます。',
        pg_type_values_missing:
            'PostgreSQL enum「{{path}}」は、正規の値が欠落しているため宣言されませんでした。',
        pg_field_values_missing:
            'フィールド「{{path}}」の PostgreSQL enum は、正規の enum 値が欠落しているため string としてエクスポートされました。',
        pg_field_named_values_missing:
            'フィールド「{{path}}」の PostgreSQL enum「{{enumName}}」は、enum 値が欠落しているため string としてエクスポートされました。',
        mysql_family_as_string:
            '「{{path}}」の enum フィールドは string としてエクスポートされます。ネイティブ enum/set DSL は出力されません。',
    },
    type_omitted: {
        array: '「{{path}}」の配列フィールドは Rails schema.rb では表現されません。',
        spatial:
            '「{{path}}」の空間フィールドは Rails schema.rb では表現されません。',
        unsupported:
            '「{{path}}」のフィールドは、タイプを表現できないため省略されました。',
        unimplemented_database:
            'データベースタイプ「{{databaseType}}」のタイプマッピングは実装されていません。',
    },
    type_degraded: {
        serial_no_sequence:
            '「{{path}}」の非主キー serial フィールドは、シーケンスなしの通常の integer としてエクスポートされます。',
        jsonb_as_json:
            'フィールド「{{path}}」の jsonb は json としてエクスポートされます。',
        uuid_as_string:
            'フィールド「{{path}}」の uuid は string(36) としてエクスポートされます。',
        null_as_text:
            'フィールド「{{path}}」の null ストレージクラスは text としてエクスポートされます。',
        money_as_decimal:
            'フィールド「{{path}}」の money は decimal としてエクスポートされます。',
        year_as_integer:
            'フィールド「{{path}}」の year は integer としてエクスポートされます。',
        bit_as_boolean:
            'フィールド「{{path}}」の bit は boolean としてエクスポートされます。',
        type_as_string:
            'フィールド「{{path}}」のタイプ「{{sourceType}}」は {{mappedHelper}} としてエクスポートされます。',
    },
    default_omitted: {
        lambda_expression:
            '「{{path}}」のデフォルト値は省略されました（lambda 形式の SQL 式: {{expression}}）。',
        sql_expression:
            '「{{path}}」のデフォルト値は省略されました（サポートされていない SQL 式: {{expression}}）。',
        unclear:
            '「{{path}}」のデフォルト値は省略されました（不明確なデフォルト: {{expression}}）。',
        current_timestamp_non_datetime:
            '「{{path}}」のデフォルト値は省略されました（非 datetime フィールドへの CURRENT_TIMESTAMP）。',
        uuid_function_non_pg:
            '「{{path}}」のデフォルト値は省略されました（非 PostgreSQL UUID フィールドへの UUID 関数デフォルト）。',
        boolean_on_non_boolean:
            '「{{path}}」のデフォルト値は省略されました（非 boolean フィールドへの boolean デフォルト）。',
        numeric_on_non_numeric:
            '「{{path}}」のデフォルト値は省略されました（非数値フィールドへの数値デフォルト）。',
        unsupported_type:
            '「{{path}}」のデフォルト値は省略されました（サポートされていないデフォルトタイプ）。',
    },
};
