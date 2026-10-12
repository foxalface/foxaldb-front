import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu } from '../menu';

const dialogMocks = {
    openCreateDiagramDialog: vi.fn(),
    openOpenDiagramDialog: vi.fn(),
    openImportDatabaseDialog: vi.fn(),
    openImportDiagramDialog: vi.fn(),
    openExportWizardDialog: vi.fn(),
    openExportDiagramDialog: vi.fn(),
    openMergeWizardDialog: vi.fn(),
    openLaravelMigrationImportDialog: vi.fn(),
    openLaravelMigrationDiffDialog: vi.fn(),
};

const authState = {
    isAuthenticated: false,
};

const chartDbState = {
    currentDiagram: {
        id: 'guest-diagram-1',
        name: 'Guest diagram',
    } as { id: string; name: string } | null,
    readonly: false,
    diagramAccess: null as { can_edit: boolean } | null,
};

vi.mock('@/lib/api/diagrams', () => ({
    deleteDiagram: vi.fn(),
    updateDiagram: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        clearDiagramData: vi.fn(),
        updateDiagramUpdatedAt: vi.fn(),
        databaseType: 'postgresql',
        currentDiagram: chartDbState.currentDiagram,
        readonly: chartDbState.readonly,
        deleteDiagram: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => dialogMocks,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: chartDbState.diagramAccess,
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
        showAlert: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('Menu export navigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authState.isAuthenticated = false;
        chartDbState.currentDiagram = {
            id: 'guest-diagram-1',
            name: 'Guest diagram',
        };
        chartDbState.readonly = false;
        chartDbState.diagramAccess = null;
    });

    const openActionsMenu = async () => {
        const view = render(<Menu />);
        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.actions' })
        );
        return view;
    };

    it('opens the export wizard from Actions', async () => {
        await openActionsMenu();

        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.export' })
        );

        expect(dialogMocks.openExportWizardDialog).toHaveBeenCalledTimes(1);
    });

    it('does not expose fragmented export SQL or export-as submenus', async () => {
        await openActionsMenu();

        expect(
            screen.queryByRole('menuitem', { name: 'menu.actions.export_sql' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: 'menu.actions.export_as' })
        ).not.toBeInTheDocument();
    });

    it('keeps backup export diagram entry for backup workflow', async () => {
        render(<Menu />);

        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.backup.backup' })
        );

        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.backup.export_diagram' })
        );

        expect(dialogMocks.openExportDiagramDialog).toHaveBeenCalledTimes(1);
    });

    it('hides Merge for a guest or local-only diagram', async () => {
        await openActionsMenu();

        expect(
            screen.queryByRole('menuitem', { name: 'menu.actions.merge' })
        ).not.toBeInTheDocument();
    });

    it('shows Merge after Export and before Delete for an owner', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Saved',
        };
        chartDbState.diagramAccess = { can_edit: true };
        await openActionsMenu();

        const items = screen
            .getAllByRole('menuitem')
            .map((item) => item.textContent);
        const exportIndex = items.indexOf('menu.actions.export');
        const mergeIndex = items.indexOf('menu.actions.merge');
        const deleteIndex = items.indexOf('menu.actions.delete_diagram');

        expect(exportIndex).toBeGreaterThanOrEqual(0);
        expect(mergeIndex).toBeGreaterThan(exportIndex);
        expect(deleteIndex).toBeGreaterThan(mergeIndex);

        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.merge' })
        );
        expect(dialogMocks.openMergeWizardDialog).toHaveBeenCalledTimes(1);
    });

    it('shows Merge for an editor and hides it for a readonly viewer', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Saved',
        };
        chartDbState.diagramAccess = { can_edit: true };
        chartDbState.readonly = false;
        const editorView = await openActionsMenu();
        expect(
            screen.getByRole('menuitem', { name: 'menu.actions.merge' })
        ).toBeInTheDocument();
        editorView.unmount();

        chartDbState.readonly = true;
        chartDbState.diagramAccess = { can_edit: false };
        await openActionsMenu();
        expect(
            screen.queryByRole('menuitem', { name: 'menu.actions.merge' })
        ).not.toBeInTheDocument();
    });
});
