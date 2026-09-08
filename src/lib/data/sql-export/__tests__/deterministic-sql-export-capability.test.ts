import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    getDeterministicSqlExportTargets,
    hasDeterministicSqlExportPath,
    isDeterministicSqlExportSourceSupported,
} from '../deterministic-sql-export-capability';

describe('deterministic SQL export capability', () => {
    it('supports PostgreSQL, MySQL, MariaDB, SQL Server and SQLite sources', () => {
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.POSTGRESQL)
        ).toBe(true);
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.MYSQL)
        ).toBe(true);
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.MARIADB)
        ).toBe(true);
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.SQL_SERVER)
        ).toBe(true);
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.SQLITE)
        ).toBe(true);
    });

    it('does not treat Oracle, CockroachDB, ClickHouse or Generic as supported sources', () => {
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.ORACLE)
        ).toBe(false);
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.COCKROACHDB)
        ).toBe(false);
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.CLICKHOUSE)
        ).toBe(false);
        expect(
            isDeterministicSqlExportSourceSupported(DatabaseType.GENERIC)
        ).toBe(false);
    });

    it('returns PostgreSQL cross-dialect targets for PostgreSQL source', () => {
        expect(
            getDeterministicSqlExportTargets(DatabaseType.POSTGRESQL)
        ).toEqual([
            DatabaseType.POSTGRESQL,
            DatabaseType.MYSQL,
            DatabaseType.MARIADB,
            DatabaseType.SQL_SERVER,
        ]);
    });

    it('returns same-dialect only for non-PostgreSQL supported sources', () => {
        expect(getDeterministicSqlExportTargets(DatabaseType.MYSQL)).toEqual([
            DatabaseType.MYSQL,
        ]);
        expect(getDeterministicSqlExportTargets(DatabaseType.MARIADB)).toEqual([
            DatabaseType.MARIADB,
        ]);
        expect(
            getDeterministicSqlExportTargets(DatabaseType.SQL_SERVER)
        ).toEqual([DatabaseType.SQL_SERVER]);
        expect(getDeterministicSqlExportTargets(DatabaseType.SQLITE)).toEqual([
            DatabaseType.SQLITE,
        ]);
    });

    it('does not expose Generic as a deterministic target', () => {
        for (const source of [
            DatabaseType.POSTGRESQL,
            DatabaseType.MYSQL,
            DatabaseType.MARIADB,
            DatabaseType.SQL_SERVER,
            DatabaseType.SQLITE,
        ]) {
            expect(
                hasDeterministicSqlExportPath(source, DatabaseType.GENERIC)
            ).toBe(false);
        }
    });

    it('does not expose PostgreSQL to SQLite cross-dialect', () => {
        expect(
            hasDeterministicSqlExportPath(
                DatabaseType.POSTGRESQL,
                DatabaseType.SQLITE
            )
        ).toBe(false);
        expect(
            getDeterministicSqlExportTargets(DatabaseType.POSTGRESQL)
        ).not.toContain(DatabaseType.SQLITE);
    });
});
