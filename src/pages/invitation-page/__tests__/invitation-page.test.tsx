import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import type { AuthUser } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

const { authState, inspectInvitationMock, acceptInvitationMock, logoutMock } =
    vi.hoisted(() => ({
        authState: {
            user: null as AuthUser | null,
            isAuthenticated: false,
            isEmailVerified: false,
            isLoading: false,
        },
        inspectInvitationMock: vi.fn(),
        acceptInvitationMock: vi.fn(),
        logoutMock: vi.fn(),
    }));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        ...authState,
        refreshSession: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        logout: logoutMock,
        fetchUser: vi.fn(),
        updateProfile: vi.fn(),
        updateDiagramCreationPreference: vi.fn(),
    }),
}));

vi.mock('@/lib/api/diagram-invitation', () => ({
    inspectInvitation: inspectInvitationMock,
    acceptInvitation: acceptInvitationMock,
    invitationErrorCode: (error: unknown): string | null => {
        if (
            typeof error === 'object' &&
            error !== null &&
            'payload' in error &&
            typeof error.payload === 'object' &&
            error.payload !== null &&
            'code' in error.payload &&
            typeof error.payload.code === 'string'
        ) {
            return error.payload.code;
        }

        return null;
    },
}));

vi.mock('@/pages/auth/auth-form-panels', () => ({
    LoginFormPanel: ({ onSuccess }: { onSuccess: () => void }) => (
        <button type="button" onClick={onSuccess}>
            login-success
        </button>
    ),
    RegisterFormPanel: ({
        lockedEmail,
        invitationToken,
        onSuccess,
    }: {
        lockedEmail?: string;
        invitationToken?: string;
        onSuccess: () => void;
    }) => (
        <div>
            <span>locked:{lockedEmail}</span>
            <span>token:{invitationToken}</span>
            <button type="button" onClick={onSuccess}>
                register-success
            </button>
        </div>
    ),
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
            return current.replace(/{{(\w+)}}/g, (_, name: string) => {
                return values[name] ?? '';
            });
        },
    }),
}));

import { InvitationPage } from '../invitation-page';
import { router } from '@/router';

const validInvitation = {
    status: 'valid' as const,
    email: 'guest@example.com',
    diagramName: 'Billing schema',
    role: 'viewer' as const,
    inviterDisplayName: 'Alexis Renart',
    expiresAt: '2026-11-15T12:00:00.000Z',
};

const renderInvitation = (token = 'secret-token') =>
    render(
        <HelmetProvider>
            <MemoryRouter initialEntries={[`/invitations/${token}`]}>
                <Routes>
                    <Route
                        path="/invitations/:token"
                        element={<InvitationPage />}
                    />
                    <Route
                        path="/diagrams/:diagramId"
                        element={<div>diagram-opened</div>}
                    />
                </Routes>
            </MemoryRouter>
        </HelmetProvider>
    );

describe('InvitationPage', () => {
    beforeEach(() => {
        authState.user = null;
        authState.isAuthenticated = false;
        authState.isEmailVerified = false;
        authState.isLoading = false;
        inspectInvitationMock.mockReset();
        acceptInvitationMock.mockReset();
        logoutMock.mockReset();
        inspectInvitationMock.mockResolvedValue(validInvitation);
        localStorage.clear();
        sessionStorage.clear();
    });

    it('shows a logged-out invitation and keeps the token out of storage', async () => {
        const user = userEvent.setup();
        const setItem = vi.spyOn(Storage.prototype, 'setItem');

        renderInvitation();

        expect(await screen.findByText('Alexis Renart')).toBeInTheDocument();
        expect(screen.getByText('Billing schema')).toBeInTheDocument();
        expect(screen.getByText('guest@example.com')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Create account' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Sign in' })
        ).toBeInTheDocument();
        expect(acceptInvitationMock).not.toHaveBeenCalled();

        await user.click(
            screen.getByRole('button', { name: 'Create account' })
        );
        expect(
            screen.getByText('locked:guest@example.com')
        ).toBeInTheDocument();
        expect(screen.getByText('token:secret-token')).toBeInTheDocument();

        const stored = setItem.mock.calls.map((call) => String(call[1]));
        expect(stored.some((value) => value.includes('secret-token'))).toBe(
            false
        );
        setItem.mockRestore();
    });

    it('does not auto-accept after the matching account becomes verified', async () => {
        const user = userEvent.setup();
        authState.isAuthenticated = true;
        authState.isEmailVerified = false;
        authState.user = {
            id: 2,
            first_name: 'Guest',
            last_name: 'User',
            full_name: 'Guest User',
            email: 'guest@example.com',
            email_verified_at: null,
            default_diagram_creation_destination: null,
        };

        const view = renderInvitation();
        expect(
            await screen.findByRole('button', { name: 'Resend email' })
        ).toBeInTheDocument();
        expect(acceptInvitationMock).not.toHaveBeenCalled();

        authState.isEmailVerified = true;
        authState.user = {
            ...authState.user,
            email_verified_at: '2026-11-08T12:00:00.000Z',
        };
        view.rerender(
            <HelmetProvider>
                <MemoryRouter initialEntries={['/invitations/secret-token']}>
                    <Routes>
                        <Route
                            path="/invitations/:token"
                            element={<InvitationPage />}
                        />
                        <Route
                            path="/diagrams/:diagramId"
                            element={<div>diagram-opened</div>}
                        />
                    </Routes>
                </MemoryRouter>
            </HelmetProvider>
        );

        await user.click(
            await screen.findByRole('button', { name: 'Accept invitation' })
        );
        expect(acceptInvitationMock).toHaveBeenCalledTimes(1);
        expect(acceptInvitationMock).toHaveBeenCalledWith('secret-token');
    });

    it('navigates to the diagram only after an explicit accept', async () => {
        const user = userEvent.setup();
        authState.isAuthenticated = true;
        authState.isEmailVerified = true;
        authState.user = {
            id: 2,
            first_name: 'Guest',
            last_name: 'User',
            full_name: 'Guest User',
            email: 'guest@example.com',
            email_verified_at: '2026-11-08T12:00:00.000Z',
            default_diagram_creation_destination: null,
        };
        acceptInvitationMock.mockResolvedValue({
            status: 'accepted',
            diagramId: 42,
            role: 'viewer',
        });

        renderInvitation();
        await user.click(
            await screen.findByRole('button', { name: 'Accept invitation' })
        );

        expect(await screen.findByText('diagram-opened')).toBeInTheDocument();
    });

    it('keeps a wrong account on the invitation route and can sign out', async () => {
        const user = userEvent.setup();
        authState.isAuthenticated = true;
        authState.isEmailVerified = true;
        authState.user = {
            id: 3,
            first_name: 'Other',
            last_name: 'User',
            full_name: 'Other User',
            email: 'other@example.com',
            email_verified_at: '2026-11-08T12:00:00.000Z',
            default_diagram_creation_destination: null,
        };

        renderInvitation();

        expect(
            await screen.findByText(
                'This invitation was sent to guest@example.com. You are currently signed in as other@example.com.'
            )
        ).toBeInTheDocument();
        await user.click(
            screen.getByRole('button', { name: 'Sign out and switch account' })
        );
        expect(logoutMock).toHaveBeenCalled();
        expect(acceptInvitationMock).not.toHaveBeenCalled();
    });

    it('shows expired, revoked, accepted, and invalid states', async () => {
        inspectInvitationMock.mockResolvedValueOnce({ status: 'expired' });
        const expired = renderInvitation();
        expect(
            await screen.findByText('This invitation has expired.')
        ).toBeInTheDocument();
        expired.unmount();

        inspectInvitationMock.mockResolvedValueOnce({ status: 'revoked' });
        const revoked = renderInvitation();
        expect(
            await screen.findByText('This invitation has been revoked.')
        ).toBeInTheDocument();
        revoked.unmount();

        inspectInvitationMock.mockResolvedValueOnce({ status: 'accepted' });
        const accepted = renderInvitation();
        expect(
            await screen.findByText(
                'This invitation has already been accepted.'
            )
        ).toBeInTheDocument();
        accepted.unmount();

        inspectInvitationMock.mockRejectedValueOnce(
            new ApiError('missing', 404, { message: 'missing' })
        );
        renderInvitation('missing-token');
        expect(
            await screen.findByText('This invitation link is not valid.')
        ).toBeInTheDocument();
    });

    it('keeps the invitation route outside the editor entry routes', () => {
        const invitation = router.routes.find(
            (route) => route.path === 'invitations/:token'
        );
        const editor = router.routes.find((route) => route.path === '/');

        expect(invitation).toBeDefined();
        expect(
            editor?.children?.some((child) =>
                String(child.path).includes('invitation')
            )
        ).toBe(false);
    });
});
