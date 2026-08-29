import { DatabaseType } from '@/lib/domain/database-type';
import { detectImportFormat } from '@/lib/import/detect-format';
import { detectSqlDialect } from '@/lib/import/detect-sql-dialect';
import {
    areDialectsCompatibleForMatch,
    getAmbiguousDialectCandidates,
    getDialectCandidateScores,
    requiresAmbiguousDialectResolution,
    type DialectCandidateScore,
} from '@/lib/import/import-schema-resolution';
import type {
    DialectDetectionResult,
    FormatDetectionResult,
    ImportFormat,
} from '@/lib/import/types';
import type { ImportMethod } from '@/lib/import-method/import-method';

export type ImportDetectionDisplayKind =
    | 'empty'
    | 'dialect'
    | 'dbml'
    | 'metadata_json'
    | 'diagram_json'
    | 'sql_ambiguous'
    | 'dialect_mismatch'
    | 'clickhouse_unsupported'
    | 'unsupported'
    | 'malformed_json';

export type ImportDetectionSeverity = 'success' | 'warning' | 'error';

export type ImportResolutionState =
    | 'not_applicable'
    | 'matched'
    | 'mismatch'
    | 'ambiguous'
    | 'resolved';

export interface ImportDetectionAnalysis {
    format: FormatDetectionResult;
    dialect: DialectDetectionResult | null;
    importMethod: ImportMethod | null;
    canContinue: boolean;
    displayKind: ImportDetectionDisplayKind;
    severity: ImportDetectionSeverity;
    detectedDatabaseType: DatabaseType | null;
    resolutionState: ImportResolutionState;
    resolvedSourceDialect: DatabaseType | null;
    dialectCandidates: DatabaseType[];
    dialectCandidateScores: DialectCandidateScore[];
    requiresExplicitSourceDialect: boolean;
}

const formatToImportMethod = (format: ImportFormat): ImportMethod | null => {
    switch (format) {
        case 'dbml':
            return 'dbml';
        case 'sql':
        case 'postgres_dump':
            return 'ddl';
        case 'metadata_json':
            return 'query';
        default:
            return null;
    }
};

const looksLikeJson = (content: string): boolean => {
    const trimmed = content.trim();
    return (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
    );
};

const hasClickHouseEvidence = (dialect: DialectDetectionResult): boolean =>
    dialect.evidence.some((item) => item.databaseType === 'clickhouse');

const buildSqlAnalysis = ({
    format,
    dialect,
    selectedDatabaseType,
    resolvedSourceDialect,
}: {
    format: FormatDetectionResult;
    dialect: DialectDetectionResult;
    selectedDatabaseType: DatabaseType;
    resolvedSourceDialect?: DatabaseType | null;
}): ImportDetectionAnalysis => {
    const dialectCandidates = getAmbiguousDialectCandidates({
        selectedDatabaseType,
        dialect,
    });
    const dialectCandidateScores = getDialectCandidateScores(
        dialect,
        dialectCandidates
    );

    if (resolvedSourceDialect) {
        return {
            format,
            dialect,
            importMethod: 'ddl',
            canContinue: true,
            displayKind: 'dialect',
            severity: 'success',
            detectedDatabaseType: resolvedSourceDialect,
            resolutionState: 'resolved',
            resolvedSourceDialect,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    if (requiresAmbiguousDialectResolution(dialect, selectedDatabaseType)) {
        return {
            format,
            dialect,
            importMethod: 'ddl',
            canContinue: false,
            displayKind: 'sql_ambiguous',
            severity: 'warning',
            detectedDatabaseType:
                format.format === 'postgres_dump'
                    ? DatabaseType.POSTGRESQL
                    : dialect.top,
            resolutionState: 'ambiguous',
            resolvedSourceDialect: null,
            dialectCandidates,
            dialectCandidateScores,
            requiresExplicitSourceDialect: true,
        };
    }

    if (
        hasClickHouseEvidence(dialect) &&
        dialect.confidence === 'unsupported'
    ) {
        return {
            format,
            dialect,
            importMethod: null,
            canContinue: false,
            displayKind: 'clickhouse_unsupported',
            severity: 'warning',
            detectedDatabaseType: null,
            resolutionState: 'not_applicable',
            resolvedSourceDialect: null,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    if (dialect.confidence === 'unsupported') {
        return {
            format,
            dialect,
            importMethod: null,
            canContinue: false,
            displayKind: 'unsupported',
            severity: 'warning',
            detectedDatabaseType: dialect.top,
            resolutionState: 'not_applicable',
            resolvedSourceDialect: null,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    const detectedDatabaseType =
        format.format === 'postgres_dump'
            ? DatabaseType.POSTGRESQL
            : dialect.top;

    if (
        detectedDatabaseType &&
        dialect.confidence === 'high' &&
        areDialectsCompatibleForMatch(
            selectedDatabaseType,
            detectedDatabaseType
        )
    ) {
        return {
            format,
            dialect,
            importMethod: 'ddl',
            canContinue: true,
            displayKind: 'dialect',
            severity: 'success',
            detectedDatabaseType,
            resolutionState: 'matched',
            resolvedSourceDialect: detectedDatabaseType,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    if (detectedDatabaseType && dialect.confidence === 'high') {
        return {
            format,
            dialect,
            importMethod: 'ddl',
            canContinue: false,
            displayKind: 'dialect_mismatch',
            severity: 'warning',
            detectedDatabaseType,
            resolutionState: 'mismatch',
            resolvedSourceDialect: null,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: true,
        };
    }

    return {
        format,
        dialect,
        importMethod: 'ddl',
        canContinue: false,
        displayKind: 'sql_ambiguous',
        severity: 'warning',
        detectedDatabaseType,
        resolutionState: 'ambiguous',
        resolvedSourceDialect: null,
        dialectCandidates,
        dialectCandidateScores,
        requiresExplicitSourceDialect: true,
    };
};

export const analyzeImportContent = (
    content: string,
    selectedDatabaseType: DatabaseType,
    resolvedSourceDialect?: DatabaseType | null
): ImportDetectionAnalysis => {
    const trimmed = content.trim();

    if (!trimmed) {
        return {
            format: { format: 'unsupported', confidence: 'unsupported' },
            dialect: null,
            importMethod: null,
            canContinue: false,
            displayKind: 'empty',
            severity: 'error',
            detectedDatabaseType: null,
            resolutionState: 'not_applicable',
            resolvedSourceDialect: null,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    const format = detectImportFormat(content);

    if (format.format === 'unsupported') {
        return {
            format,
            dialect: null,
            importMethod: null,
            canContinue: false,
            displayKind: looksLikeJson(trimmed)
                ? 'malformed_json'
                : 'unsupported',
            severity: 'error',
            detectedDatabaseType: null,
            resolutionState: 'not_applicable',
            resolvedSourceDialect: null,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    if (format.format === 'diagram_json') {
        return {
            format,
            dialect: null,
            importMethod: null,
            canContinue: false,
            displayKind: 'diagram_json',
            severity: 'success',
            detectedDatabaseType: null,
            resolutionState: 'not_applicable',
            resolvedSourceDialect: null,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    if (format.format === 'dbml') {
        return {
            format,
            dialect: null,
            importMethod: formatToImportMethod(format.format),
            canContinue: true,
            displayKind: 'dbml',
            severity: 'success',
            detectedDatabaseType: null,
            resolutionState: 'not_applicable',
            resolvedSourceDialect: null,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    if (format.format === 'metadata_json') {
        return {
            format,
            dialect: null,
            importMethod: formatToImportMethod(format.format),
            canContinue: true,
            displayKind: 'metadata_json',
            severity: 'success',
            detectedDatabaseType: null,
            resolutionState: 'not_applicable',
            resolvedSourceDialect: null,
            dialectCandidates: [],
            dialectCandidateScores: [],
            requiresExplicitSourceDialect: false,
        };
    }

    const dialect = detectSqlDialect(content, {
        selectedDatabaseType,
    });

    return buildSqlAnalysis({
        format,
        dialect,
        selectedDatabaseType,
        resolvedSourceDialect,
    });
};
