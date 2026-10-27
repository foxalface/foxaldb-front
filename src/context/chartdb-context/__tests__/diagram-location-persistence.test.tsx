import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { RedoUndoStackProvider } from '@/context/history-context/redo-undo-stack-provider';
import { HistoryProvider } from '@/context/history-context/history-provider';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';

const updateDiagram = vi.fn();
const deleteDiagram = vi.fn();
const addDiagram = vi.fn();
const getTable = vi.fn();
const updateTable = vi.fn();

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
        updateDiagram,
        getTable,
        updateTable,
    }),
}));

import { ChartDBProvider } from '../chartdb-provider';

const diagram = (id: string, name: string): Diagram =>
    ({
        id,
        name,
        databaseType: DatabaseType.GENERIC,
        tables: [
            {
                id: 'table-1',
                name: 'users',
                x: 0,
                y: 0,
                fields: [
                    {
                        id: 'field-1',
                        name: 'id',
                        type: { id: 'text', name: 'text' },
                        primaryKey: false,
                        unique: false,
                        nullable: true,
                        createdAt: 1,
                    },
                ],
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

const deviceFixtureTable = {
    id: 'table-1',
    name: 'users',
    x: 0,
    y: 0,
    fields: [
        {
            id: 'field-1',
            name: 'id',
            type: { id: 'text', name: 'text' },
            primaryKey: false,
            unique: false,
            nullable: true,
            createdAt: 1,
        },
    ],
    indexes: [],
    color: '#8eb7ff',
    isView: false,
    createdAt: 1,
};

const Probe: React.FC = () => {
    const {
        currentDiagram,
        loadDiagramFromData,
        replaceDiagram,
        updateDiagramName,
        updateField,
    } = useChartDB();
    const { undoStack } = useRedoUndoStack();

    return (
        <div>
            <p data-testid="name">{currentDiagram.name}</p>
            <p data-testid="undo">{String(undoStack.length)}</p>
            <button
                type="button"
                onClick={() => loadDiagramFromData(diagram('42', 'Online'))}
            >
                load-online
            </button>
            <button
                type="button"
                onClick={() =>
                    loadDiagramFromData(diagram('local-1', 'Device'))
                }
            >
                load-device
            </button>
            <button
                type="button"
                onClick={() => void updateDiagramName('Renamed')}
            >
                rename
            </button>
            <button
                type="button"
                onClick={() =>
                    void updateField('table-1', 'field-1', { name: 'user_id' })
                }
            >
                update-field
            </button>
            <button
                type="button"
                onClick={() =>
                    void replaceDiagram(diagram('42', 'Replaced'), {
                        updateHistory: false,
                        authoritative: true,
                        resetHistory: true,
                    })
                }
            >
                replace-online
            </button>
            <button
                type="button"
                onClick={() =>
                    void replaceDiagram(diagram('local-1', 'Replaced device'), {
                        updateHistory: false,
                        authoritative: false,
                    })
                }
            >
                replace-device
            </button>
        </div>
    );
};

const renderAt = (location: DiagramLocation) =>
    render(
        <DiagramLocationProvider initialLocation={location}>
            <RedoUndoStackProvider>
                <ChartDBProvider>
                    <HistoryProvider>
                        <Probe />
                    </HistoryProvider>
                </ChartDBProvider>
            </RedoUndoStackProvider>
        </DiagramLocationProvider>
    );

describe('ChartDB location persistence', () => {
    beforeEach(() => {
        updateDiagram.mockReset();
        updateDiagram.mockResolvedValue(undefined);
        deleteDiagram.mockReset();
        deleteDiagram.mockResolvedValue(undefined);
        addDiagram.mockReset();
        addDiagram.mockResolvedValue(undefined);
        getTable.mockReset();
        getTable.mockResolvedValue(undefined);
        updateTable.mockReset();
        updateTable.mockResolvedValue(undefined);
    });

    it('does not persist an online mutation or authoritative replace into Dexie', async () => {
        const user = userEvent.setup();
        renderAt(onlineDiagramLocation('42'));

        await user.click(screen.getByRole('button', { name: 'load-online' }));
        await user.click(screen.getByRole('button', { name: 'rename' }));
        await user.click(screen.getByRole('button', { name: 'update-field' }));

        await waitFor(() =>
            expect(screen.getByTestId('undo')).toHaveTextContent('2')
        );

        await user.click(
            screen.getByRole('button', { name: 'replace-online' })
        );

        await waitFor(() =>
            expect(screen.getByTestId('name')).toHaveTextContent('Replaced')
        );
        expect(updateDiagram).not.toHaveBeenCalled();
        expect(updateTable).not.toHaveBeenCalled();
        expect(addDiagram).not.toHaveBeenCalled();
        expect(deleteDiagram).not.toHaveBeenCalled();
        expect(getTable).not.toHaveBeenCalled();
    });

    it('persists a device mutation and replacement to Dexie', async () => {
        const user = userEvent.setup();
        renderAt(deviceDiagramLocation('local-1'));

        await user.click(screen.getByRole('button', { name: 'load-device' }));
        getTable.mockResolvedValue(deviceFixtureTable);
        await user.click(screen.getByRole('button', { name: 'rename' }));
        await user.click(screen.getByRole('button', { name: 'update-field' }));
        await user.click(
            screen.getByRole('button', { name: 'replace-device' })
        );

        await waitFor(() =>
            expect(screen.getByTestId('name')).toHaveTextContent(
                'Replaced device'
            )
        );
        expect(updateDiagram).toHaveBeenCalled();
        expect(updateTable).toHaveBeenCalled();
        expect(deleteDiagram).toHaveBeenCalledWith('local-1');
        expect(addDiagram).toHaveBeenCalledWith({
            diagram: expect.objectContaining({ id: 'local-1' }),
        });
    });
});
