import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { createDiagram } from '@/lib/api/diagrams';
import { DatabaseType } from '@/lib/domain/database-type';
import { useAuth } from '@/hooks/use-auth';
import { useStorage } from '@/hooks/use-storage';
import type { Diagram } from '@/lib/domain/diagram';
import type { SelectedTable } from '@/lib/data/import-metadata/filter-metadata';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '@/hooks/use-config';
import type { DatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { loadDatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { generateDiagramId, cn } from '@/lib/utils';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import { SelectDatabase } from './select-database/select-database';
import { ChooseIntent } from './choose-intent/choose-intent';
import {
    ImportSchemaStep,
    type ImportSchemaContinueParams,
} from '@/dialogs/common/import-schema/import-schema-step';
import { CreateDiagramDialogStep } from './create-diagram-dialog-step';
import type { SelectTablesOrigin } from './create-diagram-dialog-step';
import { SelectTables } from '../common/select-tables/select-tables';
import { useTranslation } from 'react-i18next';
import {
    ImportSchemaResolutionError,
    importSchema,
} from '@/lib/import/import-schema';
import type { BaseDialogProps } from '../common/base-dialog-props';
import type { EntryFlowCreateDiagramActions } from '@/pages/editor-page/entry-flow-create-diagram-actions';
import { MAX_TABLES_WITHOUT_SHOWING_FILTER } from '../common/select-tables/constants';
import { useToast } from '@/components/toast/use-toast';
import { ToastAction } from '@/components/toast/toast';
import { ImportFromDatabaseStep } from './import-from-database/import-from-database-step';
import { ChooseImportMethod } from './choose-import-method/choose-import-method';

export interface CreateDiagramDialogProps extends BaseDialogProps {
    entryCreateDiagramActions?: EntryFlowCreateDiagramActions;
}

export const CreateDiagramDialog: React.FC<CreateDiagramDialogProps> = ({
    dialog,
    entryCreateDiagramActions,
}) => {
    const { isAuthenticated } = useAuth();
    const { currentDiagram, loadDiagramFromData } = useChartDB();
    const { toast } = useToast();
    const { t } = useTranslation();

    const isEntryFlowOwned = entryCreateDiagramActions !== undefined;
    const canClose = useMemo(
        () =>
            !isEntryFlowOwned &&
            currentDiagram?.id !== undefined &&
            currentDiagram.id !== '',
        [isEntryFlowOwned, currentDiagram?.id]
    );

    const [databaseType, setDatabaseType] = useState<DatabaseType>(
        DatabaseType.GENERIC
    );
    const { closeCreateDiagramDialog, openAuthDialog } = useDialog();
    const { updateConfig } = useConfig();
    const [scriptResult, setScriptResult] = useState('');
    const [metadataResult, setMetadataResult] = useState('');
    const [databaseEdition, setDatabaseEdition] = useState<
        DatabaseEdition | undefined
    >();
    const [step, setStep] = useState<CreateDiagramDialogStep>(
        CreateDiagramDialogStep.SELECT_DATABASE
    );
    const [selectTablesOrigin, setSelectTablesOrigin] =
        useState<SelectTablesOrigin>('schema');
    const { listDiagrams, addDiagram } = useStorage();
    const [diagramNumber, setDiagramNumber] = useState<number>(1);
    const navigate = useNavigate();
    const [parsedMetadata, setParsedMetadata] = useState<DatabaseMetadata>();
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [resolvedSourceDialect, setResolvedSourceDialect] = useState<
        DatabaseType | undefined
    >();

    useEffect(() => {
        setDatabaseEdition(undefined);
    }, [databaseType]);

    useEffect(() => {
        const fetchDiagrams = async () => {
            const diagrams = await listDiagrams();
            setDiagramNumber(diagrams.length + 1);
        };
        fetchDiagrams();
    }, [listDiagrams, dialog.open]);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        setStep(CreateDiagramDialogStep.SELECT_DATABASE);
        setDatabaseType(DatabaseType.GENERIC);
        setDatabaseEdition(undefined);
        setScriptResult('');
        setMetadataResult('');
        setParsedMetadata(undefined);
        setImportError(null);
        setResolvedSourceDialect(undefined);
        setSelectTablesOrigin('schema');
    }, [dialog.open]);

    const handleGuestLimitSignIn = useCallback(() => {
        closeCreateDiagramDialog();
        openAuthDialog();
    }, [closeCreateDiagramDialog, openAuthDialog]);

    const showGuestLimitToast = useCallback(() => {
        toast({
            title: 'Guest mode limit reached',
            description: 'Sign in to create and save more diagrams.',
            layout: 'column',
            action: (
                <ToastAction altText="Sign in" onClick={handleGuestLimitSignIn}>
                    Sign in
                </ToastAction>
            ),
        });
    }, [handleGuestLimitSignIn, toast]);

    const persistDiagram = useCallback(
        async (diagram: Diagram) => {
            if (!isAuthenticated) {
                await addDiagram({ diagram });
                loadDiagramFromData(diagram);
                return diagram.id;
            }

            const result = await createDiagram({
                name: diagram.name,
                content: diagram,
            });

            return String(result.diagram.id);
        },
        [isAuthenticated, addDiagram, loadDiagramFromData]
    );

    const finalizeImportedDiagram = useCallback(
        async (diagram: Diagram) => {
            if (!isAuthenticated) {
                const diagrams = await listDiagrams();
                if (diagrams.length >= 1) {
                    showGuestLimitToast();
                    return;
                }
            }

            const id = await persistDiagram(diagram);

            if (entryCreateDiagramActions) {
                entryCreateDiagramActions.onDiagramCreated(id);
                return;
            }

            closeCreateDiagramDialog();

            if (isAuthenticated) {
                await updateConfig({
                    config: { defaultDiagramId: id },
                });
                navigate(`/diagrams/${id}`);
            }
        },
        [
            closeCreateDiagramDialog,
            navigate,
            updateConfig,
            persistDiagram,
            isAuthenticated,
            listDiagrams,
            showGuestLimitToast,
            entryCreateDiagramActions,
        ]
    );

    const importNewDiagram = useCallback(
        async ({
            selectedTables,
            databaseMetadata,
            content,
        }: {
            selectedTables?: SelectedTable[];
            databaseMetadata?: DatabaseMetadata;
            content?: string;
        } = {}) => {
            const importContent =
                content ??
                (selectTablesOrigin === 'from_database'
                    ? metadataResult
                    : scriptResult);

            const { diagram } = await importSchema({
                content: importContent,
                selectedDatabaseType: databaseType,
                resolvedSourceDialect,
                databaseEdition,
                diagramNumber,
                databaseMetadata,
                selectedTables,
            });

            await finalizeImportedDiagram(diagram);
        },
        [
            scriptResult,
            metadataResult,
            selectTablesOrigin,
            databaseType,
            resolvedSourceDialect,
            databaseEdition,
            diagramNumber,
            finalizeImportedDiagram,
        ]
    );

    const proceedWithMetadataImport = useCallback(
        async (normalizedContent: string) => {
            const metadata = loadDatabaseMetadata(normalizedContent);
            const totalTablesAndViews =
                metadata.tables.length + (metadata.views?.length || 0);

            setParsedMetadata(metadata);
            setMetadataResult(normalizedContent);

            if (totalTablesAndViews > MAX_TABLES_WITHOUT_SHOWING_FILTER) {
                setSelectTablesOrigin('from_database');
                setStep(CreateDiagramDialogStep.SELECT_TABLES);
                return;
            }

            await importNewDiagram({
                databaseMetadata: metadata,
                content: normalizedContent,
            });
        },
        [importNewDiagram]
    );

    const handleImportFromDatabaseContinue = useCallback(
        async (normalizedContent: string) => {
            setImportError(null);
            setIsImporting(true);

            try {
                await proceedWithMetadataImport(normalizedContent);
            } catch (error: unknown) {
                const message =
                    error instanceof ImportSchemaResolutionError
                        ? error.message
                        : t(
                              'new_diagram_dialog.import_from_database.import_failed'
                          );
                setImportError(message);
            } finally {
                setIsImporting(false);
            }
        },
        [proceedWithMetadataImport, t]
    );

    const handleImportSchemaContinue = useCallback(
        async ({
            importMethod: nextImportMethod,
            resolvedSourceDialect: nextResolvedSourceDialect,
        }: ImportSchemaContinueParams) => {
            setImportError(null);
            setIsImporting(true);
            setResolvedSourceDialect(nextResolvedSourceDialect);

            try {
                if (nextImportMethod === 'query') {
                    const metadata = await new Promise<DatabaseMetadata>(
                        (resolve, reject) => {
                            setTimeout(() => {
                                try {
                                    resolve(loadDatabaseMetadata(scriptResult));
                                } catch (error) {
                                    reject(error);
                                }
                            }, 0);
                        }
                    );

                    const totalTablesAndViews =
                        metadata.tables.length + (metadata.views?.length || 0);

                    setParsedMetadata(metadata);

                    if (
                        totalTablesAndViews > MAX_TABLES_WITHOUT_SHOWING_FILTER
                    ) {
                        setSelectTablesOrigin('schema');
                        setStep(CreateDiagramDialogStep.SELECT_TABLES);
                        return;
                    }

                    const { diagram } = await importSchema({
                        content: scriptResult,
                        selectedDatabaseType: databaseType,
                        databaseEdition,
                        diagramNumber,
                        databaseMetadata: metadata,
                    });

                    await finalizeImportedDiagram(diagram);
                    return;
                }

                const { diagram } = await importSchema({
                    content: scriptResult,
                    selectedDatabaseType: databaseType,
                    resolvedSourceDialect: nextResolvedSourceDialect,
                    databaseEdition,
                    diagramNumber,
                });

                await finalizeImportedDiagram(diagram);
            } catch (error: unknown) {
                const message =
                    error instanceof ImportSchemaResolutionError
                        ? error.message
                        : t(
                              'new_diagram_dialog.import_schema.errors.import_failed'
                          );
                setImportError(message);
            } finally {
                setIsImporting(false);
            }
        },
        [
            scriptResult,
            databaseType,
            databaseEdition,
            diagramNumber,
            finalizeImportedDiagram,
            t,
        ]
    );

    const createEmptyDiagram = useCallback(async () => {
        if (!isAuthenticated) {
            const diagrams = await listDiagrams();
            if (diagrams.length >= 1) {
                showGuestLimitToast();
                return;
            }
        }

        const diagram: Diagram = {
            id: generateDiagramId(),
            name: `Diagram ${diagramNumber}`,
            databaseType: databaseType ?? DatabaseType.GENERIC,
            databaseEdition:
                databaseEdition?.trim().length === 0
                    ? undefined
                    : databaseEdition,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const id = await persistDiagram(diagram);

        if (entryCreateDiagramActions) {
            entryCreateDiagramActions.onDiagramCreated(id);
            return;
        }

        closeCreateDiagramDialog();

        if (isAuthenticated) {
            await updateConfig({
                config: { defaultDiagramId: id },
            });
            navigate(`/diagrams/${id}`);
        }
    }, [
        databaseType,
        databaseEdition,
        closeCreateDiagramDialog,
        navigate,
        updateConfig,
        diagramNumber,
        persistDiagram,
        isAuthenticated,
        listDiagrams,
        showGuestLimitToast,
        entryCreateDiagramActions,
    ]);

    const handleImportBack = useCallback(() => {
        setScriptResult('');
        setImportError(null);
        setResolvedSourceDialect(undefined);
        setStep(CreateDiagramDialogStep.CHOOSE_IMPORT_METHOD);
    }, []);

    const handleImportFromDatabaseBack = useCallback(() => {
        setMetadataResult('');
        setImportError(null);
        setStep(CreateDiagramDialogStep.CHOOSE_IMPORT_METHOD);
    }, []);

    const handleSelectTablesBack = useCallback(() => {
        setStep(
            selectTablesOrigin === 'from_database'
                ? CreateDiagramDialogStep.IMPORT_FROM_DATABASE
                : CreateDiagramDialogStep.IMPORT_DATABASE
        );
    }, [selectTablesOrigin]);

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open && isEntryFlowOwned) {
                    return;
                }

                if (!open) {
                    closeCreateDiagramDialog();
                }
            }}
        >
            <DialogContent
                className={cn(
                    'flex max-h-dvh w-full flex-col overflow-hidden',
                    step === CreateDiagramDialogStep.SELECT_TABLES
                        ? 'max-w-2xl'
                        : 'max-w-[30rem]'
                )}
                showClose={canClose}
                onInteractOutside={(event) => {
                    if (isEntryFlowOwned) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={(event) => {
                    if (isEntryFlowOwned) {
                        event.preventDefault();
                    }
                }}
            >
                {step === CreateDiagramDialogStep.SELECT_DATABASE ? (
                    <SelectDatabase
                        key={dialog.open ? 'open' : 'closed'}
                        databaseType={databaseType}
                        hasExistingDiagram={canClose}
                        setDatabaseType={setDatabaseType}
                        onDatabaseSelected={() =>
                            setStep(CreateDiagramDialogStep.CHOOSE_INTENT)
                        }
                    />
                ) : step === CreateDiagramDialogStep.CHOOSE_INTENT ? (
                    <ChooseIntent
                        databaseType={databaseType}
                        onBack={() => {
                            setDatabaseType(DatabaseType.GENERIC);
                            setStep(CreateDiagramDialogStep.SELECT_DATABASE);
                        }}
                        onCreateEmpty={createEmptyDiagram}
                        onImport={() =>
                            setStep(
                                CreateDiagramDialogStep.CHOOSE_IMPORT_METHOD
                            )
                        }
                    />
                ) : step === CreateDiagramDialogStep.CHOOSE_IMPORT_METHOD ? (
                    <ChooseImportMethod
                        databaseType={databaseType}
                        onBack={() =>
                            setStep(CreateDiagramDialogStep.CHOOSE_INTENT)
                        }
                        onImportFromFile={() =>
                            setStep(CreateDiagramDialogStep.IMPORT_DATABASE)
                        }
                        onImportFromDatabase={() =>
                            setStep(
                                CreateDiagramDialogStep.IMPORT_FROM_DATABASE
                            )
                        }
                    />
                ) : step === CreateDiagramDialogStep.IMPORT_FROM_DATABASE ? (
                    <ImportFromDatabaseStep
                        databaseType={databaseType}
                        databaseEdition={databaseEdition}
                        setDatabaseEdition={setDatabaseEdition}
                        metadataResult={metadataResult}
                        setMetadataResult={setMetadataResult}
                        onContinue={handleImportFromDatabaseContinue}
                        onBack={handleImportFromDatabaseBack}
                        importError={importError}
                        isImporting={isImporting}
                    />
                ) : step === CreateDiagramDialogStep.IMPORT_DATABASE ? (
                    <ImportSchemaStep
                        databaseType={databaseType}
                        setDatabaseType={setDatabaseType}
                        scriptResult={scriptResult}
                        setScriptResult={setScriptResult}
                        onContinue={handleImportSchemaContinue}
                        onBack={handleImportBack}
                        importError={importError}
                        isImporting={isImporting}
                    />
                ) : step === CreateDiagramDialogStep.SELECT_TABLES ? (
                    <SelectTables
                        isLoading={isImporting || !parsedMetadata}
                        databaseMetadata={parsedMetadata}
                        onImport={importNewDiagram}
                        onBack={handleSelectTablesBack}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
