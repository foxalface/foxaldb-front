import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { parsePrismaProject } from '../../local/prisma/prisma-project-parser';
import { PrismaProjectParseFailedError } from '../../local/prisma/prisma-project-parser';
import { parseRailsProject } from '../../local/rails/rails-project-parser';
import { parseDrizzleProject } from '../../local/drizzle/drizzle-project-parser';
import { DrizzleProjectParseFailedError } from '../../local/drizzle/drizzle-project-parser';
import { malformedSchema } from '../../local/prisma/__tests__/fixtures/prisma-schemas';
import { canExecuteProjectImport } from '../../project-import-capability';
import { projectInput } from './project-semantic-helpers';

describe('M11.3 project import edge cases', () => {
    it('rejects malformed Prisma schema through parsePrismaProject', async () => {
        await expect(
            parsePrismaProject(
                projectInput(
                    'prisma',
                    [
                        {
                            relativePath: 'prisma/schema.prisma',
                            content: malformedSchema,
                        },
                    ],
                    DatabaseType.POSTGRESQL
                )
            )
        ).rejects.toBeInstanceOf(PrismaProjectParseFailedError);
    });

    it('rejects Drizzle bundle without migration SQL', async () => {
        await expect(
            parseDrizzleProject(
                projectInput(
                    'drizzle',
                    [
                        {
                            relativePath: 'drizzle.config.ts',
                            content: "export default { dialect: 'mysql' };",
                        },
                    ],
                    DatabaseType.MYSQL
                )
            )
        ).rejects.toBeInstanceOf(DrizzleProjectParseFailedError);
    });

    it('rejects Rails bundle without schema.rb', async () => {
        await expect(
            parseRailsProject(
                projectInput(
                    'rails',
                    [
                        {
                            relativePath: 'README.md',
                            content: '# no schema',
                        },
                    ],
                    DatabaseType.POSTGRESQL
                )
            )
        ).rejects.toThrow();
    });

    it('rejects Prisma schema with no models', async () => {
        await expect(
            parsePrismaProject(
                projectInput(
                    'prisma',
                    [
                        {
                            relativePath: 'prisma/schema.prisma',
                            content: `datasource db { provider = "postgresql" }\n`,
                        },
                    ],
                    DatabaseType.POSTGRESQL
                )
            )
        ).rejects.toBeInstanceOf(PrismaProjectParseFailedError);
    });

    it('preserves guest vs auth execution matrix for remote frameworks', () => {
        expect(canExecuteProjectImport('laravel', false)).toBe(false);
        expect(canExecuteProjectImport('entity_framework_core', false)).toBe(
            false
        );
        expect(canExecuteProjectImport('django', false)).toBe(false);
        expect(canExecuteProjectImport('prisma', false)).toBe(true);
        expect(canExecuteProjectImport('rails', false)).toBe(true);
        expect(canExecuteProjectImport('drizzle', false)).toBe(true);
    });
});
