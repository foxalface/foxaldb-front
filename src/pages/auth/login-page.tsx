import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useAuth } from '@/hooks/use-auth';
import { AuthenticatedAccountPanel, LoginFormPanel } from './auth-form-panels';
import { useTranslation } from 'react-i18next';

const LoginPageContent: React.FC = () => {
    const { t } = useTranslation();
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    const navigateHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const navigateToRegister = useCallback(() => {
        navigate('/register');
    }, [navigate]);

    if (isLoading) {
        return (
            <p className="text-sm text-muted-foreground">
                {t('auth.pages.checking_session')}
            </p>
        );
    }

    if (isAuthenticated) {
        return <AuthenticatedAccountPanel onBack={navigateHome} />;
    }

    return (
        <LoginFormPanel
            onSuccess={navigateHome}
            onSwitchToRegister={navigateToRegister}
        />
    );
};

const LoginPageComponent: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('auth.pages.login_title')}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background px-4 py-10">
                <div className="mx-auto w-full max-w-md">
                    <LoginPageContent />
                </div>
            </section>
        </>
    );
};

export const LoginPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <LoginPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
