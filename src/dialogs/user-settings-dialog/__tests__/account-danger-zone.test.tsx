import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { ApiError } from '@/lib/api/client';
import type { AuthUser } from '@/lib/api/auth';
import { UserSettingsDialog } from '../user-settings-dialog';

const { closeAccountMock, closeSettingsMock, toastMock, updateProfileMock } =
    vi.hoisted(() => ({
        closeAccountMock: vi.fn(),
        closeSettingsMock: vi.fn(),
        toastMock: vi.fn(),
        updateProfileMock: vi.fn(),
    }));

const user: AuthUser = {
    id: 7,
    first_name: 'Alexis',
    last_name: 'Renart',
    full_name: 'Alexis Renart',
    email: 'alexis@example.com',
    email_verified_at: '2026-01-02T03:04:05.000Z',
    default_diagram_creation_destination: null,
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        user,
        closeAccount: closeAccountMock,
        updateProfile: updateProfileMock,
        updateDiagramCreationPreference: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeUserSettingsDialog: closeSettingsMock,
    }),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({ toast: toastMock }),
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

describe('settings password fields', () => {
    it('toggles current, new, and confirmation passwords independently', async () => {
        const actor = userEvent.setup();
        render(<UserSettingsDialog dialog={{ open: true }} />);

        const current = screen.getByLabelText(
            en.translation.auth.settings.current_password_label
        );
        const next = screen.getByLabelText(
            en.translation.auth.settings.new_password_label
        );
        const confirmation = screen.getByLabelText(
            en.translation.auth.settings.password_confirmation_label
        );
        await actor.type(current, 'current-secret');
        await actor.type(next, 'next-secret');
        await actor.type(confirmation, 'confirm-secret');

        const toggles = screen.getAllByRole('button', {
            name: en.translation.auth.password_visibility.show,
        });
        await actor.click(toggles[1]);

        expect(current).toHaveAttribute('type', 'password');
        expect(next).toHaveAttribute('type', 'text');
        expect(next).toHaveValue('next-secret');
        expect(confirmation).toHaveAttribute('type', 'password');
        expect(current).toHaveValue('current-secret');
        expect(confirmation).toHaveValue('confirm-secret');
    });
});

describe('account danger zone', () => {
    beforeEach(() => {
        closeAccountMock.mockReset();
        closeSettingsMock.mockReset();
        toastMock.mockReset();
        updateProfileMock.mockReset();
    });

    it('uses a viewport-constrained scrollable settings body', () => {
        render(<UserSettingsDialog dialog={{ open: true }} />);

        const scrollBody = screen.getByTestId('user-settings-scroll-body');
        expect(scrollBody).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto');
        const dialogContent = scrollBody.parentElement;
        expect(dialogContent).toHaveClass('max-h-dvh', 'overflow-hidden');
        expect(
            screen.getByRole('heading', {
                name: en.translation.auth.settings.danger_zone.title,
            })
        ).toBeInTheDocument();
    });

    it('requires the current password and closes the signed-in session after success', async () => {
        const actor = userEvent.setup();
        closeAccountMock.mockResolvedValue(undefined);

        render(<UserSettingsDialog dialog={{ open: true }} />);

        expect(
            screen.getByRole('heading', {
                name: en.translation.auth.settings.danger_zone.title,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                en.translation.auth.settings.danger_zone.description
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                en.translation.auth.settings.danger_zone.device_warning
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                en.translation.auth.settings.danger_zone.description
            )
        ).toHaveTextContent('90');

        await actor.click(
            screen.getByRole('button', {
                name: en.translation.auth.settings.danger_zone.delete_account,
            })
        );

        const confirm = within(
            screen.getByRole('dialog', {
                name: en.translation.auth.settings.danger_zone.confirm_title,
            })
        );
        const submit = confirm.getByRole('button', {
            name: en.translation.auth.settings.danger_zone.submit,
        });
        expect(submit).toBeEnabled();
        await actor.click(submit);
        expect(closeAccountMock).not.toHaveBeenCalled();
        expect(
            await confirm.findByText(en.translation.validation.required)
        ).toBeInTheDocument();
        expect(toastMock).toHaveBeenCalledTimes(1);

        const password = confirm.getByLabelText(
            en.translation.auth.settings.danger_zone.current_password_label
        );
        await actor.type(password, 'wrong-password');
        closeAccountMock.mockRejectedValueOnce(
            new ApiError('invalid', 422, {
                code: 'current_password_invalid',
                errors: { current_password: ['The password is incorrect.'] },
            })
        );
        await actor.click(submit);
        expect(
            await screen.findByText(
                en.translation.auth.settings.danger_zone
                    .current_password_invalid
            )
        ).toBeInTheDocument();
        expect(
            screen.queryByText('The password is incorrect.')
        ).not.toBeInTheDocument();
        expect(closeSettingsMock).not.toHaveBeenCalled();

        closeAccountMock.mockResolvedValueOnce(undefined);
        await actor.clear(password);
        await actor.type(password, 'correct-password');
        await actor.click(submit);

        expect(closeAccountMock).toHaveBeenLastCalledWith('correct-password');
        expect(closeSettingsMock).toHaveBeenCalledTimes(1);
    });
});

describe('settings profile and password validation', () => {
    beforeEach(() => {
        toastMock.mockReset();
        updateProfileMock.mockReset();
        updateProfileMock.mockResolvedValue(undefined);
    });

    it('highlights a missing profile field and shows one toast', async () => {
        const actor = userEvent.setup();
        render(<UserSettingsDialog dialog={{ open: true }} />);

        const form = screen
            .getByRole('button', {
                name: en.translation.auth.settings.submit,
            })
            .closest('form');
        expect(form).toHaveProperty('noValidate', true);

        await actor.clear(
            screen.getByLabelText(en.translation.auth.settings.first_name_label)
        );
        await actor.click(
            screen.getByRole('button', {
                name: en.translation.auth.settings.submit,
            })
        );

        expect(
            screen.getByLabelText(en.translation.auth.settings.first_name_label)
        ).toHaveAttribute('aria-invalid', 'true');
        expect(
            screen.getByText(en.translation.validation.required)
        ).toBeInTheDocument();
        expect(updateProfileMock).not.toHaveBeenCalled();
        expect(toastMock).toHaveBeenCalledTimes(1);
    });

    it('maps a unique email rule without showing Laravel prose', async () => {
        const actor = userEvent.setup();
        updateProfileMock.mockRejectedValueOnce(
            new ApiError('The email has already been taken.', 422, {
                code: 'validation_failed',
                message: 'The email has already been taken.',
                errors: {
                    email: ['The email has already been taken.'],
                },
                fields: {
                    email: [
                        {
                            code: 'unique',
                            message: 'The email has already been taken.',
                        },
                    ],
                },
            })
        );
        render(<UserSettingsDialog dialog={{ open: true }} />);

        await actor.click(
            screen.getByRole('button', {
                name: en.translation.auth.settings.submit,
            })
        );

        expect(
            await screen.findByText(en.translation.validation.already_used)
        ).toBeInTheDocument();
        expect(
            screen.queryByText('The email has already been taken.')
        ).not.toBeInTheDocument();
        expect(toastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: en.translation.validation.already_used,
                variant: 'danger',
            })
        );
    });

    it('checks password confirmation and localizes a wrong current password', async () => {
        const actor = userEvent.setup();
        render(<UserSettingsDialog dialog={{ open: true }} />);

        await actor.type(
            screen.getByLabelText(
                en.translation.auth.settings.current_password_label
            ),
            'current-secret'
        );
        await actor.type(
            screen.getByLabelText(
                en.translation.auth.settings.new_password_label
            ),
            'next-secret'
        );
        await actor.type(
            screen.getByLabelText(
                en.translation.auth.settings.password_confirmation_label
            ),
            'other-secret'
        );
        await actor.click(
            screen.getByRole('button', {
                name: en.translation.auth.settings.submit,
            })
        );

        expect(
            document.getElementById('settings-password-confirmation-error')
        ).toHaveClass('sr-only');
        expect(updateProfileMock).not.toHaveBeenCalled();
        expect(toastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: en.translation.validation.password_confirmation,
                variant: 'danger',
            })
        );

        await actor.clear(
            screen.getByLabelText(
                en.translation.auth.settings.password_confirmation_label
            )
        );
        await actor.type(
            screen.getByLabelText(
                en.translation.auth.settings.password_confirmation_label
            ),
            'next-secret'
        );
        updateProfileMock.mockRejectedValueOnce(
            new ApiError('The password is incorrect.', 422, {
                code: 'current_password_invalid',
                message: 'The password is incorrect.',
                errors: {
                    current_password: ['The password is incorrect.'],
                },
            })
        );
        await actor.click(
            screen.getByRole('button', {
                name: en.translation.auth.settings.submit,
            })
        );

        expect(
            await screen.findByText(
                en.translation.auth.settings.danger_zone
                    .current_password_invalid
            )
        ).toBeInTheDocument();
        expect(
            screen.queryByText('The password is incorrect.')
        ).not.toBeInTheDocument();
        expect(toastMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                title: en.translation.auth.settings.danger_zone
                    .current_password_invalid,
                variant: 'danger',
            })
        );
    });

    it('shows a localized session-expired error', async () => {
        const actor = userEvent.setup();
        updateProfileMock.mockRejectedValueOnce(
            new ApiError('CSRF token mismatch.', 419, null)
        );
        render(<UserSettingsDialog dialog={{ open: true }} />);

        await actor.click(
            screen.getByRole('button', {
                name: en.translation.auth.settings.submit,
            })
        );

        expect(toastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: en.translation.errors.session_expired,
                variant: 'danger',
            })
        );
        expect(
            screen.queryByText('CSRF token mismatch.')
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
