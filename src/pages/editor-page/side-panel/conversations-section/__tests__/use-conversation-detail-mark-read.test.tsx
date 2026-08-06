import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import type { UseConversationMessagesResult } from '@/hooks/use-conversation-messages';
import {
    ConversationsContext,
    INACTIVE_CONVERSATIONS_CONTEXT,
} from '@/context/conversations-context/conversations-context';

const buildConversation = (): DiagramConversation => ({
    id: 10,
    diagramId: 42,
    targetType: 'table',
    targetId: 'table-1',
    status: 'active',
    archivedAt: null,
    messageCount: 2,
    lastMessageAt: '2026-01-02T12:00:00.000Z',
    lastMessageBody: 'Latest',
    lastMessageAuthor: null,
    unreadCount: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T12:00:00.000Z',
});

const { messagesState, markConversationRead } = vi.hoisted(() => ({
    messagesState: {
        current: {
            messages: [] as UseConversationMessagesResult['messages'],
            status: 'idle' as UseConversationMessagesResult['status'],
            error: null,
            hasMore: false,
            loadMessages: vi.fn(async () => undefined),
            loadMoreMessages: vi.fn(async () => undefined),
        },
    },
    markConversationRead: vi.fn(async () => undefined),
}));

vi.mock('@/hooks/use-conversation-messages', () => ({
    useConversationMessages: () => messagesState.current,
}));

import { useConversationDetail } from '../use-conversation-detail';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConversationsContext.Provider
        value={{
            ...INACTIVE_CONVERSATIONS_CONTEXT,
            markConversationRead,
        }}
    >
        {children}
    </ConversationsContext.Provider>
);

const resetMessagesState = () => {
    messagesState.current = {
        messages: [],
        status: 'idle',
        error: null,
        hasMore: false,
        loadMessages: vi.fn(async () => undefined),
        loadMoreMessages: vi.fn(async () => undefined),
    };
    markConversationRead.mockReset();
    markConversationRead.mockResolvedValue(undefined);
};

describe('useConversationDetail mark-as-read timing', () => {
    beforeEach(() => {
        resetMessagesState();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('marks as read after the first successful load', async () => {
        const conversation = buildConversation();
        const loadMessages = vi.fn(async () => undefined);
        messagesState.current.loadMessages = loadMessages;

        const { rerender } = renderHook(
            () => useConversationDetail(conversation),
            { wrapper: TestWrapper }
        );

        expect(loadMessages).toHaveBeenCalledTimes(1);
        expect(markConversationRead).not.toHaveBeenCalled();

        messagesState.current = {
            ...messagesState.current,
            status: 'ready',
            messages: [
                {
                    id: 50,
                    conversationId: 10,
                    body: 'Newest',
                    user: null,
                    createdAt: '2026-01-02T12:00:00.000Z',
                    updatedAt: '2026-01-02T12:00:00.000Z',
                    reactions: [],
                },
            ],
        };

        rerender();

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(markConversationRead).toHaveBeenCalledWith(10, 50);
    });

    it('does not mark as read while loading', async () => {
        const conversation = buildConversation();
        messagesState.current.status = 'loading';

        renderHook(() => useConversationDetail(conversation), {
            wrapper: TestWrapper,
        });

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(markConversationRead).not.toHaveBeenCalled();
    });

    it('marks as read when a newer message arrives while detail stays open', async () => {
        const conversation = buildConversation();
        messagesState.current.status = 'ready';
        messagesState.current.messages = [
            {
                id: 40,
                conversationId: 10,
                body: 'Earlier',
                user: null,
                createdAt: '2026-01-02T11:00:00.000Z',
                updatedAt: '2026-01-02T11:00:00.000Z',
                reactions: [],
            },
        ];

        const { rerender } = renderHook(
            () => useConversationDetail(conversation),
            { wrapper: TestWrapper }
        );

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(markConversationRead).toHaveBeenCalledWith(10, 40);
        markConversationRead.mockClear();

        messagesState.current = {
            ...messagesState.current,
            messages: [
                {
                    id: 55,
                    conversationId: 10,
                    body: 'Newer',
                    user: null,
                    createdAt: '2026-01-02T12:00:00.000Z',
                    updatedAt: '2026-01-02T12:00:00.000Z',
                    reactions: [],
                },
                ...messagesState.current.messages,
            ],
        };

        rerender();

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(markConversationRead).toHaveBeenCalledWith(10, 55);
    });

    it('debounces repeated mark-read requests', async () => {
        const conversation = buildConversation();
        messagesState.current.status = 'ready';
        messagesState.current.messages = [
            {
                id: 60,
                conversationId: 10,
                body: 'One',
                user: null,
                createdAt: '2026-01-02T12:00:00.000Z',
                updatedAt: '2026-01-02T12:00:00.000Z',
                reactions: [],
            },
        ];

        const { rerender } = renderHook(
            () => useConversationDetail(conversation),
            { wrapper: TestWrapper }
        );

        messagesState.current = {
            ...messagesState.current,
            messages: [
                {
                    id: 61,
                    conversationId: 10,
                    body: 'Two',
                    user: null,
                    createdAt: '2026-01-02T12:01:00.000Z',
                    updatedAt: '2026-01-02T12:01:00.000Z',
                    reactions: [],
                },
                ...messagesState.current.messages,
            ],
        };

        rerender();

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        expect(markConversationRead).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        expect(markConversationRead).toHaveBeenCalledTimes(1);
        expect(markConversationRead).toHaveBeenCalledWith(10, 61);
    });

    it('does not mark as read after a failed load', async () => {
        const conversation = buildConversation();
        messagesState.current.status = 'error';

        renderHook(() => useConversationDetail(conversation), {
            wrapper: TestWrapper,
        });

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(markConversationRead).not.toHaveBeenCalled();
    });
});
