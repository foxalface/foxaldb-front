import type { TFunction } from 'i18next';
import type { RailsExportNote } from '@/lib/api/rails-export-types';
import {
    KNOWN_RAILS_EXPORT_NOTE_CODES,
    type KnownRailsExportNoteCode,
} from './rails-export-note-codes';

const I18N_PREFIX = 'export_wizard.rails.result_step.notes';

type InterpolationMap = Record<string, string | number>;

type NotePresentationPolicy = {
    resolveKey: (note: RailsExportNote) => string | null;
    resolveInterpolations: (note: RailsExportNote) => InterpolationMap | null;
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

const requirePath = (note: RailsExportNote): InterpolationMap | null =>
    typeof note.path === 'string' && note.path.length > 0
        ? { path: note.path }
        : null;

const requireReason = (note: RailsExportNote): string | null =>
    readString(note.metadata, 'reason');

const simplePathPolicy = (): NotePresentationPolicy => ({
    resolveKey: (note) => `${I18N_PREFIX}.${note.code}`,
    resolveInterpolations: requirePath,
});

const NOTE_PRESENTATION_POLICIES: Record<
    KnownRailsExportNoteCode,
    NotePresentationPolicy
> = {
    view_skipped: simplePathPolicy(),
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
    mysql_catalog_omitted: {
        resolveKey: () => `${I18N_PREFIX}.mysql_catalog_omitted`,
        resolveInterpolations: (note) => {
            const catalogs = readStringArray(note.metadata, 'affectedPaths');

            if (!catalogs) {
                return null;
            }

            return { catalog: catalogs[0] };
        },
    },
    mysql_multiple_catalogs_ignored: {
        resolveKey: () => `${I18N_PREFIX}.mysql_multiple_catalogs_ignored`,
        resolveInterpolations: (note) => {
            const catalogs = readStringArray(note.metadata, 'affectedPaths');

            if (!catalogs) {
                return null;
            }

            return { count: catalogs.length };
        },
    },
    mariadb_catalog_omitted: {
        resolveKey: () => `${I18N_PREFIX}.mariadb_catalog_omitted`,
        resolveInterpolations: (note) => {
            const catalogs = readStringArray(note.metadata, 'affectedPaths');

            if (!catalogs) {
                return null;
            }

            return { catalog: catalogs[0] };
        },
    },
    mariadb_multiple_catalogs_ignored: {
        resolveKey: () => `${I18N_PREFIX}.mariadb_multiple_catalogs_ignored`,
        resolveInterpolations: (note) => {
            const catalogs = readStringArray(note.metadata, 'affectedPaths');

            if (!catalogs) {
                return null;
            }

            return { count: catalogs.length };
        },
    },
    composite_fk_unsupported: simplePathPolicy(),
    keyless_relationship_skipped: simplePathPolicy(),
    many_to_many_skipped: simplePathPolicy(),
    keyless_model: simplePathPolicy(),
    one_to_one_degraded_non_unique_fk: simplePathPolicy(),
    many_to_many_through_skipped: simplePathPolicy(),
    model_name_adjusted: {
        resolveKey: () => `${I18N_PREFIX}.model_name_adjusted`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const className = readString(note.metadata, 'className');

            if (!path || !className) {
                return null;
            }

            return { ...path, className };
        },
    },
    model_name_collision: {
        resolveKey: () => `${I18N_PREFIX}.model_name_collision`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const className = readString(note.metadata, 'className');

            if (!path || !className) {
                return null;
            }

            return { path: path.path, className };
        },
    },
    on_update_omitted: {
        resolveKey: () => `${I18N_PREFIX}.on_update_omitted`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const action = readString(note.metadata, 'action');

            if (!path || !action) {
                return null;
            }

            return { ...path, action };
        },
    },
    set_null_omitted: {
        resolveKey: (note) => {
            const event = readString(note.metadata, 'event');

            if (event !== 'delete' && event !== 'update') {
                return null;
            }

            return `${I18N_PREFIX}.set_null_omitted.${event}`;
        },
        resolveInterpolations: requirePath,
    },
    association_name_adjusted: {
        resolveKey: (note) => {
            const kind = readString(note.metadata, 'kind');

            if (kind !== 'belongs_to' && kind !== 'inverse') {
                return null;
            }

            return `${I18N_PREFIX}.association_name_adjusted.${kind}`;
        },
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const associationName = readString(
                note.metadata,
                'associationName'
            );

            if (!path || !associationName) {
                return null;
            }

            return { ...path, associationName };
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

            if (requireReason(note) === 'unsupported_type') {
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
        resolveInterpolations: (note) => {
            const path = requirePath(note);

            if (!path) {
                return null;
            }

            if (requireReason(note) === 'pg_field_named_values_missing') {
                const enumName = readString(note.metadata, 'enumName');

                if (!enumName) {
                    return null;
                }

                return { ...path, enumName };
            }

            return path;
        },
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
        resolveInterpolations: (note) => {
            const path = requirePath(note);

            if (!path) {
                return null;
            }

            const reason = requireReason(note);

            if (reason === 'type_as_string') {
                const sourceType = readString(note.metadata, 'sourceType');
                const mappedHelper = readString(note.metadata, 'mappedHelper');

                if (!sourceType || !mappedHelper) {
                    return null;
                }

                return { ...path, sourceType, mappedHelper };
            }

            return path;
        },
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

            if (
                reason === 'lambda_expression' ||
                reason === 'sql_expression' ||
                reason === 'unclear'
            ) {
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

export const hasRailsExportNotePresentationPolicy = (
    code: string
): code is KnownRailsExportNoteCode =>
    KNOWN_RAILS_EXPORT_NOTE_CODES.includes(code as KnownRailsExportNoteCode);

export const getRailsExportNotePresentation = (
    note: RailsExportNote,
    t: TFunction
): { message: string } => {
    if (!hasRailsExportNotePresentationPolicy(note.code)) {
        return { message: note.message };
    }

    const policy = NOTE_PRESENTATION_POLICIES[note.code];
    const key = policy.resolveKey(note);
    const interpolations = policy.resolveInterpolations(note);

    if (key === null || interpolations === null) {
        return { message: note.message };
    }

    const translated = t(key, interpolations);

    if (translated === key || translated.trim().length === 0) {
        return { message: note.message };
    }

    return { message: translated };
};
