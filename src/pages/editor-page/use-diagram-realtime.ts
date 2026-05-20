import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useStorage } from '@/hooks/use-storage';
import { getClientId } from '@/lib/realtime/client-id';
import { getEcho } from '@/lib/realtime/echo';
import {
    applyRemoteDiagramOperation,
    isDiagramOperationAction,
    type DiagramOperationPayload,
} from '@/lib/realtime/diagram-operations';
import {
    isApplyingRemoteRef,
    remoteSyncDepthRef,
} from '@/lib/realtime/diagram-sync-state';
import { useEffect, useRef } from 'react';

const isValidBackendDiagramId = (id: unknown): id is string | number => {
    if (typeof id === 'number') {
        return Number.isInteger(id) && id > 0;
    }

    if (typeof id === 'string') {
        return /^\d+$/.test(id);
    }

    return false;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

interface DiagramTestPayload {
    message: string;
    sentAt: string;
    userId: number;
}

const parseDiagramOperationPayload = (
    payload: unknown
): DiagramOperationPayload | null => {
    if (!isRecord(payload)) {
        return null;
    }

    const { action, data, userId, clientId, sentAt } = payload;

    if (
        typeof action !== 'string' ||
        !isDiagramOperationAction(action) ||
        !isRecord(data) ||
        typeof userId !== 'number' ||
        typeof clientId !== 'string' ||
        typeof sentAt !== 'string'
    ) {
        return null;
    }

    return {
        action,
        data: data as DiagramOperationPayload['data'],
        userId,
        clientId,
        sentAt,
    };
};

export const useDiagramRealtime = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { getTable: getTableFromStorage } = useStorage();
    const { currentDiagram, tables, addTables, updateTable, removeTables } =
        useChartDB();

    const existingTableIdsRef = useRef<ReadonlySet<string>>(new Set());
    existingTableIdsRef.current = new Set(tables.map((table) => table.id));

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

        const handleDiagramOperation = (payload: unknown): void => {
            const parsedPayload = parseDiagramOperationPayload(payload);

            if (parsedPayload === null) {
                console.warn(
                    '[DiagramOperation] Invalid operation payload',
                    payload
                );
                return;
            }

            if (parsedPayload.clientId === getClientId()) {
                return;
            }

            isApplyingRemoteRef.current = true;
            remoteSyncDepthRef.current += 1;

            void applyRemoteDiagramOperation(
                parsedPayload,
                {
                    addTables,
                    updateTable,
                    removeTables,
                },
                {
                    existingTableIds: existingTableIdsRef.current,
                    getTableFromStorage: (tableId: string) =>
                        getTableFromStorage({
                            diagramId,
                            id: tableId,
                        }),
                }
            )
                .catch((error: unknown) => {
                    console.warn(
                        '[DiagramOperation] Failed to apply operation',
                        error
                    );
                })
                .finally(() => {
                    remoteSyncDepthRef.current = Math.max(
                        0,
                        remoteSyncDepthRef.current - 1
                    );
                    isApplyingRemoteRef.current = false;
                });
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
        getTableFromStorage,
    ]);
};
