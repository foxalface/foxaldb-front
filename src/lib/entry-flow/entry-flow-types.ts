/**
 * Pure entry-flow domain types.
 * No React, IO, or UI dependencies.
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
}

export type EntryFlowState =
    | { kind: 'restoringSession' }
    | { kind: 'awaitingGuestChoice' }
    | { kind: 'checkingLocalDiagram' }
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
    | { type: 'LOGGED_OUT' }
    | { type: 'REMOTE_DIAGRAMS_FOUND'; diagrams: RemoteDiagramSummary[] }
    | { type: 'NO_REMOTE_DIAGRAMS' }
    | { type: 'REMOTE_DIAGRAMS_LOAD_FAILED'; messageKey?: string }
    | { type: 'REMOTE_DIAGRAM_SELECTED'; diagramId: string }
    | { type: 'DIAGRAM_CREATED'; diagramId: string }
    | { type: 'DIAGRAM_OPENED' }
    | { type: 'DIAGRAM_OPEN_FAILED'; messageKey?: string }
    | { type: 'RETRY' }
    | { type: 'RESET' };

export type EntryFlowDialog = 'auth' | 'openDiagram' | 'createDiagram' | null;
