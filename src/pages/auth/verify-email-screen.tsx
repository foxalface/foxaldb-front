import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/button/button';
import {
    EMAIL_VERIFIED_STORAGE_KEY,
    useEmailVerificationWatch,
} from '@/hooks/use-email-verification-watch';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';

export { EMAIL_VERIFIED_STORAGE_KEY };

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
    const { user, isAuthenticated, isEmailVerified, logout } = useAuth();
    const { isResending, resendMessage, cooldownSeconds, resend } =
        useEmailVerificationWatch();
    const linkStatus = normalizeStatus(status);

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
                                onClick={resend}
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
