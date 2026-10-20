import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { parsePrismaProject } from '../../local/prisma/prisma-project-parser';
import { parseRailsProject } from '../../local/rails/rails-project-parser';
import { parseDrizzleProject } from '../../local/drizzle/drizzle-project-parser';
import { QA_PRISMA_SCHEMA } from '../../local/prisma/__tests__/fixtures/m10-realistic-fixtures';
import { QA_RAILS_SCHEMA } from '../../local/rails/__tests__/fixtures/m10-realistic-fixtures';
import { QA_DRIZZLE_SQL } from '../../local/rails/__tests__/fixtures/m10-realistic-fixtures';
import {
    DRIZZLE_ADD_BIO_SQL,
    DRIZZLE_INIT_SQL,
    DRIZZLE_JOURNAL,
    DRIZZLE_MYSQL_INIT_SQL,
    DRIZZLE_QA_CUMULATIVE_ADD_SKU_SQL,
    DRIZZLE_QA_CUMULATIVE_INITIAL_SQL,
    DRIZZLE_QA_CUMULATIVE_JOURNAL,
} from '../../local/drizzle/__tests__/fixtures/drizzle-migrations';
import { enumSchema } from '../../local/prisma/__tests__/fixtures/prisma-schemas';
import {
    findSemanticField,
    findSemanticTable,
    postsToUsersFk,
    projectInput,
    semanticFromProjectResult,
} from './project-semantic-helpers';

describe('M11.3 local framework semantic goldens', () => {
    describe('Prisma', () => {
        it('imports QA schema with physical @@map names and FK semantics', async () => {
            const result = await parsePrismaProject(
                projectInput(
                    'prisma',
                    [
                        {
                            relativePath: 'prisma/schema.prisma',
                            content: QA_PRISMA_SCHEMA,
                        },
                    ],
                    DatabaseType.MYSQL
                )
            );

            const semantic = semanticFromProjectResult(result);
            expect(semantic.databaseType).toBe(DatabaseType.MYSQL);

            const users = findSemanticTable(semantic, 'users');
            const posts = findSemanticTable(semantic, 'posts');
            expect(users).toBeDefined();
            expect(posts).toBeDefined();

            const email = findSemanticField(users, 'email');
            expect(email?.nullable).toBe(false);
            expect(email?.unique).toBe(true);
            expect(email?.characterMaximumLength).toBe('255');
            expect(findSemanticField(users, 'id')?.increment).toBe(true);

            const userId = findSemanticField(posts, 'user_id');
            expect(userId?.primaryKey).toBe(false);

            const fk = postsToUsersFk(semantic);
            expect(fk).toBeDefined();
            expect(fk?.deleteAction).toBe('cascade');
        });

        it('imports enum custom types from schema.prisma', async () => {
            const result = await parsePrismaProject(
                projectInput(
                    'prisma',
                    [
                        {
                            relativePath: 'prisma/schema.prisma',
                            content: enumSchema,
                        },
                    ],
                    DatabaseType.POSTGRESQL
                )
            );

            const semantic = semanticFromProjectResult(result);
            expect(
                semantic.customTypes.some(
                    (customType) => customType.name === 'Role'
                )
            ).toBe(true);
        });
    });

    describe('Rails', () => {
        it('imports db/schema.rb with posts.user_id → users.id semantics', async () => {
            const result = await parseRailsProject(
                projectInput(
                    'rails',
                    [
                        {
                            relativePath: 'db/schema.rb',
                            content: QA_RAILS_SCHEMA,
                        },
                    ],
                    DatabaseType.POSTGRESQL
                )
            );

            const semantic = semanticFromProjectResult(result);
            expect(semantic.databaseType).toBe(DatabaseType.POSTGRESQL);
            expect(postsToUsersFk(semantic)).toBeDefined();
            const users = findSemanticTable(semantic, 'users');
            expect(
                users?.indexes?.some(
                    (index) =>
                        index.unique && index.fieldNames.includes('email')
                )
            ).toBe(true);
        });
    });

    describe('Drizzle', () => {
        it('imports MySQL baseline migration bundle', async () => {
            const result = await parseDrizzleProject(
                projectInput(
                    'drizzle',
                    [
                        {
                            relativePath: 'drizzle/0000_initial.sql',
                            content: QA_DRIZZLE_SQL,
                        },
                        {
                            relativePath: 'drizzle/meta/_journal.json',
                            content: JSON.stringify({
                                version: '7',
                                dialect: 'mysql',
                                entries: [
                                    {
                                        idx: 0,
                                        version: '5',
                                        when: 1,
                                        tag: '0000_initial',
                                        breakpoints: true,
                                    },
                                ],
                            }),
                        },
                        {
                            relativePath: 'drizzle.config.ts',
                            content: "export default { dialect: 'mysql' };",
                        },
                    ],
                    DatabaseType.MYSQL
                )
            );

            const semantic = semanticFromProjectResult(result);
            expect(semantic.databaseType).toBe(DatabaseType.MYSQL);
            expect(postsToUsersFk(semantic)?.deleteAction).toBe('cascade');
        });

        it('replays PostgreSQL migrations in journal order with cumulative ALTER', async () => {
            const result = await parseDrizzleProject(
                projectInput(
                    'drizzle',
                    [
                        {
                            relativePath: 'drizzle/meta/_journal.json',
                            content: DRIZZLE_JOURNAL,
                        },
                        {
                            relativePath: 'drizzle/0000_init.sql',
                            content: DRIZZLE_INIT_SQL,
                        },
                        {
                            relativePath: 'drizzle/0001_add_bio.sql',
                            content: DRIZZLE_ADD_BIO_SQL,
                        },
                        {
                            relativePath: 'drizzle.config.ts',
                            content:
                                "export default { dialect: 'postgresql' };",
                        },
                    ],
                    DatabaseType.POSTGRESQL
                )
            );

            const semantic = semanticFromProjectResult(result);
            expect(
                findSemanticField(findSemanticTable(semantic, 'users'), 'bio')
            ).toBeDefined();
            expect(postsToUsersFk(semantic)).toBeDefined();
        });

        it('preserves varchar(32) after ALTER ADD COLUMN (M9.2 regression)', async () => {
            const result = await parseDrizzleProject(
                projectInput(
                    'drizzle',
                    [
                        {
                            relativePath: 'drizzle/meta/_journal.json',
                            content: DRIZZLE_QA_CUMULATIVE_JOURNAL,
                        },
                        {
                            relativePath: 'drizzle/0000_initial.sql',
                            content: DRIZZLE_QA_CUMULATIVE_INITIAL_SQL,
                        },
                        {
                            relativePath: 'drizzle/0001_add_sku.sql',
                            content: DRIZZLE_QA_CUMULATIVE_ADD_SKU_SQL,
                        },
                        {
                            relativePath: 'drizzle.config.ts',
                            content: "export default { dialect: 'mysql' };",
                        },
                    ],
                    DatabaseType.MYSQL
                )
            );

            const semantic = semanticFromProjectResult(result);
            const products = findSemanticTable(semantic, 'products');
            const sku = findSemanticField(products, 'sku');
            expect(sku?.characterMaximumLength).toBe('32');
            expect(
                products?.indexes?.some(
                    (index) =>
                        index.name === 'products_sku_unique' && index.unique
                )
            ).toBe(true);
        });

        it('imports SQLite dialect smoke from config', async () => {
            const result = await parseDrizzleProject(
                projectInput(
                    'drizzle',
                    [
                        {
                            relativePath: 'drizzle/0000_init.sql',
                            content: `CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE);`,
                        },
                        {
                            relativePath: 'drizzle.config.ts',
                            content: "export default { dialect: 'sqlite' };",
                        },
                    ],
                    DatabaseType.SQLITE
                )
            );

            const semantic = semanticFromProjectResult(result);
            expect(semantic.databaseType).toBe(DatabaseType.SQLITE);
            expect(findSemanticTable(semantic, 'users')).toBeDefined();
        });

        it('imports MySQL provider smoke without full M11.2 SQL duplication', async () => {
            const result = await parseDrizzleProject(
                projectInput(
                    'drizzle',
                    [
                        {
                            relativePath: 'drizzle/0000_init.sql',
                            content: DRIZZLE_MYSQL_INIT_SQL,
                        },
                        {
                            relativePath: 'drizzle.config.ts',
                            content: "export default { dialect: 'mysql' };",
                        },
                    ],
                    DatabaseType.MYSQL
                )
            );

            expect(
                findSemanticField(
                    findSemanticTable(
                        semanticFromProjectResult(result),
                        'users'
                    ),
                    'email'
                )?.unique
            ).toBe(true);
        });
    });
});
