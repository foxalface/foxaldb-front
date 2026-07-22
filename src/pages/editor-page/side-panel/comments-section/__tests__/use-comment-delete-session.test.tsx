import { act, renderHook, waitFor } from '@testing-library/react';
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

import { useCommentDeleteSession } from '../use-comment-delete-session';

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const baseComment = (
    overrides: Partial<DiagramComment> = {}
): DiagramComment => ({
    id: 7,
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: 'Original body',
    user: { id: 1, name: 'Alice' },
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
    ...overrides,
});

describe('useCommentDeleteSession', () => {
    beforeEach(() => {
        deleteCommentMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('starts idle with no error', () => {
        const { result } = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment(),
                diagramId: '42',
                open: true,
                onDeleted: vi.fn(),
                onOpenChange: vi.fn(),
            })
        );

        expect(result.current.isPending).toBe(false);
        expect(result.current.errorMessage).toBeNull();
    });

    it('deletes successfully and closes the dialog', async () => {
        deleteCommentMock.mockResolvedValue(undefined);
        const onDeleted = vi.fn();
        const onOpenChange = vi.fn();

        const { result } = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment(),
                diagramId: '42',
                open: true,
                onDeleted,
                onOpenChange,
            })
        );

        await act(async () => {
            await result.current.confirmDelete();
        });

        expect(deleteCommentMock).toHaveBeenCalledTimes(1);
        expect(deleteCommentMock).toHaveBeenCalledWith(7);
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onDeleted).toHaveBeenCalledTimes(1);
        expect(result.current.isPending).toBe(false);
        expect(result.current.errorMessage).toBeNull();
    });

    it('retains a generic error on failure and allows retry', async () => {
        deleteCommentMock
            .mockRejectedValueOnce(new Error('HTTP 500: boom'))
            .mockResolvedValueOnce(undefined);
        const onDeleted = vi.fn();
        const onOpenChange = vi.fn();

        const { result } = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment(),
                diagramId: '42',
                open: true,
                onDeleted,
                onOpenChange,
            })
        );

        await act(async () => {
            await result.current.confirmDelete();
        });

        expect(result.current.errorMessage).toBe(
            'Unable to delete this message. Please try again.'
        );
        expect(result.current.errorMessage).not.toMatch(/HTTP 500|boom/);
        expect(onDeleted).not.toHaveBeenCalled();
        expect(onOpenChange).not.toHaveBeenCalledWith(false);
        expect(result.current.isPending).toBe(false);

        await act(async () => {
            await result.current.confirmDelete();
        });

        expect(deleteCommentMock).toHaveBeenCalledTimes(2);
        expect(result.current.errorMessage).toBeNull();
        expect(onDeleted).toHaveBeenCalledTimes(1);
    });

    it('calls deleteComment once for same-tick double confirm', async () => {
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);

        const { result } = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment(),
                diagramId: '42',
                open: true,
                onDeleted: vi.fn(),
                onOpenChange: vi.fn(),
            })
        );

        act(() => {
            void result.current.confirmDelete();
            void result.current.confirmDelete();
        });

        expect(deleteCommentMock).toHaveBeenCalledTimes(1);
        expect(result.current.isPending).toBe(true);

        await act(async () => {
            pending.resolve();
        });
    });

    it('calls deleteComment once when keyboard and pointer pathways race before pending rerender', async () => {
        // Models AlertDialog keyboard Confirm + pointer Confirm as two
        // distinct confirmDelete entries into the sync lock in one act,
        // before React can disable the Confirm button via pending state.
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);

        const { result } = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment(),
                diagramId: '42',
                open: true,
                onDeleted: vi.fn(),
                onOpenChange: vi.fn(),
            })
        );

        act(() => {
            const keyboardPathway = result.current.confirmDelete;
            const pointerPathway = result.current.confirmDelete;
            void keyboardPathway();
            void pointerPathway();
        });

        expect(deleteCommentMock).toHaveBeenCalledTimes(1);
        expect(result.current.isPending).toBe(true);

        await act(async () => {
            pending.resolve();
        });
    });

    it('resets state on identity change', async () => {
        deleteCommentMock.mockRejectedValue(new Error('fail'));

        let comment = baseComment();
        let diagramId = '42';
        const { result, rerender } = renderHook(
            ({ comment: next, diagramId: nextDiagramId }) =>
                useCommentDeleteSession({
                    comment: next,
                    diagramId: nextDiagramId,
                    open: true,
                    onDeleted: vi.fn(),
                    onOpenChange: vi.fn(),
                }),
            { initialProps: { comment, diagramId } }
        );

        await act(async () => {
            await result.current.confirmDelete();
        });
        expect(result.current.errorMessage).not.toBeNull();

        comment = baseComment({ id: 8, body: 'Other' });
        diagramId = '99';
        rerender({ comment, diagramId });

        expect(result.current.errorMessage).toBeNull();
        expect(result.current.isPending).toBe(false);
    });

    it('ignores stale success after identity change', async () => {
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const onDeleted = vi.fn();
        const onOpenChange = vi.fn();

        let comment = baseComment();
        const { result, rerender } = renderHook(
            ({ comment: next }) =>
                useCommentDeleteSession({
                    comment: next,
                    diagramId: '42',
                    open: true,
                    onDeleted,
                    onOpenChange,
                }),
            { initialProps: { comment } }
        );

        act(() => {
            void result.current.confirmDelete();
        });

        comment = baseComment({ id: 9 });
        rerender({ comment });

        await act(async () => {
            pending.resolve();
        });

        expect(onDeleted).not.toHaveBeenCalled();
        expect(onOpenChange).not.toHaveBeenCalledWith(false);
        expect(result.current.isPending).toBe(false);
    });

    it('ignores stale failure after identity change', async () => {
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);

        let comment = baseComment();
        const { result, rerender } = renderHook(
            ({ comment: next }) =>
                useCommentDeleteSession({
                    comment: next,
                    diagramId: '42',
                    open: true,
                    onDeleted: vi.fn(),
                    onOpenChange: vi.fn(),
                }),
            { initialProps: { comment } }
        );

        act(() => {
            void result.current.confirmDelete();
        });

        comment = baseComment({ id: 9 });
        rerender({ comment });

        await act(async () => {
            pending.reject(new Error('stale'));
        });

        expect(result.current.errorMessage).toBeNull();
        expect(result.current.isPending).toBe(false);
    });

    it('does not let an old finally release a newer lock', async () => {
        const first = deferred<void>();
        const second = deferred<void>();
        deleteCommentMock
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);

        let comment = baseComment();
        const { result, rerender } = renderHook(
            ({ comment: next }) =>
                useCommentDeleteSession({
                    comment: next,
                    diagramId: '42',
                    open: true,
                    onDeleted: vi.fn(),
                    onOpenChange: vi.fn(),
                }),
            { initialProps: { comment } }
        );

        act(() => {
            void result.current.confirmDelete();
        });
        expect(result.current.isPending).toBe(true);

        comment = baseComment({ id: 9 });
        rerender({ comment });
        expect(result.current.isPending).toBe(false);

        act(() => {
            void result.current.confirmDelete();
        });
        expect(result.current.isPending).toBe(true);
        expect(deleteCommentMock).toHaveBeenCalledTimes(2);

        await act(async () => {
            first.resolve();
        });

        expect(result.current.isPending).toBe(true);

        await act(async () => {
            second.resolve();
        });

        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
    });

    it('suppresses state updates after unmount on pending success', async () => {
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const onDeleted = vi.fn();
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { result, unmount } = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment(),
                diagramId: '42',
                open: true,
                onDeleted,
                onOpenChange: vi.fn(),
            })
        );

        act(() => {
            void result.current.confirmDelete();
        });
        unmount();

        await act(async () => {
            pending.resolve();
        });

        expect(onDeleted).not.toHaveBeenCalled();
        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });

    it('suppresses state updates after unmount on pending failure', async () => {
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { result, unmount } = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment(),
                diagramId: '42',
                open: true,
                onDeleted: vi.fn(),
                onOpenChange: vi.fn(),
            })
        );

        act(() => {
            void result.current.confirmDelete();
        });
        unmount();

        await act(async () => {
            pending.reject(new Error('gone'));
        });

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });

    it('clears error on close and blocks close while pending', async () => {
        const pending = deferred<void>();
        deleteCommentMock.mockReturnValue(pending.promise);
        const onOpenChange = vi.fn();

        const { result } = renderHook(
            ({ open }) =>
                useCommentDeleteSession({
                    comment: baseComment(),
                    diagramId: '42',
                    open,
                    onDeleted: vi.fn(),
                    onOpenChange,
                }),
            { initialProps: { open: true } }
        );

        deleteCommentMock.mockRejectedValueOnce(new Error('fail'));
        await act(async () => {
            await result.current.confirmDelete();
        });
        expect(result.current.errorMessage).not.toBeNull();

        act(() => {
            result.current.handleOpenChange(false);
        });
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(result.current.errorMessage).toBeNull();

        deleteCommentMock.mockReturnValue(pending.promise);
        onOpenChange.mockClear();

        const pendingHook = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment(),
                diagramId: '42',
                open: true,
                onDeleted: vi.fn(),
                onOpenChange,
            })
        );

        act(() => {
            void pendingHook.result.current.confirmDelete();
        });
        expect(pendingHook.result.current.isPending).toBe(true);

        act(() => {
            pendingHook.result.current.handleOpenChange(false);
        });
        expect(onOpenChange).not.toHaveBeenCalled();

        await act(async () => {
            pending.resolve();
        });
    });

    it('passes the exact comment id to deleteComment', async () => {
        deleteCommentMock.mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useCommentDeleteSession({
                comment: baseComment({ id: 314 }),
                diagramId: '42',
                open: true,
                onDeleted: vi.fn(),
                onOpenChange: vi.fn(),
            })
        );

        await act(async () => {
            await result.current.confirmDelete();
        });

        expect(deleteCommentMock).toHaveBeenCalledWith(314);
    });
});
