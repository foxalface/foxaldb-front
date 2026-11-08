import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { VerifyEmailScreen } from '../verify-email-screen';

const authState = {
    user: {
        id: 1,
        email: 'alexis@example.com',
        email_verified_at: null as string | null,
    },
    isAuthenticated: true,
    isEmailVerified: false,
    refreshSession: vi.fn(),
    logout: vi.fn(),
};

const resendVerificationEmail = vi.fn();

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, values?: { seconds?: number }) =>
            values?.seconds !== undefined ? `${key}:${values.seconds}` : key,
    }),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/lib/api/auth', () => ({
    resendVerificationEmail: (...args: unknown[]) =>
        resendVerificationEmail(...args),
}));

describe('VerifyEmailScreen', () => {
    beforeEach(() => {
        authState.user.email_verified_at = null;
        authState.isAuthenticated = true;
        authState.isEmailVerified = false;
        authState.refreshSession.mockReset();
        authState.logout.mockReset();
        resendVerificationEmail.mockReset();
    });

    it('shows the unverified gate and reports a successful resend', async () => {
        resendVerificationEmail.mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <VerifyEmailScreen />
            </MemoryRouter>
        );

        expect(screen.getByText('auth.verify.title')).toBeTruthy();
        expect(screen.getByText('alexis@example.com')).toBeTruthy();

        await user.click(
            screen.getByRole('button', { name: 'auth.verify.resend' })
        );

        expect(resendVerificationEmail).toHaveBeenCalledTimes(1);
        expect(screen.getByText('auth.verify.sent')).toBeTruthy();
        expect(screen.getByText('auth.verify.cooldown:60')).toBeTruthy();
    });

    it('shows a failure and cooldown when resend is throttled', async () => {
        resendVerificationEmail.mockRejectedValue(
            new ApiError('Too Many Attempts.', 429, null)
        );
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <VerifyEmailScreen />
            </MemoryRouter>
        );

        await user.click(
            screen.getByRole('button', { name: 'auth.verify.resend' })
        );

        expect(screen.getByText('auth.verify.resend_failure')).toBeTruthy();
        expect(screen.getByText('auth.verify.cooldown:60')).toBeTruthy();
    });

    it('offers sign in when a verified link has no session', () => {
        authState.user.email_verified_at = null;
        authState.isAuthenticated = false;

        render(
            <MemoryRouter>
                <VerifyEmailScreen status="verified" />
            </MemoryRouter>
        );

        expect(screen.getByText('auth.verify.verified_title')).toBeTruthy();
        expect(
            screen.getByRole('link', { name: 'auth.verify.sign_in' })
        ).toBeTruthy();
    });

    it('shows the invalid state for an expired link while signed in', () => {
        render(
            <MemoryRouter>
                <VerifyEmailScreen status="invalid" />
            </MemoryRouter>
        );

        expect(screen.getByText('auth.verify.invalid_title')).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'auth.verify.resend' })
        ).toBeTruthy();
    });
});
