import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntryFlowDialogSync } from '@/hooks/use-entry-flow-dialog-sync';
import type { EntryFlowDialog } from '@/lib/entry-flow';

const openAuthDialog = vi.fn();
const closeAuthDialog = vi.fn();

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openAuthDialog,
        closeAuthDialog,
    }),
}));

describe('useEntryFlowDialogSync', () => {
    beforeEach(() => {
        openAuthDialog.mockClear();
        closeAuthDialog.mockClear();
    });

    it('opens auth dialog when entry flow requests auth', () => {
        renderHook(() => useEntryFlowDialogSync('auth'));

        expect(openAuthDialog).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
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
