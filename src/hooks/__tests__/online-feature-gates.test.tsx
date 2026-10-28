import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramAccess } from '@/lib/api/diagrams';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { readOnlineDiagramId } from '@/lib/diagram/diagram-location';
import { getExportTargetAvailability } from '@/dialogs/export-wizard/export-target-availability';
import { DatabaseType } from '@/lib/domain/database-type';
import { useActivitiesAvailability } from '@/hooks/use-activities-availability';
import { useShareAvailability } from '@/hooks/use-share-availability';
import { useDiagramMenuActions } from '@/pages/editor-page/use-diagram-menu-actions';

const { authState, locationState, chartDbState, accessState } = vi.hoisted(
    () => ({
        authState: { isAuthenticated: false },
        locationState: { location: null as DiagramLocation | null },
        chartDbState: {
            currentDiagram: null as { id: string; name: string } | null,
            readonly: false,
        },
        accessState: { diagramAccess: null as DiagramAccess | null },
    })
);

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
        readonly: chartDbState.readonly,
        updateDiagramUpdatedAt: vi.fn(),
        deleteDiagram: vi.fn(),
        loadDiagramFromData: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: accessState.diagramAccess,
        clearDiagramAccess: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: locationState.location,
        setDiagramLocation: vi.fn(),
    }),
    useOnlineDiagramId: () =>
        readOnlineDiagramId(
            locationState.location,
            chartDbState.currentDiagram?.id
        ),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openCreateDiagramDialog: vi.fn(),
        openOpenDiagramDialog: vi.fn(),
        openExportWizardDialog: vi.fn(),
        openMergeWizardDialog: vi.fn(),
    }),
}));

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({ showAlert: vi.fn() }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('@/lib/api/diagrams', () => ({
    deleteDiagram: vi.fn(),
}));

vi.mock('@/lib/diagram-autosave/diagram-autosave-controller', () => ({
    abandonDiagramAutosave: vi.fn(),
    flushDiagramAutosave: vi.fn(),
}));

vi.mock('@/lib/realtime/diagram-sync-state', () => ({
    clearPendingDiagramOperationSyncTimers: vi.fn(),
}));

const ownerAccess: DiagramAccess = {
    role: 'owner',
    can_edit: true,
    can_manage_members: true,
};

const editorAccess: DiagramAccess = {
    role: 'editor',
    can_edit: true,
    can_manage_members: false,
};

const viewerAccess: DiagramAccess = {
    role: 'viewer',
    can_edit: false,
    can_manage_members: false,
};

describe('Online feature gates with numeric-looking device diagrams', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        locationState.location = deviceDiagramLocation('123');
        chartDbState.currentDiagram = { id: '123', name: 'Numeric device' };
        chartDbState.readonly = false;
        accessState.diagramAccess = ownerAccess;
    });

    it('keeps merge, Laravel, activities, share, and role gates offline', () => {
        const { result: menuActions } = renderHook(() =>
            useDiagramMenuActions()
        );

        expect(menuActions.current.canMergeDiagram).toBe(false);
        expect(
            getExportTargetAvailability('laravel', {
                isAuthenticated: true,
                onlineDiagramId: readOnlineDiagramId(
                    locationState.location,
                    chartDbState.currentDiagram?.id
                ),
                databaseType: DatabaseType.POSTGRESQL,
            })
        ).toEqual({ status: 'hidden' });
        expect(
            getExportTargetAvailability('prisma', {
                isAuthenticated: true,
                onlineDiagramId: null,
                databaseType: DatabaseType.POSTGRESQL,
            })
        ).toEqual({ status: 'available' });
        expect(
            renderHook(() => useActivitiesAvailability()).result.current
        ).toBe(false);
        expect(renderHook(() => useShareAvailability()).result.current).toBe(
            false
        );
    });
});

describe('Online feature gates with mismatched location and editor id', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        locationState.location = onlineDiagramLocation('123');
        chartDbState.currentDiagram = { id: '456', name: 'Stale editor' };
        chartDbState.readonly = false;
        accessState.diagramAccess = ownerAccess;
    });

    it('treats the diagram as not currently online', () => {
        expect(
            readOnlineDiagramId(
                locationState.location,
                chartDbState.currentDiagram?.id
            )
        ).toBeNull();

        const { result: menuActions } = renderHook(() =>
            useDiagramMenuActions()
        );

        expect(menuActions.current.canMergeDiagram).toBe(false);
        expect(
            renderHook(() => useActivitiesAvailability()).result.current
        ).toBe(false);
        expect(renderHook(() => useShareAvailability()).result.current).toBe(
            false
        );
    });
});

describe('Online feature gates for editors and viewers', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        locationState.location = onlineDiagramLocation('42');
        chartDbState.currentDiagram = { id: '42', name: 'Shared' };
        chartDbState.readonly = false;
    });

    it('allows merge for editors and hides it for viewers', () => {
        accessState.diagramAccess = editorAccess;
        expect(
            renderHook(() => useDiagramMenuActions()).result.current
                .canMergeDiagram
        ).toBe(true);

        accessState.diagramAccess = viewerAccess;
        chartDbState.readonly = true;
        expect(
            renderHook(() => useDiagramMenuActions()).result.current
                .canMergeDiagram
        ).toBe(false);
    });
});
