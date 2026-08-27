import React, {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Upload } from 'lucide-react';
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
import { analyzeImportContent } from './analyze-import-content';
import { MAX_IMPORT_FILE_SIZE_BYTES } from './constants';
import { DetectionSummary } from './detection-summary';
import { DialectMismatchPanel } from './dialect-mismatch-panel';
import { DialectResolutionPanel } from './dialect-resolution-panel';

export interface ImportSchemaContinueParams {
    importMethod: ImportMethod;
    resolvedSourceDialect?: DatabaseType;
}

export interface ImportSchemaStepProps {
    databaseType: DatabaseType;
    setDatabaseType: React.Dispatch<React.SetStateAction<DatabaseType>>;
    scriptResult: string;
    setScriptResult: React.Dispatch<React.SetStateAction<string>>;
    onContinue: (params: ImportSchemaContinueParams) => void | Promise<void>;
    onBack: () => void;
    importError?: string | null;
    isImporting?: boolean;
}

export const ImportSchemaStep: React.FC<ImportSchemaStepProps> = ({
    databaseType,
    setDatabaseType,
    scriptResult,
    setScriptResult,
    onContinue,
    onBack,
    importError = null,
    isImporting = false,
}) => {
    const { t } = useTranslation();
    const textareaId = useId();
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
        () => analyzeImportContent(scriptResult, databaseType),
        [scriptResult, databaseType]
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

        if (
            baseAnalysis.resolutionState === 'ambiguous' &&
            baseAnalysis.dialectCandidates.includes(databaseType)
        ) {
            return databaseType;
        }

        return null;
    }, [userResolvedSourceDialect, baseAnalysis, databaseType]);

    const canContinue = useMemo(() => {
        if (!baseAnalysis.importMethod) {
            return false;
        }

        if (baseAnalysis.resolutionState === 'mismatch') {
            return (
                userResolvedSourceDialect !== null &&
                userResolvedSourceDialect === baseAnalysis.detectedDatabaseType
            );
        }

        if (baseAnalysis.importMethod === 'ddl') {
            return effectiveResolvedSourceDialect !== null;
        }

        return baseAnalysis.canContinue;
    }, [
        baseAnalysis,
        effectiveResolvedSourceDialect,
        userResolvedSourceDialect,
    ]);

    const handleContinue = useCallback(() => {
        if (!baseAnalysis.importMethod || !canContinue) {
            return;
        }

        onContinue({
            importMethod: baseAnalysis.importMethod,
            resolvedSourceDialect:
                baseAnalysis.importMethod === 'ddl'
                    ? (effectiveResolvedSourceDialect ?? undefined)
                    : undefined,
        });
    }, [baseAnalysis, canContinue, effectiveResolvedSourceDialect, onContinue]);

    const handleSwitchDatabase = useCallback(() => {
        if (!baseAnalysis.detectedDatabaseType) {
            return;
        }

        setDatabaseType(baseAnalysis.detectedDatabaseType);
        setUserResolvedSourceDialect(baseAnalysis.detectedDatabaseType);
    }, [baseAnalysis.detectedDatabaseType, setDatabaseType]);

    const handleResolveAmbiguousDialect = useCallback(
        (resolvedDialect: DatabaseType) => {
            setUserResolvedSourceDialect(resolvedDialect);

            if (resolvedDialect !== databaseType) {
                setDatabaseType(resolvedDialect);
            }
        },
        [databaseType, setDatabaseType]
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

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {t('new_diagram_dialog.import_schema.title')}
                </DialogTitle>
            </DialogHeader>

            <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor={textareaId} className="text-sm font-medium">
                        {t('new_diagram_dialog.import_schema.textarea_label')}
                    </label>
                    <Textarea
                        id={textareaId}
                        value={scriptResult}
                        onChange={handleTextareaChange}
                        placeholder={t(
                            'new_diagram_dialog.import_schema.textarea_placeholder'
                        )}
                        className="min-h-40 resize-y"
                        disabled={isImporting}
                    />
                    <p className="text-sm text-muted-foreground">
                        {t('new_diagram_dialog.import_schema.auto_detect_hint')}
                    </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" aria-hidden />
                    <span>
                        {t('new_diagram_dialog.import_schema.or_divider')}
                    </span>
                    <span className="h-px flex-1 bg-border" aria-hidden />
                </div>

                <div className="flex flex-col items-start gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        aria-label={t(
                            'new_diagram_dialog.import_schema.choose_file'
                        )}
                        onChange={handleFileChange}
                        disabled={isImporting}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                    >
                        <Upload className="size-4" aria-hidden />
                        {t('new_diagram_dialog.import_schema.choose_file')}
                    </Button>
                    {selectedFileName ? (
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'new_diagram_dialog.import_schema.selected_file',
                                { name: selectedFileName }
                            )}
                        </p>
                    ) : null}
                    {fileErrorKey ? (
                        <p role="alert" className="text-sm text-destructive">
                            {t(fileErrorKey)}
                        </p>
                    ) : null}
                </div>

                <DetectionSummary analysis={baseAnalysis} />

                {baseAnalysis.displayKind === 'dialect_mismatch' &&
                baseAnalysis.detectedDatabaseType ? (
                    <DialectMismatchPanel
                        selectedDatabaseType={databaseType}
                        detectedDatabaseType={baseAnalysis.detectedDatabaseType}
                        onSwitchDatabase={handleSwitchDatabase}
                        onBack={onBack}
                    />
                ) : null}

                {baseAnalysis.resolutionState === 'ambiguous' ? (
                    <DialectResolutionPanel
                        selectedDatabaseType={databaseType}
                        candidates={baseAnalysis.dialectCandidates}
                        resolvedSourceDialect={
                            userResolvedSourceDialect ?? databaseType
                        }
                        onResolve={handleResolveAmbiguousDialect}
                    />
                ) : null}

                {importError ? (
                    <p role="alert" className="text-sm text-destructive">
                        {importError}
                    </p>
                ) : null}
            </div>

            <DialogFooter className="mt-4 flex !justify-between gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onBack}
                    disabled={isImporting}
                >
                    {t('new_diagram_dialog.import_schema.back')}
                </Button>
                <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={!canContinue || isImporting}
                >
                    {t('new_diagram_dialog.import_schema.continue')}
                </Button>
            </DialogFooter>
        </>
    );
};
