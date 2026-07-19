import React, { StrictMode, useEffect } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearEchoInstance } from '@/lib/realtime/echo';
import { useRealtime } from '@/hooks/use-realtime';
import type { DiagramCommentEventChannel } from '@/lib/realtime/comment-subscriber';
import { ConnectionManager } from '@/lib/realtime/connection-manager';

interface ConnectionLike {
    bind: ReturnType<typeof vi.fn>;
    unbind: ReturnType<typeof vi.fn>;
}

interface PrivateChannelLike {
    listen: ReturnType<typeof vi.fn>;
    stopListening: ReturnType<typeof vi.fn>;
}

const connectionHandlers = new Map<string, Set<() => void>>();
let connection: ConnectionLike;
let privateChannels: PrivateChannelLike[];
let echoInstance: {
    private: ReturnType<typeof vi.fn>;
    join: ReturnType<typeof vi.fn>;
    leaveChannel: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    connector: { pusher: { connection: ConnectionLike } };
};

const fireConnectionEvent = (event: string): void => {
    const handlers = connectionHandlers.get(event);
    if (handlers === undefined) {
        return;
    }

    for (const handler of handlers) {
        handler();
    }
};

const createPresenceChannelMock = () => ({
    here: vi.fn().mockReturnThis(),
    joining: vi.fn().mockReturnThis(),
    leaving: vi.fn().mockReturnThis(),
    error: vi.fn().mockReturnThis(),
    whisper: vi.fn(),
    listenForWhisper: vi.fn().mockReturnThis(),
    stopListeningForWhisper: vi.fn().mockReturnThis(),
});

vi.mock('pusher-js', () => ({
    default: vi.fn(),
}));

vi.mock('laravel-echo', () => ({
    default: vi.fn(() => echoInstance),
}));

vi.mock('@/hooks/use-auth', () => {
    const user = { id: 1, name: 'Test', email: 'test@example.com' };

    return {
        useAuth: () => ({
            user,
            isAuthenticated: true,
            isLoading: false,
            login: () => undefined,
            register: () => undefined,
            logout: () => undefined,
            fetchUser: () => undefined,
        }),
    };
});

import { RealtimeProvider } from '../realtime-provider';
import { RealtimeContext } from '../realtime-context';

const resetEchoHarness = (): void => {
    connectionHandlers.clear();
    privateChannels = [];

    connection = {
        bind: vi.fn((event: string, handler: () => void) => {
            const handlers = connectionHandlers.get(event) ?? new Set();
            handlers.add(handler);
            connectionHandlers.set(event, handlers);
        }),
        unbind: vi.fn((event: string, handler?: () => void) => {
            const handlers = connectionHandlers.get(event);
            if (handlers === undefined) {
                return;
            }

            if (handler === undefined) {
                connectionHandlers.delete(event);
                return;
            }

            handlers.delete(handler);
        }),
    };

    echoInstance = {
        private: vi.fn(() => {
            const channel: PrivateChannelLike = {
                listen: vi.fn().mockReturnThis(),
                stopListening: vi.fn(),
            };
            privateChannels.push(channel);
            return channel;
        }),
        join: vi.fn(() => createPresenceChannelMock()),
        leaveChannel: vi.fn(),
        disconnect: vi.fn(),
        connector: {
            pusher: {
                connection,
            },
        },
    };
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RealtimeProvider>{children}</RealtimeProvider>
);

const simulateReconnect = (): void => {
    act(() => {
        fireConnectionEvent('connected');
        fireConnectionEvent('disconnected');
        fireConnectionEvent('connected');
    });
};

const countConnectedBinds = (): number =>
    connection.bind.mock.calls.filter((call) => call[0] === 'connected').length;

describe('RealtimeContext managed private channel and onReconnect', () => {
    beforeEach(() => {
        clearEchoInstance();
        resetEchoHarness();
    });

    afterEach(() => {
        clearEchoInstance();
    });

    it('exposes getDiagramPrivateChannel and returns null before join', async () => {
        const { result } = renderHook(() => useRealtime(), { wrapper });

        await waitFor(() => {
            expect(result.current.connectionStatus).toBe('connecting');
        });

        expect(typeof result.current.getDiagramPrivateChannel).toBe('function');
        expect(result.current.getDiagramPrivateChannel()).toBeNull();
    });

    it('returns the current managed private channel after join', async () => {
        const { result } = renderHook(() => useRealtime(), { wrapper });

        await waitFor(() => {
            expect(echoInstance.private).toHaveBeenCalled();
        });

        act(() => {
            result.current.joinDiagram('42');
        });

        const channel = result.current.getDiagramPrivateChannel();
        expect(channel).not.toBeNull();
        expect(channel).toBe(privateChannels[privateChannels.length - 1]);
    });

    it('exposes onReconnect and invokes listeners on ConnectionManager reconnect', async () => {
        const { result } = renderHook(() => useRealtime(), { wrapper });

        await waitFor(() => {
            expect(connection.bind).toHaveBeenCalledWith(
                'connected',
                expect.any(Function)
            );
        });

        const listener = vi.fn();
        let unsubscribe: (() => void) | undefined;

        act(() => {
            unsubscribe = result.current.onReconnect(listener);
        });

        simulateReconnect();

        expect(listener).toHaveBeenCalledTimes(1);

        act(() => {
            unsubscribe?.();
        });
    });

    it('unsubscribe prevents future invocation', async () => {
        const { result } = renderHook(() => useRealtime(), { wrapper });

        await waitFor(() => {
            expect(connection.bind).toHaveBeenCalled();
        });

        const listener = vi.fn();
        let unsubscribe: () => void = () => undefined;

        act(() => {
            unsubscribe = result.current.onReconnect(listener);
        });

        act(() => {
            unsubscribe();
        });

        simulateReconnect();

        expect(listener).not.toHaveBeenCalled();
    });

    it('supports multiple listeners and independent unsubscribe', async () => {
        const { result } = renderHook(() => useRealtime(), { wrapper });

        await waitFor(() => {
            expect(connection.bind).toHaveBeenCalled();
        });

        const listenerA = vi.fn();
        const listenerB = vi.fn();
        let unsubscribeA: () => void = () => undefined;

        act(() => {
            unsubscribeA = result.current.onReconnect(listenerA);
            result.current.onReconnect(listenerB);
        });

        simulateReconnect();

        expect(listenerA).toHaveBeenCalledTimes(1);
        expect(listenerB).toHaveBeenCalledTimes(1);

        act(() => {
            unsubscribeA();
        });

        simulateReconnect();

        expect(listenerA).toHaveBeenCalledTimes(1);
        expect(listenerB).toHaveBeenCalledTimes(2);
    });

    it('notifies same-commit descendant after managed channel rejoin', async () => {
        let channelBeforeReconnect: DiagramCommentEventChannel | null = null;
        let channelSeenByConsumer: DiagramCommentEventChannel | null = null;
        const consumerCalls = vi.fn();
        const api = {
            joinDiagram: null as ((diagramId: string) => void) | null,
            getDiagramPrivateChannel: null as
                | (() => DiagramCommentEventChannel | null)
                | null,
        };

        const ReconnectConsumer = () => {
            const { onReconnect, joinDiagram, getDiagramPrivateChannel } =
                useRealtime();

            api.joinDiagram = joinDiagram;
            api.getDiagramPrivateChannel = getDiagramPrivateChannel;

            useEffect(() => {
                return onReconnect(() => {
                    consumerCalls();
                    channelSeenByConsumer = getDiagramPrivateChannel();
                });
            }, [onReconnect, getDiagramPrivateChannel]);

            return null;
        };

        render(
            <RealtimeProvider>
                <ReconnectConsumer />
            </RealtimeProvider>
        );

        await waitFor(() => {
            expect(connection.bind).toHaveBeenCalledWith(
                'connected',
                expect.any(Function)
            );
            expect(api.joinDiagram).not.toBeNull();
        });

        act(() => {
            api.joinDiagram?.('42');
        });

        channelBeforeReconnect = api.getDiagramPrivateChannel?.() ?? null;
        expect(channelBeforeReconnect).not.toBeNull();

        simulateReconnect();

        expect(consumerCalls).toHaveBeenCalledTimes(1);
        expect(channelSeenByConsumer).not.toBeNull();
        expect(channelSeenByConsumer).not.toBe(channelBeforeReconnect);
        expect(channelSeenByConsumer).toBe(
            privateChannels[privateChannels.length - 1]
        );
    });

    it('notifies same-commit descendant after rejoin under Strict Mode without leaks', async () => {
        let channelBeforeReconnect: DiagramCommentEventChannel | null = null;
        let channelSeenByConsumer: DiagramCommentEventChannel | null = null;
        const consumerCalls = vi.fn();
        const api = {
            joinDiagram: null as ((diagramId: string) => void) | null,
            getDiagramPrivateChannel: null as
                | (() => DiagramCommentEventChannel | null)
                | null,
        };

        const ReconnectConsumer = () => {
            const { onReconnect, joinDiagram, getDiagramPrivateChannel } =
                useRealtime();

            api.joinDiagram = joinDiagram;
            api.getDiagramPrivateChannel = getDiagramPrivateChannel;

            useEffect(() => {
                return onReconnect(() => {
                    consumerCalls();
                    channelSeenByConsumer = getDiagramPrivateChannel();
                });
            }, [onReconnect, getDiagramPrivateChannel]);

            return null;
        };

        const { unmount } = render(
            <StrictMode>
                <RealtimeProvider>
                    <ReconnectConsumer />
                </RealtimeProvider>
            </StrictMode>
        );

        await waitFor(() => {
            expect(connection.bind).toHaveBeenCalledWith(
                'connected',
                expect.any(Function)
            );
            expect(api.joinDiagram).not.toBeNull();
        });

        act(() => {
            api.joinDiagram?.('42');
        });

        channelBeforeReconnect = api.getDiagramPrivateChannel?.() ?? null;
        expect(channelBeforeReconnect).not.toBeNull();

        simulateReconnect();

        expect(consumerCalls).toHaveBeenCalledTimes(1);
        expect(channelSeenByConsumer).not.toBeNull();
        expect(channelSeenByConsumer).not.toBe(channelBeforeReconnect);
        expect(channelSeenByConsumer).toBe(
            privateChannels[privateChannels.length - 1]
        );

        unmount();
        consumerCalls.mockClear();

        simulateReconnect();
        expect(consumerCalls).not.toHaveBeenCalled();
    });

    it('does not create a second Echo/Pusher connection listener via onReconnect', async () => {
        const { result } = renderHook(() => useRealtime(), { wrapper });

        await waitFor(() => {
            expect(connection.bind).toHaveBeenCalledWith(
                'connected',
                expect.any(Function)
            );
        });

        const connectedBindCount = countConnectedBinds();

        act(() => {
            result.current.onReconnect(() => undefined);
            result.current.onReconnect(() => undefined);
            result.current.onReconnect(() => undefined);
        });

        expect(countConnectedBinds()).toBe(connectedBindCount);
        expect(connectedBindCount).toBe(1);
    });

    it('keeps a single internal ConnectionManager reconnect registration for multiple consumers', async () => {
        const onReconnectSpy = vi.spyOn(
            ConnectionManager.prototype,
            'onReconnect'
        );

        const consumerA = vi.fn();
        const consumerB = vi.fn();

        const MultiConsumer = () => {
            const { onReconnect } = useRealtime();

            useEffect(() => onReconnect(consumerA), [onReconnect]);
            useEffect(() => onReconnect(consumerB), [onReconnect]);

            return null;
        };

        render(
            <RealtimeProvider>
                <MultiConsumer />
            </RealtimeProvider>
        );

        await waitFor(() => {
            expect(connection.bind).toHaveBeenCalled();
        });

        // One internal CM registration from the provider lifecycle effect.
        expect(onReconnectSpy).toHaveBeenCalledTimes(1);

        simulateReconnect();

        expect(consumerA).toHaveBeenCalledTimes(1);
        expect(consumerB).toHaveBeenCalledTimes(1);
        expect(countConnectedBinds()).toBe(1);

        onReconnectSpy.mockRestore();
    });

    it('uses safe defaults outside the provider', () => {
        const { result } = renderHook(() => React.useContext(RealtimeContext));

        expect(result.current.getDiagramPrivateChannel()).toBeNull();

        const unsubscribe = result.current.onReconnect(() => undefined);
        expect(typeof unsubscribe).toBe('function');
        expect(() => unsubscribe()).not.toThrow();
    });
});
