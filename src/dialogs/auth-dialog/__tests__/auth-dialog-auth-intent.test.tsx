import React from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthDialog } from '../auth-dialog';
import { AuthIntentProvider } from '@/context/auth-intent-context/auth-intent-provider';
import { useAuthIntent } from '@/hooks/use-auth-intent';
import type { AuthIntent } from '@/lib/auth-intent';

const authState = {
    isAuthenticated: false,
    isLoading: false,
};

const closeAuthDialog = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactRouterDom>();

    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useParams: () => ({}),
    };
});

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeAuthDialog,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/pages/auth/auth-form-panels', () => ({
    LoginFormPanel: ({ onSuccess }: { onSuccess: () => void }) => (
        <button type="button" onClick={onSuccess}>
            mock-login-success
        </button>
    ),
    RegisterFormPanel: () => null,
    AuthenticatedAccountPanel: () => null,
}));

let setAuthIntentRef: ((intent: AuthIntent) => void) | null = null;

const IntentCapture: React.FC = () => {
    const { setAuthIntent, pendingIntent } = useAuthIntent();
    setAuthIntentRef = setAuthIntent;

    return <div data-testid="pending-intent">{pendingIntent.type}</div>;
};

const renderAuthDialog = (entryAuthActions?: {
    onContinueAsGuest: () => void;
    onLoginSuccess: () => void;
    onRegistrationSuccess: () => void;
}) =>
    render(
        <AuthIntentProvider>
            <IntentCapture />
            <AuthDialog
                dialog={{ open: true, onOpenChange: vi.fn() }}
                entryAuthActions={entryAuthActions}
                origin={entryAuthActions ? 'entry' : 'protected-action'}
            />
        </AuthIntentProvider>
    );

describe('AuthDialog auth intent', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = false;
        closeAuthDialog.mockReset();
        setAuthIntentRef = null;
    });

    it('clears pending intent when continuing as guest', async () => {
        const onContinueAsGuest = vi.fn();
        const user = userEvent.setup();

        renderAuthDialog({
            onContinueAsGuest,
            onLoginSuccess: vi.fn(),
            onRegistrationSuccess: vi.fn(),
        });

        act(() => {
            setAuthIntentRef?.({ type: 'open-online-tab' });
        });
        expect(screen.getByTestId('pending-intent')).toHaveTextContent(
            'open-online-tab'
        );

        await user.click(
            screen.getByRole('button', {
                name: 'auth.dialog.continue_without_account',
            })
        );

        expect(onContinueAsGuest).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('pending-intent')).toHaveTextContent('none');
    });

    it('preserves pending intent through mock login success callback', async () => {
        const onLoginSuccess = vi.fn();
        const user = userEvent.setup();

        renderAuthDialog({
            onContinueAsGuest: vi.fn(),
            onLoginSuccess,
            onRegistrationSuccess: vi.fn(),
        });

        act(() => {
            setAuthIntentRef?.({ type: 'open-online-tab' });
        });
        await user.click(
            screen.getByRole('button', { name: 'auth.login.submit' })
        );
        await user.click(
            screen.getByRole('button', { name: 'mock-login-success' })
        );

        expect(onLoginSuccess).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('pending-intent')).toHaveTextContent(
            'open-online-tab'
        );
    });

    it('does not clear pending intent when entry auth dismiss is blocked', async () => {
        const user = userEvent.setup();

        renderAuthDialog({
            onContinueAsGuest: vi.fn(),
            onLoginSuccess: vi.fn(),
            onRegistrationSuccess: vi.fn(),
        });

        act(() => {
            setAuthIntentRef?.({
                type: 'open-online-diagram',
                diagramId: '77',
            });
        });

        expect(screen.getByTestId('pending-intent')).toHaveTextContent(
            'open-online-diagram'
        );

        expect(
            screen.queryByRole('button', { name: 'Close' })
        ).not.toBeInTheDocument();

        await user.keyboard('{Escape}');

        expect(screen.getByTestId('pending-intent')).toHaveTextContent(
            'open-online-diagram'
        );
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('keeps open-online-diagram when signing in from Welcome', async () => {
        const onLoginSuccess = vi.fn();
        const user = userEvent.setup();

        renderAuthDialog({
            onContinueAsGuest: vi.fn(),
            onLoginSuccess,
            onRegistrationSuccess: vi.fn(),
        });

        act(() => {
            setAuthIntentRef?.({
                type: 'open-online-diagram',
                diagramId: '77',
            });
        });

        await user.click(
            screen.getByRole('button', { name: 'auth.login.submit' })
        );
        await user.click(
            screen.getByRole('button', { name: 'mock-login-success' })
        );

        expect(onLoginSuccess).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('pending-intent')).toHaveTextContent(
            'open-online-diagram'
        );
    });

    it('clears a protected-action intent when Login is dismissed', async () => {
        const user = userEvent.setup();

        renderAuthDialog();

        act(() => {
            setAuthIntentRef?.({
                type: 'protected-action',
                action: 'share',
            });
        });

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(screen.getByTestId('pending-intent')).toHaveTextContent('none');
        expect(closeAuthDialog).toHaveBeenCalledTimes(1);
    });
});
