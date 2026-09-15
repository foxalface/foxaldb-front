import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'View "{{path}}" dilewati.',
    schema_ignored_sqlite:
        'SQLite tidak menggunakan schema "{{schema}}"; tabel "{{path}}" diekspor tanpa kualifikasi schema.',
    mysql_catalog_omitted:
        'Katalog MySQL "{{catalog}}" dihilangkan; Rails menggunakan database yang terhubung dan nama tabel tanpa kualifikasi.',
    mysql_multiple_catalogs_ignored:
        'Ekspor MySQL menghilangkan {{count}} katalog dan mengeluarkan nama tabel tanpa kualifikasi karena nama fisik tetap unik.',
    mariadb_catalog_omitted:
        'Katalog MariaDB "{{catalog}}" dihilangkan; Rails menggunakan database yang terhubung dan nama tabel tanpa kualifikasi.',
    mariadb_multiple_catalogs_ignored:
        'Ekspor MariaDB menghilangkan {{count}} katalog dan mengeluarkan nama tabel tanpa kualifikasi karena nama fisik tetap unik.',
    composite_fk_unsupported:
        'Foreign key komposit "{{path}}" tidak diekspor; Rails V1 hanya mengeluarkan foreign key aman satu kolom.',
    keyless_relationship_skipped:
        'Relasi "{{path}}" dilewati karena tabel utama tidak dapat mendukung semantik foreign key.',
    many_to_many_skipped:
        'Relasi banyak-ke-banyak "{{path}}" dilewati; tidak ada sisi foreign key tunggal yang dapat disimpulkan dari label.',
    keyless_model:
        'Tabel "{{path}}" tidak memiliki primary key. Model menetapkan self.primary_key = nil; persistensi Active Record mungkin terbatas.',
    one_to_one_degraded_non_unique_fk:
        'Relasi satu-ke-satu pada "{{path}}" diekspor sebagai has_many karena foreign key tidak unik.',
    many_to_many_through_skipped:
        'has_many :through tidak dibuat untuk tabel join "{{path}}" karena nama asosiasi ambigu.',
    model_name_adjusted:
        'Kelas model untuk tabel "{{path}}" dialokasikan sebagai {{className}}.',
    model_name_collision:
        'Kelas model {{className}} untuk tabel "{{path}}" dialokasikan untuk menghindari konstanta duplikat.',
    on_update_omitted:
        'ON UPDATE "{{action}}" tidak direpresentasikan dalam schema.rb add_foreign_key Rails 8.1 untuk "{{path}}".',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL dihilangkan pada "{{path}}" karena kolom foreign key tidak nullable.',
        update: 'ON UPDATE SET NULL dihilangkan pada "{{path}}" karena kolom foreign key tidak nullable.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to pada "{{path}}" dialokasikan sebagai {{associationName}} untuk menghindari benturan nama.',
        inverse:
            'Asosiasi invers pada "{{path}}" dialokasikan sebagai {{associationName}} untuk menghindari benturan nama.',
    },
    relationship_skipped: {
        table_not_exported:
            'Relasi "{{path}}" dilewati karena sebuah tabel tidak diekspor.',
        unresolved_field_ids:
            'Relasi "{{path}}" dilewati karena ID field foreign key tidak dapat diselesaikan.',
        referenced_column_not_exported:
            'Relasi "{{path}}" dilewati karena kolom yang direferensikan tidak diekspor.',
    },
    index_omitted: {
        unsupported_type:
            'Indeks "{{path}}" dihilangkan karena tipe "{{indexType}}" tidak diekspor dalam schema.rb Rails.',
        missing_field:
            'Indeks "{{path}}" dihilangkan karena field yang direferensikan hilang.',
        field_not_exported:
            'Indeks "{{path}}" dihilangkan karena field yang direferensikan tidak diekspor.',
    },
    comment_omitted: {
        table: 'Komentar tabel pada "{{path}}" dihilangkan karena SQLite tidak menyimpan komentar.',
        column: 'Komentar kolom pada "{{path}}" dihilangkan karena SQLite tidak menyimpan komentar.',
    },
    check_omitted: {
        table: 'Constraint check kosong pada "{{path}}" dihilangkan.',
        column: 'Check kosong pada "{{path}}" dihilangkan.',
    },
    set_degraded: {
        sqlite_as_string:
            'Field set pada "{{path}}" diekspor sebagai string untuk SQLite.',
        mysql_family_as_string:
            'Field set pada "{{path}}" diekspor sebagai string; DSL SET asli tidak dikeluarkan.',
    },
    enum_degraded: {
        sqlite_as_string:
            'Field enum pada "{{path}}" diekspor sebagai string untuk SQLite.',
        pg_type_values_missing:
            'Enum PostgreSQL "{{path}}" tidak dideklarasikan karena nilai kanonik hilang.',
        pg_field_values_missing:
            'Field "{{path}}" enum PostgreSQL diekspor sebagai string karena nilai enum kanonik hilang.',
        pg_field_named_values_missing:
            'Field "{{path}}" enum PostgreSQL "{{enumName}}" diekspor sebagai string karena nilai enum hilang.',
        mysql_family_as_string:
            'Field enum pada "{{path}}" diekspor sebagai string; DSL enum/set asli tidak dikeluarkan.',
    },
    type_omitted: {
        array: 'Field array pada "{{path}}" tidak direpresentasikan dalam schema.rb Rails.',
        spatial:
            'Field spatial pada "{{path}}" tidak direpresentasikan dalam schema.rb Rails.',
        unsupported:
            'Field pada "{{path}}" dihilangkan karena tipenya tidak dapat direpresentasikan.',
        unimplemented_database:
            'Pemetaan tipe belum diimplementasikan untuk tipe database "{{databaseType}}".',
    },
    type_degraded: {
        serial_no_sequence:
            'Field serial non-primary-key pada "{{path}}" diekspor sebagai integer biasa tanpa sequence.',
        jsonb_as_json: 'Field "{{path}}" jsonb diekspor sebagai json.',
        uuid_as_string: 'Field "{{path}}" uuid diekspor sebagai string(36).',
        null_as_text:
            'Field "{{path}}" dengan kelas penyimpanan null diekspor sebagai text.',
        money_as_decimal: 'Field "{{path}}" money diekspor sebagai decimal.',
        year_as_integer: 'Field "{{path}}" year diekspor sebagai integer.',
        bit_as_boolean: 'Field "{{path}}" bit diekspor sebagai boolean.',
        type_as_string:
            'Field "{{path}}" tipe "{{sourceType}}" diekspor sebagai {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'Default pada "{{path}}" dihilangkan (ekspresi SQL seperti lambda: {{expression}}).',
        sql_expression:
            'Default pada "{{path}}" dihilangkan (ekspresi SQL tidak didukung: {{expression}}).',
        unclear:
            'Default pada "{{path}}" dihilangkan (default tidak jelas: {{expression}}).',
        current_timestamp_non_datetime:
            'Default pada "{{path}}" dihilangkan (CURRENT_TIMESTAMP pada field non-datetime).',
        uuid_function_non_pg:
            'Default pada "{{path}}" dihilangkan (default fungsi UUID pada field UUID non-PostgreSQL).',
        boolean_on_non_boolean:
            'Default pada "{{path}}" dihilangkan (default boolean pada field non-boolean).',
        numeric_on_non_numeric:
            'Default pada "{{path}}" dihilangkan (default numerik pada field non-numerik).',
        unsupported_type:
            'Default pada "{{path}}" dihilangkan (tipe default tidak didukung).',
    },
};
