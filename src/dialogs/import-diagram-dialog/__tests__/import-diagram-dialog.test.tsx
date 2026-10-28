import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import { ImportDiagramDialog } from '../import-diagram-dialog';

const persistRestoredDiagramFromJson = vi.fn();
const navigate = vi.fn();
const updateConfig = vi.fn();
const loadDiagramFromData = vi.fn();
const setDiagramLocation = vi.fn();
const clearDiagramAccess = vi.fn();
const closeImportDiagramDialog = vi.fn();
const closeCreateDiagramDialog = vi.fn();

let isAuthenticated = true;

const deviceDiagram: Diagram = {
    id: 'local-restored',
    name: 'Backup',
    databaseType: DatabaseType.POSTGRESQL,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

vi.mock('@/lib/diagram-restore/restore-diagram-from-json-backup', () => ({
    persistRestoredDiagramFromJson: (...args: unknown[]) =>
        persistRestoredDiagramFromJson(...args),
    RestoreDiagramJsonParseError: class RestoreDiagramJsonParseError extends Error {},
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ isAuthenticated }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        loadDiagramFromData,
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: null,
        setDiagramLocation,
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: null,
        setDiagramAccess: vi.fn(),
        clearDiagramAccess,
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
        closeImportDiagramDialog,
        closeCreateDiagramDialog,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const uploadAndRestore = async () => {
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
};

describe('ImportDiagramDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isAuthenticated = true;
        updateConfig.mockResolvedValue(undefined);
        persistRestoredDiagramFromJson.mockResolvedValue({
            destination: 'online',
            diagramId: '42',
        });
    });

    it('restores online by navigating and leaving hydration to the open path', async () => {
        await uploadAndRestore();

        await waitFor(() => {
            expect(persistRestoredDiagramFromJson).toHaveBeenCalledTimes(1);
        });

        expect(persistRestoredDiagramFromJson).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                destination: 'online',
                isAuthenticated: true,
            })
        );
        expect(navigate).toHaveBeenCalledWith('/diagrams/42');
        expect(updateConfig).toHaveBeenCalledWith({
            config: { defaultDiagramId: '42' },
        });
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('restores a guest device diagram into Dexie location and memory', async () => {
        isAuthenticated = false;
        persistRestoredDiagramFromJson.mockResolvedValue({
            destination: 'device',
            localId: deviceDiagram.id,
            diagram: deviceDiagram,
        });

        await uploadAndRestore();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith('/diagrams/local-restored');
        });

        expect(persistRestoredDiagramFromJson).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                destination: 'device',
                isAuthenticated: false,
            })
        );
        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'device',
            localId: 'local-restored',
        });
        expect(clearDiagramAccess).toHaveBeenCalled();
        expect(loadDiagramFromData).toHaveBeenCalledWith(deviceDiagram);
        expect(updateConfig).not.toHaveBeenCalled();
        expect(closeImportDiagramDialog).toHaveBeenCalled();
        expect(closeCreateDiagramDialog).toHaveBeenCalled();
    });
});
