import type { SessionEndReason } from './session-end-types';

type SessionEndingHandler = (reason: SessionEndReason) => void;

let sessionEndingHandler: SessionEndingHandler | null = null;

/**
 * Editor session-end orchestrator registration.
 * AuthProvider calls beginSessionEnd synchronously before the user becomes null.
 */
export const registerSessionEndingHandler = (
    handler: SessionEndingHandler
): (() => void) => {
    sessionEndingHandler = handler;

    return () => {
        if (sessionEndingHandler === handler) {
            sessionEndingHandler = null;
        }
    };
};

export const beginSessionEnd = (reason: SessionEndReason): void => {
    sessionEndingHandler?.(reason);
};
