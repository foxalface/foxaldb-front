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
import { DIAGRAM_CONVERSATION_READ_UPDATED_EVENT } from '@/lib/realtime/conversation-events';
import { useDiagramAccessListener } from '@/pages/editor-page/use-diagram-access-listener';
import { useDiagramChannelLifecycle } from '@/pages/editor-page/use-diagram-channel-lifecycle';
import { useDiagramRealtime } from '@/pages/editor-page/use-diagram-realtime';
import { useDiagramReconnectRefresh } from '@/pages/editor-page/use-diagram-reconnect-refresh';

const HASH_B = 'b'.repeat(64);

const toastMock = vi.hoisted(() => vi.fn());

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
    currentDiagram: { id: '77', name: 'Orders' },
};

const updateDiagramName = vi.fn().mockResolvedValue(undefined);
const replaceDiagram = vi.fn().mockResolvedValue(undefined);
const loadDiagramFromData = vi.fn();
const setDiagramAccess = vi.fn();
const clearDiagramAccess = vi.fn();
const showAlert = vi.fn();
const navigate = vi.fn();
const openOpenDiagramDialog = vi.fn();
const getDiagram = vi.fn();

const resolvedMutator = vi.fn().mockResolvedValue(undefined);

interface ConnectionLike {
    bind: ReturnType<typeof vi.fn>;
    unbind: ReturnType<typeof vi.fn>;
    state: string;
}

type ChannelListener = (payload: unknown) => void;

class FakeChannel {
    private readonly listeners = new Map<string, Set<ChannelListener>>();

    listen = (event: string, callback: ChannelListener): this => {
        const listeners = this.listeners.get(event) ?? new Set();
        listeners.add(callback);
        this.listeners.set(event, listeners);
        return this;
    };

    stopListening = (event: string, callback?: ChannelListener): this => {
        if (callback === undefined) {
            this.listeners.delete(event);
            return this;
        }

        this.listeners.get(event)?.delete(callback);
        return this;
    };

    emit(event: string, payload: unknown): void {
        const listeners = this.listeners.get(event);
        if (listeners === undefined) {
            return;
        }

        for (const listener of [...listeners]) {
            listener(payload);
        }
    }

    listenerCount(event: string): number {
        return this.listeners.get(event)?.size ?? 0;
    }
}

const channels = new Map<string, FakeChannel>();

const channelKey = (name: string): string =>
    name.startsWith('private-') || name.startsWith('presence-')
        ? name
        : `private-${name}`;

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

const privateCalls = (name: string): number =>
    echoInstance.private.mock.calls.filter((call) => call[0] === name).length;

const leaveCalls = (): string[] =>
    echoInstance.leaveChannel.mock.calls.map((call) => String(call[0]));

const operationListeners = (diagramId: string): number =>
    channels
        .get(`private-diagram.${diagramId}`)
        ?.listenerCount('.DiagramOperation') ?? 0;

const accessListeners = (): number =>
    channels.get('private-user.1')?.listenerCount('.DiagramAccessChanged') ?? 0;

const peerOperation = (name: string) => ({
    action: 'update_diagram_name',
    data: { name },
    userId: 2,
    clientId: 'peer-client',
    sentAt: '2026-10-30T00:00:00.000Z',
});

const emitOperation = (diagramId: string, name: string): void => {
    channels
        .get(`private-diagram.${diagramId}`)
        ?.emit('.DiagramOperation', peerOperation(name));
};

const emitOn = (
    channel: FakeChannel | undefined,
    event: string,
    payload: unknown
): void => {
    channel?.emit(event, payload);
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

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
        tables: [],
        relationships: [],
        dependencies: [],
        notes: [],
        areas: [],
        updateDiagramName,
        addTables: resolvedMutator,
        updateTable: resolvedMutator,
        removeTables: resolvedMutator,
        addField: resolvedMutator,
        removeField: resolvedMutator,
        updateField: resolvedMutator,
        addRelationships: resolvedMutator,
        removeRelationships: resolvedMutator,
        updateRelationship: resolvedMutator,
        addDependencies: resolvedMutator,
        removeDependencies: resolvedMutator,
        updateDependency: resolvedMutator,
        addNotes: resolvedMutator,
        removeNotes: resolvedMutator,
        updateNote: resolvedMutator,
        addAreas: resolvedMutator,
        removeAreas: resolvedMutator,
        updateArea: resolvedMutator,
        replaceDiagram,
        loadDiagramFromData,
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: {
            role: 'viewer' as const,
            can_edit: false,
            can_manage_members: false,
        },
        setDiagramAccess,
        clearDiagramAccess,
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openOpenDiagramDialog,
    }),
}));

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({
        showAlert,
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/components/toast/use-toast', () => ({
    toast: toastMock,
}));

vi.mock('@/lib/api/diagrams', () => ({
    getDiagram: (...args: unknown[]) => getDiagram(...args),
}));

import { RealtimeProvider } from '@/context/realtime-context/realtime-provider';

const authoritativeDiagram = (diagramId: string) => ({
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
        tables: [],
    },
});

const resetEchoHarness = (): void => {
    channels.clear();
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
        private: vi.fn((name: string) => {
            const key = channelKey(name);
            const existing = channels.get(key);
            if (existing !== undefined) {
                return existing;
            }

            const created = new FakeChannel();
            channels.set(key, created);
            return created;
        }),
        join: vi.fn(() => ({
            here: vi.fn().mockReturnThis(),
            joining: vi.fn().mockReturnThis(),
            leaving: vi.fn().mockReturnThis(),
            error: vi.fn().mockReturnThis(),
            whisper: vi.fn(),
            listenForWhisper: vi.fn().mockReturnThis(),
            stopListeningForWhisper: vi.fn().mockReturnThis(),
        })),
        leaveChannel: vi.fn((name: string) => {
            channels.delete(channelKey(name));
        }),
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
    useDiagramAccessListener();
    useDiagramChannelLifecycle();
    useDiagramRealtime();
    useDiagramReconnectRefresh();
    return null;
};

const renderSession = (
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

const roleChanged = (diagramId: number) => ({
    diagramId,
    reason: 'role_changed',
    access: {
        role: 'editor',
        can_edit: true,
        can_manage_members: false,
    },
    changedByUserId: 9,
    sentAt: '2026-10-30T00:00:00.000Z',
});

describe('diagram channel ownership', () => {
    beforeEach(() => {
        clearEchoInstance();
        resetEchoHarness();
        authState.user = { id: 1, name: 'A', email: 'a@example.com' };
        authState.isAuthenticated = true;
        authState.isLoading = false;
        chartDbState.currentDiagram = { id: '77', name: 'Orders' };
        updateDiagramName.mockClear();
        replaceDiagram.mockClear();
        loadDiagramFromData.mockClear();
        setDiagramAccess.mockClear();
        clearDiagramAccess.mockClear();
        showAlert.mockClear();
        navigate.mockClear();
        openOpenDiagramDialog.mockClear();
        toastMock.mockClear();
        getDiagram.mockReset();
        getDiagram.mockImplementation(async (id: string) =>
            authoritativeDiagram(id)
        );
        vi.spyOn(console, 'info').mockImplementation(() => undefined);
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('applies a live operation, reconciles once, then applies the next live operation', async () => {
        renderSession(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(operationListeners('77')).toBe(1);
            expect(privateCalls('diagram.77')).toBe(1);
        });

        expect(getDiagram).not.toHaveBeenCalled();

        act(() => {
            emitOperation('77', 'live-before');
        });

        await waitFor(() => {
            expect(updateDiagramName).toHaveBeenCalledWith('live-before', {
                updateHistory: false,
            });
        });

        dropTransport();
        const channelBeforeReconnect = channels.get('private-diagram.77');
        let listenersWhenFetching = 0;
        getDiagram.mockImplementation(async (id: string) => {
            listenersWhenFetching = operationListeners(id);
            return authoritativeDiagram(id);
        });

        recoverTransport();

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(1);
        });

        expect(getDiagram).toHaveBeenCalledWith('77');
        expect(listenersWhenFetching).toBe(1);
        expect(replaceDiagram).toHaveBeenCalledWith(
            expect.objectContaining({ id: '77' }),
            expect.objectContaining({
                authoritative: true,
                resetHistory: true,
            })
        );
        expect(operationListeners('77')).toBe(1);
        expect(channelBeforeReconnect).not.toBe(
            channels.get('private-diagram.77')
        );

        act(() => {
            emitOn(
                channelBeforeReconnect,
                '.DiagramOperation',
                peerOperation('stale-channel')
            );
            emitOperation('77', 'live-after');
        });

        await waitFor(() => {
            expect(updateDiagramName).toHaveBeenCalledWith('live-after', {
                updateHistory: false,
            });
        });

        expect(updateDiagramName).not.toHaveBeenCalledWith('stale-channel', {
            updateHistory: false,
        });
        expect(getDiagram).toHaveBeenCalledTimes(1);
        expect(updateDiagramName).toHaveBeenCalledTimes(2);
    });

    it('keeps a single operation and access listener under Strict Mode', async () => {
        renderSession(onlineDiagramLocation('77'), { strict: true });
        establish();

        await waitFor(() => {
            expect(operationListeners('77')).toBe(1);
            expect(accessListeners()).toBe(1);
        });

        act(() => {
            emitOperation('77', 'strict-once');
            emitOn(
                channels.get('private-user.1'),
                '.DiagramAccessChanged',
                roleChanged(77)
            );
        });

        await waitFor(() => {
            expect(updateDiagramName).toHaveBeenCalledTimes(1);
        });

        expect(setDiagramAccess).toHaveBeenCalledTimes(1);
    });

    it('rebinds access events after reconnect and still handles member removal once', async () => {
        renderSession(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(accessListeners()).toBe(1);
        });

        dropTransport();
        const userChannelBefore = channels.get('private-user.1');
        recoverTransport();

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledTimes(1);
        });

        expect(channels.get('private-user.1')).not.toBe(userChannelBefore);
        expect(accessListeners()).toBe(1);

        const accessCalls = setDiagramAccess.mock.calls.length;

        act(() => {
            emitOn(
                channels.get('private-user.1'),
                '.DiagramAccessChanged',
                roleChanged(77)
            );
        });

        await waitFor(() => {
            expect(setDiagramAccess).toHaveBeenCalledTimes(accessCalls + 1);
        });

        act(() => {
            emitOn(channels.get('private-user.1'), '.DiagramAccessChanged', {
                diagramId: 77,
                reason: 'member_removed',
                access: null,
                changedByUserId: 9,
                sentAt: '2026-10-30T00:00:00.000Z',
            });
        });

        expect(showAlert).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith('/');
        expect(clearDiagramAccess).toHaveBeenCalledTimes(1);
        expect(loadDiagramFromData).toHaveBeenCalledTimes(1);
    });

    it('keeps the user channel alive across an online diagram switch', async () => {
        const view = renderSession(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(operationListeners('77')).toBe(1);
            expect(accessListeners()).toBe(1);
        });

        const userChannel = channels.get('private-user.1');
        const readEvents: unknown[] = [];
        userChannel?.listen(
            DIAGRAM_CONVERSATION_READ_UPDATED_EVENT,
            (payload) => {
                readEvents.push(payload);
            }
        );
        const diagramA = channels.get('private-diagram.77');
        const leavesBeforeSwitch = leaveCalls().length;

        chartDbState.currentDiagram = { id: '88', name: 'Other' };
        view.rerender(
            <RealtimeProvider>
                <DiagramLocationProvider
                    initialLocation={onlineDiagramLocation('88')}
                >
                    <LocationFollower location={onlineDiagramLocation('88')} />
                    <Harness />
                </DiagramLocationProvider>
            </RealtimeProvider>
        );

        await waitFor(() => {
            expect(operationListeners('88')).toBe(1);
        });

        expect(channels.get('private-user.1')).toBe(userChannel);
        expect(accessListeners()).toBe(1);
        expect(leaveCalls().slice(leavesBeforeSwitch)).not.toContain(
            'private-user.1'
        );
        expect(channels.has('private-diagram.77')).toBe(false);

        act(() => {
            emitOn(diagramA, '.DiagramOperation', peerOperation('from-a'));
            emitOperation('88', 'from-b');
            emitOn(userChannel, DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, {
                diagramId: 88,
            });
            emitOn(userChannel, '.DiagramAccessChanged', roleChanged(88));
        });

        await waitFor(() => {
            expect(updateDiagramName).toHaveBeenCalledWith('from-b', {
                updateHistory: false,
            });
        });

        expect(updateDiagramName).not.toHaveBeenCalledWith('from-a', {
            updateHistory: false,
        });
        expect(readEvents).toEqual([{ diagramId: 88 }]);
        expect(setDiagramAccess).toHaveBeenCalledWith({
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        });
        expect(operationListeners('88')).toBe(1);
    });

    it.each(['logout', 'session expiry'] as const)(
        'drops managed channels on %s so a late operation does not apply',
        async () => {
            const view = renderSession(onlineDiagramLocation('77'));
            establish();

            await waitFor(() => {
                expect(operationListeners('77')).toBe(1);
            });

            const diagramChannel = channels.get('private-diagram.77');
            const userChannel = channels.get('private-user.1');

            authState.user = null;
            authState.isAuthenticated = false;
            view.rerender(
                <RealtimeProvider>
                    <DiagramLocationProvider
                        initialLocation={onlineDiagramLocation('77')}
                    >
                        <LocationFollower
                            location={onlineDiagramLocation('77')}
                        />
                        <Harness />
                    </DiagramLocationProvider>
                </RealtimeProvider>
            );

            await waitFor(() => {
                expect(channels.has('private-diagram.77')).toBe(false);
                expect(channels.has('private-user.1')).toBe(false);
            });

            act(() => {
                emitOn(
                    diagramChannel,
                    '.DiagramOperation',
                    peerOperation('after-logout')
                );
                emitOn(userChannel, '.DiagramAccessChanged', roleChanged(77));
            });

            expect(updateDiagramName).not.toHaveBeenCalled();
            expect(setDiagramAccess).not.toHaveBeenCalled();
            expect(showAlert).not.toHaveBeenCalled();
        }
    );

    it('does not reset channel ownership when the same user is revalidated', async () => {
        const view = renderSession(onlineDiagramLocation('77'));
        establish();

        await waitFor(() => {
            expect(operationListeners('77')).toBe(1);
        });

        const disconnects = echoInstance.disconnect.mock.calls.length;
        const diagramJoins = privateCalls('diagram.77');
        const userJoins = privateCalls('user.1');

        authState.user = { id: 1, name: 'A refreshed', email: 'a@example.com' };
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

        expect(echoInstance.disconnect).toHaveBeenCalledTimes(disconnects);
        expect(privateCalls('diagram.77')).toBe(diagramJoins);
        expect(privateCalls('user.1')).toBe(userJoins);

        act(() => {
            emitOperation('77', 'after-revalidation');
        });

        await waitFor(() => {
            expect(updateDiagramName).toHaveBeenCalledWith(
                'after-revalidation',
                { updateHistory: false }
            );
        });
    });

    it.each([
        ['device', deviceDiagramLocation('local-1'), 'local-1'],
        ['numeric device', deviceDiagramLocation('42'), '42'],
    ] as const)(
        'does not bind a diagram channel for a %s diagram',
        async (_label, location, diagramId) => {
            chartDbState.currentDiagram = { id: diagramId, name: 'Local' };
            renderSession(location);
            establish();

            await waitFor(() => {
                expect(privateCalls('user.1')).toBe(1);
            });

            expect(privateCalls(`diagram.${diagramId}`)).toBe(0);
            expect(operationListeners(diagramId)).toBe(0);
            expect(getDiagram).not.toHaveBeenCalled();

            dropTransport();
            recoverTransport();

            await waitFor(() => {
                expect(privateCalls('user.1')).toBe(2);
            });

            expect(privateCalls(`diagram.${diagramId}`)).toBe(0);
            expect(operationListeners(diagramId)).toBe(0);
            expect(getDiagram).not.toHaveBeenCalled();
        }
    );
});
