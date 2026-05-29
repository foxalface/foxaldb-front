import type {
    AddFieldEvent,
    AddRelationshipsEvent,
    CreateTableEvent,
    RemoveFieldEvent,
    RemoveRelationshipsEvent,
    RemoveTableEvent,
    UpdateTableEvent,
} from '@/context/chartdb-context/chartdb-context';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';

export type DiagramOperationAction =
    | 'add_tables'
    | 'update_table'
    | 'remove_tables'
    | 'add_field'
    | 'remove_field'
    | 'update_field'
    | 'add_relationships'
    | 'remove_relationships'
    | 'update_relationship';

export type UpdateFieldOperationData = {
    tableId: string;
    fieldId: string;
    attributes: Partial<DBField>;
};

export type UpdateRelationshipOperationData = {
    id: string;
    attributes: Partial<DBRelationship>;
};

export type DiagramOperationData =
    | CreateTableEvent['data']
    | UpdateTableEvent['data']
    | RemoveTableEvent['data']
    | AddFieldEvent['data']
    | RemoveFieldEvent['data']
    | UpdateFieldOperationData
    | AddRelationshipsEvent['data']
    | RemoveRelationshipsEvent['data']
    | UpdateRelationshipOperationData;

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
    addRelationships: (
        relationships: DBRelationship[],
        options: { updateHistory: false }
    ) => Promise<void>;
    removeRelationships: (
        relationshipIds: string[],
        options: { updateHistory: false }
    ) => Promise<void>;
    updateRelationship: (
        id: string,
        relationship: Partial<DBRelationship>,
        options: { updateHistory: false }
    ) => Promise<void>;
}

export interface ApplyRemoteDiagramOperationContext {
    existingTableIds: ReadonlySet<string>;
    getTableFromStorage: (tableId: string) => Promise<DBTable | undefined>;
    existingRelationshipIds: ReadonlySet<string>;
    getRelationshipFromStorage: (
        relationshipId: string
    ) => Promise<DBRelationship | undefined>;
    existingFieldIdsByTable: ReadonlyMap<string, ReadonlySet<string>>;
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
    'add_relationships',
    'remove_relationships',
    'update_relationship',
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

const isDBRelationship = (value: unknown): value is DBRelationship =>
    isRecord(value) && typeof value.id === 'string';

const validateAddRelationshipsData = (
    data: unknown
): data is AddRelationshipsEvent['data'] => {
    return (
        isRecord(data) &&
        Array.isArray(data.relationships) &&
        data.relationships.every(isDBRelationship)
    );
};

const validateRemoveRelationshipsData = (
    data: unknown
): data is RemoveRelationshipsEvent['data'] => {
    return isRecord(data) && Array.isArray(data.relationshipIds);
};

const validateUpdateRelationshipData = (
    data: unknown
): data is UpdateRelationshipOperationData => {
    return (
        isRecord(data) &&
        typeof data.id === 'string' &&
        data.id.length > 0 &&
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

            const { tableId, field } = payload.data;
            const existingFieldIds =
                context.existingFieldIdsByTable.get(tableId);

            if (existingFieldIds?.has(field.id)) {
                return;
            }

            const storedTable = await context.getTableFromStorage(tableId);
            const storedField = storedTable?.fields.find(
                (stored) => stored.id === field.id
            );
            const fieldToApply = storedField ?? field;

            try {
                await mutators.addField(tableId, fieldToApply, historyOptions);
            } catch (error) {
                if (isDexieConstraintError(error)) {
                    return;
                }

                throw error;
            }
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

        case 'add_relationships': {
            if (!validateAddRelationshipsData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid add_relationships payload',
                    payload.data
                );
                return;
            }

            for (const relationship of payload.data.relationships) {
                if (context.existingRelationshipIds.has(relationship.id)) {
                    continue;
                }

                if (
                    !context.existingTableIds.has(relationship.sourceTableId) ||
                    !context.existingTableIds.has(relationship.targetTableId)
                ) {
                    continue;
                }

                const storedRelationship =
                    await context.getRelationshipFromStorage(relationship.id);
                const relationshipToApply = storedRelationship ?? relationship;

                try {
                    await mutators.addRelationships(
                        [relationshipToApply],
                        historyOptions
                    );
                } catch (error) {
                    if (isDexieConstraintError(error)) {
                        continue;
                    }

                    throw error;
                }
            }

            return;
        }

        case 'remove_relationships': {
            if (!validateRemoveRelationshipsData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid remove_relationships payload',
                    payload.data
                );
                return;
            }

            const relationshipIds = payload.data.relationshipIds.filter(
                (id): id is string => typeof id === 'string' && id.length > 0
            );

            if (relationshipIds.length === 0) {
                return;
            }

            await mutators.removeRelationships(relationshipIds, historyOptions);
            return;
        }

        case 'update_relationship': {
            if (!validateUpdateRelationshipData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid update_relationship payload',
                    payload.data
                );
                return;
            }

            const relationshipId = payload.data.id;
            const inState = context.existingRelationshipIds.has(relationshipId);
            const storedRelationship =
                await context.getRelationshipFromStorage(relationshipId);

            if (!inState && storedRelationship === undefined) {
                return;
            }

            await mutators.updateRelationship(
                relationshipId,
                payload.data.attributes,
                historyOptions
            );
            return;
        }
    }
};
