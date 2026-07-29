/**
 * Pure entry-flow domain types.
 * No React, IO, or UI dependencies.
 *
 * Startup architecture (single owner: useEntryFlow in EditorPageComponent):
 * - Pure reducer + selectors in this module
 * - Side effects in useEntryFlowGuestResolution, useEntryFlowGuestMigration,
 *   useEntryFlowAuthenticatedResolution
 * - Dialog visibility derived from selectEntryFlowDialog; opened via
 *   useEntryFlowDialogSync
 */

/** Why the current branch was entered. */
export type EntrySource =
    | 'startup'
    | 'login'
    | 'registration'
    | 'guestContinuation';

/** Origin of the diagram being opened. */
export type DiagramSource =
    | 'local'
    | 'remote'
    | 'created'
    | 'directRoute'
    | 'migrated';

export type EntryFlowErrorKind =
    | 'sessionRestore'
    | 'localDiagramCheck'
    | 'remoteDiagramLoad'
    | 'diagramOpen'
    | 'guestMigrationCheck'
    | 'guestMigration'
    | 'guestMigrationCleanup';

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
}

export type EntryFlowState =
    | { kind: 'restoringSession' }
    | { kind: 'awaitingGuestChoice' }
    | { kind: 'checkingLocalDiagram' }
    | {
          kind: 'checkingGuestMigration';
          entrySource: 'login' | 'registration';
      }
    | {
          kind: 'askingGuestMigration';
          entrySource: EntrySource;
          localDiagramId: string;
      }
    | {
          kind: 'migratingGuestDiagram';
          entrySource: EntrySource;
          localDiagramId: string;
          remoteDiagramId?: string;
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
    | { type: 'SESSION_UNAUTHENTICATED'; routeDiagramId?: string }
    | { type: 'SESSION_RESTORE_FAILED'; messageKey?: string }
    | { type: 'CONTINUE_AS_GUEST' }
    | { type: 'LOCAL_DIAGRAM_FOUND'; diagramId: string }
    | { type: 'LOCAL_DIAGRAM_NOT_FOUND' }
    | { type: 'LOCAL_DIAGRAM_CHECK_FAILED'; messageKey?: string }
    | {
          type: 'AUTHENTICATION_SUCCEEDED';
          entrySource: 'login' | 'registration';
      }
    | {
          type: 'GUEST_SESSION_AUTHENTICATED';
          entrySource: 'login' | 'registration';
      }
    | { type: 'GUEST_MIGRATION_LOCAL_FOUND'; diagramId: string }
    | { type: 'GUEST_MIGRATION_LOCAL_NOT_FOUND' }
    | { type: 'GUEST_MIGRATION_CHECK_FAILED'; messageKey?: string }
    | { type: 'GUEST_MIGRATION_ACCEPTED' }
    | { type: 'GUEST_MIGRATION_DECLINED' }
    | { type: 'GUEST_MIGRATION_REMOTE_CREATED'; remoteDiagramId: string }
    | { type: 'GUEST_MIGRATION_SUCCEEDED'; remoteDiagramId: string }
    | { type: 'GUEST_MIGRATION_FAILED'; messageKey?: string }
    | { type: 'GUEST_MIGRATION_CLEANUP_FAILED'; remoteDiagramId: string }
    | { type: 'LOGGED_OUT' }
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

export type EntryFlowDialog =
    | 'auth'
    | 'openDiagram'
    | 'createDiagram'
    | 'guestMigration'
    | null;
