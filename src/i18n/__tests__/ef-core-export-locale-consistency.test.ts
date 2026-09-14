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

const requiredLeafPaths = [
    'unsupported_database',
    'options_step.description',
    'options_step.explanation',
    'options_step.ef_core_10',
    'options_step.provider_label',
    'options_step.migrations_not_generated',
    'options_step.namespace',
    'options_step.namespace_placeholder',
    'options_step.namespace_help',
    'options_step.db_context',
    'options_step.db_context_placeholder',
    'options_step.db_context_help',
    'options_step.export',
    'options_step.generating',
    'options_step.error_rate_limited',
    'options_step.error_unexpected',
    'options_step.error_semantic',
    'options_step.error_unauthenticated',
    'result_step.description',
    'result_step.success',
    'result_step.ef_core_10',
    'result_step.provider_label',
    'result_step.generated_files',
    'result_step.notes',
    'result_step.download_zip',
    'result_step.error_unsafe_path',
    'result_step.error_empty_files',
] as const;

const getValue = (source: unknown, path: string): unknown =>
    path.split('.').reduce<unknown>((current, segment) => {
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }

        return (current as Record<string, unknown>)[segment];
    }, source);

describe('EF Core export locale consistency', () => {
    it('contains every required EF Core key in all supported locales', () => {
        for (const locale of locales) {
            const section = locale.translation.export_wizard.ef_core;

            for (const path of requiredLeafPaths) {
                const value = getValue(section, path);
                expect(typeof value).toBe('string');
                expect(String(value).length).toBeGreaterThan(0);
            }
        }
    });

    it('does not leave English sentence placeholders in non-English locales', () => {
        const englishSentences = [
            en.translation.export_wizard.ef_core.unsupported_database,
            en.translation.export_wizard.ef_core.options_step.description,
            en.translation.export_wizard.ef_core.options_step.explanation,
            en.translation.export_wizard.ef_core.options_step
                .migrations_not_generated,
            en.translation.export_wizard.ef_core.options_step.namespace_help,
            en.translation.export_wizard.ef_core.options_step.db_context_help,
            en.translation.export_wizard.ef_core.options_step.generating,
            en.translation.export_wizard.ef_core.options_step
                .error_rate_limited,
            en.translation.export_wizard.ef_core.options_step.error_unexpected,
            en.translation.export_wizard.ef_core.options_step.error_semantic,
            en.translation.export_wizard.ef_core.options_step
                .error_unauthenticated,
            en.translation.export_wizard.ef_core.result_step.description,
            en.translation.export_wizard.ef_core.result_step.success,
            en.translation.export_wizard.ef_core.result_step.download_zip,
            en.translation.export_wizard.ef_core.result_step.error_unsafe_path,
            en.translation.export_wizard.ef_core.result_step.error_empty_files,
        ];

        for (const locale of locales) {
            if (locale === en) {
                continue;
            }

            const section = locale.translation.export_wizard.ef_core;
            const localizedSentences = [
                section.unsupported_database,
                section.options_step.description,
                section.options_step.explanation,
                section.options_step.migrations_not_generated,
                section.options_step.namespace_help,
                section.options_step.db_context_help,
                section.options_step.generating,
                section.options_step.error_rate_limited,
                section.options_step.error_unexpected,
                section.options_step.error_semantic,
                section.options_step.error_unauthenticated,
                section.result_step.description,
                section.result_step.success,
                section.result_step.download_zip,
                section.result_step.error_unsafe_path,
                section.result_step.error_empty_files,
            ];

            for (const [index, value] of localizedSentences.entries()) {
                expect(value).not.toBe(englishSentences[index]);
            }
        }
    });
});
