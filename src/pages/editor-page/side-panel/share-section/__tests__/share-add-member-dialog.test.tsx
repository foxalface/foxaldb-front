import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { ApiError } from '@/lib/api/client';
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
            variant: 'success',
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
        expect(toastMock).toHaveBeenCalledTimes(1);
        expect(toastMock).toHaveBeenCalledWith({
            title: en.translation.share_diagram_dialog.errors.add_failed,
            variant: 'danger',
            dedupeKey: 'share:add-member',
        });
        expect(
            screen.queryByText(
                en.translation.share_diagram_dialog.errors.add_failed
            )
        ).not.toBeInTheDocument();
    });

    it('highlights an empty email and shows one danger toast', async () => {
        const user = userEvent.setup();

        render(
            <ShareAddMemberDialog
                diagramId="42"
                open
                onOpenChange={vi.fn()}
                onShared={vi.fn()}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(shareDiagramMock).not.toHaveBeenCalled();
        expect(screen.getByLabelText('Email')).toHaveAttribute(
            'aria-invalid',
            'true'
        );
        expect(toastMock).toHaveBeenCalledTimes(1);
        expect(toastMock).toHaveBeenCalledWith({
            title: en.translation.validation.required_fields,
            variant: 'danger',
            dedupeKey: 'share:add-member',
        });
        expect(
            screen.queryByText(en.translation.validation.required, {
                selector: ':not(.sr-only)',
            })
        ).not.toBeInTheDocument();
    });

    it('localizes a server email validation code without Laravel prose', async () => {
        const user = userEvent.setup();
        shareDiagramMock.mockRejectedValueOnce(
            new ApiError(
                'The email field must be a valid email address.',
                422,
                {
                    code: 'validation_failed',
                    message: 'The email field must be a valid email address.',
                    errors: {
                        email: [
                            'The email field must be a valid email address.',
                        ],
                    },
                    fields: {
                        email: [{ code: 'email', message: 'ignored' }],
                    },
                }
            )
        );

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
            expect(toastMock).toHaveBeenCalledWith({
                title: en.translation.validation.invalid_email,
                variant: 'danger',
                dedupeKey: 'share:add-member',
            });
        });
        expect(screen.getByLabelText('Email')).toHaveAttribute(
            'aria-invalid',
            'true'
        );
        expect(
            screen.queryByText('The email field must be a valid email address.')
        ).not.toBeInTheDocument();
    });
});
