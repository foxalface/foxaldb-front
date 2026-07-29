import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntryFlowGuestMigration } from '@/hooks/use-entry-flow-guest-migration';
import type { EntryFlowState } from '@/lib/entry-flow';

const listDiagrams = vi.fn();
const getLocalDiagram = vi.fn();
const deleteDiagram = vi.fn();
const createDiagram = vi.fn();
const getDiagram = vi.fn();
const loadDiagramFromData = vi.fn();
const setDiagramAccess = vi.fn();
const updateConfig = vi.fn();
const navigate = vi.fn();
const toast = vi.fn();

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        config: {},
        updateConfig,
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        listDiagrams,
        getDiagram: getLocalDiagram,
        deleteDiagram,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        loadDiagramFromData,
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        setDiagramAccess,
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('@/lib/api/diagrams', () => ({
    createDiagram: (...args: unknown[]) => createDiagram(...args),
    getDiagram: (...args: unknown[]) => getDiagram(...args),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({ toast }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const dispatchEvent = vi.fn();
let resolutionGeneration = 0;

const beginResolution = () => {
    resolutionGeneration += 1;
    return resolutionGeneration;
};

const isResolutionCurrent = (token: number) => token === resolutionGeneration;

describe('useEntryFlowGuestMigration', () => {
    beforeEach(() => {
        listDiagrams.mockReset();
        getLocalDiagram.mockReset();
        deleteDiagram.mockReset();
        createDiagram.mockReset();
        getDiagram.mockReset();
        loadDiagramFromData.mockReset();
        setDiagramAccess.mockReset();
        updateConfig.mockReset();
        navigate.mockReset();
        toast.mockReset();
        dispatchEvent.mockReset();
        resolutionGeneration = 0;
    });

    it('finds a guest diagram and dispatches local found', async () => {
        listDiagrams.mockResolvedValue([{ id: 'guest-abc' }]);
        getLocalDiagram.mockResolvedValue({ id: 'guest-abc' });

        renderHook(() =>
            useEntryFlowGuestMigration({
                state: {
                    kind: 'checkingGuestMigration',
                    entrySource: 'login',
                },
                isAuthenticated: true,
                isAuthLoading: false,
                beginResolution,
                isResolutionCurrent,
                dispatchEvent,
            })
        );

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'GUEST_MIGRATION_LOCAL_FOUND',
                diagramId: 'guest-abc',
            });
        });
    });

    it('skips migration prompt when no guest diagram exists', async () => {
        listDiagrams.mockResolvedValue([{ id: '42' }]);

        renderHook(() =>
            useEntryFlowGuestMigration({
                state: {
                    kind: 'checkingGuestMigration',
                    entrySource: 'login',
                },
                isAuthenticated: true,
                isAuthLoading: false,
                beginResolution,
                isResolutionCurrent,
                dispatchEvent,
            })
        );

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'GUEST_MIGRATION_LOCAL_NOT_FOUND',
            });
        });
    });

    it('imports remote diagram, activates it, then deletes local copy', async () => {
        const localDiagram = {
            id: 'guest-abc',
            name: 'Guest diagram',
            databaseType: 'generic',
            tables: [],
        };

        getLocalDiagram.mockResolvedValue(localDiagram);
        createDiagram.mockResolvedValue({ diagram: { id: 42 } });
        getDiagram.mockResolvedValue({
            id: 42,
            name: 'Guest diagram',
            access: { role: 'owner', can_edit: true, can_manage_members: true },
        });
        deleteDiagram.mockResolvedValue(undefined);
        updateConfig.mockResolvedValue(undefined);

        renderHook(() =>
            useEntryFlowGuestMigration({
                state: {
                    kind: 'migratingGuestDiagram',
                    entrySource: 'login',
                    localDiagramId: 'guest-abc',
                },
                isAuthenticated: true,
                isAuthLoading: false,
                beginResolution,
                isResolutionCurrent,
                dispatchEvent,
            })
        );

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });

        expect(deleteDiagram).toHaveBeenCalledWith('guest-abc');
        expect(loadDiagramFromData).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith('/diagrams/42');
        expect(dispatchEvent).toHaveBeenCalledWith({
            type: 'GUEST_MIGRATION_REMOTE_CREATED',
            remoteDiagramId: '42',
        });
        expect(dispatchEvent).toHaveBeenCalledWith({
            type: 'GUEST_MIGRATION_SUCCEEDED',
            remoteDiagramId: '42',
        });
    });

    it('does not delete local diagram before remote creation succeeds', async () => {
        getLocalDiagram.mockResolvedValue({
            id: 'guest-abc',
            name: 'Guest diagram',
            databaseType: 'generic',
        });
        createDiagram.mockRejectedValue(new Error('network'));

        renderHook(() =>
            useEntryFlowGuestMigration({
                state: {
                    kind: 'migratingGuestDiagram',
                    entrySource: 'login',
                    localDiagramId: 'guest-abc',
                },
                isAuthenticated: true,
                isAuthLoading: false,
                beginResolution,
                isResolutionCurrent,
                dispatchEvent,
            })
        );

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'GUEST_MIGRATION_FAILED',
                messageKey: 'guest_migration_errors.import_failed',
            });
        });

        expect(deleteDiagram).not.toHaveBeenCalled();
    });

    it('preserves local diagram when remote activation fails', async () => {
        getLocalDiagram.mockResolvedValue({
            id: 'guest-abc',
            name: 'Guest diagram',
            databaseType: 'generic',
        });
        createDiagram.mockResolvedValue({ diagram: { id: 42 } });
        getDiagram.mockResolvedValue(undefined);

        renderHook(() =>
            useEntryFlowGuestMigration({
                state: {
                    kind: 'migratingGuestDiagram',
                    entrySource: 'login',
                    localDiagramId: 'guest-abc',
                },
                isAuthenticated: true,
                isAuthLoading: false,
                beginResolution,
                isResolutionCurrent,
                dispatchEvent,
            })
        );

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'GUEST_MIGRATION_FAILED',
                messageKey: 'guest_migration_errors.activation_failed',
            });
        });

        expect(deleteDiagram).not.toHaveBeenCalled();
    });

    it('does not duplicate migration on StrictMode replay', async () => {
        getLocalDiagram.mockResolvedValue({
            id: 'guest-abc',
            name: 'Guest diagram',
            databaseType: 'generic',
        });
        createDiagram.mockResolvedValue({ diagram: { id: 42 } });
        getDiagram.mockResolvedValue({ id: 42, name: 'Guest diagram' });
        deleteDiagram.mockResolvedValue(undefined);

        const { rerender } = renderHook(
            (props: { state: EntryFlowState }) =>
                useEntryFlowGuestMigration({
                    state: props.state,
                    isAuthenticated: true,
                    isAuthLoading: false,
                    beginResolution,
                    isResolutionCurrent,
                    dispatchEvent,
                }),
            {
                initialProps: {
                    state: {
                        kind: 'migratingGuestDiagram',
                        entrySource: 'login',
                        localDiagramId: 'guest-abc',
                    } as EntryFlowState,
                },
            }
        );

        rerender({
            state: {
                kind: 'migratingGuestDiagram',
                entrySource: 'login',
                localDiagramId: 'guest-abc',
            },
        });

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });
    });

    it('does not restart migration when entrySource changes outside migrating state', async () => {
        getLocalDiagram.mockResolvedValue({
            id: 'guest-abc',
            name: 'Guest diagram',
            databaseType: 'generic',
        });
        createDiagram.mockResolvedValue({ diagram: { id: 42 } });
        getDiagram.mockResolvedValue({ id: 42, name: 'Guest diagram' });
        deleteDiagram.mockResolvedValue(undefined);

        const { rerender } = renderHook(
            (props: { state: EntryFlowState }) =>
                useEntryFlowGuestMigration({
                    state: props.state,
                    isAuthenticated: true,
                    isAuthLoading: false,
                    beginResolution,
                    isResolutionCurrent,
                    dispatchEvent,
                }),
            {
                initialProps: {
                    state: {
                        kind: 'loadingRemoteDiagrams',
                        entrySource: 'registration',
                    } as EntryFlowState,
                },
            }
        );

        rerender({
            state: {
                kind: 'loadingRemoteDiagrams',
                entrySource: 'login',
            },
        });

        await waitFor(() => {
            expect(createDiagram).not.toHaveBeenCalled();
        });
    });

    it('starts a new migration episode when localDiagramId changes', async () => {
        getLocalDiagram.mockResolvedValue({
            id: 'guest-new',
            name: 'Guest diagram',
            databaseType: 'generic',
        });
        createDiagram.mockResolvedValue({ diagram: { id: 42 } });
        getDiagram.mockResolvedValue({ id: 42, name: 'Guest diagram' });
        deleteDiagram.mockResolvedValue(undefined);

        const { rerender } = renderHook(
            (props: { state: EntryFlowState }) =>
                useEntryFlowGuestMigration({
                    state: props.state,
                    isAuthenticated: true,
                    isAuthLoading: false,
                    beginResolution,
                    isResolutionCurrent,
                    dispatchEvent,
                }),
            {
                initialProps: {
                    state: {
                        kind: 'migratingGuestDiagram',
                        entrySource: 'login',
                        localDiagramId: 'guest-old',
                    } as EntryFlowState,
                },
            }
        );

        rerender({
            state: {
                kind: 'migratingGuestDiagram',
                entrySource: 'login',
                localDiagramId: 'guest-new',
            },
        });

        await waitFor(() => {
            expect(createDiagram).toHaveBeenCalledTimes(1);
        });

        expect(getLocalDiagram).toHaveBeenCalledWith(
            'guest-new',
            expect.objectContaining({ includeTables: true })
        );
    });

    it('does not duplicate migrated opening on rerender', async () => {
        const { rerender } = renderHook(
            (props: { state: EntryFlowState }) =>
                useEntryFlowGuestMigration({
                    state: props.state,
                    isAuthenticated: true,
                    isAuthLoading: false,
                    beginResolution,
                    isResolutionCurrent,
                    dispatchEvent,
                }),
            {
                initialProps: {
                    state: {
                        kind: 'openingDiagram',
                        diagramId: '42',
                        diagramSource: 'migrated',
                        entrySource: 'login',
                    } as EntryFlowState,
                },
            }
        );

        rerender({
            state: {
                kind: 'openingDiagram',
                diagramId: '42',
                diagramSource: 'migrated',
                entrySource: 'login',
            },
        });

        await waitFor(() => {
            expect(dispatchEvent).toHaveBeenCalledWith({
                type: 'DIAGRAM_OPENED',
            });
        });

        expect(
            dispatchEvent.mock.calls.filter(
                (call) => call[0]?.type === 'DIAGRAM_OPENED'
            ).length
        ).toBe(1);
    });

    it('does not run migrated opening effect for non-migrated diagram sources', async () => {
        renderHook(() =>
            useEntryFlowGuestMigration({
                state: {
                    kind: 'openingDiagram',
                    diagramId: '42',
                    diagramSource: 'remote',
                    entrySource: 'login',
                },
                isAuthenticated: true,
                isAuthLoading: false,
                beginResolution,
                isResolutionCurrent,
                dispatchEvent,
            })
        );

        await waitFor(() => {
            expect(dispatchEvent).not.toHaveBeenCalledWith({
                type: 'DIAGRAM_OPENED',
            });
        });
    });

    it('ignores stale migration completion after resolution invalidation', async () => {
        getLocalDiagram.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(
                        () =>
                            resolve({
                                id: 'guest-abc',
                                name: 'Guest diagram',
                                databaseType: 'generic',
                            }),
                        50
                    );
                })
        );

        let currentToken = 0;
        const localBeginResolution = () => {
            currentToken += 1;
            return currentToken;
        };
        const localIsResolutionCurrent = (token: number) =>
            token === currentToken;

        renderHook(() =>
            useEntryFlowGuestMigration({
                state: {
                    kind: 'migratingGuestDiagram',
                    entrySource: 'login',
                    localDiagramId: 'guest-abc',
                },
                isAuthenticated: true,
                isAuthLoading: false,
                beginResolution: localBeginResolution,
                isResolutionCurrent: localIsResolutionCurrent,
                dispatchEvent,
            })
        );

        act(() => {
            currentToken += 1;
        });

        await waitFor(() => {
            expect(createDiagram).not.toHaveBeenCalled();
        });

        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(dispatchEvent).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'GUEST_MIGRATION_SUCCEEDED' })
        );
    });
});
