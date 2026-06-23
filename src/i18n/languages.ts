import type { LanguageMetadata } from './types';

export const languages: LanguageMetadata[] = [
    { name: 'English', nativeName: 'English', code: 'en' },
    { name: 'French', nativeName: 'Français', code: 'fr' },
    { name: 'German', nativeName: 'Deutsch', code: 'de' },
    { name: 'Spanish', nativeName: 'Español', code: 'es' },
    { name: 'Ukrainian', nativeName: 'Українська', code: 'uk' },
    { name: 'Russian', nativeName: 'Русский', code: 'ru' },
    { name: 'Turkish', nativeName: 'Türkçe', code: 'tr' },
    { name: 'Croatian', nativeName: 'Hrvatski', code: 'hr' },
    { name: 'Portuguese', nativeName: 'Português', code: 'pt_BR' },
    { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi' },
    { name: 'Japanese', nativeName: '日本語', code: 'ja' },
    { name: 'Korean', nativeName: '한국어', code: 'ko_KR' },
    { name: 'Chinese (Simplified)', nativeName: '简体中文', code: 'zh_CN' },
    { name: 'Chinese (Traditional)', nativeName: '繁體中文', code: 'zh_TW' },
    { name: 'Nepali', nativeName: 'नेपाली', code: 'ne' },
    { name: 'Marathi', nativeName: 'मराठी', code: 'mr' },
    { name: 'Indonesian', nativeName: 'Indonesia', code: 'id_ID' },
    { name: 'Telugu', nativeName: 'తెలుగు', code: 'te' },
    { name: 'Bengali', nativeName: 'বাংলা', code: 'bn' },
    { name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu' },
    { name: 'Vietnamese', nativeName: 'Tiếng Việt', code: 'vi' },
    { name: 'Arabic', nativeName: 'العربية', code: 'ar' },
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
