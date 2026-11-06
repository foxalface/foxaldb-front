import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    CodeSnippet,
    type CodeSnippetProps,
} from '@/components/code-snippet/code-snippet';
import {
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DatabaseType } from '@/lib/domain/database-type';
import { DatabaseType as DatabaseTypeEnum } from '@/lib/domain/database-type';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { DatabaseEditionPicker } from './database-edition-picker';
import { MetadataQueryInstructions } from './metadata-query-instructions';
import { supportsMetadataImport } from './get-metadata-query';
import {
    repairMetadataResult,
    validateMetadataResult,
} from './validate-metadata-result';
import { SSMS_TRUNCATION_LENGTH } from './constants';

/** Match schema import editor min height (~min-h-64) so the panel fills the split layout. */
const METADATA_RESULT_EDITOR_MIN_HEIGHT_PX = 256;

export interface ImportFromDatabaseStepProps {
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    setDatabaseEdition: React.Dispatch<
        React.SetStateAction<DatabaseEdition | undefined>
    >;
    metadataResult: string;
    setMetadataResult: React.Dispatch<React.SetStateAction<string>>;
    onContinue: (normalizedContent: string) => void | Promise<void>;
    onBack: () => void;
    importError?: string | null;
    isImporting?: boolean;
}

export const ImportFromDatabaseStep: React.FC<ImportFromDatabaseStepProps> = ({
    databaseType,
    databaseEdition,
    setDatabaseEdition,
    metadataResult,
    setMetadataResult,
    onContinue,
    onBack,
    importError = null,
    isImporting = false,
}) => {
    const { t } = useTranslation();
    const pasteResultLabelId = useId();
    const [showSSMSInfoDialog, setShowSSMSInfoDialog] = useState(false);
    const [repairAttempts, setRepairAttempts] = useState(0);
    const [isRepairing, setIsRepairing] = useState(false);

    useEffect(() => {
        setRepairAttempts(0);
    }, [metadataResult, databaseType, databaseEdition]);

    const isSupported = supportsMetadataImport(databaseType);

    const validation = useMemo(
        () =>
            validateMetadataResult(metadataResult, {
                databaseType,
                repairAttempts,
            }),
        [metadataResult, databaseType, repairAttempts]
    );

    const handleMetadataValueChange = useCallback(
        (value: string) => {
            setMetadataResult(value);

            if (
                databaseType === DatabaseTypeEnum.SQL_SERVER &&
                value.length === SSMS_TRUNCATION_LENGTH
            ) {
                setShowSSMSInfoDialog(true);
            }
        },
        [databaseType, setMetadataResult]
    );

    const metadataResultEditorProps = useMemo(
        (): CodeSnippetProps['editorProps'] => ({
            height: METADATA_RESULT_EDITOR_MIN_HEIGHT_PX,
            onChange: (nextValue) => {
                handleMetadataValueChange(nextValue ?? '');
            },
            options: {
                ariaLabel: t(
                    'new_diagram_dialog.import_from_database.paste_result'
                ),
                readOnly: isImporting,
                placeholder: t(
                    'new_diagram_dialog.import_from_database.paste_result_placeholder'
                ),
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderValidationDecorations: 'off',
                lineDecorationsWidth: 0,
                overviewRulerBorder: false,
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                contextmenu: true,
                guides: {
                    indentation: false,
                },
                minimap: { enabled: false },
                scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    alwaysConsumeMouseWheel: false,
                },
            },
        }),
        [handleMetadataValueChange, isImporting, t]
    );

    const handleCheckResult = useCallback(async () => {
        setIsRepairing(true);

        await new Promise((resolve) => {
            setTimeout(resolve, 300);
        });

        const repaired = repairMetadataResult(metadataResult);

        if (repaired) {
            setMetadataResult(repaired);
            setRepairAttempts(0);
        } else {
            setRepairAttempts((attempts) => attempts + 1);
        }

        setIsRepairing(false);
    }, [metadataResult, setMetadataResult]);

    const handleContinue = useCallback(() => {
        if (!validation.canContinue || !validation.normalizedContent) {
            return;
        }

        onContinue(validation.normalizedContent);
    }, [onContinue, validation]);

    const validationMessage = useMemo(() => {
        switch (validation.state) {
            case 'valid':
                return {
                    text: t(
                        'new_diagram_dialog.import_from_database.valid_result'
                    ),
                    severity: 'success' as const,
                };
            case 'repairable':
                return {
                    text: t(
                        'new_diagram_dialog.import_from_database.invalid_result'
                    ),
                    severity: 'warning' as const,
                };
            case 'invalid':
                return {
                    text: t(
                        'new_diagram_dialog.import_from_database.invalid_result'
                    ),
                    severity: 'error' as const,
                };
            case 'truncated':
                return {
                    text: t(
                        'new_diagram_dialog.import_from_database.truncated_result'
                    ),
                    severity: 'error' as const,
                };
            case 'waiting':
                return metadataResult.trim()
                    ? {
                          text: t(
                              'new_diagram_dialog.import_from_database.waiting_for_result'
                          ),
                          severity: 'warning' as const,
                      }
                    : null;
            default:
                return null;
        }
    }, [metadataResult, t, validation.state]);

    if (!isSupported) {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>
                        {t('new_diagram_dialog.import_from_database.title')}
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground" role="alert">
                    {t(
                        'new_diagram_dialog.import_from_database.unsupported_database'
                    )}
                </p>
                <DialogFooter className="mt-4 flex !justify-start gap-2">
                    <Button type="button" variant="secondary" onClick={onBack}>
                        {t('new_diagram_dialog.import_from_database.back')}
                    </Button>
                </DialogFooter>
            </>
        );
    }

    return (
        <>
            <DialogHeader className="shrink-0">
                <DialogTitle>
                    {t('new_diagram_dialog.import_from_database.title')}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                    {t('new_diagram_dialog.import_from_database.description')}
                </p>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto p-0.5">
                <div className="mx-auto flex w-full max-w-none flex-col gap-4">
                    <DatabaseEditionPicker
                        databaseType={databaseType}
                        databaseEdition={databaseEdition}
                        setDatabaseEdition={setDatabaseEdition}
                    />

                    <div className="flex min-h-0 flex-col gap-4 md:min-h-[min(22rem,calc(50vh-12rem))] md:flex-row md:items-stretch">
                        <div className="flex min-h-56 min-w-0 flex-1 flex-col md:min-h-0">
                            <MetadataQueryInstructions
                                databaseType={databaseType}
                                databaseEdition={databaseEdition}
                                showSSMSInfoDialog={showSSMSInfoDialog}
                                setShowSSMSInfoDialog={setShowSSMSInfoDialog}
                                fillHeight
                            />
                        </div>

                        <div
                            className="flex min-h-56 min-w-0 flex-1 flex-col gap-2 md:min-h-0"
                            aria-labelledby={pasteResultLabelId}
                        >
                            <span
                                id={pasteResultLabelId}
                                className="text-sm font-medium"
                            >
                                {t(
                                    'new_diagram_dialog.import_from_database.paste_result'
                                )}
                            </span>
                            <div className="relative flex min-h-0 flex-1 flex-col">
                                <CodeSnippet
                                    className={cn(
                                        'h-full min-h-64 w-full flex-1',
                                        isImporting && 'opacity-70'
                                    )}
                                    code={metadataResult}
                                    language="json"
                                    allowCopy={false}
                                    editorProps={metadataResultEditorProps}
                                />
                            </div>
                        </div>
                    </div>

                    {validationMessage ? (
                        <div
                            role="status"
                            aria-live="polite"
                            className={cn(
                                'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                                validationMessage.severity === 'success' &&
                                    'border-border bg-muted/50',
                                validationMessage.severity === 'warning' &&
                                    'border-amber-500 dark:border-amber-500/70',
                                validationMessage.severity === 'error' &&
                                    'border-destructive text-destructive'
                            )}
                        >
                            {validationMessage.severity === 'success' ? (
                                <CheckCircle2
                                    className="mt-0.5 size-4 shrink-0"
                                    aria-hidden
                                />
                            ) : (
                                <AlertCircle
                                    className={cn(
                                        'mt-0.5 size-4 shrink-0',
                                        validationMessage.severity ===
                                            'warning' &&
                                            'text-amber-600 dark:text-amber-500',
                                        validationMessage.severity ===
                                            'error' && 'text-destructive'
                                    )}
                                    aria-hidden
                                />
                            )}
                            <span>{validationMessage.text}</span>
                        </div>
                    ) : null}

                    {validation.state === 'repairable' ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCheckResult}
                            disabled={isRepairing || isImporting}
                        >
                            {t(
                                'new_diagram_dialog.import_from_database.check_result'
                            )}
                        </Button>
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
                    {t('new_diagram_dialog.import_from_database.back')}
                </Button>
                <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={!validation.canContinue || isImporting}
                >
                    {t('new_diagram_dialog.import_from_database.import')}
                </Button>
            </DialogFooter>
        </>
    );
};
