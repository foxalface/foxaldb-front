import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
    ExportWizardFooterAction,
    RegisterExportWizardFooterAction,
} from '../export-wizard-footer-action';
import { useRegisterExportWizardFooterAction } from '../use-register-export-wizard-footer-action';
import { Label } from '@/components/label/label';
import { Spinner } from '@/components/spinner/spinner';
import { downloadBlob } from '@/lib/download-blob';
import type {
    DjangoExportNote,
    DjangoExportSuccess,
} from '@/lib/api/django-export-types';
import { getDjangoExportNotePresentation } from './get-django-export-note-presentation';
import { getDjangoExportErrorPresentation } from './get-django-export-error-presentation';
import { partitionDjangoExportNotes } from './django-export-note-severity';
import type { TFunction } from 'i18next';
import {
    DJANGO_EXPORT_VERSION,
    DJANGO_ZIP_MIME_TYPE,
} from '@/lib/export/django-export-constants';
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
    providerLabel: string;
    isLoading: boolean;
    error: DjangoWizardRequestError | null;
    success: DjangoExportSuccess | null;
    onRetry: () => void;
    registerFooterAction?: RegisterExportWizardFooterAction;
}

export const ExportDjangoResultStep: React.FC<ExportDjangoResultStepProps> = ({
    providerLabel,
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
    const [adaptationsOpen, setAdaptationsOpen] = useState(false);

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
        setAdaptationsOpen(false);
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

    return (
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-django-result-step"
        >
            <p
                className="text-sm font-medium"
                data-testid="export-django-version"
            >
                {t('export_wizard.django.result_step.django_version', {
                    version: DJANGO_EXPORT_VERSION,
                })}
            </p>

            <p className="text-sm" data-testid="export-django-provider">
                {t('export_wizard.django.result_step.provider_label', {
                    provider: providerLabel,
                })}
            </p>

            <p className="text-sm" data-testid="export-django-package-type">
                {t('export_wizard.django.result_step.package_type')}
            </p>

            <p className="text-sm text-muted-foreground">
                {t('export_wizard.django.result_step.explanation')}
            </p>

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

            {isLoading && !errorMessage ? (
                <div
                    className="flex items-center gap-2"
                    data-testid="export-django-generating"
                >
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.django.result_step.generating')}
                    </Label>
                </div>
            ) : null}

            {success && !errorMessage && !isLoading ? (
                <>
                    <p
                        className="text-sm font-medium"
                        data-testid="export-django-result-success"
                    >
                        {t('export_wizard.django.result_step.success')}
                    </p>

                    <div>
                        <p className="text-sm font-medium">
                            {t(
                                'export_wizard.django.result_step.generated_files',
                                {
                                    count: success.files.length,
                                }
                            )}
                        </p>
                        {success.files.length > 0 ? (
                            <ul
                                className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto break-all pl-5 text-sm text-muted-foreground"
                                data-testid="export-django-file-list"
                            >
                                {success.files.map((file) => (
                                    <li key={file.path}>{file.path}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    {partitionedNotes.warnings.length > 0 ? (
                        <div
                            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                            data-testid="export-django-warnings"
                        >
                            <p className="font-medium">
                                {t(
                                    'export_wizard.django.result_step.warnings_heading',
                                    {
                                        count: partitionedNotes.warnings.length,
                                    }
                                )}
                            </p>
                            {renderDjangoExportNoteList(
                                partitionedNotes.warnings,
                                t,
                                'export-django-warnings-list'
                            )}
                        </div>
                    ) : null}

                    {partitionedNotes.adaptations.length > 0 ? (
                        <div
                            className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                            data-testid="export-django-adaptations"
                        >
                            <button
                                type="button"
                                className="flex w-full items-center justify-between text-left font-medium text-foreground/80"
                                aria-expanded={adaptationsOpen}
                                onClick={() =>
                                    setAdaptationsOpen((open) => !open)
                                }
                                data-testid="export-django-adaptations-toggle"
                            >
                                {t(
                                    'export_wizard.django.result_step.adaptations_heading',
                                    {
                                        count: partitionedNotes.adaptations
                                            .length,
                                    }
                                )}
                            </button>
                            {adaptationsOpen
                                ? renderDjangoExportNoteList(
                                      partitionedNotes.adaptations,
                                      t,
                                      'export-django-adaptations-list'
                                  )
                                : null}
                        </div>
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

const renderDjangoExportNoteList = (
    notes: DjangoExportNote[],
    t: TFunction,
    listTestId: string
) => (
    <ul
        className="mt-1 max-h-40 list-disc space-y-2 overflow-y-auto pl-4"
        data-testid={listTestId}
    >
        {notes.map((note, index) => (
            <li
                key={`${note.code}-${note.path ?? index}`}
                className="break-words"
            >
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
        ))}
    </ul>
);
