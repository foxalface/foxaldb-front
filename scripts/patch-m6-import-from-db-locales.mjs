import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';

const translations = {
    ar: {
        title: 'استيراد من قاعدة بيانات موجودة',
        description:
            'استخدم هذا عندما لا يكون لديك ملف SQL أو DBML. شغّل الاستعلام في قاعدة البيانات ثم الصق النتيجة أدناه.',
        database_edition: 'إصدار قاعدة البيانات',
        edition_regular: 'عادي',
        run_query: 'شغّل هذا الاستعلام في قاعدة البيانات',
        client_sql: 'SQL',
        paste_result: 'الصق النتيجة',
        paste_result_placeholder: 'الصق نتيجة الاستعلام هنا…',
        check_result: 'تحقق من النتيجة',
        valid_result: 'تبدو النتيجة صالحة.',
        invalid_result:
            'تعذر التحقق من النتيجة. تحقق من المحتوى وحاول مرة أخرى.',
        truncated_result:
            'قد تكون النتيجة مقطوعة. عدّل إعدادات عميل SQL وأعد تشغيل الاستعلام.',
        waiting_for_result: 'الصق نتيجة الاستعلام للمتابعة.',
        unsupported_database:
            'استخراج المخطط غير متاح لهذا النوع من قواعد البيانات.',
        import_failed:
            'تعذر استيراد مخطط قاعدة البيانات. تحقق من النتيجة وحاول مرة أخرى.',
        back: 'رجوع',
        continue: 'متابعة',
        import_schema_description: 'استيراد الجداول والعلاقات من SQL أو DBML.',
    },
    bn: {
        title: 'বিদ্যমান ডাটাবেস থেকে আমদানি করুন',
        description:
            'যখন আপনার কাছে SQL বা DBML স্কিমা ফাইল নেই তখন এটি ব্যবহার করুন। আপনার ডাটাবেসে কোয়েরি চালান, তারপর নিচে ফলাফল পেস্ট করুন।',
        database_edition: 'ডাটাবেস সংস্করণ',
        edition_regular: 'নিয়মিত',
        run_query: 'আপনার ডাটাবেসে এই কোয়েরি চালান',
        client_sql: 'SQL',
        paste_result: 'ফলাফল পেস্ট করুন',
        paste_result_placeholder: 'কোয়েরির ফলাফল এখানে পেস্ট করুন…',
        check_result: 'ফলাফল পরীক্ষা করুন',
        valid_result: 'ফলাফল বৈধ বলে মনে হচ্ছে।',
        invalid_result:
            'ফলাফল যাচাই করা যায়নি। বিষয়বস্তু পরীক্ষা করে আবার চেষ্টা করুন।',
        truncated_result:
            'ফলাফলটি কাটা হতে পারে। SQL ক্লায়েন্ট সেটিংস সামঞ্জস্য করে কোয়েরি আবার চালান।',
        waiting_for_result: 'চালিয়ে যেতে কোয়েরির ফলাফল পেস্ট করুন।',
        unsupported_database:
            'এই ডাটাবেস ধরনের জন্য স্কিমা এক্সট্রাকশন উপলব্ধ নয়।',
        import_failed:
            'ডাটাবেস স্কিমা আমদানি করা যায়নি। ফলাফল পরীক্ষা করে আবার চেষ্টা করুন।',
        back: 'পিছনে',
        continue: 'চালিয়ে যান',
        import_schema_description:
            'SQL বা DBML থেকে টেবিল ও সম্পর্ক আমদানি করুন।',
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
        import_schema_description:
            'Tabellen und Beziehungen aus SQL oder DBML importieren.',
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
        import_schema_description:
            'Importe tablas y relaciones desde SQL o DBML.',
    },
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
        import_schema_description:
            'Importez des tables et des relations depuis SQL ou DBML.',
    },
    gu: {
        title: 'હાલની ડેટાબેઝમાંથી આયાત કરો',
        description:
            'જ્યારે તમારી પાસે SQL અથવા DBML સ્કીમા ફાઇલ ન હોય ત્યારે આનો ઉપયોગ કરો. તમારી ડેટાબેઝમાં ક્વેરી ચલાવો, પછી નીચે પરિણામ પેસ્ટ કરો.',
        database_edition: 'ડેટાબેઝ આવૃત્તિ',
        edition_regular: 'નિયમિત',
        run_query: 'તમારી ડેટાબેઝમાં આ ક્વેરી ચલાવો',
        client_sql: 'SQL',
        paste_result: 'પરિણામ પેસ્ટ કરો',
        paste_result_placeholder: 'ક્વેરીનું પરિણામ અહીં પેસ્ટ કરો…',
        check_result: 'પરિણામ તપાસો',
        valid_result: 'પરિણામ માન્ય લાગે છે.',
        invalid_result:
            'પરિણામ માન્ય કરી શકાયું નથી. સામગ્રી તપાસો અને ફરી પ્રયાસ કરો.',
        truncated_result:
            'પરિણામ કટાયેલું હોઈ શકે છે. SQL ક્લાયંટ સેટિંગ્સ સમાયોજિત કરી ક્વેરી ફરી ચલાવો.',
        waiting_for_result: 'ચાલુ રાખવા ક્વેરીનું પરિણામ પેસ્ટ કરો.',
        unsupported_database:
            'આ ડેટાબેઝ પ્રકાર માટે સ્કીમા એક્સટ્રેક્શન ઉપલબ્ધ નથી.',
        import_failed:
            'ડેટાબેઝ સ્કીમા આયાત કરી શકાઈ નથી. પરિણામ તપાસો અને ફરી પ્રયાસ કરો.',
        back: 'પાછા',
        continue: 'ચાલુ રાખો',
        import_schema_description:
            'SQL અથવા DBML માંથી ટેબલ અને સંબંધો આયાત કરો.',
    },
    hi: {
        title: 'मौजूदा डेटाबेस से आयात करें',
        description:
            'जब आपके पास SQL या DBML स्कीमा फ़ाइल न हो तो इसका उपयोग करें। अपने डेटाबेस में क्वेरी चलाएँ, फिर नीचे परिणाम पेस्ट करें।',
        database_edition: 'डेटाबेस संस्करण',
        edition_regular: 'सामान्य',
        run_query: 'अपने डेटाबेस में यह क्वेरी चलाएँ',
        client_sql: 'SQL',
        paste_result: 'परिणाम पेस्ट करें',
        paste_result_placeholder: 'क्वेरी का परिणाम यहाँ पेस्ट करें…',
        check_result: 'परिणाम जाँचें',
        valid_result: 'परिणाम मान्य लगता है।',
        invalid_result:
            'परिणाम सत्यापित नहीं हो सका। सामग्री जाँचें और पुनः प्रयास करें।',
        truncated_result:
            'परिणाम कटा हुआ हो सकता है। SQL क्लाइंट सेटिंग समायोजित करें और क्वेरी फिर चलाएँ।',
        waiting_for_result: 'जारी रखने के लिए क्वेरी का परिणाम पेस्ट करें।',
        unsupported_database:
            'इस डेटाबेस प्रकार के लिए स्कीमा निष्कर्षण उपलब्ध नहीं है।',
        import_failed:
            'डेटाबेस स्कीमा आयात नहीं हो सका। परिणाम जाँचें और पुनः प्रयास करें।',
        back: 'वापस',
        continue: 'जारी रखें',
        import_schema_description:
            'SQL या DBML से तालिकाएँ और संबंध आयात करें।',
    },
    hr: {
        title: 'Uvezi iz postojeće baze',
        description:
            'Koristite ovo kada nemate SQL ili DBML datoteku sheme. Pokrenite upit u bazi, zatim zalijepite rezultat ispod.',
        database_edition: 'Izdanje baze',
        edition_regular: 'Standardno',
        run_query: 'Pokrenite ovaj upit u bazi',
        client_sql: 'SQL',
        paste_result: 'Zalijepite rezultat',
        paste_result_placeholder: 'Zalijepite rezultat upita ovdje…',
        check_result: 'Provjeri rezultat',
        valid_result: 'Rezultat izgleda valjano.',
        invalid_result:
            'Rezultat nije mogao biti potvrđen. Provjerite sadržaj i pokušajte ponovno.',
        truncated_result:
            'Rezultat je možda skraćen. Prilagodite postavke SQL klijenta i ponovno pokrenite upit.',
        waiting_for_result: 'Zalijepite rezultat upita za nastavak.',
        unsupported_database:
            'Ekstrakcija sheme nije dostupna za ovu vrstu baze.',
        import_failed:
            'Shema baze nije mogla biti uvezena. Provjerite rezultat i pokušajte ponovno.',
        back: 'Natrag',
        continue: 'Nastavi',
        import_schema_description:
            'Uvezite tablice i veze iz SQL-a ili DBML-a.',
    },
    id_ID: {
        title: 'Impor dari database yang ada',
        description:
            'Gunakan ini jika Anda tidak memiliki file skema SQL atau DBML. Jalankan kueri di database Anda, lalu tempel hasilnya di bawah.',
        database_edition: 'Edisi database',
        edition_regular: 'Reguler',
        run_query: 'Jalankan kueri ini di database Anda',
        client_sql: 'SQL',
        paste_result: 'Tempel hasil',
        paste_result_placeholder: 'Tempel hasil kueri di sini…',
        check_result: 'Periksa hasil',
        valid_result: 'Hasil terlihat valid.',
        invalid_result:
            'Hasil tidak dapat divalidasi. Periksa konten dan coba lagi.',
        truncated_result:
            'Hasil mungkin terpotong. Sesuaikan pengaturan klien SQL dan jalankan kueri lagi.',
        waiting_for_result: 'Tempel hasil kueri untuk melanjutkan.',
        unsupported_database:
            'Ekstraksi skema tidak tersedia untuk jenis database ini.',
        import_failed:
            'Skema database tidak dapat diimpor. Periksa hasil dan coba lagi.',
        back: 'Kembali',
        continue: 'Lanjutkan',
        import_schema_description: 'Impor tabel dan relasi dari SQL atau DBML.',
    },
    ja: {
        title: '既存のデータベースからインポート',
        description:
            'SQL または DBML のスキーマファイルがない場合に使用します。データベースでクエリを実行し、結果を下に貼り付けてください。',
        database_edition: 'データベース版',
        edition_regular: '標準',
        run_query: 'データベースでこのクエリを実行',
        client_sql: 'SQL',
        paste_result: '結果を貼り付け',
        paste_result_placeholder: 'クエリ結果をここに貼り付け…',
        check_result: '結果を確認',
        valid_result: '結果は有効です。',
        invalid_result:
            '結果を検証できませんでした。内容を確認して再試行してください。',
        truncated_result:
            '結果が切り詰められている可能性があります。SQL クライアントの設定を調整してクエリを再実行してください。',
        waiting_for_result: '続行するにはクエリ結果を貼り付けてください。',
        unsupported_database:
            'このデータベース種別ではスキーマ抽出は利用できません。',
        import_failed:
            'データベーススキーマをインポートできませんでした。結果を確認して再試行してください。',
        back: '戻る',
        continue: '続行',
        import_schema_description:
            'SQL または DBML からテーブルとリレーションをインポートします。',
    },
    ko_KR: {
        title: '기존 데이터베이스에서 가져오기',
        description:
            'SQL 또는 DBML 스키마 파일이 없을 때 사용하세요. 데이터베이스에서 쿼리를 실행한 뒤 아래에 결과를 붙여넣으세요.',
        database_edition: '데이터베이스 에디션',
        edition_regular: '일반',
        run_query: '데이터베이스에서 이 쿼리 실행',
        client_sql: 'SQL',
        paste_result: '결과 붙여넣기',
        paste_result_placeholder: '쿼리 결과를 여기에 붙여넣으세요…',
        check_result: '결과 확인',
        valid_result: '결과가 유효해 보입니다.',
        invalid_result:
            '결과를 검증할 수 없습니다. 내용을 확인하고 다시 시도하세요.',
        truncated_result:
            '결과가 잘렸을 수 있습니다. SQL 클라이언트 설정을 조정하고 쿼리를 다시 실행하세요.',
        waiting_for_result: '계속하려면 쿼리 결과를 붙여넣으세요.',
        unsupported_database:
            '이 데이터베이스 유형에서는 스키마 추출을 사용할 수 없습니다.',
        import_failed:
            '데이터베이스 스키마를 가져올 수 없습니다. 결과를 확인하고 다시 시도하세요.',
        back: '뒤로',
        continue: '계속',
        import_schema_description:
            'SQL 또는 DBML에서 테이블과 관계를 가져옵니다.',
    },
    mr: {
        title: 'विद्यमान डेटाबेसमधून आयात करा',
        description:
            'जेव्हा तुमच्याकडे SQL किंवा DBML स्कीमा फाइल नसेल तेव्हा हे वापरा. तुमच्या डेटाबेसमध्ये क्वेरी चालवा, नंतर खाली निकाल पेस्ट करा.',
        database_edition: 'डेटाबेस आवृत्ती',
        edition_regular: 'नियमित',
        run_query: 'तुमच्या डेटाबेसमध्ये ही क्वेरी चालवा',
        client_sql: 'SQL',
        paste_result: 'निकाल पेस्ट करा',
        paste_result_placeholder: 'क्वेरीचा निकाल येथे पेस्ट करा…',
        check_result: 'निकाल तपासा',
        valid_result: 'निकाल वैध दिसतो.',
        invalid_result:
            'निकाल प्रमाणित करता आला नाही. सामग्री तपासा आणि पुन्हा प्रयत्न करा.',
        truncated_result:
            'निकाल कापला असू शकतो. SQL क्लायंट सेटिंग्ज समायोजित करा आणि क्वेरी पुन्हा चालवा.',
        waiting_for_result: 'पुढे जाण्यासाठी क्वेरीचा निकाल पेस्ट करा.',
        unsupported_database:
            'या डेटाबेस प्रकारासाठी स्कीमा एक्सट्रॅक्शन उपलब्ध नाही.',
        import_failed:
            'डेटाबेस स्कीमा आयात करता आली नाही. निकाल तपासा आणि पुन्हा प्रयत्न करा.',
        back: 'मागे',
        continue: 'पुढे',
        import_schema_description:
            'SQL किंवा DBML मधून टेबल आणि संबंध आयात करा.',
    },
    ne: {
        title: 'अवस्थित डाटाबेसबाट आयात गर्नुहोस्',
        description:
            'जब तपाईंसँग SQL वा DBML स्किमा फाइल छैन भने यो प्रयोग गर्नुहोस्। आफ्नो डाटाबेसमा क्वेरी चलाउनुहोस्, त्यसपछि तल नतिजा टाँस्नुहोस्।',
        database_edition: 'डाटाबेस संस्करण',
        edition_regular: 'नियमित',
        run_query: 'आफ्नो डाटाबेसमा यो क्वेरी चलाउनुहोस्',
        client_sql: 'SQL',
        paste_result: 'नतिजा टाँस्नुहोस्',
        paste_result_placeholder: 'क्वेरीको नतिजा यहाँ टाँस्नुहोस्…',
        check_result: 'नतिजा जाँच गर्नुहोस्',
        valid_result: 'नतिजा मान्य देखिन्छ।',
        invalid_result:
            'नतिजा प्रमाणित गर्न सकिएन। सामग्री जाँच गर्नुहोस् र फेरि प्रयास गर्नुहोस्।',
        truncated_result:
            'नतिजा काटिएको हुन सक्छ। SQL क्लाइन्ट सेटिङ समायोजन गरी क्वेरी फेरि चलाउनुहोस्।',
        waiting_for_result: 'जारी राख्न क्वेरीको नतिजा टाँस्नुहोस्।',
        unsupported_database:
            'यो डाटाबेस प्रकारका लागि स्किमा निकाल्न उपलब्ध छैन।',
        import_failed:
            'डाटाबेस स्किमा आयात गर्न सकिएन। नतिजा जाँच गर्नुहोस् र फेरि प्रयास गर्नुहोस्।',
        back: 'पछाडि',
        continue: 'जारी राख्नुहोस्',
        import_schema_description:
            'SQL वा DBML बाट तालिका र सम्बन्ध आयात गर्नुहोस्।',
    },
    pt_BR: {
        title: 'Importar de um banco existente',
        description:
            'Use quando não tiver um arquivo de esquema SQL ou DBML. Execute a consulta no banco e cole o resultado abaixo.',
        database_edition: 'Edição do banco',
        edition_regular: 'Padrão',
        run_query: 'Execute esta consulta no seu banco',
        client_sql: 'SQL',
        paste_result: 'Cole o resultado',
        paste_result_placeholder: 'Cole o resultado da consulta aqui…',
        check_result: 'Verificar resultado',
        valid_result: 'O resultado parece válido.',
        invalid_result:
            'Não foi possível validar o resultado. Verifique o conteúdo e tente novamente.',
        truncated_result:
            'O resultado pode estar truncado. Ajuste as configurações do cliente SQL e execute a consulta novamente.',
        waiting_for_result: 'Cole o resultado da consulta para continuar.',
        unsupported_database:
            'A extração de esquema não está disponível para este tipo de banco.',
        import_failed:
            'Não foi possível importar o esquema do banco. Verifique o resultado e tente novamente.',
        back: 'Voltar',
        continue: 'Continuar',
        import_schema_description:
            'Importe tabelas e relacionamentos de SQL ou DBML.',
    },
    ru: {
        title: 'Импорт из существующей базы',
        description:
            'Используйте, если у вас нет файла схемы SQL или DBML. Выполните запрос в базе и вставьте результат ниже.',
        database_edition: 'Редакция СУБД',
        edition_regular: 'Обычная',
        run_query: 'Выполните этот запрос в базе',
        client_sql: 'SQL',
        paste_result: 'Вставьте результат',
        paste_result_placeholder: 'Вставьте результат запроса сюда…',
        check_result: 'Проверить результат',
        valid_result: 'Результат выглядит корректным.',
        invalid_result:
            'Не удалось проверить результат. Проверьте содержимое и повторите попытку.',
        truncated_result:
            'Результат может быть обрезан. Настройте клиент SQL и выполните запрос снова.',
        waiting_for_result: 'Вставьте результат запроса, чтобы продолжить.',
        unsupported_database:
            'Извлечение схемы недоступно для этого типа базы.',
        import_failed:
            'Не удалось импортировать схему базы. Проверьте результат и повторите попытку.',
        back: 'Назад',
        continue: 'Продолжить',
        import_schema_description:
            'Импортируйте таблицы и связи из SQL или DBML.',
    },
    te: {
        title: 'ఇప్పటికే ఉన్న డేటాబేస్ నుండి దిగుమతి చేయండి',
        description:
            'మీకు SQL లేదా DBML స్కీమా ఫైల్ లేనప్పుడు దీన్ని ఉపయోగించండి. మీ డేటాబేస్‌లో క్వెరీని అమలు చేసి, ఫలితాన్ని క్రింద అతికించండి.',
        database_edition: 'డేటాబేస్ ఎడిషన్',
        edition_regular: 'సాధారణ',
        run_query: 'మీ డేటాబేస్‌లో ఈ క్వెరీని అమలు చేయండి',
        client_sql: 'SQL',
        paste_result: 'ఫలితాన్ని అతికించండి',
        paste_result_placeholder: 'క్వెరీ ఫలితాన్ని ఇక్కడ అతికించండి…',
        check_result: 'ఫలితాన్ని తనిఖీ చేయండి',
        valid_result: 'ఫలితం చెల్లుబాటు అయ్యేలా ఉంది.',
        invalid_result:
            'ఫలితాన్ని ధృవీకరించలేకపోయాం. కంటెంట్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
        truncated_result:
            'ఫలితం కత్తిరించబడి ఉండవచ్చు. SQL క్లయింట్ సెట్టింగ్‌లను సర్దుబాటు చేసి క్వెరీని మళ్లీ అమలు చేయండి.',
        waiting_for_result: 'కొనసాగడానికి క్వెరీ ఫలితాన్ని అతికించండి.',
        unsupported_database:
            'ఈ డేటాబేస్ రకానికి స్కీమా ఎక్స్‌ట్రాక్షన్ అందుబాటులో లేదు.',
        import_failed:
            'డేటాబేస్ స్కీమాను దిగుమతి చేయలేకపోయాం. ఫలితాన్ని తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
        back: 'వెనక్కి',
        continue: 'కొనసాగించు',
        import_schema_description:
            'SQL లేదా DBML నుండి పట్టికలు మరియు సంబంధాలను దిగుమతి చేయండి.',
    },
    tr: {
        title: 'Mevcut veritabanından içe aktar',
        description:
            'SQL veya DBML şema dosyanız yoksa bunu kullanın. Veritabanınızda sorguyu çalıştırın, ardından sonucu aşağıya yapıştırın.',
        database_edition: 'Veritabanı sürümü',
        edition_regular: 'Standart',
        run_query: 'Bu sorguyu veritabanınızda çalıştırın',
        client_sql: 'SQL',
        paste_result: 'Sonucu yapıştırın',
        paste_result_placeholder: 'Sorgu sonucunu buraya yapıştırın…',
        check_result: 'Sonucu kontrol et',
        valid_result: 'Sonuç geçerli görünüyor.',
        invalid_result:
            'Sonuç doğrulanamadı. İçeriği kontrol edip tekrar deneyin.',
        truncated_result:
            'Sonuç kesilmiş olabilir. SQL istemci ayarlarını düzenleyip sorguyu yeniden çalıştırın.',
        waiting_for_result: 'Devam etmek için sorgu sonucunu yapıştırın.',
        unsupported_database:
            'Bu veritabanı türü için şema çıkarma kullanılamıyor.',
        import_failed:
            'Veritabanı şeması içe aktarılamadı. Sonucu kontrol edip tekrar deneyin.',
        back: 'Geri',
        continue: 'Devam',
        import_schema_description:
            'SQL veya DBML kaynaklı tabloları ve ilişkileri içe aktarın.',
    },
    uk: {
        title: 'Імпорт з наявної бази',
        description:
            'Використовуйте, якщо у вас немає файлу схеми SQL або DBML. Виконайте запит у базі та вставте результат нижче.',
        database_edition: 'Редакція СУБД',
        edition_regular: 'Звичайна',
        run_query: 'Виконайте цей запит у базі',
        client_sql: 'SQL',
        paste_result: 'Вставте результат',
        paste_result_placeholder: 'Вставте результат запиту сюди…',
        check_result: 'Перевірити результат',
        valid_result: 'Результат виглядає коректним.',
        invalid_result:
            'Не вдалося перевірити результат. Перевірте вміст і повторіть спробу.',
        truncated_result:
            'Результат може бути обрізаним. Налаштуйте клієнт SQL і виконайте запит знову.',
        waiting_for_result: 'Вставте результат запиту, щоб продовжити.',
        unsupported_database: 'Вилучення схеми недоступне для цього типу бази.',
        import_failed:
            'Не вдалося імпортувати схему бази. Перевірте результат і повторіть спробу.',
        back: 'Назад',
        continue: 'Продовжити',
        import_schema_description:
            'Імпортуйте таблиці та зв’язки з SQL або DBML.',
    },
    vi: {
        title: 'Nhập từ cơ sở dữ liệu hiện có',
        description:
            'Dùng khi bạn không có tệp lược đồ SQL hoặc DBML. Chạy truy vấn trong cơ sở dữ liệu, rồi dán kết quả bên dưới.',
        database_edition: 'Phiên bản cơ sở dữ liệu',
        edition_regular: 'Thường',
        run_query: 'Chạy truy vấn này trong cơ sở dữ liệu',
        client_sql: 'SQL',
        paste_result: 'Dán kết quả',
        paste_result_placeholder: 'Dán kết quả truy vấn tại đây…',
        check_result: 'Kiểm tra kết quả',
        valid_result: 'Kết quả có vẻ hợp lệ.',
        invalid_result:
            'Không thể xác thực kết quả. Kiểm tra nội dung và thử lại.',
        truncated_result:
            'Kết quả có thể bị cắt ngắn. Điều chỉnh cài đặt SQL client và chạy lại truy vấn.',
        waiting_for_result: 'Dán kết quả truy vấn để tiếp tục.',
        unsupported_database:
            'Không hỗ trợ trích xuất lược đồ cho loại cơ sở dữ liệu này.',
        import_failed:
            'Không thể nhập lược đồ cơ sở dữ liệu. Kiểm tra kết quả và thử lại.',
        back: 'Quay lại',
        continue: 'Tiếp tục',
        import_schema_description: 'Nhập bảng và quan hệ từ SQL hoặc DBML.',
    },
    zh_CN: {
        title: '从现有数据库导入',
        description:
            '当你没有 SQL 或 DBML 架构文件时使用此选项。在数据库中运行查询，然后将结果粘贴到下方。',
        database_edition: '数据库版本',
        edition_regular: '标准',
        run_query: '在数据库中运行此查询',
        client_sql: 'SQL',
        paste_result: '粘贴结果',
        paste_result_placeholder: '在此粘贴查询结果…',
        check_result: '检查结果',
        valid_result: '结果看起来有效。',
        invalid_result: '无法验证结果。请检查内容后重试。',
        truncated_result:
            '结果可能被截断。请调整 SQL 客户端设置后重新运行查询。',
        waiting_for_result: '粘贴查询结果以继续。',
        unsupported_database: '此数据库类型不支持架构提取。',
        import_failed: '无法导入数据库架构。请检查结果后重试。',
        back: '返回',
        continue: '继续',
        import_schema_description: '从 SQL 或 DBML 导入表和关系。',
    },
    zh_TW: {
        title: '從現有資料庫匯入',
        description:
            '當您沒有 SQL 或 DBML 結構描述檔時使用此選項。在資料庫中執行查詢，然後將結果貼到下方。',
        database_edition: '資料庫版本',
        edition_regular: '標準',
        run_query: '在資料庫中執行此查詢',
        client_sql: 'SQL',
        paste_result: '貼上結果',
        paste_result_placeholder: '在此貼上查詢結果…',
        check_result: '檢查結果',
        valid_result: '結果看起來有效。',
        invalid_result: '無法驗證結果。請檢查內容後再試一次。',
        truncated_result:
            '結果可能已被截斷。請調整 SQL 用戶端設定後重新執行查詢。',
        waiting_for_result: '貼上查詢結果以繼續。',
        unsupported_database: '此資料庫類型不支援結構描述擷取。',
        import_failed: '無法匯入資料庫結構描述。請檢查結果後再試一次。',
        back: '返回',
        continue: '繼續',
        import_schema_description: '從 SQL 或 DBML 匯入資料表與關聯。',
    },
};

function esc(s) {
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildBlock(t) {
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
            },`;
}

for (const [locale, t] of Object.entries(translations)) {
    const filePath = path.join(localesDir, `${locale}.ts`);
    let content = fs.readFileSync(filePath, 'utf8');
    const block = buildBlock(t);
    content = content.replace(
        / {12}import_from_database: \{[\s\S]*?\n {12}\},/,
        block
    );
    content = content.replace(
        /import_schema_description: 'Import tables and relationships from SQL or DBML.',/,
        `import_schema_description: '${esc(t.import_schema_description)}',`
    );
    fs.writeFileSync(filePath, content);
    console.log('translated', locale);
}
