import { describe, expect, it } from 'vitest';
import {
    SCHEMA_MERGE_SOURCE_KINDS,
    SCHEMA_MERGE_SOURCE_KIND_BY_IMPORT_FORMAT,
    SCHEMA_MERGE_SOURCE_KIND_BY_PROJECT_FRAMEWORK,
} from '../source-kinds';

/** Locked against `SchemaMergeSourceKind::values()` in the backend. */
const BACKEND_SOURCE_KINDS = [
    'sql',
    'postgres_dump',
    'dbml',
    'diagram_json',
    'metadata_json',
    'laravel',
    'prisma',
    'entity_framework_core',
    'rails',
    'django',
    'drizzle',
] as const;

describe('schema merge source kinds contract', () => {
    it('matches the backend enum order and values', () => {
        expect([...SCHEMA_MERGE_SOURCE_KINDS]).toEqual([
            ...BACKEND_SOURCE_KINDS,
        ]);
        expect(SCHEMA_MERGE_SOURCE_KINDS).not.toContain('ef_core');
    });

    it('maps every import format and project framework to a backend kind', () => {
        expect(
            Object.values(SCHEMA_MERGE_SOURCE_KIND_BY_IMPORT_FORMAT)
        ).toEqual(
            expect.arrayContaining([
                'sql',
                'postgres_dump',
                'dbml',
                'diagram_json',
                'metadata_json',
            ])
        );
        expect(
            Object.values(SCHEMA_MERGE_SOURCE_KIND_BY_PROJECT_FRAMEWORK)
        ).toEqual(
            expect.arrayContaining([
                'laravel',
                'prisma',
                'entity_framework_core',
                'rails',
                'django',
                'drizzle',
            ])
        );
    });
});
