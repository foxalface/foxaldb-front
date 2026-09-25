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
import { KNOWN_DRIZZLE_EXPORT_NOTE_CODES } from '@/dialogs/export-wizard/drizzle/drizzle-export-note-codes';
import { drizzleExportNoteMessages as arNotes } from '@/i18n/drizzle-export-notes/ar';
import { drizzleExportNoteMessages as bnNotes } from '@/i18n/drizzle-export-notes/bn';
import { drizzleExportNoteMessages as deNotes } from '@/i18n/drizzle-export-notes/de';
import { drizzleExportNoteMessages as enNotes } from '@/i18n/drizzle-export-notes/en';
import { drizzleExportNoteMessages as esNotes } from '@/i18n/drizzle-export-notes/es';
import { drizzleExportNoteMessages as frNotes } from '@/i18n/drizzle-export-notes/fr';
import { drizzleExportNoteMessages as guNotes } from '@/i18n/drizzle-export-notes/gu';
import { drizzleExportNoteMessages as hiNotes } from '@/i18n/drizzle-export-notes/hi';
import { drizzleExportNoteMessages as hrNotes } from '@/i18n/drizzle-export-notes/hr';
import { drizzleExportNoteMessages as idNotes } from '@/i18n/drizzle-export-notes/id_ID';
import { drizzleExportNoteMessages as jaNotes } from '@/i18n/drizzle-export-notes/ja';
import { drizzleExportNoteMessages as koNotes } from '@/i18n/drizzle-export-notes/ko_KR';
import { drizzleExportNoteMessages as mrNotes } from '@/i18n/drizzle-export-notes/mr';
import { drizzleExportNoteMessages as neNotes } from '@/i18n/drizzle-export-notes/ne';
import { drizzleExportNoteMessages as ptNotes } from '@/i18n/drizzle-export-notes/pt_BR';
import { drizzleExportNoteMessages as ruNotes } from '@/i18n/drizzle-export-notes/ru';
import { drizzleExportNoteMessages as teNotes } from '@/i18n/drizzle-export-notes/te';
import { drizzleExportNoteMessages as trNotes } from '@/i18n/drizzle-export-notes/tr';
import { drizzleExportNoteMessages as ukNotes } from '@/i18n/drizzle-export-notes/uk';
import { drizzleExportNoteMessages as viNotes } from '@/i18n/drizzle-export-notes/vi';
import { drizzleExportNoteMessages as zhCnNotes } from '@/i18n/drizzle-export-notes/zh_CN';
import { drizzleExportNoteMessages as zhTwNotes } from '@/i18n/drizzle-export-notes/zh_TW';

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

const noteModules = [
    arNotes,
    bnNotes,
    deNotes,
    enNotes,
    esNotes,
    frNotes,
    guNotes,
    hiNotes,
    hrNotes,
    idNotes,
    jaNotes,
    koNotes,
    mrNotes,
    neNotes,
    ptNotes,
    ruNotes,
    teNotes,
    trNotes,
    ukNotes,
    viNotes,
    zhCnNotes,
    zhTwNotes,
];

const requiredLeafPaths = [
    'unsupported_database',
    'result_step.description',
    'result_step.export_info_aria',
    'result_step.export_info',
    'result_step.explanation',
    'result_step.drizzle_version',
    'result_step.provider_label',
    'result_step.package_type',
    'result_step.generating',
    'result_step.success',
    'result_step.generated_files',
    'result_step.notes_heading',
    'result_step.warnings_heading',
    'result_step.adaptations_heading_one',
    'result_step.adaptations_heading_other',
    'result_step.path_label',
    'result_step.unknown_note',
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

describe('Drizzle export locale consistency', () => {
    const englishNoteLeaves = collectLeafPaths(
        en.translation.export_wizard.drizzle.result_step.notes
    );

    it('contains every required Drizzle key in all supported locales', () => {
        expect(locales).toHaveLength(22);

        for (const locale of locales) {
            const section = locale.translation.export_wizard.drizzle;

            for (const path of requiredLeafPaths) {
                const value = getValue(section, path);
                expect(typeof value).toBe('string');
                expect(String(value).length).toBeGreaterThan(0);
            }

            expect(section.result_step.drizzle_version).toContain('{{orm}}');
            expect(section.result_step.drizzle_version).toContain('{{kit}}');
            expect(section.result_step.provider_label).toContain(
                '{{provider}}'
            );
            expect(section.result_step.generated_files).toContain('{{count}}');
            expect(section.result_step.warnings_heading).toContain('{{count}}');
            expect(section.result_step.adaptations_heading_other).toContain(
                '{{count}}'
            );
            expect(section.result_step.adaptations_heading_one).not.toContain(
                '{{count}}'
            );
            expect(section.result_step.path_label).toContain('{{path}}');
            expect(
                section.result_step.errors.unsupported_structural_field
            ).toContain('{{path}}');
            expect(
                section.result_step.errors.mysql_catalog_collision
            ).toContain('{{path}}');
            expect(
                section.result_step.errors.mariadb_catalog_collision
            ).toContain('{{path}}');
        }
    });

    it('contains a note leaf for every known Drizzle note policy', () => {
        for (const code of KNOWN_DRIZZLE_EXPORT_NOTE_CODES) {
            const matching = Object.keys(englishNoteLeaves).filter(
                (path) => path === code || path.startsWith(`${code}.`)
            );
            expect(matching.length).toBeGreaterThan(0);
        }
    });

    it('contains the same Drizzle note key structure as English in every locale', () => {
        for (const locale of locales) {
            const noteLeaves = collectLeafPaths(
                locale.translation.export_wizard.drizzle.result_step.notes
            );

            expect(Object.keys(noteLeaves).sort()).toEqual(
                Object.keys(englishNoteLeaves).sort()
            );
        }
    });

    it('exposes the same key set in every Drizzle note locale module', () => {
        expect(noteModules).toHaveLength(22);
        const englishLeaves = collectLeafPaths(enNotes);

        for (const notes of noteModules) {
            expect(Object.keys(collectLeafPaths(notes)).sort()).toEqual(
                Object.keys(englishLeaves).sort()
            );
        }
    });

    it('keeps interpolation placeholders consistent with English for every note leaf', () => {
        for (const locale of locales) {
            const noteLeaves = collectLeafPaths(
                locale.translation.export_wizard.drizzle.result_step.notes
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
            en.translation.export_wizard.drizzle.unsupported_database,
            en.translation.export_wizard.drizzle.result_step.export_info_aria,
            en.translation.export_wizard.drizzle.result_step.export_info,
            en.translation.export_wizard.drizzle.result_step.generating,
            en.translation.export_wizard.drizzle.result_step.success,
            en.translation.export_wizard.drizzle.result_step.notes_heading,
            en.translation.export_wizard.drizzle.result_step.warnings_heading,
            en.translation.export_wizard.drizzle.result_step
                .adaptations_heading_one,
            en.translation.export_wizard.drizzle.result_step
                .adaptations_heading_other,
            en.translation.export_wizard.drizzle.result_step.path_label,
            en.translation.export_wizard.drizzle.result_step.unknown_note,
            en.translation.export_wizard.drizzle.result_step.download_zip,
            en.translation.export_wizard.drizzle.result_step.retry,
            en.translation.export_wizard.drizzle.result_step.error_semantic,
            en.translation.export_wizard.drizzle.result_step
                .error_unauthenticated,
            en.translation.export_wizard.drizzle.result_step
                .error_invalid_request,
            en.translation.export_wizard.drizzle.result_step.error_rate_limited,
            en.translation.export_wizard.drizzle.result_step.error_unexpected,
            en.translation.export_wizard.drizzle.result_step.error_network,
            en.translation.export_wizard.drizzle.result_step.error_unsafe_path,
            en.translation.export_wizard.drizzle.result_step.error_empty_files,
            en.translation.export_wizard.drizzle.result_step
                .error_invalid_package,
            en.translation.export_wizard.drizzle.result_step.errors
                .empty_diagram,
        ];

        for (const locale of locales) {
            if (locale === en) {
                continue;
            }

            const section = locale.translation.export_wizard.drizzle;
            const localizedSentences = [
                section.unsupported_database,
                section.result_step.export_info_aria,
                section.result_step.export_info,
                section.result_step.generating,
                section.result_step.success,
                section.result_step.notes_heading,
                section.result_step.warnings_heading,
                section.result_step.adaptations_heading_one,
                section.result_step.adaptations_heading_other,
                section.result_step.path_label,
                section.result_step.unknown_note,
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

    it('does not wrap Drizzle package filenames in markdown backticks', () => {
        expect(
            en.translation.export_wizard.drizzle.result_step.package_type
        ).toBe('Package: Drizzle schema (schema.ts + drizzle.config.ts)');
        expect(
            fr.translation.export_wizard.drizzle.result_step.package_type
        ).toBe('Paquet : schéma Drizzle (schema.ts + drizzle.config.ts)');

        for (const locale of locales) {
            const packageType =
                locale.translation.export_wizard.drizzle.result_step
                    .package_type;

            expect(packageType).toContain('schema.ts');
            expect(packageType).toContain('drizzle.config.ts');
            expect(packageType).not.toContain('`schema.ts`');
            expect(packageType).not.toContain('`drizzle.config.ts`');
            expect(packageType).not.toContain('`');
        }
    });
});
