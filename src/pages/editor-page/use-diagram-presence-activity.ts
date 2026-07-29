import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { useEffect, useRef } from 'react';

export const useDiagramPresenceActivity = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { sendPresenceActivity } = useRealtime();
    const lastActiveRef = useRef<boolean | null>(null);

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        const publishActivity = (active: boolean): void => {
            if (lastActiveRef.current === active) {
                return;
            }

            lastActiveRef.current = active;
            sendPresenceActivity(active);
        };

        const handleVisibilityChange = (): void => {
            publishActivity(document.visibilityState === 'visible');
        };

        publishActivity(document.visibilityState === 'visible');
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
            lastActiveRef.current = null;
        };
    }, [diagramId, isAuthenticated, isLoading, sendPresenceActivity]);
};
