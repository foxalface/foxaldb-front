import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { legalConfig } from '@/lib/legal/legal-config';
import { LEGAL_PATHS } from '@/lib/legal/legal-routes';
import { cn } from '@/lib/utils';
import { LegalAppLink } from './legal-app-link';

export type LegalNavContext = 'application' | 'document';

export interface LegalNavProps {
    className?: string;
    /**
     * `application` — footer/menu on auth, invitation, editor (new tab for legal routes).
     * `document` — footer on /legal, /privacy, /terms (same-tab cross-links, no Home).
     */
    context?: LegalNavContext;
}

const linkClass =
    'rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export const LegalNav: React.FC<LegalNavProps> = ({
    className,
    context = 'application',
}) => {
    const { t } = useTranslation();

    const documentEntries = [
        { href: LEGAL_PATHS.notice, label: t('legal.nav.legal') },
        { href: LEGAL_PATHS.privacy, label: t('legal.nav.privacy') },
        { href: LEGAL_PATHS.terms, label: t('legal.nav.terms') },
    ] as const;

    return (
        <nav
            aria-label={t('legal.nav.label')}
            className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-6 text-sm text-muted-foreground',
                className
            )}
        >
            {context === 'application' ? (
                <Link className={linkClass} to="/">
                    {t('legal.nav.home')}
                </Link>
            ) : null}
            {documentEntries.map(({ href, label }) =>
                context === 'application' ? (
                    <LegalAppLink key={href} className={linkClass} href={href}>
                        {label}
                    </LegalAppLink>
                ) : (
                    <Link key={href} className={linkClass} to={href}>
                        {label}
                    </Link>
                )
            )}
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
