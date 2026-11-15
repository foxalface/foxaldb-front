import { useCallback, useEffect, useRef, useState } from 'react';
import { focusFirstInvalid } from '@/lib/forms/focus-first-invalid-field';

export const usePendingFocus = (): ((element: HTMLElement | null) => void) => {
    const pendingFocusRef = useRef<HTMLElement | null>(null);
    const [focusNonce, setFocusNonce] = useState(0);

    useEffect(() => {
        if (focusNonce === 0) {
            return;
        }

        const target = pendingFocusRef.current;
        pendingFocusRef.current = null;
        focusFirstInvalid(target);
    }, [focusNonce]);

    return useCallback((element: HTMLElement | null) => {
        pendingFocusRef.current = element;
        setFocusNonce((current) => current + 1);
    }, []);
};

export const namedControl = (
    form: HTMLFormElement,
    name: string
): HTMLElement | null => {
    const element = form.elements.namedItem(name);

    return element instanceof HTMLElement ? element : null;
};
