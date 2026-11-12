import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LegalNav } from '@/components/legal-nav/legal-nav';
import { LEGAL_APP_LINK_REL } from '@/lib/legal/legal-routes';
import { legalConfig } from '@/lib/legal/legal-config';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const renderNav = (context: 'application' | 'document' = 'application') =>
    render(
        <MemoryRouter>
            <LegalNav context={context} />
        </MemoryRouter>
    );

describe('LegalNav', () => {
    it('opens legal routes in a new tab from application context', () => {
        renderNav('application');

        for (const name of [
            'legal.nav.legal',
            'legal.nav.privacy',
            'legal.nav.terms',
        ]) {
            const link = screen.getByRole('link', { name });
            expect(link).toHaveAttribute('target', '_blank');
            expect(link.getAttribute('rel')).toContain('noopener');
            expect(link.getAttribute('rel')).toContain('noreferrer');
        }

        expect(
            screen.getByRole('link', { name: 'legal.nav.home' })
        ).toHaveAttribute('href', '/');
    });

    it('uses same-tab router links on legal document pages without Home', () => {
        renderNav('document');

        expect(
            screen.queryByRole('link', { name: 'legal.nav.home' })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole('link', { name: 'legal.nav.legal' })
        ).toHaveAttribute('href', '/legal');
        expect(
            screen.getByRole('link', { name: 'legal.nav.privacy' })
        ).not.toHaveAttribute('target', '_blank');
        expect(
            screen.getByRole('link', { name: 'legal.nav.terms' })
        ).toHaveAttribute('href', '/terms');
    });

    it('keeps the AGPL source link external', () => {
        renderNav('document');

        const source = screen.getByRole('link', { name: 'legal.nav.source' });
        expect(source).toHaveAttribute('href', legalConfig.sourceCodeUrl);
        expect(source).toHaveAttribute('target', '_blank');
        expect(source.getAttribute('rel')).toContain('license');
    });

    it('exports a stable rel token for application legal links', () => {
        expect(LEGAL_APP_LINK_REL).toBe('noopener noreferrer');
    });
});
