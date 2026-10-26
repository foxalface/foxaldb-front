import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { LocalDiagramStorageIndicator } from '../local-diagram-storage-indicator';

const chartDbState = {
    currentDiagram: {
        id: 'local-diagram-abc',
        name: 'Local diagram',
        databaseType: 'generic' as const,
    },
};

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
    }),
}));

const renderIndicator = () =>
    render(
        <TooltipProvider>
            <LocalDiagramStorageIndicator />
        </TooltipProvider>
    );

describe('LocalDiagramStorageIndicator', () => {
    beforeEach(() => {
        chartDbState.currentDiagram = {
            id: 'local-diagram-abc',
            name: 'Local diagram',
            databaseType: 'generic',
        };
    });

    it('renders device indicator for local diagram ids', () => {
        renderIndicator();

        expect(
            screen.getByLabelText('open_diagram_dialog.tabs.device')
        ).toBeInTheDocument();
    });

    it('does not render for backend diagram ids', () => {
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Online diagram',
            databaseType: 'generic',
        };

        renderIndicator();

        expect(
            screen.queryByLabelText('open_diagram_dialog.tabs.device')
        ).not.toBeInTheDocument();
    });

    it('still renders for local diagram when user is authenticated', () => {
        chartDbState.currentDiagram = {
            id: 'guest-copy-1',
            name: 'Device copy',
            databaseType: 'generic',
        };

        renderIndicator();

        expect(
            screen.getByLabelText('open_diagram_dialog.tabs.device')
        ).toBeInTheDocument();
    });

    it('does not render for online diagram regardless of numeric string id', () => {
        chartDbState.currentDiagram = {
            id: '1001',
            name: 'Backend diagram',
            databaseType: 'generic',
        };

        renderIndicator();

        expect(
            screen.queryByLabelText('open_diagram_dialog.tabs.device')
        ).not.toBeInTheDocument();
    });
});
