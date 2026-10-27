import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
} from '@/lib/diagram/diagram-location';

const LocationProbe: React.FC<{
    next?:
        | ReturnType<typeof deviceDiagramLocation>
        | ReturnType<typeof onlineDiagramLocation>;
}> = ({ next }) => {
    const { location, setDiagramLocation } = useDiagramLocation();

    useEffect(() => {
        if (next) {
            setDiagramLocation(next);
        }
    }, [next, setDiagramLocation]);

    return (
        <span data-testid="location">
            {location === null
                ? 'none'
                : `${location.type}:${'localId' in location ? location.localId : location.diagramId}`}
        </span>
    );
};

describe('DiagramLocationProvider', () => {
    it('keeps a device location until an explicit open replaces it', () => {
        const { rerender } = render(
            <DiagramLocationProvider>
                <LocationProbe next={deviceDiagramLocation('local-1')} />
            </DiagramLocationProvider>
        );

        expect(screen.getByTestId('location')).toHaveTextContent(
            'device:local-1'
        );

        rerender(
            <DiagramLocationProvider>
                <LocationProbe next={deviceDiagramLocation('local-1')} />
            </DiagramLocationProvider>
        );

        expect(screen.getByTestId('location')).toHaveTextContent(
            'device:local-1'
        );
    });

    it('replaces location only when a different diagram is opened', () => {
        const { rerender } = render(
            <DiagramLocationProvider
                initialLocation={deviceDiagramLocation('local-1')}
            >
                <LocationProbe />
            </DiagramLocationProvider>
        );

        expect(screen.getByTestId('location')).toHaveTextContent(
            'device:local-1'
        );

        rerender(
            <DiagramLocationProvider
                initialLocation={deviceDiagramLocation('local-1')}
            >
                <LocationProbe next={onlineDiagramLocation('9')} />
            </DiagramLocationProvider>
        );

        expect(screen.getByTestId('location')).toHaveTextContent('online:9');
    });
});
