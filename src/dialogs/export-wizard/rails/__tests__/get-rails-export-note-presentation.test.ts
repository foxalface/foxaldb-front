import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { fr } from '@/i18n/locales/fr';
import { railsExportNoteMessages as enRailsExportNoteMessages } from '@/i18n/rails-export-notes/en';
import type { RailsExportNote } from '@/lib/api/rails-export-types';
import {
    getRailsExportNotePresentation,
    hasRailsExportNotePresentationPolicy,
} from '../get-rails-export-note-presentation';
import { KNOWN_RAILS_EXPORT_NOTE_CODES } from '../rails-export-note-codes';

const resolveKey = (key: string, options?: Record<string, unknown>): string => {
    const notesRoot = 'export_wizard.rails.result_step.notes';
    if (!key.startsWith(notesRoot)) {
        return key;
    }

    const relativeKey = key.slice(notesRoot.length + 1);
    let current: unknown = enRailsExportNoteMessages;

    for (const segment of relativeKey.split('.')) {
        if (
            typeof current !== 'object' ||
            current === null ||
            !(segment in current)
        ) {
            return key;
        }

        current = (current as Record<string, unknown>)[segment];
    }

    if (typeof current !== 'string') {
        return key;
    }

    return current.replace(/\{\{(\w+)\}\}/g, (_match, token: string) => {
        const value = options?.[token];
        return value === undefined || value === null ? '' : String(value);
    });
};

const t = resolveKey as TFunction;

const note = (partial: RailsExportNote): RailsExportNote => ({
    code: partial.code,
    message: partial.message,
    path: partial.path,
    metadata: partial.metadata,
});

describe('getRailsExportNotePresentation', () => {
    it('localizes mysql_catalog_omitted using affectedPaths[0]', () => {
        const result = getRailsExportNotePresentation(
            note({
                code: 'mysql_catalog_omitted',
                message:
                    'SENTINEL: MySQL catalog "foxaldb" is omitted; Rails uses the connected database and unqualified table names.',
                metadata: { affectedPaths: ['foxaldb'] },
            }),
            t
        );

        expect(result.message).toContain('foxaldb');
        expect(result.message).not.toContain('SENTINEL');
    });

    it('localizes French mysql catalog note structurally', () => {
        const frenchT = ((key: string, options?: Record<string, unknown>) => {
            const notesRoot = 'export_wizard.rails.result_step.notes';
            if (!key.startsWith(notesRoot)) {
                return key;
            }

            const relativeKey = key.slice(notesRoot.length + 1);
            let current: unknown =
                fr.translation.export_wizard.rails.result_step.notes;

            for (const segment of relativeKey.split('.')) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(segment in current)
                ) {
                    return key;
                }

                current = (current as Record<string, unknown>)[segment];
            }

            if (typeof current !== 'string') {
                return key;
            }

            return current.replace(
                /\{\{(\w+)\}\}/g,
                (_match, token: string) => {
                    const value = options?.[token];
                    return value === undefined || value === null
                        ? ''
                        : String(value);
                }
            );
        }) as TFunction;

        const result = getRailsExportNotePresentation(
            note({
                code: 'mysql_catalog_omitted',
                message: 'IGNORED ENGLISH MESSAGE',
                metadata: { affectedPaths: ['foxaldb'] },
            }),
            frenchT
        );

        expect(result.message).toContain('foxaldb');
        expect(result.message).toContain('MySQL');
        expect(result.message).not.toContain('IGNORED ENGLISH MESSAGE');
    });

    it('localizes model_name_adjusted using path and metadata.className', () => {
        const result = getRailsExportNotePresentation(
            note({
                code: 'model_name_adjusted',
                message:
                    'SENTINEL: Model class for table "migrations" was allocated as MigrationRecord.',
                path: 'migrations',
                metadata: { className: 'MigrationRecord' },
            }),
            t
        );

        expect(result.message).toContain('migrations');
        expect(result.message).toContain('MigrationRecord');
        expect(result.message).not.toContain('SENTINEL');
    });

    it('localizes French model_name_adjusted structurally', () => {
        const frenchT = ((key: string, options?: Record<string, unknown>) => {
            const notesRoot = 'export_wizard.rails.result_step.notes';
            if (!key.startsWith(notesRoot)) {
                return key;
            }

            const relativeKey = key.slice(notesRoot.length + 1);
            let current: unknown =
                fr.translation.export_wizard.rails.result_step.notes;

            for (const segment of relativeKey.split('.')) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(segment in current)
                ) {
                    return key;
                }

                current = (current as Record<string, unknown>)[segment];
            }

            if (typeof current !== 'string') {
                return key;
            }

            return current.replace(
                /\{\{(\w+)\}\}/g,
                (_match, token: string) => {
                    const value = options?.[token];
                    return value === undefined || value === null
                        ? ''
                        : String(value);
                }
            );
        }) as TFunction;

        const result = getRailsExportNotePresentation(
            note({
                code: 'model_name_adjusted',
                message: 'IGNORED ENGLISH MESSAGE',
                path: 'migrations',
                metadata: { className: 'MigrationRecord' },
            }),
            frenchT
        );

        expect(result.message).toContain('migrations');
        expect(result.message).toContain('MigrationRecord');
        expect(result.message).not.toContain('IGNORED ENGLISH MESSAGE');
    });

    it('localizes many_to_many_through_skipped using path', () => {
        const result = getRailsExportNotePresentation(
            note({
                code: 'many_to_many_through_skipped',
                message:
                    'SENTINEL: has_many :through was not generated for join table "diagram_members" because association names were ambiguous.',
                path: 'diagram_members',
            }),
            t
        );

        expect(result.message).toContain('diagram_members');
        expect(result.message).not.toContain('SENTINEL');
    });

    it('localizes French many_to_many_through_skipped structurally', () => {
        const frenchT = ((key: string, options?: Record<string, unknown>) => {
            const notesRoot = 'export_wizard.rails.result_step.notes';
            if (!key.startsWith(notesRoot)) {
                return key;
            }

            const relativeKey = key.slice(notesRoot.length + 1);
            let current: unknown =
                fr.translation.export_wizard.rails.result_step.notes;

            for (const segment of relativeKey.split('.')) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(segment in current)
                ) {
                    return key;
                }

                current = (current as Record<string, unknown>)[segment];
            }

            if (typeof current !== 'string') {
                return key;
            }

            return current.replace(
                /\{\{(\w+)\}\}/g,
                (_match, token: string) => {
                    const value = options?.[token];
                    return value === undefined || value === null
                        ? ''
                        : String(value);
                }
            );
        }) as TFunction;

        const result = getRailsExportNotePresentation(
            note({
                code: 'many_to_many_through_skipped',
                message: 'IGNORED ENGLISH MESSAGE',
                path: 'diagram_members',
            }),
            frenchT
        );

        expect(result.message).toContain('diagram_members');
        expect(result.message).toContain('has_many :through');
        expect(result.message).not.toContain('IGNORED ENGLISH MESSAGE');
    });

    it('falls back to backend message for unknown codes', () => {
        const backendMessage = 'Future backend note message.';
        const result = getRailsExportNotePresentation(
            note({
                code: 'future_note_code',
                message: backendMessage,
            }),
            t
        );

        expect(result.message).toBe(backendMessage);
    });

    it('falls back when required metadata is missing', () => {
        const backendMessage =
            'Model class for table "migrations" was allocated as MigrationRecord.';
        const result = getRailsExportNotePresentation(
            note({
                code: 'model_name_adjusted',
                message: backendMessage,
                path: 'migrations',
            }),
            t
        );

        expect(result.message).toBe(backendMessage);
    });

    it('falls back for known code with unknown reason token', () => {
        const backendMessage = 'Default omitted for unknown reason.';
        const result = getRailsExportNotePresentation(
            note({
                code: 'default_omitted',
                message: backendMessage,
                path: 'events.email',
                metadata: { reason: 'future_reason' },
            }),
            t
        );

        expect(result.message).toBe(backendMessage);
    });

    it('derives multiple catalog count from affectedPaths.length', () => {
        const result = getRailsExportNotePresentation(
            note({
                code: 'mysql_multiple_catalogs_ignored',
                message: 'SENTINEL multiple catalogs',
                metadata: { affectedPaths: ['shop', 'billing', 'auth'] },
            }),
            t
        );

        expect(result.message).toContain('3');
        expect(result.message).not.toContain('SENTINEL');
    });

    it('covers every known Rails note code with a presentation policy', () => {
        for (const code of KNOWN_RAILS_EXPORT_NOTE_CODES) {
            expect(hasRailsExportNotePresentationPolicy(code)).toBe(true);
        }
    });

    it('does not throw on malformed metadata', () => {
        const backendMessage = 'Backend fallback.';
        const result = getRailsExportNotePresentation(
            note({
                code: 'mysql_catalog_omitted',
                message: backendMessage,
                metadata: { affectedPaths: [123, null] },
            }),
            t
        );

        expect(result.message).toBe(backendMessage);
    });

    it('does not mutate the input note', () => {
        const input = note({
            code: 'view_skipped',
            message: 'Skipped view "users".',
            path: 'users',
        });
        const snapshot = JSON.stringify(input);

        getRailsExportNotePresentation(input, t);

        expect(JSON.stringify(input)).toBe(snapshot);
    });
});
