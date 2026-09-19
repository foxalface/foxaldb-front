import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { isDrizzleExportSupported } from '../drizzle-export-capability';

describe('drizzle export capability', () => {
    const supportedTypes = [
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
    ] as const;

    for (const databaseType of supportedTypes) {
        it(`supports ${databaseType}`, () => {
            expect(isDrizzleExportSupported(databaseType)).toBe(true);
        });
    }

    const unsupportedTypes = [
        DatabaseType.SQL_SERVER,
        DatabaseType.ORACLE,
        DatabaseType.COCKROACHDB,
        DatabaseType.CLICKHOUSE,
        DatabaseType.GENERIC,
    ] as const;

    for (const databaseType of unsupportedTypes) {
        it(`does not support ${databaseType}`, () => {
            expect(isDrizzleExportSupported(databaseType)).toBe(false);
        });
    }

    it('does not support unknown database types', () => {
        expect(isDrizzleExportSupported('unknown')).toBe(false);
        expect(isDrizzleExportSupported('')).toBe(false);
    });

    it('does not silently map unsupported databases to SQLite', () => {
        expect(isDrizzleExportSupported(DatabaseType.SQL_SERVER)).toBe(false);
        expect(isDrizzleExportSupported(DatabaseType.COCKROACHDB)).toBe(false);
        expect(isDrizzleExportSupported(DatabaseType.GENERIC)).toBe(false);
        expect(isDrizzleExportSupported(DatabaseType.ORACLE)).toBe(false);
    });
});
