import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'व्यू «{{path}}» छोड़ दिया गया।',
    keyless_table_skipped:
        'तालिका «{{path}}» छोड़ दी गई क्योंकि Django V1 विकल्प प्राथमिक कुंजी नहीं बनाता।',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}» का उपयोग नहीं करता; तालिका «{{path}}» schema qualifier के बिना निर्यात की जाती है।',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» छोड़ दिया गया; Django कनेक्टेड डेटाबेस और अयोग्य तालिका नामों का उपयोग करता है।',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यात {{count}} catalog छोड़ता है और अयोग्य तालिका नाम उत्पन्न करता है क्योंकि भौतिक नाम अद्वितीय रहते हैं।',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» छोड़ दिया गया; Django कनेक्टेड डेटाबेस और अयोग्य तालिका नामों का उपयोग करता है।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यात {{count}} catalog छोड़ता है और अयोग्य तालिका नाम उत्पन्न करता है क्योंकि भौतिक नाम अद्वितीय रहते हैं।',
    postgres_schema_qualified_db_table:
        'PostgreSQL तालिका «{{path}}» schema «{{schema}}» से योग्य db_table के साथ निर्यात की जाती है।',
    composite_fk_unsupported:
        'समग्र विदेशी कुंजी «{{path}}» निर्यात नहीं की गई; सदस्य कॉलम स्केलर रहते हैं।',
    many_to_many_skipped:
        'अनेक-से-अनेक संबंध «{{path}}» छोड़ दिया गया; केवल लेबल से join तालिका नहीं बनाई जाती।',
    one_to_one_degraded_non_unique_fk:
        '«{{path}}» पर one-to-one संबंध ForeignKey के रूप में निर्यात किया गया क्योंकि विदेशी कुंजी अद्वितीय नहीं है।',
    model_name_adjusted:
        'तालिका «{{path}}» की model कक्षा {{className}} के रूप में आवंटित की गई।',
    model_name_collision:
        'तालिका «{{path}}» के लिए model कक्षा «{{className}}» duplicate class name से बचने के लिए आवंटित की गई।',
    field_name_adjusted:
        'फ़ील्ड «{{path}}» Python attribute {{attributeName}} के रूप में db_column «{{dbColumn}}» के साथ निर्यात की जाती है।',
    related_name_adjusted:
        '«{{path}}» पर related_name reverse accessor collision से बचने के लिए {{relatedName}} के रूप में आवंटित किया गया।',
    composite_primary_key:
        'तालिका «{{path}}» attributes {{attributes}} का उपयोग करके Django 6.1 CompositePrimaryKey के साथ निर्यात की जाती है।',
    on_update_omitted:
        '«{{path}}» पर ON UPDATE «{{action}}» छोड़ दिया गया; ForeignKey का डेटाबेस ON UPDATE समकक्ष नहीं है।',
    on_delete_restrict_degraded:
        '«{{path}}» पर ON DELETE RESTRICT models.DO_NOTHING के रूप में निर्यात किया गया; Django RESTRICT/PROTECT collector semantics का उपयोग नहीं किया जाता।',
    set_null_omitted: {
        delete: '«{{path}}» पर ON DELETE SET NULL छोड़ दिया गया क्योंकि विदेशी कुंजी nullable नहीं है; models.DO_NOTHING का उपयोग किया जाता है।',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'join तालिका «{{path}}» के लिए सुविधाजनक ManyToManyField नहीं बनाया गया क्योंकि अतिरिक्त data columns मौजूद हैं।',
        ambiguous:
            'join तालिका «{{path}}» के लिए सुविधाजनक ManyToManyField नहीं बनाया गया क्योंकि endpoint model अस्पष्ट है।',
    },
    relationship_skipped: {
        table_not_exported:
            'संबंध «{{path}}» छोड़ दिया गया क्योंकि एक तालिका निर्यात नहीं की गई।',
        field_not_exported:
            'संबंध «{{path}}» छोड़ दिया गया क्योंकि एक referenced field निर्यात नहीं की गई।',
        already_relational:
            'संबंध «{{path}}» छोड़ दिया गया क्योंकि owning field पहले से संबंध है।',
        primary_key_fk:
            'संबंध «{{path}}» छोड़ दिया गया क्योंकि owning column प्राथमिक कुंजी का हिस्सा है।',
        unsupported_target_field:
            'संबंध «{{path}}» छोड़ दिया गया क्योंकि target field अद्वितीय Django target नहीं है।',
    },
    index_omitted: {
        unsupported_type:
            'इंडेक्स «{{path}}» छोड़ दिया गया क्योंकि प्रकार «{{indexType}}» models.Index के रूप में निर्यात नहीं होता।',
        field_not_exported:
            'इंडेक्स «{{path}}» छोड़ दिया गया क्योंकि एक referenced field निर्यात नहीं की गई।',
        unsafe_name:
            'इंडेक्स «{{path}}» छोड़ दिया गया क्योंकि इसका explicit name Django में सुरक्षित रूप से representable नहीं है।',
    },
    index_name_adjusted: {
        unsafe_name:
            'इंडेक्स नाम «{{originalName}}» Django नामकरण सीमाओं को पूरा करने के लिए «{{allocatedName}}» में अनुकूलित किया गया।',
        name_collision:
            'डुप्लिकेट Django इंडेक्स नाम से बचने के लिए इंडेक्स नाम «{{originalName}}» «{{allocatedName}}» में अनुकूलित किया गया।',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'यूनिक कंस्ट्रेंट नाम «{{originalName}}» Django नामकरण सीमाओं को पूरा करने के लिए «{{allocatedName}}» में अनुकूलित किया गया।',
        name_collision:
            'डुप्लिकेट Django कंस्ट्रेंट नाम से बचने के लिए यूनिक कंस्ट्रेंट नाम «{{originalName}}» «{{allocatedName}}» में अनुकूलित किया गया।',
    },
    comment_omitted: {
        table: '«{{path}}» पर table comment छोड़ दिया गया क्योंकि SQLite comments persist नहीं करता।',
        column: '«{{path}}» पर column comment छोड़ दिया गया क्योंकि SQLite comments persist नहीं करता।',
    },
    check_omitted: {
        table: '«{{path}}» पर CHECK constraint छोड़ दिया गया क्योंकि arbitrary SQL को Django 6.1 expression में convert नहीं किया जा सकता।',
        column: '«{{path}}» पर CHECK छोड़ दिया गया क्योंकि arbitrary SQL को Django 6.1 expression में convert नहीं किया जा सकता।',
    },
    set_degraded: {
        set_as_text:
            '«{{path}}» पर SET character field के रूप में निर्यात किया जाता है; native SET types generate नहीं होते।',
    },
    enum_degraded: {
        enum_as_text:
            '«{{path}}» पर enum character field के रूप में निर्यात किया जाता है; Django TextChoices generate नहीं होते।',
    },
    type_omitted: {
        array: '«{{path}}» पर array field Django export से छोड़ दिया गया।',
        spatial: '«{{path}}» पर spatial field Django export से छोड़ दिया गया।',
        tsvector:
            '«{{path}}» पर tsvector field Django export से छोड़ दिया गया।',
        xml: '«{{path}}» पर XML field Django export से छोड़ दिया गया।',
        unsupported:
            '«{{path}}» field छोड़ दी गई क्योंकि इसका type represent नहीं किया जा सकता।',
        unimplemented_database:
            'database type «{{databaseType}}» के लिए type mapping implement नहीं है।',
        decimal_precision_required:
            '«{{path}}» पर decimal field छोड़ दी गई क्योंकि MySQL/MariaDB DecimalField max_digits और decimal_places require करता है।',
    },
    type_degraded: {
        varchar_without_max_length:
            '«{{path}}» field character type {{mappedField}} के रूप में निर्यात किया जाता है क्योंकि max_length missing है।',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» पर default omitted (unsupported default type)।',
        current_timestamp_non_datetime:
            '«{{path}}» पर default omitted (non-datetime field पर CURRENT_TIMESTAMP)।',
        uuid_function_non_pg:
            '«{{path}}» पर default omitted (non-PostgreSQL UUID field पर UUID function)।',
        sql_expression:
            '«{{path}}» पर default omitted (unsupported SQL expression: {{expression}})।',
        unclear:
            '«{{path}}» पर default omitted (unclear default: {{expression}})।',
        boolean_on_non_boolean:
            '«{{path}}» पर default omitted (non-boolean field पर boolean default)।',
        numeric_on_non_numeric:
            '«{{path}}» पर default omitted (non-numeric field पर numeric default)।',
    },
};
