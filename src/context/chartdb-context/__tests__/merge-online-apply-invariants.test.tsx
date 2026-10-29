import React, { useMemo, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { redoUndoStackContext } from '@/context/history-context/redo-undo-stack-context';
import { RedoUndoStackProvider } from '@/context/history-context/redo-undo-stack-provider';
import type { RedoUndoAction } from '@/context/history-context/redo-undo-action';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import { useDiagramAutosave } from '@/pages/editor-page/use-diagram-autosave';
import { onlineDiagramLocation } from '@/lib/diagram/diagram-location';
import {
    flushDiagramAutosave,
    initializeDiagramAutosaveFromServer,
    readDiagramAutosaveContentHash,
    resetDiagramAutosaveForTests,
    setDiagramAutosaveEnabled,
} from '@/lib/diagram-autosave/diagram-autosave-controller';
import {
    b4MergeCatalogFixture,
    b4ServerResultAfterAddingTags,
} from '@/lib/schema-merge/__tests__/b4-merge-fixture';

const updateDiagram = vi.fn();
const deleteDiagram = vi.fn();
const addDiagram = vi.fn();
const updateStoredDiagram = vi.fn();
const getDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    updateDiagram: (...args: unknown[]) => updateDiagram(...args),
    getDiagram: (...args: unknown[]) => getDiagram(...args),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: {
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        },
        clearDiagramAccess: vi.fn(),
    }),
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        hasDiff: false,
        events: {
            useSubscription: () => undefined,
        },
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        deleteDiagram,
        addDiagram,
        updateDiagram: updateStoredDiagram,
    }),
}));

import { ChartDBProvider } from '../chartdb-provider';

const resultHash = 'b'.repeat(64);
const preMergeHash = 'a'.repeat(64);

const ThrowingHistory: React.FC<React.PropsWithChildren> = ({ children }) => {
    const value = useMemo(
        () => ({
            redoStack: [],
            undoStack: [],
            addRedoAction: () => undefined,
            addUndoAction: (action: RedoUndoAction) => {
                if (action.action === 'replaceDiagram') {
                    throw new Error('undo failed');
                }
            },
            resetRedoStack: () => undefined,
            resetUndoStack: () => undefined,
            hasRedo: false,
            hasUndo: false,
        }),
        []
    );

    return (
        <redoUndoStackContext.Provider value={value}>
            {children}
        </redoUndoStackContext.Provider>
    );
};

const Probe: React.FC = () => {
    useDiagramAutosave();
    const { currentDiagram, loadDiagramFromData, replaceDiagram } =
        useChartDB();
    const [phase, setPhase] = useState('idle');

    return (
        <div>
            <p data-testid="name">{currentDiagram.name}</p>
            <p data-testid="tags">
                {currentDiagram.tables?.some((item) => item.name === 'tags')
                    ? 'yes'
                    : 'no'}
            </p>
            <p data-testid="area">{currentDiagram.areas?.[0]?.name ?? ''}</p>
            <p data-testid="note">{currentDiagram.notes?.[0]?.content ?? ''}</p>
            <p data-testid="phase">{phase}</p>
            <button
                type="button"
                onClick={() => loadDiagramFromData(b4MergeCatalogFixture())}
            >
                load
            </button>
            <button
                type="button"
                onClick={() => {
                    const merged = {
                        ...b4ServerResultAfterAddingTags(),
                        name: 'Merged catalog',
                    };
                    void replaceDiagram(merged, {
                        updateHistory: true,
                        authoritative: true,
                        authoritativeContentHash: resultHash,
                    }).then(
                        () => setPhase('applied'),
                        () => setPhase('replace-failed')
                    );
                }}
            >
                merge
            </button>
        </div>
    );
};

const SuccessProbe: React.FC = () => {
    useDiagramAutosave();
    const { currentDiagram, loadDiagramFromData, replaceDiagram } =
        useChartDB();
    const { undoStack } = useRedoUndoStack();

    return (
        <div>
            <p data-testid="name">{currentDiagram.name}</p>
            <p data-testid="tags">
                {currentDiagram.tables?.some((item) => item.name === 'tags')
                    ? 'yes'
                    : 'no'}
            </p>
            <p data-testid="undo">{String(undoStack.length)}</p>
            <button
                type="button"
                onClick={() => loadDiagramFromData(b4MergeCatalogFixture())}
            >
                load
            </button>
            <button
                type="button"
                onClick={() => {
                    void replaceDiagram(
                        {
                            ...b4ServerResultAfterAddingTags(),
                            name: 'Merged catalog',
                        },
                        {
                            updateHistory: true,
                            authoritative: true,
                            authoritativeContentHash: resultHash,
                        }
                    );
                }}
            >
                merge
            </button>
        </div>
    );
};

describe('online merge replace', () => {
    beforeEach(() => {
        updateDiagram.mockReset();
        updateDiagram.mockResolvedValue({
            id: 42,
            content_hash: resultHash,
        });
        deleteDiagram.mockReset();
        deleteDiagram.mockResolvedValue(undefined);
        addDiagram.mockReset();
        addDiagram.mockResolvedValue(undefined);
        updateStoredDiagram.mockReset();
        updateStoredDiagram.mockResolvedValue(undefined);
        getDiagram.mockReset();
        resetDiagramAutosaveForTests();
        setDiagramAutosaveEnabled(true);
        initializeDiagramAutosaveFromServer('42', preMergeHash);
    });

    it('keeps the merged document in memory and does not PUT the pre-merge body', async () => {
        const user = userEvent.setup();
        render(
            <DiagramLocationProvider
                initialLocation={onlineDiagramLocation('42')}
            >
                <ThrowingHistory>
                    <ChartDBProvider>
                        <Probe />
                    </ChartDBProvider>
                </ThrowingHistory>
            </DiagramLocationProvider>
        );

        await user.click(screen.getByRole('button', { name: 'load' }));
        await user.click(screen.getByRole('button', { name: 'merge' }));

        await waitFor(() =>
            expect(screen.getByTestId('phase')).toHaveTextContent(
                'replace-failed'
            )
        );
        expect(screen.getByTestId('name')).toHaveTextContent('Merged catalog');
        expect(screen.getByTestId('tags')).toHaveTextContent('yes');
        expect(screen.getByTestId('area')).toHaveTextContent('Billing');
        expect(screen.getByTestId('note')).toHaveTextContent(
            'Account status is an enum.'
        );
        expect(readDiagramAutosaveContentHash()).toBe(resultHash);
        expect(addDiagram).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(updateStoredDiagram).not.toHaveBeenCalled();

        await flushDiagramAutosave();
        expect(updateDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
    });

    it('records one undo step and does not write the online diagram to Dexie', async () => {
        const user = userEvent.setup();
        render(
            <DiagramLocationProvider
                initialLocation={onlineDiagramLocation('42')}
            >
                <RedoUndoStackProvider>
                    <ChartDBProvider>
                        <SuccessProbe />
                    </ChartDBProvider>
                </RedoUndoStackProvider>
            </DiagramLocationProvider>
        );

        await user.click(screen.getByRole('button', { name: 'load' }));
        await user.click(screen.getByRole('button', { name: 'merge' }));

        await waitFor(() =>
            expect(screen.getByTestId('name')).toHaveTextContent(
                'Merged catalog'
            )
        );
        expect(screen.getByTestId('tags')).toHaveTextContent('yes');
        expect(screen.getByTestId('undo')).toHaveTextContent('1');
        expect(readDiagramAutosaveContentHash()).toBe(resultHash);
        expect(addDiagram).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(updateStoredDiagram).not.toHaveBeenCalled();
        await flushDiagramAutosave();
        expect(updateDiagram).not.toHaveBeenCalled();
    });
});
