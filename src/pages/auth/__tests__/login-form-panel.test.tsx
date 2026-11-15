import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/components/toast/toaster';
import { dismiss } from '@/components/toast/use-toast';
import { en } from '@/i18n/locales/en';
import { ApiError } from '@/lib/api/client';

const { loginMock } = vi.hoisted(() => ({
    loginMock: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        login: loginMock,
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

import { LoginFormPanel } from '../auth-form-panels';

const openToasts = (): HTMLElement[] =>
    Array.from(document.querySelectorAll('li[data-state="open"]'));

describe('LoginFormPanel', () => {
    beforeEach(() => {
        loginMock.mockReset();
        loginMock.mockResolvedValue(undefined);
        dismiss();
    });

    it('rejects an empty submit without the native bubble', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <>
                <LoginFormPanel
                    onSuccess={vi.fn()}
                    onSwitchToRegister={vi.fn()}
                />
                <Toaster />
            </>
        );

        const form = container.querySelector('form');
        expect(form).toHaveProperty('noValidate', true);
        expect(
            screen.getByLabelText(en.translation.auth.login.email_label)
        ).toBeRequired();
        expect(
            screen.getByLabelText(en.translation.auth.login.password_label)
        ).toBeRequired();

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );

        const email = screen.getByLabelText(
            en.translation.auth.login.email_label
        );
        const password = screen.getByLabelText(
            en.translation.auth.login.password_label
        );
        expect(email).toHaveAttribute('aria-invalid', 'true');
        expect(password).toHaveAttribute('aria-invalid', 'true');
        expect(email).toHaveAttribute('aria-describedby', 'login-email-error');
        expect(document.getElementById('login-email-error')).toHaveClass(
            'sr-only'
        );
        expect(email).toHaveFocus();
        expect(loginMock).not.toHaveBeenCalled();
        expect(openToasts()).toHaveLength(1);
        expect(
            screen.getAllByText(en.translation.validation.required).length
        ).toBeGreaterThan(0);
        expect(
            screen.getByText(en.translation.validation.required_fields)
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );
        expect(openToasts()).toHaveLength(1);
    });

    it('marks a malformed email without invalidating the password', async () => {
        const user = userEvent.setup();
        render(
            <>
                <LoginFormPanel
                    onSuccess={vi.fn()}
                    onSwitchToRegister={vi.fn()}
                />
                <Toaster />
            </>
        );

        await user.type(
            screen.getByLabelText(en.translation.auth.login.email_label),
            'not-an-email'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.login.password_label),
            'secret'
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );

        expect(
            screen.getByLabelText(en.translation.auth.login.email_label)
        ).toHaveAttribute('aria-invalid', 'true');
        expect(
            screen.getByLabelText(en.translation.auth.login.password_label)
        ).not.toHaveAttribute('aria-invalid', 'true');
        expect(document.getElementById('login-email-error')).toHaveClass(
            'sr-only'
        );
        expect(document.getElementById('login-email-error')).toHaveTextContent(
            en.translation.validation.invalid_email
        );
        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent(
            en.translation.validation.invalid_email
        );
        expect(loginMock).not.toHaveBeenCalled();
    });

    it('shows invalid credentials in one danger toast', async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        loginMock.mockRejectedValueOnce(
            new ApiError('These credentials do not match our records.', 422, {
                code: 'invalid_credentials',
                message: 'These credentials do not match our records.',
                errors: {
                    email: ['These credentials do not match our records.'],
                },
            })
        );

        render(
            <>
                <LoginFormPanel
                    onSuccess={onSuccess}
                    onSwitchToRegister={vi.fn()}
                />
                <Toaster />
            </>
        );

        await user.type(
            screen.getByLabelText(en.translation.auth.login.email_label),
            'person@example.com'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.login.password_label),
            'secret'
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent(
            en.translation.errors.invalid_credentials
        );
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(
            screen.queryByText('These credentials do not match our records.')
        ).not.toBeInTheDocument();
        expect(
            screen.getByLabelText(en.translation.auth.login.email_label)
        ).not.toHaveAttribute('aria-invalid', 'true');
        expect(
            screen.getByLabelText(en.translation.auth.login.password_label)
        ).not.toHaveAttribute('aria-invalid', 'true');

        loginMock.mockRejectedValueOnce(
            new ApiError('These credentials do not match our records.', 422, {
                code: 'invalid_credentials',
                message: 'These credentials do not match our records.',
                errors: {
                    email: ['These credentials do not match our records.'],
                },
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );
        expect(openToasts()).toHaveLength(1);

        loginMock.mockResolvedValueOnce(undefined);
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.login.submit,
            })
        );
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });
});
