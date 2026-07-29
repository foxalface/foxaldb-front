import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { AuthDialog } from '@/dialogs/auth-dialog/auth-dialog';
import type { EntryFlowAuthActions } from '@/pages/editor-page/entry-flow-auth-actions';

const onContinueAsGuest = vi.fn();
const onLoginSuccess = vi.fn();
const onRegistrationSuccess = vi.fn();
const closeAuthDialog = vi.fn();

const entryAuthActions: EntryFlowAuthActions = {
    onContinueAsGuest,
    onLoginSuccess,
    onRegistrationSuccess,
};

const authState = {
    isAuthenticated: false,
    isLoading: false,
};

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
    }),
}));

vi.mock('@/pages/auth/auth-form-panels', () => ({
    LoginFormPanel: ({
        onSuccess,
        onSwitchToRegister,
    }: {
        onSuccess: () => void;
        onSwitchToRegister: () => void;
    }) => (
        <div>
            <button type="button" onClick={onSuccess}>
                login-success
            </button>
            <button type="button" onClick={onSwitchToRegister}>
                switch-register
            </button>
        </div>
    ),
    RegisterFormPanel: ({
        onSuccess,
        onSwitchToLogin,
    }: {
        onSuccess: () => void;
        onSwitchToLogin: () => void;
    }) => (
        <div>
            <button type="button" onClick={onSuccess}>
                register-success
            </button>
            <button type="button" onClick={onSwitchToLogin}>
                switch-login
            </button>
        </div>
    ),
    AuthenticatedAccountPanel: ({ onBack }: { onBack: () => void }) => (
        <button type="button" onClick={onBack}>
            account-back
        </button>
    ),
}));

const renderAuthDialog = (
    props: {
        open?: boolean;
        entryAuthActions?: EntryFlowAuthActions;
    } = {}
) =>
    render(
        <AuthDialog
            dialog={{ open: props.open ?? true }}
            entryAuthActions={props.entryAuthActions}
        />
    );

describe('AuthDialog entry mode', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = false;
        onContinueAsGuest.mockClear();
        onLoginSuccess.mockClear();
        onRegistrationSuccess.mockClear();
        closeAuthDialog.mockClear();
    });

    it('shows Continue without an account for guest login mode', () => {
        renderAuthDialog({ entryAuthActions });

        expect(
            screen.getByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).toBeInTheDocument();
    });

    it('shows Continue without an account in registration mode', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions });

        await user.click(
            screen.getByRole('button', { name: 'switch-register' })
        );

        expect(
            screen.getByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).toBeInTheDocument();
    });

    it('does not show Continue without an account when authenticated', () => {
        authState.isAuthenticated = true;
        renderAuthDialog({ entryAuthActions });

        expect(
            screen.queryByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).not.toBeInTheDocument();
    });

    it('invokes onContinueAsGuest when Continue is pressed', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions });

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        );

        expect(onContinueAsGuest).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('invokes onLoginSuccess without manually closing the dialog', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions });

        await user.click(screen.getByRole('button', { name: 'login-success' }));

        expect(onLoginSuccess).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('invokes onRegistrationSuccess without manually closing the dialog', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions });

        await user.click(
            screen.getByRole('button', { name: 'switch-register' })
        );
        await user.click(
            screen.getByRole('button', { name: 'register-success' })
        );

        expect(onRegistrationSuccess).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });
});

describe('AuthDialog manual mode', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = false;
        closeAuthDialog.mockClear();
    });

    it('does not show Continue without an account', () => {
        renderAuthDialog();

        expect(
            screen.queryByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).not.toBeInTheDocument();
    });

    it('closes on login success', async () => {
        const user = userEvent.setup();
        renderAuthDialog();

        await user.click(screen.getByRole('button', { name: 'login-success' }));

        expect(closeAuthDialog).toHaveBeenCalledTimes(1);
    });

    it('closes on registration success', async () => {
        const user = userEvent.setup();
        renderAuthDialog();

        await user.click(
            screen.getByRole('button', { name: 'switch-register' })
        );
        await user.click(
            screen.getByRole('button', { name: 'register-success' })
        );

        expect(closeAuthDialog).toHaveBeenCalledTimes(1);
    });
});
