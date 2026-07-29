import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntryFlowGuestResolution } from '@/hooks/use-entry-flow-guest-resolution';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import type { EntryFlowState } from '@/lib/entry-flow';

const listDiagrams = vi.fn();
const loadDiagram = vi.fn();
const clearDiagramAccess = vi.fn();
const dispatchEvent = vi.fn();

let currentDiagram: Diagram | null = null;
let config: Record<string, unknown> | undefined = { defaultDiagramId: null };

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({ config }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({ listDiagrams }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram,
        loadDiagram,
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({ clearDiagramAccess }),
}));

const beginResolution = vi.fn(() => 1);
const isResolutionCurrent = vi.fn((token: number) => token === 1);

const renderGuestResolution = (state: EntryFlowState) =>
    renderHook(() =>
        useEntryFlowGuestResolution({
            state,
            isAuthenticated: false,
            isAuthLoading: false,
            beginResolution,
            isResolutionCurrent,
            dispatchEvent,
        })
    );

describe('useEntryFlowGuestResolution', () => {
    beforeEach(() => {
        listDiagrams.mockReset();
        loadDiagram.mockReset();
        clearDiagramAccess.mockReset();
        dispatchEvent.mockReset();
        beginResolution.mockClear();
        isResolutionCurrent.mockImplementation((token: number) => token === 1);
        currentDiagram = null;
        config = { defaultDiagramId: null };
    });

    it('dispatches LOCAL_DIAGRAM_FOUND when a local diagram exists', async () => {
        listDiagrams.mockResolvedValue([{ id: 'local-1' }]);

        renderGuestResolution({ kind: 'checkingLocalDiagram' });

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'LOCAL_DIAGRAM_FOUND',
                diagramId: 'local-1',
            });
        });

        expect(beginResolution).toHaveBeenCalledTimes(1);
        expect(listDiagrams).toHaveBeenCalledTimes(1);
        expect(clearDiagramAccess).toHaveBeenCalledTimes(1);
    });

    it('dispatches LOCAL_DIAGRAM_NOT_FOUND when storage is empty', async () => {
        listDiagrams.mockResolvedValue([]);

        renderGuestResolution({ kind: 'checkingLocalDiagram' });

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'LOCAL_DIAGRAM_NOT_FOUND',
            });
        });
    });

    it('dispatches LOCAL_DIAGRAM_CHECK_FAILED when lookup fails', async () => {
        listDiagrams.mockRejectedValue(new Error('storage failed'));

        renderGuestResolution({ kind: 'checkingLocalDiagram' });

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'LOCAL_DIAGRAM_CHECK_FAILED',
            });
        });
    });

    it('ignores stale lookup results', async () => {
        isResolutionCurrent.mockReturnValue(false);
        listDiagrams.mockResolvedValue([{ id: 'local-1' }]);

        renderGuestResolution({ kind: 'checkingLocalDiagram' });

        await waitFor(() => {
            expect(listDiagrams).toHaveBeenCalledTimes(1);
        });

        expect(dispatchEvent).not.toHaveBeenCalled();
    });

    it('loads an existing local diagram and dispatches DIAGRAM_OPENED', async () => {
        const diagram: Diagram = {
            id: 'local-1',
            name: 'Guest diagram',
            databaseType: DatabaseType.GENERIC,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        loadDiagram.mockResolvedValue(diagram);

        const { result } = renderGuestResolution({
            kind: 'openingDiagram',
            diagramId: 'local-1',
            diagramSource: 'local',
            entrySource: 'guestContinuation',
        });

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'DIAGRAM_OPENED',
            });
        });

        expect(loadDiagram).toHaveBeenCalledWith('local-1');
        expect(result.current.guestInitialDiagram).toEqual(diagram);
    });

    it('dispatches DIAGRAM_OPEN_FAILED when local load returns undefined', async () => {
        loadDiagram.mockResolvedValue(undefined);

        renderGuestResolution({
            kind: 'openingDiagram',
            diagramId: 'missing',
            diagramSource: 'local',
            entrySource: 'guestContinuation',
        });

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'DIAGRAM_OPEN_FAILED',
            });
        });
    });

    it('ignores stale local load results', async () => {
        isResolutionCurrent.mockReturnValue(false);
        loadDiagram.mockResolvedValue({
            id: 'local-1',
            name: 'Guest diagram',
            databaseType: 'generic',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        renderGuestResolution({
            kind: 'openingDiagram',
            diagramId: 'local-1',
            diagramSource: 'local',
            entrySource: 'guestContinuation',
        });

        await waitFor(() => {
            expect(loadDiagram).toHaveBeenCalledTimes(1);
        });

        expect(dispatchEvent).not.toHaveBeenCalled();
    });

    it('opens a created guest diagram without reloading when chartdb already has it', async () => {
        currentDiagram = {
            id: 'created-1',
            name: 'Created',
            databaseType: DatabaseType.GENERIC,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const { result } = renderGuestResolution({
            kind: 'openingDiagram',
            diagramId: 'created-1',
            diagramSource: 'created',
            entrySource: 'guestContinuation',
        });

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'DIAGRAM_OPENED',
            });
        });

        expect(loadDiagram).not.toHaveBeenCalled();
        expect(result.current.guestInitialDiagram).toEqual(currentDiagram);
    });

    it('does not start guest lookup for authenticated users', async () => {
        renderHook(() =>
            useEntryFlowGuestResolution({
                state: { kind: 'checkingLocalDiagram' },
                isAuthenticated: true,
                isAuthLoading: false,
                beginResolution,
                isResolutionCurrent,
                dispatchEvent,
            })
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(listDiagrams).not.toHaveBeenCalled();
        expect(dispatchEvent).not.toHaveBeenCalled();
    });

    it('does not dispatch LOCAL_DIAGRAM_NOT_FOUND when lookup is stale', async () => {
        listDiagrams.mockResolvedValue([]);
        isResolutionCurrent.mockReturnValue(false);

        renderGuestResolution({ kind: 'checkingLocalDiagram' });

        await waitFor(() => {
            expect(listDiagrams).toHaveBeenCalledTimes(1);
        });

        expect(dispatchEvent).not.toHaveBeenCalledWith({
            type: 'LOCAL_DIAGRAM_NOT_FOUND',
        });
    });
});
