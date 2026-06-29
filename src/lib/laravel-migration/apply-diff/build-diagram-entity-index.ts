import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { IndexSnapshot } from '@/types/laravel-migration';
import {
    columnMatchKey,
    foreignKeyMatchKey,
    indexMatchKey,
    tableColumnMatchKey,
    tableMatchKey,
} from './snapshot-match-key';
import type { DiagramEntityIndex } from './types';

const normalizeSnapshotIndexName = (
    name: string | null | undefined
): string | null => {
    if (name == null) {
        return null;
    }

    const trimmed = name.trim();

    return trimmed === '' ? null : trimmed;
};

const toIndexSnapshot = (table: DBTable, index: DBIndex): IndexSnapshot => {
    const fieldNameById = new Map(
        table.fields.map((field) => [field.id, field.name])
    );

    return {
        name: normalizeSnapshotIndexName(index.name),
        columns: index.fieldIds
            .map((fieldId) => fieldNameById.get(fieldId))
            .filter((name): name is string => name !== undefined),
        unique: index.unique,
        primary: index.isPrimaryKey ?? false,
    };
};

export const buildDiagramEntityIndex = ({
    tables,
    relationships,
}: {
    tables: DBTable[];
    relationships: DBRelationship[];
}): DiagramEntityIndex => {
    const tableByName = new Map<string, DBTable>();
    const fieldByTableAndName = new Map<string, DBField>();
    const indexByTableAndKey = new Map<
        string,
        { table: DBTable; index: DBIndex; indexKey: string }
    >();
    const relationshipByFkKey = new Map<
        string,
        {
            relationship: DBRelationship;
            localTable: DBTable;
            localField: DBField;
            referencedTable: DBTable;
            referencedField: DBField;
        }
    >();

    const tableById = new Map(tables.map((table) => [table.id, table]));

    for (const table of tables) {
        const normalizedTableName = tableMatchKey(table.name);
        tableByName.set(normalizedTableName, table);

        for (const field of table.fields) {
            fieldByTableAndName.set(
                tableColumnMatchKey(table.name, field.name),
                field
            );
        }

        for (const index of table.indexes) {
            const indexSnapshot = toIndexSnapshot(table, index);
            const indexKey = indexMatchKey(table.name, indexSnapshot);
            indexByTableAndKey.set(indexKey, { table, index, indexKey });
        }
    }

    for (const relationship of relationships) {
        const localTable = tableById.get(relationship.sourceTableId);
        const referencedTable = tableById.get(relationship.targetTableId);

        if (!localTable || !referencedTable) {
            continue;
        }

        const localField = localTable.fields.find(
            (field) => field.id === relationship.sourceFieldId
        );
        const referencedField = referencedTable.fields.find(
            (field) => field.id === relationship.targetFieldId
        );

        if (!localField || !referencedField) {
            continue;
        }

        const foreignKey = {
            localTable: localTable.name,
            localColumn: localField.name,
            referencedTable: referencedTable.name,
            referencedColumn: referencedField.name,
            constraintName:
                relationship.name.trim() === '' ? null : relationship.name,
            onDelete: relationship.onDelete ?? null,
            onUpdate: relationship.onUpdate ?? null,
        };

        relationshipByFkKey.set(foreignKeyMatchKey(foreignKey), {
            relationship,
            localTable,
            localField,
            referencedTable,
            referencedField,
        });
    }

    return {
        tableByName,
        fieldByTableAndName,
        indexByTableAndKey,
        relationshipByFkKey,
    };
};

export const resolveFieldByTableAndColumn = (
    index: DiagramEntityIndex,
    tableName: string,
    columnName: string
): DBField | null =>
    index.fieldByTableAndName.get(tableColumnMatchKey(tableName, columnName)) ??
    null;

export const resolveTableByName = (
    entityIndex: DiagramEntityIndex,
    tableName: string
): DBTable | null =>
    entityIndex.tableByName.get(tableMatchKey(tableName)) ?? null;

export { columnMatchKey, tableMatchKey };
