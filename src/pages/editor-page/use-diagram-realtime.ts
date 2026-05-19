import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { getEcho } from '@/lib/realtime/echo';
import { useEffect } from 'react';

const isValidBackendDiagramId = (id: unknown): id is string | number => {
    if (typeof id === 'number') {
        return Number.isInteger(id) && id > 0;
    }

    if (typeof id === 'string') {
        return /^\d+$/.test(id);
    }

    return false;
};

interface DiagramTestPayload {
    message: string;
    sentAt: string;
    userId: number;
}

export const useDiagramRealtime = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }
        const echo = getEcho();

        if (echo === null) {
            return;
        }

        let channel: ReturnType<typeof echo.private> | null = null;

        const handleDiagramTest = (payload: DiagramTestPayload): void => {
            console.log('[DiagramTest]', payload);
        };

        try {
            channel = echo.private(`diagram.${diagramId}`);
            channel
                .listen('.DiagramTest', handleDiagramTest)
                .error((error: unknown) => {
                    console.warn(
                        `[DiagramRealtime] channel error (diagram.${diagramId})`,
                        error
                    );
                });
        } catch (error) {
            console.warn(
                `[DiagramRealtime] failed to subscribe (diagram.${diagramId})`,
                error
            );
            return;
        }

        return () => {
            try {
                channel?.stopListening('.DiagramTest', handleDiagramTest);
                echo.leave(`diagram.${diagramId}`);
            } catch (error) {
                console.warn(
                    `[DiagramRealtime] failed to cleanup (diagram.${diagramId})`,
                    error
                );
            }
        };
    }, [isLoading, isAuthenticated, diagramId]);
};
