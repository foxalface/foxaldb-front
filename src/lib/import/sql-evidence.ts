import { DatabaseType } from '@/lib/domain/database-type';
import type { DialectEvidence } from './types';

/** Bounded prefix length for dialect evidence scans (see detect-sql-dialect.ts). */
export const SQL_DIALECT_SCAN_PREFIX_LENGTH = 128_000;

/** Suffix window checked for pg_dump COPY markers on very large inputs. */
export const SQL_DIALECT_SCAN_SUFFIX_LENGTH = 16_384;

export const EVIDENCE_WEIGHT = {
    strong: 5,
    mediumStrong: 4,
    medium: 2,
    weak: 1,
} as const;

export const STRONG_CONTRADICTION_WEIGHT = EVIDENCE_WEIGHT.mediumStrong;

export const SELECTED_TARGET_HINT_WEIGHT = EVIDENCE_WEIGHT.weak;

export const AMBIGUOUS_TOP_SCORE_THRESHOLD = EVIDENCE_WEIGHT.mediumStrong;

export const CANDIDATE_TIE_DELTA = 2;

const DDL_KEYWORDS = [
    'CREATE TABLE',
    'ALTER TABLE',
    'DROP TABLE',
    'CREATE INDEX',
    'CREATE VIEW',
    'CREATE PROCEDURE',
    'CREATE FUNCTION',
    'CREATE SCHEMA',
    'CREATE DATABASE',
] as const;

export const getSqlScanContent = (content: string): string => {
    if (content.length <= SQL_DIALECT_SCAN_PREFIX_LENGTH) {
        return content;
    }

    const prefix = content.slice(0, SQL_DIALECT_SCAN_PREFIX_LENGTH);
    const suffix = content.slice(-SQL_DIALECT_SCAN_SUFFIX_LENGTH);
    return `${prefix}\n${suffix}`;
};

export const hasGenericDdlKeywords = (content: string): boolean => {
    const upperContent = content.toUpperCase();
    return DDL_KEYWORDS.some((keyword) => upperContent.includes(keyword));
};

export const collectPostgresEvidence = (content: string): DialectEvidence[] => {
    const evidence: DialectEvidence[] = [];

    const pgDumpMarkers: Array<{
        marker: string;
        code: DialectEvidence['code'];
    }> = [
        { marker: 'SET statement_timeout', code: 'pg_dump_marker' },
        { marker: 'SET lock_timeout', code: 'pg_dump_marker' },
        { marker: 'SET client_encoding', code: 'pg_dump_marker' },
        {
            marker: 'SET standard_conforming_strings',
            code: 'pg_dump_marker',
        },
        { marker: 'SELECT pg_catalog.set_config', code: 'pg_dump_marker' },
        { marker: 'COMMENT ON EXTENSION', code: 'pg_dump_marker' },
    ];

    for (const { marker, code } of pgDumpMarkers) {
        if (content.includes(marker)) {
            evidence.push({
                databaseType: DatabaseType.POSTGRESQL,
                code,
                weight: EVIDENCE_WEIGHT.strong,
            });
        }
    }

    if (content.includes('ALTER TABLE ONLY')) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_alter_table_only',
            weight: EVIDENCE_WEIGHT.strong,
        });
    }

    if (content.includes('COPY') && content.includes('FROM stdin')) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_copy_from_stdin',
            weight: EVIDENCE_WEIGHT.strong,
        });
    }

    if (/--\s+Name:.*Type:/i.test(content)) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_dump_comment',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    if (content.includes('CREATE EXTENSION')) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_create_extension',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    if (content.includes('SERIAL PRIMARY KEY')) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_serial',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    if (/\bBIGSERIAL\b/i.test(content)) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_bigserial',
            weight: EVIDENCE_WEIGHT.medium,
        });
    }

    if (/\bJSONB\b/i.test(content)) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_jsonb',
            weight: EVIDENCE_WEIGHT.medium,
        });
    }

    if (content.includes('RETURNS SETOF')) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_return_setof',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    if (content.includes('WITH (OIDS')) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'pg_with_oids',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    return evidence;
};

export const collectCockroachEvidence = (
    content: string
): DialectEvidence[] => {
    const evidence: DialectEvidence[] = [];

    if (/--\s+CockroachDB dump/i.test(content)) {
        evidence.push({
            databaseType: DatabaseType.COCKROACHDB,
            code: 'cockroach_dump_marker',
            weight: EVIDENCE_WEIGHT.strong,
        });
    }

    if (/crdb_internal/i.test(content)) {
        evidence.push({
            databaseType: DatabaseType.COCKROACHDB,
            code: 'cockroach_crdb_internal',
            weight: EVIDENCE_WEIGHT.strong,
        });
    }

    return evidence;
};

export const collectMysqlFamilyEvidence = (
    content: string
): DialectEvidence[] => {
    const evidence: DialectEvidence[] = [];
    const hasMariaDbDump = /--\s*MariaDB dump/i.test(content);

    if (hasMariaDbDump) {
        evidence.push({
            databaseType: DatabaseType.MARIADB,
            code: 'mariadb_dump_marker',
            weight: EVIDENCE_WEIGHT.strong,
        });
    }

    if (/--\s*MySQL dump/i.test(content)) {
        evidence.push({
            databaseType: DatabaseType.MYSQL,
            code: 'mysql_dump_marker',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    const mysqlFamilyType = hasMariaDbDump
        ? DatabaseType.MARIADB
        : DatabaseType.MYSQL;

    if (content.includes('AUTO_INCREMENT')) {
        evidence.push({
            databaseType: mysqlFamilyType,
            code: 'mysql_auto_increment',
            weight: EVIDENCE_WEIGHT.strong,
        });
    }

    if (/ENGINE\s*=\s*(?:InnoDB|MyISAM|MEMORY|ARCHIVE)/i.test(content)) {
        evidence.push({
            databaseType: mysqlFamilyType,
            code: 'mysql_engine_innodb',
            weight: EVIDENCE_WEIGHT.strong,
        });
    }

    if (content.includes('DEFINER=')) {
        evidence.push({
            databaseType: mysqlFamilyType,
            code: 'mysql_definer',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    if (/DEFAULT CHARSET\s*=\s*(?:utf8|latin1)/i.test(content)) {
        evidence.push({
            databaseType: mysqlFamilyType,
            code: 'mysql_charset',
            weight: EVIDENCE_WEIGHT.medium,
        });
    }

    const hasBackticks = /`[^`]+`/.test(content);
    const mysqlPatternCount = [
        /START TRANSACTION/i,
        /CREATE TABLE.*IF NOT EXISTS/i,
        /AUTO_INCREMENT\s*=\s*\d+/i,
        /ALTER TABLE.*ADD CONSTRAINT.*FOREIGN KEY/i,
    ].filter((pattern) => pattern.test(content)).length;

    if (hasBackticks && mysqlPatternCount >= 2) {
        evidence.push({
            databaseType: mysqlFamilyType,
            code: 'mysql_backtick_identifiers',
            weight: EVIDENCE_WEIGHT.medium,
        });
    }

    return evidence;
};

export const collectSqlServerEvidence = (
    content: string
): DialectEvidence[] => {
    const evidence: DialectEvidence[] = [];

    const sqlServerMarkers: Array<{
        marker: string;
        code: DialectEvidence['code'];
        weight: number;
    }> = [
        {
            marker: 'SET ANSI_NULLS ON',
            code: 'sqlserver_ansi_nulls',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        },
        {
            marker: 'SET QUOTED_IDENTIFIER ON',
            code: 'sqlserver_quoted_identifier',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        },
        {
            marker: 'IDENTITY(',
            code: 'sqlserver_identity',
            weight: EVIDENCE_WEIGHT.strong,
        },
        {
            marker: 'UNIQUEIDENTIFIER',
            code: 'sqlserver_uniqueidentifier',
            weight: EVIDENCE_WEIGHT.strong,
        },
        {
            marker: 'datetime2',
            code: 'sqlserver_datetime2',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        },
    ];

    for (const { marker, code, weight } of sqlServerMarkers) {
        if (content.includes(marker)) {
            evidence.push({
                databaseType: DatabaseType.SQL_SERVER,
                code,
                weight,
            });
        }
    }

    if (/\[[^\]]+\]\.\[[^\]]+\]/.test(content)) {
        evidence.push({
            databaseType: DatabaseType.SQL_SERVER,
            code: 'sqlserver_bracket_schema',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    if (content.includes('NVARCHAR')) {
        evidence.push({
            databaseType: DatabaseType.SQL_SERVER,
            code: 'sqlserver_nvarchar',
            weight: EVIDENCE_WEIGHT.medium,
        });
    }

    return evidence;
};

export const collectSqliteEvidence = (content: string): DialectEvidence[] => {
    const evidence: DialectEvidence[] = [];

    const sqliteMarkers: Array<{
        marker: string;
        code: DialectEvidence['code'];
        weight: number;
    }> = [
        {
            marker: 'PRAGMA',
            code: 'sqlite_pragma',
            weight: EVIDENCE_WEIGHT.strong,
        },
        {
            marker: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            code: 'sqlite_autoincrement',
            weight: EVIDENCE_WEIGHT.strong,
        },
        {
            marker: 'sqlite_sequence',
            code: 'sqlite_sequence',
            weight: EVIDENCE_WEIGHT.strong,
        },
    ];

    for (const { marker, code, weight } of sqliteMarkers) {
        if (content.includes(marker)) {
            evidence.push({
                databaseType: DatabaseType.SQLITE,
                code,
                weight,
            });
        }
    }

    return evidence;
};

export const collectOracleEvidence = (content: string): DialectEvidence[] => {
    const evidence: DialectEvidence[] = [];
    const upperContent = content.toUpperCase();

    const oracleMarkers: Array<{
        marker: string;
        code: DialectEvidence['code'];
        weight: number;
        regex?: boolean;
    }> = [
        {
            marker: 'VARCHAR2',
            code: 'oracle_varchar2',
            weight: EVIDENCE_WEIGHT.strong,
        },
        {
            marker: 'NUMBER(',
            code: 'oracle_number',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        },
        {
            marker: 'SYSDATE',
            code: 'oracle_sysdate',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        },
        {
            marker: 'TABLESPACE',
            code: 'oracle_tablespace',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        },
        {
            marker: 'CLOB',
            code: 'oracle_clob',
            weight: EVIDENCE_WEIGHT.medium,
        },
        {
            marker: 'CONSTRAINT .* PRIMARY KEY.*ENABLE',
            code: 'oracle_varchar2',
            weight: EVIDENCE_WEIGHT.mediumStrong,
            regex: true,
        },
    ];

    for (const { marker, code, weight, regex } of oracleMarkers) {
        if (regex) {
            if (new RegExp(marker, 'i').test(content)) {
                evidence.push({
                    databaseType: DatabaseType.ORACLE,
                    code,
                    weight,
                });
            }
            continue;
        }

        if (upperContent.includes(marker.toUpperCase())) {
            evidence.push({
                databaseType: DatabaseType.ORACLE,
                code,
                weight,
            });
        }
    }

    return evidence;
};

export const collectClickHouseEvidence = (
    content: string
): DialectEvidence[] => {
    const evidence: DialectEvidence[] = [];

    if (/ENGINE\s*=\s*MergeTree/i.test(content)) {
        evidence.push({
            databaseType: 'clickhouse',
            code: 'clickhouse_merge_tree',
            weight: EVIDENCE_WEIGHT.strong,
        });
    }

    if (
        /ENGINE\s*=\s*(?:ReplacingMergeTree|SummingMergeTree|AggregatingMergeTree)/i.test(
            content
        )
    ) {
        evidence.push({
            databaseType: 'clickhouse',
            code: 'clickhouse_engine',
            weight: EVIDENCE_WEIGHT.mediumStrong,
        });
    }

    return evidence;
};

export const collectWeakQuotingEvidence = (
    content: string
): DialectEvidence[] => {
    const evidence: DialectEvidence[] = [];

    if (/"[^"]+"\."[^"]+"/.test(content)) {
        evidence.push({
            databaseType: DatabaseType.POSTGRESQL,
            code: 'double_quote_identifiers',
            weight: EVIDENCE_WEIGHT.weak,
        });
    }

    return evidence;
};

export const DDL_IMPORT_SUPPORTED_TYPES: ReadonlySet<DatabaseType> = new Set([
    DatabaseType.POSTGRESQL,
    DatabaseType.COCKROACHDB,
    DatabaseType.MYSQL,
    DatabaseType.MARIADB,
    DatabaseType.SQL_SERVER,
    DatabaseType.SQLITE,
    DatabaseType.ORACLE,
]);
