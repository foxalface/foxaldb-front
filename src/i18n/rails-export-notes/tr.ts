import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: '«{{path}}» görünümü atlandı.',
    schema_ignored_sqlite:
        'SQLite «{{schema}}» şemasını kullanmaz; «{{path}}» tablosu şema niteleyicisi olmadan dışa aktarıldı.',
    mysql_catalog_omitted:
        'MySQL kataloğu «{{catalog}}» atlandı; Rails bağlı veritabanını ve niteliksiz tablo adlarını kullanır.',
    mysql_multiple_catalogs_ignored:
        'MySQL dışa aktarımı {{count}} kataloğu atlar ve fiziksel adlar benzersiz kaldığı için niteliksiz tablo adları üretir.',
    mariadb_catalog_omitted:
        'MariaDB kataloğu «{{catalog}}» atlandı; Rails bağlı veritabanını ve niteliksiz tablo adlarını kullanır.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB dışa aktarımı {{count}} kataloğu atlar ve fiziksel adlar benzersiz kaldığı için niteliksiz tablo adları üretir.',
    composite_fk_unsupported:
        'Bileşik yabancı anahtar «{{path}}» dışa aktarılmadı; Rails V1 yalnızca güvenli tek sütunlu yabancı anahtarlar üretir.',
    keyless_relationship_skipped:
        '«{{path}}» ilişkisi atlandı, çünkü ana tablo yabancı anahtar semantiğini destekleyemez.',
    many_to_many_skipped:
        '«{{path}}» çoktan çoğa ilişkisi atlandı; etiketten tek bir yabancı anahtar tarafı çıkarılamadı.',
    keyless_model:
        '«{{path}}» tablosunun birincil anahtarı yok. Model self.primary_key = nil olarak ayarlandı; Active Record kalıcılığı sınırlı olabilir.',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}» üzerindeki bire bir ilişki, yabancı anahtar benzersiz olmadığı için has_many olarak dışa aktarıldı.',
    many_to_many_through_skipped:
        '«{{path}}» birleştirme tablosu için has_many :through oluşturulmadı, çünkü ilişki adları belirsizdi.',
    model_name_adjusted:
        '«{{path}}» tablosu için model sınıfı {{className}} olarak atandı.',
    model_name_collision:
        '«{{path}}» tablosu için {{className}} model sınıfı, yinelenen sabitten kaçınmak için atandı.',
    on_update_omitted:
        'ON UPDATE «{{action}}», «{{path}}» için Rails 8.1 schema.rb add_foreign_key içinde temsil edilmez.',
    set_null_omitted: {
        delete: '«{{path}}» üzerinde ON DELETE SET NULL atlandı, çünkü yabancı anahtar sütunu null olamaz.',
        update: '«{{path}}» üzerinde ON UPDATE SET NULL atlandı, çünkü yabancı anahtar sütunu null olamaz.',
    },
    association_name_adjusted: {
        belongs_to:
            '«{{path}}» üzerindeki belongs_to, ad çakışmasını önlemek için {{associationName}} olarak atandı.',
        inverse:
            '«{{path}}» üzerindeki ters ilişki, ad çakışmasını önlemek için {{associationName}} olarak atandı.',
    },
    relationship_skipped: {
        table_not_exported:
            '«{{path}}» ilişkisi atlandı, çünkü bir tablo dışa aktarılmadı.',
        unresolved_field_ids:
            '«{{path}}» ilişkisi atlandı, çünkü yabancı anahtar alan kimlikleri çözümlenemedi.',
        referenced_column_not_exported:
            '«{{path}}» ilişkisi atlandı, çünkü referans verilen bir sütun dışa aktarılmadı.',
    },
    index_omitted: {
        unsupported_type:
            '«{{path}}» dizini atlandı, çünkü «{{indexType}}» türü Rails schema.rb içinde dışa aktarılmaz.',
        missing_field:
            '«{{path}}» dizini atlandı, çünkü referans verilen bir alan eksik.',
        field_not_exported:
            '«{{path}}» dizini atlandı, çünkü referans verilen bir alan dışa aktarılmadı.',
    },
    comment_omitted: {
        table: '«{{path}}» tablo açıklaması atlandı, çünkü SQLite açıklamaları kalıcı olarak saklamaz.',
        column: '«{{path}}» sütun açıklaması atlandı, çünkü SQLite açıklamaları kalıcı olarak saklamaz.',
    },
    check_omitted: {
        table: '«{{path}}» üzerindeki boş CHECK kısıtlaması atlandı.',
        column: '«{{path}}» üzerindeki boş CHECK atlandı.',
    },
    set_degraded: {
        sqlite_as_string:
            '«{{path}}» SET alanı SQLite için string olarak dışa aktarıldı.',
        mysql_family_as_string:
            '«{{path}}» SET alanı string olarak dışa aktarıldı; yerel SET DSL üretilmedi.',
    },
    enum_degraded: {
        sqlite_as_string:
            '«{{path}}» enum alanı SQLite için string olarak dışa aktarıldı.',
        pg_type_values_missing:
            'PostgreSQL enum «{{path}}» bildirilmedi, çünkü kanonik değerler eksik.',
        pg_field_values_missing:
            '«{{path}}» alanı PostgreSQL enum, kanonik enum değerleri eksik olduğu için string olarak dışa aktarıldı.',
        pg_field_named_values_missing:
            '«{{path}}» alanı PostgreSQL enum «{{enumName}}», enum değerleri eksik olduğu için string olarak dışa aktarıldı.',
        mysql_family_as_string:
            '«{{path}}» enum alanı string olarak dışa aktarıldı; yerel enum/set DSL üretilmedi.',
    },
    type_omitted: {
        array: '«{{path}}» dizi alanı Rails schema.rb içinde temsil edilmez.',
        spatial:
            '«{{path}}» mekânsal alanı Rails schema.rb içinde temsil edilmez.',
        unsupported: '«{{path}}» alanı atlandı, çünkü türü temsil edilemez.',
        unimplemented_database:
            '«{{databaseType}}» veritabanı türü için tür eşlemesi uygulanmadı.',
    },
    type_degraded: {
        serial_no_sequence:
            '«{{path}}» üzerindeki birincil anahtar olmayan serial alanı, sıra olmadan normal bir integer olarak dışa aktarıldı.',
        jsonb_as_json: '«{{path}}» alanı jsonb, json olarak dışa aktarıldı.',
        uuid_as_string:
            '«{{path}}» alanı uuid, string(36) olarak dışa aktarıldı.',
        null_as_text:
            '«{{path}}» alanı null depolama sınıfı, text olarak dışa aktarıldı.',
        money_as_decimal:
            '«{{path}}» alanı money, decimal olarak dışa aktarıldı.',
        year_as_integer:
            '«{{path}}» alanı year, integer olarak dışa aktarıldı.',
        bit_as_boolean: '«{{path}}» alanı bit, boolean olarak dışa aktarıldı.',
        type_as_string:
            '«{{path}}» alanı «{{sourceType}}» türü, {{mappedHelper}} olarak dışa aktarıldı.',
    },
    default_omitted: {
        lambda_expression:
            '«{{path}}» varsayılan değeri atlandı (lambda benzeri SQL ifadesi: {{expression}}).',
        sql_expression:
            '«{{path}}» varsayılan değeri atlandı (desteklenmeyen SQL ifadesi: {{expression}}).',
        unclear:
            '«{{path}}» varsayılan değeri atlandı (belirsiz varsayılan: {{expression}}).',
        current_timestamp_non_datetime:
            '«{{path}}» varsayılan değeri atlandı (datetime olmayan alanda CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '«{{path}}» varsayılan değeri atlandı (PostgreSQL olmayan UUID alanında UUID fonksiyonu varsayılanı).',
        boolean_on_non_boolean:
            '«{{path}}» varsayılan değeri atlandı (boolean olmayan alanda boolean varsayılanı).',
        numeric_on_non_numeric:
            '«{{path}}» varsayılan değeri atlandı (sayısal olmayan alanda sayısal varsayılan).',
        unsupported_type:
            '«{{path}}» varsayılan değeri atlandı (desteklenmeyen varsayılan türü).',
    },
};
