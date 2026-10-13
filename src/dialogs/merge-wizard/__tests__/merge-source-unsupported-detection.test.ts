import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { mergeUnsupportedDetectionAnalysis } from '../merge-source-unsupported-detection';

describe('mergeUnsupportedDetectionAnalysis', () => {
    it('returns warning unsupported analysis for unstructured text', () => {
        const analysis = mergeUnsupportedDetectionAnalysis(
            { status: 'unsupported', code: 'unable_to_detect' },
            'not a schema',
            DatabaseType.POSTGRESQL,
            null
        );

        expect(analysis?.displayKind).toBe('unsupported');
        expect(analysis?.severity).toBe('warning');
    });

    it('returns null when preparation is not unsupported', () => {
        expect(
            mergeUnsupportedDetectionAnalysis(
                {
                    status: 'ready',
                    incomingDiagram: {} as never,
                    source: { kind: 'ddl' },
                    detectedFormat: 'sql',
                    detectedFramework: null,
                    detectedDatabaseType: DatabaseType.POSTGRESQL,
                },
                'CREATE TABLE t (id INT);',
                DatabaseType.POSTGRESQL,
                null
            )
        ).toBeNull();
    });
});
