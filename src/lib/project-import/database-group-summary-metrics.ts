import type { ProjectDatabaseGroup, ProjectFramework } from './project-types';
import type { ProjectSummaryMetrics } from './project-summary-metrics';

const countByExtension = (
    mappings: ProjectDatabaseGroup['fileMappings'],
    predicate: (relativePath: string) => boolean
): number =>
    mappings.filter((mapping) => predicate(mapping.logicalPath)).length;

const countLaravelMigrations = (group: ProjectDatabaseGroup): number =>
    countByExtension(
        group.fileMappings,
        (relativePath) =>
            relativePath.startsWith('database/migrations/') &&
            relativePath.endsWith('.php')
    );

const countDjangoMigrations = (group: ProjectDatabaseGroup): number =>
    countByExtension(
        group.fileMappings,
        (relativePath) =>
            relativePath.includes('/migrations/') &&
            relativePath.endsWith('.py') &&
            !relativePath.endsWith('/__init__.py')
    );

const countEfModelSnapshots = (group: ProjectDatabaseGroup): number =>
    countByExtension(group.fileMappings, (relativePath) =>
        relativePath.endsWith('ModelSnapshot.cs')
    );

const countPrismaSchemaFiles = (group: ProjectDatabaseGroup): number =>
    countByExtension(group.fileMappings, (relativePath) =>
        relativePath.endsWith('.prisma')
    );

const countRailsSchemaFiles = (group: ProjectDatabaseGroup): number =>
    countByExtension(
        group.fileMappings,
        (relativePath) =>
            relativePath.endsWith('db/schema.rb') ||
            /\/db\/[^/]+_schema\.rb$/.test(relativePath)
    );

const countDrizzleSqlMigrations = (group: ProjectDatabaseGroup): number =>
    countByExtension(group.fileMappings, (relativePath) =>
        relativePath.endsWith('.sql')
    );

export const getDatabaseGroupSummaryMetrics = (
    group: ProjectDatabaseGroup
): ProjectSummaryMetrics => {
    const framework: ProjectFramework = group.framework;

    switch (framework) {
        case 'laravel':
            return {
                sourceFileKind: 'migrations',
                count: countLaravelMigrations(group),
            };
        case 'django':
            return {
                sourceFileKind: 'migrations',
                count: countDjangoMigrations(group),
            };
        case 'entity_framework_core':
            return {
                sourceFileKind: 'model_snapshot',
                count: Math.max(countEfModelSnapshots(group), 1),
            };
        case 'prisma':
            return {
                sourceFileKind: 'schema',
                count: Math.max(countPrismaSchemaFiles(group), 1),
            };
        case 'rails':
            return {
                sourceFileKind: 'schema',
                count: Math.max(countRailsSchemaFiles(group), 1),
            };
        case 'drizzle':
            return {
                sourceFileKind: 'sql_migrations',
                count: Math.max(countDrizzleSqlMigrations(group), 1),
            };
        default:
            return {
                sourceFileKind: 'migrations',
                count: 0,
            };
    }
};
