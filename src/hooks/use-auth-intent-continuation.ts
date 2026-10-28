import { useEffect, useRef } from 'react';
import { useChartDB } from '@/hooks/use-chartdb';
import { useAuthIntent } from '@/hooks/use-auth-intent';
import { useDialog } from '@/hooks/use-dialog';
import { useStorage } from '@/hooks/use-storage';
import { useToast } from '@/components/toast/use-toast';
import { takeProtectedActionResume, type AuthIntent } from '@/lib/auth-intent';
import {
    putLocalDiagramOnlineCopy,
    putLocalDiagramOnlineMove,
} from '@/lib/diagram/put-local-diagram-online';
import type { EntryFlowState } from '@/lib/entry-flow';
import { useTranslation } from 'react-i18next';

/**
 * Sole post-authentication continuation owner.
 *
 * AuthIntentProvider consumes a pending intent once and publishes
 * lastConsumedIntent plus consumedIntentEpoch. This hook is the only
 * production code that executes that intent.
 *
 * It does not run from the auth dialog, the login page, the register page,
 * or the auth provider. Those surfaces only authenticate. Login and register
 * pages navigate home so this hook, mounted once on the editor, observes the
 * already-consumed intent.
 *
 * consumedIntentEpoch is applied at most once. The applied epoch is stored in
 * a ref before any async work, so React Strict Mode's second effect pass does
 * not start a second continuation. The ref is not cleared on effect cleanup.
 *
 * Authentication does not change DiagramLocation. This hook never calls
 * setDiagramLocation. Online location is set only by the existing open path
 * after a continuation actually opens or creates an online diagram.
 */
const WAITING_KINDS = new Set<EntryFlowState['kind']>([
    'restoringSession',
    'checkingLocalDiagram',
]);

const isStartupAuthGate = (kind: EntryFlowState['kind']): boolean =>
    kind === 'resolvingAuthContinuation' || kind === 'awaitingGuestChoice';

export interface UseAuthIntentContinuationOptions {
    stateKind: EntryFlowState['kind'];
    requestedDeviceDiagramId?: string;
    showOnlineList: () => void;
    openOnlineDiagram: (diagramId: string) => void;
    openDeviceDiagram: (diagramId: string) => void;
}

export const useAuthIntentContinuation = ({
    stateKind,
    requestedDeviceDiagramId,
    showOnlineList,
    openOnlineDiagram,
    openDeviceDiagram,
}: UseAuthIntentContinuationOptions): void => {
    const { lastConsumedIntent, consumedIntentEpoch } = useAuthIntent();
    const { openOpenDiagramDialog } = useDialog();
    const { getDiagram, deleteDiagram } = useStorage();
    const { currentDiagram, deleteDiagram: deleteActiveLocalDiagram } =
        useChartDB();
    const { toast } = useToast();
    const { t } = useTranslation();
    const appliedEpochRef = useRef(0);

    const showPutOnlineFailed = () => {
        toast({
            title: t('open_diagram_dialog.errors.put_online_failed'),
            variant: 'destructive',
        });
    };

    const continueStartupWithoutMigration = () => {
        if (requestedDeviceDiagramId !== undefined) {
            openDeviceDiagram(requestedDeviceDiagramId);
            return;
        }

        showOnlineList();
    };

    const executeIntent = async (intent: AuthIntent): Promise<void> => {
        if (intent.type === 'none') {
            if (isStartupAuthGate(stateKind)) {
                continueStartupWithoutMigration();
            }

            return;
        }

        if (intent.type === 'open-online-tab') {
            if (isStartupAuthGate(stateKind)) {
                showOnlineList();
                return;
            }

            if (
                stateKind === 'loadingRemoteDiagrams' ||
                stateKind === 'selectingRemoteDiagram'
            ) {
                return;
            }

            openOpenDiagramDialog({ canClose: true, initialTab: 'online' });
            return;
        }

        if (intent.type === 'open-online-diagram') {
            openOnlineDiagram(intent.diagramId);
            return;
        }

        if (intent.type === 'put-online') {
            await continuePutOnline(intent.localId, intent.mode);
            return;
        }

        const resume = takeProtectedActionResume();

        try {
            resume?.();
        } catch {
            toast({
                title: t('auth.errors.generic'),
                variant: 'destructive',
            });
        }

        if (isStartupAuthGate(stateKind)) {
            continueStartupWithoutMigration();
        }
    };

    const continuePutOnline = async (
        localId: string,
        mode: 'copy' | 'move'
    ): Promise<void> => {
        try {
            const existing = await getDiagram(localId);

            if (!existing) {
                showPutOnlineFailed();

                if (isStartupAuthGate(stateKind)) {
                    continueStartupWithoutMigration();
                }

                return;
            }

            const remoteId =
                mode === 'copy'
                    ? await putLocalDiagramOnlineCopy(getDiagram, localId)
                    : await putLocalDiagramOnlineMove(
                          getDiagram,
                          deleteDiagram,
                          localId
                      );

            if (mode === 'move' && currentDiagram?.id === localId) {
                await deleteActiveLocalDiagram().catch(() => undefined);
            }

            openOnlineDiagram(remoteId);
        } catch {
            showPutOnlineFailed();

            if (isStartupAuthGate(stateKind)) {
                openDeviceDiagram(localId);
            }
        }
    };

    useEffect(() => {
        if (consumedIntentEpoch === 0) {
            return;
        }

        if (appliedEpochRef.current === consumedIntentEpoch) {
            return;
        }

        if (WAITING_KINDS.has(stateKind)) {
            return;
        }

        appliedEpochRef.current = consumedIntentEpoch;
        const intent = lastConsumedIntent;

        void executeIntent(intent);
        // One-shot on consumedIntentEpoch. Strict Mode re-runs this effect
        // without resetting appliedEpochRef, so the continuation starts once.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot epoch
    }, [consumedIntentEpoch, stateKind]);
};

/**
 * Single mount point. EditorPage renders this once inside DialogProvider.
 */
export const AuthIntentContinuationMount: React.FC<
    UseAuthIntentContinuationOptions
> = (props) => {
    useAuthIntentContinuation(props);
    return null;
};
