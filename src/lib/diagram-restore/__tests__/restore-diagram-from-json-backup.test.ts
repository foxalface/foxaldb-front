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

    beforeEach(() => {
        vi.clearAllMocks();
        addDiagram.mockResolvedValue(undefined);
        createDiagram.mockResolvedValue({ diagram: { id: 99 } });
        getDiagram.mockRejectedValue(
            new Error('restore must not GET the created diagram')
        );
    });

    it('parses invalid JSON without persisting', async () => {
        await expect(
            persistRestoredDiagramFromJson('{not-json', {
                destination: 'device',
                isAuthenticated: false,
                addDiagram,
            })
        ).rejects.toBeInstanceOf(RestoreDiagramJsonParseError);

        expect(addDiagram).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
    });

    it('guest device restore writes Dexie and does not call the API', async () => {
        const persisted = await persistRestoredDiagramFromJson(
            validDiagramJson,
            {
                destination: 'device',
                isAuthenticated: false,
                addDiagram,
            }
        );

        expect(addDiagram).toHaveBeenCalledTimes(1);
        expect(createDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(syncDiagramAutosaveFromApiLoad).not.toHaveBeenCalled();
        expect(persisted.destination).toBe('device');
        if (persisted.destination !== 'device') {
            return;
        }
        expect(persisted.localId).toBe(addDiagram.mock.calls[0][0].diagram.id);
    });

    it('authenticated device restore writes Dexie even when the user can call the API', async () => {
        const persisted = await persistRestoredDiagramFromJson(
            validDiagramJson,
            {
                destination: 'device',
                isAuthenticated: true,
                addDiagram,
            }
        );

        expect(addDiagram).toHaveBeenCalledTimes(1);
        expect(createDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(persisted.destination).toBe('device');
    });

    it('authenticated online restore posts and leaves hydration to the open path', async () => {
        const persisted = await persistRestoredDiagramFromJson(
            validDiagramJson,
            {
                destination: 'online',
                isAuthenticated: true,
                addDiagram,
            }
        );

        expect(createDiagram).toHaveBeenCalledTimes(1);
        expect(addDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(syncDiagramAutosaveFromApiLoad).not.toHaveBeenCalled();
        expect(persisted).toEqual({
            destination: 'online',
            diagramId: '99',
        });
    });

    it('authenticated API failure does not write Dexie', async () => {
        createDiagram.mockRejectedValue(new Error('network'));

        await expect(
            persistRestoredDiagramFromJson(validDiagramJson, {
                destination: 'online',
                isAuthenticated: true,
                addDiagram,
            })
        ).rejects.toThrow('network');

        expect(addDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
    });
});
