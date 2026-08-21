import React from 'react';
import type { DiagramMemberResource } from '@/lib/api/diagram-members';
import { ShareMemberList } from './share-member-list';

export interface ShareCollaboratorsTabProps {
    diagramId: string;
    members: DiagramMemberResource[];
    onMembersChange: (members: DiagramMemberResource[]) => void;
    onMemberAdded: (member: DiagramMemberResource) => void;
}

export const ShareCollaboratorsTab: React.FC<ShareCollaboratorsTabProps> = ({
    diagramId,
    members,
    onMembersChange,
    onMemberAdded,
}) => {
    return (
        <ShareMemberList
            diagramId={diagramId}
            members={members}
            onMembersChange={onMembersChange}
            onMemberAdded={onMemberAdded}
        />
    );
};
