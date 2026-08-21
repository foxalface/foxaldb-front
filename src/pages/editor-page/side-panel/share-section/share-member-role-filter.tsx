import React, { useCallback, useMemo } from 'react';
import { ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { DiagramRoleIcon } from '@/components/diagram-role-icon/diagram-role-icon';
import { SidePanelTypeFilterHeader } from '@/components/side-panel/side-panel-type-filter-header';
import {
    getTypeFilterCheckboxState,
    getTypeFilterSelectionAfterHeaderToggle,
} from '@/components/side-panel/side-panel-type-filter-utils';
import {
    DIAGRAM_MEMBER_ROLES,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';

export interface ShareMemberRoleFilterProps {
    selectedRoles: ReadonlyArray<DiagramMemberRole>;
    onSelectedRolesChange: (roles: DiagramMemberRole[]) => void;
}

export const ShareMemberRoleFilter: React.FC<ShareMemberRoleFilterProps> = ({
    selectedRoles,
    onSelectedRolesChange,
}) => {
    const { t } = useTranslation();

    const handleToggleRole = useCallback(
        (role: DiagramMemberRole, checked: boolean) => {
            if (checked) {
                onSelectedRolesChange([...selectedRoles, role]);
                return;
            }

            onSelectedRolesChange(
                selectedRoles.filter((selectedRole) => selectedRole !== role)
            );
        },
        [onSelectedRolesChange, selectedRoles]
    );

    const headerCheckedState = useMemo(
        () =>
            getTypeFilterCheckboxState(
                selectedRoles.length,
                DIAGRAM_MEMBER_ROLES.length
            ),
        [selectedRoles.length]
    );

    const handleToggleAll = useCallback(() => {
        onSelectedRolesChange(
            getTypeFilterSelectionAfterHeaderToggle(
                selectedRoles,
                DIAGRAM_MEMBER_ROLES
            )
        );
    }, [onSelectedRolesChange, selectedRoles]);

    const triggerAriaLabel = t(
        'side_panel.share_section.collaborators.role_filter.trigger_aria'
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="secondary"
                    className="h-8 shrink-0 p-2 text-xs"
                    aria-label={triggerAriaLabel}
                >
                    <ListFilter className="h-4" aria-hidden="true" />
                    {t(
                        'side_panel.share_section.collaborators.role_filter.trigger'
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-3">
                <div className="flex flex-col gap-2">
                    <SidePanelTypeFilterHeader
                        label={t(
                            'side_panel.share_section.collaborators.role_filter.label'
                        )}
                        checkedState={headerCheckedState}
                        onCheckedChange={handleToggleAll}
                        checkboxAriaLabel={t('select_all')}
                    />
                    <ul className="flex flex-col gap-1" role="list">
                        {DIAGRAM_MEMBER_ROLES.map((role) => {
                            const isChecked = selectedRoles.includes(role);
                            const roleLabel = t(`diagram_role.${role}`);

                            return (
                                <li key={role}>
                                    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60">
                                        <span className="inline-flex min-w-0 items-center gap-2 text-sm">
                                            <DiagramRoleIcon
                                                role={role}
                                                className="text-muted-foreground"
                                            />
                                            <span className="truncate">
                                                {roleLabel}
                                            </span>
                                        </span>
                                        <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(value) =>
                                                handleToggleRole(
                                                    role,
                                                    value === true
                                                )
                                            }
                                            aria-label={roleLabel}
                                        />
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </PopoverContent>
        </Popover>
    );
};
