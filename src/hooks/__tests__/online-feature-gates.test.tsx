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

const { authState, locationState, chartDbState, accessState, dialogMocks } =
    vi.hoisted(() => ({
        authState: { isAuthenticated: false },
        locationState: { location: null as DiagramLocation | null },
        chartDbState: {
            currentDiagram: null as { id: string; name: string } | null,
            readonly: false,
        },
        accessState: { diagramAccess: null as DiagramAccess | null },
        dialogMocks: {
            openMergeWizardDialog: vi.fn(),
        },
    }));

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
        openMergeWizardDialog: dialogMocks.openMergeWizardDialog,
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
        dialogMocks.openMergeWizardDialog.mockClear();
    });

    it('keeps merge, Laravel, activities, share, and role gates offline', () => {
        const { result: menuActions } = renderHook(() =>
            useDiagramMenuActions()
        );

        expect(menuActions.current.canMergeDiagram).toBe(false);
        menuActions.current.openMergeWizard();
        expect(dialogMocks.openMergeWizardDialog).not.toHaveBeenCalled();
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
        dialogMocks.openMergeWizardDialog.mockClear();
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
        menuActions.current.openMergeWizard();
        expect(dialogMocks.openMergeWizardDialog).not.toHaveBeenCalled();
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
        dialogMocks.openMergeWizardDialog.mockClear();
    });

    it('allows merge for owners and editors and opens the dialog', () => {
        accessState.diagramAccess = ownerAccess;
        const owner = renderHook(() => useDiagramMenuActions());
        expect(owner.result.current.canMergeDiagram).toBe(true);
        owner.result.current.openMergeWizard();
        expect(dialogMocks.openMergeWizardDialog).toHaveBeenCalledTimes(1);

        dialogMocks.openMergeWizardDialog.mockClear();
        accessState.diagramAccess = editorAccess;
        const editor = renderHook(() => useDiagramMenuActions());
        expect(editor.result.current.canMergeDiagram).toBe(true);
        editor.result.current.openMergeWizard();
        expect(dialogMocks.openMergeWizardDialog).toHaveBeenCalledTimes(1);
    });

    it('hides merge for viewers even when the editor is not marked readonly', () => {
        accessState.diagramAccess = viewerAccess;
        chartDbState.readonly = false;
        const viewer = renderHook(() => useDiagramMenuActions());
        expect(viewer.result.current.canMergeDiagram).toBe(false);
        viewer.result.current.openMergeWizard();
        expect(dialogMocks.openMergeWizardDialog).not.toHaveBeenCalled();
    });

    it('hides merge for viewers when the editor is readonly', () => {
        accessState.diagramAccess = viewerAccess;
        chartDbState.readonly = true;
        const viewer = renderHook(() => useDiagramMenuActions());
        expect(viewer.result.current.canMergeDiagram).toBe(false);
        viewer.result.current.openMergeWizard();
        expect(dialogMocks.openMergeWizardDialog).not.toHaveBeenCalled();
    });
});

describe('Online feature gates for guests and non-numeric device diagrams', () => {
    beforeEach(() => {
        dialogMocks.openMergeWizardDialog.mockClear();
        chartDbState.readonly = false;
        accessState.diagramAccess = ownerAccess;
    });

    it('keeps merge unavailable for a guest device diagram', () => {
        authState.isAuthenticated = false;
        locationState.location = deviceDiagramLocation('guest-diagram-1');
        chartDbState.currentDiagram = {
            id: 'guest-diagram-1',
            name: 'Guest',
        };
        accessState.diagramAccess = null;

        const { result } = renderHook(() => useDiagramMenuActions());
        expect(result.current.canMergeDiagram).toBe(false);
        result.current.openMergeWizard();
        expect(dialogMocks.openMergeWizardDialog).not.toHaveBeenCalled();
    });

    it('keeps merge unavailable for an authenticated device diagram whose id is not numeric', () => {
        authState.isAuthenticated = true;
        locationState.location = deviceDiagramLocation('local-catalog');
        chartDbState.currentDiagram = {
            id: 'local-catalog',
            name: 'Device',
        };

        const { result } = renderHook(() => useDiagramMenuActions());
        expect(result.current.canMergeDiagram).toBe(false);
        result.current.openMergeWizard();
        expect(dialogMocks.openMergeWizardDialog).not.toHaveBeenCalled();
    });
});
