import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { ApiError } from '@/lib/api/client';
import { readLoginPrefillEmail } from '@/lib/account/read-login-prefill-email';

const { restoreAccountMock, loginMock } = vi.hoisted(() => ({
    restoreAccountMock: vi.fn(),
    loginMock: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
    restoreAccount: restoreAccountMock,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        login: loginMock,
        isAuthenticated: false,
        isEmailVerified: false,
        isLoading: false,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }
            return typeof current === 'string' ? current : key;
        },
        i18n: { language: 'fr' },
    }),
}));

import { RestoreAccountPage } from '../restore-account-page';

const LoginProbe: React.FC = () => {
    const location = useLocation();

    return <div>prefill:{readLoginPrefillEmail(location.state)}</div>;
};

const RestoreHarness: React.FC = () => {
    const location = useLocation();

    return (
        <>
            <div data-testid="location">
                {location.pathname}
                {location.search}
            </div>
            <Routes>
                <Route
                    path="/restore-account"
                    element={<RestoreAccountPage />}
                />
                <Route path="/login" element={<LoginProbe />} />
            </Routes>
        </>
    );
};

const renderRestore = (entry: string) =>
    render(
        <HelmetProvider>
            <MemoryRouter initialEntries={[entry]}>
                <RestoreHarness />
            </MemoryRouter>
        </HelmetProvider>
    );

describe('RestoreAccountPage', () => {
    beforeEach(() => {
        restoreAccountMock.mockReset();
        loginMock.mockReset();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('explains restoration and waits for an explicit confirmation', async () => {
        const user = userEvent.setup();
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        let resolveRestore: (value: {
            status: 'restored';
            email: string;
        }) => void = () => undefined;
        restoreAccountMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRestore = resolve;
                })
        );

        renderRestore('/restore-account?token=secret-token');

        expect(
            screen.getByRole('heading', {
                name: en.translation.auth.account_recovery.confirm_title,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                en.translation.auth.account_recovery.confirm_description
            )
        ).toBeInTheDocument();
        expect(restoreAccountMock).not.toHaveBeenCalled();
        expect(loginMock).not.toHaveBeenCalled();

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.account_recovery.restore_action,
            })
        );

        expect(
            await screen.findByRole('button', {
                name: en.translation.auth.account_recovery.restoring,
            })
        ).toBeDisabled();
        expect(restoreAccountMock).toHaveBeenCalledTimes(1);
        expect(restoreAccountMock).toHaveBeenCalledWith('secret-token');

        resolveRestore({
            status: 'restored',
            email: 'owner@example.com',
        });

        expect(
            await screen.findByRole('heading', {
                name: en.translation.auth.account_recovery.restored_title,
            })
        ).toBeInTheDocument();
        expect(loginMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('location')).toHaveTextContent(
            '/restore-account'
        );
        expect(screen.getByTestId('location')).not.toHaveTextContent(
            'secret-token'
        );
        expect(
            setItem.mock.calls.map((call) => String(call[1])).join(' ')
        ).not.toContain('secret-token');

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.account_recovery.sign_in,
            })
        );

        expect(
            await screen.findByText('prefill:owner@example.com')
        ).toBeInTheDocument();
        expect(loginMock).not.toHaveBeenCalled();
    });

    it('shows an invalid link without calling the API when the token is missing', () => {
        renderRestore('/restore-account');

        expect(
            screen.getByRole('heading', {
                name: en.translation.auth.account_recovery.invalid_title,
            })
        ).toBeInTheDocument();
        expect(restoreAccountMock).not.toHaveBeenCalled();
    });

    it('shows an invalid or expired link after a rejected restore', async () => {
        const user = userEvent.setup();
        restoreAccountMock.mockRejectedValueOnce(
            new ApiError('invalid', 422, { code: 'invalid_or_expired' })
        );

        renderRestore('/restore-account?token=expired-token');
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.account_recovery.restore_action,
            })
        );

        expect(
            await screen.findByRole('heading', {
                name: en.translation.auth.account_recovery.invalid_title,
            })
        ).toBeInTheDocument();
        await waitFor(() => {
            expect(restoreAccountMock).toHaveBeenCalledTimes(1);
        });
        expect(loginMock).not.toHaveBeenCalled();
    });
});
