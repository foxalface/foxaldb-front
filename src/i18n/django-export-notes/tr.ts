import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: '«{{path}}» görünümü atlandı.',
    keyless_table_skipped:
        '«{{path}}» tablosu atlandı; Django V1 yedek bir birincil anahtar icat etmez.',
    schema_ignored_sqlite:
        'SQLite «{{schema}}» şemasını kullanmaz; «{{path}}» tablosu şema niteleyicisi olmadan dışa aktarılır.',
    mysql_catalog_omitted:
        'MySQL katalogu «{{catalog}}» atlandı; Django bağlı veritabanını ve niteliksiz tablo adlarını kullanır.',
    mysql_multiple_catalogs_ignored:
        'MySQL dışa aktarımı {{count}} katalogu atlar ve fiziksel adlar benzersiz kaldığı için niteliksiz tablo adları üretir.',
    mariadb_catalog_omitted:
        'MariaDB katalogu «{{catalog}}» atlandı; Django bağlı veritabanını ve niteliksiz tablo adlarını kullanır.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB dışa aktarımı {{count}} katalogu atlar ve fiziksel adlar benzersiz kaldığı için niteliksiz tablo adları üretir.',
    postgres_schema_qualified_db_table:
        'PostgreSQL tablosu «{{path}}», «{{schema}}» şemasıyla nitelendirilmiş db_table ile dışa aktarılır.',
    composite_fk_unsupported:
        'Bileşik yabancı anahtar «{{path}}» dışa aktarılmadı; üye sütunlar skaler kalır.',
    many_to_many_skipped:
        '«{{path}}» çoktan çoğa ilişkisi atlandı; yalnızca bir etiketten birleşim tablosu icat edilmez.',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}» üzerindeki bire bir ilişki, yabancı anahtar benzersiz olmadığı için ForeignKey olarak dışa aktarılır.',
    model_name_adjusted:
        '«{{path}}» tablosunun model sınıfı {{className}} olarak ayrıldı.',
    model_name_collision:
        '«{{path}}» tablosu için «{{className}}» model sınıfı, yinelenen sınıf adını önlemek için ayrıldı.',
    field_name_adjusted:
        '«{{path}}» alanı, db_column «{{dbColumn}}» ile Python özniteliği {{attributeName}} olarak dışa aktarılır.',
    related_name_adjusted:
        '«{{path}}» üzerindeki related_name, ters erişim çakışmasını önlemek için {{relatedName}} olarak ayrıldı.',
    composite_primary_key:
        '«{{path}}» tablosu, {{attributes}} özniteliklerini kullanan Django 6.1 CompositePrimaryKey ile dışa aktarılır.',
    on_update_omitted:
        "«{{path}}» üzerindeki ON UPDATE «{{action}}» atlandı; ForeignKey'in veritabanı ON UPDATE karşılığı yoktur.",
    on_delete_restrict_degraded:
        '«{{path}}» üzerindeki ON DELETE RESTRICT, models.DO_NOTHING olarak dışa aktarılır; Django RESTRICT/PROTECT toplayıcı anlamları kullanılmaz.',
    set_null_omitted: {
        delete: '«{{path}}» üzerinde ON DELETE SET NULL atlandı; yabancı anahtar nullable değil; models.DO_NOTHING kullanılır.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            '«{{path}}» birleşim tablosu için ek veri sütunları bulunduğundan kolay ManyToManyField oluşturulmadı.',
        ambiguous:
            '«{{path}}» birleşim tablosu için uç nokta modeli belirsiz olduğundan kolay ManyToManyField oluşturulmadı.',
    },
    relationship_skipped: {
        table_not_exported:
            '«{{path}}» ilişkisi atlandı; bir tablo dışa aktarılmadı.',
        field_not_exported:
            '«{{path}}» ilişkisi atlandı; başvurulan bir alan dışa aktarılmadı.',
        already_relational:
            '«{{path}}» ilişkisi atlandı; sahip alan zaten bir ilişkidir.',
        primary_key_fk:
            '«{{path}}» ilişkisi atlandı; sahip sütun birincil anahtarın parçasıdır.',
        unsupported_target_field:
            '«{{path}}» ilişkisi atlandı; hedef alan benzersiz bir Django hedefi değildir.',
    },
    index_omitted: {
        unsupported_type:
            '«{{path}}» dizini atlandı; «{{indexType}}» türü models.Index olarak dışa aktarılmaz.',
        field_not_exported:
            '«{{path}}» dizini atlandı; başvurulan bir alan dışa aktarılmadı.',
        unsafe_name:
            "«{{path}}» dizini atlandı; açık adı Django'da güvenle temsil edilemez.",
    },
    index_name_adjusted: {
        unsafe_name:
            'Dizin adı «{{originalName}}», Django adlandırma kısıtlamalarını karşılamak için «{{allocatedName}}» olarak uyarlandı.',
        name_collision:
            'Yinelenen bir Django dizin adından kaçınmak için dizin adı «{{originalName}}» «{{allocatedName}}» olarak uyarlandı.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'Benzersiz kısıt adı «{{originalName}}», Django adlandırma kısıtlamalarını karşılamak için «{{allocatedName}}» olarak uyarlandı.',
        name_collision:
            'Yinelenen bir Django kısıt adından kaçınmak için benzersiz kısıt adı «{{originalName}}» «{{allocatedName}}» olarak uyarlandı.',
    },
    comment_omitted: {
        table: '«{{path}}» üzerindeki tablo yorumu atlandı; SQLite yorumları kalıcı hale getirmez.',
        column: '«{{path}}» üzerindeki sütun yorumu atlandı; SQLite yorumları kalıcı hale getirmez.',
    },
    check_omitted: {
        table: '«{{path}}» üzerindeki CHECK kısıtı atlandı; keyfi SQL bir Django 6.1 ifadesine dönüştürülemez.',
        column: '«{{path}}» üzerindeki CHECK atlandı; keyfi SQL bir Django 6.1 ifadesine dönüştürülemez.',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}» alanındaki SET, karakter alanı olarak dışa aktarılır; yerel SET türleri oluşturulmaz.',
    },
    enum_degraded: {
        enum_as_text:
            '«{{path}}» alanındaki enum, karakter alanı olarak dışa aktarılır; Django TextChoices oluşturulmaz.',
    },
    type_omitted: {
        array: '«{{path}}» üzerindeki dizi alanı Django dışa aktarımından atlandı.',
        spatial:
            '«{{path}}» üzerindeki uzamsal alan Django dışa aktarımından atlandı.',
        tsvector:
            '«{{path}}» üzerindeki tsvector alanı Django dışa aktarımından atlandı.',
        xml: '«{{path}}» üzerindeki XML alanı Django dışa aktarımından atlandı.',
        unsupported: '«{{path}}» alanı atlandı; türü temsil edilemiyor.',
        unimplemented_database:
            '«{{databaseType}}» veritabanı türü için tür eşlemesi uygulanmadı.',
        decimal_precision_required:
            '«{{path}}» üzerindeki decimal alanı atlandı; MySQL/MariaDB DecimalField max_digits ve decimal_places gerektirir.',
    },
    type_degraded: {
        varchar_without_max_length:
            '«{{path}}» alanının karakter türü, max_length eksik olduğu için {{mappedField}} olarak dışa aktarılır.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» üzerindeki varsayılan değer atlandı (desteklenmeyen varsayılan tür).',
        current_timestamp_non_datetime:
            '«{{path}}» üzerindeki varsayılan değer atlandı (datetime olmayan alanda CURRENT_TIMESTAMP).',
        uuid_function_non_pg:
            '«{{path}}» üzerindeki varsayılan değer atlandı (PostgreSQL olmayan UUID alanında UUID işlevi).',
        sql_expression:
            '«{{path}}» üzerindeki varsayılan değer atlandı (desteklenmeyen SQL ifadesi: {{expression}}).',
        unclear:
            '«{{path}}» üzerindeki varsayılan değer atlandı (belirsiz varsayılan: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}» üzerindeki varsayılan değer atlandı (boolean olmayan alanda boolean varsayılan).',
        numeric_on_non_numeric:
            '«{{path}}» üzerindeki varsayılan değer atlandı (sayısal olmayan alanda sayısal varsayılan).',
    },
};
