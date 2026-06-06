import React from 'react';
import type { DiagramActivityResource } from '@/lib/api/diagram-activities';
import { formatActivityMessage } from './format-activity-message';
import { useTranslation } from 'react-i18next';

export interface ActivityListItemProps {
    activity: DiagramActivityResource;
}

export const ActivityListItem: React.FC<ActivityListItemProps> = ({
    activity,
}) => {
    const { t } = useTranslation();
    const createdAt = new Date(activity.created_at);

    return (
        <li className="border-b py-3 last:border-b-0">
            <p className="text-sm">{formatActivityMessage(activity, t)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
                {Number.isNaN(createdAt.getTime())
                    ? activity.created_at
                    : createdAt.toLocaleString()}
            </p>
        </li>
    );
};
