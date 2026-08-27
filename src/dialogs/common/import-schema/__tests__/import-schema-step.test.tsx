import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    dbmlSample,
    genericAmbiguousSql,
    metadataJsonSample,
    mysqlDistinctiveSql,
    postgresDistinctiveSql,
    randomText,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { ImportSchemaStep } from '../import-schema-step';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, string>) => {
            if (key === 'new_diagram_dialog.import_schema.detection.dialect') {
                return `${options?.database} detected`;
            }

            if (key === 'new_diagram_dialog.import_schema.selected_file') {
                return `Selected file: ${options?.name ?? ''}`;
            }

            if (key === 'new_diagram_dialog.import_schema.mismatch.title') {
                return `Mismatch ${options?.detected} vs ${options?.selected}`;
            }

            if (key === 'import_database_dialog.import_schema.mismatch.title') {
                return `Mismatch ${options?.detected} vs ${options?.selected}`;
            }

            if (key === 'new_diagram_dialog.import_schema.mismatch.switch') {
                return `Switch to ${options?.database}`;
            }

            return key;
        },
    }),
}));

const renderImportSchemaStep = (
    props: Partial<React.ComponentProps<typeof ImportSchemaStep>> = {}
) => {
    const setScriptResult = vi.fn();
    const setDatabaseType = vi.fn();
    const onContinue = vi.fn();
    const onBack = vi.fn();

    render(
        <Dialog open>
            <DialogContent>
                <ImportSchemaStep
                    databaseType={DatabaseType.POSTGRESQL}
                    setDatabaseType={setDatabaseType}
                    scriptResult=""
                    setScriptResult={setScriptResult}
                    onContinue={onContinue}
                    onBack={onBack}
                    {...props}
                />
            </DialogContent>
        </Dialog>
    );

    return { setScriptResult, setDatabaseType, onContinue, onBack };
};

describe('ImportSchemaStep', () => {
    it('renders paste and file upload controls', () => {
        renderImportSchemaStep();

        expect(
            screen.getByRole('textbox', {
                name: 'new_diagram_dialog.import_schema.textarea_label',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.choose_file',
            })
        ).toBeInTheDocument();
    });

    it('shows PostgreSQL detection after SQL paste', () => {
        renderImportSchemaStep({
            scriptResult: postgresDistinctiveSql,
        });

        expect(screen.getByText('PostgreSQL detected')).toBeInTheDocument();
    });

    it('shows mismatch UI for MySQL SQL with PostgreSQL selected', () => {
        renderImportSchemaStep({
            scriptResult: mysqlDistinctiveSql,
        });

        expect(
            screen.getByText('Mismatch MySQL vs PostgreSQL')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Switch to MySQL' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.continue',
            })
        ).toBeDisabled();
    });

    it('switches database type and preserves content on mismatch resolution', async () => {
        const user = userEvent.setup();
        const setDatabaseType = vi.fn();

        renderImportSchemaStep({
            scriptResult: mysqlDistinctiveSql,
            setDatabaseType,
        });

        await user.click(
            screen.getByRole('button', { name: 'Switch to MySQL' })
        );

        expect(setDatabaseType).toHaveBeenCalledWith(DatabaseType.MYSQL);
    });

    it('shows ambiguous SQL resolution UI and blocks Continue until resolved', async () => {
        const user = userEvent.setup();
        const onContinue = vi.fn();

        renderImportSchemaStep({
            scriptResult: genericAmbiguousSql,
            onContinue,
        });

        expect(
            screen.getByText('new_diagram_dialog.import_schema.ambiguous.title')
        ).toBeInTheDocument();

        const continueButton = screen.getByRole('button', {
            name: 'new_diagram_dialog.import_schema.continue',
        });

        await waitFor(() => {
            expect(continueButton).toBeEnabled();
        });

        await user.click(continueButton);

        expect(onContinue).toHaveBeenCalledWith({
            importMethod: 'ddl',
            resolvedSourceDialect: DatabaseType.POSTGRESQL,
        });
    });

    it('calls onContinue with DBML import method without a SQL dialect', async () => {
        const user = userEvent.setup();
        const onContinue = vi.fn();

        renderImportSchemaStep({
            scriptResult: dbmlSample,
            onContinue,
        });

        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.continue',
            })
        );

        expect(onContinue).toHaveBeenCalledWith({
            importMethod: 'dbml',
            resolvedSourceDialect: undefined,
        });
    });

    it('disables Continue for unsupported input', () => {
        renderImportSchemaStep({
            scriptResult: randomText,
        });

        expect(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.continue',
            })
        ).toBeDisabled();
    });

    it('rejects files larger than 5 MB before reading them', async () => {
        const user = userEvent.setup();
        const setScriptResult = vi.fn();
        const largeFile = new File(['x'], 'large.sql', { type: 'text/plain' });
        Object.defineProperty(largeFile, 'size', {
            value: 5 * 1024 * 1024 + 1,
        });

        renderImportSchemaStep({ setScriptResult });

        await user.upload(
            screen.getByLabelText(
                'new_diagram_dialog.import_schema.choose_file'
            ),
            largeFile
        );

        expect(setScriptResult).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                'new_diagram_dialog.import_schema.errors.file_too_large'
            )
        ).toBeInTheDocument();
    });

    it('shows metadata JSON detection', () => {
        renderImportSchemaStep({
            scriptResult: metadataJsonSample,
        });

        expect(
            screen.getByText(
                'new_diagram_dialog.import_schema.detection.metadata_json'
            )
        ).toBeInTheDocument();
    });

    it('shows import errors without clearing content', () => {
        renderImportSchemaStep({
            scriptResult: postgresDistinctiveSql,
            importError: 'Import failed',
        });

        expect(screen.getByText('Import failed')).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', {
                name: 'new_diagram_dialog.import_schema.textarea_label',
            })
        ).toHaveValue(postgresDistinctiveSql);
    });

    it('invokes onBack from the footer', async () => {
        const user = userEvent.setup();
        const { onBack } = renderImportSchemaStep();

        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.back',
            })
        );

        expect(onBack).toHaveBeenCalledTimes(1);
    });
});

describe('ImportSchemaStep existing diagram mode', () => {
    const renderExistingImportSchemaStep = (
        props: Partial<
            Extract<
                React.ComponentProps<typeof ImportSchemaStep>,
                { mode: 'existing' }
            >
        > = {}
    ) => {
        const setScriptResult = vi.fn();
        const onContinue = vi.fn();
        const onBack = vi.fn();

        render(
            <Dialog open>
                <DialogContent>
                    <ImportSchemaStep
                        mode="existing"
                        databaseType={DatabaseType.POSTGRESQL}
                        scriptResult=""
                        setScriptResult={setScriptResult}
                        onContinue={onContinue}
                        onBack={onBack}
                        {...props}
                    />
                </DialogContent>
            </Dialog>
        );

        return { setScriptResult, onContinue, onBack };
    };

    it('blocks mismatch import without offering database switch', () => {
        renderExistingImportSchemaStep({
            scriptResult: mysqlDistinctiveSql,
        });

        expect(
            screen.getByText('Mismatch MySQL vs PostgreSQL')
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Switch to MySQL' })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'import_database_dialog.import_schema.import',
            })
        ).toBeDisabled();
    });

    it('allows ambiguous SQL when current diagram DBMS is preselected', async () => {
        const user = userEvent.setup();
        const { onContinue } = renderExistingImportSchemaStep({
            scriptResult: genericAmbiguousSql,
        });

        const importButton = screen.getByRole('button', {
            name: 'import_database_dialog.import_schema.import',
        });

        await waitFor(() => {
            expect(importButton).toBeEnabled();
        });

        await user.click(importButton);

        expect(onContinue).toHaveBeenCalledWith({
            importMethod: 'ddl',
            resolvedSourceDialect: DatabaseType.POSTGRESQL,
        });
    });
});
