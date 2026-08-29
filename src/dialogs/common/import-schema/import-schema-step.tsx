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
import { analyzeImportContent } from './analyze-import-content';
import { MAX_IMPORT_FILE_SIZE_BYTES } from './constants';
import { DetectionSummary } from './detection-summary';
import { DialectMismatchPanel } from './dialect-mismatch-panel';
import { DialectResolutionPanel } from './dialect-resolution-panel';

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
    const textareaId = useId();
    const fileInputId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(
        null
    );
    const [fileErrorKey, setFileErrorKey] = useState<string | null>(null);
    const [userResolvedSourceDialect, setUserResolvedSourceDialect] =
        useState<DatabaseType | null>(null);

    useEffect(() => {
        setUserResolvedSourceDialect(null);
    }, [scriptResult, databaseType]);

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
        baseAnalysis,
        effectiveResolvedSourceDialect,
        mode,
        userResolvedSourceDialect,
    ]);

    const handleContinue = useCallback(() => {
        if (!baseAnalysis.importMethod || !canContinue) {
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
    }, [baseAnalysis, canContinue, effectiveResolvedSourceDialect, onContinue]);

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

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = '';

            if (!file) {
                return;
            }

            setFileErrorKey(null);

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
        [setScriptResult]
    );

    const handleTextareaChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFileErrorKey(null);
            setSelectedFileName(null);
            setScriptResult(event.target.value);
        },
        [setScriptResult]
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
                            disabled={isImporting}
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
                            className="sr-only"
                            tabIndex={-1}
                            aria-hidden
                            onChange={handleFileChange}
                            disabled={isImporting}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full max-w-full gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            aria-label={
                                selectedFileName
                                    ? t(
                                          'new_diagram_dialog.import_schema.change_file_aria',
                                          { name: selectedFileName }
                                      )
                                    : t(
                                          'new_diagram_dialog.import_schema.choose_file'
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
                                        'new_diagram_dialog.import_schema.choose_file'
                                    )}
                            </span>
                        </Button>
                        {fileErrorKey ? (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {t(fileErrorKey)}
                            </p>
                        ) : null}
                    </div>

                    {baseAnalysis.resolutionState !== 'ambiguous' ? (
                        <DetectionSummary analysis={baseAnalysis} />
                    ) : null}

                    {baseAnalysis.displayKind === 'dialect_mismatch' &&
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

                    {baseAnalysis.resolutionState === 'ambiguous' ? (
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
                    disabled={!canContinue || isImporting}
                >
                    {resolvedContinueLabel}
                </Button>
            </DialogFooter>
        </>
    );
};
