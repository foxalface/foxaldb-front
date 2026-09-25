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
        editorProps,
    }: {
        code: string;
        className?: string;
        actions?: Array<{ label: string; onClick: () => void }>;
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
        );
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockedGenerateDBML = vi.mocked(generateDBMLFromDiagram);
const mockedDownloadBlob = vi.mocked(downloadBlob);

const sampleStandardDbml = 'Table users { id int [pk] }';
const sampleInlineDbml = 'Table users { id int [pk, ref: > other.id] }';

const openDbmlBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', { name: 'export_wizard.targets.dbml.title' })
    );
};

describe('ExportWizardDialog DBML branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGenerateDBML.mockResolvedValue({
            standardDbml: sampleStandardDbml,
            inlineDbml: sampleInlineDbml,
            relationshipsDbml: '',
        });
    });

    it('enters DBML preview when DBML target is selected', async () => {
        await openDbmlBranch();

        expect(
            screen.getByText('export_wizard.targets.dbml.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('export_wizard.dbml.preview_step.description')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('export-dbml-branch-context')
        ).not.toBeInTheDocument();
    });

    it('generates DBML from the current diagram', async () => {
        await openDbmlBranch();

        await waitFor(() => {
            expect(mockedGenerateDBML).toHaveBeenCalledWith(
                chartDbState.currentDiagram
            );
        });
    });

    it('shows the ref format toggle and skeleton while DBML is generating', async () => {
        let resolveGenerate:
            | ((value: {
                  standardDbml: string;
                  inlineDbml: string;
                  relationshipsDbml: string;
              }) => void)
            | undefined;

        mockedGenerateDBML.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveGenerate = resolve;
                })
        );

        await openDbmlBranch();

        expect(
            screen.getByTestId('dbml-ref-format-toggle')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-dbml-generating')
        ).toBeInTheDocument();

        resolveGenerate?.({
            standardDbml: sampleStandardDbml,
            inlineDbml: sampleInlineDbml,
            relationshipsDbml: '',
        });

        await waitFor(() => {
            expect(screen.getByText(sampleStandardDbml)).toBeInTheDocument();
        });
    });

    it('renders generated DBML with ref format toggle, copy and footer export action', async () => {
        await openDbmlBranch();

        await waitFor(() => {
            expect(screen.getByText(sampleStandardDbml)).toBeInTheDocument();
        });

        expect(
            screen.getByTestId('dbml-ref-format-toggle')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-dbml-preview-container')
        ).toBeInTheDocument();
        expect(screen.getByTestId('code-snippet-copy')).toBeInTheDocument();
        expect(screen.getByTestId('export-dbml-download')).toBeInTheDocument();
    });

    it('defaults to standard refs and can switch to inline refs', async () => {
        await openDbmlBranch();

        await waitFor(() => {
            expect(screen.getByText(sampleStandardDbml)).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId('dbml-ref-format-inline'));

        await waitFor(() => {
            expect(screen.getByText(sampleInlineDbml)).toBeInTheDocument();
        });

        expect(
            screen.queryByTestId('export-dbml-generating')
        ).not.toBeInTheDocument();
    });

    it('downloads the selected ref format with a .dbml filename', async () => {
        await openDbmlBranch();

        await waitFor(() => {
            expect(screen.getByText(sampleStandardDbml)).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId('export-dbml-download'));

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        let [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('my-diagram.dbml');
        await expect(blob.text()).resolves.toBe(sampleStandardDbml);

        await userEvent.click(screen.getByTestId('dbml-ref-format-inline'));
        await userEvent.click(screen.getByTestId('export-dbml-download'));

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(2);
        [blob, filename] = mockedDownloadBlob.mock.calls[1];
        expect(filename).toBe('my-diagram.dbml');
        await expect(blob.text()).resolves.toBe(sampleInlineDbml);
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
            screen.getByRole('button', {
                name: 'export_wizard.targets.dbml.title',
            })
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
            standardDbml: sampleStandardDbml,
            inlineDbml: sampleInlineDbml,
            relationshipsDbml: '',
        });
    });

    it('enables the DBML target in the picker', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        const dbmlButton = screen.getByRole('button', {
            name: 'export_wizard.targets.dbml.title',
        });

        expect(dbmlButton).not.toBeDisabled();
        expect(
            screen.queryByText('export_wizard.targets.dbml.coming_soon')
        ).not.toBeInTheDocument();
    });
});
