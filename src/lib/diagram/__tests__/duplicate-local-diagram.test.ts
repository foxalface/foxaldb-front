import { beforeEach, describe, expect, it, vi } from 'vitest';
import { duplicateLocalDiagram } from '../duplicate-local-diagram';

describe('duplicateLocalDiagram', () => {
    const getDiagram = vi.fn();
    const listDiagrams = vi.fn();
    const addDiagram = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        listDiagrams.mockResolvedValue([{ id: 'local-one', name: 'One' }]);
        getDiagram.mockResolvedValue({
            id: 'local-one',
            name: 'One',
            tables: [],
        });
        addDiagram.mockResolvedValue(undefined);
    });

    it('duplicates a guest local diagram', async () => {
        const newId = await duplicateLocalDiagram(
            getDiagram,
            listDiagrams,
            addDiagram,
            'local-one'
        );

        expect(newId).toEqual(expect.any(String));
        expect(newId).not.toBe('local-one');
        expect(getDiagram.mock.calls[0][0]).toBe('local-one');
        expect(addDiagram).toHaveBeenCalledTimes(1);
        expect(addDiagram.mock.calls[0][0].diagram.id).toBe(newId);
    });

    it('duplicates when the only local rows are legacy numeric Dexie shadows', async () => {
        listDiagrams.mockResolvedValue([{ id: '42', name: 'Shadow' }]);
        getDiagram.mockResolvedValue({
            id: '42',
            name: 'Shadow',
            tables: [],
        });

        const newId = await duplicateLocalDiagram(
            getDiagram,
            listDiagrams,
            addDiagram,
            '42'
        );

        expect(newId).toEqual(expect.any(String));
        expect(newId).not.toBe('42');
        expect(addDiagram).toHaveBeenCalledTimes(1);
    });

    it('duplicates for authenticated users with multiple local diagrams', async () => {
        listDiagrams.mockResolvedValue([
            { id: '42', name: 'One' },
            { id: '99', name: 'Two' },
        ]);
        getDiagram.mockResolvedValue({
            id: '42',
            name: 'One',
            tables: [],
        });

        const newId = await duplicateLocalDiagram(
            getDiagram,
            listDiagrams,
            addDiagram,
            '42'
        );

        expect(newId).toEqual(expect.any(String));
        expect(addDiagram).toHaveBeenCalledTimes(1);
    });
});
