import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Textarea } from '@/components/textarea/textarea';
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
    const textareaId = useId();
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

    const handleMetadataChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = event.target.value;
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

            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-4">
                    <DatabaseEditionPicker
                        databaseType={databaseType}
                        databaseEdition={databaseEdition}
                        setDatabaseEdition={setDatabaseEdition}
                    />

                    <MetadataQueryInstructions
                        databaseType={databaseType}
                        databaseEdition={databaseEdition}
                        showSSMSInfoDialog={showSSMSInfoDialog}
                        setShowSSMSInfoDialog={setShowSSMSInfoDialog}
                    />

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor={textareaId}
                            className="text-sm font-medium"
                        >
                            {t(
                                'new_diagram_dialog.import_from_database.paste_result'
                            )}
                        </label>
                        <Textarea
                            id={textareaId}
                            value={metadataResult}
                            onChange={handleMetadataChange}
                            placeholder={t(
                                'new_diagram_dialog.import_from_database.paste_result_placeholder'
                            )}
                            className="max-h-48 min-h-40 resize-none overflow-y-auto font-mono text-xs"
                            disabled={isImporting}
                        />
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
