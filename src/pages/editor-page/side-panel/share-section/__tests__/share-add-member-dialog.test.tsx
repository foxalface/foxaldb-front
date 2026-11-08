import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import type * as DiagramMembersApi from '@/lib/api/diagram-members';

const { shareDiagramMock, toastMock } = vi.hoisted(() => ({
    shareDiagramMock: vi.fn(),
    toastMock: vi.fn(),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/lib/api/diagram-members', async (importOriginal) => {
    const actual = await importOriginal<typeof DiagramMembersApi>();
    return {
        ...actual,
        updateDiagramMember: vi.fn(),
        removeDiagramMember: vi.fn(),
    };
});

vi.mock('@/lib/api/diagram-invitations', () => ({
    shareDiagram: shareDiagramMock,
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

import { ShareAddMemberDialog } from '../share-add-member-dialog';

describe('ShareAddMemberDialog', () => {
    beforeEach(() => {
        shareDiagramMock.mockReset();
        toastMock.mockReset();
        shareDiagramMock.mockResolvedValue({ message: 'Sharing updated.' });
    });

    it('submits the collaborator email and role', async () => {
        const user = userEvent.setup();
        const onShared = vi.fn();
        const onOpenChange = vi.fn();

        render(
            <ShareAddMemberDialog
                diagramId="42"
                open
                onOpenChange={onOpenChange}
                onShared={onShared}
            />
        );

        await user.type(screen.getByLabelText('Email'), 'alexis@example.com');
        await user.click(screen.getByRole('button', { name: 'Add' }));

        await waitFor(() => {
            expect(shareDiagramMock).toHaveBeenCalledWith('42', {
                email: 'alexis@example.com',
                role: 'editor',
            });
        });
        expect(onShared).toHaveBeenCalled();
        expect(toastMock).toHaveBeenCalledWith({
            title: en.translation.share_diagram_dialog.add_member.success,
        });
        expect(en.translation.share_diagram_dialog.add_member.success).toBe(
            'Sharing updated.'
        );
        expect(
            en.translation.share_diagram_dialog.add_member.success
        ).not.toMatch(/email/i);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not show success toast when add fails', async () => {
        const user = userEvent.setup();
        shareDiagramMock.mockRejectedValueOnce(new Error('failed'));

        render(
            <ShareAddMemberDialog
                diagramId="42"
                open
                onOpenChange={vi.fn()}
                onShared={vi.fn()}
            />
        );

        await user.type(screen.getByLabelText('Email'), 'alexis@example.com');
        await user.click(screen.getByRole('button', { name: 'Add' }));

        await waitFor(() => {
            expect(shareDiagramMock).toHaveBeenCalled();
        });
        expect(toastMock).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                en.translation.share_diagram_dialog.errors.add_failed
            )
        ).toBeInTheDocument();
    });
});
