import { apiRequest } from './client';

export type DiagramMemberRole = 'editor' | 'viewer';

export const DIAGRAM_MEMBER_ROLE_EDITOR: DiagramMemberRole = 'editor';
export const DIAGRAM_MEMBER_ROLE_VIEWER: DiagramMemberRole = 'viewer';

export interface DiagramMemberUser {
    id: number;
    name: string;
    email: string;
}

export interface DiagramMemberResource {
    id: number;
    user: DiagramMemberUser;
    role: DiagramMemberRole;
    created_at: string;
    updated_at: string;
}

interface ListDiagramMembersResponse {
    data: DiagramMemberResource[];
}

interface DeleteDiagramMemberResponse {
    message: string;
}

export const listDiagramMembers = async (
    diagramId: string
): Promise<DiagramMemberResource[]> => {
    const response = await apiRequest<ListDiagramMembersResponse>(
        `/diagrams/${diagramId}/members`
    );
    return response.data;
};

export const addDiagramMember = async (
    diagramId: string,
    body: { email: string; role: DiagramMemberRole }
): Promise<DiagramMemberResource> =>
    apiRequest<DiagramMemberResource>(`/diagrams/${diagramId}/members`, {
        method: 'POST',
        data: body,
    });

export const updateDiagramMember = async (
    diagramId: string,
    memberId: number,
    body: { role: DiagramMemberRole }
): Promise<DiagramMemberResource> =>
    apiRequest<DiagramMemberResource>(
        `/diagrams/${diagramId}/members/${memberId}`,
        {
            method: 'PATCH',
            data: body,
        }
    );

export const removeDiagramMember = async (
    diagramId: string,
    memberId: number
): Promise<DeleteDiagramMemberResponse> =>
    apiRequest<DeleteDiagramMemberResponse>(
        `/diagrams/${diagramId}/members/${memberId}`,
        {
            method: 'DELETE',
        }
    );
