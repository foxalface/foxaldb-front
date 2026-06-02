import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { getEcho } from '@/lib/realtime/echo';
import { useEffect, useState } from 'react';

export interface DiagramPresenceState {
    viewerCount: number;
    isPresenceActive: boolean;
}

export const useDiagramPresence = (): DiagramPresenceState => {
    const { isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const [viewerCount, setViewerCount] = useState(0);
    const [isPresenceActive, setIsPresenceActive] = useState(false);

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            setViewerCount(0);
            setIsPresenceActive(false);
            return;
        }

        const echo = getEcho();

        if (echo === null) {
            setViewerCount(0);
            setIsPresenceActive(false);
            return;
        }

        const channel = echo.join(`diagram.${diagramId}`);

        channel
            .here((members: unknown[]) => {
                const count = Array.isArray(members) ? members.length : 0;
                setViewerCount(count);
                setIsPresenceActive(true);
            })
            .joining(() => {
                setViewerCount((count) => count + 1);
            })
            .leaving(() => {
                setViewerCount((count) => Math.max(0, count - 1));
            })
            .error((error: unknown) => {
                console.warn(
                    `[DiagramPresence] channel error (diagram.${diagramId})`,
                    error
                );
                setIsPresenceActive(false);
            });

        return () => {
            setViewerCount(0);
            setIsPresenceActive(false);

            try {
                echo.leave(`diagram.${diagramId}`);
            } catch (error: unknown) {
                console.warn(
                    `[DiagramPresence] failed to leave (diagram.${diagramId})`,
                    error
                );
            }
        };
    }, [isLoading, isAuthenticated, diagramId]);

    return { viewerCount, isPresenceActive };
};
