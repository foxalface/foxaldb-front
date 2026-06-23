import type { SupportedLanguageCode } from './languages';
import type { LanguageTranslation } from './types';

type NonEnglishLocale = Exclude<SupportedLanguageCode, 'en'>;
type TranslationNamespace = LanguageTranslation['translation'];

export const LOCALE_LOADERS: Record<
    NonEnglishLocale,
    () => Promise<TranslationNamespace>
> = {
    ar: () => import('./locales/ar').then((module) => module.ar.translation),
    bn: () => import('./locales/bn').then((module) => module.bn.translation),
    de: () => import('./locales/de').then((module) => module.de.translation),
    es: () => import('./locales/es').then((module) => module.es.translation),
    fr: () => import('./locales/fr').then((module) => module.fr.translation),
    gu: () => import('./locales/gu').then((module) => module.gu.translation),
    hi: () => import('./locales/hi').then((module) => module.hi.translation),
    hr: () => import('./locales/hr').then((module) => module.hr.translation),
    id_ID: () =>
        import('./locales/id_ID').then((module) => module.id_ID.translation),
    ja: () => import('./locales/ja').then((module) => module.ja.translation),
    ko_KR: () =>
        import('./locales/ko_KR').then((module) => module.ko_KR.translation),
    mr: () => import('./locales/mr').then((module) => module.mr.translation),
    ne: () => import('./locales/ne').then((module) => module.ne.translation),
    pt_BR: () =>
        import('./locales/pt_BR').then((module) => module.pt_BR.translation),
    ru: () => import('./locales/ru').then((module) => module.ru.translation),
    te: () => import('./locales/te').then((module) => module.te.translation),
    tr: () => import('./locales/tr').then((module) => module.tr.translation),
    uk: () => import('./locales/uk').then((module) => module.uk.translation),
    vi: () => import('./locales/vi').then((module) => module.vi.translation),
    zh_CN: () =>
        import('./locales/zh_CN').then((module) => module.zh_CN.translation),
    zh_TW: () =>
        import('./locales/zh_TW').then((module) => module.zh_TW.translation),
};
