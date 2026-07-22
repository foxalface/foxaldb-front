import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramAccess } from '@/lib/api/diagrams';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { en } from '@/i18n/locales/en';

const { authState, accessState, updateCommentMock, deleteCommentMock } =
    vi.hoisted(() => ({
        authState: {
            user: { id: 1, name: 'Alice', email: 'a@example.com' } as {
                id: number;
                name: string;
                email: string;
            } | null,
        },
        accessState: {
            diagramAccess: {
                role: 'owner',
                can_edit: true,
                can_manage_members: true,
            } as DiagramAccess | null,
        },
        updateCommentMock: vi.fn(),
        deleteCommentMock: vi.fn(),
    }));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        user: authState.user,
        isAuthenticated: authState.user !== null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        fetchUser: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: accessState.diagramAccess,
        setDiagramAccess: vi.fn(),
        clearDiagramAccess: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-comment-mutations', () => ({
    useCommentMutations: () => ({
        createComment: vi.fn(),
        updateComment: updateCommentMock,
        deleteComment: deleteCommentMock,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
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
            if (!options) {
                return current;
            }
            return current.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
                String(options[name] ?? `{{${name}}}`)
            );
        },
        i18n: { language: 'en' },
    }),
}));

vi.mock('timeago-react', () => ({
    default: ({ datetime }: { datetime: Date | string }) => {
        const value =
            datetime instanceof Date
                ? datetime.toISOString()
                : String(datetime);
        return <span data-testid="relative-time">{value}</span>;
    },
}));

import { CommentListItem } from '../comment-list-item';

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
    targetType: 'table',
    targetId: 'table-1',
    body: 'Persisted body',
    user: { id: 1, name: 'Alice Wonder' },
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
    ...overrides,
});

const openActions = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Comment actions' }));
};

describe('CommentListItem', () => {
    beforeEach(() => {
        authState.user = { id: 1, name: 'Alice', email: 'a@example.com' };
        accessState.diagramAccess = {
            role: 'owner',
            can_edit: true,
            can_manage_members: true,
        };
        updateCommentMock.mockReset();
        deleteCommentMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows Edit and Delete for owner on their own comment', async () => {
        const user = userEvent.setup();
        render(<CommentListItem comment={comment()} />);

        await openActions(user);
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('shows Delete only for owner on another user comment', async () => {
        const user = userEvent.setup();
        render(
            <CommentListItem
                comment={comment({ user: { id: 2, name: 'Bob' } })}
            />
        );

        await openActions(user);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('shows Delete only for owner on deleted-author comment', async () => {
        const user = userEvent.setup();
        render(<CommentListItem comment={comment({ user: null })} />);

        expect(screen.getByText('Deleted user')).toBeInTheDocument();
        await openActions(user);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('shows Edit and Delete for editor on their own comment', async () => {
        const user = userEvent.setup();
        accessState.diagramAccess = {
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        };
        render(<CommentListItem comment={comment()} />);

        await openActions(user);
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('hides the action trigger for editor other, deleted author, and viewer', () => {
        accessState.diagramAccess = {
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        };
        const { unmount } = render(
            <CommentListItem
                comment={comment({ user: { id: 2, name: 'Bob' } })}
            />
        );
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        unmount();

        const deleted = render(
            <CommentListItem comment={comment({ user: null })} />
        );
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        deleted.unmount();

        accessState.diagramAccess = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };
        render(<CommentListItem comment={comment()} />);
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
    });

    it('opens the delete dialog from Delete and Cancel restores normal display', async () => {
        const user = userEvent.setup();
        render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));

        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();
        expect(deleteCommentMock).not.toHaveBeenCalled();
        expect(screen.getByText('Persisted body')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => {
            expect(
                screen.queryByRole('alertdialog', { name: 'Delete message' })
            ).not.toBeInTheDocument();
        });
        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(deleteCommentMock).not.toHaveBeenCalled();
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Comment actions' })
            ).toHaveFocus();
        });
    });

    it('does not call delete until Confirm and keeps the item visible while pending', async () => {
        const user = userEvent.setup();
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        expect(deleteCommentMock).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(deleteCommentMock).toHaveBeenCalledTimes(1);
        expect(deleteCommentMock).toHaveBeenCalledWith(7);
        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Deleting…' })
        ).toBeDisabled();

        await act(async () => {
            pending.resolve();
        });
    });

    it('closes the delete dialog when permission is lost', async () => {
        const user = userEvent.setup();
        const { rerender } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();

        accessState.diagramAccess = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };
        rerender(<CommentListItem comment={comment()} />);

        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Persisted body')).toBeInTheDocument();
    });

    it('hides the action menu and Delete while editing', async () => {
        const user = userEvent.setup();
        render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Edit'));

        expect(
            screen.getByRole('form', { name: 'Edit discussion message' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
        expect(screen.queryByText(/\b7\b/)).not.toBeInTheDocument();
    });

    it('unmounts the delete dialog with the item on remote removal', async () => {
        const user = userEvent.setup();
        const { unmount } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();

        act(() => {
            unmount();
        });

        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Persisted body')).not.toBeInTheDocument();
    });

    it('ignores pending delete success after remote removal unmounts the item', async () => {
        const user = userEvent.setup();
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { unmount } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(deleteCommentMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Deleting…' })
        ).toBeDisabled();

        act(() => {
            unmount();
        });

        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Persisted body')).not.toBeInTheDocument();

        await act(async () => {
            pending.resolve();
        });

        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(deleteCommentMock).toHaveBeenCalledTimes(1);

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });

    it('ignores pending delete failure after remote removal unmounts the item', async () => {
        const user = userEvent.setup();
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { unmount } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(deleteCommentMock).toHaveBeenCalledTimes(1);

        act(() => {
            unmount();
        });

        await act(async () => {
            pending.reject(new Error('HTTP 404'));
        });

        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.queryByText(/HTTP 404/)).not.toBeInTheDocument();
        expect(deleteCommentMock).toHaveBeenCalledTimes(1);

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });

    it('closes pending delete UI on permission loss and ignores later success', async () => {
        const user = userEvent.setup();
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { rerender } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        await user.click(screen.getByRole('button', { name: 'Delete' }));
        expect(
            screen.getByRole('button', { name: 'Deleting…' })
        ).toBeDisabled();

        accessState.diagramAccess = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };
        rerender(<CommentListItem comment={comment()} />);

        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Persisted body')).toBeInTheDocument();

        await act(async () => {
            pending.resolve();
        });

        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(deleteCommentMock).toHaveBeenCalledTimes(1);

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });

    it('closes pending delete UI on permission loss and ignores later failure', async () => {
        const user = userEvent.setup();
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { rerender } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        accessState.diagramAccess = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };
        rerender(<CommentListItem comment={comment()} />);

        await act(async () => {
            pending.reject(new Error('HTTP 403'));
        });

        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(deleteCommentMock).toHaveBeenCalledTimes(1);

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });

    it('does not restore actions-trigger focus after successful delete when the item is removed', async () => {
        const user = userEvent.setup();
        deleteCommentMock.mockResolvedValue(undefined);
        const { unmount } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(deleteCommentMock).toHaveBeenCalledTimes(1);
        });

        // Provider/reducer would remove the row after HTTP success.
        act(() => {
            unmount();
        });

        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('alertdialog', { name: 'Delete message' })
        ).not.toBeInTheDocument();
        expect(document.activeElement).not.toBeNull();
        expect(document.activeElement?.getAttribute('aria-label')).not.toBe(
            'Comment actions'
        );
    });

    it('restores actions-trigger focus after Cancel without deleting', async () => {
        const user = userEvent.setup();
        render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Delete'));
        expect(deleteCommentMock).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Comment actions' })
            ).toHaveFocus();
        });
        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(deleteCommentMock).not.toHaveBeenCalled();
    });

    it('enters edit mode while keeping author, timestamp, and target visible', async () => {
        const user = userEvent.setup();
        render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Edit'));

        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(
            screen.getByRole('form', { name: 'Edit discussion message' })
        ).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('Persisted body');
        expect(screen.getByText('Alice Wonder')).toBeInTheDocument();
        expect(screen.getByTestId('relative-time')).toBeInTheDocument();
        expect(screen.getByText('Table discussion')).toBeInTheDocument();
    });

    it('restores the body on Cancel and shows the Provider-updated body after Save', async () => {
        const user = userEvent.setup();
        const { rerender } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Edit'));
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(
            screen.queryByRole('form', { name: 'Edit discussion message' })
        ).not.toBeInTheDocument();

        updateCommentMock.mockResolvedValue(
            comment({
                body: 'Provider body',
                updatedAt: '2026-07-22T12:00:00.000Z',
            })
        );

        await openActions(user);
        await user.click(screen.getByText('Edit'));
        const textarea = screen.getByRole('textbox');
        await user.clear(textarea);
        await user.type(textarea, 'Provider body');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(updateCommentMock).toHaveBeenCalledTimes(1);
        });

        rerender(
            <CommentListItem
                comment={comment({
                    body: 'Provider body',
                    updatedAt: '2026-07-22T12:00:00.000Z',
                })}
            />
        );

        expect(screen.getByText('Provider body')).toBeInTheDocument();
    });

    it('exits edit mode when permission is lost', async () => {
        const user = userEvent.setup();
        const { rerender } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Edit'));
        expect(
            screen.getByRole('form', { name: 'Edit discussion message' })
        ).toBeInTheDocument();

        accessState.diagramAccess = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };
        rerender(<CommentListItem comment={comment()} />);

        expect(
            screen.queryByRole('form', { name: 'Edit discussion message' })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
    });

    it('restores focus to the actions trigger after Cancel', async () => {
        const user = userEvent.setup();
        render(<CommentListItem comment={comment()} />);

        const trigger = screen.getByRole('button', {
            name: 'Comment actions',
        });
        await user.click(trigger);
        await user.click(screen.getByText('Edit'));
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Comment actions' })
            ).toHaveFocus();
        });
    });

    it('restores focus to the actions trigger after successful Save', async () => {
        const user = userEvent.setup();
        updateCommentMock.mockResolvedValue(
            comment({
                body: 'Saved body',
                updatedAt: '2026-07-22T12:00:00.000Z',
            })
        );
        render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Edit'));
        await user.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Comment actions' })
            ).toHaveFocus();
        });
    });

    it('exits edit mode while a save is pending without stale focus or reopen', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { rerender } = render(<CommentListItem comment={comment()} />);

        await openActions(user);
        await user.click(screen.getByText('Edit'));
        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();

        accessState.diagramAccess = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };
        rerender(<CommentListItem comment={comment()} />);

        expect(
            screen.queryByRole('form', { name: 'Edit discussion message' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Persisted body')).toBeInTheDocument();

        await act(async () => {
            pending.resolve(
                comment({
                    body: 'Should not reopen',
                    updatedAt: '2026-07-22T12:00:00.000Z',
                })
            );
        });

        expect(
            screen.queryByRole('form', { name: 'Edit discussion message' })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Persisted body')).toBeInTheDocument();
        expect(screen.queryByText('Should not reopen')).not.toBeInTheDocument();

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });
});
