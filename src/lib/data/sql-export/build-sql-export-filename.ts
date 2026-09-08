import { DatabaseType } from '@/lib/domain/database-type';

const slugifyDiagramName = (diagramName: string): string => {
    const slug = diagramName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return slug || 'diagram';
};

const targetDatabaseTypeToFilenameSuffix = (
    targetDatabaseType: DatabaseType
): string => {
    switch (targetDatabaseType) {
        case DatabaseType.POSTGRESQL:
            return 'postgresql';
        case DatabaseType.MYSQL:
            return 'mysql';
        case DatabaseType.MARIADB:
            return 'mariadb';
        case DatabaseType.SQL_SERVER:
            return 'sql-server';
        case DatabaseType.SQLITE:
            return 'sqlite';
        default:
            return targetDatabaseType.replace(/_/g, '-');
    }
};

export const buildSqlExportFilename = (
    diagramName: string,
    sourceDatabaseType: DatabaseType,
    targetDatabaseType: DatabaseType
): string => {
    const slug = slugifyDiagramName(diagramName);

    if (sourceDatabaseType === targetDatabaseType) {
        return `${slug}.sql`;
    }

    return `${slug}-${targetDatabaseTypeToFilenameSuffix(targetDatabaseType)}.sql`;
};
