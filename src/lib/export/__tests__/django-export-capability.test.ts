import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { isDjangoExportSupported } from '../django-export-capability';

describe('django export capability', () => {
    const supportedTypes = [
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
    ] as const;

    for (const databaseType of supportedTypes) {
        it(`supports ${databaseType}`, () => {
            expect(isDjangoExportSupported(databaseType)).toBe(true);
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
            expect(isDjangoExportSupported(databaseType)).toBe(false);
        });
    }

    it('does not support unknown database types', () => {
        expect(isDjangoExportSupported('unknown')).toBe(false);
        expect(isDjangoExportSupported('')).toBe(false);
    });

    it('does not silently map unsupported databases to SQLite', () => {
        expect(isDjangoExportSupported(DatabaseType.SQL_SERVER)).toBe(false);
        expect(isDjangoExportSupported(DatabaseType.COCKROACHDB)).toBe(false);
        expect(isDjangoExportSupported(DatabaseType.GENERIC)).toBe(false);
        expect(isDjangoExportSupported(DatabaseType.ORACLE)).toBe(false);
    });
});
