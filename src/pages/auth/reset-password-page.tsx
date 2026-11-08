import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useTranslation } from 'react-i18next';
import { ResetPasswordScreen } from './reset-password-screen';

const ResetPasswordPageComponent: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    return (
        <>
            <Helmet>
                <title>{t('auth.password_reset.reset.page_title')}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background">
                <ResetPasswordScreen
                    email={searchParams.get('email')}
                    token={searchParams.get('token')}
                />
            </section>
        </>
    );
};

export const ResetPasswordPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <ResetPasswordPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
