import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useEntryFlowGuestResolution } from '@/hooks/use-entry-flow-guest-resolution';
import type { Diagram } from '@/lib/domain/diagram';
import {
    entryFlowReducer,
    initialEntryFlowState,
    selectEntryFlowAllowsLegacyAuthenticatedLoader,
    selectEntryFlowBlocking,
    selectEntryFlowDialog,
    selectEntryFlowReady,
    type EntryFlowDialog,
    type EntryFlowEvent,
    type EntryFlowState,
    type RemoteDiagramSummary,
} from '@/lib/entry-flow';
import { useEntryFlowGuestMigration } from '@/hooks/use-entry-flow-guest-migration';

const normalizeRouteDiagramId = (
    diagramId: string | undefined
): string | undefined => {
    if (diagramId === undefined || diagramId === '') {
        return undefined;
    }

    return diagramId;
};

export interface UseEntryFlowResult {
    state: EntryFlowState;
    dialog: EntryFlowDialog;
    isBlocking: boolean;
    isReady: boolean;
    allowsLegacyAuthenticatedLoader: boolean;
    initialDiagram: Diagram | undefined;
    beginResolution: () => number;
    isResolutionCurrent: (token: number) => boolean;
    invalidateResolution: () => void;
    continueAsGuest: () => void;
    notifyAuthenticationSucceeded: (source: 'login' | 'registration') => void;
    notifyLocalDiagramFound: (diagramId: string) => void;
    notifyLocalDiagramNotFound: () => void;
    notifyLocalDiagramCheckFailed: (messageKey?: string) => void;
    notifyRemoteDiagramsFound: (diagrams: RemoteDiagramSummary[]) => void;
    notifyNoRemoteDiagrams: () => void;
    notifyRemoteDiagramsLoadFailed: (messageKey?: string) => void;
    notifyRemoteDiagramSelected: (diagramId: string) => void;
    notifyDiagramCreated: (diagramId: string) => void;
    notifyDiagramOpened: () => void;
    notifyDiagramOpenFailed: (messageKey?: string) => void;
    notifyGuestActiveDiagramDeleted: () => void;
    notifyGuestMigrationLocalNotFound: () => void;
    acceptGuestMigration: () => void;
    declineGuestMigration: () => void;
    retry: () => void;
    reset: () => void;
    notifyLoggedOut: () => void;
}

export const useEntryFlow = (): UseEntryFlowResult => {
    const [state, dispatch] = useReducer(
        entryFlowReducer,
        undefined,
        initialEntryFlowState
    );
    const { user, isAuthenticated, isLoading } = useAuth();
    const { diagramId: routeDiagramIdParam } = useParams<{
        diagramId?: string;
    }>();
    const routeDiagramId = normalizeRouteDiagramId(routeDiagramIdParam);

    const sessionResolvedRef = useRef(false);
    const previousUserIdRef = useRef<number | null | undefined>(undefined);
    const previousRouteDiagramIdRef = useRef<string | undefined>(undefined);
    const resolutionGenerationRef = useRef(0);

    const bumpResolutionGeneration = useCallback((): number => {
        resolutionGenerationRef.current += 1;
        return resolutionGenerationRef.current;
    }, []);

    /** Invalidates all in-flight resolutions without issuing a new operation token. */
    const invalidateResolution = useCallback(() => {
        bumpResolutionGeneration();
    }, [bumpResolutionGeneration]);

    /**
     * Starts a new resolution epoch: increments the generation and returns the
     * token for this operation. Any prior beginResolution token becomes stale.
     */
    const beginResolution = useCallback((): number => {
        return bumpResolutionGeneration();
    }, [bumpResolutionGeneration]);

    const isResolutionCurrent = useCallback((token: number): boolean => {
        return token === resolutionGenerationRef.current;
    }, []);

    const dispatchEvent = useCallback((event: EntryFlowEvent) => {
        dispatch(event);
    }, []);

    /**
     * Initial session restoration runs once per mount after auth loading completes.
     * Later auth transitions use LOGGED_OUT or explicit notifyAuthenticationSucceeded.
     */
    useEffect(() => {
        if (isLoading) {
            return;
        }

        const userId = user?.id ?? null;

        if (!sessionResolvedRef.current) {
            sessionResolvedRef.current = true;
            previousUserIdRef.current = userId;
            previousRouteDiagramIdRef.current = routeDiagramId;

            if (isAuthenticated) {
                dispatchEvent({
                    type: 'SESSION_AUTHENTICATED',
                    routeDiagramId,
                });
            } else {
                dispatchEvent({
                    type: 'SESSION_UNAUTHENTICATED',
                    routeDiagramId,
                });
            }

            return;
        }

        const previousUserId = previousUserIdRef.current;

        if (
            previousUserId === null &&
            userId !== null &&
            sessionResolvedRef.current
        ) {
            invalidateResolution();
            dispatchEvent({
                type: 'GUEST_SESSION_AUTHENTICATED',
                entrySource: 'login',
            });
        }

        if (
            previousUserId !== null &&
            previousUserId !== undefined &&
            userId === null
        ) {
            invalidateResolution();
            dispatchEvent({ type: 'LOGGED_OUT' });
        }

        previousUserIdRef.current = userId;
    }, [
        isLoading,
        isAuthenticated,
        user?.id,
        routeDiagramId,
        dispatchEvent,
        invalidateResolution,
    ]);

    /** Invalidate stale opening work when the route diagram identity changes. */
    useEffect(() => {
        if (!sessionResolvedRef.current) {
            return;
        }

        const previousRouteId = previousRouteDiagramIdRef.current;

        if (previousRouteId !== routeDiagramId) {
            invalidateResolution();
            previousRouteDiagramIdRef.current = routeDiagramId;
        }
    }, [routeDiagramId, invalidateResolution]);

    const continueAsGuest = useCallback(() => {
        dispatchEvent({ type: 'CONTINUE_AS_GUEST' });
    }, [dispatchEvent]);

    const notifyAuthenticationSucceeded = useCallback(
        (source: 'login' | 'registration') => {
            invalidateResolution();
            dispatchEvent({
                type: 'AUTHENTICATION_SUCCEEDED',
                entrySource: source,
            });
        },
        [dispatchEvent, invalidateResolution]
    );

    const notifyLocalDiagramFound = useCallback(
        (diagramId: string) => {
            dispatchEvent({ type: 'LOCAL_DIAGRAM_FOUND', diagramId });
        },
        [dispatchEvent]
    );

    const notifyLocalDiagramNotFound = useCallback(() => {
        dispatchEvent({ type: 'LOCAL_DIAGRAM_NOT_FOUND' });
    }, [dispatchEvent]);

    const notifyLocalDiagramCheckFailed = useCallback(
        (messageKey?: string) => {
            dispatchEvent({
                type: 'LOCAL_DIAGRAM_CHECK_FAILED',
                messageKey,
            });
        },
        [dispatchEvent]
    );

    const notifyRemoteDiagramsFound = useCallback(
        (diagrams: RemoteDiagramSummary[]) => {
            dispatchEvent({ type: 'REMOTE_DIAGRAMS_FOUND', diagrams });
        },
        [dispatchEvent]
    );

    const notifyNoRemoteDiagrams = useCallback(() => {
        dispatchEvent({ type: 'NO_REMOTE_DIAGRAMS' });
    }, [dispatchEvent]);

    const notifyRemoteDiagramsLoadFailed = useCallback(
        (messageKey?: string) => {
            dispatchEvent({
                type: 'REMOTE_DIAGRAMS_LOAD_FAILED',
                messageKey,
            });
        },
        [dispatchEvent]
    );

    const notifyRemoteDiagramSelected = useCallback(
        (diagramId: string) => {
            dispatchEvent({ type: 'REMOTE_DIAGRAM_SELECTED', diagramId });
        },
        [dispatchEvent]
    );

    const notifyDiagramCreated = useCallback(
        (diagramId: string) => {
            dispatchEvent({ type: 'DIAGRAM_CREATED', diagramId });
        },
        [dispatchEvent]
    );

    const notifyDiagramOpened = useCallback(() => {
        dispatchEvent({ type: 'DIAGRAM_OPENED' });
    }, [dispatchEvent]);

    const notifyDiagramOpenFailed = useCallback(
        (messageKey?: string) => {
            dispatchEvent({ type: 'DIAGRAM_OPEN_FAILED', messageKey });
        },
        [dispatchEvent]
    );

    const notifyGuestActiveDiagramDeleted = useCallback(() => {
        invalidateResolution();
        dispatchEvent({ type: 'GUEST_ACTIVE_DIAGRAM_DELETED' });
    }, [dispatchEvent, invalidateResolution]);

    const notifyGuestMigrationLocalNotFound = useCallback(() => {
        dispatchEvent({ type: 'GUEST_MIGRATION_LOCAL_NOT_FOUND' });
    }, [dispatchEvent]);

    const acceptGuestMigration = useCallback(() => {
        dispatchEvent({ type: 'GUEST_MIGRATION_ACCEPTED' });
    }, [dispatchEvent]);

    const declineGuestMigration = useCallback(() => {
        dispatchEvent({ type: 'GUEST_MIGRATION_DECLINED' });
    }, [dispatchEvent]);

    const retry = useCallback(() => {
        dispatchEvent({ type: 'RETRY' });
    }, [dispatchEvent]);

    const reset = useCallback(() => {
        invalidateResolution();
        dispatchEvent({ type: 'RESET' });
    }, [dispatchEvent, invalidateResolution]);

    const notifyLoggedOut = useCallback(() => {
        invalidateResolution();
        dispatchEvent({ type: 'LOGGED_OUT' });
    }, [dispatchEvent, invalidateResolution]);

    const dialog = selectEntryFlowDialog(state);
    const isBlocking = selectEntryFlowBlocking(state);
    const isReady = selectEntryFlowReady(state);
    const allowsLegacyAuthenticatedLoader =
        selectEntryFlowAllowsLegacyAuthenticatedLoader(state);

    const { guestInitialDiagram } = useEntryFlowGuestResolution({
        state,
        isAuthenticated,
        isAuthLoading: isLoading,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
    });

    useEntryFlowGuestMigration({
        state,
        isAuthenticated,
        isAuthLoading: isLoading,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
    });

    return {
        state,
        dialog,
        isBlocking,
        isReady,
        allowsLegacyAuthenticatedLoader,
        initialDiagram: guestInitialDiagram,
        beginResolution,
        isResolutionCurrent,
        invalidateResolution,
        continueAsGuest,
        notifyAuthenticationSucceeded,
        notifyLocalDiagramFound,
        notifyLocalDiagramNotFound,
        notifyLocalDiagramCheckFailed,
        notifyRemoteDiagramsFound,
        notifyNoRemoteDiagrams,
        notifyRemoteDiagramsLoadFailed,
        notifyRemoteDiagramSelected,
        notifyDiagramCreated,
        notifyDiagramOpened,
        notifyDiagramOpenFailed,
        notifyGuestActiveDiagramDeleted,
        notifyGuestMigrationLocalNotFound,
        acceptGuestMigration,
        declineGuestMigration,
        retry,
        reset,
        notifyLoggedOut,
    };
};
