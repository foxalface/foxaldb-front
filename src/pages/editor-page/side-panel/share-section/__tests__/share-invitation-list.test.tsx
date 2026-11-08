import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { ApiError } from '@/lib/api/client';
import type { DiagramInvitationResource } from '@/lib/api/diagram-invitations';

const { resendMock, revokeMock, updateMock, toastMock } = vi.hoisted(() => ({
    resendMock: vi.fn(),
    revokeMock: vi.fn(),
    updateMock: vi.fn(),
    toastMock: vi.fn(),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/lib/api/diagram-invitations', () => ({
    resendDiagramInvitation: resendMock,
    revokeDiagramInvitation: revokeMock,
    updateDiagramInvitationRole: updateMock,
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
        i18n: { language: 'en' },
    }),
}));

import { ShareInvitationList } from '../share-invitation-list';

const invitation = (
    status: DiagramInvitationResource['status']
): DiagramInvitationResource => ({
    id: 7,
    email: 'guest@example.com',
    role: 'viewer',
    status,
    expiresAt: '2026-12-01T00:00:00Z',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
});

describe('ShareInvitationList', () => {
    it('hides the section when there are no invitations', () => {
        const { container } = render(
            <ShareInvitationList
                diagramId="42"
                invitations={[]}
                invitationsStatus="success"
                onInvitationsChange={vi.fn()}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('shows pending and expired invitations separately from members', () => {
        render(
            <ShareInvitationList
                diagramId="42"
                invitations={[
                    invitation('pending'),
                    { ...invitation('expired'), id: 8 },
                ]}
                invitationsStatus="success"
                onInvitationsChange={vi.fn()}
            />
        );

        expect(screen.getByText('Pending invitations')).toBeInTheDocument();
        expect(screen.getAllByText(/Pending/).length).toBeGreaterThan(1);
        expect(screen.getByText(/Expired/)).toBeInTheDocument();
    });

    it('renews an invitation and reports rate limits', async () => {
        const user = userEvent.setup();
        resendMock.mockRejectedValueOnce(new ApiError('limited', 429, {}));

        render(
            <ShareInvitationList
                diagramId="42"
                invitations={[invitation('expired')]}
                invitationsStatus="success"
                onInvitationsChange={vi.fn()}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Pending invitations' })
        );
        await user.click(screen.getByRole('button', { name: 'Resend' }));

        expect(toastMock).toHaveBeenCalledWith({
            title: 'Please wait before resending this invitation.',
            variant: 'destructive',
        });
    });

    it('revokes a pending invitation', async () => {
        const user = userEvent.setup();
        const onInvitationsChange = vi.fn();
        revokeMock.mockResolvedValue(undefined);

        render(
            <ShareInvitationList
                diagramId="42"
                invitations={[invitation('pending')]}
                invitationsStatus="success"
                onInvitationsChange={onInvitationsChange}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Pending invitations' })
        );
        await user.click(
            screen.getByRole('button', { name: 'Revoke invitation' })
        );

        expect(revokeMock).toHaveBeenCalledWith('42', 7);
        expect(onInvitationsChange).toHaveBeenCalledWith([]);
    });
});
