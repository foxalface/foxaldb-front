import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu } from '../menu';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { readOnlineDiagramId } from '@/lib/diagram/diagram-location';
import type { DiagramAccess } from '@/lib/api/diagrams';

const deleteDiagramApi = vi.fn();
const navigate = vi.fn();
const deleteLocalDiagram = vi.fn();
const showAlert = vi.fn();
const onActiveDiagramDeleted = vi.fn();
const setDiagramLocation = vi.fn();
const clearDiagramAccess = vi.fn();
const loadDiagramFromData = vi.fn();
const updateDiagramUpdatedAt = vi.fn();
const abandonDiagramAutosave = vi.fn();
const flushDiagramAutosave = vi.fn();
const clearPendingDiagramOperationSyncTimers = vi.fn();

const authState = {
    isAuthenticated: false,
};

const locationState: { location: DiagramLocation | null } = {
    location: deviceDiagramLocation('guest-diagram-1'),
};

const chartDbState: {
    currentDiagram: { id: string; name: string } | null;
} = {
    currentDiagram: {
        id: 'guest-diagram-1',
        name: 'Guest diagram',
    },
};

const accessState: { diagramAccess: DiagramAccess | null } = {
    diagramAccess: null,
};

vi.mock('@/lib/api/diagrams', () => ({
    deleteDiagram: (...args: unknown[]) => deleteDiagramApi(...args),
    updateDiagram: vi.fn(),
}));

vi.mock('@/lib/diagram-autosave/diagram-autosave-controller', () => ({
    abandonDiagramAutosave: () => abandonDiagramAutosave(),
    flushDiagramAutosave: () => flushDiagramAutosave(),
}));

vi.mock('@/lib/realtime/diagram-sync-state', () => ({
    clearPendingDiagramOperationSyncTimers: () =>
        clearPendingDiagramOperationSyncTimers(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        clearDiagramData: vi.fn(),
        updateDiagramUpdatedAt,
        databaseType: 'generic',
        currentDiagram: chartDbState.currentDiagram,
        readonly: false,
        deleteDiagram: (...args: unknown[]) => deleteLocalDiagram(...args),
        loadDiagramFromData: (diagram: { id: string; name: string }) =>
            loadDiagramFromData(diagram),
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: accessState.diagramAccess,
        clearDiagramAccess,
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: locationState.location,
        setDiagramLocation: (next: DiagramLocation | null) => {
            setDiagramLocation(next);
            locationState.location = next;
        },
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
        openExportSQLDialog: vi.fn(),
        openExportDiagramDialog: vi.fn(),
        openExportWizardDialog: vi.fn(),
        openMergeWizardDialog: vi.fn(),
        openImportDiagramDialog: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-export-image', () => ({
    useExportImage: () => ({
        exportImage: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-history', () => ({
    useHistory: () => ({
        redo: vi.fn(),
        undo: vi.fn(),
        hasRedo: false,
        hasUndo: false,
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        hideSidePanel: vi.fn(),
        isSidePanelShowed: false,
        showSidePanel: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({
        setTheme: vi.fn(),
        theme: 'light',
    }),
}));

vi.mock('@/hooks/use-local-config', () => ({
    useLocalConfig: () => ({
        scrollAction: 'zoom',
        setScrollAction: vi.fn(),
        setShowCardinality: vi.fn(),
        showCardinality: false,
        setShowFieldAttributes: vi.fn(),
        showFieldAttributes: false,
        setShowMiniMapOnCanvas: vi.fn(),
        showMiniMapOnCanvas: false,
        showDBViews: false,
        setShowDBViews: vi.fn(),
    }),
}));

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({
        showAlert,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const ownerAccess = {
    role: 'owner' as const,
    can_edit: true,
    can_manage_members: true,
};

const editorAccess = {
    role: 'editor' as const,
    can_edit: true,
    can_manage_members: false,
};

describe('Menu diagram deletion and save', () => {
    beforeEach(() => {
        deleteDiagramApi.mockReset();
        deleteLocalDiagram.mockReset();
        navigate.mockReset();
        showAlert.mockReset();
        onActiveDiagramDeleted.mockReset();
        setDiagramLocation.mockReset();
        clearDiagramAccess.mockReset();
        loadDiagramFromData.mockReset();
        updateDiagramUpdatedAt.mockReset();
        abandonDiagramAutosave.mockReset();
        flushDiagramAutosave.mockReset();
        clearPendingDiagramOperationSyncTimers.mockReset();
        authState.isAuthenticated = false;
        locationState.location = deviceDiagramLocation('guest-diagram-1');
        chartDbState.currentDiagram = {
            id: 'guest-diagram-1',
            name: 'Guest diagram',
        };
        accessState.diagramAccess = null;
        deleteLocalDiagram.mockImplementation(async () => {
            chartDbState.currentDiagram = { id: '', name: '' };
        });
        deleteDiagramApi.mockResolvedValue(undefined);
        loadDiagramFromData.mockImplementation(
            (diagram: { id: string; name: string }) => {
                chartDbState.currentDiagram = {
                    id: diagram.id,
                    name: diagram.name,
                };
            }
        );
        setDiagramLocation.mockImplementation(
            (next: DiagramLocation | null) => {
                locationState.location = next;
            }
        );
    });

    const openDiagramMenu = async () => {
        render(<Menu onActiveDiagramDeleted={onActiveDiagramDeleted} />);
        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.diagram' })
        );
    };

    const triggerDelete = async () => {
        await openDiagramMenu();
        await userEvent.click(
            screen.getByRole('menuitem', {
                name: /menu\.actions\.delete_diagram/,
            })
        );

        const alertConfig = showAlert.mock.calls.at(-1)?.[0] as {
            onAction: () => Promise<void>;
        };

        await act(async () => {
            await alertConfig.onAction();
        });
    };

    it('deletes the active guest diagram locally and notifies entry flow once', async () => {
        await triggerDelete();

        expect(deleteLocalDiagram).toHaveBeenCalledTimes(1);
        expect(onActiveDiagramDeleted).toHaveBeenCalledTimes(1);
        expect(deleteDiagramApi).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(setDiagramLocation).toHaveBeenCalledWith(null);
        expect(chartDbState.currentDiagram?.id).toBe('');
    });

    it('does not notify entry flow when local deletion fails', async () => {
        deleteLocalDiagram.mockRejectedValueOnce(new Error('delete failed'));

        await triggerDelete();

        expect(deleteLocalDiagram).toHaveBeenCalledTimes(1);
        expect(onActiveDiagramDeleted).not.toHaveBeenCalled();
        expect(deleteDiagramApi).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(locationState.location).toEqual(
            deviceDiagramLocation('guest-diagram-1')
        );
    });

    it('deletes an authenticated device diagram from Dexie and leaves the route at home', async () => {
        authState.isAuthenticated = true;
        locationState.location = deviceDiagramLocation('device-diagram-1');
        chartDbState.currentDiagram = {
            id: 'device-diagram-1',
            name: 'On this device',
        };

        await triggerDelete();

        expect(deleteLocalDiagram).toHaveBeenCalledTimes(1);
        expect(deleteDiagramApi).not.toHaveBeenCalled();
        expect(onActiveDiagramDeleted).not.toHaveBeenCalled();
        expect(setDiagramLocation).toHaveBeenCalledWith(null);
        expect(locationState.location).toBeNull();
        expect(navigate).toHaveBeenCalledWith('/');
        expect(chartDbState.currentDiagram?.id).toBe('');
        expect(chartDbState.currentDiagram?.id).not.toBe('device-diagram-1');
    });

    it('does not call the backend when an authenticated device id is numeric', async () => {
        authState.isAuthenticated = true;
        locationState.location = deviceDiagramLocation('42');
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Numeric device diagram',
        };

        await triggerDelete();

        expect(deleteLocalDiagram).toHaveBeenCalledTimes(1);
        expect(deleteDiagramApi).not.toHaveBeenCalled();
        expect(flushDiagramAutosave).not.toHaveBeenCalled();
        expect(onActiveDiagramDeleted).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith('/');
        expect(locationState.location).toBeNull();
    });

    it('deletes an online diagram for the owner without touching Dexie', async () => {
        authState.isAuthenticated = true;
        locationState.location = onlineDiagramLocation('42');
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Remote diagram',
        };
        accessState.diagramAccess = ownerAccess;

        await triggerDelete();

        await waitFor(() => {
            expect(deleteDiagramApi).toHaveBeenCalledWith('42');
        });
        expect(deleteLocalDiagram).not.toHaveBeenCalled();
        expect(onActiveDiagramDeleted).not.toHaveBeenCalled();
        expect(abandonDiagramAutosave).toHaveBeenCalledTimes(1);
        expect(clearPendingDiagramOperationSyncTimers).toHaveBeenCalledTimes(1);
        expect(clearDiagramAccess).toHaveBeenCalledTimes(1);
        expect(loadDiagramFromData).toHaveBeenCalledWith(
            expect.objectContaining({ id: '' })
        );
        expect(chartDbState.currentDiagram?.id).toBe('');
        expect(setDiagramLocation).toHaveBeenCalledWith(null);
        expect(locationState.location).toBeNull();
        expect(navigate).toHaveBeenCalledWith('/');
        expect(
            readOnlineDiagramId(
                locationState.location,
                chartDbState.currentDiagram?.id
            )
        ).toBeNull();
    });

    it('hides delete for an online editor and does not call the backend', async () => {
        authState.isAuthenticated = true;
        locationState.location = onlineDiagramLocation('42');
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Shared diagram',
        };
        accessState.diagramAccess = editorAccess;

        await openDiagramMenu();

        expect(
            screen.queryByRole('menuitem', {
                name: /menu\.actions\.delete_diagram/,
            })
        ).not.toBeInTheDocument();
        expect(deleteDiagramApi).not.toHaveBeenCalled();
        expect(deleteLocalDiagram).not.toHaveBeenCalled();
    });

    it('hides delete for an online viewer', async () => {
        authState.isAuthenticated = true;
        locationState.location = onlineDiagramLocation('42');
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Shared diagram',
        };
        accessState.diagramAccess = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };

        await openDiagramMenu();

        expect(
            screen.queryByRole('menuitem', {
                name: /menu\.actions\.delete_diagram/,
            })
        ).not.toBeInTheDocument();
        expect(deleteDiagramApi).not.toHaveBeenCalled();
    });

    it('keeps the online diagram when backend delete fails', async () => {
        authState.isAuthenticated = true;
        locationState.location = onlineDiagramLocation('42');
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Remote diagram',
        };
        accessState.diagramAccess = ownerAccess;
        deleteDiagramApi.mockRejectedValueOnce(new Error('forbidden'));

        await triggerDelete();

        expect(deleteDiagramApi).toHaveBeenCalledWith('42');
        expect(deleteLocalDiagram).not.toHaveBeenCalled();
        expect(abandonDiagramAutosave).not.toHaveBeenCalled();
        expect(clearDiagramAccess).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(locationState.location).toEqual(onlineDiagramLocation('42'));
        expect(chartDbState.currentDiagram?.id).toBe('42');
    });

    it('does not notify entry flow when callback is omitted', async () => {
        render(<Menu />);

        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.diagram' })
        );
        await userEvent.click(
            screen.getByRole('menuitem', {
                name: /menu\.actions\.delete_diagram/,
            })
        );

        const alertConfig = showAlert.mock.calls.at(-1)?.[0] as {
            onAction: () => Promise<void>;
        };

        await act(async () => {
            await alertConfig.onAction();
        });

        expect(deleteLocalDiagram).toHaveBeenCalledTimes(1);
        expect(onActiveDiagramDeleted).not.toHaveBeenCalled();
    });

    it('does not flush backend autosave for an authenticated device diagram', async () => {
        authState.isAuthenticated = true;
        locationState.location = deviceDiagramLocation('device-diagram-1');
        chartDbState.currentDiagram = {
            id: 'device-diagram-1',
            name: 'On this device',
        };

        await openDiagramMenu();
        await userEvent.click(
            screen.getByRole('menuitem', { name: /menu\.actions\.save/ })
        );

        expect(updateDiagramUpdatedAt).toHaveBeenCalledTimes(1);
        expect(flushDiagramAutosave).not.toHaveBeenCalled();
    });

    it('does not flush backend autosave for a numeric device diagram id', async () => {
        authState.isAuthenticated = true;
        locationState.location = deviceDiagramLocation('42');
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Numeric device diagram',
        };

        await openDiagramMenu();
        await userEvent.click(
            screen.getByRole('menuitem', { name: /menu\.actions\.save/ })
        );

        expect(updateDiagramUpdatedAt).toHaveBeenCalledTimes(1);
        expect(flushDiagramAutosave).not.toHaveBeenCalled();
        expect(deleteDiagramApi).not.toHaveBeenCalled();
    });

    it('flushes backend autosave for the current online diagram', async () => {
        authState.isAuthenticated = true;
        locationState.location = onlineDiagramLocation('42');
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Remote diagram',
        };
        accessState.diagramAccess = ownerAccess;
        flushDiagramAutosave.mockResolvedValue(undefined);

        await openDiagramMenu();
        await userEvent.click(
            screen.getByRole('menuitem', { name: /menu\.actions\.save/ })
        );

        expect(updateDiagramUpdatedAt).toHaveBeenCalledTimes(1);
        expect(flushDiagramAutosave).toHaveBeenCalledTimes(1);
    });
});
