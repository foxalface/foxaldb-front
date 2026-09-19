import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'વ્યૂ «{{path}}» છોડી દેવામાં આવ્યું.',
    keyless_table_skipped:
        'ટેબલ «{{path}}» છોડવામાં આવી કારણ કે તેમાં સુરક્ષિત રીતે રજૂ થઈ શકે તેવા કૉલમ નથી.',
    keyless_table:
        'ટેબલ «{{path}}»માં પ્રાથમિક કી નથી અને id ઘડ્યા વિના મૂળ Drizzle ટેબલ તરીકે નિકાસ થાય છે.',
    schema_ignored_sqlite:
        'SQLite schema «{{schema}}» વાપરતું નથી; ટેબલ «{{path}}» schema qualifier વગર નિકાસ કરવામાં આવે છે.',
    mysql_catalog_omitted:
        'MySQL catalog «{{catalog}}» છોડી દેવામાં આવ્યું; Drizzle unqualified ટેબલ નામો અને એક જ ડેટાબેઝ કનેક્શન વાપરે છે.',
    mysql_multiple_catalogs_ignored:
        'MySQL નિકાસ {{count}} catalogs છોડે છે અને physical નામો unique રહેવાથી unqualified ટેબલ નામો ઉત્પન્ન કરે છે.',
    mariadb_catalog_omitted:
        'MariaDB catalog «{{catalog}}» છોડી દેવામાં આવ્યું; Drizzle unqualified ટેબલ નામો અને એક જ ડેટાબેઝ કનેક્શન વાપરે છે.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB નિકાસ {{count}} catalogs છોડે છે અને physical નામો unique રહેવાથી unqualified ટેબલ નામો ઉત્પન્ન કરે છે.',
    mariadb_mysql_dialect_adapted:
        'MariaDB Drizzleની MySQL API વડે નિકાસ થાય છે (dialect «{{dialect}}»). Drizzle 0.45માં પ્રથમ-વર્ગનું MariaDB dialect નથી.',
    postgres_schema_qualified:
        'PostgreSQL schema «{{schema}}» pgSchema() સાથે નિકાસ થાય છે.',
    uuid_as_text:
        'ફીલ્ડ «{{path}}»નું UUID ટેક્સ્ટ તરીકે નિકાસ થાય છે કારણ કે આ ડેટાબેઝમાં Drizzle 0.45નો મૂળ UUID પ્રકાર નથી.',
    increment_omitted:
        '«{{path}}» પર સ્વતઃ-વધારો છોડવામાં આવ્યો કારણ કે તેને સુરક્ષિત રીતે રજૂ કરી શકાતો નથી.',
    set_null_omitted:
        '«{{path}}» પર ON DELETE SET NULL છોડવામાં આવ્યું કારણ કે વિદેશી-કી કૉલમ NOT NULL છે.',
    sqlite_boolean_integer:
        'ફીલ્ડ «{{path}}»નું boolean integer({ mode: "boolean" }) તરીકે નિકાસ થાય છે કારણ કે SQLiteમાં મૂળ boolean પ્રકાર નથી.',
    sqlite_json_text:
        'ફીલ્ડ «{{path}}»નું JSON text({ mode: "json" }) તરીકે નિકાસ થાય છે કારણ કે SQLite JSONને TEXT તરીકે સંગ્રહે છે.',
    table_name_adjusted: {
        table: 'ટેબલ «{{path}}» TypeScript અચળ {{tsName}} તરીકે નિકાસ થાય છે. ભૌતિક ટેબલ નામ સાચવવામાં આવે છે.',
        pgEnum: 'PostgreSQL enum «{{path}}» TypeScript અચળ {{tsName}} તરીકે નિકાસ થાય છે. ભૌતિક enum નામ સાચવવામાં આવે છે.',
        pgSchema:
            'PostgreSQL schema «{{path}}» TypeScript અચળ {{tsName}} તરીકે નિકાસ થાય છે.',
    },
    table_name_collision:
        'ડુપ્લિકેટ TypeScript ઓળખકર્તા ટાળવા «{{path}}» માટે ટેબલ અચળ «{{tsName}}» ફાળવવામાં આવ્યું.',
    column_name_adjusted:
        'કૉલમ «{{path}}» TypeScript ગુણધર્મ {{tsName}} તરીકે નિકાસ થાય છે. ભૌતિક કૉલમ નામ સાચવવામાં આવે છે.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'સંયુક્ત વિદેશી કી «{{path}}» છોડવામાં આવી કારણ કે સ્ત્રોત અને લક્ષ્ય કૉલમ યાદીઓ બંને હાજર ન હતી.',
        composite_fk_arity_mismatch:
            'સંયુક્ત વિદેશી કી «{{path}}» છોડવામાં આવી કારણ કે સ્ત્રોત અને લક્ષ્ય કૉલમની સંખ્યા અલગ છે.',
        label_only:
            'ઘણા-થી-ઘણા સંબંધ «{{path}}» છોડવામાં આવ્યો કારણ કે લેબલથી ભૌતિક જોડાણ ટેબલ ઓળખાતી નથી.',
        table_not_exported:
            'સંબંધ «{{path}}» છોડવામાં આવ્યો કારણ કે સંદર્ભિત ટેબલ નિકાસ થઈ ન હતી.',
        unresolved_member:
            'સંબંધ «{{path}}» છોડવામાં આવ્યો કારણ કે સંદર્ભિત ફીલ્ડ નિકાસ થયું ન હતું.',
    },
    index_omitted: {
        unsupported_method:
            'અનુક્રમણિકા «{{path}}» છોડવામાં આવી કારણ કે પ્રકાર «{{indexType}}» નિકાસ થતો નથી.',
        field_not_exported:
            'અનુક્રમણિકા «{{path}}» છોડવામાં આવી કારણ કે સંદર્ભિત ફીલ્ડ નિકાસ થયું ન હતું.',
    },
    comment_omitted: {
        table: '«{{path}}» પર ટેબલ ટિપ્પણી છોડવામાં આવી કારણ કે Drizzle 0.45માં આ નિકાસક દ્વારા વપરાતું સંરચિત ટિપ્પણી API નથી.',
        column: '«{{path}}» પર કૉલમ ટિપ્પણી છોડવામાં આવી કારણ કે Drizzle 0.45માં આ નિકાસક દ્વારા વપરાતું સંરચિત ટિપ્પણી API નથી.',
    },
    check_omitted: {
        table: '«{{path}}» પર CHECK અવરોધ છોડવામાં આવ્યો કારણ કે કાચું SQL જનરેટ થયેલ TypeScriptમાં નાખવામાં આવતું નથી.',
        column: '«{{path}}» પર CHECK છોડવામાં આવ્યું કારણ કે કાચું SQL જનરેટ થયેલ TypeScriptમાં નાખવામાં આવતું નથી.',
    },
    set_degraded: {
        set_as_text:
            'ફીલ્ડ «{{path}}»નું SET ટેક્સ્ટ તરીકે નિકાસ થાય છે; મૂળ SET પ્રકારો બનતા નથી.',
    },
    enum_degraded: {
        ts_enum_only:
            'ફીલ્ડ «{{path}}»નું enum text({ enum: [...] }) તરીકે નિકાસ થાય છે; SQLiteમાં ભૌતિક enum અવરોધ નથી.',
        unsupported_enum:
            'ફીલ્ડ «{{path}}»નું enum ટેક્સ્ટ તરીકે નિકાસ થાય છે કારણ કે તેને મૂળ Drizzle enum તરીકે રજૂ કરી શકાતું નથી.',
        unknown_values:
            'ફીલ્ડ «{{path}}»નું enum ટેક્સ્ટ તરીકે નિકાસ થાય છે કારણ કે enum મૂલ્યો ખૂટે છે.',
    },
    type_omitted: {
        array: '«{{path}}» પર ઍરે ફીલ્ડ Drizzle નિકાસમાંથી છોડવામાં આવ્યું.',
        unsupported:
            '«{{path}}» પર ફીલ્ડ છોડવામાં આવ્યું કારણ કે તેનો પ્રકાર રજૂ કરી શકાતો નથી.',
        unimplemented_database:
            'ડેટાબેઝ પ્રકાર «{{databaseType}}» માટે પ્રકાર મેપિંગ અમલમાં નથી.',
    },
    type_degraded: {
        binary_as_bytea:
            'ફીલ્ડ «{{path}}»નો દ્વિઆધારી પ્રકાર bytea() તરીકે નિકાસ થાય છે.',
    },
    default_omitted: {
        unsupported_type:
            '«{{path}}» પર ડિફોલ્ટ છોડવામાં આવ્યું (અસમર્થિત ડિફોલ્ટ પ્રકાર).',
        current_timestamp_non_datetime:
            '«{{path}}» પર ડિફોલ્ટ છોડવામાં આવ્યું (non-datetime ફીલ્ડ પર CURRENT_TIMESTAMP).',
        sql_expression:
            '«{{path}}» પર ડિફોલ્ટ છોડવામાં આવ્યું (અસમર્થિત SQL અભિવ્યક્તિ: {{expression}}).',
        unclear:
            '«{{path}}» પર ડિફોલ્ટ છોડવામાં આવ્યું (અસ્પષ્ટ ડિફોલ્ટ: {{expression}}).',
        boolean_on_non_boolean:
            '«{{path}}» પર ડિફોલ્ટ છોડવામાં આવ્યું (non-boolean ફીલ્ડ પર boolean ડિફોલ્ટ).',
        numeric_on_non_numeric:
            '«{{path}}» પર ડિફોલ્ટ છોડવામાં આવ્યું (બિન-સંખ્યાત્મક ફીલ્ડ પર સંખ્યાત્મક ડિફોલ્ટ).',
    },
};
