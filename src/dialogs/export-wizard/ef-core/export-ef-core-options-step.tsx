import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/input/input';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import type { EfCoreExportSuccessResponse } from '@/lib/api/ef-core-export-types';
import { downloadBlob } from '@/lib/download-blob';
import { EF_CORE_ZIP_MIME_TYPE } from '@/lib/export/ef-core-export-constants';
import {
    buildEfCoreExportZip,
    EfCoreExportZipError,
    resolveEfCoreExportFilename,
} from '@/lib/export/ef-core-export-zip';
import type { RegisterExportWizardFooterAction } from '../export-wizard-footer-action';
import { useRegisterExportWizardFooterAction } from '../use-register-export-wizard-footer-action';
import { ExportFileListSkeleton } from '../export-file-list-skeleton';
import { ExportGeneratedFilesTree } from '../export-generated-files-tree';
import { ExportWizardFieldLabel } from '../export-wizard-field-label';
import { ExportWizardNotesPanel } from '../export-wizard-notes-panel';

export type EfCoreWizardRequestErrorKind =
    | 'semantic'
    | 'rate_limited'
    | 'unauthenticated'
    | 'unexpected';

export interface EfCoreWizardRequestError {
    kind: EfCoreWizardRequestErrorKind;
    message?: string;
    code?: string;
    path?: string;
}

interface ExportEfCoreOptionsStepProps {
    namespaceValue: string;
    dbContextName: string;
    isExporting: boolean;
    error: EfCoreWizardRequestError | null;
    success: EfCoreExportSuccessResponse | null;
    onNamespaceChange: (value: string) => void;
    onDbContextNameChange: (value: string) => void;
    registerFooterAction?: RegisterExportWizardFooterAction;
}

export const ExportEfCoreOptionsStep: React.FC<
    ExportEfCoreOptionsStepProps
> = ({
    namespaceValue,
    dbContextName,
    isExporting,
    error,
    success,
    onNamespaceChange,
    onDbContextNameChange,
    registerFooterAction,
}) => {
    const { t } = useTranslation();
    const [downloadErrorCode, setDownloadErrorCode] = useState<
        'unsafe_path' | 'empty_files' | null
    >(null);

    const resolvedFilename = useMemo(
        () => resolveEfCoreExportFilename(success?.filename ?? ''),
        [success?.filename]
    );

    const errorMessage = (() => {
        if (!error) {
            return null;
        }

        switch (error.kind) {
            case 'semantic':
                return error.message && error.message.trim().length > 0
                    ? error.message
                    : t('export_wizard.ef_core.options_step.error_semantic');
            case 'rate_limited':
                return t(
                    'export_wizard.ef_core.options_step.error_rate_limited'
                );
            case 'unauthenticated':
                return t(
                    'export_wizard.ef_core.options_step.error_unauthenticated'
                );
            default:
                return t('export_wizard.ef_core.options_step.error_unexpected');
        }
    })();

    const downloadErrorMessage = useMemo(() => {
        if (downloadErrorCode === 'unsafe_path') {
            return t('export_wizard.ef_core.result_step.error_unsafe_path');
        }

        if (downloadErrorCode === 'empty_files') {
            return t('export_wizard.ef_core.result_step.error_empty_files');
        }

        return null;
    }, [downloadErrorCode, t]);

    const handleDownload = useCallback(() => {
        if (!success) {
            return;
        }

        try {
            const zipBytes = buildEfCoreExportZip(success.files);
            downloadBlob(
                new Blob([new Uint8Array(zipBytes)], {
                    type: EF_CORE_ZIP_MIME_TYPE,
                }),
                resolvedFilename
            );
            setDownloadErrorCode(null);
        } catch (zipError) {
            if (zipError instanceof EfCoreExportZipError) {
                setDownloadErrorCode(zipError.code);
                return;
            }

            setDownloadErrorCode('empty_files');
        }
    }, [resolvedFilename, success]);

    useRegisterExportWizardFooterAction(
        registerFooterAction,
        success && success.files.length > 0
            ? {
                  type: 'export',
                  onClick: handleDownload,
                  testId: 'export-ef-core-download-zip',
              }
            : null
    );

    const showGenerating = isExporting && !errorMessage;

    return (
        <TooltipProvider>
            <div
                className="flex flex-col gap-4 py-1"
                data-testid="export-ef-core-options-step"
            >
                <div className="space-y-2">
                    <ExportWizardFieldLabel
                        htmlFor="ef-core-namespace"
                        label={t(
                            'export_wizard.ef_core.options_step.namespace'
                        )}
                        tooltipAriaLabel={t(
                            'export_wizard.ef_core.options_step.namespace_help_aria'
                        )}
                        tooltipContent={t(
                            'export_wizard.ef_core.options_step.namespace_help'
                        )}
                    />
                    <Input
                        id="ef-core-namespace"
                        value={namespaceValue}
                        disabled={isExporting}
                        placeholder={t(
                            'export_wizard.ef_core.options_step.namespace_placeholder'
                        )}
                        onChange={(event) =>
                            onNamespaceChange(event.target.value)
                        }
                        data-testid="ef-core-namespace-input"
                        autoComplete="off"
                    />
                </div>

                <div className="space-y-2">
                    <ExportWizardFieldLabel
                        htmlFor="ef-core-db-context"
                        label={t(
                            'export_wizard.ef_core.options_step.db_context'
                        )}
                        tooltipAriaLabel={t(
                            'export_wizard.ef_core.options_step.db_context_help_aria'
                        )}
                        tooltipContent={t(
                            'export_wizard.ef_core.options_step.db_context_help'
                        )}
                    />
                    <Input
                        id="ef-core-db-context"
                        value={dbContextName}
                        disabled={isExporting}
                        placeholder={t(
                            'export_wizard.ef_core.options_step.db_context_placeholder'
                        )}
                        onChange={(event) =>
                            onDbContextNameChange(event.target.value)
                        }
                        data-testid="ef-core-db-context-input"
                        autoComplete="off"
                    />
                </div>

                {errorMessage ? (
                    <p
                        className="break-words text-sm text-muted-foreground"
                        role="alert"
                        data-testid="export-ef-core-error"
                        data-error-kind={error?.kind}
                        data-error-code={error?.code}
                    >
                        {errorMessage}
                        {error?.kind === 'semantic' && error.code ? (
                            <span className="mt-1 block text-xs">
                                {error.code}
                                {error.path ? ` · ${error.path}` : ''}
                            </span>
                        ) : null}
                    </p>
                ) : null}

                {success && !errorMessage && !isExporting ? (
                    <div>
                        <p className="text-sm font-medium">
                            {t(
                                'export_wizard.ef_core.result_step.generated_files',
                                {
                                    count: success.files.length,
                                }
                            )}
                        </p>
                        {success.files.length > 0 ? (
                            <ExportGeneratedFilesTree
                                paths={success.files.map((file) => file.path)}
                                testId="export-ef-core-file-list"
                            />
                        ) : null}
                    </div>
                ) : null}

                {showGenerating ? (
                    <ExportFileListSkeleton
                        testId="export-ef-core-generating"
                        ariaLabel={t(
                            'export_wizard.ef_core.options_step.generating'
                        )}
                    />
                ) : null}

                {success && !errorMessage && !isExporting ? (
                    <>
                        {success.notes.length > 0 ? (
                            <ExportWizardNotesPanel
                                heading={t(
                                    'export_wizard.ef_core.result_step.notes'
                                )}
                                testId="export-ef-core-notes"
                                listTestId="export-ef-core-notes-list"
                            >
                                {success.notes.map((note, index) => (
                                    <li
                                        key={`${note.code}-${note.path ?? index}`}
                                        className="break-words"
                                    >
                                        <span>{note.message}</span>
                                        {note.path ? (
                                            <span className="mt-0.5 block break-all text-xs opacity-80">
                                                {note.path}
                                            </span>
                                        ) : null}
                                    </li>
                                ))}
                            </ExportWizardNotesPanel>
                        ) : null}

                        {downloadErrorMessage ? (
                            <p
                                className="break-words text-sm text-muted-foreground"
                                role="alert"
                                data-testid="export-ef-core-download-error"
                            >
                                {downloadErrorMessage}
                            </p>
                        ) : null}
                    </>
                ) : null}
            </div>
        </TooltipProvider>
    );
};
