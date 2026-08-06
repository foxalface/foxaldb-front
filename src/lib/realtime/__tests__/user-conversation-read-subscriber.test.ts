import { describe, expect, it, vi } from 'vitest';
import { DIAGRAM_CONVERSATION_READ_UPDATED_EVENT } from '../conversation-events';
import type { DiagramPrivateEventChannel } from '../diagram-private-channel';
import { subscribeToUserConversationReadEvents } from '../user-conversation-read-subscriber';

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

describe('subscribeToUserConversationReadEvents', () => {
    it('subscribes to DiagramConversationReadUpdated on the user channel', () => {
        const channel = createFakeChannel();

        subscribeToUserConversationReadEvents({
            channel,
            diagramId: '42',
            dispatch: vi.fn(),
        });

        expect(
            channel.listeners.has(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT)
        ).toBe(true);
    });

    it('replaces unread counts from authoritative payload values', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToUserConversationReadEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 42,
            conversationId: 10,
            unreadCount: 0,
            totalUnreadCount: 2,
            lastReadMessageId: 99,
        });

        expect(dispatch).toHaveBeenCalledWith({
            type: 'READ_STATE_RECONCILED',
            conversationId: 10,
            unreadCount: 0,
            totalUnreadCount: 2,
            lastReadMessageId: 99,
        });
        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'UNREAD_TOTAL_INCREMENT' })
        );
    });

    it('ignores events for a different diagram', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToUserConversationReadEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 99,
            conversationId: 10,
            unreadCount: 5,
            totalUnreadCount: 5,
            lastReadMessageId: null,
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('ignores malformed payloads', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToUserConversationReadEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
            diagramId: 42,
            conversationId: 'bad',
            unreadCount: 1,
            totalUnreadCount: 1,
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('stops listening on cleanup', () => {
        const channel = createFakeChannel();
        const stopListening = vi.spyOn(channel, 'stopListening');

        const cleanup = subscribeToUserConversationReadEvents({
            channel,
            diagramId: '42',
            dispatch: vi.fn(),
        });

        cleanup();

        expect(stopListening).toHaveBeenCalledWith(
            DIAGRAM_CONVERSATION_READ_UPDATED_EVENT,
            expect.any(Function)
        );
    });
});
