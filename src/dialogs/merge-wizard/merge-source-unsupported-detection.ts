import {
    analyzeImportContent,
    type ImportDetectionAnalysis,
} from '@/dialogs/common/import-schema/analyze-import-content';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { SchemaMergeSourcePreparationResult } from '@/lib/schema-merge/source-adapter-types';

const genericUnsupportedAnalysis = (): ImportDetectionAnalysis => ({
    format: { format: 'unsupported', confidence: 'unsupported' },
    dialect: null,
    importMethod: null,
    canContinue: false,
    displayKind: 'unsupported',
    severity: 'warning',
    detectedDatabaseType: null,
    resolutionState: 'not_applicable',
    resolvedSourceDialect: null,
    dialectCandidates: [],
    dialectCandidateScores: [],
    requiresExplicitSourceDialect: false,
});

export const mergeUnsupportedDetectionAnalysis = (
    preparation: SchemaMergeSourcePreparationResult | null,
    text: string,
    currentDatabaseType: DatabaseType,
    sourceDialect: DatabaseType | null
): ImportDetectionAnalysis | null => {
    if (!preparation || preparation.status !== 'unsupported') {
        return null;
    }

    const trimmed = text.trim();
    if (trimmed.length > 0) {
        const analysis = analyzeImportContent(trimmed, currentDatabaseType, {
            importContext: 'existing',
            resolvedSourceDialect: sourceDialect,
        });

        if (analysis.displayKind !== 'empty') {
            if (analysis.displayKind === 'unsupported') {
                return { ...analysis, severity: 'warning' };
            }

            return analysis;
        }
    }

    return genericUnsupportedAnalysis();
};
