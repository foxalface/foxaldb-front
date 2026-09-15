import React, { useCallback, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';
import { Spinner } from '@/components/spinner/spinner';
import { downloadBlob } from '@/lib/download-blob';
import type { RailsExportSuccess } from '@/lib/api/rails-export-types';
import { getRailsExportNotePresentation } from './get-rails-export-note-presentation';
import { RAILS_ZIP_MIME_TYPE } from '@/lib/export/rails-export-constants';
import {
    buildRailsExportZip,
    RailsExportZipError,
    resolveRailsExportFilename,
} from '@/lib/export/rails-export-zip';

export type RailsWizardRequestErrorKind =
    | 'semantic'
    | 'unauthenticated'
    | 'invalid_request'
    | 'rate_limited'
    | 'unexpected';

export interface RailsWizardRequestError {
    kind: RailsWizardRequestErrorKind;
    message?: string;
    code?: string;
    path?: string;
}

interface ExportRailsResultStepProps {
    providerLabel: string;
    isLoading: boolean;
    error: RailsWizardRequestError | null;
    success: RailsExportSuccess | null;
    onRetry: () => void;
}

export const ExportRailsResultStep: React.FC<ExportRailsResultStepProps> = ({
    providerLabel,
    isLoading,
    error,
    success,
    onRetry,
}) => {
    const { t } = useTranslation();
    const [downloadErrorCode, setDownloadErrorCode] = useState<
        'unsafe_path' | 'empty_files' | 'duplicate_path' | null
    >(null);

    const resolvedFilename = useMemo(
        () => resolveRailsExportFilename(success?.filename),
        [success?.filename]
    );

    const errorMessage = useMemo(() => {
        if (!error) {
            return null;
        }

        switch (error.kind) {
            case 'semantic':
                return error.message && error.message.trim().length > 0
                    ? error.message
                    : t('export_wizard.rails.result_step.error_semantic');
            case 'unauthenticated':
                return t(
                    'export_wizard.rails.result_step.error_unauthenticated'
                );
            case 'invalid_request':
                return t(
                    'export_wizard.rails.result_step.error_invalid_request'
                );
            case 'rate_limited':
                return t('export_wizard.rails.result_step.error_rate_limited');
            default:
                return t('export_wizard.rails.result_step.error_unexpected');
        }
    }, [error, t]);

    const downloadErrorMessage = useMemo(() => {
        if (downloadErrorCode === 'unsafe_path') {
            return t('export_wizard.rails.result_step.error_unsafe_path');
        }

        if (downloadErrorCode === 'empty_files') {
            return t('export_wizard.rails.result_step.error_empty_files');
        }

        if (downloadErrorCode === 'duplicate_path') {
            return t('export_wizard.rails.result_step.error_invalid_package');
        }

        return null;
    }, [downloadErrorCode, t]);

    const handleDownload = useCallback(() => {
        if (!success) {
            return;
        }

        try {
            const zipBytes = buildRailsExportZip(success.files);
            downloadBlob(
                new Blob([new Uint8Array(zipBytes)], {
                    type: RAILS_ZIP_MIME_TYPE,
                }),
                resolvedFilename
            );
            setDownloadErrorCode(null);
        } catch (zipError) {
            if (zipError instanceof RailsExportZipError) {
                setDownloadErrorCode(zipError.code);
                return;
            }

            setDownloadErrorCode('empty_files');
        }
    }, [resolvedFilename, success]);

    const handleRetry = () => {
        if (isLoading) {
            return;
        }

        setDownloadErrorCode(null);
        onRetry();
    };

    return (
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-rails-result-step"
        >
            <p
                className="text-sm font-medium"
                data-testid="export-rails-version"
            >
                {t('export_wizard.rails.result_step.rails_8_1')}
            </p>

            <p className="text-sm" data-testid="export-rails-provider">
                {t('export_wizard.rails.result_step.provider_label', {
                    provider: providerLabel,
                })}
            </p>

            <p className="text-sm text-muted-foreground">
                {t('export_wizard.rails.result_step.explanation')}
            </p>

            {errorMessage ? (
                <div className="flex flex-col items-start gap-3">
                    <p
                        className="break-words text-sm text-muted-foreground"
                        role="alert"
                        data-testid="export-rails-error"
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
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={isLoading}
                        onClick={handleRetry}
                        data-testid="export-rails-retry"
                    >
                        {t('export_wizard.rails.result_step.retry')}
                    </Button>
                </div>
            ) : null}

            {isLoading && !errorMessage ? (
                <div
                    className="flex items-center gap-2"
                    data-testid="export-rails-generating"
                >
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.rails.result_step.generating')}
                    </Label>
                </div>
            ) : null}

            {success && !errorMessage && !isLoading ? (
                <>
                    <p
                        className="text-sm font-medium"
                        data-testid="export-rails-result-success"
                    >
                        {t('export_wizard.rails.result_step.success')}
                    </p>

                    <div>
                        <p className="text-sm font-medium">
                            {t(
                                'export_wizard.rails.result_step.generated_files',
                                {
                                    count: success.files.length,
                                }
                            )}
                        </p>
                        {success.files.length > 0 ? (
                            <ul
                                className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto break-all pl-5 text-sm text-muted-foreground"
                                data-testid="export-rails-file-list"
                            >
                                {success.files.map((file) => (
                                    <li key={file.path}>{file.path}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    {success.notes.length > 0 ? (
                        <div
                            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                            data-testid="export-rails-notes"
                        >
                            <p className="font-medium">
                                {t(
                                    'export_wizard.rails.result_step.notes_heading'
                                )}
                            </p>
                            <ul className="mt-1 max-h-40 list-disc space-y-1 overflow-y-auto pl-4">
                                {success.notes.map((note, index) => (
                                    <li
                                        key={`${note.code}-${note.path ?? index}`}
                                        className="break-words"
                                    >
                                        <span>
                                            {
                                                getRailsExportNotePresentation(
                                                    note,
                                                    t
                                                ).message
                                            }
                                        </span>
                                        {note.path ? (
                                            <span className="mt-0.5 block break-all text-xs opacity-80">
                                                {note.path}
                                            </span>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {downloadErrorMessage ? (
                        <p
                            className="break-words text-sm text-muted-foreground"
                            role="alert"
                            data-testid="export-rails-download-error"
                        >
                            {downloadErrorMessage}
                        </p>
                    ) : null}

                    <Button
                        type="button"
                        className="w-fit"
                        onClick={handleDownload}
                        data-testid="export-rails-download-zip"
                    >
                        <Download className="mr-1 size-4" />
                        {t('export_wizard.rails.result_step.download_zip')}
                    </Button>
                </>
            ) : null}
        </div>
    );
};
