import { useCallback, useEffect, useState } from 'react';
import {
    listDiagramMembers,
    type DiagramMemberResource,
} from '@/lib/api/diagram-members';
import {
    listDiagramInvitations,
    type DiagramInvitationResource,
} from '@/lib/api/diagram-invitations';

export type SharePanelStatus = 'idle' | 'loading' | 'error' | 'success';

interface UseSharePanelResult {
    members: DiagramMemberResource[];
    invitations: DiagramInvitationResource[];
    status: SharePanelStatus;
    invitationsStatus: SharePanelStatus;
    isRetrying: boolean;
    handleRetry: () => void;
    refreshSharing: () => Promise<void>;
    handleMembersChange: (members: DiagramMemberResource[]) => void;
    handleInvitationsChange: (invitations: DiagramInvitationResource[]) => void;
}

export const useSharePanel = (
    diagramId: string | undefined
): UseSharePanelResult => {
    const [members, setMembers] = useState<DiagramMemberResource[]>([]);
    const [invitations, setInvitations] = useState<DiagramInvitationResource[]>(
        []
    );
    const [status, setStatus] = useState<SharePanelStatus>('idle');
    const [invitationsStatus, setInvitationsStatus] =
        useState<SharePanelStatus>('idle');
    const [isRetrying, setIsRetrying] = useState(false);

    const fetchSharing = useCallback(async () => {
        if (diagramId === undefined) {
            setMembers([]);
            setInvitations([]);
            setStatus('idle');
            setInvitationsStatus('idle');
            return;
        }

        setStatus((currentStatus) =>
            currentStatus === 'success' ? currentStatus : 'loading'
        );
        setInvitationsStatus((currentStatus) =>
            currentStatus === 'success' ? currentStatus : 'loading'
        );

        const [membersResult, invitationsResult] = await Promise.allSettled([
            listDiagramMembers(diagramId),
            listDiagramInvitations(diagramId),
        ]);

        if (membersResult.status === 'fulfilled') {
            setMembers(membersResult.value);
            setStatus('success');
        } else {
            setMembers([]);
            setStatus('error');
        }

        if (invitationsResult.status === 'fulfilled') {
            setInvitations(invitationsResult.value);
            setInvitationsStatus('success');
        } else {
            setInvitations([]);
            setInvitationsStatus('error');
        }
    }, [diagramId]);

    useEffect(() => {
        void fetchSharing();
    }, [fetchSharing]);

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        void fetchSharing().finally(() => {
            setIsRetrying(false);
        });
    }, [fetchSharing]);

    const handleMembersChange = useCallback(
        (nextMembers: DiagramMemberResource[]) => {
            setMembers(nextMembers);
        },
        []
    );

    const handleInvitationsChange = useCallback(
        (nextInvitations: DiagramInvitationResource[]) => {
            setInvitations(nextInvitations);
        },
        []
    );

    return {
        members,
        invitations,
        status,
        invitationsStatus,
        isRetrying,
        handleRetry,
        refreshSharing: fetchSharing,
        handleMembersChange,
        handleInvitationsChange,
    };
};
