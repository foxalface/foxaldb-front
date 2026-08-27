import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

const chooseIntentPatch = {
    ar: ['استيراد من قاعدة بيانات موجودة', 'ليس لدي ملف مخطط'],
    bn: ['বিদ্যমান ডাটাবেস থেকে আমদানি করুন', 'আমার কাছে স্কিমা ফাইল নেই'],
    de: ['Aus vorhandener Datenbank importieren', 'Ich habe keine Schemadatei'],
    es: [
        'Importar desde una base de datos existente',
        'No tengo un archivo de esquema',
    ],
    fr: [
        'Importer depuis une base existante',
        "Je n'ai pas de fichier de schéma",
    ],
    gu: ['હાલની ડેટાબેઝમાંથી આયાત કરો', 'મારી પાસે સ્કીમા ફાઇલ નથી'],
    hi: ['मौजूदा डेटाबेस से आयात करें', 'मेरे पास स्कीमा फ़ाइल नहीं है'],
    hr: ['Uvezi iz postojeće baze', 'Nemam datoteku sheme'],
    id_ID: ['Impor dari database yang ada', 'Saya tidak punya file skema'],
    ja: ['既存のデータベースからインポート', 'スキーマファイルがありません'],
    ko_KR: ['기존 데이터베이스에서 가져오기', '스키마 파일이 없습니다'],
    mr: ['विद्यमान डेटाबेसमधून आयात करा', 'माझ्याकडे स्कीमा फाइल नाही'],
    ne: ['अवस्थित डाटाबेसबाट आयात गर्नुहोस्', 'मसँग स्किमा फाइल छैन'],
    pt_BR: [
        'Importar de um banco existente',
        'Não tenho um arquivo de esquema',
    ],
    ru: ['Импорт из существующей базы', 'У меня нет файла схемы'],
    te: ['ఇప్పటికే ఉన్న డేటాబేస్ నుండి దిగుమతి', 'నా దగ్గర స్కీమా ఫైల్ లేదు'],
    tr: ['Mevcut veritabanından içe aktar', 'Şema dosyam yok'],
    uk: ['Імпорт з наявної бази', 'У мене немає файлу схеми'],
    vi: ['Nhập từ cơ sở dữ liệu hiện có', 'Tôi không có tệp lược đồ'],
    zh_CN: ['从现有数据库导入', '我没有架构文件'],
    zh_TW: ['從現有資料庫匯入', '我沒有結構描述檔案'],
};

const importFromDbTranslations = {
    fr: {
        title: 'Importer depuis une base existante',
        description:
            "Utilisez cette option lorsque vous n'avez pas de fichier SQL ou DBML. Exécutez la requête dans votre base, puis collez le résultat ci-dessous.",
        database_edition: 'Édition de la base',
        edition_regular: 'Standard',
        run_query: 'Exécutez cette requête dans votre base',
        client_sql: 'SQL',
        paste_result: 'Collez le résultat',
        paste_result_placeholder: 'Collez le résultat de la requête ici…',
        check_result: 'Vérifier le résultat',
        valid_result: 'Le résultat semble valide.',
        invalid_result:
            'Le résultat n’a pas pu être validé. Vérifiez le contenu et réessayez.',
        truncated_result:
            'Le résultat semble tronqué. Ajustez les paramètres de votre client SQL et relancez la requête.',
        waiting_for_result: 'Collez le résultat de la requête pour continuer.',
        unsupported_database:
            "L'extraction de schéma n'est pas disponible pour ce type de base.",
        import_failed:
            "Le schéma n'a pas pu être importé. Vérifiez le résultat et réessayez.",
        back: 'Retour',
        continue: 'Continuer',
    },
    de: {
        title: 'Aus vorhandener Datenbank importieren',
        description:
            'Verwenden Sie dies, wenn Sie keine SQL- oder DBML-Schemadatei haben. Führen Sie die Abfrage in Ihrer Datenbank aus und fügen Sie das Ergebnis unten ein.',
        database_edition: 'Datenbankedition',
        edition_regular: 'Standard',
        run_query: 'Führen Sie diese Abfrage in Ihrer Datenbank aus',
        client_sql: 'SQL',
        paste_result: 'Ergebnis einfügen',
        paste_result_placeholder: 'Abfrageergebnis hier einfügen…',
        check_result: 'Ergebnis prüfen',
        valid_result: 'Das Ergebnis sieht gültig aus.',
        invalid_result:
            'Das Ergebnis konnte nicht validiert werden. Prüfen Sie den Inhalt und versuchen Sie es erneut.',
        truncated_result:
            'Das Ergebnis scheint abgeschnitten zu sein. Passen Sie die SQL-Client-Einstellungen an und führen Sie die Abfrage erneut aus.',
        waiting_for_result:
            'Fügen Sie das Abfrageergebnis ein, um fortzufahren.',
        unsupported_database:
            'Schemaextraktion ist für diesen Datenbanktyp nicht verfügbar.',
        import_failed:
            'Das Datenbankschema konnte nicht importiert werden. Prüfen Sie das Ergebnis und versuchen Sie es erneut.',
        back: 'Zurück',
        continue: 'Weiter',
    },
    es: {
        title: 'Importar desde una base de datos existente',
        description:
            'Úselo cuando no tenga un archivo de esquema SQL o DBML. Ejecute la consulta en su base de datos y pegue el resultado abajo.',
        database_edition: 'Edición de la base de datos',
        edition_regular: 'Estándar',
        run_query: 'Ejecute esta consulta en su base de datos',
        client_sql: 'SQL',
        paste_result: 'Pegue el resultado',
        paste_result_placeholder: 'Pegue el resultado de la consulta aquí…',
        check_result: 'Comprobar resultado',
        valid_result: 'El resultado parece válido.',
        invalid_result:
            'No se pudo validar el resultado. Compruebe el contenido e inténtelo de nuevo.',
        truncated_result:
            'El resultado puede estar truncado. Ajuste la configuración de su cliente SQL y vuelva a ejecutar la consulta.',
        waiting_for_result: 'Pegue el resultado de la consulta para continuar.',
        unsupported_database:
            'La extracción de esquema no está disponible para este tipo de base de datos.',
        import_failed:
            'No se pudo importar el esquema de la base de datos. Compruebe el resultado e inténtelo de nuevo.',
        back: 'Atrás',
        continue: 'Continuar',
    },
};

const enImport = {
    title: 'Import from an existing database',
    description:
        "Use this when you don't have a SQL or DBML schema file. Run the query in your database, then paste the result below.",
    database_edition: 'Database edition',
    edition_regular: 'Regular',
    run_query: 'Run this query in your database',
    client_sql: 'SQL',
    paste_result: 'Paste the result',
    paste_result_placeholder: 'Paste the query result here…',
    check_result: 'Check result',
    valid_result: 'Result looks valid.',
    invalid_result:
        'The result could not be validated. Check the content and try again.',
    truncated_result:
        'The result may be truncated. Adjust your SQL client settings and run the query again.',
    waiting_for_result: 'Paste the query result to continue.',
    unsupported_database:
        'Schema extraction is not available for this database type.',
    import_failed:
        'The database schema could not be imported. Check the result and try again.',
    back: 'Back',
    continue: 'Continue',
};

function esc(s) {
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildImportBlock(t) {
    return `            import_from_database: {
                title: '${esc(t.title)}',
                description: '${esc(t.description)}',
                database_edition: '${esc(t.database_edition)}',
                edition_regular: '${esc(t.edition_regular)}',
                run_query: '${esc(t.run_query)}',
                client_sql: '${esc(t.client_sql)}',
                paste_result: '${esc(t.paste_result)}',
                paste_result_placeholder: '${esc(t.paste_result_placeholder)}',
                check_result: '${esc(t.check_result)}',
                valid_result: '${esc(t.valid_result)}',
                invalid_result: '${esc(t.invalid_result)}',
                truncated_result: '${esc(t.truncated_result)}',
                waiting_for_result: '${esc(t.waiting_for_result)}',
                unsupported_database: '${esc(t.unsupported_database)}',
                import_failed: '${esc(t.import_failed)}',
                back: '${esc(t.back)}',
                continue: '${esc(t.continue)}',
            },
`;
}

for (const file of fs.readdirSync(localesDir).filter((f) => f !== 'en.ts')) {
    const locale = file.replace('.ts', '');
    const filePath = path.join(localesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const [importFromDbLabel, noSchemaFile] = chooseIntentPatch[locale] ?? [
        enImport.title,
        "I don't have a schema file",
    ];

    if (!content.includes('no_schema_file:')) {
        content = content.replace(
            /( {16}import_schema_description:[^\n]*\n)( {16}back:)/,
            `$1                import_from_database: '${esc(importFromDbLabel)}',\n                no_schema_file: '${esc(noSchemaFile)}',\n$2`
        );
    }

    content = content.replace(
        /import_schema_description:\s*'[^']*',/,
        "import_schema_description: 'Import tables and relationships from SQL or DBML.',"
    );

    if (!content.includes('\n            import_from_database: {')) {
        const t = importFromDbTranslations[locale] ?? enImport;
        const block = buildImportBlock(t);
        content = content.replace(
            /( {12}choose_intent: \{[\s\S]*?\n {12}\},\n\n)/,
            `$1${block}\n`
        );
    }

    fs.writeFileSync(filePath, content);
    console.log('patched', locale);
}
