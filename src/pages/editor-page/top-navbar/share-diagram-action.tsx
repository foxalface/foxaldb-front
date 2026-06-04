import React from 'react';
import { Button } from '@/components/button/button';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ShareDiagramAction: React.FC = () => {
    const { t } = useTranslation();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { isAuthenticated } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const { openShareDiagramDialog } = useDialog();

    if (
        !isAuthenticated ||
        !diagramId ||
        !isValidBackendDiagramId(diagramId) ||
        !diagramAccess?.can_manage_members
    ) {
        return null;
    }

    return (
        <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
                openShareDiagramDialog({
                    diagramId,
                })
            }
        >
            {t('share_diagram_dialog.share_button')}
        </Button>
    );
};
