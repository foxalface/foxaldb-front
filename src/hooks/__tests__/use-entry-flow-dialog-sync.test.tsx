import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EntryFlowDialog } from '@/lib/entry-flow';
import { useEntryFlowDialogSync } from '@/hooks/use-entry-flow-dialog-sync';

const openAuthDialog = vi.fn();
const closeAuthDialog = vi.fn();
const openCreateDiagramDialog = vi.fn();
const closeCreateDiagramDialog = vi.fn();
const openGuestDiagramMigrationDialog = vi.fn();
const closeGuestDiagramMigrationDialog = vi.fn();

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openAuthDialog,
        closeAuthDialog,
        openCreateDiagramDialog,
        closeCreateDiagramDialog,
        openGuestDiagramMigrationDialog,
        closeGuestDiagramMigrationDialog,
    }),
}));

describe('useEntryFlowDialogSync', () => {
    beforeEach(() => {
        openAuthDialog.mockClear();
        closeAuthDialog.mockClear();
        openCreateDiagramDialog.mockClear();
        closeCreateDiagramDialog.mockClear();
        openGuestDiagramMigrationDialog.mockClear();
        closeGuestDiagramMigrationDialog.mockClear();
    });

    it('opens guest migration dialog when entry flow requests guestMigration', () => {
        renderHook(() => useEntryFlowDialogSync('guestMigration'));

        expect(openGuestDiagramMigrationDialog).toHaveBeenCalledTimes(1);
        expect(closeGuestDiagramMigrationDialog).not.toHaveBeenCalled();
    });

    it('opens auth dialog when entry flow requests auth', () => {
        renderHook(() => useEntryFlowDialogSync('auth'));

        expect(openAuthDialog).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('opens create diagram dialog when entry flow requests createDiagram', () => {
        renderHook(() => useEntryFlowDialogSync('createDiagram'));

        expect(openCreateDiagramDialog).toHaveBeenCalledTimes(1);
        expect(closeCreateDiagramDialog).not.toHaveBeenCalled();
    });

    it('closes auth dialog when entry flow leaves auth ownership', () => {
        const { rerender } = renderHook(
            ({ dialog }: { dialog: EntryFlowDialog }) =>
                useEntryFlowDialogSync(dialog),
            { initialProps: { dialog: 'auth' as EntryFlowDialog } }
        );

        openAuthDialog.mockClear();

        rerender({ dialog: null });

        expect(closeAuthDialog).toHaveBeenCalledTimes(1);
        expect(openAuthDialog).not.toHaveBeenCalled();
    });

    it('closes create dialog when entry flow leaves create ownership', () => {
        const { rerender } = renderHook(
            ({ dialog }: { dialog: EntryFlowDialog }) =>
                useEntryFlowDialogSync(dialog),
            { initialProps: { dialog: 'createDiagram' as EntryFlowDialog } }
        );

        openCreateDiagramDialog.mockClear();

        rerender({ dialog: null });

        expect(closeCreateDiagramDialog).toHaveBeenCalledTimes(1);
        expect(openCreateDiagramDialog).not.toHaveBeenCalled();
    });

    it('does not close auth dialog when entry flow never owned auth', () => {
        renderHook(() => useEntryFlowDialogSync(null));

        expect(openAuthDialog).not.toHaveBeenCalled();
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('does not loop open/close when dialog stays auth', () => {
        const { rerender } = renderHook(
            ({ dialog }: { dialog: EntryFlowDialog }) =>
                useEntryFlowDialogSync(dialog),
            { initialProps: { dialog: 'auth' as EntryFlowDialog } }
        );

        openAuthDialog.mockClear();
        closeAuthDialog.mockClear();

        rerender({ dialog: 'auth' });
        rerender({ dialog: 'auth' });

        expect(openAuthDialog).not.toHaveBeenCalled();
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('does not close on unrelated dialog transitions', () => {
        const { rerender } = renderHook(
            ({ dialog }: { dialog: EntryFlowDialog }) =>
                useEntryFlowDialogSync(dialog),
            { initialProps: { dialog: null } }
        );

        rerender({ dialog: null });

        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('reacts only when entry dialog value changes', () => {
        const { rerender } = renderHook(
            ({ dialog }: { dialog: EntryFlowDialog }) =>
                useEntryFlowDialogSync(dialog),
            { initialProps: { dialog: 'auth' as EntryFlowDialog } }
        );

        openAuthDialog.mockClear();
        closeAuthDialog.mockClear();

        rerender({ dialog: 'auth' });

        expect(openAuthDialog).not.toHaveBeenCalled();
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });
});
