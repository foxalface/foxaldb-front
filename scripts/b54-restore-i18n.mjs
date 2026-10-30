/**
 * One-off B5.4: Restore dialog + create-wizard restore entry + view_only (non-EN).
 * Run: node scripts/b54-restore-i18n.mjs
 */
import fs from 'fs';
import path from 'path';

const localesDir = new URL('../src/i18n/locales', import.meta.url).pathname;

const restoreDialog = {
    ar: {
        title: 'استعادة المخطط',
        description:
            'ارفع ملف JSON لنسخة احتياطية من المخطط. يُنشئ ذلك مخططًا جديدًا ولا يستبدل المخطط المفتوح ولا يدمج فيه.',
        cancel: 'إلغاء',
        import: 'استعادة',
        errorTitle: 'تعذر استعادة المخطط',
        errorDescription:
            'JSON المخطط غير صالح. تحقق من الملف وحاول مرة أخرى. مساعدة؟ support@chartdb.io',
    },
    bn: {
        title: 'ডায়াগ্রাম পুনরুদ্ধার',
        description:
            'ডায়াগ্রাম ব্যাকআপ JSON ফাইল আপলোড করুন। এটি একটি নতুন ডায়াগ্রাম তৈরি করে; খোলা ডায়াগ্রাম প্রতিস্থাপন বা মার্জ করে না।',
        cancel: 'বাতিল',
        import: 'পুনরুদ্ধার',
        errorTitle: 'ডায়াগ্রাম পুনরুদ্ধার করা যায়নি',
        errorDescription:
            'ডায়াগ্রাম JSON অবৈধ। ফাইল পরীক্ষা করে আবার চেষ্টা করুন। সাহায্য? support@chartdb.io',
    },
    de: {
        title: 'Diagramm wiederherstellen',
        description:
            'Laden Sie eine JSON-Sicherungsdatei des Diagramms hoch. Es wird ein neues Diagramm erstellt; das geöffnete Diagramm wird nicht ersetzt oder zusammengeführt.',
        cancel: 'Abbrechen',
        import: 'Wiederherstellen',
        errorTitle: 'Diagramm konnte nicht wiederhergestellt werden',
        errorDescription:
            'Das Diagramm-JSON ist ungültig. Prüfen Sie die Datei und versuchen Sie es erneut. Hilfe? support@chartdb.io',
    },
    es: {
        title: 'Restaurar diagrama',
        description:
            'Suba un archivo JSON de copia de seguridad del diagrama. Crea un diagrama nuevo; no reemplaza ni fusiona con el diagrama abierto.',
        cancel: 'Cancelar',
        import: 'Restaurar',
        errorTitle: 'No se pudo restaurar el diagrama',
        errorDescription:
            'El JSON del diagrama no es válido. Compruebe el archivo e inténtelo de nuevo. ¿Ayuda? support@chartdb.io',
    },
    gu: {
        title: 'ડાયગ્રામ પુનઃસ્થાપિત કરો',
        description:
            'ડાયગ્રામ બેકઅપ JSON ફાઇલ અપલોડ કરો. આ નવું ડાયગ્રામ બનાવે છે; ખુલ્લા ડાયગ્રામને બદલતું અથવા મર્જ કરતું નથી.',
        cancel: 'રદ કરો',
        import: 'પુનઃસ્થાપિત કરો',
        errorTitle: 'ડાયગ્રામ પુનઃસ્થાપિત કરી શકાયું નહીં',
        errorDescription:
            'ડાયગ્રામ JSON અમાન્ય છે. ફાઇલ તપાસો અને ફરી પ્રયાસ કરો. મદદ? support@chartdb.io',
    },
    hi: {
        title: 'आरेख पुनर्स्थापित करें',
        description:
            'डायग्राम बैकअप JSON फ़ाइल अपलोड करें। यह एक नया आरेख बनाता है; खुले आरेख को बदलता या मर्ज नहीं करता।',
        cancel: 'रद्द करें',
        import: 'पुनर्स्थापित करें',
        errorTitle: 'आरेख पुनर्स्थापित नहीं हो सका',
        errorDescription:
            'डायग्राम JSON अमान्य है। फ़ाइल जाँचें और पुनः प्रयास करें। सहायता? support@chartdb.io',
    },
    hr: {
        title: 'Vrati dijagram',
        description:
            'Učitajte JSON sigurnosnu kopiju dijagrama. Stvara novi dijagram; ne zamjenjuje niti spaja s otvorenim dijagramom.',
        cancel: 'Odustani',
        import: 'Vrati',
        errorTitle: 'Dijagram nije moguće vratiti',
        errorDescription:
            'JSON dijagrama nije valjan. Provjerite datoteku i pokušajte ponovno. Pomoć? support@chartdb.io',
    },
    id_ID: {
        title: 'Pulihkan diagram',
        description:
            'Unggah file JSON cadangan diagram. Ini membuat diagram baru; tidak mengganti atau menggabungkan diagram yang terbuka.',
        cancel: 'Batal',
        import: 'Pulihkan',
        errorTitle: 'Diagram tidak dapat dipulihkan',
        errorDescription:
            'JSON diagram tidak valid. Periksa file dan coba lagi. Bantuan? support@chartdb.io',
    },
    ja: {
        title: 'ダイアグラムを復元',
        description:
            'ダイアグラムのバックアップ JSON をアップロードします。新しいダイアグラムを作成し、開いているダイアグラムを置き換えたりマージしたりしません。',
        cancel: 'キャンセル',
        import: '復元',
        errorTitle: 'ダイアグラムを復元できませんでした',
        errorDescription:
            'ダイアグラム JSON が無効です。ファイルを確認して再試行してください。サポート: support@chartdb.io',
    },
    ko_KR: {
        title: '다이어그램 복원',
        description:
            '다이어그램 백업 JSON 파일을 업로드하세요. 새 다이어그램을 만들며, 열린 다이어그램을 대체하거나 병합하지 않습니다.',
        cancel: '취소',
        import: '복원',
        errorTitle: '다이어그램을 복원할 수 없습니다',
        errorDescription:
            '다이어그램 JSON이 유효하지 않습니다. 파일을 확인하고 다시 시도하세요. 도움말: support@chartdb.io',
    },
    mr: {
        title: 'डायग्राम पुनर्स्थापित करा',
        description:
            'डायग्राम बॅकअप JSON फाइल अपलोड करा. हे नवीन डायग्राम तयार करते; उघडलेले डायग्राम बदलत नाही किंवा विलीन करत नाही.',
        cancel: 'रद्द करा',
        import: 'पुनर्स्थापित करा',
        errorTitle: 'डायग्राम पुनर्स्थापित करता आले नाही',
        errorDescription:
            'डायग्राम JSON अवैध आहे. फाइल तपासा आणि पुन्हा प्रयत्न करा. मदत? support@chartdb.io',
    },
    ne: {
        title: 'डायग्राम पुनर्स्थापना',
        description:
            'डायग्राम ब्याकअप JSON फाइल अपलोड गर्नुहोस्। यसले नयाँ डायग्राम बनाउँछ; खुला डायग्राम प्रतिस्थापन वा मर्ज गर्दैन।',
        cancel: 'रद्द गर्नुहोस्',
        import: 'पुनर्स्थापना',
        errorTitle: 'डायग्राम पुनर्स्थापना गर्न सकिएन',
        errorDescription:
            'डायग्राम JSON अमान्य छ। फाइल जाँच गर्नुहोस् र पुनः प्रयास गर्नुहोस्। सहायता? support@chartdb.io',
    },
    pt_BR: {
        title: 'Restaurar diagrama',
        description:
            'Envie um arquivo JSON de backup do diagrama. Isso cria um diagrama novo; não substitui nem mescla com o diagrama aberto.',
        cancel: 'Cancelar',
        import: 'Restaurar',
        errorTitle: 'Não foi possível restaurar o diagrama',
        errorDescription:
            'O JSON do diagrama é inválido. Verifique o arquivo e tente novamente. Ajuda? support@chartdb.io',
    },
    ru: {
        title: 'Восстановить диаграмму',
        description:
            'Загрузите JSON-файл резервной копии диаграммы. Создаётся новая диаграмма; открытая не заменяется и не сливается.',
        cancel: 'Отмена',
        import: 'Восстановить',
        errorTitle: 'Не удалось восстановить диаграмму',
        errorDescription:
            'JSON диаграммы недействителен. Проверьте файл и повторите попытку. Помощь: support@chartdb.io',
    },
    te: {
        title: 'డయాగ్రామ్‌ను పునరుద్ధరించు',
        description:
            'డయాగ్రామ్ బ్యాకప్ JSON ఫైల్‌ను అప్‌లోడ్ చేయండి. ఇది కొత్త డయాగ్రామ్‌ను సృష్టిస్తుంది; తెరిచిన దానిని భర్తీ చేయదు లేదా విలీనం చేయదు.',
        cancel: 'రద్దు',
        import: 'పునరుద్ధరించు',
        errorTitle: 'డయాగ్రామ్‌ను పునరుద్ధరించలేకపోయాం',
        errorDescription:
            'డయాగ్రామ్ JSON చెల్లదు. ఫైల్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి. సహాయం? support@chartdb.io',
    },
    tr: {
        title: 'Diyagramı geri yükle',
        description:
            'Diyagram yedek JSON dosyasını yükleyin. Yeni bir diyagram oluşturur; açık diyagramın yerini almaz ve birleştirmez.',
        cancel: 'İptal',
        import: 'Geri yükle',
        errorTitle: 'Diyagram geri yüklenemedi',
        errorDescription:
            'Diyagram JSON geçersiz. Dosyayı kontrol edip tekrar deneyin. Yardım? support@chartdb.io',
    },
    uk: {
        title: 'Відновити діаграму',
        description:
            'Завантажте JSON-файл резервної копії діаграми. Створюється нова діаграма; відкриту не замінює і не зливає.',
        cancel: 'Скасувати',
        import: 'Відновити',
        errorTitle: 'Не вдалося відновити діаграму',
        errorDescription:
            'JSON діаграми недійсний. Перевірте файл і спробуйте знову. Допомога: support@chartdb.io',
    },
    vi: {
        title: 'Khôi phục sơ đồ',
        description:
            'Tải lên tệp JSON sao lưu sơ đồ. Thao tác này tạo sơ đồ mới; không thay thế hoặc hợp nhất với sơ đồ đang mở.',
        cancel: 'Hủy',
        import: 'Khôi phục',
        errorTitle: 'Không thể khôi phục sơ đồ',
        errorDescription:
            'JSON sơ đồ không hợp lệ. Kiểm tra tệp và thử lại. Trợ giúp? support@chartdb.io',
    },
    zh_CN: {
        title: '恢复图表',
        description:
            '上传图表备份 JSON 文件。将创建新图表，不会替换或合并到当前打开的图表。',
        cancel: '取消',
        import: '恢复',
        errorTitle: '无法恢复图表',
        errorDescription:
            '图表 JSON 无效。请检查文件后重试。需要帮助？ support@chartdb.io',
    },
    zh_TW: {
        title: '還原圖表',
        description:
            '上傳圖表備份 JSON 檔案。會建立新圖表，不會取代或合併到目前開啟的圖表。',
        cancel: '取消',
        import: '還原',
        errorTitle: '無法還原圖表',
        errorDescription:
            '圖表 JSON 無效。請檢查檔案後再試。需要協助？ support@chartdb.io',
    },
};

const restoreFromBackup = {
    en: 'Restore from backup',
    fr: 'Restaurer depuis une sauvegarde',
    de: 'Aus Sicherung wiederherstellen',
    es: 'Restaurar desde copia de seguridad',
    pt_BR: 'Restaurar do backup',
    ja: 'バックアップから復元',
    ko_KR: '백업에서 복원',
    zh_CN: '从备份恢复',
    zh_TW: '從備份還原',
    vi: 'Khôi phục từ bản sao lưu',
    ar: 'استعادة من نسخة احتياطية',
    uk: 'Відновити з резервної копії',
    tr: 'Yedekten geri yükle',
    ru: 'Восстановить из резервной копии',
    hi: 'बैकअप से पुनर्स्थापित करें',
    bn: 'ব্যাকআপ থেকে পুনরুদ্ধার',
    gu: 'બેકઅપમાંથી પુનઃસ્થાપિત કરો',
    mr: 'बॅकअपमधून पुनर्स्थापित करा',
    ne: 'ब्याकअपबाट पुनर्स्थापना',
    te: 'బ్యాకప్ నుండి పునరుద్ధరించు',
    id_ID: 'Pulihkan dari cadangan',
    hr: 'Vrati iz sigurnosne kopije',
};

const viewOnly = {
    en: 'View only',
    fr: 'Lecture seule',
    de: 'Nur Ansicht',
    es: 'Solo lectura',
    pt_BR: 'Somente leitura',
    ja: '閲覧のみ',
    ko_KR: '보기 전용',
    zh_CN: '仅查看',
    zh_TW: '僅檢視',
    vi: 'Chỉ xem',
    ar: 'عرض فقط',
    uk: 'Лише перегляд',
    tr: 'Yalnızca görüntüleme',
    ru: 'Только просмотр',
    hi: 'केवल देखें',
    bn: 'শুধু দেখুন',
    gu: 'ફક્ત જુઓ',
    mr: 'फक्त पाहणे',
    ne: 'हेर्न मात्र',
    te: 'చూడడం మాత్రమే',
    id_ID: 'Hanya lihat',
    hr: 'Samo pregled',
};

function block(localeKey, t) {
    const esc = (s) => s.replace(/'/g, "\\'");
    return `        import_diagram_dialog: {
            title: '${esc(t.title)}',
            description:
                '${esc(t.description)}',
            cancel: '${esc(t.cancel)}',
            import: '${esc(t.import)}',
            error: {
                title: '${esc(t.errorTitle)}',
                description:
                    '${esc(t.errorDescription)}',
            },
        },`;
}

for (const file of fs.readdirSync(localesDir)) {
    if (!file.endsWith('.ts')) continue;
    const key = file.replace('.ts', '');
    const p = path.join(localesDir, file);
    let src = fs.readFileSync(p, 'utf8');

    if (key !== 'en' && restoreDialog[key]) {
        src = src.replace(
            /import_diagram_dialog: \{[\s\S]*?\n {8}\},/,
            block(key, restoreDialog[key])
        );
        src = src.replace(
            /\n\s*\/\/ TODO: Translate\n\s*import_diagram_dialog:/g,
            '\n        import_diagram_dialog:'
        );
    }

    if (restoreFromBackup[key]) {
        const label = restoreFromBackup[key].replace(/'/g, "\\'");
        if (src.includes('restore_from_backup:')) {
            src = src.replace(
                /restore_from_backup: '[^']*'/,
                `restore_from_backup: '${label}'`
            );
        } else if (src.includes('import_from_file:')) {
            src = src.replace(
                /import_from_file: '[^']*'/,
                `restore_from_backup: '${label}'`
            );
        }
    }

    if (viewOnly[key]) {
        src = src.replace(
            /view_only: 'View only'/,
            `view_only: '${viewOnly[key].replace(/'/g, "\\'")}'`
        );
    }

    fs.writeFileSync(p, src);
}

console.log('B5.4 restore i18n applied');
