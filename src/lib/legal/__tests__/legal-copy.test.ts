import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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
import { getLegalDocument } from '@/lib/legal/get-legal-document';
import {
    isExplicitLegalPlaceholder,
    legalConfig,
    unresolvedLegalFields,
} from '@/lib/legal/legal-config';
import { ENGLISH_LEGAL_PRECEDENCE_NOTICE } from '@/lib/legal/legal-document';

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

const navKeys = [
    'label',
    'legal',
    'privacy',
    'terms',
    'source',
    'home',
] as const;

const requiredSections = {
    notice: [
        'publisher',
        'hosting',
        'open-source',
        'intellectual-property',
        'personal-data',
        'report',
        'contact',
    ],
    privacy: [
        'controller',
        'data',
        'device',
        'purposes',
        'professional',
        'ai',
        'sharing',
        'transfers',
        'retention',
        'backups',
        'cookies',
        'security',
        'rights',
        'automated',
        'changes',
    ],
    terms: [
        'purpose',
        'beta',
        'acceptance',
        'no-account',
        'account',
        'ownership',
        'imported-content',
        'professional',
        'sharing',
        'prohibited',
        'report',
        'delete-diagram',
        'delete-account',
        'erasure',
        'availability',
        'open-source',
        'suspension',
        'liability',
        'privacy',
        'paid',
        'changes',
        'law',
        'contact',
    ],
} as const;

const sectionIds = (
    sections: { id: string; subsections?: { id: string }[] }[]
): string[] =>
    sections.flatMap((section) => [
        section.id,
        ...(section.subsections?.map((child) => child.id) ?? []),
    ]);

describe('legal copy consistency', () => {
    it('defines navigation labels and the Terms checkbox in all 22 locales', () => {
        expect(locales).toHaveLength(22);

        for (const locale of locales) {
            for (const key of navKeys) {
                expect(locale.translation.legal.nav[key].trim()).not.toBe('');
            }
            expect(locale.translation.legal.last_updated).toContain('{{date}}');
            expect(locale.translation.auth.register.accept_terms).toContain(
                '<terms>'
            );
            expect(locale.translation.auth.register.accept_terms).toContain(
                '<privacy>'
            );
            expect(
                locale.translation.auth.register.accept_terms_required.trim()
            ).not.toBe('');
        }
    });

    it('does not copy the English navigation labels into other locales', () => {
        for (const locale of locales) {
            if (locale === en) {
                continue;
            }

            expect(locale.translation.legal.nav.legal).not.toBe(
                en.translation.legal.nav.legal
            );
            expect(locale.translation.legal.nav.source).not.toBe(
                en.translation.legal.nav.source
            );
            expect(locale.translation.auth.register.accept_terms).not.toBe(
                en.translation.auth.register.accept_terms
            );
        }
    });

    it('keeps contractual legal bodies in French and English only', () => {
        for (const id of ['notice', 'privacy', 'terms'] as const) {
            const french = getLegalDocument(id, 'fr');
            const english = getLegalDocument(id, 'en');
            const german = getLegalDocument(id, 'de');

            expect(french.language).toBe('fr');
            expect(english.language).toBe('en');
            expect(german.language).toBe('en');
            expect(french.showEnglishPrecedence).toBe(false);
            expect(english.showEnglishPrecedence).toBe(true);
            expect(german.showEnglishPrecedence).toBe(true);
            expect(sectionIds(french.sections)).toEqual(
                expect.arrayContaining([...requiredSections[id]])
            );
            expect(sectionIds(english.sections)).toEqual(
                expect.arrayContaining([...requiredSections[id]])
            );
        }

        expect(ENGLISH_LEGAL_PRECEDENCE_NOTICE).toContain(
            'French version prevails'
        );
        expect(getLegalDocument('terms', 'fr').versionNote).toBe(
            'Version bêta'
        );
        expect(getLegalDocument('privacy', 'en').title).toBe('Privacy policy');
    });

    it('enumerates unresolved placeholders and points source at the public frontend', () => {
        expect(unresolvedLegalFields.length).toBeGreaterThan(0);
        for (const field of unresolvedLegalFields) {
            expect(isExplicitLegalPlaceholder(legalConfig[field])).toBe(true);
        }

        expect(legalConfig.serviceName).toBe('FoxalDB');
        expect(legalConfig.sourceCodeUrl).toBe(
            'https://github.com/foxalface/foxaldb-front'
        );
        expect(legalConfig.sourceCodeUrl).not.toContain('foxaldb-backend');
        expect(legalConfig.legalLastUpdated).toBe('2026-11-10');
    });

    it('does not add an analytics script to the public shell', () => {
        const frontendRoot = resolve(
            dirname(fileURLToPath(import.meta.url)),
            '../../../..'
        );
        const indexHtml = readFileSync(
            resolve(frontendRoot, 'index.html'),
            'utf8'
        );
        const main = readFileSync(
            resolve(frontendRoot, 'src/main.tsx'),
            'utf8'
        );
        const helmet = readFileSync(
            resolve(frontendRoot, 'src/helmet/helmet-data.tsx'),
            'utf8'
        );
        const combined = `${indexHtml}\n${main}\n${helmet}`;

        expect(combined).not.toMatch(
            /gtag|googletagmanager|plausible|posthog|segment\.com|hotjar/i
        );
        expect(indexHtml).not.toContain('app.chartdb.io');
    });
});
