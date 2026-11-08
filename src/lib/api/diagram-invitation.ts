import { ApiError, apiRequest } from './client';

export type InvitationStatus = 'valid' | 'expired' | 'revoked' | 'accepted';

export interface ValidInvitationInspection {
    status: 'valid';
    email: string;
    diagramName: string;
    role: 'editor' | 'viewer';
    inviterDisplayName: string;
    expiresAt: string;
}

export interface ClosedInvitationInspection {
    status: 'expired' | 'revoked' | 'accepted';
}

export type InvitationInspection =
    | ValidInvitationInspection
    | ClosedInvitationInspection;

export interface InvitationAcceptance {
    status: 'accepted';
    diagramId: number;
    role: string;
}

interface InvitationInspectionDto {
    status: InvitationStatus;
    email?: string;
    diagram_name?: string;
    role?: string;
    inviter_display_name?: string;
    expires_at?: string;
}

interface InvitationAcceptanceDto {
    status: 'accepted';
    diagram_id: number;
    role: string;
}

export const inspectInvitation = async (
    token: string
): Promise<InvitationInspection> => {
    const response = await apiRequest<InvitationInspectionDto>(
        `/invitations/${encodeURIComponent(token)}`
    );

    if (response.status !== 'valid') {
        return { status: response.status };
    }

    if (
        response.email === undefined ||
        response.diagram_name === undefined ||
        (response.role !== 'editor' && response.role !== 'viewer') ||
        response.inviter_display_name === undefined ||
        response.expires_at === undefined
    ) {
        throw new ApiError('Invalid invitation response', 500, response);
    }

    return {
        status: 'valid',
        email: response.email,
        diagramName: response.diagram_name,
        role: response.role,
        inviterDisplayName: response.inviter_display_name,
        expiresAt: response.expires_at,
    };
};

export const acceptInvitation = async (
    token: string
): Promise<InvitationAcceptance> => {
    const response = await apiRequest<InvitationAcceptanceDto>(
        `/invitations/${encodeURIComponent(token)}/accept`,
        { method: 'POST' }
    );

    return {
        status: 'accepted',
        diagramId: response.diagram_id,
        role: response.role,
    };
};

export const invitationErrorCode = (error: unknown): string | null => {
    if (!(error instanceof ApiError) || typeof error.payload !== 'object') {
        return null;
    }

    if (error.payload === null || !('code' in error.payload)) {
        return null;
    }

    const code = error.payload.code;
    return typeof code === 'string' ? code : null;
};
