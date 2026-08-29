import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { diagramJsonSample } from '@/lib/import/__tests__/fixtures/import-samples';
import {
    ImportDiagramJsonError,
    importDiagramFromJson,
} from '../import-diagram-from-json';

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

    it('throws when the JSON is invalid', () => {
        expect(() =>
            importDiagramFromJson('{ invalid', DatabaseType.POSTGRESQL)
        ).toThrow(ImportDiagramJsonError);
    });
});
