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

describe('share invitation locale consistency', () => {
    it('keeps owner share success and invitation copy in every locale', () => {
        const english = en.translation.share_diagram_dialog;

        for (const locale of locales) {
            const dialog = locale.translation.share_diagram_dialog;
            expect(dialog.add_member.success.length).toBeGreaterThan(0);
            expect(dialog.add_member.helper.length).toBeGreaterThan(0);
            expect(dialog.invitations.heading.length).toBeGreaterThan(0);
            expect(dialog.invitations.pending.length).toBeGreaterThan(0);
            expect(dialog.invitations.expired.length).toBeGreaterThan(0);
            expect(dialog.invitations.expires).toContain('{{date}}');
            expect(dialog.invitations.renewed.length).toBeGreaterThan(0);
            expect(dialog.invitations.revoke.length).toBeGreaterThan(0);

            if (locale !== en) {
                expect(dialog.add_member.success).not.toBe(
                    english.add_member.success
                );
                expect(dialog.invitations.heading).not.toBe(
                    english.invitations.heading
                );
            }
        }
    });
});
