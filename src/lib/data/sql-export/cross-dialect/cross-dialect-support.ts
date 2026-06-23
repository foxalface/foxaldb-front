import { DatabaseType } from '@/lib/domain/database-type';

/**
 * Supported cross-dialect conversion paths.
 * Maps source database type to an array of supported target database types.
 */
const CROSS_DIALECT_SUPPORT: Partial<Record<DatabaseType, DatabaseType[]>> = {
    [DatabaseType.POSTGRESQL]: [
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQL_SERVER,
    ],
};

/**
 * Check if deterministic cross-dialect export is supported from source to target database type.
 */
export function hasCrossDialectSupport(
    sourceDatabaseType: DatabaseType,
    targetDatabaseType: DatabaseType
): boolean {
    if (sourceDatabaseType === targetDatabaseType) {
        return false;
    }

    if (targetDatabaseType === DatabaseType.GENERIC) {
        return false;
    }

    const supportedTargets = CROSS_DIALECT_SUPPORT[sourceDatabaseType];
    if (!supportedTargets) {
        return false;
    }

    return supportedTargets.includes(targetDatabaseType);
}

/**
 * Get all supported target database types for a given source database type.
 */
export function getSupportedTargetDialects(
    sourceDatabaseType: DatabaseType
): DatabaseType[] {
    return CROSS_DIALECT_SUPPORT[sourceDatabaseType] ?? [];
}
