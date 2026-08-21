import { apiRequest } from './client';
import { normalizeDiagramMemberFromApi } from './normalize-diagram-member';

export type DiagramMemberRole = 'editor' | 'viewer';

export const DIAGRAM_MEMBER_ROLE_EDITOR: DiagramMemberRole = 'editor';
export const DIAGRAM_MEMBER_ROLE_VIEWER: DiagramMemberRole = 'viewer';

export const DIAGRAM_MEMBER_ROLES: DiagramMemberRole[] = [
    DIAGRAM_MEMBER_ROLE_EDITOR,
    DIAGRAM_MEMBER_ROLE_VIEWER,
];

export interface DiagramMemberUserDto {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
}

export interface DiagramMemberResourceDto {
    id: number;
    user: DiagramMemberUserDto;
    role: DiagramMemberRole;
    created_at: string;
    updated_at: string;
}

export interface DiagramMemberResource {
    id: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
    };
    role: DiagramMemberRole;
    createdAt: string;
    updatedAt: string;
}

interface ListDiagramMembersResponse {
    data: DiagramMemberResourceDto[];
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
    return response.data.map(normalizeDiagramMemberFromApi);
};

export const addDiagramMember = async (
    diagramId: string,
    body: { email: string; role: DiagramMemberRole }
): Promise<DiagramMemberResource> => {
    const dto = await apiRequest<DiagramMemberResourceDto>(
        `/diagrams/${diagramId}/members`,
        {
            method: 'POST',
            data: body,
        }
    );

    return normalizeDiagramMemberFromApi(dto);
};

export const updateDiagramMember = async (
    diagramId: string,
    memberId: number,
    body: { role: DiagramMemberRole }
): Promise<DiagramMemberResource> => {
    const dto = await apiRequest<DiagramMemberResourceDto>(
        `/diagrams/${diagramId}/members/${memberId}`,
        {
            method: 'PATCH',
            data: body,
        }
    );

    return normalizeDiagramMemberFromApi(dto);
};

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
