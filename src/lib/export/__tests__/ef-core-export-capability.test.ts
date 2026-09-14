import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { isEfCoreExportSupported } from '../ef-core-export-capability';

describe('ef core export capability', () => {
    const supportedTypes = [
        DatabaseType.POSTGRESQL,
        DatabaseType.SQL_SERVER,
        DatabaseType.SQLITE,
        DatabaseType.MYSQL,
    ] as const;

    for (const databaseType of supportedTypes) {
        it(`supports ${databaseType}`, () => {
            expect(isEfCoreExportSupported(databaseType)).toBe(true);
        });
    }

    const unsupportedTypes = [
        DatabaseType.MARIADB,
        DatabaseType.ORACLE,
        DatabaseType.COCKROACHDB,
        DatabaseType.CLICKHOUSE,
        DatabaseType.GENERIC,
    ] as const;

    for (const databaseType of unsupportedTypes) {
        it(`does not support ${databaseType}`, () => {
            expect(isEfCoreExportSupported(databaseType)).toBe(false);
        });
    }

    it('does not support unknown database types', () => {
        expect(isEfCoreExportSupported('unknown')).toBe(false);
        expect(isEfCoreExportSupported('')).toBe(false);
    });
});
