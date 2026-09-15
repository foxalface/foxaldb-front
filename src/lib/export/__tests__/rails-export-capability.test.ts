import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { isRailsExportSupported } from '../rails-export-capability';

describe('rails export capability', () => {
    const supportedTypes = [
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
    ] as const;

    for (const databaseType of supportedTypes) {
        it(`supports ${databaseType}`, () => {
            expect(isRailsExportSupported(databaseType)).toBe(true);
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
            expect(isRailsExportSupported(databaseType)).toBe(false);
        });
    }

    it('does not support unknown database types', () => {
        expect(isRailsExportSupported('unknown')).toBe(false);
        expect(isRailsExportSupported('')).toBe(false);
    });

    it('does not silently map unsupported databases to PostgreSQL', () => {
        expect(isRailsExportSupported(DatabaseType.SQL_SERVER)).toBe(false);
        expect(isRailsExportSupported(DatabaseType.COCKROACHDB)).toBe(false);
        expect(isRailsExportSupported(DatabaseType.GENERIC)).toBe(false);
    });
});
