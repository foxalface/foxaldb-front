import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { BackendModule, ReadCallback } from 'i18next';
import { en } from './locales/en';
import {
    SUPPORTED_LANGUAGE_CODES,
    type SupportedLanguageCode,
} from './languages';
import { LOCALE_LOADERS } from './locale-loaders';

const lazyLocaleBackend: BackendModule = {
    type: 'backend',
    init() {},
    read(language: string, _namespace: string, callback: ReadCallback) {
        if (language === 'en') {
            callback(null, false);
            return;
        }

        const loader =
            LOCALE_LOADERS[language as Exclude<SupportedLanguageCode, 'en'>];

        if (!loader) {
            callback(null, false);
            return;
        }

        loader()
            .then((translation) => callback(null, translation))
            .catch((error: Error) => callback(error, false));
    },
};

export async function initI18n(): Promise<void> {
    await i18n
        .use(LanguageDetector)
        .use(lazyLocaleBackend)
        .use(initReactI18next)
        .init({
            resources: { en },
            partialBundledLanguages: true,
            supportedLngs: [...SUPPORTED_LANGUAGE_CODES],
            interpolation: {
                escapeValue: false,
            },
            fallbackLng: 'en',
            debug: false,
        });
}

export { i18n };
