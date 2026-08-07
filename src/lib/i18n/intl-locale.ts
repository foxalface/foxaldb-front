import type { SupportedLanguageCode } from '@/i18n/languages';

const INTL_LOCALE_BY_LANGUAGE: Record<SupportedLanguageCode, string> = {
    en: 'en-US',
    fr: 'fr-FR',
    de: 'de-DE',
    es: 'es-ES',
    uk: 'uk-UA',
    ru: 'ru-RU',
    tr: 'tr-TR',
    hr: 'hr-HR',
    pt_BR: 'pt-BR',
    hi: 'hi-IN',
    ja: 'ja-JP',
    ko_KR: 'ko-KR',
    zh_CN: 'zh-CN',
    zh_TW: 'zh-TW',
    ne: 'ne-NP',
    mr: 'mr-IN',
    id_ID: 'id-ID',
    te: 'te-IN',
    bn: 'bn-BD',
    gu: 'gu-IN',
    vi: 'vi-VN',
    ar: 'ar',
};

export const resolveIntlLocale = (languageCode: string): string => {
    if (languageCode in INTL_LOCALE_BY_LANGUAGE) {
        return INTL_LOCALE_BY_LANGUAGE[languageCode as SupportedLanguageCode];
    }

    const normalized = languageCode.replace('_', '-');

    if (normalized.length >= 2) {
        return normalized;
    }

    return INTL_LOCALE_BY_LANGUAGE.en;
};
