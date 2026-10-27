import React, { type ReactNode } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
} from '@/lib/diagram/diagram-location';
import {
    initializeDiagramAutosaveFromServer,
    resetDiagramAutosaveForTests,
} from '@/lib/diagram-autosave/diagram-autosave-controller';
import { DiagramNamePanel } from '@/pages/editor-page/top-navbar/diagram-name-panel';
import { useDiagramAutosave } from '@/pages/editor-page/use-diagram-autosave';
import { useDiagramChannelLifecycle } from '@/pages/editor-page/use-diagram-channel-lifecycle';
const authState = {
    isAuthenticated: true,
    isLoading: false,
};

const accessState = {
    diagramAccess: { can_edit: true } as { can_edit: boolean } | null,
};

const chartDbState = {
    diagramName: 'Assembly diagram',
    currentDiagram: {
        id: 'local-1',
        name: 'Assembly diagram',
        databaseType: 'generic' as const,
    },
};

const updateDiagramApi = vi.fn();
const joinDiagram = vi.fn();
const leaveDiagram = vi.fn();
const replaceDiagram = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => accessState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramName: chartDbState.diagramName,
        currentDiagram: chartDbState.currentDiagram,
        replaceDiagram,
    }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    updateDiagram: (...args: unknown[]) => updateDiagramApi(...args),
    getDiagram: vi.fn(),
}));

vi.mock('@/lib/realtime/diagram-sync-state', () => ({
    isRemoteSyncActive: () => false,
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => ({
        joinDiagram,
        leaveDiagram,
        connectionStatus: 'connected',
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openOpenDiagramDialog: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const EditorHooksRunner: React.FC = () => {
    useDiagramAutosave();
    useDiagramChannelLifecycle();
    return null;
};

const renderAssembly = (
    location:
        | ReturnType<typeof deviceDiagramLocation>
        | ReturnType<typeof onlineDiagramLocation>
) => {
    chartDbState.currentDiagram = {
        id: location.type === 'device' ? location.localId : location.diagramId,
        name: chartDbState.diagramName,
        databaseType: 'generic',
    };

    return render(
        <DiagramLocationProvider initialLocation={location}>
            <TooltipProvider>
                <EditorHooksRunner />
                <DiagramNamePanel />
            </TooltipProvider>
        </DiagramLocationProvider>
    );
};

describe('A1 assembled editor invariants', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        accessState.diagramAccess = { can_edit: true };
        updateDiagramApi.mockReset();
        joinDiagram.mockReset();
        leaveDiagram.mockReset();
        replaceDiagram.mockReset();
        chartDbState.diagramName = 'Assembly diagram';
    });

    afterEach(() => {
        resetDiagramAutosaveForTests();
    });

    it('authenticated device: no PUT, no channel, indicator on', async () => {
        renderAssembly(deviceDiagramLocation('local-1'));

        expect(
            screen.getByLabelText('open_diagram_dialog.tabs.device')
        ).toBeInTheDocument();
        expect(joinDiagram).not.toHaveBeenCalled();

        vi.useFakeTimers();
        resetDiagramAutosaveForTests();
        initializeDiagramAutosaveFromServer('local-1', 'hash-1');

        const wrapper = ({ children }: { children: ReactNode }) => (
            <DiagramLocationProvider
                initialLocation={deviceDiagramLocation('local-1')}
            >
                {children}
            </DiagramLocationProvider>
        );

        chartDbState.currentDiagram = {
            id: 'local-1',
            name: 'Assembly diagram',
            databaseType: 'generic',
        };
        const { rerender } = renderHook(() => useDiagramAutosave(), {
            wrapper,
        });

        chartDbState.currentDiagram = {
            id: 'local-1',
            name: 'Edited device title',
            databaseType: 'generic',
        };
        rerender();

        await vi.advanceTimersByTimeAsync(2_000);
        expect(updateDiagramApi).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('authenticated online: PUT eligible, channel joined, no indicator', async () => {
        vi.useFakeTimers();
        initializeDiagramAutosaveFromServer('42', 'hash-1');
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Online diagram',
            databaseType: 'generic',
        };
        chartDbState.diagramName = 'Online diagram';
        updateDiagramApi.mockResolvedValue({ id: 42 });

        const wrapper = ({ children }: { children: ReactNode }) => (
            <DiagramLocationProvider
                initialLocation={onlineDiagramLocation('42')}
            >
                {children}
            </DiagramLocationProvider>
        );

        const { rerender } = renderHook(() => useDiagramAutosave(), {
            wrapper,
        });
        renderHook(() => useDiagramChannelLifecycle(), { wrapper });

        expect(joinDiagram).toHaveBeenCalledWith('42');

        renderAssembly(onlineDiagramLocation('42'));
        expect(
            screen.queryByLabelText('open_diagram_dialog.tabs.device')
        ).not.toBeInTheDocument();

        chartDbState.diagramName = 'Edited online';
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Edited online',
            databaseType: 'generic',
        };
        rerender();

        await vi.advanceTimersByTimeAsync(1_000);
        expect(updateDiagramApi).toHaveBeenCalledTimes(1);
        vi.useRealTimers();
    });

    it('authenticated device with numeric-looking id: location wins over id shape', () => {
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Numeric local id',
            databaseType: 'generic',
        };

        renderAssembly(deviceDiagramLocation('42'));

        expect(joinDiagram).not.toHaveBeenCalled();
        expect(
            screen.getByLabelText('open_diagram_dialog.tabs.device')
        ).toBeInTheDocument();
    });
});
