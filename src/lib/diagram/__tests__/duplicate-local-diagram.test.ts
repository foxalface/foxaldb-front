import { beforeEach, describe, expect, it, vi } from 'vitest';
import { duplicateLocalDiagram } from '../duplicate-local-diagram';
import { GuestDeviceDiagramLimitError } from '../guest-device-diagram-limit';

describe('duplicateLocalDiagram guest limit', () => {
    const getDiagram = vi.fn();
    const listDiagrams = vi.fn();
    const addDiagram = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        listDiagrams.mockResolvedValue([{ id: '42', name: 'One' }]);
        getDiagram.mockResolvedValue({
            id: '42',
            name: 'One',
            tables: [],
        });
        addDiagram.mockResolvedValue(undefined);
    });

    it('blocks guest duplication when a device diagram already exists', async () => {
        await expect(
            duplicateLocalDiagram(
                getDiagram,
                listDiagrams,
                addDiagram,
                '42',
                false
            )
        ).rejects.toBeInstanceOf(GuestDeviceDiagramLimitError);

        expect(getDiagram).not.toHaveBeenCalled();
        expect(addDiagram).not.toHaveBeenCalled();
    });

    it('allows authenticated device duplication', async () => {
        listDiagrams.mockResolvedValue([
            { id: '42', name: 'One' },
            { id: '99', name: 'Two' },
        ]);

        await expect(
            duplicateLocalDiagram(
                getDiagram,
                listDiagrams,
                addDiagram,
                '42',
                true
            )
        ).resolves.toEqual(expect.any(String));

        expect(addDiagram).toHaveBeenCalledTimes(1);
    });
});
