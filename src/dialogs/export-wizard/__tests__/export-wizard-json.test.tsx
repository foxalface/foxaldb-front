import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { downloadBlob } from '@/lib/download-blob';
import { diagramToJSONOutput } from '@/lib/export-import-utils';
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

const currentDiagram: Diagram = {
    id: 'guest-diagram-1',
    name: 'My Diagram',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [],
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
        t: (key: string, options?: { filename?: string }) =>
            options?.filename ? `${key}:${options.filename}` : key,
    }),
}));

const mockedDownloadBlob = vi.mocked(downloadBlob);

const openJsonBranch = async () => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', {
            name: 'export_wizard.targets.diagram_json.title',
        })
    );
};

describe('ExportWizardDialog JSON branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('enters JSON download without opening ExportDiagramDialog', async () => {
        await openJsonBranch();

        expect(dialogMocks.openExportDiagramDialog).not.toHaveBeenCalled();
        expect(dialogMocks.closeExportWizardDialog).not.toHaveBeenCalled();
        expect(
            screen.getByText('export_wizard.targets.diagram_json.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('export_wizard.json.download_step.description')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('export-json-branch-context')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('export-json-preview-container')
        ).toBeInTheDocument();
        expect(screen.getByTestId('code-snippet-copy')).toBeInTheDocument();
        expect(screen.getByTestId('export-json-download')).toBeInTheDocument();
        expect(screen.getByTestId('code-snippet')).toHaveTextContent(
            '"schemaVersion"'
        );
    });

    it('downloads the shared serializer output as application/json', async () => {
        await openJsonBranch();

        await userEvent.click(screen.getByTestId('export-json-download'));

        expect(mockedDownloadBlob).toHaveBeenCalledTimes(1);
        const [blob, filename] = mockedDownloadBlob.mock.calls[0];
        expect(filename).toBe('my-diagram.json');
        expect(blob.type).toBe('application/json');
        await expect(blob.text()).resolves.toBe(
            diagramToJSONOutput(currentDiagram)
        );
    });

    it('navigates back from JSON download to the target picker', async () => {
        await openJsonBranch();

        await userEvent.click(screen.getByText('export_wizard.back'));

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-json-download-step')
        ).not.toBeInTheDocument();
    });

    it('resets the JSON branch when the wizard is reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.diagram_json.title',
            })
        );

        expect(
            screen.getByTestId('export-json-download-step')
        ).toBeInTheDocument();

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.database')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-json-download-step')
        ).not.toBeInTheDocument();
    });
});
