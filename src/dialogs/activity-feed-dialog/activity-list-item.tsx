import React from 'react';
import type { DiagramActivityResource } from '@/lib/api/diagram-activities';
import { formatActivityMessage } from './format-activity-message';
import { getActivityActionIcon } from './get-activity-action-icon';
import { useTranslation } from 'react-i18next';

export interface ActivityListItemProps {
    activity: DiagramActivityResource;
    currentUserId?: number;
}

export const ActivityListItem: React.FC<ActivityListItemProps> = ({
    activity,
    currentUserId,
}) => {
    const { t } = useTranslation();
    const createdAt = new Date(activity.created_at);
    const Icon = getActivityActionIcon(activity.action);

    return (
        <li className="flex gap-3 border-b py-3 last:border-b-0">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
            />
            <div className="min-w-0 flex-1">
                <p className="text-sm">
                    {formatActivityMessage(activity, t, currentUserId)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {Number.isNaN(createdAt.getTime())
                        ? activity.created_at
                        : createdAt.toLocaleString()}
                </p>
            </div>
        </li>
    );
};
