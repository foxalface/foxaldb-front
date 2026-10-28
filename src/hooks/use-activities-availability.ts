import { useAuth } from '@/hooks/use-auth';
import { useOnlineDiagramId } from '@/hooks/use-diagram-location';

/**
 * Returns whether diagram activity history is available for the current editor scope.
 */
export const useActivitiesAvailability = (): boolean => {
    const { isAuthenticated } = useAuth();
    const onlineDiagramId = useOnlineDiagramId();

    return isAuthenticated && onlineDiagramId !== null;
};
