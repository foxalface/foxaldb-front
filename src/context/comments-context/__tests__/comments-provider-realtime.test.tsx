import React, { StrictMode, useEffect } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { EMPTY_COMMENTS } from '@/lib/comments/comment-selectors';
import {
    DIAGRAM_COMMENT_CREATED_EVENT,
    DIAGRAM_COMMENT_DELETED_EVENT,
    DIAGRAM_COMMENT_UPDATED_EVENT,
} from '@/lib/realtime/comment-events';
import type { DiagramCommentEventChannel } from '@/lib/realtime/comment-subscriber';
import { CommentsProvider } from '../comments-provider';
import { useDiagramComments } from '@/hooks/use-diagram-comments';
import { useCommentMutations } from '@/hooks/use-comment-mutations';
import {
    CommentsProviderTestWrapper,
    createCommentFixture,
    createCommentsProviderTestEnv,
    createFakeChannel,
    createdPayload,
    deletedPayload,
    deferred,
    fireReconnect,
    resetCommentsProviderTestEnv,
    setManagedChannel,
    type FakeChannel,
} from './comments-provider-test-utils';

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

const env = createCommentsProviderTestEnv();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => env.authValue,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram: env.currentDiagram }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => env.realtimeValue,
}));

vi.mock('@/lib/api/diagram-comments', () => ({
    listDiagramComments,
    createDiagramComment,
    updateDiagramComment,
    deleteDiagramComment,
}));

describe('CommentsProvider realtime lifecycle', () => {
    beforeEach(() => {
        resetCommentsProviderTestEnv(env);
        listDiagramComments.mockReset();
        createDiagramComment.mockReset();
        updateDiagramComment.mockReset();
        deleteDiagramComment.mockReset();
    });

    describe('realtime subscription', () => {
        it('active matching managed channel subscribes to exactly three comment events', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect([...channel.listeners.keys()].sort()).toEqual([
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    DIAGRAM_COMMENT_DELETED_EVENT,
                    DIAGRAM_COMMENT_UPDATED_EVENT,
                ]);
            });
            expect(channel.listenerCount()).toBe(3);
        });

        it('does not subscribe while inactive', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            env.authValue = {
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };

            renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            expect(channel.listenerCount()).toBe(0);
            expect(listDiagramComments).not.toHaveBeenCalled();
        });

        it('does not subscribe for local or invalid diagram', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            env.currentDiagram = { id: 'local-abc' };

            renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            expect(channel.listenerCount()).toBe(0);

            env.currentDiagram = { id: '' };
            const { unmount } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });
            expect(channel.listenerCount()).toBe(0);
            unmount();
        });

        it('does not subscribe when managed channel is null', async () => {
            setManagedChannel(env, null, '42');
            listDiagramComments.mockResolvedValue([]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            expect(result.current.isActive).toBe(true);
        });

        it('does not subscribe when realtime currentDiagramId does not match', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '84');
            listDiagramComments.mockResolvedValue([]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            expect(channel.listenerCount()).toBe(0);
        });

        it('subscribes when managed channel and realtime diagram become available', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, null, null);
            listDiagramComments.mockResolvedValue([]);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            expect(channel.listenerCount()).toBe(0);

            setManagedChannel(env, channel, '42');
            rerender();

            await waitFor(() => {
                expect(channel.listenerCount()).toBe(3);
            });
        });

        it('subscriber cleanup removes exact callbacks without leaving the channel', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const { unmount } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(channel.listenerCount()).toBe(3);
            });

            unmount();

            expect(channel.listenerCount()).toBe(0);
            expect(channel.stopListeningCalls).toHaveLength(3);
            expect(channel.leaveCalls).toBe(0);
            expect(channel.destroyCalls).toBe(0);
            expect(Object.keys(channel)).not.toContain('leaveChannel');
        });
    });

    describe('realtime mutations', () => {
        it('remote Created adds a comment', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const created = createCommentFixture({ id: 10, body: 'remote' });
            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({ comment: created })
                );
            });

            expect(result.current.comments.map((c) => c.id)).toEqual([10]);
            expect(result.current.comments[0]?.body).toBe('remote');
        });

        it('remote Updated replaces a comment', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 10, body: 'old' }),
            ]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.comments[0]?.body).toBe('old');
            });

            const updated = createCommentFixture({ id: 10, body: 'new' });
            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_UPDATED_EVENT,
                    createdPayload({ comment: updated })
                );
            });

            expect(result.current.comments).toHaveLength(1);
            expect(result.current.comments[0]?.body).toBe('new');
        });

        it('remote Deleted removes a comment', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 10 }),
            ]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.comments).toHaveLength(1);
            });

            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_DELETED_EVENT,
                    deletedPayload({ commentId: 10 })
                );
            });

            expect(result.current.comments).toBe(EMPTY_COMMENTS);
        });

        it('malformed payload is ignored', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 1 }),
            ]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.comments).toHaveLength(1);
            });

            act(() => {
                channel.emit(DIAGRAM_COMMENT_CREATED_EVENT, { bad: true });
                channel.emit(DIAGRAM_COMMENT_DELETED_EVENT, null);
            });

            expect(result.current.comments.map((c) => c.id)).toEqual([1]);
        });

        it('foreign-diagram event is ignored', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        diagramId: 99,
                        comment: createCommentFixture({
                            id: 10,
                            diagramId: 99,
                        }),
                    })
                );
            });

            expect(result.current.comments).toBe(EMPTY_COMMENTS);
        });

        it('own actor event is accepted', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const created = createCommentFixture({ id: 10 });
            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({ userId: 1, comment: created })
                );
            });

            expect(result.current.comments.map((c) => c.id)).toEqual([10]);
        });

        it('duplicate Created remains one comment', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const created = createCommentFixture({ id: 10, body: 'once' });
            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({ comment: created })
                );
                channel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        comment: createCommentFixture({
                            id: 10,
                            body: 'twice',
                        }),
                    })
                );
            });

            expect(result.current.comments).toHaveLength(1);
            expect(result.current.comments[0]?.body).toBe('twice');
        });

        it('duplicate Deleted is harmless', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 10 }),
            ]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.comments).toHaveLength(1);
            });

            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_DELETED_EVENT,
                    deletedPayload({ commentId: 10 })
                );
                channel.emit(
                    DIAGRAM_COMMENT_DELETED_EVENT,
                    deletedPayload({ commentId: 10 })
                );
            });

            expect(result.current.comments).toBe(EMPTY_COMMENTS);
            expect(result.current.status).toBe('ready');
        });
    });

    describe('diagram and inactive realtime lifecycle', () => {
        it('diagram switch cleans old listeners and ignores old-channel events', async () => {
            const channel42 = createFakeChannel();
            const channel84 = createFakeChannel();
            setManagedChannel(env, channel42, '42');
            listDiagramComments
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(channel42.listenerCount()).toBe(3);
            });

            env.currentDiagram = { id: '84' };
            setManagedChannel(env, channel84, '84');
            rerender();

            await waitFor(() => {
                expect(result.current.diagramId).toBe('84');
            });
            await waitFor(() => {
                expect(channel42.listenerCount()).toBe(0);
                expect(channel84.listenerCount()).toBe(3);
            });

            act(() => {
                channel42.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        comment: createCommentFixture({ id: 1, diagramId: 42 }),
                    })
                );
            });
            expect(result.current.comments).toBe(EMPTY_COMMENTS);

            act(() => {
                channel84.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        diagramId: 84,
                        comment: createCommentFixture({ id: 9, diagramId: 84 }),
                    })
                );
            });
            expect(result.current.comments.map((c) => c.id)).toEqual([9]);
        });

        it('logout cleans listeners and ignores later events', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(channel.listenerCount()).toBe(3);
            });

            env.authValue = {
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };
            rerender();

            await waitFor(() => {
                expect(result.current.isActive).toBe(false);
            });
            expect(channel.listenerCount()).toBe(0);

            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        comment: createCommentFixture({ id: 10 }),
                    })
                );
            });
            expect(result.current.comments).toBe(EMPTY_COMMENTS);
        });

        it('unmount cleans listeners', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const { unmount } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(channel.listenerCount()).toBe(3);
            });

            unmount();
            expect(channel.listenerCount()).toBe(0);
        });
    });

    describe('Strict Mode realtime', () => {
        it('does not accumulate comment listeners and one event updates once', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const strictWrapper = ({
                children,
            }: {
                children: React.ReactNode;
            }) => (
                <StrictMode>
                    <CommentsProvider>{children}</CommentsProvider>
                </StrictMode>
            );

            const { result, unmount } = renderHook(() => useDiagramComments(), {
                wrapper: strictWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            await waitFor(() => {
                expect(channel.listenerCount()).toBe(3);
            });

            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        comment: createCommentFixture({ id: 10 }),
                    })
                );
            });

            expect(result.current.comments).toHaveLength(1);
            expect(result.current.comments.map((c) => c.id)).toEqual([10]);

            unmount();
            expect(channel.listenerCount()).toBe(0);
        });
    });

    describe('reconnect', () => {
        it('reconnect cleans old channel, subscribes to replacement, and reloads', async () => {
            const oldChannel = createFakeChannel();
            const newChannel = createFakeChannel();
            let channel: FakeChannel | null = oldChannel;
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };

            const reconnectPending = deferred<DiagramComment[]>();
            listDiagramComments
                .mockResolvedValueOnce([
                    createCommentFixture({ id: 1, body: 'initial' }),
                ])
                .mockReturnValueOnce(reconnectPending.promise);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            await waitFor(() => {
                expect(oldChannel.listenerCount()).toBe(3);
            });

            const commentsWhileReady = result.current.comments;

            act(() => {
                channel = newChannel;
                fireReconnect(env.reconnectListeners);
            });

            expect(oldChannel.listenerCount()).toBe(0);
            expect(newChannel.listenerCount()).toBe(3);
            expect(listDiagramComments).toHaveBeenCalledTimes(2);

            await waitFor(() => {
                expect(result.current.status).toBe('loading');
            });
            expect(result.current.comments).toBe(commentsWhileReady);
            expect(result.current.comments[0]?.body).toBe('initial');

            act(() => {
                oldChannel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        comment: createCommentFixture({
                            id: 99,
                            body: 'stale-old',
                        }),
                    })
                );
            });
            expect(result.current.comments.some((c) => c.id === 99)).toBe(
                false
            );

            act(() => {
                newChannel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        comment: createCommentFixture({ id: 2, body: 'live' }),
                    })
                );
            });
            expect(result.current.comments.map((c) => c.id).sort()).toEqual([
                1, 2,
            ]);

            await act(async () => {
                reconnectPending.resolve([
                    createCommentFixture({ id: 3, body: 'authoritative' }),
                ]);
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            expect(result.current.comments.map((c) => c.id)).toEqual([3]);
            expect(result.current.comments[0]?.body).toBe('authoritative');
        });

        it('reconnect observes the replacement channel via getter', async () => {
            const oldChannel = createFakeChannel();
            const newChannel = createFakeChannel();
            let channel: FakeChannel | null = oldChannel;
            const seenChannels: Array<DiagramCommentEventChannel | null> = [];
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => {
                    seenChannels.push(channel);
                    return channel;
                },
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };
            listDiagramComments.mockResolvedValue([]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(oldChannel.listenerCount()).toBe(3);
            });
            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const getterCallsBeforeReconnect = seenChannels.length;

            await act(async () => {
                channel = newChannel;
                fireReconnect(env.reconnectListeners);
            });

            expect(seenChannels.length).toBeGreaterThan(
                getterCallsBeforeReconnect
            );
            expect(seenChannels.at(-1)).toBe(newChannel);
            expect(newChannel.listenerCount()).toBe(3);
        });

        it('reconnect failure retains comments and exposes the exact error', async () => {
            const oldChannel = createFakeChannel();
            const newChannel = createFakeChannel();
            let channel: FakeChannel | null = oldChannel;
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };

            const reconnectError = new Error('reconnect list failed');
            listDiagramComments
                .mockResolvedValueOnce([createCommentFixture({ id: 1 })])
                .mockRejectedValueOnce(reconnectError);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            const commentsWhileReady = result.current.comments;

            act(() => {
                channel = newChannel;
                fireReconnect(env.reconnectListeners);
            });

            await waitFor(() => {
                expect(result.current.status).toBe('error');
            });

            expect(result.current.error).toBe(reconnectError);
            expect(result.current.comments).toBe(commentsWhileReady);
            expect(newChannel.listenerCount()).toBe(3);
        });

        it('no managed channel after reconnect still reloads and does not subscribe', async () => {
            const oldChannel = createFakeChannel();
            let channel: FakeChannel | null = oldChannel;
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };
            listDiagramComments
                .mockResolvedValueOnce([createCommentFixture({ id: 1 })])
                .mockResolvedValueOnce([createCommentFixture({ id: 2 })]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            expect(oldChannel.listenerCount()).toBe(3);

            act(() => {
                channel = null;
                fireReconnect(env.reconnectListeners);
            });

            expect(oldChannel.listenerCount()).toBe(0);
            await waitFor(() => {
                expect(listDiagramComments).toHaveBeenCalledTimes(2);
            });
            await waitFor(() => {
                expect(result.current.comments.map((c) => c.id)).toEqual([2]);
            });
        });

        it('stale reconnect success after diagram switch is ignored', async () => {
            const channel42 = createFakeChannel();
            const channel84 = createFakeChannel();
            let channel: FakeChannel | null = channel42;
            let realtimeDiagramId: string | null = '42';
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                get currentDiagramId() {
                    return realtimeDiagramId;
                },
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };

            const reconnectPending = deferred<DiagramComment[]>();
            listDiagramComments
                .mockResolvedValueOnce([
                    createCommentFixture({ id: 1, diagramId: 42 }),
                ])
                .mockReturnValueOnce(reconnectPending.promise)
                .mockResolvedValueOnce([
                    createCommentFixture({
                        id: 9,
                        diagramId: 84,
                        body: 'new-diagram',
                    }),
                ]);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            act(() => {
                fireReconnect(env.reconnectListeners);
            });

            await waitFor(() => {
                expect(listDiagramComments).toHaveBeenCalledTimes(2);
            });

            env.currentDiagram = { id: '84' };
            channel = channel84;
            realtimeDiagramId = '84';
            rerender();

            await waitFor(() => {
                expect(result.current.diagramId).toBe('84');
            });
            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            expect(result.current.comments.map((c) => c.id)).toEqual([9]);

            await act(async () => {
                reconnectPending.resolve([
                    createCommentFixture({
                        id: 1,
                        diagramId: 42,
                        body: 'stale',
                    }),
                ]);
            });

            expect(result.current.comments.map((c) => c.id)).toEqual([9]);
            expect(result.current.diagramId).toBe('84');
        });

        it('stale reconnect failure after switch is ignored', async () => {
            const channel42 = createFakeChannel();
            const channel84 = createFakeChannel();
            let channel: FakeChannel | null = channel42;
            let realtimeDiagramId: string | null = '42';
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                get currentDiagramId() {
                    return realtimeDiagramId;
                },
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };

            const reconnectPending = deferred<DiagramComment[]>();
            listDiagramComments
                .mockResolvedValueOnce([
                    createCommentFixture({ id: 1, diagramId: 42 }),
                ])
                .mockReturnValueOnce(reconnectPending.promise)
                .mockResolvedValueOnce([
                    createCommentFixture({ id: 9, diagramId: 84 }),
                ]);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            act(() => {
                fireReconnect(env.reconnectListeners);
            });

            env.currentDiagram = { id: '84' };
            channel = channel84;
            realtimeDiagramId = '84';
            rerender();

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const staleError = new Error('stale reconnect failure');
            await act(async () => {
                reconnectPending.reject(staleError);
            });

            expect(result.current.status).toBe('ready');
            expect(result.current.error).toBeNull();
            expect(result.current.comments.map((c) => c.id)).toEqual([9]);
        });

        it('reconnect after logout performs no GET and no subscription', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 1 }),
            ]);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            expect(env.reconnectListeners.size).toBe(1);
            expect(listDiagramComments).toHaveBeenCalledTimes(1);

            env.authValue = {
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };
            rerender();

            await waitFor(() => {
                expect(result.current.isActive).toBe(false);
            });
            expect(env.reconnectListeners.size).toBe(0);
            expect(channel.listenerCount()).toBe(0);

            act(() => {
                fireReconnect(env.reconnectListeners);
            });

            expect(listDiagramComments).toHaveBeenCalledTimes(1);
            expect(channel.listenerCount()).toBe(0);
        });

        it('reconnect listener is removed on unmount', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);

            const { unmount } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(env.reconnectListeners.size).toBe(1);
            });

            unmount();
            expect(env.reconnectListeners.size).toBe(0);
        });

        it('multiple reconnects do not accumulate subscriptions', async () => {
            const channels = [
                createFakeChannel(),
                createFakeChannel(),
                createFakeChannel(),
            ];
            let channelIndex = 0;
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => channels[channelIndex] ?? null,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };
            listDiagramComments.mockResolvedValue([]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(channels[0]?.listenerCount()).toBe(3);
            });
            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            expect(env.reconnectListeners.size).toBe(1);

            await act(async () => {
                channelIndex = 1;
                fireReconnect(env.reconnectListeners);
            });
            expect(channels[0]?.listenerCount()).toBe(0);
            expect(channels[1]?.listenerCount()).toBe(3);
            expect(env.reconnectListeners.size).toBe(1);

            await act(async () => {
                channelIndex = 2;
                fireReconnect(env.reconnectListeners);
            });
            expect(channels[1]?.listenerCount()).toBe(0);
            expect(channels[2]?.listenerCount()).toBe(3);
            expect(env.reconnectListeners.size).toBe(1);
        });

        it('does not create an extra Echo/Pusher connection binding via onReconnect', async () => {
            const channel = createFakeChannel();
            const onReconnect = vi.fn((listener: () => void) => {
                env.reconnectListeners.add(listener);
                return () => {
                    env.reconnectListeners.delete(listener);
                };
            });
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => channel,
                onReconnect,
            };
            listDiagramComments.mockResolvedValue([]);

            const Probe: React.FC = () => {
                useEffect(() => {
                    // Consumers must not bind connection events themselves.
                }, []);
                return null;
            };

            render(
                <CommentsProvider>
                    <Probe />
                </CommentsProvider>
            );

            await waitFor(() => {
                expect(onReconnect).toHaveBeenCalledTimes(1);
            });
            expect(onReconnect.mock.calls[0]?.[0]).toEqual(
                expect.any(Function)
            );
        });
    });

    describe('owner-aware subscription cleanup', () => {
        it('stale normal-effect cleanup does not remove reconnect subscription B', async () => {
            const { adoptCommentSubscription, clearActiveCommentSubscription } =
                await import('../comment-subscription-owner');
            const { subscribeToDiagramCommentEvents } =
                await import('@/lib/realtime/comment-subscriber');

            const channelA = createFakeChannel();
            const channelB = createFakeChannel();
            const activeSubscriptionRef: {
                current: {
                    cleanup: () => void;
                    token: symbol;
                } | null;
            } = { current: null };
            const dispatch = vi.fn();

            // 1. Normal effect creates subscription A and captures owned release.
            clearActiveCommentSubscription(activeSubscriptionRef);
            const cleanupA = subscribeToDiagramCommentEvents({
                channel: channelA,
                diagramId: '42',
                dispatch,
            });
            const releaseOwnedA = adoptCommentSubscription(
                activeSubscriptionRef,
                cleanupA
            );
            expect(channelA.listenerCount()).toBe(3);

            // 2. Reconnect clears A and creates B.
            clearActiveCommentSubscription(activeSubscriptionRef);
            expect(channelA.listenerCount()).toBe(0);
            const cleanupB = subscribeToDiagramCommentEvents({
                channel: channelB,
                diagramId: '42',
                dispatch,
            });
            adoptCommentSubscription(activeSubscriptionRef, cleanupB);
            expect(channelB.listenerCount()).toBe(3);

            // 3. Stale cleanup from the effect instance that created A.
            releaseOwnedA();

            // 4. B survives the stale cleanup itself (not a later recreation).
            expect(channelB.listenerCount()).toBe(3);
            expect(channelA.listenerCount()).toBe(0);

            // 5–7. Created on B applies exactly once.
            channelB.emit(
                DIAGRAM_COMMENT_CREATED_EVENT,
                createdPayload({
                    comment: createCommentFixture({ id: 10, body: 'from-b' }),
                })
            );

            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'COMMENT_UPSERTED',
                comment: expect.objectContaining({
                    id: 10,
                    body: 'from-b',
                }),
            });

            releaseOwnedA();
            expect(channelB.listenerCount()).toBe(3);
        });

        it('diagram switch after reconnect removes B then activates only C', async () => {
            const channelA = createFakeChannel();
            const channelB = createFakeChannel();
            const channelC = createFakeChannel();
            let channel: FakeChannel | null = channelA;
            let realtimeDiagramId: string | null = '42';
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                get currentDiagramId() {
                    return realtimeDiagramId;
                },
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };
            listDiagramComments.mockResolvedValue([]);

            const { result, rerender } = renderHook(
                () => useDiagramComments(),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(channelA.listenerCount()).toBe(3);
            });

            await act(async () => {
                channel = channelB;
                fireReconnect(env.reconnectListeners);
            });

            expect(channelA.listenerCount()).toBe(0);
            expect(channelB.listenerCount()).toBe(3);

            env.currentDiagram = { id: '84' };
            channel = channelC;
            realtimeDiagramId = '84';
            rerender();

            await waitFor(() => {
                expect(result.current.diagramId).toBe('84');
            });
            await waitFor(() => {
                expect(channelB.listenerCount()).toBe(0);
                expect(channelC.listenerCount()).toBe(3);
            });

            act(() => {
                channelB.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        comment: createCommentFixture({ id: 1, diagramId: 42 }),
                    })
                );
            });
            expect(result.current.comments).toBe(EMPTY_COMMENTS);

            act(() => {
                channelC.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({
                        diagramId: 84,
                        comment: createCommentFixture({ id: 9, diagramId: 84 }),
                    })
                );
            });
            expect(result.current.comments.map((c) => c.id)).toEqual([9]);
        });
    });

    describe('reconnect subscription exceptions', () => {
        it('cleanup throw still reloads exactly once and warns', async () => {
            const channelA = createFakeChannel();
            const channelB = createFakeChannel();
            let channel: FakeChannel | null = channelA;
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 1 }),
            ]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            await waitFor(() => {
                expect(channelA.listenerCount()).toBe(3);
            });

            const cleanupError = new Error('stopListening failed');
            channelA.stopListeningError = cleanupError;
            const warnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => undefined);

            listDiagramComments.mockClear();
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 2 }),
            ]);

            act(() => {
                channel = channelB;
                expect(() =>
                    fireReconnect(env.reconnectListeners)
                ).not.toThrow();
            });

            expect(listDiagramComments).toHaveBeenCalledTimes(1);
            expect(listDiagramComments).toHaveBeenCalledWith('42');
            expect(warnSpy).toHaveBeenCalledWith(
                '[Comments] Failed to restore realtime comment subscription after reconnect',
                cleanupError
            );

            await waitFor(() => {
                expect(result.current.comments.map((c) => c.id)).toEqual([2]);
            });

            expect(channelB.listenerCount()).toBe(0);

            channelA.stopListeningError = null;
            await act(async () => {
                fireReconnect(env.reconnectListeners);
            });
            await waitFor(() => {
                expect(channelB.listenerCount()).toBe(3);
            });

            warnSpy.mockRestore();
        });

        it('subscription setup throw still reloads exactly once and leaves no active cleanup', async () => {
            const channelA = createFakeChannel();
            const channelB = createFakeChannel();
            let channel: FakeChannel | null = channelA;
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 1 }),
            ]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });

            const setupError = new Error('listen failed');
            channelB.listenError = setupError;
            const warnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => undefined);

            listDiagramComments.mockClear();
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 3 }),
            ]);

            act(() => {
                channel = channelB;
                expect(() =>
                    fireReconnect(env.reconnectListeners)
                ).not.toThrow();
            });

            expect(listDiagramComments).toHaveBeenCalledTimes(1);
            expect(warnSpy).toHaveBeenCalledWith(
                '[Comments] Failed to restore realtime comment subscription after reconnect',
                setupError
            );
            expect(channelA.listenerCount()).toBe(0);
            expect(channelB.listenerCount()).toBe(0);

            await waitFor(() => {
                expect(result.current.comments.map((c) => c.id)).toEqual([3]);
            });
            expect(result.current.isActive).toBe(true);

            warnSpy.mockRestore();
        });

        it('reload failure after subscription failure retains comments and stores LOAD_FAILED', async () => {
            const channelA = createFakeChannel();
            const channelB = createFakeChannel();
            let channel: FakeChannel | null = channelA;
            env.reconnectListeners = new Set();
            env.realtimeValue = {
                currentDiagramId: '42',
                getDiagramPrivateChannel: () => channel,
                onReconnect: (listener) => {
                    env.reconnectListeners.add(listener);
                    return () => {
                        env.reconnectListeners.delete(listener);
                    };
                },
            };
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 1 }),
            ]);

            const { result } = renderHook(() => useDiagramComments(), {
                wrapper: CommentsProviderTestWrapper,
            });

            await waitFor(() => {
                expect(result.current.status).toBe('ready');
            });
            const commentsWhileReady = result.current.comments;

            const setupError = new Error('listen failed');
            const reloadError = new Error('reconnect list failed');
            channelB.listenError = setupError;
            const warnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => undefined);

            listDiagramComments.mockRejectedValueOnce(reloadError);

            act(() => {
                channel = channelB;
                expect(() =>
                    fireReconnect(env.reconnectListeners)
                ).not.toThrow();
            });

            expect(warnSpy).toHaveBeenCalledWith(
                '[Comments] Failed to restore realtime comment subscription after reconnect',
                setupError
            );

            await waitFor(() => {
                expect(result.current.status).toBe('error');
            });

            expect(result.current.error).toBe(reloadError);
            expect(result.current.comments).toBe(commentsWhileReady);
            expect(channelB.listenerCount()).toBe(0);

            warnSpy.mockRestore();
        });
    });

    describe('HTTP + Echo idempotence', () => {
        it('local create response plus own Created event produces one comment', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([]);
            const created = createCommentFixture({ id: 5, body: 'hello' });
            createDiagramComment.mockResolvedValue(created);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.status).toBe('ready');
            });

            await act(async () => {
                await result.current.mutations.createComment({
                    targetType: 'diagram',
                    targetId: null,
                    body: 'hello',
                });
            });

            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_CREATED_EVENT,
                    createdPayload({ userId: 1, comment: created })
                );
            });

            expect(result.current.comments.comments).toHaveLength(1);
            expect(result.current.comments.comments[0]?.id).toBe(5);
        });

        it('local update response plus own Updated event produces one final comment', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 5, body: 'old' }),
            ]);
            const updated = createCommentFixture({ id: 5, body: 'new' });
            updateDiagramComment.mockResolvedValue(updated);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.comments[0]?.body).toBe('old');
            });

            await act(async () => {
                await result.current.mutations.updateComment(5, {
                    body: 'new',
                });
            });

            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_UPDATED_EVENT,
                    createdPayload({ userId: 1, comment: updated })
                );
            });

            expect(result.current.comments.comments).toHaveLength(1);
            expect(result.current.comments.comments[0]?.body).toBe('new');
        });

        it('local delete plus own Deleted event remains empty', async () => {
            const channel = createFakeChannel();
            setManagedChannel(env, channel, '42');
            listDiagramComments.mockResolvedValue([
                createCommentFixture({ id: 5 }),
            ]);
            deleteDiagramComment.mockResolvedValue(undefined);

            const { result } = renderHook(
                () => ({
                    comments: useDiagramComments(),
                    mutations: useCommentMutations(),
                }),
                { wrapper: CommentsProviderTestWrapper }
            );

            await waitFor(() => {
                expect(result.current.comments.comments).toHaveLength(1);
            });

            await act(async () => {
                await result.current.mutations.deleteComment(5);
            });

            act(() => {
                channel.emit(
                    DIAGRAM_COMMENT_DELETED_EVENT,
                    deletedPayload({ commentId: 5, userId: 1 })
                );
            });

            expect(result.current.comments.comments).toBe(EMPTY_COMMENTS);
        });
    });
});
