import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useAuth } from '@/hooks/use-auth';
import { AuthCard } from '@/dialogs/auth-dialog/auth-card';
import { LegalNav } from '@/components/legal-nav/legal-nav';
import { AuthenticatedAccountPanel, LoginFormPanel } from './auth-form-panels';
import { VerifyEmailScreen } from './verify-email-screen';
import { readLoginPrefillEmail } from '@/lib/account/read-login-prefill-email';
import { useTranslation } from 'react-i18next';

const LoginPageContent: React.FC = () => {
    const { t } = useTranslation();
    const { isAuthenticated, isEmailVerified, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const prefillEmail = readLoginPrefillEmail(location.state);

    const navigateHome = useCallback(() => {
        // Pending AuthIntent is consumed by AuthIntentProvider. The editor's
        // useAuthIntentContinuation executes it once. This page does not.
        navigate('/');
    }, [navigate]);

    const navigateToRegister = useCallback(() => {
        navigate('/register');
    }, [navigate]);

    const navigateToForgotPassword = useCallback(() => {
        navigate('/forgot-password');
    }, [navigate]);

    if (isLoading) {
        return (
            <p className="text-sm text-muted-foreground">
                {t('auth.pages.checking_session')}
            </p>
        );
    }

    if (isAuthenticated && !isEmailVerified) {
        return <VerifyEmailScreen />;
    }

    if (isAuthenticated) {
        return <AuthenticatedAccountPanel onBack={navigateHome} />;
    }

    return (
        <AuthCard title={t('auth.login.title')}>
            <LoginFormPanel
                initialEmail={prefillEmail}
                onForgotPassword={navigateToForgotPassword}
                onSuccess={navigateHome}
                onSwitchToRegister={navigateToRegister}
                showHeading={false}
            />
        </AuthCard>
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
                <LegalNav className="mx-auto mt-auto w-full max-w-md px-0" />
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
