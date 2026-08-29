import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { detectSqlDialect } from '../detect-sql-dialect';
import {
    getAmbiguousDialectCandidates,
    getDialectCandidateScores,
    requiresAmbiguousDialectResolution,
} from '../import-schema-resolution';

const stressSql = readFileSync(
    join(
        dirname(fileURLToPath(import.meta.url)),
        'fixtures/multi_dbms_ambiguity_stress_test.sql'
    ),
    'utf8'
);

describe('import-schema-resolution', () => {
    it('computes confidence percentages from dialect scores', () => {
        const dialect = detectSqlDialect(stressSql, {
            selectedDatabaseType: DatabaseType.MYSQL,
        });
        const candidates = getAmbiguousDialectCandidates({
            selectedDatabaseType: DatabaseType.MYSQL,
            dialect,
        });
        const scores = getDialectCandidateScores(dialect, candidates);

        expect(candidates.length).toBeGreaterThan(1);
        expect(scores).toHaveLength(candidates.length);
        expect(
            scores.reduce((sum, entry) => sum + entry.confidencePercent, 0)
        ).toBeGreaterThanOrEqual(99);
        expect(
            scores.reduce((sum, entry) => sum + entry.confidencePercent, 0)
        ).toBeLessThanOrEqual(100);
        expect(scores[0]?.confidencePercent).toBeGreaterThan(
            scores[scores.length - 1]?.confidencePercent ?? 0
        );
    });

    it('requires ambiguous resolution when multiple importable dialects are detected', () => {
        const dialect = detectSqlDialect(stressSql, {
            selectedDatabaseType: DatabaseType.MYSQL,
        });

        expect(
            requiresAmbiguousDialectResolution(dialect, DatabaseType.MYSQL)
        ).toBe(true);
        expect(dialect.confidence).toBe('high');
    });
});
