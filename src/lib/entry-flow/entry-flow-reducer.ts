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

        case 'LOGGED_OUT':
            return toAwaitingGuestChoice();

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

            return {
                kind: 'loadingRemoteDiagrams',
                entrySource: 'startup',
            };

        case 'SESSION_UNAUTHENTICATED':
            if (state.kind !== 'restoringSession') {
                return state;
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

            return { kind: 'checkingLocalDiagram' };

        case 'AUTHENTICATION_SUCCEEDED':
            if (state.kind !== 'awaitingGuestChoice') {
                return state;
            }

            return {
                kind: 'loadingRemoteDiagrams',
                entrySource: event.entrySource,
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
                    return {
                        kind: 'loadingRemoteDiagrams',
                        entrySource: state.entrySource,
                    };

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
