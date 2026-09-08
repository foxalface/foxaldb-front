import { DatabaseType } from '@/lib/domain/database-type';
import { hasCrossDialectSupport } from './cross-dialect/cross-dialect-support';

const DETERMINISTIC_SQL_SOURCE_TYPES: ReadonlySet<DatabaseType> = new Set([
    DatabaseType.POSTGRESQL,
    DatabaseType.MYSQL,
    DatabaseType.MARIADB,
    DatabaseType.SQL_SERVER,
    DatabaseType.SQLITE,
]);

export const isDeterministicSqlExportSourceSupported = (
    sourceDatabaseType: DatabaseType
): boolean => DETERMINISTIC_SQL_SOURCE_TYPES.has(sourceDatabaseType);

export const hasDeterministicSqlExportPath = (
    sourceDatabaseType: DatabaseType,
    targetDatabaseType: DatabaseType
): boolean => {
    if (!isDeterministicSqlExportSourceSupported(sourceDatabaseType)) {
        return false;
    }

    if (targetDatabaseType === DatabaseType.GENERIC) {
        return false;
    }

    if (sourceDatabaseType === targetDatabaseType) {
        return true;
    }

    return hasCrossDialectSupport(sourceDatabaseType, targetDatabaseType);
};

export const getDeterministicSqlExportTargets = (
    sourceDatabaseType: DatabaseType
): DatabaseType[] => {
    if (!isDeterministicSqlExportSourceSupported(sourceDatabaseType)) {
        return [];
    }

    const targets: DatabaseType[] = [sourceDatabaseType];

    if (sourceDatabaseType === DatabaseType.POSTGRESQL) {
        for (const crossDialectTarget of [
            DatabaseType.MYSQL,
            DatabaseType.MARIADB,
            DatabaseType.SQL_SERVER,
        ]) {
            if (!targets.includes(crossDialectTarget)) {
                targets.push(crossDialectTarget);
            }
        }
    }

    return targets;
};
