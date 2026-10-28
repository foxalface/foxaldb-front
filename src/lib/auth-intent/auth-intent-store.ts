import { noneAuthIntent, type AuthIntent } from './auth-intent-types';

export interface AuthIntentStore {
    peek: () => AuthIntent;
    set: (intent: AuthIntent) => void;
    consume: () => AuthIntent;
    clear: () => void;
}

/**
 * In-memory auth intent store with one-shot consume semantics.
 * The React provider owns a single instance; tests may create isolated stores.
 */
export const createAuthIntentStore = (
    initial: AuthIntent = noneAuthIntent()
): AuthIntentStore => {
    let current = initial;

    return {
        peek: () => current,
        set: (intent) => {
            current = intent;
        },
        consume: () => {
            const value = current;
            current = noneAuthIntent();
            return value;
        },
        clear: () => {
            current = noneAuthIntent();
        },
    };
};
