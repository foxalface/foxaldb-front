import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { ApiError } from '@/lib/api/client';
import type { TFunction } from 'i18next';
import type { DjangoExportResponse } from '@/lib/api/django-export-types';
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

const { exportDjangoProjectMock } = vi.hoisted(() => ({
    exportDjangoProjectMock: vi.fn(),
}));

vi.mock('@/lib/api/django-export', () => ({
    exportDjangoProject: exportDjangoProjectMock,
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
                key.startsWith('export_wizard.django.result_step.notes.') &&
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

            if (options?.version) {
                return `${key}:${String(options.version)}`;
            }

            if (options?.path) {
                return `${key}[path=${String(options.path)}]`;
            }

            if (options?.count !== undefined) {
                return `${key}:${String(options.count)}`;
            }

            if (key.startsWith('export_wizard.django.result_step.errors.')) {
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
    overrides: Partial<Extract<DjangoExportResponse, { success: true }>> = {}
): Extract<DjangoExportResponse, { success: true }> => ({
    success: true,
    filename: 'my-diagram-django.zip',
    files: [
        { path: 'README.md', content: '# Django 6.1' },
        {
            path: 'foxaldb_models/models.py',
            content: 'class User(models.Model):',
        },
        {
            path: 'foxaldb_models/migrations/0001_initial.py',
            content: 'class Migration(migrations.Migration):',
        },
        {
            path: 'foxaldb_models/apps.py',
            content: 'class FoxaldbModelsConfig:',
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

const openDjangoBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByText('export_wizard.targets.django.title')
    );
};

describe('Django export target availability', () => {
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
        it(`hides Django for guests on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'django',
                    guestContext(databaseType)
                )
            ).toEqual({ status: 'hidden' });
        });

        it(`marks Django as available for authenticated users on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'django',
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
        it(`hides Django for guests on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'django',
                    guestContext(databaseType)
                )
            ).toEqual({ status: 'hidden' });
        });

        it(`disables Django for authenticated users on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'django',
                    authenticatedContext(databaseType)
                )
            ).toEqual({
                status: 'disabled',
                reasonKey: 'export_wizard.django.unsupported_database',
            });
        });
    }

    it('does not require a backend diagram ID or paid plan for authenticated Django availability', () => {
        expect(
            getExportTargetAvailability(
                'django',
                authenticatedContext(DatabaseType.POSTGRESQL, 'guest-diagram-1')
            )
        ).toEqual({ status: 'available' });
    });
});

describe('ExportWizardDialog Django branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = true;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
        exportDjangoProjectMock.mockResolvedValue(successResponse());
    });

    it('enters the Django result step immediately with no version or options step', async () => {
        await openDjangoBranch();

        expect(
            screen.getByTestId('export-django-result-step')
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
            screen.getByTestId('export-django-branch-context')
        ).toHaveTextContent(
            'export_wizard.title → export_wizard.targets.django.title → export_wizard.django.result_step.django_version:6.1'
        );
    });

    it('shows static Django 6.1 information and the inferred provider', async () => {
        await openDjangoBranch();

        expect(screen.getByTestId('export-django-version')).toHaveTextContent(
            'export_wizard.django.result_step.django_version:6.1'
        );
        expect(screen.getByTestId('export-django-provider')).toHaveTextContent(
            'export_wizard.django.result_step.provider_label:PostgreSQL'
        );
        expect(
            screen.getByText('export_wizard.django.result_step.explanation')
        ).toBeInTheDocument();
    });

    it('sends the full current live Diagram and no extra options', async () => {
        await openDjangoBranch();

        await waitFor(() => {
            expect(exportDjangoProjectMock).toHaveBeenCalledTimes(1);
        });

        expect(exportDjangoProjectMock).toHaveBeenCalledWith({
            diagram: chartDbState.currentDiagram,
        });
        expect(exportDjangoProjectMock.mock.calls[0]?.[0]?.diagram).toBe(
            chartDbState.currentDiagram
        );
        expect(
            exportDjangoProjectMock.mock.calls[0]?.[0]?.diagram.tables
        ).toHaveLength(1);
        expect(exportDjangoProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'version'
        );
        expect(exportDjangoProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'diagramId'
        );
        expect(exportDjangoProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'djangoVersion'
        );
        expect(exportDjangoProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'pythonVersion'
        );
        expect(exportDjangoProjectMock.mock.calls[0]?.[0]).not.toHaveProperty(
            'provider'
        );
    });

    it('shows a loading state and prevents duplicate submissions', async () => {
        let resolveExport: ((value: DjangoExportResponse) => void) | undefined;
        exportDjangoProjectMock.mockImplementationOnce(
            () =>
                new Promise<DjangoExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openDjangoBranch();

        expect(
            screen.getByTestId('export-django-generating')
        ).toBeInTheDocument();
        expect(exportDjangoProjectMock).toHaveBeenCalledTimes(1);
        expect(
            screen.queryByTestId('export-django-retry')
        ).not.toBeInTheDocument();

        resolveExport?.(successResponse());

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-success')
            ).toBeInTheDocument();
        });
        expect(exportDjangoProjectMock).toHaveBeenCalledTimes(1);
    });

    it('shows a successful result with file count, paths, and notes', async () => {
        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-success')
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                'export_wizard.django.result_step.generated_files:4'
            )
        ).toBeInTheDocument();
        expect(screen.getByTestId('export-django-file-list')).toHaveTextContent(
            'README.md'
        );
        expect(screen.getByTestId('export-django-file-list')).toHaveTextContent(
            'foxaldb_models/models.py'
        );
        expect(screen.getByTestId('export-django-file-list')).toHaveTextContent(
            'foxaldb_models/migrations/0001_initial.py'
        );
        expect(screen.getByTestId('export-django-file-list')).toHaveTextContent(
            'foxaldb_models/apps.py'
        );
        expect(
            screen.queryByTestId('export-django-warnings')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('export-django-adaptations-toggle')
        ).toHaveTextContent(
            'export_wizard.django.result_step.adaptations_heading:1'
        );
        expect(
            screen.queryByTestId('export-django-adaptations-list')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('export-django-package-type')
        ).toHaveTextContent('export_wizard.django.result_step.package_type');
    });

    it('expands technical adaptations on demand and renders path separately', async () => {
        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-adaptations-toggle')
            ).toBeInTheDocument();
        });

        expect(
            screen.getByTestId('export-django-adaptations-toggle')
        ).toHaveAttribute('aria-expanded', 'false');

        await userEvent.click(
            screen.getByTestId('export-django-adaptations-toggle')
        );

        expect(
            screen.getByTestId('export-django-adaptations-toggle')
        ).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.getByTestId('export-django-adaptations-list')
        ).toHaveTextContent(
            'export_wizard.django.result_step.notes.schema_ignored_sqlite[path=users,schema=ignored]'
        );
        expect(screen.getByTestId('export-django-note-path')).toHaveTextContent(
            'export_wizard.django.result_step.path_label[path=users]'
        );
        expect(
            screen.getByTestId('export-django-adaptations-list').textContent
        ).not.toContain(
            'export_wizard.django.result_step.notes.schema_ignored_sqlite[path=users,schema=ignored]users'
        );
    });

    it('falls back to backend message for unknown note codes', async () => {
        exportDjangoProjectMock.mockResolvedValueOnce(
            successResponse({
                notes: [
                    {
                        code: 'future_note_code',
                        message: 'Future backend-only note.',
                    },
                ],
            })
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-success')
            ).toBeInTheDocument();
        });

        expect(screen.getByTestId('export-django-warnings')).toHaveTextContent(
            'Future backend-only note.'
        );
        expect(
            screen.queryByTestId('export-django-adaptations')
        ).not.toBeInTheDocument();
    });

    it('separates mixed warnings and adaptations and hides empty groups', async () => {
        exportDjangoProjectMock.mockResolvedValueOnce(
            successResponse({
                notes: [
                    {
                        code: 'index_omitted',
                        message: 'Index omitted.',
                        path: 'items.payload_gin',
                        metadata: {
                            reason: 'unsupported_type',
                            indexType: 'gin',
                        },
                    },
                    {
                        code: 'index_name_adjusted',
                        message: 'Index name adjusted.',
                        path: 'items.long_idx',
                        metadata: {
                            originalName:
                                'this_name_is_far_too_long_for_django_index',
                            allocatedName: 'this_name_is_far_too_l_ab12cd34',
                            reason: 'unsafe_name',
                        },
                    },
                ],
            })
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-warnings')
            ).toBeInTheDocument();
        });

        expect(screen.getByTestId('export-django-warnings')).toHaveTextContent(
            'export_wizard.django.result_step.warnings_heading:1'
        );
        expect(
            screen.getByTestId('export-django-warnings-list')
        ).toHaveTextContent(
            'export_wizard.django.result_step.notes.index_omitted.unsupported_type[path=items.payload_gin,indexType=gin]'
        );
        expect(
            screen.getByTestId('export-django-adaptations-toggle')
        ).toHaveTextContent(
            'export_wizard.django.result_step.adaptations_heading:1'
        );
        expect(
            screen.queryByTestId('export-django-adaptations-list')
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByTestId('export-django-adaptations-toggle')
        );

        expect(
            screen.getByTestId('export-django-adaptations-list')
        ).toHaveTextContent(
            'export_wizard.django.result_step.notes.index_name_adjusted.unsafe_name[originalName=this_name_is_far_too_long_for_django_index,allocatedName=this_name_is_far_too_l_ab12cd34]'
        );
        const pathLabels = screen.getAllByTestId('export-django-note-path');
        expect(pathLabels).toHaveLength(2);
        expect(pathLabels[0]).toHaveTextContent(
            'export_wizard.django.result_step.path_label[path=items.payload_gin]'
        );
        expect(pathLabels[1]).toHaveTextContent(
            'export_wizard.django.result_step.path_label[path=items.long_idx]'
        );
    });

    it('does not render note panels when there are no notes', async () => {
        exportDjangoProjectMock.mockResolvedValueOnce(
            successResponse({ notes: [] })
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-success')
            ).toBeInTheDocument();
        });

        expect(
            screen.queryByTestId('export-django-warnings')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('export-django-adaptations')
        ).not.toBeInTheDocument();
    });

    it('renders localized French QA notes on the result step', async () => {
        const { getDjangoExportNotePresentation } =
            await import('../django/get-django-export-note-presentation');
        const { fr } = await import('@/i18n/locales/fr');

        const frenchT = ((key: string, options?: Record<string, unknown>) => {
            const notesRoot = 'export_wizard.django.result_step.notes';
            if (!key.startsWith(notesRoot)) {
                return key;
            }

            const relativeKey = key.slice(notesRoot.length + 1);
            let current: unknown =
                fr.translation.export_wizard.django.result_step.notes;

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
                    'MySQL catalog "foxaldb" is omitted; Django uses the connected database and unqualified table names.',
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
                    'Convenience ManyToManyField was not generated for join table "diagram_members" because extra data columns are present.',
                path: 'diagram_members',
                metadata: {
                    reason: 'extra_columns',
                    className: 'DiagramMember',
                },
            },
        ] as const;

        for (const qaNote of qaNotes) {
            const localized = getDjangoExportNotePresentation(
                qaNote,
                frenchT
            ).message;

            expect(localized).not.toBe(qaNote.message);
        }

        expect(
            getDjangoExportNotePresentation(qaNotes[0], frenchT).message
        ).toContain('foxaldb');
        expect(
            getDjangoExportNotePresentation(qaNotes[1], frenchT).message
        ).toContain('migrations');
        expect(
            getDjangoExportNotePresentation(qaNotes[1], frenchT).message
        ).toContain('MigrationRecord');
        expect(
            getDjangoExportNotePresentation(qaNotes[2], frenchT).message
        ).toContain('diagram_members');
        expect(
            getDjangoExportNotePresentation(qaNotes[2], frenchT).message
        ).toContain('ManyToManyField');
    });

    it('downloads a ZIP using the backend filename and application/zip MIME', async () => {
        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-download-zip')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId('export-django-download-zip'));

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('my-diagram-django.zip');
        expect(blob.type).toBe('application/zip');

        const bytes = new Uint8Array(await blob.arrayBuffer());
        const unzipped = unzipSync(bytes);
        expect(strFromU8(unzipped['README.md']!)).toBe('# Django 6.1');
        expect(strFromU8(unzipped['foxaldb_models/models.py']!)).toBe(
            'class User(models.Model):'
        );
    });

    it('displays backend semantic failures on the result step', async () => {
        exportDjangoProjectMock.mockResolvedValueOnce({
            success: false,
            error: {
                code: 'empty_diagram',
                message: 'The diagram has no exportable tables.',
            },
        });

        await openDjangoBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-django-error')).toHaveTextContent(
                'localized:export_wizard.django.result_step.errors.empty_diagram'
            );
        });

        expect(screen.getByTestId('export-django-error')).toHaveAttribute(
            'data-error-kind',
            'semantic'
        );
        expect(
            screen.queryByTestId('export-django-result-success')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('export-django-retry')).toBeInTheDocument();
    });

    it('retries after a semantic failure with the current Diagram', async () => {
        exportDjangoProjectMock.mockResolvedValueOnce({
            success: false,
            error: {
                code: 'empty_diagram',
                message: 'The diagram has no exportable tables.',
            },
        });

        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-retry')
            ).toBeInTheDocument();
        });

        exportDjangoProjectMock.mockResolvedValueOnce(successResponse());
        await userEvent.click(screen.getByTestId('export-django-retry'));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-success')
            ).toBeInTheDocument();
        });

        expect(exportDjangoProjectMock).toHaveBeenCalledTimes(2);
        expect(exportDjangoProjectMock).toHaveBeenLastCalledWith({
            diagram: chartDbState.currentDiagram,
        });
    });

    it('displays HTTP 401 failures with session wording', async () => {
        exportDjangoProjectMock.mockRejectedValueOnce(
            new ApiError('Unauthenticated', 401, { message: 'Unauthenticated' })
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-django-error')).toHaveTextContent(
                'export_wizard.django.result_step.error_unauthenticated'
            );
        });
        expect(screen.getByTestId('export-django-error')).toHaveAttribute(
            'data-error-kind',
            'unauthenticated'
        );
    });

    it('displays HTTP 422 failures with invalid request wording', async () => {
        exportDjangoProjectMock.mockRejectedValueOnce(
            new ApiError('The diagram field is required.', 422, {
                message: 'The diagram field is required.',
            })
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-django-error')).toHaveTextContent(
                'export_wizard.django.result_step.error_invalid_request'
            );
        });
        expect(screen.getByTestId('export-django-error')).toHaveAttribute(
            'data-error-kind',
            'invalid_request'
        );
    });

    it('displays a localized rate-limit error', async () => {
        exportDjangoProjectMock.mockRejectedValueOnce(
            new ApiError('Too Many Requests', 429, {
                message: 'Too Many Requests',
            })
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-django-error')).toHaveTextContent(
                'export_wizard.django.result_step.error_rate_limited'
            );
        });
    });

    it('displays HTTP 500 failures with server wording', async () => {
        exportDjangoProjectMock.mockRejectedValueOnce(
            new ApiError('Server Error', 500, { message: 'Server Error' })
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-django-error')).toHaveTextContent(
                'export_wizard.django.result_step.error_unexpected'
            );
        });
        expect(screen.getByTestId('export-django-error')).toHaveAttribute(
            'data-error-kind',
            'unexpected'
        );
    });

    it('displays network failures with connection wording', async () => {
        exportDjangoProjectMock.mockRejectedValueOnce(
            new TypeError('Failed to fetch')
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(screen.getByTestId('export-django-error')).toHaveTextContent(
                'export_wizard.django.result_step.error_network'
            );
        });
        expect(screen.getByTestId('export-django-error')).toHaveAttribute(
            'data-error-kind',
            'network'
        );
    });

    it('retries after an HTTP failure', async () => {
        exportDjangoProjectMock.mockRejectedValueOnce(
            new Error('network down')
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-retry')
            ).toBeInTheDocument();
        });

        exportDjangoProjectMock.mockResolvedValueOnce(successResponse());
        await userEvent.click(screen.getByTestId('export-django-retry'));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-success')
            ).toBeInTheDocument();
        });
        expect(exportDjangoProjectMock).toHaveBeenCalledTimes(2);
    });

    it('does not keep stale successful files after a failed retry', async () => {
        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-success')
            ).toBeInTheDocument();
        });

        exportDjangoProjectMock.mockRejectedValueOnce(
            new Error('network down')
        );
        await userEvent.click(screen.getByText('export_wizard.back'));
        await userEvent.click(
            screen.getByText('export_wizard.targets.django.title')
        );

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-error')
            ).toBeInTheDocument();
        });
        expect(
            screen.queryByTestId('export-django-result-success')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('export-django-file-list')
        ).not.toBeInTheDocument();
    });

    it('returns from the result step to the target picker', async () => {
        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-step')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));
        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-django-result-step')
        ).not.toBeInTheDocument();
    });

    it('resets Django state when the wizard is closed and reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByText('export_wizard.targets.django.title')
        );

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-result-success')
            ).toBeInTheDocument();
        });

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-django-result-step')
        ).not.toBeInTheDocument();

        exportDjangoProjectMock.mockClear();
        exportDjangoProjectMock.mockResolvedValueOnce(successResponse());
        await userEvent.click(
            screen.getByText('export_wizard.targets.django.title')
        );

        await waitFor(() => {
            expect(exportDjangoProjectMock).toHaveBeenCalledTimes(1);
        });
    });

    it('ignores a stale response after navigating back', async () => {
        let resolveExport: ((value: DjangoExportResponse) => void) | undefined;
        exportDjangoProjectMock.mockImplementationOnce(
            () =>
                new Promise<DjangoExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openDjangoBranch();
        await userEvent.click(screen.getByText('export_wizard.back'));

        resolveExport?.(successResponse());

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-django-result-success')
        ).not.toBeInTheDocument();
    });

    it('ignores a stale response after the dialog is closed', async () => {
        let resolveExport: ((value: DjangoExportResponse) => void) | undefined;
        exportDjangoProjectMock.mockImplementationOnce(
            () =>
                new Promise<DjangoExportResponse>((resolve) => {
                    resolveExport = resolve;
                })
        );

        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );
        await userEvent.click(
            screen.getByText('export_wizard.targets.django.title')
        );

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        resolveExport?.(successResponse());
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-django-result-step')
        ).not.toBeInTheDocument();
    });

    it('does not enter the Django flow for an unsupported provider', async () => {
        chartDbState.databaseType = DatabaseType.SQL_SERVER;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.SQL_SERVER
        );

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const button = screen
            .getByText('export_wizard.targets.django.title')
            .closest('button');

        expect(button).toBeDisabled();
        expect(
            screen.getByText('export_wizard.django.unsupported_database')
        ).toBeInTheDocument();

        if (button) {
            await userEvent.click(button);
        }

        expect(
            screen.queryByTestId('export-django-result-step')
        ).not.toBeInTheDocument();
        expect(exportDjangoProjectMock).not.toHaveBeenCalled();
    });

    it('rejects an unsafe ZIP path on download without creating a dangerous archive', async () => {
        exportDjangoProjectMock.mockResolvedValueOnce(
            successResponse({
                files: [{ path: '../evil.py', content: 'bad' }],
                notes: [],
            })
        );

        await openDjangoBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-django-download-zip')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId('export-django-download-zip'));

        expect(mockedDownloadBlob).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-django-download-error')
        ).toHaveTextContent(
            'export_wizard.django.result_step.error_unsafe_path'
        );
    });
});

describe('ExportWizardDialog Django picker availability', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
    });

    it('hides Django for guests so they cannot enter the flow', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.django.title')
        ).not.toBeInTheDocument();
    });

    it('enables Django for authenticated users on PostgreSQL, MySQL, MariaDB, and SQLite', () => {
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
                screen
                    .getByText('export_wizard.targets.django.title')
                    .closest('button')
            ).not.toBeDisabled();
            unmount();
        }
    });
});
