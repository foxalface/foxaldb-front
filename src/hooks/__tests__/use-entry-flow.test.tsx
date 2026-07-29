import React, { StrictMode } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntryFlow } from '@/hooks/use-entry-flow';

const authState = {
    user: null as {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
        email: string;
    } | null,
    isAuthenticated: false,
    isLoading: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    fetchUser: vi.fn(),
};

const routeState = {
    diagramId: undefined as string | undefined,
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        useParams: () => routeState,
    };
});

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramName: '',
        currentDiagram: null,
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openStarUsDialog: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-breakpoint', () => ({
    useBreakpoint: () => ({ isMd: true }),
}));

vi.mock('@/hooks/use-local-config', () => ({
    useLocalConfig: () => ({
        starUsDialogLastOpen: 0,
        setStarUsDialogLastOpen: vi.fn(),
        githubRepoOpened: false,
    }),
}));

vi.mock('@/pages/editor-page/use-diagram-autosave', () => ({
    useDiagramAutosave: () => undefined,
}));

vi.mock('@/pages/editor-page/use-diagram-access-listener', () => ({
    useDiagramAccessListener: () => undefined,
}));

vi.mock('@/pages/editor-page/use-diagram-channel-lifecycle', () => ({
    useDiagramChannelLifecycle: () => undefined,
}));

vi.mock('@/pages/editor-page/use-diagram-presence-activity', () => ({
    useDiagramPresenceActivity: () => undefined,
}));

vi.mock('@/pages/editor-page/use-diagram-realtime', () => ({
    useDiagramRealtime: () => undefined,
}));

vi.mock('@/pages/editor-page/use-diagram-reconnect-refresh', () => ({
    useDiagramReconnectRefresh: () => undefined,
}));

vi.mock('@/pages/editor-page/use-diagram-operation-sync', () => ({
    useDiagramOperationSync: () => undefined,
}));

vi.mock('@/lib/env', () => ({
    HIDE_CHARTDB_CLOUD: true,
}));

vi.mock('@/hooks/use-entry-flow-guest-resolution', () => ({
    useEntryFlowGuestResolution: () => ({ guestInitialDiagram: undefined }),
}));

vi.mock('@/hooks/use-entry-flow-guest-migration', () => ({
    useEntryFlowGuestMigration: () => undefined,
}));

vi.mock('@/hooks/use-entry-flow-authenticated-resolution', () => ({
    useEntryFlowAuthenticatedResolution: () => ({
        authenticatedInitialDiagram: undefined,
    }),
}));

function EntryGateProbe(): React.ReactElement {
    const entryFlow = useEntryFlow();
    const isEntrySessionRestoring = entryFlow.state.kind === 'restoringSession';

    return isEntrySessionRestoring ? (
        <div data-testid="entry-spinner" />
    ) : (
        <div data-testid="editor-desktop-layout" />
    );
}

const resetAuth = () => {
    authState.user = null;
    authState.isAuthenticated = false;
    authState.isLoading = true;
};

const completeAuthAsGuest = () => {
    authState.user = null;
    authState.isAuthenticated = false;
    authState.isLoading = false;
};

const completeAuthAsUser = (id = 1) => {
    authState.user = {
        id,
        first_name: 'Alexis',
        last_name: 'Renart',
        full_name: 'Alexis Renart',
        email: 'alexis@example.com',
    };
    authState.isAuthenticated = true;
    authState.isLoading = false;
};

describe('useEntryFlow', () => {
    beforeEach(() => {
        resetAuth();
        routeState.diagramId = undefined;
    });

    it('initial hook state is restoringSession while auth is loading', () => {
        const { result } = renderHook(() => useEntryFlow());

        expect(result.current.state).toEqual({ kind: 'restoringSession' });
    });

    it('does not resolve session before auth loading completes', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        rerender();
        rerender();

        expect(result.current.state).toEqual({ kind: 'restoringSession' });
    });

    it('restored unauthenticated session → awaitingGuestChoice', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state).toEqual({
                kind: 'awaitingGuestChoice',
            });
        });
    });

    it('restored authenticated session without route ID → loadingRemoteDiagrams', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsUser();
        rerender();

        await waitFor(() => {
            expect(result.current.state).toEqual({
                kind: 'loadingRemoteDiagrams',
                entrySource: 'startup',
            });
        });
    });

    it('restored authenticated session with route ID → openingDiagram directRoute', async () => {
        routeState.diagramId = '42';
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsUser();
        rerender();

        await waitFor(() => {
            expect(result.current.state).toEqual({
                kind: 'openingDiagram',
                diagramId: '42',
                diagramSource: 'directRoute',
                entrySource: 'startup',
            });
        });
    });

    it('empty route ID is treated as no route ID', async () => {
        routeState.diagramId = '';
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsUser();
        rerender();

        await waitFor(() => {
            expect(result.current.state).toEqual({
                kind: 'loadingRemoteDiagrams',
                entrySource: 'startup',
            });
        });
    });

    it('normal rerender does not repeat initial session resolution', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        rerender();
        rerender();
        rerender();

        expect(result.current.state).toEqual({ kind: 'awaitingGuestChoice' });
    });

    it('StrictMode does not cause duplicate observable initialization', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow(), {
            wrapper: StrictMode,
        });

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state).toEqual({
                kind: 'awaitingGuestChoice',
            });
        });

        rerender();

        expect(result.current.state).toEqual({ kind: 'awaitingGuestChoice' });
    });

    it('authenticated → unauthenticated transition dispatches logout semantics', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsUser();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('loadingRemoteDiagrams');
        });

        authState.user = null;
        authState.isAuthenticated = false;
        rerender();

        await waitFor(() => {
            expect(result.current.state).toEqual({
                kind: 'awaitingGuestChoice',
            });
        });
    });

    it('initial unauthenticated restoration is not treated as logout', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state).toEqual({
                kind: 'awaitingGuestChoice',
            });
        });
    });

    it('later authentication is not falsely attributed to startup', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        authState.user = {
            id: 2,
            first_name: 'Alexis',
            last_name: 'Renart',
            full_name: 'Alexis Renart',
            email: 'alexis@example.com',
        };
        authState.isAuthenticated = true;
        rerender();

        expect(result.current.state).toEqual({ kind: 'awaitingGuestChoice' });

        act(() => {
            result.current.notifyAuthenticationSucceeded('login');
        });

        expect(result.current.state).toEqual({
            kind: 'checkingGuestMigration',
            entrySource: 'login',
        });
    });

    it('notifyAuthenticationSucceeded(login) uses login source', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        act(() => {
            result.current.notifyAuthenticationSucceeded('login');
        });

        expect(result.current.state).toEqual({
            kind: 'checkingGuestMigration',
            entrySource: 'login',
        });
    });

    it('notifyAuthenticationSucceeded(registration) uses registration source', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        act(() => {
            result.current.notifyAuthenticationSucceeded('registration');
        });

        expect(result.current.state).toEqual({
            kind: 'checkingGuestMigration',
            entrySource: 'registration',
        });
    });

    it('reset returns restoringSession and invalidates prior async generation', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        const token = result.current.beginResolution();

        act(() => {
            result.current.reset();
        });

        expect(result.current.state).toEqual({ kind: 'restoringSession' });
        expect(result.current.isResolutionCurrent(token)).toBe(false);
    });

    it('logout invalidates prior async generation', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsUser();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('loadingRemoteDiagrams');
        });

        const token = result.current.beginResolution();

        authState.user = null;
        authState.isAuthenticated = false;
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        expect(result.current.isResolutionCurrent(token)).toBe(false);
    });

    it('route identity change invalidates prior opening generation', async () => {
        routeState.diagramId = '10';
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsUser();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('openingDiagram');
        });

        const token = result.current.beginResolution();
        routeState.diagramId = '11';
        rerender();

        await waitFor(() => {
            expect(result.current.isResolutionCurrent(token)).toBe(false);
        });
    });

    describe('resolution generation guard', () => {
        it('first beginResolution token is current', async () => {
            const { result, rerender } = renderHook(() => useEntryFlow());

            completeAuthAsGuest();
            rerender();

            await waitFor(() => {
                expect(result.current.state.kind).toBe('awaitingGuestChoice');
            });

            const token = result.current.beginResolution();

            expect(result.current.isResolutionCurrent(token)).toBe(true);
        });

        it('second beginResolution invalidates the first token', async () => {
            const { result, rerender } = renderHook(() => useEntryFlow());

            completeAuthAsGuest();
            rerender();

            await waitFor(() => {
                expect(result.current.state.kind).toBe('awaitingGuestChoice');
            });

            const firstToken = result.current.beginResolution();
            const secondToken = result.current.beginResolution();

            expect(result.current.isResolutionCurrent(firstToken)).toBe(false);
            expect(result.current.isResolutionCurrent(secondToken)).toBe(true);
        });

        it('invalidateResolution invalidates the latest token', async () => {
            const { result, rerender } = renderHook(() => useEntryFlow());

            completeAuthAsGuest();
            rerender();

            await waitFor(() => {
                expect(result.current.state.kind).toBe('awaitingGuestChoice');
            });

            const token = result.current.beginResolution();

            act(() => {
                result.current.invalidateResolution();
            });

            expect(result.current.isResolutionCurrent(token)).toBe(false);
        });

        it('notifyLoggedOut invalidates the latest token', async () => {
            const { result, rerender } = renderHook(() => useEntryFlow());

            completeAuthAsGuest();
            rerender();

            await waitFor(() => {
                expect(result.current.state.kind).toBe('awaitingGuestChoice');
            });

            const token = result.current.beginResolution();

            act(() => {
                result.current.notifyLoggedOut();
            });

            expect(result.current.isResolutionCurrent(token)).toBe(false);
        });

        it('notifyAuthenticationSucceeded invalidates the latest token', async () => {
            const { result, rerender } = renderHook(() => useEntryFlow());

            completeAuthAsGuest();
            rerender();

            await waitFor(() => {
                expect(result.current.state.kind).toBe('awaitingGuestChoice');
            });

            const token = result.current.beginResolution();

            act(() => {
                result.current.notifyAuthenticationSucceeded('login');
            });

            expect(result.current.isResolutionCurrent(token)).toBe(false);
        });

        it('normal rerenders do not invalidate an active token', async () => {
            const { result, rerender } = renderHook(() => useEntryFlow());

            completeAuthAsGuest();
            rerender();

            await waitFor(() => {
                expect(result.current.state.kind).toBe('awaitingGuestChoice');
            });

            const token = result.current.beginResolution();

            rerender();
            rerender();
            rerender();

            expect(result.current.isResolutionCurrent(token)).toBe(true);
        });

        it('auth loading rerenders do not invalidate an active token', async () => {
            const { result, rerender } = renderHook(() => useEntryFlow());

            completeAuthAsGuest();
            rerender();

            await waitFor(() => {
                expect(result.current.state.kind).toBe('awaitingGuestChoice');
            });

            const token = result.current.beginResolution();

            authState.isLoading = true;
            rerender();
            authState.isLoading = false;
            rerender();

            expect(result.current.isResolutionCurrent(token)).toBe(true);
        });

        it('StrictMode preserves token monotonicity', async () => {
            const { result, rerender } = renderHook(() => useEntryFlow(), {
                wrapper: StrictMode,
            });

            completeAuthAsGuest();
            rerender();

            await waitFor(() => {
                expect(result.current.state.kind).toBe('awaitingGuestChoice');
            });

            const firstToken = result.current.beginResolution();
            const secondToken = result.current.beginResolution();

            expect(secondToken).toBeGreaterThan(firstToken);
            expect(result.current.isResolutionCurrent(firstToken)).toBe(false);
            expect(result.current.isResolutionCurrent(secondToken)).toBe(true);

            rerender();

            expect(result.current.isResolutionCurrent(firstToken)).toBe(false);
            expect(result.current.isResolutionCurrent(secondToken)).toBe(true);
        });
    });

    it('public domain methods dispatch expected state-machine events', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        act(() => {
            result.current.continueAsGuest();
        });
        expect(result.current.state).toEqual({ kind: 'checkingLocalDiagram' });

        act(() => {
            result.current.notifyLocalDiagramFound('local-1');
        });
        expect(result.current.state.kind).toBe('openingDiagram');

        act(() => {
            result.current.notifyLoggedOut();
        });
        expect(result.current.state).toEqual({ kind: 'awaitingGuestChoice' });

        act(() => {
            result.current.notifyAuthenticationSucceeded('login');
            result.current.notifyGuestMigrationLocalNotFound();
        });
        expect(result.current.state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'login',
        });

        act(() => {
            result.current.notifyRemoteDiagramsFound([
                {
                    id: '1',
                    name: 'Diagram 1',
                    tablesCount: 0,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z',
                },
            ]);
        });
        expect(result.current.state.kind).toBe('selectingRemoteDiagram');

        act(() => {
            result.current.notifyRemoteDiagramSelected('1');
        });
        expect(result.current.state.kind).toBe('openingDiagram');

        act(() => {
            result.current.notifyDiagramOpened();
        });
        expect(result.current.state).toEqual({ kind: 'ready' });

        act(() => {
            result.current.notifyLoggedOut();
        });
        expect(result.current.state).toEqual({ kind: 'awaitingGuestChoice' });
    });

    it('exposes selector-derived dialog, blocking and ready flags', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        expect(result.current.dialog).toBeNull();
        expect(result.current.isBlocking).toBe(true);
        expect(result.current.isReady).toBe(false);

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.dialog).toBe('auth');
            expect(result.current.isBlocking).toBe(false);
            expect(result.current.isReady).toBe(false);
        });
    });
});

describe('entry startup gate', () => {
    beforeEach(() => {
        resetAuth();
        routeState.diagramId = undefined;
    });

    it('hides interactive editor content only while restoringSession', () => {
        authState.isLoading = true;

        const { queryByTestId } = render(<EntryGateProbe />);

        expect(queryByTestId('entry-spinner')).toBeInTheDocument();
        expect(queryByTestId('editor-desktop-layout')).not.toBeInTheDocument();
    });

    it('allows legacy editor bootstrap after session restoration', async () => {
        const { result, rerender } = renderHook(() => {
            const entryFlow = useEntryFlow();
            return entryFlow.state.kind !== 'restoringSession';
        });

        completeAuthAsGuest();

        await act(async () => {
            rerender();
        });

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });
});
