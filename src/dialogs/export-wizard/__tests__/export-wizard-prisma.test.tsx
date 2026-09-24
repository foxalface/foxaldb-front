import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { ApiError } from '@/lib/api/client';
import type { PrismaExportResult } from '@/lib/api/prisma-export-types';
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

const { exportPrismaSchemaMock } = vi.hoisted(() => ({
    exportPrismaSchemaMock: vi.fn(),
}));

vi.mock('@/lib/api/prisma-export', () => ({
    exportPrismaSchema: exportPrismaSchemaMock,
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
        language,
    }: {
        code: string;
        className?: string;
        language?: string;
        actions?: Array<{ label: string; onClick: () => void }>;
    }) => (
        <div
            data-testid="code-snippet"
            data-classname={className}
            data-language={language}
        >
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

const resolveDatasourceProvider = (databaseType: DatabaseType): string => {
    switch (databaseType) {
        case DatabaseType.MYSQL:
        case DatabaseType.MARIADB:
            return 'mysql';
        case DatabaseType.SQLITE:
            return 'sqlite';
        case DatabaseType.SQL_SERVER:
            return 'sqlserver';
        case DatabaseType.COCKROACHDB:
            return 'cockroachdb';
        default:
            return 'postgresql';
    }
};

const buildMockPrismaSchema = (
    version: '6' | '7',
    databaseType: DatabaseType
): string => {
    const provider = version === '7' ? 'prisma-client' : 'prisma-client-js';
    const outputLine =
        version === '7' ? '\n  output   = "../generated/prisma"' : '';
    const urlLine = version === '6' ? '\n  url      = env("DATABASE_URL")' : '';

    return `generator client {
  provider = "${provider}"${outputLine}
}

datasource db {
  provider = "${resolveDatasourceProvider(databaseType)}"${urlLine}
}

model users {
  id Int @id @default(autoincrement())
}
`;
};

const hasBlockingGeometryPrimaryKey = (diagram: Diagram): boolean =>
    (diagram.tables ?? []).some((table) =>
        table.fields.some(
            (field) => field.primaryKey && field.type.id === 'geometry'
        )
    );

const mockExportPrismaSchema = async ({
    version,
    diagram,
}: {
    version: '6' | '7';
    diagram: Diagram;
}): Promise<PrismaExportResult> => {
    if (hasBlockingGeometryPrimaryKey(diagram)) {
        return {
            success: false,
            error: {
                code: 'unsupported_structural_field',
                message: 'Unsupported structural field type',
                path: 'shapes.geom',
            },
        };
    }

    const tables = diagram.tables ?? [];
    const foxaldbTables = tables.filter((table) => table.schema === 'foxaldb');
    if (foxaldbTables.length === 3) {
        return {
            success: true,
            schema: buildMockPrismaSchema(version, diagram.databaseType),
            notes: [
                {
                    code: 'schema_namespace_unsupported',
                    message: 'Schema namespace unsupported',
                    path: 'foxaldb',
                    metadata: {
                        count: 3,
                        affectedPaths: foxaldbTables.map((table) => table.name),
                    },
                },
            ],
        };
    }

    if (tables.some((table) => table.schema === 'auth')) {
        return {
            success: true,
            schema: buildMockPrismaSchema(version, diagram.databaseType),
            notes: [
                {
                    code: 'schema_namespace_unsupported',
                    message: 'Schema namespace unsupported',
                    path: 'auth',
                    metadata: {
                        count: 1,
                        affectedPaths: ['users'],
                    },
                },
            ],
        };
    }

    return {
        success: true,
        schema: buildMockPrismaSchema(version, diagram.databaseType),
        notes: [],
    };
};

const openPrismaBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', {
            name: 'export_wizard.targets.prisma.title',
        })
    );
};

const waitForPrismaPreview = async () => {
    await waitFor(() => {
        expect(
            screen.getByTestId('export-prisma-preview-container')
        ).toBeInTheDocument();
    });
};

const expectActivePrismaVersion = (version: '6' | '7') => {
    expect(screen.getByTestId(`prisma-version-${version}`)).toHaveAttribute(
        'data-state',
        'active'
    );
};

describe('Prisma export target availability', () => {
    const guestContext = (databaseType: DatabaseType) => ({
        isAuthenticated: false,
        diagramId: 'guest-diagram-1',
        databaseType,
    });

    const authenticatedContext = (databaseType: DatabaseType) => ({
        isAuthenticated: true,
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
        it(`hides Prisma for guests on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'prisma',
                    guestContext(databaseType)
                )
            ).toEqual({
                status: 'hidden',
            });
        });

        it(`marks Prisma as available for authenticated users on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'prisma',
                    authenticatedContext(databaseType)
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
        it(`hides Prisma for guests on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'prisma',
                    guestContext(databaseType)
                )
            ).toEqual({
                status: 'hidden',
            });
        });

        it(`disables Prisma for authenticated users on unsupported ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'prisma',
                    authenticatedContext(databaseType)
                )
            ).toEqual({
                status: 'disabled',
                reasonKey: 'export_wizard.prisma.unsupported_database',
            });
        });
    }

    it('does not require a backend diagram ID for authenticated Prisma availability', () => {
        expect(
            getExportTargetAvailability('prisma', {
                isAuthenticated: true,
                diagramId: 'guest-diagram-1',
                databaseType: DatabaseType.POSTGRESQL,
            })
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
        authState.isAuthenticated = true;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL
        );
        exportPrismaSchemaMock.mockImplementation(mockExportPrismaSchema);
    });

    it('opens Prisma preview directly when Prisma is selected', async () => {
        await openPrismaBranch();

        expect(
            screen.getByText('export_wizard.targets.prisma.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-prisma-version-step')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('prisma-version-continue')
        ).not.toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-export-version-toggle')
            ).toBeInTheDocument();
        });
    });

    it('defaults to Prisma 7 in the preview toggle', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        expectActivePrismaVersion('7');
    });

    it('allows selecting Prisma 6 in the preview toggle', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        await userEvent.click(screen.getByTestId('prisma-version-6'));

        expectActivePrismaVersion('6');
    });

    it('shows Prisma 7 output by default', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        const schema = screen.getByTestId('prisma-schema-content').textContent;
        expect(schema).toContain('provider = "prisma-client"');
        expect(schema).toContain('output   = "../generated/prisma"');
        expect(schema).not.toContain('url      = env("DATABASE_URL")');
    });

    it('shows Prisma 6 preview contract when Prisma 6 is selected', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        await userEvent.click(screen.getByTestId('prisma-version-6'));

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-schema-content')
            ).toHaveTextContent('prisma-client-js');
        });

        const schema = screen.getByTestId('prisma-schema-content').textContent;
        expect(schema).toContain('url      = env("DATABASE_URL")');
        expect(schema).not.toContain('output   = "../generated/prisma"');
    });

    it('navigates back from preview to target picker', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        await userEvent.click(screen.getByText('export_wizard.back'));

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-prisma-preview-container')
        ).not.toBeInTheDocument();
    });

    it('regenerates when switching from Prisma 7 to Prisma 6 in preview', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        await userEvent.click(screen.getByTestId('prisma-version-6'));

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-schema-content')
            ).toHaveTextContent('prisma-client-js');
        });
    });

    it('regenerates when switching from Prisma 6 to Prisma 7 in preview', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        await userEvent.click(screen.getByTestId('prisma-version-6'));

        await waitFor(() => {
            expect(
                screen.getByTestId('prisma-schema-content')
            ).toHaveTextContent('prisma-client-js');
        });

        await userEvent.click(screen.getByTestId('prisma-version-7'));

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
            screen.getByRole('button', {
                name: 'export_wizard.targets.prisma.title',
            })
        );
        await waitForPrismaPreview();
        await userEvent.click(screen.getByTestId('prisma-version-6'));

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.prisma.title',
            })
        );
        await waitForPrismaPreview();

        expectActivePrismaVersion('7');
    });

    it('clears preview state when the wizard reopens', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.prisma.title',
            })
        );
        await waitForPrismaPreview();

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
        await waitForPrismaPreview();

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
        await waitForPrismaPreview();

        expect(
            screen.getByTestId('export-prisma-preview-container')
        ).toHaveClass('h-96', 'min-h-72', 'w-full', 'shrink-0');
    });

    it('uses Prisma syntax highlighting in the code preview', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        expect(screen.getByTestId('code-snippet')).toHaveAttribute(
            'data-language',
            'prisma'
        );
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
        await waitForPrismaPreview();

        expect(
            screen.getByTestId('export-prisma-limitations')
        ).toBeInTheDocument();
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
        await waitForPrismaPreview();

        const limitationItems = screen
            .getByTestId('export-prisma-limitations')
            .querySelectorAll('li');

        expect(limitationItems).toHaveLength(1);
        expect(limitationItems[0]?.textContent).toContain('(3');
    });

    it('calls the backend export API with the selected version and diagram', async () => {
        await openPrismaBranch();

        await waitFor(() => {
            expect(exportPrismaSchemaMock).toHaveBeenCalledWith({
                version: '7',
                diagram: chartDbState.currentDiagram,
            });
        });
    });

    it('shows a loading state while the backend request is in flight', async () => {
        let resolveExport: ((value: PrismaExportResult) => void) | undefined;
        exportPrismaSchemaMock.mockImplementationOnce(
            () =>
                new Promise<PrismaExportResult>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openPrismaBranch();

        expect(
            screen.getByTestId('export-prisma-generating')
        ).toBeInTheDocument();

        resolveExport?.({
            success: true,
            schema: buildMockPrismaSchema('7', DatabaseType.POSTGRESQL),
            notes: [],
        });

        await waitForPrismaPreview();
    });

    it('shows unexpected error state for HTTP failures', async () => {
        exportPrismaSchemaMock.mockRejectedValueOnce(
            new ApiError('Too Many Requests', 429, {
                message: 'Too Many Requests',
            })
        );

        await openPrismaBranch();

        await waitFor(() => {
            expect(
                screen.getByTestId('export-prisma-generation-error')
            ).toBeInTheDocument();
        });
    });

    it('does not trigger duplicate generation requests on preview entry', async () => {
        await openPrismaBranch();
        await waitForPrismaPreview();

        expect(exportPrismaSchemaMock).toHaveBeenCalledTimes(1);
    });

    it('ignores stale backend responses after navigating back', async () => {
        let resolveExport: ((value: PrismaExportResult) => void) | undefined;
        exportPrismaSchemaMock.mockImplementationOnce(
            () =>
                new Promise<PrismaExportResult>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openPrismaBranch();
        await userEvent.click(screen.getByText('export_wizard.back'));

        resolveExport?.({
            success: true,
            schema: buildMockPrismaSchema('7', DatabaseType.POSTGRESQL),
            notes: [],
        });

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-prisma-preview-container')
        ).not.toBeInTheDocument();
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

    it('hides Prisma for guests on supported databases', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.prisma.title')
        ).not.toBeInTheDocument();
    });

    it('hides Prisma for guests on unsupported databases', async () => {
        chartDbState.databaseType = DatabaseType.ORACLE;
        chartDbState.currentDiagram = buildSimpleDiagram(DatabaseType.ORACLE);

        render(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_wizard.targets.prisma.title')
        ).not.toBeInTheDocument();
    });

    it('enables Prisma for authenticated users on supported databases', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL,
            { id: 'guest-diagram-1' }
        );

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const prismaButton = screen.getByRole('button', {
            name: 'export_wizard.targets.prisma.title',
        });

        expect(prismaButton).not.toBeDisabled();
    });

    it('disables Prisma for authenticated users on unsupported databases with a localized reason', async () => {
        authState.isAuthenticated = true;
        chartDbState.databaseType = DatabaseType.ORACLE;
        chartDbState.currentDiagram = buildSimpleDiagram(DatabaseType.ORACLE);

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const prismaButton = screen.getByRole('button', {
            name: 'export_wizard.targets.prisma.title',
        });

        expect(prismaButton).toHaveAttribute('aria-disabled', 'true');
        expect(
            within(prismaButton).getByText(
                'export_wizard.targets.unsupported_framework'
            )
        ).toBeInTheDocument();
    });

    it('allows authenticated users without changing Laravel gating', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = buildSimpleDiagram(
            DatabaseType.POSTGRESQL,
            { id: 'guest-diagram-1' }
        );

        render(<ExportWizardDialog dialog={{ open: true }} />);

        const prismaButton = screen.getByRole('button', {
            name: 'export_wizard.targets.prisma.title',
        });

        expect(prismaButton).not.toBeDisabled();
        expect(
            screen.queryByText('export_wizard.targets.laravel.title')
        ).not.toBeInTheDocument();
    });
});
