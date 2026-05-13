import { useCallback } from 'react';

export const useToast = () => {
    const show = useCallback((message: string) => {
        window.dispatchEvent(
            new CustomEvent('app-toast', {
                detail: { message },
            })
        );
    }, []);

    return { show };
};
