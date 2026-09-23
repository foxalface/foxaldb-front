import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { ApiError } from '@/lib/api/client';
import type { TFunction } from 'i18next';
import type { RailsExportResponse } from '@/lib/api/rails-export-types';
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

const { exportRailsProjectMock } = vi.hoisted(() => ({
    exportRailsProjectMock: vi.fn(),
}));

vi.mock('@/lib/api/rails-export', () => ({
    exportRailsProject: exportRailsProjectMock,
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
            if (options?.provider) {
                return `${key}:${String(options.provider)}`;
            }

            if (options?.count !== undefined) {
                return `${key}:${String(options.count)}`;
            }

            if (
                key.startsWith('export_wizard.rails.result_step.notes.') &&
                options
            ) {
                const serialized = Object.entries(options)
                    .map(([token, value]) => `${token}=${String(value)}`)
                    .join(',');
                return `${key}[${serialized}]`;
            }

            return key;
        },
    }),
}));

const mockedDownloadBlob = vi.mocked(downloadBlob);

const successResponse = (
    overrides: Partial<Extract<RailsExportResponse, { success: true }>> = {}
): Extract<RailsExportResponse, { success: true }> => ({
    success: true,
    filename: 'my-diagram-rails.zip',
    files: [
        { path: 'README.md', content: '# Rails 8.1' },
        {
            path: 'app/models/user.rb',
            content: 'class User < ApplicationRecord; end',
        },
        {
            path: 'db/migrate/20240101120001_create_users.rb',
            content: 'class CreateUsers < ActiveRecord::Migration[8.1]; end',
        },
        {
            path: 'db/schema.rb',
            content: 'ActiveRecord::Schema[8.1].define {}',
        },
    ],
    notes: [
        {
            code: 'type_degraded',
            message: 'A type was degraded for this provider.',
            path: 'users.uuid',
            metadata: {
                reason: 'uuid_as_string',
            },
        },
    ],
    ...overrides,
});

const openRailsBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', {
            name: 'export_wizard.targets.rails.title',
        })
    );
};

describe('Rails export target availability', () => {
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
        it(`hides Rails for guests on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability('rails', guestContext(databaseType))
            ).toEqual({ status: 'hidden' });
        });

        it(`marks Rails as available for authenticated users on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'rails',
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
        it(`hides Rails for guests on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability('rails', guestContext(databaseType))
            ).toEqual({ status: 'hidden' });
        });

        it(`disables Rails for authenticated users on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'rails',
                    authenticatedContext(databaseType)
                )
            ).toEqual({
                status: 'disabled',
                reasonKey: 'export_wizard.rails.unsupported_database',
            });
        });
    }

    it('does not require a backend diagram ID or paid plan for authenticated Rails availability', () => {
        expect(
            getExportTargetAvailability(
                'rails',
                authenticatedContext(DatabaseType.POSTGRESQL, 'guest-diagram-1')
            )
        ).toEqual({ status: 'available' });
    });
});

describe('ExportWizardDialog Rails branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = true;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
        exportRailsProjectMock.mockResolvedValue(successResponse());
    });

    it('enters the Rails result step immediately with no version or options step', async () => {
        await openRailsBranch();

        expect(
            screen.getByTestId('export-rails-result-step')
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
            screen.getByText('export_wizard.targets.rails.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-rails-branch-context')
        ).not.toBeInTheDocument();
    });

    it('shows static Rails 8.1 information and the inferred provider', async () => {
        await openRailsBranch();

        expect(screen.getByTestId('export-rails-version')).toHaveTextContent(
            'export_wizard.rails.result_step.rails_8_1'
        );
        expect(screen.getByTestId('export-rails-provider')).toHaveTextContent(
            'export_wizard.rails.result_step.provider_label:PostgreSQL'
        );
        expect(
            screen.getByText('export_wizard.rails.result_step.explanation')
        ).toBeInTheDocument();
    });

    it('sends the full current live Diagram and no extra options', async () => {
        await openRailsBranch();

        await waitFor(() => {
            expect(exportRailsProjectMock).toHaveBeenCalledTimes(1);
        });

        expect(exportRailsProjectMock).toHaveBeenCalledWith({
            diagram: chartDbState.currentDiagram,
        });
        expect(exportRailsProjectMock.mock.calls[0]?.[0]?.diagram).toBe(
            chartDbState.currentDiagram
        );
        expect(
            exportRailsProjectMock.mock.calls[0]?.[0]?.diagram.tables
        ).toHaveLength(1);
        expect(exportRailsProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'version'
        );
        expect(exportRailsProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'diagramId'
        );
    });

    it('shows a loading state and prevents duplicate submissions', async () => {
        let resolveExport: ((value: RailsExportResponse) => void) | undefined;
        exportRailsProjectMock.mockImplementationOnce(
            () =>
                new Promise<RailsExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openRailsBranch();

        expect(
            screen.getByTestId('export-rails-generating')
        ).toBeInTheDocument();
        expect(exportRailsProjectMock).toHaveBeenCalledTimes(1);
        expect(
            screen.queryByTestId('export-rails-retry')
        ).not.toBeInTheDocument();

        resolveExport?.(successResponse());

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-result-success')
            ).toBeInTheDocument();
        });
        expect(exportRailsProjectMock).toHaveBeenCalledTimes(1);
    });

    it('shows a successful result with file count, paths, and notes', async () => {
        await openRailsBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-result-success')
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                'export_wizard.rails.result_step.generated_files:4'
            )
        ).toBeInTheDocument();
        expect(screen.getByTestId('export-rails-file-list')).toHaveTextContent(
            'README.md'
        );
        expect(screen.getByTestId('export-rails-file-list')).toHaveTextContent(
            'app/models/user.rb'
        );
        expect(screen.getByTestId('export-rails-file-list')).toHaveTextContent(
            'db/migrate/20240101120001_create_users.rb'
        );
        expect(screen.getByTestId('export-rails-file-list')).toHaveTextContent(
            'db/schema.rb'
        );
        expect(screen.getByTestId('export-rails-notes')).toHaveTextContent(
            'export_wizard.rails.result_step.notes.type_degraded.uuid_as_string[path=users.uuid]'
        );
        expect(screen.getByTestId('export-rails-notes')).toHaveTextContent(
            'users.uuid'
        );
    });

    it('falls back to backend message for unknown note codes', async () => {
        exportRailsProjectMock.mockResolvedValueOnce(
            successResponse({
                notes: [
                    {
                        code: 'future_note_code',
                        message: 'Future backend-only note.',
                    },
                ],
            })
        );

        await openRailsBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-result-success')
            ).toBeInTheDocument();
        });

        expect(screen.getByTestId('export-rails-notes')).toHaveTextContent(
            'Future backend-only note.'
        );
    });

    it('renders localized French QA notes on the result step', async () => {
        const { getRailsExportNotePresentation } =
            await import('../rails/get-rails-export-note-presentation');
        const { fr } = await import('@/i18n/locales/fr');

        const frenchT = ((key: string, options?: Record<string, unknown>) => {
            const notesRoot = 'export_wizard.rails.result_step.notes';
            if (!key.startsWith(notesRoot)) {
                return key;
            }

            const relativeKey = key.slice(notesRoot.length + 1);
            let current: unknown =
                fr.translation.export_wizard.rails.result_step.notes;

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

        const qaNotes = [
            {
                code: 'mysql_catalog_omitted',
                message:
                    'MySQL catalog "foxaldb" is omitted; Rails uses the connected database and unqualified table names.',
                metadata: { affectedPaths: ['foxaldb'] },
            },
            {
                code: 'model_name_adjusted',
                message:
                    'Model class for table "migrations" was allocated as MigrationRecord.',
                path: 'migrations',
                metadata: { className: 'MigrationRecord' },
            },
            {
                code: 'many_to_many_through_skipped',
                message:
                    'has_many :through was not generated for join table "diagram_members" because association names were ambiguous.',
                path: 'diagram_members',
            },
        ] as const;

        for (const qaNote of qaNotes) {
            const localized = getRailsExportNotePresentation(
                qaNote,
                frenchT
            ).message;

            expect(localized).not.toBe(qaNote.message);
        }

        expect(
            getRailsExportNotePresentation(qaNotes[0], frenchT).message
        ).toContain('foxaldb');
        expect(
            getRailsExportNotePresentation(qaNotes[1], frenchT).message
        ).toContain('migrations');
        expect(
            getRailsExportNotePresentation(qaNotes[1], frenchT).message
        ).toContain('MigrationRecord');
        expect(
            getRailsExportNotePresentation(qaNotes[2], frenchT).message
        ).toContain('diagram_members');
        expect(
            getRailsExportNotePresentation(qaNotes[2], frenchT).message
        ).toContain('has_many :through');
    });

    it('downloads a ZIP using the backend filename and application/zip MIME', async () => {
        await openRailsBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-download-zip')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId('export-rails-download-zip'));

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('my-diagram-rails.zip');
        expect(blob.type).toBe('application/zip');

        const bytes = new Uint8Array(await blob.arrayBuffer());
        const unzipped = unzipSync(bytes);
        expect(strFromU8(unzipped['README.md']!)).toBe('# Rails 8.1');
        expect(strFromU8(unzipped['app/models/user.rb']!)).toBe(
            'class User < ApplicationRecord; end'
        );
    });

    it('displays backend semantic failures on the result step', async () => {
        exportRailsProjectMock.mockResolvedValueOnce({
            success: false,
            error: {
                code: 'empty_diagram',
                message: 'The diagram has no exportable tables.',
            },
        });

        await openRailsBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-rails-error')).toHaveTextContent(
                'The diagram has no exportable tables.'
            );
        });

        expect(screen.getByTestId('export-rails-error')).toHaveAttribute(
            'data-error-kind',
            'semantic'
        );
        expect(
            screen.queryByTestId('export-rails-result-success')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('export-rails-retry')).toBeInTheDocument();
    });

    it('retries after a semantic failure with the current Diagram', async () => {
        exportRailsProjectMock.mockResolvedValueOnce({
            success: false,
            error: {
                code: 'empty_diagram',
                message: 'The diagram has no exportable tables.',
            },
        });

        await openRailsBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-retry')
            ).toBeInTheDocument();
        });

        exportRailsProjectMock.mockResolvedValueOnce(successResponse());
        await userEvent.click(screen.getByTestId('export-rails-retry'));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-result-success')
            ).toBeInTheDocument();
        });

        expect(exportRailsProjectMock).toHaveBeenCalledTimes(2);
        expect(exportRailsProjectMock).toHaveBeenLastCalledWith({
            diagram: chartDbState.currentDiagram,
        });
    });

    it('displays HTTP 401 failures with session wording', async () => {
        exportRailsProjectMock.mockRejectedValueOnce(
            new ApiError('Unauthenticated', 401, { message: 'Unauthenticated' })
        );

        await openRailsBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-rails-error')).toHaveTextContent(
                'export_wizard.rails.result_step.error_unauthenticated'
            );
        });
        expect(screen.getByTestId('export-rails-error')).toHaveAttribute(
            'data-error-kind',
            'unauthenticated'
        );
    });

    it('displays HTTP 422 failures with invalid request wording', async () => {
        exportRailsProjectMock.mockRejectedValueOnce(
            new ApiError('The diagram field is required.', 422, {
                message: 'The diagram field is required.',
            })
        );

        await openRailsBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-rails-error')).toHaveTextContent(
                'export_wizard.rails.result_step.error_invalid_request'
            );
        });
        expect(screen.getByTestId('export-rails-error')).toHaveAttribute(
            'data-error-kind',
            'invalid_request'
        );
    });

    it('displays a localized rate-limit error', async () => {
        exportRailsProjectMock.mockRejectedValueOnce(
            new ApiError('Too Many Requests', 429, {
                message: 'Too Many Requests',
            })
        );

        await openRailsBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-rails-error')).toHaveTextContent(
                'export_wizard.rails.result_step.error_rate_limited'
            );
        });
    });

    it('displays HTTP 500 and network failures with generic retry wording', async () => {
        exportRailsProjectMock.mockRejectedValueOnce(
            new ApiError('Server Error', 500, { message: 'Server Error' })
        );

        await openRailsBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-rails-error')).toHaveTextContent(
                'export_wizard.rails.result_step.error_unexpected'
            );
        });
    });

    it('retries after an HTTP failure', async () => {
        exportRailsProjectMock.mockRejectedValueOnce(new Error('network down'));

        await openRailsBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-retry')
            ).toBeInTheDocument();
        });

        exportRailsProjectMock.mockResolvedValueOnce(successResponse());
        await userEvent.click(screen.getByTestId('export-rails-retry'));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-result-success')
            ).toBeInTheDocument();
        });
        expect(exportRailsProjectMock).toHaveBeenCalledTimes(2);
    });

    it('does not keep stale successful files after a failed retry', async () => {
        await openRailsBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-result-success')
            ).toBeInTheDocument();
        });

        exportRailsProjectMock.mockRejectedValueOnce(new Error('network down'));
        await userEvent.click(screen.getByText('export_wizard.back'));
        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.rails.title',
            })
        );

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-error')
            ).toBeInTheDocument();
        });
        expect(
            screen.queryByTestId('export-rails-result-success')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('export-rails-file-list')
        ).not.toBeInTheDocument();
    });

    it('returns from the result step to the target picker', async () => {
        await openRailsBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-result-step')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));
        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-rails-result-step')
        ).not.toBeInTheDocument();
    });

    it('resets Rails state when the wizard is closed and reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.rails.title',
            })
        );

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-result-success')
            ).toBeInTheDocument();
        });

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-rails-result-step')
        ).not.toBeInTheDocument();

        exportRailsProjectMock.mockClear();
        exportRailsProjectMock.mockResolvedValueOnce(successResponse());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.rails.title',
            })
        );

        await waitFor(() => {
            expect(exportRailsProjectMock).toHaveBeenCalledTimes(1);
        });
    });

    it('ignores a stale response after navigating back', async () => {
        let resolveExport: ((value: RailsExportResponse) => void) | undefined;
        exportRailsProjectMock.mockImplementationOnce(
            () =>
                new Promise<RailsExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openRailsBranch();
        await userEvent.click(screen.getByText('export_wizard.back'));

        resolveExport?.(successResponse());

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-rails-result-success')
        ).not.toBeInTheDocument();
    });

    it('ignores a stale response after the dialog is closed', async () => {
        let resolveExport: ((value: RailsExportResponse) => void) | undefined;
        exportRailsProjectMock.mockImplementationOnce(
            () =>
                new Promise<RailsExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.rails.title',
            })
        );

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        resolveExport?.(successResponse());
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-rails-result-step')
        ).not.toBeInTheDocument();
    });

    it('does not enter the Rails flow for an unsupported provider', async () => {
        chartDbState.databaseType = DatabaseType.SQL_SERVER;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.SQL_SERVER
        );

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const button = screen.getByRole('button', {
            name: 'export_wizard.targets.rails.title',
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
            screen.queryByTestId('export-rails-result-step')
        ).not.toBeInTheDocument();
        expect(exportRailsProjectMock).not.toHaveBeenCalled();
    });

    it('rejects an unsafe ZIP path on download without creating a dangerous archive', async () => {
        exportRailsProjectMock.mockResolvedValueOnce(
            successResponse({
                files: [{ path: '../evil.rb', content: 'bad' }],
                notes: [],
            })
        );

        await openRailsBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-rails-download-zip')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId('export-rails-download-zip'));

        expect(mockedDownloadBlob).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-rails-download-error')
        ).toHaveTextContent(
            'export_wizard.rails.result_step.error_unsafe_path'
        );
    });
});

describe('ExportWizardDialog Rails picker availability', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
    });

    it('hides Rails for guests so they cannot enter the flow', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.rails.title')
        ).not.toBeInTheDocument();
    });

    it('enables Rails for authenticated users on PostgreSQL and MySQL', () => {
        authState.isAuthenticated = true;

        const { unmount } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );
        expect(
            screen.getByRole('button', {
                name: 'export_wizard.targets.rails.title',
            })
        ).not.toBeDisabled();
        unmount();

        chartDbState.databaseType = DatabaseType.MYSQL;
        chartDbState.currentDiagram = buildSimpleDiagram(DatabaseType.MYSQL);
        render(<ExportWizardDialog dialog={{ open: true }} />);
        expect(
            screen.getByRole('button', {
                name: 'export_wizard.targets.rails.title',
            })
        ).not.toBeDisabled();
    });
});
