import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { ApiError } from '@/lib/api/client';
import type { AuthUser } from '@/lib/api/auth';
import { UserSettingsDialog } from '../user-settings-dialog';

const { closeAccountMock, closeSettingsMock } = vi.hoisted(() => ({
    closeAccountMock: vi.fn(),
    closeSettingsMock: vi.fn(),
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
        updateProfile: vi.fn(),
        updateDiagramCreationPreference: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeUserSettingsDialog: closeSettingsMock,
    }),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() }),
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

describe('account danger zone', () => {
    beforeEach(() => {
        closeAccountMock.mockReset();
        closeSettingsMock.mockReset();
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
        expect(submit).toBeDisabled();
        expect(closeAccountMock).not.toHaveBeenCalled();

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
