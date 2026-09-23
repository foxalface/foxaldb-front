import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RegisterExportWizardFooterAction } from '../export-wizard-footer-action';
import { useRegisterExportWizardFooterAction } from '../use-register-export-wizard-footer-action';
import { downloadBlob } from '@/lib/download-blob';
import type {
    EfCoreExportFile,
    EfCoreExportNote,
} from '@/lib/api/ef-core-export-types';
import { EF_CORE_ZIP_MIME_TYPE } from '@/lib/export/ef-core-export-constants';
import {
    buildEfCoreExportZip,
    EfCoreExportZipError,
    resolveEfCoreExportFilename,
} from '@/lib/export/ef-core-export-zip';

interface ExportEfCoreResultStepProps {
    providerLabel: string;
    filename: string;
    files: EfCoreExportFile[];
    notes: EfCoreExportNote[];
    registerFooterAction?: RegisterExportWizardFooterAction;
}

export const ExportEfCoreResultStep: React.FC<ExportEfCoreResultStepProps> = ({
    providerLabel,
    filename,
    files,
    notes,
    registerFooterAction,
}) => {
    const { t } = useTranslation();
    const [downloadErrorCode, setDownloadErrorCode] = useState<
        'unsafe_path' | 'empty_files' | null
    >(null);

    const resolvedFilename = useMemo(
        () => resolveEfCoreExportFilename(filename),
        [filename]
    );

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
        try {
            const zipBytes = buildEfCoreExportZip(files);
            downloadBlob(
                new Blob([new Uint8Array(zipBytes)], {
                    type: EF_CORE_ZIP_MIME_TYPE,
                }),
                resolvedFilename
            );
            setDownloadErrorCode(null);
        } catch (error) {
            if (error instanceof EfCoreExportZipError) {
                setDownloadErrorCode(error.code);
                return;
            }

            setDownloadErrorCode('empty_files');
        }
    }, [files, resolvedFilename]);

    useRegisterExportWizardFooterAction(
        registerFooterAction,
        files.length > 0
            ? {
                  type: 'export',
                  onClick: handleDownload,
                  testId: 'export-ef-core-download-zip',
              }
            : null
    );

    return (
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-ef-core-result-step"
        >
            <p
                className="text-sm font-medium"
                data-testid="export-ef-core-result-success"
            >
                {t('export_wizard.ef_core.result_step.success')}
            </p>

            <p className="text-sm" data-testid="export-ef-core-result-version">
                {t('export_wizard.ef_core.result_step.ef_core_10')}
            </p>

            <p className="text-sm" data-testid="export-ef-core-result-provider">
                {t('export_wizard.ef_core.result_step.provider_label', {
                    provider: providerLabel,
                })}
            </p>

            <div>
                <p className="text-sm font-medium">
                    {t('export_wizard.ef_core.result_step.generated_files', {
                        count: files.length,
                    })}
                </p>
                {files.length > 0 ? (
                    <ul
                        className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto break-all pl-5 text-sm text-muted-foreground"
                        data-testid="export-ef-core-file-list"
                    >
                        {files.map((file) => (
                            <li key={file.path}>{file.path}</li>
                        ))}
                    </ul>
                ) : null}
            </div>

            {notes.length > 0 ? (
                <div
                    className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                    data-testid="export-ef-core-notes"
                >
                    <p className="font-medium">
                        {t('export_wizard.ef_core.result_step.notes')}
                    </p>
                    <ul className="mt-1 max-h-40 list-disc space-y-1 overflow-y-auto pl-4">
                        {notes.map((note, index) => (
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
                    </ul>
                </div>
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
        </div>
    );
};
