import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { postgresDistinctiveSql } from '@/lib/import/__tests__/fixtures/import-samples';
import { ImportDatabaseDialog } from '../import-database-dialog';
import { TooltipProvider } from '@/components/tooltip/tooltip';

const mockCloseImportDatabaseDialog = vi.fn();
const mockAddTables = vi.fn().mockResolvedValue(undefined);
const mockAddRelationships = vi.fn().mockResolvedValue(undefined);
const mockUpdateDatabaseType = vi.fn().mockResolvedValue(undefined);
const mockResetRedoStack = vi.fn();
const mockResetUndoStack = vi.fn();
const mockImportSchema = vi.fn();
const mockMergeImportIntoDiagram = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeImportDatabaseDialog: mockCloseImportDatabaseDialog,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        addTables: mockAddTables,
        addRelationships: mockAddRelationships,
        diagramName: 'Test Diagram',
        databaseType: DatabaseType.POSTGRESQL,
        updateDatabaseType: mockUpdateDatabaseType,
        tables: [],
    }),
}));

vi.mock('@/hooks/use-redo-undo-stack', () => ({
    useRedoUndoStack: () => ({
        resetRedoStack: mockResetRedoStack,
        resetUndoStack: mockResetUndoStack,
    }),
}));

vi.mock('@/lib/import/import-schema', () => ({
    ImportSchemaResolutionError: class ImportSchemaResolutionError extends Error {},
    importSchema: (...args: unknown[]) => mockImportSchema(...args),
}));

vi.mock('@/lib/import/merge-import-into-diagram', () => ({
    mergeImportIntoDiagram: (...args: unknown[]) =>
        mockMergeImportIntoDiagram(...args),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, string>) => {
            if (key === 'import_database_dialog.title') {
                return `Import to ${options?.diagramName ?? ''}`;
            }

            if (key === 'new_diagram_dialog.import_schema.detection.dialect') {
                return `${options?.database} detected`;
            }

            return key;
        },
    }),
}));

describe('ImportDatabaseDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockImportSchema.mockResolvedValue({
            diagram: {
                id: 'imported',
                name: 'Imported',
                databaseType: DatabaseType.POSTGRESQL,
                tables: [{ id: 't1', name: 'users', x: 0, y: 0, fields: [] }],
                relationships: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            format: 'sql',
            sourceDialect: DatabaseType.POSTGRESQL,
            diagnostics: [],
        });
    });

    it('uses importSchema with explicit source dialect before merging', async () => {
        const user = userEvent.setup();

        render(
            <TooltipProvider>
                <ImportDatabaseDialog
                    dialog={{ open: true }}
                    databaseType={DatabaseType.POSTGRESQL}
                />
            </TooltipProvider>
        );

        await user.type(
            screen.getByRole('textbox', {
                name: 'new_diagram_dialog.import_schema.textarea_label',
            }),
            postgresDistinctiveSql
        );

        await user.click(
            screen.getByRole('button', {
                name: 'import_database_dialog.import_schema.import',
            })
        );

        await waitFor(() => {
            expect(mockImportSchema).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: postgresDistinctiveSql,
                    selectedDatabaseType: DatabaseType.POSTGRESQL,
                    resolvedSourceDialect: DatabaseType.POSTGRESQL,
                })
            );
        });

        await waitFor(() => {
            expect(mockMergeImportIntoDiagram).toHaveBeenCalled();
            expect(mockCloseImportDatabaseDialog).toHaveBeenCalled();
        });
    });

    it('keeps the dialog open when parsing fails', async () => {
        const user = userEvent.setup();
        mockImportSchema.mockRejectedValueOnce(new Error('Parse failed'));

        render(
            <TooltipProvider>
                <ImportDatabaseDialog
                    dialog={{ open: true }}
                    databaseType={DatabaseType.POSTGRESQL}
                />
            </TooltipProvider>
        );

        await user.type(
            screen.getByRole('textbox', {
                name: 'new_diagram_dialog.import_schema.textarea_label',
            }),
            postgresDistinctiveSql
        );

        await user.click(
            screen.getByRole('button', {
                name: 'import_database_dialog.import_schema.import',
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    'new_diagram_dialog.import_schema.errors.import_failed'
                )
            ).toBeInTheDocument();
        });

        expect(mockMergeImportIntoDiagram).not.toHaveBeenCalled();
        expect(mockCloseImportDatabaseDialog).not.toHaveBeenCalled();
        expect(
            screen.getByRole('textbox', {
                name: 'new_diagram_dialog.import_schema.textarea_label',
            })
        ).toHaveValue(postgresDistinctiveSql);
    });
});
