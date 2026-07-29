import { useEffect, useRef } from 'react';
import { useDialog } from '@/hooks/use-dialog';
import type { EntryFlowDialog } from '@/lib/entry-flow';

/**
 * Opens and closes entry-flow-owned dialogs (auth, open diagram, create diagram, guest migration).
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
        openOpenDiagramDialog,
        closeOpenDiagramDialog,
        openGuestDiagramMigrationDialog,
        closeGuestDiagramMigrationDialog,
    } = useDialog();
    const entryFlowOwnsAuthRef = useRef(false);
    const entryFlowOwnsCreateDiagramRef = useRef(false);
    const entryFlowOwnsOpenDiagramRef = useRef(false);
    const entryFlowOwnsGuestMigrationRef = useRef(false);
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

        if (entryFlowDialog === 'guestMigration') {
            entryFlowOwnsGuestMigrationRef.current = true;
            openGuestDiagramMigrationDialog();
            return;
        }

        if (
            entryFlowOwnsGuestMigrationRef.current &&
            previousEntryDialog === 'guestMigration'
        ) {
            entryFlowOwnsGuestMigrationRef.current = false;
            closeGuestDiagramMigrationDialog();
        }

        if (entryFlowDialog === 'openDiagram') {
            entryFlowOwnsOpenDiagramRef.current = true;
            openOpenDiagramDialog({ canClose: false });
            return;
        }

        if (
            entryFlowOwnsOpenDiagramRef.current &&
            previousEntryDialog === 'openDiagram'
        ) {
            entryFlowOwnsOpenDiagramRef.current = false;
            closeOpenDiagramDialog();
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
        }
    }, [
        entryFlowDialog,
        openAuthDialog,
        closeAuthDialog,
        openCreateDiagramDialog,
        closeCreateDiagramDialog,
        openOpenDiagramDialog,
        closeOpenDiagramDialog,
        openGuestDiagramMigrationDialog,
        closeGuestDiagramMigrationDialog,
    ]);
};
