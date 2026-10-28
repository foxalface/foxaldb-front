import type {
    EntryFlowError,
    EntryFlowEvent,
    EntryFlowState,
    EntrySource,
    OpeningDiagramContext,
} from './entry-flow-types';

export const initialEntryFlowState = (): EntryFlowState => ({
    kind: 'restoringSession',
});

const toAwaitingGuestChoice = (): EntryFlowState => ({
    kind: 'awaitingGuestChoice',
});

const toRecoverableError = (
    error: EntryFlowError,
    entrySource: EntrySource,
    openingContext?: OpeningDiagramContext
): EntryFlowState => ({
    kind: 'recoverableError',
    error,
    entrySource,
    openingContext,
});

const toLoadingRemoteDiagrams = (entrySource: EntrySource): EntryFlowState => ({
    kind: 'loadingRemoteDiagrams',
    entrySource,
});

const continuationEntrySource = (state: EntryFlowState): EntrySource => {
    if (
        state.kind === 'resolvingAuthContinuation' ||
        state.kind === 'loadingRemoteDiagrams' ||
        state.kind === 'selectingRemoteDiagram' ||
        state.kind === 'openingDiagram' ||
        state.kind === 'creatingDiagram' ||
        state.kind === 'recoverableError'
    ) {
        return state.entrySource;
    }

    return 'login';
};

const canOpenOnlineDiagramFromContinuation = (state: EntryFlowState): boolean =>
    state.kind === 'resolvingAuthContinuation' ||
    state.kind === 'awaitingGuestChoice' ||
    state.kind === 'ready' ||
    state.kind === 'loadingRemoteDiagrams' ||
    state.kind === 'selectingRemoteDiagram' ||
    state.kind === 'openingDiagram' ||
    state.kind === 'creatingDiagram' ||
    state.kind === 'recoverableError';

export const entryFlowReducer = (
    state: EntryFlowState,
    event: EntryFlowEvent
): EntryFlowState => {
    switch (event.type) {
        /**
         * Reserved for tests and a future explicit full application
         * reinitialization. Not a generic retry mechanism — use RETRY for
         * recoverableError recovery.
         */
        case 'RESET':
            return initialEntryFlowState();

        /**
         * Device diagram stays the open editor. No auth gate and no navigation.
         */
        case 'DEVICE_SESSION_ENDED':
            if (state.kind === 'ready') {
                return state;
            }

            return { kind: 'ready' };

        /**
         * Leave the online diagram and resolve the guest/device entry path.
         * This does not open the startup auth dialog.
         */
        case 'ONLINE_SESSION_ENDED':
        case 'UNSCOPED_SESSION_ENDED':
            if (state.kind === 'checkingLocalDiagram') {
                return state;
            }

            return { kind: 'checkingLocalDiagram' };

        case 'SESSION_AUTHENTICATED':
            if (state.kind !== 'restoringSession') {
                return state;
            }

            if (
                event.routeDiagramId !== undefined &&
                event.routeDiagramId !== ''
            ) {
                return {
                    kind: 'openingDiagram',
                    diagramId: event.routeDiagramId,
                    diagramSource: 'directRoute',
                    entrySource: 'startup',
                };
            }

            return toLoadingRemoteDiagrams('startup');

        case 'SESSION_UNAUTHENTICATED':
            if (state.kind !== 'restoringSession') {
                return state;
            }

            if (
                event.requestedDeviceDiagramId !== undefined &&
                event.requestedDeviceDiagramId !== ''
            ) {
                return {
                    kind: 'awaitingGuestChoice',
                    requestedDeviceDiagramId: event.requestedDeviceDiagramId,
                };
            }

            return toAwaitingGuestChoice();

        case 'SESSION_RESTORE_FAILED':
            if (state.kind !== 'restoringSession') {
                return state;
            }

            return toRecoverableError(
                {
                    kind: 'sessionRestore',
                    messageKey: event.messageKey,
                },
                'startup'
            );

        case 'CONTINUE_AS_GUEST':
            if (state.kind !== 'awaitingGuestChoice') {
                return state;
            }

            if (state.requestedDeviceDiagramId !== undefined) {
                return {
                    kind: 'openingDiagram',
                    diagramId: state.requestedDeviceDiagramId,
                    diagramSource: 'local',
                    entrySource: 'guestContinuation',
                };
            }

            return { kind: 'checkingLocalDiagram' };

        /**
         * Leaves the startup auth gate. Does not migrate, create, or delete
         * a diagram. useAuthIntentContinuation chooses the next state.
         */
        case 'AUTHENTICATION_SUCCEEDED':
            if (state.kind !== 'awaitingGuestChoice') {
                return state;
            }

            return {
                kind: 'resolvingAuthContinuation',
                entrySource: event.entrySource,
                ...(state.requestedDeviceDiagramId !== undefined
                    ? {
                          requestedDeviceDiagramId:
                              state.requestedDeviceDiagramId,
                      }
                    : {}),
            };

        case 'AUTH_CONTINUATION_SHOW_ONLINE_LIST':
            if (
                state.kind !== 'resolvingAuthContinuation' &&
                state.kind !== 'awaitingGuestChoice'
            ) {
                return state;
            }

            return toLoadingRemoteDiagrams(continuationEntrySource(state));

        case 'AUTH_CONTINUATION_OPEN_DEVICE_DIAGRAM':
            if (
                state.kind !== 'resolvingAuthContinuation' &&
                state.kind !== 'awaitingGuestChoice'
            ) {
                return state;
            }

            return {
                kind: 'openingDiagram',
                diagramId: event.diagramId,
                diagramSource: 'directRoute',
                entrySource: continuationEntrySource(state),
            };

        case 'AUTH_CONTINUATION_OPEN_ONLINE_DIAGRAM':
            if (!canOpenOnlineDiagramFromContinuation(state)) {
                return state;
            }

            if (
                state.kind === 'openingDiagram' &&
                state.diagramId === event.diagramId
            ) {
                return state;
            }

            return {
                kind: 'openingDiagram',
                diagramId: event.diagramId,
                diagramSource: 'directRoute',
                entrySource: continuationEntrySource(state),
            };

        case 'LOCAL_DIAGRAM_FOUND':
            if (state.kind !== 'checkingLocalDiagram') {
                return state;
            }

            return {
                kind: 'openingDiagram',
                diagramId: event.diagramId,
                diagramSource: 'local',
                entrySource: 'guestContinuation',
            };

        case 'LOCAL_DIAGRAM_NOT_FOUND':
            if (state.kind !== 'checkingLocalDiagram') {
                return state;
            }

            return {
                kind: 'creatingDiagram',
                entrySource: 'guestContinuation',
            };

        case 'LOCAL_DIAGRAM_CHECK_FAILED':
            if (state.kind !== 'checkingLocalDiagram') {
                return state;
            }

            return toRecoverableError(
                {
                    kind: 'localDiagramCheck',
                    messageKey: event.messageKey,
                },
                'guestContinuation'
            );

        case 'REMOTE_DIAGRAMS_FOUND':
            if (state.kind !== 'loadingRemoteDiagrams') {
                return state;
            }

            return {
                kind: 'selectingRemoteDiagram',
                entrySource: state.entrySource,
                diagrams: event.diagrams,
            };

        case 'NO_REMOTE_DIAGRAMS':
            if (state.kind !== 'loadingRemoteDiagrams') {
                return state;
            }

            return {
                kind: 'creatingDiagram',
                entrySource: state.entrySource,
            };

        case 'REMOTE_DIAGRAMS_LOAD_FAILED':
            if (state.kind !== 'loadingRemoteDiagrams') {
                return state;
            }

            return toRecoverableError(
                {
                    kind: 'remoteDiagramLoad',
                    messageKey: event.messageKey,
                },
                state.entrySource
            );

        case 'REMOTE_DIAGRAM_SELECTED':
            if (state.kind !== 'selectingRemoteDiagram') {
                return state;
            }

            return {
                kind: 'openingDiagram',
                diagramId: event.diagramId,
                diagramSource: 'remote',
                entrySource: state.entrySource,
            };

        case 'REMOTE_DIAGRAM_SELECTION_CANCELLED':
            if (state.kind !== 'selectingRemoteDiagram') {
                return state;
            }

            return toLoadingRemoteDiagrams(state.entrySource);

        case 'REMOTE_DIAGRAM_CREATE_REQUESTED':
            if (state.kind !== 'selectingRemoteDiagram') {
                return state;
            }

            return {
                kind: 'creatingDiagram',
                entrySource: state.entrySource,
            };

        case 'ROUTE_DIAGRAM_REQUESTED':
            if (state.kind !== 'ready') {
                return state;
            }

            return {
                kind: 'openingDiagram',
                diagramId: event.diagramId,
                diagramSource: 'directRoute',
                entrySource: 'startup',
            };

        case 'ACCESS_DENIED_RECOVERY':
            if (
                state.kind !== 'openingDiagram' &&
                state.kind !== 'recoverableError'
            ) {
                return state;
            }

            return toLoadingRemoteDiagrams(state.entrySource);

        case 'DIAGRAM_CREATED':
            if (state.kind !== 'creatingDiagram') {
                return state;
            }

            return {
                kind: 'openingDiagram',
                diagramId: event.diagramId,
                diagramSource: 'created',
                entrySource: state.entrySource,
            };

        case 'DIAGRAM_OPENED':
            if (state.kind !== 'openingDiagram') {
                return state;
            }

            return { kind: 'ready' };

        case 'DIAGRAM_OPEN_FAILED':
            if (state.kind !== 'openingDiagram') {
                return state;
            }

            return toRecoverableError(
                {
                    kind: 'diagramOpen',
                    messageKey: event.messageKey,
                },
                state.entrySource,
                {
                    diagramId: state.diagramId,
                    diagramSource: state.diagramSource,
                }
            );

        case 'GUEST_ACTIVE_DIAGRAM_DELETED':
            if (state.kind !== 'ready') {
                return state;
            }

            return {
                kind: 'creatingDiagram',
                entrySource: 'guestContinuation',
            };

        case 'RETRY':
            if (state.kind !== 'recoverableError') {
                return state;
            }

            switch (state.error.kind) {
                case 'sessionRestore':
                    return initialEntryFlowState();

                case 'localDiagramCheck':
                    return { kind: 'checkingLocalDiagram' };

                case 'remoteDiagramLoad':
                    return toLoadingRemoteDiagrams(state.entrySource);

                case 'diagramOpen':
                    if (state.openingContext === undefined) {
                        return state;
                    }

                    return {
                        kind: 'openingDiagram',
                        diagramId: state.openingContext.diagramId,
                        diagramSource: state.openingContext.diagramSource,
                        entrySource: state.entrySource,
                    };

                default:
                    return state;
            }

        default:
            return state;
    }
};
