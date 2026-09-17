import { describe, expect, it } from 'vitest';
import { KNOWN_DJANGO_EXPORT_NOTE_CODES } from '../django-export-note-codes';
import {
    DJANGO_EXPORT_ADAPTATION_NOTE_CODES,
    DJANGO_EXPORT_WARNING_NOTE_CODES,
    getDjangoExportNoteSeverity,
    hasDjangoExportNoteSeverityPolicy,
    partitionDjangoExportNotes,
} from '../django-export-note-severity';
import type { DjangoExportNote } from '@/lib/api/django-export-types';

describe('django export note severity', () => {
    it('assigns a severity to every known Django note code', () => {
        for (const code of KNOWN_DJANGO_EXPORT_NOTE_CODES) {
            expect(hasDjangoExportNoteSeverityPolicy(code)).toBe(true);
        }

        expect(
            DJANGO_EXPORT_WARNING_NOTE_CODES.length +
                DJANGO_EXPORT_ADAPTATION_NOTE_CODES.length
        ).toBe(KNOWN_DJANGO_EXPORT_NOTE_CODES.length);
    });

    it('classifies warning codes as warnings', () => {
        for (const code of DJANGO_EXPORT_WARNING_NOTE_CODES) {
            expect(getDjangoExportNoteSeverity(code)).toBe('warning');
        }

        expect(DJANGO_EXPORT_WARNING_NOTE_CODES).toEqual(
            expect.arrayContaining([
                'view_skipped',
                'keyless_table_skipped',
                'keyless_model_omitted',
                'type_omitted',
                'type_degraded',
                'enum_degraded',
                'set_degraded',
                'default_omitted',
                'relationship_skipped',
                'composite_fk_unsupported',
                'set_null_omitted',
                'on_delete_restrict_degraded',
                'on_update_omitted',
                'one_to_one_degraded_non_unique_fk',
                'many_to_many_skipped',
                'index_omitted',
                'check_omitted',
            ])
        );
    });

    it('classifies adaptation codes as adaptations', () => {
        for (const code of DJANGO_EXPORT_ADAPTATION_NOTE_CODES) {
            expect(getDjangoExportNoteSeverity(code)).toBe('adaptation');
        }

        expect(DJANGO_EXPORT_ADAPTATION_NOTE_CODES).toEqual(
            expect.arrayContaining([
                'mysql_catalog_omitted',
                'mysql_multiple_catalogs_ignored',
                'mariadb_catalog_omitted',
                'mariadb_multiple_catalogs_ignored',
                'schema_ignored_sqlite',
                'postgres_schema_qualified_db_table',
                'keyless_table_sql_created',
                'model_name_adjusted',
                'model_name_collision',
                'field_name_adjusted',
                'related_name_adjusted',
                'composite_primary_key',
                'many_to_many_through_skipped',
                'comment_omitted',
                'index_name_adjusted',
                'constraint_name_adjusted',
            ])
        );
    });

    it('treats unknown codes as warnings so they stay visible', () => {
        expect(getDjangoExportNoteSeverity('future_note_code')).toBe('warning');
    });

    it('partitions mixed notes without changing order within each group', () => {
        const notes: DjangoExportNote[] = [
            { code: 'index_omitted', message: 'omit' },
            { code: 'index_name_adjusted', message: 'adapt' },
            { code: 'check_omitted', message: 'check' },
            { code: 'mysql_catalog_omitted', message: 'catalog' },
        ];

        expect(partitionDjangoExportNotes(notes)).toEqual({
            warnings: [notes[0], notes[2]],
            adaptations: [notes[1], notes[3]],
        });
    });
});
