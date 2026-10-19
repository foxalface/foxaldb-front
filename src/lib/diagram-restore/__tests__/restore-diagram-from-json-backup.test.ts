import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    RestoreDiagramJsonParseError,
    persistRestoredDiagramFromJson,
} from '../restore-diagram-from-json-backup';

const createDiagram = vi.fn();
const getDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    createDiagram: (...args: unknown[]) => createDiagram(...args),
    getDiagram: (...args: unknown[]) => getDiagram(...args),
}));

const syncDiagramAutosaveFromApiLoad = vi.fn();

vi.mock('@/lib/diagram-autosave/sync-diagram-autosave-from-api', () => ({
    syncDiagramAutosaveFromApiLoad: (...args: unknown[]) =>
        syncDiagramAutosaveFromApiLoad(...args),
}));

const validDiagramJson = JSON.stringify({
    id: 'diagram',
    name: 'Backup',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [],
    relationships: [],
    dependencies: [],
    areas: [],
    customTypes: [],
    notes: [],
});

describe('persistRestoredDiagramFromJson', () => {
    const addDiagram = vi.fn();
    const loadDiagramFromData = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        addDiagram.mockResolvedValue(undefined);
        createDiagram.mockResolvedValue({ diagram: { id: 99 } });
        getDiagram.mockResolvedValue({
            id: 99,
            content_hash: 'hash-from-server',
        });
    });

    it('parses invalid JSON without persisting', async () => {
        await expect(
            persistRestoredDiagramFromJson('{not-json', {
                isAuthenticated: false,
                guest: { addDiagram, loadDiagramFromData },
            })
        ).rejects.toBeInstanceOf(RestoreDiagramJsonParseError);

        expect(addDiagram).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
    });

    it('guest restore writes to Dexie and returns local diagram id', async () => {
        const id = await persistRestoredDiagramFromJson(validDiagramJson, {
            isAuthenticated: false,
            guest: { addDiagram, loadDiagramFromData },
        });

        expect(addDiagram).toHaveBeenCalledTimes(1);
        expect(loadDiagramFromData).toHaveBeenCalledTimes(1);
        expect(createDiagram).not.toHaveBeenCalled();
        expect(id).toBe(addDiagram.mock.calls[0][0].diagram.id);
    });

    it('authenticated restore uses createDiagram and does not write Dexie', async () => {
        const id = await persistRestoredDiagramFromJson(validDiagramJson, {
            isAuthenticated: true,
            guest: { addDiagram, loadDiagramFromData },
        });

        expect(createDiagram).toHaveBeenCalledTimes(1);
        expect(getDiagram).toHaveBeenCalledWith('99');
        expect(syncDiagramAutosaveFromApiLoad).toHaveBeenCalledWith(
            '99',
            expect.objectContaining({ content_hash: 'hash-from-server' })
        );
        expect(addDiagram).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(id).toBe('99');
    });

    it('authenticated API failure does not write Dexie', async () => {
        createDiagram.mockRejectedValue(new Error('network'));

        await expect(
            persistRestoredDiagramFromJson(validDiagramJson, {
                isAuthenticated: true,
                guest: { addDiagram, loadDiagramFromData },
            })
        ).rejects.toThrow('network');

        expect(addDiagram).not.toHaveBeenCalled();
    });
});
