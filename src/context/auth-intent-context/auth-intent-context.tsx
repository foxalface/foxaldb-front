import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import { noneAuthIntent, type AuthIntent } from '@/lib/auth-intent';

export interface AuthIntentContextValue {
    /** Pending intent set before authentication is requested. */
    pendingIntent: AuthIntent;
    setAuthIntent: (intent: AuthIntent) => void;
    peekAuthIntent: () => AuthIntent;
    clearAuthIntent: () => void;
    /**
     * Intent consumed exactly once after the latest guest → authenticated transition.
     * A3 executes continuation from this value.
     */
    lastConsumedIntent: AuthIntent;
}

export const AuthIntentContext = createContext<AuthIntentContextValue>({
    pendingIntent: noneAuthIntent(),
    setAuthIntent: emptyFn,
    peekAuthIntent: () => noneAuthIntent(),
    clearAuthIntent: emptyFn,
    lastConsumedIntent: noneAuthIntent(),
});
