import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CreateDiagramDialog } from '../create-diagram-dialog';
import { CreateDiagramDialogStep } from '../create-diagram-dialog-step';

const closeCreateDiagramDialog = vi.fn();
const addDiagram = vi.fn().mockResolvedValue(undefined);
const createDiagram = vi.fn().mockResolvedValue({ diagram: { id: 99 } });
const navigate = vi.fn();
const updateConfig = vi.fn().mockResolvedValue(undefined);
const loadDiagramFromData = vi.fn();
const listDiagrams = vi.fn().mockResolvedValue([{ id: '42' }]);

let isAuthenticated = true;

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

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeCreateDiagramDialog,
        openAuthDialog: vi.fn(),
        openImportDiagramDialog: vi.fn(),
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
        toast: vi.fn(),
    }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    createDiagram: (...args: unknown[]) => createDiagram(...args),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { database?: string }) => {
            if (key === 'new_diagram_dialog.choose_intent.description') {
                return `Create a new diagram for ${options?.database ?? ''}.`;
            }

            return key;
        },
    }),
}));

const importDatabasePropsSpy = vi.fn();

vi.mock('../../common/import-database/import-database', () => ({
    ImportDatabase: (props: Record<string, unknown>) => {
        importDatabasePropsSpy(props);

        return (
            <div data-testid="import-database">
                <button type="button" onClick={props.goBack as () => void}>
                    Import back
                </button>
            </div>
        );
    },
}));

describe('CreateDiagramDialog wizard flow', () => {
    beforeEach(() => {
        isAuthenticated = true;
        listDiagrams.mockResolvedValue([{ id: '42' }]);
        closeCreateDiagramDialog.mockClear();
        addDiagram.mockClear();
        createDiagram.mockClear();
        navigate.mockClear();
        updateConfig.mockClear();
        loadDiagramFromData.mockClear();
        importDatabasePropsSpy.mockClear();
    });

    it('advances to CHOOSE_INTENT when PostgreSQL is selected without persisting', async () => {
        const user = userEvent.setup();

        render(<CreateDiagramDialog dialog={{ open: true }} />);

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));

        expect(
            screen.getByRole('heading', {
                name: 'new_diagram_dialog.choose_intent.title',
            })
        ).toBeInTheDocument();
        expect(addDiagram).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
        expect(screen.queryByTestId('import-database')).not.toBeInTheDocument();
    });

    it('advances to CHOOSE_INTENT when MySQL is selected', async () => {
        const user = userEvent.setup();

        render(<CreateDiagramDialog dialog={{ open: true }} />);

        await user.click(screen.getByRole('radio', { name: 'MySQL' }));

        expect(
            screen.getByText('Create a new diagram for MySQL.')
        ).toBeInTheDocument();
    });

    it('returns to SELECT_DATABASE from CHOOSE_INTENT while preserving selection', async () => {
        const user = userEvent.setup();

        render(<CreateDiagramDialog dialog={{ open: true }} />);

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.choose_intent.back',
            })
        );

        expect(
            screen.getByText('new_diagram_dialog.database_selection.title')
        ).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'PostgreSQL' })).toBeChecked();
        expect(addDiagram).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
    });

    it('creates an empty diagram through the existing path when requested', async () => {
        const user = userEvent.setup();

        render(<CreateDiagramDialog dialog={{ open: true }} />);

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.create_empty/,
            })
        );

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });

        const payload = createDiagram.mock.calls[0]?.[0] as {
            content: { databaseType: string };
        };
        expect(payload.content.databaseType).toBe('postgresql');
        expect(closeCreateDiagramDialog).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith('/diagrams/99');
    });

    it('uses the guest empty-diagram path when unauthenticated', async () => {
        isAuthenticated = false;
        listDiagrams.mockResolvedValue([]);
        const user = userEvent.setup();

        render(<CreateDiagramDialog dialog={{ open: true }} />);

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.create_empty/,
            })
        );

        await waitFor(() => {
            expect(addDiagram).toHaveBeenCalledTimes(1);
        });

        const payload = addDiagram.mock.calls[0]?.[0] as {
            diagram: { databaseType: string };
        };
        expect(payload.diagram.databaseType).toBe('postgresql');
        expect(createDiagram).not.toHaveBeenCalled();
        expect(loadDiagramFromData).toHaveBeenCalledTimes(1);
    });

    it('advances to IMPORT_DATABASE when import schema is selected', async () => {
        const user = userEvent.setup();

        render(<CreateDiagramDialog dialog={{ open: true }} />);

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.import_schema/,
            })
        );

        expect(screen.getByTestId('import-database')).toBeInTheDocument();
        expect(importDatabasePropsSpy).toHaveBeenCalled();
        const latestProps = importDatabasePropsSpy.mock.calls.at(-1)?.[0] as {
            onCreateEmptyDiagram?: unknown;
            goBack: () => void;
        };
        expect(latestProps.onCreateEmptyDiagram).toBeUndefined();
    });

    it('returns from IMPORT_DATABASE to CHOOSE_INTENT', async () => {
        const user = userEvent.setup();

        render(<CreateDiagramDialog dialog={{ open: true }} />);

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.import_schema/,
            })
        );
        await user.click(screen.getByRole('button', { name: 'Import back' }));

        expect(
            screen.getByRole('heading', {
                name: 'new_diagram_dialog.choose_intent.title',
            })
        ).toBeInTheDocument();
    });

    it('resets to SELECT_DATABASE when the dialog reopens', async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <CreateDiagramDialog dialog={{ open: true }} />
        );

        await user.click(screen.getByRole('radio', { name: 'PostgreSQL' }));
        expect(
            screen.getByRole('heading', {
                name: 'new_diagram_dialog.choose_intent.title',
            })
        ).toBeInTheDocument();

        rerender(<CreateDiagramDialog dialog={{ open: false }} />);
        rerender(<CreateDiagramDialog dialog={{ open: true }} />);

        expect(
            screen.getByText('new_diagram_dialog.database_selection.title')
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'new_diagram_dialog.choose_intent.title',
            })
        ).not.toBeInTheDocument();
    });
});

describe('CreateDiagramDialogStep', () => {
    it('includes CHOOSE_INTENT in the wizard steps', () => {
        expect(CreateDiagramDialogStep.CHOOSE_INTENT).toBe('CHOOSE_INTENT');
    });
});
