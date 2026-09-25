import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
    ExportWizardFooterAction,
    RegisterExportWizardFooterAction,
} from '../export-wizard-footer-action';
import { useRegisterExportWizardFooterAction } from '../use-register-export-wizard-footer-action';
import { downloadBlob } from '@/lib/download-blob';
import { ExportFileListSkeleton } from '../export-file-list-skeleton';
import { ExportGeneratedFilesTree } from '../export-generated-files-tree';
import { ExportWizardAdaptationsPanel } from '../export-wizard-adaptations-panel';
import { ExportWizardNotesPanel } from '../export-wizard-notes-panel';
import type {
    DrizzleExportNote,
    DrizzleExportSuccess,
} from '@/lib/api/drizzle-export-types';
import { getDrizzleExportNotePresentation } from './get-drizzle-export-note-presentation';
import { getDrizzleExportErrorPresentation } from './get-drizzle-export-error-presentation';
import { partitionDrizzleExportNotes } from './drizzle-export-note-severity';
import type { TFunction } from 'i18next';
import { DRIZZLE_ZIP_MIME_TYPE } from '@/lib/export/drizzle-export-constants';
import {
    buildDrizzleExportZip,
    DrizzleExportZipError,
    resolveDrizzleExportFilename,
} from '@/lib/export/drizzle-export-zip';

export type DrizzleWizardRequestErrorKind =
    | 'semantic'
    | 'unauthenticated'
    | 'invalid_request'
    | 'rate_limited'
    | 'network'
    | 'unexpected';

export interface DrizzleWizardRequestError {
    kind: DrizzleWizardRequestErrorKind;
    message?: string;
    code?: string;
    path?: string;
}

interface ExportDrizzleResultStepProps {
    isLoading: boolean;
    error: DrizzleWizardRequestError | null;
    success: DrizzleExportSuccess | null;
    onRetry: () => void;
    registerFooterAction?: RegisterExportWizardFooterAction;
}

export const ExportDrizzleResultStep: React.FC<
    ExportDrizzleResultStepProps
> = ({ isLoading, error, success, onRetry, registerFooterAction }) => {
    const { t } = useTranslation();
    const [downloadErrorCode, setDownloadErrorCode] = useState<
        'unsafe_path' | 'empty_files' | 'duplicate_path' | null
    >(null);
    const resolvedFilename = useMemo(
        () => resolveDrizzleExportFilename(success?.filename),
        [success?.filename]
    );

    const partitionedNotes = useMemo(
        () => partitionDrizzleExportNotes(success?.notes ?? []),
        [success?.notes]
    );

    const errorMessage = useMemo(() => {
        if (!error) {
            return null;
        }

        switch (error.kind) {
            case 'semantic':
                return getDrizzleExportErrorPresentation(
                    {
                        code: error.code ?? '',
                        message:
                            error.message && error.message.trim().length > 0
                                ? error.message
                                : t(
                                      'export_wizard.drizzle.result_step.error_semantic'
                                  ),
                        path: error.path,
                    },
                    t
                );
            case 'unauthenticated':
                return t(
                    'export_wizard.drizzle.result_step.error_unauthenticated'
                );
            case 'invalid_request':
                return t(
                    'export_wizard.drizzle.result_step.error_invalid_request'
                );
            case 'rate_limited':
                return t(
                    'export_wizard.drizzle.result_step.error_rate_limited'
                );
            case 'network':
                return t('export_wizard.drizzle.result_step.error_network');
            default:
                return t('export_wizard.drizzle.result_step.error_unexpected');
        }
    }, [error, t]);

    const downloadErrorMessage = useMemo(() => {
        if (downloadErrorCode === 'unsafe_path') {
            return t('export_wizard.drizzle.result_step.error_unsafe_path');
        }

        if (downloadErrorCode === 'empty_files') {
            return t('export_wizard.drizzle.result_step.error_empty_files');
        }

        if (downloadErrorCode === 'duplicate_path') {
            return t('export_wizard.drizzle.result_step.error_invalid_package');
        }

        return null;
    }, [downloadErrorCode, t]);

    const handleDownload = useCallback(() => {
        if (!success) {
            return;
        }

        try {
            const zipBytes = buildDrizzleExportZip(success.files);
            downloadBlob(
                new Blob([new Uint8Array(zipBytes)], {
                    type: DRIZZLE_ZIP_MIME_TYPE,
                }),
                resolvedFilename
            );
            setDownloadErrorCode(null);
        } catch (zipError) {
            if (zipError instanceof DrizzleExportZipError) {
                setDownloadErrorCode(zipError.code);
                return;
            }

            setDownloadErrorCode('empty_files');
        }
    }, [resolvedFilename, success]);

    const handleRetry = useCallback(() => {
        if (isLoading) {
            return;
        }

        setDownloadErrorCode(null);
        onRetry();
    }, [isLoading, onRetry]);

    const footerAction = useMemo((): ExportWizardFooterAction | null => {
        if (errorMessage) {
            return {
                type: 'retry',
                onClick: handleRetry,
                disabled: isLoading,
                testId: 'export-drizzle-retry',
                label: t('export_wizard.drizzle.result_step.retry'),
            };
        }

        if (success && !isLoading) {
            return {
                type: 'export',
                onClick: handleDownload,
                testId: 'export-drizzle-download-zip',
            };
        }

        return null;
    }, [errorMessage, handleDownload, handleRetry, isLoading, success, t]);

    useRegisterExportWizardFooterAction(registerFooterAction, footerAction);

    const showGenerating = isLoading && !errorMessage;

    return (
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-drizzle-result-step"
        >
            {errorMessage ? (
                <p
                    className="break-words text-sm text-muted-foreground"
                    role="alert"
                    data-testid="export-drizzle-error"
                    data-error-kind={error?.kind}
                    data-error-code={error?.code}
                >
                    {errorMessage}
                    {error?.kind === 'semantic' && error.path ? (
                        <span
                            className="mt-1 block break-all font-mono text-xs"
                            data-testid="export-drizzle-error-path"
                        >
                            {t('export_wizard.drizzle.result_step.path_label', {
                                path: error.path,
                            })}
                        </span>
                    ) : null}
                </p>
            ) : null}

            {success && !errorMessage && !isLoading ? (
                <div>
                    <p className="text-sm font-medium">
                        {t(
                            'export_wizard.drizzle.result_step.generated_files',
                            {
                                count: success.files.length,
                            }
                        )}
                    </p>
                    {success.files.length > 0 ? (
                        <ExportGeneratedFilesTree
                            paths={success.files.map((file) => file.path)}
                            testId="export-drizzle-file-list"
                        />
                    ) : null}
                </div>
            ) : null}

            {showGenerating ? (
                <ExportFileListSkeleton
                    testId="export-drizzle-generating"
                    ariaLabel={t(
                        'export_wizard.drizzle.result_step.generating'
                    )}
                />
            ) : null}

            {success && !errorMessage && !isLoading ? (
                <>
                    {partitionedNotes.warnings.length > 0 ? (
                        <ExportWizardNotesPanel
                            heading={t(
                                'export_wizard.drizzle.result_step.warnings_heading',
                                {
                                    count: partitionedNotes.warnings.length,
                                }
                            )}
                            testId="export-drizzle-warnings"
                            listTestId="export-drizzle-warnings-list"
                        >
                            {renderDrizzleExportNoteItems(
                                partitionedNotes.warnings,
                                t
                            )}
                        </ExportWizardNotesPanel>
                    ) : null}

                    {partitionedNotes.adaptations.length > 0 ? (
                        <ExportWizardAdaptationsPanel
                            heading={t(
                                'export_wizard.drizzle.result_step.adaptations_heading',
                                {
                                    count: partitionedNotes.adaptations.length,
                                }
                            )}
                            testId="export-drizzle-adaptations"
                            listTestId="export-drizzle-adaptations-list"
                        >
                            {renderDrizzleExportNoteItems(
                                partitionedNotes.adaptations,
                                t
                            )}
                        </ExportWizardAdaptationsPanel>
                    ) : null}

                    {downloadErrorMessage ? (
                        <p
                            className="break-words text-sm text-muted-foreground"
                            role="alert"
                            data-testid="export-drizzle-download-error"
                        >
                            {downloadErrorMessage}
                        </p>
                    ) : null}
                </>
            ) : null}
        </div>
    );
};

const renderDrizzleExportNoteItems = (
    notes: DrizzleExportNote[],
    t: TFunction
) =>
    notes.map((note, index) => (
        <li key={`${note.code}-${note.path ?? index}`} className="break-words">
            <span>{getDrizzleExportNotePresentation(note, t).message}</span>
            {note.path ? (
                <span
                    className="mt-1 block break-all font-mono text-xs opacity-80"
                    data-testid="export-drizzle-note-path"
                >
                    {t('export_wizard.drizzle.result_step.path_label', {
                        path: note.path,
                    })}
                </span>
            ) : null}
        </li>
    ));
