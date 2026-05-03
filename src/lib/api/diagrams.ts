import { apiRequest } from './client';

export interface DiagramApiResource {
    id: number | string;
    name: string;
    content?: unknown;
    tables_count?: number;
    database_type?: string;
    database_edition?: string | null;
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface DiagramPayload {
    name: string;
    content: unknown;
}

interface GetDiagramsResponse {
    data: DiagramApiResource[];
}

interface CreateDiagramResponse {
    diagram: {
        id: number | string;
    };
}

export const getDiagrams = async (): Promise<DiagramApiResource[]> => {
    const response = await apiRequest<GetDiagramsResponse>('/diagrams');
    return response.data;
};

export const getDiagram = async (id: string): Promise<DiagramApiResource> => {
    return apiRequest<DiagramApiResource>(`/diagrams/${id}`);
};

export const createDiagram = async (
    data: DiagramPayload
): Promise<CreateDiagramResponse> => {
    return apiRequest<CreateDiagramResponse>('/diagrams', {
        method: 'POST',
        data,
    });
};

export const updateDiagram = async (
    id: string,
    data: DiagramPayload
): Promise<DiagramApiResource> => {
    return apiRequest<DiagramApiResource>(`/diagrams/${id}`, {
        method: 'PUT',
        data,
    });
};
