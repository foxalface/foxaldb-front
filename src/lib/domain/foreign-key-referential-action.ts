import type {
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
