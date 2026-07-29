import { describe, expect, it } from 'vitest';
import {
    isGuestLocalDiagramId,
    findGuestLocalDiagramIdForMigration,
} from '@/lib/diagram/find-guest-local-diagram-id';

describe('findGuestLocalDiagramIdForMigration', () => {
    it('returns non-numeric guest diagram ids only', async () => {
        const id = await findGuestLocalDiagramIdForMigration(async () => [
            { id: '42' },
            { id: 'guest-abc' },
        ]);

        expect(id).toBe('guest-abc');
    });

    it('returns null when only remote numeric ids exist locally', async () => {
        const id = await findGuestLocalDiagramIdForMigration(async () => [
            { id: '42' },
        ]);

        expect(id).toBeNull();
    });
});

describe('isGuestLocalDiagramId', () => {
    it('identifies guest ids', () => {
        expect(isGuestLocalDiagramId('guest-abc')).toBe(true);
        expect(isGuestLocalDiagramId('42')).toBe(false);
    });
});
