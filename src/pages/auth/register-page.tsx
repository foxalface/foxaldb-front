import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useAuth } from '@/hooks/use-auth';
import {
    AuthenticatedAccountPanel,
    RegisterFormPanel,
} from './auth-form-panels';

const RegisterPageContent: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    const navigateHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const navigateToLogin = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    if (isLoading) {
        return (
            <p className="text-sm text-muted-foreground">Checking session…</p>
        );
    }

    if (isAuthenticated) {
        return <AuthenticatedAccountPanel onBack={navigateHome} />;
    }

    return (
        <RegisterFormPanel
            onSuccess={navigateHome}
            onSwitchToLogin={navigateToLogin}
        />
    );
};

const RegisterPageComponent: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>FoxalDB — Register</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background px-4 py-10">
                <div className="mx-auto w-full max-w-md">
                    <RegisterPageContent />
                </div>
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
