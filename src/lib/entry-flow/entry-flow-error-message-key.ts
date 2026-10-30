import type { EntryFlowError, EntryFlowErrorKind } from './entry-flow-types';

const defaultMessageKeyByKind: Record<EntryFlowErrorKind, string> = {
    sessionRestore: 'entry_flow.errors.session_restore_failed',
    localDiagramCheck: 'entry_flow.errors.load_local_failed',
    remoteDiagramLoad: 'entry_flow.errors.load_remote_failed',
    diagramOpen: 'entry_flow.errors.open_diagram_failed',
};

export const resolveEntryFlowErrorMessageKey = (
    error: EntryFlowError
): string => error.messageKey ?? defaultMessageKeyByKind[error.kind];
