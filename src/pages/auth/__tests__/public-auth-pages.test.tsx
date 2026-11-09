import React from 'react';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        isEmailVerified: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
    }),
}));

const renderPage = (page: React.ReactElement) =>
    render(
        <HelmetProvider>
            <MemoryRouter>{page}</MemoryRouter>
        </HelmetProvider>
    );

describe('public auth pages', () => {
    it('shows Login directly on /login', () => {
        renderPage(<LoginPage />);

        expect(
            screen.getByRole('heading', { name: 'auth.login.title' })
        ).toBeInTheDocument();
        expect(screen.getByText('auth.login.email_label')).toBeInTheDocument();
        expect(screen.queryByText('auth.welcome.lead')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'auth.dialog.continue_without_account',
            })
        ).not.toBeInTheDocument();
    });

    it('shows Register directly on /register', () => {
        renderPage(<RegisterPage />);

        expect(
            screen.getByRole('heading', { name: 'auth.register.title' })
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('auth.register.first_name_label')
        ).toBeInTheDocument();
        expect(screen.queryByText('auth.welcome.lead')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'auth.dialog.continue_without_account',
            })
        ).not.toBeInTheDocument();
    });
});
