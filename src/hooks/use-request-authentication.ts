import { useCallback } from 'react';
import { useDialog } from '@/hooks/use-dialog';
import { useAuthIntent } from '@/hooks/use-auth-intent';
import { isNoneAuthIntent, type AuthIntent } from '@/lib/auth-intent';

/**
 * Sets a one-shot auth intent and opens the auth dialog.
 */
export const useRequestAuthentication = () => {
    const { setAuthIntent } = useAuthIntent();
    const { openAuthDialog } = useDialog();

    return useCallback(
        (intent: AuthIntent) => {
            if (isNoneAuthIntent(intent)) {
                openAuthDialog();
                return;
            }

            setAuthIntent(intent);
            openAuthDialog();
        },
        [setAuthIntent, openAuthDialog]
    );
};
