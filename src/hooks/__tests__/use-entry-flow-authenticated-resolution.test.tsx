import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntryFlowAuthenticatedResolution } from '@/hooks/use-entry-flow-authenticated-resolution';
import type { EntryFlowState } from '@/lib/entry-flow';
import { ApiError } from '@/lib/api/client';
import * as autosaveController from '@/lib/diagram-autosave/diagram-autosave-controller';

const authState = {
    isAuthenticated: true,
    isLoading: false,
};

const chartDbState = {
    currentDiagram: null as { id: string } | null,
};

const getDiagrams = vi.fn();
const getDiagram = vi.fn();
const loadDiagram = vi.fn();
const loadDiagramFromData = vi.fn();
const setDiagramAccess = vi.fn();
const clearDiagramAccess = vi.fn();
const diagramAccessState = vi.hoisted(() => ({
    value: null as {
        role: string;
        can_edit: boolean;
        can_manage_members: boolean;
    } | null,
}));
const updateConfig = vi.fn();
const navigate = vi.fn();
const showLoader = vi.fn();
const hideLoader = vi.fn();
const resetRedoStack = vi.fn();
const resetUndoStack = vi.fn();
const showAlert = vi.fn();
const dispatchEvent = vi.fn();
const setDiagramLocation = vi.fn();

let resolutionGeneration = 0;

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        config: { defaultDiagramId: null },
        updateConfig,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
        loadDiagram,
        loadDiagramFromData,
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: null,
        setDiagramLocation,
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: diagramAccessState.value,
        setDiagramAccess: (access: typeof diagramAccessState.value) => {
            diagramAccessState.value = access;
            setDiagramAccess(access);
        },
        clearDiagramAccess: () => {
            diagramAccessState.value = null;
            clearDiagramAccess();
        },
    }),
}));

vi.mock('@/hooks/use-full-screen-spinner', () => ({
    useFullScreenLoader: () => ({
        showLoader,
        hideLoader,
    }),
}));

vi.mock('@/hooks/use-redo-undo-stack', () => ({
    useRedoUndoStack: () => ({
        resetRedoStack,
        resetUndoStack,
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({ showAlert }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    getDiagram: (...args: unknown[]) => getDiagram(...args),
    getDiagrams: (...args: unknown[]) => getDiagrams(...args),
}));

const beginResolution = () => {
    resolutionGeneration += 1;
    return resolutionGeneration;
};

const isResolutionCurrent = (token: number) => token === resolutionGeneration;

const renderResolution = (state: EntryFlowState, routeDiagramId?: string) =>
    renderHook(() =>
        useEntryFlowAuthenticatedResolution({
            state,
            isAuthenticated: authState.isAuthenticated,
            isAuthLoading: authState.isLoading,
            routeDiagramId,
            beginResolution,
            isResolutionCurrent,
            dispatchEvent,
        })
    );

describe('useEntryFlowAuthenticatedResolution', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        authState.isLoading = false;
        chartDbState.currentDiagram = null;
        diagramAccessState.value = null;
        resolutionGeneration = 0;
        getDiagrams.mockReset();
        getDiagram.mockReset();
        loadDiagram.mockReset();
        loadDiagramFromData.mockReset();
        setDiagramAccess.mockReset();
        clearDiagramAccess.mockReset();
        updateConfig.mockReset();
        navigate.mockReset();
        showLoader.mockReset();
        hideLoader.mockReset();
        resetRedoStack.mockReset();
        resetUndoStack.mockReset();
        showAlert.mockReset();
        dispatchEvent.mockReset();
        setDiagramLocation.mockReset();
        updateConfig.mockResolvedValue(undefined);
    });

    it('fetches remote summaries once per loadingRemoteDiagrams episode', async () => {
        getDiagrams.mockResolvedValue([
            {
                id: 1,
                name: 'One',
                tables_count: 2,
                created_at: '2024-01-01T00:00:00.000Z',
                updated_at: '2024-01-02T00:00:00.000Z',
            },
        ]);

        const state: EntryFlowState = {
            kind: 'loadingRemoteDiagrams',
            entrySource: 'startup',
        };

        renderResolution(state);

        await waitFor(() => {
            expect(getDiagrams).toHaveBeenCalledTimes(1);
        });

        expect(dispatchEvent).toHaveBeenCalledWith({
            type: 'REMOTE_DIAGRAMS_FOUND',
            diagrams: [
                expect.objectContaining({
                    id: '1',
                    name: 'One',
                    tablesCount: 2,
                }),
            ],
        });
    });

    it('transitions to creatingDiagram when no remote diagrams exist', async () => {
        getDiagrams.mockResolvedValue([]);

        renderResolution({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'startup',
        });

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'NO_REMOTE_DIAGRAMS',
            });
        });
    });

    it('opens a remote diagram without listing when in openingDiagram', async () => {
        const contentHash = 'a'.repeat(64);
        const initializeAutosave = vi
            .spyOn(autosaveController, 'initializeDiagramAutosaveFromServer')
            .mockImplementation(() => undefined);
        getDiagram.mockResolvedValue({
            id: 5,
            name: 'Remote',
            content: { id: '5', name: 'Remote', databaseType: 'postgresql' },
            content_hash: contentHash,
            access: { role: 'owner', can_edit: true, can_manage_members: true },
        });

        renderResolution(
            {
                kind: 'openingDiagram',
                diagramId: '5',
                diagramSource: 'directRoute',
                entrySource: 'startup',
            },
            '5'
        );

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledWith('5');
        });

        expect(getDiagram).toHaveBeenCalledTimes(1);
        expect(getDiagrams).not.toHaveBeenCalled();
        expect(loadDiagramFromData).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '5',
                name: 'Remote',
                databaseType: 'postgresql',
            })
        );
        expect(initializeAutosave).toHaveBeenCalledWith('5', contentHash);
        initializeAutosave.mockRestore();
        expect(setDiagramAccess).toHaveBeenCalledWith({
            role: 'owner',
            can_edit: true,
            can_manage_members: true,
        });
        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'online',
            diagramId: '5',
        });
        expect(dispatchEvent).toHaveBeenCalledWith({ type: 'DIAGRAM_OPENED' });
        expect(showLoader).toHaveBeenCalled();
        expect(hideLoader).toHaveBeenCalled();
        expect(showLoader.mock.invocationCallOrder[0]).toBeLessThan(
            hideLoader.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER
        );
    });

    it('refreshes diagram access when reopening an already loaded diagram', async () => {
        chartDbState.currentDiagram = { id: '5' };
        getDiagram.mockResolvedValue({
            id: 5,
            name: 'Remote',
            access: { role: 'owner', can_edit: true, can_manage_members: true },
        });

        renderResolution(
            {
                kind: 'openingDiagram',
                diagramId: '5',
                diagramSource: 'remote',
                entrySource: 'login',
            },
            '5'
        );

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledWith('5');
        });

        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(setDiagramAccess).toHaveBeenCalledWith(
            expect.objectContaining({ can_edit: true })
        );
        expect(dispatchEvent).toHaveBeenCalledWith({ type: 'DIAGRAM_OPENED' });
    });

    it('restores diagram access on ready when the route diagram is already loaded', async () => {
        chartDbState.currentDiagram = { id: '5' };
        diagramAccessState.value = null;
        getDiagram.mockResolvedValue({
            id: 5,
            name: 'Remote',
            access: { role: 'owner', can_edit: true, can_manage_members: true },
        });

        renderResolution({ kind: 'ready' }, '5');

        await waitFor(() => {
            expect(getDiagram).toHaveBeenCalledWith('5');
        });

        expect(setDiagramAccess).toHaveBeenCalledWith(
            expect.objectContaining({ can_edit: true })
        );
        expect(loadDiagramFromData).not.toHaveBeenCalled();
    });

    it('opens a local copy without fetching backend access', async () => {
        const localDiagram = {
            id: 'workspaceabcd1234',
            name: 'Main Copy',
        };
        loadDiagram.mockResolvedValue(localDiagram);

        renderResolution(
            {
                kind: 'openingDiagram',
                diagramId: 'workspaceabcd1234',
                diagramSource: 'directRoute',
                entrySource: 'startup',
            },
            'workspaceabcd1234'
        );

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'DIAGRAM_OPENED',
            });
        });

        expect(getDiagram).not.toHaveBeenCalled();
        expect(loadDiagram).toHaveBeenCalledWith('workspaceabcd1234');
        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'device',
            localId: 'workspaceabcd1234',
        });
        expect(setDiagramAccess).not.toHaveBeenCalled();
        expect(clearDiagramAccess).toHaveBeenCalled();
    });

    it('does not restore remote access for a local diagram that is already loaded', async () => {
        chartDbState.currentDiagram = { id: 'workspaceabcd1234' };
        diagramAccessState.value = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };

        renderResolution({ kind: 'ready' }, 'workspaceabcd1234');

        await waitFor(() => {
            expect(clearDiagramAccess).toHaveBeenCalled();
        });

        expect(getDiagram).not.toHaveBeenCalled();
        expect(setDiagramAccess).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('recovers from access denied via ACCESS_DENIED_RECOVERY', async () => {
        getDiagram.mockRejectedValue(new ApiError('Forbidden', 403, null));

        renderResolution(
            {
                kind: 'openingDiagram',
                diagramId: '9',
                diagramSource: 'directRoute',
                entrySource: 'startup',
            },
            '9'
        );

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'ACCESS_DENIED_RECOVERY',
            });
        });

        expect(navigate).toHaveBeenCalledWith('/');
    });

    it('ignores stale completions after logout invalidates resolution', async () => {
        getDiagrams.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve([]), 50);
                })
        );

        renderResolution({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'login',
        });

        resolutionGeneration += 1;

        await waitFor(() => {
            expect(getDiagrams).toHaveBeenCalledTimes(1);
        });

        expect(dispatchEvent).not.toHaveBeenCalled();
    });
});
