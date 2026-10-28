import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useOnlineDiagramId } from '@/hooks/use-diagram-location';

/**
 * Returns whether diagram sharing is available for the current editor scope.
 */
export const useShareAvailability = (): boolean => {
    const { isAuthenticated } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const onlineDiagramId = useOnlineDiagramId();

    return (
        isAuthenticated &&
        onlineDiagramId !== null &&
        diagramAccess?.can_manage_members === true
    );
};
