import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { useDialog } from '@/hooks/use-dialog';
import type { DatabaseType } from '@/lib/domain/database-type';
import React, { useCallback, useEffect, useState } from 'react';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { loadDatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import { useTranslation } from 'react-i18next';
import type { BaseDialogProps } from '../common/base-dialog-props';
import {
    ImportSchemaStep,
    type ImportSchemaContinueParams,
} from '../common/import-schema/import-schema-step';
import {
    ImportSchemaResolutionError,
    importSchema,
} from '@/lib/import/import-schema';
import { mergeImportIntoDiagram } from '@/lib/import/merge-import-into-diagram';

export interface ImportDatabaseDialogProps extends BaseDialogProps {
    databaseType: DatabaseType;
}

export const ImportDatabaseDialog: React.FC<ImportDatabaseDialogProps> = ({
    dialog,
    databaseType,
}) => {
    const { closeImportDatabaseDialog } = useDialog();
    const {
        addTables,
        addRelationships,
        diagramName,
        databaseType: currentDatabaseType,
        updateDatabaseType,
        tables: existingTables,
    } = useChartDB();
    const [scriptResult, setScriptResult] = useState('');
    const { resetRedoStack, resetUndoStack } = useRedoUndoStack();
    const { t } = useTranslation();
    const [databaseEdition, setDatabaseEdition] = useState<
        DatabaseEdition | undefined
    >();
    const [importError, setImportError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        setDatabaseEdition(undefined);
    }, [databaseType]);

    useEffect(() => {
        if (!dialog.open) return;
        setDatabaseEdition(undefined);
        setScriptResult('');
        setImportError(null);
        setIsImporting(false);
    }, [dialog.open]);

    const handleImport = useCallback(
        async ({
            importMethod: nextImportMethod,
            resolvedSourceDialect,
        }: ImportSchemaContinueParams) => {
            setImportError(null);
            setIsImporting(true);

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

                    const { diagram } = await importSchema({
                        content: scriptResult,
                        selectedDatabaseType: databaseType,
                        databaseEdition,
                        databaseMetadata: metadata,
                    });

                    const newTablesNumber = diagram.tables?.length ?? 0;
                    const newRelationshipsNumber =
                        diagram.relationships?.length ?? 0;
                    if (newTablesNumber === 0 && newRelationshipsNumber === 0) {
                        return;
                    }

                    closeImportDatabaseDialog();

                    queueMicrotask(async () => {
                        await mergeImportIntoDiagram({
                            importedDiagram: diagram,
                            existingTables,
                            addTables,
                            addRelationships,
                            currentDatabaseType,
                            targetDatabaseType: databaseType,
                            updateDatabaseType,
                            resetRedoStack,
                            resetUndoStack,
                        });
                    });
                    return;
                }

                const { diagram } = await importSchema({
                    content: scriptResult,
                    selectedDatabaseType: databaseType,
                    resolvedSourceDialect,
                    databaseEdition,
                });

                const newTablesNumber = diagram.tables?.length ?? 0;
                const newRelationshipsNumber =
                    diagram.relationships?.length ?? 0;
                if (newTablesNumber === 0 && newRelationshipsNumber === 0) {
                    return;
                }

                closeImportDatabaseDialog();

                queueMicrotask(async () => {
                    await mergeImportIntoDiagram({
                        importedDiagram: diagram,
                        existingTables,
                        addTables,
                        addRelationships,
                        currentDatabaseType,
                        targetDatabaseType: databaseType,
                        updateDatabaseType,
                        resetRedoStack,
                        resetUndoStack,
                    });
                });
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
            existingTables,
            addTables,
            addRelationships,
            currentDatabaseType,
            updateDatabaseType,
            resetRedoStack,
            resetUndoStack,
            closeImportDatabaseDialog,
            t,
        ]
    );

    const handleCancel = useCallback(() => {
        closeImportDatabaseDialog();
    }, [closeImportDatabaseDialog]);

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeImportDatabaseDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-h-screen w-full flex-col overflow-hidden md:max-w-[900px]"
                showClose
            >
                <ImportSchemaStep
                    mode="existing"
                    databaseType={databaseType}
                    scriptResult={scriptResult}
                    setScriptResult={setScriptResult}
                    onContinue={handleImport}
                    onBack={handleCancel}
                    importError={importError}
                    isImporting={isImporting}
                    title={t('import_database_dialog.title', { diagramName })}
                />
            </DialogContent>
        </Dialog>
    );
};
