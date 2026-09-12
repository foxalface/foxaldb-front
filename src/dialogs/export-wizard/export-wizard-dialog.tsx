import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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
import {
    DEFAULT_LARAVEL_VERSION,
    exportLaravelMigrations,
    type LaravelVersion,
} from '@/lib/api/diagram-laravel-export';
import { downloadBlob } from '@/lib/download-blob';
import { buildLaravelExportFilename } from '@/lib/laravel-export/build-laravel-export-filename';
import {
    resolveLaravelExportErrorCode,
    type LaravelExportErrorCode,
} from '@/lib/laravel-export/resolve-laravel-export-error-code';
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
import { ExportLaravelOptionsStep } from './laravel/export-laravel-options-step';
import { ExportLaravelBranchContext } from './laravel/export-laravel-branch-context';
import { ExportPrismaVersionStep } from './prisma/export-prisma-version-step';
import { ExportPrismaPreviewStep } from './prisma/export-prisma-preview-step';
import { ExportPrismaBranchContext } from './prisma/export-prisma-branch-context';
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
import { ApiError } from '@/lib/api/client';
import { exportPrismaSchema } from '@/lib/api/prisma-export';
import type {
    PrismaExportError,
    PrismaExportNote,
    PrismaExportVersion,
} from '@/lib/api/prisma-export-types';

export interface ExportWizardDialogProps extends BaseDialogProps {}

export const ExportWizardDialog: React.FC<ExportWizardDialogProps> = ({
    dialog,
}) => {
    const { t } = useTranslation();
    const { databaseType, currentDiagram } = useChartDB();
    const { filter } = useDiagramFilter();
    const { isAuthenticated } = useAuth();
    const { exportImage } = useExportImage();
    const { closeExportWizardDialog } = useDialog();

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
    const [laravelVersion, setLaravelVersion] = useState<LaravelVersion>(
        DEFAULT_LARAVEL_VERSION
    );
    const [laravelIncludeIndexes, setLaravelIncludeIndexes] = useState(true);
    const [laravelIncludeForeignKeys, setLaravelIncludeForeignKeys] =
        useState(true);
    const [isLaravelExporting, setIsLaravelExporting] = useState(false);
    const [laravelErrorCode, setLaravelErrorCode] =
        useState<LaravelExportErrorCode | null>(null);
    const [prismaVersion, setPrismaVersion] =
        useState<PrismaExportVersion>('7');
    const [prismaSchema, setPrismaSchema] = useState<string | undefined>(
        undefined
    );
    const [prismaNotes, setPrismaNotes] = useState<PrismaExportNote[]>([]);
    const [prismaGenerationError, setPrismaGenerationError] =
        useState<PrismaExportError | null>(null);
    const [prismaHasUnexpectedError, setPrismaHasUnexpectedError] =
        useState(false);
    const [isPrismaGenerating, setIsPrismaGenerating] = useState(false);
    const prismaExportRequestIdRef = useRef(0);

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

    const resetLaravelBranchState = useCallback(() => {
        setLaravelVersion(DEFAULT_LARAVEL_VERSION);
        setLaravelIncludeIndexes(true);
        setLaravelIncludeForeignKeys(true);
        setIsLaravelExporting(false);
        setLaravelErrorCode(null);
    }, []);

    const resetPrismaBranchState = useCallback(() => {
        prismaExportRequestIdRef.current += 1;
        setPrismaVersion('7');
        setPrismaSchema(undefined);
        setPrismaNotes([]);
        setPrismaGenerationError(null);
        setPrismaHasUnexpectedError(false);
        setIsPrismaGenerating(false);
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
        resetLaravelBranchState();
        resetPrismaBranchState();
    }, [
        resetDbmlBranchState,
        resetLaravelBranchState,
        resetPrismaBranchState,
        resetSqlBranchState,
        resetVisualBranchState,
    ]);

    useEffect(() => {
        if (dialog.open) {
            resetWizardState();
        }
    }, [dialog.open, resetWizardState]);

    const availabilityContext = useMemo<ExportAvailabilityContext>(
        () => ({
            isAuthenticated,
            diagramId: currentDiagram?.id,
            databaseType,
        }),
        [databaseType, isAuthenticated, currentDiagram?.id]
    );

    const sqlExportTargets = useMemo(
        () => getDeterministicSqlExportTargets(databaseType),
        [databaseType]
    );

    const isSqlSourceSupported =
        isDeterministicSqlExportSourceSupported(databaseType);

    const handleSelectTarget = useCallback(
        (targetId: ExportTargetId) => {
            if (targetId === 'sql') {
                resetSqlBranchState();
                resetDbmlBranchState();
                resetVisualBranchState();
                resetLaravelBranchState();
                resetPrismaBranchState();
                setStep(ExportWizardStep.SQL_TARGET);
                return;
            }

            if (targetId === 'dbml') {
                resetDbmlBranchState();
                resetSqlBranchState();
                resetVisualBranchState();
                resetLaravelBranchState();
                resetPrismaBranchState();
                setStep(ExportWizardStep.DBML_PREVIEW);
                return;
            }

            if (targetId === 'diagram_json') {
                resetSqlBranchState();
                resetDbmlBranchState();
                resetVisualBranchState();
                resetLaravelBranchState();
                resetPrismaBranchState();
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
                resetLaravelBranchState();
                resetPrismaBranchState();
                applyVisualFormatDefaults(targetId);
                setStep(ExportWizardStep.VISUAL_OPTIONS);
                return;
            }

            if (targetId === 'laravel') {
                resetSqlBranchState();
                resetDbmlBranchState();
                resetVisualBranchState();
                resetLaravelBranchState();
                resetPrismaBranchState();
                setStep(ExportWizardStep.LARAVEL_OPTIONS);
                return;
            }

            if (targetId === 'prisma') {
                resetSqlBranchState();
                resetDbmlBranchState();
                resetVisualBranchState();
                resetLaravelBranchState();
                resetPrismaBranchState();
                setStep(ExportWizardStep.PRISMA_VERSION);
            }
        },
        [
            applyVisualFormatDefaults,
            resetDbmlBranchState,
            resetLaravelBranchState,
            resetPrismaBranchState,
            resetSqlBranchState,
            resetVisualBranchState,
        ]
    );

    const handleContinuePrismaVersion = useCallback(() => {
        prismaExportRequestIdRef.current += 1;
        setPrismaSchema(undefined);
        setPrismaNotes([]);
        setPrismaGenerationError(null);
        setPrismaHasUnexpectedError(false);
        setIsPrismaGenerating(false);
        setStep(ExportWizardStep.PRISMA_PREVIEW);
    }, []);

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
        if (isVisualExporting || isLaravelExporting) {
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

        if (step === ExportWizardStep.LARAVEL_OPTIONS) {
            resetLaravelBranchState();
            setStep(ExportWizardStep.TARGET_PICKER);
            return;
        }

        if (step === ExportWizardStep.DBML_PREVIEW) {
            resetDbmlBranchState();
            setStep(ExportWizardStep.TARGET_PICKER);
            return;
        }

        if (step === ExportWizardStep.PRISMA_PREVIEW) {
            prismaExportRequestIdRef.current += 1;
            setPrismaSchema(undefined);
            setPrismaNotes([]);
            setPrismaGenerationError(null);
            setPrismaHasUnexpectedError(false);
            setIsPrismaGenerating(false);
            setStep(ExportWizardStep.PRISMA_VERSION);
            return;
        }

        if (step === ExportWizardStep.PRISMA_VERSION) {
            resetPrismaBranchState();
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
        isLaravelExporting,
        isVisualExporting,
        resetDbmlBranchState,
        resetLaravelBranchState,
        resetPrismaBranchState,
        resetSqlBranchState,
        resetVisualBranchState,
        step,
    ]);

    useEffect(() => {
        if (
            step !== ExportWizardStep.PRISMA_PREVIEW ||
            prismaSchema !== undefined ||
            prismaGenerationError !== null ||
            prismaHasUnexpectedError
        ) {
            return;
        }

        const requestId = prismaExportRequestIdRef.current;
        let cancelled = false;

        setIsPrismaGenerating(true);

        void (async () => {
            try {
                const result = await exportPrismaSchema({
                    diagram: currentDiagram,
                    version: prismaVersion,
                });

                if (
                    cancelled ||
                    requestId !== prismaExportRequestIdRef.current
                ) {
                    return;
                }

                if (!result.success) {
                    setPrismaGenerationError(result.error);
                    return;
                }

                setPrismaSchema(result.schema);
                setPrismaNotes(result.notes);
            } catch (error) {
                if (
                    cancelled ||
                    requestId !== prismaExportRequestIdRef.current
                ) {
                    return;
                }

                if (error instanceof ApiError) {
                    setPrismaHasUnexpectedError(true);
                    return;
                }

                setPrismaHasUnexpectedError(true);
            } finally {
                if (
                    !cancelled &&
                    requestId === prismaExportRequestIdRef.current
                ) {
                    setIsPrismaGenerating(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        currentDiagram,
        prismaGenerationError,
        prismaHasUnexpectedError,
        prismaSchema,
        prismaVersion,
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

    const handleLaravelExport = useCallback(async () => {
        if (isLaravelExporting || !currentDiagram?.id) {
            return;
        }

        setIsLaravelExporting(true);
        setLaravelErrorCode(null);

        try {
            const blob = await exportLaravelMigrations(currentDiagram.id, {
                laravelVersion,
                includeIndexes: laravelIncludeIndexes,
                includeForeignKeys: laravelIncludeForeignKeys,
                content: currentDiagram,
            });

            downloadBlob(
                blob,
                buildLaravelExportFilename(currentDiagram.name ?? 'diagram')
            );
        } catch (error) {
            setLaravelErrorCode(resolveLaravelExportErrorCode(error));
        } finally {
            setIsLaravelExporting(false);
        }
    }, [
        currentDiagram,
        isLaravelExporting,
        laravelIncludeForeignKeys,
        laravelIncludeIndexes,
        laravelVersion,
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
        step === ExportWizardStep.VISUAL_OPTIONS ||
        step === ExportWizardStep.LARAVEL_OPTIONS ||
        step === ExportWizardStep.PRISMA_VERSION ||
        step === ExportWizardStep.PRISMA_PREVIEW;

    const isSqlBranch =
        step === ExportWizardStep.SQL_TARGET ||
        step === ExportWizardStep.SQL_PREVIEW;

    const isDbmlBranch = step === ExportWizardStep.DBML_PREVIEW;
    const isJsonBranch = step === ExportWizardStep.JSON_DOWNLOAD;
    const isVisualBranch = step === ExportWizardStep.VISUAL_OPTIONS;
    const isLaravelBranch = step === ExportWizardStep.LARAVEL_OPTIONS;
    const isPrismaBranch =
        step === ExportWizardStep.PRISMA_VERSION ||
        step === ExportWizardStep.PRISMA_PREVIEW;

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
            case ExportWizardStep.LARAVEL_OPTIONS:
                return t('export_wizard.laravel.options_step.description');
            case ExportWizardStep.PRISMA_VERSION:
                return t('export_wizard.prisma.version_step.description');
            case ExportWizardStep.PRISMA_PREVIEW:
                return t('export_wizard.prisma.preview_step.description');
            default:
                return t('export_wizard.description');
        }
    }, [databaseType, sqlTargetDatabaseType, step, t, visualFormat]);

    const isWideDialog =
        step === ExportWizardStep.SQL_PREVIEW ||
        step === ExportWizardStep.DBML_PREVIEW ||
        step === ExportWizardStep.PRISMA_PREVIEW;

    const isSqlPreview = step === ExportWizardStep.SQL_PREVIEW;
    const isDbmlPreview = step === ExportWizardStep.DBML_PREVIEW;
    const isPrismaPreview = step === ExportWizardStep.PRISMA_PREVIEW;
    const isPreviewStep = isSqlPreview || isDbmlPreview || isPrismaPreview;

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
                    {isLaravelBranch ? <ExportLaravelBranchContext /> : null}
                    {isPrismaBranch ? (
                        <ExportPrismaBranchContext
                            version={
                                step === ExportWizardStep.PRISMA_PREVIEW
                                    ? prismaVersion
                                    : null
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

                    {step === ExportWizardStep.PRISMA_VERSION ? (
                        <ExportPrismaVersionStep
                            selectedVersion={prismaVersion}
                            onSelectVersion={setPrismaVersion}
                            onContinue={handleContinuePrismaVersion}
                        />
                    ) : null}

                    {step === ExportWizardStep.PRISMA_PREVIEW ? (
                        <ExportPrismaPreviewStep
                            schema={prismaSchema}
                            notes={prismaNotes}
                            generationError={prismaGenerationError}
                            isLoading={isPrismaGenerating}
                            hasUnexpectedError={prismaHasUnexpectedError}
                        />
                    ) : null}

                    {step === ExportWizardStep.LARAVEL_OPTIONS ? (
                        <ExportLaravelOptionsStep
                            diagramName={currentDiagram.name ?? 'diagram'}
                            laravelVersion={laravelVersion}
                            includeIndexes={laravelIncludeIndexes}
                            includeForeignKeys={laravelIncludeForeignKeys}
                            isExporting={isLaravelExporting}
                            errorCode={laravelErrorCode}
                            onLaravelVersionChange={setLaravelVersion}
                            onIncludeIndexesChange={setLaravelIncludeIndexes}
                            onIncludeForeignKeysChange={
                                setLaravelIncludeForeignKeys
                            }
                            onExport={() => {
                                void handleLaravelExport();
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
                            disabled={isVisualExporting || isLaravelExporting}
                        >
                            {t('export_wizard.back')}
                        </Button>
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
