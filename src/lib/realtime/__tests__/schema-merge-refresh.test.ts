import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    applyRemoteDiagramOperation,
    isDiagramOperationAction,
} from '../diagram-operations';
import {
    acceptAuthoritativeDiagram,
    readDiagramAutosaveBaseline,
    resetDiagramAutosaveForTests,
    setDiagramAutosaveEnabled,
    diagramAutosavePayload,
} from '@/lib/diagram-autosave/diagram-autosave-controller';

const updateDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    updateDiagram: (...args: unknown[]) => updateDiagram(...args),
}));

vi.mock('../client-id', () => ({
    getClientId: () => 'actor-client',
}));

import {
    APPLY_SCHEMA_MERGE_ACTION,
    handleApplySchemaMergeEvent,
    parseApplySchemaMergeEvent,
    resetSchemaMergeRefresh,
    type ApplySchemaMergeRealtimeEvent,
} from '../schema-merge-refresh';

const hash = (char: string): string => char.repeat(64);

const diagram = (id: string): Diagram =>
    ({
        id: '42',
        name: id,
        databaseType: DatabaseType.POSTGRESQL,
        tables: [{ id, name: id, fields: [], indexes: [], x: 1, y: 2 }],
        relationships: [],
        createdAt: new Date(0),
        updatedAt: new Date(0),
    }) as unknown as Diagram;

const event = (
    resultContentHash: string,
    clientId = 'peer-client'
): ApplySchemaMergeRealtimeEvent => ({
    action: APPLY_SCHEMA_MERGE_ACTION,
    resultContentHash,
    updatedAt: '2026-01-02T00:00:00.000Z',
    userId: 7,
    clientId,
    sentAt: '2026-01-02T00:00:00.000Z',
});

describe('apply_schema_merge refresh', () => {
    beforeEach(() => {
        resetSchemaMergeRefresh();
        resetDiagramAutosaveForTests();
        setDiagramAutosaveEnabled(true);
        updateDiagram.mockReset();
        updateDiagram.mockResolvedValue({ id: 42 });
    });

    it('accepts the compact event and ignores it as a granular diagram operation', () => {
        const raw = {
            action: 'apply_schema_merge',
            data: {
                resultContentHash: hash('a'),
                updatedAt: null,
            },
            userId: 7,
            clientId: 'peer-client',
            sentAt: '2026-01-02T00:00:00.000Z',
        };

        expect(parseApplySchemaMergeEvent(raw)).toEqual({
            ...event(hash('a')),
            updatedAt: null,
        });
        expect(isDiagramOperationAction('apply_schema_merge')).toBe(false);
        expect(raw.data).not.toHaveProperty('tables');
    });

    it('does not refetch the actor event', async () => {
        const fetchDiagram = vi.fn();
        const replaceDiagram = vi.fn();

        await handleApplySchemaMergeEvent(
            event(hash('a'), 'actor-client'),
            '42',
            {
                fetchDiagram,
                replaceDiagram,
                cancelPendingAutosave: vi.fn(),
            }
        );

        expect(fetchDiagram).not.toHaveBeenCalled();
        expect(replaceDiagram).not.toHaveBeenCalled();
    });

    it('fetches once for a remote event and does not autosave or undo', async () => {
        const fetched = diagram('backend-table');
        const fetchDiagram = vi.fn().mockResolvedValue(fetched);
        const replaceDiagram = vi.fn(async (next: Diagram) => {
            acceptAuthoritativeDiagram(next);
        });

        await handleApplySchemaMergeEvent(event(hash('a')), '42', {
            fetchDiagram,
            replaceDiagram,
            cancelPendingAutosave: vi.fn(),
        });

        expect(fetchDiagram).toHaveBeenCalledTimes(1);
        expect(fetchDiagram).toHaveBeenCalledWith('42');
        expect(replaceDiagram).toHaveBeenCalledWith(fetched);
        expect(readDiagramAutosaveBaseline()).toBe(
            diagramAutosavePayload(fetched)
        );
        await flushQuiet();
        expect(updateDiagram).not.toHaveBeenCalled();
    });

    it('coalesces two events and follows a newer hash that arrives mid-fetch', async () => {
        let releaseFirst: (diagram: Diagram) => void = () => undefined;
        const first = diagram('first');
        const second = diagram('second');
        const fetchDiagram = vi
            .fn()
            .mockImplementationOnce(
                () =>
                    new Promise<Diagram>((resolve) => {
                        releaseFirst = resolve;
                    })
            )
            .mockResolvedValueOnce(second);
        const replaceDiagram = vi.fn().mockResolvedValue(undefined);
        const handlers = {
            fetchDiagram,
            replaceDiagram,
            cancelPendingAutosave: vi.fn(),
        };

        const firstRun = handleApplySchemaMergeEvent(
            event(hash('a')),
            '42',
            handlers
        );
        const secondRun = handleApplySchemaMergeEvent(
            event(hash('b')),
            '42',
            handlers
        );

        expect(secondRun).toBe(firstRun);
        expect(fetchDiagram).toHaveBeenCalledTimes(1);
        releaseFirst(first);
        await firstRun;

        expect(fetchDiagram).toHaveBeenCalledTimes(2);
        expect(replaceDiagram).toHaveBeenNthCalledWith(1, first);
        expect(replaceDiagram).toHaveBeenNthCalledWith(2, second);
    });

    it('leaves unrelated diagram operations on their existing path', async () => {
        const mutators = {
            updateDiagramName: vi.fn().mockResolvedValue(undefined),
        };

        await applyRemoteDiagramOperation(
            {
                action: 'update_diagram_name',
                data: { name: 'Renamed' },
                userId: 1,
                clientId: 'peer-client',
                sentAt: '2026-01-02T00:00:00.000Z',
            },
            mutators as never,
            {
                existingTableIds: new Set(),
                getTableFromStorage: async () => undefined,
                existingRelationshipIds: new Set(),
                getRelationshipFromStorage: async () => undefined,
                existingFieldIdsByTable: new Map(),
                existingNoteIds: new Set(),
                getNoteFromStorage: async () => undefined,
                existingAreaIds: new Set(),
                getAreaFromStorage: async () => undefined,
                existingDependencyIds: new Set(),
                getDependencyFromStorage: async () => undefined,
            }
        );

        expect(mutators.updateDiagramName).toHaveBeenCalledWith('Renamed', {
            updateHistory: false,
        });
    });
});

const flushQuiet = async (): Promise<void> => {
    const { flushDiagramAutosave } =
        await import('@/lib/diagram-autosave/diagram-autosave-controller');
    await flushDiagramAutosave();
};
