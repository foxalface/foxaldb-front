import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDiagramAutosave } from '@/pages/editor-page/use-diagram-autosave';

const authState = {
    isAuthenticated: false,
};

const chartDbState = {
    currentDiagram: {
        id: 'guest-diagram-1',
        name: 'Guest diagram',
        databaseType: 'generic',
        tables: [],
        relationships: [],
        dependencies: [],
        areas: [],
        customTypes: [],
        notes: [],
    },
};

const updateDiagram = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: null,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
    }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    updateDiagram: (...args: unknown[]) => updateDiagram(...args),
}));

vi.mock('@/lib/realtime/diagram-sync-state', () => ({
    isRemoteSyncActive: () => false,
}));

describe('useDiagramAutosave guest safety', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        authState.isAuthenticated = false;
        updateDiagram.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not schedule autosave for guest diagrams', () => {
        const { rerender } = renderHook(() => useDiagramAutosave());

        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            name: 'Updated guest diagram',
        };
        rerender();

        vi.advanceTimersByTime(2_000);

        expect(updateDiagram).not.toHaveBeenCalled();
    });

    it('does not autosave after guest diagram identity is cleared', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            id: '42',
            name: 'Authenticated diagram',
        };

        const { rerender } = renderHook(() => useDiagramAutosave());

        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            name: 'Changed before deletion',
        };
        rerender();

        authState.isAuthenticated = false;
        chartDbState.currentDiagram = null as never;
        rerender();

        vi.advanceTimersByTime(2_000);

        expect(updateDiagram).not.toHaveBeenCalled();
    });
});
