import { act, renderHook, waitFor } from '@testing-library/react';
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
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        useParams: () => ({ diagramId: undefined }),
    };
});

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramName: '',
        currentDiagram: null,
        loadDiagram: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({ config: {} }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        listDiagrams: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        clearDiagramAccess: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-entry-flow-guest-resolution', () => ({
    useEntryFlowGuestResolution: () => ({ guestInitialDiagram: undefined }),
}));

vi.mock('@/hooks/use-entry-flow-guest-migration', () => ({
    useEntryFlowGuestMigration: () => undefined,
}));

const completeAuthAsGuest = () => {
    authState.user = null;
    authState.isAuthenticated = false;
    authState.isLoading = false;
};

describe('useEntryFlow guest active diagram deletion', () => {
    beforeEach(() => {
        authState.user = null;
        authState.isAuthenticated = false;
        authState.isLoading = true;
    });

    it('notifyGuestActiveDiagramDeleted transitions ready to creatingDiagram', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        act(() => {
            result.current.continueAsGuest();
            result.current.notifyLocalDiagramNotFound();
            result.current.notifyDiagramCreated('guest-new');
            result.current.notifyDiagramOpened();
        });

        expect(result.current.state).toEqual({ kind: 'ready' });

        act(() => {
            result.current.notifyGuestActiveDiagramDeleted();
        });

        expect(result.current.state).toEqual({
            kind: 'creatingDiagram',
            entrySource: 'guestContinuation',
        });
        expect(result.current.dialog).toBe('createDiagram');
    });

    it('notifyGuestActiveDiagramDeleted invalidates prior async generation', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        act(() => {
            result.current.continueAsGuest();
            result.current.notifyLocalDiagramNotFound();
            result.current.notifyDiagramCreated('guest-new');
            result.current.notifyDiagramOpened();
        });

        const token = result.current.beginResolution();

        act(() => {
            result.current.notifyGuestActiveDiagramDeleted();
        });

        expect(result.current.isResolutionCurrent(token)).toBe(false);
    });

    it('notifyGuestActiveDiagramDeleted is ignored outside ready', async () => {
        const { result, rerender } = renderHook(() => useEntryFlow());

        completeAuthAsGuest();
        rerender();

        await waitFor(() => {
            expect(result.current.state.kind).toBe('awaitingGuestChoice');
        });

        act(() => {
            result.current.notifyGuestActiveDiagramDeleted();
        });

        expect(result.current.state).toEqual({ kind: 'awaitingGuestChoice' });
    });
});
