import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import type { DialogContext } from './dialog-context';
import { dialogContext } from './dialog-context';
import type { CreateDiagramDialogProps } from '@/dialogs/create-diagram-dialog/create-diagram-dialog';
import type { OpenDiagramDialogProps } from '@/dialogs/open-diagram-dialog/open-diagram-dialog';
import { OpenDiagramDialog } from '@/dialogs/open-diagram-dialog/open-diagram-dialog';
import type { ExportSQLDialogProps } from '@/dialogs/export-sql-dialog/export-sql-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import type { CreateRelationshipDialogProps } from '@/dialogs/create-relationship-dialog/create-relationship-dialog';
import { CreateRelationshipDialog } from '@/dialogs/create-relationship-dialog/create-relationship-dialog';
import type { ImportDatabaseDialogProps } from '@/dialogs/import-database-dialog/import-database-dialog';
import type { TableSchemaDialogProps } from '@/dialogs/table-schema-dialog/table-schema-dialog';
import { TableSchemaDialog } from '@/dialogs/table-schema-dialog/table-schema-dialog';
import { emptyFn } from '@/lib/utils';
import type { ExportImageDialogProps } from '@/dialogs/export-image-dialog/export-image-dialog';
import { ExportImageDialog } from '@/dialogs/export-image-dialog/export-image-dialog';
import { ExportDiagramDialog } from '@/dialogs/export-diagram-dialog/export-diagram-dialog';
import { ImportDiagramDialog } from '@/dialogs/import-diagram-dialog/import-diagram-dialog';
import { AuthDialog } from '@/dialogs/auth-dialog/auth-dialog';
import { UserSettingsDialog } from '@/dialogs/user-settings-dialog/user-settings-dialog';
import type { ExportLaravelMigrationsDialogProps } from '@/dialogs/export-laravel-migrations-dialog/export-laravel-migrations-dialog';
import { ExportLaravelMigrationsDialog } from '@/dialogs/export-laravel-migrations-dialog/export-laravel-migrations-dialog';
import type { LaravelMigrationDiffDialogProps } from '@/dialogs/laravel-migration-diff-dialog/laravel-migration-diff-dialog';
import { LaravelMigrationImportDialog } from '@/dialogs/laravel-migration-import-dialog/laravel-migration-import-dialog';
import { LaravelMigrationDiffDialog } from '@/dialogs/laravel-migration-diff-dialog/laravel-migration-diff-dialog';
import type { EntryFlowAuthActions } from '@/pages/editor-page/entry-flow-auth-actions';
import type { EntryFlowCreateDiagramActions } from '@/pages/editor-page/entry-flow-create-diagram-actions';
import type { EntryFlowGuestMigrationActions } from '@/pages/editor-page/entry-flow-guest-migration-actions';
import type { EntryFlowOpenDiagramActions } from '@/pages/editor-page/entry-flow-open-diagram-actions';
import { GuestDiagramMigrationDialog } from '@/dialogs/guest-diagram-migration-dialog/guest-diagram-migration-dialog';
import type { GuestDiagramMigrationDialogProps } from '@/dialogs/guest-diagram-migration-dialog/guest-diagram-migration-dialog';

const CreateDiagramDialogLazy = lazy(() =>
    import('@/dialogs/create-diagram-dialog/create-diagram-dialog').then(
        (module) => ({
            default: module.CreateDiagramDialog,
        })
    )
);

const ExportSQLDialogLazy = lazy(() =>
    import('@/dialogs/export-sql-dialog/export-sql-dialog').then((module) => ({
        default: module.ExportSQLDialog,
    }))
);

const ImportDatabaseDialogLazy = lazy(() =>
    import('@/dialogs/import-database-dialog/import-database-dialog').then(
        (module) => ({
            default: module.ImportDatabaseDialog,
        })
    )
);

export const DialogProvider: React.FC<
    React.PropsWithChildren<{
        entryAuthActions?: EntryFlowAuthActions;
        entryCreateDiagramActions?: EntryFlowCreateDiagramActions;
        entryOpenDiagramActions?: EntryFlowOpenDiagramActions;
        entryGuestMigrationActions?: EntryFlowGuestMigrationActions;
        isGuestMigrationInProgress?: boolean;
    }>
> = ({
    children,
    entryAuthActions,
    entryCreateDiagramActions,
    entryOpenDiagramActions,
    entryGuestMigrationActions,
    isGuestMigrationInProgress = false,
}) => {
    const [openNewDiagramDialog, setOpenNewDiagramDialog] = useState(false);
    const [newDiagramDialogParams, setNewDiagramDialogParams] =
        useState<Omit<CreateDiagramDialogProps, 'dialog'>>();
    const openNewDiagramDialogHandler: DialogContext['openCreateDiagramDialog'] =
        useCallback(
            (props) => {
                setNewDiagramDialogParams(props);
                setOpenNewDiagramDialog(true);
            },
            [setOpenNewDiagramDialog]
        );

    const [openOpenDiagramDialog, setOpenOpenDiagramDialog] = useState(false);
    const [openDiagramDialogParams, setOpenDiagramDialogParams] =
        useState<Omit<OpenDiagramDialogProps, 'dialog'>>();

    const openOpenDiagramDialogHandler: DialogContext['openOpenDiagramDialog'] =
        useCallback(
            (props) => {
                setOpenDiagramDialogParams(props);
                setOpenOpenDiagramDialog(true);
            },
            [setOpenOpenDiagramDialog]
        );

    const [openCreateRelationshipDialog, setOpenCreateRelationshipDialog] =
        useState(false);
    const [createRelationshipDialogParams, setCreateRelationshipDialogParams] =
        useState<Omit<CreateRelationshipDialogProps, 'dialog'>>();
    const openCreateRelationshipDialogHandler: DialogContext['openCreateRelationshipDialog'] =
        useCallback(
            (params) => {
                setCreateRelationshipDialogParams(params);
                setOpenCreateRelationshipDialog(true);
            },
            [setOpenCreateRelationshipDialog]
        );

    const [openAuthDialog, setOpenAuthDialog] = useState(false);
    const [openUserSettingsDialog, setOpenUserSettingsDialog] = useState(false);
    const [
        openGuestDiagramMigrationDialog,
        setOpenGuestDiagramMigrationDialog,
    ] = useState(false);
    const [
        guestDiagramMigrationDialogParams,
        setGuestDiagramMigrationDialogParams,
    ] = useState<Omit<GuestDiagramMigrationDialogProps, 'dialog'>>();

    // Export image dialog
    const [openExportImageDialog, setOpenExportImageDialog] = useState(false);
    const [exportImageDialogParams, setExportImageDialogParams] = useState<
        Omit<ExportImageDialogProps, 'dialog'>
    >({ format: 'png' });
    const openExportImageDialogHandler: DialogContext['openExportImageDialog'] =
        useCallback(
            (params) => {
                setExportImageDialogParams(params);
                setOpenExportImageDialog(true);
            },
            [setOpenExportImageDialog]
        );

    // Export SQL dialog
    const [openExportSQLDialog, setOpenExportSQLDialog] = useState(false);
    const [exportSQLDialogParams, setExportSQLDialogParams] = useState<
        Omit<ExportSQLDialogProps, 'dialog'>
    >({ targetDatabaseType: DatabaseType.GENERIC });
    const openExportSQLDialogHandler: DialogContext['openExportSQLDialog'] =
        useCallback(
            ({ targetDatabaseType }) => {
                setExportSQLDialogParams({ targetDatabaseType });
                setOpenExportSQLDialog(true);
            },
            [setOpenExportSQLDialog]
        );

    // Import database dialog
    const [openImportDatabaseDialog, setOpenImportDatabaseDialog] =
        useState(false);
    const [importDatabaseDialogParams, setImportDatabaseDialogParams] =
        useState<Omit<ImportDatabaseDialogProps, 'dialog'>>({
            databaseType: DatabaseType.GENERIC,
        });
    const openImportDatabaseDialogHandler: DialogContext['openImportDatabaseDialog'] =
        useCallback(
            ({ databaseType, importMethods, initialImportMethod }) => {
                setImportDatabaseDialogParams({
                    databaseType,
                    importMethods,
                    initialImportMethod,
                });
                setOpenImportDatabaseDialog(true);
            },
            [setOpenImportDatabaseDialog]
        );

    // Table schema dialog
    const [openTableSchemaDialog, setOpenTableSchemaDialog] = useState(false);
    const [tableSchemaDialogParams, setTableSchemaDialogParams] = useState<
        Omit<TableSchemaDialogProps, 'dialog'>
    >({ schemas: [], onConfirm: emptyFn });
    const openTableSchemaDialogHandler: DialogContext['openTableSchemaDialog'] =
        useCallback(
            (params) => {
                setTableSchemaDialogParams(params);
                setOpenTableSchemaDialog(true);
            },
            [setOpenTableSchemaDialog]
        );

    // Export diagram dialog
    const [openExportDiagramDialog, setOpenExportDiagramDialog] =
        useState(false);

    // Import diagram dialog
    const [openImportDiagramDialog, setOpenImportDiagramDialog] =
        useState(false);

    const [
        openExportLaravelMigrationsDialog,
        setOpenExportLaravelMigrationsDialog,
    ] = useState(false);
    const [
        exportLaravelMigrationsDialogParams,
        setExportLaravelMigrationsDialogParams,
    ] = useState<Omit<ExportLaravelMigrationsDialogProps, 'dialog'>>();

    const [createDiagramDialogMounted, setCreateDiagramDialogMounted] =
        useState(false);
    const [exportSQLDialogMounted, setExportSQLDialogMounted] = useState(false);
    const [importDatabaseDialogMounted, setImportDatabaseDialogMounted] =
        useState(false);

    useEffect(() => {
        if (openNewDiagramDialog) {
            setCreateDiagramDialogMounted(true);
        }
    }, [openNewDiagramDialog]);

    useEffect(() => {
        if (openExportSQLDialog) {
            setExportSQLDialogMounted(true);
        }
    }, [openExportSQLDialog]);

    useEffect(() => {
        if (openImportDatabaseDialog) {
            setImportDatabaseDialogMounted(true);
        }
    }, [openImportDatabaseDialog]);

    const openExportLaravelMigrationsDialogHandler: DialogContext['openExportLaravelMigrationsDialog'] =
        useCallback((params) => {
            setExportLaravelMigrationsDialogParams(params);
            setOpenExportLaravelMigrationsDialog(true);
        }, []);

    const [
        openLaravelMigrationImportDialog,
        setOpenLaravelMigrationImportDialog,
    ] = useState(false);

    const [openLaravelMigrationDiffDialog, setOpenLaravelMigrationDiffDialog] =
        useState(false);
    const [
        laravelMigrationDiffDialogParams,
        setLaravelMigrationDiffDialogParams,
    ] = useState<Omit<LaravelMigrationDiffDialogProps, 'dialog'>>();

    const openLaravelMigrationDiffDialogHandler: DialogContext['openLaravelMigrationDiffDialog'] =
        useCallback((params) => {
            setLaravelMigrationDiffDialogParams(params);
            setOpenLaravelMigrationDiffDialog(true);
        }, []);

    return (
        <dialogContext.Provider
            value={{
                openCreateDiagramDialog: openNewDiagramDialogHandler,
                closeCreateDiagramDialog: () => setOpenNewDiagramDialog(false),
                openOpenDiagramDialog: openOpenDiagramDialogHandler,
                closeOpenDiagramDialog: () => setOpenOpenDiagramDialog(false),
                openExportLaravelMigrationsDialog:
                    openExportLaravelMigrationsDialogHandler,
                closeExportLaravelMigrationsDialog: () =>
                    setOpenExportLaravelMigrationsDialog(false),
                openLaravelMigrationImportDialog: () =>
                    setOpenLaravelMigrationImportDialog(true),
                closeLaravelMigrationImportDialog: () =>
                    setOpenLaravelMigrationImportDialog(false),
                openLaravelMigrationDiffDialog:
                    openLaravelMigrationDiffDialogHandler,
                closeLaravelMigrationDiffDialog: () =>
                    setOpenLaravelMigrationDiffDialog(false),
                openExportSQLDialog: openExportSQLDialogHandler,
                closeExportSQLDialog: () => setOpenExportSQLDialog(false),
                openCreateRelationshipDialog:
                    openCreateRelationshipDialogHandler,
                closeCreateRelationshipDialog: () =>
                    setOpenCreateRelationshipDialog(false),
                openImportDatabaseDialog: openImportDatabaseDialogHandler,
                closeImportDatabaseDialog: () => {
                    setOpenImportDatabaseDialog(false);
                },
                openTableSchemaDialog: openTableSchemaDialogHandler,
                closeTableSchemaDialog: () => setOpenTableSchemaDialog(false),
                openAuthDialog: () => setOpenAuthDialog(true),
                closeAuthDialog: () => setOpenAuthDialog(false),
                openUserSettingsDialog: () => setOpenUserSettingsDialog(true),
                closeUserSettingsDialog: () => setOpenUserSettingsDialog(false),
                openGuestDiagramMigrationDialog: (params) => {
                    setGuestDiagramMigrationDialogParams(params);
                    setOpenGuestDiagramMigrationDialog(true);
                },
                closeGuestDiagramMigrationDialog: () =>
                    setOpenGuestDiagramMigrationDialog(false),
                closeExportImageDialog: () => setOpenExportImageDialog(false),
                openExportImageDialog: openExportImageDialogHandler,
                openExportDiagramDialog: () => setOpenExportDiagramDialog(true),
                closeExportDiagramDialog: () =>
                    setOpenExportDiagramDialog(false),
                openImportDiagramDialog: () => setOpenImportDiagramDialog(true),
                closeImportDiagramDialog: () =>
                    setOpenImportDiagramDialog(false),
            }}
        >
            {children}
            {createDiagramDialogMounted ? (
                <Suspense fallback={null}>
                    <CreateDiagramDialogLazy
                        dialog={{ open: openNewDiagramDialog }}
                        entryCreateDiagramActions={entryCreateDiagramActions}
                        {...newDiagramDialogParams}
                    />
                </Suspense>
            ) : null}
            <OpenDiagramDialog
                dialog={{ open: openOpenDiagramDialog }}
                entryOpenDiagramActions={entryOpenDiagramActions}
                {...openDiagramDialogParams}
            />
            {exportSQLDialogMounted ? (
                <Suspense fallback={null}>
                    <ExportSQLDialogLazy
                        dialog={{ open: openExportSQLDialog }}
                        {...exportSQLDialogParams}
                    />
                </Suspense>
            ) : null}
            <CreateRelationshipDialog
                dialog={{ open: openCreateRelationshipDialog }}
                {...createRelationshipDialogParams}
            />
            {importDatabaseDialogMounted ? (
                <Suspense fallback={null}>
                    <ImportDatabaseDialogLazy
                        dialog={{ open: openImportDatabaseDialog }}
                        {...importDatabaseDialogParams}
                    />
                </Suspense>
            ) : null}
            <TableSchemaDialog
                dialog={{ open: openTableSchemaDialog }}
                {...tableSchemaDialogParams}
            />
            <AuthDialog
                dialog={{ open: openAuthDialog }}
                entryAuthActions={entryAuthActions}
            />
            <UserSettingsDialog dialog={{ open: openUserSettingsDialog }} />
            <GuestDiagramMigrationDialog
                dialog={{ open: openGuestDiagramMigrationDialog }}
                entryGuestMigrationActions={entryGuestMigrationActions}
                isMigrating={isGuestMigrationInProgress}
                {...guestDiagramMigrationDialogParams}
            />
            <ExportImageDialog
                dialog={{ open: openExportImageDialog }}
                {...exportImageDialogParams}
            />
            <ExportDiagramDialog dialog={{ open: openExportDiagramDialog }} />
            <ImportDiagramDialog dialog={{ open: openImportDiagramDialog }} />
            {exportLaravelMigrationsDialogParams ? (
                <ExportLaravelMigrationsDialog
                    dialog={{ open: openExportLaravelMigrationsDialog }}
                    {...exportLaravelMigrationsDialogParams}
                />
            ) : null}
            <LaravelMigrationImportDialog
                dialog={{ open: openLaravelMigrationImportDialog }}
            />
            {laravelMigrationDiffDialogParams ? (
                <LaravelMigrationDiffDialog
                    dialog={{ open: openLaravelMigrationDiffDialog }}
                    {...laravelMigrationDiffDialogParams}
                />
            ) : null}
        </dialogContext.Provider>
    );
};
