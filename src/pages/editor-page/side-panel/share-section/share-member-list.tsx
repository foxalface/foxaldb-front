import React, { useCallback, useMemo, useState } from 'react';
import {
    removeDiagramMember,
    updateDiagramMember,
    type DiagramMemberResource,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/input/input';
import { DiagramRoleIcon } from '@/components/diagram-role-icon/diagram-role-icon';
import { SidePanelAddButton } from '@/components/side-panel/side-panel-add-button';
import { ShareMemberActionsPopover } from './share-member-actions-popover';
import { ShareMemberRoleFilter } from './share-member-role-filter';
import { ShareMembersFilterEmptyState } from './share-members-filter-empty-state';
import { ShareAddMemberDialog } from './share-add-member-dialog';
import {
    DEFAULT_SELECTED_MEMBER_ROLES,
    filterShareMembers,
    hasActiveShareMemberFilter,
} from './filter-share-members';

export interface ShareMemberListProps {
    diagramId: string;
    members: DiagramMemberResource[];
    onMembersChange: (members: DiagramMemberResource[]) => void;
    onMemberAdded: (member: DiagramMemberResource) => void;
}

export const ShareMemberList: React.FC<ShareMemberListProps> = ({
    diagramId,
    members,
    onMembersChange,
    onMemberAdded,
}) => {
    const { t } = useTranslation();
    const [busyMemberId, setBusyMemberId] = useState<number | null>(null);
    const [filterText, setFilterText] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<DiagramMemberRole[]>(
        DEFAULT_SELECTED_MEMBER_ROLES
    );
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const filterOptions = useMemo(
        () => ({
            filterText,
            selectedRoles,
        }),
        [filterText, selectedRoles]
    );

    const hasActiveFilter = hasActiveShareMemberFilter(filterOptions);

    const filteredMembers = useMemo(
        () => filterShareMembers(members, filterOptions),
        [members, filterOptions]
    );

    const handleClearFilter = useCallback(() => {
        setFilterText('');
        setSelectedRoles(DEFAULT_SELECTED_MEMBER_ROLES);
    }, []);

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
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 pb-1">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder={t(
                            'side_panel.share_section.collaborators.filter'
                        )}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(event) => setFilterText(event.target.value)}
                    />
                </div>
                <ShareMemberRoleFilter
                    selectedRoles={selectedRoles}
                    onSelectedRolesChange={setSelectedRoles}
                />
                <SidePanelAddButton
                    label={t('share_diagram_dialog.add_member.title')}
                    onClick={() => setIsAddDialogOpen(true)}
                />
            </div>

            {members.length === 0 ? (
                <p className="px-2 text-sm text-muted-foreground">
                    {t('share_diagram_dialog.empty_members')}
                </p>
            ) : filteredMembers.length === 0 && hasActiveFilter ? (
                <ShareMembersFilterEmptyState
                    onClearFilter={handleClearFilter}
                />
            ) : (
                filteredMembers.map((member) => (
                    <div
                        key={member.id}
                        className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                        <div className="flex w-6 shrink-0 items-center justify-center">
                            <DiagramRoleIcon role={member.role} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                                {member.user.fullName}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                                {member.user.email}
                            </p>
                        </div>
                        <ShareMemberActionsPopover
                            member={member}
                            disabled={busyMemberId === member.id}
                            onRoleChange={(role) => {
                                void handleRoleChange(member, role);
                            }}
                            onRemove={() => {
                                void handleRemove(member.id);
                            }}
                        />
                    </div>
                ))
            )}

            <ShareAddMemberDialog
                diagramId={diagramId}
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onMemberAdded={onMemberAdded}
            />
        </div>
    );
};
