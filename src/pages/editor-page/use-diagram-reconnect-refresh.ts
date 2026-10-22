import { useAuth } from '@/hooks/use-auth';
import { useAlert } from '@/context/alert-context/alert-context';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import { useRealtime } from '@/hooks/use-realtime';
import { readDiagramContentHashFromApi } from '@/lib/api/diagram-content-hash';
import { getDiagram } from '@/lib/api/diagrams';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    isDiagramAccessDenied,
    kickOutOfDiagram,
} from '@/lib/realtime/kick-out-of-diagram';
import {
    isOutboundReplayActive,
    isRemoteSyncActive,
    remoteSyncDepthRef,
    syncRemoteApplyState,
} from '@/lib/realtime/diagram-sync-state';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const HIDDEN_THRESHOLD_MS = 30_000;
const REFRESH_COOLDOWN_MS = 5_000;
const SYNC_RETRY_MS = 300;

export const useDiagramReconnectRefresh = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { onReconnect } = useRealtime();
    const { currentDiagram, replaceDiagram, loadDiagramFromData } =
        useChartDB();
    const { setDiagramAccess, clearDiagramAccess } = useDiagramAccess();
    const { showAlert } = useAlert();
    const { openOpenDiagramDialog } = useDialog();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const refreshInFlightRef = useRef(false);
    const lastRefreshAtRef = useRef(0);
    const hiddenAtRef = useRef<number | null>(null);
    const syncRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const refreshDiagramFromBackend = useCallback(async (): Promise<void> => {
        if (diagramId === null) {
            console.info('[reconnect-refresh] skipped: no backend diagram');
            return;
        }

        if (refreshInFlightRef.current) {
            console.info('[reconnect-refresh] skipped: in flight');
            return;
        }

        if (isRemoteSyncActive() || isOutboundReplayActive()) {
            console.info('[reconnect-refresh] skipped: remote sync in flight');
            if (syncRetryTimerRef.current === null) {
                syncRetryTimerRef.current = setTimeout(() => {
                    syncRetryTimerRef.current = null;
                    void refreshDiagramFromBackend();
                }, SYNC_RETRY_MS);
            }

            return;
        }

        const now = Date.now();
        if (now - lastRefreshAtRef.current < REFRESH_COOLDOWN_MS) {
            console.info('[reconnect-refresh] skipped: cooldown');
            return;
        }

        refreshInFlightRef.current = true;
        lastRefreshAtRef.current = now;

        remoteSyncDepthRef.current += 1;
        syncRemoteApplyState();

        console.info(`[reconnect-refresh] fetching diagram ${diagramId}`);

        try {
            const raw = await getDiagram(diagramId);
            const contentHash = readDiagramContentHashFromApi(raw);
            console.info(
                `[reconnect-refresh] fetched hash ${contentHash ?? 'none'}`
            );

            const diagram = normalizeDiagramFromApi(raw, diagramId);
            setDiagramAccess(raw.access ?? null);
            console.info('[reconnect-refresh] applying authoritative diagram');
            await replaceDiagram(diagram, {
                updateHistory: false,
                authoritative: true,
                resetHistory: true,
                authoritativeContentHash: contentHash ?? undefined,
            });
            console.info('[reconnect-refresh] complete');
        } catch (error: unknown) {
            if (isDiagramAccessDenied(error)) {
                kickOutOfDiagram({
                    title: t('diagram_access.removed.title'),
                    message: t('diagram_access.removed.description'),
                    dedupeKey: `reconnect:${diagramId}`,
                    clearDiagramAccess,
                    loadDiagramFromData,
                    navigate,
                    showAlert,
                    openOpenDiagramDialog,
                });
                return;
            }

            console.warn(
                '[DiagramReconnect] Failed to refresh diagram from backend',
                error
            );
        } finally {
            remoteSyncDepthRef.current = Math.max(
                0,
                remoteSyncDepthRef.current - 1
            );
            syncRemoteApplyState();
            refreshInFlightRef.current = false;
        }
    }, [
        diagramId,
        setDiagramAccess,
        replaceDiagram,
        clearDiagramAccess,
        loadDiagramFromData,
        navigate,
        showAlert,
        openOpenDiagramDialog,
        t,
    ]);

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        return onReconnect(() => {
            void refreshDiagramFromBackend();
        });
    }, [
        isLoading,
        isAuthenticated,
        diagramId,
        onReconnect,
        refreshDiagramFromBackend,
    ]);

    useEffect(() => {
        return () => {
            if (syncRetryTimerRef.current !== null) {
                clearTimeout(syncRetryTimerRef.current);
                syncRetryTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        const handleVisibilityChange = (): void => {
            if (document.visibilityState === 'hidden') {
                hiddenAtRef.current = Date.now();
                return;
            }

            if (document.visibilityState !== 'visible') {
                return;
            }

            const hiddenAt = hiddenAtRef.current;
            hiddenAtRef.current = null;

            if (hiddenAt === null) {
                return;
            }

            if (Date.now() - hiddenAt < HIDDEN_THRESHOLD_MS) {
                return;
            }

            void refreshDiagramFromBackend();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, [isLoading, isAuthenticated, diagramId, refreshDiagramFromBackend]);
};
