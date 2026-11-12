import React from 'react';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import {
    createMemoryRouter,
    MemoryRouter,
    RouterProvider,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthIntentProvider } from '@/context/auth-intent-context/auth-intent-provider';
import { useAuthIntent } from '@/hooks/use-auth-intent';
import { legalConfig } from '@/lib/legal/legal-config';
import { ENGLISH_LEGAL_PRECEDENCE_NOTICE } from '@/lib/legal/legal-document';
import { LegalPage } from '@/pages/legal/legal-page';
import { routes } from '@/router';

const i18nState = vi.hoisted(() => ({ language: 'en' }));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, values?: Record<string, string>) => {
            if (values?.date) {
                return `${key} ${values.date}`;
            }
            return key;
        },
        i18n: i18nState,
    }),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        isEmailVerified: false,
        isLoading: false,
        user: null,
    }),
}));

const IntentProbe: React.FC = () => {
    const { pendingIntent } = useAuthIntent();
    return <span data-testid="auth-intent">{pendingIntent.type}</span>;
};

const renderLegalPage = (documentId: 'notice' | 'privacy' | 'terms') =>
    render(
        <HelmetProvider>
            <AuthIntentProvider>
                <MemoryRouter>
                    <IntentProbe />
                    <LegalPage documentId={documentId} />
                </MemoryRouter>
            </AuthIntentProvider>
        </HelmetProvider>
    );

describe('public legal pages', () => {
    beforeEach(() => {
        i18nState.language = 'en';
    });

    it.each([
        ['notice', 'Legal notice'],
        ['privacy', 'Privacy policy'],
        ['terms', 'Terms of use'],
    ] as const)(
        'shows /%s without Welcome or an AuthIntent',
        async (documentId, title) => {
            renderLegalPage(documentId);

            expect(
                await screen.findByRole('heading', { level: 1, name: title })
            ).toBeInTheDocument();
            expect(
                screen.queryByText('auth.welcome.lead')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('button', {
                    name: 'auth.dialog.continue_without_account',
                })
            ).not.toBeInTheDocument();
            expect(screen.getByTestId('auth-intent')).toHaveTextContent('none');
            expect(
                screen.getByRole('link', { name: 'legal.nav.source' })
            ).toHaveAttribute('href', legalConfig.sourceCodeUrl);
        }
    );

    it('shows the French legal body for the French locale', async () => {
        i18nState.language = 'fr';
        renderLegalPage('notice');

        expect(
            await screen.findByRole('heading', {
                level: 1,
                name: 'Mentions légales',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { level: 2, name: 'Éditeur' })
        ).toBeInTheDocument();
        expect(
            screen.queryByText(ENGLISH_LEGAL_PRECEDENCE_NOTICE)
        ).not.toBeInTheDocument();
    });

    it('shows the English body and precedence notice for English', async () => {
        renderLegalPage('privacy');

        expect(
            await screen.findByText(ENGLISH_LEGAL_PRECEDENCE_NOTICE)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                level: 2,
                name: 'Who processes your data?',
            })
        ).toBeInTheDocument();
    });

    it('shows the English informational body for a third locale', async () => {
        i18nState.language = 'de';
        renderLegalPage('terms');

        expect(
            await screen.findByRole('heading', {
                level: 1,
                name: 'Terms of use',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText(ENGLISH_LEGAL_PRECEDENCE_NOTICE)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { level: 2, name: 'Beta version' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'Conditions générales d’utilisation',
            })
        ).not.toBeInTheDocument();
    });

    it('links Legal, Privacy, and Terms together in the document shell', async () => {
        renderLegalPage('notice');

        expect(
            screen.queryByRole('link', { name: 'legal.nav.home' })
        ).not.toBeInTheDocument();
        await screen.findByRole('heading', { level: 1, name: 'Legal notice' });

        const hrefs = screen
            .getAllByRole('link')
            .map((link) => link.getAttribute('href'));
        expect(hrefs).toContain('/privacy');
        expect(hrefs).toContain('/terms');
        expect(hrefs).toContain('/legal');
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('does not expose a Home action on legal pages', async () => {
        renderLegalPage('terms');

        expect(
            await screen.findByRole('heading', { level: 1 })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('link', { name: 'legal.nav.home' })
        ).not.toBeInTheDocument();
    });

    it('loads /legal, /privacy, and /terms from the public router', async () => {
        for (const path of ['/legal', '/privacy', '/terms']) {
            const router = createMemoryRouter(routes, {
                initialEntries: [path],
            });
            const view = render(
                <HelmetProvider>
                    <RouterProvider router={router} />
                </HelmetProvider>
            );

            expect(router.state.location.pathname).toBe(path);
            expect(
                await screen.findByRole('link', { name: 'legal.nav.source' })
            ).toBeInTheDocument();
            expect(
                screen.queryByText('auth.welcome.lead')
            ).not.toBeInTheDocument();
            view.unmount();
        }
    });
});
