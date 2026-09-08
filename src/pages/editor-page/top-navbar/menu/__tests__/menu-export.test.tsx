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
    openExportDialog: vi.fn(),
    openExportDiagramDialog: vi.fn(),
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
    },
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
        deleteDiagram: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => dialogMocks,
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
    });

    const openActionsMenu = async () => {
        render(<Menu />);
        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.actions' })
        );
    };

    it('opens the unified export dialog from Actions', async () => {
        await openActionsMenu();

        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.export' })
        );

        expect(dialogMocks.openExportDialog).toHaveBeenCalledTimes(1);
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
});
