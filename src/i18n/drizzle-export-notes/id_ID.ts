import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'View «{{path}}» dilewati.',
    keyless_table_skipped:
        'Tabel «{{path}}» dilewati karena tidak memiliki kolom yang dapat direpresentasikan dengan aman.',
    keyless_table:
        'Tabel «{{path}}» tidak memiliki kunci primer dan diekspor sebagai tabel Drizzle native tanpa mengarang id.',
    schema_ignored_sqlite:
        'SQLite tidak menggunakan skema «{{schema}}»; tabel «{{path}}» diekspor tanpa kualifikasi skema.',
    mysql_catalog_omitted:
        'Katalog MySQL «{{catalog}}» dihilangkan; Drizzle menggunakan nama tabel tanpa kualifikasi dan satu koneksi basis data.',
    mysql_multiple_catalogs_ignored:
        'Ekspor MySQL menghilangkan {{count}} katalog dan mengeluarkan nama tabel tanpa kualifikasi karena nama fisik tetap unik.',
    mariadb_catalog_omitted:
        'Katalog MariaDB «{{catalog}}» dihilangkan; Drizzle menggunakan nama tabel tanpa kualifikasi dan satu koneksi basis data.',
    mariadb_multiple_catalogs_ignored:
        'Ekspor MariaDB menghilangkan {{count}} katalog dan mengeluarkan nama tabel tanpa kualifikasi karena nama fisik tetap unik.',
    mariadb_mysql_dialect_adapted:
        'MariaDB diekspor menggunakan API MySQL Drizzle (dialek «{{dialect}}»). Drizzle 0.45 tidak memiliki dialek MariaDB kelas satu.',
    postgres_schema_qualified:
        'Skema PostgreSQL «{{schema}}» diekspor dengan pgSchema().',
    uuid_as_text:
        'Bidang UUID «{{path}}» diekspor sebagai teks karena basis data ini tidak memiliki tipe UUID native di Drizzle 0.45.',
    increment_omitted:
        'Auto-increment pada «{{path}}» dihilangkan karena tidak dapat direpresentasikan dengan aman.',
    set_null_omitted:
        'ON DELETE SET NULL dihilangkan pada «{{path}}» karena kolom kunci asing bersifat NOT NULL.',
    sqlite_boolean_integer:
        'Bidang boolean «{{path}}» diekspor sebagai integer({ mode: "boolean" }) karena SQLite tidak memiliki tipe boolean native.',
    sqlite_json_text:
        'Bidang JSON «{{path}}» diekspor sebagai text({ mode: "json" }) karena SQLite menyimpan JSON sebagai TEXT.',
    table_name_adjusted: {
        table: 'Tabel «{{path}}» diekspor sebagai konstanta TypeScript {{tsName}}. Nama tabel fisik dipertahankan.',
        pgEnum: 'Enum PostgreSQL «{{path}}» diekspor sebagai konstanta TypeScript {{tsName}}. Nama enum fisik dipertahankan.',
        pgSchema:
            'Skema PostgreSQL «{{path}}» diekspor sebagai konstanta TypeScript {{tsName}}.',
    },
    table_name_collision:
        'Konstanta tabel «{{tsName}}» untuk «{{path}}» dialokasikan agar menghindari pengidentifikasi TypeScript duplikat.',
    column_name_adjusted:
        'Kolom «{{path}}» diekspor sebagai properti TypeScript {{tsName}}. Nama kolom fisik dipertahankan.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'Kunci asing komposit «{{path}}» dilewati karena daftar kolom sumber dan target tidak keduanya ada.',
        composite_fk_arity_mismatch:
            'Kunci asing komposit «{{path}}» dilewati karena jumlah kolom sumber dan target berbeda.',
        label_only:
            'Relasi banyak-ke-banyak «{{path}}» dilewati karena tabel penghubung fisik tidak dapat diidentifikasi dari label.',
        table_not_exported:
            'Relasi «{{path}}» dilewati karena tabel yang dirujuk tidak diekspor.',
        unresolved_member:
            'Relasi «{{path}}» dilewati karena bidang yang dirujuk tidak diekspor.',
    },
    index_omitted: {
        unsupported_method:
            'Indeks «{{path}}» dihilangkan karena tipe «{{indexType}}» tidak diekspor.',
        field_not_exported:
            'Indeks «{{path}}» dihilangkan karena bidang yang dirujuk tidak diekspor.',
    },
    comment_omitted: {
        table: 'Komentar tabel pada «{{path}}» dihilangkan karena Drizzle 0.45 tidak memiliki API komentar terstruktur yang dipakai pengekspor ini.',
        column: 'Komentar kolom pada «{{path}}» dihilangkan karena Drizzle 0.45 tidak memiliki API komentar terstruktur yang dipakai pengekspor ini.',
    },
    check_omitted: {
        table: 'Kendala CHECK pada «{{path}}» dihilangkan karena SQL mentah tidak disisipkan ke TypeScript yang dihasilkan.',
        column: 'CHECK pada «{{path}}» dihilangkan karena SQL mentah tidak disisipkan ke TypeScript yang dihasilkan.',
    },
    set_degraded: {
        set_as_text:
            'SET pada bidang «{{path}}» diekspor sebagai teks; tipe SET native tidak dihasilkan.',
    },
    enum_degraded: {
        ts_enum_only:
            'Enum bidang «{{path}}» diekspor sebagai text({ enum: [...] }); SQLite tidak memiliki kendala enum fisik.',
        unsupported_enum:
            'Enum bidang «{{path}}» diekspor sebagai teks karena tidak dapat direpresentasikan sebagai enum Drizzle native.',
        unknown_values:
            'Enum bidang «{{path}}» diekspor sebagai teks karena nilai enum hilang.',
    },
    type_omitted: {
        array: 'Bidang array pada «{{path}}» dihilangkan dari ekspor Drizzle.',
        unsupported:
            'Bidang pada «{{path}}» dihilangkan karena tipenya tidak dapat direpresentasikan.',
        unimplemented_database:
            'Pemetaan tipe belum diimplementasikan untuk tipe basis data «{{databaseType}}».',
    },
    type_degraded: {
        binary_as_bytea:
            'Tipe biner bidang «{{path}}» diekspor sebagai bytea().',
    },
    default_omitted: {
        unsupported_type:
            'Nilai default pada «{{path}}» dihilangkan (tipe default tidak didukung).',
        current_timestamp_non_datetime:
            'Nilai default pada «{{path}}» dihilangkan (CURRENT_TIMESTAMP pada bidang non-datetime).',
        sql_expression:
            'Nilai default pada «{{path}}» dihilangkan (ekspresi SQL tidak didukung: {{expression}}).',
        unclear:
            'Nilai default pada «{{path}}» dihilangkan (default tidak jelas: {{expression}}).',
        boolean_on_non_boolean:
            'Nilai default pada «{{path}}» dihilangkan (default boolean pada bidang non-boolean).',
        numeric_on_non_numeric:
            'Nilai default pada «{{path}}» dihilangkan (default numerik pada bidang non-numerik).',
    },
};
