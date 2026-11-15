import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ExportSqlScript from '@/lib/data/sql-export/export-sql-script';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { generateDiagramId, generateId } from '@/lib/utils';
import { generateDBMLFromDiagram } from '../dbml-export';

const PRIVATE_EXCEPTION = 'VERY_PRIVATE_INTERNAL_DBML_EXCEPTION';

const { exportBaseSQLMock } = vi.hoisted(() => ({
    exportBaseSQLMock: vi.fn(),
}));

vi.mock('@/lib/data/sql-export/export-sql-script', async (importOriginal) => {
    const actual = await importOriginal<typeof ExportSqlScript>();

    return {
        ...actual,
        exportBaseSQL: (...args: Parameters<typeof actual.exportBaseSQL>) =>
            exportBaseSQLMock(...args),
    };
});

const diagram = (): Diagram => ({
    id: generateDiagramId(),
    name: 'Test Diagram',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: generateId(),
            name: 'users',
            schema: 'public',
            x: 0,
            y: 0,
            fields: [
                {
                    id: generateId(),
                    name: 'id',
                    type: { id: 'integer', name: 'integer' },
                    primaryKey: true,
                    unique: true,
                    nullable: false,
                    createdAt: Date.now(),
                },
            ],
            indexes: [],
            color: '#8eb7ff',
            isView: false,
            createdAt: Date.now(),
        },
    ],
    relationships: [],
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('generateDBMLFromDiagram failure presentation', () => {
    beforeEach(async () => {
        const actual = await vi.importActual<typeof ExportSqlScript>(
            '@/lib/data/sql-export/export-sql-script'
        );
        exportBaseSQLMock.mockReset();
        exportBaseSQLMock.mockImplementation(actual.exportBaseSQL);
    });

    it('returns DBML for a valid diagram', async () => {
        const result = await generateDBMLFromDiagram(diagram());

        expect(result.error).toBeUndefined();
        expect(result.standardDbml).toContain('users');
        expect(result.inlineDbml).toContain('users');
        expect(result.standardDbml).not.toContain(PRIVATE_EXCEPTION);
    });

    it('does not return the generator exception in the DBML result', async () => {
        exportBaseSQLMock.mockRejectedValue(new Error(PRIVATE_EXCEPTION));
        const errorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const result = await generateDBMLFromDiagram(diagram());

        expect(result.error).toBe('generate_failed');
        expect(JSON.stringify(result)).not.toContain(PRIVATE_EXCEPTION);
        expect(result.standardDbml).toBe('');
        expect(result.inlineDbml).toBe('');
        expect(result.relationshipsDbml).toBe('');
        expect(errorSpy).toHaveBeenCalled();
        const loggedError = errorSpy.mock.calls[0]?.[1];
        expect(loggedError).toBeInstanceOf(Error);
        expect((loggedError as Error).message).toBe(PRIVATE_EXCEPTION);

        errorSpy.mockRestore();
    });
});
