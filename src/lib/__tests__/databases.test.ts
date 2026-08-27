import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    getDatabaseTypeGroups,
    OTHER_DATABASE_TYPES,
    PRIMARY_DATABASE_TYPES,
} from '@/lib/databases';

describe('database type groups', () => {
    it('exposes primary databases in product order', () => {
        expect(PRIMARY_DATABASE_TYPES).toEqual([
            DatabaseType.POSTGRESQL,
            DatabaseType.MYSQL,
            DatabaseType.MARIADB,
            DatabaseType.SQLITE,
            DatabaseType.SQL_SERVER,
            DatabaseType.ORACLE,
        ]);
    });

    it('exposes other databases without analytical-only categories', () => {
        expect(OTHER_DATABASE_TYPES).toEqual([
            DatabaseType.COCKROACHDB,
            DatabaseType.CLICKHOUSE,
        ]);
    });

    it('returns primary and other groups for the new diagram dialog', () => {
        expect(getDatabaseTypeGroups()).toEqual({
            primary: [...PRIMARY_DATABASE_TYPES],
            other: [...OTHER_DATABASE_TYPES],
        });
    });
});
