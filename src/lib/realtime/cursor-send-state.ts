import { shouldSendCursorUpdate, type FlowPosition } from './cursor-send-utils';
import type { CursorWhisperPayload } from './cursor-types';

let lastSentPosition: FlowPosition | null = null;
let lastSentAt = 0;
let lastPointerFlowPosition: FlowPosition | null = null;

export const getLastPointerFlowPosition = (): FlowPosition | null =>
    lastPointerFlowPosition;

export const getLastSentCursorPosition = (): FlowPosition | null =>
    lastSentPosition;

export const setLastPointerFlowPosition = (position: FlowPosition): void => {
    lastPointerFlowPosition = position;
};

export const resetCursorSendState = (): void => {
    lastSentPosition = null;
    lastSentAt = 0;
    lastPointerFlowPosition = null;
};

export const trySendCursorUpdate = (
    next: FlowPosition,
    send: (payload: CursorWhisperPayload) => void,
    selfUserId: number,
    now: number = Date.now()
): boolean => {
    if (!shouldSendCursorUpdate(lastSentPosition, next, lastSentAt, now)) {
        return false;
    }

    send({
        userId: selfUserId,
        x: next.x,
        y: next.y,
    });
    lastSentPosition = next;
    lastSentAt = now;

    return true;
};
