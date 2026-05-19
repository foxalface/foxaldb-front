import type { DiagramOperationRequest } from '@/lib/realtime/diagram-operations';
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

interface DeleteDiagramResponse {
    message: string;
}

interface DuplicateDiagramResponse {
    message: string;
    diagram: {
        id: number | string;
        name: string;
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

export const deleteDiagram = async (
    id: string
): Promise<DeleteDiagramResponse> =>
    apiRequest<DeleteDiagramResponse>(`/diagrams/${id}`, {
        method: 'DELETE',
    });

export const duplicateDiagram = async (
    id: string
): Promise<DuplicateDiagramResponse> =>
    apiRequest<DuplicateDiagramResponse>(`/diagrams/${id}/duplicate`, {
        method: 'POST',
    });

interface PostDiagramOperationResponse {
    message: string;
}

export const postDiagramOperation = async (
    diagramId: string,
    body: DiagramOperationRequest
): Promise<PostDiagramOperationResponse> =>
    apiRequest<PostDiagramOperationResponse>(
        `/diagrams/${diagramId}/operations`,
        {
            method: 'POST',
            data: body,
        }
    );
