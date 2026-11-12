import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LegalNav } from '@/components/legal-nav/legal-nav';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { getLegalDocument } from '@/lib/legal/get-legal-document';
import {
    legalConfig,
    warnUnresolvedLegalPlaceholders,
} from '@/lib/legal/legal-config';
import {
    ENGLISH_LEGAL_PRECEDENCE_NOTICE,
    type LegalDocumentId,
} from '@/lib/legal/legal-document';
import { LEGAL_PATHS } from '@/lib/legal/legal-routes';
import { LegalSectionView } from './legal-section-view';

const pageTitleKey: Record<LegalDocumentId, string> = {
    notice: 'legal.pages.legal_title',
    privacy: 'legal.pages.privacy_title',
    terms: 'legal.pages.terms_title',
};

const documentNavKey: Record<LegalDocumentId, string> = {
    notice: 'legal.nav.legal',
    privacy: 'legal.nav.privacy',
    terms: 'legal.nav.terms',
};

const documentNavOrder: LegalDocumentId[] = ['notice', 'privacy', 'terms'];

const navLinkClass =
    'rounded-md px-2 py-1 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export interface LegalPageProps {
    documentId: LegalDocumentId;
}

const LegalPageContent: React.FC<LegalPageProps> = ({ documentId }) => {
    const { t, i18n } = useTranslation();
    const document = getLegalDocument(documentId, i18n.language);

    useEffect(() => {
        warnUnresolvedLegalPlaceholders();
    }, []);

    return (
        <>
            <Helmet>
                <title>{t(pageTitleKey[documentId])}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background">
                <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
                    <header className="flex flex-col gap-4">
                        <p className="text-lg font-semibold leading-none tracking-tight">
                            {t('auth.welcome.brand')}
                        </p>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {document.title}
                            </h1>
                            {document.versionNote ? (
                                <p className="text-sm font-medium text-foreground">
                                    {document.versionNote}
                                </p>
                            ) : null}
                            <p className="text-sm text-muted-foreground">
                                <time dateTime={legalConfig.legalLastUpdated}>
                                    {t('legal.last_updated', {
                                        date: legalConfig.legalLastUpdated,
                                    })}
                                </time>
                            </p>
                        </div>
                        <nav
                            aria-label={t('legal.nav.label')}
                            className="flex flex-wrap gap-2 border-b border-border pb-4"
                        >
                            {documentNavOrder.map((id) => {
                                const href =
                                    id === 'notice'
                                        ? LEGAL_PATHS.notice
                                        : id === 'privacy'
                                          ? LEGAL_PATHS.privacy
                                          : LEGAL_PATHS.terms;
                                const isCurrent = id === documentId;
                                return isCurrent ? (
                                    <span
                                        key={id}
                                        aria-current="page"
                                        className="rounded-md bg-muted px-2 py-1 text-sm font-medium text-foreground"
                                    >
                                        {t(documentNavKey[id])}
                                    </span>
                                ) : (
                                    <Link
                                        key={id}
                                        className={navLinkClass}
                                        to={href}
                                    >
                                        {t(documentNavKey[id])}
                                    </Link>
                                );
                            })}
                        </nav>
                        {document.showEnglishPrecedence ? (
                            <p
                                className="rounded-md border border-border bg-muted/40 p-3 text-sm leading-6"
                                role="note"
                            >
                                {ENGLISH_LEGAL_PRECEDENCE_NOTICE}
                            </p>
                        ) : null}
                    </header>
                    <article className="rounded-lg border border-border bg-card px-4 py-6 text-sm leading-7 text-foreground shadow-sm sm:p-8">
                        <div className="flex max-w-none flex-col gap-8 [&_a]:break-words">
                            {document.sections.map((section) => (
                                <LegalSectionView
                                    key={section.id}
                                    headingLevel={2}
                                    section={section}
                                />
                            ))}
                        </div>
                    </article>
                </main>
                <LegalNav
                    className="mx-auto w-full max-w-3xl"
                    context="document"
                />
            </section>
        </>
    );
};

export const LegalPage: React.FC<LegalPageProps> = (props) => (
    <LocalConfigProvider>
        <ThemeProvider>
            <LegalPageContent {...props} />
        </ThemeProvider>
    </LocalConfigProvider>
);
