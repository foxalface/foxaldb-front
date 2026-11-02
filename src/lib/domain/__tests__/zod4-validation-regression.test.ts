import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { diagramSchema } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import { DatabaseMetadataSchema } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { parseDiagramJsonContent } from '@/lib/import/parse-diagram-json-content';

describe('Zod 4 validation regression', () => {
    it('rejects diagram JSON with an invalid databaseType enum', () => {
        const result = parseDiagramJsonContent(
            JSON.stringify({
                id: 'd1',
                name: 'test',
                databaseType: 'not_a_real_engine',
                tables: [],
                relationships: [],
            })
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.failure.code).toBe('invalid_diagram_json');
        expect(result.failure.path).toBe('databaseType');
        expect(result.failure.issueCode).toBe('invalid_enum');
    });

    it('rejects diagram JSON missing required top-level fields', () => {
        const result = parseDiagramJsonContent(
            JSON.stringify({
                databaseType: 'mysql',
                tables: [],
            }),
            DatabaseType.MYSQL
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.failure.code).toBe('invalid_diagram_json');
        expect(result.failure.path).not.toBeNull();
    });

    it('rejects deeply invalid nested table field types', () => {
        const result = parseDiagramJsonContent(
            JSON.stringify({
                id: 'd1',
                name: 'test',
                databaseType: 'mysql',
                tables: [
                    {
                        id: 't1',
                        name: 'users',
                        x: 0,
                        y: 0,
                        fields: [
                            {
                                id: 'f1',
                                name: 'id',
                                type: 'not-an-object',
                                primaryKey: true,
                                unique: true,
                                nullable: false,
                                createdAt: 1,
                            },
                        ],
                        indexes: [],
                        color: '#000',
                        isView: false,
                        createdAt: 1,
                    },
                ],
                relationships: [],
            }),
            DatabaseType.MYSQL
        );

        expect(result.ok).toBe(false);
        if (result.ok) {
            return;
        }

        expect(result.failure.path).toContain('fields');
    });

    it('validates oversized arrays against explicit max constraints without accepting excess elements', () => {
        const boundedListSchema = z.array(z.string()).max(3);
        const oversized = ['a', 'b', 'c', 'd', 'e'];
        const parsed = boundedListSchema.safeParse(oversized);

        expect(parsed.success).toBe(false);
        if (parsed.success) {
            return;
        }

        expect(
            parsed.error.issues.some((issue) => issue.code === 'too_big')
        ).toBe(true);
    });

    it('rejects malformed SQL import metadata missing required arrays', () => {
        const parsed = DatabaseMetadataSchema.safeParse({
            database_name: 'app',
            version: '8.0',
        });

        expect(parsed.success).toBe(false);
    });

    it('accepts minimal valid SQL import metadata shape', () => {
        const parsed = DatabaseMetadataSchema.safeParse({
            fk_info: [],
            pk_info: [],
            columns: [],
            indexes: [],
            tables: [],
            views: [],
            database_name: 'app',
            version: '8.0',
        });

        expect(parsed.success).toBe(true);
    });

    it('diagram schema strips unknown keys while preserving known fields', () => {
        const now = new Date();
        const parsed = diagramSchema.parse({
            id: 'd1',
            name: 'diagram',
            databaseType: DatabaseType.MYSQL,
            createdAt: now,
            updatedAt: now,
            unexpectedFutureField: 'ignored',
        });

        expect(parsed.id).toBe('d1');
        expect(
            'unexpectedFutureField' in
                (parsed as unknown as Record<string, unknown>)
        ).toBe(false);
    });
});
