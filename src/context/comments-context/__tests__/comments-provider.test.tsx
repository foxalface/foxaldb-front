import React, { StrictMode } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { EMPTY_COMMENTS } from '@/lib/comments/comment-selectors';
import { CommentsContext } from '../comments-context';

interface AuthValue {
    user: { id: number; name: string; email: string } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

let authValue: AuthValue;
let currentDiagram: { id: string } | null;

const {
    listDiagramComments,
    createDiagramComment,
    updateDiagramComment,
    deleteDiagramComment,
} = vi.hoisted(() => ({
    listDiagramComments: vi.fn(),
    createDiagramComment: vi.fn(),
    updateDiagramComment: vi.fn(),
    deleteDiagramComment: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authValue,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram }),
}));

vi.mock('@/lib/api/diagram-comments', () => ({
    listDiagramComments,
    createDiagramComment,
    updateDiagramComment,
    deleteDiagramComment,
}));

import { CommentsProvider } from '../comments-provider';
import { useDiagramComments } from '@/hooks/use-diagram-comments';
import { useCommentMutations } from '@/hooks/use-comment-mutations';

const comment = (
    overrides: Partial<DiagramComment> & Pick<DiagramComment, 'id'>
): DiagramComment => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: `body-${overrides.id}`,
    user: { id: 1, name: 'Alice' },
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    ...overrides,
});

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CommentsProvider>{children}</CommentsProvider>
);

const authenticatedAuth = (): AuthValue => ({
    user: { id: 1, name: 'Alice', email: 'a@example.com' },
    isAuthenticated: true,
    isLoading: false,
});

describe('CommentsProvider', () => {
    beforeEach(() => {
        authValue = authenticatedAuth();
        currentDiagram = { id: '42' };
        listDiagramComments.mockReset();
        createDiagramComment.mockReset();
        updateDiagramComment.mockReset();
        deleteDiagramComment.mockReset();
    });

    describe('loading', () => {
        it('authenticated valid diagram triggers list and exposes ordered result', async () => {
            listDiagramComments.mockResolvedValue([
                comment({ id: 2 }),
                comment({ id: 1 }),
            ]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            expect(result.current.status).toBe('loading');
            expect(listDiagramComments).toHaveBeenCalledWith('42');

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            expect(result.current.isActive).toBe(true);
            expect(result.current.diagramId).toBe('42');
            expect(result.current.comments.map((c) => c.id)).toEqual([1, 2]);
            expect(result.current.error).toBeNull();
        });

        it('exposes loading status before completion', async () => {
            const pending = deferred<DiagramComment[]>();
            listDiagramComments.mockReturnValue(pending.promise);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            expect(result.current.status).toBe('loading');
            expect(result.current.comments).toBe(EMPTY_COMMENTS);

            await act(async () => {
                pending.resolve([comment({ id: 1 })]);
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
        });

        it('load failure exposes the exact error', async () => {
            const loadError = new Error('list failed');
            listDiagramComments.mockRejectedValue(loadError);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('error');
            });

            expect(result.current.error).toBe(loadError);
        });

        it('manual reload calls API again and retains comments while reloading', async () => {
            const reloadPending = deferred<DiagramComment[]>();
            listDiagramComments
                .mockResolvedValueOnce([comment({ id: 1 })])
                .mockReturnValueOnce(reloadPending.promise);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            expect(result.current.comments).toHaveLength(1);

            let reloadPromise!: Promise<void>;
            act(() => {
                reloadPromise = result.current.reload();
            });

            await waitFor(() => {
                expect(result.current.status).toBe('loading');
            });
            expect(result.current.comments).toHaveLength(1);
            expect(result.current.comments[0]?.id).toBe(1);

            await act(async () => {
                reloadPending.resolve([comment({ id: 1 }), comment({ id: 2 })]);
                await reloadPromise;
            });

            expect(listDiagramComments).toHaveBeenCalledTimes(2);
            expect(result.current.status).toBe('ready');
            expect(result.current.comments.map((c) => c.id)).toEqual([1, 2]);
        });

        it('preserves comments array reference while same-diagram reload is loading', async () => {
            const reloadPending = deferred<DiagramComment[]>();
            listDiagramComments
                .mockResolvedValueOnce([comment({ id: 1 })])
                .mockReturnValueOnce(reloadPending.promise);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const commentsWhileReady = result.current.comments;
            expect(commentsWhileReady).toHaveLength(1);

            let reloadPromise!: Promise<void>;
            act(() => {
                reloadPromise = result.current.reload();
            });

            await waitFor(() => {
                expect(result.current.status).toBe('loading');
            });

            expect(result.current.comments).toBe(commentsWhileReady);

            await act(async () => {
                reloadPending.resolve([comment({ id: 1 }), comment({ id: 2 })]);
                await reloadPromise;
            });

            expect(result.current.status).toBe('ready');
            expect(result.current.comments).not.toBe(commentsWhileReady);
            expect(result.current.comments.map((c) => c.id)).toEqual([1, 2]);
        });

        it('preserves comments array reference when same-diagram reload fails', async () => {
            const reloadPending = deferred<DiagramComment[]>();
            listDiagramComments
                .mockResolvedValueOnce([comment({ id: 1 })])
                .mockReturnValueOnce(reloadPending.promise);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const commentsWhileReady = result.current.comments;
            const reloadError = new Error('reload failed');

            let reloadPromise!: Promise<void>;
            act(() => {
                reloadPromise = result.current.reload();
            });

            await waitFor(() => {
                expect(result.current.status).toBe('loading');
            });

            expect(result.current.comments).toBe(commentsWhileReady);

            await act(async () => {
                reloadPending.reject(reloadError);
                await expect(reloadPromise).rejects.toBe(reloadError);
            });

            expect(result.current.status).toBe('error');
            expect(result.current.error).toBe(reloadError);
            expect(result.current.comments).toBe(commentsWhileReady);
        });

        it('diagram switch clears old comments immediately', async () => {
            const first = deferred<DiagramComment[]>();
            const second = deferred<DiagramComment[]>();
            listDiagramComments
                .mockReturnValueOnce(first.promise)
                .mockReturnValueOnce(second.promise);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper }
            );

            expect(result.current.status).toBe('loading');

            await act(async () => {
                first.resolve([comment({ id: 1, diagramId: 42 })]);
            });

            await waitFor(() => {
                expect(result.current.comments).toHaveLength(1);
            });

            currentDiagram = { id: '84' };
            rerender();

            await waitFor(() => {
                expect(result.current.status).toBe('loading');
            });
            expect(result.current.diagramId).toBe('84');
            expect(result.current.comments).toBe(EMPTY_COMMENTS);

            await act(async () => {
                second.resolve([
                    comment({ id: 9, diagramId: 84, body: 'new' }),
                ]);
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            expect(result.current.comments.map((c) => c.id)).toEqual([9]);
        });

        it('ignores stale previous-diagram success', async () => {
            const first = deferred<DiagramComment[]>();
            const second = deferred<DiagramComment[]>();
            listDiagramComments
                .mockReturnValueOnce(first.promise)
                .mockReturnValueOnce(second.promise);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper }
            );

            currentDiagram = { id: '84' };
            rerender();

            await act(async () => {
                second.resolve([comment({ id: 9, diagramId: 84 })]);
            });

            await waitFor(() => {
                expect(result.current.comments.map((c) => c.id)).toEqual([9]);
            });

            await act(async () => {
                first.resolve([comment({ id: 1, diagramId: 42 })]);
            });

            expect(result.current.comments.map((c) => c.id)).toEqual([9]);
            expect(result.current.diagramId).toBe('84');
        });

        it('ignores stale previous-diagram failure', async () => {
            const first = deferred<DiagramComment[]>();
            const second = deferred<DiagramComment[]>();
            listDiagramComments
                .mockReturnValueOnce(first.promise)
                .mockReturnValueOnce(second.promise);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper }
            );

            currentDiagram = { id: '84' };
            rerender();

            await act(async () => {
                second.resolve([comment({ id: 9, diagramId: 84 })]);
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const staleError = new Error('stale failure');
            await act(async () => {
                first.reject(staleError);
            });

            expect(result.current.status).toBe('ready');
            expect(result.current.error).toBeNull();
            expect(result.current.comments.map((c) => c.id)).toEqual([9]);
        });

        it('guest/local diagram makes no request', async () => {
            currentDiagram = { id: 'local-abc' };

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            expect(listDiagramComments).not.toHaveBeenCalled();
            expect(result.current.isActive).toBe(false);
            expect(result.current.status).toBe('idle');
            expect(result.current.diagramId).toBeNull();
        });

        it('invalid or missing diagram makes no request', async () => {
            currentDiagram = { id: '' };

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            expect(listDiagramComments).not.toHaveBeenCalled();
            expect(result.current.isActive).toBe(false);

            currentDiagram = null;
            const { result: nullResult } = renderHook(
                () => useDiagramComments(),
                { wrapper }
            );

            expect(listDiagramComments).not.toHaveBeenCalled();
            expect(nullResult.current.isActive).toBe(false);
        });

        it('auth loading makes no request', async () => {
            authValue = {
                ...authenticatedAuth(),
                isLoading: true,
            };

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper,
            });

            expect(listDiagramComments).not.toHaveBeenCalled();
            expect(result.current.isActive).toBe(false);
            expect(result.current.status).toBe('idle');
        });

        it('logout resets comments state', async () => {
            listDiagramComments.mockResolvedValue([comment({ id: 1 })]);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            authValue = {
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };
            rerender();

            await waitFor(() => {
                expect(result.current.isActive).toBe(false);
            });

            expect(result.current.status).toBe('idle');
            expect(result.current.comments).toBe(EMPTY_COMMENTS);
            expect(result.current.error).toBeNull();
            expect(result.current.diagramId).toBeNull();
        });

        it('unmount does not apply stale success', async () => {
            const pending = deferred<DiagramComment[]>();
            listDiagramComments.mockReturnValue(pending.promise);

            const consoleError = vi
                .spyOn(console, 'error')
                .mockImplementation(() => undefined);

            const { unmount } = render(
                <CommentsProvider>
                    <span>child</span>
                </CommentsProvider>
            );

            unmount();

            await act(async () => {
                pending.resolve([comment({ id: 1 })]);
            });

            expect(
                consoleError.mock.calls.some((call) =>
                    String(call[0]).includes(
                        "Can't perform a React state update on a component that hasn't mounted yet"
                    )
                )
            ).toBe(false);
            expect(
                consoleError.mock.calls.some((call) =>
                    String(call[0]).includes(
                        "Can't perform a React state update on an unmounted component"
                    )
                )
            ).toBe(false);

            consoleError.mockRestore();
        });
    });

    describe('mutations', () => {
        beforeEach(async () => {
            listDiagramComments.mockResolvedValue([]);
        });

        it('create success upserts and returns', async () => {
            const created = comment({ id: 5, body: 'hello' });
            createDiagramComment.mockResolvedValue(created);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });

            let returned!: DiagramComment;
            await act(async () => {
                returned = await result.current.mutations.createComment({
                    targetType: 'diagram',
                    targetId: null,
                    body: 'hello',
                });
            });

            expect(returned).toBe(created);
            expect(createDiagramComment).toHaveBeenCalledWith('42', {
                targetType: 'diagram',
                targetId: null,
                body: 'hello',
            });
            expect(result.current.comments.comments.map((c) => c.id)).toEqual([
                5,
            ]);
        });

        it('update success upserts and returns', async () => {
            listDiagramComments.mockResolvedValue([
                comment({ id: 5, body: 'old' }),
            ]);
            const updated = comment({ id: 5, body: 'new' });
            updateDiagramComment.mockResolvedValue(updated);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });

            let returned!: DiagramComment;
            await act(async () => {
                returned = await result.current.mutations.updateComment(5, {
                    body: 'new',
                });
            });

            expect(returned).toBe(updated);
            expect(result.current.comments.comments[0]?.body).toBe('new');
        });

        it('delete success removes', async () => {
            listDiagramComments.mockResolvedValue([comment({ id: 5 })]);
            deleteDiagramComment.mockResolvedValue(undefined);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.comments).toHaveLength(1);
            });

            await act(async () => {
                await result.current.mutations.deleteComment(5);
            });

            expect(deleteDiagramComment).toHaveBeenCalledWith('42', 5);
            expect(result.current.comments.comments).toBe(EMPTY_COMMENTS);
        });

        it('create failure propagates unchanged and does not mutate', async () => {
            const apiError = new Error('create failed');
            createDiagramComment.mockRejectedValue(apiError);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });

            let caught: unknown;
            await act(async () => {
                try {
                    await result.current.mutations.createComment({
                        targetType: 'diagram',
                        targetId: null,
                        body: 'x',
                    });
                } catch (error) {
                    caught = error;
                }
            });

            expect(caught).toBe(apiError);
            expect(result.current.comments.comments).toBe(EMPTY_COMMENTS);
            expect(result.current.comments.error).toBeNull();
        });

        it('update failure propagates unchanged', async () => {
            const apiError = new Error('update failed');
            updateDiagramComment.mockRejectedValue(apiError);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });

            await expect(
                result.current.mutations.updateComment(1, { body: 'x' })
            ).rejects.toBe(apiError);
        });

        it('delete failure propagates unchanged', async () => {
            listDiagramComments.mockResolvedValue([comment({ id: 5 })]);
            const apiError = new Error('delete failed');
            deleteDiagramComment.mockRejectedValue(apiError);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.comments).toHaveLength(1);
            });

            await expect(
                result.current.mutations.deleteComment(5)
            ).rejects.toBe(apiError);
            expect(result.current.comments.comments).toHaveLength(1);
        });

        it('inactive mutations reject with fresh Errors and without API calls', async () => {
            currentDiagram = { id: 'local-x' };

            const { result } = renderHook(() => useCommentMutations(), {
                wrapper,
            });

            let createErrorA!: unknown;
            let createErrorB!: unknown;
            let updateError!: unknown;
            let deleteError!: unknown;

            try {
                await result.current.createComment({
                    targetType: 'diagram',
                    targetId: null,
                    body: 'x',
                });
            } catch (error) {
                createErrorA = error;
            }

            try {
                await result.current.createComment({
                    targetType: 'diagram',
                    targetId: null,
                    body: 'y',
                });
            } catch (error) {
                createErrorB = error;
            }

            try {
                await result.current.updateComment(1, { body: 'x' });
            } catch (error) {
                updateError = error;
            }

            try {
                await result.current.deleteComment(1);
            } catch (error) {
                deleteError = error;
            }

            expect(createErrorA).toBeInstanceOf(Error);
            expect(createErrorB).toBeInstanceOf(Error);
            expect(updateError).toBeInstanceOf(Error);
            expect(deleteError).toBeInstanceOf(Error);

            expect((createErrorA as Error).message).toBe(
                'Diagram comments are not active'
            );
            expect((createErrorB as Error).message).toBe(
                'Diagram comments are not active'
            );
            expect((updateError as Error).message).toBe(
                'Diagram comments are not active'
            );
            expect((deleteError as Error).message).toBe(
                'Diagram comments are not active'
            );

            expect(createErrorA).not.toBe(createErrorB);
            expect(createErrorA).not.toBe(updateError);
            expect(createErrorA).not.toBe(deleteError);
            expect(updateError).not.toBe(deleteError);

            expect(createDiagramComment).not.toHaveBeenCalled();
            expect(updateDiagramComment).not.toHaveBeenCalled();
            expect(deleteDiagramComment).not.toHaveBeenCalled();
        });

        it('stale create after switch does not enter new state', async () => {
            listDiagramComments
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([comment({ id: 90, diagramId: 84 })]);

            const pendingCreate = deferred<DiagramComment>();
            createDiagramComment.mockReturnValue(pendingCreate.promise);

            const { result, rerender } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });

            let createPromise!: Promise<DiagramComment>;
            act(() => {
                createPromise = result.current.mutations.createComment({
                    targetType: 'diagram',
                    targetId: null,
                    body: 'stale',
                });
            });

            currentDiagram = { id: '84' };
            rerender();

            await waitFor(() => {
                expect(result.current.comments.diagramId).toBe('84');
            });
            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });

            const created = comment({
                id: 7,
                diagramId: 42,
                body: 'stale',
            });
            let returned!: DiagramComment;
            await act(async () => {
                pendingCreate.resolve(created);
                returned = await createPromise;
            });

            expect(returned).toBe(created);
            expect(result.current.comments.comments.map((c) => c.id)).toEqual([
                90,
            ]);
        });

        it('stale update after switch does not enter new state', async () => {
            listDiagramComments
                .mockResolvedValueOnce([comment({ id: 5, diagramId: 42 })])
                .mockResolvedValueOnce([comment({ id: 90, diagramId: 84 })]);

            const pendingUpdate = deferred<DiagramComment>();
            updateDiagramComment.mockReturnValue(pendingUpdate.promise);

            const { result, rerender } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.comments).toHaveLength(1);
            });

            let updatePromise!: Promise<DiagramComment>;
            act(() => {
                updatePromise = result.current.mutations.updateComment(5, {
                    body: 'updated',
                });
            });

            currentDiagram = { id: '84' };
            rerender();

            await waitFor(() => {
                expect(result.current.comments.diagramId).toBe('84');
            });
            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });

            const updated = comment({
                id: 5,
                diagramId: 42,
                body: 'updated',
            });
            await act(async () => {
                pendingUpdate.resolve(updated);
                await updatePromise;
            });

            expect(result.current.comments.comments.map((c) => c.id)).toEqual([
                90,
            ]);
        });

        it('stale delete after switch does not remove from new state', async () => {
            listDiagramComments
                .mockResolvedValueOnce([comment({ id: 5, diagramId: 42 })])
                .mockResolvedValueOnce([
                    comment({ id: 5, diagramId: 84, body: 'keep' }),
                ]);

            const pendingDelete = deferred<void>();
            deleteDiagramComment.mockReturnValue(pendingDelete.promise);

            const { result, rerender } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.comments).toHaveLength(1);
            });

            let deletePromise!: Promise<void>;
            act(() => {
                deletePromise = result.current.mutations.deleteComment(5);
            });

            currentDiagram = { id: '84' };
            rerender();

            await waitFor(() => {
                expect(result.current.comments.diagramId).toBe('84');
            });
            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });
            expect(result.current.comments.comments).toHaveLength(1);

            await act(async () => {
                pendingDelete.resolve(undefined);
                await deletePromise;
            });

            expect(result.current.comments.comments).toHaveLength(1);
            expect(result.current.comments.comments[0]?.body).toBe('keep');
        });

        it('mutation failures do not replace load error', async () => {
            const loadError = new Error('list failed');
            listDiagramComments.mockRejectedValue(loadError);
            const mutationError = new Error('create failed');
            createDiagramComment.mockRejectedValue(mutationError);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.status).toBe('error');
            });
            expect(result.current.comments.error).toBe(loadError);

            await expect(
                result.current.mutations.createComment({
                    targetType: 'diagram',
                    targetId: null,
                    body: 'x',
                })
            ).rejects.toBe(mutationError);

            expect(result.current.comments.error).toBe(loadError);
            expect(result.current.comments.status).toBe('error');
        });
    });

    describe('Strict Mode', () => {
        it('duplicate initial loads remain stale-safe without duplicate comments', async () => {
            let resolveCount = 0;
            listDiagramComments.mockImplementation(() => {
                resolveCount += 1;
                return Promise.resolve([
                    comment({ id: 1 }),
                    comment({ id: 2 }),
                ]);
            });

            const strictWrapper = ({
                children,
            }: {
                children: React.ReactNode;
            }) => (
                <StrictMode>
                    <CommentsProvider>{children}</CommentsProvider>
                </StrictMode>
            );

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: strictWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            expect(resolveCount).toBeGreaterThanOrEqual(1);
            expect(result.current.comments.map((c) => c.id)).toEqual([1, 2]);
            expect(result.current.diagramId).toBe('42');
            expect(new Set(result.current.comments.map((c) => c.id)).size).toBe(
                2
            );
        });
    });

    it('does not expose reducer state, dispatch or Map on context value', async () => {
        listDiagramComments.mockResolvedValue([comment({ id: 1 })]);

        const { result } = renderHook(() => React.useContext(CommentsContext), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current?.status).toBe('ready');
        });

        expect(result.current).toBeTruthy();
        expect(result.current).not.toHaveProperty('byId');
        expect(result.current).not.toHaveProperty('dispatch');
        expect(result.current).not.toHaveProperty('loadGeneration');
        expect(result.current?.comments).not.toBeInstanceOf(Map);
    });
});
