import { useContext } from 'react';
import { diagramLocationContext } from '@/context/diagram-location-context/diagram-location-context';
import { useChartDB } from '@/hooks/use-chartdb';
import { readOnlineDiagramId } from '@/lib/diagram/diagram-location';

export const useDiagramLocation = () => useContext(diagramLocationContext);

/**
 * Backend diagram id when the open diagram's location is online.
 * Device diagrams return null even if the user is authenticated.
 */
export const useOnlineDiagramId = (): string | null => {
    const { location } = useDiagramLocation();
    const { currentDiagram } = useChartDB();

    return readOnlineDiagramId(location, currentDiagram?.id);
};
