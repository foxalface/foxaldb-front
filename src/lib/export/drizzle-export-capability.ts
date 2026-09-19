import type { DatabaseType } from '@/lib/domain/database-type';
import { DRIZZLE_EXPORT_SUPPORTED_DATABASE_TYPES } from './drizzle-export-constants';

const SUPPORTED_DATABASE_TYPES: ReadonlySet<DatabaseType> = new Set(
    DRIZZLE_EXPORT_SUPPORTED_DATABASE_TYPES
);

export const isDrizzleExportSupported = (
    databaseType: DatabaseType | string
): boolean => SUPPORTED_DATABASE_TYPES.has(databaseType as DatabaseType);
