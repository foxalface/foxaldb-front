import { DatabaseType } from '@/lib/domain/database-type';

export const DJANGO_EXPORT_VERSION = '6.1';

export const DJANGO_ZIP_MIME_TYPE = 'application/zip';

export const DJANGO_EXPORT_FALLBACK_FILENAME = 'diagram-django.zip';

export const DJANGO_EXPORT_SUPPORTED_DATABASE_TYPES: readonly DatabaseType[] = [
    DatabaseType.POSTGRESQL,
    DatabaseType.MYSQL,
    DatabaseType.MARIADB,
    DatabaseType.SQLITE,
];
