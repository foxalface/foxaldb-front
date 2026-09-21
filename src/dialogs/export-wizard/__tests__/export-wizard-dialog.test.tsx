import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';

const dialogMocks = {
    closeExportWizardDialog: vi.fn(),
    openExportSQLDialog: vi.fn(),
    openExportDiagramDialog: vi.fn(),
};

const authState = {
    isAuthenticated: false,
};

const chartDbState = {
    databaseType: DatabaseType.POSTGRESQL,
    currentDiagram: {
        id: 'guest-diagram-1',
        name: 'Guest diagram',
    },
};

const exportImageMock = vi.fn();

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
        exportImage: exportImageMock,
    }),
}));

vi.mock('@/context/diagram-filter-context/use-diagram-filter', () => ({
    useDiagramFilter: () => ({
        filter: {},
    }),
}));

vi.mock('@/lib/dbml/dbml-export/dbml-export', () => ({
    generateDBMLFromDiagram: vi.fn().mockResolvedValue({
        standardDbml: 'Table users {}',
        inlineDbml: '',
        relationshipsDbml: '',
    }),
}));

vi.mock('@/components/code-snippet/code-snippet', () => ({
    CodeSnippet: ({
        code,
        actions,
    }: {
        code: string;
        actions?: Array<{ label: string; onClick: () => void }>;
    }) => (
        <div data-testid="code-snippet">
            <pre>{code}</pre>
            <button type="button" data-testid="code-snippet-copy">
                copy
            </button>
            {actions?.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ExportWizardDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = {
            id: 'guest-diagram-1',
            name: 'Guest diagram',
        };
    });

    it('renders guest-visible export groups', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByRole('separator', {
                name: 'export_wizard.sections.database',
            })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('separator', {
                name: 'export_wizard.sections.framework',
            })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('separator', {
                name: 'export_wizard.sections.portable',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('separator', {
                name: 'export_wizard.sections.visual',
            })
        ).toBeInTheDocument();
    });

    it('uses a scrollable wizard body inside a viewport-constrained shell', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        const scrollBody = screen.getByTestId('export-wizard-scroll-body');
        expect(scrollBody).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto');

        const dialogContent = scrollBody.parentElement;
        expect(dialogContent).toHaveClass(
            'max-h-dvh',
            'overflow-hidden',
            'flex-col'
        );
    });

    it('renders the target picker as a grouped square grid', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        const picker = screen.getByTestId('export-target-picker');
        expect(picker.querySelector('.grid-cols-6')).not.toBeNull();

        const sqlButton = screen.getByRole('button', {
            name: 'export_wizard.targets.sql.title',
        });
        expect(sqlButton).toHaveClass('aspect-square');
        expect(sqlButton).not.toHaveAttribute('title');
    });

    it('renders all guest-visible export targets', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        const expectedTargets = [
            'export_wizard.targets.sql.title',
            'export_wizard.targets.dbml.title',
            'export_wizard.targets.diagram_json.title',
            'export_wizard.targets.png.title',
            'export_wizard.targets.jpg.title',
            'export_wizard.targets.svg.title',
        ];

        for (const targetTitle of expectedTargets) {
            expect(
                screen.getByRole('button', { name: targetTitle })
            ).toBeInTheDocument();
        }
    });

    it('opens the SQL target step from the target picker', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.sql.title',
            })
        );

        expect(dialogMocks.openExportSQLDialog).not.toHaveBeenCalled();
        expect(screen.getByText('export_wizard.title')).toBeInTheDocument();
        expect(
            screen.getByTestId('export-sql-branch-context')
        ).toBeInTheDocument();
        expect(
            screen.getByText('export_wizard.sql.target_step.description')
        ).toBeInTheDocument();
    });

    it('opens the Diagram JSON download step from the target picker', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.diagram_json.title',
            })
        );

        expect(dialogMocks.openExportDiagramDialog).not.toHaveBeenCalled();
        expect(dialogMocks.closeExportWizardDialog).not.toHaveBeenCalled();
        expect(
            screen.getByText('export_wizard.json.download_step.description')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-json-branch-context')
        ).toBeInTheDocument();
    });

    it('opens the visual options step from PNG, JPG and SVG without auto-download', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.png.title',
            })
        );
        expect(dialogMocks.closeExportWizardDialog).not.toHaveBeenCalled();
        expect(exportImageMock).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-visual-options-step')
        ).toHaveAttribute('data-format', 'png');
        expect(
            screen.getByTestId('export-visual-branch-context')
        ).toBeInTheDocument();
    });

    it('opens the DBML preview from the target picker', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        const dbmlButton = screen.getByRole('button', {
            name: 'export_wizard.targets.dbml.title',
        });

        expect(dbmlButton).not.toBeDisabled();
        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.dbml.title',
            })
        );

        expect(
            screen.getByText('export_wizard.dbml.preview_step.description')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-dbml-branch-context')
        ).toBeInTheDocument();
    });

    it('hides Prisma for guests', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.prisma.title')
        ).not.toBeInTheDocument();
    });

    it('enables Prisma for authenticated users on supported databases', () => {
        authState.isAuthenticated = true;

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const prismaButton = screen.getByRole('button', {
            name: 'export_wizard.targets.prisma.title',
        });

        expect(prismaButton).not.toBeDisabled();
    });

    it('hides EF Core for guests', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.ef_core.title')
        ).not.toBeInTheDocument();
    });

    it('hides Rails for guests', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.rails.title')
        ).not.toBeInTheDocument();
    });

    it('hides Django for guests', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.django.title')
        ).not.toBeInTheDocument();
    });

    it('hides Drizzle for guests', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.drizzle.title')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText('export_wizard.targets.framework.coming_soon')
        ).not.toBeInTheDocument();
    });

    it('hides Laravel export for guests', () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.laravel.title')
        ).not.toBeInTheDocument();
    });

    it('shows Laravel export for authenticated backend diagrams', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Remote diagram',
        };

        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByRole('button', {
                name: 'export_wizard.targets.laravel.title',
            })
        ).toBeInTheDocument();
        expect(
            screen
                .getByTestId('export-target-picker')
                .querySelector('.grid-cols-6')
        ).not.toBeNull();

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.laravel.title',
            })
        );

        expect(dialogMocks.closeExportWizardDialog).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-laravel-options-step')
        ).toBeInTheDocument();
    });

    it('resets wizard state when reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.sql.title',
            })
        );

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByRole('separator', {
                name: 'export_wizard.sections.database',
            })
        ).toBeInTheDocument();
        expect(screen.queryByText('sql')).not.toBeInTheDocument();
    });
});
