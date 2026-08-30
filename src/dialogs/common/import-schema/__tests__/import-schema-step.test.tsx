import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    dbmlSample,
    diagramJsonSample,
    genericAmbiguousSql,
    metadataJsonSample,
    mysqlDistinctiveSql,
    postgresDistinctiveSql,
    randomText,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { ImportSchemaStep } from '../import-schema-step';
import type * as ClientModule from '@/lib/api/client';

const stressSql = readFileSync(
    join(
        dirname(fileURLToPath(import.meta.url)),
        '../../../../lib/import/__tests__/fixtures/multi_dbms_ambiguity_stress_test.sql'
    ),
    'utf8'
);

import {
    createTestZipFile,
    createRawZipFile,
} from '@/lib/project-import/__tests__/fixtures/build-test-zip';

let isAuthenticated = true;

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('@/lib/api/client', async () => {
    const actual = (await vi.importActual(
        '@/lib/api/client'
    )) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, string>) => {
            if (key === 'new_diagram_dialog.import_schema.detection.dialect') {
                return `${options?.database} detected`;
            }

            if (key === 'new_diagram_dialog.import_schema.selected_file') {
                return `Selected file: ${options?.name ?? ''}`;
            }

            if (key === 'new_diagram_dialog.import_schema.change_file_aria') {
                return `Change file, currently ${options?.name ?? ''}`;
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

            if (
                key ===
                'new_diagram_dialog.import_schema.ambiguous.candidate_with_confidence'
            ) {
                return options?.database ?? key;
            }

            if (key.endsWith('.candidate_with_confidence')) {
                return options?.database ?? key;
            }

            if (
                key ===
                'new_diagram_dialog.import_schema.ambiguous.candidate_recommended'
            ) {
                return options?.database ?? key;
            }

            if (key.endsWith('.candidate_recommended')) {
                return options?.database ?? key;
            }

            if (key.endsWith('.candidate')) {
                return options?.database ?? key;
            }

            if (
                key ===
                'new_diagram_dialog.import_schema.ambiguous.confidence_badge'
            ) {
                return `${options?.percent}%`;
            }

            if (
                key ===
                'new_diagram_dialog.import_schema.ambiguous.recommended_aria'
            ) {
                return `${options?.database} recommended`;
            }

            if (key.endsWith('.recommended_aria')) {
                return `${options?.database} recommended`;
            }

            if (key === 'new_diagram_dialog.import_schema.project.detected') {
                return `${options?.framework} project detected`;
            }

            if (
                key ===
                'new_diagram_dialog.import_schema.project.migrations_found'
            ) {
                return `${options?.count} migrations`;
            }

            if (
                key ===
                'new_diagram_dialog.import_schema.project.schema_files_found'
            ) {
                return `${options?.count} schemas`;
            }

            if (
                key ===
                'new_diagram_dialog.import_schema.project.frameworks.laravel'
            ) {
                return 'Laravel';
            }

            if (
                key ===
                'new_diagram_dialog.import_schema.project.frameworks.prisma'
            ) {
                return 'Prisma';
            }

            if (
                key ===
                'new_diagram_dialog.import_schema.ambiguous.recommended_tooltip'
            ) {
                return 'Automatically detected DBMS';
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

    const view = render(
        <TooltipProvider>
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
        </TooltipProvider>
    );

    return { setScriptResult, setDatabaseType, onContinue, onBack, ...view };
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
                name: 'new_diagram_dialog.import_schema.choose_file_or_project',
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
                name: 'new_diagram_dialog.import_schema.import',
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
            name: 'new_diagram_dialog.import_schema.import',
        });

        expect(continueButton).toBeDisabled();

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));

        expect(continueButton).toBeEnabled();

        await user.click(continueButton);

        expect(onContinue).toHaveBeenCalledWith({
            importMethod: 'ddl',
            resolvedSourceDialect: DatabaseType.POSTGRESQL,
        });
    });

    it('marks the automatically detected DBMS with a recommended star', () => {
        renderImportSchemaStep({
            scriptResult: stressSql,
        });

        expect(
            screen.getByLabelText('PostgreSQL recommended')
        ).toBeInTheDocument();
        expect(
            screen.queryByLabelText('SQL Server recommended')
        ).not.toBeInTheDocument();
    });

    it('calls onContinue with diagram JSON when the DBMS matches', async () => {
        const user = userEvent.setup();
        const onContinue = vi.fn();

        renderImportSchemaStep({
            scriptResult: diagramJsonSample,
            databaseType: DatabaseType.POSTGRESQL,
            onContinue,
        });

        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.import',
            })
        );

        expect(onContinue).toHaveBeenCalledWith({
            importMethod: 'diagram',
            resolvedSourceDialect: DatabaseType.POSTGRESQL,
        });
    });

    it('blocks diagram JSON mismatch import until the DBMS is chosen explicitly', async () => {
        const user = userEvent.setup();
        const onContinue = vi.fn();

        renderImportSchemaStep({
            scriptResult: diagramJsonSample,
            databaseType: DatabaseType.MYSQL,
            onContinue,
        });

        expect(
            screen.getByText(
                'new_diagram_dialog.import_schema.diagram_json.ambiguous.title'
            )
        ).toBeInTheDocument();

        const continueButton = screen.getByRole('button', {
            name: 'new_diagram_dialog.import_schema.import',
        });

        expect(continueButton).toBeDisabled();
        expect(
            screen.getByLabelText('PostgreSQL recommended')
        ).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: 'MySQL' }));

        expect(continueButton).toBeEnabled();

        await user.click(continueButton);

        expect(onContinue).toHaveBeenCalledWith({
            importMethod: 'diagram',
            resolvedSourceDialect: DatabaseType.MYSQL,
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
                name: 'new_diagram_dialog.import_schema.import',
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
                name: 'new_diagram_dialog.import_schema.import',
            })
        ).toBeDisabled();
    });

    it('shows the selected file name on the upload button', async () => {
        const user = userEvent.setup();
        const setScriptResult = vi.fn();
        const file = new File(['CREATE TABLE t (id INT);'], 'schema.sql', {
            type: 'text/plain',
        });

        const { container } = renderImportSchemaStep({ setScriptResult });
        const fileInput =
            container.querySelector('input[type="file"]') ??
            document.body.querySelector('input[type="file"]');

        expect(fileInput).not.toBeNull();

        await user.upload(fileInput as HTMLInputElement, file);

        expect(
            screen.getByRole('button', {
                name: 'Change file, currently schema.sql',
            })
        ).toHaveTextContent('schema.sql');
        expect(setScriptResult).toHaveBeenCalled();
    });

    it('restricts file selection to supported schema and project extensions', () => {
        renderImportSchemaStep();
        const fileInput = document.body.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;

        expect(fileInput).toHaveAttribute('accept', '.sql,.dbml,.json,.zip');
    });

    it('rejects unsupported file extensions before reading them', async () => {
        const setScriptResult = vi.fn();
        const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });

        const { container } = renderImportSchemaStep({ setScriptResult });
        const fileInput =
            container.querySelector('input[type="file"]') ??
            (document.body.querySelector(
                'input[type="file"]'
            ) as HTMLInputElement);

        fireEvent.change(fileInput as HTMLInputElement, {
            target: { files: [file] },
        });

        expect(setScriptResult).not.toHaveBeenCalled();
        await waitFor(() => {
            expect(
                screen.getByText(
                    'new_diagram_dialog.import_schema.errors.unsupported_file_extension'
                )
            ).toBeInTheDocument();
        });
    });

    it('rejects files larger than 5 MB before reading them', async () => {
        const user = userEvent.setup();
        const setScriptResult = vi.fn();
        const largeFile = new File(['x'], 'large.sql', { type: 'text/plain' });
        Object.defineProperty(largeFile, 'size', {
            value: 5 * 1024 * 1024 + 1,
        });

        const { container } = renderImportSchemaStep({ setScriptResult });
        const fileInput =
            container.querySelector('input[type="file"]') ??
            document.body.querySelector('input[type="file"]');

        expect(fileInput).not.toBeNull();

        await user.upload(fileInput as HTMLInputElement, largeFile);

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

describe('ImportSchemaStep project archives', () => {
    beforeEach(() => {
        isAuthenticated = true;
        apiRequestMock.mockReset();
    });

    const uploadZip = async (
        files: Record<string, string>,
        fileName = 'project.zip'
    ) => {
        const user = userEvent.setup();
        const setScriptResult = vi.fn();
        const onContinue = vi.fn();
        const file = createTestZipFile(files, fileName);

        const { container } = renderImportSchemaStep({
            setScriptResult,
            onContinue,
        });

        const fileInput =
            container.querySelector('input[type="file"]') ??
            document.body.querySelector('input[type="file"]');

        await user.upload(fileInput as HTMLInputElement, file);

        return { setScriptResult, onContinue, user };
    };

    it('detects a valid Laravel ZIP without populating the textarea', async () => {
        const { setScriptResult, onContinue } = await uploadZip({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });

        expect(setScriptResult).toHaveBeenCalledWith('');
        expect(
            screen.getByText('Laravel project detected')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.import',
            })
        ).toBeDisabled();
        expect(onContinue).not.toHaveBeenCalled();
    });

    it('detects a valid Prisma ZIP', async () => {
        await uploadZip({
            'prisma/schema.prisma': 'model User { id Int @id }',
        });

        expect(screen.getByText('Prisma project detected')).toBeInTheDocument();
    });

    it('shows ambiguity UI for monorepo archives', async () => {
        const { user } = await uploadZip({
            'repo/apps/api/artisan': '#!/usr/bin/env php',
            'repo/apps/api/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'repo/apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
            'repo/packages/db/prisma/schema.prisma':
                'model User { id Int @id }',
        });

        expect(
            screen.getByText(
                'new_diagram_dialog.import_schema.project.multiple_projects_title'
            )
        ).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: /Prisma/i }));

        expect(screen.getByText('Prisma project detected')).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.import',
            })
        ).toBeDisabled();
    });

    it('shows unsupported project state for unrecognized archives', async () => {
        await uploadZip({
            'readme.md': '# hello',
            'src/index.ts': 'export {}',
        });

        expect(
            screen.getByText(
                'new_diagram_dialog.import_schema.project.unsupported_project'
            )
        ).toBeInTheDocument();
    });

    it('handles corrupted ZIP files', async () => {
        const user = userEvent.setup();
        const setScriptResult = vi.fn();
        const file = createRawZipFile(
            new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00]),
            'broken.zip'
        );

        const { container } = renderImportSchemaStep({ setScriptResult });
        const fileInput =
            container.querySelector('input[type="file"]') ??
            (document.body.querySelector(
                'input[type="file"]'
            ) as HTMLInputElement);

        await user.upload(fileInput as HTMLInputElement, file);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'new_diagram_dialog.import_schema.errors.archive_invalid'
                )
            ).toBeInTheDocument();
        });
        expect(setScriptResult).not.toHaveBeenCalled();
    });

    it('clears project analysis when textarea content changes', async () => {
        const { user } = await uploadZip({
            'prisma/schema.prisma': 'model User { id Int @id }',
        });

        expect(screen.getByText('Prisma project detected')).toBeInTheDocument();

        await user.type(
            screen.getByRole('textbox', {
                name: 'new_diagram_dialog.import_schema.textarea_label',
            }),
            'CREATE TABLE t (id INT);'
        );

        expect(
            screen.queryByText('Prisma project detected')
        ).not.toBeInTheDocument();
    });

    it('does not call the project import API while parser execution is unavailable', async () => {
        await uploadZip({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });

        expect(apiRequestMock).not.toHaveBeenCalled();
    });

    it('shows guest sign-in notice for remote frameworks', async () => {
        isAuthenticated = false;

        await uploadZip({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });

        expect(
            screen.getByText(
                'new_diagram_dialog.import_schema.project.sign_in_to_import_framework'
            )
        ).toBeInTheDocument();
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
            <TooltipProvider>
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
            </TooltipProvider>
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

    it('blocks diagram JSON import in existing diagram mode', () => {
        renderExistingImportSchemaStep({
            scriptResult: diagramJsonSample,
        });

        expect(
            screen.getByRole('button', {
                name: 'import_database_dialog.import_schema.import',
            })
        ).toBeDisabled();
    });

    it('blocks ambiguous SQL import until the DBMS is chosen explicitly', async () => {
        const user = userEvent.setup();
        const { onContinue } = renderExistingImportSchemaStep({
            scriptResult: genericAmbiguousSql,
        });

        const importButton = screen.getByRole('button', {
            name: 'import_database_dialog.import_schema.import',
        });

        expect(importButton).toBeDisabled();

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));

        expect(importButton).toBeEnabled();

        await user.click(importButton);

        expect(onContinue).toHaveBeenCalledWith({
            importMethod: 'ddl',
            resolvedSourceDialect: DatabaseType.POSTGRESQL,
        });
    });
});
