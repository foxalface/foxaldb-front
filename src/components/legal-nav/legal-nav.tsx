import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { legalConfig } from '@/lib/legal/legal-config';
import { cn } from '@/lib/utils';

export interface LegalNavProps {
    className?: string;
}

export const LegalNav: React.FC<LegalNavProps> = ({ className }) => {
    const { t } = useTranslation();
    const linkClass =
        'rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

    return (
        <nav
            aria-label={t('legal.nav.label')}
            className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-6 text-sm text-muted-foreground',
                className
            )}
        >
            <Link className={linkClass} to="/">
                {t('legal.nav.home')}
            </Link>
            <Link className={linkClass} to="/legal">
                {t('legal.nav.legal')}
            </Link>
            <Link className={linkClass} to="/privacy">
                {t('legal.nav.privacy')}
            </Link>
            <Link className={linkClass} to="/terms">
                {t('legal.nav.terms')}
            </Link>
            <a
                className={linkClass}
                href={legalConfig.sourceCodeUrl}
                rel="noopener noreferrer license"
                target="_blank"
            >
                {t('legal.nav.source')}
            </a>
        </nav>
    );
};
