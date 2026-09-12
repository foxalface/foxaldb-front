import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { downloadBlob } from '@/lib/download-blob';
import { getExportTargetAvailability } from '../export-target-availability';
import {
    makeDiagram,
    makeField,
    makeTable,
    resetIdCounter,
    typeRef,
} from '@/lib/prisma-export/__tests__/test-helpers';
import type { Diagram } from '@/lib/domain/diagram';

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

const filterState = {
    filter: {
        tableIds: [],
        schemas: [],
    },
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
    useDiagramFilter: () => filterState,
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({
        effectiveTheme: 'light',
    }),
}));

vi.mock('@/lib/download-blob', () => ({
    downloadBlob: vi.fn(),
}));

vi.mock('@/components/code-snippet/code-snippet', () => ({
    CodeSnippet: ({
        code,
        actions,
        className,
    }: {
        code: string;
        className?: string;
        actions?: Array<{ label: string; onClick: () => void }>;
    }) => (
        <div data-testid="code-snippet" data-classname={className}>
            <pre data-testid="prisma-schema-content">{code}</pre>
            <button type="button" data-testid="code-snippet-copy">
                copy
            </button>
            {actions?.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    data-testid="export-prisma-download"
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

const mockedDownloadBlob = vi.mocked(downloadBlob);

const openPrismaBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByText('export_wizard.targets.prisma.title')
    );
};

const continueToPreview = async () => {
    await userEvent.click(screen.getByTestId('prisma-version-continue'));
};

describe('Prisma export target availability', () => {
    const guestContext = (databaseType: DatabaseType) => ({
        isAuthenticated: false,
        diagramId: 'guest-diagram-1',
        databaseType,
    });

    const supportedTypes = [
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
        DatabaseType.SQL_SERVER,
        DatabaseType.COCKROACHDB,
    ] as const;

    for (const databaseType of supportedTypes) {
        it(`marks Prisma as available for ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'prisma',
                    guestContext(databaseType)
                )
            ).toEqual({
                status: 'available',
            });
        });
    }

    const unsupportedTypes = [
        DatabaseType.ORACLE,
        DatabaseType.CLICKHOUSE,
        DatabaseType.GENERIC,
    ] as const;

    for (const databaseType of unsupportedTypes) {
        it(`disables Prisma for ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'prisma',
                    guestContext(databaseType)
                )
            ).toEqual({
                status: 'disabled',
                reasonKey: 'export_wizard.prisma.unsupported_database',
            });
        });
    }

    it('allows guests to use Prisma without backend diagram ID', () => {
        expect(
            getExportTargetAvailability(
                'prisma',
                guestContext(DatabaseType.POSTGRESQL)
            )
        ).toEqual({ status: 'available' });
    });

    it('keeps Laravel hidden for guests', () => {
        expect(
            getExportTargetAvailability(
                'laravel',
                guestContext(DatabaseType.POSTGRESQL)
            )
        ).toEqual({ status: 'hidden' });
    });

    it('keeps Laravel available for authenticated backend diagrams', () => {
        expect(
            getExportTargetAvailability('laravel', {
                isAuthenticated: true,
                diagramId: '42',
                databaseType: DatabaseType.POSTGRESQL,
            })
        ).toEqual({ status: 'available' });
    });
});

describe('ExportWizardDialog Prisma branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
    });

    it('enters the Prisma version step when Prisma is selected', async () => {
        await openPrismaBranch();

        expect(
            screen.getByTestId('export-prisma-version-step')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-prisma-branch-context')
        ).toHaveTextContent(
            'export_wizard.title → export_wizard.targets.prisma.title'
        );
    });

    it('defaults to Prisma 7', async () => {
        await openPrismaBranch();

        expect(screen.getByTestId('prisma-version-7')).toHaveClass(
            'border-primary'
        );
    });

    it('allows selecting Prisma 6', async () => {
        await openPrismaBranch();

        await userEvent.click(screen.getByTestId('prisma-version-6'));

        expect(screen.getByTestId('prisma-version-6')).toHaveClass(
            'border-primary'
        );
    });

    it('continues to preview with Prisma 7 output', async () => {
        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-preview-container')
            ).toBeInTheDocument();
        });

        const schema = screen.getByTestId('prisma-schema-content').textContent;
        expect(schema).toContain('provider = "prisma-client"');
        expect(schema).toContain('output   = "../generated/prisma"');
        expect(schema).not.toContain('url      = env("DATABASE_URL")');
    });

    it('shows Prisma 6 preview contract when Prisma 6 is selected', async () => {
        await openPrismaBranch();
        await userEvent.click(screen.getByTestId('prisma-version-6'));
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-schema-content')
            ).toBeInTheDocument();
        });

        const schema = screen.getByTestId('prisma-schema-content').textContent;
        expect(schema).toContain('provider = "prisma-client-js"');
        expect(schema).toContain('url      = env("DATABASE_URL")');
        expect(schema).not.toContain('output   = "../generated/prisma"');
    });

    it('shows Prisma 7 breadcrumb on preview', async () => {
        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-branch-context')
            ).toHaveTextContent('export_wizard.prisma.version_step.prisma_7');
        });
    });

    it('shows Prisma 6 breadcrumb on preview', async () => {
        await openPrismaBranch();
        await userEvent.click(screen.getByTestId('prisma-version-6'));
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-branch-context')
            ).toHaveTextContent('export_wizard.prisma.version_step.prisma_6');
        });
    });

    it('navigates back from preview to version step', async () => {
        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-preview-container')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));

        expect(
            screen.getByTestId('export-prisma-version-step')
        ).toBeInTheDocument();
    });

    it('navigates back from version step to target picker', async () => {
        await openPrismaBranch();

        await userEvent.click(screen.getByText('export_wizard.back'));

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
    });

    it('regenerates when switching from Prisma 7 to Prisma 6', async () => {
        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-schema-content')
            ).toHaveTextContent('prisma-client');
        });

        await userEvent.click(screen.getByText('export_wizard.back'));
        await userEvent.click(screen.getByTestId('prisma-version-6'));
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-schema-content')
            ).toHaveTextContent('prisma-client-js');
        });
    });

    it('regenerates when switching from Prisma 6 to Prisma 7', async () => {
        await openPrismaBranch();
        await userEvent.click(screen.getByTestId('prisma-version-6'));
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-schema-content')
            ).toHaveTextContent('prisma-client-js');
        });

        await userEvent.click(screen.getByText('export_wizard.back'));
        await userEvent.click(screen.getByTestId('prisma-version-7'));
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-schema-content')
            ).toHaveTextContent('prisma-client');
        });
    });

    it('resets version to Prisma 7 when the wizard reopens', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByText('export_wizard.targets.prisma.title')
        );
        await userEvent.click(screen.getByTestId('prisma-version-6'));

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        await userEvent.click(
            screen.getByText('export_wizard.targets.prisma.title')
        );

        expect(screen.getByTestId('prisma-version-7')).toHaveClass(
            'border-primary'
        );
    });

    it('clears preview state when the wizard reopens', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByText('export_wizard.targets.prisma.title')
        );
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-preview-container')
            ).toBeInTheDocument();
        });

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-prisma-preview-container')
        ).not.toBeInTheDocument();
    });

    it('downloads schema.prisma with text/plain content', async () => {
        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-download')
            ).toBeInTheDocument();
        });

        const schema =
            screen.getByTestId('prisma-schema-content').textContent ?? '';

        await userEvent.click(screen.getByTestId('export-prisma-download'));

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('schema.prisma');
        expect(blob.type).toBe('text/plain');
        await expect(blob.text()).resolves.toBe(schema);
    });

    it('uses a bounded preview container', async () => {
        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-preview-container')
            ).toHaveClass('h-96', 'min-h-72', 'w-full', 'shrink-0');
        });
    });

    it('shows generation error for blocking P1 validation', async () => {
        chartDbState.currentDiagram = makeDiagram({
            id: 'guest-diagram-1',
            name: 'My Diagram',
            databaseType: DatabaseType.POSTGRESQL,
            tables: [
                makeTable({
                    name: 'shapes',
                    fields: [
                        makeField({
                            name: 'geom',
                            type: typeRef('geometry'),
                            primaryKey: true,
                        }),
                    ],
                }),
            ],
            createdAt,
            updatedAt: createdAt,
        });

        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-generation-error')
            ).toBeInTheDocument();
        });

        expect(
            screen.queryByTestId('export-prisma-download')
        ).not.toBeInTheDocument();
    });

    it('shows non-blocking notes without preventing download', async () => {
        chartDbState.currentDiagram = makeDiagram({
            id: 'guest-diagram-1',
            name: 'My Diagram',
            databaseType: DatabaseType.POSTGRESQL,
            tables: [
                makeTable({
                    name: 'users',
                    schema: 'auth',
                    fields: [
                        makeField({
                            name: 'id',
                            type: typeRef('integer'),
                            primaryKey: true,
                        }),
                    ],
                }),
            ],
            createdAt,
            updatedAt: createdAt,
        });

        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-limitations')
            ).toBeInTheDocument();
        });

        expect(
            screen.getByTestId('export-prisma-download')
        ).toBeInTheDocument();
    });

    it('groups repeated schema namespace warnings into one visible bullet', async () => {
        chartDbState.currentDiagram = makeDiagram({
            id: 'guest-diagram-1',
            name: 'My Diagram',
            databaseType: DatabaseType.MYSQL,
            tables: Array.from({ length: 3 }, (_, index) =>
                makeTable({
                    name: `table_${index + 1}`,
                    schema: 'foxaldb',
                    fields: [
                        makeField({
                            name: 'id',
                            type: typeRef('bigint'),
                            primaryKey: true,
                        }),
                    ],
                })
            ),
            createdAt,
            updatedAt: createdAt,
        });

        await openPrismaBranch();
        await continueToPreview();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-limitations')
            ).toBeInTheDocument();
        });

        const limitationItems = screen
            .getByTestId('export-prisma-limitations')
            .querySelectorAll('li');

        expect(limitationItems).toHaveLength(1);
        expect(limitationItems[0]?.textContent).toContain('(3');
    });
});

describe('ExportWizardDialog Prisma picker availability', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetIdCounter();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
    });

    it('enables Prisma for guests on supported databases', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        const prismaButton = screen
            .getByText('export_wizard.targets.prisma.title')
            .closest('button');

        expect(prismaButton).not.toBeDisabled();
    });

    it('disables Prisma for unsupported databases with a localized reason', async () => {
        chartDbState.databaseType = DatabaseType.ORACLE;
        chartDbState.currentDiagram = buildSimpleDiagram(DatabaseType.ORACLE);

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const prismaButton = screen
            .getByText('export_wizard.targets.prisma.title')
            .closest('button');

        expect(prismaButton).toBeDisabled();
        expect(
            screen.getByText('export_wizard.prisma.unsupported_database')
        ).toBeInTheDocument();
    });

    it('allows authenticated users without changing Laravel gating', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL,
            { id: 'guest-diagram-1' }
        );

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const prismaButton = screen
            .getByText('export_wizard.targets.prisma.title')
            .closest('button');

        expect(prismaButton).not.toBeDisabled();
        expect(
            screen.queryByText('export_wizard.targets.laravel.title')
        ).not.toBeInTheDocument();
    });
});
