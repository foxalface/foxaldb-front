import type { DatabaseType } from '@/lib/domain/database-type';
import { DJANGO_EXPORT_SUPPORTED_DATABASE_TYPES } from './django-export-constants';

const SUPPORTED_DATABASE_TYPES: ReadonlySet<DatabaseType> = new Set(
    DJANGO_EXPORT_SUPPORTED_DATABASE_TYPES
);

export const isDjangoExportSupported = (
    databaseType: DatabaseType | string
): boolean => SUPPORTED_DATABASE_TYPES.has(databaseType as DatabaseType);
