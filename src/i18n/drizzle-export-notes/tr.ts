import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: '«{{path}}» görünümü atlandı.',
    keyless_table_skipped:
        '«{{path}}» tablosu atlandı çünkü güvenle temsil edilebilir sütunları yok.',
    keyless_table:
        '«{{path}}» tablosunun birincil anahtarı yok ve id uydurulmadan yerel bir Drizzle tablosu olarak dışa aktarılır.',
    schema_ignored_sqlite:
        'SQLite «{{schema}}» şemasını kullanmaz; «{{path}}» tablosu şema niteleyicisi olmadan dışa aktarılır.',
    mysql_catalog_omitted:
        'MySQL kataloğu «{{catalog}}» atlanır; Drizzle niteleyicisiz tablo adları ve tek bir veritabanı bağlantısı kullanır.',
    mysql_multiple_catalogs_ignored:
        'MySQL dışa aktarma {{count}} kataloğu atlar ve fiziksel adlar benzersiz kaldığı için niteleyicisiz tablo adları üretir.',
    mariadb_catalog_omitted:
        'MariaDB kataloğu «{{catalog}}» atlanır; Drizzle niteleyicisiz tablo adları ve tek bir veritabanı bağlantısı kullanır.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB dışa aktarma {{count}} kataloğu atlar ve fiziksel adlar benzersiz kaldığı için niteleyicisiz tablo adları üretir.',
    mariadb_mysql_dialect_adapted:
        'MariaDB, Drizzle MySQL API’leriyle dışa aktarılır (diyalekt «{{dialect}}»). Drizzle 0.45’te birinci sınıf bir MariaDB diyalekti yoktur.',
    postgres_schema_qualified:
        'PostgreSQL şeması «{{schema}}» pgSchema() ile dışa aktarılır.',
    uuid_as_text:
        '«{{path}}» UUID alanı metin olarak dışa aktarılır çünkü bu veritabanının Drizzle 0.45’te yerel bir UUID türü yoktur.',
    increment_omitted:
        '«{{path}}» üzerindeki otomatik artırım atlandı çünkü güvenle temsil edilemez.',
    set_null_omitted:
        'ON DELETE SET NULL «{{path}}» üzerinde atlandı çünkü bir yabancı anahtar sütunu NOT NULL.',
    sqlite_boolean_integer:
        '«{{path}}» boolean alanı integer({ mode: "boolean" }) olarak dışa aktarılır çünkü SQLite’ta yerel boolean türü yoktur.',
    sqlite_json_text:
        '«{{path}}» JSON alanı text({ mode: "json" }) olarak dışa aktarılır çünkü SQLite JSON’u TEXT olarak saklar.',
    table_name_adjusted: {
        table: '«{{path}}» tablosu TypeScript sabiti {{tsName}} olarak dışa aktarılır. Fiziksel tablo adı korunur.',
        pgEnum: 'PostgreSQL enum «{{path}}» TypeScript sabiti {{tsName}} olarak dışa aktarılır. Fiziksel enum adı korunur.',
        pgSchema:
            'PostgreSQL şeması «{{path}}» TypeScript sabiti {{tsName}} olarak dışa aktarılır.',
    },
    table_name_collision:
        '«{{path}}» için tablo sabiti «{{tsName}}», yinelenen bir TypeScript tanımlayıcısından kaçınmak üzere ayrıldı.',
    column_name_adjusted:
        '«{{path}}» sütunu TypeScript özelliği {{tsName}} olarak dışa aktarılır. Fiziksel sütun adı korunur.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'Bileşik yabancı anahtar «{{path}}» atlandı çünkü kaynak ve hedef sütun listelerinin ikisi de mevcut değildi.',
        composite_fk_arity_mismatch:
            'Bileşik yabancı anahtar «{{path}}» atlandı çünkü kaynak ve hedef sütun sayıları farklı.',
        label_only:
            'Çoktan çoğa ilişki «{{path}}» atlandı çünkü etiketten fiziksel bir birleştirme tablosu belirlenemiyor.',
        table_not_exported:
            '«{{path}}» ilişkisi atlandı çünkü başvurulan bir tablo dışa aktarılmadı.',
        unresolved_member:
            '«{{path}}» ilişkisi atlandı çünkü başvurulan bir alan dışa aktarılmadı.',
    },
    index_omitted: {
        unsupported_method:
            '«{{path}}» dizini atlandı çünkü «{{indexType}}» türü dışa aktarılmaz.',
        field_not_exported:
            '«{{path}}» dizini atlandı çünkü başvurulan bir alan dışa aktarılmadı.',
    },
    comment_omitted: {
        table: '«{{path}}» üzerindeki tablo yorumu atlanır çünkü Drizzle 0.45’te bu dışa aktarıcının kullandığı yapılandırılmış bir yorum API’si yoktur.',
        column: '«{{path}}» üzerindeki sütun yorumu atlanır çünkü Drizzle 0.45’te bu dışa aktarıcının kullandığı yapılandırılmış bir yorum API’si yoktur.',
    },
    check_omitted: {
        table: '«{{path}}» üzerindeki CHECK kısıtı atlanır çünkü ham SQL üretilen TypeScript’e enjekte edilmez.',
        column: '«{{path}}» üzerindeki CHECK atlanır çünkü ham SQL üretilen TypeScript’e enjekte edilmez.',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}» alanındaki SET metin olarak dışa aktarılır; yerel SET türleri üretilmez.',
    },
    enum_degraded: {
        ts_enum_only:
            '«{{path}}» alanındaki enum text({ enum: [...] }) olarak dışa aktarılır; SQLite’ta fiziksel bir enum kısıtı yoktur.',
        unsupported_enum:
            '«{{path}}» alanındaki enum metin olarak dışa aktarılır çünkü yerel bir Drizzle enum’u olarak temsil edilemez.',
        unknown_values:
            '«{{path}}» alanındaki enum metin olarak dışa aktarılır çünkü enum değerleri eksik.',
    },
    type_omitted: {
        array: '«{{path}}» üzerindeki dizi alanı Drizzle dışa aktarımından çıkarılır.',
        unsupported:
            '«{{path}}» üzerindeki alan atlandı çünkü türü temsil edilemez.',
        unimplemented_database:
            '«{{databaseType}}» veritabanı türü için tür eşlemesi uygulanmamıştır.',
    },
    type_degraded: {
        binary_as_bytea:
            '«{{path}}» alanının ikili türü bytea() olarak dışa aktarılır.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» üzerindeki varsayılan atlandı (desteklenmeyen varsayılan türü).',
        current_timestamp_non_datetime:
            '«{{path}}» üzerindeki varsayılan atlandı (datetime olmayan alanda CURRENT_TIMESTAMP).',
        sql_expression:
            '«{{path}}» üzerindeki varsayılan atlandı (desteklenmeyen SQL ifadesi: {{expression}}).',
        unclear:
            '«{{path}}» üzerindeki varsayılan atlandı (belirsiz varsayılan: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}» üzerindeki varsayılan atlandı (boolean olmayan alanda boolean varsayılan).',
        numeric_on_non_numeric:
            '«{{path}}» üzerindeki varsayılan atlandı (sayısal olmayan alanda sayısal varsayılan).',
    },
};
