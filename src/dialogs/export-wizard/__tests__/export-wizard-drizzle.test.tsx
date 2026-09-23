import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { ApiError } from '@/lib/api/client';
import type { TFunction } from 'i18next';
import type { DrizzleExportResponse } from '@/lib/api/drizzle-export-types';
import { downloadBlob } from '@/lib/download-blob';
import { getExportTargetAvailability } from '../export-target-availability';
import {
    makeDiagram,
    makeField,
    makeTable,
    resetIdCounter,
    typeRef,
} from './prisma-test-helpers';
import type { Diagram } from '@/lib/domain/diagram';

const { exportDrizzleProjectMock } = vi.hoisted(() => ({
    exportDrizzleProjectMock: vi.fn(),
}));

vi.mock('@/lib/api/drizzle-export', () => ({
    exportDrizzleProject: exportDrizzleProjectMock,
}));

const dialogMocks = {
    closeExportWizardDialog: vi.fn(),
    openExportSQLDialog: vi.fn(),
    openExportDiagramDialog: vi.fn(),
};

const authState = {
    isAuthenticated: false,
};

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const buildSimpleDiagram = (
    databaseType: DatabaseType,
    overrides: Partial<Diagram> = {}
): Diagram =>
    makeDiagram({
        id: 'guest-diagram-1',
        name: 'My Diagram',
        databaseType,
        tables: [
            makeTable({
                name: 'users',
                fields: [
                    makeField({
                        name: 'id',
                        type: typeRef('integer'),
                        primaryKey: true,
                        increment: true,
                    }),
                ],
            }),
        ],
        createdAt,
        updatedAt: createdAt,
        ...overrides,
    });

const chartDbState = {
    databaseType: DatabaseType.POSTGRESQL,
    currentDiagram: buildSimpleDiagram(DatabaseType.POSTGRESQL),
};

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => dialogMocks,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartDbState,
}));

vi.mock('@/hooks/use-export-image', () => ({
    useExportImage: () => ({
        exportImage: vi.fn(),
    }),
}));

vi.mock('@/context/diagram-filter-context/use-diagram-filter', () => ({
    useDiagramFilter: () => ({
        filter: { tableIds: ['hidden-table'], schemas: ['hidden'] },
    }),
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({
        effectiveTheme: 'light',
    }),
}));

vi.mock('@/lib/download-blob', () => ({
    downloadBlob: vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
            if (
                key.startsWith('export_wizard.drizzle.result_step.notes.') &&
                options
            ) {
                const serialized = Object.entries(options)
                    .map(([token, value]) => `${token}=${String(value)}`)
                    .join(',');
                return `${key}[${serialized}]`;
            }

            if (options?.provider) {
                return `${key}:${String(options.provider)}`;
            }

            if (options?.orm || options?.kit) {
                return `${key}:${String(options.orm ?? '')}/${String(options.kit ?? '')}`;
            }

            if (options?.path) {
                return `${key}[path=${String(options.path)}]`;
            }

            if (options?.count !== undefined) {
                return `${key}:${String(options.count)}`;
            }

            if (key.startsWith('export_wizard.drizzle.result_step.errors.')) {
                if (options?.path) {
                    return `${key}[path=${String(options.path)}]`;
                }

                return `localized:${key}`;
            }

            return key;
        },
    }),
}));

const mockedDownloadBlob = vi.mocked(downloadBlob);

const successResponse = (
    overrides: Partial<Extract<DrizzleExportResponse, { success: true }>> = {}
): Extract<DrizzleExportResponse, { success: true }> => ({
    success: true,
    filename: 'my-diagram-drizzle.zip',
    files: [
        { path: 'README.md', content: '# Drizzle' },
        {
            path: 'schema.ts',
            content: 'export const users = pgTable("users");',
        },
        {
            path: 'drizzle.config.ts',
            content: 'export default { dialect: "postgresql" };',
        },
    ],
    notes: [
        {
            code: 'schema_ignored_sqlite',
            message: 'SENTINEL English schema note',
            path: 'users',
            metadata: {
                schema: 'ignored',
            },
        },
    ],
    ...overrides,
});

const openDrizzleBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', {
            name: 'export_wizard.targets.drizzle.title',
        })
    );
};

describe('Drizzle export target availability', () => {
    const guestContext = (databaseType: DatabaseType) => ({
        isAuthenticated: false,
        diagramId: 'guest-diagram-1',
        databaseType,
    });

    const authenticatedContext = (
        databaseType: DatabaseType,
        diagramId: unknown = 'guest-diagram-1'
    ) => ({
        isAuthenticated: true,
        diagramId,
        databaseType,
    });

    const supportedTypes = [
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
    ] as const;

    for (const databaseType of supportedTypes) {
        it(`hides Drizzle for guests on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'drizzle',
                    guestContext(databaseType)
                )
            ).toEqual({ status: 'hidden' });
        });

        it(`marks Drizzle as available for authenticated users on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'drizzle',
                    authenticatedContext(databaseType)
                )
            ).toEqual({ status: 'available' });
        });
    }

    const unsupportedTypes = [
        DatabaseType.SQL_SERVER,
        DatabaseType.ORACLE,
        DatabaseType.COCKROACHDB,
        DatabaseType.CLICKHOUSE,
        DatabaseType.GENERIC,
    ] as const;

    for (const databaseType of unsupportedTypes) {
        it(`hides Drizzle for guests on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'drizzle',
                    guestContext(databaseType)
                )
            ).toEqual({ status: 'hidden' });
        });

        it(`disables Drizzle for authenticated users on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'drizzle',
                    authenticatedContext(databaseType)
                )
            ).toEqual({
                status: 'disabled',
                reasonKey: 'export_wizard.drizzle.unsupported_database',
            });
        });
    }

    it('does not require a backend diagram ID or paid plan for authenticated Drizzle availability', () => {
        expect(
            getExportTargetAvailability(
                'drizzle',
                authenticatedContext(DatabaseType.POSTGRESQL, 'guest-diagram-1')
            )
        ).toEqual({ status: 'available' });
    });
});

describe('ExportWizardDialog Drizzle branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = true;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
        exportDrizzleProjectMock.mockResolvedValue(successResponse());
    });

    it('enters the Drizzle result step immediately with no version or provider selector', async () => {
        await openDrizzleBranch();

        expect(
            screen.getByTestId('export-drizzle-result-step')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-prisma-version-step')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('export-ef-core-options-step')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('prisma-version-7')
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(
            screen.getByText('export_wizard.targets.drizzle.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-drizzle-branch-context')
        ).not.toBeInTheDocument();
    });

    it('shows static Drizzle version information and the inferred provider', async () => {
        await openDrizzleBranch();

        expect(screen.getByTestId('export-drizzle-version')).toHaveTextContent(
            'export_wizard.drizzle.result_step.drizzle_version:^0.45/^0.31'
        );
        expect(screen.getByTestId('export-drizzle-provider')).toHaveTextContent(
            'export_wizard.drizzle.result_step.provider_label:PostgreSQL'
        );
        expect(
            screen.getByTestId('export-drizzle-package-type')
        ).toHaveTextContent('export_wizard.drizzle.result_step.package_type');
        expect(
            screen.getByTestId('export-drizzle-package-type').textContent
        ).not.toContain('`');
        expect(
            screen.getByText('export_wizard.drizzle.result_step.explanation')
        ).toBeInTheDocument();
    });

    it('sends the full current live Diagram and no extra options', async () => {
        await openDrizzleBranch();

        await waitFor(() => {
            expect(exportDrizzleProjectMock).toHaveBeenCalledTimes(1);
        });

        expect(exportDrizzleProjectMock).toHaveBeenCalledWith({
            diagram: chartDbState.currentDiagram,
        });
        expect(exportDrizzleProjectMock.mock.calls[0]?.[0]?.diagram).toBe(
            chartDbState.currentDiagram
        );
        expect(exportDrizzleProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'version'
        );
        expect(exportDrizzleProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'diagramId'
        );
        expect(exportDrizzleProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'provider'
        );
    });

    it('shows a loading state and prevents duplicate submissions', async () => {
        let resolveExport: ((value: DrizzleExportResponse) => void) | undefined;
        exportDrizzleProjectMock.mockImplementationOnce(
            () =>
                new Promise<DrizzleExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openDrizzleBranch();

        expect(
            screen.getByTestId('export-drizzle-generating')
        ).toBeInTheDocument();
        expect(exportDrizzleProjectMock).toHaveBeenCalledTimes(1);
        expect(
            screen.queryByTestId('export-drizzle-retry')
        ).not.toBeInTheDocument();

        resolveExport?.(successResponse());

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-result-success')
            ).toBeInTheDocument();
        });
        expect(exportDrizzleProjectMock).toHaveBeenCalledTimes(1);
    });

    it('shows a successful result with file count, paths, and notes', async () => {
        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-result-success')
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                'export_wizard.drizzle.result_step.generated_files:3'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-drizzle-file-list')
        ).toHaveTextContent('README.md');
        expect(
            screen.getByTestId('export-drizzle-file-list')
        ).toHaveTextContent('schema.ts');
        expect(
            screen.getByTestId('export-drizzle-file-list')
        ).toHaveTextContent('drizzle.config.ts');
        expect(
            screen.queryByTestId('export-drizzle-warnings')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('export-drizzle-adaptations-toggle')
        ).toHaveTextContent(
            'export_wizard.drizzle.result_step.adaptations_heading:1'
        );
    });

    it('renders optional FoxalDB-NOTES.md when the backend returned it', async () => {
        exportDrizzleProjectMock.mockResolvedValueOnce(
            successResponse({
                files: [
                    { path: 'README.md', content: '# Drizzle' },
                    { path: 'FoxalDB-NOTES.md', content: 'notes' },
                    { path: 'schema.ts', content: 'export const users = {};' },
                    {
                        path: 'drizzle.config.ts',
                        content: 'export default {};',
                    },
                ],
            })
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-file-list')
            ).toHaveTextContent('FoxalDB-NOTES.md');
        });
        expect(
            screen.getByText(
                'export_wizard.drizzle.result_step.generated_files:4'
            )
        ).toBeInTheDocument();
    });

    it('expands technical adaptations on demand and renders path separately', async () => {
        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-adaptations-toggle')
            ).toBeInTheDocument();
        });

        await userEvent.click(
            screen.getByTestId('export-drizzle-adaptations-toggle')
        );

        expect(
            screen.getByTestId('export-drizzle-adaptations-list')
        ).toHaveTextContent(
            'export_wizard.drizzle.result_step.notes.schema_ignored_sqlite[path=users,schema=ignored]'
        );
        expect(
            screen.getByTestId('export-drizzle-note-path')
        ).toHaveTextContent(
            'export_wizard.drizzle.result_step.path_label[path=users]'
        );
        expect(
            screen.getByTestId('export-drizzle-adaptations-list').textContent
        ).not.toContain('SENTINEL English schema note');
    });

    it('falls back to backend message for unknown note codes', async () => {
        exportDrizzleProjectMock.mockResolvedValueOnce(
            successResponse({
                notes: [
                    {
                        code: 'future_note_code',
                        message: 'Future backend-only note.',
                    },
                ],
            })
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-result-success')
            ).toBeInTheDocument();
        });

        expect(screen.getByTestId('export-drizzle-warnings')).toHaveTextContent(
            'Future backend-only note.'
        );
        expect(
            screen.queryByTestId('export-drizzle-adaptations')
        ).not.toBeInTheDocument();
    });

    it('separates mixed warnings and adaptations and hides empty groups', async () => {
        exportDrizzleProjectMock.mockResolvedValueOnce(
            successResponse({
                notes: [
                    {
                        code: 'index_omitted',
                        message: 'Index omitted.',
                        path: 'items.payload_gin',
                        metadata: {
                            reason: 'unsupported_method',
                            indexType: 'gist',
                        },
                    },
                    {
                        code: 'mariadb_mysql_dialect_adapted',
                        message: 'MariaDB adapted.',
                        metadata: { dialect: 'mysql' },
                    },
                ],
            })
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-warnings')
            ).toBeInTheDocument();
        });

        expect(
            screen.getByTestId('export-drizzle-warnings-list')
        ).toHaveTextContent(
            'export_wizard.drizzle.result_step.notes.index_omitted.unsupported_method[path=items.payload_gin,indexType=gist]'
        );
        expect(
            screen.getByTestId('export-drizzle-adaptations-toggle')
        ).toHaveTextContent(
            'export_wizard.drizzle.result_step.adaptations_heading:1'
        );

        await userEvent.click(
            screen.getByTestId('export-drizzle-adaptations-toggle')
        );

        expect(
            screen.getByTestId('export-drizzle-adaptations-list')
        ).toHaveTextContent(
            'export_wizard.drizzle.result_step.notes.mariadb_mysql_dialect_adapted[dialect=mysql]'
        );
    });

    it('renders localized French QA notes on the result step', async () => {
        const { getDrizzleExportNotePresentation } =
            await import('../drizzle/get-drizzle-export-note-presentation');
        const { fr } = await import('@/i18n/locales/fr');

        const frenchT = ((key: string, options?: Record<string, unknown>) => {
            const notesRoot = 'export_wizard.drizzle.result_step.notes';
            if (!key.startsWith(notesRoot)) {
                return key;
            }

            const relativeKey = key.slice(notesRoot.length + 1);
            let current: unknown =
                fr.translation.export_wizard.drizzle.result_step.notes;

            for (const segment of relativeKey.split('.')) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(segment in current)
                ) {
                    return key;
                }

                current = (current as Record<string, unknown>)[segment];
            }

            if (typeof current !== 'string') {
                return key;
            }

            return current.replace(
                /\{\{(\w+)\}\}/g,
                (_match, token: string) => {
                    const value = options?.[token];
                    return value === undefined || value === null
                        ? ''
                        : String(value);
                }
            );
        }) as TFunction;

        const qaNote = {
            code: 'mariadb_mysql_dialect_adapted',
            message:
                'MariaDB is exported using Drizzle MySQL APIs (dialect "mysql").',
            metadata: { dialect: 'mysql' },
        };

        const localized = getDrizzleExportNotePresentation(
            qaNote,
            frenchT
        ).message;

        expect(localized).not.toBe(qaNote.message);
        expect(localized).toContain('mysql');
    });

    it('downloads a ZIP using the backend filename and application/zip MIME', async () => {
        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-download-zip')
            ).toBeInTheDocument();
        });

        await userEvent.click(
            screen.getByTestId('export-drizzle-download-zip')
        );

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('my-diagram-drizzle.zip');
        expect(blob.type).toBe('application/zip');

        const bytes = new Uint8Array(await blob.arrayBuffer());
        const unzipped = unzipSync(bytes);
        expect(strFromU8(unzipped['README.md']!)).toBe('# Drizzle');
        expect(strFromU8(unzipped['schema.ts']!)).toBe(
            'export const users = pgTable("users");'
        );
        expect(strFromU8(unzipped['drizzle.config.ts']!)).toBe(
            'export default { dialect: "postgresql" };'
        );
        expect(Object.keys(unzipped)).toHaveLength(3);
    });

    it('displays backend semantic failures on the result step', async () => {
        exportDrizzleProjectMock.mockResolvedValueOnce({
            success: false,
            error: {
                code: 'empty_diagram',
                message: 'The diagram has no exportable tables.',
            },
        });

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-error')
            ).toHaveTextContent(
                'localized:export_wizard.drizzle.result_step.errors.empty_diagram'
            );
        });
        expect(screen.getByTestId('export-drizzle-retry')).toBeInTheDocument();
    });

    it('shows localized catalog collision errors with path', async () => {
        exportDrizzleProjectMock.mockResolvedValueOnce({
            success: false,
            error: {
                code: 'mysql_catalog_collision',
                message: 'SENTINEL English collision',
                path: 'users',
            },
        });

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-error')
            ).toHaveTextContent(
                'export_wizard.drizzle.result_step.errors.mysql_catalog_collision[path=users]'
            );
        });
        expect(
            screen.getByTestId('export-drizzle-error-path')
        ).toHaveTextContent(
            'export_wizard.drizzle.result_step.path_label[path=users]'
        );
        expect(
            screen.getByTestId('export-drizzle-error').textContent
        ).not.toContain('SENTINEL English collision');
    });

    it('retries after a semantic failure with the current Diagram', async () => {
        exportDrizzleProjectMock.mockResolvedValueOnce({
            success: false,
            error: {
                code: 'empty_diagram',
                message: 'The diagram has no exportable tables.',
            },
        });

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-retry')
            ).toBeInTheDocument();
        });

        const updatedDiagram = buildSimpleDiagram(DatabaseType.POSTGRESQL, {
            name: 'Updated Diagram',
        });
        chartDbState.currentDiagram = updatedDiagram;
        exportDrizzleProjectMock.mockResolvedValueOnce(successResponse());
        await userEvent.click(screen.getByTestId('export-drizzle-retry'));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-result-success')
            ).toBeInTheDocument();
        });

        expect(exportDrizzleProjectMock).toHaveBeenCalledTimes(2);
        expect(exportDrizzleProjectMock).toHaveBeenLastCalledWith({
            diagram: updatedDiagram,
        });
    });

    it('displays HTTP 401 failures with session wording', async () => {
        exportDrizzleProjectMock.mockRejectedValueOnce(
            new ApiError('Unauthenticated', 401, { message: 'Unauthenticated' })
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-error')
            ).toHaveTextContent(
                'export_wizard.drizzle.result_step.error_unauthenticated'
            );
        });
    });

    it('displays HTTP 422 failures with invalid request wording', async () => {
        exportDrizzleProjectMock.mockRejectedValueOnce(
            new ApiError('The diagram field is required.', 422, {
                message: 'The diagram field is required.',
            })
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-error')
            ).toHaveTextContent(
                'export_wizard.drizzle.result_step.error_invalid_request'
            );
        });
    });

    it('displays a localized rate-limit error', async () => {
        exportDrizzleProjectMock.mockRejectedValueOnce(
            new ApiError('Too Many Requests', 429, {
                message: 'Too Many Requests',
            })
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-error')
            ).toHaveTextContent(
                'export_wizard.drizzle.result_step.error_rate_limited'
            );
        });
    });

    it('displays HTTP 500 failures with server wording', async () => {
        exportDrizzleProjectMock.mockRejectedValueOnce(
            new ApiError('Server Error', 500, { message: 'Server Error' })
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-error')
            ).toHaveTextContent(
                'export_wizard.drizzle.result_step.error_unexpected'
            );
        });
    });

    it('displays network failures with connection wording', async () => {
        exportDrizzleProjectMock.mockRejectedValueOnce(
            new TypeError('Failed to fetch')
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-error')
            ).toHaveTextContent(
                'export_wizard.drizzle.result_step.error_network'
            );
        });
    });

    it('returns from the result step to the target picker', async () => {
        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-result-step')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));
        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-drizzle-result-step')
        ).not.toBeInTheDocument();
    });

    it('resets Drizzle state when the wizard is closed and reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.drizzle.title',
            })
        );

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-result-success')
            ).toBeInTheDocument();
        });

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByTestId('export-drizzle-result-step')
        ).not.toBeInTheDocument();

        exportDrizzleProjectMock.mockClear();
        exportDrizzleProjectMock.mockResolvedValueOnce(successResponse());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.drizzle.title',
            })
        );

        await waitFor(() => {
            expect(exportDrizzleProjectMock).toHaveBeenCalledTimes(1);
        });
    });

    it('ignores a stale response after navigating back', async () => {
        let resolveExport: ((value: DrizzleExportResponse) => void) | undefined;
        exportDrizzleProjectMock.mockImplementationOnce(
            () =>
                new Promise<DrizzleExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openDrizzleBranch();
        await userEvent.click(screen.getByText('export_wizard.back'));

        resolveExport?.(successResponse());

        expect(
            screen.queryByTestId('export-drizzle-result-success')
        ).not.toBeInTheDocument();
    });

    it('does not enter the Drizzle flow for an unsupported provider', async () => {
        chartDbState.databaseType = DatabaseType.SQL_SERVER;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.SQL_SERVER
        );

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const button = screen.getByRole('button', {
            name: 'export_wizard.targets.drizzle.title',
        });

        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(
            within(button).getByText(
                'export_wizard.targets.unsupported_framework'
            )
        ).toBeInTheDocument();

        if (button) {
            await userEvent.click(button);
        }

        expect(
            screen.queryByTestId('export-drizzle-result-step')
        ).not.toBeInTheDocument();
        expect(exportDrizzleProjectMock).not.toHaveBeenCalled();
    });

    it('rejects an unsafe ZIP path on download without creating a dangerous archive', async () => {
        exportDrizzleProjectMock.mockResolvedValueOnce(
            successResponse({
                files: [{ path: '../evil.ts', content: 'bad' }],
                notes: [],
            })
        );

        await openDrizzleBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-drizzle-download-zip')
            ).toBeInTheDocument();
        });

        await userEvent.click(
            screen.getByTestId('export-drizzle-download-zip')
        );

        expect(mockedDownloadBlob).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-drizzle-download-error')
        ).toHaveTextContent(
            'export_wizard.drizzle.result_step.error_unsafe_path'
        );
    });
});

describe('ExportWizardDialog Drizzle picker availability', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
    });

    it('hides Drizzle for guests so they cannot enter the flow', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.drizzle.title')
        ).not.toBeInTheDocument();
    });

    it('enables Drizzle for authenticated users on PostgreSQL, MySQL, MariaDB, and SQLite', () => {
        authState.isAuthenticated = true;

        const types = [
            DatabaseType.POSTGRESQL,
            DatabaseType.MYSQL,
            DatabaseType.MARIADB,
            DatabaseType.SQLITE,
        ];

        for (const databaseType of types) {
            chartDbState.databaseType = databaseType;
            chartDbState.currentDiagram = buildSimpleDiagram(databaseType);
            const { unmount } = render(
                <ExportWizardDialog dialog={{ open: true }} />
            );
            expect(
                screen.getByRole('button', {
                    name: 'export_wizard.targets.drizzle.title',
                })
            ).not.toBeDisabled();
            unmount();
        }
    });
});
