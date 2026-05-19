import type {
    CreateTableEvent,
    RemoveTableEvent,
    UpdateTableEvent,
} from '@/context/chartdb-context/chartdb-context';
import type { DBTable } from '@/lib/domain/db-table';

export type DiagramOperationAction =
    | 'add_tables'
    | 'update_table'
    | 'remove_tables';

export type DiagramOperationData =
    | CreateTableEvent['data']
    | UpdateTableEvent['data']
    | RemoveTableEvent['data'];

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
    if (!isRecord(data)) {
        return false;
    }

    return Array.isArray(data.tables);
};

const validateUpdateTableData = (
    data: unknown
): data is UpdateTableEvent['data'] => {
    if (!isRecord(data)) {
        return false;
    }

    return typeof data.id === 'string' && isRecord(data.table);
};

const validateRemoveTablesData = (
    data: unknown
): data is RemoveTableEvent['data'] => {
    if (!isRecord(data)) {
        return false;
    }

    return Array.isArray(data.tableIds);
};

export const applyRemoteDiagramOperation = async (
    payload: DiagramOperationPayload,
    mutators: DiagramOperationMutators,
    context: ApplyRemoteDiagramOperationContext
): Promise<void> => {
    if (!isDiagramOperationAction(payload.action)) {
        console.warn(
            '[DiagramOperation] Ignoring operation with invalid action',
            payload.action
        );
        return;
    }

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
    }
};
