import { DatabaseType } from '@/lib/domain/database-type';

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
