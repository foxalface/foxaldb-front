import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { useParams } from 'react-router-dom';

/**
 * Returns whether diagram sharing is available for the current editor scope.
 */
export const useShareAvailability = (): boolean => {
    const { diagramId } = useParams<{ diagramId: string }>();
    const { isAuthenticated } = useAuth();
    const { diagramAccess } = useDiagramAccess();

    return (
        isAuthenticated &&
        diagramId !== undefined &&
        isValidBackendDiagramId(diagramId) &&
        diagramAccess?.can_manage_members === true
    );
};
