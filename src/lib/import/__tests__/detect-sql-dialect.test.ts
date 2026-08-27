import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { detectSqlDialect } from '../detect-sql-dialect';
import {
    cockroachDistinctiveSql,
    genericAmbiguousSql,
    mariadbDistinctiveSql,
    mysqlDistinctiveSql,
    oracleDistinctiveSql,
    postgresDumpSql,
    postgresDistinctiveSql,
    randomText,
    sqlServerDistinctiveSql,
    sqliteDistinctiveSql,
} from './fixtures/import-samples';

describe('detectSqlDialect', () => {
    it('detects strong PostgreSQL evidence', () => {
        const result = detectSqlDialect(postgresDistinctiveSql);

        expect(result.top).toBe(DatabaseType.POSTGRESQL);
        expect(result.confidence).toBe('high');
        expect(result.ddlImportSupported).toBe(true);
        expect(result.evidence.some((item) => item.code === 'pg_serial')).toBe(
            true
        );
        expect(result.evidence.some((item) => item.code === 'pg_jsonb')).toBe(
            true
        );
    });

    it('detects PostgreSQL dump evidence', () => {
        const result = detectSqlDialect(postgresDumpSql);

        expect(result.top).toBe(DatabaseType.POSTGRESQL);
        expect(result.confidence).toBe('high');
        expect(
            result.evidence.some((item) => item.code === 'pg_dump_marker')
        ).toBe(true);
        expect(
            result.evidence.some((item) => item.code === 'pg_copy_from_stdin')
        ).toBe(true);
    });

    it('detects strong MySQL evidence', () => {
        const result = detectSqlDialect(mysqlDistinctiveSql);

        expect(result.top).toBe(DatabaseType.MYSQL);
        expect(result.confidence).toBe('high');
        expect(
            result.evidence.some((item) => item.code === 'mysql_auto_increment')
        ).toBe(true);
        expect(
            result.evidence.some((item) => item.code === 'mysql_engine_innodb')
        ).toBe(true);
    });

    it('detects SQL Server', () => {
        const result = detectSqlDialect(sqlServerDistinctiveSql);

        expect(result.top).toBe(DatabaseType.SQL_SERVER);
        expect(result.confidence).toBe('high');
        expect(
            result.evidence.some((item) => item.code === 'sqlserver_identity')
        ).toBe(true);
    });

    it('detects SQLite', () => {
        const result = detectSqlDialect(sqliteDistinctiveSql);

        expect(result.top).toBe(DatabaseType.SQLITE);
        expect(result.confidence).toBe('high');
        expect(
            result.evidence.some((item) => item.code === 'sqlite_pragma')
        ).toBe(true);
    });

    it('detects Oracle', () => {
        const result = detectSqlDialect(oracleDistinctiveSql);

        expect(result.top).toBe(DatabaseType.ORACLE);
        expect(result.confidence).toBe('high');
        expect(
            result.evidence.some((item) => item.code === 'oracle_varchar2')
        ).toBe(true);
    });

    it('produces ambiguity for generic SQL', () => {
        const result = detectSqlDialect(genericAmbiguousSql);

        expect(result.top).toBeNull();
        expect(result.confidence).toBe('ambiguous');
        expect(result.candidates).toEqual([]);
    });

    it('applies selected-target hint only for ambiguous cases', () => {
        const withoutHint = detectSqlDialect(genericAmbiguousSql);
        const withHint = detectSqlDialect(genericAmbiguousSql, {
            selectedDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(withoutHint.top).toBeNull();
        expect(withHint.top).toBe(DatabaseType.POSTGRESQL);
        expect(withHint.confidence).toBe('ambiguous');
        expect(
            withHint.evidence.some(
                (item) => item.code === 'selected_target_hint'
            )
        ).toBe(true);
    });

    it('does not let selected PostgreSQL override strong MySQL evidence', () => {
        const result = detectSqlDialect(mysqlDistinctiveSql, {
            selectedDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(result.top).toBe(DatabaseType.MYSQL);
        expect(result.confidence).toBe('high');
        expect(
            result.evidence.some((item) => item.code === 'selected_target_hint')
        ).toBe(false);
    });

    it('does not let selected MySQL override strong PostgreSQL evidence', () => {
        const result = detectSqlDialect(postgresDistinctiveSql, {
            selectedDatabaseType: DatabaseType.MYSQL,
        });

        expect(result.top).toBe(DatabaseType.POSTGRESQL);
        expect(result.confidence).toBe('high');
        expect(
            result.evidence.some((item) => item.code === 'selected_target_hint')
        ).toBe(false);
    });

    it('does not let selected MySQL override strong SQL Server evidence', () => {
        const result = detectSqlDialect(sqlServerDistinctiveSql, {
            selectedDatabaseType: DatabaseType.MYSQL,
        });

        expect(result.top).toBe(DatabaseType.SQL_SERVER);
        expect(
            result.evidence.some((item) => item.code === 'selected_target_hint')
        ).toBe(false);
    });

    it('returns candidates instead of an arbitrary winner when evidence competes', () => {
        const competingSql = `
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    legacy_id INT AUTO_INCREMENT,
    payload JSONB
);
`;

        const result = detectSqlDialect(competingSql);

        expect(result.candidates.length).toBeGreaterThan(1);
        expect(result.candidates).toContain(DatabaseType.POSTGRESQL);
        expect(result.candidates).toContain(DatabaseType.MYSQL);
        expect(result.confidence).toBe('ambiguous');
    });

    it('distinguishes MariaDB when reliable MariaDB-specific evidence exists', () => {
        const result = detectSqlDialect(mariadbDistinctiveSql);

        expect(result.top).toBe(DatabaseType.MARIADB);
        expect(
            result.evidence.some((item) => item.code === 'mariadb_dump_marker')
        ).toBe(true);
    });

    it('keeps MySQL family behavior for shared parser evidence', () => {
        const result = detectSqlDialect(mysqlDistinctiveSql);

        expect(result.top).toBe(DatabaseType.MYSQL);
        expect(result.ddlImportSupported).toBe(true);
    });

    it('detects CockroachDB only with reliable Cockroach-specific evidence', () => {
        const result = detectSqlDialect(cockroachDistinctiveSql);

        expect(result.top).toBe(DatabaseType.COCKROACHDB);
        expect(
            result.evidence.some(
                (item) => item.code === 'cockroach_dump_marker'
            )
        ).toBe(true);
    });

    it('treats PostgreSQL-family SQL without Cockroach markers as PostgreSQL', () => {
        const result = detectSqlDialect(postgresDistinctiveSql);

        expect(result.top).toBe(DatabaseType.POSTGRESQL);
        expect(result.candidates).not.toContain(DatabaseType.COCKROACHDB);
    });

    it('returns unsupported for empty input', () => {
        const result = detectSqlDialect('');

        expect(result).toEqual({
            scores: {},
            top: null,
            confidence: 'unsupported',
            candidates: [],
            evidence: [],
            ddlImportSupported: false,
        });
    });

    it('returns unsupported for unrecognized text', () => {
        const result = detectSqlDialect(randomText);

        expect(result.confidence).toBe('unsupported');
        expect(result.top).toBeNull();
        expect(result.candidates).toEqual([]);
    });

    it('keeps deterministic scoring across repeated calls', () => {
        const first = detectSqlDialect(postgresDistinctiveSql);
        const second = detectSqlDialect(postgresDistinctiveSql);

        expect(first).toEqual(second);
    });

    it('keeps stable candidate ordering', () => {
        const competingSql = `
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    legacy_id INT AUTO_INCREMENT,
    payload JSONB
);
`;

        const first = detectSqlDialect(competingSql);
        const second = detectSqlDialect(competingSql);

        expect(first.candidates).toEqual(second.candidates);
    });

    it('identifies ClickHouse evidence without claiming DDL import support', () => {
        const clickhouseSql = `
CREATE TABLE events (
    id UInt64,
    created_at DateTime
) ENGINE = MergeTree ORDER BY id;
`;

        const result = detectSqlDialect(clickhouseSql);

        expect(
            result.evidence.some((item) => item.databaseType === 'clickhouse')
        ).toBe(true);
        expect(result.ddlImportSupported).toBe(false);
        expect(result.top).toBeNull();
        expect(result.confidence).toBe('unsupported');
    });
});
