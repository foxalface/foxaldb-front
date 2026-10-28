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
     * Replaces pending intent as part of session end, before the user becomes
     * a guest. The logout transition keeps this value and does not consume it.
     */
    applySessionEndIntent: (intent: AuthIntent) => void;
    /**
     * Intent consumed exactly once after the latest guest → authenticated transition.
     * useAuthIntentContinuation is the only executor of this value.
     */
    lastConsumedIntent: AuthIntent;
    /**
     * Increments once per consume, including a consumed `none` intent.
     * 0 means this provider has not consumed an intent yet.
     * The continuation owner keys one-shot execution on this counter so a
     * consumed `none` is distinct from the initial value and Strict Mode
     * cannot run the continuation twice.
     */
    consumedIntentEpoch: number;
}

export const AuthIntentContext = createContext<AuthIntentContextValue>({
    pendingIntent: noneAuthIntent(),
    setAuthIntent: emptyFn,
    peekAuthIntent: () => noneAuthIntent(),
    clearAuthIntent: emptyFn,
    applySessionEndIntent: emptyFn,
    lastConsumedIntent: noneAuthIntent(),
    consumedIntentEpoch: 0,
});
