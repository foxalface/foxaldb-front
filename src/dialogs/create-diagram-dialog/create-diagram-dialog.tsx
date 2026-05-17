import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { createDiagram } from '@/lib/api/diagrams';
import { DatabaseType } from '@/lib/domain/database-type';
import { useAuth } from '@/hooks/use-auth';
import { useStorage } from '@/hooks/use-storage';
import type { Diagram } from '@/lib/domain/diagram';
import { loadFromDatabaseMetadata } from '@/lib/data/import-metadata/import';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '@/hooks/use-config';
import type { DatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { loadDatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { generateDiagramId } from '@/lib/utils';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import { SelectDatabase } from './select-database/select-database';
import { CreateDiagramDialogStep } from './create-diagram-dialog-step';
import { ImportDatabase } from '../common/import-database/import-database';
import { SelectTables } from '../common/select-tables/select-tables';
import { useTranslation } from 'react-i18next';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { sqlImportToDiagram } from '@/lib/data/sql-import';
import type { SelectedTable } from '@/lib/data/import-metadata/filter-metadata';
import { filterMetadataByTables } from '@/lib/data/import-metadata/filter-metadata';
import { MAX_TABLES_WITHOUT_SHOWING_FILTER } from '../common/select-tables/constants';
import {
    defaultDBMLDiagramName,
    importDBMLToDiagram,
} from '@/lib/dbml/dbml-import/dbml-import';
import type { ImportMethod } from '@/lib/import-method/import-method';
import { useToast } from '@/components/toast/use-toast';
import { ToastAction } from '@/components/toast/toast';

export interface CreateDiagramDialogProps extends BaseDialogProps {}

export const CreateDiagramDialog: React.FC<CreateDiagramDialogProps> = ({
    dialog,
}) => {
    const { isAuthenticated } = useAuth();
    const { loadDiagramFromData } = useChartDB();
    const { toast } = useToast();
    const { t } = useTranslation();

    const [importMethod, setImportMethod] = useState<ImportMethod>('query');
    const [databaseType, setDatabaseType] = useState<DatabaseType>(
        DatabaseType.GENERIC
    );
    const { closeCreateDiagramDialog, openAuthDialog } = useDialog();
    const { updateConfig } = useConfig();
    const [scriptResult, setScriptResult] = useState('');
    const [databaseEdition, setDatabaseEdition] = useState<
        DatabaseEdition | undefined
    >();
    const [step, setStep] = useState<CreateDiagramDialogStep>(
        CreateDiagramDialogStep.SELECT_DATABASE
    );
    const { listDiagrams, addDiagram } = useStorage();
    const [diagramNumber, setDiagramNumber] = useState<number>(1);
    const navigate = useNavigate();
    const [parsedMetadata, setParsedMetadata] = useState<DatabaseMetadata>();
    const [isParsingMetadata, setIsParsingMetadata] = useState(false);

    useEffect(() => {
        setDatabaseEdition(undefined);
        setImportMethod('query');
    }, [databaseType]);

    useEffect(() => {
        const fetchDiagrams = async () => {
            const diagrams = await listDiagrams();
            setDiagramNumber(diagrams.length + 1);
        };
        fetchDiagrams();
    }, [listDiagrams, dialog.open]);

    useEffect(() => {
        setStep(CreateDiagramDialogStep.SELECT_DATABASE);
        setDatabaseType(DatabaseType.GENERIC);
        setDatabaseEdition(undefined);
        setScriptResult('');
        setImportMethod('query');
        setParsedMetadata(undefined);
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

    const importNewDiagram = useCallback(
        async ({
            selectedTables,
            databaseMetadata,
        }: {
            selectedTables?: SelectedTable[];
            databaseMetadata?: DatabaseMetadata;
        } = {}) => {
            if (!isAuthenticated) {
                const diagrams = await listDiagrams();
                if (diagrams.length >= 1) {
                    showGuestLimitToast();
                    return;
                }
            }

            let diagram: Diagram | undefined;

            if (importMethod === 'ddl') {
                diagram = await sqlImportToDiagram({
                    sqlContent: scriptResult,
                    sourceDatabaseType: databaseType,
                    targetDatabaseType: databaseType,
                });
            } else if (importMethod === 'dbml') {
                diagram = await importDBMLToDiagram(scriptResult, {
                    databaseType,
                });

                if (diagram.name === defaultDBMLDiagramName) {
                    diagram.name = `Diagram ${diagramNumber}`;
                }
            } else {
                let metadata: DatabaseMetadata | undefined = databaseMetadata;

                if (!metadata) {
                    metadata = loadDatabaseMetadata(scriptResult);
                }

                if (selectedTables && selectedTables.length > 0) {
                    metadata = filterMetadataByTables({
                        metadata,
                        selectedTables,
                    });
                }

                diagram = await loadFromDatabaseMetadata({
                    databaseType,
                    databaseMetadata: metadata,
                    diagramNumber,
                    databaseEdition:
                        databaseEdition?.trim().length === 0
                            ? undefined
                            : databaseEdition,
                });
            }

            const id = await persistDiagram(diagram);

            closeCreateDiagramDialog();

            if (isAuthenticated) {
                await updateConfig({
                    config: { defaultDiagramId: id },
                });
                navigate(`/diagrams/${id}`);
            }
        },
        [
            importMethod,
            databaseType,
            databaseEdition,
            closeCreateDiagramDialog,
            navigate,
            updateConfig,
            scriptResult,
            diagramNumber,
            persistDiagram,
            isAuthenticated,
            listDiagrams,
            showGuestLimitToast,
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
    ]);

    const importNewDiagramOrFilterTables = useCallback(async () => {
        try {
            setIsParsingMetadata(true);

            if (importMethod === 'ddl' || importMethod === 'dbml') {
                await importNewDiagram();
            } else {
                const metadata = await new Promise<DatabaseMetadata>(
                    (resolve, reject) => {
                        setTimeout(() => {
                            try {
                                const result =
                                    loadDatabaseMetadata(scriptResult);
                                resolve(result);
                            } catch (err) {
                                reject(err);
                            }
                        }, 0);
                    }
                );

                const totalTablesAndViews =
                    metadata.tables.length + (metadata.views?.length || 0);

                setParsedMetadata(metadata);

                if (totalTablesAndViews > MAX_TABLES_WITHOUT_SHOWING_FILTER) {
                    setStep(CreateDiagramDialogStep.SELECT_TABLES);
                } else {
                    await importNewDiagram({
                        databaseMetadata: metadata,
                    });
                }
            }
        } finally {
            setIsParsingMetadata(false);
        }
    }, [importMethod, scriptResult, importNewDiagram]);

    return (
        <Dialog {...dialog}>
            <DialogContent className="flex max-h-dvh w-full flex-col md:max-w-[900px]">
                {step === CreateDiagramDialogStep.SELECT_DATABASE ? (
                    <SelectDatabase
                        createNewDiagram={createEmptyDiagram}
                        databaseType={databaseType}
                        hasExistingDiagram={false}
                        setDatabaseType={setDatabaseType}
                        onContinue={() =>
                            setStep(CreateDiagramDialogStep.IMPORT_DATABASE)
                        }
                    />
                ) : step === CreateDiagramDialogStep.IMPORT_DATABASE ? (
                    <ImportDatabase
                        onImport={importNewDiagramOrFilterTables}
                        onCreateEmptyDiagram={createEmptyDiagram}
                        databaseEdition={databaseEdition}
                        databaseType={databaseType}
                        scriptResult={scriptResult}
                        setDatabaseEdition={setDatabaseEdition}
                        goBack={() =>
                            setStep(CreateDiagramDialogStep.SELECT_DATABASE)
                        }
                        setScriptResult={setScriptResult}
                        title={t('new_diagram_dialog.import_database.title')}
                        importMethod={importMethod}
                        setImportMethod={setImportMethod}
                        keepDialogAfterImport={true}
                    />
                ) : step === CreateDiagramDialogStep.SELECT_TABLES ? (
                    <SelectTables
                        isLoading={isParsingMetadata || !parsedMetadata}
                        databaseMetadata={parsedMetadata}
                        onImport={importNewDiagram}
                        onBack={() =>
                            setStep(CreateDiagramDialogStep.IMPORT_DATABASE)
                        }
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
