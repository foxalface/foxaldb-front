import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { fr } from '@/i18n/locales/fr';
import { drizzleExportNoteMessages as enDrizzleExportNoteMessages } from '@/i18n/drizzle-export-notes/en';
import type { DrizzleExportNote } from '@/lib/api/drizzle-export-types';
import {
    getDrizzleExportNotePresentation,
    hasDrizzleExportNotePresentationPolicy,
} from '../get-drizzle-export-note-presentation';
import { getDrizzleExportErrorPresentation } from '../get-drizzle-export-error-presentation';
import { KNOWN_DRIZZLE_EXPORT_NOTE_CODES } from '../drizzle-export-note-codes';

const resolveFromBundle = (
    bundle: unknown,
    key: string,
    options?: Record<string, unknown>
): string => {
    const notesRoot = 'export_wizard.drizzle.result_step.notes';
    if (!key.startsWith(notesRoot)) {
        return key;
    }

    const relativeKey = key.slice(notesRoot.length + 1);
    let current: unknown = bundle;

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

const t = ((key: string, options?: Record<string, unknown>) =>
    resolveFromBundle(enDrizzleExportNoteMessages, key, options)) as TFunction;

const frenchT = ((key: string, options?: Record<string, unknown>) =>
    resolveFromBundle(
        fr.translation.export_wizard.drizzle.result_step.notes,
        key,
        options
    )) as TFunction;

const note = (partial: DrizzleExportNote): DrizzleExportNote => ({
    code: partial.code,
    message: partial.message,
    path: partial.path,
    metadata: partial.metadata,
});

const knownNoteFixtures: Array<{
    note: DrizzleExportNote;
    mustContain: string[];
}> = [
    {
        note: note({
            code: 'view_skipped',
            message: 'SENTINEL',
            path: 'active_users',
        }),
        mustContain: ['active_users'],
    },
    {
        note: note({
            code: 'keyless_table_skipped',
            message: 'SENTINEL',
            path: 'logs',
            metadata: { reason: 'no_representable_columns' },
        }),
        mustContain: ['logs'],
    },
    {
        note: note({
            code: 'keyless_table',
            message: 'SENTINEL',
            path: 'article_categories',
            metadata: { reason: 'no_primary_key' },
        }),
        mustContain: ['article_categories'],
    },
    {
        note: note({
            code: 'schema_ignored_sqlite',
            message: 'SENTINEL',
            path: 'users',
            metadata: { schema: 'ignored' },
        }),
        mustContain: ['users', 'ignored'],
    },
    {
        note: note({
            code: 'mysql_catalog_omitted',
            message: 'SENTINEL',
            metadata: { affectedPaths: ['shop'] },
        }),
        mustContain: ['shop'],
    },
    {
        note: note({
            code: 'mysql_multiple_catalogs_ignored',
            message: 'SENTINEL',
            metadata: { affectedPaths: ['shop', 'billing'] },
        }),
        mustContain: ['2'],
    },
    {
        note: note({
            code: 'mariadb_catalog_omitted',
            message: 'SENTINEL',
            metadata: { affectedPaths: ['shop'] },
        }),
        mustContain: ['shop'],
    },
    {
        note: note({
            code: 'mariadb_multiple_catalogs_ignored',
            message: 'SENTINEL',
            metadata: { affectedPaths: ['a', 'b', 'c'] },
        }),
        mustContain: ['3'],
    },
    {
        note: note({
            code: 'mariadb_mysql_dialect_adapted',
            message: 'SENTINEL',
            metadata: { dialect: 'mysql' },
        }),
        mustContain: ['mysql'],
    },
    {
        note: note({
            code: 'postgres_schema_qualified',
            message: 'SENTINEL',
            path: 'project_space',
            metadata: { schema: 'project_space', tsName: 'projectSpace' },
        }),
        mustContain: ['project_space'],
    },
    {
        note: note({
            code: 'uuid_as_text',
            message: 'SENTINEL',
            path: 'users.id',
            metadata: { reason: 'uuid_as_varchar' },
        }),
        mustContain: ['users.id'],
    },
    {
        note: note({
            code: 'increment_omitted',
            message: 'SENTINEL',
            path: 'items.id',
            metadata: { reason: 'unsupported_increment' },
        }),
        mustContain: ['items.id'],
    },
    {
        note: note({
            code: 'set_null_omitted',
            message: 'SENTINEL',
            path: 'posts.user_id',
            metadata: { reason: 'not_null' },
        }),
        mustContain: ['posts.user_id'],
    },
    {
        note: note({
            code: 'sqlite_boolean_integer',
            message: 'SENTINEL',
            path: 'users.active',
        }),
        mustContain: ['users.active'],
    },
    {
        note: note({
            code: 'sqlite_json_text',
            message: 'SENTINEL',
            path: 'users.meta',
        }),
        mustContain: ['users.meta'],
    },
    {
        note: note({
            code: 'table_name_adjusted',
            message: 'SENTINEL',
            path: 'users',
            metadata: { tsName: 'usersTable', physicalName: 'users' },
        }),
        mustContain: ['users', 'usersTable'],
    },
    {
        note: note({
            code: 'table_name_collision',
            message: 'SENTINEL',
            path: 'users',
            metadata: { tsName: 'users2', physicalName: 'users' },
        }),
        mustContain: ['users', 'users2'],
    },
    {
        note: note({
            code: 'column_name_adjusted',
            message: 'SENTINEL',
            path: 'users.class',
            metadata: { tsName: 'classCol', physicalName: 'class' },
        }),
        mustContain: ['users.class', 'classCol'],
    },
    {
        note: note({
            code: 'relationship_skipped',
            message: 'SENTINEL',
            path: 'posts_users',
            metadata: { reason: 'label_only' },
        }),
        mustContain: ['posts_users'],
    },
    {
        note: note({
            code: 'index_omitted',
            message: 'SENTINEL',
            path: 'items.payload_gin',
            metadata: { reason: 'unsupported_method', indexType: 'gist' },
        }),
        mustContain: ['items.payload_gin', 'gist'],
    },
    {
        note: note({
            code: 'comment_omitted',
            message: 'SENTINEL',
            path: 'users',
            metadata: { scope: 'table' },
        }),
        mustContain: ['users'],
    },
    {
        note: note({
            code: 'check_omitted',
            message: 'SENTINEL',
            path: 'users.email',
            metadata: { scope: 'column' },
        }),
        mustContain: ['users.email'],
    },
    {
        note: note({
            code: 'set_degraded',
            message: 'SENTINEL',
            path: 'users.roles',
            metadata: { reason: 'set_as_text' },
        }),
        mustContain: ['users.roles'],
    },
    {
        note: note({
            code: 'enum_degraded',
            message: 'SENTINEL',
            path: 'users.status',
            metadata: { reason: 'ts_enum_only' },
        }),
        mustContain: ['users.status'],
    },
    {
        note: note({
            code: 'type_omitted',
            message: 'SENTINEL',
            path: 'users.tags',
            metadata: { reason: 'array' },
        }),
        mustContain: ['users.tags'],
    },
    {
        note: note({
            code: 'type_degraded',
            message: 'SENTINEL',
            path: 'users.payload',
            metadata: { reason: 'binary_as_bytea' },
        }),
        mustContain: ['users.payload'],
    },
    {
        note: note({
            code: 'default_omitted',
            message: 'SENTINEL',
            path: 'events.created_at',
            metadata: {
                reason: 'sql_expression',
                expression: 'now() + interval',
            },
        }),
        mustContain: ['events.created_at', 'now() + interval'],
    },
];

describe('getDrizzleExportNotePresentation', () => {
    it.each(knownNoteFixtures)(
        'localizes $note.code without using the English backend message',
        ({ note: fixture, mustContain }) => {
            const result = getDrizzleExportNotePresentation(fixture, t);

            expect(result.message).not.toBe('SENTINEL');
            expect(result.message).not.toContain('SENTINEL');
            for (const token of mustContain) {
                expect(result.message).toContain(token);
            }
        }
    );

    it('localizes table_name_adjusted kinds from metadata without parsing English', () => {
        const pgEnum = getDrizzleExportNotePresentation(
            note({
                code: 'table_name_adjusted',
                message: 'IGNORED ENGLISH MESSAGE',
                path: 'status',
                metadata: {
                    tsName: 'statusEnum',
                    physicalName: 'status',
                    kind: 'pgEnum',
                },
            }),
            t
        );
        expect(pgEnum.message).toContain('statusEnum');
        expect(pgEnum.message).not.toContain('IGNORED ENGLISH MESSAGE');

        const pgSchema = getDrizzleExportNotePresentation(
            note({
                code: 'table_name_adjusted',
                message: 'IGNORED ENGLISH MESSAGE',
                path: 'billing',
                metadata: {
                    tsName: 'billingSchema',
                    physicalName: 'billing',
                    kind: 'pgSchema',
                },
            }),
            t
        );
        expect(pgSchema.message).toContain('billingSchema');
        expect(pgSchema.message).not.toContain('IGNORED ENGLISH MESSAGE');
    });

    it('localizes French catalog and MariaDB adaptation notes from structured values', () => {
        const catalog = getDrizzleExportNotePresentation(
            note({
                code: 'mysql_catalog_omitted',
                message: 'IGNORED ENGLISH MESSAGE',
                metadata: { affectedPaths: ['foxaldb'] },
            }),
            frenchT
        );
        expect(catalog.message).toContain('foxaldb');
        expect(catalog.message).not.toContain('IGNORED ENGLISH MESSAGE');

        const adapted = getDrizzleExportNotePresentation(
            note({
                code: 'mariadb_mysql_dialect_adapted',
                message: 'IGNORED ENGLISH MESSAGE',
                metadata: { dialect: 'mysql' },
            }),
            frenchT
        );
        expect(adapted.message).toContain('mysql');
        expect(adapted.message).not.toContain('IGNORED ENGLISH MESSAGE');
    });

    it('falls back to backend message for unknown codes', () => {
        const backendMessage = 'Future backend note message.';
        const result = getDrizzleExportNotePresentation(
            note({
                code: 'future_note_code',
                message: backendMessage,
            }),
            t
        );

        expect(result.message).toBe(backendMessage);
    });

    it('uses a localized fallback when an unknown note has no message', () => {
        const unknownT = ((key: string) =>
            key === 'export_wizard.drizzle.result_step.unknown_note'
                ? 'Localized unknown note'
                : key) as TFunction;

        const result = getDrizzleExportNotePresentation(
            note({
                code: 'future_note_code',
                message: '   ',
            }),
            unknownT
        );

        expect(result.message).toBe('Localized unknown note');
    });

    it('falls back when required metadata is missing', () => {
        const backendMessage =
            'Table "users" is exported as TypeScript constant usersTable.';
        const result = getDrizzleExportNotePresentation(
            note({
                code: 'table_name_adjusted',
                message: backendMessage,
                path: 'users',
            }),
            t
        );

        expect(result.message).toBe(backendMessage);
    });

    it('falls back for known code with unknown reason token', () => {
        const backendMessage = 'Default omitted for unknown reason.';
        const result = getDrizzleExportNotePresentation(
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

    it('ignores unknown metadata keys safely', () => {
        const result = getDrizzleExportNotePresentation(
            note({
                code: 'view_skipped',
                message: 'SENTINEL',
                path: 'active_users',
                metadata: {
                    unexpectedJson: { nested: true },
                    extra: 'ignored',
                },
            }),
            t
        );

        expect(result.message).toContain('active_users');
        expect(result.message).not.toContain('unexpectedJson');
        expect(result.message).not.toContain('SENTINEL');
    });

    it('covers every known Drizzle note code with a presentation policy', () => {
        const fixtureCodes = new Set(
            knownNoteFixtures.map((fixture) => fixture.note.code)
        );

        for (const code of KNOWN_DRIZZLE_EXPORT_NOTE_CODES) {
            expect(hasDrizzleExportNotePresentationPolicy(code)).toBe(true);
            expect(fixtureCodes.has(code)).toBe(true);
        }
    });

    it('does not mutate the input note', () => {
        const input = note({
            code: 'view_skipped',
            message: 'Skipped view "users".',
            path: 'users',
        });
        const snapshot = JSON.stringify(input);

        getDrizzleExportNotePresentation(input, t);

        expect(JSON.stringify(input)).toBe(snapshot);
    });
});

describe('getDrizzleExportErrorPresentation', () => {
    const errorT = ((key: string, options?: Record<string, unknown>) => {
        if (key === 'export_wizard.drizzle.result_step.error_semantic') {
            return 'Localized generic semantic error';
        }

        if (key === 'export_wizard.drizzle.result_step.errors.empty_diagram') {
            return 'Localized empty diagram';
        }

        if (
            key ===
            'export_wizard.drizzle.result_step.errors.unsupported_database'
        ) {
            return 'Localized unsupported database';
        }

        if (
            key ===
            'export_wizard.drizzle.result_step.errors.unsupported_structural_field'
        ) {
            return `Localized structural ${String(options?.path ?? '')}`;
        }

        if (
            key ===
            'export_wizard.drizzle.result_step.errors.mysql_catalog_collision'
        ) {
            return `Localized mysql collision ${String(options?.path ?? '')}`;
        }

        if (
            key ===
            'export_wizard.drizzle.result_step.errors.mariadb_catalog_collision'
        ) {
            return `Localized mariadb collision ${String(options?.path ?? '')}`;
        }

        return key;
    }) as TFunction;

    it('localizes known semantic errors from code and path', () => {
        expect(
            getDrizzleExportErrorPresentation(
                {
                    code: 'empty_diagram',
                    message: 'SENTINEL empty',
                },
                errorT
            )
        ).toBe('Localized empty diagram');

        expect(
            getDrizzleExportErrorPresentation(
                {
                    code: 'unsupported_database',
                    message: 'SENTINEL db',
                },
                errorT
            )
        ).toBe('Localized unsupported database');

        expect(
            getDrizzleExportErrorPresentation(
                {
                    code: 'unsupported_structural_field',
                    message: 'SENTINEL field',
                    path: 'users.id',
                },
                errorT
            )
        ).toBe('Localized structural users.id');

        expect(
            getDrizzleExportErrorPresentation(
                {
                    code: 'mysql_catalog_collision',
                    message: 'SENTINEL collision',
                    path: 'users',
                },
                errorT
            )
        ).toBe('Localized mysql collision users');

        expect(
            getDrizzleExportErrorPresentation(
                {
                    code: 'mariadb_catalog_collision',
                    message: 'SENTINEL collision',
                    path: 'orders',
                },
                errorT
            )
        ).toBe('Localized mariadb collision orders');
    });

    it('uses a generic localized fallback for unknown error codes', () => {
        expect(
            getDrizzleExportErrorPresentation(
                {
                    code: 'future_error',
                    message: 'Backend future error',
                },
                errorT
            )
        ).toBe('Localized generic semantic error');
    });
});
