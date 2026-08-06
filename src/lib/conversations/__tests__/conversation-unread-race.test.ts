import { describe, expect, it } from 'vitest';
import {
    conversationsReducer,
    initialConversationsState,
    type ConversationsState,
} from '../conversation-reducer';
import type { DiagramConversation } from '../conversation-types';

const conversation = (
    overrides: Partial<DiagramConversation> & Pick<DiagramConversation, 'id'>
): DiagramConversation => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    status: 'active',
    archivedAt: null,
    messageCount: 0,
    lastMessageAt: null,
    lastMessageBody: null,
    lastMessageAuthor: null,
    unreadCount: 0,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T11:00:00.000Z',
    ...overrides,
});

const loadActive = (
    state: ConversationsState,
    conversations: DiagramConversation[],
    totalUnreadCount = 0
): ConversationsState =>
    conversationsReducer(
        conversationsReducer(state, {
            type: 'SUMMARIES_LOAD_STARTED',
            diagramId: '42',
            generation: 1,
        }),
        {
            type: 'SUMMARIES_LOAD_SUCCEEDED',
            diagramId: '42',
            generation: 1,
            conversations,
            status: 'active',
            nextCursor: null,
            append: false,
            totalUnreadCount,
        }
    );

describe('conversation unread race convergence', () => {
    it('MessageCreated then mark-read HTTP converges to authoritative read state', () => {
        let state = loadActive(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 0 }),
        ]);

        state = conversationsReducer(state, {
            type: 'UNREAD_FROM_MESSAGE',
            conversationId: 1,
            messageId: 101,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(1);
        expect(state.totalUnreadCount).toBe(1);

        state = conversationsReducer(state, {
            type: 'READ_STATE_RECONCILED',
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: 101,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(0);
        expect(state.totalUnreadCount).toBe(0);
    });

    it('mark-read HTTP then MessageCreated increments again', () => {
        let state = loadActive(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 2 }),
        ]);

        state = conversationsReducer(state, {
            type: 'READ_STATE_RECONCILED',
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: 100,
        });

        state = conversationsReducer(state, {
            type: 'UNREAD_FROM_MESSAGE',
            conversationId: 1,
            messageId: 101,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(1);
        expect(state.totalUnreadCount).toBe(1);
    });

    it('MessageCreated then ReadUpdated converges to authoritative totals', () => {
        let state = loadActive(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 0 }),
        ]);

        state = conversationsReducer(state, {
            type: 'UNREAD_FROM_MESSAGE',
            conversationId: 1,
            messageId: 50,
        });

        state = conversationsReducer(state, {
            type: 'READ_STATE_RECONCILED',
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: 50,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(0);
        expect(state.totalUnreadCount).toBe(0);
    });

    it('ReadUpdated then MessageCreated increments unread', () => {
        let state = loadActive(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 1 }),
        ]);

        state = conversationsReducer(state, {
            type: 'READ_STATE_RECONCILED',
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: 40,
        });

        state = conversationsReducer(state, {
            type: 'UNREAD_FROM_MESSAGE',
            conversationId: 1,
            messageId: 41,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(1);
        expect(state.totalUnreadCount).toBe(1);
    });

    it('rejects stale ReadUpdated after a newer mark-read boundary', () => {
        let state = loadActive(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 3 }),
        ]);

        state = conversationsReducer(state, {
            type: 'READ_STATE_RECONCILED',
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: 100,
        });

        state = conversationsReducer(state, {
            type: 'READ_STATE_RECONCILED',
            conversationId: 1,
            unreadCount: 5,
            totalUnreadCount: 5,
            lastReadMessageId: 50,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(0);
        expect(state.totalUnreadCount).toBe(0);
    });

    it('duplicate ReadUpdated events are idempotent', () => {
        let state = loadActive(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 2 }),
        ]);

        const payload = {
            type: 'READ_STATE_RECONCILED' as const,
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: 90,
        };

        state = conversationsReducer(state, payload);
        state = conversationsReducer(state, payload);

        expect(state.summariesById.get(1)?.unreadCount).toBe(0);
        expect(state.totalUnreadCount).toBe(0);
    });

    it('duplicate MessageCreated events do not double-increment unread', () => {
        let state = loadActive(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 0 }),
        ]);

        const action = {
            type: 'UNREAD_FROM_MESSAGE' as const,
            conversationId: 1,
            messageId: 77,
        };

        state = conversationsReducer(state, action);
        state = conversationsReducer(state, action);

        expect(state.summariesById.get(1)?.unreadCount).toBe(1);
        expect(state.totalUnreadCount).toBe(1);
    });

    it('reload resets sync maps and authoritative unread totals', () => {
        let state = loadActive(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 0 }),
        ]);

        state = conversationsReducer(state, {
            type: 'UNREAD_FROM_MESSAGE',
            conversationId: 1,
            messageId: 10,
        });

        state = conversationsReducer(
            conversationsReducer(state, {
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: '42',
                generation: 2,
            }),
            {
                type: 'SUMMARIES_LOAD_SUCCEEDED',
                diagramId: '42',
                generation: 2,
                conversations: [conversation({ id: 1, unreadCount: 4 })],
                status: 'active',
                nextCursor: null,
                append: false,
                totalUnreadCount: 4,
            }
        );

        expect(state.summariesById.get(1)?.unreadCount).toBe(4);
        expect(state.totalUnreadCount).toBe(4);
        expect(state.readBoundariesByConversationId.size).toBe(0);
        expect(state.unreadIncrementHighWaterMarkByConversationId.size).toBe(0);
    });
});
