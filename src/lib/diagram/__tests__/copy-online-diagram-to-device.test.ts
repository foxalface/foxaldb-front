import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { copyOnlineDiagramToDevice } from '../copy-online-diagram-to-device';

const getDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    getDiagram: (...args: unknown[]) => getDiagram(...args),
}));

describe('copyOnlineDiagramToDevice', () => {
    beforeEach(() => {
        getDiagram.mockReset();
    });

    it('saves a new local diagram and leaves the online diagram untouched', async () => {
        getDiagram.mockResolvedValue({
            id: '42',
            name: 'Main',
            content: {
                name: 'Main',
                databaseType: DatabaseType.POSTGRESQL,
                tables: [],
                relationships: [],
            },
        });
        const addDiagram = vi.fn().mockResolvedValue(undefined);
        const listDiagrams = vi
            .fn()
            .mockResolvedValue([{ name: 'Main' }, { name: 'Main (1)' }]);

        const localId = await copyOnlineDiagramToDevice(
            listDiagrams,
            addDiagram,
            '42',
            true
        );

        expect(getDiagram).toHaveBeenCalledWith('42');
        expect(addDiagram).toHaveBeenCalledTimes(1);
        const diagram = addDiagram.mock.calls[0][0].diagram;
        expect(diagram.id).toBe(localId);
        expect(diagram.id).not.toBe('42');
        expect(diagram).not.toHaveProperty('access');
        expect(diagram.name).toBe('Main (2)');
        expect(diagram.databaseType).toBe(DatabaseType.POSTGRESQL);
    });
});
