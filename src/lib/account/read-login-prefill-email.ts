export const readLoginPrefillEmail = (state: unknown): string => {
    if (typeof state !== 'object' || state === null || !('email' in state)) {
        return '';
    }

    const email = (state as { email?: unknown }).email;

    return typeof email === 'string' ? email : '';
};
