import { act, renderHook, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT } from '@/lib/realtime/conversation-events';
import { DIAGRAM_CONVERSATION_READ_UPDATED_EVENT } from '@/lib/realtime/conversation-events';
import { useDiagramConversations } from '@/hooks/use-diagram-conversations';
import {
    ConversationsContext,
    type ConversationsContextValue,
} from '../conversations-context';
import {
    ConversationsProviderTestWrapper,
    createConversationFixture,
    createConversationsProviderTestEnv,
    createFakeChannel,
    resetConversationsProviderTestEnv,
} from './conversations-provider-test-utils';
import { testAuthAlice } from '@/test/user-identity-fixtures';

const { listDiagramConversations, markDiagramConversationRead } = vi.hoisted(
    () => ({
        listDiagramConversations: vi.fn(),
        markDiagramConversationRead: vi.fn(),
    })
);

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
}));

const useConversationsContext = (): ConversationsContextValue => {
    const value = useContext(ConversationsContext);
    if (value === null) {
        throw new Error('ConversationsContext is not available');
    }

    return value;
};

describe('ConversationsProvider unread state', () => {
    beforeEach(() => {
        resetConversationsProviderTestEnv(env);
        listDiagramConversations.mockReset();
        markDiagramConversationRead.mockReset();
        listDiagramConversations.mockResolvedValue({
            data: [
                createConversationFixture({ id: 1, unreadCount: 2 }),
                createConversationFixture({ id: 2, unreadCount: 1 }),
            ],
            nextCursor: null,
            totalUnreadCount: 3,
        });
    });

    it('exposes totalUnreadCount from list responses', async () => {
        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        expect(result.current.totalUnreadCount).toBe(3);
        expect(
            result.current.activeConversations.find((c) => c.id === 1)
                ?.unreadCount
        ).toBe(2);
    });

    it('markConversationRead dispatches authoritative unread totals from API', async () => {
        markDiagramConversationRead.mockResolvedValue({
            conversationId: 1,
            lastReadMessageId: 99,
            lastReadAt: '2026-01-02T12:00:00.000Z',
            unreadCount: 0,
            totalUnreadCount: 1,
        });

        const { result } = renderHook(() => useConversationsContext(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        await act(async () => {
            await result.current.markConversationRead(1, 99);
        });

        expect(markDiagramConversationRead).toHaveBeenCalledWith('42', 1, 99);
        expect(result.current.totalUnreadCount).toBe(1);
        expect(
            result.current.activeConversations.find((c) => c.id === 1)
                ?.unreadCount
        ).toBe(0);
    });

    it('replaces unread counts from user-channel ReadUpdated events', async () => {
        const userChannel = createFakeChannel();
        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => null,
            getUserPrivateChannel: () => userChannel,
            onReconnect: () => () => undefined,
        };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        userChannel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 42,
            conversationId: 2,
            unreadCount: 0,
            totalUnreadCount: 2,
            lastReadMessageId: 50,
        });

        await waitFor(() => {
            expect(result.current.totalUnreadCount).toBe(2);
            expect(
                result.current.activeConversations.find((c) => c.id === 2)
                    ?.unreadCount
            ).toBe(0);
        });
    });

    it('ignores ReadUpdated events for other diagrams', async () => {
        const userChannel = createFakeChannel();
        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => null,
            getUserPrivateChannel: () => userChannel,
            onReconnect: () => () => undefined,
        };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.totalUnreadCount).toBe(3);
        });

        userChannel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 99,
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: null,
        });

        expect(result.current.totalUnreadCount).toBe(3);
    });

    it('increments unread on message-created from other users', async () => {
        const diagramChannel = createFakeChannel();
        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => diagramChannel,
            getUserPrivateChannel: () => null,
            onReconnect: () => () => undefined,
        };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        const conversation = createConversationFixture({
            id: 1,
            unreadCount: 2,
            messageCount: 3,
        });

        diagramChannel.emit(DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT, {
            message: {
                id: 100,
                conversationId: 1,
                body: 'Hello',
                user: null,
                createdAt: '2026-01-02T12:00:00.000Z',
                updatedAt: '2026-01-02T12:00:00.000Z',
                reactions: [],
            },
            conversation,
            userId: 2,
        });

        await waitFor(() => {
            expect(
                result.current.activeConversations.find((c) => c.id === 1)
                    ?.unreadCount
            ).toBe(3);
            expect(result.current.totalUnreadCount).toBe(4);
        });
    });

    it('does not increment unread for own message-created events', async () => {
        const diagramChannel = createFakeChannel();
        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => diagramChannel,
            getUserPrivateChannel: () => null,
            onReconnect: () => () => undefined,
        };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.totalUnreadCount).toBe(3);
        });

        diagramChannel.emit(DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT, {
            message: {
                id: 101,
                conversationId: 1,
                body: 'Mine',
                user: null,
                createdAt: '2026-01-02T12:00:00.000Z',
                updatedAt: '2026-01-02T12:00:00.000Z',
                reactions: [],
            },
            conversation: createConversationFixture({
                id: 1,
                unreadCount: 2,
                messageCount: 4,
            }),
            userId: testAuthAlice().id,
        });

        await waitFor(() => {
            expect(
                result.current.activeConversations.find((c) => c.id === 1)
                    ?.unreadCount
            ).toBe(2);
            expect(result.current.totalUnreadCount).toBe(3);
        });
    });

    it('resubscribes user read channel on reconnect', async () => {
        const userChannel = createFakeChannel();
        let reconnectListener: (() => void) | null = null;

        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => null,
            getUserPrivateChannel: () => userChannel,
            onReconnect: (listener) => {
                reconnectListener = listener;
                return () => {
                    reconnectListener = null;
                };
            },
        };

        renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(
                userChannel.listeners.has(
                    DIAGRAM_CONVERSATION_READ_UPDATED_EVENT
                )
            ).toBe(true);
        });

        userChannel.listeners.clear();

        act(() => {
            reconnectListener?.();
        });

        await waitFor(() => {
            expect(
                userChannel.listeners.has(
                    DIAGRAM_CONVERSATION_READ_UPDATED_EVENT
                )
            ).toBe(true);
        });
    });
});
