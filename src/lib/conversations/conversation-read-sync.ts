/**
 * Read-boundary helpers for unread synchronization across HTTP, websocket,
 * reconnect, and multi-tab races. Message ids are monotonic per conversation.
 */

export const shouldApplyReadReconciliation = (
    storedBoundary: number | null | undefined,
    incomingBoundary: number | null
): boolean => {
    if (storedBoundary === undefined) {
        return true;
    }

    if (incomingBoundary === null) {
        return storedBoundary === null;
    }

    if (storedBoundary === null) {
        return true;
    }

    return incomingBoundary >= storedBoundary;
};

export const shouldIncrementUnreadForMessage = (
    readBoundary: number | null | undefined,
    incrementHighWaterMark: number | undefined,
    messageId: number
): boolean => {
    if (readBoundary !== undefined && readBoundary !== null) {
        if (messageId <= readBoundary) {
            return false;
        }
    }

    if (
        incrementHighWaterMark !== undefined &&
        messageId <= incrementHighWaterMark
    ) {
        return false;
    }

    return true;
};

export const nextUnreadIncrementHighWaterMark = (
    current: number | undefined,
    messageId: number
): number => (current === undefined ? messageId : Math.max(current, messageId));

export const nextReadBoundary = (
    current: number | null | undefined,
    incoming: number | null
): number | null => {
    if (incoming === null) {
        return incoming;
    }

    if (current === undefined || current === null) {
        return incoming;
    }

    return Math.max(current, incoming);
};
