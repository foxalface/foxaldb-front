import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AuthUser } from '@/lib/api/auth';
import type { DiagramMemberResource } from '@/lib/api/diagram-members';
import { ShareMemberList } from './share-member-list';
import { ShareAddMemberForm } from './share-add-member-form';

export interface ShareCollaboratorsTabProps {
    diagramId: string;
    owner: AuthUser;
    members: DiagramMemberResource[];
    onMembersChange: (members: DiagramMemberResource[]) => void;
    onMemberAdded: (member: DiagramMemberResource) => void;
}

export const ShareCollaboratorsTab: React.FC<ShareCollaboratorsTabProps> = ({
    diagramId,
    owner,
    members,
    onMembersChange,
    onMemberAdded,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                {t('side_panel.share_section.collaborators.description')}
            </p>
            <ShareMemberList
                diagramId={diagramId}
                owner={owner}
                members={members}
                onMembersChange={onMembersChange}
            />
            <ShareAddMemberForm
                diagramId={diagramId}
                onMemberAdded={onMemberAdded}
            />
        </div>
    );
};
