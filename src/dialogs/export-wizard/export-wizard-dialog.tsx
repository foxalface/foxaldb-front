import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useTranslation } from 'react-i18next';
import { useDialog } from '@/hooks/use-dialog';
import { useChartDB } from '@/hooks/use-chartdb';
import { useAuth } from '@/hooks/use-auth';
import { useExportImage } from '@/hooks/use-export-image';
import { ExportWizardStep } from './export-wizard-step';
import type { ExportTargetId } from './export-target-id';
import { ExportTargetPickerStep } from './export-target-picker-step';
import type { ExportAvailabilityContext } from './export-target-availability';

export interface ExportWizardDialogProps extends BaseDialogProps {}

export const ExportWizardDialog: React.FC<ExportWizardDialogProps> = ({
    dialog,
}) => {
    const { t } = useTranslation();
    const { databaseType, currentDiagram } = useChartDB();
    const { isAuthenticated } = useAuth();
    const { exportImage } = useExportImage();
    const {
        closeExportWizardDialog,
        openExportSQLDialog,
        openExportDiagramDialog,
        openExportImageDialog,
        openExportLaravelMigrationsDialog,
    } = useDialog();

    const [step, setStep] = useState<ExportWizardStep>(
        ExportWizardStep.TARGET_PICKER
    );
    const [selectedTarget, setSelectedTarget] = useState<ExportTargetId | null>(
        null
    );

    const resetWizardState = useCallback(() => {
        setStep(ExportWizardStep.TARGET_PICKER);
        setSelectedTarget(null);
    }, []);

    useEffect(() => {
        if (dialog.open) {
            resetWizardState();
        }
    }, [dialog.open, resetWizardState]);

    const availabilityContext = useMemo<ExportAvailabilityContext>(
        () => ({
            isAuthenticated,
            diagramId: currentDiagram?.id,
        }),
        [isAuthenticated, currentDiagram?.id]
    );

    const closeAndRun = useCallback(
        (action: () => void) => {
            closeExportWizardDialog();
            action();
        },
        [closeExportWizardDialog]
    );

    const routeToTarget = useCallback(
        (targetId: ExportTargetId) => {
            setSelectedTarget(targetId);

            switch (targetId) {
                case 'sql':
                    closeAndRun(() =>
                        openExportSQLDialog({
                            targetDatabaseType: databaseType,
                        })
                    );
                    return;
                case 'diagram_json':
                    closeAndRun(() => openExportDiagramDialog({}));
                    return;
                case 'png':
                    closeAndRun(() => openExportImageDialog({ format: 'png' }));
                    return;
                case 'jpg':
                    closeAndRun(() =>
                        openExportImageDialog({ format: 'jpeg' })
                    );
                    return;
                case 'svg':
                    closeAndRun(() =>
                        exportImage('svg', {
                            scale: 1,
                            transparent: true,
                            includePatternBG: false,
                        })
                    );
                    return;
                case 'laravel':
                    if (!currentDiagram?.id) {
                        return;
                    }

                    closeAndRun(() =>
                        openExportLaravelMigrationsDialog({
                            diagramId: String(currentDiagram.id),
                            diagramName: currentDiagram.name ?? 'diagram',
                        })
                    );
                    return;
                default:
                    return;
            }
        },
        [
            closeAndRun,
            currentDiagram?.id,
            currentDiagram?.name,
            databaseType,
            exportImage,
            openExportDiagramDialog,
            openExportImageDialog,
            openExportLaravelMigrationsDialog,
            openExportSQLDialog,
        ]
    );

    const handleSelectTarget = useCallback(
        (targetId: ExportTargetId) => {
            routeToTarget(targetId);
        },
        [routeToTarget]
    );

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                closeExportWizardDialog();
            }
        },
        [closeExportWizardDialog]
    );

    return (
        <Dialog {...dialog} onOpenChange={handleOpenChange}>
            <DialogContent
                className="flex max-h-dvh w-full max-w-md flex-col overflow-hidden"
                showClose
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>{t('export_wizard.title')}</DialogTitle>
                    <DialogDescription>
                        {t('export_wizard.description')}
                    </DialogDescription>
                </DialogHeader>

                <div
                    className="min-h-0 flex-1 overflow-y-auto"
                    data-testid="export-wizard-scroll-body"
                >
                    {step === ExportWizardStep.TARGET_PICKER ? (
                        <ExportTargetPickerStep
                            availabilityContext={availabilityContext}
                            databaseType={databaseType}
                            onSelectTarget={handleSelectTarget}
                        />
                    ) : null}

                    {selectedTarget ? (
                        <span className="sr-only">{selectedTarget}</span>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
};
