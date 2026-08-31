import { describe, expect, it } from 'vitest';
import { orderDrizzleMigrationSqlFiles } from '../drizzle-migration-order';
import {
    DRIZZLE_ADD_BIO_SQL,
    DRIZZLE_INIT_SQL,
    DRIZZLE_JOURNAL,
} from './fixtures/drizzle-migrations';

describe('orderDrizzleMigrationSqlFiles', () => {
    it('orders migration SQL files using the journal tag sequence', () => {
        const result = orderDrizzleMigrationSqlFiles(
            [
                {
                    relativePath: 'drizzle/0001_add_bio.sql',
                    content: DRIZZLE_ADD_BIO_SQL,
                },
                {
                    relativePath: 'drizzle/meta/_journal.json',
                    content: DRIZZLE_JOURNAL,
                },
                {
                    relativePath: 'drizzle/0000_init.sql',
                    content: DRIZZLE_INIT_SQL,
                },
            ],
            ''
        );

        expect(result.orderedFiles.map((file) => file.relativePath)).toEqual([
            'drizzle/0000_init.sql',
            'drizzle/0001_add_bio.sql',
        ]);
        expect(result.journalDialect).toBe('postgresql');
    });

    it('falls back to lexical ordering when the journal is missing', () => {
        const result = orderDrizzleMigrationSqlFiles(
            [
                {
                    relativePath: 'drizzle/0002_last.sql',
                    content: 'SELECT 1;',
                },
                {
                    relativePath: 'drizzle/0001_first.sql',
                    content: 'SELECT 2;',
                },
            ],
            ''
        );

        expect(result.orderedFiles.map((file) => file.relativePath)).toEqual([
            'drizzle/0001_first.sql',
            'drizzle/0002_last.sql',
        ]);
        expect(result.diagnostics).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ code: 'drizzle_parse_warning' }),
            ])
        );
    });
});
