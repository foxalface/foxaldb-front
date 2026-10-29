import React, { useEffect } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import { ImportDiagramDialog } from '../import-diagram-dialog';
import {
    CreateDiagramSessionDestinationProvider,
    useCreateDiagramSessionDestinationRequired,
} from '@/dialogs/create-diagram-dialog/create-diagram-session-destination-context';
import { RestoreDiagramJsonParseError } from '@/lib/diagram-restore/restore-diagram-from-json-backup';
import { ApiError } from '@/lib/api/client';

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

const uploadAndRestore = async (createOpen = false) => {
    const file = new File(['{}'], 'backup.json', {
        type: 'application/json',
    });

    render(
        <CreateDiagramSessionDestinationProvider createDialogOpen={createOpen}>
            <ImportDiagramDialog dialog={{ open: true }} />
        </CreateDiagramSessionDestinationProvider>
    );

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

    it('lets an authenticated create session keep Device over the standalone Online default', async () => {
        isAuthenticated = true;
        persistRestoredDiagramFromJson.mockResolvedValue({
            destination: 'device',
            localId: deviceDiagram.id,
            diagram: deviceDiagram,
        });

        const ChooseDevice: React.FC = () => {
            const { isCreateSessionActive, setDestination } =
                useCreateDiagramSessionDestinationRequired();

            useEffect(() => {
                if (!isCreateSessionActive) {
                    return;
                }

                setDestination('device');
            }, [isCreateSessionActive, setDestination]);

            return <ImportDiagramDialog dialog={{ open: true }} />;
        };

        const file = new File(['{}'], 'backup.json', {
            type: 'application/json',
        });
        render(
            <CreateDiagramSessionDestinationProvider createDialogOpen>
                <ChooseDevice />
            </CreateDiagramSessionDestinationProvider>
        );
        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;
        await userEvent.upload(input, file);
        await userEvent.click(
            screen.getByRole('button', { name: 'import_diagram_dialog.import' })
        );

        await waitFor(() => {
            expect(persistRestoredDiagramFromJson).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    destination: 'device',
                    isAuthenticated: true,
                })
            );
        });
    });

    it('shows the error and does not open when parsing or creation fails', async () => {
        persistRestoredDiagramFromJson.mockRejectedValue(
            new RestoreDiagramJsonParseError({
                code: 'invalid_diagram_json',
                path: null,
                issueCode: 'invalid_json',
            })
        );

        await uploadAndRestore();

        expect(
            await screen.findByText('import_diagram_dialog.error.title')
        ).toBeInTheDocument();
        expect(navigate).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(clearDiagramAccess).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();

        persistRestoredDiagramFromJson.mockRejectedValue(
            new ApiError('Unauthenticated', 401, null)
        );
        await userEvent.click(
            screen.getByRole('button', { name: 'import_diagram_dialog.import' })
        );

        await waitFor(() => {
            expect(persistRestoredDiagramFromJson).toHaveBeenCalledTimes(2);
        });
        expect(navigate).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('ignores a file read that finishes after the dialog closes', async () => {
        let finishRead: (() => void) | undefined;
        class DeferredFileReader {
            result: string | ArrayBuffer | null = '{}';
            onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
            onerror: (() => void) | null = null;

            readAsText(): void {
                finishRead = () => {
                    this.onload?.({
                        target: this,
                    } as unknown as ProgressEvent<FileReader>);
                };
            }
        }
        const view = render(
            <CreateDiagramSessionDestinationProvider createDialogOpen={false}>
                <ImportDiagramDialog dialog={{ open: true }} />
            </CreateDiagramSessionDestinationProvider>
        );
        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;
        await userEvent.upload(
            input,
            new File(['{}'], 'backup.json', { type: 'application/json' })
        );
        vi.stubGlobal('FileReader', DeferredFileReader);
        await userEvent.click(
            screen.getByRole('button', { name: 'import_diagram_dialog.import' })
        );
        view.rerender(
            <CreateDiagramSessionDestinationProvider createDialogOpen={false}>
                <ImportDiagramDialog dialog={{ open: false }} />
            </CreateDiagramSessionDestinationProvider>
        );
        finishRead?.();

        await waitFor(() => {
            expect(finishRead).toBeTypeOf('function');
        });
        expect(persistRestoredDiagramFromJson).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
    });

    it('does not navigate when the dialog closes while creation is still pending', async () => {
        let finishPersist: ((value: unknown) => void) | undefined;
        persistRestoredDiagramFromJson.mockImplementation(
            () =>
                new Promise((resolve) => {
                    finishPersist = resolve;
                })
        );

        const view = render(
            <CreateDiagramSessionDestinationProvider createDialogOpen={false}>
                <ImportDiagramDialog dialog={{ open: true }} />
            </CreateDiagramSessionDestinationProvider>
        );
        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;
        await userEvent.upload(
            input,
            new File(['{}'], 'backup.json', { type: 'application/json' })
        );
        await userEvent.click(
            screen.getByRole('button', { name: 'import_diagram_dialog.import' })
        );

        await waitFor(() => {
            expect(persistRestoredDiagramFromJson).toHaveBeenCalledTimes(1);
        });

        view.rerender(
            <CreateDiagramSessionDestinationProvider createDialogOpen={false}>
                <ImportDiagramDialog dialog={{ open: false }} />
            </CreateDiagramSessionDestinationProvider>
        );
        await act(async () => {
            finishPersist?.({ destination: 'online', diagramId: '42' });
        });

        expect(navigate).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(closeImportDiagramDialog).not.toHaveBeenCalled();
    });
});
