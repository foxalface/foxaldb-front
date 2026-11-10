import React from 'react';
import { Helmet } from 'react-helmet-async';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useTranslation } from 'react-i18next';
import { ForgotPasswordScreen } from './forgot-password-screen';
import { LegalNav } from '@/components/legal-nav/legal-nav';

const ForgotPasswordPageComponent: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('auth.password_reset.forgot.page_title')}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background">
                <ForgotPasswordScreen />
                <LegalNav className="mt-auto" />
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
