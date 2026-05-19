import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { getClientId } from '@/lib/realtime/client-id';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    applyRemoteDiagramOperation,
    isDiagramOperationAction,
    type DiagramOperationData,
    type DiagramOperationPayload,
} from '@/lib/realtime/diagram-operations';
import {
    isApplyingRemoteRef,
    remoteSyncDepthRef,
} from '@/lib/realtime/diagram-sync-state';
import { getEcho } from '@/lib/realtime/echo';
import { useEffect } from 'react';

interface DiagramTestPayload {
    message: string;
    sentAt: string;
    userId: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const parseDiagramOperationPayload = (
    value: unknown
): DiagramOperationPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const action = value.action;
    const data = value.data;
    const userId = value.userId;
    const clientId = value.clientId;
    const sentAt = value.sentAt;

    if (typeof action !== 'string' || !isDiagramOperationAction(action)) {
        return null;
    }

    if (typeof clientId !== 'string') {
        return null;
    }

    if (typeof userId !== 'number') {
        return null;
    }

    if (typeof sentAt !== 'string') {
        return null;
    }

    if (!isRecord(data)) {
        return null;
    }

    return {
        action,
        data: data as DiagramOperationData,
        userId,
        clientId,
        sentAt,
    };
};

export const useDiagramRealtime = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { currentDiagram, addTables, updateTable, removeTables } =
        useChartDB();
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

        const handleDiagramOperation = (rawPayload: unknown): void => {
            const payload = parseDiagramOperationPayload(rawPayload);
            if (payload === null) {
                console.warn('[DiagramOperation] Invalid payload', rawPayload);
                return;
            }

            if (payload.clientId === getClientId()) {
                return;
            }

            void (async () => {
                isApplyingRemoteRef.current = true;
                remoteSyncDepthRef.current += 1;

                try {
                    await applyRemoteDiagramOperation(payload, {
                        addTables,
                        updateTable,
                        removeTables,
                    });
                } catch (error) {
                    console.warn(
                        '[DiagramOperation] Failed to apply operation',
                        error
                    );
                } finally {
                    remoteSyncDepthRef.current -= 1;
                    isApplyingRemoteRef.current = false;
                }
            })();
        };

        try {
            channel = echo.private(`diagram.${diagramId}`);
            channel
                .listen('.DiagramTest', handleDiagramTest)
                .listen('.DiagramOperation', handleDiagramOperation)
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
                channel?.stopListening(
                    '.DiagramOperation',
                    handleDiagramOperation
                );
                echo.leave(`diagram.${diagramId}`);
            } catch (error) {
                console.warn(
                    `[DiagramRealtime] failed to cleanup (diagram.${diagramId})`,
                    error
                );
            }
        };
    }, [
        isLoading,
        isAuthenticated,
        diagramId,
        addTables,
        updateTable,
        removeTables,
    ]);
};
