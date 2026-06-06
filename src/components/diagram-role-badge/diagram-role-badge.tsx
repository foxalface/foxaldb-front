import React from 'react';
import { Badge } from '@/components/badge/badge';
import { cn } from '@/lib/utils';
import type { DiagramAccessRole } from '@/lib/api/diagrams';
import type { DiagramMemberRole } from '@/lib/api/diagram-members';
import { useTranslation } from 'react-i18next';

type RoleBadgeValue = DiagramAccessRole | DiagramMemberRole;

export interface DiagramRoleBadgeProps {
    role: RoleBadgeValue;
}

export const DiagramRoleBadge: React.FC<DiagramRoleBadgeProps> = ({ role }) => {
    const { t } = useTranslation();

    const label = t(`share_diagram_dialog.roles.${role}`);
    const variant =
        role === 'owner'
            ? 'default'
            : role === 'editor'
              ? 'secondary'
              : 'outline';

    return (
        <Badge
            variant={variant}
            className={cn(
                role === 'viewer' &&
                    'border-muted-foreground/30 bg-muted/40 text-muted-foreground'
            )}
        >
            {label}
        </Badge>
    );
};
