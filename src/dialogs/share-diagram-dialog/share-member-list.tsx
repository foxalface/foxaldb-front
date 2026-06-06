import React, { useCallback, useState } from 'react';
import { Button } from '@/components/button/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import {
    DIAGRAM_MEMBER_ROLE_EDITOR,
    DIAGRAM_MEMBER_ROLE_VIEWER,
    removeDiagramMember,
    updateDiagramMember,
    type DiagramMemberResource,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';
import type { AuthUser } from '@/lib/api/auth';
import { useTranslation } from 'react-i18next';
import { DiagramRoleBadge } from '@/components/diagram-role-badge/diagram-role-badge';

export interface ShareMemberListProps {
    diagramId: string;
    owner: AuthUser;
    members: DiagramMemberResource[];
    onMembersChange: (members: DiagramMemberResource[]) => void;
}

export const ShareMemberList: React.FC<ShareMemberListProps> = ({
    diagramId,
    owner,
    members,
    onMembersChange,
}) => {
    const { t } = useTranslation();
    const [busyMemberId, setBusyMemberId] = useState<number | null>(null);

    const handleRoleChange = useCallback(
        async (member: DiagramMemberResource, role: DiagramMemberRole) => {
            if (member.role === role) {
                return;
            }

            setBusyMemberId(member.id);
            try {
                const updated = await updateDiagramMember(
                    diagramId,
                    member.id,
                    { role }
                );
                onMembersChange(
                    members.map((item) =>
                        item.id === member.id ? updated : item
                    )
                );
            } catch {
                // Keep previous role on failure
            } finally {
                setBusyMemberId(null);
            }
        },
        [diagramId, members, onMembersChange]
    );

    const handleRemove = useCallback(
        async (memberId: number) => {
            setBusyMemberId(memberId);
            try {
                await removeDiagramMember(diagramId, memberId);
                onMembersChange(members.filter((item) => item.id !== memberId));
            } catch {
                // Keep list unchanged on failure
            } finally {
                setBusyMemberId(null);
            }
        },
        [diagramId, members, onMembersChange]
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{owner.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                            {owner.email}
                        </p>
                    </div>
                    <DiagramRoleBadge role="owner" />
                </div>
            </div>

            {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('share_diagram_dialog.empty_members')}
                </p>
            ) : (
                members.map((member) => (
                    <div
                        key={member.id}
                        className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                                {member.user.name}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                                {member.user.email}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={member.role}
                                onValueChange={(value) =>
                                    void handleRoleChange(
                                        member,
                                        value as DiagramMemberRole
                                    )
                                }
                                disabled={busyMemberId === member.id}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value={DIAGRAM_MEMBER_ROLE_EDITOR}
                                    >
                                        {t('share_diagram_dialog.roles.editor')}
                                    </SelectItem>
                                    <SelectItem
                                        value={DIAGRAM_MEMBER_ROLE_VIEWER}
                                    >
                                        {t('share_diagram_dialog.roles.viewer')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <DiagramRoleBadge role={member.role} />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={busyMemberId === member.id}
                                onClick={() => void handleRemove(member.id)}
                            >
                                {t('share_diagram_dialog.remove')}
                            </Button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
