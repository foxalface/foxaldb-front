import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu } from '../menu';

const deleteDiagramApi = vi.fn();
const navigate = vi.fn();
const deleteLocalDiagram = vi.fn();
const showAlert = vi.fn();
const onActiveDiagramDeleted = vi.fn();

const authState = {
    isAuthenticated: false,
};

const chartDbState = {
    currentDiagram: {
        id: 'guest-diagram-1',
        name: 'Guest diagram',
    },
};

vi.mock('@/lib/api/diagrams', () => ({
    deleteDiagram: (...args: unknown[]) => deleteDiagramApi(...args),
    updateDiagram: vi.fn(),
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
        updateDiagramUpdatedAt: vi.fn(),
        databaseType: 'generic',
        currentDiagram: chartDbState.currentDiagram,
        deleteDiagram: deleteLocalDiagram,
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openCreateDiagramDialog: vi.fn(),
        openOpenDiagramDialog: vi.fn(),
        openExportSQLDialog: vi.fn(),
        openImportDatabaseDialog: vi.fn(),
        openExportImageDialog: vi.fn(),
        openExportDiagramDialog: vi.fn(),
        openImportDiagramDialog: vi.fn(),
        openExportLaravelMigrationsDialog: vi.fn(),
        openLaravelMigrationImportDialog: vi.fn(),
        openLaravelMigrationDiffDialog: vi.fn(),
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

describe('Menu guest active diagram deletion', () => {
    beforeEach(() => {
        deleteDiagramApi.mockReset();
        deleteLocalDiagram.mockReset();
        navigate.mockReset();
        showAlert.mockReset();
        onActiveDiagramDeleted.mockReset();
        authState.isAuthenticated = false;
        chartDbState.currentDiagram = {
            id: 'guest-diagram-1',
            name: 'Guest diagram',
        };
        deleteLocalDiagram.mockResolvedValue(undefined);
    });

    const triggerDelete = async () => {
        render(<Menu onActiveDiagramDeleted={onActiveDiagramDeleted} />);

        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.actions' })
        );
        await userEvent.click(
            screen.getByRole('menuitem', {
                name: 'menu.actions.delete_diagram',
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
    });

    it('does not notify entry flow when local deletion fails', async () => {
        deleteLocalDiagram.mockRejectedValueOnce(new Error('delete failed'));

        await triggerDelete();

        expect(deleteLocalDiagram).toHaveBeenCalledTimes(1);
        expect(onActiveDiagramDeleted).not.toHaveBeenCalled();
        expect(deleteDiagramApi).not.toHaveBeenCalled();
    });

    it('uses backend deletion for authenticated users without guest replacement', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Remote diagram',
        };
        deleteDiagramApi.mockResolvedValue(undefined);

        await triggerDelete();

        await waitFor(() => {
            expect(deleteDiagramApi).toHaveBeenCalledWith('42');
        });
        expect(deleteLocalDiagram).not.toHaveBeenCalled();
        expect(onActiveDiagramDeleted).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith('/');
    });

    it('does not notify entry flow when callback is omitted', async () => {
        render(<Menu />);

        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.actions' })
        );
        await userEvent.click(
            screen.getByRole('menuitem', {
                name: 'menu.actions.delete_diagram',
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
});
