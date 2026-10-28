import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalDiagramRowActionsMenu } from '../local-diagram-row-actions-menu';
import {
    deviceDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';

const navigate = vi.fn();
const deleteLocalDiagram = vi.fn();
const deleteStoredDiagram = vi.fn();
const setDiagramLocation = vi.fn();
const showAlert = vi.fn();
const onListChanged = vi.fn();

const chartDbState = {
    diagramId: 'local-1',
};

const locationState: { location: DiagramLocation | null } = {
    location: deviceDiagramLocation('local-1'),
};

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: chartDbState.diagramId,
        deleteDiagram: (...args: unknown[]) => deleteLocalDiagram(...args),
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: locationState.location,
        setDiagramLocation,
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        getDiagram: vi.fn(),
        listDiagrams: vi.fn(),
        addDiagram: vi.fn(),
        deleteDiagram: (...args: unknown[]) => deleteStoredDiagram(...args),
    }),
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        updateConfig: vi.fn(),
    }),
}));

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({
        showAlert,
    }),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-request-authentication', () => ({
    useRequestAuthentication: () => vi.fn(),
}));

describe('LocalDiagramRowActionsMenu delete', () => {
    beforeEach(() => {
        navigate.mockReset();
        deleteLocalDiagram.mockReset();
        deleteStoredDiagram.mockReset();
        setDiagramLocation.mockReset();
        showAlert.mockReset();
        onListChanged.mockReset();
        chartDbState.diagramId = 'local-1';
        locationState.location = deviceDiagramLocation('local-1');
        deleteLocalDiagram.mockResolvedValue(undefined);
        deleteStoredDiagram.mockResolvedValue(undefined);
        onListChanged.mockResolvedValue(undefined);
        setDiagramLocation.mockImplementation(
            (next: DiagramLocation | null) => {
                locationState.location = next;
            }
        );
    });

    const confirmDelete = async (diagramId: string, localCount: number) => {
        render(
            <LocalDiagramRowActionsMenu
                diagramId={diagramId}
                isAuthenticated
                onOpen={vi.fn()}
                onListChanged={onListChanged}
                numberOfLocalDiagrams={localCount}
            />
        );

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(
            screen.getByText('open_diagram_dialog.diagram_actions.delete')
        );

        const alertConfig = showAlert.mock.calls.at(-1)?.[0] as {
            onAction: () => Promise<void>;
        };

        await act(async () => {
            await alertConfig.onAction();
        });
    };

    it('clears DiagramLocation when the active device row is deleted', async () => {
        await confirmDelete('local-1', 2);

        expect(deleteLocalDiagram).toHaveBeenCalledTimes(1);
        expect(deleteStoredDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).toHaveBeenCalledWith(null);
        expect(locationState.location).toBeNull();
        expect(navigate).toHaveBeenCalledWith('/');
    });

    it('leaves DiagramLocation unchanged when another device row is deleted', async () => {
        await confirmDelete('local-2', 2);

        expect(deleteStoredDiagram).toHaveBeenCalledWith('local-2');
        expect(deleteLocalDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(locationState.location).toEqual(
            deviceDiagramLocation('local-1')
        );
        expect(navigate).not.toHaveBeenCalled();
    });
});
