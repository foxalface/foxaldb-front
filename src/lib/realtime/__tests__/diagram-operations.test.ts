import { describe, expect, it, vi } from 'vitest';
import {
    applyRemoteDiagramOperation,
    type ApplyRemoteDiagramOperationContext,
    type DiagramOperationMutators,
} from '../diagram-operations';

const emptyContext = (): ApplyRemoteDiagramOperationContext => ({
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
});

const createMutators = (): DiagramOperationMutators => ({
    updateDiagramName: vi.fn().mockResolvedValue(undefined),
    addTables: vi.fn().mockResolvedValue(undefined),
    updateTable: vi.fn().mockResolvedValue(undefined),
    removeTables: vi.fn().mockResolvedValue(undefined),
    addField: vi.fn().mockResolvedValue(undefined),
    removeField: vi.fn().mockResolvedValue(undefined),
    updateField: vi.fn().mockResolvedValue(undefined),
    addRelationships: vi.fn().mockResolvedValue(undefined),
    removeRelationships: vi.fn().mockResolvedValue(undefined),
    updateRelationship: vi.fn().mockResolvedValue(undefined),
    addNotes: vi.fn().mockResolvedValue(undefined),
    removeNotes: vi.fn().mockResolvedValue(undefined),
    updateNote: vi.fn().mockResolvedValue(undefined),
    addAreas: vi.fn().mockResolvedValue(undefined),
    removeAreas: vi.fn().mockResolvedValue(undefined),
    updateArea: vi.fn().mockResolvedValue(undefined),
    addDependencies: vi.fn().mockResolvedValue(undefined),
    removeDependencies: vi.fn().mockResolvedValue(undefined),
    updateDependency: vi.fn().mockResolvedValue(undefined),
});

describe('applyRemoteDiagramOperation', () => {
    it('applies update_diagram_name with updateHistory disabled', async () => {
        const mutators = createMutators();

        await applyRemoteDiagramOperation(
            {
                action: 'update_diagram_name',
                data: { name: 'Remote title' },
                userId: 2,
                clientId: 'remote-client',
                sentAt: '2026-01-01T00:00:00Z',
            },
            mutators,
            emptyContext()
        );

        expect(mutators.updateDiagramName).toHaveBeenCalledWith(
            'Remote title',
            {
                updateHistory: false,
            }
        );
        expect(mutators.updateTable).not.toHaveBeenCalled();
    });

    it('ignores invalid update_diagram_name payloads', async () => {
        const mutators = createMutators();
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await applyRemoteDiagramOperation(
            {
                action: 'update_diagram_name',
                data: { name: '' },
                userId: 2,
                clientId: 'remote-client',
                sentAt: '2026-01-01T00:00:00Z',
            },
            mutators,
            emptyContext()
        );

        expect(mutators.updateDiagramName).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it('remains idempotent when the same title is applied twice', async () => {
        const mutators = createMutators();
        const payload = {
            action: 'update_diagram_name' as const,
            data: { name: 'Shared title' },
            userId: 2,
            clientId: 'remote-client',
            sentAt: '2026-01-01T00:00:00Z',
        };

        await applyRemoteDiagramOperation(payload, mutators, emptyContext());
        await applyRemoteDiagramOperation(payload, mutators, emptyContext());

        expect(mutators.updateDiagramName).toHaveBeenCalledTimes(2);
        expect(mutators.updateDiagramName).toHaveBeenNthCalledWith(
            1,
            'Shared title',
            { updateHistory: false }
        );
        expect(mutators.updateDiagramName).toHaveBeenNthCalledWith(
            2,
            'Shared title',
            { updateHistory: false }
        );
    });
});
