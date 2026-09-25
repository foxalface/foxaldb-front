import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { exportBaseSQL } from '@/lib/data/sql-export/export-sql-script';
import { downloadBlob } from '@/lib/download-blob';

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
        name: 'My Diagram',
        databaseType: DatabaseType.POSTGRESQL,
        tables: [],
        relationships: [],
    },
};

const filterState = {
    filter: {
        tableIds: [],
        schemas: [],
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
    useDiagramFilter: () => filterState,
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({
        effectiveTheme: 'light',
    }),
}));

vi.mock('@/lib/data/sql-export/export-sql-script', () => ({
    exportBaseSQL: vi.fn(),
}));

vi.mock('@/lib/download-blob', () => ({
    downloadBlob: vi.fn(),
}));

vi.mock('@/components/code-snippet/code-snippet', () => ({
    CodeSnippet: ({
        code,
        className,
        editorProps,
    }: {
        code: string;
        className?: string;
        editorProps?: {
            onMount?: (editor: unknown, monaco: unknown) => void;
        };
    }) => {
        React.useEffect(() => {
            editorProps?.onMount?.({}, {});
        }, [editorProps]);

        return (
            <div data-testid="code-snippet" data-classname={className}>
                <pre>{code}</pre>
                <button type="button" data-testid="code-snippet-copy">
                    copy
                </button>
            </div>
        );
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockedExportBaseSQL = vi.mocked(exportBaseSQL);
const mockedDownloadBlob = vi.mocked(downloadBlob);

const openSqlBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', { name: 'export_wizard.targets.sql.title' })
    );
};

describe('ExportWizardDialog SQL branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = {
            id: 'guest-diagram-1',
            name: 'My Diagram',
            databaseType: DatabaseType.POSTGRESQL,
            tables: [],
            relationships: [],
        };
        mockedExportBaseSQL.mockResolvedValue('CREATE TABLE users ();');
    });

    it('opens the SQL target step from the target picker without the legacy dialog', async () => {
        await openSqlBranch();

        expect(dialogMocks.openExportSQLDialog).not.toHaveBeenCalled();
        expect(
            screen.getByText('export_wizard.sql.target_step.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-sql-branch-context')
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('export_wizard.sql.target_step.description')
        ).toBeInTheDocument();
        expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
        expect(screen.getByText('MySQL')).toBeInTheDocument();
        expect(screen.getByText('MariaDB')).toBeInTheDocument();
        expect(screen.getByText('SQL Server')).toBeInTheDocument();
        expect(screen.queryByText('SQLite')).not.toBeInTheDocument();
        expect(screen.getByText('export_wizard.back')).toBeInTheDocument();
    });

    it('generates deterministic PostgreSQL to MySQL SQL in preview', async () => {
        await openSqlBranch();
        await userEvent.click(screen.getByText('MySQL'));

        await waitFor(() => {
            expect(mockedExportBaseSQL).toHaveBeenCalledWith({
                diagram: chartDbState.currentDiagram,
                targetDatabaseType: DatabaseType.MYSQL,
            });
        });

        expect(
            screen.getByText('export_wizard.targets.sql.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('export_wizard.sql.preview_step.description')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('export-sql-preview-container')
        ).toBeInTheDocument();
        expect(screen.getByTestId('code-snippet-copy')).toBeInTheDocument();
        expect(screen.getByText('CREATE TABLE users ();')).toBeInTheDocument();
        expect(screen.getByTestId('export-sql-download')).toBeInTheDocument();
    });

    it('navigates back from preview to SQL target and to target picker', async () => {
        await openSqlBranch();
        await userEvent.click(screen.getByText('MySQL'));

        await waitFor(() => {
            expect(mockedExportBaseSQL).toHaveBeenCalled();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));
        expect(
            screen.getByText('export_wizard.sql.target_step.title')
        ).toBeInTheDocument();
        expect(
            screen.getByText('export_wizard.sql.target_step.description')
        ).toBeInTheDocument();

        await userEvent.click(screen.getByText('export_wizard.back'));
        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
    });

    it('downloads the previewed SQL with a cross-dialect filename', async () => {
        await openSqlBranch();
        await userEvent.click(screen.getByText('MySQL'));

        await waitFor(() => {
            expect(
                screen.getByText('CREATE TABLE users ();')
            ).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId('export-sql-download'));

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('my-diagram-mysql.sql');
        await expect(blob.text()).resolves.toBe('CREATE TABLE users ();');
    });

    it('resets SQL state when the wizard is reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.sql.title',
            })
        );
        await userEvent.click(screen.getByText('MySQL'));

        await waitFor(() => {
            expect(mockedExportBaseSQL).toHaveBeenCalledTimes(1);
        });

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(mockedExportBaseSQL).toHaveBeenCalledTimes(1);
    });
});

describe('ExportWizardDialog SQL branch by source database', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedExportBaseSQL.mockResolvedValue('SELECT 1;');
    });

    it('skips the SQL target step for a MySQL source diagram', async () => {
        chartDbState.databaseType = DatabaseType.MYSQL;
        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            databaseType: DatabaseType.MYSQL,
        };

        await openSqlBranch();

        expect(
            screen.getByText('export_wizard.targets.sql.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('export_wizard.sql.target_step.title')
        ).not.toBeInTheDocument();
        await waitFor(() => {
            expect(mockedExportBaseSQL).toHaveBeenCalledWith({
                diagram: chartDbState.currentDiagram,
                targetDatabaseType: DatabaseType.MYSQL,
            });
        });
    });

    it('skips the SQL target step for a MariaDB source diagram', async () => {
        chartDbState.databaseType = DatabaseType.MARIADB;
        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            databaseType: DatabaseType.MARIADB,
        };

        await openSqlBranch();

        expect(
            screen.getByText('export_wizard.targets.sql.title')
        ).toBeInTheDocument();
        await waitFor(() => {
            expect(mockedExportBaseSQL).toHaveBeenCalledWith({
                diagram: chartDbState.currentDiagram,
                targetDatabaseType: DatabaseType.MARIADB,
            });
        });
    });

    it('skips the SQL target step for a SQL Server source diagram', async () => {
        chartDbState.databaseType = DatabaseType.SQL_SERVER;
        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            databaseType: DatabaseType.SQL_SERVER,
        };

        await openSqlBranch();

        expect(
            screen.getByText('export_wizard.targets.sql.title')
        ).toBeInTheDocument();
        await waitFor(() => {
            expect(mockedExportBaseSQL).toHaveBeenCalledWith({
                diagram: chartDbState.currentDiagram,
                targetDatabaseType: DatabaseType.SQL_SERVER,
            });
        });
    });

    it('skips the SQL target step for a SQLite source diagram', async () => {
        chartDbState.databaseType = DatabaseType.SQLITE;
        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            databaseType: DatabaseType.SQLITE,
        };

        await openSqlBranch();

        expect(
            screen.getByText('export_wizard.targets.sql.title')
        ).toBeInTheDocument();
        await waitFor(() => {
            expect(mockedExportBaseSQL).toHaveBeenCalledWith({
                diagram: chartDbState.currentDiagram,
                targetDatabaseType: DatabaseType.SQLITE,
            });
        });
    });

    it('navigates back from a single-target preview directly to the target picker', async () => {
        chartDbState.databaseType = DatabaseType.MYSQL;
        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            databaseType: DatabaseType.MYSQL,
        };

        await openSqlBranch();

        await waitFor(() => {
            expect(mockedExportBaseSQL).toHaveBeenCalled();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('export_wizard.sql.target_step.title')
        ).not.toBeInTheDocument();
    });

    it('shows unsupported SQL UX for Oracle source diagrams', async () => {
        chartDbState.databaseType = DatabaseType.ORACLE;
        chartDbState.currentDiagram = {
            ...chartDbState.currentDiagram,
            databaseType: DatabaseType.ORACLE,
        };

        await openSqlBranch();

        expect(
            screen.getByRole('heading', {
                name: 'export_wizard.sql.unsupported_source.title',
            })
        ).toBeInTheDocument();
        expect(screen.queryByText('Oracle')).not.toBeInTheDocument();
        expect(dialogMocks.openExportSQLDialog).not.toHaveBeenCalled();
    });
});
