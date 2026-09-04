import React, {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Textarea } from '@/components/textarea/textarea';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { ImportMethod } from '@/lib/import-method/import-method';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import type { Diagram } from '@/lib/domain/diagram';
import {
    ArchiveError,
    ArchiveReader,
    MAX_ARCHIVE_COMPRESSED_BYTES,
    analyzeProjectArchive,
    detectDatabaseGroups,
    getProjectCandidateKey,
    getSelectableCandidates,
    importProject,
    isZipArchiveFile,
} from '@/lib/project-import/types';
import { canExecuteProjectImport } from '@/lib/project-import/project-import-capability';
import type {
    ProjectArchiveAnalysis,
    ProjectDatabaseGroup,
    ProjectDatabaseGroupAnalysis,
    ProjectDetectionCandidate,
} from '@/lib/project-import/project-types';
import { analyzeImportContent } from './analyze-import-content';
import {
    IMPORT_SCHEMA_FILE_ACCEPT,
    MAX_IMPORT_FILE_SIZE_BYTES,
    isImportSchemaFileNameAllowed,
} from './constants';
import { DetectionSummary } from './detection-summary';
import { DialectMismatchPanel } from './dialect-mismatch-panel';
import { DialectResolutionPanel } from './dialect-resolution-panel';
import { ProjectAmbiguityPanel } from './project-ambiguity-panel';
import { ProjectDatabaseGroupPanel } from './project-database-group-panel';
import { ProjectDetectionSummary } from './project-detection-summary';
import {
    ImportPrivacyInfoDialog,
    ImportPrivacyInfoLink,
} from './import-privacy-info-dialog';

export interface ImportSchemaContinueParams {
    importMethod: ImportMethod;
    resolvedSourceDialect?: DatabaseType;
    importedDiagram?: Diagram;
}

interface ImportSchemaStepBaseProps {
    databaseType: DatabaseType;
    scriptResult: string;
    setScriptResult: React.Dispatch<React.SetStateAction<string>>;
    onContinue: (params: ImportSchemaContinueParams) => void | Promise<void>;
    importError?: string | null;
    isImporting?: boolean;
    title?: string;
    continueLabel?: string;
    backLabel?: string;
}

export interface ImportSchemaStepCreateProps extends ImportSchemaStepBaseProps {
    mode?: 'create';
    setDatabaseType: React.Dispatch<React.SetStateAction<DatabaseType>>;
    onBack: () => void;
}

export interface ImportSchemaStepExistingProps extends ImportSchemaStepBaseProps {
    mode: 'existing';
    onBack: () => void;
}

export type ImportSchemaStepProps =
    | ImportSchemaStepCreateProps
    | ImportSchemaStepExistingProps;

const releaseArchiveReader = (archive: ArchiveReader | null): void => {
    archive?.close();
};

export const ImportSchemaStep: React.FC<ImportSchemaStepProps> = (props) => {
    const {
        databaseType,
        scriptResult,
        setScriptResult,
        onContinue,
        onBack,
        importError = null,
        isImporting = false,
        title,
        continueLabel,
        backLabel,
    } = props;

    const mode = props.mode ?? 'create';
    const setDatabaseType =
        mode === 'create' && 'setDatabaseType' in props
            ? props.setDatabaseType
            : undefined;

    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const textareaId = useId();
    const fileInputId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const archiveReaderRef = useRef<ArchiveReader | null>(null);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(
        null
    );
    const [fileErrorKey, setFileErrorKey] = useState<string | null>(null);
    const [userResolvedSourceDialect, setUserResolvedSourceDialect] =
        useState<DatabaseType | null>(null);
    const [projectAnalysis, setProjectAnalysis] =
        useState<ProjectArchiveAnalysis | null>(null);
    const [selectedProjectCandidate, setSelectedProjectCandidate] =
        useState<ProjectDetectionCandidate | null>(null);
    const [databaseGroupAnalysis, setDatabaseGroupAnalysis] =
        useState<ProjectDatabaseGroupAnalysis | null>(null);
    const [selectedDatabaseGroup, setSelectedDatabaseGroup] =
        useState<ProjectDatabaseGroup | null>(null);
    const [isAnalyzingDatabaseGroups, setIsAnalyzingDatabaseGroups] =
        useState(false);
    const [isAnalyzingProject, setIsAnalyzingProject] = useState(false);
    const [isProjectImporting, setIsProjectImporting] = useState(false);
    const [isPrivacyInfoOpen, setIsPrivacyInfoOpen] = useState(false);
    const [projectImportErrorKey, setProjectImportErrorKey] = useState<
        string | null
    >(null);

    const resetProjectArchiveState = useCallback(() => {
        releaseArchiveReader(archiveReaderRef.current);
        archiveReaderRef.current = null;
        setProjectAnalysis(null);
        setSelectedProjectCandidate(null);
        setDatabaseGroupAnalysis(null);
        setSelectedDatabaseGroup(null);
        setIsAnalyzingProject(false);
        setIsAnalyzingDatabaseGroups(false);
    }, []);

    useEffect(() => {
        return () => {
            releaseArchiveReader(archiveReaderRef.current);
            archiveReaderRef.current = null;
        };
    }, []);

    useEffect(() => {
        setUserResolvedSourceDialect(null);
    }, [scriptResult, databaseType]);

    const activeProjectCandidate = useMemo(() => {
        if (!projectAnalysis) {
            return null;
        }

        if (projectAnalysis.status === 'ambiguous') {
            return selectedProjectCandidate;
        }

        return projectAnalysis.recommendedCandidate;
    }, [projectAnalysis, selectedProjectCandidate]);

    const activeDatabaseGroup = useMemo(() => {
        if (!databaseGroupAnalysis) {
            return null;
        }

        if (databaseGroupAnalysis.status === 'multiple') {
            return selectedDatabaseGroup;
        }

        return databaseGroupAnalysis.recommendedGroup;
    }, [databaseGroupAnalysis, selectedDatabaseGroup]);

    const hasMultipleDatabaseGroups =
        databaseGroupAnalysis?.status === 'multiple';

    const showProjectAmbiguityPanel = useMemo(
        () =>
            projectAnalysis?.status === 'ambiguous' &&
            !(activeProjectCandidate && hasMultipleDatabaseGroups),
        [
            activeProjectCandidate,
            hasMultipleDatabaseGroups,
            projectAnalysis?.status,
        ]
    );

    const showDatabaseGroupPanel = useMemo(
        () => Boolean(activeProjectCandidate) && hasMultipleDatabaseGroups,
        [activeProjectCandidate, hasMultipleDatabaseGroups]
    );

    const projectAmbiguityDetectionCandidate = useMemo(() => {
        if (!projectAnalysis || projectAnalysis.status !== 'ambiguous') {
            return null;
        }

        return (
            projectAnalysis.recommendedCandidate ??
            getSelectableCandidates(projectAnalysis.candidates)[0] ??
            null
        );
    }, [projectAnalysis]);

    const showFullProjectDetectionSummary = useMemo(
        () =>
            Boolean(projectAnalysis) &&
            Boolean(activeProjectCandidate) &&
            !showProjectAmbiguityPanel &&
            !showDatabaseGroupPanel &&
            projectAnalysis?.status !== 'ambiguous',
        [
            activeProjectCandidate,
            projectAnalysis,
            showDatabaseGroupPanel,
            showProjectAmbiguityPanel,
        ]
    );

    useEffect(() => {
        if (!activeProjectCandidate || !archiveReaderRef.current) {
            setDatabaseGroupAnalysis(null);
            setSelectedDatabaseGroup(null);
            return;
        }

        let cancelled = false;

        const analyzeGroups = async () => {
            setIsAnalyzingDatabaseGroups(true);
            setDatabaseGroupAnalysis(null);
            setSelectedDatabaseGroup(null);

            try {
                const analysis = await detectDatabaseGroups(
                    archiveReaderRef.current as ArchiveReader,
                    activeProjectCandidate
                );

                if (cancelled) {
                    return;
                }

                setDatabaseGroupAnalysis(analysis);

                if (analysis.status === 'single' && analysis.recommendedGroup) {
                    setSelectedDatabaseGroup(analysis.recommendedGroup);
                }
            } finally {
                if (!cancelled) {
                    setIsAnalyzingDatabaseGroups(false);
                }
            }
        };

        void analyzeGroups();

        return () => {
            cancelled = true;
        };
    }, [activeProjectCandidate]);

    const baseAnalysis = useMemo(
        () =>
            analyzeImportContent(scriptResult, databaseType, {
                importContext: mode,
            }),
        [scriptResult, databaseType, mode]
    );

    const effectiveResolvedSourceDialect = useMemo(() => {
        if (userResolvedSourceDialect) {
            return userResolvedSourceDialect;
        }

        if (
            baseAnalysis.resolutionState === 'matched' ||
            baseAnalysis.resolutionState === 'resolved'
        ) {
            return baseAnalysis.resolvedSourceDialect;
        }

        return null;
    }, [userResolvedSourceDialect, baseAnalysis]);

    const canContinue = useMemo(() => {
        if (projectAnalysis) {
            if (projectAnalysis.status === 'unsupported') {
                return false;
            }

            if (!activeProjectCandidate) {
                return false;
            }

            if (isAnalyzingDatabaseGroups) {
                return false;
            }

            if (
                databaseGroupAnalysis?.status === 'multiple' &&
                !activeDatabaseGroup
            ) {
                return false;
            }

            return canExecuteProjectImport(
                activeProjectCandidate.framework,
                isAuthenticated
            );
        }

        if (!baseAnalysis.importMethod) {
            return false;
        }

        if (baseAnalysis.resolutionState === 'mismatch') {
            if (mode === 'existing') {
                return false;
            }

            return (
                userResolvedSourceDialect !== null &&
                userResolvedSourceDialect === baseAnalysis.detectedDatabaseType
            );
        }

        if (baseAnalysis.importMethod === 'ddl') {
            if (baseAnalysis.resolutionState === 'ambiguous') {
                return userResolvedSourceDialect !== null;
            }

            return effectiveResolvedSourceDialect !== null;
        }

        if (baseAnalysis.importMethod === 'diagram') {
            if (mode === 'existing') {
                return false;
            }

            if (baseAnalysis.resolutionState === 'ambiguous') {
                return userResolvedSourceDialect !== null;
            }

            return baseAnalysis.canContinue;
        }

        return baseAnalysis.canContinue;
    }, [
        activeDatabaseGroup,
        activeProjectCandidate,
        baseAnalysis,
        databaseGroupAnalysis,
        effectiveResolvedSourceDialect,
        isAnalyzingDatabaseGroups,
        isAuthenticated,
        mode,
        projectAnalysis,
        userResolvedSourceDialect,
    ]);

    const handleContinue = useCallback(async () => {
        if (!canContinue) {
            return;
        }

        if (
            projectAnalysis &&
            activeProjectCandidate &&
            archiveReaderRef.current
        ) {
            setIsProjectImporting(true);
            setProjectImportErrorKey(null);

            try {
                const result = await importProject({
                    archive: archiveReaderRef.current,
                    candidate: activeProjectCandidate,
                    targetDatabaseType: databaseType,
                    archiveFileName: selectedFileName ?? undefined,
                    databaseGroup: activeDatabaseGroup ?? undefined,
                });

                resetProjectArchiveState();

                await onContinue({
                    importMethod: 'project',
                    importedDiagram: result.diagram,
                });
            } catch {
                setProjectImportErrorKey(
                    'new_diagram_dialog.import_schema.errors.import_failed'
                );
            } finally {
                setIsProjectImporting(false);
            }

            return;
        }

        if (!baseAnalysis.importMethod) {
            return;
        }

        onContinue({
            importMethod: baseAnalysis.importMethod,
            resolvedSourceDialect:
                baseAnalysis.importMethod === 'ddl' ||
                baseAnalysis.importMethod === 'diagram'
                    ? (effectiveResolvedSourceDialect ?? undefined)
                    : undefined,
        });
    }, [
        activeDatabaseGroup,
        activeProjectCandidate,
        baseAnalysis,
        canContinue,
        databaseType,
        effectiveResolvedSourceDialect,
        onContinue,
        projectAnalysis,
        resetProjectArchiveState,
        selectedFileName,
    ]);

    const handleSwitchDatabase = useCallback(() => {
        if (mode !== 'create' || !setDatabaseType) {
            return;
        }

        if (!baseAnalysis.detectedDatabaseType) {
            return;
        }

        setDatabaseType(baseAnalysis.detectedDatabaseType);
        setUserResolvedSourceDialect(baseAnalysis.detectedDatabaseType);
    }, [baseAnalysis.detectedDatabaseType, mode, setDatabaseType]);

    const handleResolveAmbiguousDialect = useCallback(
        (resolvedDialect: DatabaseType) => {
            setUserResolvedSourceDialect(resolvedDialect);
        },
        []
    );

    const handleSelectDatabaseGroup = useCallback(
        (group: ProjectDatabaseGroup) => {
            setSelectedDatabaseGroup(group);
        },
        []
    );

    const handleSelectProjectCandidate = useCallback(
        (candidate: ProjectDetectionCandidate) => {
            setSelectedProjectCandidate(candidate);
            setDatabaseGroupAnalysis(null);
            setSelectedDatabaseGroup(null);
        },
        []
    );

    const analyzeProjectFile = useCallback(
        async (file: File) => {
            resetProjectArchiveState();
            setIsAnalyzingProject(true);
            setSelectedFileName(file.name);
            setFileErrorKey(null);

            try {
                const archive = await ArchiveReader.open(file);
                archiveReaderRef.current = archive;
                setScriptResult('');
                const analysis = await analyzeProjectArchive(archive);
                setProjectAnalysis(analysis);

                if (
                    analysis.status === 'detected' &&
                    analysis.recommendedCandidate
                ) {
                    setSelectedProjectCandidate(analysis.recommendedCandidate);
                }

                if (analysis.status === 'ambiguous') {
                    const selectable = getSelectableCandidates(
                        analysis.candidates
                    );
                    if (selectable.length === 1) {
                        setSelectedProjectCandidate(selectable[0]);
                    }
                }
            } catch (error) {
                resetProjectArchiveState();
                setSelectedFileName(null);

                if (error instanceof ArchiveError) {
                    setFileErrorKey(
                        'new_diagram_dialog.import_schema.errors.archive_invalid'
                    );
                    return;
                }

                setFileErrorKey(
                    'new_diagram_dialog.import_schema.errors.unreadable_file'
                );
            } finally {
                setIsAnalyzingProject(false);
            }
        },
        [resetProjectArchiveState, setScriptResult]
    );

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = '';

            if (!file) {
                return;
            }

            setFileErrorKey(null);

            const isZipArchive = await isZipArchiveFile(file);

            if (isZipArchive) {
                if (file.size > MAX_ARCHIVE_COMPRESSED_BYTES) {
                    setFileErrorKey(
                        'new_diagram_dialog.import_schema.errors.archive_too_large'
                    );
                    return;
                }

                await analyzeProjectFile(file);
                return;
            }

            resetProjectArchiveState();

            if (!isImportSchemaFileNameAllowed(file.name)) {
                setFileErrorKey(
                    'new_diagram_dialog.import_schema.errors.unsupported_file_extension'
                );
                return;
            }

            if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
                setFileErrorKey(
                    'new_diagram_dialog.import_schema.errors.file_too_large'
                );
                return;
            }

            setSelectedFileName(file.name);

            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result !== 'string') {
                    setFileErrorKey(
                        'new_diagram_dialog.import_schema.errors.unreadable_file'
                    );
                    return;
                }

                setScriptResult(reader.result);
            };
            reader.onerror = () => {
                setFileErrorKey(
                    'new_diagram_dialog.import_schema.errors.unreadable_file'
                );
            };
            reader.readAsText(file);
        },
        [analyzeProjectFile, resetProjectArchiveState, setScriptResult]
    );

    const handleTextareaChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFileErrorKey(null);
            setSelectedFileName(null);
            resetProjectArchiveState();
            setScriptResult(event.target.value);
        },
        [resetProjectArchiveState, setScriptResult]
    );

    const resolvedTitle =
        title ??
        (mode === 'existing'
            ? t('import_database_dialog.import_schema.title')
            : t('new_diagram_dialog.import_schema.title'));

    const resolvedBackLabel =
        backLabel ??
        (mode === 'existing'
            ? t('import_database_dialog.import_schema.cancel')
            : t('new_diagram_dialog.import_schema.back'));

    const resolvedContinueLabel =
        continueLabel ??
        (mode === 'existing'
            ? t('import_database_dialog.import_schema.import')
            : t('new_diagram_dialog.import_schema.import'));

    const showTextImportPanels =
        !projectAnalysis && !isAnalyzingProject && scriptResult.length > 0;

    return (
        <>
            <DialogHeader className="shrink-0">
                <DialogTitle>{resolvedTitle}</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor={textareaId}
                            className="text-sm font-medium"
                        >
                            {t(
                                'new_diagram_dialog.import_schema.textarea_label'
                            )}
                        </label>
                        <Textarea
                            id={textareaId}
                            value={scriptResult}
                            onChange={handleTextareaChange}
                            placeholder={t(
                                'new_diagram_dialog.import_schema.textarea_placeholder'
                            )}
                            className="max-h-48 min-h-40 resize-none overflow-y-auto"
                            disabled={isImporting || isAnalyzingProject}
                        />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="h-px flex-1 bg-border" aria-hidden />
                        <span>
                            {t('new_diagram_dialog.import_schema.or_divider')}
                        </span>
                        <span className="h-px flex-1 bg-border" aria-hidden />
                    </div>

                    <div className="mb-4 flex w-full flex-col items-center gap-2">
                        <input
                            ref={fileInputRef}
                            id={fileInputId}
                            type="file"
                            accept={IMPORT_SCHEMA_FILE_ACCEPT}
                            className="sr-only"
                            tabIndex={-1}
                            aria-hidden
                            onChange={handleFileChange}
                            disabled={isImporting || isAnalyzingProject}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full max-w-full gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting || isAnalyzingProject}
                            aria-label={
                                selectedFileName
                                    ? t(
                                          'new_diagram_dialog.import_schema.change_file_aria',
                                          { name: selectedFileName }
                                      )
                                    : t(
                                          'new_diagram_dialog.import_schema.choose_file_or_project'
                                      )
                            }
                            title={selectedFileName ?? undefined}
                        >
                            {selectedFileName ? (
                                <FileText
                                    className="size-4 shrink-0"
                                    aria-hidden
                                />
                            ) : (
                                <Upload
                                    className="size-4 shrink-0"
                                    aria-hidden
                                />
                            )}
                            <span
                                className={cn(selectedFileName && 'truncate')}
                            >
                                {selectedFileName ??
                                    t(
                                        'new_diagram_dialog.import_schema.choose_file_or_project'
                                    )}
                            </span>
                        </Button>
                        <ImportPrivacyInfoLink
                            onClick={() => setIsPrivacyInfoOpen(true)}
                        />
                        {fileErrorKey ? (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {t(fileErrorKey)}
                            </p>
                        ) : null}
                    </div>

                    {isAnalyzingProject || isAnalyzingDatabaseGroups ? (
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'new_diagram_dialog.import_schema.project.analyzing_project'
                            )}
                        </p>
                    ) : null}

                    {projectAnalysis?.status === 'unsupported' ? (
                        <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                            <p className="font-medium">
                                {t(
                                    'new_diagram_dialog.import_schema.project.unsupported_project'
                                )}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                                {t(
                                    'new_diagram_dialog.import_schema.project.unsupported_project_description'
                                )}
                            </p>
                        </div>
                    ) : null}

                    {showProjectAmbiguityPanel &&
                    projectAmbiguityDetectionCandidate ? (
                        <ProjectAmbiguityPanel
                            candidates={projectAnalysis!.candidates}
                            selectedCandidateKey={
                                selectedProjectCandidate
                                    ? getProjectCandidateKey(
                                          selectedProjectCandidate
                                      )
                                    : null
                            }
                            detectionCandidate={
                                projectAmbiguityDetectionCandidate
                            }
                            isAuthenticated={isAuthenticated}
                            onSelect={handleSelectProjectCandidate}
                        />
                    ) : null}

                    {showDatabaseGroupPanel &&
                    databaseGroupAnalysis &&
                    activeProjectCandidate ? (
                        <ProjectDatabaseGroupPanel
                            groups={databaseGroupAnalysis.groups}
                            selectedGroupKey={selectedDatabaseGroup?.id ?? null}
                            detectedCandidate={activeProjectCandidate}
                            isAuthenticated={isAuthenticated}
                            onSelect={handleSelectDatabaseGroup}
                        />
                    ) : null}

                    {showFullProjectDetectionSummary &&
                    activeProjectCandidate ? (
                        <ProjectDetectionSummary
                            candidate={activeProjectCandidate}
                            isAuthenticated={isAuthenticated}
                        />
                    ) : null}

                    {showTextImportPanels &&
                    baseAnalysis.resolutionState !== 'ambiguous' ? (
                        <DetectionSummary analysis={baseAnalysis} />
                    ) : null}

                    {showTextImportPanels &&
                    baseAnalysis.displayKind === 'dialect_mismatch' &&
                    baseAnalysis.detectedDatabaseType ? (
                        <DialectMismatchPanel
                            variant={mode}
                            selectedDatabaseType={databaseType}
                            detectedDatabaseType={
                                baseAnalysis.detectedDatabaseType
                            }
                            onSwitchDatabase={
                                mode === 'create'
                                    ? handleSwitchDatabase
                                    : undefined
                            }
                        />
                    ) : null}

                    {showTextImportPanels &&
                    baseAnalysis.resolutionState === 'ambiguous' ? (
                        <DialectResolutionPanel
                            variant={mode}
                            copyVariant={
                                baseAnalysis.displayKind ===
                                'diagram_json_mismatch'
                                    ? 'diagram_json'
                                    : 'sql_ambiguous'
                            }
                            selectedDatabaseType={databaseType}
                            candidates={baseAnalysis.dialectCandidates}
                            candidateScores={
                                baseAnalysis.dialectCandidateScores
                            }
                            detectedDatabaseType={
                                baseAnalysis.detectedDatabaseType
                            }
                            resolvedSourceDialect={userResolvedSourceDialect}
                            onResolve={handleResolveAmbiguousDialect}
                        />
                    ) : null}

                    {importError || projectImportErrorKey ? (
                        <p role="alert" className="text-sm text-destructive">
                            {importError ??
                                (projectImportErrorKey
                                    ? t(projectImportErrorKey)
                                    : null)}
                        </p>
                    ) : null}
                </div>
            </div>

            <DialogFooter className="mt-4 flex shrink-0 !justify-between gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onBack}
                    disabled={isImporting || isProjectImporting}
                >
                    {resolvedBackLabel}
                </Button>
                <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={
                        !canContinue ||
                        isImporting ||
                        isAnalyzingProject ||
                        isAnalyzingDatabaseGroups ||
                        isProjectImporting
                    }
                >
                    {resolvedContinueLabel}
                </Button>
            </DialogFooter>

            <ImportPrivacyInfoDialog
                open={isPrivacyInfoOpen}
                onOpenChange={setIsPrivacyInfoOpen}
            />
        </>
    );
};
