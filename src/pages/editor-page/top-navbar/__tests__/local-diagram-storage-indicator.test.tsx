import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { LocalDiagramStorageIndicator } from '../local-diagram-storage-indicator';

const renderIndicator = (location: DiagramLocation | null) =>
    render(
        <DiagramLocationProvider initialLocation={location}>
            <TooltipProvider>
                <LocalDiagramStorageIndicator />
            </TooltipProvider>
        </DiagramLocationProvider>
    );

describe('LocalDiagramStorageIndicator', () => {
    it('shows On this device for an explicit device location', () => {
        renderIndicator(deviceDiagramLocation('local-diagram-abc'));

        expect(
            screen.getByLabelText('open_diagram_dialog.tabs.device')
        ).toBeInTheDocument();
    });

    it('shows the device indicator even when the id is numeric', () => {
        renderIndicator(deviceDiagramLocation('42'));

        expect(
            screen.getByLabelText('open_diagram_dialog.tabs.device')
        ).toBeInTheDocument();
    });

    it('does not show the device indicator for an online location', () => {
        renderIndicator(onlineDiagramLocation('42'));

        expect(
            screen.queryByLabelText('open_diagram_dialog.tabs.device')
        ).not.toBeInTheDocument();
    });

    it('does not show the device indicator for a non-numeric online id', () => {
        renderIndicator(onlineDiagramLocation('not-numeric'));

        expect(
            screen.queryByLabelText('open_diagram_dialog.tabs.device')
        ).not.toBeInTheDocument();
    });
});
