import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { SchemaMergeReadySource } from '@/lib/schema-merge/source-adapter-types';
import { buildDetectionAnalysisForMergeReady } from '../build-detection-analysis-for-merge-ready';

const baseReady = (
    overrides: Partial<SchemaMergeReadySource>
): SchemaMergeReadySource => ({
    status: 'ready',
    incomingDiagram: {
        id: '1',
        name: 'Incoming',
        databaseType: DatabaseType.POSTGRESQL,
        tables: [],
        relationships: [],
        createdAt: new Date(0),
        updatedAt: new Date(0),
    } as Diagram,
    source: { kind: 'sql' },
    detectedFormat: 'sql',
    detectedFramework: null,
    detectedDatabaseType: DatabaseType.POSTGRESQL,
    ...overrides,
});

describe('buildDetectionAnalysisForMergeReady', () => {
    it('maps SQL ready sources to dialect detection', () => {
        const analysis = buildDetectionAnalysisForMergeReady(baseReady({}));

        expect(analysis?.displayKind).toBe('dialect');
        expect(analysis?.detectedDatabaseType).toBe(DatabaseType.POSTGRESQL);
    });

    it('maps diagram JSON with success description kind', () => {
        const analysis = buildDetectionAnalysisForMergeReady(
            baseReady({
                detectedFormat: 'diagram_json',
                source: { kind: 'diagram_json' },
            })
        );

        expect(analysis?.displayKind).toBe('diagram_json');
    });

    it('returns null for project frameworks', () => {
        expect(
            buildDetectionAnalysisForMergeReady(
                baseReady({
                    detectedFormat: null,
                    detectedFramework: 'prisma',
                })
            )
        ).toBeNull();
    });
});
