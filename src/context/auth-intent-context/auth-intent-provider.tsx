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
 */
export const AuthIntentProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { isAuthenticated, isLoading } = useAuth();
    const storeRef = useRef(createAuthIntentStore());
    const wasAuthenticatedRef = useRef(false);

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

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            if (wasAuthenticatedRef.current) {
                wasAuthenticatedRef.current = false;
                storeRef.current.clear();
                clearProtectedActionResume();
                syncPendingFromStore();
                setLastConsumedIntent(noneAuthIntent());
            }
            return;
        }

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
            lastConsumedIntent,
            consumedIntentEpoch,
        }),
        [
            pendingIntent,
            setAuthIntent,
            peekAuthIntent,
            clearAuthIntent,
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
