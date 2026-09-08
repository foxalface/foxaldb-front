import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportDialog } from '../export-dialog';
import { DatabaseType } from '@/lib/domain/database-type';

const dialogMocks = {
    closeExportDialog: vi.fn(),
    openExportSQLDialog: vi.fn(),
    openExportDiagramDialog: vi.fn(),
    openExportImageDialog: vi.fn(),
    openExportLaravelMigrationsDialog: vi.fn(),
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

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ExportDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authState.isAuthenticated = false;
        chartDbState.databaseType = DatabaseType.POSTGRESQL;
        chartDbState.currentDiagram = {
            id: 'guest-diagram-1',
            name: 'Guest diagram',
        };
    });

    it('renders schema/code and visual sections', () => {
        render(<ExportDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_dialog.schema_code_section')
        ).toBeInTheDocument();
        expect(
            screen.getByText('export_dialog.visual_section')
        ).toBeInTheDocument();
    });

    it('routes SQL to the existing SQL export dialog', async () => {
        render(<ExportDialog dialog={{ open: true }} />);

        await userEvent.click(screen.getByText('export_dialog.sql.title'));

        expect(dialogMocks.closeExportDialog).toHaveBeenCalledTimes(1);
        expect(dialogMocks.openExportSQLDialog).toHaveBeenCalledWith({
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });
    });

    it('routes diagram JSON to the existing export dialog', async () => {
        render(<ExportDialog dialog={{ open: true }} />);

        await userEvent.click(
            screen.getByText('export_dialog.diagram_json.title')
        );

        expect(dialogMocks.closeExportDialog).toHaveBeenCalledTimes(1);
        expect(dialogMocks.openExportDiagramDialog).toHaveBeenCalledTimes(1);
    });

    it('routes PNG and JPG to the existing image export dialog', async () => {
        render(<ExportDialog dialog={{ open: true }} />);

        await userEvent.click(screen.getByText('export_dialog.png.title'));
        expect(dialogMocks.openExportImageDialog).toHaveBeenCalledWith({
            format: 'png',
        });

        await userEvent.click(screen.getByText('export_dialog.jpg.title'));
        expect(dialogMocks.openExportImageDialog).toHaveBeenCalledWith({
            format: 'jpeg',
        });
    });

    it('routes SVG to the existing image export behavior', async () => {
        render(<ExportDialog dialog={{ open: true }} />);

        await userEvent.click(screen.getByText('export_dialog.svg.title'));

        expect(dialogMocks.closeExportDialog).toHaveBeenCalledTimes(1);
        expect(exportImageMock).toHaveBeenCalledWith('svg', {
            scale: 1,
            transparent: true,
            includePatternBG: false,
        });
    });

    it('shows DBML as disabled coming soon', () => {
        render(<ExportDialog dialog={{ open: true }} />);

        const dbmlButton = screen
            .getByText('export_dialog.dbml.title')
            .closest('button');

        expect(dbmlButton).toBeDisabled();
        expect(
            screen.getByText('export_dialog.dbml.coming_soon')
        ).toBeInTheDocument();
    });

    it('hides Laravel export for guests', () => {
        render(<ExportDialog dialog={{ open: true }} />);

        expect(
            screen.queryByText('export_dialog.laravel_migrations.title')
        ).not.toBeInTheDocument();
    });

    it('shows Laravel export for authenticated backend diagrams', async () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagram = {
            id: '42',
            name: 'Remote diagram',
        };

        render(<ExportDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('export_dialog.laravel_migrations.title')
        ).toBeInTheDocument();

        await userEvent.click(
            screen.getByText('export_dialog.laravel_migrations.title')
        );

        expect(
            dialogMocks.openExportLaravelMigrationsDialog
        ).toHaveBeenCalledWith({
            diagramId: '42',
            diagramName: 'Remote diagram',
        });
    });
});
