import type {
    EntryFlowDialog,
    EntryFlowState,
    RemoteDiagramSummary,
} from './entry-flow-types';

/**
 * Derives the single entry dialog required by the current state.
 * Acts as the future dialog mutex — never more than one dialog at a time.
 */
export const selectEntryFlowDialog = (
    state: EntryFlowState
): EntryFlowDialog => {
    switch (state.kind) {
        case 'awaitingGuestChoice':
            return 'auth';
        case 'askingGuestMigration':
            return 'guestMigration';
        case 'selectingRemoteDiagram':
            return 'openDiagram';
        case 'creatingDiagram':
            return 'createDiagram';
        default:
            return null;
    }
};

/**
 * True while the entry flow performs a blocking async operation.
 * False when an entry dialog intentionally awaits user input
 * (awaitingGuestChoice, askingGuestMigration, selectingRemoteDiagram, creatingDiagram).
 *
 * recoverableError returns false — the user chooses retry or logout;
 * the hook may still show a non-blocking error affordance.
 */
export const selectEntryFlowBlocking = (state: EntryFlowState): boolean => {
    switch (state.kind) {
        case 'restoringSession':
        case 'checkingLocalDiagram':
        case 'checkingGuestMigration':
        case 'migratingGuestDiagram':
        case 'loadingRemoteDiagrams':
        case 'openingDiagram':
            return true;
        default:
            return false;
    }
};

/**
 * True only when entry resolution is complete and the editor may operate normally.
 * Not equivalent to "no dialog visible" — dialogs may be open from other features.
 */
export const selectEntryFlowReady = (state: EntryFlowState): boolean =>
    state.kind === 'ready';

export const selectEntryFlowRemoteDiagramSummaries = (
    state: EntryFlowState
): RemoteDiagramSummary[] | undefined =>
    state.kind === 'selectingRemoteDiagram' ? state.diagrams : undefined;
