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
import { LegalSectionView } from './legal-section-view';

const pageTitleKey: Record<LegalDocumentId, string> = {
    notice: 'legal.pages.legal_title',
    privacy: 'legal.pages.privacy_title',
    terms: 'legal.pages.terms_title',
};

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
                <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
                    <header className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground">
                            <Link
                                className="rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                to="/"
                            >
                                {t('legal.nav.home')}
                            </Link>
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {document.title}
                        </h1>
                        {document.versionNote ? (
                            <p className="text-sm font-medium">
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
                        {document.showEnglishPrecedence ? (
                            <p
                                className="rounded-md border bg-muted/40 p-3 text-sm"
                                role="note"
                            >
                                {ENGLISH_LEGAL_PRECEDENCE_NOTICE}
                            </p>
                        ) : null}
                    </header>
                    <div className="flex flex-col gap-8 text-sm leading-6">
                        {document.sections.map((section) => (
                            <LegalSectionView
                                key={section.id}
                                headingLevel={2}
                                section={section}
                            />
                        ))}
                    </div>
                </article>
                <LegalNav className="mx-auto w-full max-w-3xl" />
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
