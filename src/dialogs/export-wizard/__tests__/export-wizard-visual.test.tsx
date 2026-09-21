import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportWizardDialog } from '../export-wizard-dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { VisualExportError } from '@/lib/visual-export/visual-export-options';

const dialogMocks = {
    closeExportWizardDialog: vi.fn(),
    openExportSQLDialog: vi.fn(),
    openExportDiagramDialog: vi.fn(),
};

const exportImageMock = vi.fn();

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => dialogMocks,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated: false,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        databaseType: DatabaseType.POSTGRESQL,
        currentDiagram: {
            id: 'guest-diagram-1',
            name: 'My Diagram',
        },
    }),
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

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (
            key: string,
            options?: { filename?: string; format?: string; scale?: string }
        ) => {
            if (options?.filename) {
                return `${key}:${options.filename}`;
            }
            if (options?.format) {
                return `${key}:${options.format}`;
            }
            if (options?.scale) {
                return `${key}:${options.scale}`;
            }
            return key;
        },
    }),
}));

const openVisualBranch = async (target: 'png' | 'jpg' | 'svg') => {
    render(<ExportWizardDialog dialog={{ open: true }} />);
    await userEvent.click(
        screen.getByRole('button', {
            name: `export_wizard.targets.${target}.title`,
        })
    );
};

describe('ExportWizardDialog visual branch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        exportImageMock.mockResolvedValue(undefined);
    });

    it('routes PNG to visual options without the legacy image dialog', async () => {
        await openVisualBranch('png');

        expect(dialogMocks.closeExportWizardDialog).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('export-visual-options-step')
        ).toHaveAttribute('data-format', 'png');
        expect(
            screen.getByTestId('export-visual-branch-context')
        ).toHaveTextContent(
            'export_wizard.title → export_wizard.targets.png.title'
        );
        expect(screen.getByTestId('visual-extent-diagram')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        expect(screen.getByTestId('visual-scale-2x')).toBeInTheDocument();
        expect(
            screen.getByLabelText('export_wizard.visual.options_step.pattern')
        ).toBeChecked();
        expect(
            screen.getByLabelText(
                'export_wizard.visual.options_step.transparent'
            )
        ).toBeInTheDocument();
        expect(exportImageMock).not.toHaveBeenCalled();
    });

    it('hides the transparent option for JPG', async () => {
        await openVisualBranch('jpg');

        expect(
            screen.getByTestId('export-visual-options-step')
        ).toHaveAttribute('data-format', 'jpg');
        expect(screen.getByTestId('visual-scale-2x')).toBeInTheDocument();
        expect(
            screen.queryByLabelText(
                'export_wizard.visual.options_step.transparent'
            )
        ).not.toBeInTheDocument();
        expect(
            screen.getByLabelText('export_wizard.visual.options_step.pattern')
        ).toBeChecked();
    });

    it('hides scale and transparency for SVG and does not auto-download', async () => {
        await openVisualBranch('svg');

        expect(dialogMocks.closeExportWizardDialog).not.toHaveBeenCalled();
        expect(exportImageMock).not.toHaveBeenCalled();
        expect(
            screen.getByText('export_wizard.visual.options_step.svg_limitation')
        ).toBeInTheDocument();
        expect(screen.queryByTestId('visual-scale-2x')).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText(
                'export_wizard.visual.options_step.transparent'
            )
        ).not.toBeInTheDocument();
        expect(
            screen.getByLabelText('export_wizard.visual.options_step.pattern')
        ).not.toBeChecked();
    });

    it('exports PNG with complete-diagram defaults after explicit confirmation', async () => {
        await openVisualBranch('png');

        await userEvent.click(screen.getByTestId('export-visual-submit'));

        expect(exportImageMock).toHaveBeenCalledWith('png', {
            extent: 'diagram',
            scale: 2,
            includePatternBG: true,
            transparent: false,
        });
    });

    it('exports JPG as opaque jpeg options with .jpg filename', async () => {
        await openVisualBranch('jpg');

        expect(screen.getByTestId('export-visual-filename')).toHaveTextContent(
            'my-diagram.jpg'
        );

        await userEvent.click(screen.getByTestId('export-visual-submit'));

        expect(exportImageMock).toHaveBeenCalledWith('jpg', {
            extent: 'diagram',
            scale: 2,
            includePatternBG: true,
            transparent: false,
        });
    });

    it('navigates back from visual options to the target picker', async () => {
        await openVisualBranch('png');

        await userEvent.click(screen.getByText('export_wizard.back'));

        expect(
            screen.getByText('export_wizard.sections.visual')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-visual-options-step')
        ).not.toBeInTheDocument();
    });

    it('resets visual options when the wizard is reopened', async () => {
        const { rerender } = render(
            <ExportWizardDialog dialog={{ open: true }} />
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.png.title',
            })
        );
        await userEvent.click(screen.getByTestId('visual-extent-viewport'));
        await userEvent.click(screen.getByTestId('visual-scale-4x'));

        rerender(<ExportWizardDialog dialog={{ open: false }} />);
        rerender(<ExportWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_wizard.sections.visual')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('export-visual-options-step')
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.png.title',
            })
        );

        expect(screen.getByTestId('visual-extent-diagram')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        expect(screen.getByTestId('visual-scale-2x')).toBeInTheDocument();
    });

    it('resets format-specific options when switching from PNG to JPG', async () => {
        render(<ExportWizardDialog dialog={{ open: true }} />);

        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.png.title',
            })
        );
        await userEvent.click(
            screen.getByLabelText(
                'export_wizard.visual.options_step.transparent'
            )
        );

        await userEvent.click(screen.getByText('export_wizard.back'));
        await userEvent.click(
            screen.getByRole('button', {
                name: 'export_wizard.targets.jpg.title',
            })
        );

        expect(
            screen.queryByLabelText(
                'export_wizard.visual.options_step.transparent'
            )
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('visual-extent-diagram')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
    });

    it('disables Export while generation is active', async () => {
        let resolveExport: (() => void) | undefined;
        exportImageMock.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveExport = resolve;
                })
        );

        await openVisualBranch('png');
        await userEvent.click(screen.getByTestId('export-visual-submit'));

        expect(screen.getByTestId('export-visual-submit')).toBeDisabled();
        expect(
            screen.getByTestId('export-visual-generating')
        ).toBeInTheDocument();

        resolveExport?.();
        await screen.findByTestId('export-visual-submit');
        expect(screen.getByTestId('export-visual-submit')).not.toBeDisabled();
    });

    it('shows a user-facing error and stays on the visual step', async () => {
        exportImageMock.mockRejectedValueOnce(
            new VisualExportError('raster_too_large')
        );

        await openVisualBranch('png');
        await userEvent.click(screen.getByTestId('export-visual-submit'));

        expect(screen.getByTestId('export-visual-error')).toHaveTextContent(
            'export_wizard.visual.options_step.error_too_large:2x'
        );
        expect(
            screen.getByTestId('export-visual-options-step')
        ).toBeInTheDocument();
        expect(screen.getByTestId('export-visual-submit')).not.toBeDisabled();
    });
});
