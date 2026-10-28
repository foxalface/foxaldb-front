import React from 'react';
import { DiagramRoleIcon } from '@/components/diagram-role-icon/diagram-role-icon';
import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useOnlineDiagramId } from '@/hooks/use-diagram-location';
import { useTranslation } from 'react-i18next';

export interface DiagramAccessRoleIndicatorProps {
    compact?: boolean;
}

export const DiagramAccessRoleIndicator: React.FC<
    DiagramAccessRoleIndicatorProps
> = ({ compact = false }) => {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const onlineDiagramId = useOnlineDiagramId();

    if (!isAuthenticated || onlineDiagramId === null || !diagramAccess?.role) {
        return null;
    }

    return (
        <div className="flex items-center gap-1.5">
            <DiagramRoleIcon role={diagramAccess.role} />
            {diagramAccess.role === 'viewer' && !compact ? (
                <span className="text-xs text-muted-foreground">
                    {t('editor_role.view_only')}
                </span>
            ) : null}
        </div>
    );
};
