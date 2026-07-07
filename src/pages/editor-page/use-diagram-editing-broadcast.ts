import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { EditingBroadcastController } from '@/lib/realtime/editing-broadcast-controller';
import type {
    EditingItem,
    EditingWhisperPayload,
} from '@/lib/realtime/editing-types';

export interface DiagramEditingBroadcast {
    startEditing: (item: EditingItem) => void;
    updateEditing: (items: EditingItem[]) => void;
    stopEditing: () => void;
}

const logEditingSend = (payload: EditingWhisperPayload): void => {
    if (import.meta.env.DEV) {
        console.log('[DiagramEditing] send', payload);
    }
};

/**
 * Broadcasts local editing awareness (which table/field/relationship the local
 * user is currently editing) to remote collaborators. Emits full snapshots
 * only — never values or keystrokes — and clears editing on teardown, diagram
 * switch, or logout. Committed value sync is handled separately by
 * DiagramOperationEvent and is untouched here.
 */
export const useDiagramEditingBroadcast = (): DiagramEditingBroadcast => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { sendEditing, presence } = useRealtime();

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isActive =
        !isLoading &&
        isAuthenticated &&
        diagramId !== null &&
        user !== null &&
        presence.status === 'active';

    const sendEditingRef = useRef(sendEditing);
    sendEditingRef.current = sendEditing;

    const controllerRef = useRef<EditingBroadcastController | null>(null);

    useEffect(() => {
        if (!isActive || user === null) {
            controllerRef.current?.dispose();
            controllerRef.current = null;
            return;
        }

        const controller = new EditingBroadcastController({
            selfUserId: user.id,
            sendEditing: (payload) => {
                sendEditingRef.current(payload);
                logEditingSend(payload);
            },
        });

        controllerRef.current = controller;

        return () => {
            controller.dispose();
            controllerRef.current = null;
        };
    }, [isActive, user]);

    const startEditing = useCallback((item: EditingItem) => {
        controllerRef.current?.startEditing(item);
    }, []);

    const updateEditing = useCallback((items: EditingItem[]) => {
        controllerRef.current?.updateEditing(items);
    }, []);

    const stopEditing = useCallback(() => {
        controllerRef.current?.stopEditing();
    }, []);

    return useMemo(
        () => ({ startEditing, updateEditing, stopEditing }),
        [startEditing, updateEditing, stopEditing]
    );
};
