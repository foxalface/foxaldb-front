import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { areDialectsCompatibleForMatch } from '../import-schema-resolution';

/**
 * Mirrors `DatabaseCompatibilityTest` on the backend. Merge must not drift.
 */
const compatiblePairs: ReadonlyArray<[DatabaseType, DatabaseType]> = [
    [DatabaseType.POSTGRESQL, DatabaseType.POSTGRESQL],
    [DatabaseType.MYSQL, DatabaseType.MYSQL],
    [DatabaseType.MYSQL, DatabaseType.MARIADB],
    [DatabaseType.MARIADB, DatabaseType.MYSQL],
    [DatabaseType.POSTGRESQL, DatabaseType.COCKROACHDB],
    [DatabaseType.COCKROACHDB, DatabaseType.POSTGRESQL],
    [DatabaseType.SQLITE, DatabaseType.SQLITE],
    [DatabaseType.SQL_SERVER, DatabaseType.SQL_SERVER],
    [DatabaseType.ORACLE, DatabaseType.ORACLE],
    [DatabaseType.GENERIC, DatabaseType.GENERIC],
    [DatabaseType.CLICKHOUSE, DatabaseType.CLICKHOUSE],
];

const incompatiblePairs: ReadonlyArray<[DatabaseType, DatabaseType]> = [
    [DatabaseType.MYSQL, DatabaseType.POSTGRESQL],
    [DatabaseType.POSTGRESQL, DatabaseType.MYSQL],
    [DatabaseType.SQLITE, DatabaseType.SQL_SERVER],
    [DatabaseType.SQL_SERVER, DatabaseType.SQLITE],
    [DatabaseType.ORACLE, DatabaseType.POSTGRESQL],
    [DatabaseType.GENERIC, DatabaseType.MYSQL],
    [DatabaseType.CLICKHOUSE, DatabaseType.POSTGRESQL],
    [DatabaseType.MARIADB, DatabaseType.POSTGRESQL],
    [DatabaseType.COCKROACHDB, DatabaseType.MYSQL],
];

describe('database compatibility for schema merge', () => {
    it.each(compatiblePairs)('allows %s with %s', (selected, detected) => {
        expect(areDialectsCompatibleForMatch(selected, detected)).toBe(true);
    });

    it.each(incompatiblePairs)('rejects %s with %s', (selected, detected) => {
        expect(areDialectsCompatibleForMatch(selected, detected)).toBe(false);
    });
});
