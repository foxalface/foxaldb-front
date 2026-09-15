import { DatabaseType } from '@/lib/domain/database-type';

const SUPPORTED_DATABASE_TYPES: ReadonlySet<DatabaseType> = new Set([
    DatabaseType.POSTGRESQL,
    DatabaseType.MYSQL,
    DatabaseType.MARIADB,
    DatabaseType.SQLITE,
]);

export const isRailsExportSupported = (
    databaseType: DatabaseType | string
): boolean => SUPPORTED_DATABASE_TYPES.has(databaseType as DatabaseType);
