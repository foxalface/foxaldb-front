import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
        screen.getByText('export_wizard.targets.ef_core.title')
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

    it('enters the EF Core options step when EF Core is selected', async () => {
        await openEfCoreBranch();

        expect(
            screen.getByTestId('export-ef-core-options-step')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-prisma-version-step')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('prisma-version-7')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('export-ef-core-branch-context')
        ).toHaveTextContent(
            'export_wizard.title → export_wizard.targets.ef_core.title'
        );
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

    it('shows static EF Core 10 information and the inferred provider', async () => {
        await openEfCoreBranch();

        expect(
            screen.getByTestId('export-ef-core-version-info')
        ).toHaveTextContent('export_wizard.ef_core.options_step.ef_core_10');
        expect(screen.getByTestId('export-ef-core-provider')).toHaveTextContent(
            'export_wizard.ef_core.options_step.provider_label:PostgreSQL'
        );
        expect(
            screen.getByText(
                'export_wizard.ef_core.options_step.migrations_not_generated'
            )
        ).toBeInTheDocument();
    });

    it('omits blank namespace and DbContext from the API request', async () => {
        await openEfCoreBranch();

        await userEvent.clear(screen.getByTestId('ef-core-namespace-input'));
        await userEvent.clear(screen.getByTestId('ef-core-db-context-input'));
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

        await waitFor(() => {
            expect(exportEfCoreProjectMock).toHaveBeenCalledWith({
                diagram: chartDbState.currentDiagram,
                namespace: '',
                dbContextName: '',
            });
        });
    });

    it('invokes the API once with the live canonical diagram', async () => {
        await openEfCoreBranch();
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

        await waitFor(() => {
            expect(exportEfCoreProjectMock).toHaveBeenCalledTimes(1);
        });

        expect(exportEfCoreProjectMock).toHaveBeenCalledWith({
            diagram: chartDbState.currentDiagram,
            namespace: 'MyDiagram',
            dbContextName: DEFAULT_EF_CORE_DB_CONTEXT_NAME,
        });
    });

    it('does not send a second request when Export is clicked twice', async () => {
        let resolveExport: ((value: EfCoreExportResponse) => void) | undefined;
        exportEfCoreProjectMock.mockImplementationOnce(
            () =>
                new Promise<EfCoreExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openEfCoreBranch();
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

        expect(exportEfCoreProjectMock).toHaveBeenCalledTimes(1);
        expect(
            screen.getByTestId('export-ef-core-generating')
        ).toBeInTheDocument();

        resolveExport?.(successResponse());

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-result-step')
            ).toBeInTheDocument();
        });
    });

    it('shows a successful result with files and notes', async () => {
        await openEfCoreBranch();
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-result-step')
            ).toBeInTheDocument();
        });

        expect(
            screen.getByTestId('export-ef-core-result-success')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-ef-core-result-version')
        ).toHaveTextContent('export_wizard.ef_core.result_step.ef_core_10');
        expect(
            screen.getByTestId('export-ef-core-result-provider')
        ).toHaveTextContent(
            'export_wizard.ef_core.result_step.provider_label:PostgreSQL'
        );
        expect(
            screen.getByTestId('export-ef-core-file-list')
        ).toHaveTextContent('README.md');
        expect(
            screen.getByTestId('export-ef-core-file-list')
        ).toHaveTextContent('Models/Users.cs');
        expect(screen.getByTestId('export-ef-core-notes')).toHaveTextContent(
            'Views are not exported.'
        );
        expect(screen.getByTestId('export-ef-core-notes')).toHaveTextContent(
            'analytics.daily_stats'
        );
    });

    it('downloads a ZIP using the backend filename and application/zip MIME', async () => {
        await openEfCoreBranch();
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

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
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

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
            screen.queryByTestId('export-ef-core-result-step')
        ).not.toBeInTheDocument();
    });

    it('displays HTTP and network failures', async () => {
        exportEfCoreProjectMock.mockRejectedValueOnce(
            new Error('network down')
        );

        await openEfCoreBranch();
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

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
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-error')
            ).toHaveTextContent(
                'export_wizard.ef_core.options_step.error_rate_limited'
            );
        });
    });

    it('returns from the result step to options and from options to the picker', async () => {
        await openEfCoreBranch();
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-ef-core-result-step')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));
        expect(
            screen.getByTestId('export-ef-core-options-step')
        ).toBeInTheDocument();

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
            screen.getByText('export_wizard.targets.ef_core.title')
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
            screen.getByText('export_wizard.targets.ef_core.title')
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
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));
        await userEvent.click(screen.getByText('export_wizard.back'));

        resolveExport?.(successResponse());

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-ef-core-result-step')
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
            screen.getByText('export_wizard.targets.ef_core.title')
        );
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        resolveExport?.(successResponse());
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-ef-core-result-step')
        ).not.toBeInTheDocument();
    });

    it('does not enter options for an unsupported provider', async () => {
        chartDbState.databaseType = DatabaseType.MARIADB;
        chartDbState.currentDiagram = buildSimpleDiagram(DatabaseType.MARIADB);

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const button = screen
            .getByText('export_wizard.targets.ef_core.title')
            .closest('button');

        expect(button).toBeDisabled();
        expect(
            screen.getByText('export_wizard.ef_core.unsupported_database')
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
        await userEvent.click(screen.getByTestId('export-ef-core-submit'));

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
            screen
                .getByText('export_wizard.targets.ef_core.title')
                .closest('button')
        ).not.toBeDisabled();
        unmount();

        chartDbState.databaseType = DatabaseType.MYSQL;
        chartDbState.currentDiagram = buildSimpleDiagram(DatabaseType.MYSQL);
        render(<ExportWizardDialog dialog={{ open: true }} />);
        expect(
            screen
                .getByText('export_wizard.targets.ef_core.title')
                .closest('button')
        ).not.toBeDisabled();
    });
});
