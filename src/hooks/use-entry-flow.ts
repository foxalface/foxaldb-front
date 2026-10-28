import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useEntryFlowGuestResolution } from '@/hooks/use-entry-flow-guest-resolution';
import { useEntryFlowAuthenticatedResolution } from '@/hooks/use-entry-flow-authenticated-resolution';
import type { Diagram } from '@/lib/domain/diagram';
import {
    entryFlowReducer,
    initialEntryFlowState,
    selectEntryFlowBlocking,
    selectEntryFlowDialog,
    selectEntryFlowReady,
    selectEntryFlowRemoteDiagramSummaries,
    type EntryFlowDialog,
    type EntryFlowEvent,
    type EntryFlowState,
    type RemoteDiagramSummary,
} from '@/lib/entry-flow';
import { useEntryFlowRouteAuthIntent } from '@/hooks/use-entry-flow-route-auth-intent';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';

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
    remoteDiagramSummaries: RemoteDiagramSummary[] | undefined;
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
    cancelRemoteDiagramSelection: () => void;
    requestRemoteDiagramCreate: () => void;
    notifyDiagramCreated: (diagramId: string) => void;
    notifyDiagramOpened: () => void;
    notifyDiagramOpenFailed: (messageKey?: string) => void;
    notifyGuestActiveDiagramDeleted: () => void;
    /**
     * Continuation-owner transitions. Production calls come only from
     * useAuthIntentContinuation. They do not themselves change DiagramLocation.
     */
    showOnlineListFromAuthContinuation: () => void;
    openOnlineDiagramFromAuthContinuation: (diagramId: string) => void;
    openDeviceDiagramFromAuthContinuation: (diagramId: string) => void;
    retry: () => void;
    reset: () => void;
    notifyDeviceSessionEnded: () => void;
    notifyOnlineSessionEnded: () => void;
    notifyUnscopedSessionEnded: () => void;
}

/**
 * Single entry-flow orchestrator for editor startup.
 * Owns the pure reducer; side effects live in guest/authenticated resolution hooks.
 *
 * Current diagram location is not stored here. Resolution hooks write
 * DiagramLocationProvider, which is the only location state. Login and logout
 * events must not recompute device vs online from auth.
 *
 * Post-auth behavior is not executed here. AuthIntentProvider exposes
 * lastConsumedIntent; useAuthIntentContinuation is the only continuation owner.
 * A guest → authenticated transition while the editor is already ready does
 * not change this state machine.
 *
 * Auth loss does not dispatch from here. useSessionEndOrchestrator is the
 * only owner of logout and session-expiry diagram and navigation effects.
 * It calls notifyDeviceSessionEnded, notifyOnlineSessionEnded, or
 * notifyUnscopedSessionEnded after branching on DiagramLocation.
 */
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
     * Later logout and session expiry are owned by useSessionEndOrchestrator.
     * A guest who logs in while a diagram is already open does not dispatch
     * here: storage stays put, and useAuthIntentContinuation applies the
     * consumed intent. Startup login still calls notifyAuthenticationSucceeded,
     * which only leaves the guest gate.
     */
    useEffect(() => {
        if (isLoading || sessionResolvedRef.current) {
            return;
        }

        sessionResolvedRef.current = true;
        previousRouteDiagramIdRef.current = routeDiagramId;

        if (isAuthenticated) {
            dispatchEvent({
                type: 'SESSION_AUTHENTICATED',
                routeDiagramId,
            });
            return;
        }

        const requestedDeviceDiagramId =
            routeDiagramId !== undefined &&
            !isValidBackendDiagramId(routeDiagramId)
                ? routeDiagramId
                : undefined;

        dispatchEvent({
            type: 'SESSION_UNAUTHENTICATED',
            routeDiagramId,
            requestedDeviceDiagramId,
        });
    }, [isLoading, isAuthenticated, user?.id, routeDiagramId, dispatchEvent]);

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

    const showOnlineListFromAuthContinuation = useCallback(() => {
        invalidateResolution();
        dispatchEvent({ type: 'AUTH_CONTINUATION_SHOW_ONLINE_LIST' });
    }, [dispatchEvent, invalidateResolution]);

    const openOnlineDiagramFromAuthContinuation = useCallback(
        (diagramId: string) => {
            invalidateResolution();
            dispatchEvent({
                type: 'AUTH_CONTINUATION_OPEN_ONLINE_DIAGRAM',
                diagramId,
            });
        },
        [dispatchEvent, invalidateResolution]
    );

    const openDeviceDiagramFromAuthContinuation = useCallback(
        (diagramId: string) => {
            invalidateResolution();
            dispatchEvent({
                type: 'AUTH_CONTINUATION_OPEN_DEVICE_DIAGRAM',
                diagramId,
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

    const cancelRemoteDiagramSelection = useCallback(() => {
        dispatchEvent({ type: 'REMOTE_DIAGRAM_SELECTION_CANCELLED' });
    }, [dispatchEvent]);

    const requestRemoteDiagramCreate = useCallback(() => {
        dispatchEvent({ type: 'REMOTE_DIAGRAM_CREATE_REQUESTED' });
    }, [dispatchEvent]);

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

    const retry = useCallback(() => {
        dispatchEvent({ type: 'RETRY' });
    }, [dispatchEvent]);

    const reset = useCallback(() => {
        invalidateResolution();
        dispatchEvent({ type: 'RESET' });
    }, [dispatchEvent, invalidateResolution]);

    const notifyDeviceSessionEnded = useCallback(() => {
        invalidateResolution();
        dispatchEvent({ type: 'DEVICE_SESSION_ENDED' });
    }, [dispatchEvent, invalidateResolution]);

    const notifyOnlineSessionEnded = useCallback(() => {
        invalidateResolution();
        dispatchEvent({ type: 'ONLINE_SESSION_ENDED' });
    }, [dispatchEvent, invalidateResolution]);

    const notifyUnscopedSessionEnded = useCallback(() => {
        invalidateResolution();
        dispatchEvent({ type: 'UNSCOPED_SESSION_ENDED' });
    }, [dispatchEvent, invalidateResolution]);

    const dialog = selectEntryFlowDialog(state);
    const isBlocking = selectEntryFlowBlocking(state);
    const isReady = selectEntryFlowReady(state);
    const remoteDiagramSummaries = selectEntryFlowRemoteDiagramSummaries(state);

    useEntryFlowRouteAuthIntent(
        routeDiagramId,
        isAuthenticated,
        isLoading,
        state.kind
    );

    const { guestInitialDiagram } = useEntryFlowGuestResolution({
        state,
        isAuthenticated,
        isAuthLoading: isLoading,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
    });

    const { authenticatedInitialDiagram } = useEntryFlowAuthenticatedResolution(
        {
            state,
            isAuthenticated,
            isAuthLoading: isLoading,
            routeDiagramId,
            beginResolution,
            isResolutionCurrent,
            dispatchEvent,
        }
    );

    const initialDiagram = isAuthenticated
        ? authenticatedInitialDiagram
        : guestInitialDiagram;

    return {
        state,
        dialog,
        isBlocking,
        isReady,
        remoteDiagramSummaries,
        initialDiagram,
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
        cancelRemoteDiagramSelection,
        requestRemoteDiagramCreate,
        notifyDiagramCreated,
        notifyDiagramOpened,
        notifyDiagramOpenFailed,
        notifyGuestActiveDiagramDeleted,
        showOnlineListFromAuthContinuation,
        openOnlineDiagramFromAuthContinuation,
        openDeviceDiagramFromAuthContinuation,
        retry,
        reset,
        notifyDeviceSessionEnded,
        notifyOnlineSessionEnded,
        notifyUnscopedSessionEnded,
    };
};
