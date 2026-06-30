import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { useEffect } from 'react';

export const useDiagramChannelLifecycle = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { joinDiagram, leaveDiagram } = useRealtime();

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        joinDiagram(diagramId);

        return () => {
            leaveDiagram();
        };
    }, [isLoading, isAuthenticated, diagramId, joinDiagram, leaveDiagram]);
};
