import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { ProjectImportInput } from '../../../project-execution-types';
import { parseRailsProject } from '../rails-project-parser';
import { FOXALDB_DO_NOT_EXPOSE_RAILS_SOURCE } from '../rails-constants';
import { SENTINEL_SCHEMA, USERS_POSTS_SCHEMA } from './fixtures/rails-schemas';

const baseInput = (
    content: string,
    targetDatabaseType = DatabaseType.POSTGRESQL
): ProjectImportInput => ({
    candidate: {
        framework: 'rails',
        rootPath: 'rails-app',
        relevantFiles: ['db/schema.rb'],
        score: 20,
        confidence: 'high',
        evidence: [],
        parserLocation: 'local',
    },
    bundle: {
        framework: 'rails',
        rootPath: 'rails-app',
        files: [{ relativePath: 'db/schema.rb', content }],
    },
    targetDatabaseType,
});

describe('parseRailsProject', () => {
    it('parses users/posts into a canonical diagram', async () => {
        const result = await parseRailsProject(baseInput(USERS_POSTS_SCHEMA));

        expect(result.framework).toBe('rails');
        expect(result.diagram.tables).toHaveLength(2);
        expect(result.diagram.relationships).toHaveLength(1);
        expect(result.diagram.databaseType).toBe(DatabaseType.POSTGRESQL);
    });

    it('fails when schema.rb is missing', async () => {
        await expect(
            parseRailsProject({
                ...baseInput(USERS_POSTS_SCHEMA),
                bundle: { framework: 'rails', rootPath: '', files: [] },
            })
        ).rejects.toMatchObject({
            diagnostics: [
                expect.objectContaining({ code: 'rails_schema_missing' }),
            ],
        });
    });

    it('does not leak source sentinel into diagnostics or result', async () => {
        const result = await parseRailsProject(baseInput(SENTINEL_SCHEMA));

        const serialized = JSON.stringify(result);
        expect(serialized).not.toContain(FOXALDB_DO_NOT_EXPOSE_RAILS_SOURCE);
    });

    it.each([
        DatabaseType.MYSQL,
        DatabaseType.POSTGRESQL,
        DatabaseType.SQLITE,
        DatabaseType.SQL_SERVER,
        DatabaseType.MARIADB,
        DatabaseType.ORACLE,
    ])('preserves requested target database type %s', async (databaseType) => {
        const result = await parseRailsProject(
            baseInput(USERS_POSTS_SCHEMA, databaseType)
        );

        expect(result.diagram.databaseType).toBe(databaseType);
    });
});
