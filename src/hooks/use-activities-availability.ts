import { useAuth } from '@/hooks/use-auth';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { useParams } from 'react-router-dom';

/**
 * Returns whether diagram activity history is available for the current editor scope.
 */
export const useActivitiesAvailability = (): boolean => {
    const { diagramId } = useParams<{ diagramId: string }>();
    const { isAuthenticated } = useAuth();

    return (
        isAuthenticated &&
        diagramId !== undefined &&
        isValidBackendDiagramId(diagramId)
    );
};
