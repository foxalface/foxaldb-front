import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { ImportSchemaContinueParams } from '@/dialogs/common/import-schema/import-schema-step';
import { CreateDiagramDialog } from '../create-diagram-dialog';
import { CreateDiagramSessionDestinationProvider } from '../create-diagram-session-destination-context';

const requestAuthentication = vi.fn();
const registerProtectedActionResume = vi.fn();

vi.mock('@/hooks/use-request-authentication', () => ({
    useRequestAuthentication: () => requestAuthentication,
}));

vi.mock('@/lib/auth-intent', async () => {
    const actual = (await vi.importActual('@/lib/auth-intent')) as Record<
        string,
        unknown
    >;
    return {
        ...actual,
        registerProtectedActionResume: (...args: unknown[]) =>
            registerProtectedActionResume(...args),
    };
});

const closeCreateDiagramDialog = vi.fn();
const addDiagram = vi.fn().mockResolvedValue(undefined);
const createDiagram = vi.fn().mockResolvedValue({ diagram: { id: 99 } });
const navigate = vi.fn();
const updateConfig = vi.fn().mockResolvedValue(undefined);
const loadDiagramFromData = vi.fn();
const listDiagrams = vi.fn().mockResolvedValue([]);
const setDiagramLocation = vi.fn();
const clearDiagramAccess = vi.fn();
const toast = vi.fn();
const importSchema = vi.fn();
const importDiagramFromJson = vi.fn();

let isAuthenticated = false;

const CreateSessionHarness: React.FC<{
    createDialogOpen: boolean;
    dialogOpen: boolean;
    auth: boolean;
    entryCreateDiagramActions?: React.ComponentProps<
        typeof CreateDiagramDialog
    >['entryCreateDiagramActions'];
}> = ({ createDialogOpen, dialogOpen, auth, entryCreateDiagramActions }) => {
    isAuthenticated = auth;
    return (
        <CreateDiagramSessionDestinationProvider
            createDialogOpen={createDialogOpen}
        >
            <CreateDiagramDialog
                dialog={{ open: dialogOpen }}
                entryCreateDiagramActions={entryCreateDiagramActions}
            />
        </CreateDiagramSessionDestinationProvider>
    );
};

const importedDiagram: Diagram = {
    id: 'imported-1',
    name: 'From Laravel',
    databaseType: DatabaseType.POSTGRESQL,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: {
            id: '42',
            name: 'Billing',
            databaseType: 'postgresql',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
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

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeCreateDiagramDialog,
        openAuthDialog: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        updateConfig,
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        listDiagrams,
        addDiagram,
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({
        toast,
    }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    createDiagram: (...args: unknown[]) => createDiagram(...args),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/lib/import/import-schema', () => ({
    importSchema: (...args: unknown[]) => importSchema(...args),
    ImportSchemaResolutionError: class ImportSchemaResolutionError extends Error {},
}));

vi.mock('@/lib/import/import-diagram-from-json', () => ({
    importDiagramFromJson: (...args: unknown[]) =>
        importDiagramFromJson(...args),
    ImportDiagramJsonError: class ImportDiagramJsonError extends Error {},
}));

vi.mock('@/dialogs/common/import-schema/import-schema-step', () => ({
    ImportSchemaStep: (props: {
        onContinue: (params: ImportSchemaContinueParams) => void;
    }) => (
        <div data-testid="import-schema-step">
            <button
                type="button"
                onClick={() =>
                    props.onContinue({
                        importMethod: 'ddl',
                        resolvedSourceDialect: DatabaseType.POSTGRESQL,
                    })
                }
            >
                Continue SQL
            </button>
            <button
                type="button"
                onClick={() =>
                    props.onContinue({
                        importMethod: 'dbml',
                        resolvedSourceDialect: DatabaseType.POSTGRESQL,
                    })
                }
            >
                Continue DBML
            </button>
            <button
                type="button"
                onClick={() =>
                    props.onContinue({
                        importMethod: 'diagram',
                        resolvedSourceDialect: DatabaseType.POSTGRESQL,
                    })
                }
            >
                Continue diagram JSON
            </button>
            <button
                type="button"
                onClick={() =>
                    props.onContinue({
                        importMethod: 'project',
                        importedDiagram,
                    })
                }
            >
                Continue project
            </button>
        </div>
    ),
}));

vi.mock(
    '@/dialogs/create-diagram-dialog/import-from-database/import-from-database-step',
    () => ({
        ImportFromDatabaseStep: (props: {
            onContinue: (content: string) => void;
        }) => (
            <button
                type="button"
                onClick={() =>
                    props.onContinue(JSON.stringify({ tables: [], views: [] }))
                }
            >
                Continue metadata
            </button>
        ),
    })
);

const openFileImport = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
    await user.click(
        screen.getByRole('button', {
            name: /new_diagram_dialog\.choose_intent\.import/,
        })
    );
    await user.click(
        screen.getByRole('button', {
            name: /new_diagram_dialog\.choose_import_method\.from_file/,
        })
    );
};

const createEmpty = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
    await user.click(
        screen.getByRole('button', {
            name: /new_diagram_dialog\.choose_intent\.create_empty/,
        })
    );
};

const renderCreateDialog = (
    options: {
        auth?: boolean;
        entryCreateDiagramActions?: React.ComponentProps<
            typeof CreateDiagramDialog
        >['entryCreateDiagramActions'];
    } = {}
) =>
    render(
        <CreateSessionHarness
            createDialogOpen
            dialogOpen
            auth={options.auth ?? isAuthenticated}
            entryCreateDiagramActions={options.entryCreateDiagramActions}
        />
    );

const onlineTab = () =>
    screen.getByRole('tab', { name: /open_diagram_dialog\.tabs\.online/i });

const deviceTab = () =>
    screen.getByRole('tab', { name: /open_diagram_dialog\.tabs\.device/i });

describe('CreateDiagramDialog destination', () => {
    beforeEach(() => {
        isAuthenticated = false;
        listDiagrams.mockResolvedValue([]);
        importSchema.mockResolvedValue({ diagram: importedDiagram });
        importDiagramFromJson.mockReturnValue(importedDiagram);
        closeCreateDiagramDialog.mockClear();
        addDiagram.mockClear();
        createDiagram.mockClear();
        navigate.mockClear();
        updateConfig.mockClear();
        loadDiagramFromData.mockClear();
        setDiagramLocation.mockClear();
        clearDiagramAccess.mockClear();
        toast.mockClear();
        importSchema.mockClear();
        importDiagramFromJson.mockClear();
        requestAuthentication.mockClear();
        registerProtectedActionResume.mockClear();
    });

    const expectDeviceOpen = () => {
        const saved = addDiagram.mock.calls[0]?.[0] as
            | { diagram: Diagram }
            | undefined;
        expect(saved?.diagram).toBeDefined();
        expect(createDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'device',
            localId: saved?.diagram.id,
        });
        expect(clearDiagramAccess).toHaveBeenCalled();
        expect(loadDiagramFromData).toHaveBeenCalledWith(saved?.diagram);
        expect(navigate).not.toHaveBeenCalled();
    };

    it('keeps a guest SQL import on device storage', async () => {
        const user = userEvent.setup();
        renderCreateDialog();

        await openFileImport(user);
        await user.click(screen.getByRole('button', { name: 'Continue SQL' }));

        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledTimes(1);
        });

        expect(importSchema).toHaveBeenCalled();
        expectDeviceOpen();
    });

    it('keeps a guest DBML import on device storage', async () => {
        const user = userEvent.setup();
        renderCreateDialog();

        await openFileImport(user);
        await user.click(screen.getByRole('button', { name: 'Continue DBML' }));

        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledTimes(1);
        });

        expect(importSchema).toHaveBeenCalled();
        expectDeviceOpen();
    });

    it('keeps a guest metadata import on device storage', async () => {
        const user = userEvent.setup();
        renderCreateDialog();

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.import/,
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_import_method\.from_database/,
            })
        );
        await user.click(
            screen.getByRole('button', { name: 'Continue metadata' })
        );

        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledTimes(1);
        });

        expect(importSchema).toHaveBeenCalled();
        expectDeviceOpen();
    });

    it('keeps a guest diagram JSON import on device storage', async () => {
        const user = userEvent.setup();
        renderCreateDialog();

        await openFileImport(user);
        await user.click(
            screen.getByRole('button', { name: 'Continue diagram JSON' })
        );

        await waitFor(() => {
            expect(importDiagramFromJson).toHaveBeenCalled();
        });

        expect(addDiagram).toHaveBeenCalledTimes(1);
        expectDeviceOpen();
    });

    it('stores a project import on device when the session destination is device', async () => {
        const user = userEvent.setup();
        renderCreateDialog();

        await openFileImport(user);
        await user.click(
            screen.getByRole('button', { name: 'Continue project' })
        );

        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledWith({
                diagram: importedDiagram,
            });
        });

        expect(importSchema).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'device',
            localId: importedDiagram.id,
        });
        expect(loadDiagramFromData).toHaveBeenCalledWith(importedDiagram);
    });

    it('creates an authenticated import online without loading it in the dialog', async () => {
        isAuthenticated = true;
        const user = userEvent.setup();
        renderCreateDialog({ auth: true });

        await openFileImport(user);
        await user.click(screen.getByRole('button', { name: 'Continue SQL' }));

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });

        expect(addDiagram).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith('/diagrams/99');
    });

    it('does not retarget an open guest session when authentication appears', async () => {
        listDiagrams.mockResolvedValue([{ id: 'existing' }]);
        const user = userEvent.setup();
        const { rerender } = render(
            <CreateSessionHarness createDialogOpen dialogOpen auth={false} />
        );

        rerender(
            <CreateSessionHarness createDialogOpen dialogOpen auth={true} />
        );

        await createEmpty(user);

        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledTimes(1);
        });

        expect(createDiagram).not.toHaveBeenCalled();
        expect(toast).not.toHaveBeenCalled();
        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'device',
            localId: (addDiagram.mock.calls[0][0] as { diagram: Diagram })
                .diagram.id,
        });
        expect(loadDiagramFromData).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(
            `/diagrams/${(addDiagram.mock.calls[0][0] as { diagram: Diagram }).diagram.id}`
        );
    });

    it('latches online when a new authenticated session opens', async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <CreateSessionHarness createDialogOpen dialogOpen auth={false} />
        );

        rerender(
            <CreateSessionHarness
                createDialogOpen={false}
                dialogOpen={false}
                auth={false}
            />
        );
        rerender(
            <CreateSessionHarness createDialogOpen dialogOpen auth={true} />
        );

        await createEmpty(user);

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });

        expect(addDiagram).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('applies the guest limit only to an unauthenticated device create', async () => {
        listDiagrams.mockResolvedValue([{ id: 'existing' }]);
        const user = userEvent.setup();
        renderCreateDialog();

        await createEmpty(user);

        await waitFor(() => {
            expect(toast).toHaveBeenCalled();
        });

        expect(addDiagram).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
    });

    it('does not persist when the wizard is cancelled', async () => {
        const user = userEvent.setup();
        renderCreateDialog({ auth: true });

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.choose_intent.back',
            })
        );
        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(addDiagram).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
    });

    it('hands an entry-owned device id to entry flow without opening it here', async () => {
        const onDiagramCreated = vi.fn();
        const user = userEvent.setup();
        renderCreateDialog({ entryCreateDiagramActions: { onDiagramCreated } });

        await createEmpty(user);

        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledTimes(1);
        });

        const localId = (addDiagram.mock.calls[0][0] as { diagram: Diagram })
            .diagram.id;
        expect(onDiagramCreated).toHaveBeenCalledWith(localId);
        expect(createDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(closeCreateDiagramDialog).not.toHaveBeenCalled();
    });

    it('hands an entry-owned online id to entry flow without hydrating it here', async () => {
        const onDiagramCreated = vi.fn();
        const user = userEvent.setup();
        renderCreateDialog({
            auth: true,
            entryCreateDiagramActions: { onDiagramCreated },
        });

        await createEmpty(user);

        await waitFor(() => {
            expect(onDiagramCreated).toHaveBeenCalledWith('99');
        });

        expect(createDiagram).toHaveBeenCalledTimes(1);
        expect(addDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
    });

    it('opens with Online selected for authenticated users', () => {
        renderCreateDialog({ auth: true });
        expect(onlineTab()).toHaveAttribute('aria-selected', 'true');
        expect(deviceTab()).toHaveAttribute('aria-selected', 'false');
    });

    it('opens with Device selected for guests', () => {
        renderCreateDialog({ auth: false });
        expect(deviceTab()).toHaveAttribute('aria-selected', 'true');
        expect(onlineTab()).toHaveAttribute('aria-selected', 'false');
    });

    it('lets authenticated users switch to Device and persist locally', async () => {
        const user = userEvent.setup();
        renderCreateDialog({ auth: true });
        await user.click(deviceTab());
        await createEmpty(user);
        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledTimes(1);
        });
        expect(createDiagram).not.toHaveBeenCalled();
    });

    it('requests auth when a guest selects Online without changing destination', async () => {
        const user = userEvent.setup();
        renderCreateDialog({ auth: false });
        await user.click(onlineTab());
        expect(deviceTab()).toHaveAttribute('aria-selected', 'true');
        expect(requestAuthentication).toHaveBeenCalledWith({
            type: 'protected-action',
            action: 'create-online-diagram',
        });
        expect(registerProtectedActionResume).toHaveBeenCalled();
    });

    it('applies create-online resume to Online without resetting wizard step', async () => {
        const user = userEvent.setup();
        renderCreateDialog({ auth: false });
        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        await user.click(onlineTab());
        registerProtectedActionResume.mock.calls[0]?.[0]?.();
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.import/,
            })
        );
        expect(screen.getByTestId('choose-import-method')).toBeInTheDocument();
        expect(onlineTab()).toHaveAttribute('aria-selected', 'true');
    });
});
