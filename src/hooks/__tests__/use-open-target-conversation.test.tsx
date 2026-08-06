import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetConversationTargetPendingStoreForTests } from '@/lib/conversations/conversation-target-pending';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';

const {
    findOrCreateConversation,
    openConversationDetail,
    diagramIdState,
    diagramAccessState,
    conversationsState,
} = vi.hoisted(() => ({
    findOrCreateConversation: vi.fn(),
    openConversationDetail: vi.fn(),
    diagramIdState: { current: 'diagram-a' },
    diagramAccessState: { can_edit: true },
    conversationsState: {
        activeConversations: [] as DiagramConversation[],
    },
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        openConversationDetail,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        get diagramId() {
            return diagramIdState.current;
        },
    }),
}));

vi.mock('@/hooks/use-conversation-mutations', () => ({
    useConversationMutations: () => ({ findOrCreateConversation }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({ diagramAccess: diagramAccessState }),
}));

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => true,
}));

vi.mock('@/hooks/use-active-conversation-for-target', () => ({
    useActiveConversationForTarget: () => undefined,
}));

vi.mock('@/hooks/use-diagram-conversations', () => ({
    useDiagramConversations: () => ({
        activeConversations: conversationsState.activeConversations,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

import { useOpenTargetConversation } from '@/hooks/use-open-target-conversation';
import { isConversationTargetPending } from '@/lib/conversations/conversation-target-pending';

const target = { targetType: 'table' as const, targetId: 'table-1' };
const targetKey = 'diagram-a:table:table-1';

describe('useOpenTargetConversation', () => {
    beforeEach(() => {
        resetConversationTargetPendingStoreForTests();
        diagramIdState.current = 'diagram-a';
        diagramAccessState.can_edit = true;
        conversationsState.activeConversations = [];
        findOrCreateConversation.mockReset();
        openConversationDetail.mockReset();
    });

    it('shares pending state across hook instances for the same target', async () => {
        let resolveRequest: ((value: DiagramConversation) => void) | undefined;
        findOrCreateConversation.mockImplementation(
            () =>
                new Promise<DiagramConversation>((resolve) => {
                    resolveRequest = resolve;
                })
        );

        const first = renderHook(() => useOpenTargetConversation(target));
        const second = renderHook(() => useOpenTargetConversation(target));

        expect(first.result.current.isPending).toBe(false);
        expect(second.result.current.isPending).toBe(false);

        await act(async () => {
            void first.result.current.openConversation();
        });

        expect(first.result.current.isPending).toBe(true);
        expect(second.result.current.isPending).toBe(true);
        expect(findOrCreateConversation).toHaveBeenCalledTimes(1);

        await act(async () => {
            void second.result.current.openConversation();
        });

        expect(findOrCreateConversation).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveRequest?.({
                id: 7,
                diagramId: 1,
                targetType: 'table',
                targetId: 'table-1',
                status: 'active',
                archivedAt: null,
                messageCount: 0,
                lastMessageAt: null,
                lastMessageBody: null,
                lastMessageAuthor: null,
                unreadCount: 0,
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            });
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(first.result.current.isPending).toBe(false);
            expect(second.result.current.isPending).toBe(false);
        });
    });

    it('releases pending state after rejection', async () => {
        findOrCreateConversation.mockRejectedValue(new Error('network'));

        const { result } = renderHook(() => useOpenTargetConversation(target));

        await act(async () => {
            await result.current.openConversation();
        });

        expect(result.current.isPending).toBe(false);
        expect(isConversationTargetPending(targetKey)).toBe(false);
        expect(result.current.errorKey).toBe('generic');
    });

    it('releases pending state after success', async () => {
        findOrCreateConversation.mockResolvedValue({
            id: 8,
            diagramId: 1,
            targetType: 'table',
            targetId: 'table-1',
            status: 'active',
            archivedAt: null,
            messageCount: 0,
            lastMessageAt: null,
            lastMessageBody: null,
            lastMessageAuthor: null,
            unreadCount: 0,
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        });

        const { result } = renderHook(() => useOpenTargetConversation(target));

        await act(async () => {
            await result.current.openConversation();
        });

        expect(result.current.isPending).toBe(false);
        expect(isConversationTargetPending(targetKey)).toBe(false);
        expect(openConversationDetail).toHaveBeenCalledWith(8);
    });

    it('releases pending state when the initiating component unmounts', async () => {
        let resolveRequest: ((value: DiagramConversation) => void) | undefined;
        findOrCreateConversation.mockImplementation(
            () =>
                new Promise<DiagramConversation>((resolve) => {
                    resolveRequest = resolve;
                })
        );

        const { result, unmount } = renderHook(() =>
            useOpenTargetConversation(target)
        );

        await act(async () => {
            void result.current.openConversation();
        });

        expect(isConversationTargetPending(targetKey)).toBe(true);
        unmount();

        await act(async () => {
            resolveRequest?.({
                id: 9,
                diagramId: 1,
                targetType: 'table',
                targetId: 'table-1',
                status: 'active',
                archivedAt: null,
                messageCount: 0,
                lastMessageAt: null,
                lastMessageBody: null,
                lastMessageAuthor: null,
                unreadCount: 0,
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            });
            await Promise.resolve();
        });

        expect(isConversationTargetPending(targetKey)).toBe(false);
    });

    it('ignores stale navigation after switching diagrams before the request resolves', async () => {
        let resolveRequest: ((value: DiagramConversation) => void) | undefined;
        findOrCreateConversation.mockImplementation(
            () =>
                new Promise<DiagramConversation>((resolve) => {
                    resolveRequest = resolve;
                })
        );

        const { result, rerender } = renderHook(() =>
            useOpenTargetConversation(target)
        );

        await act(async () => {
            void result.current.openConversation();
        });

        diagramIdState.current = 'diagram-b';
        rerender();

        await act(async () => {
            resolveRequest?.({
                id: 10,
                diagramId: 1,
                targetType: 'table',
                targetId: 'table-1',
                status: 'active',
                archivedAt: null,
                messageCount: 0,
                lastMessageAt: null,
                lastMessageBody: null,
                lastMessageAuthor: null,
                unreadCount: 0,
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            });
            await Promise.resolve();
        });

        expect(openConversationDetail).not.toHaveBeenCalled();
        expect(isConversationTargetPending(targetKey)).toBe(false);
    });
});
