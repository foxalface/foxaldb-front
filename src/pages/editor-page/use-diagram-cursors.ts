import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import {
    shouldSendCursorUpdate,
    type FlowPosition,
    isTouchPrimaryDevice,
} from '@/lib/realtime/cursor-send-utils';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { CursorWhisperPayload } from '@/lib/realtime/cursor-types';
import { useReactFlow } from '@xyflow/react';
import { useEffect, useRef, type RefObject } from 'react';

const logCursorSend = (payload: CursorWhisperPayload): void => {
    if (import.meta.env.DEV) {
        console.log('[DiagramCursor] send', payload);
    }
};

export const useDiagramCursors = (
    canvasRef: RefObject<HTMLDivElement | null>
): void => {
    const { screenToFlowPosition } = useReactFlow();
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { sendCursor } = useRealtime();

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isActive =
        !isLoading && isAuthenticated && diagramId !== null && user !== null;

    const screenToFlowPositionRef = useRef(screenToFlowPosition);
    screenToFlowPositionRef.current = screenToFlowPosition;

    const sendCursorRef = useRef(sendCursor);
    sendCursorRef.current = sendCursor;

    useEffect(() => {
        const canvasElement = canvasRef.current;

        if (
            !isActive ||
            user === null ||
            canvasElement === null ||
            isTouchPrimaryDevice()
        ) {
            return;
        }

        const selfUserId = user.id;
        let isPointerInside = false;
        let pendingClientPosition: { x: number; y: number } | null = null;
        let lastSentPosition: FlowPosition | null = null;
        let lastSentAt = 0;
        let animationFrameId: number | undefined;

        const cancelScheduledFlush = (): void => {
            if (animationFrameId !== undefined) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = undefined;
            }
        };

        const flushCursorUpdate = (): void => {
            animationFrameId = undefined;

            if (
                !isPointerInside ||
                pendingClientPosition === null ||
                document.visibilityState !== 'visible'
            ) {
                return;
            }

            const flowPosition = screenToFlowPositionRef.current(
                pendingClientPosition
            );
            const now = Date.now();

            if (
                !shouldSendCursorUpdate(
                    lastSentPosition,
                    flowPosition,
                    lastSentAt,
                    now
                )
            ) {
                return;
            }

            const payload: CursorWhisperPayload = {
                userId: selfUserId,
                x: flowPosition.x,
                y: flowPosition.y,
            };

            sendCursorRef.current(payload);
            logCursorSend(payload);
            lastSentPosition = flowPosition;
            lastSentAt = now;
        };

        const scheduleFlush = (): void => {
            if (animationFrameId !== undefined) {
                return;
            }

            animationFrameId = requestAnimationFrame(flushCursorUpdate);
        };

        const handleMouseMove = (event: MouseEvent): void => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            pendingClientPosition = {
                x: event.clientX,
                y: event.clientY,
            };
            scheduleFlush();
        };

        const handleMouseEnter = (): void => {
            isPointerInside = true;
        };

        const handleMouseLeave = (): void => {
            isPointerInside = false;
            pendingClientPosition = null;
            cancelScheduledFlush();
        };

        const handleVisibilityChange = (): void => {
            if (document.visibilityState === 'hidden') {
                pendingClientPosition = null;
                cancelScheduledFlush();
            }
        };

        canvasElement.addEventListener('mousemove', handleMouseMove);
        canvasElement.addEventListener('mouseenter', handleMouseEnter);
        canvasElement.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            canvasElement.removeEventListener('mousemove', handleMouseMove);
            canvasElement.removeEventListener('mouseenter', handleMouseEnter);
            canvasElement.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
            cancelScheduledFlush();
        };
    }, [canvasRef, isActive, user]);
};
