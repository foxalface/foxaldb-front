import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { RedoUndoStackProvider } from '@/context/history-context/redo-undo-stack-provider';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import { useChartDB } from '@/hooks/use-chartdb';
import { useHistory } from '@/hooks/use-history';
import { HistoryProvider } from '@/context/history-context/history-provider';
import {
    diagramAutosavePayload,
    flushDiagramAutosave,
    observeDiagramForAutosave,
    readDiagramAutosaveBaseline,
    resetDiagramAutosaveForTests,
    setDiagramAutosaveEnabled,
} from '@/lib/diagram-autosave/diagram-autosave-controller';

const updateDiagram = vi.fn();
const deleteDiagram = vi.fn();
const addDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    updateDiagram: (...args: unknown[]) => updateDiagram(...args),
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
        updateDiagram: vi.fn(),
    }),
}));

import { ChartDBProvider } from '../chartdb-provider';

const diagram = (name: string, tableId: string, x: number): Diagram =>
    ({
        id: '42',
        name,
        databaseType: DatabaseType.POSTGRESQL,
        databaseEdition: undefined,
        tables: [
            {
                id: tableId,
                name,
                schema: 'public',
                x,
                y: 40,
                fields: [],
                indexes: [],
                color: '#8eb7ff',
                isView: false,
                createdAt: 1,
            },
        ],
        relationships: [],
        dependencies: [],
        areas: [],
        customTypes: [],
        notes: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }) as Diagram;

const Probe: React.FC = () => {
    const {
        currentDiagram,
        loadDiagramFromData,
        replaceDiagram,
        highlightCustomTypeId,
        highlightedCustomType,
    } = useChartDB();
    const { undoStack } = useRedoUndoStack();
    const { undo } = useHistory();

    return (
        <div>
            <p data-testid="name">{currentDiagram.name}</p>
            <p data-testid="table">{currentDiagram.tables?.[0]?.id ?? ''}</p>
            <p data-testid="x">{String(currentDiagram.tables?.[0]?.x ?? '')}</p>
            <p data-testid="undo">{String(undoStack.length)}</p>
            <p data-testid="highlight">{highlightedCustomType?.id ?? ''}</p>
            <button
                type="button"
                onClick={() => {
                    loadDiagramFromData(diagram('Before', 'local-table', 10));
                    highlightCustomTypeId('missing-type');
                }}
            >
                load
            </button>
            <button
                type="button"
                onClick={() =>
                    void replaceDiagram(
                        diagram('After', 'backend-table', 480),
                        {
                            updateHistory: true,
                            authoritative: true,
                        }
                    )
                }
            >
                merge
            </button>
            <button
                type="button"
                onClick={() =>
                    void replaceDiagram(diagram('Remote', 'remote-table', 80), {
                        updateHistory: false,
                        authoritative: true,
                        resetHistory: true,
                    })
                }
            >
                remote
            </button>
            <button type="button" onClick={() => void undo()}>
                undo
            </button>
        </div>
    );
};

describe('replaceDiagram', () => {
    beforeEach(() => {
        updateDiagram.mockReset();
        updateDiagram.mockResolvedValue({ id: 42 });
        deleteDiagram.mockReset();
        deleteDiagram.mockResolvedValue(undefined);
        addDiagram.mockReset();
        addDiagram.mockResolvedValue(undefined);
        resetDiagramAutosaveForTests();
        setDiagramAutosaveEnabled(true);
    });

    it('replaces the diagram once, keeps backend ids, and records one undo step', async () => {
        const user = userEvent.setup();
        render(
            <RedoUndoStackProvider>
                <ChartDBProvider>
                    <HistoryProvider>
                        <Probe />
                    </HistoryProvider>
                </ChartDBProvider>
            </RedoUndoStackProvider>
        );

        await user.click(screen.getByRole('button', { name: 'load' }));
        const before = diagram('Before', 'local-table', 10);
        observeDiagramForAutosave(before, { schedule: true });
        await user.click(screen.getByRole('button', { name: 'merge' }));

        await waitFor(() =>
            expect(screen.getByTestId('table')).toHaveTextContent(
                'backend-table'
            )
        );
        expect(screen.getByTestId('name')).toHaveTextContent('After');
        expect(screen.getByTestId('x')).toHaveTextContent('480');
        expect(screen.getByTestId('undo')).toHaveTextContent('1');
        expect(screen.getByTestId('highlight')).toHaveTextContent('');
        expect(readDiagramAutosaveBaseline()).toBe(
            diagramAutosavePayload(diagram('After', 'backend-table', 480))
        );
        await flushDiagramAutosave();
        expect(updateDiagram).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'undo' }));
        await waitFor(() =>
            expect(screen.getByTestId('table')).toHaveTextContent('local-table')
        );
        expect(screen.getByTestId('name')).toHaveTextContent('Before');
    });

    it('does not record undo for a remote authoritative refresh', async () => {
        const user = userEvent.setup();
        render(
            <RedoUndoStackProvider>
                <ChartDBProvider>
                    <HistoryProvider>
                        <Probe />
                    </HistoryProvider>
                </ChartDBProvider>
            </RedoUndoStackProvider>
        );

        await user.click(screen.getByRole('button', { name: 'load' }));
        await user.click(screen.getByRole('button', { name: 'merge' }));
        await waitFor(() =>
            expect(screen.getByTestId('undo')).toHaveTextContent('1')
        );
        await user.click(screen.getByRole('button', { name: 'remote' }));
        await waitFor(() =>
            expect(screen.getByTestId('table')).toHaveTextContent(
                'remote-table'
            )
        );
        expect(screen.getByTestId('undo')).toHaveTextContent('0');
        await flushDiagramAutosave();
        expect(updateDiagram).not.toHaveBeenCalled();
    });
});
