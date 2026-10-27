import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import { readOnlineDiagramId } from '@/lib/diagram/diagram-location';
import { useParams } from 'react-router-dom';

/**
 * Returns whether diagram sharing is available for the current editor scope.
 */
export const useShareAvailability = (): boolean => {
    const { diagramId } = useParams<{ diagramId: string }>();
    const { isAuthenticated } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const { location } = useDiagramLocation();

    return (
        isAuthenticated &&
        readOnlineDiagramId(location, diagramId) !== null &&
        diagramAccess?.can_manage_members === true
    );
};
