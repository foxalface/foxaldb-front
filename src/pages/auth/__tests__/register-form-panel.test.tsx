import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { ApiError } from '@/lib/api/client';

const { registerMock } = vi.hoisted(() => ({
    registerMock: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        register: registerMock,
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

import { RegisterFormPanel } from '../auth-form-panels';

describe('RegisterFormPanel', () => {
    beforeEach(() => {
        registerMock.mockReset();
        registerMock.mockResolvedValue(undefined);
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
                'password'
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
                'password'
            );
        });
    });
});
