import React from 'react';
import type { DiagramMemberResource } from '@/lib/api/diagram-members';
import type { DiagramInvitationResource } from '@/lib/api/diagram-invitations';
import { ShareMemberList } from './share-member-list';

export interface ShareCollaboratorsTabProps {
    diagramId: string;
    members: DiagramMemberResource[];
    invitations: DiagramInvitationResource[];
    invitationsStatus: 'idle' | 'loading' | 'error' | 'success';
    onMembersChange: (members: DiagramMemberResource[]) => void;
    onInvitationsChange: (invitations: DiagramInvitationResource[]) => void;
    onShared: () => void;
}

export const ShareCollaboratorsTab: React.FC<ShareCollaboratorsTabProps> = ({
    diagramId,
    members,
    invitations,
    invitationsStatus,
    onMembersChange,
    onInvitationsChange,
    onShared,
}) => {
    return (
        <ShareMemberList
            diagramId={diagramId}
            members={members}
            invitations={invitations}
            invitationsStatus={invitationsStatus}
            onMembersChange={onMembersChange}
            onInvitationsChange={onInvitationsChange}
            onShared={onShared}
        />
    );
};
