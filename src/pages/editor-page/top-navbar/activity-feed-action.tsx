import React from 'react';
import { Button } from '@/components/button/button';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ActivityFeedAction: React.FC = () => {
    const { t } = useTranslation();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { isAuthenticated } = useAuth();
    const { openActivityFeedDialog } = useDialog();

    if (!isAuthenticated || !diagramId || !isValidBackendDiagramId(diagramId)) {
        return null;
    }

    return (
        <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
                openActivityFeedDialog({
                    diagramId,
                })
            }
        >
            <History className="mr-1.5 size-4" />
            {t('activity_feed_dialog.activity_button')}
        </Button>
    );
};
