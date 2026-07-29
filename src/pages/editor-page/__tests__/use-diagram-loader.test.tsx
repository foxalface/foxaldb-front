import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDiagramLoader } from '@/pages/editor-page/use-diagram-loader';

const authState = {
    isAuthenticated: false,
    isLoading: false,
};

const chartDbState = {
    currentDiagram: null as { id: string } | null,
};

const listDiagrams = vi.fn();
const getDiagrams = vi.fn();
const openOpenDiagramDialog = vi.fn();
const openCreateDiagramDialog = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({ config: { defaultDiagramId: null } }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({ listDiagrams }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
        loadDiagram: vi.fn(),
        loadDiagramFromData: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        setDiagramAccess: vi.fn(),
        clearDiagramAccess: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openCreateDiagramDialog,
        openOpenDiagramDialog,
        closeOpenDiagramDialog: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-full-screen-spinner', () => ({
    useFullScreenLoader: () => ({
        showLoader: vi.fn(),
        hideLoader: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-redo-undo-stack', () => ({
    useRedoUndoStack: () => ({
        resetRedoStack: vi.fn(),
        resetUndoStack: vi.fn(),
    }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        useParams: () => ({ diagramId: undefined }),
        useNavigate: () => vi.fn(),
    };
});

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({ showAlert: vi.fn() }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    getDiagram: vi.fn(),
    getDiagrams: (...args: unknown[]) => getDiagrams(...args),
}));

describe('useDiagramLoader guest startup', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = false;
        listDiagrams.mockReset();
        getDiagrams.mockReset();
        openOpenDiagramDialog.mockReset();
        openCreateDiagramDialog.mockReset();
    });

    it('does not perform guest startup lookup', async () => {
        renderHook(() => useDiagramLoader());

        await waitFor(() => {
            expect(listDiagrams).not.toHaveBeenCalled();
        });

        expect(getDiagrams).not.toHaveBeenCalled();
        expect(openOpenDiagramDialog).not.toHaveBeenCalled();
        expect(openCreateDiagramDialog).not.toHaveBeenCalled();
    });
});

describe('useDiagramLoader authenticated startup', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        authState.isLoading = false;
        chartDbState.currentDiagram = { id: 'stale-diagram' };
        listDiagrams.mockReset();
        getDiagrams.mockReset();
        openOpenDiagramDialog.mockReset();
        openCreateDiagramDialog.mockReset();
    });

    it('still opens the authenticated startup dialog when remote diagrams exist', async () => {
        getDiagrams.mockResolvedValue([{ id: '1' }]);

        renderHook(() => useDiagramLoader());

        await waitFor(() => {
            expect(getDiagrams).toHaveBeenCalledTimes(1);
        });

        expect(openOpenDiagramDialog).toHaveBeenCalledWith({ canClose: false });
        expect(listDiagrams).not.toHaveBeenCalled();
    });
});
