import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
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
    }, [isAuthenticated, isLoading, syncPendingFromStore]);

    const value = useMemo(
        () => ({
            pendingIntent,
            setAuthIntent,
            peekAuthIntent,
            clearAuthIntent,
            lastConsumedIntent,
        }),
        [
            pendingIntent,
            setAuthIntent,
            peekAuthIntent,
            clearAuthIntent,
            lastConsumedIntent,
        ]
    );

    return (
        <AuthIntentContext.Provider value={value}>
            {children}
        </AuthIntentContext.Provider>
    );
};
