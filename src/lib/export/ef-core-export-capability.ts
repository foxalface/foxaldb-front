import { DatabaseType } from '@/lib/domain/database-type';

const SUPPORTED_DATABASE_TYPES: ReadonlySet<DatabaseType> = new Set([
    DatabaseType.POSTGRESQL,
    DatabaseType.SQL_SERVER,
    DatabaseType.SQLITE,
    DatabaseType.MYSQL,
]);

export const isEfCoreExportSupported = (
    databaseType: DatabaseType | string
): boolean => SUPPORTED_DATABASE_TYPES.has(databaseType as DatabaseType);
