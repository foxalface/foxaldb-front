import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    genericAmbiguousSql,
    mysqlDistinctiveSql,
    postgresDistinctiveSql,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { analyzeImportContent } from '../analyze-import-content';

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
            DatabaseType.POSTGRESQL
        );

        expect(unresolved.canContinue).toBe(false);
        expect(resolved.resolutionState).toBe('resolved');
        expect(resolved.canContinue).toBe(true);
        expect(resolved.resolvedSourceDialect).toBe(DatabaseType.POSTGRESQL);
    });
});
