import React from 'react';
import { SelectItem } from '@/components/select/select';
import { DiagramRoleIcon } from '@/components/diagram-role-icon/diagram-role-icon';
import {
    DIAGRAM_MEMBER_ROLES,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';
import { useTranslation } from 'react-i18next';

export interface ShareMemberRoleSelectItemsProps {
    roles?: ReadonlyArray<DiagramMemberRole>;
}

export const ShareMemberRoleSelectItems: React.FC<
    ShareMemberRoleSelectItemsProps
> = ({ roles = DIAGRAM_MEMBER_ROLES }) => {
    const { t } = useTranslation();

    return (
        <>
            {roles.map((role) => (
                <SelectItem key={role} value={role}>
                    <span className="inline-flex items-center gap-2">
                        <DiagramRoleIcon role={role} withTooltip={false} />
                        <span>{t(`diagram_role.${role}`)}</span>
                    </span>
                </SelectItem>
            ))}
        </>
    );
};
