import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
    clearProtectedActionResume,
    createAuthIntentStore,
    noneAuthIntent,
    type AuthIntent,
} from '@/lib/auth-intent';
import { AuthIntentContext } from './auth-intent-context';

/**
 * Single owner for authentication continuation intent.
 * Consumes pending intent once on guest → authenticated transition only.
 *
 * Session end does not consume. The session-end orchestrator calls
 * applySessionEndIntent before the user is cleared so a deliberate reopen
 * intent replaces stale intents without racing this effect. If that
 * preparation did not run, stale intent is cleared when auth ends.
 */
export const AuthIntentProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { isAuthenticated, isLoading } = useAuth();
    const storeRef = useRef(createAuthIntentStore());
    const wasAuthenticatedRef = useRef(false);
    const sessionEndIntentPreparedRef = useRef(false);

    const [pendingIntent, setPendingIntent] =
        useState<AuthIntent>(noneAuthIntent());
    const [lastConsumedIntent, setLastConsumedIntent] =
        useState<AuthIntent>(noneAuthIntent());
    const [consumedIntentEpoch, setConsumedIntentEpoch] = useState(0);

    const syncPendingFromStore = useCallback(() => {
        setPendingIntent(storeRef.current.peek());
    }, []);

    const setAuthIntent = useCallback(
        (intent: AuthIntent) => {
            storeRef.current.set(intent);
            syncPendingFromStore();
        },
        [syncPendingFromStore]
    );

    const peekAuthIntent = useCallback(() => storeRef.current.peek(), []);

    const clearAuthIntent = useCallback(() => {
        storeRef.current.clear();
        clearProtectedActionResume();
        syncPendingFromStore();
    }, [syncPendingFromStore]);

    const applySessionEndIntent = useCallback(
        (intent: AuthIntent) => {
            storeRef.current.set(intent);
            clearProtectedActionResume();
            sessionEndIntentPreparedRef.current = true;
            syncPendingFromStore();
        },
        [syncPendingFromStore]
    );

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            if (!wasAuthenticatedRef.current) {
                return;
            }

            wasAuthenticatedRef.current = false;

            if (!sessionEndIntentPreparedRef.current) {
                storeRef.current.clear();
                clearProtectedActionResume();
            }

            syncPendingFromStore();
            setLastConsumedIntent(noneAuthIntent());
            return;
        }

        sessionEndIntentPreparedRef.current = false;

        if (wasAuthenticatedRef.current) {
            return;
        }

        wasAuthenticatedRef.current = true;
        const consumed = storeRef.current.consume();
        syncPendingFromStore();
        setLastConsumedIntent(consumed);
        setConsumedIntentEpoch((epoch) => epoch + 1);
    }, [isAuthenticated, isLoading, syncPendingFromStore]);

    const value = useMemo(
        () => ({
            pendingIntent,
            setAuthIntent,
            peekAuthIntent,
            clearAuthIntent,
            applySessionEndIntent,
            lastConsumedIntent,
            consumedIntentEpoch,
        }),
        [
            pendingIntent,
            setAuthIntent,
            peekAuthIntent,
            clearAuthIntent,
            applySessionEndIntent,
            lastConsumedIntent,
            consumedIntentEpoch,
        ]
    );

    return (
        <AuthIntentContext.Provider value={value}>
            {children}
        </AuthIntentContext.Provider>
    );
};
