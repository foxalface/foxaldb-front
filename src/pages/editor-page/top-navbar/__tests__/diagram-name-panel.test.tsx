import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/tooltip/tooltip';
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

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openOpenDiagramDialog: vi.fn(),
    }),
}));

const renderPanel = () =>
    render(
        <TooltipProvider>
            <DiagramNamePanel />
        </TooltipProvider>
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

    it('shows local storage indicator beside the title for local diagrams', () => {
        renderPanel();

        expect(
            screen.getByRole('heading', { name: 'My diagram' })
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('open_diagram_dialog.tabs.device')
        ).toBeInTheDocument();
    });

    it('hides local storage indicator for online diagrams', () => {
        chartDbState.currentDiagram = {
            id: '99',
            name: 'My diagram',
            databaseType: 'generic',
        };

        renderPanel();

        expect(
            screen.queryByLabelText('open_diagram_dialog.tabs.device')
        ).not.toBeInTheDocument();
    });

    it('keeps title edit control available for local diagrams', async () => {
        const user = userEvent.setup();
        renderPanel();

        const pencilButtons = screen
            .getAllByRole('button')
            .filter((button) => button.querySelector('.lucide-pencil'));

        expect(pencilButtons.length).toBeGreaterThan(0);

        await user.click(pencilButtons[0]);

        expect(screen.getByDisplayValue('My diagram')).toBeInTheDocument();
    });
});
