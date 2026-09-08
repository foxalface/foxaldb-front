import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { buildSqlExportFilename } from '../build-sql-export-filename';

describe('buildSqlExportFilename', () => {
    it('uses diagram slug for same-dialect exports', () => {
        expect(
            buildSqlExportFilename(
                'My Diagram',
                DatabaseType.POSTGRESQL,
                DatabaseType.POSTGRESQL
            )
        ).toBe('my-diagram.sql');
    });

    it('includes target dialect suffix for cross-dialect exports', () => {
        expect(
            buildSqlExportFilename(
                'My Diagram',
                DatabaseType.POSTGRESQL,
                DatabaseType.MYSQL
            )
        ).toBe('my-diagram-mysql.sql');
    });
});
