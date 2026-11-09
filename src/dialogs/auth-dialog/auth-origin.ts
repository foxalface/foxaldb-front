/**
 * Presentation context for the editor auth dialog.
 * Not an AuthIntent: no tokens, diagram payloads, or session secrets.
 * Invitation routes do not use this value; the invitation URL is their context.
 *
 * `forgot` is intentionally absent until ONB1B adds that step in place.
 */
export type AuthOrigin =
    | 'entry'
    | 'protected-action'
    | 'session-recovery'
    | 'navbar';

export type AuthStep = 'welcome' | 'login' | 'register';

/** Where Register's Back action returns. Not a history stack. */
export type AuthRegisterReturnTo = 'welcome' | 'login';
