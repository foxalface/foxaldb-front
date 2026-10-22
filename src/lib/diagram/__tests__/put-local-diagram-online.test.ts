import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    putLocalDiagramOnlineCopy,
    putLocalDiagramOnlineMove,
} from '../put-local-diagram-online';

const createDiagram = vi.fn();
const getDiagram = vi.fn();
const deleteDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    createDiagram: (...args: unknown[]) => createDiagram(...args),
}));

const sampleDiagram = (): Diagram => ({
    id: 'local-1',
    name: 'Local',
    databaseType: DatabaseType.GENERIC,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    tables: [],
});

describe('put-local-diagram-online', () => {
    beforeEach(() => {
        createDiagram.mockReset();
        getDiagram.mockReset();
        deleteDiagram.mockReset();
        getDiagram.mockResolvedValue(sampleDiagram());
    });

    it('copy creates backend diagram and keeps local diagram', async () => {
        createDiagram.mockResolvedValue({ diagram: { id: 42 } });

        const remoteId = await putLocalDiagramOnlineCopy(getDiagram, 'local-1');

        expect(remoteId).toBe('42');
        expect(createDiagram).toHaveBeenCalledTimes(1);
        expect(deleteDiagram).not.toHaveBeenCalled();
    });

    it('move creates backend diagram before deleting local diagram', async () => {
        const order: string[] = [];
        createDiagram.mockImplementation(async () => {
            order.push('create');
            return { diagram: { id: 99 } };
        });
        deleteDiagram.mockImplementation(async () => {
            order.push('delete');
        });

        const remoteId = await putLocalDiagramOnlineMove(
            getDiagram,
            deleteDiagram,
            'local-1'
        );

        expect(remoteId).toBe('99');
        expect(order).toEqual(['create', 'delete']);
    });

    it('move preserves local diagram when backend creation fails', async () => {
        createDiagram.mockRejectedValue(new Error('network'));

        await expect(
            putLocalDiagramOnlineMove(getDiagram, deleteDiagram, 'local-1')
        ).rejects.toThrow('network');

        expect(deleteDiagram).not.toHaveBeenCalled();
    });
});
