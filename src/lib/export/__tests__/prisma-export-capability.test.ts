import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { isPrismaExportSupported } from '../prisma-export-capability';

describe('prisma export capability', () => {
    const supportedTypes = [
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
        DatabaseType.SQL_SERVER,
        DatabaseType.COCKROACHDB,
    ] as const;

    for (const databaseType of supportedTypes) {
        it(`supports ${databaseType}`, () => {
            expect(isPrismaExportSupported(databaseType)).toBe(true);
        });
    }

    const unsupportedTypes = [
        DatabaseType.ORACLE,
        DatabaseType.CLICKHOUSE,
        DatabaseType.GENERIC,
    ] as const;

    for (const databaseType of unsupportedTypes) {
        it(`does not support ${databaseType}`, () => {
            expect(isPrismaExportSupported(databaseType)).toBe(false);
        });
    }
});
