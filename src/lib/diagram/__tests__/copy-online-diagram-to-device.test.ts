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
            '42'
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

    it('remaps tag assignments onto the new local entities', async () => {
        getDiagram.mockResolvedValue({
            id: '42',
            name: 'Main',
            content: {
                name: 'Main',
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    {
                        id: 'table-users',
                        name: 'users',
                        x: 0,
                        y: 0,
                        fields: [
                            {
                                id: 'field-email',
                                name: 'email',
                                type: { id: 'varchar', name: 'varchar' },
                                primaryKey: false,
                                unique: false,
                                nullable: true,
                                createdAt: 1,
                            },
                        ],
                        indexes: [],
                        color: '#8eb7ff',
                        isView: false,
                        createdAt: 1,
                    },
                ],
                relationships: [],
                tags: [
                    { id: 'tag-backend', name: 'Backend', color: '#8eb7ff' },
                ],
                tagAssignments: [
                    {
                        id: 'as-table',
                        tagId: 'tag-backend',
                        targetType: 'table',
                        targetId: 'table-users',
                    },
                    {
                        id: 'as-field',
                        tagId: 'tag-backend',
                        targetType: 'field',
                        targetId: 'field-email',
                    },
                ],
            },
        });
        const addDiagram = vi.fn().mockResolvedValue(undefined);
        const listDiagrams = vi.fn().mockResolvedValue([]);

        await copyOnlineDiagramToDevice(listDiagrams, addDiagram, '42');

        const diagram = addDiagram.mock.calls[0][0].diagram;
        const copiedTable = diagram.tables[0];
        const copiedField = copiedTable.fields[0];

        expect(diagram.tags).toHaveLength(1);
        expect(diagram.tags[0].id).not.toBe('tag-backend');
        expect(diagram.tags[0].name).toBe('Backend');
        expect(diagram.tagAssignments).toHaveLength(2);
        expect(diagram.tagAssignments[0].tagId).toBe(diagram.tags[0].id);
        expect(diagram.tagAssignments[0].targetId).toBe(copiedTable.id);
        expect(diagram.tagAssignments[1].targetId).toBe(copiedField.id);
        expect(diagram.tagAssignments[0].id).not.toBe('as-table');
    });
});
