import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetPasswordScreen } from '../reset-password-screen';

const refreshSession = vi.fn();
const resetPassword = vi.fn();

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ refreshSession }),
}));

vi.mock('@/lib/api/auth', () => ({
    resetPassword: (...args: unknown[]) => resetPassword(...args),
}));

describe('ResetPasswordScreen', () => {
    beforeEach(() => {
        refreshSession.mockReset();
        resetPassword.mockReset();
        refreshSession.mockResolvedValue(undefined);
    });

    it('shows invalid state when token or email is missing', () => {
        render(
            <MemoryRouter>
                <ResetPasswordScreen email={null} token={null} />
            </MemoryRouter>
        );

        expect(
            screen.getByText('auth.password_reset.reset.invalid_title')
        ).toBeTruthy();
    });

    it('submits a reset and refreshes the session on success', async () => {
        resetPassword.mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <ResetPasswordScreen
                    email="user@example.com"
                    token="reset-token"
                />
            </MemoryRouter>
        );

        const passwordFields = screen.getAllByDisplayValue('');
        await user.type(passwordFields[0], 'new-password-9');
        await user.type(passwordFields[1], 'new-password-9');
        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.reset.submit',
            })
        );

        expect(resetPassword).toHaveBeenCalledWith({
            token: 'reset-token',
            email: 'user@example.com',
            password: 'new-password-9',
            password_confirmation: 'new-password-9',
        });
        expect(refreshSession).toHaveBeenCalledTimes(1);
        expect(
            screen.getByText('auth.password_reset.reset.success_title')
        ).toBeTruthy();
    });

    it('toggles the new password and confirmation independently', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <ResetPasswordScreen
                    email="user@example.com"
                    token="reset-token"
                />
            </MemoryRouter>
        );

        const password = screen.getByLabelText(
            'auth.password_reset.reset.password_label'
        );
        const confirmation = screen.getByLabelText(
            'auth.password_reset.reset.password_confirmation_label'
        );
        await user.type(password, 'new-password-9');
        await user.type(confirmation, 'other-password');
        const toggles = screen.getAllByRole('button', {
            name: 'auth.password_visibility.show',
        });
        await user.click(toggles[1]);

        expect(password).toHaveAttribute('type', 'password');
        expect(password).toHaveValue('new-password-9');
        expect(confirmation).toHaveAttribute('type', 'text');
        expect(confirmation).toHaveValue('other-password');
    });
});
