import type { TFunction } from 'i18next';
import type { DjangoExportNote } from '@/lib/api/django-export-types';
import {
    KNOWN_DJANGO_EXPORT_NOTE_CODES,
    type KnownDjangoExportNoteCode,
} from './django-export-note-codes';

const I18N_PREFIX = 'export_wizard.django.result_step.notes';

type InterpolationMap = Record<string, string | number>;

type NotePresentationPolicy = {
    resolveKey: (note: DjangoExportNote) => string | null;
    resolveInterpolations: (note: DjangoExportNote) => InterpolationMap | null;
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

const requirePath = (note: DjangoExportNote): InterpolationMap | null =>
    typeof note.path === 'string' && note.path.length > 0
        ? { path: note.path }
        : null;

const requireReason = (note: DjangoExportNote): string | null =>
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

const NOTE_PRESENTATION_POLICIES: Record<
    KnownDjangoExportNoteCode,
    NotePresentationPolicy
> = {
    view_skipped: simplePathPolicy(),
    keyless_table_skipped: simplePathPolicy(),
    composite_fk_unsupported: simplePathPolicy(),
    many_to_many_skipped: simplePathPolicy(),
    one_to_one_degraded_non_unique_fk: simplePathPolicy(),
    on_delete_restrict_degraded: simplePathPolicy(),
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
    mysql_catalog_omitted: catalogOmittedPolicy(),
    mysql_multiple_catalogs_ignored: catalogCountPolicy(),
    mariadb_catalog_omitted: catalogOmittedPolicy(),
    mariadb_multiple_catalogs_ignored: catalogCountPolicy(),
    postgres_schema_qualified_db_table: {
        resolveKey: () => `${I18N_PREFIX}.postgres_schema_qualified_db_table`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const schema = readString(note.metadata, 'schema');

            if (!path || !schema) {
                return null;
            }

            return { ...path, schema };
        },
    },
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

            return { ...path, className };
        },
    },
    field_name_adjusted: {
        resolveKey: () => `${I18N_PREFIX}.field_name_adjusted`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const attributeName = readString(note.metadata, 'attributeName');
            const dbColumn = readString(note.metadata, 'dbColumn');

            if (!path || !attributeName || !dbColumn) {
                return null;
            }

            return { ...path, attributeName, dbColumn };
        },
    },
    related_name_adjusted: {
        resolveKey: () => `${I18N_PREFIX}.related_name_adjusted`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const relatedName = readString(note.metadata, 'relatedName');

            if (!path || !relatedName) {
                return null;
            }

            return { ...path, relatedName };
        },
    },
    composite_primary_key: {
        resolveKey: () => `${I18N_PREFIX}.composite_primary_key`,
        resolveInterpolations: (note) => {
            const path = requirePath(note);
            const attributes = readStringArray(note.metadata, 'attributes');

            if (!path || !attributes) {
                return null;
            }

            return { ...path, attributes: attributes.join(', ') };
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

            if (event !== 'delete') {
                return null;
            }

            return `${I18N_PREFIX}.set_null_omitted.${event}`;
        },
        resolveInterpolations: requirePath,
    },
    many_to_many_through_skipped: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (reason !== 'extra_columns' && reason !== 'ambiguous') {
                return null;
            }

            return `${I18N_PREFIX}.many_to_many_through_skipped.${reason}`;
        },
        resolveInterpolations: requirePath,
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
    index_name_adjusted: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (reason !== 'unsafe_name' && reason !== 'name_collision') {
                return null;
            }

            return `${I18N_PREFIX}.index_name_adjusted.${reason}`;
        },
        resolveInterpolations: (note) => {
            const originalName = readString(note.metadata, 'originalName');
            const allocatedName = readString(note.metadata, 'allocatedName');

            if (!originalName || !allocatedName) {
                return null;
            }

            return { originalName, allocatedName };
        },
    },
    constraint_name_adjusted: {
        resolveKey: (note) => {
            const reason = requireReason(note);

            if (reason !== 'unsafe_name' && reason !== 'name_collision') {
                return null;
            }

            return `${I18N_PREFIX}.constraint_name_adjusted.${reason}`;
        },
        resolveInterpolations: (note) => {
            const originalName = readString(note.metadata, 'originalName');
            const allocatedName = readString(note.metadata, 'allocatedName');

            if (!originalName || !allocatedName) {
                return null;
            }

            return { originalName, allocatedName };
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
        resolveInterpolations: (note) => {
            const path = requirePath(note);

            if (!path) {
                return null;
            }

            if (requireReason(note) === 'varchar_without_max_length') {
                const mappedField = readString(note.metadata, 'mappedField');

                if (!mappedField) {
                    return null;
                }

                return { ...path, mappedField };
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

export const hasDjangoExportNotePresentationPolicy = (
    code: string
): code is KnownDjangoExportNoteCode =>
    KNOWN_DJANGO_EXPORT_NOTE_CODES.includes(code as KnownDjangoExportNoteCode);

export const getDjangoExportNotePresentation = (
    note: DjangoExportNote,
    t: TFunction
): { message: string } => {
    if (!hasDjangoExportNotePresentationPolicy(note.code)) {
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
