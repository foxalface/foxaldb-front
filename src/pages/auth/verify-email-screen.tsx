import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/button/button';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api/client';
import { resendVerificationEmail } from '@/lib/api/auth';
import { useTranslation } from 'react-i18next';

const RESEND_COOLDOWN_SECONDS = 60;
const SESSION_POLL_MS = 3000;
export const EMAIL_VERIFIED_STORAGE_KEY = 'foxaldb:email-verified';

export type VerifyEmailStatus = 'verified' | 'already' | 'invalid' | null;

const normalizeStatus = (
    status: string | null | undefined
): VerifyEmailStatus => {
    if (status === 'verified' || status === 'already' || status === 'invalid') {
        return status;
    }

    return null;
};

export const VerifyEmailScreen: React.FC<{
    status?: string | null;
}> = ({ status }) => {
    const { t } = useTranslation();
    const { user, isAuthenticated, isEmailVerified, refreshSession, logout } =
        useAuth();
    const linkStatus = normalizeStatus(status);
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

    const handleResend = useCallback(async () => {
        setIsResending(true);
        setResendMessage(null);

        try {
            await resendVerificationEmail();
            setResendMessage('sent');
            setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
        } catch (error) {
            setResendMessage('failure');
            if (error instanceof ApiError && error.status === 429) {
                setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
            }
        } finally {
            setIsResending(false);
        }
    }, []);

    const showVerified =
        isEmailVerified ||
        ((linkStatus === 'verified' || linkStatus === 'already') &&
            !isAuthenticated);
    const showInvalid = linkStatus === 'invalid' && !showVerified;

    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10">
            {showVerified ? (
                <>
                    <h1 className="text-2xl font-semibold">
                        {t('auth.verify.verified_title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('auth.verify.verified_description')}
                    </p>
                    {isAuthenticated ? (
                        <Button asChild>
                            <Link to="/">
                                {t('auth.verify.verified_continue')}
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild>
                            <Link to="/login">{t('auth.verify.sign_in')}</Link>
                        </Button>
                    )}
                </>
            ) : (
                <>
                    <h1 className="text-2xl font-semibold">
                        {showInvalid
                            ? t('auth.verify.invalid_title')
                            : t('auth.verify.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {showInvalid
                            ? t('auth.verify.invalid_description')
                            : t('auth.verify.description')}
                    </p>
                    {user?.email ? (
                        <p className="text-sm">
                            <span className="text-muted-foreground">
                                {t('auth.verify.email_label')}{' '}
                            </span>
                            {user.email}
                        </p>
                    ) : null}
                    {isAuthenticated ? (
                        <>
                            <Button
                                onClick={() => {
                                    void handleResend();
                                }}
                                disabled={isResending || cooldownSeconds > 0}
                            >
                                {isResending
                                    ? t('auth.verify.sending')
                                    : t('auth.verify.resend')}
                            </Button>
                            {resendMessage === 'sent' ? (
                                <p className="text-sm">
                                    {t('auth.verify.sent')}
                                </p>
                            ) : null}
                            {resendMessage === 'failure' ? (
                                <p className="text-sm text-destructive">
                                    {t('auth.verify.resend_failure')}
                                </p>
                            ) : null}
                            {cooldownSeconds > 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {t('auth.verify.cooldown', {
                                        seconds: cooldownSeconds,
                                    })}
                                </p>
                            ) : null}
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    void logout();
                                }}
                            >
                                {t('auth.verify.logout')}
                            </Button>
                        </>
                    ) : (
                        <Button asChild>
                            <Link to="/login">{t('auth.verify.sign_in')}</Link>
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};
