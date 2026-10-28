import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenDiagramDialog } from '../open-diagram-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { useDiagramLocation } from '@/hooks/use-diagram-location';

const authState = { isAuthenticated: false };
const listDiagrams = vi.fn();
const listTables = vi.fn();
const getDiagrams = vi.fn();
const loadDiagram = vi.fn();
const clearDiagramAccess = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        listDiagrams,
        listTables,
        getDiagram: vi.fn(),
        addDiagram: vi.fn(),
        deleteDiagram: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        loadDiagram,
        diagramId: 'local-1',
        deleteDiagram: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        clearDiagramAccess,
    }),
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        updateConfig: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeOpenDiagramDialog: vi.fn(),
        openCreateDiagramDialog: vi.fn(),
    }),
}));

const navigate = vi.fn();
const requestAuthentication = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('@/hooks/use-request-authentication', () => ({
    useRequestAuthentication: () => requestAuthentication,
}));

vi.mock('@/lib/api/diagrams', () => ({
    getDiagrams: (...args: unknown[]) => getDiagrams(...args),
    deleteDiagram: vi.fn(),
    duplicateDiagram: vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const localDiagram = {
    id: 'workspaceabcd',
    name: 'Guest diagram',
    databaseType: DatabaseType.GENERIC,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-01'),
};

const onlineDiagram = {
    id: '12',
    name: 'Cloud diagram',
    database_type: 'generic',
    tables_count: 3,
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-04-01T00:00:00.000Z',
    access: { role: 'editor', can_edit: true, can_manage_members: false },
};

const renderDialog = () =>
    render(
        <TooltipProvider>
            <OpenDiagramDialog dialog={{ open: true, onOpenChange: vi.fn() }} />
        </TooltipProvider>
    );

describe('OpenDiagramDialog', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        navigate.mockReset();
        listDiagrams.mockReset();
        listTables.mockReset();
        getDiagrams.mockReset();
        loadDiagram.mockReset();
        requestAuthentication.mockReset();
        listDiagrams.mockResolvedValue([localDiagram]);
        listTables.mockResolvedValue([{ id: 't1' }, { id: 't2' }]);
        getDiagrams.mockResolvedValue([onlineDiagram]);
    });

    it('defaults guest to device tab and requests auth for online access', async () => {
        renderDialog();

        await waitFor(() => {
            expect(
                screen.getByRole('tab', {
                    name: 'open_diagram_dialog.tabs.device',
                })
            ).toHaveAttribute('data-state', 'active');
        });

        const user = userEvent.setup();
        await user.click(
            screen.getByRole('tab', {
                name: 'open_diagram_dialog.tabs.online',
            })
        );

        expect(requestAuthentication).toHaveBeenCalledWith({
            type: 'open-online-tab',
        });
        expect(getDiagrams).not.toHaveBeenCalled();
    });

    it('does not use Open database terminology in title', async () => {
        renderDialog();

        expect(
            screen.getByText('open_diagram_dialog.title')
        ).toBeInTheDocument();
        expect(screen.queryByText('Open Database')).not.toBeInTheDocument();
        expect(
            screen.queryByText('Ouvrir une base de données')
        ).not.toBeInTheDocument();
    });

    it('hides legacy numeric Dexie shadows from the device tab', async () => {
        listDiagrams.mockResolvedValue([
            localDiagram,
            {
                ...localDiagram,
                id: '42',
                name: 'Numeric shadow',
            },
        ]);

        renderDialog();

        expect(await screen.findByText('Guest diagram')).toBeInTheDocument();
        expect(screen.queryByText('Numeric shadow')).not.toBeInTheDocument();
    });

    it('shows only local diagrams on device tab', async () => {
        renderDialog();

        expect(await screen.findByText('Guest diagram')).toBeInTheDocument();
        expect(screen.queryByText('Cloud diagram')).not.toBeInTheDocument();
        expect(
            screen.getByText('open_diagram_dialog.table_columns.database')
        ).toBeInTheDocument();
    });

    it('defaults authenticated users to online tab', async () => {
        authState.isAuthenticated = true;

        renderDialog();

        await waitFor(() => {
            expect(
                screen.getByRole('tab', {
                    name: 'open_diagram_dialog.tabs.online',
                })
            ).toHaveAttribute('data-state', 'active');
        });

        expect(await screen.findByText('Cloud diagram')).toBeInTheDocument();
    });

    it('shows owner delete only for owner role in online actions menu', async () => {
        authState.isAuthenticated = true;
        getDiagrams.mockResolvedValue([
            onlineDiagram,
            {
                ...onlineDiagram,
                id: '13',
                name: 'Owned diagram',
                access: {
                    role: 'owner',
                    can_edit: true,
                    can_manage_members: true,
                },
            },
        ]);

        const user = userEvent.setup();
        renderDialog();

        await screen.findByText('Owned diagram');
        const ownedRow = screen.getByText('Owned diagram').closest('tr');
        expect(ownedRow).not.toBeNull();

        const ownedMenuButton = within(ownedRow as HTMLElement).getByRole(
            'button'
        );
        await user.click(ownedMenuButton);

        expect(
            screen.getByText('open_diagram_dialog.diagram_actions.delete')
        ).toBeInTheDocument();

        await user.keyboard('{Escape}');

        const editorRow = screen.getByText('Cloud diagram').closest('tr');
        const editorMenuButton = within(editorRow as HTMLElement).getByRole(
            'button'
        );
        await user.click(editorMenuButton);

        expect(
            screen.queryByText('open_diagram_dialog.diagram_actions.delete')
        ).not.toBeInTheDocument();
    });

    it('sets device location from the device tab and online location from the online tab', async () => {
        loadDiagram.mockResolvedValue(localDiagram);
        const user = userEvent.setup();

        const LocationProbe = () => {
            const { location } = useDiagramLocation();

            return (
                <div data-testid="diagram-location">
                    {location === null
                        ? 'none'
                        : `${location.type}:${
                              location.type === 'device'
                                  ? location.localId
                                  : location.diagramId
                          }`}
                </div>
            );
        };

        const { unmount } = render(
            <DiagramLocationProvider>
                <TooltipProvider>
                    <LocationProbe />
                    <OpenDiagramDialog
                        dialog={{ open: true, onOpenChange: vi.fn() }}
                    />
                </TooltipProvider>
            </DiagramLocationProvider>
        );

        expect(await screen.findByText('Guest diagram')).toBeInTheDocument();
        await user.click(screen.getByText('Guest diagram'));
        await user.click(
            screen.getByRole('button', { name: 'open_diagram_dialog.open' })
        );

        expect(screen.getByTestId('diagram-location')).toHaveTextContent(
            'device:workspaceabcd'
        );
        expect(loadDiagram).toHaveBeenCalledWith('workspaceabcd');
        expect(navigate).toHaveBeenCalledWith('/diagrams/workspaceabcd');

        unmount();
        authState.isAuthenticated = true;

        render(
            <DiagramLocationProvider>
                <TooltipProvider>
                    <LocationProbe />
                    <OpenDiagramDialog
                        dialog={{ open: true, onOpenChange: vi.fn() }}
                    />
                </TooltipProvider>
            </DiagramLocationProvider>
        );

        expect(await screen.findByText('Cloud diagram')).toBeInTheDocument();
        await user.click(screen.getByText('Cloud diagram'));
        await user.click(
            screen.getByRole('button', { name: 'open_diagram_dialog.open' })
        );

        expect(screen.getByTestId('diagram-location')).toHaveTextContent(
            'online:12'
        );
        expect(navigate).toHaveBeenCalledWith('/diagrams/12');
    });
});
