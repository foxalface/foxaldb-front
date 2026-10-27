import { useAuth } from '@/hooks/use-auth';
import { useOnlineDiagramId } from '@/hooks/use-diagram-location';
import { useRealtime } from '@/hooks/use-realtime';
import { useEffect } from 'react';

export const useDiagramChannelLifecycle = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const diagramId = useOnlineDiagramId();
    const { joinDiagram, leaveDiagram, connectionStatus } = useRealtime();

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        if (connectionStatus !== 'connected') {
            return;
        }

        joinDiagram(diagramId);

        return () => {
            leaveDiagram();
        };
    }, [
        isLoading,
        isAuthenticated,
        diagramId,
        connectionStatus,
        joinDiagram,
        leaveDiagram,
    ]);
};
