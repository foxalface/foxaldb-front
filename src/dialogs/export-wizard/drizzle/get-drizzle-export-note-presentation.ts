import type { TFunction } from 'i18next';
import type { DrizzleExportNote } from '@/lib/api/drizzle-export-types';
import {
    KNOWN_DRIZZLE_EXPORT_NOTE_CODES,
    type KnownDrizzleExportNoteCode,
} from './drizzle-export-note-codes';

const I18N_PREFIX = 'export_wizard.drizzle.result_step.notes';

type InterpolationMap = Record<string, string | number>;

type NotePresentationPolicy = {
    resolveKey: (note: DrizzleExportNote) => string | null;
    resolveInterpolations: (note: DrizzleExportNote) => InterpolationMap | null;
};

const readString = (
    metadata: Record<string, unknown> | undefined,
    key: string
): string | null => {
    const value = metadata?.[key];
    return typeof value === 'string' && value.length > 0 ? value : null;
};

const readStringArray = (
    metadata: Record<string, unknown> | undefined,
    key: string
): string[] | null => {
    const value = metadata?.[key];
    if (!Array.isArray(value)) {
        return null;
    }

    const strings = value.filter(
        (entry): entry is string =>
            typeof entry === 'string' && entry.length > 0
    );

    return strings.length > 0 ? strings : null;
};

const requirePath = (note: DrizzleExportNote): InterpolationMap | null =>
    typeof note.path === 'string' && note.path.length > 0
        ? { path: note.path }
        : null;

const requireReason = (note: DrizzleExportNote): string | null =>
    readString(note.metadata, 'reason');

const simplePathPolicy = (): NotePresentationPolicy => ({
    resolveKey: (note) => `${I18N_PREFIX}.${note.code}`,
    resolveInterpolations: requirePath,
});

const catalogOmittedPolicy = (): NotePresentationPolicy => ({
    resolveKey: (note) => `${I18N_PREFIX}.${note.code}`,
    resolveInterpolations: (note) => {
        const catalogs = readStringArray(note.metadata, 'affectedPaths');

        if (!catalogs) {
            return null;
        }

        return { catalog: catalogs[0] };
    },
});

const catalogCountPolicy = (): NotePresentationPolicy => ({
    resolveKey: (note) => `${I18N_PREFIX}.${note.code}`,
    resolveInterpolations: (note) => {
        const catalogs = readStringArray(note.metadata, 'affectedPaths');

        if (!catalogs) {
            return null;
        }

        return { count: catalogs.length };
    },
});

const identifierAdjustedPolicy = (): NotePresentationPolicy => ({
    resolveKey: (note) => {
        const kind = readString(note.metadata, 'kind');

        if (kind === 'pgEnum') {
            return `${I18N_PREFIX}.table_name_adjusted.pgEnum`;
        }

        if (kind === 'pgSchema') {
            return `${I18N_PREFIX}.table_name_adjusted.pgSchema`;
        }

        return `${I18N_PREFIX}.table_name_adjusted.table`;
    },
    resolveInterpolations: (note) => {
        const path = requirePath(note);
        const tsName = readString(note.metadata, 'tsName');

        if (!path || !tsName) {
            return null;
        }

        return { ...path, tsName };
    },
});

const NOTE_PRESENTATION_POLICIES: Record<
    KnownDrizzleExportNoteCode,
    NotePresentationPolicy
> = {
    view_skipped: simplePathPolicy(),
    uuid_as_text: simplePathPolicy(),
    increment_omitted: simplePathPolicy(),
    set_null_omitted: simplePathPolicy(),
    keyless_table_skipped: simplePathPolicy(),
    keyless_table: simplePathPolicy(),
    sqlite_boolean_integer: simplePathPolicy(),
    sqlite_json_text: simplePathPolicy(),
    mysql_catalog_omitted: catalogOmittedPolicy(),
    mysql_multiple_catalogs_ignored: catalogCountPolicy(),
    mariadb_catalog_omitted: catalogOmittedPolicy(),
    mariadb_multiple_catalogs_ignored: catalogCountPolicy(),
    mariadb_mysql_dialect_adapted: {
        resolveKey: () => `${I18N_PREFIX}.mariadb_mysql_dialect_adapted`,
        resolveInterpolations: (note) => {
            const dialect = readString(note.metadata, 'dialect');
            return dialect ? { dialect } : { dialect: 'mysql' };
        },
    },
    schema_ignored_sqlite: {
        resolveKey: () => `${I18N_PREFIX}.schema_ignored_sqlite`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const schema = readString(note.metadata, 'schema');

            if (!path || !schema) {
                return null;
            }

            return { ...path, schema };
        },
    },
    postgres_schema_qualified: {
        resolveKey: () => `${I18N_PREFIX}.postgres_schema_qualified`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const schema = readString(note.metadata, 'schema');

            if (!path || !schema) {
                return null;
            }

            const tsName = readString(note.metadata, 'tsName');
            return tsName ? { ...path, schema, tsName } : { ...path, schema };
        },
    },
    table_name_adjusted: identifierAdjustedPolicy(),
    table_name_collision: {
        resolveKey: () => `${I18N_PREFIX}.table_name_collision`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const tsName = readString(note.metadata, 'tsName');

            if (!path || !tsName) {
                return null;
            }

            return { ...path, tsName };
        },
    },
    column_name_adjusted: {
        resolveKey: () => `${I18N_PREFIX}.column_name_adjusted`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const tsName = readString(note.metadata, 'tsName');

            if (!path || !tsName) {
                return null;
            }

            return { ...path, tsName };
        },
    },
    relationship_skipped: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (!reason) {
                return null;
            }

            return `${I18N_PREFIX}.relationship_skipped.${reason}`;
        },
        resolveInterpolations: requirePath,
    },
    index_omitted: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (!reason) {
                return null;
            }

            return `${I18N_PREFIX}.index_omitted.${reason}`;
        },
        resolveInterpolations: (note) => {
            const path = requirePath(note);

            if (!path) {
                return null;
            }

            if (requireReason(note) === 'unsupported_method') {
                const indexType = readString(note.metadata, 'indexType');

                if (!indexType) {
                    return null;
                }

                return { ...path, indexType };
            }

            return path;
        },
    },
    comment_omitted: {
        resolveKey: (note) => {
            const scope = readString(note.metadata, 'scope');

            if (scope !== 'table' && scope !== 'column') {
                return null;
            }

            return `${I18N_PREFIX}.comment_omitted.${scope}`;
        },
        resolveInterpolations: requirePath,
    },
    check_omitted: {
        resolveKey: (note) => {
            const scope = readString(note.metadata, 'scope');

            if (scope !== 'table' && scope !== 'column') {
                return null;
            }

            return `${I18N_PREFIX}.check_omitted.${scope}`;
        },
        resolveInterpolations: requirePath,
    },
    set_degraded: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (!reason) {
                return null;
            }

            return `${I18N_PREFIX}.set_degraded.${reason}`;
        },
        resolveInterpolations: requirePath,
    },
    enum_degraded: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (!reason) {
                return null;
            }

            return `${I18N_PREFIX}.enum_degraded.${reason}`;
        },
        resolveInterpolations: requirePath,
    },
    type_omitted: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (!reason) {
                return null;
            }

            return `${I18N_PREFIX}.type_omitted.${reason}`;
        },
        resolveInterpolations: (note) => {
            const reason = requireReason(note);

            if (reason === 'unimplemented_database') {
                const databaseType = readString(note.metadata, 'databaseType');

                if (!databaseType) {
                    return null;
                }

                return { databaseType };
            }

            return requirePath(note);
        },
    },
    type_degraded: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (!reason) {
                return null;
            }

            return `${I18N_PREFIX}.type_degraded.${reason}`;
        },
        resolveInterpolations: requirePath,
    },
    default_omitted: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (!reason) {
                return null;
            }

            return `${I18N_PREFIX}.default_omitted.${reason}`;
        },
        resolveInterpolations: (note) => {
            const path = requirePath(note);

            if (!path) {
                return null;
            }

            const reason = requireReason(note);

            if (reason === 'sql_expression' || reason === 'unclear') {
                const expression = readString(note.metadata, 'expression');

                if (!expression) {
                    return null;
                }

                return { ...path, expression };
            }

            return path;
        },
    },
};

export const hasDrizzleExportNotePresentationPolicy = (
    code: string
): code is KnownDrizzleExportNoteCode =>
    KNOWN_DRIZZLE_EXPORT_NOTE_CODES.includes(
        code as KnownDrizzleExportNoteCode
    );

export const getDrizzleExportNotePresentation = (
    note: DrizzleExportNote,
    t: TFunction
): { message: string } => {
    if (!hasDrizzleExportNotePresentationPolicy(note.code)) {
        if (note.message.trim().length > 0) {
            return { message: note.message };
        }

        return {
            message: t('export_wizard.drizzle.result_step.unknown_note'),
        };
    }

    const policy = NOTE_PRESENTATION_POLICIES[note.code];
    const key = policy.resolveKey(note);
    const interpolations = policy.resolveInterpolations(note);

    if (key === null || interpolations === null) {
        if (note.message.trim().length > 0) {
            return { message: note.message };
        }

        return {
            message: t('export_wizard.drizzle.result_step.unknown_note'),
        };
    }

    const translated = t(key, interpolations);

    if (translated === key || translated.trim().length === 0) {
        if (note.message.trim().length > 0) {
            return { message: note.message };
        }

        return {
            message: t('export_wizard.drizzle.result_step.unknown_note'),
        };
    }

    return { message: translated };
};
