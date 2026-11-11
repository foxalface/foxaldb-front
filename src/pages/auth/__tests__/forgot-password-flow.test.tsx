import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password-page';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { ResetPasswordPage } from '@/pages/auth/reset-password-page';

const requestPasswordReset = vi.fn();

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
        logout: vi.fn(),
        refreshSession: vi.fn(),
        user: null,
    }),
}));

vi.mock('@/lib/api/auth', () => ({
    requestPasswordReset: (...args: unknown[]) => requestPasswordReset(...args),
    requestAccountRecovery: vi.fn(),
    resetPassword: vi.fn(),
}));

const LocationProbe: React.FC = () => {
    const location = useLocation();

    return <div data-testid="path">{location.pathname}</div>;
};

const AuthRouteHarness: React.FC = () => (
    <>
        <LocationProbe />
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
    </>
);

const renderAt = (entry: string) =>
    render(
        <HelmetProvider>
            <MemoryRouter initialEntries={[entry]}>
                <AuthRouteHarness />
            </MemoryRouter>
        </HelmetProvider>
    );

describe('forgot password auth flow', () => {
    beforeEach(() => {
        requestPasswordReset.mockReset();
    });

    it('moves from login into the shared auth shell and back to login', async () => {
        requestPasswordReset.mockResolvedValue(undefined);
        const user = userEvent.setup();
        renderAt('/login');

        const loginHeading = screen.getByRole('heading', {
            name: 'auth.login.title',
        });
        const loginHeadingClass = loginHeading.className;
        const loginSectionClass = document.querySelector('section')?.className;

        expect(
            screen.getByRole('button', { name: 'auth.login.forgot_password' })
        ).toBeInTheDocument();
        expect(screen.queryByText('auth.welcome.lead')).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'auth.login.forgot_password' })
        );

        expect(screen.getByTestId('path')).toHaveTextContent(
            '/forgot-password'
        );
        const forgotHeading = screen.getByRole('heading', {
            name: 'auth.password_reset.forgot.title',
        });
        expect(forgotHeading.className).toBe(loginHeadingClass);
        expect(document.querySelector('section')?.className).toBe(
            loginSectionClass
        );
        expect(
            screen.getByText('auth.password_reset.forgot.description')
        ).toBeInTheDocument();
        expect(screen.queryByText('auth.welcome.lead')).not.toBeInTheDocument();

        await user.type(
            screen.getByRole('textbox', {
                name: 'auth.password_reset.forgot.email_label',
            }),
            'missing@example.com'
        );
        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.forgot.send',
            })
        );

        expect(requestPasswordReset).toHaveBeenCalledWith(
            'missing@example.com'
        );
        expect(
            screen.getByText('auth.password_reset.forgot.sent')
        ).toBeInTheDocument();
        expect(screen.getByTestId('path')).toHaveTextContent(
            '/forgot-password'
        );
        expect(forgotHeading).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: 'auth.login.title' })
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.forgot.back_to_sign_in',
            })
        );

        expect(screen.getByTestId('path')).toHaveTextContent('/login');
        expect(
            screen.getByRole('heading', { name: 'auth.login.title' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'auth.login.forgot_password' })
        ).toBeInTheDocument();
    });

    it('still opens register from login', async () => {
        const user = userEvent.setup();
        renderAt('/login');

        await user.click(
            screen.getByRole('button', {
                name: 'auth.login.switch_to_register',
            })
        );

        expect(screen.getByTestId('path')).toHaveTextContent('/register');
        expect(
            screen.getByRole('heading', { name: 'auth.register.title' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'auth.password_reset.forgot.title',
            })
        ).not.toBeInTheDocument();
        expect(screen.queryByText('auth.welcome.lead')).not.toBeInTheDocument();
    });

    it('keeps reset-password as its own route and page', async () => {
        const forgot = routes.find((route) => route.path === 'forgot-password');
        const reset = routes.find((route) => route.path === 'reset-password');

        expect(forgot).toBeDefined();
        expect(reset).toBeDefined();
        expect(forgot).not.toBe(reset);

        const user = userEvent.setup();
        renderAt('/reset-password');

        expect(screen.getByTestId('path')).toHaveTextContent('/reset-password');
        expect(
            screen.getByRole('heading', {
                name: 'auth.password_reset.reset.invalid_title',
            })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'auth.password_reset.forgot.title',
            })
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('link', {
                name: 'auth.password_reset.forgot.send',
            })
        );

        expect(screen.getByTestId('path')).toHaveTextContent(
            '/forgot-password'
        );
        expect(
            screen.getByRole('heading', {
                name: 'auth.password_reset.forgot.title',
            })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'auth.password_reset.reset.invalid_title',
            })
        ).not.toBeInTheDocument();
    });
});
