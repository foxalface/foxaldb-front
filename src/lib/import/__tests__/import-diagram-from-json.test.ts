import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { diagramJsonSample } from '@/lib/import/__tests__/fixtures/import-samples';
import {
    ImportDiagramJsonError,
    importDiagramFromJson,
} from '../import-diagram-from-json';
import {
    diagramFromJSONInput,
    diagramToJSONOutput,
} from '@/lib/export-import-utils';
import type { Diagram } from '@/lib/domain/diagram';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const versionedExportSource: Diagram = {
    id: 'source-diagram',
    name: 'Users Schema',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 'table-users',
            name: 'users',
            x: 10,
            y: 20,
            fields: [
                {
                    id: 'field-users-id',
                    name: 'id',
                    type: { id: 'bigint', name: 'bigint' },
                    primaryKey: true,
                    unique: true,
                    nullable: false,
                    createdAt: 1,
                },
            ],
            indexes: [],
            color: '#ffe374',
            isView: false,
            createdAt: 2,
        },
    ],
    relationships: [],
    createdAt,
    updatedAt: createdAt,
};

describe('importDiagramFromJson', () => {
    it('imports a diagram and applies the chosen database type', () => {
        const diagram = importDiagramFromJson(
            diagramJsonSample,
            DatabaseType.MYSQL
        );

        expect(diagram.databaseType).toBe(DatabaseType.MYSQL);
        expect(diagram.name).toBe('Imported Diagram');
        expect(diagram.tables).toEqual([]);
    });

    it('imports legacy unversioned Diagram JSON', () => {
        const diagram = importDiagramFromJson(
            diagramJsonSample,
            DatabaseType.POSTGRESQL
        );

        expect(JSON.parse(diagramJsonSample).schemaVersion).toBeUndefined();
        expect(diagram.name).toBe('Imported Diagram');
        expect(diagram.id).not.toBe('diagram-1');
    });

    it('imports schemaVersion 1 JSON, assigns a new root identity, and remaps entity IDs', () => {
        const exported = diagramToJSONOutput(versionedExportSource);
        const parsedExport = JSON.parse(exported) as {
            schemaVersion: number;
            id: string;
            tables: Array<{ id: string; name: string }>;
        };

        expect(parsedExport.schemaVersion).toBe(1);

        const imported = diagramFromJSONInput(exported);

        expect(imported.name).toBe('Users Schema');
        expect(imported.id).not.toBe(parsedExport.id);
        expect(imported.tables?.[0]?.name).toBe('users');
        expect(imported.tables?.[0]?.id).not.toBe(parsedExport.tables[0]?.id);
    });

    it('throws when the JSON is invalid', () => {
        expect(() =>
            importDiagramFromJson('{ invalid', DatabaseType.POSTGRESQL)
        ).toThrow(ImportDiagramJsonError);
    });
});
