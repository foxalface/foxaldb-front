export const isApplyingRemoteRef = { current: false };

export const remoteSyncDepthRef = { current: 0 };

export const outboundReplayDepthRef = { current: 0 };

export const isRemoteSyncActive = (): boolean => remoteSyncDepthRef.current > 0;

export const isOutboundReplayActive = (): boolean =>
    outboundReplayDepthRef.current > 0;

export const runWithoutOutboundReplay = async <T>(
    fn: () => T | Promise<T>
): Promise<T> => {
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
