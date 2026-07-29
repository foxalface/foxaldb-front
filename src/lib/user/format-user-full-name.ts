export const UNKNOWN_USER_DISPLAY_NAME = 'Unknown user';

export const formatUserFullName = (
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    fallback: string = UNKNOWN_USER_DISPLAY_NAME
): string => {
    const first = (firstName ?? '').trim();
    const last = (lastName ?? '').trim();

    if (first.length > 0 && last.length > 0) {
        return `${first} ${last}`;
    }

    if (first.length > 0) {
        return first;
    }

    if (last.length > 0) {
        return last;
    }

    return fallback;
};
