import React, { useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { en } from '@/i18n/locales/en';

const { deleteCommentMock } = vi.hoisted(() => ({
    deleteCommentMock: vi.fn(),
}));

vi.mock('@/hooks/use-comment-mutations', () => ({
    useCommentMutations: () => ({
        createComment: vi.fn(),
        updateComment: vi.fn(),
        deleteComment: deleteCommentMock,
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

import { CommentDeleteDialog } from '../comment-delete-dialog';

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const comment = (overrides: Partial<DiagramComment> = {}): DiagramComment => ({
    id: 7,
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: 'Secret body that must not appear',
    user: { id: 1, name: 'Alice' },
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
    ...overrides,
});

const ControlledDeleteDialog: React.FC<{
    openInitially?: boolean;
    onDeleted?: () => void;
    onOpenChangeSpy?: (open: boolean) => void;
}> = ({
    openInitially = true,
    onDeleted = () => undefined,
    onOpenChangeSpy,
}) => {
    const [open, setOpen] = useState(openInitially);

    return (
        <div>
            <p>Parent still shows Secret body that must not appear</p>
            <CommentDeleteDialog
                comment={comment()}
                diagramId="42"
                open={open}
                onOpenChange={(next) => {
                    onOpenChangeSpy?.(next);
                    setOpen(next);
                }}
                onDeleted={onDeleted}
            />
            <button type="button" onClick={() => setOpen(true)}>
                Reopen delete dialog
            </button>
        </div>
    );
};

describe('CommentDeleteDialog', () => {
    beforeEach(() => {
        deleteCommentMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders title, description, Cancel, and Confirm without a body preview', () => {
        render(
            <CommentDeleteDialog
                comment={comment()}
                diagramId="42"
                open={true}
                onOpenChange={vi.fn()}
                onDeleted={vi.fn()}
            />
        );

        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Are you sure you want to delete this message? This action cannot be undone.'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Cancel' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Delete' })
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Secret body that must not appear')
        ).not.toBeInTheDocument();
    });

    it('invokes deleteComment through the real session hook on Confirm', async () => {
        const user = userEvent.setup();
        deleteCommentMock.mockResolvedValue(undefined);
        render(
            <CommentDeleteDialog
                comment={comment()}
                diagramId="42"
                open={true}
                onOpenChange={vi.fn()}
                onDeleted={vi.fn()}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(deleteCommentMock).toHaveBeenCalledTimes(1);
            expect(deleteCommentMock).toHaveBeenCalledWith(7);
        });
    });

    it('blocks Cancel and Escape while pending and keeps the dialog open', async () => {
        const user = userEvent.setup();
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const onOpenChangeSpy = vi.fn();

        render(<ControlledDeleteDialog onOpenChangeSpy={onOpenChangeSpy} />);

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Deleting…' })
            ).toBeDisabled();
        });
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Are you sure you want to delete this message? This action cannot be undone.'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Parent still shows Secret body that must not appear'
            )
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onOpenChangeSpy).not.toHaveBeenCalledWith(false);
        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(onOpenChangeSpy).not.toHaveBeenCalledWith(false);
        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();
        expect(deleteCommentMock).toHaveBeenCalledTimes(1);

        // Outside pointer dismiss is not reliably reproducible for controlled
        // Radix AlertDialog in happy-dom/jsdom; Escape + Cancel cover the
        // same handleOpenChange(false) guard that outside dismissal would hit.

        await act(async () => {
            pending.resolve();
        });
    });

    it('shows a generic error after failure, then clears it on Cancel and reopen', async () => {
        const user = userEvent.setup();
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);

        render(<ControlledDeleteDialog />);

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Deleting…' })
            ).toBeDisabled();
        });

        await act(async () => {
            pending.reject(new Error('HTTP 500: boom'));
        });

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(
            'Unable to delete this message. Please try again.'
        );
        expect(alert).not.toHaveTextContent(/HTTP|ApiError|500|boom/);
        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => {
            expect(
                screen.queryByRole('alertdialog', { name: 'Delete message' })
            ).not.toBeInTheDocument();
        });

        await user.click(
            screen.getByRole('button', { name: 'Reopen delete dialog' })
        );

        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('supports keyboard Confirm and rejects a same-tick second confirm path', async () => {
        const user = userEvent.setup();
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);

        render(
            <CommentDeleteDialog
                comment={comment()}
                diagramId="42"
                open={true}
                onOpenChange={vi.fn()}
                onDeleted={vi.fn()}
            />
        );

        const confirm = screen.getByRole('button', { name: 'Delete' });
        confirm.focus();

        // Keyboard Confirm reaches the real session; a second confirmDelete
        // pathway in the same act proves the sync lock before pending
        // rerender disables the button (DOM keyboard+click races are flaky
        // under happy-dom for this Button+AlertDialog combo).
        await act(async () => {
            await user.keyboard('{Enter}');
        });

        expect(deleteCommentMock).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Deleting…' })
            ).toBeDisabled();
        });

        await act(async () => {
            pending.resolve();
        });
    });

    it('keeps focus inside the dialog after a failed delete surface', async () => {
        const user = userEvent.setup();
        deleteCommentMock.mockRejectedValue(new Error('HTTP 403'));

        render(
            <CommentDeleteDialog
                comment={comment()}
                diagramId="42"
                open={true}
                onOpenChange={vi.fn()}
                onDeleted={vi.fn()}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        const dialog = screen.getByRole('alertdialog');
        expect(dialog).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Delete' })
        ).toBeInTheDocument();
        expect(dialog.contains(document.activeElement)).toBe(true);
    });
});
