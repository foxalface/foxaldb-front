import type { ChartDBEvent } from '@/context/chartdb-context/chartdb-context';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { postDiagramOperation } from '@/lib/api/diagrams';
import { getClientId } from '@/lib/realtime/client-id';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { DiagramOperationAction } from '@/lib/realtime/diagram-operations';
import { isApplyingRemoteRef } from '@/lib/realtime/diagram-sync-state';
import { useCallback, useEffect, useRef } from 'react';

const UPDATE_TABLE_DEBOUNCE_MS = 120;

type TableSyncChartDBEvent = Extract<
    ChartDBEvent,
    { action: DiagramOperationAction }
>;

const isTableSyncEvent = (
    event: ChartDBEvent
): event is TableSyncChartDBEvent =>
    event.action === 'add_tables' ||
    event.action === 'update_table' ||
    event.action === 'remove_tables';

export const useDiagramOperationSync = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { currentDiagram, events } = useChartDB();

    const updateTableTimeoutsRef = useRef<
        Map<string, ReturnType<typeof setTimeout>>
    >(new Map());

    const handleChartDBEvent = useCallback(
        (event: ChartDBEvent) => {
            if (isLoading || !isAuthenticated) {
                return;
            }

            if (!currentDiagram) {
                return;
            }

            if (!isValidBackendDiagramId(currentDiagram.id)) {
                return;
            }

            if (isApplyingRemoteRef.current) {
                return;
            }

            if (!isTableSyncEvent(event)) {
                return;
            }

            const diagramId = String(currentDiagram.id);

            const postOperation = (): void => {
                void postDiagramOperation(diagramId, {
                    action: event.action,
                    data: event.data,
                    clientId: getClientId(),
                }).catch((error: unknown) => {
                    console.warn(
                        '[DiagramOperation] Failed to post operation',
                        error
                    );
                });
            };

            if (event.action === 'update_table') {
                const tableId = event.data.id;
                const pendingTimeout =
                    updateTableTimeoutsRef.current.get(tableId);

                if (pendingTimeout !== undefined) {
                    clearTimeout(pendingTimeout);
                }

                const timeout = setTimeout(() => {
                    updateTableTimeoutsRef.current.delete(tableId);

                    if (isApplyingRemoteRef.current) {
                        return;
                    }

                    postOperation();
                }, UPDATE_TABLE_DEBOUNCE_MS);

                updateTableTimeoutsRef.current.set(tableId, timeout);
                return;
            }

            postOperation();
        },
        [currentDiagram, isAuthenticated, isLoading]
    );

    events.useSubscription(handleChartDBEvent);

    useEffect(() => {
        const updateTableTimeouts = updateTableTimeoutsRef.current;

        return () => {
            for (const timeout of updateTableTimeouts.values()) {
                clearTimeout(timeout);
            }
            updateTableTimeouts.clear();
        };
    }, []);
};
