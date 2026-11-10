import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/button/button';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { AuthCard } from '@/dialogs/auth-dialog/auth-card';
import { LegalNav } from '@/components/legal-nav/legal-nav';
import { ApiError } from '@/lib/api/client';
import { restoreAccount } from '@/lib/api/auth';
import { readApiErrorCode } from '@/lib/api/parse-validation-errors';
import { useTranslation } from 'react-i18next';

type RestoreStatus = 'confirm' | 'restoring' | 'restored' | 'invalid';

const RestoreAccountPageComponent: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<RestoreStatus>(
        token !== null && token.length > 0 ? 'confirm' : 'invalid'
    );
    const [restoredEmail, setRestoredEmail] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const confirmRestore = async (): Promise<void> => {
        if (token === null || token.length === 0 || status === 'restoring') {
            setStatus('invalid');
            return;
        }

        setFormError(null);
        setStatus('restoring');

        try {
            const result = await restoreAccount(token);
            setRestoredEmail(result.email);
            setStatus('restored');
            navigate('/restore-account', { replace: true });
        } catch (error: unknown) {
            if (
                error instanceof ApiError &&
                (error.status === 422 ||
                    readApiErrorCode(error) === 'invalid_or_expired')
            ) {
                setStatus('invalid');
                return;
            }

            setStatus('confirm');
            setFormError(t('auth.account_recovery.request_error'));
        }
    };

    const signIn = (): void => {
        navigate('/login', {
            state:
                restoredEmail !== null && restoredEmail.length > 0
                    ? { email: restoredEmail }
                    : undefined,
        });
    };

    let title = t('auth.account_recovery.confirm_title');
    let description = t('auth.account_recovery.confirm_description');

    if (status === 'restored') {
        title = t('auth.account_recovery.restored_title');
        description = t('auth.account_recovery.restored_description');
    } else if (status === 'invalid') {
        title = t('auth.account_recovery.invalid_title');
        description = t('auth.account_recovery.invalid_description');
    }

    return (
        <>
            <Helmet>
                <title>{t('auth.account_recovery.page_title')}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background px-4 py-10">
                <div className="mx-auto w-full max-w-md">
                    <AuthCard description={description} title={title}>
                        {status === 'confirm' || status === 'restoring' ? (
                            <div className="flex flex-col gap-3">
                                {formError !== null ? (
                                    <p
                                        className="text-sm text-destructive"
                                        role="alert"
                                    >
                                        {formError}
                                    </p>
                                ) : null}
                                <Button
                                    disabled={status === 'restoring'}
                                    onClick={() => {
                                        void confirmRestore();
                                    }}
                                    type="button"
                                >
                                    {status === 'restoring'
                                        ? t('auth.account_recovery.restoring')
                                        : t(
                                              'auth.account_recovery.restore_action'
                                          )}
                                </Button>
                            </div>
                        ) : null}
                        {status === 'restored' ? (
                            <Button onClick={signIn} type="button">
                                {t('auth.account_recovery.sign_in')}
                            </Button>
                        ) : null}
                        {status === 'invalid' ? (
                            <Button
                                onClick={() => navigate('/register')}
                                type="button"
                                variant="secondary"
                            >
                                {t('auth.login.switch_to_register')}
                            </Button>
                        ) : null}
                    </AuthCard>
                </div>
                <LegalNav className="mx-auto mt-auto w-full max-w-md px-0" />
            </section>
        </>
    );
};

export const RestoreAccountPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <RestoreAccountPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
