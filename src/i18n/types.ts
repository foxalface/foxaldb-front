import type { en } from './locales/en';

export type LanguageTranslation = typeof en;

export type LanguageCountryCode =
    | 'bd'
    | 'br'
    | 'cn'
    | 'de'
    | 'es'
    | 'fr'
    | 'hr'
    | 'id'
    | 'in'
    | 'jp'
    | 'kr'
    | 'np'
    | 'ru'
    | 'sa'
    | 'tr'
    | 'tw'
    | 'ua'
    | 'us'
    | 'vn';

export type LanguageMetadata = {
    name: string;
    nativeName: string;
    code: string;
    countryCode: LanguageCountryCode;
};
