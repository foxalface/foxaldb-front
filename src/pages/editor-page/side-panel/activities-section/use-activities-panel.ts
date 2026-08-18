import { useCallback, useEffect, useState } from 'react';
import {
    listDiagramActivities,
    type DiagramActivityResource,
} from '@/lib/api/diagram-activities';

export type ActivitiesPanelStatus = 'idle' | 'loading' | 'error' | 'success';

interface UseActivitiesPanelResult {
    activities: DiagramActivityResource[];
    status: ActivitiesPanelStatus;
    isRetrying: boolean;
    handleRetry: () => void;
}

export const useActivitiesPanel = (
    diagramId: string | undefined
): UseActivitiesPanelResult => {
    const [activities, setActivities] = useState<DiagramActivityResource[]>([]);
    const [status, setStatus] = useState<ActivitiesPanelStatus>('idle');
    const [isRetrying, setIsRetrying] = useState(false);

    const fetchActivities = useCallback(async () => {
        if (diagramId === undefined) {
            setActivities([]);
            setStatus('idle');
            return;
        }

        setStatus((currentStatus) =>
            currentStatus === 'success' ? currentStatus : 'loading'
        );

        try {
            const data = await listDiagramActivities(diagramId);
            setActivities(data);
            setStatus('success');
        } catch {
            setActivities([]);
            setStatus('error');
        }
    }, [diagramId]);

    useEffect(() => {
        void fetchActivities();
    }, [fetchActivities]);

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        void fetchActivities().finally(() => {
            setIsRetrying(false);
        });
    }, [fetchActivities]);

    return {
        activities,
        status,
        isRetrying,
        handleRetry,
    };
};
