import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import { RemoteSelectionsContext } from '@/context/remote-selections-context/remote-selections-context';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    initialRemoteSelectionsState,
    selectionReducer,
    type RemoteSelectionsState,
} from '@/lib/realtime/selection-reducer';
import {
    buildSelectionsByEntity,
    toEntityKey,
    type RemoteSelectionViewModel,
    type SelectionsByEntity,
} from '@/lib/realtime/selection-utils';
import { useContext, useEffect, useMemo, useReducer, useRef } from 'react';

export type { RemoteSelectionViewModel, SelectionsByEntity };

export const EMPTY_REMOTE_COLLABORATORS: RemoteSelectionViewModel[] = [];

const EMPTY_SELECTIONS_BY_ENTITY: SelectionsByEntity = new Map();

export interface UseRemoteSelectionsResult {
    isSelectionActive: boolean;
    selectionsByEntity: SelectionsByEntity;
}

export const useRemoteSelections = (): UseRemoteSelectionsResult => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { presence, subscribeToSelectionActions } = useRealtime();
    const [remoteSelections, dispatch] = useReducer(
        selectionReducer,
        undefined,
        initialRemoteSelectionsState
    );

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isSelectionActive =
        !isLoading &&
        isAuthenticated &&
        diagramId !== null &&
        user !== null &&
        presence.status === 'active';

    const remoteSelectionsRef = useRef<RemoteSelectionsState>(remoteSelections);
    remoteSelectionsRef.current = remoteSelections;

    useEffect(() => {
        if (!isSelectionActive) {
            return;
        }

        return subscribeToSelectionActions(dispatch);
    }, [isSelectionActive, subscribeToSelectionActions]);

    useEffect(() => {
        if (!isSelectionActive) {
            dispatch({ type: 'CLEAR' });
            return;
        }

        const presenceIds = new Set(presence.members.keys());

        for (const userId of remoteSelectionsRef.current.keys()) {
            if (!presenceIds.has(userId)) {
                dispatch({ type: 'REMOVE', userId });
            }
        }
    }, [isSelectionActive, presence.members]);

    const selectionsByEntity = useMemo(() => {
        if (!isSelectionActive || user === null) {
            return EMPTY_SELECTIONS_BY_ENTITY;
        }

        return buildSelectionsByEntity(remoteSelections, {
            selfUserId: user.id,
            presenceMembers: presence.members,
            knownPresenceUserIds: new Set(presence.members.keys()),
        });
    }, [isSelectionActive, presence.members, remoteSelections, user]);

    return {
        isSelectionActive,
        selectionsByEntity,
    };
};

export const useEntityRemoteSelections = (
    entityType: 'table' | 'relationship',
    entityId: string
): RemoteSelectionViewModel[] => {
    const context = useContext(RemoteSelectionsContext);

    if (context === null) {
        return EMPTY_REMOTE_COLLABORATORS;
    }

    const entityKey = toEntityKey(entityType, entityId);

    return (
        context.selectionsByEntity.get(entityKey) ?? EMPTY_REMOTE_COLLABORATORS
    );
};
