import { useMemo } from 'react';

export const getBrowserTimeZone = (): string => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
    } catch {
        return 'UTC';
    }
};

export const useUserTimeZone = (): string =>
    useMemo(() => getBrowserTimeZone(), []);
