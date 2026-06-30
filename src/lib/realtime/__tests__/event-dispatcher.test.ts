import { describe, expect, it, vi } from 'vitest';
import { EventDispatcher } from '../event-dispatcher';
import type { RealtimePingPayload } from '../events';

describe('EventDispatcher', () => {
    it('dispatches Realtime.Ping to subscribed handlers', () => {
        const dispatcher = new EventDispatcher();
        const handler = vi.fn();
        const payload: RealtimePingPayload = {
            message: 'ping',
            sentAt: '2026-06-30T12:00:00Z',
            userId: 1,
        };

        dispatcher.on('Realtime.Ping', handler);
        dispatcher.emit('Realtime.Ping', payload);

        expect(handler).toHaveBeenCalledWith(payload);
    });

    it('unsubscribes handlers', () => {
        const dispatcher = new EventDispatcher();
        const handler = vi.fn();

        const unsubscribe = dispatcher.on('Realtime.Ping', handler);
        unsubscribe();
        dispatcher.emit('Realtime.Ping', {
            message: 'ping',
            sentAt: '2026-06-30T12:00:00Z',
            userId: 1,
        });

        expect(handler).not.toHaveBeenCalled();
    });

    it('clears all handlers', () => {
        const dispatcher = new EventDispatcher();
        const handler = vi.fn();

        dispatcher.on('Realtime.Ping', handler);
        dispatcher.clear();
        dispatcher.emit('Realtime.Ping', {
            message: 'ping',
            sentAt: '2026-06-30T12:00:00Z',
            userId: 1,
        });

        expect(handler).not.toHaveBeenCalled();
    });
});
