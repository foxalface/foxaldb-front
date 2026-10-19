import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportDiagramDialog } from '../import-diagram-dialog';

const persistRestoredDiagramFromJson = vi.fn();
const navigate = vi.fn();
const updateConfig = vi.fn();

vi.mock('@/lib/diagram-restore/restore-diagram-from-json-backup', () => ({
    persistRestoredDiagramFromJson: (...args: unknown[]) =>
        persistRestoredDiagramFromJson(...args),
    RestoreDiagramJsonParseError: class RestoreDiagramJsonParseError extends Error {},
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        loadDiagramFromData: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        addDiagram: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        updateConfig,
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeImportDiagramDialog: vi.fn(),
        closeCreateDiagramDialog: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ImportDiagramDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        persistRestoredDiagramFromJson.mockResolvedValue('42');
        updateConfig.mockResolvedValue(undefined);
    });

    it('restores via shared persistence and navigates to backend id', async () => {
        const file = new File(['{}'], 'backup.json', {
            type: 'application/json',
        });

        render(<ImportDiagramDialog dialog={{ open: true }} />);

        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;
        await userEvent.upload(input, file);

        await userEvent.click(
            screen.getByRole('button', { name: 'import_diagram_dialog.import' })
        );

        await waitFor(() => {
            expect(persistRestoredDiagramFromJson).toHaveBeenCalledTimes(1);
        });

        expect(navigate).toHaveBeenCalledWith('/diagrams/42');
        expect(updateConfig).toHaveBeenCalledWith({
            config: { defaultDiagramId: '42' },
        });
    });
});
