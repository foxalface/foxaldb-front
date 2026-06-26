import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogInternalContent,
    DialogTitle,
} from '@/components/dialog/dialog';
import { FileUploader } from '@/components/file-uploader/file-uploader';
import { Spinner } from '@/components/spinner/spinner';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { compareLaravelMigrationArchives } from '@/lib/api/laravel-migration-diff';
import { LARAVEL_MIGRATION_ARCHIVE_MAX_BYTES } from '@/lib/api/laravel-migration-import';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';
import { formatApiErrorMessage } from '@/pages/auth/format-api-error-message';
import type { LaravelMigrationSchemaDiff } from '@/types/laravel-migration';
import { useTranslation } from 'react-i18next';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { LaravelMigrationDiffViewer } from './laravel-migration-diff-viewer';

export interface LaravelMigrationDiffDialogProps extends BaseDialogProps {}

export const LaravelMigrationDiffDialog: React.FC<
    LaravelMigrationDiffDialogProps
> = ({ dialog }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { closeLaravelMigrationDiffDialog } = useDialog();
    const [beforeFile, setBeforeFile] = useState<File | null>(null);
    const [afterFile, setAfterFile] = useState<File | null>(null);
    const [beforeUploadKey, setBeforeUploadKey] = useState(0);
    const [afterUploadKey, setAfterUploadKey] = useState(0);
    const [isComparing, setIsComparing] = useState(false);
    const [beforeFileError, setBeforeFileError] = useState<string | null>(null);
    const [afterFileError, setAfterFileError] = useState<string | null>(null);
    const [compareError, setCompareError] = useState<string | null>(null);
    const [diff, setDiff] = useState<LaravelMigrationSchemaDiff | null>(null);

    const resetState = useCallback(() => {
        setBeforeFile(null);
        setAfterFile(null);
        setBeforeUploadKey((previous) => previous + 1);
        setAfterUploadKey((previous) => previous + 1);
        setIsComparing(false);
        setBeforeFileError(null);
        setAfterFileError(null);
        setCompareError(null);
        setDiff(null);
    }, []);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        resetState();
    }, [dialog.open, resetState]);

    const onBeforeFileChange = useCallback((files: File[]) => {
        setBeforeFileError(null);
        setCompareError(null);

        if (files.length === 0) {
            setBeforeFile(null);
            return;
        }

        setBeforeFile(files[0]);
    }, []);

    const onAfterFileChange = useCallback((files: File[]) => {
        setAfterFileError(null);
        setCompareError(null);

        if (files.length === 0) {
            setAfterFile(null);
            return;
        }

        setAfterFile(files[0]);
    }, []);

    const handleCompare = useCallback(async () => {
        let hasClientError = false;

        if (!beforeFile) {
            setBeforeFileError(
                t('compare_laravel_migrations_dialog.errors.before_required')
            );
            hasClientError = true;
        }

        if (!afterFile) {
            setAfterFileError(
                t('compare_laravel_migrations_dialog.errors.after_required')
            );
            hasClientError = true;
        }

        if (hasClientError) {
            return;
        }

        if (!beforeFile || !afterFile) {
            return;
        }

        if (beforeFile.size > LARAVEL_MIGRATION_ARCHIVE_MAX_BYTES) {
            setBeforeFileError(
                t('compare_laravel_migrations_dialog.errors.file_too_large')
            );
            return;
        }

        if (afterFile.size > LARAVEL_MIGRATION_ARCHIVE_MAX_BYTES) {
            setAfterFileError(
                t('compare_laravel_migrations_dialog.errors.file_too_large')
            );
            return;
        }

        setIsComparing(true);
        setBeforeFileError(null);
        setAfterFileError(null);
        setCompareError(null);

        try {
            const result = await compareLaravelMigrationArchives(
                beforeFile,
                afterFile
            );
            setDiff(result);
        } catch (error) {
            const validationErrors = parseLaravelValidationErrors(error);

            if (validationErrors.before_archive) {
                setBeforeFileError(validationErrors.before_archive);
            }

            if (validationErrors.after_archive) {
                setAfterFileError(validationErrors.after_archive);
            }

            if (
                !validationErrors.before_archive &&
                !validationErrors.after_archive
            ) {
                const message = formatApiErrorMessage(error);
                setCompareError(
                    message ||
                        t(
                            'compare_laravel_migrations_dialog.errors.compare_failed'
                        )
                );
            }
        } finally {
            setIsComparing(false);
        }
    }, [afterFile, beforeFile, t]);

    const handleCompareAnother = useCallback(() => {
        resetState();
    }, [resetState]);

    if (!user) {
        return null;
    }

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeLaravelMigrationDiffDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-h-screen max-w-2xl flex-col"
                showClose
            >
                <DialogHeader>
                    <DialogTitle>
                        {t('compare_laravel_migrations_dialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('compare_laravel_migrations_dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <DialogInternalContent>
                    {diff ? (
                        <LaravelMigrationDiffViewer diff={diff} />
                    ) : (
                        <div className="flex flex-col gap-4 p-1">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    {t(
                                        'compare_laravel_migrations_dialog.before_label'
                                    )}
                                </p>
                                <FileUploader
                                    key={beforeUploadKey}
                                    supportedExtensions={['.zip']}
                                    onFilesChange={onBeforeFileChange}
                                />
                                {!beforeFile ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'compare_laravel_migrations_dialog.no_before_file_selected'
                                        )}
                                    </p>
                                ) : null}
                                {beforeFileError ? (
                                    <p className="text-sm text-destructive">
                                        {beforeFileError}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    {t(
                                        'compare_laravel_migrations_dialog.after_label'
                                    )}
                                </p>
                                <FileUploader
                                    key={afterUploadKey}
                                    supportedExtensions={['.zip']}
                                    onFilesChange={onAfterFileChange}
                                />
                                {!afterFile ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'compare_laravel_migrations_dialog.no_after_file_selected'
                                        )}
                                    </p>
                                ) : null}
                                {afterFileError ? (
                                    <p className="text-sm text-destructive">
                                        {afterFileError}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {compareError ? (
                        <p className="mt-2 text-sm text-destructive">
                            {compareError}
                        </p>
                    ) : null}
                </DialogInternalContent>

                <DialogFooter className="flex gap-1 md:justify-between">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isComparing}
                        >
                            {t('compare_laravel_migrations_dialog.close')}
                        </Button>
                    </DialogClose>

                    {diff ? (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCompareAnother}
                        >
                            {t(
                                'compare_laravel_migrations_dialog.compare_another'
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => void handleCompare()}
                            disabled={
                                isComparing ||
                                beforeFile === null ||
                                afterFile === null
                            }
                        >
                            {isComparing ? (
                                <>
                                    <Spinner className="mr-1 size-5 text-primary-foreground" />
                                    {t(
                                        'compare_laravel_migrations_dialog.comparing'
                                    )}
                                </>
                            ) : (
                                t('compare_laravel_migrations_dialog.compare')
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
