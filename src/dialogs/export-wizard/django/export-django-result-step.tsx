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
    DjangoExportNote,
    DjangoExportSuccess,
} from '@/lib/api/django-export-types';
import { getDjangoExportNotePresentation } from './get-django-export-note-presentation';
import { getDjangoExportErrorPresentation } from './get-django-export-error-presentation';
import { partitionDjangoExportNotes } from './django-export-note-severity';
import type { TFunction } from 'i18next';
import { DJANGO_ZIP_MIME_TYPE } from '@/lib/export/django-export-constants';
import {
    buildDjangoExportZip,
    DjangoExportZipError,
    resolveDjangoExportFilename,
} from '@/lib/export/django-export-zip';

export type DjangoWizardRequestErrorKind =
    | 'semantic'
    | 'unauthenticated'
    | 'invalid_request'
    | 'rate_limited'
    | 'network'
    | 'unexpected';

export interface DjangoWizardRequestError {
    kind: DjangoWizardRequestErrorKind;
    message?: string;
    code?: string;
    path?: string;
}

interface ExportDjangoResultStepProps {
    isLoading: boolean;
    error: DjangoWizardRequestError | null;
    success: DjangoExportSuccess | null;
    onRetry: () => void;
    registerFooterAction?: RegisterExportWizardFooterAction;
}

export const ExportDjangoResultStep: React.FC<ExportDjangoResultStepProps> = ({
    isLoading,
    error,
    success,
    onRetry,
    registerFooterAction,
}) => {
    const { t } = useTranslation();
    const [downloadErrorCode, setDownloadErrorCode] = useState<
        'unsafe_path' | 'empty_files' | 'duplicate_path' | null
    >(null);
    const resolvedFilename = useMemo(
        () => resolveDjangoExportFilename(success?.filename),
        [success?.filename]
    );

    const partitionedNotes = useMemo(
        () => partitionDjangoExportNotes(success?.notes ?? []),
        [success?.notes]
    );

    const errorMessage = useMemo(() => {
        if (!error) {
            return null;
        }

        switch (error.kind) {
            case 'semantic':
                return getDjangoExportErrorPresentation(
                    {
                        code: error.code ?? '',
                        message:
                            error.message && error.message.trim().length > 0
                                ? error.message
                                : t(
                                      'export_wizard.django.result_step.error_semantic'
                                  ),
                        path: error.path,
                    },
                    t
                );
            case 'unauthenticated':
                return t(
                    'export_wizard.django.result_step.error_unauthenticated'
                );
            case 'invalid_request':
                return t(
                    'export_wizard.django.result_step.error_invalid_request'
                );
            case 'rate_limited':
                return t('export_wizard.django.result_step.error_rate_limited');
            case 'network':
                return t('export_wizard.django.result_step.error_network');
            default:
                return t('export_wizard.django.result_step.error_unexpected');
        }
    }, [error, t]);

    const downloadErrorMessage = useMemo(() => {
        if (downloadErrorCode === 'unsafe_path') {
            return t('export_wizard.django.result_step.error_unsafe_path');
        }

        if (downloadErrorCode === 'empty_files') {
            return t('export_wizard.django.result_step.error_empty_files');
        }

        if (downloadErrorCode === 'duplicate_path') {
            return t('export_wizard.django.result_step.error_invalid_package');
        }

        return null;
    }, [downloadErrorCode, t]);

    const handleDownload = useCallback(() => {
        if (!success) {
            return;
        }

        try {
            const zipBytes = buildDjangoExportZip(success.files);
            downloadBlob(
                new Blob([new Uint8Array(zipBytes)], {
                    type: DJANGO_ZIP_MIME_TYPE,
                }),
                resolvedFilename
            );
            setDownloadErrorCode(null);
        } catch (zipError) {
            if (zipError instanceof DjangoExportZipError) {
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
                testId: 'export-django-retry',
                label: t('export_wizard.django.result_step.retry'),
            };
        }

        if (success && !isLoading) {
            return {
                type: 'export',
                onClick: handleDownload,
                testId: 'export-django-download-zip',
            };
        }

        return null;
    }, [errorMessage, handleDownload, handleRetry, isLoading, success, t]);

    useRegisterExportWizardFooterAction(registerFooterAction, footerAction);

    const showGenerating = isLoading && !errorMessage;

    return (
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-django-result-step"
        >
            {errorMessage ? (
                <p
                    className="break-words text-sm text-muted-foreground"
                    role="alert"
                    data-testid="export-django-error"
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

            {success && !errorMessage && !isLoading ? (
                <div>
                    <p className="text-sm font-medium">
                        {t('export_wizard.django.result_step.generated_files', {
                            count: success.files.length,
                        })}
                    </p>
                    {success.files.length > 0 ? (
                        <ExportGeneratedFilesTree
                            paths={success.files.map((file) => file.path)}
                            testId="export-django-file-list"
                        />
                    ) : null}
                </div>
            ) : null}

            {showGenerating ? (
                <ExportFileListSkeleton
                    testId="export-django-generating"
                    ariaLabel={t('export_wizard.django.result_step.generating')}
                />
            ) : null}

            {success && !errorMessage && !isLoading ? (
                <>
                    {partitionedNotes.warnings.length > 0 ? (
                        <ExportWizardNotesPanel
                            heading={t(
                                'export_wizard.django.result_step.warnings_heading',
                                {
                                    count: partitionedNotes.warnings.length,
                                }
                            )}
                            testId="export-django-warnings"
                            listTestId="export-django-warnings-list"
                        >
                            {renderDjangoExportNoteItems(
                                partitionedNotes.warnings,
                                t
                            )}
                        </ExportWizardNotesPanel>
                    ) : null}

                    {partitionedNotes.adaptations.length > 0 ? (
                        <ExportWizardAdaptationsPanel
                            heading={t(
                                'export_wizard.django.result_step.adaptations_heading',
                                {
                                    count: partitionedNotes.adaptations.length,
                                }
                            )}
                            testId="export-django-adaptations"
                            listTestId="export-django-adaptations-list"
                        >
                            {renderDjangoExportNoteItems(
                                partitionedNotes.adaptations,
                                t
                            )}
                        </ExportWizardAdaptationsPanel>
                    ) : null}

                    {downloadErrorMessage ? (
                        <p
                            className="break-words text-sm text-muted-foreground"
                            role="alert"
                            data-testid="export-django-download-error"
                        >
                            {downloadErrorMessage}
                        </p>
                    ) : null}
                </>
            ) : null}
        </div>
    );
};

const renderDjangoExportNoteItems = (notes: DjangoExportNote[], t: TFunction) =>
    notes.map((note, index) => (
        <li key={`${note.code}-${note.path ?? index}`} className="break-words">
            <span>{getDjangoExportNotePresentation(note, t).message}</span>
            {note.path ? (
                <span
                    className="mt-1 block break-all font-mono text-xs opacity-80"
                    data-testid="export-django-note-path"
                >
                    {t('export_wizard.django.result_step.path_label', {
                        path: note.path,
                    })}
                </span>
            ) : null}
        </li>
    ));
