type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export const registerSessionExpiredHandler = (
    handler: SessionExpiredHandler
): (() => void) => {
    sessionExpiredHandler = handler;

    return () => {
        if (sessionExpiredHandler === handler) {
            sessionExpiredHandler = null;
        }
    };
};

export const notifySessionExpired = (): void => {
    sessionExpiredHandler?.();
};
