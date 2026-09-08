import React, { useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useTranslation } from 'react-i18next';
import { useDialog } from '@/hooks/use-dialog';
import { useChartDB } from '@/hooks/use-chartdb';
import { useAuth } from '@/hooks/use-auth';
import { useExportImage } from '@/hooks/use-export-image';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    Archive,
    Database,
    FileCode2,
    FileImage,
    FileJson,
    Image,
} from 'lucide-react';

export interface ExportDialogProps extends BaseDialogProps {}

const isValidBackendDiagramId = (id: unknown): id is string | number => {
    if (typeof id === 'number') {
        return Number.isInteger(id) && id > 0;
    }

    if (typeof id === 'string') {
        return /^\d+$/.test(id);
    }

    return false;
};

interface ExportTargetButtonProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    disabled?: boolean;
}

const ExportTargetButton: React.FC<ExportTargetButtonProps> = ({
    icon,
    title,
    description,
    onClick,
    disabled = false,
}) => (
    <button
        type="button"
        className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        onClick={onClick}
        disabled={disabled}
    >
        <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
        <span className="min-w-0">
            <span className="block font-medium leading-snug">{title}</span>
            <span className="block text-sm text-muted-foreground">
                {description}
            </span>
        </span>
    </button>
);

export const ExportDialog: React.FC<ExportDialogProps> = ({ dialog }) => {
    const { t } = useTranslation();
    const { databaseType, currentDiagram } = useChartDB();
    const { isAuthenticated } = useAuth();
    const { exportImage } = useExportImage();
    const {
        closeExportDialog,
        openExportSQLDialog,
        openExportDiagramDialog,
        openExportImageDialog,
        openExportLaravelMigrationsDialog,
    } = useDialog();

    const canExportLaravelMigrations = useMemo(
        () =>
            Boolean(
                isAuthenticated &&
                currentDiagram?.id &&
                isValidBackendDiagramId(currentDiagram.id)
            ),
        [isAuthenticated, currentDiagram?.id]
    );

    const closeAndRun = useCallback(
        (action: () => void) => {
            closeExportDialog();
            action();
        },
        [closeExportDialog]
    );

    const handleSqlExport = useCallback(() => {
        closeAndRun(() =>
            openExportSQLDialog({
                targetDatabaseType: databaseType,
            })
        );
    }, [closeAndRun, databaseType, openExportSQLDialog]);

    const handleDiagramJsonExport = useCallback(() => {
        closeAndRun(() => openExportDiagramDialog({}));
    }, [closeAndRun, openExportDiagramDialog]);

    const handleLaravelExport = useCallback(() => {
        if (!canExportLaravelMigrations || !currentDiagram?.id) {
            return;
        }

        closeAndRun(() =>
            openExportLaravelMigrationsDialog({
                diagramId: String(currentDiagram.id),
                diagramName: currentDiagram.name ?? 'diagram',
            })
        );
    }, [
        canExportLaravelMigrations,
        closeAndRun,
        currentDiagram?.id,
        currentDiagram?.name,
        openExportLaravelMigrationsDialog,
    ]);

    const handlePngExport = useCallback(() => {
        closeAndRun(() => openExportImageDialog({ format: 'png' }));
    }, [closeAndRun, openExportImageDialog]);

    const handleJpgExport = useCallback(() => {
        closeAndRun(() => openExportImageDialog({ format: 'jpeg' }));
    }, [closeAndRun, openExportImageDialog]);

    const handleSvgExport = useCallback(() => {
        closeAndRun(() =>
            exportImage('svg', {
                scale: 1,
                transparent: true,
                includePatternBG: false,
            })
        );
    }, [closeAndRun, exportImage]);

    const sqlDescription =
        databaseType === DatabaseType.GENERIC
            ? t('export_dialog.sql.description_generic')
            : t('export_dialog.sql.description');

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeExportDialog();
                }
            }}
        >
            <DialogContent className="flex max-w-md flex-col gap-4" showClose>
                <DialogHeader>
                    <DialogTitle>{t('export_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('export_dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <section className="flex flex-col gap-2">
                        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t('export_dialog.schema_code_section')}
                        </h3>
                        <div className="flex flex-col gap-2">
                            <ExportTargetButton
                                icon={<Database className="size-5" />}
                                title={t('export_dialog.sql.title')}
                                description={sqlDescription}
                                onClick={handleSqlExport}
                            />
                            <ExportTargetButton
                                icon={<FileCode2 className="size-5" />}
                                title={t('export_dialog.dbml.title')}
                                description={t(
                                    'export_dialog.dbml.coming_soon'
                                )}
                                disabled
                            />
                            <ExportTargetButton
                                icon={<FileJson className="size-5" />}
                                title={t('export_dialog.diagram_json.title')}
                                description={t(
                                    'export_dialog.diagram_json.description'
                                )}
                                onClick={handleDiagramJsonExport}
                            />
                            {canExportLaravelMigrations ? (
                                <ExportTargetButton
                                    icon={<Archive className="size-5" />}
                                    title={t(
                                        'export_dialog.laravel_migrations.title'
                                    )}
                                    description={t(
                                        'export_dialog.laravel_migrations.description'
                                    )}
                                    onClick={handleLaravelExport}
                                />
                            ) : null}
                        </div>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t('export_dialog.visual_section')}
                        </h3>
                        <div className="flex flex-col gap-2">
                            <ExportTargetButton
                                icon={<Image className="size-5" />}
                                title={t('export_dialog.png.title')}
                                description={t('export_dialog.png.description')}
                                onClick={handlePngExport}
                            />
                            <ExportTargetButton
                                icon={<Image className="size-5" />}
                                title={t('export_dialog.jpg.title')}
                                description={t('export_dialog.jpg.description')}
                                onClick={handleJpgExport}
                            />
                            <ExportTargetButton
                                icon={<FileImage className="size-5" />}
                                title={t('export_dialog.svg.title')}
                                description={t('export_dialog.svg.description')}
                                onClick={handleSvgExport}
                            />
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
};
