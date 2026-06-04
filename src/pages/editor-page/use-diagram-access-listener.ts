import { toast } from '@/components/toast/use-toast';
import { useAlert } from '@/context/alert-context/alert-context';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useDialog } from '@/hooks/use-dialog';
import type { DiagramAccess } from '@/lib/api/diagrams';
import { parseDiagramAccessChangedPayload } from '@/lib/realtime/diagram-access-changed';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { getEcho } from '@/lib/realtime/echo';
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
    const { currentDiagram, loadDiagramFromData } = useChartDB();
    const { setDiagramAccess, clearDiagramAccess } = useDiagramAccess();
    const { showAlert } = useAlert();
    const { openOpenDiagramDialog } = useDialog();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const currentDiagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? Number(currentDiagram.id)
            : null;

    const userId = user?.id ?? null;

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

    useEffect(() => {
        if (isLoading || !isAuthenticated || userId === null) {
            return;
        }

        const echo = getEcho();

        if (echo === null) {
            return;
        }

        let channel: ReturnType<typeof echo.private> | null = null;

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

        try {
            channel = echo.private(`user.${userId}`);

            channel
                .listen('.DiagramAccessChanged', handleDiagramAccessChanged)
                .error((error: unknown) => {
                    console.warn(
                        `[DiagramAccessChanged] channel error (user.${userId})`,
                        error
                    );
                });
        } catch (error) {
            console.warn(
                `[DiagramAccessChanged] failed to subscribe (user.${userId})`,
                error
            );
            return;
        }

        return () => {
            try {
                channel?.stopListening(
                    '.DiagramAccessChanged',
                    handleDiagramAccessChanged
                );
                echo.leaveChannel(`private-user.${userId}`);
            } catch (error) {
                console.warn(
                    `[DiagramAccessChanged] failed to cleanup (user.${userId})`,
                    error
                );
            }
        };
    }, [isLoading, isAuthenticated, userId, currentDiagramId]);
};
