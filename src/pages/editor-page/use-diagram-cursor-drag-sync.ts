import { useAuth } from '@/hooks/use-auth';
import { useOnlineDiagramId } from '@/hooks/use-diagram-location';
import { useRealtime } from '@/hooks/use-realtime';
import {
    computeDragSyncedCursorPosition,
    createDragCursorAnchor,
    type DragCursorAnchor,
} from '@/lib/realtime/cursor-drag-sync-utils';
import {
    getLastPointerFlowPosition,
    trySendCursorUpdate,
} from '@/lib/realtime/cursor-send-state';
import { isTouchPrimaryDevice } from '@/lib/realtime/cursor-send-utils';
import type { CursorWhisperPayload } from '@/lib/realtime/cursor-types';
import { buildDraggingTableSnapshot } from '@/lib/realtime/movement-broadcast-utils';
import { areMovementSnapshotsEqual } from '@/lib/realtime/movement-send-utils';
import type { MovementTablePosition } from '@/lib/realtime/movement-types';
import { useStore } from '@xyflow/react';
import { useEffect, useRef } from 'react';

const logCursorSend = (payload: CursorWhisperPayload): void => {
    if (import.meta.env.DEV) {
        console.log('[DiagramCursor] drag-sync send', payload);
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
}): MovementTablePosition[] => buildDraggingTableSnapshot(state.nodes);

export const useDiagramCursorDragSync = (): void => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const diagramId = useOnlineDiagramId();
    const { sendCursor } = useRealtime();
    const draggingSnapshot = useStore(
        selectDraggingTableSnapshot,
        areMovementSnapshotsEqual
    );

    const isActive =
        !isLoading &&
        isAuthenticated &&
        diagramId !== null &&
        user !== null &&
        !isTouchPrimaryDevice();

    const sendCursorRef = useRef(sendCursor);
    sendCursorRef.current = sendCursor;

    const dragAnchorRef = useRef<DragCursorAnchor | null>(null);
    const animationFrameIdRef = useRef<number | undefined>(undefined);
    const draggingSnapshotRef = useRef(draggingSnapshot);
    draggingSnapshotRef.current = draggingSnapshot;

    useEffect(() => {
        const cancelScheduledFlush = (): void => {
            if (animationFrameIdRef.current !== undefined) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = undefined;
            }
        };

        if (!isActive || user === null) {
            dragAnchorRef.current = null;
            cancelScheduledFlush();
            return;
        }

        const selfUserId = user.id;

        const flushCursorUpdate = (): void => {
            animationFrameIdRef.current = undefined;

            const snapshot = draggingSnapshotRef.current;
            const anchor = dragAnchorRef.current;

            if (snapshot.length === 0 || anchor === null) {
                return;
            }

            if (document.visibilityState !== 'visible') {
                return;
            }

            const cursorPosition = computeDragSyncedCursorPosition(
                snapshot,
                anchor
            );

            if (cursorPosition === null) {
                return;
            }

            trySendCursorUpdate(
                cursorPosition,
                (payload) => {
                    sendCursorRef.current(payload);
                    logCursorSend(payload);
                },
                selfUserId
            );
        };

        const scheduleFlush = (): void => {
            if (animationFrameIdRef.current !== undefined) {
                return;
            }

            animationFrameIdRef.current =
                requestAnimationFrame(flushCursorUpdate);
        };

        if (draggingSnapshot.length === 0) {
            dragAnchorRef.current = null;
            cancelScheduledFlush();
            return;
        }

        if (dragAnchorRef.current === null) {
            dragAnchorRef.current = createDragCursorAnchor(
                draggingSnapshot,
                getLastPointerFlowPosition()
            );
        }

        scheduleFlush();

        return cancelScheduledFlush;
    }, [draggingSnapshot, isActive, user]);
};
