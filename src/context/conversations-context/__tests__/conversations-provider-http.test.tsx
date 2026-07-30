import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { EMPTY_CONVERSATIONS } from '@/lib/conversations/conversation-selectors';
import { useDiagramConversations } from '@/hooks/use-diagram-conversations';
import { useConversationMutations } from '@/hooks/use-conversation-mutations';
import {
    ConversationsProviderTestWrapper,
    createConversationFixture,
    createConversationsProviderTestEnv,
    deferred,
    resetConversationsProviderTestEnv,
} from './conversations-provider-test-utils';

const { listDiagramConversations, findOrCreateDiagramConversation } =
    vi.hoisted(() => ({
        listDiagramConversations: vi.fn(),
        findOrCreateDiagramConversation: vi.fn(),
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
    findOrCreateDiagramConversation,
}));

describe('ConversationsProvider HTTP lifecycle', () => {
    beforeEach(() => {
        resetConversationsProviderTestEnv(env);
        listDiagramConversations.mockReset();
        findOrCreateDiagramConversation.mockReset();
    });

    it('authenticated valid diagram triggers active summary list', async () => {
        listDiagramConversations.mockResolvedValue({
            data: [
                createConversationFixture({ id: 2 }),
                createConversationFixture({ id: 1 }),
            ],
            nextCursor: null,
        });

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        expect(result.current.status).toBe('loading');
        expect(listDiagramConversations).toHaveBeenCalledWith('42', {
            status: 'active',
            cursor: undefined,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        expect(result.current.isActive).toBe(true);
        expect(result.current.diagramId).toBe('42');
        expect(result.current.activeConversations.map((c) => c.id)).toEqual([
            2, 1,
        ]);
        expect(result.current.error).toBeNull();
    });

    it('exposes loading status before completion', async () => {
        const pending = deferred<{
            data: DiagramConversation[];
            nextCursor: string | null;
        }>();
        listDiagramConversations.mockReturnValue(pending.promise);

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: ConversationsProviderTestWrapper,
        });

        expect(result.current.status).toBe('loading');
        expect(result.current.activeConversations).toBe(EMPTY_CONVERSATIONS);

        await act(async () => {
            pending.resolve({
                data: [createConversationFixture({ id: 1 })],
                nextCursor: null,
            });
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });
    });

    it('findOrCreateConversation dispatches after API success', async () => {
        listDiagramConversations.mockResolvedValue({
            data: [],
            nextCursor: null,
        });

        const created = createConversationFixture({ id: 5 });
        findOrCreateDiagramConversation.mockResolvedValue(created);

        const { result } = renderHook(
            () => ({
                conversations: useDiagramConversations(),
                mutations: useConversationMutations(),
            }),
            { wrapper: ConversationsProviderTestWrapper }
        );

        await waitFor(() => {
            expect(result.current.conversations.status).toBe('ready');
        });

        await act(async () => {
            await result.current.mutations.findOrCreateConversation({
                targetType: 'diagram',
                targetId: null,
            });
        });

        expect(findOrCreateDiagramConversation).toHaveBeenCalledWith('42', {
            targetType: 'diagram',
            targetId: null,
        });
        expect(
            result.current.conversations.activeConversations.map((c) => c.id)
        ).toEqual([5]);
    });

    it('resets when scope becomes inactive', async () => {
        listDiagramConversations.mockResolvedValue({
            data: [createConversationFixture({ id: 1 })],
            nextCursor: null,
        });

        const { result, rerender } = renderHook(
            () => useDiagramConversations(),
            {
                wrapper: ConversationsProviderTestWrapper,
            }
        );

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        env.authValue = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
        };
        rerender();

        expect(result.current.isActive).toBe(false);
        expect(result.current.status).toBe('idle');
        expect(result.current.activeConversations).toBe(EMPTY_CONVERSATIONS);
    });
});
