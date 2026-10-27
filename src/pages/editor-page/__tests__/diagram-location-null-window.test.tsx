import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartDBProvider } from '@/context/chartdb-context/chartdb-provider';
import { HistoryProvider } from '@/context/history-context/history-provider';
import { RedoUndoStackProvider } from '@/context/history-context/redo-undo-stack-provider';
import { useChartDB } from '@/hooks/use-chartdb';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';

/**
 * Authenticated diagram open uses useEntryFlowAuthenticatedResolution →
 * showLoader() (FullScreenLoaderProvider modal Dialog) until hideLoader() after
 * location is set and the diagram is loaded. EditorPage also blocks only
 * restoringSession, not openingDiagram; the loader is what prevents ChartDB
 * edits during authenticated resolution.
 *
 * Guest openingDiagram does not call showLoader; hard reload with an empty
 * ChartDB mount has little to mutate before resolution sets device location.
 */
const updateDiagramStorage = vi.fn();

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        hasDiff: false,
        events: { useSubscription: () => undefined },
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        deleteDiagram: vi.fn(),
        addDiagram: vi.fn(),
        updateDiagram: updateDiagramStorage,
        getTable: vi.fn(),
        updateTable: vi.fn(),
    }),
}));

const Probe: React.FC = () => {
    const { loadDiagramFromData, updateDiagramName } = useChartDB();

    return (
        <div>
            <button
                type="button"
                onClick={() =>
                    loadDiagramFromData({
                        id: 'local-1',
                        name: 'Unresolved',
                        databaseType: DatabaseType.GENERIC,
                        tables: [],
                        relationships: [],
                        dependencies: [],
                        areas: [],
                        customTypes: [],
                        notes: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    } as Diagram)
                }
            >
                load
            </button>
            <button
                type="button"
                onClick={() =>
                    void updateDiagramName('Mutated before location')
                }
            >
                rename
            </button>
        </div>
    );
};

describe('diagram location null window', () => {
    beforeEach(() => {
        updateDiagramStorage.mockReset();
        updateDiagramStorage.mockResolvedValue(undefined);
    });

    it('keeps Dexie writes enabled while location is unresolved (A1 contract)', async () => {
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
        await user.click(screen.getByRole('button', { name: 'rename' }));

        await waitFor(() => expect(updateDiagramStorage).toHaveBeenCalled());
    });
});
