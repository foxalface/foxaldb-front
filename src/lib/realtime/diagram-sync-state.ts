export const isApplyingRemoteRef = { current: false };

export const remoteSyncDepthRef = { current: 0 };

export const outboundReplayDepthRef = { current: 0 };

let clearPendingDiagramOperationSyncTimersCallback: (() => void) | null = null;

export const setClearPendingDiagramOperationSyncTimers = (
    callback: (() => void) | null
): void => {
    clearPendingDiagramOperationSyncTimersCallback = callback;
};

export const isRemoteSyncActive = (): boolean => remoteSyncDepthRef.current > 0;

export const isOutboundReplayActive = (): boolean =>
    outboundReplayDepthRef.current > 0;

export const runWithoutOutboundReplay = async <T>(
    fn: () => T | Promise<T>
): Promise<T> => {
    clearPendingDiagramOperationSyncTimersCallback?.();
    outboundReplayDepthRef.current += 1;
    try {
        return await fn();
    } finally {
        outboundReplayDepthRef.current = Math.max(
            0,
            outboundReplayDepthRef.current - 1
        );
    }
};

export const syncRemoteApplyState = (): void => {
    isApplyingRemoteRef.current = remoteSyncDepthRef.current > 0;
};
