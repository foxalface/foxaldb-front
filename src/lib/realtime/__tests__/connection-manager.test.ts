import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConnectionManager } from '@/lib/realtime/connection-manager';
import { clearEchoInstance, setEchoInstance } from '@/lib/realtime/echo';
import type Echo from 'laravel-echo';

interface StateChange {
    previous: string;
    current: string;
}

const createConnection = () => {
    const handlers = new Map<string, Set<(payload?: StateChange) => void>>();

    return {
        bind: (event: string, handler: (payload?: StateChange) => void) => {
            const set = handlers.get(event) ?? new Set();
            set.add(handler);
            handlers.set(event, set);
        },
        unbind: (event: string, handler?: (payload?: StateChange) => void) => {
            const set = handlers.get(event);
            if (set === undefined || handler === undefined) {
                return;
            }
            set.delete(handler);
        },
        emit(event: string, payload?: StateChange) {
            for (const handler of handlers.get(event) ?? []) {
                handler(payload);
            }
        },
    };
};

describe('ConnectionManager pusher state_change', () => {
    afterEach(() => {
        clearEchoInstance();
    });

    it('does not reconnect on the initial connected transition', () => {
        const connection = createConnection();
        setEchoInstance({
            connector: { pusher: { connection } },
            disconnect: () => undefined,
        } as unknown as Echo<'reverb'>);

        const manager = new ConnectionManager();
        const onReconnect = vi.fn();
        manager.onReconnect(onReconnect);
        manager.attach();

        connection.emit('state_change', {
            previous: 'initialized',
            current: 'connecting',
        });
        connection.emit('state_change', {
            previous: 'connecting',
            current: 'connected',
        });

        expect(onReconnect).not.toHaveBeenCalled();
        expect(manager.getStatus()).toBe('connected');
    });

    it('reconnects after browser-offline unavailable without a disconnected event', () => {
        const connection = createConnection();
        setEchoInstance({
            connector: { pusher: { connection } },
            disconnect: () => undefined,
        } as unknown as Echo<'reverb'>);

        const manager = new ConnectionManager();
        const onReconnect = vi.fn();
        manager.onReconnect(onReconnect);
        manager.attach();

        connection.emit('state_change', {
            previous: 'connecting',
            current: 'connected',
        });
        connection.emit('state_change', {
            previous: 'connected',
            current: 'connecting',
        });
        connection.emit('state_change', {
            previous: 'connecting',
            current: 'unavailable',
        });
        connection.emit('state_change', {
            previous: 'unavailable',
            current: 'connected',
        });

        expect(onReconnect).toHaveBeenCalledTimes(1);
        expect(manager.getStatus()).toBe('connected');
    });
});
