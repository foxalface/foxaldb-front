import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu } from '../menu';
import {
    KeyboardShortcutAction,
    keyboardShortcutsForOS,
} from '@/context/keyboard-shortcuts-context/keyboard-shortcuts';

const dialogMocks = {
    openCreateDiagramDialog: vi.fn(),
    openOpenDiagramDialog: vi.fn(),
    openExportWizardDialog: vi.fn(),
    openMergeWizardDialog: vi.fn(),
};

const showAlertMock = vi.fn();

const authState = {
    isAuthenticated: false,
};

const locationState = {
    location: {
        type: 'device' as const,
        localId: 'guest-diagram-1',
    },
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
        clearDiagramAccess: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: locationState.location,
        setDiagramLocation: vi.fn(),
    }),
    useOnlineDiagramId: () => null,
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
        showAlert: showAlertMock,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const diagramActionKeys = [
    'menu.actions.new',
    'menu.actions.open',
    'menu.actions.save',
    'menu.actions.export',
    'menu.actions.merge',
    'menu.actions.delete_diagram',
] as const;

const getDiagramMenuItems = () =>
    screen
        .getAllByRole('menuitem')
        .map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? '')
        .filter((label) =>
            diagramActionKeys.some((key) => label.startsWith(key))
        );

describe('Diagram menu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authState.isAuthenticated = false;
        chartDbState.currentDiagram = {
            id: 'guest-diagram-1',
            name: 'Guest diagram',
        };
        chartDbState.readonly = false;
        chartDbState.diagramAccess = null;
        locationState.location = {
            type: 'device',
            localId: 'guest-diagram-1',
        };
    });

    const openDiagramMenu = async () => {
        const view = render(<Menu />);
        await userEvent.click(
            screen.getByRole('menuitem', { name: 'menu.actions.diagram' })
        );
        return view;
    };

    it('uses Diagram as the top-level label', async () => {
        render(<Menu />);
        expect(
            screen.getByRole('menuitem', { name: 'menu.actions.diagram' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: 'menu.actions.actions' })
        ).not.toBeInTheDocument();
    });

    it('does not expose an Import submenu or legacy import entries', async () => {
        await openDiagramMenu();

        expect(
            screen.queryByRole('menuitem', { name: 'menu.actions.import' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: '.json' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', {
                name: 'menu.actions.import_laravel_migrations',
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', {
                name: 'menu.actions.compare_laravel_migrations',
            })
        ).not.toBeInTheDocument();
    });

    it('orders items with two separator groups', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = { id: '42', name: 'Saved' };
        chartDbState.diagramAccess = { can_edit: true };
        await openDiagramMenu();

        const items = getDiagramMenuItems();
        expect(items).toEqual([
            `menu.actions.new${keyboardShortcutsForOS[KeyboardShortcutAction.NEW_DIAGRAM].keyCombinationLabel}`,
            `menu.actions.open${keyboardShortcutsForOS[KeyboardShortcutAction.OPEN_DIAGRAM].keyCombinationLabel}`,
            `menu.actions.save${keyboardShortcutsForOS[KeyboardShortcutAction.SAVE_DIAGRAM].keyCombinationLabel}`,
            `menu.actions.export${keyboardShortcutsForOS[KeyboardShortcutAction.EXPORT_DIAGRAM].keyCombinationLabel}`,
            `menu.actions.merge${keyboardShortcutsForOS[KeyboardShortcutAction.MERGE_DIAGRAM].keyCombinationLabel}`,
            `menu.actions.delete_diagram${keyboardShortcutsForOS[KeyboardShortcutAction.DELETE_DIAGRAM].keyCombinationLabel}`,
        ]);

        const deleteItem = screen.getByRole('menuitem', {
            name: /menu\.actions\.delete_diagram/,
        });
        const menuPanel = deleteItem.parentElement;
        expect(menuPanel).not.toBeNull();
        const separators =
            menuPanel?.querySelectorAll('[role="separator"]') ?? [];
        expect(separators.length).toBe(2);
    });

    it('opens the export wizard from Export', async () => {
        await openDiagramMenu();
        await userEvent.click(
            screen.getByRole('menuitem', { name: /menu\.actions\.export/ })
        );
        expect(dialogMocks.openExportWizardDialog).toHaveBeenCalledTimes(1);
    });

    it('opens the new diagram wizard from New', async () => {
        await openDiagramMenu();
        await userEvent.click(
            screen.getByRole('menuitem', { name: /menu\.actions\.new/ })
        );
        expect(dialogMocks.openCreateDiagramDialog).toHaveBeenCalledTimes(1);
    });

    it('opens the browse dialog from Open', async () => {
        await openDiagramMenu();
        await userEvent.click(
            screen.getByRole('menuitem', { name: /menu\.actions\.open/ })
        );
        expect(dialogMocks.openOpenDiagramDialog).toHaveBeenCalledTimes(1);
    });

    it('shows delete confirmation instead of deleting immediately', async () => {
        await openDiagramMenu();
        await userEvent.click(
            screen.getByRole('menuitem', {
                name: /menu\.actions\.delete_diagram/,
            })
        );
        expect(showAlertMock).toHaveBeenCalledTimes(1);
        expect(showAlertMock.mock.calls[0][0]).toMatchObject({
            title: 'delete_diagram_alert.title',
            onAction: expect.any(Function),
        });
    });

    it('does not expose the obsolete Backup top-level menu', () => {
        render(<Menu />);
        expect(
            screen.queryByRole('menuitem', { name: 'menu.backup.backup' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', {
                name: 'menu.backup.export_diagram',
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', {
                name: 'menu.backup.restore_diagram',
            })
        ).not.toBeInTheDocument();
    });

    it('keeps Diagram, Edit, View, and Help top-level menus', () => {
        render(<Menu />);
        expect(
            screen.getByRole('menuitem', { name: 'menu.actions.diagram' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: 'menu.edit.edit' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: 'menu.view.view' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: 'menu.help.help' })
        ).toBeInTheDocument();
    });

    it('hides Merge for a guest or local-only diagram', async () => {
        await openDiagramMenu();
        expect(
            screen.queryByRole('menuitem', { name: /menu\.actions\.merge/ })
        ).not.toBeInTheDocument();
    });

    it('shows Merge after Export and before Delete for an editor', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = { id: '42', name: 'Saved' };
        chartDbState.diagramAccess = { can_edit: true };
        await openDiagramMenu();

        const items = getDiagramMenuItems();
        const exportIndex = items.findIndex((item) =>
            item.startsWith('menu.actions.export')
        );
        const mergeIndex = items.findIndex((item) =>
            item.startsWith('menu.actions.merge')
        );
        const deleteIndex = items.findIndex((item) =>
            item.startsWith('menu.actions.delete_diagram')
        );

        expect(exportIndex).toBeGreaterThanOrEqual(0);
        expect(mergeIndex).toBeGreaterThan(exportIndex);
        expect(deleteIndex).toBeGreaterThan(mergeIndex);

        await userEvent.click(
            screen.getByRole('menuitem', { name: /menu\.actions\.merge/ })
        );
        expect(dialogMocks.openMergeWizardDialog).toHaveBeenCalledTimes(1);
    });

    it('shows Merge for an editor and hides it for a readonly viewer', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = { id: '42', name: 'Saved' };
        chartDbState.diagramAccess = { can_edit: true };
        chartDbState.readonly = false;
        const editorView = await openDiagramMenu();
        expect(
            screen.getByRole('menuitem', { name: /menu\.actions\.merge/ })
        ).toBeInTheDocument();
        editorView.unmount();

        chartDbState.readonly = true;
        chartDbState.diagramAccess = { can_edit: false };
        await openDiagramMenu();
        expect(
            screen.queryByRole('menuitem', { name: /menu\.actions\.merge/ })
        ).not.toBeInTheDocument();
    });

    it('does not expose fragmented export SQL or export-as submenus', async () => {
        await openDiagramMenu();
        expect(
            screen.queryByRole('menuitem', { name: 'menu.actions.export_sql' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: 'menu.actions.export_as' })
        ).not.toBeInTheDocument();
    });
});
