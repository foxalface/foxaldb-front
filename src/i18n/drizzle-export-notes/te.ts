import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'వ్యూ «{{path}}» దాటవేయబడింది.',
    keyless_table_skipped:
        'సురక్షితంగా చూపించగల నిలువువరుసలు లేనందున టేబుల్ «{{path}}» దాటవేయబడింది.',
    keyless_table:
        'టేబుల్ «{{path}}»కి ప్రాథమిక కీ లేదు మరియు id కల్పించకుండా స్థానిక Drizzle టేబుల్‌గా ఎగుమతి అవుతుంది.',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}»ను ఉపయోగించదు; టేబుల్ «{{path}}» schema qualifier లేకుండా ఎగుమతి చేయబడుతుంది.',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» తొలగించబడింది; Drizzle unqualified టేబుల్ పేర్లు మరియు ఒకే డేటాబేస్ కనెక్షన్‌ను ఉపయోగిస్తుంది.',
    mysql_multiple_catalogs_ignored:
        'MySQL ఎగుమతి {{count}} catalogs తొలగిస్తుంది మరియు physical పేర్లు unique గా ఉండటం వల్ల unqualified టేబుల్ పేర్లను విడుదల చేస్తుంది.',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» తొలగించబడింది; Drizzle unqualified టేబుల్ పేర్లు మరియు ఒకే డేటాబేస్ కనెక్షన్‌ను ఉపయోగిస్తుంది.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB ఎగుమతి {{count}} catalogs తొలగిస్తుంది మరియు physical పేర్లు unique గా ఉండటం వల్ల unqualified టేబుల్ పేర్లను విడుదల చేస్తుంది.',
    mariadb_mysql_dialect_adapted:
        'MariaDB Drizzle MySQL APIలతో ఎగుమతి అవుతుంది (dialect «{{dialect}}»). Drizzle 0.45లో ప్రథమ-తరగతి MariaDB dialect లేదు.',
    postgres_schema_qualified:
        'PostgreSQL schema «{{schema}}» pgSchema()తో ఎగుమతి అవుతుంది.',
    uuid_as_text:
        'ఫీల్డ్ «{{path}}» UUID టెక్స్ట్‌గా ఎగుమతి అవుతుంది ఎందుకంటే ఈ డేటాబేస్‌లో Drizzle 0.45 స్థానిక UUID రకం లేదు.',
    increment_omitted:
        '«{{path}}»పై స్వయంచాలక పెరుగుదల తొలగించబడింది ఎందుకంటే దానిని సురక్షితంగా చూపించలేము.',
    set_null_omitted:
        'విదేశీ-కీ నిలువువరుస NOT NULL కాబట్టి «{{path}}»పై ON DELETE SET NULL తొలగించబడింది.',
    sqlite_boolean_integer:
        'SQLiteలో స్థానిక boolean రకం లేనందున ఫీల్డ్ «{{path}}» boolean integer({ mode: "boolean" })గా ఎగుమతి అవుతుంది.',
    sqlite_json_text:
        'SQLite JSONను TEXTగా నిల్వ చేస్తుంది కాబట్టి ఫీల్డ్ «{{path}}» JSON text({ mode: "json" })గా ఎగుమతి అవుతుంది.',
    table_name_adjusted: {
        table: 'టేబుల్ «{{path}}» TypeScript స్థిరాంకం {{tsName}}గా ఎగుమతి అవుతుంది. భౌతిక టేబుల్ పేరు సంరక్షించబడుతుంది.',
        pgEnum: 'PostgreSQL enum «{{path}}» TypeScript స్థిరాంకం {{tsName}}గా ఎగుమతి అవుతుంది. భౌతిక enum పేరు సంరక్షించబడుతుంది.',
        pgSchema:
            'PostgreSQL schema «{{path}}» TypeScript స్థిరాంకం {{tsName}}గా ఎగుమతి అవుతుంది.',
    },
    table_name_collision:
        'నకిలీ TypeScript గుర్తింపుదారుని నివారించడానికి «{{path}}» కోసం టేబుల్ స్థిరాంకం «{{tsName}}» కేటాయించబడింది.',
    column_name_adjusted:
        'నిలువువరుస «{{path}}» TypeScript లక్షణం {{tsName}}గా ఎగుమతి అవుతుంది. భౌతిక నిలువువరుస పేరు సంరక్షించబడుతుంది.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'మూలం మరియు లక్ష్య నిలువువరుస జాబితాలు రెండూ లేనందున సమ్మేళన విదేశీ కీ «{{path}}» దాటవేయబడింది.',
        composite_fk_arity_mismatch:
            'మూలం మరియు లక్ష్య నిలువువరుసల సంఖ్య భిన్నంగా ఉన్నందున సమ్మేళన విదేశీ కీ «{{path}}» దాటవేయబడింది.',
        label_only:
            'లేబుల్ నుండి భౌతిక జాయిన్ టేబుల్ గుర్తించబడనందున అనేక-నుండి-అనేక సంబంధం «{{path}}» దాటవేయబడింది.',
        table_not_exported:
            'సూచించిన టేబుల్ ఎగుమతి కానందున సంబంధం «{{path}}» దాటవేయబడింది.',
        unresolved_member:
            'సూచించిన ఫీల్డ్ ఎగుమతి కానందున సంబంధం «{{path}}» దాటవేయబడింది.',
    },
    index_omitted: {
        unsupported_method:
            'రకం «{{indexType}}» ఎగుమతి కానందున సూచిక «{{path}}» తొలగించబడింది.',
        field_not_exported:
            'సూచించిన ఫీల్డ్ ఎగుమతి కానందున సూచిక «{{path}}» తొలగించబడింది.',
    },
    comment_omitted: {
        table: 'ఈ ఎగుమతిదారు ఉపయోగించే నిర్మిత వ్యాఖ్య API Drizzle 0.45లో లేనందున «{{path}}»పై టేబుల్ వ్యాఖ్య తొలగించబడింది.',
        column: 'ఈ ఎగుమతిదారు ఉపయోగించే నిర్మిత వ్యాఖ్య API Drizzle 0.45లో లేనందున «{{path}}»పై నిలువువరుస వ్యాఖ్య తొలగించబడింది.',
    },
    check_omitted: {
        table: 'ముడి SQL ఉత్పత్తి అయిన TypeScriptలోకి చొప్పించబడనందున «{{path}}»పై CHECK నియంత్రణ తొలగించబడింది.',
        column: 'ముడి SQL ఉత్పత్తి అయిన TypeScriptలోకి చొప్పించబడనందున «{{path}}»పై CHECK తొలగించబడింది.',
    },
    set_degraded: {
        set_as_text:
            'ఫీల్డ్ «{{path}}» SET టెక్స్ట్‌గా ఎగుమతి అవుతుంది; స్థానిక SET రకాలు ఉత్పత్తి కావు.',
    },
    enum_degraded: {
        ts_enum_only:
            'ఫీల్డ్ «{{path}}» enum text({ enum: [...] })గా ఎగుమతి అవుతుంది; SQLiteకి భౌతిక enum నియంత్రణ లేదు.',
        unsupported_enum:
            'స్థానిక Drizzle enumగా చూపించలేనందున ఫీల్డ్ «{{path}}» enum టెక్స్ట్‌గా ఎగుమతి అవుతుంది.',
        unknown_values:
            'enum విలువలు లేనందున ఫీల్డ్ «{{path}}» enum టెక్స్ట్‌గా ఎగుమతి అవుతుంది.',
    },
    type_omitted: {
        array: '«{{path}}»పై అర్రే ఫీల్డ్ Drizzle ఎగుమతి నుండి తొలగించబడింది.',
        unsupported: 'రకాన్ని చూపించలేనందున «{{path}}»పై ఫీల్డ్ తొలగించబడింది.',
        unimplemented_database:
            'డేటాబేస్ రకం «{{databaseType}}»కి రకం మ్యాపింగ్ అమలు కాలేదు.',
    },
    type_degraded: {
        binary_as_bytea:
            'ఫీల్డ్ «{{path}}» బైనరీ రకం bytea()గా ఎగుమతి అవుతుంది.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}»పై డిఫాల్ట్ తొలగించబడింది (మద్దతు లేని డిఫాల్ట్ రకం).',
        current_timestamp_non_datetime:
            '«{{path}}»పై డిఫాల్ట్ తొలగించబడింది (datetime కాని ఫీల్డ్‌పై CURRENT_TIMESTAMP).',
        sql_expression:
            '«{{path}}»పై డిఫాల్ట్ తొలగించబడింది (మద్దతు లేని SQL వ్యక్తీకరణ: {{expression}}).',
        unclear:
            '«{{path}}»పై డిఫాల్ట్ తొలగించబడింది (అస్పష్టమైన డిఫాల్ట్: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}»పై డిఫాల్ట్ తొలగించబడింది (boolean కాని ఫీల్డ్‌పై boolean డిఫాల్ట్).',
        numeric_on_non_numeric:
            '«{{path}}»పై డిఫాల్ట్ తొలగించబడింది (సంఖ్యాత్మకం కాని ఫీల్డ్‌పై సంఖ్యాత్మక డిఫాల్ట్).',
    },
};
