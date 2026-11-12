import React from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { AuthDialog } from '@/dialogs/auth-dialog/auth-dialog';
import type { EntryFlowAuthActions } from '@/pages/editor-page/entry-flow-auth-actions';
import type { AuthOrigin } from '@/dialogs/auth-dialog/auth-origin';

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

const routeParams: { diagramId?: string } = {};

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactRouterDom>();

    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useParams: () => routeParams,
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
        onBack,
        backLabel,
    }: {
        onSuccess: () => void;
        onSwitchToRegister: () => void;
        onBack?: () => void;
        backLabel?: string;
    }) => (
        <div>
            <button type="button" onClick={onSuccess}>
                login-success
            </button>
            <button type="button" onClick={onSwitchToRegister}>
                switch-register
            </button>
            {onBack ? (
                <button type="button" onClick={onBack}>
                    {backLabel}
                </button>
            ) : null}
        </div>
    ),
    RegisterFormPanel: ({
        onSuccess,
        onSwitchToLogin,
        onBack,
        backLabel,
    }: {
        onSuccess: () => void;
        onSwitchToLogin: () => void;
        onBack?: () => void;
        backLabel?: string;
    }) => (
        <div>
            <button type="button" onClick={onSuccess}>
                register-success
            </button>
            <button type="button" onClick={onSwitchToLogin}>
                switch-login
            </button>
            {onBack ? (
                <button type="button" onClick={onBack}>
                    {backLabel}
                </button>
            ) : null}
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
        origin?: AuthOrigin;
    } = {}
) =>
    render(
        <AuthDialog
            dialog={{ open: props.open ?? true }}
            entryAuthActions={props.entryAuthActions}
            origin={props.origin}
        />
    );

describe('AuthDialog entry mode', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = false;
        routeParams.diagramId = undefined;
        onContinueAsGuest.mockClear();
        onLoginSuccess.mockClear();
        onRegistrationSuccess.mockClear();
        closeAuthDialog.mockClear();
    });

    it('opens Welcome without auth fields', () => {
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        expect(
            screen.getByRole('heading', {
                name: en.translation.auth.welcome.brand,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText(en.translation.auth.welcome.lead)
        ).toBeInTheDocument();
        expect(
            screen.getByText(en.translation.auth.welcome.support)
        ).toBeInTheDocument();
        expect(
            screen.getByText(en.translation.auth.welcome.guest_note)
        ).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
        expect(
            screen.queryByText(en.translation.auth.welcome.online_diagram)
        ).not.toBeInTheDocument();
    });

    it('shows the online deep-link note for a backend diagram id', () => {
        routeParams.diagramId = '42';
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        expect(
            screen.getByText(en.translation.auth.welcome.online_diagram)
        ).toBeInTheDocument();
    });

    it('moves from Welcome to Login without the guest action', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );

        expect(
            screen.getByRole('button', { name: 'login-success' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: en.translation.auth.dialog.login_title,
            })
        ).toBeInTheDocument();
    });

    it('moves from Welcome to Register and Back returns to Welcome', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        expect(
            screen.getByRole('button', { name: 'register-success' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.dialog.back,
            })
        );

        expect(
            screen.getByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).toBeInTheDocument();
    });

    it('returns Register opened from Login back to Login', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );
        await user.click(
            screen.getByRole('button', { name: 'switch-register' })
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.dialog.back,
            })
        );

        expect(
            screen.getByRole('button', { name: 'login-success' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).not.toBeInTheDocument();
    });

    it('returns Login to Welcome on Back and Escape without closing', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.dialog.back,
            })
        );

        expect(
            screen.getByText(en.translation.auth.welcome.lead)
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );
        await user.keyboard('{Escape}');

        expect(
            screen.getByText(en.translation.auth.welcome.lead)
        ).toBeInTheDocument();
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('does not show Continue without an account when authenticated', () => {
        authState.isAuthenticated = true;
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        expect(
            screen.queryByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(en.translation.auth.welcome.lead)
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'account-back' })
        ).toBeInTheDocument();
    });

    it('invokes onContinueAsGuest when Continue is pressed', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

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
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );
        await user.click(screen.getByRole('button', { name: 'login-success' }));

        expect(onLoginSuccess).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('invokes onRegistrationSuccess without manually closing the dialog', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );
        await user.click(
            screen.getByRole('button', { name: 'register-success' })
        );

        expect(onRegistrationSuccess).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('does not show a dismiss control while entry choice is required', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ entryAuthActions, origin: 'entry' });

        expect(
            screen.queryByRole('button', { name: 'Close' })
        ).not.toBeInTheDocument();

        await user.keyboard('{Escape}');

        expect(closeAuthDialog).not.toHaveBeenCalled();
        expect(
            screen.getByText(en.translation.auth.welcome.lead)
        ).toBeInTheDocument();
    });
});

describe('AuthDialog manual mode', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = false;
        closeAuthDialog.mockClear();
    });

    it.each(['protected-action', 'navbar', 'session-recovery'] as const)(
        'opens Login directly for %s',
        (origin) => {
            renderAuthDialog({ origin });

            expect(
                screen.getByRole('button', { name: 'login-success' })
            ).toBeInTheDocument();
            expect(
                screen.queryByText(en.translation.auth.welcome.lead)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('button', {
                    name: en.translation.auth.dialog.continue_without_account,
                })
            ).not.toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Close' })
            ).toBeInTheDocument();
        }
    );

    it('does not show Continue without an account', () => {
        renderAuthDialog();

        expect(
            screen.queryByRole('button', {
                name: en.translation.auth.dialog.continue_without_account,
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(en.translation.auth.welcome.lead)
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

    it('returns protected Register back to Login', async () => {
        const user = userEvent.setup();
        renderAuthDialog({ origin: 'protected-action' });

        await user.click(
            screen.getByRole('button', { name: 'switch-register' })
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.dialog.back,
            })
        );

        expect(
            screen.getByRole('button', { name: 'login-success' })
        ).toBeInTheDocument();
        expect(
            screen.queryByText(en.translation.auth.welcome.lead)
        ).not.toBeInTheDocument();
    });

    it('shows a dismiss control outside entry mode', () => {
        renderAuthDialog();

        expect(
            screen.getByRole('button', { name: 'Close' })
        ).toBeInTheDocument();
    });
});
