import { apiRequest } from './client';

export interface DiagramActivityUser {
    id: number;
    name: string;
    email: string;
}

export type DiagramActivityAction =
    | 'add_tables'
    | 'remove_tables'
    | 'add_field'
    | 'remove_field'
    | 'update_field'
    | 'add_relationships'
    | 'remove_relationships'
    | 'update_relationship'
    | 'add_notes'
    | 'remove_notes'
    | 'add_areas'
    | 'remove_areas'
    | 'add_dependencies'
    | 'remove_dependencies';

export interface DiagramActivityTableSummary {
    id: string;
    name: string;
    isView: boolean;
}

export interface DiagramActivityFieldSummary {
    id: string;
    name: string;
    type: string;
}

export interface AddTablesActivityMetadata {
    tables: DiagramActivityTableSummary[];
}

export interface RemoveTablesActivityMetadata {
    tableIds: string[];
}

export interface AddFieldActivityMetadata {
    tableId: string | null;
    field: DiagramActivityFieldSummary | null;
}

export interface RemoveFieldActivityMetadata {
    tableId: string | null;
    fieldId: string | null;
}

export interface UpdateFieldActivityMetadata {
    tableId: string | null;
    fieldId: string | null;
    attributes: Record<string, unknown>;
}

export interface RelationshipIdsActivityMetadata {
    relationshipIds: string[];
}

export interface UpdateRelationshipActivityMetadata {
    id: string | null;
    attributes: Record<string, unknown>;
}

export interface EntityIdsActivityMetadata {
    noteIds?: string[];
    areaIds?: string[];
    dependencyIds?: string[];
}

export interface DiagramActivityResource {
    id: number;
    diagram_id: number;
    user_id: number | null;
    user: DiagramActivityUser | null;
    action: string;
    metadata: unknown;
    created_at: string;
}

interface ListDiagramActivitiesResponse {
    data: DiagramActivityResource[];
}

export const listDiagramActivities = async (
    diagramId: string
): Promise<DiagramActivityResource[]> => {
    const response = await apiRequest<ListDiagramActivitiesResponse>(
        `/diagrams/${diagramId}/activities`
    );

    return response.data;
};
