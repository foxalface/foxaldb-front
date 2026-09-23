import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { ApiError } from '@/lib/api/client';
import { downloadBlob } from '@/lib/download-blob';
import { exportLaravelMigrations } from '@/lib/api/diagram-laravel-export';
import type { Diagram } from '@/lib/domain/diagram';

const dialogMocks = {
    closeExportWizardDialog: vi.fn(),
    openExportSQLDialog: vi.fn(),
    openExportDiagramDialog: vi.fn(),
};

const authState = {
    isAuthenticated: true,
};

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const currentDiagram: Diagram = {
    id: '42',
    name: 'Remote diagram',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 'users-table',
            name: 'users',
            x: 0,
            y: 0,
            fields: [],
            indexes: [],
            color: '#ffffff',
            isView: false,
            createdAt: 1,
            width: 200,
        },
    ],
    relationships: [],
    createdAt,
    updatedAt: createdAt,
};

const chartDbState = {
    databaseType: DatabaseType.POSTGRESQL,
    currentDiagram,
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
        filter: { schemaIds: ['hidden-schema'] },
    }),
}));

vi.mock('@/lib/dbml/dbml-export/dbml-export', () => ({
    generateDBMLFromDiagram: vi.fn().mockResolvedValue({
        standardDbml: 'Table users {}',
        inlineDbml: '',
        relationshipsDbml: '',
    }),
}));

vi.mock('@/lib/download-blob', () => ({
    downloadBlob: vi.fn(),
}));

vi.mock('@/lib/api/diagram-laravel-export', () => ({
    LARAVEL_VERSIONS: ['10', '11', '12', '13'],
    DEFAULT_LARAVEL_VERSION: '13',
    exportLaravelMigrations: vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { filename?: string }) =>
            options?.filename ? `${key}:${options.filename}` : key,
    }),
}));

const mockedDownloadBlob = vi.mocked(downloadBlob);
const mockedExportLaravelMigrations = vi.mocked(exportLaravelMigrations);

const openLaravelBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', {
            name: 'export_wizard.targets.laravel.title',
        })
    );
};

describe('ExportWizardDialog Laravel branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = currentDiagram;
        mockedExportLaravelMigrations.mockResolvedValue(
            new Blob(['zip'], { type: 'application/zip' })
        );
    });

    it('routes Laravel to options without a legacy child dialog', async () => {
        await openLaravelBranch();

        expect(dialogMocks.closeExportWizardDialog).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-laravel-options-step')
        ).toBeInTheDocument();
        expect(
            screen.getByText('export_wizard.targets.laravel.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-laravel-branch-context')
        ).not.toBeInTheDocument();
        expect(mockedExportLaravelMigrations).not.toHaveBeenCalled();
    });

    it('hides Laravel for guests', () => {
        authState.isAuthenticated = false;
        chartDbState.currentDiagram = {
            ...currentDiagram,
            id: 'guest-diagram-1',
        };

        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.laravel.title')
        ).not.toBeInTheDocument();
    });

    it('hides Laravel for local non-backend ids', () => {
        chartDbState.currentDiagram = {
            ...currentDiagram,
            id: 'local-diagram',
        };

        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.laravel.title')
        ).not.toBeInTheDocument();
    });

    it('uses Laravel 13 with indexes and foreign keys enabled by default', async () => {
        await openLaravelBranch();

        expect(screen.getByTestId('laravel-version-select')).toHaveTextContent(
            '13'
        );
        expect(
            screen.getByLabelText(
                'export_wizard.laravel.options_step.include_indexes'
            )
        ).toBeChecked();
        expect(
            screen.getByLabelText(
                'export_wizard.laravel.options_step.include_foreign_keys'
            )
        ).toBeChecked();
    });

    it('navigates back from Laravel options to the target picker', async () => {
        await openLaravelBranch();

        await userEvent.click(screen.getByText('export_wizard.back'));

        expect(
            screen.getByText('export_wizard.sections.framework')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-laravel-options-step')
        ).not.toBeInTheDocument();
    });

    it('resets Laravel options when the wizard is reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.laravel.title',
            })
        );

        await userEvent.click(
            screen.getByLabelText(
                'export_wizard.laravel.options_step.include_indexes'
            )
        );

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.laravel.title',
            })
        );

        expect(
            screen.getByLabelText(
                'export_wizard.laravel.options_step.include_indexes'
            )
        ).toBeChecked();
        expect(
            screen.queryByTestId('export-laravel-error')
        ).not.toBeInTheDocument();
    });

    it('sends the current diagram and selected options without schema filtering', async () => {
        await openLaravelBranch();

        await userEvent.click(
            screen.getByLabelText(
                'export_wizard.laravel.options_step.include_indexes'
            )
        );
        await userEvent.click(screen.getByTestId('export-laravel-submit'));

        expect(mockedExportLaravelMigrations).toHaveBeenCalledTimes(1);
        expect(mockedExportLaravelMigrations).toHaveBeenCalledWith('42', {
            laravelVersion: '13',
            includeIndexes: false,
            includeForeignKeys: true,
            content: currentDiagram,
        });
    });

    it('downloads the zip with a deterministic filename and stays open', async () => {
        await openLaravelBranch();

        await userEvent.click(screen.getByTestId('export-laravel-submit'));

        await waitFor(() => {
            expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        });

        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('remote-diagram-laravel-migrations.zip');
        expect(blob).toBeInstanceOf(Blob);
        expect(dialogMocks.closeExportWizardDialog).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-laravel-options-step')
        ).toBeInTheDocument();
    });

    it('disables export and back while generating and ignores a second click', async () => {
        let resolveExport: ((blob: Blob) => void) | undefined;
        mockedExportLaravelMigrations.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openLaravelBranch();

        await userEvent.click(screen.getByTestId('export-laravel-submit'));
        await userEvent.click(screen.getByTestId('export-laravel-submit'));

        expect(mockedExportLaravelMigrations).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('export-laravel-submit')).toBeDisabled();
        expect(screen.getByText('export_wizard.back')).toBeDisabled();
        expect(
            screen.getByTestId('export-laravel-generating')
        ).toBeInTheDocument();

        resolveExport?.(new Blob(['zip'], { type: 'application/zip' }));

        await waitFor(() => {
            expect(
                screen.getByTestId('export-laravel-submit')
            ).not.toBeDisabled();
        });
    });

    it('shows mapped errors and allows retry', async () => {
        mockedExportLaravelMigrations.mockRejectedValueOnce(
            new ApiError('unauthenticated', 401, {})
        );

        await openLaravelBranch();
        await userEvent.click(screen.getByTestId('export-laravel-submit'));

        expect(
            await screen.findByTestId('export-laravel-error')
        ).toHaveTextContent(
            'export_wizard.laravel.options_step.error_unauthenticated'
        );

        mockedExportLaravelMigrations.mockRejectedValueOnce(
            new ApiError('forbidden', 403, {})
        );
        await userEvent.click(screen.getByTestId('export-laravel-submit'));
        expect(
            await screen.findByTestId('export-laravel-error')
        ).toHaveTextContent(
            'export_wizard.laravel.options_step.error_forbidden'
        );

        mockedExportLaravelMigrations.mockRejectedValueOnce(
            new ApiError('missing', 404, {})
        );
        await userEvent.click(screen.getByTestId('export-laravel-submit'));
        expect(
            await screen.findByTestId('export-laravel-error')
        ).toHaveTextContent(
            'export_wizard.laravel.options_step.error_not_found'
        );

        mockedExportLaravelMigrations.mockRejectedValueOnce(
            new ApiError('empty', 422, { errors: { diagram: ['empty'] } })
        );
        await userEvent.click(screen.getByTestId('export-laravel-submit'));
        expect(
            await screen.findByTestId('export-laravel-error')
        ).toHaveTextContent('export_wizard.laravel.options_step.error_empty');

        mockedExportLaravelMigrations.mockRejectedValueOnce(
            new ApiError('invalid', 422, { errors: { content: ['bad'] } })
        );
        await userEvent.click(screen.getByTestId('export-laravel-submit'));
        expect(
            await screen.findByTestId('export-laravel-error')
        ).toHaveTextContent('export_wizard.laravel.options_step.error_invalid');

        mockedExportLaravelMigrations.mockRejectedValueOnce(
            new Error('offline')
        );
        await userEvent.click(screen.getByTestId('export-laravel-submit'));
        expect(
            await screen.findByTestId('export-laravel-error')
        ).toHaveTextContent('export_wizard.laravel.options_step.error_network');

        mockedExportLaravelMigrations.mockRejectedValueOnce(
            new ApiError('boom', 500, {})
        );
        await userEvent.click(screen.getByTestId('export-laravel-submit'));
        expect(
            await screen.findByTestId('export-laravel-error')
        ).toHaveTextContent('export_wizard.laravel.options_step.error');

        mockedExportLaravelMigrations.mockResolvedValueOnce(
            new Blob(['zip'], { type: 'application/zip' })
        );
        await userEvent.click(screen.getByTestId('export-laravel-submit'));

        await waitFor(() => {
            expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        });
        expect(
            screen.queryByTestId('export-laravel-error')
        ).not.toBeInTheDocument();
    });
});
