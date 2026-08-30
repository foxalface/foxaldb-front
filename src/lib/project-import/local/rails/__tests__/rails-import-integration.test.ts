import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { ArchiveReader } from '../../../archive/archive-reader';
import { importProject } from '../../../import-project';
import { createTestZipFile } from '../../../__tests__/fixtures/build-test-zip';
import { USERS_POSTS_SCHEMA } from './fixtures/rails-schemas';

describe('importProject rails integration', () => {
    it('parses Rails locally without remote API calls', async () => {
        const file = createTestZipFile({
            'db/schema.rb': USERS_POSTS_SCHEMA,
            Gemfile: "gem 'rails', '~> 7.1'",
        });
        const archive = await ArchiveReader.open(file);

        const result = await importProject({
            archive,
            candidate: {
                framework: 'rails',
                rootPath: '',
                relevantFiles: ['db/schema.rb', 'Gemfile'],
                score: 16,
                confidence: 'high',
                evidence: [],
                parserLocation: 'local',
            },
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(result.framework).toBe('rails');
        expect(result.diagram.tables?.length).toBe(2);
        expect(result.diagram.relationships?.length).toBe(1);
        expect(result.diagram.databaseType).toBe(DatabaseType.POSTGRESQL);

        archive.close();
    });
});
