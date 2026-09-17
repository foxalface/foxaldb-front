import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'ビュー「{{path}}」をスキップしました。',
    keyless_table_skipped:
        'テーブル「{{path}}」をスキップしました。Django V1 は代替主キーを生成しません。',
    schema_ignored_sqlite:
        'SQLite は schema「{{schema}}」を使用しません。テーブル「{{path}}」は schema 修飾子なしでエクスポートされます。',
    mysql_catalog_omitted:
        'MySQL catalog「{{catalog}}」は省略されます。Django は接続先データベースと修飾なしのテーブル名を使用します。',
    mysql_multiple_catalogs_ignored:
        'MySQL エクスポートでは {{count}} 件の catalog を省略し、物理名が一意のため修飾なしのテーブル名を出力します。',
    mariadb_catalog_omitted:
        'MariaDB catalog「{{catalog}}」は省略されます。Django は接続先データベースと修飾なしのテーブル名を使用します。',
    mariadb_multiple_catalogs_ignored:
        'MariaDB エクスポートでは {{count}} 件の catalog を省略し、物理名が一意のため修飾なしのテーブル名を出力します。',
    postgres_schema_qualified_db_table:
        'PostgreSQL テーブル「{{path}}」は schema「{{schema}}」で修飾された db_table としてエクスポートされます。',
    composite_fk_unsupported:
        '複合外部キー「{{path}}」はエクスポートされません。メンバー列はスカラーのままです。',
    many_to_many_skipped:
        '多対多リレーションシップ「{{path}}」はスキップされました。ラベルのみから結合テーブルは生成されません。',
    one_to_one_degraded_non_unique_fk:
        '「{{path}}」の 1 対 1 リレーションシップは、外部キーが一意でないため ForeignKey としてエクスポートされます。',
    model_name_adjusted:
        'テーブル「{{path}}」のモデルクラスは {{className}} として割り当てられました。',
    model_name_collision:
        'テーブル「{{path}}」のモデルクラス {{className}} は、重複するクラス名を避けるために割り当てられました。',
    field_name_adjusted:
        'フィールド「{{path}}」は Python 属性 {{attributeName}}、db_column「{{dbColumn}}」としてエクスポートされます。',
    related_name_adjusted:
        '「{{path}}」の related_name は、逆アクセサの衝突を避けるため {{relatedName}} として割り当てられました。',
    composite_primary_key:
        'テーブル「{{path}}」は属性 {{attributes}} を使用する Django 6.1 CompositePrimaryKey としてエクスポートされます。',
    on_update_omitted:
        '「{{path}}」の ON UPDATE「{{action}}」は省略されます。ForeignKey にはデータベース ON UPDATE の同等物がありません。',
    on_delete_restrict_degraded:
        '「{{path}}」の ON DELETE RESTRICT は models.DO_NOTHING としてエクスポートされます。Django の RESTRICT/PROTECT コレクターの意味論は使用されません。',
    set_null_omitted: {
        delete: '「{{path}}」で ON DELETE SET NULL が省略されました。外部キーが nullable ではないため models.DO_NOTHING が使用されます。',
    },
    many_to_many_through_skipped: {
        extra_columns:
            '結合テーブル「{{path}}」に追加データ列があるため、便利な ManyToManyField は生成されませんでした。',
        ambiguous:
            '結合テーブル「{{path}}」のエンドポイントモデルが曖昧なため、便利な ManyToManyField は生成されませんでした。',
    },
    relationship_skipped: {
        table_not_exported:
            'リレーションシップ「{{path}}」は、テーブルがエクスポートされなかったためスキップされました。',
        field_not_exported:
            'リレーションシップ「{{path}}」は、参照フィールドがエクスポートされなかったためスキップされました。',
        already_relational:
            'リレーションシップ「{{path}}」は、所有フィールドがすでにリレーションシップのためスキップされました。',
        primary_key_fk:
            'リレーションシップ「{{path}}」は、所有列が主キーの一部であるためスキップされました。',
        unsupported_target_field:
            'リレーションシップ「{{path}}」は、ターゲットフィールドが一意の Django ターゲットではないためスキップされました。',
    },
    index_omitted: {
        unsupported_type:
            'インデックス「{{path}}」は、タイプ「{{indexType}}」が models.Index としてエクスポートされないため省略されました。',
        field_not_exported:
            'インデックス「{{path}}」は、参照フィールドがエクスポートされなかったため省略されました。',
        unsafe_name:
            'インデックス「{{path}}」は、明示的な名前が Django で安全に表現できないため省略されました。',
    },
    index_name_adjusted: {
        unsafe_name:
            'インデックス名「{{originalName}}」は Django の命名制約を満たすため「{{allocatedName}}」に適応されました。',
        name_collision:
            '重複する Django インデックス名を避けるため、インデックス名「{{originalName}}」は「{{allocatedName}}」に適応されました。',
    },
    constraint_name_adjusted: {
        unsafe_name:
            '一意制約名「{{originalName}}」は Django の命名制約を満たすため「{{allocatedName}}」に適応されました。',
        name_collision:
            '重複する Django 制約名を避けるため、一意制約名「{{originalName}}」は「{{allocatedName}}」に適応されました。',
    },
    comment_omitted: {
        table: 'テーブル「{{path}}」のコメントは、SQLite がコメントを永続化しないため省略されます。',
        column: 'カラム「{{path}}」のコメントは、SQLite がコメントを永続化しないため省略されます。',
    },
    check_omitted: {
        table: '「{{path}}」の CHECK 制約は、任意の SQL を Django 6.1 式に変換できないため省略されました。',
        column: '「{{path}}」の CHECK は、任意の SQL を Django 6.1 式に変換できないため省略されました。',
    },
    set_degraded: {
        set_as_text:
            '「{{path}}」の SET フィールドは文字フィールドとしてエクスポートされます。ネイティブ SET 型は生成されません。',
    },
    enum_degraded: {
        enum_as_text:
            '「{{path}}」の enum フィールドは文字フィールドとしてエクスポートされます。Django TextChoices は生成されません。',
    },
    type_omitted: {
        array: '「{{path}}」の配列フィールドは Django エクスポートから省略されます。',
        spatial:
            '「{{path}}」の空間フィールドは Django エクスポートから省略されます。',
        tsvector:
            '「{{path}}」の tsvector フィールドは Django エクスポートから省略されます。',
        xml: '「{{path}}」の XML フィールドは Django エクスポートから省略されます。',
        unsupported:
            '「{{path}}」のフィールドは、タイプを表現できないため省略されました。',
        unimplemented_database:
            'データベースタイプ「{{databaseType}}」の型マッピングは実装されていません。',
        decimal_precision_required:
            '「{{path}}」の decimal フィールドは、MySQL/MariaDB DecimalField に max_digits と decimal_places が必要なため省略されました。',
    },
    type_degraded: {
        varchar_without_max_length:
            '「{{path}}」の文字タイプは max_length がないため {{mappedField}} としてエクスポートされます。',
    },
    default_omitted: {
        unsupported_type:
            '「{{path}}」のデフォルト値は省略されました（サポートされていないデフォルト型）。',
        current_timestamp_non_datetime:
            '「{{path}}」のデフォルト値は省略されました（非 datetime フィールドへの CURRENT_TIMESTAMP）。',
        uuid_function_non_pg:
            '「{{path}}」のデフォルト値は省略されました（非 PostgreSQL UUID フィールドでの UUID 関数）。',
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
