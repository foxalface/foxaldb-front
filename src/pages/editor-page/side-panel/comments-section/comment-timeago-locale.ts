import type { LocaleFunc } from 'timeago.js';
import ar from 'timeago.js/lib/lang/ar';
import bn_IN from 'timeago.js/lib/lang/bn_IN';
import de from 'timeago.js/lib/lang/de';
import en_US from 'timeago.js/lib/lang/en_US';
import es from 'timeago.js/lib/lang/es';
import fr from 'timeago.js/lib/lang/fr';
import hi_IN from 'timeago.js/lib/lang/hi_IN';
import id_ID from 'timeago.js/lib/lang/id_ID';
import ja from 'timeago.js/lib/lang/ja';
import ko from 'timeago.js/lib/lang/ko';
import pt_BR from 'timeago.js/lib/lang/pt_BR';
import ru from 'timeago.js/lib/lang/ru';
import tr from 'timeago.js/lib/lang/tr';
import uk from 'timeago.js/lib/lang/uk';
import vi from 'timeago.js/lib/lang/vi';
import zh_CN from 'timeago.js/lib/lang/zh_CN';
import zh_TW from 'timeago.js/lib/lang/zh_TW';

/**
 * Option B — timeago.js 4.0.2 / timeago-react 3.0.7.
 *
 * Built-in library locales cover most FoxalDB languages. The library does not
 * ship hr, ne, mr, te, or gu, so those five use small custom LocaleFunc tables.
 *
 * Only a genuinely unknown application language falls back to en_US.
 */

export const OFFICIAL_APPLICATION_LOCALES = [
    'en',
    'fr',
    'de',
    'es',
    'uk',
    'ru',
    'tr',
    'hr',
    'pt_BR',
    'hi',
    'ja',
    'ko_KR',
    'zh_CN',
    'zh_TW',
    'ne',
    'mr',
    'id_ID',
    'te',
    'bn',
    'gu',
    'vi',
    'ar',
] as const;

export type OfficialApplicationLocale =
    (typeof OFFICIAL_APPLICATION_LOCALES)[number];

export const ENGLISH_TIMEAGO_LOCALE_IDS = new Set(['en', 'en_US', 'en_short']);

const createTableLocale = (table: Array<[string, string]>): LocaleFunc => {
    return (_diff, index) => table[index] ?? table[0];
};

/** Croatian — custom (not shipped by timeago.js 4.0.2). */
export const hrLocale: LocaleFunc = createTableLocale([
    ['upravo', 'upravo sada'],
    ['prije %s sekundi', 'za %s sekundi'],
    ['prije 1 minute', 'za 1 minutu'],
    ['prije %s minuta', 'za %s minuta'],
    ['prije 1 sata', 'za 1 sat'],
    ['prije %s sati', 'za %s sati'],
    ['prije 1 dana', 'za 1 dan'],
    ['prije %s dana', 'za %s dana'],
    ['prije 1 tjedna', 'za 1 tjedan'],
    ['prije %s tjedana', 'za %s tjedana'],
    ['prije 1 mjeseca', 'za 1 mjesec'],
    ['prije %s mjeseci', 'za %s mjeseci'],
    ['prije 1 godine', 'za 1 godinu'],
    ['prije %s godina', 'za %s godina'],
]);

/** Nepali — custom (not shipped by timeago.js 4.0.2). */
export const neLocale: LocaleFunc = createTableLocale([
    ['भर्खरै', 'अहिले'],
    ['%s सेकेन्ड अघि', '%s सेकेन्डमा'],
    ['१ मिनेट अघि', '१ मिनेटमा'],
    ['%s मिनेट अघि', '%s मिनेटमा'],
    ['१ घण्टा अघि', '१ घण्टामा'],
    ['%s घण्टा अघि', '%s घण्टामा'],
    ['१ दिन अघि', '१ दिनमा'],
    ['%s दिन अघि', '%s दिनमा'],
    ['१ हप्ता अघि', '१ हप्तामा'],
    ['%s हप्ता अघि', '%s हप्तामा'],
    ['१ महिना अघि', '१ महिनामा'],
    ['%s महिना अघि', '%s महिनामा'],
    ['१ वर्ष अघि', '१ वर्षमा'],
    ['%s वर्ष अघि', '%s वर्षमा'],
]);

/** Marathi — custom (not shipped by timeago.js 4.0.2). */
export const mrLocale: LocaleFunc = createTableLocale([
    ['आत्ताच', 'आत्ता'],
    ['%s सेकंद पूर्वी', '%s सेकंदात'],
    ['१ मिनिट पूर्वी', '१ मिनिटात'],
    ['%s मिनिटे पूर्वी', '%s मिनिटांत'],
    ['१ तास पूर्वी', '१ तासात'],
    ['%s तास पूर्वी', '%s तासांत'],
    ['१ दिवस पूर्वी', '१ दिवसात'],
    ['%s दिवस पूर्वी', '%s दिवसांत'],
    ['१ आठवडा पूर्वी', '१ आठवड्यात'],
    ['%s आठवडे पूर्वी', '%s आठवड्यांत'],
    ['१ महिना पूर्वी', '१ महिन्यात'],
    ['%s महिने पूर्वी', '%s महिन्यांत'],
    ['१ वर्ष पूर्वी', '१ वर्षात'],
    ['%s वर्षे पूर्वी', '%s वर्षांत'],
]);

/** Telugu — custom (not shipped by timeago.js 4.0.2). */
export const teLocale: LocaleFunc = createTableLocale([
    ['ఇప్పుడే', 'ఇప్పుడు'],
    ['%s సెకన్ల క్రితం', '%s సెకన్లలో'],
    ['1 నిమిషం క్రితం', '1 నిమిషంలో'],
    ['%s నిమిషాల క్రితం', '%s నిమిషాల్లో'],
    ['1 గంట క్రితం', '1 గంటలో'],
    ['%s గంటల క్రితం', '%s గంటల్లో'],
    ['1 రోజు క్రితం', '1 రోజులో'],
    ['%s రోజుల క్రితం', '%s రోజుల్లో'],
    ['1 వారం క్రితం', '1 వారంలో'],
    ['%s వారాల క్రితం', '%s వారాల్లో'],
    ['1 నెల క్రితం', '1 నెలలో'],
    ['%s నెలల క్రితం', '%s నెలల్లో'],
    ['1 సంవత్సరం క్రితం', '1 సంవత్సరంలో'],
    ['%s సంవత్సరాల క్రితం', '%s సంవత్సరాల్లో'],
]);

/** Gujarati — custom (not shipped by timeago.js 4.0.2). */
export const guLocale: LocaleFunc = createTableLocale([
    ['હમણાં જ', 'હમણાં'],
    ['%s સેકન્ડ પહેલાં', '%s સેકન્ડમાં'],
    ['1 મિનિટ પહેલાં', '1 મિનિટમાં'],
    ['%s મિનિટ પહેલાં', '%s મિનિટમાં'],
    ['1 કલાક પહેલાં', '1 કલાકમાં'],
    ['%s કલાક પહેલાં', '%s કલાકમાં'],
    ['1 દિવસ પહેલાં', '1 દિવસમાં'],
    ['%s દિવસ પહેલાં', '%s દિવસમાં'],
    ['1 અઠવાડિયું પહેલાં', '1 અઠવાડિયામાં'],
    ['%s અઠવાડિયા પહેલાં', '%s અઠવાડિયામાં'],
    ['1 મહિનો પહેલાં', '1 મહિનામાં'],
    ['%s મહિના પહેલાં', '%s મહિનામાં'],
    ['1 વર્ષ પહેલાં', '1 વર્ષમાં'],
    ['%s વર્ષ પહેલાં', '%s વર્ષમાં'],
]);

export interface ResolvedTimeAgoLocale {
    locale: LocaleFunc;
    lang: string;
}

/**
 * Synchronous resolution so CommentAuthor can register before paint and avoid
 * an English flash for official locales.
 */
export const resolveTimeAgoLocale = (
    language: string
): ResolvedTimeAgoLocale => {
    switch (language) {
        case 'es':
            return { locale: es, lang: 'es' };
        case 'fr':
            return { locale: fr, lang: 'fr' };
        case 'de':
            return { locale: de, lang: 'de' };
        case 'hi':
            return { locale: hi_IN, lang: 'hi_IN' };
        case 'ja':
            return { locale: ja, lang: 'ja' };
        case 'ko_KR':
            return { locale: ko, lang: 'ko' };
        case 'ru':
            return { locale: ru, lang: 'ru' };
        case 'uk':
            return { locale: uk, lang: 'uk' };
        case 'tr':
            return { locale: tr, lang: 'tr' };
        case 'zh_CN':
            return { locale: zh_CN, lang: 'zh_CN' };
        case 'zh_TW':
            return { locale: zh_TW, lang: 'zh_TW' };
        case 'pt_BR':
            return { locale: pt_BR, lang: 'pt_BR' };
        case 'bn':
            return { locale: bn_IN, lang: 'bn_IN' };
        case 'id_ID':
            return { locale: id_ID, lang: 'id_ID' };
        case 'ar':
            return { locale: ar, lang: 'ar' };
        case 'vi':
            return { locale: vi, lang: 'vi' };
        case 'hr':
            return { locale: hrLocale, lang: 'hr' };
        case 'ne':
            return { locale: neLocale, lang: 'ne' };
        case 'mr':
            return { locale: mrLocale, lang: 'mr' };
        case 'te':
            return { locale: teLocale, lang: 'te' };
        case 'gu':
            return { locale: guLocale, lang: 'gu' };
        case 'en':
            return { locale: en_US, lang: 'en_US' };
        default:
            return { locale: en_US, lang: 'en_US' };
    }
};

export const isEnglishTimeAgoLocaleId = (lang: string): boolean =>
    ENGLISH_TIMEAGO_LOCALE_IDS.has(lang);
