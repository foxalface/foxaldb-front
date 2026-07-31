import { describe, expect, it, vi } from 'vitest';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { buildUserIdentity } from '@/lib/user';
import {
    DIAGRAM_CONVERSATION_CREATED_EVENT,
    DIAGRAM_CONVERSATION_DELETED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT,
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
    lastMessagePreview: 'Hello',
    lastMessageAuthor: buildUserIdentity(7, 'Alice', 'Martin'),
    createdAt: '2026-07-19T10:00:00.000Z',
    updatedAt: '2026-07-19T10:05:00.000Z',
    ...overrides,
});

describe('subscribeToDiagramConversationEvents', () => {
    it('subscribes to all seven conversation event names', () => {
        const channel = createFakeChannel();

        subscribeToDiagramConversationEvents({
            channel,
            diagramId: '42',
            dispatch: vi.fn(),
        });

        expect(channel.listeners.size).toBe(7);
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
        });
        expect(dispatch).toHaveBeenCalledWith({
            type: 'MESSAGE_UPSERTED',
            message,
        });
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

        expect(stopListening).toHaveBeenCalledTimes(7);
    });
});
