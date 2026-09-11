import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { generateDBMLFromDiagram } from '@/lib/dbml/dbml-export/dbml-export';
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

vi.mock('@/lib/dbml/dbml-export/dbml-export', () => ({
    generateDBMLFromDiagram: vi.fn(),
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

const mockedGenerateDBML = vi.mocked(generateDBMLFromDiagram);
const mockedDownloadBlob = vi.mocked(downloadBlob);

const sampleDbml = 'Table users { id int [pk] }';

const openDbmlBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(screen.getByText('export_wizard.targets.dbml.title'));
};

describe('ExportWizardDialog DBML branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGenerateDBML.mockResolvedValue({
            standardDbml: sampleDbml,
            inlineDbml: '',
            relationshipsDbml: '',
        });
    });

    it('enters DBML preview when DBML target is selected', async () => {
        await openDbmlBranch();

        expect(
            screen.getByText('export_wizard.dbml.preview_step.description')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-dbml-branch-context')
        ).toHaveTextContent(
            'export_wizard.title → export_wizard.targets.dbml.title'
        );
    });

    it('generates DBML from the current diagram', async () => {
        await openDbmlBranch();

        await waitFor(() => {
            expect(mockedGenerateDBML).toHaveBeenCalledWith(
                chartDbState.currentDiagram
            );
        });
    });

    it('renders generated DBML with copy and download actions', async () => {
        await openDbmlBranch();

        await waitFor(() => {
            expect(screen.getByText(sampleDbml)).toBeInTheDocument();
        });

        expect(
            screen.getByTestId('export-dbml-preview-container')
        ).toBeInTheDocument();
        expect(screen.getByTestId('code-snippet-copy')).toBeInTheDocument();
        expect(
            screen.getByText('export_wizard.dbml.preview_step.download')
        ).toBeInTheDocument();
    });

    it('downloads the previewed DBML with a .dbml filename', async () => {
        await openDbmlBranch();

        await waitFor(() => {
            expect(screen.getByText(sampleDbml)).toBeInTheDocument();
        });

        await userEvent.click(
            screen.getByText('export_wizard.dbml.preview_step.download')
        );

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('my-diagram.dbml');
        await expect(blob.text()).resolves.toBe(sampleDbml);
    });

    it('navigates back from DBML preview to target picker', async () => {
        await openDbmlBranch();

        await waitFor(() => {
            expect(mockedGenerateDBML).toHaveBeenCalled();
        });

        await userEvent.click(screen.getByText('export_wizard.back'));

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
    });

    it('resets DBML state when the wizard is reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByText('export_wizard.targets.dbml.title')
        );

        await waitFor(() => {
            expect(mockedGenerateDBML).toHaveBeenCalledTimes(1);
        });

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(mockedGenerateDBML).toHaveBeenCalledTimes(1);
    });
});

describe('ExportWizardDialog DBML availability', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGenerateDBML.mockResolvedValue({
            standardDbml: sampleDbml,
            inlineDbml: '',
            relationshipsDbml: '',
        });
    });

    it('enables the DBML target in the picker', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        const dbmlButton = screen
            .getByText('export_wizard.targets.dbml.title')
            .closest('button');

        expect(dbmlButton).not.toBeDisabled();
        expect(
            screen.queryByText('export_wizard.targets.dbml.coming_soon')
        ).not.toBeInTheDocument();
    });
});
