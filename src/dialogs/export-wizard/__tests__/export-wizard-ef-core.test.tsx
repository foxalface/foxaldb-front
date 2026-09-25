import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { ApiError } from '@/lib/api/client';
import type { EfCoreExportResponse } from '@/lib/api/ef-core-export-types';
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
import { DEFAULT_EF_CORE_DB_CONTEXT_NAME } from '@/lib/export/ef-core-export-constants';

const { exportEfCoreProjectMock } = vi.hoisted(() => ({
    exportEfCoreProjectMock: vi.fn(),
}));

vi.mock('@/lib/api/ef-core-export', () => ({
    exportEfCoreProject: exportEfCoreProjectMock,
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
        filter: { tableIds: [], schemas: [] },
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
        t: (key: string, options?: { provider?: string; count?: number }) => {
            if (options?.provider) {
                return `${key}:${options.provider}`;
            }

            if (options?.count !== undefined) {
                return `${key}:${options.count}`;
            }

            return key;
        },
    }),
}));

const mockedDownloadBlob = vi.mocked(downloadBlob);

const successResponse = (
    overrides: Partial<Extract<EfCoreExportResponse, { success: true }>> = {}
): Extract<EfCoreExportResponse, { success: true }> => ({
    success: true,
    filename: 'my-diagram-ef-core.zip',
    files: [
        { path: 'README.md', content: 'UseNpgsql' },
        { path: 'Models/Users.cs', content: 'public class Users {}' },
    ],
    notes: [
        {
            code: 'view_skipped',
            message: 'Views are not exported.',
            path: 'analytics.daily_stats',
        },
    ],
    ...overrides,
});

const openEfCoreBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', {
            name: 'export_wizard.targets.ef_core.title',
        })
    );
};

describe('EF Core export target availability', () => {
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
        DatabaseType.SQL_SERVER,
        DatabaseType.SQLITE,
        DatabaseType.MYSQL,
    ] as const;

    for (const databaseType of supportedTypes) {
        it(`hides EF Core for guests on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'ef_core',
                    guestContext(databaseType)
                )
            ).toEqual({ status: 'hidden' });
        });

        it(`marks EF Core as available for authenticated users on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'ef_core',
                    authenticatedContext(databaseType)
                )
            ).toEqual({ status: 'available' });
        });
    }

    const unsupportedTypes = [
        DatabaseType.MARIADB,
        DatabaseType.ORACLE,
        DatabaseType.COCKROACHDB,
        DatabaseType.CLICKHOUSE,
        DatabaseType.GENERIC,
    ] as const;

    for (const databaseType of unsupportedTypes) {
        it(`hides EF Core for guests on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'ef_core',
                    guestContext(databaseType)
                )
            ).toEqual({ status: 'hidden' });
        });

        it(`disables EF Core for authenticated users on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'ef_core',
                    authenticatedContext(databaseType)
                )
            ).toEqual({
                status: 'disabled',
                reasonKey: 'export_wizard.ef_core.unsupported_database',
            });
        });
    }

    it('does not require a backend diagram ID for authenticated EF Core availability', () => {
        expect(
            getExportTargetAvailability(
                'ef_core',
                authenticatedContext(DatabaseType.POSTGRESQL, 'guest-diagram-1')
            )
        ).toEqual({ status: 'available' });
    });
});

describe('ExportWizardDialog EF Core branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = true;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
        exportEfCoreProjectMock.mockResolvedValue(successResponse());
    });

    it('enters the EF Core step when EF Core is selected', async () => {
        await openEfCoreBranch();

        expect(
            screen.getByTestId('export-ef-core-options-step')
        ).toBeInTheDocument();
        await waitFor(() => {
            expect(exportEfCoreProjectMock).toHaveBeenCalledTimes(1);
        });
        expect(
            screen.queryByTestId('export-prisma-version-step')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('prisma-version-7')
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('export_wizard.targets.ef_core.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-ef-core-branch-context')
        ).not.toBeInTheDocument();
    });

    it('defaults DbContext to AppDbContext and namespace from the diagram name', async () => {
        await openEfCoreBranch();

        expect(screen.getByTestId('ef-core-db-context-input')).toHaveValue(
            DEFAULT_EF_CORE_DB_CONTEXT_NAME
        );
        expect(screen.getByTestId('ef-core-namespace-input')).toHaveValue(
            'MyDiagram'
        );
    });

    it('shows provider context in the description and export info tooltip', async () => {
        await openEfCoreBranch();

        expect(
            screen.getByText(
                'export_wizard.ef_core.options_step.description:PostgreSQL'
            )
        ).toBeInTheDocument();
        expect(screen.getByTestId('ef-core-export-info')).toBeInTheDocument();
        expect(
            screen.getByTestId('ef-core-namespace-info')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('ef-core-db-context-info')
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'export_wizard.ef_core.options_step.migrations_not_generated'
            )
        ).not.toBeInTheDocument();
    });

    it('auto-starts export with default namespace and DbContext', async () => {
        await openEfCoreBranch();

        await waitFor(() => {
            expect(exportEfCoreProjectMock).toHaveBeenCalledTimes(1);
        });

        expect(exportEfCoreProjectMock).toHaveBeenCalledWith({
            diagram: chartDbState.currentDiagram,
            namespace: 'MyDiagram',
            dbContextName: DEFAULT_EF_CORE_DB_CONTEXT_NAME,
        });
    });

    it('omits blank namespace and DbContext from a manual re-export', async () => {
        exportEfCoreProjectMock.mockResolvedValueOnce(successResponse());

        await openEfCoreBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-file-list')
            ).toBeInTheDocument();
        });

        await userEvent.clear(screen.getByTestId('ef-core-namespace-input'));
        await userEvent.clear(screen.getByTestId('ef-core-db-context-input'));
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

        await waitFor(() => {
            expect(exportEfCoreProjectMock).toHaveBeenLastCalledWith({
                diagram: chartDbState.currentDiagram,
                namespace: '',
                dbContextName: '',
            });
        });
    });

    it('invokes the API once with the live canonical diagram on entry', async () => {
        await openEfCoreBranch();

        await waitFor(() => {
            expect(exportEfCoreProjectMock).toHaveBeenCalledTimes(1);
        });

        expect(exportEfCoreProjectMock.mock.calls[0]?.[0]?.diagram).toBe(
            chartDbState.currentDiagram
        );
    });

    it('does not send a second request while the initial export is pending', async () => {
        let resolveExport: ((value: EfCoreExportResponse) => void) | undefined;
        exportEfCoreProjectMock.mockImplementationOnce(
            () =>
                new Promise<EfCoreExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openEfCoreBranch();

        expect(exportEfCoreProjectMock).toHaveBeenCalledTimes(1);
        expect(
            screen.getByTestId('export-ef-core-generating')
        ).toBeInTheDocument();

        resolveExport?.(successResponse());

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-file-list')
            ).toBeInTheDocument();
        });
    });

    it('shows a successful result with files and notes', async () => {
        await openEfCoreBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-file-list')
            ).toBeInTheDocument();
        });

        expect(
            screen.getByTestId('export-ef-core-options-step')
        ).toBeInTheDocument();

        const fileList = screen.getByTestId('export-ef-core-file-list');
        expect(fileList).toHaveTextContent('README.md');
        expect(fileList).toHaveTextContent('Models');
        expect(fileList).toHaveTextContent('Users.cs');
        expect(screen.getByTestId('export-ef-core-notes')).toHaveTextContent(
            'Views are not exported.'
        );
        expect(screen.getByTestId('export-ef-core-notes')).toHaveTextContent(
            'analytics.daily_stats'
        );
    });

    it('downloads a ZIP using the backend filename and application/zip MIME', async () => {
        await openEfCoreBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-download-zip')
            ).toBeInTheDocument();
        });

        await userEvent.click(
            screen.getByTestId('export-ef-core-download-zip')
        );

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('my-diagram-ef-core.zip');
        expect(blob.type).toBe('application/zip');

        const bytes = new Uint8Array(await blob.arrayBuffer());
        const unzipped = unzipSync(bytes);
        expect(strFromU8(unzipped['README.md']!)).toBe('UseNpgsql');
        expect(strFromU8(unzipped['Models/Users.cs']!)).toBe(
            'public class Users {}'
        );
    });

    it('displays backend semantic failures on the options step', async () => {
        exportEfCoreProjectMock.mockResolvedValueOnce({
            success: false,
            error: {
                code: 'empty_diagram',
                message: 'The diagram has no exportable tables.',
            },
        });

        await openEfCoreBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-error')
            ).toHaveTextContent('The diagram has no exportable tables.');
        });

        expect(screen.getByTestId('export-ef-core-error')).toHaveAttribute(
            'data-error-kind',
            'semantic'
        );
        expect(
            screen.queryByTestId('export-ef-core-file-list')
        ).not.toBeInTheDocument();
    });

    it('displays HTTP and network failures', async () => {
        exportEfCoreProjectMock.mockRejectedValueOnce(
            new Error('network down')
        );

        await openEfCoreBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-error')
            ).toHaveTextContent(
                'export_wizard.ef_core.options_step.error_unexpected'
            );
        });
    });

    it('displays a localized rate-limit error', async () => {
        exportEfCoreProjectMock.mockRejectedValueOnce(
            new ApiError('Too Many Requests', 429, {
                message: 'Too Many Requests',
            })
        );

        await openEfCoreBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-error')
            ).toHaveTextContent(
                'export_wizard.ef_core.options_step.error_rate_limited'
            );
        });
    });

    it('returns from the EF Core step to the picker after a successful export', async () => {
        await openEfCoreBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-file-list')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));
        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
    });

    it('resets EF Core state when the wizard is closed and reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.ef_core.title',
            })
        );
        await userEvent.clear(screen.getByTestId('ef-core-namespace-input'));
        await userEvent.type(
            screen.getByTestId('ef-core-namespace-input'),
            'Changed.Namespace'
        );

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.ef_core.title',
            })
        );
        expect(screen.getByTestId('ef-core-namespace-input')).toHaveValue(
            'MyDiagram'
        );
        expect(screen.getByTestId('ef-core-db-context-input')).toHaveValue(
            DEFAULT_EF_CORE_DB_CONTEXT_NAME
        );
    });

    it('ignores a stale response after navigating back', async () => {
        let resolveExport: ((value: EfCoreExportResponse) => void) | undefined;
        exportEfCoreProjectMock.mockImplementationOnce(
            () =>
                new Promise<EfCoreExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openEfCoreBranch();
        await userEvent.click(screen.getByText('export_wizard.back'));

        resolveExport?.(successResponse());

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-ef-core-file-list')
        ).not.toBeInTheDocument();
    });

    it('ignores a stale response after the dialog is closed', async () => {
        let resolveExport: ((value: EfCoreExportResponse) => void) | undefined;
        exportEfCoreProjectMock.mockImplementationOnce(
            () =>
                new Promise<EfCoreExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.ef_core.title',
            })
        );
        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        resolveExport?.(successResponse());
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-ef-core-file-list')
        ).not.toBeInTheDocument();
    });

    it('does not enter options for an unsupported provider', async () => {
        chartDbState.databaseType = DatabaseType.MARIADB;
        chartDbState.currentDiagram = buildSimpleDiagram(DatabaseType.MARIADB);

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const button = screen.getByRole('button', {
            name: 'export_wizard.targets.ef_core.title',
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
            screen.queryByTestId('export-ef-core-options-step')
        ).not.toBeInTheDocument();
    });

    it('rejects an unsafe ZIP path on download without creating a dangerous archive', async () => {
        exportEfCoreProjectMock.mockResolvedValueOnce(
            successResponse({
                files: [{ path: '../evil.cs', content: 'bad' }],
                notes: [],
            })
        );

        await openEfCoreBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-download-zip')
            ).toBeInTheDocument();
        });

        await userEvent.click(
            screen.getByTestId('export-ef-core-download-zip')
        );

        expect(mockedDownloadBlob).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-ef-core-download-error')
        ).toHaveTextContent(
            'export_wizard.ef_core.result_step.error_unsafe_path'
        );
    });
});

describe('ExportWizardDialog EF Core picker availability', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
    });

    it('hides EF Core for guests', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.ef_core.title')
        ).not.toBeInTheDocument();
    });

    it('enables EF Core for authenticated users on PostgreSQL and MySQL', () => {
        authState.isAuthenticated = true;

        const { unmount } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );
        expect(
            screen.getByRole('button', {
                name: 'export_wizard.targets.ef_core.title',
            })
        ).not.toBeDisabled();
        unmount();

        chartDbState.databaseType = DatabaseType.MYSQL;
        chartDbState.currentDiagram = buildSimpleDiagram(DatabaseType.MYSQL);
        render(<ExportWizardDialog dialog={{ open: true }} />);
        expect(
            screen.getByRole('button', {
                name: 'export_wizard.targets.ef_core.title',
            })
        ).not.toBeDisabled();
    });
});
