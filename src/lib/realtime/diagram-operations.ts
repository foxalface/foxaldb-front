import type {
    AddAreasEvent,
    AddDependenciesEvent,
    AddFieldEvent,
    AddNotesEvent,
    AddRelationshipsEvent,
    CreateTableEvent,
    RemoveAreasEvent,
    RemoveDependenciesEvent,
    RemoveFieldEvent,
    RemoveNotesEvent,
    RemoveRelationshipsEvent,
    RemoveTableEvent,
    UpdateTableEvent,
} from '@/context/chartdb-context/chartdb-context';
import type { Area } from '@/lib/domain/area';
import type { DBDependency } from '@/lib/domain/db-dependency';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { Note } from '@/lib/domain/note';
import {
    tagAssignmentKey,
    tagTargetTypes,
    type DiagramTag,
    type DiagramTagAssignment,
    type TagTargetType,
} from '@/lib/domain/diagram-tag';

export type DiagramOperationAction =
    | 'update_diagram_name'
    | 'add_tables'
    | 'update_table'
    | 'remove_tables'
    | 'add_field'
    | 'remove_field'
    | 'update_field'
    | 'add_relationships'
    | 'remove_relationships'
    | 'update_relationship'
    | 'add_notes'
    | 'remove_notes'
    | 'update_note'
    | 'add_areas'
    | 'remove_areas'
    | 'update_area'
    | 'add_dependencies'
    | 'remove_dependencies'
    | 'update_dependency'
    | 'add_tags'
    | 'update_tag'
    | 'remove_tags'
    | 'add_tag_assignments'
    | 'remove_tag_assignments';

export type UpdateFieldOperationData = {
    tableId: string;
    fieldId: string;
    attributes: Partial<DBField>;
};

export type UpdateRelationshipOperationData = {
    id: string;
    attributes: Partial<DBRelationship>;
};

export type UpdateNoteOperationData = {
    id: string;
    attributes: Partial<Note>;
};

export type UpdateAreaOperationData = {
    id: string;
    attributes: Partial<Area>;
};

export type UpdateDependencyOperationData = {
    id: string;
    attributes: Partial<DBDependency>;
};

export type UpdateDiagramNameOperationData = {
    name: string;
};

export type AddTagsOperationData = {
    tags: DiagramTag[];
};

export type UpdateTagOperationData = {
    id: string;
    attributes: Partial<Pick<DiagramTag, 'name'>>;
};

export type RemoveTagsOperationData = {
    tagIds: string[];
};

export type AddTagAssignmentsOperationData = {
    assignments: DiagramTagAssignment[];
};

export type RemoveTagAssignmentsOperationData = {
    assignmentIds: string[];
};

export type DiagramOperationData =
    | UpdateDiagramNameOperationData
    | CreateTableEvent['data']
    | UpdateTableEvent['data']
    | RemoveTableEvent['data']
    | AddFieldEvent['data']
    | RemoveFieldEvent['data']
    | UpdateFieldOperationData
    | AddRelationshipsEvent['data']
    | RemoveRelationshipsEvent['data']
    | UpdateRelationshipOperationData
    | AddNotesEvent['data']
    | RemoveNotesEvent['data']
    | UpdateNoteOperationData
    | AddAreasEvent['data']
    | RemoveAreasEvent['data']
    | UpdateAreaOperationData
    | AddDependenciesEvent['data']
    | RemoveDependenciesEvent['data']
    | UpdateDependencyOperationData
    | AddTagsOperationData
    | UpdateTagOperationData
    | RemoveTagsOperationData
    | AddTagAssignmentsOperationData
    | RemoveTagAssignmentsOperationData;

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
    updateDiagramName: (
        name: string,
        options: { updateHistory: false }
    ) => Promise<void>;
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
    addNotes: (
        notes: Note[],
        options: { updateHistory: false }
    ) => Promise<void>;
    removeNotes: (
        noteIds: string[],
        options: { updateHistory: false }
    ) => Promise<void>;
    updateNote: (
        id: string,
        note: Partial<Note>,
        options: { updateHistory: false }
    ) => Promise<void>;
    addAreas: (
        areas: Area[],
        options: { updateHistory: false }
    ) => Promise<void>;
    removeAreas: (
        areaIds: string[],
        options: { updateHistory: false }
    ) => Promise<void>;
    updateArea: (
        id: string,
        area: Partial<Area>,
        options: { updateHistory: false }
    ) => Promise<void>;
    addDependencies: (
        dependencies: DBDependency[],
        options: { updateHistory: false }
    ) => Promise<void>;
    removeDependencies: (
        dependencyIds: string[],
        options: { updateHistory: false }
    ) => Promise<void>;
    updateDependency: (
        id: string,
        dependency: Partial<DBDependency>,
        options: { updateHistory: false }
    ) => Promise<void>;
    addTags: (
        tags: DiagramTag[],
        options: { updateHistory: false }
    ) => Promise<void>;
    updateTag: (
        id: string,
        attributes: Partial<Pick<DiagramTag, 'name'>>,
        options: { updateHistory: false }
    ) => Promise<void>;
    removeTags: (
        tagIds: string[],
        options: { updateHistory: false }
    ) => Promise<void>;
    addTagAssignments: (
        assignments: DiagramTagAssignment[],
        options: { updateHistory: false }
    ) => Promise<void>;
    removeTagAssignments: (
        assignmentIds: string[],
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
    existingNoteIds: ReadonlySet<string>;
    getNoteFromStorage: (noteId: string) => Promise<Note | undefined>;
    existingAreaIds: ReadonlySet<string>;
    getAreaFromStorage: (areaId: string) => Promise<Area | undefined>;
    existingDependencyIds: ReadonlySet<string>;
    getDependencyFromStorage: (
        dependencyId: string
    ) => Promise<DBDependency | undefined>;
    existingTagIds: ReadonlySet<string>;
    existingAssignmentIds: ReadonlySet<string>;
    existingAssignmentKeys: ReadonlySet<string>;
}

const isDexieConstraintError = (error: unknown): boolean =>
    error instanceof Error && error.name === 'ConstraintError';

const DIAGRAM_OPERATION_ACTIONS: readonly DiagramOperationAction[] = [
    'update_diagram_name',
    'add_tables',
    'update_table',
    'remove_tables',
    'add_field',
    'remove_field',
    'update_field',
    'add_relationships',
    'remove_relationships',
    'update_relationship',
    'add_notes',
    'remove_notes',
    'update_note',
    'add_areas',
    'remove_areas',
    'update_area',
    'add_dependencies',
    'remove_dependencies',
    'update_dependency',
    'add_tags',
    'update_tag',
    'remove_tags',
    'add_tag_assignments',
    'remove_tag_assignments',
];

export const isDiagramOperationAction = (
    action: string
): action is DiagramOperationAction =>
    (DIAGRAM_OPERATION_ACTIONS as readonly string[]).includes(action);

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const validateUpdateDiagramNameData = (
    data: unknown
): data is UpdateDiagramNameOperationData => {
    return (
        isRecord(data) &&
        typeof data.name === 'string' &&
        data.name.trim().length > 0
    );
};

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
    return (
        isRecord(data) &&
        Array.isArray(data.tableIds) &&
        Array.isArray(data.fieldIds) &&
        Array.isArray(data.relationshipIds)
    );
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

const isNote = (value: unknown): value is Note =>
    isRecord(value) && typeof value.id === 'string';

const validateAddNotesData = (data: unknown): data is AddNotesEvent['data'] => {
    return (
        isRecord(data) && Array.isArray(data.notes) && data.notes.every(isNote)
    );
};

const validateRemoveNotesData = (
    data: unknown
): data is RemoveNotesEvent['data'] => {
    return isRecord(data) && Array.isArray(data.noteIds);
};

const validateUpdateNoteData = (
    data: unknown
): data is UpdateNoteOperationData => {
    return (
        isRecord(data) &&
        typeof data.id === 'string' &&
        data.id.length > 0 &&
        isRecord(data.attributes) &&
        Object.keys(data.attributes).length > 0
    );
};

const isArea = (value: unknown): value is Area =>
    isRecord(value) && typeof value.id === 'string';

const validateAddAreasData = (data: unknown): data is AddAreasEvent['data'] => {
    return (
        isRecord(data) && Array.isArray(data.areas) && data.areas.every(isArea)
    );
};

const validateRemoveAreasData = (
    data: unknown
): data is RemoveAreasEvent['data'] => {
    return isRecord(data) && Array.isArray(data.areaIds);
};

const validateUpdateAreaData = (
    data: unknown
): data is UpdateAreaOperationData => {
    return (
        isRecord(data) &&
        typeof data.id === 'string' &&
        data.id.length > 0 &&
        isRecord(data.attributes) &&
        Object.keys(data.attributes).length > 0
    );
};

const isDBDependency = (value: unknown): value is DBDependency =>
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.tableId === 'string' &&
    typeof value.dependentTableId === 'string';

const validateAddDependenciesData = (
    data: unknown
): data is AddDependenciesEvent['data'] => {
    return (
        isRecord(data) &&
        Array.isArray(data.dependencies) &&
        data.dependencies.every(isDBDependency)
    );
};

const validateRemoveDependenciesData = (
    data: unknown
): data is RemoveDependenciesEvent['data'] => {
    return isRecord(data) && Array.isArray(data.dependencyIds);
};

const validateUpdateDependencyData = (
    data: unknown
): data is UpdateDependencyOperationData => {
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

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const isTagTargetType = (value: unknown): value is TagTargetType =>
    typeof value === 'string' &&
    (tagTargetTypes as readonly string[]).includes(value);

const isDiagramTag = (value: unknown): value is DiagramTag =>
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    Object.keys(value).every((key) => key === 'id' || key === 'name');

const isDiagramTagAssignment = (
    value: unknown
): value is DiagramTagAssignment =>
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.tagId) &&
    isTagTargetType(value.targetType) &&
    isNonEmptyString(value.targetId);

const tagAttributes = (
    value: unknown
): Partial<Pick<DiagramTag, 'name'>> | null => {
    if (!isRecord(value)) {
        return null;
    }

    const attributes: Partial<Pick<DiagramTag, 'name'>> = {};

    if (value.name !== undefined) {
        if (!isNonEmptyString(value.name)) {
            return null;
        }

        attributes.name = value.name;
    }

    const unsupported = Object.keys(value).filter((key) => key !== 'name');

    if (unsupported.length > 0 || Object.keys(attributes).length === 0) {
        return null;
    }

    return attributes;
};

const validateAddTagsData = (data: unknown): data is AddTagsOperationData =>
    isRecord(data) &&
    Array.isArray(data.tags) &&
    data.tags.length > 0 &&
    data.tags.every(isDiagramTag);

const validateUpdateTagData = (data: unknown): data is UpdateTagOperationData =>
    isRecord(data) &&
    isNonEmptyString(data.id) &&
    tagAttributes(data.attributes) !== null;

const validateRemoveTagsData = (
    data: unknown
): data is RemoveTagsOperationData =>
    isRecord(data) &&
    Array.isArray(data.tagIds) &&
    data.tagIds.length > 0 &&
    data.tagIds.every(isNonEmptyString);

const validateAddTagAssignmentsData = (
    data: unknown
): data is AddTagAssignmentsOperationData =>
    isRecord(data) &&
    Array.isArray(data.assignments) &&
    data.assignments.length > 0 &&
    data.assignments.every(isDiagramTagAssignment);

const validateRemoveTagAssignmentsData = (
    data: unknown
): data is RemoveTagAssignmentsOperationData =>
    isRecord(data) &&
    Array.isArray(data.assignmentIds) &&
    data.assignmentIds.length > 0 &&
    data.assignmentIds.every(isNonEmptyString);

const fieldIdExists = (
    fieldId: string,
    fieldsByTable: ReadonlyMap<string, ReadonlySet<string>>
): boolean => {
    for (const fieldIds of fieldsByTable.values()) {
        if (fieldIds.has(fieldId)) {
            return true;
        }
    }

    return false;
};

const assignmentTargetExists = (
    assignment: DiagramTagAssignment,
    context: ApplyRemoteDiagramOperationContext
): boolean => {
    if (assignment.targetType === 'table') {
        return context.existingTableIds.has(assignment.targetId);
    }

    if (assignment.targetType === 'field') {
        return fieldIdExists(
            assignment.targetId,
            context.existingFieldIdsByTable
        );
    }

    return context.existingRelationshipIds.has(assignment.targetId);
};

export const applyRemoteDiagramOperation = async (
    payload: DiagramOperationPayload,
    mutators: DiagramOperationMutators,
    context: ApplyRemoteDiagramOperationContext
): Promise<void> => {
    const historyOptions = { updateHistory: false as const };

    switch (payload.action) {
        case 'update_diagram_name': {
            if (!validateUpdateDiagramNameData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid update_diagram_name payload',
                    payload.data
                );
                return;
            }

            await mutators.updateDiagramName(payload.data.name, historyOptions);
            return;
        }

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

        case 'add_notes': {
            if (!validateAddNotesData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid add_notes payload',
                    payload.data
                );
                return;
            }

            for (const note of payload.data.notes) {
                if (context.existingNoteIds.has(note.id)) {
                    continue;
                }

                const storedNote = await context.getNoteFromStorage(note.id);
                const noteToApply = storedNote ?? note;

                try {
                    await mutators.addNotes([noteToApply], historyOptions);
                } catch (error) {
                    if (isDexieConstraintError(error)) {
                        continue;
                    }

                    throw error;
                }
            }

            return;
        }

        case 'remove_notes': {
            if (!validateRemoveNotesData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid remove_notes payload',
                    payload.data
                );
                return;
            }

            const noteIds = payload.data.noteIds.filter(
                (id): id is string => typeof id === 'string' && id.length > 0
            );

            if (noteIds.length === 0) {
                return;
            }

            await mutators.removeNotes(noteIds, historyOptions);
            return;
        }

        case 'update_note': {
            if (!validateUpdateNoteData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid update_note payload',
                    payload.data
                );
                return;
            }

            const noteId = payload.data.id;
            const inState = context.existingNoteIds.has(noteId);
            const storedNote = await context.getNoteFromStorage(noteId);

            if (!inState && storedNote === undefined) {
                return;
            }

            await mutators.updateNote(
                noteId,
                payload.data.attributes,
                historyOptions
            );
            return;
        }

        case 'add_areas': {
            if (!validateAddAreasData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid add_areas payload',
                    payload.data
                );
                return;
            }

            for (const area of payload.data.areas) {
                if (context.existingAreaIds.has(area.id)) {
                    continue;
                }

                const storedArea = await context.getAreaFromStorage(area.id);
                const areaToApply = storedArea ?? area;

                try {
                    await mutators.addAreas([areaToApply], historyOptions);
                } catch (error) {
                    if (isDexieConstraintError(error)) {
                        continue;
                    }

                    throw error;
                }
            }

            return;
        }

        case 'remove_areas': {
            if (!validateRemoveAreasData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid remove_areas payload',
                    payload.data
                );
                return;
            }

            const areaIds = payload.data.areaIds.filter(
                (id): id is string => typeof id === 'string' && id.length > 0
            );

            if (areaIds.length === 0) {
                return;
            }

            await mutators.removeAreas(areaIds, historyOptions);
            return;
        }

        case 'update_area': {
            if (!validateUpdateAreaData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid update_area payload',
                    payload.data
                );
                return;
            }

            const areaId = payload.data.id;
            const inState = context.existingAreaIds.has(areaId);
            const storedArea = await context.getAreaFromStorage(areaId);

            if (!inState && storedArea === undefined) {
                return;
            }

            await mutators.updateArea(
                areaId,
                payload.data.attributes,
                historyOptions
            );
            return;
        }

        case 'add_dependencies': {
            if (!validateAddDependenciesData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid add_dependencies payload',
                    payload.data
                );
                return;
            }

            for (const dependency of payload.data.dependencies) {
                if (context.existingDependencyIds.has(dependency.id)) {
                    continue;
                }

                if (
                    !context.existingTableIds.has(dependency.tableId) ||
                    !context.existingTableIds.has(dependency.dependentTableId)
                ) {
                    continue;
                }

                const storedDependency = await context.getDependencyFromStorage(
                    dependency.id
                );
                const dependencyToApply = storedDependency ?? dependency;

                try {
                    await mutators.addDependencies(
                        [dependencyToApply],
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

        case 'remove_dependencies': {
            if (!validateRemoveDependenciesData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid remove_dependencies payload',
                    payload.data
                );
                return;
            }

            const dependencyIds = payload.data.dependencyIds.filter(
                (id): id is string => typeof id === 'string' && id.length > 0
            );

            if (dependencyIds.length === 0) {
                return;
            }

            await mutators.removeDependencies(dependencyIds, historyOptions);
            return;
        }

        case 'update_dependency': {
            if (!validateUpdateDependencyData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid update_dependency payload',
                    payload.data
                );
                return;
            }

            const dependencyId = payload.data.id;
            const inState = context.existingDependencyIds.has(dependencyId);
            const storedDependency =
                await context.getDependencyFromStorage(dependencyId);

            if (!inState && storedDependency === undefined) {
                return;
            }

            await mutators.updateDependency(
                dependencyId,
                payload.data.attributes,
                historyOptions
            );
            return;
        }

        case 'add_tags': {
            if (!validateAddTagsData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid add_tags payload',
                    payload.data
                );
                return;
            }

            const tags = payload.data.tags.filter(
                (tag) => !context.existingTagIds.has(tag.id)
            );

            if (tags.length === 0) {
                return;
            }

            await mutators.addTags(tags, historyOptions);
            return;
        }

        case 'update_tag': {
            if (!validateUpdateTagData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid update_tag payload',
                    payload.data
                );
                return;
            }

            if (!context.existingTagIds.has(payload.data.id)) {
                return;
            }

            const attributes = tagAttributes(payload.data.attributes);

            if (attributes === null) {
                return;
            }

            await mutators.updateTag(
                payload.data.id,
                attributes,
                historyOptions
            );
            return;
        }

        case 'remove_tags': {
            if (!validateRemoveTagsData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid remove_tags payload',
                    payload.data
                );
                return;
            }

            await mutators.removeTags(payload.data.tagIds, historyOptions);
            return;
        }

        case 'add_tag_assignments': {
            if (!validateAddTagAssignmentsData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid add_tag_assignments payload',
                    payload.data
                );
                return;
            }

            const seenIds = new Set(context.existingAssignmentIds);
            const seenKeys = new Set(context.existingAssignmentKeys);
            const assignments = payload.data.assignments.filter(
                (assignment) => {
                    const key = tagAssignmentKey(assignment);

                    if (
                        seenIds.has(assignment.id) ||
                        seenKeys.has(key) ||
                        !context.existingTagIds.has(assignment.tagId) ||
                        !assignmentTargetExists(assignment, context)
                    ) {
                        return false;
                    }

                    seenIds.add(assignment.id);
                    seenKeys.add(key);
                    return true;
                }
            );

            if (assignments.length === 0) {
                return;
            }

            await mutators.addTagAssignments(assignments, historyOptions);
            return;
        }

        case 'remove_tag_assignments': {
            if (!validateRemoveTagAssignmentsData(payload.data)) {
                console.warn(
                    '[DiagramOperation] Invalid remove_tag_assignments payload',
                    payload.data
                );
                return;
            }

            await mutators.removeTagAssignments(
                payload.data.assignmentIds,
                historyOptions
            );
            return;
        }
    }
};
