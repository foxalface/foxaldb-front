import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type {
    ForeignKeySnapshot,
    IndexSnapshot,
    LaravelMigrationSchemaDiff,
    TableDiff,
    TableSnapshot,
} from '@/types/laravel-migration';
import {
    buildDiagramEntityIndex,
    resolveFieldByTableAndColumn,
    resolveTableByName,
} from './build-diagram-entity-index';
import { mapColumnSnapshotToField } from './map-column-snapshot-to-field';
import {
    columnMatchKey,
    foreignKeyMatchKey,
    indexMatchKey,
    tableColumnMatchKey,
    tableMatchKey,
} from './snapshot-match-key';
import type {
    ApplyOperation,
    ApplyPlan,
    ApplyValidationIssue,
    DiagramEntityIndex,
} from './types';
import { APPLY_OPERATION_PHASE_ORDER } from './types';

interface PlannedOperation {
    operation: ApplyOperation;
    sequence: number;
}

interface DiffContext {
    entityIndex: DiagramEntityIndex;
    addedTableNames: Set<string>;
    addedColumnsByTable: Map<string, Set<string>>;
    removedTableNames: Set<string>;
    removedColumnsByTable: Map<string, Set<string>>;
    addedTableSnapshots: Map<string, TableSnapshot>;
}

const createIssue = (
    severity: ApplyValidationIssue['severity'],
    code: string,
    message: string,
    context?: ApplyValidationIssue['context']
): ApplyValidationIssue => ({
    severity,
    code,
    message,
    context,
});

const buildDiffContext = ({
    tables,
    relationships,
    diff,
}: {
    tables: DBTable[];
    relationships: DBRelationship[];
    diff: LaravelMigrationSchemaDiff;
}): DiffContext => {
    const entityIndex = buildDiagramEntityIndex({ tables, relationships });
    const addedTableNames = new Set<string>();
    const addedTableSnapshots = new Map<string, TableSnapshot>();
    const addedColumnsByTable = new Map<string, Set<string>>();
    const removedTableNames = new Set<string>();
    const removedColumnsByTable = new Map<string, Set<string>>();

    for (const table of diff.addedTables) {
        const normalizedTableName = tableMatchKey(table.name);
        addedTableNames.add(normalizedTableName);
        addedTableSnapshots.set(normalizedTableName, table);

        const columnNames = new Set<string>();
        for (const column of table.columns) {
            columnNames.add(columnMatchKey(column.name));
        }
        addedColumnsByTable.set(normalizedTableName, columnNames);
    }

    for (const table of diff.removedTables) {
        removedTableNames.add(tableMatchKey(table.name));
    }

    for (const tableDiff of diff.changedTables) {
        const normalizedTableName = tableMatchKey(tableDiff.tableName);

        if (tableDiff.addedColumns.length > 0) {
            const existing =
                addedColumnsByTable.get(normalizedTableName) ??
                new Set<string>();
            for (const column of tableDiff.addedColumns) {
                existing.add(columnMatchKey(column.name));
            }
            addedColumnsByTable.set(normalizedTableName, existing);
        }

        if (tableDiff.removedColumns.length > 0) {
            const existing =
                removedColumnsByTable.get(normalizedTableName) ??
                new Set<string>();
            for (const column of tableDiff.removedColumns) {
                existing.add(columnMatchKey(column.name));
            }
            removedColumnsByTable.set(normalizedTableName, existing);
        }
    }

    return {
        entityIndex,
        addedTableNames,
        addedColumnsByTable,
        removedTableNames,
        removedColumnsByTable,
        addedTableSnapshots,
    };
};

const tableExistsInPlan = (
    context: DiffContext,
    tableName: string
): boolean => {
    const normalizedTableName = tableMatchKey(tableName);

    if (context.removedTableNames.has(normalizedTableName)) {
        return false;
    }

    if (context.addedTableNames.has(normalizedTableName)) {
        return true;
    }

    return context.entityIndex.tableByName.has(normalizedTableName);
};

const columnExistsInDiagram = (
    context: DiffContext,
    tableName: string,
    columnName: string
): boolean => {
    const normalizedTableName = tableMatchKey(tableName);
    const normalizedColumnName = columnMatchKey(columnName);

    if (
        context.removedColumnsByTable
            .get(normalizedTableName)
            ?.has(normalizedColumnName)
    ) {
        return false;
    }

    if (context.addedTableNames.has(normalizedTableName)) {
        const addedTable = context.addedTableSnapshots.get(normalizedTableName);
        return (
            addedTable?.columns.some(
                (column) => columnMatchKey(column.name) === normalizedColumnName
            ) ?? false
        );
    }

    return context.entityIndex.fieldByTableAndName.has(
        tableColumnMatchKey(tableName, columnName)
    );
};

const columnExistsInPlan = (
    context: DiffContext,
    tableName: string,
    columnName: string
): boolean => {
    const normalizedTableName = tableMatchKey(tableName);
    const normalizedColumnName = columnMatchKey(columnName);

    if (
        context.removedColumnsByTable
            .get(normalizedTableName)
            ?.has(normalizedColumnName)
    ) {
        return false;
    }

    if (
        context.addedColumnsByTable
            .get(normalizedTableName)
            ?.has(normalizedColumnName)
    ) {
        return true;
    }

    return columnExistsInDiagram(context, tableName, columnName);
};

const resolveExistingTable = (
    context: DiffContext,
    tableName: string,
    issues: ApplyValidationIssue[],
    missingCode: string,
    missingMessage: string
): DBTable | null => {
    const table = resolveTableByName(context.entityIndex, tableName);

    if (!table) {
        issues.push(
            createIssue('error', missingCode, missingMessage, {
                tableName,
            })
        );
        return null;
    }

    return table;
};

const resolveExistingField = (
    context: DiffContext,
    tableName: string,
    columnName: string,
    issues: ApplyValidationIssue[],
    missingCode: string,
    missingMessage: string
) => {
    const field = resolveFieldByTableAndColumn(
        context.entityIndex,
        tableName,
        columnName
    );

    if (!field) {
        issues.push(
            createIssue('error', missingCode, missingMessage, {
                tableName,
                columnName,
            })
        );
        return null;
    }

    return field;
};

const resolveExistingIndex = (
    context: DiffContext,
    tableName: string,
    index: IndexSnapshot,
    issues: ApplyValidationIssue[],
    missingCode: string,
    missingMessage: string
) => {
    const indexKey = indexMatchKey(tableName, index);
    const resolved = context.entityIndex.indexByTableAndKey.get(indexKey);

    if (!resolved) {
        issues.push(
            createIssue('error', missingCode, missingMessage, {
                tableName,
                indexKey,
            })
        );
        return null;
    }

    return resolved;
};

const resolveExistingForeignKey = (
    context: DiffContext,
    foreignKey: ForeignKeySnapshot,
    issues: ApplyValidationIssue[],
    missingCode: string,
    missingMessage: string
) => {
    const fkKey = foreignKeyMatchKey(foreignKey);
    const resolved = context.entityIndex.relationshipByFkKey.get(fkKey);

    if (!resolved) {
        issues.push(
            createIssue('error', missingCode, missingMessage, {
                foreignKeyKey: fkKey,
            })
        );
        return null;
    }

    return resolved;
};

const resolveIndexFieldIds = (
    context: DiffContext,
    tableName: string,
    index: IndexSnapshot,
    issues: ApplyValidationIssue[]
): string[] => {
    const fieldIds: string[] = [];

    for (const columnName of index.columns) {
        const field = resolveFieldByTableAndColumn(
            context.entityIndex,
            tableName,
            columnName
        );

        if (field) {
            fieldIds.push(field.id);
            continue;
        }

        if (columnExistsInPlan(context, tableName, columnName)) {
            fieldIds.push('');
            continue;
        }

        issues.push(
            createIssue(
                'error',
                'index_column_not_found',
                `Index column "${columnName}" on table "${tableName}" does not exist in the diagram or planned additions.`,
                {
                    tableName,
                    columnName,
                }
            )
        );
    }

    return fieldIds;
};

const planRemovedForeignKeys = (
    context: DiffContext,
    diff: LaravelMigrationSchemaDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;

    for (const foreignKey of diff.removedForeignKeys) {
        const resolved = resolveExistingForeignKey(
            context,
            foreignKey,
            issues,
            'foreign_key_not_found',
            `Cannot remove foreign key "${foreignKeyMatchKey(foreignKey)}" because it does not exist in the diagram.`
        );

        if (!resolved) {
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'removeForeignKey',
                relationshipId: resolved.relationship.id,
                foreignKey,
            },
        });
    }

    return sequence;
};

const planChangedTableRemovals = (
    context: DiffContext,
    tableDiff: TableDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;

    for (const index of tableDiff.removedIndexes) {
        const resolved = resolveExistingIndex(
            context,
            tableDiff.tableName,
            index,
            issues,
            'index_not_found',
            `Cannot remove index "${indexMatchKey(tableDiff.tableName, index)}" because it does not exist in the diagram.`
        );

        if (!resolved) {
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'removeIndex',
                tableId: resolved.table.id,
                tableName: tableDiff.tableName,
                indexId: resolved.index.id,
                index,
            },
        });
    }

    for (const column of tableDiff.removedColumns) {
        const table = resolveExistingTable(
            context,
            tableDiff.tableName,
            issues,
            'table_not_found',
            `Cannot remove column "${column.name}" because table "${tableDiff.tableName}" does not exist in the diagram.`
        );
        const field = table
            ? resolveExistingField(
                  context,
                  tableDiff.tableName,
                  column.name,
                  issues,
                  'column_not_found',
                  `Cannot remove column "${column.name}" because it does not exist in table "${tableDiff.tableName}".`
              )
            : null;

        if (!table || !field) {
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'removeColumn',
                tableId: table.id,
                tableName: tableDiff.tableName,
                fieldId: field.id,
                column,
            },
        });
    }

    return sequence;
};

const planRemovedTables = (
    context: DiffContext,
    diff: LaravelMigrationSchemaDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;

    for (const table of diff.removedTables) {
        const resolved = resolveExistingTable(
            context,
            table.name,
            issues,
            'table_not_found',
            `Cannot remove table "${table.name}" because it does not exist in the diagram.`
        );

        if (!resolved) {
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'removeTable',
                tableId: resolved.id,
                tableName: table.name,
                table,
            },
        });
    }

    return sequence;
};

const planChangedTableModifications = (
    context: DiffContext,
    tableDiff: TableDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;

    for (const columnDiff of tableDiff.changedColumns) {
        const table = resolveExistingTable(
            context,
            tableDiff.tableName,
            issues,
            'table_not_found',
            `Cannot modify column "${columnDiff.columnName}" because table "${tableDiff.tableName}" does not exist in the diagram.`
        );
        const field = table
            ? resolveExistingField(
                  context,
                  tableDiff.tableName,
                  columnDiff.columnName,
                  issues,
                  'column_not_found',
                  `Cannot modify column "${columnDiff.columnName}" because it does not exist in table "${tableDiff.tableName}".`
              )
            : null;

        if (!table || !field || !columnDiff.after) {
            continue;
        }

        const mapped = mapColumnSnapshotToField(columnDiff.after);
        issues.push(...mapped.issues);

        if (!mapped.fieldPayload) {
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'modifyColumn',
                tableId: table.id,
                tableName: tableDiff.tableName,
                fieldId: field.id,
                before: columnDiff.before ?? columnDiff.after,
                after: columnDiff.after,
                fieldPayload: mapped.fieldPayload,
            },
        });
    }

    for (const indexDiff of tableDiff.changedIndexes) {
        const resolved = resolveExistingIndex(
            context,
            tableDiff.tableName,
            indexDiff.before ?? indexDiff.after!,
            issues,
            'index_not_found',
            `Cannot modify index "${indexDiff.key}" because it does not exist in table "${tableDiff.tableName}".`
        );

        if (!resolved || !indexDiff.after) {
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'modifyIndex',
                tableId: resolved.table.id,
                tableName: tableDiff.tableName,
                indexId: resolved.index.id,
                before: indexDiff.before ?? indexDiff.after,
                after: indexDiff.after,
            },
        });
    }

    return sequence;
};

const planChangedForeignKeys = (
    context: DiffContext,
    diff: LaravelMigrationSchemaDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;

    for (const foreignKeyDiff of diff.changedForeignKeys) {
        const before = foreignKeyDiff.before ?? foreignKeyDiff.after;

        if (!before || !foreignKeyDiff.after) {
            continue;
        }

        const resolved = resolveExistingForeignKey(
            context,
            before,
            issues,
            'foreign_key_not_found',
            `Cannot modify foreign key "${foreignKeyDiff.key}" because it does not exist in the diagram.`
        );

        if (!resolved) {
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'modifyForeignKey',
                relationshipId: resolved.relationship.id,
                before,
                after: foreignKeyDiff.after,
            },
        });
    }

    return sequence;
};

const planAddedTables = (
    context: DiffContext,
    diff: LaravelMigrationSchemaDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;

    for (const table of diff.addedTables) {
        const normalizedTableName = tableMatchKey(table.name);

        if (context.entityIndex.tableByName.has(normalizedTableName)) {
            issues.push(
                createIssue(
                    'error',
                    'duplicate_table',
                    `Cannot add table "${table.name}" because it already exists in the diagram.`,
                    { tableName: table.name }
                )
            );
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'addTable',
                tableName: table.name,
                table,
            },
        });
    }

    return sequence;
};

const planAddedColumns = (
    context: DiffContext,
    tableDiff: TableDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;
    const table = resolveTableByName(context.entityIndex, tableDiff.tableName);
    const tableExists = tableExistsInPlan(context, tableDiff.tableName);

    if (!tableExists) {
        for (const column of tableDiff.addedColumns) {
            issues.push(
                createIssue(
                    'error',
                    'table_not_found',
                    `Cannot add column "${column.name}" because table "${tableDiff.tableName}" does not exist in the diagram or planned additions.`,
                    {
                        tableName: tableDiff.tableName,
                        columnName: column.name,
                    }
                )
            );
        }
        return sequence;
    }

    for (const column of tableDiff.addedColumns) {
        if (columnExistsInDiagram(context, tableDiff.tableName, column.name)) {
            issues.push(
                createIssue(
                    'error',
                    'duplicate_column',
                    `Cannot add column "${column.name}" because it already exists in table "${tableDiff.tableName}".`,
                    {
                        tableName: tableDiff.tableName,
                        columnName: column.name,
                    }
                )
            );
            continue;
        }

        const mapped = mapColumnSnapshotToField(column);
        issues.push(...mapped.issues);

        if (!mapped.fieldPayload) {
            continue;
        }

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'addColumn',
                tableId: table?.id ?? null,
                tableName: tableDiff.tableName,
                column,
                fieldPayload: mapped.fieldPayload,
            },
        });
    }

    return sequence;
};

const planAddedIndexes = (
    context: DiffContext,
    tableDiff: TableDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;
    const table = resolveTableByName(context.entityIndex, tableDiff.tableName);

    if (!tableExistsInPlan(context, tableDiff.tableName)) {
        for (const index of tableDiff.addedIndexes) {
            issues.push(
                createIssue(
                    'error',
                    'table_not_found',
                    `Cannot add index to table "${tableDiff.tableName}" because the table does not exist in the diagram or planned additions.`,
                    {
                        tableName: tableDiff.tableName,
                        indexKey: indexMatchKey(tableDiff.tableName, index),
                    }
                )
            );
        }
        return sequence;
    }

    for (const index of tableDiff.addedIndexes) {
        const existingIndexKey = indexMatchKey(tableDiff.tableName, index);

        if (context.entityIndex.indexByTableAndKey.has(existingIndexKey)) {
            issues.push(
                createIssue(
                    'error',
                    'duplicate_index',
                    `Cannot add index "${existingIndexKey}" because it already exists in table "${tableDiff.tableName}".`,
                    {
                        tableName: tableDiff.tableName,
                        indexKey: existingIndexKey,
                    }
                )
            );
            continue;
        }

        const fieldIds = resolveIndexFieldIds(
            context,
            tableDiff.tableName,
            index,
            issues
        );

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'addIndex',
                tableId: table?.id ?? null,
                tableName: tableDiff.tableName,
                index,
                fieldIds,
            },
        });
    }

    return sequence;
};

const planAddedForeignKeys = (
    context: DiffContext,
    diff: LaravelMigrationSchemaDiff,
    planned: PlannedOperation[],
    issues: ApplyValidationIssue[],
    sequenceStart: number
): number => {
    let sequence = sequenceStart;

    for (const foreignKey of diff.addedForeignKeys) {
        const fkKey = foreignKeyMatchKey(foreignKey);

        if (context.entityIndex.relationshipByFkKey.has(fkKey)) {
            issues.push(
                createIssue(
                    'error',
                    'duplicate_foreign_key',
                    `Cannot add foreign key "${fkKey}" because it already exists in the diagram.`,
                    { foreignKeyKey: fkKey }
                )
            );
            continue;
        }

        if (!tableExistsInPlan(context, foreignKey.localTable)) {
            issues.push(
                createIssue(
                    'error',
                    'foreign_key_local_table_not_found',
                    `Cannot add foreign key "${fkKey}" because local table "${foreignKey.localTable}" does not exist in the diagram or planned additions.`,
                    {
                        foreignKeyKey: fkKey,
                        tableName: foreignKey.localTable,
                    }
                )
            );
            continue;
        }

        if (
            !columnExistsInPlan(
                context,
                foreignKey.localTable,
                foreignKey.localColumn
            )
        ) {
            issues.push(
                createIssue(
                    'error',
                    'foreign_key_local_column_not_found',
                    `Cannot add foreign key "${fkKey}" because local column "${foreignKey.localColumn}" does not exist in table "${foreignKey.localTable}".`,
                    {
                        foreignKeyKey: fkKey,
                        tableName: foreignKey.localTable,
                        columnName: foreignKey.localColumn,
                    }
                )
            );
            continue;
        }

        if (!tableExistsInPlan(context, foreignKey.referencedTable)) {
            issues.push(
                createIssue(
                    'error',
                    'foreign_key_target_table_not_found',
                    `Cannot add foreign key "${fkKey}" because referenced table "${foreignKey.referencedTable}" does not exist in the diagram or planned additions.`,
                    {
                        foreignKeyKey: fkKey,
                        tableName: foreignKey.referencedTable,
                    }
                )
            );
            continue;
        }

        if (
            !columnExistsInPlan(
                context,
                foreignKey.referencedTable,
                foreignKey.referencedColumn
            )
        ) {
            issues.push(
                createIssue(
                    'error',
                    'foreign_key_target_column_not_found',
                    `Cannot add foreign key "${fkKey}" because referenced column "${foreignKey.referencedColumn}" does not exist in table "${foreignKey.referencedTable}".`,
                    {
                        foreignKeyKey: fkKey,
                        tableName: foreignKey.referencedTable,
                        columnName: foreignKey.referencedColumn,
                    }
                )
            );
            continue;
        }

        const localTable = resolveTableByName(
            context.entityIndex,
            foreignKey.localTable
        );
        const referencedTable = resolveTableByName(
            context.entityIndex,
            foreignKey.referencedTable
        );
        const localField = resolveFieldByTableAndColumn(
            context.entityIndex,
            foreignKey.localTable,
            foreignKey.localColumn
        );
        const referencedField = resolveFieldByTableAndColumn(
            context.entityIndex,
            foreignKey.referencedTable,
            foreignKey.referencedColumn
        );

        planned.push({
            sequence: sequence++,
            operation: {
                kind: 'addForeignKey',
                localTableId: localTable?.id ?? null,
                localTableName: foreignKey.localTable,
                localFieldId: localField?.id ?? null,
                localColumnName: foreignKey.localColumn,
                referencedTableId: referencedTable?.id ?? null,
                referencedTableName: foreignKey.referencedTable,
                referencedFieldId: referencedField?.id ?? null,
                referencedColumnName: foreignKey.referencedColumn,
                foreignKey,
            },
        });
    }

    return sequence;
};

const sortOperations = (planned: PlannedOperation[]): ApplyOperation[] =>
    [...planned]
        .sort((left, right) => {
            const phaseDifference =
                APPLY_OPERATION_PHASE_ORDER[left.operation.kind] -
                APPLY_OPERATION_PHASE_ORDER[right.operation.kind];

            if (phaseDifference !== 0) {
                return phaseDifference;
            }

            return left.sequence - right.sequence;
        })
        .map((entry) => entry.operation);

export const planLaravelMigrationDiffApply = ({
    tables,
    relationships,
    diff,
}: {
    tables: DBTable[];
    relationships: DBRelationship[];
    diff: LaravelMigrationSchemaDiff;
}): ApplyPlan => {
    const context = buildDiffContext({ tables, relationships, diff });
    const issues: ApplyValidationIssue[] = [];
    const planned: PlannedOperation[] = [];
    let sequence = 0;

    sequence = planRemovedForeignKeys(context, diff, planned, issues, sequence);

    for (const tableDiff of diff.changedTables) {
        sequence = planChangedTableRemovals(
            context,
            tableDiff,
            planned,
            issues,
            sequence
        );
    }

    sequence = planRemovedTables(context, diff, planned, issues, sequence);

    for (const tableDiff of diff.changedTables) {
        sequence = planChangedTableModifications(
            context,
            tableDiff,
            planned,
            issues,
            sequence
        );
    }

    sequence = planChangedForeignKeys(context, diff, planned, issues, sequence);
    sequence = planAddedTables(context, diff, planned, issues, sequence);

    for (const tableDiff of diff.changedTables) {
        sequence = planAddedColumns(
            context,
            tableDiff,
            planned,
            issues,
            sequence
        );
        sequence = planAddedIndexes(
            context,
            tableDiff,
            planned,
            issues,
            sequence
        );
    }

    sequence = planAddedForeignKeys(context, diff, planned, issues, sequence);

    const operations = sortOperations(planned);
    const canApply = !issues.some((issue) => issue.severity === 'error');

    return {
        operations,
        issues,
        canApply,
    };
};
