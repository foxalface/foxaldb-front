import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import type { TableSchemaDialogProps } from '@/dialogs/table-schema-dialog/table-schema-dialog';
import type { ImportDatabaseDialogProps } from '@/dialogs/import-database-dialog/import-database-dialog';
import type { ExportSQLDialogProps } from '@/dialogs/export-sql-dialog/export-sql-dialog';
import type { ExportImageDialogProps } from '@/dialogs/export-image-dialog/export-image-dialog';
import type { ExportDiagramDialogProps } from '@/dialogs/export-diagram-dialog/export-diagram-dialog';
import type { ImportDiagramDialogProps } from '@/dialogs/import-diagram-dialog/import-diagram-dialog';
import type { CreateRelationshipDialogProps } from '@/dialogs/create-relationship-dialog/create-relationship-dialog';
import type { OpenDiagramDialogProps } from '@/dialogs/open-diagram-dialog/open-diagram-dialog';
import type { CreateDiagramDialogProps } from '@/dialogs/create-diagram-dialog/create-diagram-dialog';
import type { ShareDiagramDialogProps } from '@/dialogs/share-diagram-dialog/share-diagram-dialog';
import type { ExportLaravelMigrationsDialogProps } from '@/dialogs/export-laravel-migrations-dialog/export-laravel-migrations-dialog';
import type { LaravelMigrationDiffDialogProps } from '@/dialogs/laravel-migration-diff-dialog/laravel-migration-diff-dialog';
import type { GuestDiagramMigrationDialogProps } from '@/dialogs/guest-diagram-migration-dialog/guest-diagram-migration-dialog';

export interface DialogContext {
    // Create diagram dialog
    openCreateDiagramDialog: (
        params?: Omit<CreateDiagramDialogProps, 'dialog'>
    ) => void;
    closeCreateDiagramDialog: () => void;

    // Open diagram dialog
    openOpenDiagramDialog: (
        params?: Omit<OpenDiagramDialogProps, 'dialog'>
    ) => void;
    closeOpenDiagramDialog: () => void;

    // Share diagram dialog
    openShareDiagramDialog: (
        params: Omit<ShareDiagramDialogProps, 'dialog'>
    ) => void;
    closeShareDiagramDialog: () => void;

    // Export Laravel migrations dialog
    openExportLaravelMigrationsDialog: (
        params: Omit<ExportLaravelMigrationsDialogProps, 'dialog'>
    ) => void;
    closeExportLaravelMigrationsDialog: () => void;

    // Import Laravel migrations dialog
    openLaravelMigrationImportDialog: () => void;
    closeLaravelMigrationImportDialog: () => void;

    // Compare Laravel migrations dialog
    openLaravelMigrationDiffDialog: (
        params: Omit<LaravelMigrationDiffDialogProps, 'dialog'>
    ) => void;
    closeLaravelMigrationDiffDialog: () => void;

    // Export SQL dialog
    openExportSQLDialog: (params: Omit<ExportSQLDialogProps, 'dialog'>) => void;
    closeExportSQLDialog: () => void;

    // Create relationship dialog
    openCreateRelationshipDialog: (
        params?: Omit<CreateRelationshipDialogProps, 'dialog'>
    ) => void;
    closeCreateRelationshipDialog: () => void;

    // Import database dialog
    openImportDatabaseDialog: (
        params: Omit<ImportDatabaseDialogProps, 'dialog'>
    ) => void;
    closeImportDatabaseDialog: () => void;

    // Change table schema dialog
    openTableSchemaDialog: (
        params: Omit<TableSchemaDialogProps, 'dialog'>
    ) => void;
    closeTableSchemaDialog: () => void;

    // Star us dialog
    openStarUsDialog: () => void;
    closeStarUsDialog: () => void;

    // Auth dialog
    openAuthDialog: () => void;
    closeAuthDialog: () => void;

    // Guest diagram migration dialog
    openGuestDiagramMigrationDialog: (
        params?: Omit<GuestDiagramMigrationDialogProps, 'dialog'>
    ) => void;
    closeGuestDiagramMigrationDialog: () => void;

    // Export image dialog
    openExportImageDialog: (
        params: Omit<ExportImageDialogProps, 'dialog'>
    ) => void;
    closeExportImageDialog: () => void;

    // Export diagram dialog
    openExportDiagramDialog: (
        params: Omit<ExportDiagramDialogProps, 'dialog'>
    ) => void;
    closeExportDiagramDialog: () => void;

    // Import diagram dialog
    openImportDiagramDialog: (
        params: Omit<ImportDiagramDialogProps, 'dialog'>
    ) => void;
    closeImportDiagramDialog: () => void;
}

export const dialogContext = createContext<DialogContext>({
    openCreateDiagramDialog: emptyFn,
    closeCreateDiagramDialog: emptyFn,
    openOpenDiagramDialog: emptyFn,
    closeOpenDiagramDialog: emptyFn,
    openShareDiagramDialog: emptyFn,
    closeShareDiagramDialog: emptyFn,
    openExportLaravelMigrationsDialog: emptyFn,
    closeExportLaravelMigrationsDialog: emptyFn,
    openLaravelMigrationImportDialog: emptyFn,
    closeLaravelMigrationImportDialog: emptyFn,
    openLaravelMigrationDiffDialog: emptyFn,
    closeLaravelMigrationDiffDialog: emptyFn,
    openExportSQLDialog: emptyFn,
    closeExportSQLDialog: emptyFn,
    closeCreateRelationshipDialog: emptyFn,
    openCreateRelationshipDialog: emptyFn,
    openImportDatabaseDialog: emptyFn,
    closeImportDatabaseDialog: emptyFn,
    openTableSchemaDialog: emptyFn,
    closeTableSchemaDialog: emptyFn,
    openStarUsDialog: emptyFn,
    closeStarUsDialog: emptyFn,
    openAuthDialog: emptyFn,
    closeAuthDialog: emptyFn,
    openGuestDiagramMigrationDialog: emptyFn,
    closeGuestDiagramMigrationDialog: emptyFn,
    openExportImageDialog: emptyFn,
    closeExportImageDialog: emptyFn,
    openExportDiagramDialog: emptyFn,
    closeExportDiagramDialog: emptyFn,
    openImportDiagramDialog: emptyFn,
    closeImportDiagramDialog: emptyFn,
});
