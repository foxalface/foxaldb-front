import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { ForgotPasswordScreen } from '../forgot-password-screen';
import { LoginFormPanel, RegisterFormPanel } from '../auth-form-panels';

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

    it.each(['missing@example.com', 'known@example.com'])(
        'shows the same success message for %s',
        async (email) => {
            requestPasswordReset.mockResolvedValue(undefined);
            const onBackToLogin = vi.fn();
            const user = userEvent.setup();

            render(<ForgotPasswordScreen onBackToLogin={onBackToLogin} />);

            await user.type(screen.getByRole('textbox'), email);
            await user.click(
                screen.getByRole('button', {
                    name: 'auth.password_reset.forgot.send',
                })
            );

            expect(requestPasswordReset).toHaveBeenCalledWith(email);
            expect(
                screen.getByText('auth.password_reset.forgot.sent')
            ).toBeTruthy();
            expect(screen.queryByRole('textbox')).toBeNull();

            await user.click(
                screen.getByRole('button', {
                    name: 'auth.dialog.back',
                })
            );

            expect(onBackToLogin).toHaveBeenCalledTimes(1);
        }
    );

    it('places Back and the send action in one footer', () => {
        render(<ForgotPasswordScreen onBackToLogin={vi.fn()} />);

        const back = screen.getByRole('button', {
            name: 'auth.dialog.back',
        });
        const send = screen.getByRole('button', {
            name: 'auth.password_reset.forgot.send',
        });

        expect(back.parentElement).toBe(send.parentElement);
        expect(back.parentElement).toHaveClass('!justify-between');
        expect(back).toHaveClass('bg-secondary');
        expect(
            back.compareDocumentPosition(send) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });

    it('shows a rate-limit error on 429', async () => {
        requestPasswordReset.mockRejectedValue(
            new ApiError('Too Many Attempts.', 429, null)
        );
        const user = userEvent.setup();

        render(<ForgotPasswordScreen onBackToLogin={vi.fn()} />);

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

    it('places wizard Back and submit in one footer', () => {
        render(
            <LoginFormPanel
                backLabel="auth.dialog.back"
                onBack={vi.fn()}
                onSuccess={vi.fn()}
                onSwitchToRegister={vi.fn()}
            />
        );

        const back = screen.getByRole('button', { name: 'auth.dialog.back' });
        const submit = screen.getByRole('button', {
            name: 'auth.login.submit',
        });

        expect(back.parentElement).toBe(submit.parentElement);
        expect(back.parentElement).toHaveClass('!justify-between');
        expect(back).toHaveClass('bg-secondary');
    });
});

describe('RegisterFormPanel wizard footer', () => {
    it('places wizard Back and submit in one footer', () => {
        render(
            <RegisterFormPanel
                backLabel="auth.dialog.back"
                onBack={vi.fn()}
                onSuccess={vi.fn()}
                onSwitchToLogin={vi.fn()}
            />
        );

        const back = screen.getByRole('button', { name: 'auth.dialog.back' });
        const submit = screen.getByRole('button', {
            name: 'auth.register.submit',
        });

        expect(back.parentElement).toBe(submit.parentElement);
        expect(back.parentElement).toHaveClass('!justify-between');
        expect(back).toHaveClass('bg-secondary');
    });
});
