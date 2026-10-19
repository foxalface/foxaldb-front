import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '@/context/alert-context/alert-context';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { deleteDiagram as deleteDiagramApi } from '@/lib/api/diagrams';
import { flushDiagramAutosave } from '@/lib/diagram-autosave/diagram-autosave-controller';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';

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
    } = useChartDB();
    const { diagramAccess } = useDiagramAccess();
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
        !!currentDiagram?.id &&
        isValidBackendDiagramId(currentDiagram.id) &&
        readonly !== true &&
        diagramAccess?.can_edit !== false;

    const handleDeleteDiagramAction = useCallback(async () => {
        if (!currentDiagram?.id) {
            return;
        }

        if (isAuthenticated && isValidBackendDiagramId(currentDiagram.id)) {
            await deleteDiagramApi(String(currentDiagram.id));
            navigate('/');
            return;
        }

        if (isAuthenticated) {
            return;
        }

        try {
            await deleteLocalDiagram();
            onActiveDiagramDeleted?.();
        } catch {
            // Deletion failure must not transition entry flow to creatingDiagram.
        }
    }, [
        currentDiagram?.id,
        isAuthenticated,
        deleteLocalDiagram,
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

        if (!currentDiagram || !isValidBackendDiagramId(currentDiagram.id)) {
            return;
        }

        await flushDiagramAutosave();
    }, [currentDiagram, updateDiagramUpdatedAt]);

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
        showAlert({
            title: t('delete_diagram_alert.title'),
            description: t('delete_diagram_alert.description'),
            actionLabel: t('delete_diagram_alert.delete'),
            closeLabel: t('delete_diagram_alert.cancel'),
            onAction: handleDeleteDiagramAction,
        });
    }, [showAlert, t, handleDeleteDiagramAction]);

    return {
        canMergeDiagram,
        createNewDiagram,
        openDiagram,
        handleSaveDiagram,
        openExportWizard,
        openMergeWizard,
        confirmDeleteDiagram,
    };
};
