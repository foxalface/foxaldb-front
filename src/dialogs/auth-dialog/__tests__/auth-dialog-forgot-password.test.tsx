import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthDialog } from '@/dialogs/auth-dialog/auth-dialog';
import type { AuthOrigin } from '@/dialogs/auth-dialog/auth-origin';
import { AuthIntentProvider } from '@/context/auth-intent-context/auth-intent-provider';
import { useAuthIntent } from '@/hooks/use-auth-intent';
import type { AuthIntent } from '@/lib/auth-intent';

const requestPasswordReset = vi.fn();
const closeAuthDialog = vi.fn();

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
        user: null,
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeAuthDialog,
    }),
}));

vi.mock('@/lib/api/auth', () => ({
    requestPasswordReset: (...args: unknown[]) => requestPasswordReset(...args),
    requestAccountRecovery: vi.fn(),
}));

let setAuthIntentRef: ((intent: AuthIntent) => void) | null = null;

const IntentCapture: React.FC = () => {
    const { setAuthIntent, pendingIntent } = useAuthIntent();
    setAuthIntentRef = setAuthIntent;

    return <div data-testid="pending-intent">{pendingIntent.type}</div>;
};

const LocationProbe: React.FC = () => {
    const location = useLocation();

    return <div data-testid="path">{location.pathname}</div>;
};

const renderDialog = (origin: AuthOrigin, path = '/') =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <AuthIntentProvider>
                <IntentCapture />
                <LocationProbe />
                <Routes>
                    <Route
                        path={path}
                        element={
                            <AuthDialog
                                dialog={{ open: true }}
                                origin={origin}
                            />
                        }
                    />
                </Routes>
            </AuthIntentProvider>
        </MemoryRouter>
    );

const openForgotPasswordFromLogin = async (
    user: ReturnType<typeof userEvent.setup>
) => {
    await user.click(
        screen.getByRole('button', { name: 'auth.login.forgot_password' })
    );
};

describe('AuthDialog forgot password step', () => {
    beforeEach(() => {
        requestPasswordReset.mockReset();
        closeAuthDialog.mockReset();
        setAuthIntentRef = null;
        requestPasswordReset.mockResolvedValue(undefined);
    });

    it('keeps the homepage modal open and restores Login without navigation', async () => {
        const user = userEvent.setup();
        renderDialog('entry');

        act(() => {
            setAuthIntentRef?.({
                type: 'open-online-diagram',
                diagramId: '77',
            });
        });

        await user.click(
            screen.getByRole('button', { name: 'auth.login.submit' })
        );

        expect(screen.getByTestId('path')).toHaveTextContent('/');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await openForgotPasswordFromLogin(user);

        expect(screen.getByTestId('path')).toHaveTextContent('/');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: 'auth.password_reset.forgot.title',
            })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: 'auth.dialog.login_title' })
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('pending-intent')).toHaveTextContent(
            'open-online-diagram'
        );

        await user.type(
            screen.getByRole('textbox', {
                name: 'auth.password_reset.forgot.email_label',
            }),
            'known@example.com'
        );
        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.forgot.send',
            })
        );

        expect(requestPasswordReset).toHaveBeenCalledWith('known@example.com');
        expect(
            screen.getByText('auth.password_reset.forgot.sent')
        ).toBeInTheDocument();
        expect(screen.getByTestId('path')).toHaveTextContent('/');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(closeAuthDialog).not.toHaveBeenCalled();
        expect(screen.getByTestId('pending-intent')).toHaveTextContent(
            'open-online-diagram'
        );

        await user.click(
            screen.getByRole('button', {
                name: 'auth.dialog.back',
            })
        );

        expect(
            screen.getByRole('heading', { name: 'auth.dialog.login_title' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'auth.login.forgot_password' })
        ).toBeInTheDocument();
        expect(screen.queryByText('auth.welcome.lead')).not.toBeInTheDocument();
        expect(screen.getByTestId('path')).toHaveTextContent('/');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(closeAuthDialog).not.toHaveBeenCalled();
        expect(screen.getByTestId('pending-intent')).toHaveTextContent(
            'open-online-diagram'
        );
        expect(
            screen.queryByRole('button', { name: 'Close' })
        ).not.toBeInTheDocument();
    });

    it('returns entry Forgot Password to Login on the dialog Back control', async () => {
        const user = userEvent.setup();
        renderDialog('entry');

        await user.click(
            screen.getByRole('button', { name: 'auth.login.submit' })
        );
        await openForgotPasswordFromLogin(user);

        const backToLogin = screen.getByRole('button', {
            name: 'auth.dialog.back',
        });
        const sendReset = screen.getByRole('button', {
            name: 'auth.password_reset.forgot.send',
        });
        expect(backToLogin.parentElement).toBe(sendReset.parentElement);
        expect(backToLogin.parentElement).toHaveClass('!justify-between');
        expect(
            screen.getAllByRole('button', { name: 'auth.dialog.back' })
        ).toHaveLength(1);

        await user.click(backToLogin);

        expect(
            screen.getByRole('heading', { name: 'auth.dialog.login_title' })
        ).toBeInTheDocument();
        expect(screen.queryByText('auth.welcome.lead')).not.toBeInTheDocument();
        expect(screen.getByTestId('path')).toHaveTextContent('/');
    });

    it.each(['navbar', 'protected-action'] as const)(
        'switches %s Login to Forgot Password without leaving the page',
        async (origin) => {
            const user = userEvent.setup();
            renderDialog(origin, '/diagrams/15');

            act(() => {
                setAuthIntentRef?.({
                    type: 'protected-action',
                    action: 'share',
                });
            });

            expect(
                screen.getByRole('heading', {
                    name: 'auth.dialog.login_title',
                })
            ).toBeInTheDocument();

            await openForgotPasswordFromLogin(user);

            expect(screen.getByTestId('path')).toHaveTextContent(
                '/diagrams/15'
            );
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(
                screen.getByRole('heading', {
                    name: 'auth.password_reset.forgot.title',
                })
            ).toBeInTheDocument();

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
            expect(screen.getByTestId('pending-intent')).toHaveTextContent(
                'protected-action'
            );
            expect(closeAuthDialog).not.toHaveBeenCalled();

            await user.click(
                screen.getByRole('button', {
                    name: 'auth.dialog.back',
                })
            );

            expect(
                screen.getByRole('heading', {
                    name: 'auth.dialog.login_title',
                })
            ).toBeInTheDocument();
            expect(screen.getByTestId('path')).toHaveTextContent(
                '/diagrams/15'
            );
            expect(
                screen.getByRole('button', { name: 'Close' })
            ).toBeInTheDocument();
            expect(screen.getByTestId('pending-intent')).toHaveTextContent(
                'protected-action'
            );
        }
    );
});
