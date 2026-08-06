import { describe, expect, it, vi } from 'vitest';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { buildUserIdentity } from '@/lib/user';
import {
    DIAGRAM_CONVERSATION_CREATED_EVENT,
    DIAGRAM_CONVERSATION_DELETED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_REACTIONS_UPDATED_EVENT,
} from '../conversation-events';
import type { DiagramPrivateEventChannel } from '../diagram-private-channel';
import { subscribeToDiagramConversationEvents } from '../conversation-subscriber';

type EventCallback = (payload: unknown) => void;

const createFakeChannel = (): DiagramPrivateEventChannel & {
    listeners: Map<string, Set<EventCallback>>;
    emit: (event: string, payload: unknown) => void;
} => {
    const listeners = new Map<string, Set<EventCallback>>();

    const channel: DiagramPrivateEventChannel & {
        listeners: Map<string, Set<EventCallback>>;
        emit: (event: string, payload: unknown) => void;
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

const baseConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 10,
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    status: 'active',
    archivedAt: null,
    messageCount: 1,
    lastMessageAt: '2026-07-19T10:00:00.000Z',
    lastMessageBody: 'Hello',
    lastMessageAuthor: buildUserIdentity(7, 'Alice', 'Martin'),
    createdAt: '2026-07-19T10:00:00.000Z',
    updatedAt: '2026-07-19T10:05:00.000Z',
    unreadCount: 0,
    ...overrides,
});

describe('subscribeToDiagramConversationEvents', () => {
    it('subscribes to all eight conversation event names', () => {
        const channel = createFakeChannel();

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch: vi.fn(),
        });

        expect(channel.listeners.size).toBe(8);
        expect(channel.listeners.has(DIAGRAM_CONVERSATION_CREATED_EVENT)).toBe(
            true
        );
        expect(
            channel.listeners.has(DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT)
        ).toBe(true);
    });

    it('dispatches CONVERSATION_UPSERTED for valid Created', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();
        const conversation = baseConversation();

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_CONVERSATION_CREATED_EVENT, {
            conversation,
            userId: 7,
        });

        expect(dispatch).toHaveBeenCalledWith({
            type: 'CONVERSATION_UPSERTED',
            conversation,
            preserveUnreadCount: false,
        });
    });

    it('dispatches CONVERSATION_REMOVED for valid Deleted', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_CONVERSATION_DELETED_EVENT, {
            conversationId: 10,
            diagramId: 42,
            userId: 7,
        });

        expect(dispatch).toHaveBeenCalledWith({
            type: 'CONVERSATION_REMOVED',
            conversationId: 10,
        });
    });

    it('dispatches conversation and message updates for message created', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();
        const conversation = baseConversation({ messageCount: 2 });
        const message = {
            id: 99,
            conversationId: 10,
            body: 'New message',
            user: buildUserIdentity(7, 'Alice', 'Martin'),
            createdAt: '2026-07-19T11:00:00.000Z',
            updatedAt: '2026-07-19T11:00:00.000Z',
            reactions: [],
        };

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT, {
            message,
            conversation,
            userId: 7,
        });

        expect(dispatch).toHaveBeenCalledWith({
            type: 'CONVERSATION_UPSERTED',
            conversation,
            preserveUnreadCount: true,
        });
        expect(dispatch).toHaveBeenCalledWith({
            type: 'MESSAGE_UPSERTED',
            message,
        });
        expect(dispatch).toHaveBeenCalledWith({
            type: 'UNREAD_FROM_MESSAGE',
            conversationId: 10,
            messageId: 99,
        });
    });

    it('does not increment unread for own message-created events', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();
        const conversation = baseConversation({ messageCount: 2 });
        const message = {
            id: 99,
            conversationId: 10,
            body: 'New message',
            user: buildUserIdentity(7, 'Alice', 'Martin'),
            createdAt: '2026-07-19T11:00:00.000Z',
            updatedAt: '2026-07-19T11:00:00.000Z',
            reactions: [],
        };

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch,
            getCurrentUserId: () => 7,
        });

        channel.emit(DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT, {
            message,
            conversation,
            userId: 7,
        });

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'UNREAD_FROM_MESSAGE' })
        );
    });

    it('cleanup stops listening with the same callbacks', () => {
        const channel = createFakeChannel();
        const stopListening = vi.spyOn(channel, 'stopListening');

        const cleanup = subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch: vi.fn(),
        });

        cleanup();

        expect(stopListening).toHaveBeenCalledTimes(8);
    });

    it('dispatches MESSAGE_REACTIONS_UPDATED for valid reaction snapshots', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch,
            getCurrentUserId: () => 7,
        });

        channel.emit(DIAGRAM_CONVERSATION_MESSAGE_REACTIONS_UPDATED_EVENT, {
            diagramId: 42,
            conversationId: 10,
            messageId: 99,
            reactions: [
                {
                    emoji: '👍',
                    count: 2,
                    previewUsers: [],
                    previewTruncated: false,
                },
            ],
            userId: 7,
        });

        expect(dispatch).toHaveBeenCalledWith({
            type: 'MESSAGE_REACTIONS_UPDATED',
            conversationId: 10,
            messageId: 99,
            reactions: [
                {
                    emoji: '👍',
                    count: 2,
                    previewUsers: [],
                    previewTruncated: false,
                },
            ],
            ownership: 'reconcile',
            currentUserId: 7,
        });
    });
});
