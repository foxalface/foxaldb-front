import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { getDiagram } from '@/lib/api/diagrams';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { getEcho } from '@/lib/realtime/echo';
import {
    isOutboundReplayActive,
    isRemoteSyncActive,
    remoteSyncDepthRef,
    syncRemoteApplyState,
} from '@/lib/realtime/diagram-sync-state';
import { useCallback, useEffect, useRef } from 'react';

const HIDDEN_THRESHOLD_MS = 30_000;
const REFRESH_COOLDOWN_MS = 5_000;

type ConnectionHandler = () => void;

interface PusherConnectionLike {
    bind: (event: string, handler: ConnectionHandler) => void;
    unbind: (event: string, handler?: ConnectionHandler) => void;
}

interface EchoPusherConnector {
    pusher?: {
        connection: PusherConnectionLike;
    };
}

const getPusherConnection = (
    echo: ReturnType<typeof getEcho>
): PusherConnectionLike | null => {
    if (echo === null) {
        return null;
    }

    const connector = echo.connector as EchoPusherConnector;
    return connector.pusher?.connection ?? null;
};

export const useDiagramReconnectRefresh = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { currentDiagram, updateDiagramData } = useChartDB();

    const refreshInFlightRef = useRef(false);
    const lastRefreshAtRef = useRef(0);
    const hiddenAtRef = useRef<number | null>(null);
    const hasConnectedOnceRef = useRef(false);
    const wasDisconnectedRef = useRef(false);

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const refreshDiagramFromBackend = useCallback(async (): Promise<void> => {
        if (diagramId === null) {
            return;
        }

        if (refreshInFlightRef.current) {
            return;
        }

        if (isRemoteSyncActive() || isOutboundReplayActive()) {
            return;
        }

        const now = Date.now();
        if (now - lastRefreshAtRef.current < REFRESH_COOLDOWN_MS) {
            return;
        }

        refreshInFlightRef.current = true;
        lastRefreshAtRef.current = now;

        remoteSyncDepthRef.current += 1;
        syncRemoteApplyState();

        try {
            const raw = await getDiagram(diagramId);
            const diagram = normalizeDiagramFromApi(raw, diagramId);
            await updateDiagramData(diagram, { forceUpdateStorage: true });
        } catch (error: unknown) {
            console.warn(
                '[DiagramReconnect] Failed to refresh diagram from backend',
                error
            );
        } finally {
            remoteSyncDepthRef.current = Math.max(
                0,
                remoteSyncDepthRef.current - 1
            );
            syncRemoteApplyState();
            refreshInFlightRef.current = false;
        }
    }, [diagramId, updateDiagramData]);

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        const echo = getEcho();
        const connection = getPusherConnection(echo);

        if (connection === null) {
            return;
        }

        const handleConnected: ConnectionHandler = () => {
            if (hasConnectedOnceRef.current && wasDisconnectedRef.current) {
                wasDisconnectedRef.current = false;
                void refreshDiagramFromBackend();
            } else {
                hasConnectedOnceRef.current = true;
            }
        };

        const handleDisconnected: ConnectionHandler = () => {
            wasDisconnectedRef.current = true;
        };

        connection.bind('connected', handleConnected);
        connection.bind('disconnected', handleDisconnected);

        return () => {
            connection.unbind('connected', handleConnected);
            connection.unbind('disconnected', handleDisconnected);
        };
    }, [isLoading, isAuthenticated, diagramId, refreshDiagramFromBackend]);

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        const handleVisibilityChange = (): void => {
            if (document.visibilityState === 'hidden') {
                hiddenAtRef.current = Date.now();
                return;
            }

            if (document.visibilityState !== 'visible') {
                return;
            }

            const hiddenAt = hiddenAtRef.current;
            hiddenAtRef.current = null;

            if (hiddenAt === null) {
                return;
            }

            if (Date.now() - hiddenAt < HIDDEN_THRESHOLD_MS) {
                return;
            }

            void refreshDiagramFromBackend();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, [isLoading, isAuthenticated, diagramId, refreshDiagramFromBackend]);
};
