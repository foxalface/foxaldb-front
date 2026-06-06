import React from 'react';
import { DiagramRoleBadge } from '@/components/diagram-role-badge/diagram-role-badge';
import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export interface DiagramAccessRoleIndicatorProps {
    compact?: boolean;
}

export const DiagramAccessRoleIndicator: React.FC<
    DiagramAccessRoleIndicatorProps
> = ({ compact = false }) => {
    const { t } = useTranslation();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { isAuthenticated } = useAuth();
    const { diagramAccess } = useDiagramAccess();

    if (
        !isAuthenticated ||
        !diagramId ||
        !isValidBackendDiagramId(diagramId) ||
        !diagramAccess?.role
    ) {
        return null;
    }

    return (
        <div className="flex items-center gap-1.5">
            <DiagramRoleBadge role={diagramAccess.role} />
            {diagramAccess.role === 'viewer' && !compact ? (
                <span className="text-xs text-muted-foreground">
                    {t('editor_role.view_only')}
                </span>
            ) : null}
        </div>
    );
};
