import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { ImportSchemaContinueParams } from '@/dialogs/common/import-schema/import-schema-step';
import type { AuthUser } from '@/lib/api/auth';
import { CreateDiagramDialog } from '../create-diagram-dialog';

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
const updateDiagramCreationPreference = vi.fn().mockResolvedValue(undefined);

let isAuthenticated = false;
let authUser: AuthUser | null = null;

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated,
        user: authUser,
        updateDiagramCreationPreference,
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

const importedDiagram: Diagram = {
    id: 'imported-1',
    name: 'From Laravel',
    databaseType: DatabaseType.POSTGRESQL,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

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

const baseUser = (over: Partial<AuthUser> = {}): AuthUser => ({
    id: 1,
    first_name: 'A',
    last_name: 'B',
    full_name: 'A B',
    email: 'a@b.com',
    default_diagram_creation_destination: null,
    ...over,
});

const goToChooseIntent = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
};

const openFileImport = async (user: ReturnType<typeof userEvent.setup>) => {
    await goToChooseIntent(user);
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

const clickCreateEmpty = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(
        screen.getByRole('button', {
            name: /new_diagram_dialog\.choose_intent\.create_empty/,
        })
    );
};

const createEmpty = async (user: ReturnType<typeof userEvent.setup>) => {
    await goToChooseIntent(user);
    await clickCreateEmpty(user);
};

const confirmDestinationOnline = async (
    user: ReturnType<typeof userEvent.setup>
) => {
    await user.click(
        screen.getByRole('button', {
            name: /open_diagram_dialog\.tabs\.online/,
        })
    );
    await user.click(
        screen.getByRole('button', {
            name: 'new_diagram_dialog.choose_creation_destination.create',
        })
    );
};

const renderCreateDialog = (
    options: {
        auth?: boolean;
        user?: AuthUser | null;
        entryCreateDiagramActions?: React.ComponentProps<
            typeof CreateDiagramDialog
        >['entryCreateDiagramActions'];
    } = {}
) => {
    isAuthenticated = options.auth ?? false;
    authUser = options.user ?? (isAuthenticated ? baseUser() : null);
    return render(
        <CreateDiagramDialog
            dialog={{ open: true }}
            entryCreateDiagramActions={options.entryCreateDiagramActions}
        />
    );
};

describe('CreateDiagramDialog destination', () => {
    beforeEach(() => {
        isAuthenticated = false;
        authUser = null;
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
        updateDiagramCreationPreference.mockClear();
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

        await goToChooseIntent(user);
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

    it('stores a project import on device for guests', async () => {
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

    it('uses saved online preference without showing the destination step', async () => {
        const user = userEvent.setup();
        renderCreateDialog({
            auth: true,
            user: baseUser({ default_diagram_creation_destination: 'online' }),
        });

        await openFileImport(user);
        await user.click(screen.getByRole('button', { name: 'Continue SQL' }));

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.queryByRole('heading', {
                name: 'new_diagram_dialog.choose_creation_destination.title',
            })
        ).not.toBeInTheDocument();

        expect(addDiagram).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith('/diagrams/99');
    });

    it('shows destination step when authenticated without a saved preference', async () => {
        const user = userEvent.setup();
        renderCreateDialog({
            auth: true,
            user: baseUser({ default_diagram_creation_destination: null }),
        });

        await openFileImport(user);
        await user.click(screen.getByRole('button', { name: 'Continue SQL' }));

        expect(
            await screen.findByRole('heading', {
                name: 'new_diagram_dialog.choose_creation_destination.title',
            })
        ).toBeInTheDocument();

        await confirmDestinationOnline(user);

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });
    });

    it('persists preference when remember is checked on destination step', async () => {
        const user = userEvent.setup();
        renderCreateDialog({
            auth: true,
            user: baseUser({ default_diagram_creation_destination: null }),
        });

        await openFileImport(user);
        await user.click(screen.getByRole('button', { name: 'Continue SQL' }));

        await screen.findByRole('heading', {
            name: 'new_diagram_dialog.choose_creation_destination.title',
        });

        await user.click(
            screen.getByRole('checkbox', {
                name: 'new_diagram_dialog.choose_creation_destination.remember_choice',
            })
        );

        await confirmDestinationOnline(user);

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(updateDiagramCreationPreference).toHaveBeenCalledWith({
                default_diagram_creation_destination: 'online',
            });
        });
    });

    it('does not retarget an open guest session when authentication appears', async () => {
        listDiagrams.mockResolvedValue([{ id: 'existing' }]);
        const user = userEvent.setup();
        const { rerender } = render(
            <CreateDiagramDialog dialog={{ open: true }} />
        );

        isAuthenticated = true;
        authUser = baseUser({ default_diagram_creation_destination: 'device' });
        rerender(<CreateDiagramDialog dialog={{ open: true }} />);

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

    it('uses online default when reopening as authenticated with saved preference', async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <CreateDiagramDialog dialog={{ open: true }} />
        );

        rerender(<CreateDiagramDialog dialog={{ open: false }} />);

        isAuthenticated = true;
        authUser = baseUser({ default_diagram_creation_destination: 'online' });
        rerender(<CreateDiagramDialog dialog={{ open: true }} />);

        await createEmpty(user);

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });

        expect(addDiagram).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('lets a guest create a second device diagram when one already exists locally', async () => {
        listDiagrams.mockResolvedValue([{ id: 'existing' }]);
        const user = userEvent.setup();
        renderCreateDialog();

        await createEmpty(user);

        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledTimes(1);
        });

        expect(toast).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
        expectDeviceOpen();
    });

    it('does not persist when the wizard is cancelled', async () => {
        const user = userEvent.setup();
        renderCreateDialog({
            auth: true,
            user: baseUser({ default_diagram_creation_destination: 'online' }),
        });

        await goToChooseIntent(user);
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
            user: baseUser({ default_diagram_creation_destination: 'online' }),
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
});
