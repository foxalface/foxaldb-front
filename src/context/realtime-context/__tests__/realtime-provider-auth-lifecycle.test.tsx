import React, { useEffect } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearEchoInstance } from '@/lib/realtime/echo';
import { useRealtime } from '@/hooks/use-realtime';

interface ConnectionLike {
    bind: ReturnType<typeof vi.fn>;
    unbind: ReturnType<typeof vi.fn>;
    state: string;
}

const connectionHandlers = new Map<
    string,
    Set<(payload?: { previous: string; current: string }) => void>
>();

const authState: {
    user: { id: number; name: string; email: string } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
} = {
    user: { id: 1, name: 'A', email: 'a@example.com' },
    isAuthenticated: true,
    isLoading: false,
};

let connection: ConnectionLike;
let echoInstance: {
    private: ReturnType<typeof vi.fn>;
    join: ReturnType<typeof vi.fn>;
    leaveChannel: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    connector: { pusher: { connection: ConnectionLike } };
};

const fireState = (previous: string, current: string): void => {
    connection.state = current;
    const handlers = connectionHandlers.get('state_change');
    if (handlers === undefined) {
        return;
    }

    for (const handler of handlers) {
        handler({ previous, current });
    }
};

vi.mock('pusher-js', () => ({
    default: vi.fn(),
}));

vi.mock('laravel-echo', () => ({
    default: vi.fn(() => echoInstance),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

import LaravelEcho from 'laravel-echo';
import { RealtimeProvider } from '../realtime-provider';

const EchoConstructor = vi.mocked(LaravelEcho);

const resetEchoHarness = (): void => {
    connectionHandlers.clear();
    connection = {
        state: 'initialized',
        bind: vi.fn(
            (
                event: string,
                handler: (payload?: {
                    previous: string;
                    current: string;
                }) => void
            ) => {
                const handlers = connectionHandlers.get(event) ?? new Set();
                handlers.add(handler);
                connectionHandlers.set(event, handlers);
            }
        ),
        unbind: vi.fn(),
    };

    echoInstance = {
        private: vi.fn(() => ({
            listen: vi.fn().mockReturnThis(),
            stopListening: vi.fn(),
        })),
        join: vi.fn(() => ({
            here: vi.fn().mockReturnThis(),
            joining: vi.fn().mockReturnThis(),
            leaving: vi.fn().mockReturnThis(),
            error: vi.fn().mockReturnThis(),
            whisper: vi.fn(),
            listenForWhisper: vi.fn().mockReturnThis(),
            stopListeningForWhisper: vi.fn().mockReturnThis(),
        })),
        leaveChannel: vi.fn(),
        disconnect: vi.fn(),
        connector: { pusher: { connection } },
    };
};

const establishConnection = (): void => {
    act(() => {
        fireState('initialized', 'connecting');
        fireState('connecting', 'connected');
    });
};

const ProviderTree = ({ children }: { children: React.ReactNode }) => (
    <RealtimeProvider>{children}</RealtimeProvider>
);

describe('RealtimeProvider auth lifecycle', () => {
    beforeEach(() => {
        clearEchoInstance();
        resetEchoHarness();
        EchoConstructor.mockClear();
        authState.user = { id: 1, name: 'A', email: 'a@example.com' };
        authState.isAuthenticated = true;
        authState.isLoading = false;
    });

    afterEach(() => {
        clearEchoInstance();
    });

    it('does not tear down Echo when session revalidation replaces the user object with the same id', async () => {
        const view = render(<ProviderTree>{null}</ProviderTree>);

        await waitFor(() => {
            expect(EchoConstructor).toHaveBeenCalledTimes(1);
        });

        establishConnection();

        const disconnectCallsBefore = echoInstance.disconnect.mock.calls.length;

        authState.user = { id: 1, name: 'A refreshed', email: 'a@example.com' };
        view.rerender(<ProviderTree>{null}</ProviderTree>);

        await act(async () => {
            await Promise.resolve();
        });

        expect(EchoConstructor).toHaveBeenCalledTimes(1);
        expect(echoInstance.disconnect.mock.calls.length).toBe(
            disconnectCallsBefore
        );
    });

    it('still emits reconnect after same-id user object replacement and transport recovery', async () => {
        const onReconnect = vi.fn();

        const Listener = (): null => {
            const { onReconnect: subscribe } = useRealtime();

            useEffect(() => subscribe(onReconnect), [subscribe]);

            return null;
        };

        const view = render(
            <ProviderTree>
                <Listener />
            </ProviderTree>
        );

        establishConnection();

        act(() => {
            fireState('connected', 'connecting');
            fireState('connecting', 'unavailable');
        });

        authState.user = { id: 1, name: 'A refreshed', email: 'a@example.com' };
        view.rerender(
            <ProviderTree>
                <Listener />
            </ProviderTree>
        );

        act(() => {
            fireState('unavailable', 'connected');
        });

        await waitFor(() => {
            expect(onReconnect).toHaveBeenCalledTimes(1);
        });
    });

    it('disconnects Echo when the authenticated user id changes', async () => {
        const view = render(<ProviderTree>{null}</ProviderTree>);

        await waitFor(() => {
            expect(EchoConstructor).toHaveBeenCalledTimes(1);
        });

        establishConnection();

        authState.user = { id: 2, name: 'B', email: 'b@example.com' };
        view.rerender(<ProviderTree>{null}</ProviderTree>);

        await waitFor(() => {
            expect(echoInstance.disconnect).toHaveBeenCalled();
        });
    });

    it('disconnects Echo when the session ends', async () => {
        const view = render(<ProviderTree>{null}</ProviderTree>);

        await waitFor(() => {
            expect(EchoConstructor).toHaveBeenCalledTimes(1);
        });

        establishConnection();

        authState.user = null;
        authState.isAuthenticated = false;
        view.rerender(<ProviderTree>{null}</ProviderTree>);

        await waitFor(() => {
            expect(echoInstance.disconnect).toHaveBeenCalled();
        });
    });
});

describe('RealtimeProvider auth lifecycle hook defaults', () => {
    it('exposes safe defaults outside the provider', () => {
        const { result } = renderHook(() => useRealtime());

        expect(result.current.connectionStatus).toBe('idle');
        expect(result.current.onReconnect(() => undefined)).toEqual(
            expect.any(Function)
        );
    });
});
