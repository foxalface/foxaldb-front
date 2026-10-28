import { useEffect, useRef } from 'react';
import { useAuthIntent } from '@/hooks/use-auth-intent';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { EntryFlowState } from '@/lib/entry-flow';

/**
 * Guest direct online diagram URLs: preserve diagram id as auth continuation
 * without fetching the backend diagram while unauthenticated.
 */
export const useEntryFlowRouteAuthIntent = (
    routeDiagramId: string | undefined,
    isAuthenticated: boolean,
    isAuthLoading: boolean,
    stateKind: EntryFlowState['kind']
): void => {
    const { setAuthIntent } = useAuthIntent();
    const episodeRef = useRef<string | null>(null);

    useEffect(() => {
        if (isAuthLoading || isAuthenticated) {
            episodeRef.current = null;
            return;
        }

        if (stateKind !== 'awaitingGuestChoice') {
            return;
        }

        if (
            routeDiagramId === undefined ||
            routeDiagramId === '' ||
            !isValidBackendDiagramId(routeDiagramId)
        ) {
            episodeRef.current = null;
            return;
        }

        const episodeKey = routeDiagramId;
        if (episodeRef.current === episodeKey) {
            return;
        }

        episodeRef.current = episodeKey;
        setAuthIntent({
            type: 'open-online-diagram',
            diagramId: String(routeDiagramId),
        });
    }, [
        routeDiagramId,
        isAuthenticated,
        isAuthLoading,
        stateKind,
        setAuthIntent,
    ]);
};
