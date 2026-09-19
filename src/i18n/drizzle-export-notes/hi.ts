import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'व्यू «{{path}}» छोड़ दिया गया।',
    keyless_table_skipped:
        'तालिका «{{path}}» छोड़ दी गई क्योंकि इसमें सुरक्षित रूप से दर्शाए जा सकने वाले कॉलम नहीं हैं।',
    keyless_table:
        'तालिका «{{path}}» में प्राथमिक कुंजी नहीं है और id गढ़े बिना मूल Drizzle तालिका के रूप में निर्यात की जाती है।',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}» का उपयोग नहीं करता; तालिका «{{path}}» schema qualifier के बिना निर्यात की जाती है।',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» छोड़ दिया गया; Drizzle अयोग्य तालिका नामों और एक ही डेटाबेस कनेक्शन का उपयोग करता है।',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यात {{count}} catalog छोड़ता है और अयोग्य तालिका नाम उत्पन्न करता है क्योंकि भौतिक नाम अद्वितीय रहते हैं।',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» छोड़ दिया गया; Drizzle अयोग्य तालिका नामों और एक ही डेटाबेस कनेक्शन का उपयोग करता है।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यात {{count}} catalog छोड़ता है और अयोग्य तालिका नाम उत्पन्न करता है क्योंकि भौतिक नाम अद्वितीय रहते हैं।',
    mariadb_mysql_dialect_adapted:
        'MariaDB को Drizzle MySQL API से निर्यात किया जाता है (dialect «{{dialect}}»)। Drizzle 0.45 में प्रथम-श्रेणी MariaDB dialect नहीं है।',
    postgres_schema_qualified:
        'PostgreSQL schema «{{schema}}» को pgSchema() के साथ निर्यात किया जाता है।',
    uuid_as_text:
        'फ़ील्ड «{{path}}» का UUID पाठ के रूप में निर्यात किया गया क्योंकि इस डेटाबेस में Drizzle 0.45 का मूल UUID प्रकार नहीं है।',
    increment_omitted:
        '«{{path}}» पर स्वतः वृद्धि छोड़ दी गई क्योंकि इसे सुरक्षित रूप से दर्शाया नहीं जा सकता।',
    set_null_omitted:
        '«{{path}}» पर ON DELETE SET NULL छोड़ दिया गया क्योंकि एक विदेशी-कुंजी कॉलम NOT NULL है।',
    sqlite_boolean_integer:
        'फ़ील्ड «{{path}}» का boolean integer({ mode: "boolean" }) के रूप में निर्यात किया गया क्योंकि SQLite में मूल boolean प्रकार नहीं है।',
    sqlite_json_text:
        'फ़ील्ड «{{path}}» का JSON text({ mode: "json" }) के रूप में निर्यात किया गया क्योंकि SQLite JSON को TEXT के रूप में रखता है।',
    table_name_adjusted: {
        table: 'तालिका «{{path}}» TypeScript स्थिरांक {{tsName}} के रूप में निर्यात की जाती है। भौतिक तालिका नाम संरक्षित रहता है।',
        pgEnum: 'PostgreSQL enum «{{path}}» TypeScript स्थिरांक {{tsName}} के रूप में निर्यात किया जाता है। भौतिक enum नाम संरक्षित रहता है।',
        pgSchema:
            'PostgreSQL schema «{{path}}» TypeScript स्थिरांक {{tsName}} के रूप में निर्यात किया जाता है।',
    },
    table_name_collision:
        '«{{path}}» के लिए तालिका स्थिरांक «{{tsName}}» डुप्लिकेट TypeScript पहचानकर्ता से बचने हेतु आवंटित किया गया।',
    column_name_adjusted:
        'कॉलम «{{path}}» TypeScript गुण {{tsName}} के रूप में निर्यात किया जाता है। भौतिक कॉलम नाम संरक्षित रहता है।',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'समग्र विदेशी कुंजी «{{path}}» छोड़ दी गई क्योंकि स्रोत और लक्ष्य कॉलम सूचियाँ दोनों मौजूद नहीं थीं।',
        composite_fk_arity_mismatch:
            'समग्र विदेशी कुंजी «{{path}}» छोड़ दी गई क्योंकि स्रोत और लक्ष्य कॉलम संख्याएँ भिन्न हैं।',
        label_only:
            'अनेक-से-अनेक संबंध «{{path}}» छोड़ दिया गया क्योंकि लेबल से कोई भौतिक join तालिका पहचानी नहीं जाती।',
        table_not_exported:
            'संबंध «{{path}}» छोड़ दिया गया क्योंकि संदर्भित तालिका निर्यात नहीं हुई।',
        unresolved_member:
            'संबंध «{{path}}» छोड़ दिया गया क्योंकि संदर्भित फ़ील्ड निर्यात नहीं हुआ।',
    },
    index_omitted: {
        unsupported_method:
            'अनुक्रमणिका «{{path}}» छोड़ दी गई क्योंकि प्रकार «{{indexType}}» निर्यात नहीं होता।',
        field_not_exported:
            'अनुक्रमणिका «{{path}}» छोड़ दी गई क्योंकि संदर्भित फ़ील्ड निर्यात नहीं हुआ।',
    },
    comment_omitted: {
        table: '«{{path}}» पर तालिका टिप्पणी छोड़ दी गई क्योंकि Drizzle 0.45 में इस निर्यातक द्वारा प्रयुक्त संरचित टिप्पणी API नहीं है।',
        column: '«{{path}}» पर कॉलम टिप्पणी छोड़ दी गई क्योंकि Drizzle 0.45 में इस निर्यातक द्वारा प्रयुक्त संरचित टिप्पणी API नहीं है।',
    },
    check_omitted: {
        table: '«{{path}}» पर CHECK बाध्यता छोड़ दी गई क्योंकि कच्चा SQL जनरेट किए गए TypeScript में नहीं डाला जाता।',
        column: '«{{path}}» पर CHECK छोड़ दिया गया क्योंकि कच्चा SQL जनरेट किए गए TypeScript में नहीं डाला जाता।',
    },
    set_degraded: {
        set_as_text:
            'फ़ील्ड «{{path}}» का SET पाठ के रूप में निर्यात किया गया; मूल SET प्रकार नहीं बनते।',
    },
    enum_degraded: {
        ts_enum_only:
            'फ़ील्ड «{{path}}» का enum text({ enum: [...] }) के रूप में निर्यात किया गया; SQLite में भौतिक enum बाध्यता नहीं है।',
        unsupported_enum:
            'फ़ील्ड «{{path}}» का enum पाठ के रूप में निर्यात किया गया क्योंकि इसे मूल Drizzle enum के रूप में दर्शाया नहीं जा सकता।',
        unknown_values:
            'फ़ील्ड «{{path}}» का enum पाठ के रूप में निर्यात किया गया क्योंकि enum मान गायब हैं।',
    },
    type_omitted: {
        array: '«{{path}}» पर सरणी फ़ील्ड Drizzle निर्यात से छोड़ दिया गया।',
        unsupported:
            '«{{path}}» पर फ़ील्ड छोड़ दिया गया क्योंकि उसका प्रकार दर्शाया नहीं जा सकता।',
        unimplemented_database:
            'डेटाबेस प्रकार «{{databaseType}}» के लिए प्रकार मैपिंग लागू नहीं है।',
    },
    type_degraded: {
        binary_as_bytea:
            'फ़ील्ड «{{path}}» का द्विआधारी प्रकार bytea() के रूप में निर्यात किया गया।',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» पर डिफ़ॉल्ट छोड़ दिया गया (असमर्थित डिफ़ॉल्ट प्रकार)।',
        current_timestamp_non_datetime:
            '«{{path}}» पर डिफ़ॉल्ट छोड़ दिया गया (गैर-datetime फ़ील्ड पर CURRENT_TIMESTAMP)।',
        sql_expression:
            '«{{path}}» पर डिफ़ॉल्ट छोड़ दिया गया (असमर्थित SQL व्यंजक: {{expression}})।',
        unclear:
            '«{{path}}» पर डिफ़ॉल्ट छोड़ दिया गया (अस्पष्ट डिफ़ॉल्ट: {{expression}})।',
        boolean_on_non_boolean:
            '«{{path}}» पर डिफ़ॉल्ट छोड़ दिया गया (गैर-boolean फ़ील्ड पर boolean डिफ़ॉल्ट)।',
        numeric_on_non_numeric:
            '«{{path}}» पर डिफ़ॉल्ट छोड़ दिया गया (गैर-संख्यात्मक फ़ील्ड पर संख्यात्मक डिफ़ॉल्ट)।',
    },
};
