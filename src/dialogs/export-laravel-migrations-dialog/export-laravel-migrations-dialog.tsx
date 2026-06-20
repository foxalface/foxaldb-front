import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
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
    type LaravelMigrationExportRequest,
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
    includeIndexes: boolean;
    includeForeignKeys: boolean;
}

const DEFAULT_EXPORT_OPTIONS: LaravelMigrationExportOptions = {
    laravelVersion: DEFAULT_LARAVEL_VERSION,
    includeIndexes: true,
    includeForeignKeys: true,
};

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
    const [options, setOptions] = useState<LaravelMigrationExportOptions>(
        DEFAULT_EXPORT_OPTIONS
    );
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        setOptions(DEFAULT_EXPORT_OPTIONS);
        setExportError(null);
        setIsExporting(false);
    }, [dialog.open]);

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        setExportError(null);

        const payload: LaravelMigrationExportRequest = {
            laravelVersion: options.laravelVersion,
            includeIndexes: options.includeIndexes,
            includeForeignKeys: options.includeForeignKeys,
        };

        try {
            const blob = await exportLaravelMigrations(diagramId, payload);

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
        options,
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
                                setOptions((previous) => ({
                                    ...previous,
                                    laravelVersion: value as LaravelVersion,
                                }))
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

                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="include-table-indexes"
                                checked={options.includeIndexes}
                                onCheckedChange={(checked) =>
                                    setOptions((previous) => ({
                                        ...previous,
                                        includeIndexes: checked === true,
                                    }))
                                }
                                disabled={isExporting}
                            />
                            <div className="grid gap-1 leading-none">
                                <Label htmlFor="include-table-indexes">
                                    {t(
                                        'export_laravel_migrations_dialog.include_table_indexes'
                                    )}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'export_laravel_migrations_dialog.include_table_indexes_description'
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="include-foreign-keys"
                                checked={options.includeForeignKeys}
                                onCheckedChange={(checked) =>
                                    setOptions((previous) => ({
                                        ...previous,
                                        includeForeignKeys: checked === true,
                                    }))
                                }
                                disabled={isExporting}
                            />
                            <div className="grid gap-1 leading-none">
                                <Label htmlFor="include-foreign-keys">
                                    {t(
                                        'export_laravel_migrations_dialog.include_foreign_keys'
                                    )}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'export_laravel_migrations_dialog.include_foreign_keys_description'
                                    )}
                                </p>
                            </div>
                        </div>
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
