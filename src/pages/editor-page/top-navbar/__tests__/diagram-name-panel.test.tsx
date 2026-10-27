import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
} from '@/lib/diagram/diagram-location';
import { DiagramNamePanel } from '../diagram-name-panel';

const chartDbState = {
    diagramName: 'My diagram',
    currentDiagram: {
        id: 'local-diagram-1',
        name: 'My diagram',
        databaseType: 'generic' as const,
    },
};

const updateDiagramName = vi.fn();

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramName: chartDbState.diagramName,
        updateDiagramName,
        currentDiagram: chartDbState.currentDiagram,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openOpenDiagramDialog: vi.fn(),
    }),
}));

const renderPanel = (
    location:
        | ReturnType<typeof deviceDiagramLocation>
        | ReturnType<typeof onlineDiagramLocation>
) =>
    render(
        <DiagramLocationProvider initialLocation={location}>
            <TooltipProvider>
                <DiagramNamePanel />
            </TooltipProvider>
        </DiagramLocationProvider>
    );

describe('DiagramNamePanel', () => {
    beforeEach(() => {
        chartDbState.diagramName = 'My diagram';
        chartDbState.currentDiagram = {
            id: 'local-diagram-1',
            name: 'My diagram',
            databaseType: 'generic',
        };
        updateDiagramName.mockClear();
    });

    it('shows local storage indicator beside the title for device diagrams', () => {
        renderPanel(deviceDiagramLocation('local-diagram-1'));

        expect(
            screen.getByRole('heading', { name: 'My diagram' })
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('open_diagram_dialog.tabs.device')
        ).toBeInTheDocument();
    });

    it('hides local storage indicator for online diagrams', () => {
        renderPanel(onlineDiagramLocation('99'));

        expect(
            screen.queryByLabelText('open_diagram_dialog.tabs.device')
        ).not.toBeInTheDocument();
    });

    it('keeps title edit control available for device diagrams', async () => {
        const user = userEvent.setup();
        renderPanel(deviceDiagramLocation('local-diagram-1'));

        const pencilButtons = screen
            .getAllByRole('button')
            .filter((button) => button.querySelector('.lucide-pencil'));

        expect(pencilButtons.length).toBeGreaterThan(0);

        await user.click(pencilButtons[0]);

        expect(screen.getByDisplayValue('My diagram')).toBeInTheDocument();
    });
});
