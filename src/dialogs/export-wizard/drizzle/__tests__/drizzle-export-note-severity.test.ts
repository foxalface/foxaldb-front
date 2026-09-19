import { describe, expect, it } from 'vitest';
import { KNOWN_DRIZZLE_EXPORT_NOTE_CODES } from '../drizzle-export-note-codes';
import {
    DRIZZLE_EXPORT_ADAPTATION_NOTE_CODES,
    DRIZZLE_EXPORT_WARNING_NOTE_CODES,
    getDrizzleExportNoteSeverity,
    hasDrizzleExportNoteSeverityPolicy,
    partitionDrizzleExportNotes,
} from '../drizzle-export-note-severity';
import type { DrizzleExportNote } from '@/lib/api/drizzle-export-types';

describe('drizzle export note severity', () => {
    it('assigns a severity to every known Drizzle note code', () => {
        for (const code of KNOWN_DRIZZLE_EXPORT_NOTE_CODES) {
            expect(hasDrizzleExportNoteSeverityPolicy(code)).toBe(true);
        }

        expect(
            DRIZZLE_EXPORT_WARNING_NOTE_CODES.length +
                DRIZZLE_EXPORT_ADAPTATION_NOTE_CODES.length
        ).toBe(KNOWN_DRIZZLE_EXPORT_NOTE_CODES.length);
    });

    it('classifies warning codes as warnings', () => {
        for (const code of DRIZZLE_EXPORT_WARNING_NOTE_CODES) {
            expect(getDrizzleExportNoteSeverity(code)).toBe('warning');
        }
    });

    it('classifies adaptation codes as adaptations', () => {
        for (const code of DRIZZLE_EXPORT_ADAPTATION_NOTE_CODES) {
            expect(getDrizzleExportNoteSeverity(code)).toBe('adaptation');
        }

        expect(DRIZZLE_EXPORT_ADAPTATION_NOTE_CODES).toEqual(
            expect.arrayContaining([
                'mariadb_mysql_dialect_adapted',
                'mysql_catalog_omitted',
                'keyless_table',
                'sqlite_boolean_integer',
                'sqlite_json_text',
            ])
        );
    });

    it('treats unknown codes as warnings so they stay visible', () => {
        expect(getDrizzleExportNoteSeverity('future_note_code')).toBe(
            'warning'
        );
    });

    it('does not infer severity from English message text', () => {
        expect(
            getDrizzleExportNoteSeverity('mariadb_mysql_dialect_adapted')
        ).toBe('adaptation');
        expect(getDrizzleExportNoteSeverity('view_skipped')).toBe('warning');
        expect(
            getDrizzleExportNoteSeverity(
                'This looks like a warning but is an unknown code'
            )
        ).toBe('warning');
    });

    it('partitions mixed notes without changing order within each group', () => {
        const notes: DrizzleExportNote[] = [
            { code: 'view_skipped', message: 'omit' },
            { code: 'mariadb_mysql_dialect_adapted', message: 'adapt' },
            { code: 'index_omitted', message: 'index' },
            { code: 'mysql_catalog_omitted', message: 'catalog' },
        ];

        expect(partitionDrizzleExportNotes(notes)).toEqual({
            warnings: [notes[0], notes[2]],
            adaptations: [notes[1], notes[3]],
        });
    });
});
