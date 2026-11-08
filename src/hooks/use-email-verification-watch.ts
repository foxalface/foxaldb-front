import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { resendVerificationEmail } from '@/lib/api/auth';
import { useAuth } from '@/hooks/use-auth';

const RESEND_COOLDOWN_SECONDS = 60;
const SESSION_POLL_MS = 3000;

export const EMAIL_VERIFIED_STORAGE_KEY = 'foxaldb:email-verified';

export const useEmailVerificationWatch = (): {
    isResending: boolean;
    resendMessage: 'sent' | 'failure' | null;
    cooldownSeconds: number;
    resend: () => void;
} => {
    const { isAuthenticated, isEmailVerified, refreshSession } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState<
        'sent' | 'failure' | null
    >(null);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);

    useEffect(() => {
        void refreshSession();
    }, [refreshSession]);

    useEffect(() => {
        if (!isEmailVerified) {
            return;
        }

        localStorage.setItem(EMAIL_VERIFIED_STORAGE_KEY, String(Date.now()));
    }, [isEmailVerified]);

    useEffect(() => {
        if (!isAuthenticated || isEmailVerified) {
            return;
        }

        const refresh = (): void => {
            void refreshSession();
        };
        const intervalId = window.setInterval(refresh, SESSION_POLL_MS);
        const onFocus = (): void => {
            refresh();
        };
        const onStorage = (event: StorageEvent): void => {
            if (event.key === EMAIL_VERIFIED_STORAGE_KEY) {
                refresh();
            }
        };

        window.addEventListener('focus', onFocus);
        window.addEventListener('storage', onStorage);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('storage', onStorage);
        };
    }, [isAuthenticated, isEmailVerified, refreshSession]);

    useEffect(() => {
        if (cooldownSeconds <= 0) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [cooldownSeconds]);

    const resend = useCallback(() => {
        setIsResending(true);
        setResendMessage(null);

        void resendVerificationEmail()
            .then(() => {
                setResendMessage('sent');
                setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
            })
            .catch((error: unknown) => {
                setResendMessage('failure');
                if (error instanceof ApiError && error.status === 429) {
                    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
                }
            })
            .finally(() => {
                setIsResending(false);
            });
    }, []);

    return { isResending, resendMessage, cooldownSeconds, resend };
};
