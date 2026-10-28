/**
 * Pure entry-flow domain types.
 * No React, IO, or UI dependencies.
 *
 * Startup architecture (single owner: useEntryFlow in EditorPageComponent):
 * - Pure reducer + selectors in this module
 * - Side effects in useEntryFlowGuestResolution and
 *   useEntryFlowAuthenticatedResolution
 * - Post-auth continuation is NOT decided here. useAuthIntentContinuation
 *   is the only executor of a consumed AuthIntent. This reducer only exposes
 *   the states that continuation asks for.
 * - Dialog visibility derived from selectEntryFlowDialog; opened via
 *   useEntryFlowDialogSync
 * - Session end is not decided from auth alone. useSessionEndOrchestrator
 *   branches on DiagramLocation. Device session end stays ready. Online and
 *   unscoped session end enter guest resolution without the startup auth gate.
 *
 * Authentication does not choose storage. A device diagram is never migrated
 * because the user logged in or registered.
 */

/** Why the current branch was entered. */
export type EntrySource =
    | 'startup'
    | 'login'
    | 'registration'
    | 'guestContinuation';

/** Origin of the diagram being opened. */
export type DiagramSource = 'local' | 'remote' | 'created' | 'directRoute';

export type EntryFlowErrorKind =
    | 'sessionRestore'
    | 'localDiagramCheck'
    | 'remoteDiagramLoad'
    | 'diagramOpen';

/** Serializable domain error — no raw Error instances or translated text. */
export interface EntryFlowError {
    kind: EntryFlowErrorKind;
    messageKey?: string;
}

export interface OpeningDiagramContext {
    diagramId: string;
    diagramSource: DiagramSource;
}

/** Minimal remote diagram identity for selection UI. Extensible without raw ID arrays. */
export interface RemoteDiagramSummary {
    id: string;
    name: string;
    tablesCount: number;
    databaseType?: string;
    databaseEdition?: string | null;
    createdAt: string;
    updatedAt: string;
    role?: 'owner' | 'editor' | 'viewer';
}

export type EntryFlowState =
    | { kind: 'restoringSession' }
    | {
          kind: 'awaitingGuestChoice';
          /** Guest reload of a non-numeric /diagrams/{id} route. */
          requestedDeviceDiagramId?: string;
      }
    | { kind: 'checkingLocalDiagram' }
    | {
          /**
           * Login or registration left the guest gate. The continuation owner
           * chooses the next state from the consumed AuthIntent. This state
           * does not read Dexie or create a backend diagram.
           */
          kind: 'resolvingAuthContinuation';
          entrySource: 'login' | 'registration';
          requestedDeviceDiagramId?: string;
      }
    | { kind: 'loadingRemoteDiagrams'; entrySource: EntrySource }
    | {
          kind: 'selectingRemoteDiagram';
          entrySource: EntrySource;
          diagrams: RemoteDiagramSummary[];
      }
    | { kind: 'creatingDiagram'; entrySource: EntrySource }
    | {
          kind: 'openingDiagram';
          diagramId: string;
          diagramSource: DiagramSource;
          entrySource: EntrySource;
      }
    | { kind: 'ready' }
    | {
          kind: 'recoverableError';
          error: EntryFlowError;
          entrySource: EntrySource;
          openingContext?: OpeningDiagramContext;
      };

export type EntryFlowEvent =
    | { type: 'SESSION_AUTHENTICATED'; routeDiagramId?: string }
    | {
          type: 'SESSION_UNAUTHENTICATED';
          routeDiagramId?: string;
          requestedDeviceDiagramId?: string;
      }
    | { type: 'SESSION_RESTORE_FAILED'; messageKey?: string }
    | { type: 'CONTINUE_AS_GUEST' }
    | { type: 'LOCAL_DIAGRAM_FOUND'; diagramId: string }
    | { type: 'LOCAL_DIAGRAM_NOT_FOUND' }
    | { type: 'LOCAL_DIAGRAM_CHECK_FAILED'; messageKey?: string }
    | {
          type: 'AUTHENTICATION_SUCCEEDED';
          entrySource: 'login' | 'registration';
      }
    | { type: 'AUTH_CONTINUATION_SHOW_ONLINE_LIST' }
    | { type: 'AUTH_CONTINUATION_OPEN_ONLINE_DIAGRAM'; diagramId: string }
    | { type: 'AUTH_CONTINUATION_OPEN_DEVICE_DIAGRAM'; diagramId: string }
    | { type: 'DEVICE_SESSION_ENDED' }
    | { type: 'ONLINE_SESSION_ENDED' }
    | { type: 'UNSCOPED_SESSION_ENDED' }
    | { type: 'REMOTE_DIAGRAMS_FOUND'; diagrams: RemoteDiagramSummary[] }
    | { type: 'NO_REMOTE_DIAGRAMS' }
    | { type: 'REMOTE_DIAGRAMS_LOAD_FAILED'; messageKey?: string }
    | { type: 'REMOTE_DIAGRAM_SELECTED'; diagramId: string }
    | { type: 'REMOTE_DIAGRAM_SELECTION_CANCELLED' }
    | { type: 'REMOTE_DIAGRAM_CREATE_REQUESTED' }
    | { type: 'ROUTE_DIAGRAM_REQUESTED'; diagramId: string }
    | { type: 'ACCESS_DENIED_RECOVERY' }
    | { type: 'DIAGRAM_CREATED'; diagramId: string }
    | { type: 'DIAGRAM_OPENED' }
    | { type: 'DIAGRAM_OPEN_FAILED'; messageKey?: string }
    | { type: 'GUEST_ACTIVE_DIAGRAM_DELETED' }
    | { type: 'RETRY' }
    | { type: 'RESET' };

export type EntryFlowDialog = 'auth' | 'openDiagram' | 'createDiagram' | null;
