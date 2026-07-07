import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import { RemoteEditingContext } from '@/context/remote-editing-context/remote-editing-context';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    editingReducer,
    initialRemoteEditingState,
    type RemoteEditingState,
} from '@/lib/realtime/editing-reducer';
import type { EditingEntityType } from '@/lib/realtime/editing-types';
import {
    buildEditingByEntity,
    shouldRemoveStaleEditing,
    toEditingEntityKey,
    type EditingByEntity,
    type RemoteEditingViewModel,
} from '@/lib/realtime/editing-utils';
import { useContext, useEffect, useMemo, useReducer, useRef } from 'react';

export type { RemoteEditingViewModel, EditingByEntity };

// Stable references so consumers that read "no editors" never receive a fresh
// array/map identity on every render (avoids the M17.4 update-depth issue).
export const EMPTY_REMOTE_EDITORS: RemoteEditingViewModel[] = [];

const EMPTY_EDITING_BY_ENTITY: EditingByEntity = new Map();

// Editing whispers are sent once per focus change (no heartbeat), so we sweep
// for entries whose last snapshot is older than the stale window as a safety
// net for dropped blur/clear messages.
const STALE_SWEEP_INTERVAL_MS = 500;

export interface UseRemoteEditingResult {
    isEditingActive: boolean;
    editingByEntity: EditingByEntity;
}

export const useRemoteEditing = (): UseRemoteEditingResult => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { presence, subscribeToEditingActions } = useRealtime();
    const [remoteEditing, dispatch] = useReducer(
        editingReducer,
        undefined,
        initialRemoteEditingState
    );

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isEditingActive =
        !isLoading &&
        isAuthenticated &&
        diagramId !== null &&
        user !== null &&
        presence.status === 'active';

    const remoteEditingRef = useRef<RemoteEditingState>(remoteEditing);
    remoteEditingRef.current = remoteEditing;

    useEffect(() => {
        if (!isEditingActive) {
            return;
        }

        return subscribeToEditingActions(dispatch);
    }, [isEditingActive, subscribeToEditingActions]);

    useEffect(() => {
        if (!isEditingActive) {
            dispatch({ type: 'CLEAR' });
            return;
        }

        const presenceIds = new Set(presence.members.keys());

        for (const userId of remoteEditingRef.current.keys()) {
            if (!presenceIds.has(userId)) {
                dispatch({ type: 'REMOVE', userId });
            }
        }
    }, [isEditingActive, presence.members]);

    useEffect(() => {
        if (!isEditingActive) {
            return;
        }

        const intervalId = window.setInterval(() => {
            const now = Date.now();

            for (const [userId, editing] of remoteEditingRef.current) {
                if (shouldRemoveStaleEditing(editing.receivedAt, now)) {
                    // REMOVE is a no-op (same state reference) when nothing is
                    // stale, so this sweep cannot trigger an update loop.
                    dispatch({ type: 'REMOVE', userId });
                }
            }
        }, STALE_SWEEP_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [isEditingActive]);

    const editingByEntity = useMemo(() => {
        if (!isEditingActive || user === null) {
            return EMPTY_EDITING_BY_ENTITY;
        }

        return buildEditingByEntity(remoteEditing, {
            selfUserId: user.id,
            presenceMembers: presence.members,
            knownPresenceUserIds: new Set(presence.members.keys()),
            now: Date.now(),
        });
    }, [isEditingActive, presence.members, remoteEditing, user]);

    return {
        isEditingActive,
        editingByEntity,
    };
};

export const useEntityRemoteEditing = (
    entityType: EditingEntityType,
    entityId: string
): RemoteEditingViewModel[] => {
    const context = useContext(RemoteEditingContext);

    if (context === null) {
        return EMPTY_REMOTE_EDITORS;
    }

    const entityKey = toEditingEntityKey(entityType, entityId);

    return context.editingByEntity.get(entityKey) ?? EMPTY_REMOTE_EDITORS;
};
