import { DatabaseType } from '@/lib/domain/database-type';
import { DDL_IMPORT_SUPPORTED_TYPES } from './sql-evidence';
import type { DialectDetectionResult } from './types';

export interface DialectCandidateScore {
    databaseType: DatabaseType;
    score: number;
    confidencePercent: number;
}

export const areDialectsCompatibleForMatch = (
    selected: DatabaseType,
    detected: DatabaseType
): boolean => {
    if (selected === detected) {
        return true;
    }

    const mysqlFamily = [DatabaseType.MYSQL, DatabaseType.MARIADB] as const;
    if (
        mysqlFamily.includes(selected as (typeof mysqlFamily)[number]) &&
        mysqlFamily.includes(detected as (typeof mysqlFamily)[number])
    ) {
        return true;
    }

    const postgresFamily = [
        DatabaseType.POSTGRESQL,
        DatabaseType.COCKROACHDB,
    ] as const;
    if (
        postgresFamily.includes(selected as (typeof postgresFamily)[number]) &&
        postgresFamily.includes(detected as (typeof postgresFamily)[number])
    ) {
        return true;
    }

    return false;
};

export const getAmbiguousDialectCandidates = ({
    selectedDatabaseType,
    dialect,
}: {
    selectedDatabaseType: DatabaseType;
    dialect: DialectDetectionResult;
}): DatabaseType[] => {
    const supportedCandidates = dialect.candidates.filter((candidate) =>
        DDL_IMPORT_SUPPORTED_TYPES.has(candidate)
    );

    if (supportedCandidates.length > 0) {
        return supportedCandidates;
    }

    if (DDL_IMPORT_SUPPORTED_TYPES.has(selectedDatabaseType)) {
        return [selectedDatabaseType];
    }

    return [];
};

export const getDialectCandidateScores = (
    dialect: DialectDetectionResult,
    candidates: DatabaseType[]
): DialectCandidateScore[] => {
    if (candidates.length === 0) {
        return [];
    }

    const totalScore = candidates.reduce(
        (sum, databaseType) => sum + (dialect.scores[databaseType] ?? 0),
        0
    );

    return candidates.map((databaseType) => {
        const score = dialect.scores[databaseType] ?? 0;
        const confidencePercent =
            totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;

        return {
            databaseType,
            score,
            confidencePercent,
        };
    });
};

export const requiresAmbiguousDialectResolution = (
    dialect: DialectDetectionResult,
    selectedDatabaseType: DatabaseType
): boolean => {
    return (
        getAmbiguousDialectCandidates({
            selectedDatabaseType,
            dialect,
        }).length > 1
    );
};
