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
import {
    LARAVEL_MIGRATION_ARCHIVE_MAX_BYTES,
    uploadLaravelMigrationArchive,
} from '@/lib/api/laravel-migration-import';
import { formatApiErrorMessage } from '@/pages/auth/format-api-error-message';
import type { LaravelMigrationSchemaSnapshot } from '@/types/laravel-migration';
import { useTranslation } from 'react-i18next';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { MigrationSnapshotViewer } from './migration-snapshot-viewer';

export interface LaravelMigrationImportDialogProps extends BaseDialogProps {}

export const LaravelMigrationImportDialog: React.FC<
    LaravelMigrationImportDialogProps
> = ({ dialog }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { closeLaravelMigrationImportDialog } = useDialog();
    const [file, setFile] = useState<File | null>(null);
    const [uploadKey, setUploadKey] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [snapshot, setSnapshot] =
        useState<LaravelMigrationSchemaSnapshot | null>(null);

    const resetState = useCallback(() => {
        setFile(null);
        setUploadKey((previous) => previous + 1);
        setIsUploading(false);
        setUploadError(null);
        setSnapshot(null);
    }, []);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        resetState();
    }, [dialog.open, resetState]);

    const onFileChange = useCallback((files: File[]) => {
        setUploadError(null);

        if (files.length === 0) {
            setFile(null);
            return;
        }

        setFile(files[0]);
    }, []);

    const handleUpload = useCallback(async () => {
        if (!file) {
            setUploadError(
                t('import_laravel_migrations_dialog.errors.file_required')
            );
            return;
        }

        if (file.size > LARAVEL_MIGRATION_ARCHIVE_MAX_BYTES) {
            setUploadError(
                t('import_laravel_migrations_dialog.errors.file_too_large')
            );
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const result = await uploadLaravelMigrationArchive(file);
            setSnapshot(result);
        } catch (error) {
            const message = formatApiErrorMessage(error);
            setUploadError(
                message ||
                    t('import_laravel_migrations_dialog.errors.upload_failed')
            );
        } finally {
            setIsUploading(false);
        }
    }, [file, t]);

    const handleUploadAnother = useCallback(() => {
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
                    closeLaravelMigrationImportDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-h-screen max-w-lg flex-col"
                showClose
            >
                <DialogHeader>
                    <DialogTitle>
                        {t('import_laravel_migrations_dialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('import_laravel_migrations_dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <DialogInternalContent>
                    {snapshot ? (
                        <MigrationSnapshotViewer snapshot={snapshot} />
                    ) : (
                        <div className="flex flex-col p-1">
                            <FileUploader
                                key={uploadKey}
                                supportedExtensions={['.zip']}
                                onFilesChange={onFileChange}
                            />
                            {!file ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t(
                                        'import_laravel_migrations_dialog.no_file_selected'
                                    )}
                                </p>
                            ) : null}
                        </div>
                    )}

                    {uploadError ? (
                        <p className="mt-2 text-sm text-destructive">
                            {uploadError}
                        </p>
                    ) : null}
                </DialogInternalContent>

                <DialogFooter className="flex gap-1 md:justify-between">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isUploading}
                        >
                            {t('import_laravel_migrations_dialog.close')}
                        </Button>
                    </DialogClose>

                    {snapshot ? (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleUploadAnother}
                        >
                            {t(
                                'import_laravel_migrations_dialog.upload_another'
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => void handleUpload()}
                            disabled={isUploading || file === null}
                        >
                            {isUploading ? (
                                <>
                                    <Spinner className="mr-1 size-5 text-primary-foreground" />
                                    {t(
                                        'import_laravel_migrations_dialog.uploading'
                                    )}
                                </>
                            ) : (
                                t('import_laravel_migrations_dialog.upload')
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
