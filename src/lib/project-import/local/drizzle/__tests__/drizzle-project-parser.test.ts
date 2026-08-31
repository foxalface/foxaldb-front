import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { ProjectImportInput } from '../../../project-execution-types';
import { parseDrizzleProject } from '../drizzle-project-parser';
import { FOXALDB_DO_NOT_EXPOSE_DRIZZLE_SOURCE } from '../drizzle-constants';
import {
    DRIZZLE_ADD_BIO_SQL,
    DRIZZLE_INIT_SQL,
    DRIZZLE_JOURNAL,
    DRIZZLE_MYSQL_INIT_SQL,
    DRIZZLE_QA_CUMULATIVE_ADD_SKU_SQL,
    DRIZZLE_QA_CUMULATIVE_INITIAL_SQL,
    DRIZZLE_QA_CUMULATIVE_JOURNAL,
    DRIZZLE_SENTINEL_SQL,
} from './fixtures/drizzle-migrations';

const baseInput = (
    files: ProjectImportInput['bundle']['files'],
    targetDatabaseType = DatabaseType.POSTGRESQL
): ProjectImportInput => ({
    candidate: {
        framework: 'drizzle',
        rootPath: 'drizzle-app',
        relevantFiles: files.map((file) => file.relativePath),
        score: 20,
        confidence: 'high',
        evidence: [],
        parserLocation: 'local',
    },
    bundle: {
        framework: 'drizzle',
        rootPath: 'drizzle-app',
        files,
    },
    targetDatabaseType,
});

describe('parseDrizzleProject', () => {
    it('parses journal-ordered users/posts migrations into a canonical diagram', async () => {
        const result = await parseDrizzleProject(
            baseInput([
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
            ])
        );

        expect(result.framework).toBe('drizzle');
        expect(result.diagram.tables?.length).toBeGreaterThanOrEqual(2);
        expect(result.diagram.relationships?.length).toBeGreaterThanOrEqual(1);

        const users = result.diagram.tables?.find(
            (table) => table.name === 'users'
        );
        expect(users?.fields?.some((field) => field.name === 'bio')).toBe(true);
    });

    it('fails when no migration SQL files are present', async () => {
        await expect(
            parseDrizzleProject(
                baseInput([
                    {
                        relativePath: 'drizzle.config.ts',
                        content: "export default { dialect: 'postgresql' };",
                    },
                ])
            )
        ).rejects.toMatchObject({
            diagnostics: [
                expect.objectContaining({ code: 'drizzle_migration_missing' }),
            ],
        });
    });

    it('does not leak source sentinel into diagnostics or result', async () => {
        const result = await parseDrizzleProject(
            baseInput([
                {
                    relativePath: 'drizzle/0000_init.sql',
                    content: `${DRIZZLE_SENTINEL_SQL}\n-- ${FOXALDB_DO_NOT_EXPOSE_DRIZZLE_SOURCE}`,
                },
            ])
        );

        const serialized = JSON.stringify(result);
        expect(serialized).not.toContain(FOXALDB_DO_NOT_EXPOSE_DRIZZLE_SOURCE);
    });

    it('preserves requested target database type', async () => {
        const result = await parseDrizzleProject(
            baseInput(
                [
                    {
                        relativePath: 'drizzle/0000_init.sql',
                        content: DRIZZLE_MYSQL_INIT_SQL,
                    },
                ],
                DatabaseType.MYSQL
            )
        );

        expect(result.diagram.databaseType).toBe(DatabaseType.MYSQL);
    });

    it('replays QA cumulative migrations into a single products table with sku', async () => {
        const result = await parseDrizzleProject({
            candidate: {
                framework: 'drizzle',
                rootPath: 'foxaldb-drizzle-qa-cumulative',
                relevantFiles: [
                    'foxaldb-drizzle-qa-cumulative/drizzle/meta/_journal.json',
                    'foxaldb-drizzle-qa-cumulative/drizzle/0000_initial.sql',
                    'foxaldb-drizzle-qa-cumulative/drizzle/0001_add_sku.sql',
                ],
                score: 20,
                confidence: 'high',
                evidence: [],
                parserLocation: 'local',
            },
            bundle: {
                framework: 'drizzle',
                rootPath: 'foxaldb-drizzle-qa-cumulative',
                files: [
                    {
                        relativePath:
                            'foxaldb-drizzle-qa-cumulative/drizzle/meta/_journal.json',
                        content: DRIZZLE_QA_CUMULATIVE_JOURNAL,
                    },
                    {
                        relativePath:
                            'foxaldb-drizzle-qa-cumulative/drizzle/0000_initial.sql',
                        content: DRIZZLE_QA_CUMULATIVE_INITIAL_SQL,
                    },
                    {
                        relativePath:
                            'foxaldb-drizzle-qa-cumulative/drizzle/0001_add_sku.sql',
                        content: DRIZZLE_QA_CUMULATIVE_ADD_SKU_SQL,
                    },
                    {
                        relativePath:
                            'foxaldb-drizzle-qa-cumulative/drizzle.config.ts',
                        content: "export default { dialect: 'mysql' };",
                    },
                ],
            },
            targetDatabaseType: DatabaseType.MYSQL,
        });

        const products = result.diagram.tables?.find(
            (table) => table.name === 'products'
        );

        expect(result.diagram.tables).toHaveLength(1);
        expect(products).toBeDefined();

        const fieldNames = products?.fields?.map((field) => field.name) ?? [];
        expect(fieldNames).toEqual(
            expect.arrayContaining(['id', 'name', 'sku'])
        );

        const sku = products?.fields?.find((field) => field.name === 'sku');
        expect(sku?.type?.name).toBe('varchar');
        expect(sku?.characterMaximumLength).toBe('32');
        expect(sku).toBeDefined();

        const skuIndex = products?.indexes?.find(
            (index) => index.name === 'products_sku_unique'
        );
        expect(skuIndex?.unique).toBe(true);
    });

    it('requires journal ordering for cumulative QA migrations', async () => {
        const reversed = await parseDrizzleProject(
            baseInput([
                {
                    relativePath: 'drizzle/meta/_journal.json',
                    content: JSON.stringify({
                        version: '7',
                        dialect: 'mysql',
                        entries: [
                            {
                                idx: 0,
                                version: '7',
                                when: 1,
                                tag: '0001_add_sku',
                                breakpoints: true,
                            },
                            {
                                idx: 1,
                                version: '7',
                                when: 2,
                                tag: '0000_initial',
                                breakpoints: true,
                            },
                        ],
                    }),
                },
                {
                    relativePath: 'drizzle/0000_initial.sql',
                    content: DRIZZLE_QA_CUMULATIVE_INITIAL_SQL,
                },
                {
                    relativePath: 'drizzle/0001_add_sku.sql',
                    content: DRIZZLE_QA_CUMULATIVE_ADD_SKU_SQL,
                },
            ])
        );

        const ordered = await parseDrizzleProject(
            baseInput([
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
            ])
        );

        const reversedSku = reversed.diagram.tables
            ?.find((table) => table.name === 'products')
            ?.fields?.find((field) => field.name === 'sku');
        const orderedSku = ordered.diagram.tables
            ?.find((table) => table.name === 'products')
            ?.fields?.find((field) => field.name === 'sku');

        expect(orderedSku).toBeDefined();
        expect(reversedSku).toBeUndefined();
    });
});
