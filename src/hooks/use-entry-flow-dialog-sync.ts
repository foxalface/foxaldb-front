import { useEffect, useRef } from 'react';
import { useDialog } from '@/hooks/use-dialog';
import type { EntryFlowDialog } from '@/lib/entry-flow';

/**
 * Opens and closes the auth dialog when entry-flow owns the auth step.
 * Manual navbar opens while authenticated are unaffected.
 */
export const useEntryFlowDialogSync = (
    entryFlowDialog: EntryFlowDialog
): void => {
    const { openAuthDialog, closeAuthDialog } = useDialog();
    const entryFlowOwnsAuthRef = useRef(false);
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

            /*
             * TODO(M1.4): replace legacy guest bootstrap when state is
             * checkingLocalDiagram.
             * TODO(M1.5): replace legacy authenticated bootstrap when state is
             * loadingRemoteDiagrams.
             */
        }
    }, [entryFlowDialog, openAuthDialog, closeAuthDialog]);
};
