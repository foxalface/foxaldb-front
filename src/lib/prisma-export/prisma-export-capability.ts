import { DatabaseType } from '@/lib/domain/database-type';

export type PrismaDatasourceProvider =
    | 'postgresql'
    | 'mysql'
    | 'sqlite'
    | 'sqlserver'
    | 'cockroachdb';

const SUPPORTED_DATABASE_TYPES: ReadonlySet<DatabaseType> = new Set([
    DatabaseType.POSTGRESQL,
    DatabaseType.MYSQL,
    DatabaseType.MARIADB,
    DatabaseType.SQLITE,
    DatabaseType.SQL_SERVER,
    DatabaseType.COCKROACHDB,
]);

export const isPrismaExportSupported = (databaseType: DatabaseType): boolean =>
    SUPPORTED_DATABASE_TYPES.has(databaseType);

export const resolvePrismaDatasourceProvider = (
    databaseType: DatabaseType
): PrismaDatasourceProvider | null => {
    switch (databaseType) {
        case DatabaseType.POSTGRESQL:
            return 'postgresql';
        case DatabaseType.MYSQL:
        case DatabaseType.MARIADB:
            return 'mysql';
        case DatabaseType.SQLITE:
            return 'sqlite';
        case DatabaseType.SQL_SERVER:
            return 'sqlserver';
        case DatabaseType.COCKROACHDB:
            return 'cockroachdb';
        default:
            return null;
    }
};
