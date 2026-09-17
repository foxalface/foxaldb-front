import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'View «{{path}}» dilewati.',
    keyless_table_skipped:
        'Tabel "{{path}}" dilewati karena tidak dapat direpresentasikan sebagai SQL khusus basis data tanpa membuat kunci primer.',
    keyless_table_sql_created:
        'Tabel fisik "{{path}}" dibuat melalui SQL khusus basis data karena Django tidak dapat memodelkan tabel tanpa kunci primer tanpa mengubah skemanya.',
    keyless_model_omitted:
        'Tidak ada model ORM Django yang dihasilkan untuk "{{path}}" karena Django memerlukan kunci primer.',
    schema_ignored_sqlite:
        'SQLite tidak menggunakan schema «{{schema}}»; tabel «{{path}}» diekspor tanpa kualifikasi schema.',
    mysql_catalog_omitted:
        'Katalog MySQL «{{catalog}}» dihilangkan; Django menggunakan basis data yang terhubung dan nama tabel tanpa kualifikasi.',
    mysql_multiple_catalogs_ignored:
        'Ekspor MySQL menghilangkan {{count}} katalog dan mengeluarkan nama tabel tanpa kualifikasi karena nama fisik tetap unik.',
    mariadb_catalog_omitted:
        'Katalog MariaDB «{{catalog}}» dihilangkan; Django menggunakan basis data yang terhubung dan nama tabel tanpa kualifikasi.',
    mariadb_multiple_catalogs_ignored:
        'Ekspor MariaDB menghilangkan {{count}} katalog dan mengeluarkan nama tabel tanpa kualifikasi karena nama fisik tetap unik.',
    postgres_schema_qualified_db_table:
        'Tabel PostgreSQL «{{path}}» diekspor dengan db_table yang dikualifikasi schema «{{schema}}».',
    composite_fk_unsupported:
        'Kunci asing komposit «{{path}}» tidak diekspor; kolom anggota tetap skalar.',
    many_to_many_skipped:
        'Relasi many-to-many «{{path}}» dilewati; tidak ada tabel join yang dibuat dari label saja.',
    one_to_one_degraded_non_unique_fk:
        'Relasi one-to-one pada «{{path}}» diekspor sebagai ForeignKey karena kunci asing tidak unik.',
    model_name_adjusted:
        'Kelas model untuk tabel «{{path}}» dialokasikan sebagai {{className}}.',
    model_name_collision:
        'Kelas model «{{className}}» untuk tabel «{{path}}» dialokasikan untuk menghindari nama kelas duplikat.',
    field_name_adjusted:
        'Field «{{path}}» diekspor sebagai atribut Python {{attributeName}} dengan db_column «{{dbColumn}}».',
    related_name_adjusted:
        'related_name pada «{{path}}» dialokasikan sebagai {{relatedName}} untuk menghindari bentrokan aksesor balik.',
    composite_primary_key:
        'Tabel «{{path}}» diekspor dengan CompositePrimaryKey Django 6.1 menggunakan atribut {{attributes}}.',
    on_update_omitted:
        'ON UPDATE «{{action}}» pada «{{path}}» dihilangkan; ForeignKey tidak memiliki padanan ON UPDATE basis data.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT pada «{{path}}» diekspor sebagai models.DO_NOTHING; semantik kolektor RESTRICT/PROTECT Django tidak digunakan.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL dihilangkan pada «{{path}}» karena kunci asing tidak nullable; models.DO_NOTHING digunakan.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'ManyToManyField praktis tidak dibuat untuk tabel join «{{path}}» karena ada kolom data tambahan.',
        ambiguous:
            'ManyToManyField praktis tidak dibuat untuk tabel join «{{path}}» karena model endpoint ambigu.',
    },
    relationship_skipped: {
        table_not_exported:
            'Relasi «{{path}}» dilewati karena sebuah tabel tidak diekspor.',
        field_not_exported:
            'Relasi «{{path}}» dilewati karena field referensi tidak diekspor.',
        already_relational:
            'Relasi «{{path}}» dilewati karena field pemilik sudah berupa relasi.',
        primary_key_fk:
            'Relasi «{{path}}» dilewati karena kolom pemilik adalah bagian dari kunci utama.',
        unsupported_target_field:
            'Relasi «{{path}}» dilewati karena field target bukan target Django yang unik.',
        keyless_target:
            'Relasi "{{path}}" dilewati karena menargetkan tabel tanpa kunci yang tidak memiliki model Django.',
    },
    index_omitted: {
        unsupported_type:
            'Indeks «{{path}}» dihilangkan karena tipe «{{indexType}}» tidak diekspor sebagai models.Index.',
        field_not_exported:
            'Indeks «{{path}}» dihilangkan karena field referensi tidak diekspor.',
        unsafe_name:
            'Indeks «{{path}}» dihilangkan karena namanya yang eksplisit tidak dapat direpresentasikan dengan aman di Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'Nama indeks «{{originalName}}» disesuaikan menjadi «{{allocatedName}}» agar memenuhi batasan penamaan Django.',
        name_collision:
            'Nama indeks «{{originalName}}» disesuaikan menjadi «{{allocatedName}}» untuk menghindari nama indeks Django yang duplikat.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'Nama unique constraint «{{originalName}}» disesuaikan menjadi «{{allocatedName}}» agar memenuhi batasan penamaan Django.',
        name_collision:
            'Nama unique constraint «{{originalName}}» disesuaikan menjadi «{{allocatedName}}» untuk menghindari nama constraint Django yang duplikat.',
    },
    comment_omitted: {
        table: 'Komentar tabel pada «{{path}}» dihilangkan karena SQLite tidak menyimpan komentar.',
        column: 'Komentar kolom pada «{{path}}» dihilangkan karena SQLite tidak menyimpan komentar.',
    },
    check_omitted: {
        table: 'Constraint CHECK pada «{{path}}» dihilangkan karena SQL arbitrer tidak dapat dikonversi ke ekspresi Django 6.1.',
        column: 'CHECK pada «{{path}}» dihilangkan karena SQL arbitrer tidak dapat dikonversi ke ekspresi Django 6.1.',
    },
    set_degraded: {
        set_as_text:
            'SET pada field «{{path}}» diekspor sebagai field karakter; tipe SET asli tidak dibuat.',
    },
    enum_degraded: {
        enum_as_text:
            'enum pada field «{{path}}» diekspor sebagai field karakter; Django TextChoices tidak dibuat.',
    },
    type_omitted: {
        array: 'Field array pada «{{path}}» dihilangkan dari ekspor Django.',
        spatial:
            'Field spasial pada «{{path}}» dihilangkan dari ekspor Django.',
        tsvector:
            'Field tsvector pada «{{path}}» dihilangkan dari ekspor Django.',
        xml: 'Field XML pada «{{path}}» dihilangkan dari ekspor Django.',
        unsupported:
            'Field «{{path}}» dihilangkan karena tipenya tidak dapat direpresentasikan.',
        unimplemented_database:
            'Pemetaan tipe belum diimplementasikan untuk tipe basis data «{{databaseType}}».',
        decimal_precision_required:
            'Field decimal pada «{{path}}» dihilangkan karena DecimalField MySQL/MariaDB memerlukan max_digits dan decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'Tipe karakter field «{{path}}» diekspor sebagai {{mappedField}} karena max_length tidak ada.',
    },
    default_omitted: {
        unsupported_type:
            'Nilai default pada «{{path}}» dihilangkan (tipe default tidak didukung).',
        current_timestamp_non_datetime:
            'Nilai default pada «{{path}}» dihilangkan (CURRENT_TIMESTAMP pada field non-datetime).',
        uuid_function_non_pg:
            'Nilai default pada «{{path}}» dihilangkan (fungsi UUID pada field UUID non-PostgreSQL).',
        sql_expression:
            'Nilai default pada «{{path}}» dihilangkan (ekspresi SQL tidak didukung: {{expression}}).',
        unclear:
            'Nilai default pada «{{path}}» dihilangkan (default tidak jelas: {{expression}}).',
        boolean_on_non_boolean:
            'Nilai default pada «{{path}}» dihilangkan (default boolean pada field non-boolean).',
        numeric_on_non_numeric:
            'Nilai default pada «{{path}}» dihilangkan (default numerik pada field non-numerik).',
    },
};
