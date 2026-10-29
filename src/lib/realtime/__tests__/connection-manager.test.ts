import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConnectionManager } from '@/lib/realtime/connection-manager';
import { clearEchoInstance, setEchoInstance } from '@/lib/realtime/echo';
import type Echo from 'laravel-echo';
import LaravelEcho from 'laravel-echo';
import Pusher from 'pusher-js';

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

const attachManager = () => {
    const connection = createConnection();
    const echo = {
        connector: { pusher: { connection } },
        disconnect: () => undefined,
    } as unknown as Echo<'reverb'>;
    setEchoInstance(echo);

    const manager = new ConnectionManager();
    const onReconnect = vi.fn();
    manager.onReconnect(onReconnect);
    manager.attach();

    return { connection, echo, manager, onReconnect };
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

    it('reconnects on connecting to connected after the session is established', () => {
        const { connection, onReconnect } = attachManager();

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
            current: 'connected',
        });

        expect(onReconnect).toHaveBeenCalledTimes(1);
    });

    it('does not refresh when an intentional disconnect is followed by a new connection', () => {
        const { connection, echo, manager, onReconnect } = attachManager();

        connection.emit('state_change', {
            previous: 'connecting',
            current: 'connected',
        });
        manager.disconnect();
        setEchoInstance(echo);
        manager.attach();
        connection.emit('state_change', {
            previous: 'connecting',
            current: 'connected',
        });

        expect(onReconnect).not.toHaveBeenCalled();
        expect(manager.getStatus()).toBe('connected');
    });

    it('notifies a subscriber that registered after the initial connection', () => {
        const { connection, manager } = attachManager();

        connection.emit('state_change', {
            previous: 'connecting',
            current: 'connected',
        });

        const late = vi.fn();
        manager.onReconnect(late);
        connection.emit('state_change', {
            previous: 'connected',
            current: 'unavailable',
        });
        connection.emit('state_change', {
            previous: 'unavailable',
            current: 'connected',
        });

        expect(late).toHaveBeenCalledTimes(1);
    });

    it('notifies once per reconnect episode and ignores a repeated connected event', () => {
        const { connection, onReconnect } = attachManager();

        connection.emit('state_change', {
            previous: 'connecting',
            current: 'connected',
        });

        connection.emit('state_change', {
            previous: 'connected',
            current: 'unavailable',
        });
        connection.emit('state_change', {
            previous: 'unavailable',
            current: 'connected',
        });
        connection.emit('state_change', {
            previous: 'connected',
            current: 'connected',
        });

        expect(onReconnect).toHaveBeenCalledTimes(1);

        connection.emit('state_change', {
            previous: 'connected',
            current: 'disconnected',
        });
        connection.emit('state_change', {
            previous: 'disconnected',
            current: 'connected',
        });

        expect(onReconnect).toHaveBeenCalledTimes(2);
    });
});

describe('ConnectionManager against the real Pusher connection', () => {
    afterEach(() => {
        clearEchoInstance();
    });

    it('treats unavailable to connected on the live connection object as one reconnect', () => {
        const PusherCtor =
            typeof (Pusher as unknown as { Pusher?: unknown }).Pusher ===
            'function'
                ? (
                      Pusher as unknown as {
                          Pusher: new (...args: unknown[]) => unknown;
                      }
                  ).Pusher
                : Pusher;

        window.Pusher = PusherCtor as unknown as typeof window.Pusher;

        const echo = new LaravelEcho({
            broadcaster: 'reverb',
            key: 'foxaldb-key',
            wsHost: 'localhost',
            wsPort: 8080,
            wssPort: 8080,
            forceTLS: false,
            enabledTransports: ['ws'],
            disableStats: true,
        });

        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ConnectionManager();
        const onReconnect = vi.fn();
        manager.onReconnect(onReconnect);
        manager.attach();

        const connection = (
            echo.connector as {
                pusher?: {
                    connection: {
                        emit: (
                            event: string,
                            payload?: { previous: string; current: string }
                        ) => void;
                    };
                };
            }
        ).pusher?.connection;

        expect(connection).toBeDefined();

        connection?.emit('state_change', {
            previous: 'connecting',
            current: 'connected',
        });
        connection?.emit('state_change', {
            previous: 'connected',
            current: 'connecting',
        });
        connection?.emit('state_change', {
            previous: 'connecting',
            current: 'unavailable',
        });
        connection?.emit('state_change', {
            previous: 'unavailable',
            current: 'connected',
        });

        expect(onReconnect).toHaveBeenCalledTimes(1);

        echo.disconnect();
    });
});
