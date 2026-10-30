import { toast } from '@/components/toast/use-toast';
import { useAlert } from '@/context/alert-context/alert-context';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useOnlineDiagramId } from '@/hooks/use-diagram-location';
import { useDialog } from '@/hooks/use-dialog';
import { useRealtime } from '@/hooks/use-realtime';
import type { DiagramAccess } from '@/lib/api/diagrams';
import { parseDiagramAccessChangedPayload } from '@/lib/realtime/diagram-access-changed';
import type { DiagramPrivateEventChannel } from '@/lib/realtime/diagram-private-channel';
import { kickOutOfDiagram } from '@/lib/realtime/kick-out-of-diagram';
import { clearPendingDiagramOperationSyncTimers } from '@/lib/realtime/diagram-sync-state';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const getRoleChangeToast = (
    access: DiagramAccess,
    t: (key: string) => string
): { title: string; description: string } | null => {
    if (access.role === 'viewer') {
        return {
            title: t('diagram_access.role_changed_viewer.title'),
            description: t('diagram_access.role_changed_viewer.description'),
        };
    }

    if (access.role === 'editor') {
        return {
            title: t('diagram_access.role_changed_editor.title'),
            description: t('diagram_access.role_changed_editor.description'),
        };
    }

    return null;
};

export const useDiagramAccessListener = (): void => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const { loadDiagramFromData } = useChartDB();
    const onlineDiagramId = useOnlineDiagramId();
    const { setDiagramAccess, clearDiagramAccess } = useDiagramAccess();
    const { showAlert } = useAlert();
    const { openOpenDiagramDialog } = useDialog();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const currentDiagramId =
        onlineDiagramId !== null ? Number(onlineDiagramId) : null;

    const userId = user?.id ?? null;
    const { connectionStatus, getUserPrivateChannel, onReconnect } =
        useRealtime();

    const setDiagramAccessRef = useRef(setDiagramAccess);
    setDiagramAccessRef.current = setDiagramAccess;

    const clearDiagramAccessRef = useRef(clearDiagramAccess);
    clearDiagramAccessRef.current = clearDiagramAccess;

    const loadDiagramFromDataRef = useRef(loadDiagramFromData);
    loadDiagramFromDataRef.current = loadDiagramFromData;

    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    const showAlertRef = useRef(showAlert);
    showAlertRef.current = showAlert;

    const openOpenDiagramDialogRef = useRef(openOpenDiagramDialog);
    openOpenDiagramDialogRef.current = openOpenDiagramDialog;

    const tRef = useRef(t);
    tRef.current = t;

    const currentDiagramIdRef = useRef(currentDiagramId);
    currentDiagramIdRef.current = currentDiagramId;

    const bindRef = useRef<() => void>(() => undefined);

    // Stays registered across diagram switches and status changes so the
    // access listener rebinds before the authoritative reconnect GET.
    useEffect(() => {
        if (isLoading || !isAuthenticated || userId === null) {
            return;
        }

        return onReconnect(() => {
            bindRef.current();
        });
    }, [isLoading, isAuthenticated, userId, onReconnect]);

    useEffect(() => {
        if (
            isLoading ||
            !isAuthenticated ||
            userId === null ||
            connectionStatus === 'idle'
        ) {
            bindRef.current = () => undefined;
            return;
        }

        let activeChannel: DiagramPrivateEventChannel | null = null;

        const handleDiagramAccessChanged = (value: unknown): void => {
            const payload = parseDiagramAccessChangedPayload(value);

            if (payload === null) {
                console.warn('[DiagramAccessChanged] Invalid payload', value);
                return;
            }

            if (currentDiagramIdRef.current !== payload.diagramId) {
                return;
            }

            if (payload.reason === 'member_removed') {
                kickOutOfDiagram({
                    title: tRef.current('diagram_access.removed.title'),
                    message: tRef.current('diagram_access.removed.description'),
                    dedupeKey: `member_removed:${payload.diagramId}`,
                    clearDiagramAccess: () => clearDiagramAccessRef.current(),
                    loadDiagramFromData: (diagram) =>
                        loadDiagramFromDataRef.current(diagram),
                    navigate: navigateRef.current,
                    showAlert: (params) => showAlertRef.current(params),
                    openOpenDiagramDialog: (params) =>
                        openOpenDiagramDialogRef.current(params),
                });
                return;
            }

            if (payload.reason !== 'role_changed' || payload.access === null) {
                return;
            }

            setDiagramAccessRef.current(payload.access);

            if (payload.access.can_edit === false) {
                clearPendingDiagramOperationSyncTimers();
            }

            const roleChangeToast = getRoleChangeToast(
                payload.access,
                tRef.current
            );

            if (roleChangeToast !== null) {
                toast(roleChangeToast);
            }
        };

        const unbind = (): void => {
            if (activeChannel === null) {
                return;
            }

            const channel = activeChannel;
            activeChannel = null;

            try {
                channel.stopListening(
                    '.DiagramAccessChanged',
                    handleDiagramAccessChanged
                );
            } catch (error) {
                console.warn(
                    `[DiagramAccessChanged] failed to remove listener (user.${userId})`,
                    error
                );
            }
        };

        const bind = (): void => {
            unbind();

            const channel = getUserPrivateChannel();
            if (channel === null) {
                return;
            }

            try {
                channel.listen(
                    '.DiagramAccessChanged',
                    handleDiagramAccessChanged
                );
                activeChannel = channel;
            } catch (error) {
                console.warn(
                    `[DiagramAccessChanged] failed to subscribe (user.${userId})`,
                    error
                );
            }
        };

        bindRef.current = bind;
        bind();

        return () => {
            unbind();
            if (bindRef.current === bind) {
                bindRef.current = () => undefined;
            }
        };
    }, [
        isLoading,
        isAuthenticated,
        userId,
        connectionStatus,
        getUserPrivateChannel,
    ]);
};
