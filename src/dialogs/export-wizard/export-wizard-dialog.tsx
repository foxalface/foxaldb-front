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
import { ExportDbmlPreviewStep } from './dbml/export-dbml-preview-step';
import { ExportDbmlBranchContext } from './dbml/export-dbml-branch-context';
import { ExportJsonDownloadStep } from './json/export-json-download-step';
import { ExportJsonBranchContext } from './json/export-json-branch-context';
import { ExportVisualOptionsStep } from './visual/export-visual-options-step';
import { ExportVisualBranchContext } from './visual/export-visual-branch-context';
import type { DatabaseType } from '@/lib/domain/database-type';
import { databaseTypeToLabelMap } from '@/lib/databases';
import {
    getDeterministicSqlExportTargets,
    isDeterministicSqlExportSourceSupported,
} from '@/lib/data/sql-export/deterministic-sql-export-capability';
import { exportBaseSQL } from '@/lib/data/sql-export/export-sql-script';
import { getFilteredDiagramForSqlExport } from '@/lib/data/sql-export/get-filtered-diagram-for-sql-export';
import { generateDBMLFromDiagram } from '@/lib/dbml/dbml-export/dbml-export';
import { cn } from '@/lib/utils';
import type {
    VisualExportExtent,
    VisualExportFormat,
} from '@/lib/visual-export/visual-export-options';
import {
    DEFAULT_VISUAL_EXPORT_EXTENT,
    DEFAULT_VISUAL_EXPORT_SCALE,
    VisualExportError,
    getDefaultIncludePattern,
} from '@/lib/visual-export/visual-export-options';

export interface ExportWizardDialogProps extends BaseDialogProps {}

export const ExportWizardDialog: React.FC<ExportWizardDialogProps> = ({
    dialog,
}) => {
    const { t } = useTranslation();
    const { databaseType, currentDiagram } = useChartDB();
    const { filter } = useDiagramFilter();
    const { isAuthenticated } = useAuth();
    const { exportImage } = useExportImage();
    const { closeExportWizardDialog, openExportLaravelMigrationsDialog } =
        useDialog();

    const [step, setStep] = useState<ExportWizardStep>(
        ExportWizardStep.TARGET_PICKER
    );
    const [sqlTargetDatabaseType, setSqlTargetDatabaseType] =
        useState<DatabaseType | null>(null);
    const [sqlScript, setSqlScript] = useState<string | undefined>(undefined);
    const [sqlHasError, setSqlHasError] = useState(false);
    const [isSqlGenerating, setIsSqlGenerating] = useState(false);
    const [dbmlContent, setDbmlContent] = useState<string | undefined>(
        undefined
    );
    const [dbmlHasError, setDbmlHasError] = useState(false);
    const [isDbmlGenerating, setIsDbmlGenerating] = useState(false);
    const [visualFormat, setVisualFormat] = useState<VisualExportFormat | null>(
        null
    );
    const [visualExtent, setVisualExtent] = useState<VisualExportExtent>(
        DEFAULT_VISUAL_EXPORT_EXTENT
    );
    const [visualScale, setVisualScale] = useState(DEFAULT_VISUAL_EXPORT_SCALE);
    const [visualIncludePatternBG, setVisualIncludePatternBG] = useState(true);
    const [visualTransparent, setVisualTransparent] = useState(false);
    const [isVisualExporting, setIsVisualExporting] = useState(false);
    const [visualErrorCode, setVisualErrorCode] = useState<string | null>(null);

    const resetSqlBranchState = useCallback(() => {
        setSqlTargetDatabaseType(null);
        setSqlScript(undefined);
        setSqlHasError(false);
        setIsSqlGenerating(false);
    }, []);

    const resetDbmlBranchState = useCallback(() => {
        setDbmlContent(undefined);
        setDbmlHasError(false);
        setIsDbmlGenerating(false);
    }, []);

    const resetVisualBranchState = useCallback(() => {
        setVisualFormat(null);
        setVisualExtent(DEFAULT_VISUAL_EXPORT_EXTENT);
        setVisualScale(DEFAULT_VISUAL_EXPORT_SCALE);
        setVisualIncludePatternBG(true);
        setVisualTransparent(false);
        setIsVisualExporting(false);
        setVisualErrorCode(null);
    }, []);

    const applyVisualFormatDefaults = useCallback(
        (format: VisualExportFormat) => {
            setVisualFormat(format);
            setVisualExtent(DEFAULT_VISUAL_EXPORT_EXTENT);
            setVisualScale(DEFAULT_VISUAL_EXPORT_SCALE);
            setVisualIncludePatternBG(getDefaultIncludePattern(format));
            setVisualTransparent(false);
            setIsVisualExporting(false);
            setVisualErrorCode(null);
        },
        []
    );

    const resetWizardState = useCallback(() => {
        setStep(ExportWizardStep.TARGET_PICKER);
        resetSqlBranchState();
        resetDbmlBranchState();
        resetVisualBranchState();
    }, [resetDbmlBranchState, resetSqlBranchState, resetVisualBranchState]);

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
                resetDbmlBranchState();
                resetVisualBranchState();
                setStep(ExportWizardStep.SQL_TARGET);
                return;
            }

            if (targetId === 'dbml') {
                resetDbmlBranchState();
                resetSqlBranchState();
                resetVisualBranchState();
                setStep(ExportWizardStep.DBML_PREVIEW);
                return;
            }

            if (targetId === 'diagram_json') {
                resetSqlBranchState();
                resetDbmlBranchState();
                resetVisualBranchState();
                setStep(ExportWizardStep.JSON_DOWNLOAD);
                return;
            }

            if (
                targetId === 'png' ||
                targetId === 'jpg' ||
                targetId === 'svg'
            ) {
                resetSqlBranchState();
                resetDbmlBranchState();
                applyVisualFormatDefaults(targetId);
                setStep(ExportWizardStep.VISUAL_OPTIONS);
                return;
            }

            switch (targetId) {
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
            applyVisualFormatDefaults,
            closeAndRun,
            currentDiagram?.id,
            currentDiagram?.name,
            openExportLaravelMigrationsDialog,
            resetSqlBranchState,
            resetDbmlBranchState,
            resetVisualBranchState,
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
        if (isVisualExporting) {
            return;
        }

        if (step === ExportWizardStep.JSON_DOWNLOAD) {
            setStep(ExportWizardStep.TARGET_PICKER);
            return;
        }

        if (step === ExportWizardStep.VISUAL_OPTIONS) {
            resetVisualBranchState();
            setStep(ExportWizardStep.TARGET_PICKER);
            return;
        }

        if (step === ExportWizardStep.DBML_PREVIEW) {
            resetDbmlBranchState();
            setStep(ExportWizardStep.TARGET_PICKER);
            return;
        }

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
    }, [
        isVisualExporting,
        resetDbmlBranchState,
        resetSqlBranchState,
        resetVisualBranchState,
        step,
    ]);

    useEffect(() => {
        if (
            step !== ExportWizardStep.DBML_PREVIEW ||
            dbmlContent !== undefined ||
            dbmlHasError
        ) {
            return;
        }

        let cancelled = false;

        const generateDbml = async () => {
            setIsDbmlGenerating(true);
            setDbmlHasError(false);

            try {
                const result = await generateDBMLFromDiagram(currentDiagram);

                if (cancelled) {
                    return;
                }

                if (result.error && !result.standardDbml) {
                    setDbmlHasError(true);
                    return;
                }

                setDbmlContent(result.standardDbml);
            } catch {
                if (!cancelled) {
                    setDbmlHasError(true);
                }
            } finally {
                if (!cancelled) {
                    setIsDbmlGenerating(false);
                }
            }
        };

        void generateDbml();

        return () => {
            cancelled = true;
        };
    }, [currentDiagram, dbmlContent, dbmlHasError, step]);

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

    const handleVisualExport = useCallback(async () => {
        if (!visualFormat || isVisualExporting) {
            return;
        }

        setIsVisualExporting(true);
        setVisualErrorCode(null);

        try {
            await exportImage(visualFormat, {
                extent: visualExtent,
                scale: visualFormat === 'svg' ? 1 : visualScale,
                includePatternBG: visualIncludePatternBG,
                transparent: visualFormat === 'png' ? visualTransparent : false,
            });
        } catch (error) {
            if (error instanceof VisualExportError) {
                setVisualErrorCode(error.code);
            } else {
                setVisualErrorCode('generation_failed');
            }
        } finally {
            setIsVisualExporting(false);
        }
    }, [
        exportImage,
        isVisualExporting,
        visualExtent,
        visualFormat,
        visualIncludePatternBG,
        visualScale,
        visualTransparent,
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
        step === ExportWizardStep.SQL_PREVIEW ||
        step === ExportWizardStep.DBML_PREVIEW ||
        step === ExportWizardStep.JSON_DOWNLOAD ||
        step === ExportWizardStep.VISUAL_OPTIONS;

    const isSqlBranch =
        step === ExportWizardStep.SQL_TARGET ||
        step === ExportWizardStep.SQL_PREVIEW;

    const isDbmlBranch = step === ExportWizardStep.DBML_PREVIEW;
    const isJsonBranch = step === ExportWizardStep.JSON_DOWNLOAD;
    const isVisualBranch = step === ExportWizardStep.VISUAL_OPTIONS;

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
            case ExportWizardStep.DBML_PREVIEW:
                return t('export_wizard.dbml.preview_step.description');
            case ExportWizardStep.JSON_DOWNLOAD:
                return t('export_wizard.json.download_step.description');
            case ExportWizardStep.VISUAL_OPTIONS:
                return visualFormat
                    ? t('export_wizard.visual.options_step.description', {
                          format: t(
                              `export_wizard.targets.${visualFormat}.title`
                          ),
                      })
                    : undefined;
            default:
                return t('export_wizard.description');
        }
    }, [databaseType, sqlTargetDatabaseType, step, t, visualFormat]);

    const isWideDialog =
        step === ExportWizardStep.SQL_PREVIEW ||
        step === ExportWizardStep.DBML_PREVIEW;

    const isSqlPreview = step === ExportWizardStep.SQL_PREVIEW;
    const isDbmlPreview = step === ExportWizardStep.DBML_PREVIEW;
    const isPreviewStep = isSqlPreview || isDbmlPreview;

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
                    {isDbmlBranch ? <ExportDbmlBranchContext /> : null}
                    {isJsonBranch ? <ExportJsonBranchContext /> : null}
                    {isVisualBranch && visualFormat ? (
                        <ExportVisualBranchContext format={visualFormat} />
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
                        isPreviewStep
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

                    {step === ExportWizardStep.DBML_PREVIEW ? (
                        <ExportDbmlPreviewStep
                            diagramName={currentDiagram.name ?? 'diagram'}
                            dbml={dbmlContent}
                            isLoading={isDbmlGenerating}
                            hasError={dbmlHasError}
                        />
                    ) : null}

                    {step === ExportWizardStep.JSON_DOWNLOAD ? (
                        <ExportJsonDownloadStep diagram={currentDiagram} />
                    ) : null}

                    {step === ExportWizardStep.VISUAL_OPTIONS &&
                    visualFormat ? (
                        <ExportVisualOptionsStep
                            format={visualFormat}
                            diagramName={currentDiagram.name ?? 'diagram'}
                            extent={visualExtent}
                            scale={visualScale}
                            includePatternBG={visualIncludePatternBG}
                            transparent={visualTransparent}
                            isExporting={isVisualExporting}
                            errorCode={visualErrorCode}
                            onExtentChange={setVisualExtent}
                            onScaleChange={setVisualScale}
                            onIncludePatternBGChange={setVisualIncludePatternBG}
                            onTransparentChange={setVisualTransparent}
                            onExport={() => {
                                void handleVisualExport();
                            }}
                        />
                    ) : null}
                </div>

                {showBackButton ? (
                    <DialogFooter className="shrink-0 !justify-start gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleBack}
                            disabled={isVisualExporting}
                        >
                            {t('export_wizard.back')}
                        </Button>
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
