import React, { useEffect, useReducer, useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    MemoryRouter,
    Outlet,
    Route,
    Routes,
    useLocation,
} from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context/auth-provider';
import { AuthIntentProvider } from '@/context/auth-intent-context/auth-intent-provider';
import { DiagramAccessProvider } from '@/context/diagram-access-context/diagram-access-provider';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { useAuth } from '@/hooks/use-auth';
import { useAuthIntent } from '@/hooks/use-auth-intent';
import { useAuthIntentContinuation } from '@/hooks/use-auth-intent-continuation';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import { useEntryFlowGuestResolution } from '@/hooks/use-entry-flow-guest-resolution';
import { useSessionEndOrchestrator } from '@/hooks/use-session-end-orchestrator';
import { useDiagramChannelLifecycle } from '@/pages/editor-page/use-diagram-channel-lifecycle';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { entryFlowReducer } from '@/lib/entry-flow/entry-flow-reducer';
import type { EntryFlowEvent } from '@/lib/entry-flow/entry-flow-types';
import { notifySessionExpired } from '@/lib/api/session-expired';
import {
    clearProtectedActionResume,
    registerProtectedActionResume,
    takeProtectedActionResume,
} from '@/lib/auth-intent/protected-action-resume';
import * as autosave from '@/lib/diagram-autosave/diagram-autosave-controller';

const user = {
    id: 1,
    first_name: 'Ada',
    last_name: 'Lovelace',
    full_name: 'Ada Lovelace',
    email: 'ada@example.com',
};

const chartState = vi.hoisted(() => ({
    currentDiagram: null as Diagram | null,
}));

const memoryLoads = vi.hoisted(() => [] as Diagram[]);
const loadedIds = vi.hoisted(() => [] as string[]);
const openOnlineIds = vi.hoisted(() => [] as string[]);

const storage = vi.hoisted(() => ({
    listDiagrams: vi.fn(),
    getDiagram: vi.fn(),
    addDiagram: vi.fn(),
    updateDiagram: vi.fn(),
    deleteDiagram: vi.fn(),
}));

const dialog = vi.hoisted(() => ({
    openAuthDialog: vi.fn(),
    openOpenDiagramDialog: vi.fn(),
    closeAuthDialog: vi.fn(),
}));

const realtime = vi.hoisted(() => ({
    joinDiagram: vi.fn(),
    leaveDiagram: vi.fn(),
}));

const diagramsApi = vi.hoisted(() => ({
    createDiagram: vi.fn(),
    updateDiagram: vi.fn(),
    getDiagram: vi.fn(),
    getDiagrams: vi.fn(),
}));

const putOnline = vi.hoisted(() => ({
    copy: vi.fn(),
    move: vi.fn(),
}));

const authApi = vi.hoisted(() => ({
    initCsrf: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    fetchSessionUser: vi.fn(),
    fetchCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => authApi);

vi.mock('@/lib/api/diagrams', () => diagramsApi);

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => storage,
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        config: { defaultDiagramId: '' },
        updateConfig: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => dialog,
}));

vi.mock('@/hooks/use-full-screen-spinner', () => ({
    useFullScreenLoader: () => ({
        showLoader: vi.fn(),
        hideLoader: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => ({
        joinDiagram: realtime.joinDiagram,
        leaveDiagram: realtime.leaveDiagram,
        connectionStatus: 'connected',
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        get currentDiagram() {
            return chartState.currentDiagram;
        },
        readonly: false,
        loadDiagramFromData: (diagram: Diagram) => {
            memoryLoads.push(diagram);
            chartState.currentDiagram = diagram;
        },
        loadDiagram: async (id: string) => {
            loadedIds.push(id);
            const diagram: Diagram = {
                id,
                name: 'On this device',
                databaseType: DatabaseType.GENERIC,
                tables: [],
                createdAt: new Date(0),
                updatedAt: new Date(0),
            };
            chartState.currentDiagram = diagram;
            return diagram;
        },
        deleteDiagram: vi.fn(),
    }),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/diagram/put-local-diagram-online', () => ({
    putLocalDiagramOnlineCopy: (...args: unknown[]) => putOnline.copy(...args),
    putLocalDiagramOnlineMove: (...args: unknown[]) => putOnline.move(...args),
}));

const diagram = (id: string, name: string): Diagram => ({
    id,
    name,
    databaseType: DatabaseType.GENERIC,
    tables: [],
    createdAt: new Date(0),
    updatedAt: new Date(0),
});

type Mode = 'online' | 'device';

const Harness = ({ mode }: { mode: Mode }): React.ReactElement => {
    const {
        user: authUser,
        isAuthenticated,
        isLoading,
        logout,
        login,
    } = useAuth();
    const { location } = useDiagramLocation();
    const { diagramAccess, setDiagramAccess } = useDiagramAccess();
    const { pendingIntent, setAuthIntent } = useAuthIntent();
    const route = useLocation();
    const [entryState, dispatch] = useReducer(entryFlowReducer, {
        kind: 'ready',
    });
    const [edits, setEdits] = useState(0);
    const [locationTrace, setLocationTrace] = useState<string[]>([]);
    const generation = useRef(0);

    useEffect(() => {
        if (mode !== 'online') {
            return;
        }

        setDiagramAccess({
            role: 'owner',
            can_edit: true,
            can_manage_members: true,
        });
    }, [mode, setDiagramAccess]);

    useEffect(() => {
        const label =
            location === null
                ? 'none'
                : location.type === 'device'
                  ? `device:${location.localId}`
                  : `online:${location.diagramId}`;
        setLocationTrace((current) => [...current, label]);
    }, [location]);

    useSessionEndOrchestrator({
        onDeviceSessionEnded: () => {
            dispatch({ type: 'DEVICE_SESSION_ENDED' });
        },
        onOnlineSessionEnded: () => {
            dispatch({ type: 'ONLINE_SESSION_ENDED' });
        },
        onUnscopedSessionEnded: () => {
            dispatch({ type: 'UNSCOPED_SESSION_ENDED' });
        },
    });

    useDiagramChannelLifecycle();

    useEntryFlowGuestResolution({
        state: entryState,
        isAuthenticated,
        isAuthLoading: isLoading,
        beginResolution: () => {
            generation.current += 1;
            return generation.current;
        },
        isResolutionCurrent: (token) => token === generation.current,
        dispatchEvent: (event: EntryFlowEvent) => {
            dispatch(event);
        },
    });

    useAuthIntentContinuation({
        stateKind: entryState.kind,
        showOnlineList: vi.fn(),
        openOnlineDiagram: (diagramId) => {
            openOnlineIds.push(diagramId);
        },
        openDeviceDiagram: vi.fn(),
    });

    return (
        <>
            <Outlet />
            <div data-testid="user">
                {isLoading ? 'loading' : (authUser?.id ?? 'guest')}
            </div>
            <div data-testid="path">{route.pathname}</div>
            <div data-testid="location">
                {location === null ? 'none' : location.type}
            </div>
            <div data-testid="location-id">
                {location === null
                    ? ''
                    : location.type === 'device'
                      ? location.localId
                      : location.diagramId}
            </div>
            <div data-testid="diagram">
                {chartState.currentDiagram?.id ?? ''}
            </div>
            <div data-testid="entry">{entryState.kind}</div>
            <div data-testid="intent">{JSON.stringify(pendingIntent)}</div>
            <div data-testid="access">
                {diagramAccess === null ? 'none' : 'set'}
            </div>
            <div data-testid="readonly">no</div>
            <div data-testid="edits">{edits}</div>
            <div data-testid="trace">{locationTrace.join('|')}</div>
            <button type="button" onClick={() => void logout()}>
                Log out
            </button>
            <button type="button" onClick={() => notifySessionExpired()}>
                Expire session
            </button>
            <button
                type="button"
                onClick={() => void login('ada@example.com', 'secret')}
            >
                Log in
            </button>
            <button
                type="button"
                onClick={() =>
                    setAuthIntent({ type: 'protected-action', action: 'share' })
                }
            >
                Remember share
            </button>
            <button
                type="button"
                onClick={() => setEdits((count) => count + 1)}
            >
                Edit locally
            </button>
        </>
    );
};

const renderSession = (mode: Mode): void => {
    const initialLocation: DiagramLocation =
        mode === 'online'
            ? onlineDiagramLocation('42')
            : deviceDiagramLocation('local-1');
    chartState.currentDiagram = diagram(
        mode === 'online' ? '42' : 'local-1',
        mode === 'online' ? 'Online' : 'On this device'
    );

    render(
        <AuthProvider>
            <AuthIntentProvider>
                <MemoryRouter
                    initialEntries={[
                        mode === 'online'
                            ? '/diagrams/42'
                            : '/diagrams/local-1',
                    ]}
                >
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <DiagramLocationProvider
                                    initialLocation={initialLocation}
                                >
                                    <DiagramAccessProvider>
                                        <Harness mode={mode} />
                                    </DiagramAccessProvider>
                                </DiagramLocationProvider>
                            }
                        >
                            <Route index element={null} />
                            <Route path="diagrams/:diagramId" element={null} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </AuthIntentProvider>
        </AuthProvider>
    );
};

const waitUntilAuthenticated = async (): Promise<void> => {
    await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('1');
    });
};

describe('session-end orchestrator', () => {
    beforeEach(() => {
        memoryLoads.length = 0;
        loadedIds.length = 0;
        openOnlineIds.length = 0;
        storage.listDiagrams.mockReset();
        storage.listDiagrams.mockResolvedValue([{ id: 'local-1' }]);
        storage.getDiagram.mockReset();
        storage.addDiagram.mockReset();
        storage.updateDiagram.mockReset();
        storage.deleteDiagram.mockReset();
        dialog.openAuthDialog.mockReset();
        dialog.openOpenDiagramDialog.mockReset();
        realtime.joinDiagram.mockReset();
        realtime.leaveDiagram.mockReset();
        diagramsApi.createDiagram.mockReset();
        diagramsApi.updateDiagram.mockReset();
        putOnline.copy.mockReset();
        putOnline.move.mockReset();
        authApi.initCsrf.mockReset();
        authApi.initCsrf.mockResolvedValue(undefined);
        authApi.fetchSessionUser.mockReset();
        authApi.fetchSessionUser.mockResolvedValue(user);
        authApi.logout.mockReset();
        authApi.logout.mockResolvedValue(undefined);
        authApi.login.mockReset();
        authApi.login.mockResolvedValue(user);
        clearProtectedActionResume();
        vi.spyOn(autosave, 'abandonDiagramAutosave');
    });

    afterEach(() => {
        clearProtectedActionResume();
        vi.mocked(autosave.abandonDiagramAutosave).mockRestore();
    });

    it('keeps the device diagram editable and does not force auth on logout', async () => {
        renderSession('device');
        await waitUntilAuthenticated();

        fireEvent.click(screen.getByRole('button', { name: 'Remember share' }));
        registerProtectedActionResume(() => undefined);
        fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('guest');
        });

        expect(screen.getByTestId('path').textContent).toBe(
            '/diagrams/local-1'
        );
        expect(screen.getByTestId('location')).toHaveTextContent('device');
        expect(screen.getByTestId('location-id')).toHaveTextContent('local-1');
        expect(screen.getByTestId('diagram')).toHaveTextContent('local-1');
        expect(screen.getByTestId('entry')).toHaveTextContent('ready');
        expect(screen.getByTestId('intent')).toHaveTextContent(
            '{"type":"none"}'
        );
        expect(screen.getByTestId('readonly')).toHaveTextContent('no');
        expect(dialog.openAuthDialog).not.toHaveBeenCalled();
        expect(dialog.openOpenDiagramDialog).not.toHaveBeenCalled();
        expect(memoryLoads).toEqual([]);
        expect(loadedIds).toEqual([]);
        expect(storage.listDiagrams).not.toHaveBeenCalled();
        expect(storage.addDiagram).not.toHaveBeenCalled();
        expect(storage.updateDiagram).not.toHaveBeenCalled();
        expect(storage.deleteDiagram).not.toHaveBeenCalled();
        expect(diagramsApi.createDiagram).not.toHaveBeenCalled();
        expect(diagramsApi.updateDiagram).not.toHaveBeenCalled();
        expect(putOnline.copy).not.toHaveBeenCalled();
        expect(putOnline.move).not.toHaveBeenCalled();
        expect(realtime.joinDiagram).not.toHaveBeenCalled();
        expect(takeProtectedActionResume()).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Edit locally' }));
        expect(screen.getByTestId('edits')).toHaveTextContent('1');
        expect(screen.getByTestId('diagram')).toHaveTextContent('local-1');
    });

    it('keeps the device diagram in place when the session expires', async () => {
        renderSession('device');
        await waitUntilAuthenticated();

        fireEvent.click(screen.getByRole('button', { name: 'Expire session' }));

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('guest');
        });

        expect(screen.getByTestId('path').textContent).toBe(
            '/diagrams/local-1'
        );
        expect(screen.getByTestId('location')).toHaveTextContent('device');
        expect(screen.getByTestId('diagram')).toHaveTextContent('local-1');
        expect(screen.getByTestId('entry')).toHaveTextContent('ready');
        expect(dialog.openAuthDialog).not.toHaveBeenCalled();
        expect(dialog.openOpenDiagramDialog).not.toHaveBeenCalled();
        expect(memoryLoads).toEqual([]);
        expect(storage.addDiagram).not.toHaveBeenCalled();
        expect(storage.deleteDiagram).not.toHaveBeenCalled();
        expect(diagramsApi.createDiagram).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Edit locally' }));
        expect(screen.getByTestId('edits')).toHaveTextContent('1');
    });

    it('leaves an online diagram on explicit logout and resumes that id after a later login', async () => {
        renderSession('online');
        await waitUntilAuthenticated();

        fireEvent.click(screen.getByRole('button', { name: 'Remember share' }));
        registerProtectedActionResume(() => undefined);
        fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('guest');
            expect(screen.getByTestId('path').textContent).toBe('/');
        });

        await waitFor(() => {
            expect(screen.getByTestId('entry')).toHaveTextContent('ready');
            expect(screen.getByTestId('location-id')).toHaveTextContent(
                'local-1'
            );
        });

        expect(screen.getByTestId('user')).toHaveTextContent('guest');
        expect(screen.getByTestId('path').textContent).toBe('/');
        expect(screen.getByTestId('trace').textContent).toContain('none');
        expect(screen.getByTestId('location')).toHaveTextContent('device');
        expect(screen.getByTestId('location-id')).toHaveTextContent('local-1');
        expect(screen.getByTestId('access')).toHaveTextContent('none');
        expect(screen.getByTestId('intent')).toHaveTextContent(
            '{"type":"open-online-diagram","diagramId":"42"}'
        );
        expect(memoryLoads.some((loaded) => loaded.id === '')).toBe(true);
        expect(memoryLoads.some((loaded) => loaded.id === '42')).toBe(false);
        expect(loadedIds).toEqual(['local-1']);
        expect(dialog.openAuthDialog).not.toHaveBeenCalled();
        expect(dialog.openOpenDiagramDialog).not.toHaveBeenCalled();
        expect(storage.addDiagram).not.toHaveBeenCalled();
        expect(storage.updateDiagram).not.toHaveBeenCalled();
        expect(storage.deleteDiagram).not.toHaveBeenCalled();
        expect(diagramsApi.createDiagram).not.toHaveBeenCalled();
        expect(diagramsApi.updateDiagram).not.toHaveBeenCalled();
        expect(putOnline.copy).not.toHaveBeenCalled();
        expect(putOnline.move).not.toHaveBeenCalled();
        expect(realtime.leaveDiagram).toHaveBeenCalled();
        expect(autosave.abandonDiagramAutosave).toHaveBeenCalled();
        expect(takeProtectedActionResume()).toBeNull();
        expect(openOnlineIds).toEqual([]);

        fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

        await waitFor(() => {
            expect(openOnlineIds).toEqual(['42']);
        });

        expect(dialog.openAuthDialog).not.toHaveBeenCalled();
        expect(openOnlineIds).toEqual(['42']);

        fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
        expect(openOnlineIds).toEqual(['42']);
    });

    it('clears an online diagram on 401, asks for auth, and resumes the same id once', async () => {
        renderSession('online');
        await waitUntilAuthenticated();

        fireEvent.click(screen.getByRole('button', { name: 'Expire session' }));

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('guest');
            expect(screen.getByTestId('path').textContent).toBe('/');
        });

        await waitFor(() => {
            expect(screen.getByTestId('entry')).toHaveTextContent('ready');
            expect(screen.getByTestId('location-id')).toHaveTextContent(
                'local-1'
            );
        });

        expect(screen.getByTestId('user')).toHaveTextContent('guest');
        expect(screen.getByTestId('path').textContent).toBe('/');
        expect(screen.getByTestId('trace').textContent).toContain('none');
        expect(screen.getByTestId('access')).toHaveTextContent('none');
        expect(screen.getByTestId('intent')).toHaveTextContent(
            '{"type":"open-online-diagram","diagramId":"42"}'
        );
        expect(memoryLoads.some((loaded) => loaded.id === '')).toBe(true);
        expect(loadedIds).toEqual(['local-1']);
        expect(storage.addDiagram).not.toHaveBeenCalled();
        expect(storage.deleteDiagram).not.toHaveBeenCalled();
        expect(diagramsApi.createDiagram).not.toHaveBeenCalled();
        expect(diagramsApi.updateDiagram).not.toHaveBeenCalled();
        expect(putOnline.copy).not.toHaveBeenCalled();
        expect(realtime.leaveDiagram).toHaveBeenCalled();
        expect(dialog.openAuthDialog).toHaveBeenCalledTimes(1);
        expect(dialog.openOpenDiagramDialog).not.toHaveBeenCalled();
        expect(openOnlineIds).toEqual([]);

        fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

        await waitFor(() => {
            expect(openOnlineIds).toEqual(['42']);
        });

        expect(dialog.openAuthDialog).toHaveBeenCalledTimes(1);
        expect(openOnlineIds).toEqual(['42']);
    });
});
