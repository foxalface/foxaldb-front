import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Spinner } from '@/components/spinner/spinner';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import {
    listDiagramActivities,
    type DiagramActivityResource,
} from '@/lib/api/diagram-activities';
import { useTranslation } from 'react-i18next';
import { ActivityListItem } from './activity-list-item';

export interface ActivityFeedDialogProps extends BaseDialogProps {
    diagramId: string;
}

export const ActivityFeedDialog: React.FC<ActivityFeedDialogProps> = ({
    dialog,
    diagramId,
}) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { closeActivityFeedDialog } = useDialog();
    const [activities, setActivities] = useState<DiagramActivityResource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);

        try {
            const data = await listDiagramActivities(diagramId);
            setActivities(data);
        } catch {
            setLoadError(t('activity_feed_dialog.errors.load_failed'));
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    }, [diagramId, t]);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        void fetchActivities();
    }, [dialog.open, fetchActivities]);

    if (!user) {
        return null;
    }

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeActivityFeedDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-h-[85vh] max-w-lg flex-col overflow-y-auto"
                showClose
            >
                <DialogHeader>
                    <DialogTitle>{t('activity_feed_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('activity_feed_dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                {loadError ? (
                    <p className="text-sm text-destructive">{loadError}</p>
                ) : null}

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner size="medium" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="space-y-1 py-4">
                        <p className="text-sm text-muted-foreground">
                            {t('activity_feed_dialog.empty')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('activity_feed_dialog.empty_hint')}
                        </p>
                    </div>
                ) : (
                    <ul>
                        {activities.map((activity) => (
                            <ActivityListItem
                                key={activity.id}
                                activity={activity}
                                currentUserId={user.id}
                            />
                        ))}
                    </ul>
                )}
            </DialogContent>
        </Dialog>
    );
};
