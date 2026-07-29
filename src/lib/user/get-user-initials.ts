export const UNKNOWN_USER_INITIALS = '?';

const getFirstGrapheme = (value: string): string => {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
        return '';
    }

    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
        const segmenter = new Intl.Segmenter(undefined, {
            granularity: 'grapheme',
        });
        const iterator = segmenter.segment(trimmed)[Symbol.iterator]();
        const first = iterator.next();

        if (first.done) {
            return '';
        }

        return first.value.segment;
    }

    return [...trimmed][0] ?? '';
};

export const getUserInitials = (
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    fallback: string = UNKNOWN_USER_INITIALS
): string => {
    const firstInitial = getFirstGrapheme(firstName ?? '');
    const lastInitial = getFirstGrapheme(lastName ?? '');

    if (firstInitial.length > 0 && lastInitial.length > 0) {
        return `${firstInitial}${lastInitial}`.toLocaleUpperCase();
    }

    if (firstInitial.length > 0) {
        return firstInitial.toLocaleUpperCase();
    }

    if (lastInitial.length > 0) {
        return lastInitial.toLocaleUpperCase();
    }

    return fallback;
};
