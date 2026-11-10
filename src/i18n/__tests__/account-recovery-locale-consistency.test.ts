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

const sections = [
    en.translation.auth.account_recovery,
    en.translation.auth.settings.danger_zone,
] as const;

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

const read = (source: unknown, key: string): unknown =>
    key.split('.').reduce<unknown>((current, part) => {
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }

        return (current as Record<string, unknown>)[part];
    }, source);

describe('account recovery locales', () => {
    it('defines recovery and danger-zone copy in all 22 locales', () => {
        expect(locales).toHaveLength(22);

        for (const locale of locales) {
            for (const [index, section] of [
                locale.translation.auth.account_recovery,
                locale.translation.auth.settings.danger_zone,
            ].entries()) {
                for (const key of englishLeaves(sections[index])) {
                    const value = read(section, key);
                    expect(typeof value).toBe('string');
                    expect((value as string).trim().length).toBeGreaterThan(0);
                }
            }

            expect(
                locale.translation.auth.account_recovery.recoverable_until
            ).toContain('{{date}}');
            expect(
                locale.translation.auth.settings.danger_zone.description
            ).toContain('90');
            expect(
                locale.translation.auth.settings.danger_zone.confirm_description
            ).toContain('90');
            expect(
                locale.translation.auth.settings.danger_zone.device_warning
                    .length
            ).toBeGreaterThan(20);
        }
    });

    it('does not copy English prose into non-English locales', () => {
        for (const locale of locales) {
            if (locale === en) {
                continue;
            }

            for (const [index, section] of [
                locale.translation.auth.account_recovery,
                locale.translation.auth.settings.danger_zone,
            ].entries()) {
                for (const key of englishLeaves(sections[index])) {
                    const value = read(section, key);
                    const english = read(sections[index], key);

                    if (
                        typeof value !== 'string' ||
                        typeof english !== 'string' ||
                        english.length <= 12
                    ) {
                        continue;
                    }

                    expect(value).not.toBe(english);
                }
            }
        }
    });
});
