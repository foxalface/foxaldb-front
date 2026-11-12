import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { formatRecoveryDeadline } from '@/lib/account/format-recovery-deadline';
import { ApiError } from '@/lib/api/client';

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
            screen.getByText(en.translation.auth.register.accept_terms_required)
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

        expect(
            screen.getByText(en.translation.auth.errors.first_name_required)
        ).toBeInTheDocument();
        expect(
            screen.queryByText(en.translation.auth.errors.last_name_required)
        ).not.toBeInTheDocument();
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

        expect(
            screen.getByText(en.translation.auth.errors.last_name_required)
        ).toBeInTheDocument();
        expect(
            screen.queryByText(en.translation.auth.errors.first_name_required)
        ).not.toBeInTheDocument();
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
            await screen.findByText('The email has already been taken.')
        ).toBeInTheDocument();
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

        expect(
            screen.getByText(en.translation.auth.errors.first_name_required)
        ).toBeInTheDocument();

        await user.type(
            screen.getByLabelText(
                en.translation.auth.register.first_name_label
            ),
            'Alexis'
        );

        expect(
            screen.queryByText(en.translation.auth.errors.first_name_required)
        ).not.toBeInTheDocument();
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
});
