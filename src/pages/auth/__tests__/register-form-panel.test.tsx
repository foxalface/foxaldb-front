import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { formatRecoveryDeadline } from '@/lib/account/format-recovery-deadline';
import { ApiError } from '@/lib/api/client';
import { Toaster } from '@/components/toast/toaster';
import { dismiss, toast } from '@/components/toast/use-toast';

const { registerMock, requestAccountRecoveryMock } = vi.hoisted(() => ({
    registerMock: vi.fn(),
    requestAccountRecoveryMock: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
    requestAccountRecovery: requestAccountRecoveryMock,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        register: registerMock,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, values?: Record<string, string>) => {
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
            if (typeof current !== 'string') {
                return key;
            }
            if (!values) {
                return current;
            }
            return current.replace(
                /\{\{(\w+)\}\}/g,
                (_match, name: string) => values[name] ?? ''
            );
        },
        i18n: { language: 'en' },
    }),
}));

import { RegisterFormPanel } from '../auth-form-panels';

const checkAcceptTerms = async (user: ReturnType<typeof userEvent.setup>) => {
    const checkbox = screen.getByRole('checkbox', {
        name: /Terms of Use/i,
    });
    if (checkbox.getAttribute('aria-checked') !== 'true') {
        await user.click(checkbox);
    }
};

describe('RegisterFormPanel', () => {
    beforeEach(() => {
        registerMock.mockReset();
        requestAccountRecoveryMock.mockReset();
        registerMock.mockResolvedValue(undefined);
        requestAccountRecoveryMock.mockResolvedValue(undefined);
        localStorage.clear();
        sessionStorage.clear();
        dismiss();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders first name and last name inputs', () => {
        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        expect(
            screen.getByLabelText(en.translation.auth.register.first_name_label)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(en.translation.auth.register.last_name_label)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('checkbox', { name: /Terms of Use/i })
        ).not.toBeChecked();
        const termsLink = screen.getByRole('link', { name: 'Terms of Use' });
        const privacyLink = screen.getByRole('link', {
            name: 'Privacy Policy',
        });
        expect(termsLink).toHaveAttribute('href', '/terms');
        expect(privacyLink).toHaveAttribute('href', '/privacy');
        expect(termsLink).toHaveAttribute('target', '_blank');
        expect(privacyLink).toHaveAttribute('target', '_blank');
        expect(termsLink.getAttribute('rel')).toContain('noopener');
        expect(termsLink.getAttribute('rel')).toContain('noreferrer');
    });

    it('does not check the box when the Terms link is used', async () => {
        const user = userEvent.setup();
        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        await user.click(screen.getByRole('link', { name: 'Terms of Use' }));

        expect(
            screen.getByRole('checkbox', { name: /Terms of Use/i })
        ).not.toBeChecked();
    });

    it('blocks registration until the Terms are accepted', async () => {
        const user = userEvent.setup();
        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Alexis'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            'Renart'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.email_label),
            'alexis@example.com'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.password_label),
            'password'
        );
        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.password_confirmation_label
            ),
            'password'
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        expect(
            screen.getByText(en.translation.validation.required)
        ).toBeInTheDocument();
        expect(registerMock).not.toHaveBeenCalled();
    });

    it('rejects whitespace-only first name without invalidating last name', async () => {
        const user = userEvent.setup();

        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            '   '
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            'Renart'
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        const firstName = screen.getByLabelText(
            en.translation.auth.register.first_name_label
        );
        const lastName = screen.getByLabelText(
            en.translation.auth.register.last_name_label
        );

        expect(firstName).toHaveAttribute('aria-invalid', 'true');
        expect(lastName).not.toHaveAttribute('aria-invalid');
        expect(registerMock).not.toHaveBeenCalled();
    });

    it('rejects whitespace-only last name without invalidating first name', async () => {
        const user = userEvent.setup();

        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Alexis'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            '   '
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        const firstName = screen.getByLabelText(
            en.translation.auth.register.first_name_label
        );
        const lastName = screen.getByLabelText(
            en.translation.auth.register.last_name_label
        );

        expect(lastName).toHaveAttribute('aria-invalid', 'true');
        expect(firstName).not.toHaveAttribute('aria-invalid');
        expect(registerMock).not.toHaveBeenCalled();
    });

    it('submits trimmed names on successful registration', async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        render(
            <RegisterFormPanel
                onSuccess={onSuccess}
                onSwitchToLogin={vi.fn()}
            />
        );

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            '  Alexis  '
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            '  Renart  '
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.email_label),
            'alexis@example.com'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.password_label),
            'password'
        );
        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.password_confirmation_label
            ),
            'password'
        );
        await checkAcceptTerms(user);
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        await waitFor(() => {
            expect(registerMock).toHaveBeenCalledWith(
                'Alexis',
                'Renart',
                'alexis@example.com',
                'password',
                'password',
                true
            );
        });
        expect(onSuccess).toHaveBeenCalled();
    });

    it('maps backend validation errors to the matching field', async () => {
        const user = userEvent.setup();
        registerMock.mockRejectedValueOnce(
            new ApiError('Validation failed', 422, {
                message: 'Validation failed',
                errors: {
                    email: ['The email has already been taken.'],
                },
            })
        );

        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Alexis'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            'Renart'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.email_label),
            'taken@example.com'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.password_label),
            'password'
        );
        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.password_confirmation_label
            ),
            'password'
        );
        await checkAcceptTerms(user);
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        expect(
            await screen.findByText(en.translation.validation.invalid)
        ).toBeInTheDocument();
        expect(
            screen.queryByText('The email has already been taken.')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(en.translation.auth.errors.first_name_required)
        ).not.toBeInTheDocument();
    });

    it('clears a field error when the user edits that field', async () => {
        const user = userEvent.setup();

        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        const firstName = screen.getByLabelText(
            en.translation.auth.register.first_name_label
        );

        expect(firstName).toHaveAttribute('aria-invalid', 'true');

        await user.type(firstName, 'Alexis');

        expect(firstName).not.toHaveAttribute('aria-invalid');
        expect(document.getElementById('register-first-name-error')).toBeNull();
    });

    it('accepts international names', async () => {
        const user = userEvent.setup();

        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Élodie'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            'Nguyễn'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.email_label),
            'elodie@example.com'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.password_label),
            'password'
        );
        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.password_confirmation_label
            ),
            'password'
        );
        await checkAcceptTerms(user);
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        await waitFor(() => {
            expect(registerMock).toHaveBeenCalledWith(
                'Élodie',
                'Nguyễn',
                'elodie@example.com',
                'password',
                'password',
                true
            );
        });
    });

    const fillRegisterForm = async (
        user: ReturnType<typeof userEvent.setup>,
        email = 'recoverable@example.com'
    ) => {
        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Alexis'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            'Renart'
        );
        if (screen.getByLabelText(en.translation.auth.register.email_label)) {
            const emailInput = screen.getByLabelText(
                en.translation.auth.register.email_label
            );
            if (!(emailInput as HTMLInputElement).disabled) {
                await user.type(emailInput, email);
            }
        }
        await user.type(
            screen.getByLabelText(en.translation.auth.register.password_label),
            'password'
        );
        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.password_confirmation_label
            ),
            'password'
        );
        await checkAcceptTerms(user);
    };

    it('shows a recoverable account and requests restoration without leaving the page', async () => {
        const user = userEvent.setup();
        const until = '2026-12-01T15:04:00.000Z';
        registerMock.mockRejectedValueOnce(
            new ApiError('recoverable', 422, {
                message:
                    en.translation.auth.account_recovery
                        .recoverable_description,
                code: 'account_recoverable',
                recoverable_until: until,
                errors: {
                    email: [
                        en.translation.auth.account_recovery
                            .recoverable_description,
                    ],
                },
            })
        );

        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );
        await fillRegisterForm(user);
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        expect(
            await screen.findByText(
                en.translation.auth.account_recovery.recoverable_description
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                en.translation.auth.account_recovery.recoverable_until.replace(
                    '{{date}}',
                    formatRecoveryDeadline(until, 'en')
                )
            )
        ).toBeInTheDocument();
        expect(
            screen.queryByText('The email has already been taken.')
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.account_recovery.restore_action,
            })
        );

        await waitFor(() => {
            expect(requestAccountRecoveryMock).toHaveBeenCalledWith(
                'recoverable@example.com'
            );
        });
        expect(
            await screen.findByText(
                en.translation.auth.account_recovery.instructions_sent
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: en.translation.auth.register.title,
            })
        ).toBeInTheDocument();
    });

    it('shows account_unavailable without a restore action', async () => {
        const user = userEvent.setup();
        registerMock.mockRejectedValueOnce(
            new ApiError('unavailable', 422, {
                code: 'account_unavailable',
                message: en.translation.auth.account_recovery.unavailable,
                errors: {
                    email: [en.translation.auth.account_recovery.unavailable],
                },
            })
        );

        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );
        await fillRegisterForm(user, 'expired@example.com');
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        expect(
            await screen.findByText(
                en.translation.auth.account_recovery.unavailable
            )
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: en.translation.auth.account_recovery.restore_action,
            })
        ).not.toBeInTheDocument();
        expect(requestAccountRecoveryMock).not.toHaveBeenCalled();
    });

    it('keeps an invitation token out of storage while offering recovery', async () => {
        const user = userEvent.setup();
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        registerMock.mockRejectedValueOnce(
            new ApiError('recoverable', 422, {
                code: 'account_recoverable',
                recoverable_until: '2026-12-01T15:04:00.000Z',
                errors: { email: ['reserved'] },
            })
        );

        render(
            <RegisterFormPanel
                invitationToken="invite-secret"
                lockedEmail="guest@example.com"
                onSuccess={vi.fn()}
                onSwitchToLogin={vi.fn()}
            />
        );
        await fillRegisterForm(user);
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );
        await user.click(
            await screen.findByRole('button', {
                name: en.translation.auth.account_recovery.restore_action,
            })
        );

        await waitFor(() => {
            expect(requestAccountRecoveryMock).toHaveBeenCalledWith(
                'guest@example.com'
            );
        });
        expect(registerMock).toHaveBeenCalledWith(
            'Alexis',
            'Renart',
            'guest@example.com',
            'password',
            'password',
            true,
            'invite-secret'
        );
        const stored = setItem.mock.calls.map((call) => String(call[1]));
        expect(stored.join(' ')).not.toContain('invite-secret');
        expect(localStorage.getItem('invite-secret')).toBeNull();
        expect(sessionStorage.getItem('invite-secret')).toBeNull();
    });

    it('toggles password and confirmation independently', async () => {
        const user = userEvent.setup();
        render(
            <RegisterFormPanel onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        );

        const password = screen.getByLabelText(
            en.translation.auth.register.password_label
        );
        const confirmation = screen.getByLabelText(
            en.translation.auth.register.password_confirmation_label
        );
        await user.type(password, 'secret-value');
        await user.type(confirmation, 'other-value');

        const toggles = screen.getAllByRole('button', {
            name: en.translation.auth.password_visibility.show,
        });
        await user.click(toggles[0]);

        expect(password).toHaveAttribute('type', 'text');
        expect(password).toHaveValue('secret-value');
        expect(confirmation).toHaveAttribute('type', 'password');
        expect(confirmation).toHaveValue('other-value');
    });

    const openToasts = () => document.querySelectorAll('li[data-state="open"]');

    const renderRegister = () =>
        render(
            <>
                <Toaster />
                <RegisterFormPanel
                    onSuccess={vi.fn()}
                    onSwitchToLogin={vi.fn()}
                />
            </>
        );

    it('marks every missing required control and shows one toast', async () => {
        const user = userEvent.setup();
        const reportValidity = vi.spyOn(
            HTMLFormElement.prototype,
            'reportValidity'
        );
        renderRegister();

        const form = document.getElementById('auth-register-form');
        expect(form).toHaveAttribute('novalidate');
        expect(form).toHaveProperty('noValidate', true);

        for (const id of [
            'register-first-name',
            'register-last-name',
            'register-email',
            'register-password',
            'register-password-confirmation',
        ]) {
            expect(document.getElementById(id)).toBeRequired();
        }

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        const firstName = screen.getByLabelText(
            en.translation.auth.register.first_name_label
        );
        const lastName = screen.getByLabelText(
            en.translation.auth.register.last_name_label
        );
        const email = screen.getByLabelText(
            en.translation.auth.register.email_label
        );
        const password = screen.getByLabelText(
            en.translation.auth.register.password_label
        );
        const confirmation = screen.getByLabelText(
            en.translation.auth.register.password_confirmation_label
        );
        const terms = screen.getByRole('checkbox', { name: /Terms of Use/i });

        for (const control of [
            firstName,
            lastName,
            email,
            password,
            confirmation,
            terms,
        ]) {
            expect(control).toHaveAttribute('aria-invalid', 'true');
            expect(control).toHaveClass('border-destructive');
        }

        expect(firstName).toHaveAttribute(
            'aria-describedby',
            'register-first-name-error'
        );
        expect(password).toHaveAttribute(
            'aria-describedby',
            'register-password-error'
        );
        expect(confirmation).toHaveAttribute(
            'aria-describedby',
            'register-password-confirmation-error'
        );
        expect(terms).toHaveAttribute(
            'aria-describedby',
            'register-accept-terms-error'
        );
        expect(
            document.getElementById('register-first-name-error')
        ).toHaveTextContent(en.translation.validation.required);
        expect(
            document.getElementById('register-first-name-error')
        ).toHaveClass('sr-only');
        expect(
            document.getElementById('register-first-name-error')
        ).not.toHaveAttribute('role', 'alert');
        expect(firstName).toHaveFocus();
        expect(registerMock).not.toHaveBeenCalled();
        expect(reportValidity).not.toHaveBeenCalled();

        const visible = openToasts();
        expect(visible).toHaveLength(1);
        expect(visible[0]).toHaveClass('destructive');
        expect(visible[0]).toHaveTextContent(
            en.translation.validation.required_fields
        );

        const showPassword = screen.getAllByRole('button', {
            name: en.translation.auth.password_visibility.show,
        })[0];
        await user.click(showPassword);
        expect(password).toHaveAttribute('type', 'text');
        expect(password).toHaveAttribute('aria-invalid', 'true');
        expect(password).toHaveAttribute('autocomplete', 'new-password');

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );
        expect(openToasts()).toHaveLength(1);

        reportValidity.mockRestore();
    });

    it('focuses the first invalid control after a partial submit', async () => {
        const user = userEvent.setup();
        renderRegister();

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Alexis'
        );
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        expect(
            screen.getByLabelText(en.translation.auth.register.last_name_label)
        ).toHaveFocus();
        expect(
            screen.getByLabelText(en.translation.auth.register.first_name_label)
        ).not.toHaveAttribute('aria-invalid');
    });

    it('uses the email message and one attention toast for a malformed email', async () => {
        const user = userEvent.setup();
        renderRegister();

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Alexis'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            'Renart'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.email_label),
            'not-an-email'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.password_label),
            'password'
        );
        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.password_confirmation_label
            ),
            'password'
        );
        await checkAcceptTerms(user);
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        const email = screen.getByLabelText(
            en.translation.auth.register.email_label
        );
        expect(email).toHaveAttribute('aria-invalid', 'true');
        expect(email).toHaveAttribute(
            'aria-describedby',
            'register-email-error'
        );
        expect(
            document.getElementById('register-email-error')
        ).toHaveTextContent(en.translation.validation.invalid_email);
        expect(
            screen.getByLabelText(en.translation.auth.register.password_label)
        ).not.toHaveAttribute('aria-invalid');
        expect(registerMock).not.toHaveBeenCalled();

        const visible = openToasts();
        expect(visible).toHaveLength(1);
        expect(visible[0]).toHaveTextContent(
            en.translation.validation.invalid_email
        );
    });

    it('marks a password confirmation mismatch without a second toast', async () => {
        const user = userEvent.setup();
        renderRegister();

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Alexis'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.last_name_label),
            'Renart'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.email_label),
            'alexis@example.com'
        );
        await user.type(
            screen.getByLabelText(en.translation.auth.register.password_label),
            'password'
        );
        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.password_confirmation_label
            ),
            'different'
        );
        await checkAcceptTerms(user);
        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        const confirmation = screen.getByLabelText(
            en.translation.auth.register.password_confirmation_label
        );
        expect(confirmation).toHaveAttribute('aria-invalid', 'true');
        expect(
            document.getElementById('register-password-confirmation-error')
        ).toHaveTextContent(en.translation.validation.password_confirmation);
        expect(
            screen.getByLabelText(en.translation.auth.register.password_label)
        ).not.toHaveAttribute('aria-invalid');
        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent(
            en.translation.validation.password_confirmation
        );
        expect(registerMock).not.toHaveBeenCalled();
    });

    it('keeps a status toast visible beside the register error toast', async () => {
        const user = userEvent.setup();
        renderRegister();

        act(() => {
            toast({ title: 'Diagram ready', duration: 60_000 });
        });

        await user.click(
            screen.getByRole('button', {
                name: en.translation.auth.register.submit,
            })
        );

        const visible = openToasts();
        expect(visible).toHaveLength(2);
        expect(visible[0]).toHaveTextContent('Diagram ready');
        expect(visible[1]).toHaveTextContent(
            en.translation.validation.required_fields
        );
        expect(visible[1]).toHaveClass('destructive');
    });
});
