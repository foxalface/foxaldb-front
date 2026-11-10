export type SessionEndReason =
    | 'explicit-logout'
    | 'session-expired'
    | 'account-closed';

export type SessionEndScope = 'device' | 'online' | 'unscoped';
