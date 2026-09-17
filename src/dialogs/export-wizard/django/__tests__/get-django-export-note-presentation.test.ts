import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { fr } from '@/i18n/locales/fr';
import { djangoExportNoteMessages as enDjangoExportNoteMessages } from '@/i18n/django-export-notes/en';
import type { DjangoExportNote } from '@/lib/api/django-export-types';
import {
    getDjangoExportNotePresentation,
    hasDjangoExportNotePresentationPolicy,
} from '../get-django-export-note-presentation';
import { getDjangoExportErrorPresentation } from '../get-django-export-error-presentation';
import { KNOWN_DJANGO_EXPORT_NOTE_CODES } from '../django-export-note-codes';

const resolveFromBundle = (
    bundle: unknown,
    key: string,
    options?: Record<string, unknown>
): string => {
    const notesRoot = 'export_wizard.django.result_step.notes';
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
    resolveFromBundle(enDjangoExportNoteMessages, key, options)) as TFunction;

const frenchT = ((key: string, options?: Record<string, unknown>) =>
    resolveFromBundle(
        fr.translation.export_wizard.django.result_step.notes,
        key,
        options
    )) as TFunction;

const note = (partial: DjangoExportNote): DjangoExportNote => ({
    code: partial.code,
    message: partial.message,
    path: partial.path,
    metadata: partial.metadata,
});

const knownNoteFixtures: Array<{
    note: DjangoExportNote;
    mustContain: string[];
}> = [
    {
        note: note({
            code: 'view_skipped',
            message: 'SENTINEL',
            path: 'active_users',
            metadata: { tableName: 'active_users' },
        }),
        mustContain: ['active_users'],
    },
    {
        note: note({
            code: 'keyless_table_skipped',
            message: 'SENTINEL',
            path: 'logs',
            metadata: { tableName: 'logs' },
        }),
        mustContain: ['logs'],
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
            code: 'postgres_schema_qualified_db_table',
            message: 'SENTINEL',
            path: 'users',
            metadata: { schema: 'auth', table: 'users' },
        }),
        mustContain: ['users', 'auth'],
    },
    {
        note: note({
            code: 'composite_fk_unsupported',
            message: 'SENTINEL',
            path: 'orders_user',
            metadata: { reason: 'composite_fk', relationshipId: 'rel-1' },
        }),
        mustContain: ['orders_user'],
    },
    {
        note: note({
            code: 'many_to_many_skipped',
            message: 'SENTINEL',
            path: 'users_roles',
            metadata: { reason: 'label_only', relationshipId: 'rel-2' },
        }),
        mustContain: ['users_roles'],
    },
    {
        note: note({
            code: 'one_to_one_degraded_non_unique_fk',
            message: 'SENTINEL',
            path: 'profiles.user_id',
            metadata: { reason: 'non_unique_fk', relationshipId: 'rel-3' },
        }),
        mustContain: ['profiles.user_id'],
    },
    {
        note: note({
            code: 'model_name_adjusted',
            message: 'SENTINEL',
            path: 'migrations',
            metadata: { className: 'MigrationRecord' },
        }),
        mustContain: ['migrations', 'MigrationRecord'],
    },
    {
        note: note({
            code: 'model_name_collision',
            message: 'SENTINEL',
            path: 'users',
            metadata: { className: 'User2' },
        }),
        mustContain: ['users', 'User2'],
    },
    {
        note: note({
            code: 'field_name_adjusted',
            message: 'SENTINEL',
            path: 'users.class',
            metadata: { attributeName: 'class_field', dbColumn: 'class' },
        }),
        mustContain: ['users.class', 'class_field', 'class'],
    },
    {
        note: note({
            code: 'related_name_adjusted',
            message: 'SENTINEL',
            path: 'orders.user_id',
            metadata: { relatedName: 'order_user_set' },
        }),
        mustContain: ['orders.user_id', 'order_user_set'],
    },
    {
        note: note({
            code: 'composite_primary_key',
            message: 'SENTINEL',
            path: 'memberships',
            metadata: { className: 'Membership', attributes: ['user', 'team'] },
        }),
        mustContain: ['memberships', 'user', 'team'],
    },
    {
        note: note({
            code: 'on_update_omitted',
            message: 'SENTINEL',
            path: 'orders.user_id',
            metadata: { action: 'cascade' },
        }),
        mustContain: ['orders.user_id', 'cascade'],
    },
    {
        note: note({
            code: 'on_delete_restrict_degraded',
            message: 'SENTINEL',
            path: 'orders.user_id',
            metadata: { action: 'restrict', mapped: 'DO_NOTHING' },
        }),
        mustContain: ['orders.user_id'],
    },
    {
        note: note({
            code: 'set_null_omitted',
            message: 'SENTINEL',
            path: 'orders.user_id',
            metadata: { event: 'delete', action: 'set_null' },
        }),
        mustContain: ['orders.user_id'],
    },
    {
        note: note({
            code: 'many_to_many_through_skipped',
            message: 'SENTINEL',
            path: 'diagram_members',
            metadata: { reason: 'extra_columns', className: 'DiagramMember' },
        }),
        mustContain: ['diagram_members'],
    },
    {
        note: note({
            code: 'relationship_skipped',
            message: 'SENTINEL',
            path: 'orders_user',
            metadata: { reason: 'primary_key_fk', relationshipId: 'rel-4' },
        }),
        mustContain: ['orders_user'],
    },
    {
        note: note({
            code: 'index_omitted',
            message: 'SENTINEL',
            path: 'users.gin_email',
            metadata: { reason: 'unsupported_type', indexType: 'gin' },
        }),
        mustContain: ['users.gin_email', 'gin'],
    },
    {
        note: note({
            code: 'index_name_adjusted',
            message: 'SENTINEL',
            path: 'items.this_name_is_far_too_long_for_django_index',
            metadata: {
                originalName: 'this_name_is_far_too_long_for_django_index',
                allocatedName: 'this_name_is_far_too_l_ab12cd34',
                reason: 'unsafe_name',
            },
        }),
        mustContain: [
            'this_name_is_far_too_long_for_django_index',
            'this_name_is_far_too_l_ab12cd34',
        ],
    },
    {
        note: note({
            code: 'constraint_name_adjusted',
            message: 'SENTINEL',
            path: 'diagram_members.diagram_members_diagram_id_user_id_unique',
            metadata: {
                originalName: 'diagram_members_diagram_id_user_id_unique',
                allocatedName: 'diagram_members_diagr_ef56gh78',
                reason: 'unsafe_name',
            },
        }),
        mustContain: [
            'diagram_members_diagram_id_user_id_unique',
            'diagram_members_diagr_ef56gh78',
        ],
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
            path: 'users',
            metadata: {
                scope: 'table',
                reason: 'unsupported_sql',
                expression: 'age > 0',
            },
        }),
        mustContain: ['users'],
    },
    {
        note: note({
            code: 'set_degraded',
            message: 'SENTINEL',
            path: 'users.roles',
            metadata: { reason: 'set_as_text', sourceType: 'set' },
        }),
        mustContain: ['users.roles'],
    },
    {
        note: note({
            code: 'enum_degraded',
            message: 'SENTINEL',
            path: 'users.status',
            metadata: { reason: 'enum_as_text', typeName: 'status' },
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
            path: 'users.name',
            metadata: {
                reason: 'varchar_without_max_length',
                mappedField: 'TextField',
            },
        }),
        mustContain: ['users.name', 'TextField'],
    },
    {
        note: note({
            code: 'default_omitted',
            message: 'SENTINEL',
            path: 'users.created_at',
            metadata: {
                reason: 'sql_expression',
                expression: 'now() + interval 1',
            },
        }),
        mustContain: ['users.created_at', 'now() + interval 1'],
    },
];

describe('getDjangoExportNotePresentation', () => {
    it.each(knownNoteFixtures)(
        'localizes $note.code from metadata/path without parsing the English message',
        ({ note: fixture, mustContain }) => {
            const result = getDjangoExportNotePresentation(fixture, t);

            expect(result.message).not.toContain('SENTINEL');
            for (const token of mustContain) {
                expect(result.message).toContain(token);
            }
        }
    );

    it('localizes French catalog and model notes from structured values', () => {
        const catalog = getDjangoExportNotePresentation(
            note({
                code: 'mysql_catalog_omitted',
                message: 'IGNORED ENGLISH MESSAGE',
                metadata: { affectedPaths: ['foxaldb'] },
            }),
            frenchT
        );
        expect(catalog.message).toContain('foxaldb');
        expect(catalog.message).toContain('MySQL');
        expect(catalog.message).not.toContain('IGNORED ENGLISH MESSAGE');

        const model = getDjangoExportNotePresentation(
            note({
                code: 'model_name_adjusted',
                message: 'IGNORED ENGLISH MESSAGE',
                path: 'migrations',
                metadata: { className: 'MigrationRecord' },
            }),
            frenchT
        );
        expect(model.message).toContain('migrations');
        expect(model.message).toContain('MigrationRecord');
        expect(model.message).not.toContain('IGNORED ENGLISH MESSAGE');
    });

    it('falls back to backend message for unknown codes', () => {
        const backendMessage = 'Future backend note message.';
        const result = getDjangoExportNotePresentation(
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
        const result = getDjangoExportNotePresentation(
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
        const result = getDjangoExportNotePresentation(
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

    it('interpolates index name adjustment metadata without parsing English', () => {
        const result = getDjangoExportNotePresentation(
            note({
                code: 'index_name_adjusted',
                message: 'IGNORED ENGLISH MESSAGE',
                path: 'items.long_name',
                metadata: {
                    originalName: 'long_original_index_name_here_extra',
                    allocatedName: 'long_original_index_ab12cd34',
                    reason: 'unsafe_name',
                },
            }),
            t
        );

        expect(result.message).not.toContain('IGNORED ENGLISH MESSAGE');
        expect(result.message).toContain('long_original_index_name_here_extra');
        expect(result.message).toContain('long_original_index_ab12cd34');
    });

    it('interpolates constraint name collision metadata', () => {
        const result = getDjangoExportNotePresentation(
            note({
                code: 'constraint_name_adjusted',
                message: 'IGNORED ENGLISH MESSAGE',
                metadata: {
                    originalName: 'items_sku_idx',
                    allocatedName: 'items_sku_idx_ab12cd34',
                    reason: 'name_collision',
                },
            }),
            t
        );

        expect(result.message).not.toContain('IGNORED ENGLISH MESSAGE');
        expect(result.message).toContain('items_sku_idx');
        expect(result.message).toContain('items_sku_idx_ab12cd34');
    });

    it('falls back when index name adjustment metadata is missing', () => {
        const backendMessage = 'Backend index name adjustment.';
        const result = getDjangoExportNotePresentation(
            note({
                code: 'index_name_adjusted',
                message: backendMessage,
                path: 'items.idx',
                metadata: { reason: 'unsafe_name' },
            }),
            t
        );

        expect(result.message).toBe(backendMessage);
    });

    it('falls back for unknown index name adjustment reason', () => {
        const backendMessage = 'Backend future name reason.';
        const result = getDjangoExportNotePresentation(
            note({
                code: 'index_name_adjusted',
                message: backendMessage,
                metadata: {
                    originalName: 'a',
                    allocatedName: 'b',
                    reason: 'future_reason',
                },
            }),
            t
        );

        expect(result.message).toBe(backendMessage);
    });

    it('covers every known Django note code with a presentation policy', () => {
        const fixtureCodes = new Set(
            knownNoteFixtures.map((fixture) => fixture.note.code)
        );

        for (const code of KNOWN_DJANGO_EXPORT_NOTE_CODES) {
            expect(hasDjangoExportNotePresentationPolicy(code)).toBe(true);
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

        getDjangoExportNotePresentation(input, t);

        expect(JSON.stringify(input)).toBe(snapshot);
    });
});

describe('getDjangoExportErrorPresentation', () => {
    const errorT = ((key: string, options?: Record<string, unknown>) => {
        if (key === 'export_wizard.django.result_step.errors.empty_diagram') {
            return 'Localized empty diagram';
        }

        if (
            key ===
            'export_wizard.django.result_step.errors.mysql_catalog_collision'
        ) {
            return `Localized collision ${String(options?.path ?? '')}`;
        }

        return key;
    }) as TFunction;

    it('localizes known semantic errors from code and path', () => {
        expect(
            getDjangoExportErrorPresentation(
                {
                    code: 'empty_diagram',
                    message: 'SENTINEL empty',
                },
                errorT
            )
        ).toBe('Localized empty diagram');

        expect(
            getDjangoExportErrorPresentation(
                {
                    code: 'mysql_catalog_collision',
                    message: 'SENTINEL collision',
                    path: 'users',
                },
                errorT
            )
        ).toBe('Localized collision users');
    });

    it('falls back to backend message for unknown error codes', () => {
        expect(
            getDjangoExportErrorPresentation(
                {
                    code: 'future_error',
                    message: 'Backend future error',
                },
                errorT
            )
        ).toBe('Backend future error');
    });

    it('falls back when a collision error is missing path', () => {
        expect(
            getDjangoExportErrorPresentation(
                {
                    code: 'mysql_catalog_collision',
                    message: 'Backend collision without path',
                },
                errorT
            )
        ).toBe('Backend collision without path');
    });
});
