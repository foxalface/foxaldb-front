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

const countSqlKeyword = (sql: string, pattern: RegExp): number =>
    sql.match(pattern)?.length ?? 0;

export const isSingleForeignKeySqlDefinition = (sql: string): boolean => {
    if (!sql.trim()) {
        return false;
    }

    const foreignKeyCount = countSqlKeyword(sql, /\bFOREIGN\s+KEY\b/gi);
    const referencesCount = countSqlKeyword(sql, /\bREFERENCES\b/gi);
    const onDeleteCount = countSqlKeyword(sql, /\bON\s+DELETE\b/gi);
    const onUpdateCount = countSqlKeyword(sql, /\bON\s+UPDATE\b/gi);

    return (
        foreignKeyCount <= 1 &&
        referencesCount <= 1 &&
        onDeleteCount <= 1 &&
        onUpdateCount <= 1
    );
};

export const extractConstraintScopedSqlFragment = (
    sql: string,
    matchIndex: number,
    matchLength: number
): string => {
    const afterMatch = sql.slice(matchIndex + matchLength);
    let depth = 0;
    let end = afterMatch.length;

    for (let i = 0; i < afterMatch.length; i++) {
        const char = afterMatch[i];

        if (char === '(') {
            depth++;
        } else if (char === ')') {
            if (depth === 0) {
                end = i;
                break;
            }
            depth--;
        } else if ((char === ',' || char === ';') && depth === 0) {
            end = i;
            break;
        }
    }

    return sql.slice(matchIndex, matchIndex + matchLength + end).trim();
};

export interface SqlParserReferentialOnAction {
    type?: string;
    value?: string | { type?: string; value?: string } | null;
}

const readParserOnActionValue = (
    value: SqlParserReferentialOnAction['value']
): string | undefined => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    }

    if (value && typeof value === 'object' && typeof value.value === 'string') {
        const trimmed = value.value.trim();
        return trimmed === '' ? undefined : trimmed;
    }

    return undefined;
};

export const mapParserReferentialOnActions = (
    onAction?: SqlParserReferentialOnAction[] | null
): {
    deleteAction?: string;
    updateAction?: string;
} => {
    if (!onAction || onAction.length === 0) {
        return {};
    }

    let deleteAction: string | undefined;
    let updateAction: string | undefined;

    for (const entry of onAction) {
        const kind = normalizeSqlReferentialAction(entry.type ?? '');
        const rawValue = readParserOnActionValue(entry.value);

        if (!rawValue) {
            continue;
        }

        if (kind === 'ondelete') {
            deleteAction = rawValue;
        } else if (kind === 'onupdate') {
            updateAction = rawValue;
        }
    }

    return {
        ...(deleteAction ? { deleteAction } : {}),
        ...(updateAction ? { updateAction } : {}),
    };
};

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
    const fromDefinition = isSingleForeignKeySqlDefinition(definition)
        ? extractSqlReferentialActionPhrases(definition)
        : {};

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
