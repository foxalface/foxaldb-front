import type {
    AddFieldEvent,
    CreateTableEvent,
    RemoveFieldEvent,
    RemoveTableEvent,
    UpdateTableEvent,
} from '@/context/chartdb-context/chartdb-context';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';

export type DiagramOperationAction =
    | 'add_tables'
    | 'update_table'
    | 'remove_tables'
    | 'add_field'
    | 'remove_field'
    | 'update_field';

export type UpdateFieldOperationData = {
    tableId: string;
    fieldId: string;
    attributes: Partial<DBField>;
};

export type DiagramOperationData =
    | CreateTableEvent['data']
    | UpdateTableEvent['data']
    | RemoveTableEvent['data']
    | AddFieldEvent['data']
    | RemoveFieldEvent['data']
    | UpdateFieldOperationData;

export interface DiagramOperationRequest {
    action: DiagramOperationAction;
    data: DiagramOperationData;
    clientId: string;
}

export interface DiagramOperationPayload {
    action: DiagramOperationAction;
    data: DiagramOperationData;
    userId: number;
    clientId: string;
    sentAt: string;
}

export interface DiagramOperationMutators {
    addTables: (
        tables: DBTable[],
        options: { updateHistory: false }
    ) => Promise<void>;
    updateTable: (
        id: string,
        table: Partial<DBTable>,
        options: { updateHistory: false }
    ) => Promise<void>;
    removeTables: (
        tableIds: string[],
        options: { updateHistory: false }
    ) => Promise<void>;
    addField: (
        tableId: string,
        field: DBField,
        options: { updateHistory: false }
    ) => Promise<void>;
    removeField: (
        tableId: string,
        fieldId: string,
        options: { updateHistory: false }
    ) => Promise<void>;
    updateField: (
        tableId: string,
        fieldId: string,
        field: Partial<DBField>,
        options: { updateHistory: false }
    ) => Promise<void>;
}

export interface ApplyRemoteDiagramOperationContext {
    existingTableIds: ReadonlySet<string>;
    getTableFromStorage: (tableId: string) => Promise<DBTable | undefined>;
}

const isDexieConstraintError = (error: unknown): boolean =>
    error instanceof Error && error.name === 'ConstraintError';

const DIAGRAM_OPERATION_ACTIONS: readonly DiagramOperationAction[] = [
    'add_tables',
    'update_table',
    'remove_tables',
    'add_field',
    'remove_field',
    'update_field',
];

export const isDiagramOperationAction = (
    action: string
): action is DiagramOperationAction =>
    (DIAGRAM_OPERATION_ACTIONS as readonly string[]).includes(action);

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const validateAddTablesData = (
    data: unknown
): data is CreateTableEvent['data'] => {
    return isRecord(data) && Array.isArray(data.tables);
};

const validateUpdateTableData = (
    data: unknown
): data is UpdateTableEvent['data'] => {
    return (
        isRecord(data) && typeof data.id === 'string' && isRecord(data.table)
    );
};

const validateRemoveTablesData = (
    data: unknown
): data is RemoveTableEvent['data'] => {
    return isRecord(data) && Array.isArray(data.tableIds);
};

const validateAddFieldData = (data: unknown): data is AddFieldEvent['data'] => {
    return (
        isRecord(data) &&
        typeof data.tableId === 'string' &&
        isRecord(data.field) &&
        typeof data.field.id === 'string'
    );
};

const validateRemoveFieldData = (
    data: unknown
): data is RemoveFieldEvent['data'] => {
    return (
        isRecord(data) &&
        typeof data.tableId === 'string' &&
        typeof data.fieldId === 'string'
    );
};

const validateUpdateFieldData = (
    data: unknown
): data is UpdateFieldOperationData => {
    return (
        isRecord(data) &&
        typeof data.tableId === 'string' &&
        typeof data.fieldId === 'string' &&
        isRecord(data.attributes) &&
        Object.keys(data.attributes).length > 0
    );
};

const tableHasField = (table: DBTable | undefined, fieldId: string): boolean =>
    table?.fields.some((field) => field.id === fieldId) ?? false;

export const applyRemoteDiagramOperation = async (
    payload: DiagramOperationPayload,
    mutators: DiagramOperationMutators,
    context: ApplyRemoteDiagramOperationContext
): Promise<void> => {
    const historyOptions = { updateHistory: false as const };

    switch (payload.action) {
        case 'add_tables': {
            if (!validateAddTablesData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid add_tables payload',
                    payload.data
                );
                return;
            }

            for (const table of payload.data.tables) {
                if (context.existingTableIds.has(table.id)) {
                    continue;
                }

                const storedTable = await context.getTableFromStorage(table.id);
                const tableToApply = storedTable ?? table;

                try {
                    await mutators.addTables([tableToApply], historyOptions);
                } catch (error) {
                    if (isDexieConstraintError(error)) {
                        continue;
                    }

                    throw error;
                }
            }

            return;
        }

        case 'update_table': {
            if (!validateUpdateTableData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid update_table payload',
                    payload.data
                );
                return;
            }

            await mutators.updateTable(
                payload.data.id,
                payload.data.table,
                historyOptions
            );
            return;
        }

        case 'remove_tables': {
            if (!validateRemoveTablesData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid remove_tables payload',
                    payload.data
                );
                return;
            }

            await mutators.removeTables(payload.data.tableIds, historyOptions);
            return;
        }

        case 'add_field': {
            if (!validateAddFieldData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid add_field payload',
                    payload.data
                );
                return;
            }

            const storedTable = await context.getTableFromStorage(
                payload.data.tableId
            );

            if (tableHasField(storedTable, payload.data.field.id)) {
                return;
            }

            await mutators.addField(
                payload.data.tableId,
                payload.data.field,
                historyOptions
            );
            return;
        }

        case 'remove_field': {
            if (!validateRemoveFieldData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid remove_field payload',
                    payload.data
                );
                return;
            }

            await mutators.removeField(
                payload.data.tableId,
                payload.data.fieldId,
                historyOptions
            );
            return;
        }

        case 'update_field': {
            if (!validateUpdateFieldData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid update_field payload',
                    payload.data
                );
                return;
            }

            const storedTable = await context.getTableFromStorage(
                payload.data.tableId
            );

            if (
                storedTable !== undefined &&
                !tableHasField(storedTable, payload.data.fieldId)
            ) {
                return;
            }

            await mutators.updateField(
                payload.data.tableId,
                payload.data.fieldId,
                payload.data.attributes,
                historyOptions
            );
            return;
        }
    }
};
