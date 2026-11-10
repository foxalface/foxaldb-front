import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useTranslation } from 'react-i18next';
import { VerifyEmailScreen } from './verify-email-screen';
import { LegalNav } from '@/components/legal-nav/legal-nav';

const VerifyEmailPageComponent: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    return (
        <>
            <Helmet>
                <title>{t('auth.verify.page_title')}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background">
                <VerifyEmailScreen status={searchParams.get('status')} />
                <LegalNav className="mt-auto" />
            </section>
        </>
    );
};

export const VerifyEmailPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <VerifyEmailPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
