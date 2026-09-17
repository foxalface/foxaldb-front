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
import { KNOWN_DJANGO_EXPORT_NOTE_CODES } from '@/dialogs/export-wizard/django/django-export-note-codes';

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
    'result_step.description',
    'result_step.explanation',
    'result_step.django_version',
    'result_step.provider_label',
    'result_step.package_type',
    'result_step.generating',
    'result_step.success',
    'result_step.generated_files',
    'result_step.notes_heading',
    'result_step.warnings_heading',
    'result_step.adaptations_heading',
    'result_step.path_label',
    'result_step.download_zip',
    'result_step.retry',
    'result_step.error_semantic',
    'result_step.error_unauthenticated',
    'result_step.error_invalid_request',
    'result_step.error_rate_limited',
    'result_step.error_unexpected',
    'result_step.error_network',
    'result_step.error_unsafe_path',
    'result_step.error_empty_files',
    'result_step.error_invalid_package',
    'result_step.errors.unsupported_database',
    'result_step.errors.empty_diagram',
    'result_step.errors.unsupported_structural_field',
    'result_step.errors.mysql_catalog_collision',
    'result_step.errors.mariadb_catalog_collision',
] as const;

const getValue = (source: unknown, path: string): unknown =>
    path.split('.').reduce<unknown>((current, segment) => {
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }

        return (current as Record<string, unknown>)[segment];
    }, source);

const collectLeafPaths = (
    value: unknown,
    prefix = ''
): Record<string, string> => {
    if (typeof value === 'string') {
        return prefix ? { [prefix]: value } : {};
    }

    if (typeof value !== 'object' || value === null) {
        return {};
    }

    return Object.entries(value).reduce<Record<string, string>>(
        (accumulator, [key, nestedValue]) => {
            const nextPrefix = prefix ? `${prefix}.${key}` : key;
            return {
                ...accumulator,
                ...collectLeafPaths(nestedValue, nextPrefix),
            };
        },
        {}
    );
};

const extractPlaceholders = (value: string): string[] => {
    const matches = value.match(/\{\{(\w+)\}\}/g) ?? [];
    return [...matches].sort();
};

describe('Django export locale consistency', () => {
    const englishNoteLeaves = collectLeafPaths(
        en.translation.export_wizard.django.result_step.notes
    );

    it('contains every required Django key in all supported locales', () => {
        expect(locales).toHaveLength(22);

        for (const locale of locales) {
            const section = locale.translation.export_wizard.django;

            for (const path of requiredLeafPaths) {
                const value = getValue(section, path);
                expect(typeof value).toBe('string');
                expect(String(value).length).toBeGreaterThan(0);
            }

            expect(section.result_step.django_version).toContain('{{version}}');
            expect(section.result_step.provider_label).toContain(
                '{{provider}}'
            );
            expect(section.result_step.generated_files).toContain('{{count}}');
            expect(section.result_step.warnings_heading).toContain('{{count}}');
            expect(section.result_step.adaptations_heading).toContain(
                '{{count}}'
            );
            expect(section.result_step.path_label).toContain('{{path}}');
            expect(
                section.result_step.errors.unsupported_structural_field
            ).toContain('{{path}}');
        }
    });

    it('contains a note leaf for every known Django note policy', () => {
        for (const code of KNOWN_DJANGO_EXPORT_NOTE_CODES) {
            const matching = Object.keys(englishNoteLeaves).filter(
                (path) => path === code || path.startsWith(`${code}.`)
            );
            expect(matching.length).toBeGreaterThan(0);
        }
    });

    it('contains the same Django note key structure as English in every locale', () => {
        for (const locale of locales) {
            const noteLeaves = collectLeafPaths(
                locale.translation.export_wizard.django.result_step.notes
            );

            expect(Object.keys(noteLeaves).sort()).toEqual(
                Object.keys(englishNoteLeaves).sort()
            );
        }
    });

    it('keeps interpolation placeholders consistent with English for every note leaf', () => {
        for (const locale of locales) {
            const noteLeaves = collectLeafPaths(
                locale.translation.export_wizard.django.result_step.notes
            );

            for (const [path, englishValue] of Object.entries(
                englishNoteLeaves
            )) {
                const localizedValue = noteLeaves[path];
                expect(typeof localizedValue).toBe('string');
                expect(extractPlaceholders(localizedValue)).toEqual(
                    extractPlaceholders(englishValue)
                );
            }
        }
    });

    it('does not leave English sentence placeholders in non-English locales', () => {
        const englishSentences = [
            en.translation.export_wizard.django.unsupported_database,
            en.translation.export_wizard.django.result_step.description,
            en.translation.export_wizard.django.result_step.explanation,
            en.translation.export_wizard.django.result_step.package_type,
            en.translation.export_wizard.django.result_step.generating,
            en.translation.export_wizard.django.result_step.success,
            en.translation.export_wizard.django.result_step.notes_heading,
            en.translation.export_wizard.django.result_step.warnings_heading,
            en.translation.export_wizard.django.result_step.adaptations_heading,
            en.translation.export_wizard.django.result_step.path_label,
            en.translation.export_wizard.django.result_step.download_zip,
            en.translation.export_wizard.django.result_step.retry,
            en.translation.export_wizard.django.result_step.error_semantic,
            en.translation.export_wizard.django.result_step
                .error_unauthenticated,
            en.translation.export_wizard.django.result_step
                .error_invalid_request,
            en.translation.export_wizard.django.result_step.error_rate_limited,
            en.translation.export_wizard.django.result_step.error_unexpected,
            en.translation.export_wizard.django.result_step.error_network,
            en.translation.export_wizard.django.result_step.error_unsafe_path,
            en.translation.export_wizard.django.result_step.error_empty_files,
            en.translation.export_wizard.django.result_step
                .error_invalid_package,
            en.translation.export_wizard.django.result_step.errors
                .empty_diagram,
        ];

        for (const locale of locales) {
            if (locale === en) {
                continue;
            }

            const section = locale.translation.export_wizard.django;
            const localizedSentences = [
                section.unsupported_database,
                section.result_step.description,
                section.result_step.explanation,
                section.result_step.package_type,
                section.result_step.generating,
                section.result_step.success,
                section.result_step.notes_heading,
                section.result_step.warnings_heading,
                section.result_step.adaptations_heading,
                section.result_step.path_label,
                section.result_step.download_zip,
                section.result_step.retry,
                section.result_step.error_semantic,
                section.result_step.error_unauthenticated,
                section.result_step.error_invalid_request,
                section.result_step.error_rate_limited,
                section.result_step.error_unexpected,
                section.result_step.error_network,
                section.result_step.error_unsafe_path,
                section.result_step.error_empty_files,
                section.result_step.error_invalid_package,
                section.result_step.errors.empty_diagram,
            ];

            for (const [index, value] of localizedSentences.entries()) {
                expect(value).not.toBe(englishSentences[index]);
            }

            const noteLeaves = collectLeafPaths(section.result_step.notes);
            for (const [path, englishValue] of Object.entries(
                englishNoteLeaves
            )) {
                expect(noteLeaves[path]).not.toBe(englishValue);
            }
        }
    });
});
