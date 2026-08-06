import { describe, expect, it, vi } from 'vitest';
import { aliceAuthor } from '@/test/user-identity-fixtures';
import {
    conversationsReducer,
    initialConversationsState,
} from '../conversation-reducer';
import type { DiagramConversation } from '../conversation-types';
import { DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT } from '@/lib/realtime/conversation-events';
import { subscribeToDiagramConversationEvents } from '@/lib/realtime/conversation-subscriber';
import type { DiagramPrivateEventChannel } from '@/lib/realtime/diagram-private-channel';
import { subscribeToUserConversationReadEvents } from '@/lib/realtime/user-conversation-read-subscriber';
import { DIAGRAM_CONVERSATION_READ_UPDATED_EVENT } from '@/lib/realtime/conversation-events';

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

type EventCallback = (payload: unknown) => void;

const createFakeChannel = (): DiagramPrivateEventChannel & {
    emit: (event: string, payload: unknown) => void;
    listeners: Map<string, Set<EventCallback>>;
} => {
    const listeners = new Map<string, Set<EventCallback>>();

    const channel: DiagramPrivateEventChannel & {
        emit: (event: string, payload: unknown) => void;
        listeners: Map<string, Set<EventCallback>>;
    } = {
        listeners,
        listen(event, callback) {
            let set = listeners.get(event);
            if (set === undefined) {
                set = new Set();
                listeners.set(event, set);
            }
            set.add(callback);
            return channel;
        },
        stopListening(event, callback) {
            const set = listeners.get(event);
            if (set === undefined) {
                return channel;
            }
            if (callback === undefined) {
                set.clear();
            } else {
                set.delete(callback);
            }
            return channel;
        },
        emit(event, payload) {
            const set = listeners.get(event);
            if (set === undefined) {
                return;
            }
            for (const callback of set) {
                callback(payload);
            }
        },
    };

    return channel;
};

/**
 * Regression coverage for the eight unread architecture rules.
 */
describe('conversation unread architecture rules', () => {
    it('rule 1: never fabricate summaries on CONVERSATION_UNREAD_SET', () => {
        const state = conversationsReducer(initialConversationsState(), {
            type: 'CONVERSATION_UNREAD_SET',
            conversationId: 99,
            unreadCount: 3,
        });

        expect(state.summariesById.size).toBe(0);
    });

    it('rule 2: authoritative totals replace rather than increment locally', () => {
        const loaded = conversationsReducer(
            conversationsReducer(initialConversationsState(), {
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: '42',
                generation: 1,
            }),
            {
                type: 'SUMMARIES_LOAD_SUCCEEDED',
                diagramId: '42',
                generation: 1,
                conversations: [conversation({ id: 1, unreadCount: 5 })],
                status: 'active',
                nextCursor: null,
                append: false,
                totalUnreadCount: 5,
            }
        );

        const replaced = conversationsReducer(loaded, {
            type: 'UNREAD_TOTAL_SET',
            totalUnreadCount: 2,
        });

        expect(replaced.totalUnreadCount).toBe(2);
    });

    it('rule 3: preserveUnreadCount keeps local unread on realtime upserts', () => {
        const loaded = conversationsReducer(
            conversationsReducer(initialConversationsState(), {
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: '42',
                generation: 1,
            }),
            {
                type: 'SUMMARIES_LOAD_SUCCEEDED',
                diagramId: '42',
                generation: 1,
                conversations: [conversation({ id: 1, unreadCount: 4 })],
                status: 'active',
                nextCursor: null,
                append: false,
                totalUnreadCount: 4,
            }
        );

        const state = conversationsReducer(loaded, {
            type: 'CONVERSATION_UPSERTED',
            conversation: conversation({
                id: 1,
                unreadCount: 0,
                messageCount: 2,
            }),
            preserveUnreadCount: true,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(4);
    });

    it('rule 4: ReadUpdated replaces counts without increment actions', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToUserConversationReadEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 42,
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 1,
            lastReadMessageId: 10,
        });

        expect(dispatch).toHaveBeenCalledWith({
            type: 'READ_STATE_RECONCILED',
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 1,
            lastReadMessageId: 10,
        });
        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'UNREAD_FROM_MESSAGE' })
        );
    });

    it('rule 5: message-created increments unread for other users only', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();
        const wsConversation = {
            id: 1,
            diagramId: 42,
            targetType: 'diagram' as const,
            targetId: null,
            status: 'active' as const,
            archivedAt: null,
            messageCount: 2,
            lastMessageAt: '2026-01-02T12:00:00.000Z',
            lastMessageBody: 'Hi',
            lastMessageAuthor: aliceAuthor,
            unreadCount: 0,
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-02T12:00:00.000Z',
        };

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch,
            getCurrentUserId: () => 1,
        });

        channel.emit(DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT, {
            message: {
                id: 50,
                conversationId: 1,
                body: 'Other user',
                user: aliceAuthor,
                createdAt: '2026-01-02T12:00:00.000Z',
                updatedAt: '2026-01-02T12:00:00.000Z',
                reactions: [],
            },
            conversation: wsConversation,
            userId: 2,
        });

        expect(dispatch).toHaveBeenCalledWith({
            type: 'UNREAD_FROM_MESSAGE',
            conversationId: 1,
            messageId: 50,
        });
    });

    it('rule 6: own message-created does not increment unread', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch,
            getCurrentUserId: () => 1,
        });

        channel.emit(DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT, {
            message: {
                id: 51,
                conversationId: 1,
                body: 'Mine',
                user: aliceAuthor,
                createdAt: '2026-01-02T12:00:00.000Z',
                updatedAt: '2026-01-02T12:00:00.000Z',
                reactions: [],
            },
            conversation: {
                id: 1,
                diagramId: 42,
                targetType: 'diagram',
                targetId: null,
                status: 'active',
                archivedAt: null,
                messageCount: 2,
                lastMessageAt: '2026-01-02T12:00:00.000Z',
                lastMessageBody: 'Mine',
                lastMessageAuthor: aliceAuthor,
                unreadCount: 0,
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-02T12:00:00.000Z',
            },
            userId: 1,
        });

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'UNREAD_FROM_MESSAGE' })
        );
    });

    it('rule 7: CONVERSATION_REMOVED adjusts total unread by removed summary', () => {
        const loaded = conversationsReducer(
            conversationsReducer(initialConversationsState(), {
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: '42',
                generation: 1,
            }),
            {
                type: 'SUMMARIES_LOAD_SUCCEEDED',
                diagramId: '42',
                generation: 1,
                conversations: [conversation({ id: 1, unreadCount: 3 })],
                status: 'active',
                nextCursor: null,
                append: false,
                totalUnreadCount: 3,
            }
        );

        const state = conversationsReducer(loaded, {
            type: 'CONVERSATION_REMOVED',
            conversationId: 1,
        });

        expect(state.totalUnreadCount).toBe(0);
    });

    it('rule 8: ReadUpdated ignores other diagrams', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToUserConversationReadEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 7,
            conversationId: 1,
            unreadCount: 0,
            totalUnreadCount: 0,
            lastReadMessageId: null,
        });

        expect(dispatch).not.toHaveBeenCalled();
    });
});
