import React from 'react';
import { Helmet } from 'react-helmet-async';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { AuthCard } from '@/dialogs/auth-dialog/auth-card';
import { LegalNav } from '@/components/legal-nav/legal-nav';
import { useTranslation } from 'react-i18next';
import { ForgotPasswordScreen } from './forgot-password-screen';

const ForgotPasswordPageComponent: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('auth.password_reset.forgot.page_title')}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background px-4 py-10">
                <div className="mx-auto w-full max-w-md">
                    <AuthCard
                        description={t(
                            'auth.password_reset.forgot.description'
                        )}
                        title={t('auth.password_reset.forgot.title')}
                    >
                        <ForgotPasswordScreen />
                    </AuthCard>
                </div>
                <LegalNav className="mx-auto mt-auto w-full max-w-md px-0" />
            </section>
        </>
    );
};

export const ForgotPasswordPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <ForgotPasswordPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
