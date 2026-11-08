import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { ForgotPasswordScreen } from '../forgot-password-screen';
import { LoginFormPanel } from '../auth-form-panels';

const requestPasswordReset = vi.fn();

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/lib/api/auth', () => ({
    requestPasswordReset: (...args: unknown[]) => requestPasswordReset(...args),
}));

describe('ForgotPasswordScreen', () => {
    beforeEach(() => {
        requestPasswordReset.mockReset();
    });

    it('shows the same success message for a valid submission', async () => {
        requestPasswordReset.mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <ForgotPasswordScreen />
            </MemoryRouter>
        );

        await user.type(screen.getByRole('textbox'), 'missing@example.com');
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
        ).toBeTruthy();
    });

    it('shows a rate-limit error on 429', async () => {
        requestPasswordReset.mockRejectedValue(
            new ApiError('Too Many Attempts.', 429, null)
        );
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <ForgotPasswordScreen />
            </MemoryRouter>
        );

        await user.type(
            screen.getByRole('textbox', {
                name: 'auth.password_reset.forgot.email_label',
            }),
            'user@example.com'
        );
        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.forgot.send',
            })
        );

        expect(
            screen.getByText('auth.password_reset.errors.rate_limit')
        ).toBeTruthy();
    });
});

describe('LoginFormPanel forgot password link', () => {
    it('shows the forgot password control when a handler is provided', () => {
        const onForgotPassword = vi.fn();

        render(
            <LoginFormPanel
                onForgotPassword={onForgotPassword}
                onSuccess={vi.fn()}
                onSwitchToRegister={vi.fn()}
            />
        );

        expect(screen.getByText('auth.login.forgot_password')).toBeTruthy();
    });
});
