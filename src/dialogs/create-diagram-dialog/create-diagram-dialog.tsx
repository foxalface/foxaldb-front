import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import { useStorage } from '@/hooks/use-storage';
import type { Diagram } from '@/lib/domain/diagram';
import type { SelectedTable } from '@/lib/data/import-metadata/filter-metadata';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '@/hooks/use-config';
import type { DatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { loadDatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { generateDiagramId } from '@/lib/utils';
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
import {
    ImportDiagramJsonError,
    importDiagramFromJson,
} from '@/lib/import/import-diagram-from-json';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { wizardDialogContentClassName } from '../common/wizard-dialog-size';
import type { EntryFlowCreateDiagramActions } from '@/pages/editor-page/entry-flow-create-diagram-actions';
import { MAX_TABLES_WITHOUT_SHOWING_FILTER } from '../common/select-tables/constants';
import { ImportFromDatabaseStep } from './import-from-database/import-from-database-step';
import { ChooseImportMethod } from './choose-import-method/choose-import-method';
import { CreateDiagramDestinationSelector } from './create-diagram-destination-selector';
import { useCreateDiagramSessionDestinationRequired } from './create-diagram-session-destination-context';
import {
    openPersistedNewDiagram,
    persistNewDiagram,
    persistedNewDiagramId,
} from '@/lib/diagram/persist-new-diagram';
import { GuestDeviceDiagramLimitError } from '@/lib/diagram/guest-device-diagram-limit';
import { registerProtectedActionResume } from '@/lib/auth-intent';
import { useRequestAuthentication } from '@/hooks/use-request-authentication';
import { useGuestDeviceDiagramLimitToast } from '@/hooks/use-guest-device-diagram-limit-toast';

export interface CreateDiagramDialogProps extends BaseDialogProps {
    entryCreateDiagramActions?: EntryFlowCreateDiagramActions;
}

export const CreateDiagramDialog: React.FC<CreateDiagramDialogProps> = ({
    dialog,
    entryCreateDiagramActions,
}) => {
    const { isAuthenticated } = useAuth();
    const { currentDiagram, loadDiagramFromData } = useChartDB();
    const { setDiagramLocation } = useDiagramLocation();
    const { clearDiagramAccess } = useDiagramAccess();
    const { t } = useTranslation();
    const requestAuthentication = useRequestAuthentication();
    const { notifyGuestDeviceDiagramLimitReached } =
        useGuestDeviceDiagramLimitToast();
    const { destination, setDestination } =
        useCreateDiagramSessionDestinationRequired();

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
    const { closeCreateDiagramDialog } = useDialog();
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

    const handleGuestRequestOnlineDestination = useCallback(() => {
        registerProtectedActionResume(() => {
            setDestination('online');
        });
        requestAuthentication({
            type: 'protected-action',
            action: 'create-online-diagram',
        });
    }, [requestAuthentication, setDestination]);

    const finishCreatedDiagram = useCallback(
        async (diagram: Diagram) => {
            try {
                const persisted = await persistNewDiagram(
                    diagram,
                    destination,
                    {
                        addDiagram,
                        listDiagrams,
                        isAuthenticated,
                    }
                );

                if (entryCreateDiagramActions) {
                    entryCreateDiagramActions.onDiagramCreated(
                        persistedNewDiagramId(persisted)
                    );
                    return;
                }

                closeCreateDiagramDialog();

                await openPersistedNewDiagram(persisted, {
                    setDiagramLocation,
                    clearDiagramAccess,
                    loadDiagramFromData,
                    navigate: (path) => {
                        navigate(path);
                    },
                    updateDefaultDiagramId: isAuthenticated
                        ? async (diagramId) => {
                              await updateConfig({
                                  config: { defaultDiagramId: diagramId },
                              });
                          }
                        : undefined,
                    navigateAfterDeviceOpen: isAuthenticated,
                });
            } catch (caught: unknown) {
                if (caught instanceof GuestDeviceDiagramLimitError) {
                    notifyGuestDeviceDiagramLimitReached();
                    return;
                }

                throw caught;
            }
        },
        [
            destination,
            isAuthenticated,
            listDiagrams,
            notifyGuestDeviceDiagramLimitReached,
            addDiagram,
            entryCreateDiagramActions,
            closeCreateDiagramDialog,
            setDiagramLocation,
            clearDiagramAccess,
            loadDiagramFromData,
            navigate,
            updateConfig,
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

            await finishCreatedDiagram(diagram);
        },
        [
            scriptResult,
            metadataResult,
            selectTablesOrigin,
            databaseType,
            resolvedSourceDialect,
            databaseEdition,
            diagramNumber,
            finishCreatedDiagram,
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
            importedDiagram,
        }: ImportSchemaContinueParams) => {
            setImportError(null);
            setIsImporting(true);
            setResolvedSourceDialect(nextResolvedSourceDialect);

            try {
                if (nextImportMethod === 'project') {
                    if (!importedDiagram) {
                        throw new ImportSchemaResolutionError(
                            'Project import did not return a diagram.'
                        );
                    }

                    if (importedDiagram.databaseType !== databaseType) {
                        setDatabaseType(importedDiagram.databaseType);
                    }

                    await finishCreatedDiagram(importedDiagram);
                    return;
                }

                if (nextImportMethod === 'diagram') {
                    if (!nextResolvedSourceDialect) {
                        throw new ImportDiagramJsonError({
                            code: 'invalid_diagram_json',
                            path: null,
                            issueCode: 'dialect_unresolved',
                        });
                    }

                    const diagram = importDiagramFromJson(
                        scriptResult,
                        nextResolvedSourceDialect
                    );

                    if (diagram.databaseType !== databaseType) {
                        setDatabaseType(diagram.databaseType);
                    }

                    await finishCreatedDiagram(diagram);
                    return;
                }

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

                    await finishCreatedDiagram(diagram);
                    return;
                }

                const { diagram } = await importSchema({
                    content: scriptResult,
                    selectedDatabaseType: databaseType,
                    resolvedSourceDialect: nextResolvedSourceDialect,
                    databaseEdition,
                    diagramNumber,
                });

                await finishCreatedDiagram(diagram);
            } catch (error: unknown) {
                let message = t(
                    'new_diagram_dialog.import_schema.errors.import_failed'
                );

                if (error instanceof ImportSchemaResolutionError) {
                    message = error.message;
                } else if (error instanceof ImportDiagramJsonError) {
                    const hint = t(
                        'new_diagram_dialog.import_schema.errors.invalid_diagram_json_hint'
                    );
                    const title = t(
                        'new_diagram_dialog.import_schema.detection.invalid_diagram_json'
                    );
                    message = error.failure.path
                        ? `${title} — ${hint} ${error.failure.path}`
                        : `${title} — ${hint}`;
                }

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
            finishCreatedDiagram,
            t,
        ]
    );

    const createEmptyDiagram = useCallback(async () => {
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

        await finishCreatedDiagram(diagram);
    }, [databaseType, databaseEdition, diagramNumber, finishCreatedDiagram]);

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

    const isWideDialog =
        step === CreateDiagramDialogStep.IMPORT_DATABASE ||
        step === CreateDiagramDialogStep.SELECT_TABLES;

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
                className={wizardDialogContentClassName(isWideDialog)}
                showClose={canClose}
                onOpenAutoFocus={(event) => event.preventDefault()}
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
                <CreateDiagramDestinationSelector
                    destination={destination}
                    onDestinationChange={setDestination}
                    onGuestRequestOnline={handleGuestRequestOnlineDestination}
                    isAuthenticated={isAuthenticated}
                />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
                                setStep(
                                    CreateDiagramDialogStep.SELECT_DATABASE
                                );
                            }}
                            onCreateEmpty={createEmptyDiagram}
                            onImport={() =>
                                setStep(
                                    CreateDiagramDialogStep.CHOOSE_IMPORT_METHOD
                                )
                            }
                        />
                    ) : step ===
                      CreateDiagramDialogStep.CHOOSE_IMPORT_METHOD ? (
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
                    ) : step ===
                      CreateDiagramDialogStep.IMPORT_FROM_DATABASE ? (
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
                </div>
            </DialogContent>
        </Dialog>
    );
};
