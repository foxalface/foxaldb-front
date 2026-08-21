import React from 'react';
import type { DiagramAccessRole } from '@/lib/api/diagrams';
import type { DiagramMemberRole } from '@/lib/api/diagram-members';
import { DiagramRoleIcon } from '@/components/diagram-role-icon/diagram-role-icon';

type RoleBadgeValue = DiagramAccessRole | DiagramMemberRole;

export interface DiagramRoleBadgeProps {
    role: RoleBadgeValue;
}

/** Backward-compatible alias for DiagramRoleIcon */
export const DiagramRoleBadge: React.FC<DiagramRoleBadgeProps> = ({ role }) => (
    <DiagramRoleIcon role={role} />
);
