import { describe, expect, it } from 'vitest';
import { ar } from '@/i18n/locales/ar';
import { bn } from '@/i18n/locales/bn';
import { de } from '@/i18n/locales/de';
import { en } from '@/i18n/locales/en';
import { es } from '@/i18n/locales/es';
import { fr } from '@/i18n/locales/fr';
import { gu } from '@/i18n/locales/gu';
import { hi } from '@/i18n/locales/hi';
import { hr } from '@/i18n/locales/hr';
import { id_ID } from '@/i18n/locales/id_ID';
import { ja } from '@/i18n/locales/ja';
import { ko_KR } from '@/i18n/locales/ko_KR';
import { mr } from '@/i18n/locales/mr';
import { ne } from '@/i18n/locales/ne';
import { pt_BR } from '@/i18n/locales/pt_BR';
import { ru } from '@/i18n/locales/ru';
import { te } from '@/i18n/locales/te';
import { tr } from '@/i18n/locales/tr';
import { uk } from '@/i18n/locales/uk';
import { vi } from '@/i18n/locales/vi';
import { zh_CN } from '@/i18n/locales/zh_CN';
import { zh_TW } from '@/i18n/locales/zh_TW';

const locales = [
    ar,
    bn,
    de,
    en,
    es,
    fr,
    gu,
    hi,
    hr,
    id_ID,
    ja,
    ko_KR,
    mr,
    ne,
    pt_BR,
    ru,
    te,
    tr,
    uk,
    vi,
    zh_CN,
    zh_TW,
];

const englishProseFingerprints = [
    en.translation.auth.password_reset.forgot.description,
    en.translation.auth.password_reset.forgot.sent,
    en.translation.auth.password_reset.forgot.send,
    en.translation.auth.password_reset.reset.title,
    en.translation.auth.password_reset.reset.success_description,
    en.translation.auth.password_reset.reset.invalid_description,
    en.translation.auth.password_reset.errors.rate_limit,
];

const englishLeaves = (value: unknown, prefix = ''): string[] => {
    if (typeof value === 'string') {
        return [prefix];
    }

    if (typeof value !== 'object' || value === null) {
        return [];
    }

    return Object.entries(value).flatMap(([key, nested]) =>
        englishLeaves(nested, prefix.length === 0 ? key : `${prefix}.${key}`)
    );
};

describe('password reset locales', () => {
    it('defines every auth.password_reset key in all 22 locales', () => {
        const keys = englishLeaves(en.translation.auth.password_reset);

        expect(locales).toHaveLength(22);

        for (const locale of locales) {
            for (const key of keys) {
                const value = key
                    .split('.')
                    .reduce<unknown>(
                        (current, part) =>
                            typeof current === 'object' && current !== null
                                ? (current as Record<string, unknown>)[part]
                                : undefined,
                        locale.translation.auth.password_reset
                    );

                expect(typeof value).toBe('string');
                expect((value as string).trim().length).toBeGreaterThan(0);
            }
        }
    });

    it('does not copy English prose into non-English locales', () => {
        const keys = englishLeaves(en.translation.auth.password_reset);

        for (const locale of locales) {
            if (locale === en) {
                continue;
            }

            for (const key of keys) {
                if (key.endsWith('.email_label')) {
                    continue;
                }

                const value = key
                    .split('.')
                    .reduce<unknown>(
                        (current, part) =>
                            typeof current === 'object' && current !== null
                                ? (current as Record<string, unknown>)[part]
                                : undefined,
                        locale.translation.auth.password_reset
                    );
                const english = key
                    .split('.')
                    .reduce<unknown>(
                        (current, part) =>
                            typeof current === 'object' && current !== null
                                ? (current as Record<string, unknown>)[part]
                                : undefined,
                        en.translation.auth.password_reset
                    );

                if (typeof value !== 'string' || typeof english !== 'string') {
                    continue;
                }

                if (english.length <= 12) {
                    continue;
                }

                expect(value).not.toBe(english);
            }

            for (const fingerprint of englishProseFingerprints) {
                const values = keys
                    .map((key) =>
                        key
                            .split('.')
                            .reduce<unknown>(
                                (current, part) =>
                                    typeof current === 'object' &&
                                    current !== null
                                        ? (current as Record<string, unknown>)[
                                              part
                                          ]
                                        : undefined,
                                locale.translation.auth.password_reset
                            )
                    )
                    .filter(
                        (entry): entry is string => typeof entry === 'string'
                    );

                expect(values).not.toContain(fingerprint);
            }
        }
    });

    it('preserves conditional wording for the generic sent message', () => {
        for (const locale of locales) {
            if (locale === en) {
                continue;
            }

            const sent = locale.translation.auth.password_reset.forgot.sent;
            expect(sent).not.toContain('definitely');
            expect(sent.length).toBeGreaterThan(20);
        }
    });
});
