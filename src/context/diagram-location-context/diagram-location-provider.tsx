import React, { useCallback, useMemo, useState } from 'react';
import type { DiagramLocation } from '@/lib/diagram/diagram-location';
import { diagramLocationContext } from './diagram-location-context';

interface DiagramLocationProviderProps {
    /**
     * Mount value only. Production starts at null so hard reload reconstructs
     * location in entry resolution instead of trusting the route id.
     */
    initialLocation?: DiagramLocation | null;
}

export const DiagramLocationProvider: React.FC<
    React.PropsWithChildren<DiagramLocationProviderProps>
> = ({ children, initialLocation = null }) => {
    const [location, setLocation] = useState<DiagramLocation | null>(
        initialLocation
    );

    const setDiagramLocation = useCallback(
        (nextLocation: DiagramLocation | null) => {
            setLocation(nextLocation);
        },
        []
    );

    const value = useMemo(
        () => ({
            location,
            setDiagramLocation,
        }),
        [location, setDiagramLocation]
    );

    return (
        <diagramLocationContext.Provider value={value}>
            {children}
        </diagramLocationContext.Provider>
    );
};
