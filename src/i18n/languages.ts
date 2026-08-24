import type { LanguageMetadata } from './types';

export const languages: LanguageMetadata[] = [
    {
        name: 'English (US)',
        nativeName: 'English (US)',
        code: 'en',
        countryCode: 'us',
    },
    {
        name: 'French (France)',
        nativeName: 'Français (France)',
        code: 'fr',
        countryCode: 'fr',
    },
    {
        name: 'German (Germany)',
        nativeName: 'Deutsch (Deutschland)',
        code: 'de',
        countryCode: 'de',
    },
    {
        name: 'Spanish (Spain)',
        nativeName: 'Español (España)',
        code: 'es',
        countryCode: 'es',
    },
    {
        name: 'Ukrainian',
        nativeName: 'Українська',
        code: 'uk',
        countryCode: 'ua',
    },
    { name: 'Russian', nativeName: 'Русский', code: 'ru', countryCode: 'ru' },
    { name: 'Turkish', nativeName: 'Türkçe', code: 'tr', countryCode: 'tr' },
    { name: 'Croatian', nativeName: 'Hrvatski', code: 'hr', countryCode: 'hr' },
    {
        name: 'Portuguese (Brazil)',
        nativeName: 'Português (Brasil)',
        code: 'pt_BR',
        countryCode: 'br',
    },
    {
        name: 'Hindi (India)',
        nativeName: 'हिन्दी (भारत)',
        code: 'hi',
        countryCode: 'in',
    },
    { name: 'Japanese', nativeName: '日本語', code: 'ja', countryCode: 'jp' },
    {
        name: 'Korean (South Korea)',
        nativeName: '한국어 (대한민국)',
        code: 'ko_KR',
        countryCode: 'kr',
    },
    {
        name: 'Chinese (Simplified)',
        nativeName: '简体中文',
        code: 'zh_CN',
        countryCode: 'cn',
    },
    {
        name: 'Chinese (Traditional)',
        nativeName: '繁體中文',
        code: 'zh_TW',
        countryCode: 'tw',
    },
    { name: 'Nepali', nativeName: 'नेपाली', code: 'ne', countryCode: 'np' },
    {
        name: 'Marathi (India)',
        nativeName: 'मराठी (भारत)',
        code: 'mr',
        countryCode: 'in',
    },
    {
        name: 'Indonesian (Indonesia)',
        nativeName: 'Bahasa Indonesia',
        code: 'id_ID',
        countryCode: 'id',
    },
    {
        name: 'Telugu (India)',
        nativeName: 'తెలుగు (భారతదేశం)',
        code: 'te',
        countryCode: 'in',
    },
    {
        name: 'Bengali (Bangladesh)',
        nativeName: 'বাংলা (বাংলাদেশ)',
        code: 'bn',
        countryCode: 'bd',
    },
    {
        name: 'Gujarati (India)',
        nativeName: 'ગુજરાતી (ભારત)',
        code: 'gu',
        countryCode: 'in',
    },
    {
        name: 'Vietnamese',
        nativeName: 'Tiếng Việt',
        code: 'vi',
        countryCode: 'vn',
    },
    { name: 'Arabic', nativeName: 'العربية', code: 'ar', countryCode: 'sa' },
];

export const SUPPORTED_LANGUAGE_CODES = languages.map(
    (language) => language.code
) as [
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
];

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number];

export const getLanguageByCode = (
    code: string
): LanguageMetadata | undefined => {
    return languages.find((language) => language.code === code);
};
