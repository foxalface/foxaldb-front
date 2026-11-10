import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useAuth } from '@/hooks/use-auth';
import { AuthCard } from '@/dialogs/auth-dialog/auth-card';
import { LegalNav } from '@/components/legal-nav/legal-nav';
import {
    AuthenticatedAccountPanel,
    RegisterFormPanel,
} from './auth-form-panels';
import { VerifyEmailScreen } from './verify-email-screen';
import { useTranslation } from 'react-i18next';

const RegisterPageContent: React.FC = () => {
    const { t } = useTranslation();
    const { isAuthenticated, isEmailVerified, isLoading } = useAuth();
    const navigate = useNavigate();

    const navigateHome = useCallback(() => {
        // Same continuation owner as the auth dialog and /login.
        navigate('/');
    }, [navigate]);

    const navigateToLogin = useCallback(() => {
        navigate('/login');
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
        <AuthCard title={t('auth.register.title')}>
            <RegisterFormPanel
                onSuccess={navigateHome}
                onSwitchToLogin={navigateToLogin}
                showHeading={false}
            />
        </AuthCard>
    );
};

const RegisterPageComponent: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('auth.pages.register_title')}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background px-4 py-10">
                <div className="mx-auto w-full max-w-md">
                    <RegisterPageContent />
                </div>
                <LegalNav className="mx-auto mt-auto w-full max-w-md px-0" />
            </section>
        </>
    );
};

export const RegisterPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <RegisterPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
