import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'व्ह्यू «{{path}}» वगळले.',
    keyless_table_skipped:
        'सुरक्षितपणे दाखवता येणारे स्तंभ नसल्याने तक्ता «{{path}}» वगळला.',
    keyless_table:
        'तक्ता «{{path}}»ला प्राथमिक की नाही आणि id न बनवता मूळ Drizzle तक्ता म्हणून निर्यात होतो.',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}» वापरत नाही; टेबल «{{path}}» schema qualifier शिवाय निर्यात केले जाते.',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» वगळले; Drizzle unqualified टेबल नावे आणि एकच डेटाबेस कनेक्शन वापरते.',
    mysql_multiple_catalogs_ignored:
        'MySQL निर्यात {{count}} catalogs वगळते आणि physical नावे unique असल्यामुळे unqualified टेबल नावे देते.',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» वगळले; Drizzle unqualified टेबल नावे आणि एकच डेटाबेस कनेक्शन वापरते.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB निर्यात {{count}} catalogs वगळते आणि physical नावे unique असल्यामुळे unqualified टेबल नावे देते.',
    mariadb_mysql_dialect_adapted:
        'MariaDB Drizzleच्या MySQL API ने निर्यात होते (dialect «{{dialect}}»). Drizzle 0.45 मध्ये प्रथम-श्रेणी MariaDB dialect नाही.',
    postgres_schema_qualified:
        'PostgreSQL schema «{{schema}}» pgSchema() ने निर्यात होते.',
    uuid_as_text:
        'फील्ड «{{path}}» चे UUID मजकूर म्हणून निर्यात होते कारण या डेटाबेसमध्ये Drizzle 0.45 चा मूळ UUID प्रकार नाही.',
    increment_omitted:
        '«{{path}}» वरील स्वयं-वाढ वगळली कारण ती सुरक्षितपणे दाखवता येत नाही.',
    set_null_omitted:
        'परकीय-की स्तंभ NOT NULL असल्याने «{{path}}» वर ON DELETE SET NULL वगळले.',
    sqlite_boolean_integer:
        'SQLite मध्ये मूळ boolean प्रकार नसल्याने फील्ड «{{path}}» चे boolean integer({ mode: "boolean" }) म्हणून निर्यात होते.',
    sqlite_json_text:
        'SQLite JSON TEXT म्हणून साठवते म्हणून फील्ड «{{path}}» चे JSON text({ mode: "json" }) म्हणून निर्यात होते.',
    table_name_adjusted: {
        table: 'तक्ता «{{path}}» TypeScript स्थिरांक {{tsName}} म्हणून निर्यात होतो. भौतिक तक्त्याचे नाव जपले जाते.',
        pgEnum: 'PostgreSQL enum «{{path}}» TypeScript स्थिरांक {{tsName}} म्हणून निर्यात होतो. भौतिक enum नाव जपले जाते.',
        pgSchema:
            'PostgreSQL schema «{{path}}» TypeScript स्थिरांक {{tsName}} म्हणून निर्यात होतो.',
    },
    table_name_collision:
        'डुप्लिकेट TypeScript ओळखकर्ता टाळण्यासाठी «{{path}}» साठी तक्ता स्थिरांक «{{tsName}}» वाटप केला.',
    column_name_adjusted:
        'स्तंभ «{{path}}» TypeScript गुणधर्म {{tsName}} म्हणून निर्यात होतो. भौतिक स्तंभनाव जपले जाते.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'स्रोत आणि लक्ष्य स्तंभ याद्या दोन्ही नसल्याने संमिश्र परकीय की «{{path}}» वगळली.',
        composite_fk_arity_mismatch:
            'स्रोत आणि लक्ष्य स्तंभ संख्या वेगळ्या असल्याने संमिश्र परकीय की «{{path}}» वगळली.',
        label_only:
            'लेबलवरून भौतिक जोड तक्ता ओळखता येत नसल्याने अनेक-ते-अनेक संबंध «{{path}}» वगळला.',
        table_not_exported:
            'संदर्भित तक्ता निर्यात न झाल्याने संबंध «{{path}}» वगळला.',
        unresolved_member:
            'संदर्भित फील्ड निर्यात न झाल्याने संबंध «{{path}}» वगळला.',
    },
    index_omitted: {
        unsupported_method:
            'प्रकार «{{indexType}}» निर्यात होत नसल्याने अनुक्रमणिका «{{path}}» वगळली.',
        field_not_exported:
            'संदर्भित फील्ड निर्यात न झाल्याने अनुक्रमणिका «{{path}}» वगळली.',
    },
    comment_omitted: {
        table: 'या निर्यातकाने वापरलेले संरचित टिप्पणी API Drizzle 0.45 मध्ये नसल्याने «{{path}}» वरील तक्ता टिप्पणी वगळली.',
        column: 'या निर्यातकाने वापरलेले संरचित टिप्पणी API Drizzle 0.45 मध्ये नसल्याने «{{path}}» वरील स्तंभ टिप्पणी वगळली.',
    },
    check_omitted: {
        table: 'कच्चे SQL तयार TypeScript मध्ये घातले जात नसल्याने «{{path}}» वरील CHECK बंधन वगळले.',
        column: 'कच्चे SQL तयार TypeScript मध्ये घातले जात नसल्याने «{{path}}» वरील CHECK वगळले.',
    },
    set_degraded: {
        set_as_text:
            'फील्ड «{{path}}» चे SET मजकूर म्हणून निर्यात होते; मूळ SET प्रकार तयार होत नाहीत.',
    },
    enum_degraded: {
        ts_enum_only:
            'फील्ड «{{path}}» चे enum text({ enum: [...] }) म्हणून निर्यात होते; SQLite मध्ये भौतिक enum बंधन नाही.',
        unsupported_enum:
            'मूळ Drizzle enum म्हणून दाखवता न आल्याने फील्ड «{{path}}» चे enum मजकूर म्हणून निर्यात होते.',
        unknown_values:
            'enum मूल्ये नसल्याने फील्ड «{{path}}» चे enum मजकूर म्हणून निर्यात होते.',
    },
    type_omitted: {
        array: '«{{path}}» वरील अ‍ॅरे फील्ड Drizzle निर्यातातून वगळले.',
        unsupported: 'प्रकार दाखवता न आल्याने «{{path}}» वरील फील्ड वगळले.',
        unimplemented_database:
            'डेटाबेस प्रकार «{{databaseType}}» साठी प्रकार मॅपिंग लागू नाही.',
    },
    type_degraded: {
        binary_as_bytea:
            'फील्ड «{{path}}» चा द्विमान प्रकार bytea() म्हणून निर्यात होतो.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» वरील डिफॉल्ट वगळले (असमर्थित डिफॉल्ट प्रकार).',
        current_timestamp_non_datetime:
            '«{{path}}» वरील डिफॉल्ट वगळले (datetime नसलेल्या फील्डवर CURRENT_TIMESTAMP).',
        sql_expression:
            '«{{path}}» वरील डिफॉल्ट वगळले (असमर्थित SQL अभिव्यक्ती: {{expression}}).',
        unclear:
            '«{{path}}» वरील डिफॉल्ट वगळले (अस्पष्ट डिफॉल्ट: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}» वरील डिफॉल्ट वगळले (boolean नसलेल्या फील्डवर boolean डिफॉल्ट).',
        numeric_on_non_numeric:
            '«{{path}}» वरील डिफॉल्ट वगळले (संख्यात्मक नसलेल्या फील्डवर संख्यात्मक डिफॉल्ट).',
    },
};
