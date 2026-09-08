import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useTranslation } from 'react-i18next';
import { useDialog } from '@/hooks/use-dialog';
import { useChartDB } from '@/hooks/use-chartdb';
import { useAuth } from '@/hooks/use-auth';
import { useExportImage } from '@/hooks/use-export-image';
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter';
import { ExportWizardStep } from './export-wizard-step';
import type { ExportTargetId } from './export-target-id';
import { ExportTargetPickerStep } from './export-target-picker-step';
import type { ExportAvailabilityContext } from './export-target-availability';
import { ExportSqlTargetStep } from './sql/export-sql-target-step';
import { ExportSqlUnsupportedStep } from './sql/export-sql-unsupported-step';
import { ExportSqlPreviewStep } from './sql/export-sql-preview-step';
import { ExportSqlBranchContext } from './sql/export-sql-branch-context';
import type { DatabaseType } from '@/lib/domain/database-type';
import { databaseTypeToLabelMap } from '@/lib/databases';
import {
    getDeterministicSqlExportTargets,
    isDeterministicSqlExportSourceSupported,
} from '@/lib/data/sql-export/deterministic-sql-export-capability';
import { exportBaseSQL } from '@/lib/data/sql-export/export-sql-script';
import { getFilteredDiagramForSqlExport } from '@/lib/data/sql-export/get-filtered-diagram-for-sql-export';
import { cn } from '@/lib/utils';

export interface ExportWizardDialogProps extends BaseDialogProps {}

export const ExportWizardDialog: React.FC<ExportWizardDialogProps> = ({
    dialog,
}) => {
    const { t } = useTranslation();
    const { databaseType, currentDiagram } = useChartDB();
    const { filter } = useDiagramFilter();
    const { isAuthenticated } = useAuth();
    const { exportImage } = useExportImage();
    const {
        closeExportWizardDialog,
        openExportDiagramDialog,
        openExportImageDialog,
        openExportLaravelMigrationsDialog,
    } = useDialog();

    const [step, setStep] = useState<ExportWizardStep>(
        ExportWizardStep.TARGET_PICKER
    );
    const [sqlTargetDatabaseType, setSqlTargetDatabaseType] =
        useState<DatabaseType | null>(null);
    const [sqlScript, setSqlScript] = useState<string | undefined>(undefined);
    const [sqlHasError, setSqlHasError] = useState(false);
    const [isSqlGenerating, setIsSqlGenerating] = useState(false);

    const resetSqlBranchState = useCallback(() => {
        setSqlTargetDatabaseType(null);
        setSqlScript(undefined);
        setSqlHasError(false);
        setIsSqlGenerating(false);
    }, []);

    const resetWizardState = useCallback(() => {
        setStep(ExportWizardStep.TARGET_PICKER);
        resetSqlBranchState();
    }, [resetSqlBranchState]);

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

    const sqlExportTargets = useMemo(
        () => getDeterministicSqlExportTargets(databaseType),
        [databaseType]
    );

    const isSqlSourceSupported =
        isDeterministicSqlExportSourceSupported(databaseType);

    const closeAndRun = useCallback(
        (action: () => void) => {
            closeExportWizardDialog();
            action();
        },
        [closeExportWizardDialog]
    );

    const handleSelectTarget = useCallback(
        (targetId: ExportTargetId) => {
            if (targetId === 'sql') {
                resetSqlBranchState();
                setStep(ExportWizardStep.SQL_TARGET);
                return;
            }

            switch (targetId) {
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
            exportImage,
            openExportDiagramDialog,
            openExportImageDialog,
            openExportLaravelMigrationsDialog,
            resetSqlBranchState,
        ]
    );

    const handleSelectSqlTarget = useCallback(
        (targetDatabaseType: DatabaseType) => {
            setSqlTargetDatabaseType(targetDatabaseType);
            setSqlScript(undefined);
            setSqlHasError(false);
            setStep(ExportWizardStep.SQL_PREVIEW);
        },
        []
    );

    const handleBack = useCallback(() => {
        if (step === ExportWizardStep.SQL_PREVIEW) {
            setSqlScript(undefined);
            setSqlHasError(false);
            setIsSqlGenerating(false);
            setStep(ExportWizardStep.SQL_TARGET);
            return;
        }

        if (step === ExportWizardStep.SQL_TARGET) {
            resetSqlBranchState();
            setStep(ExportWizardStep.TARGET_PICKER);
        }
    }, [resetSqlBranchState, step]);

    useEffect(() => {
        if (
            step !== ExportWizardStep.SQL_PREVIEW ||
            !sqlTargetDatabaseType ||
            sqlScript !== undefined ||
            sqlHasError
        ) {
            return;
        }

        let cancelled = false;

        const generateSql = async () => {
            setIsSqlGenerating(true);
            setSqlHasError(false);

            try {
                const filteredDiagram = getFilteredDiagramForSqlExport(
                    currentDiagram,
                    filter ?? {},
                    sqlTargetDatabaseType
                );
                const script = await exportBaseSQL({
                    diagram: filteredDiagram,
                    targetDatabaseType: sqlTargetDatabaseType,
                });

                if (!cancelled) {
                    setSqlScript(script);
                }
            } catch {
                if (!cancelled) {
                    setSqlHasError(true);
                }
            } finally {
                if (!cancelled) {
                    setIsSqlGenerating(false);
                }
            }
        };

        void generateSql();

        return () => {
            cancelled = true;
        };
    }, [
        currentDiagram,
        filter,
        sqlHasError,
        sqlScript,
        sqlTargetDatabaseType,
        step,
    ]);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                closeExportWizardDialog();
            }
        },
        [closeExportWizardDialog]
    );

    const showBackButton =
        step === ExportWizardStep.SQL_TARGET ||
        step === ExportWizardStep.SQL_PREVIEW;

    const isSqlBranch =
        step === ExportWizardStep.SQL_TARGET ||
        step === ExportWizardStep.SQL_PREVIEW;

    const dialogTitle = t('export_wizard.title');

    const dialogDescription = useMemo(() => {
        switch (step) {
            case ExportWizardStep.SQL_TARGET:
                return t('export_wizard.sql.target_step.description', {
                    database: databaseTypeToLabelMap[databaseType],
                });
            case ExportWizardStep.SQL_PREVIEW:
                return sqlTargetDatabaseType
                    ? t('export_wizard.sql.preview_step.description', {
                          database:
                              databaseTypeToLabelMap[sqlTargetDatabaseType],
                      })
                    : undefined;
            default:
                return t('export_wizard.description');
        }
    }, [databaseType, sqlTargetDatabaseType, step, t]);

    const isWideDialog = step === ExportWizardStep.SQL_PREVIEW;

    const isSqlPreview = step === ExportWizardStep.SQL_PREVIEW;

    return (
        <Dialog {...dialog} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn(
                    'flex max-h-dvh w-full flex-col overflow-hidden',
                    isWideDialog ? 'max-w-3xl' : 'max-w-md'
                )}
                showClose
            >
                <DialogHeader className="shrink-0">
                    {isSqlBranch ? (
                        <ExportSqlBranchContext
                            targetDatabaseType={
                                isSqlPreview ? sqlTargetDatabaseType : null
                            }
                        />
                    ) : null}
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    {dialogDescription ? (
                        <DialogDescription>
                            {dialogDescription}
                        </DialogDescription>
                    ) : null}
                </DialogHeader>

                <div
                    className={cn(
                        'min-h-0 flex-1',
                        isSqlPreview
                            ? 'flex flex-col overflow-hidden'
                            : 'overflow-y-auto'
                    )}
                    data-testid="export-wizard-scroll-body"
                >
                    {step === ExportWizardStep.TARGET_PICKER ? (
                        <ExportTargetPickerStep
                            availabilityContext={availabilityContext}
                            databaseType={databaseType}
                            onSelectTarget={handleSelectTarget}
                        />
                    ) : null}

                    {step === ExportWizardStep.SQL_TARGET ? (
                        isSqlSourceSupported ? (
                            <ExportSqlTargetStep
                                sourceDatabaseType={databaseType}
                                targets={sqlExportTargets}
                                onSelectTarget={handleSelectSqlTarget}
                            />
                        ) : (
                            <ExportSqlUnsupportedStep
                                sourceDatabaseType={databaseType}
                            />
                        )
                    ) : null}

                    {step === ExportWizardStep.SQL_PREVIEW &&
                    sqlTargetDatabaseType ? (
                        <ExportSqlPreviewStep
                            diagramName={currentDiagram.name ?? 'diagram'}
                            sourceDatabaseType={databaseType}
                            targetDatabaseType={sqlTargetDatabaseType}
                            script={sqlScript}
                            isLoading={isSqlGenerating}
                            hasError={sqlHasError}
                        />
                    ) : null}
                </div>

                {showBackButton ? (
                    <DialogFooter className="shrink-0 !justify-start gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleBack}
                        >
                            {t('export_wizard.back')}
                        </Button>
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
