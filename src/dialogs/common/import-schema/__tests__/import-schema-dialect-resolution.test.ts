import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    genericAmbiguousSql,
    mysqlDistinctiveSql,
    postgresDistinctiveSql,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { analyzeImportContent } from '../analyze-import-content';

const stressSql = readFileSync(
    join(
        dirname(fileURLToPath(import.meta.url)),
        '../../../../lib/import/__tests__/fixtures/multi_dbms_ambiguity_stress_test.sql'
    ),
    'utf8'
);

describe('analyzeImportContent dialect resolution', () => {
    it('matches PostgreSQL SQL against a PostgreSQL selection', () => {
        const result = analyzeImportContent(
            postgresDistinctiveSql,
            DatabaseType.POSTGRESQL
        );

        expect(result.resolutionState).toBe('matched');
        expect(result.canContinue).toBe(true);
        expect(result.resolvedSourceDialect).toBe(DatabaseType.POSTGRESQL);
    });

    it('detects a PostgreSQL vs MySQL mismatch without allowing continue', () => {
        const result = analyzeImportContent(
            mysqlDistinctiveSql,
            DatabaseType.POSTGRESQL
        );

        expect(result.resolutionState).toBe('mismatch');
        expect(result.displayKind).toBe('dialect_mismatch');
        expect(result.canContinue).toBe(false);
        expect(result.detectedDatabaseType).toBe(DatabaseType.MYSQL);
        expect(result.resolvedSourceDialect).toBeNull();
    });

    it('requires explicit resolution for ambiguous SQL', () => {
        const result = analyzeImportContent(
            genericAmbiguousSql,
            DatabaseType.POSTGRESQL
        );

        expect(result.resolutionState).toBe('ambiguous');
        expect(result.canContinue).toBe(false);
        expect(result.requiresExplicitSourceDialect).toBe(true);
        expect(result.dialectCandidates[0]).toBe(DatabaseType.POSTGRESQL);
    });

    it('allows continue only after an explicit dialect is resolved', () => {
        const unresolved = analyzeImportContent(
            genericAmbiguousSql,
            DatabaseType.POSTGRESQL
        );
        const resolved = analyzeImportContent(
            genericAmbiguousSql,
            DatabaseType.POSTGRESQL,
            { resolvedSourceDialect: DatabaseType.POSTGRESQL }
        );

        expect(unresolved.canContinue).toBe(false);
        expect(resolved.resolutionState).toBe('resolved');
        expect(resolved.canContinue).toBe(true);
        expect(resolved.resolvedSourceDialect).toBe(DatabaseType.POSTGRESQL);
    });

    it('shows all competing dialects with confidence scores for mixed SQL', () => {
        const result = analyzeImportContent(stressSql, DatabaseType.MYSQL);

        expect(result.displayKind).toBe('sql_ambiguous');
        expect(result.resolutionState).toBe('ambiguous');
        expect(result.dialectCandidates.length).toBeGreaterThan(1);
        expect(result.dialectCandidateScores).toHaveLength(
            result.dialectCandidates.length
        );
        expect(
            result.dialectCandidateScores.every(
                (entry) => entry.confidencePercent > 0
            )
        ).toBe(true);
        expect(result.dialectCandidates).toContain(DatabaseType.POSTGRESQL);
        expect(result.dialectCandidates).toContain(DatabaseType.MYSQL);
    });

    it('uses auto-detection for the recommended DBMS on mixed SQL', () => {
        const result = analyzeImportContent(stressSql, DatabaseType.MYSQL);

        expect(result.detectedDatabaseType).toBe(DatabaseType.POSTGRESQL);
        expect(result.dialectCandidateScores[0]?.databaseType).not.toBe(
            DatabaseType.POSTGRESQL
        );
    });
});
