import { DatabaseType } from '@/lib/domain/database-type';

export const DRIZZLE_EXPORT_ORM_VERSION = '^0.45';

export const DRIZZLE_EXPORT_KIT_VERSION = '^0.31';

export const DRIZZLE_ZIP_MIME_TYPE = 'application/zip';

export const DRIZZLE_EXPORT_FALLBACK_FILENAME = 'diagram-drizzle.zip';

export const DRIZZLE_EXPORT_SUPPORTED_DATABASE_TYPES: readonly DatabaseType[] =
    [
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
    ];
