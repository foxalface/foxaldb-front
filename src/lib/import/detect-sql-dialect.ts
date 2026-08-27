import { DatabaseType } from '@/lib/domain/database-type';
import type {
    DetectSqlDialectOptions,
    DialectDetectionResult,
    DialectEvidence,
    DetectionConfidence,
} from './types';
import {
    AMBIGUOUS_TOP_SCORE_THRESHOLD,
    CANDIDATE_TIE_DELTA,
    DDL_IMPORT_SUPPORTED_TYPES,
    SELECTED_TARGET_HINT_WEIGHT,
    STRONG_CONTRADICTION_WEIGHT,
    collectClickHouseEvidence,
    collectCockroachEvidence,
    collectMysqlFamilyEvidence,
    collectOracleEvidence,
    collectPostgresEvidence,
    collectSqlServerEvidence,
    collectSqliteEvidence,
    collectWeakQuotingEvidence,
    getSqlScanContent,
    hasGenericDdlKeywords,
} from './sql-evidence';

const DIALECT_PRIORITY: readonly DatabaseType[] = [
    DatabaseType.POSTGRESQL,
    DatabaseType.COCKROACHDB,
    DatabaseType.MYSQL,
    DatabaseType.MARIADB,
    DatabaseType.SQL_SERVER,
    DatabaseType.SQLITE,
    DatabaseType.ORACLE,
];

const DIALECT_FAMILIES: Readonly<Record<DatabaseType, DatabaseType>> = {
    [DatabaseType.GENERIC]: DatabaseType.GENERIC,
    [DatabaseType.POSTGRESQL]: DatabaseType.POSTGRESQL,
    [DatabaseType.COCKROACHDB]: DatabaseType.POSTGRESQL,
    [DatabaseType.MYSQL]: DatabaseType.MYSQL,
    [DatabaseType.MARIADB]: DatabaseType.MYSQL,
    [DatabaseType.SQL_SERVER]: DatabaseType.SQL_SERVER,
    [DatabaseType.SQLITE]: DatabaseType.SQLITE,
    [DatabaseType.ORACLE]: DatabaseType.ORACLE,
    [DatabaseType.CLICKHOUSE]: DatabaseType.CLICKHOUSE,
};

const isSupportedHintTarget = (
    databaseType: DatabaseType | undefined
): databaseType is DatabaseType =>
    databaseType !== undefined &&
    databaseType !== DatabaseType.GENERIC &&
    databaseType !== DatabaseType.CLICKHOUSE &&
    DDL_IMPORT_SUPPORTED_TYPES.has(databaseType);

const aggregateScores = (
    evidence: DialectEvidence[]
): Partial<Record<DatabaseType, number>> => {
    const scores: Partial<Record<DatabaseType, number>> = {};

    for (const item of evidence) {
        if (item.databaseType === 'clickhouse') {
            continue;
        }

        scores[item.databaseType] =
            (scores[item.databaseType] ?? 0) + item.weight;
    }

    return scores;
};

const getStrongContradictoryFamilies = (
    evidence: DialectEvidence[],
    selectedDatabaseType?: DatabaseType
): Set<DatabaseType> => {
    const families = new Set<DatabaseType>();

    for (const item of evidence) {
        if (
            item.databaseType === 'clickhouse' ||
            item.weight < STRONG_CONTRADICTION_WEIGHT
        ) {
            continue;
        }

        if (
            selectedDatabaseType &&
            item.databaseType === selectedDatabaseType
        ) {
            continue;
        }

        families.add(DIALECT_FAMILIES[item.databaseType]);
    }

    return families;
};

const applySelectedTargetHint = ({
    evidence,
    scores,
    selectedDatabaseType,
}: {
    evidence: DialectEvidence[];
    scores: Partial<Record<DatabaseType, number>>;
    selectedDatabaseType?: DatabaseType;
}): Partial<Record<DatabaseType, number>> => {
    if (!isSupportedHintTarget(selectedDatabaseType)) {
        return scores;
    }

    const contradictoryFamilies = getStrongContradictoryFamilies(
        evidence,
        selectedDatabaseType
    );
    const selectedFamily = DIALECT_FAMILIES[selectedDatabaseType];

    if (
        contradictoryFamilies.size > 0 &&
        !contradictoryFamilies.has(selectedFamily)
    ) {
        return scores;
    }

    evidence.push({
        databaseType: selectedDatabaseType,
        code: 'selected_target_hint',
        weight: SELECTED_TARGET_HINT_WEIGHT,
    });

    return {
        ...scores,
        [selectedDatabaseType]:
            (scores[selectedDatabaseType] ?? 0) + SELECTED_TARGET_HINT_WEIGHT,
    };
};

const getOrderedCandidates = (
    scores: Partial<Record<DatabaseType, number>>
): DatabaseType[] => {
    const entries = DIALECT_PRIORITY.map((databaseType) => ({
        databaseType,
        score: scores[databaseType] ?? 0,
    })).filter((entry) => entry.score > 0);

    entries.sort((left, right) => {
        if (right.score !== left.score) {
            return right.score - left.score;
        }

        return (
            DIALECT_PRIORITY.indexOf(left.databaseType) -
            DIALECT_PRIORITY.indexOf(right.databaseType)
        );
    });

    return entries.map((entry) => entry.databaseType);
};

const resolveConfidence = ({
    scores,
    candidates,
    hasClickHouseEvidence,
    hasGenericDdl,
}: {
    scores: Partial<Record<DatabaseType, number>>;
    candidates: DatabaseType[];
    hasClickHouseEvidence: boolean;
    hasGenericDdl: boolean;
}): DetectionConfidence => {
    if (candidates.length === 0) {
        if (hasClickHouseEvidence) {
            return 'unsupported';
        }

        return hasGenericDdl ? 'ambiguous' : 'unsupported';
    }

    const topScore = scores[candidates[0]] ?? 0;
    const secondScore =
        candidates.length > 1 ? (scores[candidates[1]] ?? 0) : 0;

    if (topScore < AMBIGUOUS_TOP_SCORE_THRESHOLD) {
        return 'ambiguous';
    }

    if (
        candidates.length > 1 &&
        topScore - secondScore <= CANDIDATE_TIE_DELTA
    ) {
        return 'ambiguous';
    }

    return 'high';
};

const collectEvidence = (content: string): DialectEvidence[] => {
    const scanContent = getSqlScanContent(content);

    return [
        ...collectPostgresEvidence(scanContent),
        ...collectCockroachEvidence(scanContent),
        ...collectMysqlFamilyEvidence(scanContent),
        ...collectSqlServerEvidence(scanContent),
        ...collectSqliteEvidence(scanContent),
        ...collectOracleEvidence(scanContent),
        ...collectClickHouseEvidence(scanContent),
        ...collectWeakQuotingEvidence(scanContent),
    ];
};

/**
 * Pure, synchronous SQL dialect detector with weighted evidence scoring.
 * Does not parse SQL ASTs and never silently defaults to PostgreSQL.
 */
export const detectSqlDialect = (
    content: string,
    options: DetectSqlDialectOptions = {}
): DialectDetectionResult => {
    const trimmed = content.trim();

    if (!trimmed) {
        return {
            scores: {},
            top: null,
            confidence: 'unsupported',
            candidates: [],
            evidence: [],
            ddlImportSupported: false,
        };
    }

    const scanContent = getSqlScanContent(trimmed);
    const evidence = collectEvidence(trimmed);
    const hasGenericDdl = hasGenericDdlKeywords(scanContent);
    const hasClickHouseEvidence = evidence.some(
        (item) => item.databaseType === 'clickhouse'
    );

    let scores = aggregateScores(evidence);
    scores = applySelectedTargetHint({
        evidence,
        scores,
        selectedDatabaseType: options.selectedDatabaseType,
    });

    const candidates = getOrderedCandidates(scores);
    const confidence = resolveConfidence({
        scores,
        candidates,
        hasClickHouseEvidence,
        hasGenericDdl,
    });

    const top = candidates[0] ?? null;
    const ddlImportSupported =
        top !== null && DDL_IMPORT_SUPPORTED_TYPES.has(top);

    return {
        scores,
        top,
        confidence,
        candidates,
        evidence,
        ddlImportSupported,
    };
};
