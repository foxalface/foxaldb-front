import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    formatDiagramJsonZodPath,
    normalizeDiagramJsonPayload,
    parseDiagramJsonContent,
} from '../parse-diagram-json-content';

const baseTable = {
    id: '1',
    name: 'users',
    x: 0,
    y: 0,
    fields: [
        {
            id: '2',
            name: 'id',
            type: { id: 'int', name: 'int' },
            primaryKey: true,
            unique: true,
            nullable: false,
            createdAt: 1,
        },
    ],
    indexes: [
        {
            id: '3',
            name: null,
            unique: true,
            fieldIds: ['2'],
            createdAt: 1,
            isPrimaryKey: true,
        },
    ],
    color: '#fff',
    isView: false,
    createdAt: 1,
};

const diagramWithNullPkIndexName = JSON.stringify({
    id: 'diagram',
    name: 'foxaldb',
    databaseType: 'mysql',
    tables: [baseTable],
    relationships: [],
});

describe('parse-diagram-json-content', () => {
    it('formats Zod paths for display', () => {
        expect(
            formatDiagramJsonZodPath(['tables', 0, 'indexes', 0, 'name'])
        ).toBe('tables[0].indexes[0].name');
    });

    it('normalizes null index names to empty strings', () => {
        const normalized = normalizeDiagramJsonPayload({
            tables: [{ indexes: [{ name: null }] }],
        }) as { tables: Array<{ indexes: Array<{ name: string }> }> };

        expect(normalized.tables[0].indexes[0].name).toBe('');
    });

    it('imports diagram JSON with null PK index names after normalization', () => {
        const result = parseDiagramJsonContent(
            diagramWithNullPkIndexName,
            DatabaseType.MYSQL
        );

        expect(result.ok).toBe(true);

        if (!result.ok) {
            return;
        }

        expect(result.diagram.tables?.[0]?.indexes[0]?.name).toBe('');
        expect(result.diagram.databaseType).toBe(DatabaseType.MYSQL);
    });

    it('returns a path when validation fails after normalization', () => {
        const broken = JSON.stringify({
            id: 'diagram',
            name: 'x',
            databaseType: 'mysql',
            tables: [
                {
                    ...baseTable,
                    indexes: [
                        {
                            id: 'i',
                            name: 123,
                            fieldIds: [],
                            unique: false,
                            createdAt: 1,
                        },
                    ],
                },
            ],
            relationships: [],
        });

        const result = parseDiagramJsonContent(broken, DatabaseType.MYSQL);

        expect(result.ok).toBe(false);

        if (result.ok) {
            return;
        }

        expect(result.failure.code).toBe('invalid_diagram_json');
        expect(result.failure.path).toContain('indexes');
    });
});
