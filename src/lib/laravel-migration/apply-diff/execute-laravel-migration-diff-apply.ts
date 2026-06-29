import { defaultTableColor } from '@/lib/colors';
import type {
    ForeignKeyOnDeleteAction,
    ForeignKeyOnUpdateAction,
} from '@/lib/domain/db-relationship';
import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import { getTableIndexesWithPrimaryKey } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import { generateId } from '@/lib/utils';
import type {
    ForeignKeyOnDelete,
    ForeignKeyOnUpdate,
    IndexSnapshot,
    TableSnapshot,
} from '@/types/laravel-migration';
import { ApplyIdResolver } from './apply-id-resolver';
import { computeNewTablePosition } from './compute-new-table-layout';
import type { LaravelMigrationApplyApi } from './laravel-migration-apply-api';
import { mapColumnSnapshotToField } from './map-column-snapshot-to-field';
import type {
    ApplyOperation,
    ApplyOperationKind,
    ApplyPlan,
    PlannedFieldPayload,
} from './types';

const NO_HISTORY = { updateHistory: false as const };

export class ApplyExecutionError extends Error {
    readonly operationIndex: number;
    readonly operationKind: ApplyOperationKind;
    readonly operation: ApplyOperation;

    constructor(
        message: string,
        operationIndex: number,
        operationKind: ApplyOperationKind,
        operation: ApplyOperation
    ) {
        super(message);
        this.name = 'ApplyExecutionError';
        this.operationIndex = operationIndex;
        this.operationKind = operationKind;
        this.operation = operation;
    }
}

const mapForeignKeyOnDelete = (
    value: ForeignKeyOnDelete
): ForeignKeyOnDeleteAction | null => {
    if (value === 'set_null') {
        return 'set_null';
    }

    if (value === 'cascade' || value === 'restrict') {
        return value;
    }

    return null;
};

const mapForeignKeyOnUpdate = (
    value: ForeignKeyOnUpdate
): ForeignKeyOnUpdateAction | null => {
    if (value === 'cascade' || value === 'restrict') {
        return value;
    }

    return null;
};

const buildFieldFromPayload = (
    fieldPayload: PlannedFieldPayload
): Omit<DBField, 'id' | 'createdAt'> => fieldPayload;

const buildIndexFromSnapshot = ({
    index,
    fieldIds,
}: {
    index: IndexSnapshot;
    fieldIds: string[];
}): DBIndex => ({
    id: generateId(),
    name: index.name ?? '',
    unique: index.unique,
    isPrimaryKey: index.primary,
    fieldIds,
    createdAt: Date.now(),
});

const buildTableFromSnapshot = ({
    tableSnapshot,
    position,
    defaultSchema,
    order,
    resolver,
}: {
    tableSnapshot: TableSnapshot;
    position: { x: number; y: number };
    defaultSchema?: string | null;
    order: number;
    resolver: ApplyIdResolver;
}): DBTable => {
    const tableId = generateId();
    const createdAt = Date.now();

    resolver.registerTable(tableSnapshot.name, tableId);

    const fields: DBField[] = [];

    for (const column of tableSnapshot.columns) {
        const mapped = mapColumnSnapshotToField(column);

        if (!mapped.fieldPayload) {
            throw new Error(
                mapped.issues[0]?.message ??
                    `Could not map column "${column.name}" on table "${tableSnapshot.name}".`
            );
        }

        const fieldId = generateId();
        resolver.registerField(tableSnapshot.name, column.name, fieldId);
        fields.push({
            id: fieldId,
            createdAt,
            ...mapped.fieldPayload,
        });
    }

    const indexes: DBIndex[] = tableSnapshot.indexes.map((indexSnapshot) => {
        const fieldIds = resolver.resolveIndexFieldIds(
            tableSnapshot.name,
            [],
            indexSnapshot.columns,
            `Could not resolve index columns for table "${tableSnapshot.name}".`
        );
        const index = buildIndexFromSnapshot({
            index: indexSnapshot,
            fieldIds,
        });

        resolver.registerIndex(tableSnapshot.name, indexSnapshot, index.id);

        return index;
    });

    const table: DBTable = {
        id: tableId,
        name: tableSnapshot.name,
        schema: defaultSchema ?? null,
        x: position.x,
        y: position.y,
        fields,
        indexes,
        color: defaultTableColor,
        isView: false,
        createdAt,
        order,
    };

    const tableWithPrimaryKeyIndex = {
        ...table,
        indexes: getTableIndexesWithPrimaryKey({ table }),
    };

    for (const index of tableWithPrimaryKeyIndex.indexes) {
        const indexSnapshot: IndexSnapshot = {
            name: index.name.trim() === '' ? null : index.name,
            columns: index.fieldIds
                .map(
                    (fieldId) =>
                        tableWithPrimaryKeyIndex.fields.find(
                            (field) => field.id === fieldId
                        )?.name
                )
                .filter((name): name is string => name !== undefined),
            unique: index.unique,
            primary: index.isPrimaryKey ?? false,
        };

        resolver.registerIndex(tableSnapshot.name, indexSnapshot, index.id);
    }

    return tableWithPrimaryKeyIndex;
};

export const executeLaravelMigrationDiffApply = async ({
    plan,
    api,
    existingTables,
    existingRelationships: _existingRelationships,
    defaultSchema,
}: {
    plan: ApplyPlan;
    api: LaravelMigrationApplyApi;
    existingTables: DBTable[];
    existingRelationships: DBRelationship[];
    defaultSchema?: string | null;
}): Promise<void> => {
    if (!plan.canApply) {
        throw new ApplyExecutionError(
            'Cannot execute apply plan with validation errors.',
            -1,
            'addTable',
            plan.operations[0] ?? {
                kind: 'addTable',
                tableName: '',
                table: { name: '', columns: [], indexes: [] },
            }
        );
    }

    const resolver = new ApplyIdResolver({
        tables: existingTables,
        relationships: _existingRelationships,
    });

    let addedTableCount = 0;

    for (const [operationIndex, operation] of plan.operations.entries()) {
        try {
            switch (operation.kind) {
                case 'removeForeignKey':
                    await api.removeRelationships(
                        [operation.relationshipId],
                        NO_HISTORY
                    );
                    break;

                case 'removeIndex':
                    await api.removeIndex(
                        operation.tableId,
                        operation.indexId,
                        NO_HISTORY
                    );
                    break;

                case 'removeColumn':
                    await api.removeField(
                        operation.tableId,
                        operation.fieldId,
                        NO_HISTORY
                    );
                    break;

                case 'removeTable':
                    await api.removeTables([operation.tableId], NO_HISTORY);
                    break;

                case 'modifyColumn':
                    await api.updateField(
                        operation.tableId,
                        operation.fieldId,
                        buildFieldFromPayload(operation.fieldPayload),
                        NO_HISTORY
                    );
                    break;

                case 'modifyIndex': {
                    const fieldIds = resolver.resolveIndexFieldIds(
                        operation.tableName,
                        [],
                        operation.after.columns,
                        `Could not resolve columns for modified index on table "${operation.tableName}".`
                    );

                    await api.updateIndex(
                        operation.tableId,
                        operation.indexId,
                        {
                            name: operation.after.name ?? '',
                            unique: operation.after.unique,
                            isPrimaryKey: operation.after.primary,
                            fieldIds,
                        },
                        NO_HISTORY
                    );
                    break;
                }

                case 'modifyForeignKey': {
                    const localTableId = resolver.resolveTableId(
                        operation.after.localTable,
                        null,
                        `Could not resolve local table "${operation.after.localTable}" for foreign key update.`
                    );
                    const referencedTableId = resolver.resolveTableId(
                        operation.after.referencedTable,
                        null,
                        `Could not resolve referenced table "${operation.after.referencedTable}" for foreign key update.`
                    );
                    const localFieldId = resolver.resolveFieldId(
                        operation.after.localTable,
                        operation.after.localColumn,
                        null,
                        `Could not resolve local column "${operation.after.localColumn}" for foreign key update.`
                    );
                    const referencedFieldId = resolver.resolveFieldId(
                        operation.after.referencedTable,
                        operation.after.referencedColumn,
                        null,
                        `Could not resolve referenced column "${operation.after.referencedColumn}" for foreign key update.`
                    );

                    await api.updateRelationship(
                        operation.relationshipId,
                        {
                            name:
                                operation.after.constraintName ??
                                `${operation.after.localTable}_${operation.after.localColumn}_fk`,
                            sourceTableId: localTableId,
                            targetTableId: referencedTableId,
                            sourceFieldId: localFieldId,
                            targetFieldId: referencedFieldId,
                            onDelete: mapForeignKeyOnDelete(
                                operation.after.onDelete
                            ),
                            onUpdate: mapForeignKeyOnUpdate(
                                operation.after.onUpdate
                            ),
                        },
                        NO_HISTORY
                    );
                    break;
                }

                case 'addTable': {
                    const position = computeNewTablePosition({
                        existingTables,
                        addedTableIndex: addedTableCount,
                    });
                    const table = buildTableFromSnapshot({
                        tableSnapshot: operation.table,
                        position,
                        defaultSchema,
                        order: existingTables.length + addedTableCount,
                        resolver,
                    });

                    await api.addTables([table], NO_HISTORY);
                    addedTableCount += 1;
                    break;
                }

                case 'addColumn': {
                    const tableId = resolver.resolveTableId(
                        operation.tableName,
                        operation.tableId,
                        `Could not resolve table "${operation.tableName}" for added column.`
                    );
                    const fieldId = generateId();
                    resolver.registerField(
                        operation.tableName,
                        operation.column.name,
                        fieldId
                    );

                    await api.addField(
                        tableId,
                        {
                            id: fieldId,
                            createdAt: Date.now(),
                            ...buildFieldFromPayload(operation.fieldPayload),
                        },
                        NO_HISTORY
                    );
                    break;
                }

                case 'addIndex': {
                    const tableId = resolver.resolveTableId(
                        operation.tableName,
                        operation.tableId,
                        `Could not resolve table "${operation.tableName}" for added index.`
                    );
                    const fieldIds = resolver.resolveIndexFieldIds(
                        operation.tableName,
                        operation.fieldIds,
                        operation.index.columns,
                        `Could not resolve index columns for table "${operation.tableName}".`
                    );
                    const index = buildIndexFromSnapshot({
                        index: operation.index,
                        fieldIds,
                    });

                    resolver.registerIndex(
                        operation.tableName,
                        operation.index,
                        index.id
                    );

                    await api.addIndex(tableId, index, NO_HISTORY);
                    break;
                }

                case 'addForeignKey': {
                    const localTableId = resolver.resolveTableId(
                        operation.localTableName,
                        operation.localTableId,
                        `Could not resolve local table "${operation.localTableName}" for foreign key.`
                    );
                    const referencedTableId = resolver.resolveTableId(
                        operation.referencedTableName,
                        operation.referencedTableId,
                        `Could not resolve referenced table "${operation.referencedTableName}" for foreign key.`
                    );
                    const localFieldId = resolver.resolveFieldId(
                        operation.localTableName,
                        operation.localColumnName,
                        operation.localFieldId,
                        `Could not resolve local column "${operation.localColumnName}" for foreign key.`
                    );
                    const referencedFieldId = resolver.resolveFieldId(
                        operation.referencedTableName,
                        operation.referencedColumnName,
                        operation.referencedFieldId,
                        `Could not resolve referenced column "${operation.referencedColumnName}" for foreign key.`
                    );
                    const relationshipId = generateId();

                    resolver.registerForeignKey(
                        operation.foreignKey,
                        relationshipId
                    );

                    const relationship: DBRelationship = {
                        id: relationshipId,
                        name:
                            operation.foreignKey.constraintName ??
                            `${operation.localTableName}_${operation.localColumnName}_fk`,
                        sourceTableId: localTableId,
                        targetTableId: referencedTableId,
                        sourceFieldId: localFieldId,
                        targetFieldId: referencedFieldId,
                        sourceCardinality: 'many',
                        targetCardinality: 'one',
                        onDelete: mapForeignKeyOnDelete(
                            operation.foreignKey.onDelete
                        ),
                        onUpdate: mapForeignKeyOnUpdate(
                            operation.foreignKey.onUpdate
                        ),
                        createdAt: Date.now(),
                    };

                    await api.addRelationships([relationship], NO_HISTORY);
                    break;
                }
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unknown apply execution error.';

            throw new ApplyExecutionError(
                message,
                operationIndex,
                operation.kind,
                operation
            );
        }
    }
};
