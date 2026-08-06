import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DIAGRAM_CONVERSATION_ARCHIVED_EVENT } from '@/lib/realtime/conversation-events';
import { DIAGRAM_CONVERSATION_MESSAGE_REACTIONS_UPDATED_EVENT } from '@/lib/realtime/conversation-events';
import { DIAGRAM_CONVERSATION_READ_UPDATED_EVENT } from '@/lib/realtime/conversation-events';
import { useContext } from 'react';
import {
    ConversationsContext,
    type ConversationsContextValue,
} from '../conversations-context';
import {
    ConversationsProviderTestWrapper,
    createConversationFixture,
    createConversationsProviderTestEnv,
    createFakeChannel,
    deferred,
    resetConversationsProviderTestEnv,
} from './conversations-provider-test-utils';
import { testAuthAlice } from '@/test/user-identity-fixtures';

const {
    listDiagramConversations,
    markDiagramConversationRead,
    addConversationMessageReaction,
} = vi.hoisted(() => ({
    listDiagramConversations: vi.fn(),
    markDiagramConversationRead: vi.fn(),
    addConversationMessageReaction: vi.fn(),
}));

const env = createConversationsProviderTestEnv();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => env.authValue,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram: env.currentDiagram }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => env.realtimeValue,
}));

vi.mock('@/lib/api/diagram-conversations', () => ({
    listDiagramConversations,
    markDiagramConversationRead,
    addConversationMessageReaction,
    listConversationMessages: vi.fn(async () => ({
        data: [
            {
                id: 200,
                conversationId: 1,
                body: 'Hello',
                user: null,
                createdAt: '2026-01-02T10:00:00.000Z',
                updatedAt: '2026-01-02T10:00:00.000Z',
                reactions: [],
            },
        ],
        nextCursor: null,
    })),
}));

const useConversationsContext = (): ConversationsContextValue => {
    const value = useContext(ConversationsContext);
    if (value === null) {
        throw new Error('ConversationsContext is not available');
    }

    return value;
};

describe('ConversationsProvider synchronization', () => {
    beforeEach(() => {
        resetConversationsProviderTestEnv(env);
        listDiagramConversations.mockReset();
        markDiagramConversationRead.mockReset();
        addConversationMessageReaction.mockReset();
        listDiagramConversations.mockResolvedValue({
            data: [createConversationFixture({ id: 1, unreadCount: 2 })],
            nextCursor: null,
            totalUnreadCount: 2,
        });
    });

    it('ignores stale mark-read HTTP responses with older read boundaries', async () => {
        const slowRead = deferred<{
            conversationId: number;
            lastReadMessageId: number | null;
            lastReadAt: string;
            unreadCount: number;
            totalUnreadCount: number;
        }>();
        const fastRead = deferred<{
            conversationId: number;
            lastReadMessageId: number | null;
            lastReadAt: string;
            unreadCount: number;
            totalUnreadCount: number;
        }>();

        markDiagramConversationRead
            .mockReturnValueOnce(slowRead.promise)
            .mockReturnValueOnce(fastRead.promise);

        const { result } = renderHook(() => useConversationsContext(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.totalUnreadCount).toBe(2);
        });

        await act(async () => {
            void result.current.markConversationRead(1, 50);
            void result.current.markConversationRead(1, 100);
            fastRead.resolve({
                conversationId: 1,
                lastReadMessageId: 100,
                lastReadAt: '2026-01-02T12:00:00.000Z',
                unreadCount: 0,
                totalUnreadCount: 0,
            });
        });

        await waitFor(() => {
            expect(result.current.totalUnreadCount).toBe(0);
        });

        await act(async () => {
            slowRead.resolve({
                conversationId: 1,
                lastReadMessageId: 50,
                lastReadAt: '2026-01-02T11:00:00.000Z',
                unreadCount: 5,
                totalUnreadCount: 5,
            });
        });

        expect(result.current.totalUnreadCount).toBe(0);
        expect(result.current.activeConversations[0]?.unreadCount).toBe(0);
    });

    it('simulates multi-tab ReadUpdated after local mark-read', async () => {
        const userChannel = createFakeChannel();
        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => null,
            getUserPrivateChannel: () => userChannel,
            onReconnect: () => () => undefined,
        };

        markDiagramConversationRead.mockResolvedValue({
            conversationId: 1,
            lastReadMessageId: 100,
            lastReadAt: '2026-01-02T12:00:00.000Z',
            unreadCount: 0,
            totalUnreadCount: 0,
        });

        const { result } = renderHook(() => useConversationsContext(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        await act(async () => {
            await result.current.markConversationRead(1, 100);
        });

        expect(result.current.totalUnreadCount).toBe(0);

        userChannel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 42,
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: 100,
        });

        expect(result.current.totalUnreadCount).toBe(0);

        userChannel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 42,
            conversationId: 1,
            unreadCount: 5,
            totalUnreadCount: 5,
            lastReadMessageId: 50,
        });

        expect(result.current.totalUnreadCount).toBe(0);
    });

    it('reloads authoritative summaries on reconnect', async () => {
        const diagramChannel = createFakeChannel();
        const userChannel = createFakeChannel();
        let reconnectListener: (() => void) | null = null;

        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => diagramChannel,
            getUserPrivateChannel: () => userChannel,
            onReconnect: (listener) => {
                reconnectListener = listener;
                return () => {
                    reconnectListener = null;
                };
            },
        };

        listDiagramConversations
            .mockResolvedValueOnce({
                data: [createConversationFixture({ id: 1, unreadCount: 2 })],
                nextCursor: null,
                totalUnreadCount: 2,
            })
            .mockResolvedValueOnce({
                data: [createConversationFixture({ id: 1, unreadCount: 0 })],
                nextCursor: null,
                totalUnreadCount: 0,
            });

        const { result } = renderHook(() => useConversationsContext(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.totalUnreadCount).toBe(2);
        });

        act(() => {
            reconnectListener?.();
        });

        await waitFor(() => {
            expect(result.current.totalUnreadCount).toBe(0);
        });

        expect(listDiagramConversations).toHaveBeenCalledTimes(2);
    });

    it('applies archived conversation updates from another tab', async () => {
        const diagramChannel = createFakeChannel();
        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => diagramChannel,
            getUserPrivateChannel: () => null,
            onReconnect: () => () => undefined,
        };

        const { result } = renderHook(() => useConversationsContext(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.activeConversations.length).toBe(1);
        });

        const archived = createConversationFixture({
            id: 1,
            status: 'archived',
            archivedAt: '2026-01-03T00:00:00.000Z',
        });

        diagramChannel.emit(DIAGRAM_CONVERSATION_ARCHIVED_EVENT, {
            conversation: archived,
            userId: testAuthAlice().id,
        });

        await waitFor(() => {
            expect(result.current.activeConversations.length).toBe(0);
            expect(result.current.archivedConversations.length).toBe(1);
        });
    });

    it('ignores stale reaction HTTP responses when the message is unloaded', async () => {
        addConversationMessageReaction.mockResolvedValue({
            messageId: 500,
            reactions: [
                {
                    emoji: '👍',
                    count: 1,
                    reactedByMe: true,
                    previewUsers: [],
                    previewTruncated: false,
                },
            ],
        });

        const { result } = renderHook(() => useConversationsContext(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        await act(async () => {
            await result.current.addReaction(1, 500, '👍');
        });

        expect(result.current.getMessages(1).length).toBe(0);
    });

    it('replaces subscriptions without leaking duplicate listeners on reconnect', async () => {
        const diagramChannel = createFakeChannel();
        const userChannel = createFakeChannel();
        let reconnectListener: (() => void) | null = null;

        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => diagramChannel,
            getUserPrivateChannel: () => userChannel,
            onReconnect: (listener) => {
                reconnectListener = listener;
                return () => {
                    reconnectListener = null;
                };
            },
        };

        renderHook(() => useConversationsContext(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(diagramChannel.listeners.size).toBeGreaterThan(0);
        });

        const initialDiagramListeners = diagramChannel.listeners.size;
        const initialUserListeners = userChannel.listeners.size;

        act(() => {
            reconnectListener?.();
        });

        await waitFor(() => {
            expect(listDiagramConversations).toHaveBeenCalledTimes(2);
        });

        expect(diagramChannel.listeners.size).toBe(initialDiagramListeners);
        expect(userChannel.listeners.size).toBe(initialUserListeners);
    });

    it('applies reaction updates from another tab via websocket reconcile', async () => {
        const diagramChannel = createFakeChannel();
        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => diagramChannel,
            getUserPrivateChannel: () => null,
            onReconnect: () => () => undefined,
        };

        const { result } = renderHook(() => useConversationsContext(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        await act(async () => {
            await result.current.loadMessages(1);
        });

        await waitFor(() => {
            expect(result.current.getMessages(1).length).toBe(1);
        });

        diagramChannel.emit(
            DIAGRAM_CONVERSATION_MESSAGE_REACTIONS_UPDATED_EVENT,
            {
                diagramId: 42,
                conversationId: 1,
                messageId: 200,
                reactions: [
                    {
                        emoji: '👍',
                        count: 2,
                        previewUsers: [],
                        previewTruncated: false,
                    },
                ],
                userId: 2,
            }
        );

        await waitFor(() => {
            const message = result.current
                .getMessages(1)
                .find((m) => m.id === 200);
            expect(message?.reactions[0]?.count).toBe(2);
        });
    });
});
