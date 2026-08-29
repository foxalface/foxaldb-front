import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    dbmlSample,
    diagramJsonSample,
    genericAmbiguousSql,
    metadataJsonSample,
    mysqlDistinctiveSql,
    postgresDistinctiveSql,
    postgresDumpSql,
    randomText,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { analyzeImportContent } from '../analyze-import-content';

describe('analyzeImportContent', () => {
    it('returns empty state for blank input', () => {
        const result = analyzeImportContent('   ', DatabaseType.POSTGRESQL);

        expect(result.displayKind).toBe('empty');
        expect(result.canContinue).toBe(false);
    });

    it('detects PostgreSQL SQL with high confidence', () => {
        const result = analyzeImportContent(
            postgresDistinctiveSql,
            DatabaseType.POSTGRESQL
        );

        expect(result.importMethod).toBe('ddl');
        expect(result.canContinue).toBe(true);
        expect(result.displayKind).toBe('dialect');
        expect(result.detectedDatabaseType).toBe(DatabaseType.POSTGRESQL);
        expect(result.resolvedSourceDialect).toBe(DatabaseType.POSTGRESQL);
    });

    it('detects MySQL SQL with high confidence', () => {
        const result = analyzeImportContent(
            mysqlDistinctiveSql,
            DatabaseType.MYSQL
        );

        expect(result.importMethod).toBe('ddl');
        expect(result.canContinue).toBe(true);
        expect(result.detectedDatabaseType).toBe(DatabaseType.MYSQL);
    });

    it('detects DBML', () => {
        const result = analyzeImportContent(
            dbmlSample,
            DatabaseType.POSTGRESQL
        );

        expect(result.importMethod).toBe('dbml');
        expect(result.canContinue).toBe(true);
        expect(result.displayKind).toBe('dbml');
    });

    it('detects metadata JSON', () => {
        const result = analyzeImportContent(
            metadataJsonSample,
            DatabaseType.POSTGRESQL
        );

        expect(result.importMethod).toBe('query');
        expect(result.canContinue).toBe(true);
        expect(result.displayKind).toBe('metadata_json');
    });

    it('allows diagram JSON import when the DBMS matches the selection', () => {
        const result = analyzeImportContent(
            diagramJsonSample,
            DatabaseType.POSTGRESQL
        );

        expect(result.displayKind).toBe('diagram_json');
        expect(result.importMethod).toBe('diagram');
        expect(result.canContinue).toBe(true);
        expect(result.detectedDatabaseType).toBe(DatabaseType.POSTGRESQL);
        expect(result.resolvedSourceDialect).toBe(DatabaseType.POSTGRESQL);
    });

    it('requires explicit DBMS resolution for diagram JSON mismatch', () => {
        const result = analyzeImportContent(
            diagramJsonSample,
            DatabaseType.MYSQL
        );

        expect(result.displayKind).toBe('diagram_json_mismatch');
        expect(result.importMethod).toBe('diagram');
        expect(result.canContinue).toBe(false);
        expect(result.resolutionState).toBe('ambiguous');
        expect(result.detectedDatabaseType).toBe(DatabaseType.POSTGRESQL);
        expect(result.dialectCandidates).toEqual([
            DatabaseType.MYSQL,
            DatabaseType.POSTGRESQL,
        ]);
    });

    it('allows diagram JSON import after explicit DBMS resolution', () => {
        const result = analyzeImportContent(
            diagramJsonSample,
            DatabaseType.MYSQL,
            {
                resolvedSourceDialect: DatabaseType.MYSQL,
            }
        );

        expect(result.canContinue).toBe(true);
        expect(result.resolutionState).toBe('resolved');
        expect(result.resolvedSourceDialect).toBe(DatabaseType.MYSQL);
    });

    it('blocks diagram JSON import into an existing diagram', () => {
        const result = analyzeImportContent(
            diagramJsonSample,
            DatabaseType.POSTGRESQL,
            {
                importContext: 'existing',
            }
        );

        expect(result.displayKind).toBe('diagram_json_unsupported');
        expect(result.canContinue).toBe(false);
        expect(result.importMethod).toBeNull();
    });

    it('blocks continue for ambiguous SQL until resolved', () => {
        const result = analyzeImportContent(
            genericAmbiguousSql,
            DatabaseType.POSTGRESQL
        );

        expect(result.importMethod).toBe('ddl');
        expect(result.canContinue).toBe(false);
        expect(result.displayKind).toBe('sql_ambiguous');
        expect(result.resolutionState).toBe('ambiguous');
    });

    it('treats postgres dumps as PostgreSQL SQL when PostgreSQL is selected', () => {
        const result = analyzeImportContent(
            postgresDumpSql,
            DatabaseType.POSTGRESQL
        );

        expect(result.importMethod).toBe('ddl');
        expect(result.canContinue).toBe(true);
        expect(result.detectedDatabaseType).toBe(DatabaseType.POSTGRESQL);
    });

    it('marks malformed JSON as unsupported', () => {
        const result = analyzeImportContent(
            '{ "broken": }',
            DatabaseType.POSTGRESQL
        );

        expect(result.displayKind).toBe('malformed_json');
        expect(result.canContinue).toBe(false);
    });

    it('marks random text as unsupported', () => {
        const result = analyzeImportContent(
            randomText,
            DatabaseType.POSTGRESQL
        );

        expect(result.displayKind).toBe('unsupported');
        expect(result.canContinue).toBe(false);
    });

    it('disables continue for ClickHouse-only SQL', () => {
        const clickhouseSql = `
CREATE TABLE events (
    id UInt64,
    created_at DateTime
) ENGINE = MergeTree ORDER BY id;
`;

        const result = analyzeImportContent(
            clickhouseSql,
            DatabaseType.CLICKHOUSE
        );

        expect(result.canContinue).toBe(false);
        expect(result.displayKind).toBe('clickhouse_unsupported');
    });
});
