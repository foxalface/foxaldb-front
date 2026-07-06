import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import {
    publishLocalDraggingTableIds,
    resetLocalDraggingTableIds,
} from '@/lib/realtime/local-dragging-table-ids-registry';
import { MovementBroadcastController } from '@/lib/realtime/movement-broadcast-controller';
import {
    buildDraggingTableSnapshot,
    buildTablePositionsForIds,
} from '@/lib/realtime/movement-broadcast-utils';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { areMovementSnapshotsEqual } from '@/lib/realtime/movement-send-utils';
import type { MovementWhisperPayload } from '@/lib/realtime/movement-types';
import { useStore, useStoreApi } from '@xyflow/react';
import { useEffect, useRef } from 'react';

const logMovementSend = (payload: MovementWhisperPayload): void => {
    if (import.meta.env.DEV) {
        console.log('[DiagramMovement] send', payload);
    }
};

const selectDraggingTableSnapshot = (state: {
    nodes: ReadonlyArray<{
        id: string;
        type?: string;
        dragging?: boolean;
        position?: {
            x: number;
            y: number;
        };
    }>;
}) => buildDraggingTableSnapshot(state.nodes);

export const useDiagramTableMovementBroadcast = (): void => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { sendMovement } = useRealtime();
    const storeApi = useStoreApi();
    const draggingSnapshot = useStore(
        selectDraggingTableSnapshot,
        areMovementSnapshotsEqual
    );

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isActive =
        !isLoading && isAuthenticated && diagramId !== null && user !== null;

    const sendMovementRef = useRef(sendMovement);
    sendMovementRef.current = sendMovement;

    const controllerRef = useRef<MovementBroadcastController | null>(null);

    useEffect(() => {
        if (!isActive || user === null) {
            controllerRef.current?.reset();
            resetLocalDraggingTableIds();
            controllerRef.current = null;
            return;
        }

        const controller = new MovementBroadcastController({
            selfUserId: user.id,
            sendMovement: (payload) => {
                sendMovementRef.current(payload);
                logMovementSend(payload);
            },
            getEndPositions: (ids) => {
                const { nodes } = storeApi.getState();

                return buildTablePositionsForIds(nodes, ids);
            },
        });

        controllerRef.current = controller;

        return () => {
            controller.dispose();
            controllerRef.current = null;
            resetLocalDraggingTableIds();
        };
    }, [isActive, storeApi, user]);

    useEffect(() => {
        const controller = controllerRef.current;

        if (!isActive || controller === null) {
            return;
        }

        controller.onDraggingSnapshotChange(draggingSnapshot);
        publishLocalDraggingTableIds(controller.getLocalDraggingTableIds());
    }, [draggingSnapshot, isActive]);
};
