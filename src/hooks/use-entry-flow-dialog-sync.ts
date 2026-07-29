import { useEffect, useRef } from 'react';
import { useDialog } from '@/hooks/use-dialog';
import type { EntryFlowDialog } from '@/lib/entry-flow';

/**
 * Opens and closes entry-flow-owned dialogs (auth, create diagram).
 * Manual navbar opens while entry flow does not own a dialog are unaffected.
 */
export const useEntryFlowDialogSync = (
    entryFlowDialog: EntryFlowDialog
): void => {
    const {
        openAuthDialog,
        closeAuthDialog,
        openCreateDiagramDialog,
        closeCreateDiagramDialog,
    } = useDialog();
    const entryFlowOwnsAuthRef = useRef(false);
    const entryFlowOwnsCreateDiagramRef = useRef(false);
    const previousEntryDialogRef = useRef<EntryFlowDialog>(null);

    useEffect(() => {
        const previousEntryDialog = previousEntryDialogRef.current;
        previousEntryDialogRef.current = entryFlowDialog;

        if (entryFlowDialog === 'auth') {
            entryFlowOwnsAuthRef.current = true;
            openAuthDialog();
            return;
        }

        if (entryFlowOwnsAuthRef.current && previousEntryDialog === 'auth') {
            entryFlowOwnsAuthRef.current = false;
            closeAuthDialog();
        }

        if (entryFlowDialog === 'createDiagram') {
            entryFlowOwnsCreateDiagramRef.current = true;
            openCreateDiagramDialog();
            return;
        }

        if (
            entryFlowOwnsCreateDiagramRef.current &&
            previousEntryDialog === 'createDiagram'
        ) {
            entryFlowOwnsCreateDiagramRef.current = false;
            closeCreateDiagramDialog();

            /*
             * TODO(M1.5): replace legacy authenticated bootstrap when state is
             * loadingRemoteDiagrams.
             */
        }
    }, [
        entryFlowDialog,
        openAuthDialog,
        closeAuthDialog,
        openCreateDiagramDialog,
        closeCreateDiagramDialog,
    ]);
};
