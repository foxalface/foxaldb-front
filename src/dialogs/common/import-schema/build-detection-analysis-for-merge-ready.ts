import type { ImportDetectionAnalysis } from './analyze-import-content';
import type { SchemaMergeReadySource } from '@/lib/schema-merge/source-adapter-types';

export const buildDetectionAnalysisForMergeReady = (
    ready: SchemaMergeReadySource
): ImportDetectionAnalysis | null => {
    if (ready.detectedFramework || !ready.detectedFormat) {
        return null;
    }

    const format = {
        format: ready.detectedFormat,
        confidence: 'high' as const,
    };

    const shared = {
        format,
        dialect: null,
        canContinue: true,
        severity: 'success' as const,
        resolutionState: 'matched' as const,
        dialectCandidates: [],
        dialectCandidateScores: [],
        requiresExplicitSourceDialect: false,
    };

    switch (ready.detectedFormat) {
        case 'dbml':
            return {
                ...shared,
                importMethod: 'dbml',
                displayKind: 'dbml',
                detectedDatabaseType: null,
                resolvedSourceDialect: null,
            };
        case 'metadata_json':
            return {
                ...shared,
                importMethod: 'query',
                displayKind: 'metadata_json',
                detectedDatabaseType: null,
                resolvedSourceDialect: null,
            };
        case 'diagram_json':
            return {
                ...shared,
                importMethod: 'diagram',
                displayKind: 'diagram_json',
                detectedDatabaseType: ready.detectedDatabaseType,
                resolvedSourceDialect: ready.detectedDatabaseType,
            };
        case 'sql':
        case 'postgres_dump':
            return {
                ...shared,
                importMethod: 'ddl',
                displayKind: 'dialect',
                detectedDatabaseType: ready.detectedDatabaseType,
                resolvedSourceDialect: ready.detectedDatabaseType,
            };
        default:
            return null;
    }
};
