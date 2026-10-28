import { StrictMode, type ComponentType, type PropsWithChildren } from 'react';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    useAuthIntentContinuation,
    type UseAuthIntentContinuationOptions,
} from '@/hooks/use-auth-intent-continuation';
import {
    clearProtectedActionResume,
    noneAuthIntent,
    registerProtectedActionResume,
    type AuthIntent,
} from '@/lib/auth-intent';
import type { EntryFlowState } from '@/lib/entry-flow';

const setDiagramLocation = vi.fn();
const openOpenDiagramDialog = vi.fn();
const getDiagram = vi.fn();
const deleteDiagram = vi.fn();
const deleteActiveLocalDiagram = vi.fn();
const toast = vi.fn();
const putLocalDiagramOnlineCopy = vi.fn();
const putLocalDiagramOnlineMove = vi.fn();

const intentState: {
    lastConsumedIntent: AuthIntent;
    consumedIntentEpoch: number;
} = {
    lastConsumedIntent: noneAuthIntent(),
    consumedIntentEpoch: 0,
};

const currentDiagram: { id: string | undefined } = { id: 'local-1' };

vi.mock('@/hooks/use-auth-intent', () => ({
    useAuthIntent: () => intentState,
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: { type: 'device', localId: 'local-1' },
        setDiagramLocation,
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openOpenDiagramDialog,
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        getDiagram,
        deleteDiagram,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram,
        deleteDiagram: deleteActiveLocalDiagram,
    }),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({ toast }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/lib/diagram/put-local-diagram-online', () => ({
    putLocalDiagramOnlineCopy: (...args: unknown[]) =>
        putLocalDiagramOnlineCopy(...args),
    putLocalDiagramOnlineMove: (...args: unknown[]) =>
        putLocalDiagramOnlineMove(...args),
}));

const holder: {
    stateKind: EntryFlowState['kind'];
    requestedDeviceDiagramId?: string;
} = {
    stateKind: 'ready',
};

const showOnlineList = vi.fn();
const openOnlineDiagram = vi.fn();
const openDeviceDiagram = vi.fn();

const renderContinuation = (wrapper?: ComponentType<PropsWithChildren>) =>
    renderHook(
        () =>
            useAuthIntentContinuation({
                stateKind: holder.stateKind,
                requestedDeviceDiagramId: holder.requestedDeviceDiagramId,
                showOnlineList,
                openOnlineDiagram,
                openDeviceDiagram,
            } satisfies UseAuthIntentContinuationOptions),
        wrapper ? { wrapper } : undefined
    );

const consume = (intent: AuthIntent) => {
    intentState.lastConsumedIntent = intent;
    intentState.consumedIntentEpoch += 1;
};

describe('useAuthIntentContinuation', () => {
    beforeEach(() => {
        intentState.lastConsumedIntent = noneAuthIntent();
        intentState.consumedIntentEpoch = 0;
        holder.stateKind = 'ready';
        holder.requestedDeviceDiagramId = undefined;
        currentDiagram.id = 'local-1';
        setDiagramLocation.mockReset();
        openOpenDiagramDialog.mockReset();
        getDiagram.mockReset();
        deleteDiagram.mockReset();
        deleteActiveLocalDiagram.mockReset();
        toast.mockReset();
        putLocalDiagramOnlineCopy.mockReset();
        putLocalDiagramOnlineMove.mockReset();
        showOnlineList.mockReset();
        openOnlineDiagram.mockReset();
        openDeviceDiagram.mockReset();
        clearProtectedActionResume();
        getDiagram.mockResolvedValue({ id: 'local-1', name: 'Local' });
        deleteActiveLocalDiagram.mockResolvedValue(undefined);
        putLocalDiagramOnlineCopy.mockResolvedValue('55');
        putLocalDiagramOnlineMove.mockResolvedValue('56');
    });

    it('does not call setDiagramLocation; location changes belong to the open path', () => {
        const source = readFileSync(
            resolve(
                dirname(fileURLToPath(import.meta.url)),
                '../use-auth-intent-continuation.ts'
            ),
            'utf8'
        );

        expect(source).not.toMatch(/setDiagramLocation\s*\(/);
        expect(source).toContain('Sole post-authentication continuation');
        expect(source).not.toContain('GuestDiagramMigration');
    });

    it('login or register while a device diagram is ready with intent none does nothing', () => {
        const { rerender } = renderContinuation();

        consume({ type: 'none' });
        rerender();

        expect(showOnlineList).not.toHaveBeenCalled();
        expect(openOnlineDiagram).not.toHaveBeenCalled();
        expect(openDeviceDiagram).not.toHaveBeenCalled();
        expect(openOpenDiagramDialog).not.toHaveBeenCalled();
        expect(putLocalDiagramOnlineCopy).not.toHaveBeenCalled();
        expect(putLocalDiagramOnlineMove).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('startup login with intent none opens the online list and does not migrate', () => {
        holder.stateKind = 'resolvingAuthContinuation';
        const { rerender } = renderContinuation();

        consume({ type: 'none' });
        rerender();

        expect(showOnlineList).toHaveBeenCalledTimes(1);
        expect(putLocalDiagramOnlineCopy).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('startup register with a device route opens that device diagram', () => {
        holder.stateKind = 'resolvingAuthContinuation';
        holder.requestedDeviceDiagramId = 'local-abc';
        const { rerender } = renderContinuation();

        consume({ type: 'none' });
        rerender();

        expect(openDeviceDiagram).toHaveBeenCalledWith('local-abc');
        expect(showOnlineList).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('open-online-tab while ready keeps the device diagram and opens the online tab', () => {
        const { rerender } = renderContinuation();

        consume({ type: 'open-online-tab' });
        rerender();

        expect(openOpenDiagramDialog).toHaveBeenCalledWith({
            canClose: true,
            initialTab: 'online',
        });
        expect(openOnlineDiagram).not.toHaveBeenCalled();
        expect(showOnlineList).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('open-online-tab during startup auth shows the online list without opening a diagram', () => {
        holder.stateKind = 'resolvingAuthContinuation';
        const { rerender } = renderContinuation();

        consume({ type: 'open-online-tab' });
        rerender();

        expect(showOnlineList).toHaveBeenCalledTimes(1);
        expect(openOnlineDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('open-online-diagram requests that exact id and does not set location itself', () => {
        const { rerender } = renderContinuation();

        consume({ type: 'open-online-diagram', diagramId: '123' });
        rerender();

        expect(openOnlineDiagram).toHaveBeenCalledWith('123');
        expect(putLocalDiagramOnlineCopy).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('put-online copy creates a backend diagram, keeps local data, then opens the result', async () => {
        const { rerender } = renderContinuation();

        consume({ type: 'put-online', localId: 'local-1', mode: 'copy' });
        rerender();

        await waitFor(() => {
            expect(openOnlineDiagram).toHaveBeenCalledWith('55');
        });

        expect(getDiagram).toHaveBeenCalledWith('local-1');
        expect(putLocalDiagramOnlineCopy).toHaveBeenCalledTimes(1);
        expect(putLocalDiagramOnlineMove).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('put-online move deletes the local diagram only after backend create', async () => {
        const { rerender } = renderContinuation();

        consume({ type: 'put-online', localId: 'local-1', mode: 'move' });
        rerender();

        await waitFor(() => {
            expect(openOnlineDiagram).toHaveBeenCalledWith('56');
        });

        expect(putLocalDiagramOnlineMove).toHaveBeenCalledTimes(1);
        expect(putLocalDiagramOnlineCopy).not.toHaveBeenCalled();
        expect(deleteActiveLocalDiagram).toHaveBeenCalledTimes(1);
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('put-online failure leaves a ready device diagram untouched', async () => {
        putLocalDiagramOnlineCopy.mockRejectedValue(new Error('nope'));
        const { rerender } = renderContinuation();

        consume({ type: 'put-online', localId: 'local-1', mode: 'copy' });
        rerender();

        await waitFor(() => {
            expect(toast).toHaveBeenCalled();
        });

        expect(openOnlineDiagram).not.toHaveBeenCalled();
        expect(openDeviceDiagram).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('put-online does not create a backend diagram when the local diagram is gone', async () => {
        getDiagram.mockResolvedValue(undefined);
        const { rerender } = renderContinuation();

        consume({ type: 'put-online', localId: 'missing', mode: 'move' });
        rerender();

        await waitFor(() => {
            expect(toast).toHaveBeenCalled();
        });

        expect(putLocalDiagramOnlineMove).not.toHaveBeenCalled();
        expect(putLocalDiagramOnlineCopy).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('protected-action resumes once and does not change storage while ready', () => {
        const resume = vi.fn();
        registerProtectedActionResume(resume);
        const { rerender } = renderContinuation();

        consume({ type: 'protected-action', action: 'project-import' });
        rerender();

        expect(resume).toHaveBeenCalledTimes(1);
        expect(showOnlineList).not.toHaveBeenCalled();
        expect(putLocalDiagramOnlineCopy).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();

        rerender();
        expect(resume).toHaveBeenCalledTimes(1);
    });

    it('does not execute a continuation when auth was canceled or has not succeeded', () => {
        const { rerender } = renderContinuation();

        rerender();

        expect(showOnlineList).not.toHaveBeenCalled();
        expect(openOnlineDiagram).not.toHaveBeenCalled();
        expect(putLocalDiagramOnlineCopy).not.toHaveBeenCalled();
    });

    it('does not run the same continuation twice under Strict Mode', async () => {
        holder.stateKind = 'ready';
        const { rerender } = renderContinuation(StrictMode);

        consume({ type: 'put-online', localId: 'local-1', mode: 'copy' });
        rerender();

        await waitFor(() => {
            expect(putLocalDiagramOnlineCopy).toHaveBeenCalledTimes(1);
        });

        rerender();

        expect(putLocalDiagramOnlineCopy).toHaveBeenCalledTimes(1);
        expect(openOnlineDiagram).toHaveBeenCalledTimes(1);
    });

    it('waits out session restore before applying a direct online diagram intent', () => {
        holder.stateKind = 'restoringSession';
        const { rerender } = renderContinuation();

        consume({ type: 'open-online-diagram', diagramId: '123' });
        rerender();

        expect(openOnlineDiagram).not.toHaveBeenCalled();

        holder.stateKind = 'loadingRemoteDiagrams';
        rerender();

        expect(openOnlineDiagram).toHaveBeenCalledWith('123');
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });
});
