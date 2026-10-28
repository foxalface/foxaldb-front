import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '@/context/alert-context/alert-context';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import {
    useDiagramLocation,
    useOnlineDiagramId,
} from '@/hooks/use-diagram-location';
import { deleteDiagram as deleteDiagramApi } from '@/lib/api/diagrams';
import {
    isDeviceDiagramLocation,
    isOnlineDiagramLocation,
} from '@/lib/diagram/diagram-location';
import {
    abandonDiagramAutosave,
    flushDiagramAutosave,
} from '@/lib/diagram-autosave/diagram-autosave-controller';
import { clearPendingDiagramOperationSyncTimers } from '@/lib/realtime/diagram-sync-state';
import { createBlankDiagramView } from '@/lib/realtime/kick-out-of-diagram';

export interface UseDiagramMenuActionsOptions {
    onActiveDiagramDeleted?: () => void;
}

export const useDiagramMenuActions = (
    options: UseDiagramMenuActionsOptions = {}
) => {
    const { onActiveDiagramDeleted } = options;
    const {
        updateDiagramUpdatedAt,
        currentDiagram,
        readonly,
        deleteDiagram: deleteLocalDiagram,
        loadDiagramFromData,
    } = useChartDB();
    const { diagramAccess, clearDiagramAccess } = useDiagramAccess();
    const { location, setDiagramLocation } = useDiagramLocation();
    const onlineDiagramId = useOnlineDiagramId();
    const {
        openCreateDiagramDialog,
        openOpenDiagramDialog,
        openExportWizardDialog,
        openMergeWizardDialog,
    } = useDialog();
    const { isAuthenticated } = useAuth();
    const { showAlert } = useAlert();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const canMergeDiagram =
        isAuthenticated &&
        onlineDiagramId !== null &&
        readonly !== true &&
        diagramAccess?.can_edit !== false;

    const canDeleteDiagram = Boolean(
        currentDiagram?.id &&
        (isDeviceDiagramLocation(location) ||
            (isOnlineDiagramLocation(location) &&
                currentDiagram.id === location.diagramId &&
                diagramAccess?.role === 'owner'))
    );

    const handleDeleteDiagramAction = useCallback(async () => {
        if (!currentDiagram?.id) {
            return;
        }

        if (isOnlineDiagramLocation(location)) {
            if (
                diagramAccess?.role !== 'owner' ||
                currentDiagram.id !== location.diagramId
            ) {
                return;
            }

            try {
                await deleteDiagramApi(location.diagramId);
            } catch {
                return;
            }

            abandonDiagramAutosave();
            clearPendingDiagramOperationSyncTimers();
            loadDiagramFromData(createBlankDiagramView());
            clearDiagramAccess();
            setDiagramLocation(null);
            navigate('/');
            return;
        }

        if (!isDeviceDiagramLocation(location)) {
            return;
        }

        if (currentDiagram.id !== location.localId) {
            return;
        }

        try {
            await deleteLocalDiagram();
        } catch {
            return;
        }

        setDiagramLocation(null);

        if (!isAuthenticated) {
            onActiveDiagramDeleted?.();
            return;
        }

        navigate('/');
    }, [
        currentDiagram?.id,
        location,
        diagramAccess?.role,
        isAuthenticated,
        deleteLocalDiagram,
        loadDiagramFromData,
        clearDiagramAccess,
        setDiagramLocation,
        onActiveDiagramDeleted,
        navigate,
    ]);

    const createNewDiagram = useCallback(() => {
        openCreateDiagramDialog();
    }, [openCreateDiagramDialog]);

    const openDiagram = useCallback(() => {
        openOpenDiagramDialog();
    }, [openOpenDiagramDialog]);

    const handleSaveDiagram = useCallback(async () => {
        updateDiagramUpdatedAt();

        if (onlineDiagramId === null) {
            return;
        }

        await flushDiagramAutosave();
    }, [onlineDiagramId, updateDiagramUpdatedAt]);

    const openExportWizard = useCallback(() => {
        openExportWizardDialog();
    }, [openExportWizardDialog]);

    const openMergeWizard = useCallback(() => {
        if (!canMergeDiagram) {
            return;
        }

        openMergeWizardDialog();
    }, [canMergeDiagram, openMergeWizardDialog]);

    const confirmDeleteDiagram = useCallback(() => {
        if (!canDeleteDiagram) {
            return;
        }

        showAlert({
            title: t('delete_diagram_alert.title'),
            description: t('delete_diagram_alert.description'),
            actionLabel: t('delete_diagram_alert.delete'),
            closeLabel: t('delete_diagram_alert.cancel'),
            onAction: handleDeleteDiagramAction,
        });
    }, [canDeleteDiagram, showAlert, t, handleDeleteDiagramAction]);

    return {
        canMergeDiagram,
        canDeleteDiagram,
        createNewDiagram,
        openDiagram,
        handleSaveDiagram,
        openExportWizard,
        openMergeWizard,
        confirmDeleteDiagram,
    };
};
