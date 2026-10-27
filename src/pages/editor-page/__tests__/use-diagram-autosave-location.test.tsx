import React, { type ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import {
    initializeDiagramAutosaveFromServer,
    resetDiagramAutosaveForTests,
} from '@/lib/diagram-autosave/diagram-autosave-controller';
import { useDiagramAutosave } from '@/pages/editor-page/use-diagram-autosave';

const authState = {
    isAuthenticated: false,
};

const accessState = {
    diagramAccess: null as { can_edit: boolean } | null,
};

const chartDbState = {
    currentDiagram: {
        id: 'local-1',
        name: 'Device diagram',
        databaseType: 'generic',
        tables: [],
        relationships: [],
        dependencies: [],
        areas: [],
        customTypes: [],
        notes: [],
    } as {
        id: string;
        name: string;
        databaseType: string;
        tables: never[];
        relationships: never[];
        dependencies: never[];
        areas: never[];
        customTypes: never[];
        notes: never[];
    } | null,
};

const updateDiagram = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => accessState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
        replaceDiagram: vi.fn(),
    }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    updateDiagram: (...args: unknown[]) => updateDiagram(...args),
    getDiagram: vi.fn(),
}));

vi.mock('@/lib/realtime/diagram-sync-state', () => ({
    isRemoteSyncActive: () => false,
}));

const renderAutosave = (location: DiagramLocation | null) =>
    renderHook(() => useDiagramAutosave(), {
        wrapper: ({ children }: { children: ReactNode }) => (
            <DiagramLocationProvider initialLocation={location}>
                {children}
            </DiagramLocationProvider>
        ),
    });

const diagramWithName = (id: string, name: string) => ({
    id,
    name,
    databaseType: 'generic' as const,
    tables: [],
    relationships: [],
    dependencies: [],
    areas: [],
    customTypes: [],
    notes: [],
});

describe('useDiagramAutosave location gate', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        resetDiagramAutosaveForTests();
        authState.isAuthenticated = true;
        accessState.diagramAccess = { can_edit: true };
        updateDiagram.mockReset();
        updateDiagram.mockResolvedValue({ id: 42 });
    });

    afterEach(() => {
        vi.useRealTimers();
        resetDiagramAutosaveForTests();
    });

    it('does not PUT an authenticated device diagram', () => {
        chartDbState.currentDiagram = diagramWithName('local-1', 'Device');
        initializeDiagramAutosaveFromServer('local-1', 'hash-1');
        const { rerender } = renderAutosave(deviceDiagramLocation('local-1'));

        chartDbState.currentDiagram = diagramWithName('local-1', 'Edited');
        rerender();
        vi.advanceTimersByTime(2_000);

        expect(updateDiagram).not.toHaveBeenCalled();
    });

    it('does not PUT a guest device diagram', () => {
        authState.isAuthenticated = false;
        chartDbState.currentDiagram = diagramWithName('local-1', 'Guest');
        const { rerender } = renderAutosave(deviceDiagramLocation('local-1'));

        chartDbState.currentDiagram = diagramWithName(
            'local-1',
            'Edited guest'
        );
        rerender();
        vi.advanceTimersByTime(2_000);

        expect(updateDiagram).not.toHaveBeenCalled();
    });

    it('PUTs an authenticated editable online diagram', async () => {
        chartDbState.currentDiagram = diagramWithName('42', 'Online');
        initializeDiagramAutosaveFromServer('42', 'hash-1');
        const { rerender } = renderAutosave(onlineDiagramLocation('42'));

        chartDbState.currentDiagram = diagramWithName('42', 'Edited online');
        rerender();
        await vi.advanceTimersByTimeAsync(1_000);

        expect(updateDiagram).toHaveBeenCalledTimes(1);
        expect(updateDiagram).toHaveBeenCalledWith(
            '42',
            expect.objectContaining({
                baseContentHash: 'hash-1',
            })
        );
    });
});
