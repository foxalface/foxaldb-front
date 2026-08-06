import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConversationMutations } from '@/hooks/use-conversation-mutations';
import {
    ConversationsProviderTestWrapper,
    createConversationsProviderTestEnv,
    resetConversationsProviderTestEnv,
} from '@/context/conversations-context/__tests__/conversations-provider-test-utils';

const {
    addConversationMessageReaction,
    removeConversationMessageReaction,
    listDiagramConversations,
    listConversationMessages,
} = vi.hoisted(() => ({
    addConversationMessageReaction: vi.fn(),
    removeConversationMessageReaction: vi.fn(),
    listDiagramConversations: vi.fn(),
    listConversationMessages: vi.fn(),
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
    findOrCreateDiagramConversation: vi.fn(),
    listConversationMessages,
    addConversationMessageReaction,
    removeConversationMessageReaction,
}));

describe('ConversationsProvider reaction mutations', () => {
    beforeEach(() => {
        resetConversationsProviderTestEnv(env);
        listDiagramConversations.mockResolvedValue({
            data: [],
            nextCursor: null,
        });
        listConversationMessages.mockResolvedValue({
            data: [],
            nextCursor: null,
        });
        addConversationMessageReaction.mockReset();
        removeConversationMessageReaction.mockReset();
    });

    it('addReaction sends POST and dispatches authoritative snapshot', async () => {
        addConversationMessageReaction.mockResolvedValue({
            messageId: 100,
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

        const { result } = renderHook(() => useConversationMutations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(listDiagramConversations).toHaveBeenCalled();
        });

        await act(async () => {
            await result.current.addReaction(10, 100, '👍');
        });

        expect(addConversationMessageReaction).toHaveBeenCalledWith(
            '42',
            10,
            100,
            '👍'
        );
    });

    it('removeReaction sends DELETE body and dispatches snapshot', async () => {
        removeConversationMessageReaction.mockResolvedValue({
            messageId: 100,
            reactions: [],
        });

        const { result } = renderHook(() => useConversationMutations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(listDiagramConversations).toHaveBeenCalled();
        });

        await act(async () => {
            await result.current.removeReaction(10, 100, '👍');
        });

        expect(removeConversationMessageReaction).toHaveBeenCalledWith(
            '42',
            10,
            100,
            '👍'
        );
    });
});
