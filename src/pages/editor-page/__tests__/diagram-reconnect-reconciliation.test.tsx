import React, { StrictMode, useEffect } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { clearEchoInstance } from '@/lib/realtime/echo';
import { remoteSyncDepthRef } from '@/lib/realtime/diagram-sync-state';
import { useDiagramChannelLifecycle } from '@/pages/editor-page/use-diagram-channel-lifecycle';
import { useDiagramReconnectRefresh } from '@/pages/editor-page/use-diagram-reconnect-refresh';

const HASH_B = 'b'.repeat(64);

const authState: {
    user: { id: number; name: string; email: string } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
} = {
    user: { id: 1, name: 'A', email: 'a@example.com' },
    isAuthenticated: true,
    isLoading: false,
};

const chartDbState: {
    currentDiagram: { id: string; name: string } | null;
} = {
    currentDiagram: { id: '77', name: 'SQL Import' },
};

const replaceDiagram = vi.fn();
const setDiagramAccess = vi.fn();
const getDiagram = vi.fn();

interface ConnectionLike {
    bind: ReturnType<typeof vi.fn>;
    unbind: ReturnType<typeof vi.fn>;
    state: string;
}

const connectionHandlers = new Map<
    string,
    Set<(payload?: { previous: string; current: string }) => void>
>();

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

const diagramPrivateJoins = (diagramId = '77'): number =>
    echoInstance.private.mock.calls.filter(
        (call) => call[0] === `diagram.${diagramId}`
    ).length;

vi.mock('pusher-js', () => ({
    default: vi.fn(),
}));

vi.mock('laravel-echo', () => ({
    default: vi.fn(() => echoInstance),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
        replaceDiagram,
        loadDiagramFromData: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: null,
        setDiagramAccess,
        clearDiagramAccess: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openOpenDiagramDialog: vi.fn(),
    }),
}));

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({
        showAlert: vi.fn(),
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    getDiagram: (...args: unknown[]) => getDiagram(...args),
}));

import { RealtimeProvider } from '@/context/realtime-context/realtime-provider';

const authoritativeDiagram = (
    diagramId: string,
    tableName: string,
    fieldName: string
) => ({
    id: Number(diagramId),
    name: 'Orders',
    content_hash: HASH_B,
    access: {
        role: 'editor' as const,
        can_edit: true,
        can_manage_members: false,
    },
    content: {
        id: diagramId,
        name: 'Orders',
        databaseType: 'generic',
        tables: [
            {
                id: 'table-1',
                name: tableName,
                fields: [{ id: 'field-1', name: fieldName }],
            },
        ],
    },
});

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
        unbind: vi.fn(
            (
                event: string,
                handler?: (payload?: {
                    previous: string;
                    current: string;
                }) => void
            ) => {
                const handlers = connectionHandlers.get(event);
                if (handlers === undefined || handler === undefined) {
                    return;
                }

                handlers.delete(handler);
            }
        ),
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

const LocationFollower = ({
    location,
}: {
    location: DiagramLocation;
}): null => {
    const { setDiagramLocation } = useDiagramLocation();

    useEffect(() => {
        setDiagramLocation(location);
    }, [location, setDiagramLocation]);

    return null;
};

const Harness = (): null => {
    useDiagramChannelLifecycle();
    useDiagramReconnectRefresh();
    return null;
};

const renderEditor = (
    location: DiagramLocation,
    options?: { strict?: boolean }
) => {
    const tree = (
        <RealtimeProvider>
            <DiagramLocationProvider initialLocation={location}>
                <LocationFollower location={location} />
                <Harness />
            </DiagramLocationProvider>
        </RealtimeProvider>
    );

    return render(
        options?.strict === true ? <StrictMode>{tree}</StrictMode> : tree
    );
};

const establish = (): void => {
    act(() => {
        fireState('initialized', 'connecting');
        fireState('connecting', 'connected');
    });
};

const dropTransport = (): void => {
    act(() => {
        fireState('connected', 'connecting');
        fireState('connecting', 'unavailable');
    });
};

const recoverTransport = (): void => {
    act(() => {
        fireState('unavailable', 'connected');
    });
};

describe('diagram reconnect reconciliation', () => {
    beforeEach(() => {
        clearEchoInstance();
        resetEchoHarness();
        authState.user = { id: 1, name: 'A', email: 'a@example.com' };
        authState.isAuthenticated = true;
        authState.isLoading = false;
        chartDbState.currentDiagram = { id: '77', name: 'SQL Import' };
        replaceDiagram.mockReset();
        replaceDiagram.mockResolvedValue(undefined);
        setDiagramAccess.mockReset();
        getDiagram.mockReset();
        getDiagram.mockImplementation(async (id: string) =>
            authoritativeDiagram(id, 'renamed_by_b', 'renamed_field')
        );
        remoteSyncDepthRef.current = 0;
    });

    afterEach(() => {
        clearEchoInstance();
        remoteSyncDepthRef.current = 0;
    });

    it('does not refresh on the initial connected transition', async () => {
        renderEditor(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBe(1);
        });

        expect(getDiagram).not.toHaveBeenCalled();
        expect(replaceDiagram).not.toHaveBeenCalled();
    });

    it('rejoins the diagram channel before fetching after unavailable to connected', async () => {
        renderEditor(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBe(1);
        });

        dropTransport();

        const joinsBeforeRecovery = diagramPrivateJoins();
        let joinsAtFetch = joinsBeforeRecovery;
        getDiagram.mockImplementation(async (id: string) => {
            joinsAtFetch = diagramPrivateJoins();
            return authoritativeDiagram(id, 'renamed_by_b', 'renamed_field');
        });

        recoverTransport();

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(1);
        });

        expect(getDiagram).toHaveBeenCalledWith('77');
        expect(joinsAtFetch).toBeGreaterThan(joinsBeforeRecovery);
        expect(replaceDiagram).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '77',
                tables: [
                    expect.objectContaining({
                        name: 'renamed_by_b',
                        fields: [
                            expect.objectContaining({ name: 'renamed_field' }),
                        ],
                    }),
                ],
            }),
            expect.objectContaining({
                authoritative: true,
                updateHistory: false,
                resetHistory: true,
                authoritativeContentHash: HASH_B,
            })
        );
        expect(setDiagramAccess).toHaveBeenCalledWith({
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        });
    });

    it('refreshes on connecting to connected after an established session', async () => {
        renderEditor(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBe(1);
        });

        act(() => {
            fireState('connected', 'connecting');
        });
        act(() => {
            fireState('connecting', 'connected');
        });

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(1);
        });
        expect(replaceDiagram).toHaveBeenCalledTimes(1);
    });

    it('still refreshes when session revalidation replaces the user object during the outage', async () => {
        const view = renderEditor(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBe(1);
        });

        dropTransport();

        authState.user = { id: 1, name: 'A', email: 'a@example.com' };
        view.rerender(
            <RealtimeProvider>
                <DiagramLocationProvider
                    initialLocation={onlineDiagramLocation('77')}
                >
                    <LocationFollower location={onlineDiagramLocation('77')} />
                    <Harness />
                </DiagramLocationProvider>
            </RealtimeProvider>
        );

        expect(echoInstance.disconnect).not.toHaveBeenCalled();

        recoverTransport();

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(1);
        });
        expect(getDiagram).toHaveBeenCalledWith('77');
        expect(replaceDiagram).toHaveBeenCalledWith(
            expect.objectContaining({
                tables: [expect.objectContaining({ name: 'renamed_by_b' })],
            }),
            expect.objectContaining({ authoritative: true })
        );
    });

    it('fetches the online id that is current at reconnect, not a previous one', async () => {
        const view = renderEditor(onlineDiagramLocation('77'));
        establish();
        dropTransport();

        chartDbState.currentDiagram = { id: '88', name: 'Next' };
        view.rerender(
            <RealtimeProvider>
                <DiagramLocationProvider
                    initialLocation={onlineDiagramLocation('77')}
                >
                    <LocationFollower location={onlineDiagramLocation('88')} />
                    <Harness />
                </DiagramLocationProvider>
            </RealtimeProvider>
        );

        await act(async () => {
            await Promise.resolve();
        });

        recoverTransport();

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(1);
        });
        expect(getDiagram).toHaveBeenCalledWith('88');
        expect(getDiagram).not.toHaveBeenCalledWith('77');
    });

    it('does not fetch a device diagram when the transport reconnects', async () => {
        chartDbState.currentDiagram = { id: '77', name: 'On this device' };
        renderEditor(deviceDiagramLocation('77'));
        establish();
        dropTransport();
        recoverTransport();

        await act(async () => {
            await Promise.resolve();
        });

        expect(diagramPrivateJoins()).toBe(0);
        expect(getDiagram).not.toHaveBeenCalled();
        expect(replaceDiagram).not.toHaveBeenCalled();
    });

    it('does not fetch when a numeric device id is open', async () => {
        chartDbState.currentDiagram = { id: '42', name: 'Shadow' };
        renderEditor(deviceDiagramLocation('42'));
        establish();
        dropTransport();
        recoverTransport();

        await act(async () => {
            await Promise.resolve();
        });

        expect(diagramPrivateJoins('42')).toBe(0);
        expect(getDiagram).not.toHaveBeenCalled();
    });

    it('refreshes once per reconnect episode and ignores a repeated connected event', async () => {
        renderEditor(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBe(1);
        });

        dropTransport();
        recoverTransport();
        act(() => {
            fireState('connected', 'connected');
        });

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(1);
        });

        dropTransport();
        recoverTransport();

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(2);
        });
        expect(replaceDiagram).toHaveBeenCalledTimes(2);
    });

    it('registers one listener under Strict Mode and fetches once', async () => {
        renderEditor(onlineDiagramLocation('77'), { strict: true });
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBeGreaterThan(0);
        });

        expect(connectionHandlers.get('state_change')?.size).toBe(1);

        dropTransport();
        recoverTransport();

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(1);
        });
        expect(replaceDiagram).toHaveBeenCalledTimes(1);
    });

    it('does not refresh after logout', async () => {
        const view = renderEditor(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBe(1);
        });

        authState.user = null;
        authState.isAuthenticated = false;
        view.rerender(
            <RealtimeProvider>
                <DiagramLocationProvider
                    initialLocation={onlineDiagramLocation('77')}
                >
                    <LocationFollower location={onlineDiagramLocation('77')} />
                    <Harness />
                </DiagramLocationProvider>
            </RealtimeProvider>
        );

        dropTransport();
        recoverTransport();

        await act(async () => {
            await Promise.resolve();
        });

        expect(getDiagram).not.toHaveBeenCalled();
    });

    it('does not refresh after session expiry', async () => {
        const view = renderEditor(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBe(1);
        });

        authState.user = null;
        authState.isAuthenticated = false;
        view.rerender(
            <RealtimeProvider>
                <DiagramLocationProvider
                    initialLocation={onlineDiagramLocation('77')}
                >
                    <LocationFollower location={onlineDiagramLocation('77')} />
                    <Harness />
                </DiagramLocationProvider>
            </RealtimeProvider>
        );

        recoverTransport();

        await act(async () => {
            await Promise.resolve();
        });

        expect(getDiagram).not.toHaveBeenCalled();
        expect(replaceDiagram).not.toHaveBeenCalled();
    });

    it('does not treat the connected event after an intentional disconnect as a reconnect', async () => {
        const view = renderEditor(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(diagramPrivateJoins()).toBe(1);
        });

        authState.user = null;
        authState.isAuthenticated = false;
        view.rerender(
            <RealtimeProvider>
                <DiagramLocationProvider
                    initialLocation={onlineDiagramLocation('77')}
                >
                    <LocationFollower location={onlineDiagramLocation('77')} />
                    <Harness />
                </DiagramLocationProvider>
            </RealtimeProvider>
        );

        authState.user = { id: 1, name: 'A', email: 'a@example.com' };
        authState.isAuthenticated = true;
        view.rerender(
            <RealtimeProvider>
                <DiagramLocationProvider
                    initialLocation={onlineDiagramLocation('77')}
                >
                    <LocationFollower location={onlineDiagramLocation('77')} />
                    <Harness />
                </DiagramLocationProvider>
            </RealtimeProvider>
        );

        act(() => {
            fireState('connecting', 'connected');
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(getDiagram).not.toHaveBeenCalled();
    });
});
