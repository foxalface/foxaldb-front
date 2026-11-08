import { apiRequest } from './client';
import type { DiagramMemberRole } from './diagram-members';

export type DiagramInvitationStatus = 'pending' | 'expired';

export interface DiagramInvitationResourceDto {
    id: number;
    email: string;
    role: DiagramMemberRole;
    status: DiagramInvitationStatus;
    expires_at: string;
    created_at: string;
    updated_at: string;
}

export interface DiagramInvitationResource {
    id: number;
    email: string;
    role: DiagramMemberRole;
    status: DiagramInvitationStatus;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

interface ListDiagramInvitationsResponse {
    data: DiagramInvitationResourceDto[];
}

const normalizeInvitation = (
    dto: DiagramInvitationResourceDto
): DiagramInvitationResource => ({
    id: dto.id,
    email: dto.email,
    role: dto.role,
    status: dto.status,
    expiresAt: dto.expires_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
});

export const listDiagramInvitations = async (
    diagramId: string
): Promise<DiagramInvitationResource[]> => {
    const response = await apiRequest<ListDiagramInvitationsResponse>(
        `/diagrams/${diagramId}/invitations`
    );

    return response.data.map(normalizeInvitation);
};

export const updateDiagramInvitationRole = async (
    diagramId: string,
    invitationId: number,
    role: DiagramMemberRole
): Promise<DiagramInvitationResource> => {
    const dto = await apiRequest<DiagramInvitationResourceDto>(
        `/diagrams/${diagramId}/invitations/${invitationId}`,
        {
            method: 'PATCH',
            data: { role },
        }
    );

    return normalizeInvitation(dto);
};

export const resendDiagramInvitation = async (
    diagramId: string,
    invitationId: number
): Promise<DiagramInvitationResource> => {
    const dto = await apiRequest<DiagramInvitationResourceDto>(
        `/diagrams/${diagramId}/invitations/${invitationId}/resend`,
        { method: 'POST' }
    );

    return normalizeInvitation(dto);
};

export const revokeDiagramInvitation = async (
    diagramId: string,
    invitationId: number
): Promise<void> => {
    await apiRequest<unknown>(
        `/diagrams/${diagramId}/invitations/${invitationId}`,
        { method: 'DELETE' }
    );
};

export const shareDiagram = async (
    diagramId: string,
    body: { email: string; role: DiagramMemberRole }
): Promise<{ message: string }> =>
    apiRequest<{ message: string }>(`/diagrams/${diagramId}/shares`, {
        method: 'POST',
        data: body,
    });
