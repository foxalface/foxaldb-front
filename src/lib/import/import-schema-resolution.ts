import { DatabaseType } from '@/lib/domain/database-type';
import { DDL_IMPORT_SUPPORTED_TYPES } from './sql-evidence';
import type { DialectDetectionResult } from './types';

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

    const ordered = new Set<DatabaseType>();

    if (DDL_IMPORT_SUPPORTED_TYPES.has(selectedDatabaseType)) {
        ordered.add(selectedDatabaseType);
    }

    for (const candidate of supportedCandidates) {
        ordered.add(candidate);
    }

    if (
        ordered.size === 0 &&
        DDL_IMPORT_SUPPORTED_TYPES.has(selectedDatabaseType)
    ) {
        return [selectedDatabaseType];
    }

    return Array.from(ordered);
};
