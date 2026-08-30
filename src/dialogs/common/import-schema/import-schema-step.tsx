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
import {
    ArchiveError,
    ArchiveReader,
    MAX_ARCHIVE_COMPRESSED_BYTES,
    analyzeProjectArchive,
    getProjectCandidateKey,
    getSelectableCandidates,
    isZipArchiveFile,
} from '@/lib/project-import/types';
import { canExecuteProjectImport } from '@/lib/project-import/project-import-capability';
import type {
    ProjectArchiveAnalysis,
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
import { ProjectDetectionSummary } from './project-detection-summary';

export interface ImportSchemaContinueParams {
    importMethod: ImportMethod;
    resolvedSourceDialect?: DatabaseType;
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
    const [isAnalyzingProject, setIsAnalyzingProject] = useState(false);

    const resetProjectArchiveState = useCallback(() => {
        releaseArchiveReader(archiveReaderRef.current);
        archiveReaderRef.current = null;
        setProjectAnalysis(null);
        setSelectedProjectCandidate(null);
        setIsAnalyzingProject(false);
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
        activeProjectCandidate,
        baseAnalysis,
        effectiveResolvedSourceDialect,
        isAuthenticated,
        mode,
        projectAnalysis,
        userResolvedSourceDialect,
    ]);

    const handleContinue = useCallback(() => {
        if (!canContinue || projectAnalysis) {
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
        baseAnalysis,
        canContinue,
        effectiveResolvedSourceDialect,
        onContinue,
        projectAnalysis,
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

    const handleSelectProjectCandidate = useCallback(
        (candidate: ProjectDetectionCandidate) => {
            setSelectedProjectCandidate(candidate);
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
                        <p className="text-center text-xs text-muted-foreground">
                            {t(
                                'new_diagram_dialog.import_schema.supported_formats_hint'
                            )}
                        </p>
                        {fileErrorKey ? (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {t(fileErrorKey)}
                            </p>
                        ) : null}
                    </div>

                    {isAnalyzingProject ? (
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

                    {projectAnalysis?.status === 'ambiguous' ? (
                        <ProjectAmbiguityPanel
                            candidates={projectAnalysis.candidates}
                            selectedCandidateKey={
                                selectedProjectCandidate
                                    ? getProjectCandidateKey(
                                          selectedProjectCandidate
                                      )
                                    : null
                            }
                            onSelect={handleSelectProjectCandidate}
                        />
                    ) : null}

                    {projectAnalysis &&
                    projectAnalysis.status === 'detected' &&
                    activeProjectCandidate ? (
                        <ProjectDetectionSummary
                            candidate={activeProjectCandidate}
                            isAuthenticated={isAuthenticated}
                        />
                    ) : null}

                    {projectAnalysis?.status === 'ambiguous' &&
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

                    {importError ? (
                        <p role="alert" className="text-sm text-destructive">
                            {importError}
                        </p>
                    ) : null}
                </div>
            </div>

            <DialogFooter className="mt-4 flex shrink-0 !justify-between gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onBack}
                    disabled={isImporting}
                >
                    {resolvedBackLabel}
                </Button>
                <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={!canContinue || isImporting || isAnalyzingProject}
                >
                    {resolvedContinueLabel}
                </Button>
            </DialogFooter>
        </>
    );
};
