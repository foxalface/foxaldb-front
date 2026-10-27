import { describe, expect, it, vi } from 'vitest';
import { findGuestLocalDiagramId } from '@/lib/diagram/find-guest-local-diagram-id';

describe('findGuestLocalDiagramId', () => {
    it('returns the first diagram id when diagrams exist', async () => {
        const listDiagrams = vi
            .fn()
            .mockResolvedValue([{ id: 'guest-1' }, { id: 'guest-2' }]);

        await expect(findGuestLocalDiagramId(listDiagrams)).resolves.toBe(
            'guest-1'
        );
        expect(listDiagrams).toHaveBeenCalledTimes(1);
    });

    it('returns null when no diagrams exist', async () => {
        const listDiagrams = vi.fn().mockResolvedValue([]);

        await expect(findGuestLocalDiagramId(listDiagrams)).resolves.toBeNull();
    });

    it('skips legacy numeric Dexie shadows', async () => {
        const listDiagrams = vi
            .fn()
            .mockResolvedValue([{ id: '42' }, { id: 'guest-1' }]);

        await expect(findGuestLocalDiagramId(listDiagrams)).resolves.toBe(
            'guest-1'
        );
    });

    it('returns null when only numeric shadows exist', async () => {
        const listDiagrams = vi.fn().mockResolvedValue([{ id: '42' }]);

        await expect(findGuestLocalDiagramId(listDiagrams)).resolves.toBeNull();
    });
});
