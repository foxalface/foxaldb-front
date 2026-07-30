import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DIAGRAM_CONVERSATION_CREATED_EVENT } from '@/lib/realtime/conversation-events';
import { useDiagramConversations } from '@/hooks/use-diagram-conversations';
import {
    ConversationsProviderTestWrapper,
    createConversationFixture,
    createConversationsProviderTestEnv,
    createFakeChannel,
    resetConversationsProviderTestEnv,
} from './conversations-provider-test-utils';

const { listDiagramConversations } = vi.hoisted(() => ({
    listDiagramConversations: vi.fn(),
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
}));

describe('ConversationsProvider realtime lifecycle', () => {
    beforeEach(() => {
        resetConversationsProviderTestEnv(env);
        listDiagramConversations.mockReset();
        listDiagramConversations.mockResolvedValue({
            data: [],
            nextCursor: null,
        });
    });

    it('subscribes when realtime diagram scope matches', async () => {
        const channel = createFakeChannel();
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

        renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(channel.listeners.size).toBeGreaterThan(0);
        });
    });

    it('applies websocket conversation created events', async () => {
        const channel = createFakeChannel();
        env.realtimeValue = {
            currentDiagramId: '42',
            getDiagramPrivateChannel: () => channel,
            onReconnect: () => () => undefined,
        };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        const created = createConversationFixture({ id: 9 });

        channel.emit(DIAGRAM_CONVERSATION_CREATED_EVENT, {
            conversation: created,
            userId: 1,
        });

        await waitFor(() => {
            expect(result.current.activeConversations.map((c) => c.id)).toEqual(
                [9]
            );
        });
    });
});
