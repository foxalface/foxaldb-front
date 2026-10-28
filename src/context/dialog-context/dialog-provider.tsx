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
import type { TableSchemaDialogProps } from '@/dialogs/table-schema-dialog/table-schema-dialog';
import { TableSchemaDialog } from '@/dialogs/table-schema-dialog/table-schema-dialog';
import { emptyFn } from '@/lib/utils';
import { ExportDiagramDialog } from '@/dialogs/export-diagram-dialog/export-diagram-dialog';
import { ExportWizardDialog } from '@/dialogs/export-wizard/export-wizard-dialog';
import { ImportDiagramDialog } from '@/dialogs/import-diagram-dialog/import-diagram-dialog';
import { CreateDiagramSessionDestinationProvider } from '@/dialogs/create-diagram-dialog/create-diagram-session-destination-context';
import { AuthDialog } from '@/dialogs/auth-dialog/auth-dialog';
import { UserSettingsDialog } from '@/dialogs/user-settings-dialog/user-settings-dialog';
import type { EntryFlowAuthActions } from '@/pages/editor-page/entry-flow-auth-actions';
import type { EntryFlowCreateDiagramActions } from '@/pages/editor-page/entry-flow-create-diagram-actions';
import type { EntryFlowOpenDiagramActions } from '@/pages/editor-page/entry-flow-open-diagram-actions';

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

const MergeWizardDialogLazy = lazy(() =>
    import('@/dialogs/merge-wizard/merge-wizard-dialog').then((module) => ({
        default: module.MergeWizardDialog,
    }))
);

export const DialogProvider: React.FC<
    React.PropsWithChildren<{
        entryAuthActions?: EntryFlowAuthActions;
        entryCreateDiagramActions?: EntryFlowCreateDiagramActions;
        entryOpenDiagramActions?: EntryFlowOpenDiagramActions;
    }>
> = ({
    children,
    entryAuthActions,
    entryCreateDiagramActions,
    entryOpenDiagramActions,
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

    // Export wizard
    const [openExportWizardDialog, setOpenExportWizardDialog] = useState(false);

    // Schema merge wizard. Mounted on first open and kept mounted so close
    // and reopen can reset wizard state without a new context.
    const [openMergeWizardDialog, setOpenMergeWizardDialog] = useState(false);
    const [mergeWizardMounted, setMergeWizardMounted] = useState(false);

    // Import diagram dialog
    const [openImportDiagramDialog, setOpenImportDiagramDialog] =
        useState(false);

    const [createDiagramDialogMounted, setCreateDiagramDialogMounted] =
        useState(false);
    const [exportSQLDialogMounted, setExportSQLDialogMounted] = useState(false);
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
        if (openMergeWizardDialog) {
            setMergeWizardMounted(true);
        }
    }, [openMergeWizardDialog]);

    return (
        <CreateDiagramSessionDestinationProvider
            createDialogOpen={openNewDiagramDialog}
        >
            <dialogContext.Provider
                value={{
                    openCreateDiagramDialog: openNewDiagramDialogHandler,
                    closeCreateDiagramDialog: () =>
                        setOpenNewDiagramDialog(false),
                    openOpenDiagramDialog: openOpenDiagramDialogHandler,
                    closeOpenDiagramDialog: () =>
                        setOpenOpenDiagramDialog(false),
                    openExportWizardDialog: () =>
                        setOpenExportWizardDialog(true),
                    closeExportWizardDialog: () =>
                        setOpenExportWizardDialog(false),
                    openMergeWizardDialog: () => setOpenMergeWizardDialog(true),
                    closeMergeWizardDialog: () =>
                        setOpenMergeWizardDialog(false),
                    openExportSQLDialog: openExportSQLDialogHandler,
                    closeExportSQLDialog: () => setOpenExportSQLDialog(false),
                    openCreateRelationshipDialog:
                        openCreateRelationshipDialogHandler,
                    closeCreateRelationshipDialog: () =>
                        setOpenCreateRelationshipDialog(false),
                    openTableSchemaDialog: openTableSchemaDialogHandler,
                    closeTableSchemaDialog: () =>
                        setOpenTableSchemaDialog(false),
                    openAuthDialog: () => setOpenAuthDialog(true),
                    closeAuthDialog: () => setOpenAuthDialog(false),
                    openUserSettingsDialog: () =>
                        setOpenUserSettingsDialog(true),
                    closeUserSettingsDialog: () =>
                        setOpenUserSettingsDialog(false),
                    openExportDiagramDialog: () =>
                        setOpenExportDiagramDialog(true),
                    closeExportDiagramDialog: () =>
                        setOpenExportDiagramDialog(false),
                    openImportDiagramDialog: () =>
                        setOpenImportDiagramDialog(true),
                    closeImportDiagramDialog: () =>
                        setOpenImportDiagramDialog(false),
                }}
            >
                {children}
                {createDiagramDialogMounted ? (
                    <Suspense fallback={null}>
                        <CreateDiagramDialogLazy
                            dialog={{ open: openNewDiagramDialog }}
                            entryCreateDiagramActions={
                                entryCreateDiagramActions
                            }
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
                <TableSchemaDialog
                    dialog={{ open: openTableSchemaDialog }}
                    {...tableSchemaDialogParams}
                />
                <AuthDialog
                    dialog={{ open: openAuthDialog }}
                    entryAuthActions={entryAuthActions}
                />
                <UserSettingsDialog dialog={{ open: openUserSettingsDialog }} />
                <ExportWizardDialog dialog={{ open: openExportWizardDialog }} />
                {mergeWizardMounted ? (
                    <Suspense fallback={null}>
                        <MergeWizardDialogLazy
                            dialog={{ open: openMergeWizardDialog }}
                        />
                    </Suspense>
                ) : null}
                <ExportDiagramDialog
                    dialog={{ open: openExportDiagramDialog }}
                />
                <ImportDiagramDialog
                    dialog={{ open: openImportDiagramDialog }}
                />
            </dialogContext.Provider>
        </CreateDiagramSessionDestinationProvider>
    );
};
