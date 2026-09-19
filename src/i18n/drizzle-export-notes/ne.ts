import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'भ्यू «{{path}}» छोडियो।',
    keyless_table_skipped:
        'सुरक्षित रूपमा देखाउन सकिने स्तम्भ नभएकाले तालिका «{{path}}» छोडियो।',
    keyless_table:
        'तालिका «{{path}}» मा प्राथमिक कुञ्जी छैन र id नबनाई मूल Drizzle तालिकाका रूपमा निर्यात हुन्छ।',
    schema_ignored_sqlite:
        'SQLite ले schema «{{schema}}» प्रयोग गर्दैन; तालिका «{{path}}» schema qualifier बिना निर्यात गरिन्छ।',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» हटाइयो; Drizzle ले unqualified तालिका नामहरू र एउटै डाटाबेस जडान प्रयोग गर्छ।',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यातले {{count}} catalogs हटाउँछ र physical नामहरू unique रहँदा unqualified तालिका नामहरू उत्पादन गर्छ।',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» हटाइयो; Drizzle ले unqualified तालिका नामहरू र एउटै डाटाबेस जडान प्रयोग गर्छ।',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यातले {{count}} catalogs हटाउँछ र physical नामहरू unique रहँदा unqualified तालिका नामहरू उत्पादन गर्छ।',
    mariadb_mysql_dialect_adapted:
        'MariaDB Drizzle का MySQL API बाट निर्यात हुन्छ (dialect «{{dialect}}»)। Drizzle 0.45 मा प्रथम-श्रेणी MariaDB dialect छैन।',
    postgres_schema_qualified:
        'PostgreSQL schema «{{schema}}» pgSchema() सँग निर्यात हुन्छ।',
    uuid_as_text:
        'फिल्ड «{{path}}» को UUID पाठका रूपमा निर्यात हुन्छ किनभने यस डाटाबेसमा Drizzle 0.45 को मूल UUID प्रकार छैन।',
    increment_omitted:
        '«{{path}}» मा स्वतः वृद्धि हटाइयो किनभने त्यसलाई सुरक्षित रूपमा देखाउन सकिँदैन।',
    set_null_omitted:
        'विदेशी-कुञ्जी स्तम्भ NOT NULL भएकाले «{{path}}» मा ON DELETE SET NULL हटाइयो।',
    sqlite_boolean_integer:
        'SQLite मा मूल boolean प्रकार नभएकाले फिल्ड «{{path}}» को boolean integer({ mode: "boolean" }) का रूपमा निर्यात हुन्छ।',
    sqlite_json_text:
        'SQLite ले JSON लाई TEXT का रूपमा राख्ने भएकाले फिल्ड «{{path}}» को JSON text({ mode: "json" }) का रूपमा निर्यात हुन्छ।',
    table_name_adjusted: {
        table: 'तालिका «{{path}}» TypeScript स्थिर {{tsName}} का रूपमा निर्यात हुन्छ। भौतिक तालिका नाम सुरक्षित रहन्छ।',
        pgEnum: 'PostgreSQL enum «{{path}}» TypeScript स्थिर {{tsName}} का रूपमा निर्यात हुन्छ। भौतिक enum नाम सुरक्षित रहन्छ।',
        pgSchema:
            'PostgreSQL schema «{{path}}» TypeScript स्थिर {{tsName}} का रूपमा निर्यात हुन्छ।',
    },
    table_name_collision:
        'नक्कली TypeScript पहिचायकबाट बच्न «{{path}}» का लागि तालिका स्थिर «{{tsName}}» बाँडियो।',
    column_name_adjusted:
        'स्तम्भ «{{path}}» TypeScript गुण {{tsName}} का रूपमा निर्यात हुन्छ। भौतिक स्तम्भ नाम सुरक्षित रहन्छ।',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'स्रोत र लक्ष्य स्तम्भ सूची दुवै उपस्थित नभएकाले मिश्रित विदेशी कुञ्जी «{{path}}» छोडियो।',
        composite_fk_arity_mismatch:
            'स्रोत र लक्ष्य स्तम्भ सङ्ख्या फरक भएकाले मिश्रित विदेशी कुञ्जी «{{path}}» छोडियो।',
        label_only:
            'लेबलबाट भौतिक जोडिने तालिका पहिचान नहुने भएकाले धेरै-देखि-धेरै सम्बन्ध «{{path}}» छोडियो।',
        table_not_exported:
            'सन्दर्भित तालिका निर्यात नभएकाले सम्बन्ध «{{path}}» छोडियो।',
        unresolved_member:
            'सन्दर्भित फिल्ड निर्यात नभएकाले सम्बन्ध «{{path}}» छोडियो।',
    },
    index_omitted: {
        unsupported_method:
            'प्रकार «{{indexType}}» निर्यात नहुने भएकाले अनुक्रमणिका «{{path}}» हटाइयो।',
        field_not_exported:
            'सन्दर्भित फिल्ड निर्यात नभएकाले अनुक्रमणिका «{{path}}» हटाइयो।',
    },
    comment_omitted: {
        table: 'यो निर्यातकले प्रयोग गर्ने संरचित टिप्पणी API Drizzle 0.45 मा नभएकाले «{{path}}» मा तालिका टिप्पणी हटाइयो।',
        column: 'यो निर्यातकले प्रयोग गर्ने संरचित टिप्पणी API Drizzle 0.45 मा नभएकाले «{{path}}» मा स्तम्भ टिप्पणी हटाइयो।',
    },
    check_omitted: {
        table: 'कच्चा SQL उत्पन्न TypeScript मा हालिँदैन भएकाले «{{path}}» मा CHECK बन्धन हटाइयो।',
        column: 'कच्चा SQL उत्पन्न TypeScript मा हालिँदैन भएकाले «{{path}}» मा CHECK हटाइयो।',
    },
    set_degraded: {
        set_as_text:
            'फिल्ड «{{path}}» को SET पाठका रूपमा निर्यात हुन्छ; मूल SET प्रकारहरू बन्दैनन्।',
    },
    enum_degraded: {
        ts_enum_only:
            'फिल्ड «{{path}}» को enum text({ enum: [...] }) का रूपमा निर्यात हुन्छ; SQLite मा भौतिक enum बन्धन छैन।',
        unsupported_enum:
            'मूल Drizzle enum का रूपमा देखाउन नसकिने भएकाले फिल्ड «{{path}}» को enum पाठका रूपमा निर्यात हुन्छ।',
        unknown_values:
            'enum मानहरू हराएकाले फिल्ड «{{path}}» को enum पाठका रूपमा निर्यात हुन्छ।',
    },
    type_omitted: {
        array: '«{{path}}» मा एरे फिल्ड Drizzle निर्यातबाट हटाइयो।',
        unsupported: 'प्रकार देखाउन नसकिने भएकाले «{{path}}» मा फिल्ड हटाइयो।',
        unimplemented_database:
            'डाटाबेस प्रकार «{{databaseType}}» का लागि प्रकार म्यापिङ लागू छैन।',
    },
    type_degraded: {
        binary_as_bytea:
            'फिल्ड «{{path}}» को द्विआधारी प्रकार bytea() का रूपमा निर्यात हुन्छ।',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» मा पूर्वनिर्धारित हटाइयो (असमर्थित पूर्वनिर्धारित प्रकार)।',
        current_timestamp_non_datetime:
            '«{{path}}» मा पूर्वनिर्धारित हटाइयो (datetime नभएको फिल्डमा CURRENT_TIMESTAMP)।',
        sql_expression:
            '«{{path}}» मा पूर्वनिर्धारित हटाइयो (असमर्थित SQL अभिव्यक्ति: {{expression}})।',
        unclear:
            '«{{path}}» मा पूर्वनिर्धारित हटाइयो (अस्पष्ट पूर्वनिर्धारित: {{expression}})।',
        boolean_on_non_boolean:
            '«{{path}}» मा पूर्वनिर्धारित हटाइयो (boolean नभएको फिल्डमा boolean पूर्वनिर्धारित)।',
        numeric_on_non_numeric:
            '«{{path}}» मा पूर्वनिर्धारित हटाइयो (संख्यात्मक नभएको फिल्डमा संख्यात्मक पूर्वनिर्धारित)।',
    },
};
