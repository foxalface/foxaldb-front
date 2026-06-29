import type {
    ForeignKeySnapshot,
    IndexSnapshot,
} from '@/types/laravel-migration';
import {
    normalizeColumnName,
    normalizeTableName,
} from './normalize-identifier';

export const tableMatchKey = (name: string): string => normalizeTableName(name);

export const columnMatchKey = (name: string): string =>
    normalizeColumnName(name);

export const tableColumnMatchKey = (
    tableName: string,
    columnName: string
): string => `${tableMatchKey(tableName)}::${columnMatchKey(columnName)}`;

export const normalizedIndexColumns = (columns: string[]): string[] => {
    const normalized = columns.map((column) => columnMatchKey(column));
    normalized.sort();

    return normalized;
};

export const indexMatchKey = (
    tableName: string,
    index: IndexSnapshot
): string => {
    const normalizedTable = tableMatchKey(tableName);

    if (index.name !== null && index.name !== '') {
        return `${normalizedTable}::index::${columnMatchKey(index.name)}`;
    }

    const columns = normalizedIndexColumns(index.columns);

    return `${normalizedTable}::index::${columns.join(',')}::${
        index.unique ? 'unique' : 'non_unique'
    }::${index.primary ? 'primary' : 'non_primary'}`;
};

export const foreignKeyMatchKey = (foreignKey: ForeignKeySnapshot): string =>
    `${tableMatchKey(foreignKey.localTable)}::${columnMatchKey(
        foreignKey.localColumn
    )}::${tableMatchKey(foreignKey.referencedTable)}::${columnMatchKey(
        foreignKey.referencedColumn
    )}`;
