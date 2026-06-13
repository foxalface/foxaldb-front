import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Label } from '@/components/label/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import { Spinner } from '@/components/spinner/spinner';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import {
    DEFAULT_LARAVEL_VERSION,
    exportLaravelMigrations,
    LARAVEL_VERSIONS,
    type LaravelVersion,
} from '@/lib/api/diagram-laravel-export';
import { downloadBlob } from '@/lib/download-blob';
import { useTranslation } from 'react-i18next';
import type { BaseDialogProps } from '../common/base-dialog-props';

export interface ExportLaravelMigrationsDialogProps extends BaseDialogProps {
    diagramId: string;
    diagramName: string;
}

export interface LaravelMigrationExportOptions {
    laravelVersion: LaravelVersion;
}

const buildExportFilename = (diagramName: string): string => {
    const slug = diagramName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${slug || 'diagram'}-laravel-migrations.zip`;
};

export const ExportLaravelMigrationsDialog: React.FC<
    ExportLaravelMigrationsDialogProps
> = ({ dialog, diagramId, diagramName }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { closeExportLaravelMigrationsDialog } = useDialog();
    const [options, setOptions] = useState<LaravelMigrationExportOptions>({
        laravelVersion: DEFAULT_LARAVEL_VERSION,
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        setOptions({ laravelVersion: DEFAULT_LARAVEL_VERSION });
        setExportError(null);
        setIsExporting(false);
    }, [dialog.open]);

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        setExportError(null);

        try {
            const blob = await exportLaravelMigrations(
                diagramId,
                options.laravelVersion
            );

            downloadBlob(blob, buildExportFilename(diagramName));
            closeExportLaravelMigrationsDialog();
        } catch {
            setExportError(
                t('export_laravel_migrations_dialog.errors.export_failed')
            );
        } finally {
            setIsExporting(false);
        }
    }, [
        closeExportLaravelMigrationsDialog,
        diagramId,
        diagramName,
        options.laravelVersion,
        t,
    ]);

    if (!user) {
        return null;
    }

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeExportLaravelMigrationsDialog();
                }
            }}
        >
            <DialogContent className="flex max-w-md flex-col" showClose>
                <DialogHeader>
                    <DialogTitle>
                        {t('export_laravel_migrations_dialog.title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    <div className="space-y-2">
                        <Label htmlFor="laravel-version">
                            {t(
                                'export_laravel_migrations_dialog.laravel_version'
                            )}
                        </Label>
                        <Select
                            value={options.laravelVersion}
                            onValueChange={(value) =>
                                setOptions({
                                    laravelVersion: value as LaravelVersion,
                                })
                            }
                            disabled={isExporting}
                        >
                            <SelectTrigger id="laravel-version">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LARAVEL_VERSIONS.map((version) => (
                                    <SelectItem key={version} value={version}>
                                        {version}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {exportError ? (
                    <p className="text-sm text-destructive">{exportError}</p>
                ) : null}

                <DialogFooter className="flex gap-1 md:justify-between">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isExporting}
                        >
                            {t('export_laravel_migrations_dialog.cancel')}
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={() => void handleExport()}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <Spinner className="mr-1 size-5 text-primary-foreground" />
                                {t(
                                    'export_laravel_migrations_dialog.exporting'
                                )}
                            </>
                        ) : (
                            t('export_laravel_migrations_dialog.export')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
