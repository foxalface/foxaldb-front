import React, { useCallback, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';
import { Spinner } from '@/components/spinner/spinner';
import { downloadBlob } from '@/lib/download-blob';
import type {
    DrizzleExportNote,
    DrizzleExportSuccess,
} from '@/lib/api/drizzle-export-types';
import { getDrizzleExportNotePresentation } from './get-drizzle-export-note-presentation';
import { getDrizzleExportErrorPresentation } from './get-drizzle-export-error-presentation';
import { partitionDrizzleExportNotes } from './drizzle-export-note-severity';
import type { TFunction } from 'i18next';
import {
    DRIZZLE_EXPORT_KIT_VERSION,
    DRIZZLE_EXPORT_ORM_VERSION,
    DRIZZLE_ZIP_MIME_TYPE,
} from '@/lib/export/drizzle-export-constants';
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
    providerLabel: string;
    isLoading: boolean;
    error: DrizzleWizardRequestError | null;
    success: DrizzleExportSuccess | null;
    onRetry: () => void;
}

export const ExportDrizzleResultStep: React.FC<
    ExportDrizzleResultStepProps
> = ({ providerLabel, isLoading, error, success, onRetry }) => {
    const { t } = useTranslation();
    const [downloadErrorCode, setDownloadErrorCode] = useState<
        'unsafe_path' | 'empty_files' | 'duplicate_path' | null
    >(null);
    const [adaptationsOpen, setAdaptationsOpen] = useState(false);

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

    const handleRetry = () => {
        if (isLoading) {
            return;
        }

        setDownloadErrorCode(null);
        setAdaptationsOpen(false);
        onRetry();
    };

    return (
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-drizzle-result-step"
        >
            <p
                className="text-sm font-medium"
                data-testid="export-drizzle-version"
            >
                {t('export_wizard.drizzle.result_step.drizzle_version', {
                    orm: DRIZZLE_EXPORT_ORM_VERSION,
                    kit: DRIZZLE_EXPORT_KIT_VERSION,
                })}
            </p>

            <p className="text-sm" data-testid="export-drizzle-provider">
                {t('export_wizard.drizzle.result_step.provider_label', {
                    provider: providerLabel,
                })}
            </p>

            <p className="text-sm" data-testid="export-drizzle-package-type">
                {t('export_wizard.drizzle.result_step.package_type')}
            </p>

            <p className="text-sm text-muted-foreground">
                {t('export_wizard.drizzle.result_step.explanation')}
            </p>

            {errorMessage ? (
                <div className="flex flex-col items-start gap-3">
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
                                {t(
                                    'export_wizard.drizzle.result_step.path_label',
                                    {
                                        path: error.path,
                                    }
                                )}
                            </span>
                        ) : null}
                    </p>
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={isLoading}
                        onClick={handleRetry}
                        data-testid="export-drizzle-retry"
                    >
                        {t('export_wizard.drizzle.result_step.retry')}
                    </Button>
                </div>
            ) : null}

            {isLoading && !errorMessage ? (
                <div
                    className="flex items-center gap-2"
                    data-testid="export-drizzle-generating"
                >
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.drizzle.result_step.generating')}
                    </Label>
                </div>
            ) : null}

            {success && !errorMessage && !isLoading ? (
                <>
                    <p
                        className="text-sm font-medium"
                        data-testid="export-drizzle-result-success"
                    >
                        {t('export_wizard.drizzle.result_step.success')}
                    </p>

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
                            <ul
                                className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto break-all pl-5 text-sm text-muted-foreground"
                                data-testid="export-drizzle-file-list"
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
                            data-testid="export-drizzle-warnings"
                        >
                            <p className="font-medium">
                                {t(
                                    'export_wizard.drizzle.result_step.warnings_heading',
                                    {
                                        count: partitionedNotes.warnings.length,
                                    }
                                )}
                            </p>
                            {renderDrizzleExportNoteList(
                                partitionedNotes.warnings,
                                t,
                                'export-drizzle-warnings-list'
                            )}
                        </div>
                    ) : null}

                    {partitionedNotes.adaptations.length > 0 ? (
                        <div
                            className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                            data-testid="export-drizzle-adaptations"
                        >
                            <button
                                type="button"
                                className="flex w-full items-center justify-between text-left font-medium text-foreground/80"
                                aria-expanded={adaptationsOpen}
                                onClick={() =>
                                    setAdaptationsOpen((open) => !open)
                                }
                                data-testid="export-drizzle-adaptations-toggle"
                            >
                                {t(
                                    'export_wizard.drizzle.result_step.adaptations_heading',
                                    {
                                        count: partitionedNotes.adaptations
                                            .length,
                                    }
                                )}
                            </button>
                            {adaptationsOpen
                                ? renderDrizzleExportNoteList(
                                      partitionedNotes.adaptations,
                                      t,
                                      'export-drizzle-adaptations-list'
                                  )
                                : null}
                        </div>
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

                    <Button
                        type="button"
                        className="w-fit"
                        onClick={handleDownload}
                        data-testid="export-drizzle-download-zip"
                    >
                        <Download className="mr-1 size-4" />
                        {t('export_wizard.drizzle.result_step.download_zip')}
                    </Button>
                </>
            ) : null}
        </div>
    );
};

const renderDrizzleExportNoteList = (
    notes: DrizzleExportNote[],
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
        ))}
    </ul>
);
