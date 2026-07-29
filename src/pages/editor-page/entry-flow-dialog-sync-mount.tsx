import { useEntryFlowDialogSync } from '@/hooks/use-entry-flow-dialog-sync';
import type { EntryFlowDialog } from '@/lib/entry-flow';

export const EntryFlowDialogSyncMount = ({
    entryFlowDialog,
}: {
    entryFlowDialog: EntryFlowDialog;
}): null => {
    useEntryFlowDialogSync(entryFlowDialog);
    return null;
};
