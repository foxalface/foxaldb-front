export const isApplyingRemoteRef = { current: false };

export const remoteSyncDepthRef = { current: 0 };

export const isRemoteSyncActive = (): boolean => remoteSyncDepthRef.current > 0;

export const syncRemoteApplyState = (): void => {
    isApplyingRemoteRef.current = remoteSyncDepthRef.current > 0;
};
