import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { ChartDBContext } from '@/context/chartdb-context/chartdb-context';

export interface LaravelMigrationApplyMutationOptions {
    updateHistory: false;
}

export interface LaravelMigrationApplyApi {
    addTables: (
        tables: DBTable[],
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    removeTables: (
        ids: string[],
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    addField: (
        tableId: string,
        field: DBField,
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    removeField: (
        tableId: string,
        fieldId: string,
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    updateField: (
        tableId: string,
        fieldId: string,
        field: Partial<DBField>,
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    addIndex: (
        tableId: string,
        index: DBIndex,
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    removeIndex: (
        tableId: string,
        indexId: string,
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    updateIndex: (
        tableId: string,
        indexId: string,
        index: Partial<DBIndex>,
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    addRelationships: (
        relationships: DBRelationship[],
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    removeRelationships: (
        ids: string[],
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
    updateRelationship: (
        id: string,
        relationship: Partial<DBRelationship>,
        options: LaravelMigrationApplyMutationOptions
    ) => Promise<void>;
}

type ChartDBApplySource = Pick<
    ChartDBContext,
    | 'addTables'
    | 'removeTables'
    | 'addField'
    | 'removeField'
    | 'updateField'
    | 'addIndex'
    | 'removeIndex'
    | 'updateIndex'
    | 'addRelationships'
    | 'removeRelationships'
    | 'updateRelationship'
>;

export const createLaravelMigrationApplyApi = (
    chartDB: ChartDBApplySource
): LaravelMigrationApplyApi => ({
    addTables: (tables, options) => chartDB.addTables(tables, options),
    removeTables: (ids, options) => chartDB.removeTables(ids, options),
    addField: (tableId, field, options) =>
        chartDB.addField(tableId, field, options),
    removeField: (tableId, fieldId, options) =>
        chartDB.removeField(tableId, fieldId, options),
    updateField: (tableId, fieldId, field, options) =>
        chartDB.updateField(tableId, fieldId, field, options),
    addIndex: (tableId, index, options) =>
        chartDB.addIndex(tableId, index, options),
    removeIndex: (tableId, indexId, options) =>
        chartDB.removeIndex(tableId, indexId, options),
    updateIndex: (tableId, indexId, index, options) =>
        chartDB.updateIndex(tableId, indexId, index, options),
    addRelationships: (relationships, options) =>
        chartDB.addRelationships(relationships, options),
    removeRelationships: (ids, options) =>
        chartDB.removeRelationships(ids, options),
    updateRelationship: (id, relationship, options) =>
        chartDB.updateRelationship(id, relationship, options),
});
