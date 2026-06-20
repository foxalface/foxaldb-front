import type {
    DBRelationship,
    ForeignKeyOnDeleteAction,
    ForeignKeyOnUpdateAction,
} from './db-relationship';

export const REFERENTIAL_ACTION_NONE = 'none';

export type ReferentialActionSelectValue =
    | typeof REFERENTIAL_ACTION_NONE
    | ForeignKeyOnDeleteAction
    | ForeignKeyOnUpdateAction;

export const ON_DELETE_ACTION_OPTIONS: readonly ForeignKeyOnDeleteAction[] = [
    'cascade',
    'set_null',
    'restrict',
] as const;

export const ON_UPDATE_ACTION_OPTIONS: readonly ForeignKeyOnUpdateAction[] = [
    'cascade',
    'restrict',
] as const;

const normalizeSqlReferentialAction = (value: string): string =>
    value
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '');

export const mapSqlOnDeleteAction = (
    value?: string | null
): ForeignKeyOnDeleteAction | null => {
    if (value == null) {
        return null;
    }

    const normalized = normalizeSqlReferentialAction(value);

    if (normalized === '') {
        return null;
    }

    switch (normalized) {
        case 'cascade':
            return 'cascade';
        case 'setnull':
            return 'set_null';
        case 'restrict':
            return 'restrict';
        default:
            return null;
    }
};

export const mapSqlOnUpdateAction = (
    value?: string | null
): ForeignKeyOnUpdateAction | null => {
    if (value == null) {
        return null;
    }

    const normalized = normalizeSqlReferentialAction(value);

    if (normalized === '') {
        return null;
    }

    switch (normalized) {
        case 'cascade':
            return 'cascade';
        case 'restrict':
            return 'restrict';
        default:
            return null;
    }
};

const ON_DELETE_CLAUSE_REGEX =
    /ON DELETE\s+([A-Za-z\s_]+?)(?:\s+ON|\s*[;,)]|\s*$)/i;
const ON_UPDATE_CLAUSE_REGEX =
    /ON UPDATE\s+([A-Za-z\s_]+?)(?:\s+ON|\s*[;,)]|\s*$)/i;

export const extractSqlReferentialActionPhrases = (
    definition: string
): {
    deleteAction?: string;
    updateAction?: string;
} => {
    const deleteMatch = definition.match(ON_DELETE_CLAUSE_REGEX);
    const updateMatch = definition.match(ON_UPDATE_CLAUSE_REGEX);

    return {
        ...(deleteMatch?.[1]?.trim()
            ? { deleteAction: deleteMatch[1].trim() }
            : {}),
        ...(updateMatch?.[1]?.trim()
            ? { updateAction: updateMatch[1].trim() }
            : {}),
    };
};

export const resolveSqlReferentialActionPhrases = (
    definition: string,
    deleteAction?: string | null,
    updateAction?: string | null
): {
    deleteAction?: string;
    updateAction?: string;
} => {
    const fromDefinition = extractSqlReferentialActionPhrases(definition);

    return {
        deleteAction: deleteAction?.trim() || fromDefinition.deleteAction,
        updateAction: updateAction?.trim() || fromDefinition.updateAction,
    };
};

export const parseSqlReferentialActionsFromDefinition = (
    definition: string
): {
    onDelete: ForeignKeyOnDeleteAction | null;
    onUpdate: ForeignKeyOnUpdateAction | null;
} => {
    const deleteMatch = definition.match(ON_DELETE_CLAUSE_REGEX);
    const updateMatch = definition.match(ON_UPDATE_CLAUSE_REGEX);

    return {
        onDelete: mapSqlOnDeleteAction(deleteMatch?.[1]),
        onUpdate: mapSqlOnUpdateAction(updateMatch?.[1]),
    };
};

export const buildRelationshipReferentialActions = (
    deleteAction?: string | null,
    updateAction?: string | null,
    sqlDefinition?: string | null
): Pick<DBRelationship, 'onDelete' | 'onUpdate'> => {
    const resolved = sqlDefinition?.trim()
        ? resolveSqlReferentialActionPhrases(
              sqlDefinition,
              deleteAction,
              updateAction
          )
        : {
              deleteAction: deleteAction?.trim() || undefined,
              updateAction: updateAction?.trim() || undefined,
          };

    const onDelete = mapSqlOnDeleteAction(resolved.deleteAction);
    const onUpdate = mapSqlOnUpdateAction(resolved.updateAction);

    return {
        ...(onDelete !== null ? { onDelete } : {}),
        ...(onUpdate !== null ? { onUpdate } : {}),
    };
};

export const buildRelationshipReferentialActionsFromDefinition = (
    definition: string
): Pick<DBRelationship, 'onDelete' | 'onUpdate'> => {
    const { onDelete, onUpdate } =
        parseSqlReferentialActionsFromDefinition(definition);

    return {
        ...(onDelete !== null ? { onDelete } : {}),
        ...(onUpdate !== null ? { onUpdate } : {}),
    };
};

export const toOnDeleteSelectValue = (
    action: ForeignKeyOnDeleteAction | null | undefined
): ReferentialActionSelectValue => action ?? REFERENTIAL_ACTION_NONE;

export const fromOnDeleteSelectValue = (
    value: string
): ForeignKeyOnDeleteAction | null => {
    if (value === REFERENTIAL_ACTION_NONE) {
        return null;
    }

    if (value === 'cascade' || value === 'set_null' || value === 'restrict') {
        return value;
    }

    return null;
};

export const toOnUpdateSelectValue = (
    action: ForeignKeyOnUpdateAction | null | undefined
): ReferentialActionSelectValue => action ?? REFERENTIAL_ACTION_NONE;

export const fromOnUpdateSelectValue = (
    value: string
): ForeignKeyOnUpdateAction | null => {
    if (value === REFERENTIAL_ACTION_NONE) {
        return null;
    }

    if (value === 'cascade' || value === 'restrict') {
        return value;
    }

    return null;
};
