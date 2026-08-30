import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { ArchiveReader } from '../../../archive/archive-reader';
import { importProject } from '../../../import-project';
import { createTestZipFile } from '../../../__tests__/fixtures/build-test-zip';
import { usersPostsSchema } from './fixtures/prisma-schemas';

describe('importProject prisma integration', () => {
    it('parses Prisma locally without remote API calls', async () => {
        const file = createTestZipFile({
            'prisma/schema.prisma': usersPostsSchema,
        });
        const archive = await ArchiveReader.open(file);

        const result = await importProject({
            archive,
            candidate: {
                framework: 'prisma',
                rootPath: '',
                relevantFiles: ['prisma/schema.prisma'],
                score: 12,
                confidence: 'high',
                evidence: [],
                parserLocation: 'local',
            },
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(result.framework).toBe('prisma');
        expect(result.diagram.tables?.length).toBe(2);
        expect(result.diagram.relationships?.length).toBe(1);
        expect(result.diagram.databaseType).toBe(DatabaseType.POSTGRESQL);

        archive.close();
    });
});
