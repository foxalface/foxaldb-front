import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/components/toast/toaster';
import { dismiss } from '@/components/toast/use-toast';
import { ApiError } from '@/lib/api/client';
import { ResetPasswordScreen } from '../reset-password-screen';

const refreshSession = vi.fn();
const resetPassword = vi.fn();

const openToasts = (): HTMLElement[] =>
    Array.from(document.querySelectorAll('li[data-state="open"]'));

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
        dismiss();
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

    it('rejects an empty submit and a confirmation mismatch with one toast', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <MemoryRouter>
                <ResetPasswordScreen
                    email="user@example.com"
                    token="reset-token"
                />
                <Toaster />
            </MemoryRouter>
        );

        expect(container.querySelector('form')).toHaveProperty(
            'noValidate',
            true
        );
        expect(
            screen.getByLabelText('auth.password_reset.reset.password_label')
        ).toBeRequired();
        expect(
            screen.getByLabelText(
                'auth.password_reset.reset.password_confirmation_label'
            )
        ).toBeRequired();

        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.reset.submit',
            })
        );

        expect(
            screen.getByLabelText('auth.password_reset.reset.password_label')
        ).toHaveAttribute('aria-invalid', 'true');
        expect(
            screen.getByLabelText(
                'auth.password_reset.reset.password_confirmation_label'
            )
        ).toHaveAttribute('aria-invalid', 'true');
        expect(document.querySelectorAll('li[data-state="open"]')).toHaveLength(
            1
        );
        expect(resetPassword).not.toHaveBeenCalled();

        await user.type(
            screen.getByLabelText('auth.password_reset.reset.password_label'),
            'new-password-9'
        );
        await user.type(
            screen.getByLabelText(
                'auth.password_reset.reset.password_confirmation_label'
            ),
            'other-password'
        );
        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.reset.submit',
            })
        );

        expect(
            screen.getAllByText('validation.password_confirmation').length
        ).toBe(2);
        expect(openToasts()[0]).toHaveTextContent(
            'validation.password_confirmation'
        );
        expect(document.querySelectorAll('li[data-state="open"]')).toHaveLength(
            1
        );
        expect(resetPassword).not.toHaveBeenCalled();
    });

    it('maps a password rule code and treats an email failure as a bad link', async () => {
        const user = userEvent.setup();
        resetPassword.mockRejectedValueOnce(
            new ApiError('The password must be at least 8 characters.', 422, {
                code: 'validation_failed',
                message: 'The password must be at least 8 characters.',
                errors: {
                    password: ['The password must be at least 8 characters.'],
                },
                fields: {
                    password: [
                        {
                            code: 'min',
                            message:
                                'The password must be at least 8 characters.',
                        },
                    ],
                },
            })
        );

        const view = render(
            <MemoryRouter>
                <ResetPasswordScreen
                    email="user@example.com"
                    token="reset-token"
                />
                <Toaster />
            </MemoryRouter>
        );
        const userFields = () => {
            return {
                password: screen.getByLabelText(
                    'auth.password_reset.reset.password_label'
                ),
                confirmation: screen.getByLabelText(
                    'auth.password_reset.reset.password_confirmation_label'
                ),
            };
        };

        await user.type(userFields().password, 'short');
        await user.type(userFields().confirmation, 'short');
        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.reset.submit',
            })
        );

        expect(
            (await screen.findAllByText('validation.too_short')).length
        ).toBe(2);
        expect(openToasts()[0]).toHaveTextContent('validation.too_short');
        expect(
            screen.queryByText('The password must be at least 8 characters.')
        ).toBeNull();
        expect(document.querySelectorAll('li[data-state="open"]')).toHaveLength(
            1
        );

        resetPassword.mockRejectedValueOnce(
            new ApiError('This password reset token is invalid.', 422, {
                message: 'This password reset token is invalid.',
                errors: {
                    email: ['This password reset token is invalid.'],
                },
            })
        );
        await user.clear(userFields().password);
        await user.type(userFields().password, 'long-enough-password');
        await user.clear(userFields().confirmation);
        await user.type(userFields().confirmation, 'long-enough-password');
        await user.click(
            screen.getByRole('button', {
                name: 'auth.password_reset.reset.submit',
            })
        );

        expect(
            await screen.findByText('auth.password_reset.reset.invalid_title')
        ).toBeTruthy();
        expect(
            screen.queryByText('This password reset token is invalid.')
        ).toBeNull();
        view.unmount();
    });
});
